import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =========================
// EDIT USER
// =========================
export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
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
    } = body;

    if (!name || !email || !nohp || !role) {
      return NextResponse.json(
        {
          message: "Data wajib belum lengkap",
        },
        { status: 400 }
      );
    }

    if (role !== "NAKES" && role !== "PETUGAS") {
      return NextResponse.json(
        {
          message: "Role tidak valid",
        },
        { status: 400 }
      );
    }

    if (role === "NAKES" && !profesi) {
      return NextResponse.json(
        {
          message: "Profesi wajib diisi untuk Nakes",
        },
        { status: 400 }
      );
    }

    // Cek user
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

    // Cek email milik user lain
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

    // Cek no HP milik user lain
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

    // Data yang akan diupdate
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

    // Password hanya diubah kalau diisi
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(
        password,
        10
      );
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: updateData,
    });

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

// =========================
// HAPUS USER
// =========================
export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

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