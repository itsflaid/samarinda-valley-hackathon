import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.role !== "PETUGAS") {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  const userRegions = await prisma.userRegion.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      region: true,
    },
  });

  return NextResponse.json(
    userRegions.map((item) => item.region)
  );
}