import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const allowedRiskLevels = [
  "RENDAH",
  "SEDANG",
  "TINGGI",
] as const;

type RiskLevel = (typeof allowedRiskLevels)[number];

export async function POST(request: Request) {
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

    const body = await request.json();

    const {
      healthReportId,
      riskLevel,
      notes,
      actionTaken,
    } = body;

    if (!healthReportId || !riskLevel) {
      return NextResponse.json(
        {
          message:
            "Laporan dan tingkat risiko wajib diisi",
        },
        { status: 400 }
      );
    }

    if (
      !allowedRiskLevels.includes(
        riskLevel as RiskLevel
      )
    ) {
      return NextResponse.json(
        { message: "Tingkat risiko tidak valid" },
        { status: 400 }
      );
    }

    if (!notes?.trim()) {
      return NextResponse.json(
        { message: "Catatan assessment wajib diisi" },
        { status: 400 }
      );
    }

    if (!actionTaken?.trim()) {
      return NextResponse.json(
        { message: "Tindakan wajib diisi" },
        { status: 400 }
      );
    }

    // ================================================
    // CARI WILAYAH YANG MENJADI TANGGUNG JAWAB NAKES
    // ================================================

    const facilityStaff =
      await prisma.facilityStaff.findMany({
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

    const regionIds = [
      ...new Set(
        facilityStaff.map(
          (item) => item.facility.regionId
        )
      ),
    ];

    if (regionIds.length === 0) {
      return NextResponse.json(
        {
          message: "Nakes belum memiliki fasilitas",
        },
        { status: 403 }
      );
    }

    // ================================================
    // CEK LAPORAN
    // ================================================

    const healthReport =
      await prisma.healthReport.findFirst({
        where: {
          id: healthReportId,
          regionId: {
            in: regionIds,
          },
        },
        select: {
          id: true,
          regionId: true,
        },
      });

    if (!healthReport) {
      return NextResponse.json(
        {
          message:
            "Laporan tidak ditemukan atau bukan wilayah Anda",
        },
        { status: 404 }
      );
    }

    // ================================================
    // CEK SUDAH PERNAH DINILAI
    // ================================================

    const existingAssessment =
      await prisma.healthAssessment.findUnique({
        where: {
          healthReportId: healthReport.id,
        },
        select: {
          id: true,
        },
      });

    if (existingAssessment) {
      return NextResponse.json(
        {
          message: "Laporan ini sudah dinilai",
        },
        { status: 409 }
      );
    }

    // ================================================
    // SIMPAN ASSESSMENT
    // ================================================

    const assessment =
      await prisma.healthAssessment.create({
        data: {
          healthReportId: healthReport.id,
          nakesId: session.user.id,
          regionId: healthReport.regionId,
          riskLevel: riskLevel as RiskLevel,
          notes: notes.trim(),
          actionTaken: actionTaken.trim(),
        },
        include: {
          nakes: {
            select: {
              name: true,
              profesi: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        message: "Assessment berhasil disimpan",
        assessment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/nakes/assessments ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Gagal menyimpan assessment",
      },
      { status: 500 }
    );
  }
}