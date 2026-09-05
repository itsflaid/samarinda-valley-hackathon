import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ==========================================
    // 1. SESSION
    // ==========================================

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // 2. ROLE
    // ==========================================

    if (session.user.role !== "PETUGAS") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // 3. AMBIL WILAYAH PETUGAS
    // ==========================================

    const userRegions =
      await prisma.userRegion.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          regionId: true,
        },
      });

    const regionIds = userRegions.map(
      (item) => item.regionId
    );

    if (regionIds.length === 0) {
      return NextResponse.json([]);
    }

    // ==========================================
    // 4. AMBIL WATER REPORT
    // ==========================================

    const reports =
      await prisma.waterReport.findMany({
        where: {
          regionId: {
            in: regionIds,
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

        orderBy: {
          reportedAt: "desc",
        },
      });

    return NextResponse.json(
      reports
    );
  } catch (error) {
    console.error(
      "GET /api/petugas/reports ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal mengambil laporan air",
      },
      {
        status: 500,
      }
    );
  }
}