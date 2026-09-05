import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const allowedTypes = [
  "PUSKESMAS",
  "RUMAH_SAKIT",
  "KLINIK",
] as const;

type FacilityType = (typeof allowedTypes)[number];

export async function PUT(
  request: Request,
  { params }: Params
) {
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
    // 2. CEK ROLE
    // ==========================================

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // ==========================================
    // 3. AMBIL ID
    // ==========================================

    const { id } = await params;

    // ==========================================
    // 4. CEK FASILITAS
    // ==========================================

    const existingFacility =
      await prisma.facility.findUnique({
        where: {
          id,
        },
      });

    if (!existingFacility) {
      return NextResponse.json(
        { message: "Fasilitas tidak ditemukan" },
        { status: 404 }
      );
    }

    // ==========================================
    // 5. BODY
    // ==========================================

    const body = await request.json();

    const {
      name,
      type,
      address,
      regionId,
      latitude,
      longitude,
      phone,
      openingHours,
      isActive,
    } = body;

    // ==========================================
    // 6. VALIDASI
    // ==========================================

    if (
      !name ||
      !type ||
      !address ||
      !regionId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        {
          message: "Data fasilitas belum lengkap",
        },
        { status: 400 }
      );
    }

    if (
      !allowedTypes.includes(
        type as FacilityType
      )
    ) {
      return NextResponse.json(
        {
          message: "Jenis fasilitas tidak valid",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 7. CEK REGION
    // ==========================================

    const region = await prisma.region.findUnique({
      where: {
        id: regionId,
      },
    });

    if (!region) {
      return NextResponse.json(
        {
          message: "Wilayah tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 8. UPDATE
    // ==========================================

    const facility =
      await prisma.facility.update({
        where: {
          id,
        },

        data: {
          name: name.trim(),
          type: type as FacilityType,
          address: address.trim(),
          regionId,
          latitude: Number(latitude),
          longitude: Number(longitude),
          phone: phone?.trim() || null,
          openingHours:
            openingHours?.trim() || null,
          isActive:
            typeof isActive === "boolean"
              ? isActive
              : existingFacility.isActive,
        },

        include: {
          region: {
            select: {
              id: true,
              name: true,
              city: true,
            },
          },

          staffs: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profesi: true,
                },
              },
            },
          },
        },
      });

    return NextResponse.json({
      message: "Fasilitas berhasil diperbarui",
      facility,
    });
  } catch (error) {
    console.error(
      "PUT /api/facilities/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Gagal memperbarui fasilitas",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE
// ==========================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
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
    // 2. CEK ROLE
    // ==========================================

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // ==========================================
    // 3. AMBIL ID
    // ==========================================

    const { id } = await params;

    // ==========================================
    // 4. CEK FASILITAS
    // ==========================================

    const existingFacility =
      await prisma.facility.findUnique({
        where: {
          id,
        },
      });

    if (!existingFacility) {
      return NextResponse.json(
        {
          message: "Fasilitas tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // 5. HAPUS
    // ==========================================

    await prisma.facility.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Fasilitas berhasil dihapus",
    });
  } catch (error) {
    console.error(
      "DELETE /api/facilities/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Gagal menghapus fasilitas. Pastikan fasilitas tidak digunakan oleh data lain.",
      },
      { status: 500 }
    );
  }
}