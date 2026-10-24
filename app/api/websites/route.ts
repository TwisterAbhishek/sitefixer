
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export async function GET() {
  const session = await requireAuth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Please sign in to view your websites." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      memberships: {
        select: { organizationId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User account not found." },
      { status: 401 },
    );
  }

  const organizationIds = user.memberships.map(
    (membership) => membership.organizationId,
  );

  if (organizationIds.length === 0) {
    return NextResponse.json({ websites: [] });
  }

  const websites = await prisma.website.findMany({
    where: {
      organizationId: { in: organizationIds },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      url: true,
      status: true,
      createdAt: true,
      checkRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          httpStatus: true,
          responseTimeMs: true,
          errorMessage: true,
          startedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ websites });
}
