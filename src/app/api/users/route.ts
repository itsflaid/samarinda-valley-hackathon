import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      nohp,
      password,
      role,
      profesi,
      instansi,
      wilayahKerja,
    } = body;

    // Validasi wajib
    if (!name || !email || !nohp || !password || !role) {
      return NextResponse.json(
        {
          message: "Data wajib belum lengkap",
        },
        {
          status: 400,
        }
      );
    }

    // Validasi role
    if (role !== "NAKES" && role !== "PETUGAS") {
      return NextResponse.json(
        {
          message: "Role tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // Kalau NAKES, profesi wajib
    if (role === "NAKES" && !profesi) {
      return NextResponse.json(
        {
          message: "Profesi wajib diisi untuk Nakes",
        },
        {
          status: 400,
        }
      );
    }

    // Cek email
    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "Email sudah digunakan",
        },
        {
          status: 409,
        }
      );
    }

    // Cek nomor HP
    const existingNohp = await prisma.user.findUnique({
      where: {
        nohp,
      },
    });

    if (existingNohp) {
      return NextResponse.json(
        {
          message: "Nomor HP sudah digunakan",
        },
        {
          status: 409,
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // INSERT DATABASE
    const user = await prisma.user.create({
      data: {
        name,
        email,
        nohp,
        password: hashedPassword,
        role,
        profesi: role === "NAKES" ? profesi : null,
        instansi: instansi || null,
        wilayahKerja: wilayahKerja || null,
      },
    });

    return NextResponse.json(
      {
        message: "User berhasil ditambahkan",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nohp: user.nohp,
          role: user.role,
          profesi: user.profesi,
          instansi: user.instansi,
          wilayahKerja: user.wilayahKerja,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menambahkan user",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: role
        ? {
            role: role as "NAKES" | "PETUGAS",
          }
        : undefined,

      select: {
        id: true,
        name: true,
        email: true,
        nohp: true,
        role: true,
        profesi: true,
        instansi: true,
        wilayahKerja: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data user",
      },
      {
        status: 500,
      }
    );
  }
}