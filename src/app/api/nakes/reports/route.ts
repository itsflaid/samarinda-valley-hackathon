import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "NAKES") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Ambil semua fasilitas tempat Nakes ditugaskan
    const facilityStaff = await prisma.facilityStaff.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        facility: {
          select: {
            regionId: true,
          },
        },
      },
    });

    // Ambil region dari fasilitas Nakes
    const regionIds = [
      ...new Set(
        facilityStaff.map(
          (item) => item.facility.regionId
        )
      ),
    ];

    if (regionIds.length === 0) {
      return NextResponse.json({
        reports: [],
      });
    }

    // Ambil SEMUA laporan di wilayah kerja Nakes
    const reports = await prisma.healthReport.findMany({
      where: {
        regionId: {
          in: regionIds,
        },
      },

      select: {
        id: true,
        reporterName: true,
        reporterPhone: true,

        diarrhea: true,
        vomiting: true,
        fever: true,
        dehydration: true,

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

        assessments: {
          take: 1,
          orderBy: {
            assessedAt: "desc",
          },
          select: {
            id: true,
            riskLevel: true,
            notes: true,
            actionTaken: true,
            assessedAt: true,

            nakes: {
              select: {
                id: true,
                name: true,
                profesi: true,
              },
            },
          },
        },
      },

      orderBy: {
        reportedAt: "desc",
      },
    });

    const result = reports.map((report) => ({
      ...report,
      assessment: report.assessments[0] ?? null,
    }));

    return NextResponse.json({
      reports: result,
    });
  } catch (error) {
    console.error(
      "GET /api/nakes/reports ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Gagal mengambil semua laporan kesehatan",
      },
      { status: 500 }
    );
  }
}