import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const allowedRoles = ["NAKES", "PETUGAS"] as const;
type AllowedRole = (typeof allowedRoles)[number];

const allowedProfesi = ["DOKTER", "PERAWAT", "BIDAN"] as const;
type AllowedProfesi = (typeof allowedProfesi)[number];

// =========================================================
// EDIT USER
// =========================================================

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);

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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const {
      name,
      email,
      nohp,
      password,
      role,
      profesi,
      instansi,
      regionIds,
      facilityIds,
    } = body;

    // =====================================================
    // VALIDASI DATA WAJIB
    // =====================================================

    if (!name || !email || !nohp || !role) {
      return NextResponse.json(
        {
          message: "Data wajib belum lengkap",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI ROLE
    // =====================================================

    if (!allowedRoles.includes(role as AllowedRole)) {
      return NextResponse.json(
        {
          message: "Role tidak valid",
        },
        { status: 400 }
      );
    }

    // =====================================================
    // VALIDASI PROFESI
    // =====================================================

    if (role === "NAKES") {
      if (!profesi) {
        return NextResponse.json(
          {
            message: "Profesi wajib diisi untuk Nakes",
          },
          { status: 400 }
        );
      }

      if (!allowedProfesi.includes(profesi as AllowedProfesi)) {
        return NextResponse.json(
          {
            message: "Profesi tidak valid",
          },
          { status: 400 }
        );
      }
    }

    // =====================================================
    // VALIDASI ASSIGNMENT
    // =====================================================

    if (role === "PETUGAS") {
      if (!Array.isArray(regionIds) || regionIds.length === 0) {
        return NextResponse.json(
          {
            message:
              "Minimal satu wilayah harus dipilih untuk Petugas",
          },
          { status: 400 }
        );
      }
    }

    if (role === "NAKES") {
      if (
        !Array.isArray(facilityIds) ||
        facilityIds.length === 0
      ) {
        return NextResponse.json(
          {
            message:
              "Minimal satu fasilitas harus dipilih untuk Nakes",
          },
          { status: 400 }
        );
      }
    }

    // =====================================================
    // CEK USER
    // =====================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // CEK EMAIL
    // =====================================================

    const emailUsed = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id,
        },
      },
    });

    if (emailUsed) {
      return NextResponse.json(
        {
          message: "Email sudah digunakan user lain",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // CEK NO HP
    // =====================================================

    const nohpUsed = await prisma.user.findFirst({
      where: {
        nohp,
        NOT: {
          id,
        },
      },
    });

    if (nohpUsed) {
      return NextResponse.json(
        {
          message: "Nomor HP sudah digunakan user lain",
        },
        { status: 409 }
      );
    }

    // =====================================================
    // PREPARE UPDATE DATA
    // =====================================================

    const updateData: {
      name: string;
      email: string;
      nohp: string;
      role: "NAKES" | "PETUGAS";
      profesi: "DOKTER" | "PERAWAT" | "BIDAN" | null;
      instansi: string | null;
      password?: string;
    } = {
      name,
      email,
      nohp,
      role,
      profesi: role === "NAKES" ? profesi : null,
      instansi: instansi || null,
    };

    // =====================================================
    // PASSWORD
    // =====================================================

    if (
      password &&
      typeof password === "string" &&
      password.trim() !== ""
    ) {
      updateData.password = await bcrypt.hash(
        password,
        10
      );
    }

    // =====================================================
    // TRANSACTION
    // =====================================================

    const user = await prisma.$transaction(async (tx) => {
      // ---------------------------------------------------
      // UPDATE USER
      // ---------------------------------------------------

      const updatedUser = await tx.user.update({
        where: {
          id,
        },
        data: updateData,
      });

      // ---------------------------------------------------
      // HAPUS ASSIGNMENT LAMA
      // ---------------------------------------------------

      await tx.userRegion.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.facilityStaff.deleteMany({
        where: {
          userId: id,
        },
      });

      // ---------------------------------------------------
      // PETUGAS → ASSIGN REGION
      // ---------------------------------------------------

      if (
        role === "PETUGAS" &&
        Array.isArray(regionIds) &&
        regionIds.length > 0
      ) {
        await tx.userRegion.createMany({
          data: regionIds.map((regionId: string) => ({
            userId: id,
            regionId,
          })),
          skipDuplicates: true,
        });
      }

      // ---------------------------------------------------
      // NAKES → ASSIGN FACILITY
      // ---------------------------------------------------

      if (
        role === "NAKES" &&
        Array.isArray(facilityIds) &&
        facilityIds.length > 0
      ) {
        await tx.facilityStaff.createMany({
          data: facilityIds.map((facilityId: string) => ({
            userId: id,
            facilityId,
          })),
          skipDuplicates: true,
        });
      }

      return updatedUser;
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json({
      message: "User berhasil diperbarui",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        nohp: user.nohp,
        role: user.role,
        profesi: user.profesi,
        instansi: user.instansi,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal memperbarui user",
      },
      { status: 500 }
    );
  }
}

// =========================================================
// HAPUS USER
// =========================================================

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);

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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    // =====================================================
    // CEK USER
    // =====================================================

    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // =====================================================
    // DELETE
    // =====================================================

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal menghapus user",
      },
      { status: 500 }
    );
  }
}