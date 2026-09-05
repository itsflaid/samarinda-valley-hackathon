import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const allowedStatus = [
  "AMAN",
  "WASPADA",
  "SIAGA",
] as const;

const allowedIpaStatus = [
  "AKTIF",
  "MATI",
] as const;

export async function PUT(
  request: Request,
  { params }: Params
) {
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
        { status: 401 }
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
        { status: 403 }
      );
    }

    // ==========================================
    // 3. PARAM ID
    // ==========================================

    const { id } = await params;

    // ==========================================
    // 4. CEK APAKAH REGION MILIK PETUGAS
    // ==========================================

    const userRegion =
      await prisma.userRegion.findFirst({
        where: {
          userId: session.user.id,
          regionId: id,
        },
      });

    if (!userRegion) {
      return NextResponse.json(
        {
          message:
            "Wilayah bukan bagian dari tugas Anda",
        },
        { status: 403 }
      );
    }

    // ==========================================
    // 5. BODY
    // ==========================================

    const body = await request.json();

    const {
      status,
      ipaStatus,
      ipaCondition,
    } = body;

    // ==========================================
    // 6. VALIDASI STATUS
    // ==========================================

    if (
      !allowedStatus.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Status wilayah tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      !allowedIpaStatus.includes(
        ipaStatus
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Status IPA tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      !ipaCondition ||
      !ipaCondition.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "Kondisi air wajib diisi",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 7. UPDATE REGION
    // ==========================================

    const region =
      await prisma.region.update({
        where: {
          id,
        },

        data: {
          status,
          ipaStatus,
          ipaCondition:
            ipaCondition.trim(),
        },

        select: {
          id: true,
          name: true,
          city: true,
          province: true,
          status: true,
          ipaStatus: true,
          ipaCondition: true,
        },
      });

    return NextResponse.json({
      message:
        "Kondisi air berhasil diperbarui",
      region,
    });
  } catch (error) {
    console.error(
      "PUT /api/petugas/regions/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal memperbarui kondisi air",
      },
      { status: 500 }
    );
  }
}