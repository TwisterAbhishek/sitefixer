
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";


export async function GET() {
  const session = await requireAuth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Please sign in to view website history." },
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
    return NextResponse.json({ history: [] });
  }

  const history = await prisma.checkRun.findMany({
    where: {
      website: {
        organizationId: { in: organizationIds },
      },
    },
    orderBy: { startedAt: "desc" },
    take: 50,
    select: {
      id: true,
      type: true,
      status: true,
      httpStatus: true,
      responseTimeMs: true,
      errorMessage: true,
      startedAt: true,
      completedAt: true,
      website: {
        select: {
          name: true,
          url: true,
        },
      },
    },
  });

  return NextResponse.json({ history });
}
