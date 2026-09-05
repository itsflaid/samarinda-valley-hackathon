import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ==========================================
    // 1. CEK SESSION
    // ==========================================

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. CEK ROLE ADMIN
    // ==========================================

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // ==========================================
    // 3. AMBIL DATA UTAMA
    // ==========================================

    const [
      totalNakes,
      totalPetugas,
      totalFacilities,
      totalHealthReports,
      totalWaterReports,

      aman,
      waspada,
      siaga,

      highRisk,
      unassessed,
    ] = await Promise.all([
      // Total Nakes
      prisma.user.count({
        where: {
          role: "NAKES",
        },
      }),

      // Total Petugas
      prisma.user.count({
        where: {
          role: "PETUGAS",
        },
      }),

      // Total Fasilitas aktif
      prisma.facility.count({
        where: {
          isActive: true,
        },
      }),

      // Total laporan kesehatan
      prisma.healthReport.count(),

      // Total laporan air
      prisma.waterReport.count(),

      // Wilayah Aman
      prisma.region.count({
        where: {
          status: "AMAN",
        },
      }),

      // Wilayah Waspada
      prisma.region.count({
        where: {
          status: "WASPADA",
        },
      }),

      // Wilayah Siaga
      prisma.region.count({
        where: {
          status: "SIAGA",
        },
      }),

      // Risiko tinggi
      prisma.healthAssessment.count({
        where: {
          riskLevel: "TINGGI",
        },
      }),

      // Laporan yang belum dinilai
      prisma.healthReport.count({
        where: {
          assessments: {
            none: {},
          },
        },
      }),
    ]);

    // ==========================================
    // 4. RESPONSE
    // ==========================================

    return NextResponse.json({
      statistics: {
        totalNakes,
        totalPetugas,
        totalFacilities,
        totalHealthReports,
        totalWaterReports,
      },

      regions: {
        aman,
        waspada,
        siaga,
      },

      alerts: {
        highRisk,
        unassessed,
      },
    });
  } catch (error) {
    console.error(
      "GET /api/admin/dashboard ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Gagal mengambil data dashboard admin",
      },
      {
        status: 500,
      }
    );
  }
}