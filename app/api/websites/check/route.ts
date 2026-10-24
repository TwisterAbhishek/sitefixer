
import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";
import { checkWebsiteHealth } from "@/lib/monitoring/health-check";
import { z } from "zod";

const schema = z.object({
  url: z.string().trim().min(1).max(2048),
});

function normalizeWebsiteUrl(input: string): URL {
  const value = /^https?:\/\//i.test(input)
    ? input
    : `https://${input}`;

  const url = new URL(value);

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  ) {
    throw new Error("Enter a valid public HTTP or HTTPS website URL.");
  }

  return url;
}

function createOrganizationSlug(email: string): string {
  const prefix = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30) || "workspace";

  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function POST(request: Request) {
  const session = await requireAuth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Please sign in before checking a website." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid website URL." },
      { status: 400 },
    );
  }

  let url: URL;

  try {
    url = normalizeWebsiteUrl(parsed.data.url);
  } catch {
    return NextResponse.json(
      { error: "Enter a valid HTTP or HTTPS website URL." },
      { status: 400 },
    );
  }

  // Remove fragments, but preserve the path and query.
  url.hash = "";
  const websiteUrl = url.href;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      memberships: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { organizationId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Your user account could not be found. Please sign in again." },
      { status: 401 },
    );
  }

  try {
    let organizationId = user.memberships[0]?.organizationId;

    if (!organizationId) {
      const organization = await prisma.organization.create({
        data: {
          name: session.user.name
            ? `${session.user.name}'s workspace`
            : "My workspace",
          slug: createOrganizationSlug(session.user.email),
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        select: { id: true },
      });

      organizationId = organization.id;
    }

    const hostname = url.hostname;
    const website = await prisma.website.upsert({
      where: {
        organizationId_url: {
          organizationId,
          url: websiteUrl,
        },
      },
      create: {
        organizationId,
        name: hostname,
        url: websiteUrl,
        status: "PENDING",
      },
      update: {},
      select: {
        id: true,
        url: true,
        name: true,
      },
    });

    const startedAt = new Date();
    const result = await checkWebsiteHealth(website.url);
    const completedAt = new Date();

    const checkRun = await prisma.checkRun.create({
      data: {
        websiteId: website.id,
        type: "UPTIME",
        status: result.status === "up" ? "SUCCESS" : "FAILURE",
        httpStatus: result.httpStatus,
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.error,
        details: {
          checkedUrl: result.url,
          checkedAt: result.checkedAt,
        } satisfies Prisma.InputJsonValue,
        startedAt,
        completedAt,
      },
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
      },
    });

    if (result.status === "up") {
      await prisma.website.update({
        where: { id: website.id },
        data: {
          status: "ACTIVE",
        },
      });
    }

    return NextResponse.json({
      result,
      website: {
        id: website.id,
        name: website.name,
        url: website.url,
      },
      checkRun,
    });
  } catch (error) {
    console.error("Website check failed:", error);

    return NextResponse.json(
      { error: "Unable to save the website check. Please try again." },
      { status: 500 },
    );
  }
}
