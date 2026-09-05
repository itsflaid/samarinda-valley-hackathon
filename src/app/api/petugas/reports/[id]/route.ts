import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const session =
      await getServerSession(authOptions);

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

    const { id } = await params;

    // Cari apakah laporan berasal
    // dari wilayah Petugas
    const report =
      await prisma.waterReport.findFirst({
        where: {
          id,

          region: {
            users: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },

        select: {
          id: true,
          reporterName: true,
          reporterPhone: true,

          supplyDisruption: true,
          dirtyOrSmelly: true,
          saltyOrBrackish: true,
          dryWell: true,

          latitude: true,
          longitude: true,

          reportedAt: true,

          region: {
            select: {
              id: true,
              name: true,
              city: true,
              province: true,
              status: true,
              ipaStatus: true,
              ipaCondition: true,
            },
          },
        },
      });

    if (!report) {
      return NextResponse.json(
        {
          message:
            "Laporan tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      report
    );
  } catch (error) {
    console.error(
      "GET /api/petugas/reports/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal mengambil detail laporan",
      },
      { status: 500 }
    );
  }
}