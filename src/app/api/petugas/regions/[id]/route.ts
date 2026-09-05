import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedStatus = ["AMAN", "WASPADA", "SIAGA"];

export async function GET() {
  try {
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
  } catch (error) {
    console.error("GET /api/petugas/regions error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil wilayah petugas" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await context.params;
    const body = await req.json();

    // Cek status
    if (!allowedStatus.includes(body.status)) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Cek apakah wilayah memang ditugaskan ke Petugas
    const assignment = await prisma.userRegion.findFirst({
      where: {
        userId: session.user.id,
        regionId: id,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "Wilayah bukan tanggung jawab Anda" },
        { status: 403 }
      );
    }

    // Update status Region
    const region = await prisma.region.update({
      where: {
        id: id,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json(region);

  } catch (error) {
    console.error(
      "PUT /api/petugas/regions/[id] ERROR:",
      error
    );

    return NextResponse.json(
      { message: "Gagal mengubah status wilayah" },
      { status: 500 }
    );
  }
}
