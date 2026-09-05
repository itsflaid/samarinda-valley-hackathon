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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const facilities = await prisma.facility.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error("GET /api/facilities ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data fasilitas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

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
    } = body;

    if (
      !name ||
      !type ||
      !address ||
      !regionId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return NextResponse.json(
        { message: "Data fasilitas belum lengkap" },
        { status: 400 }
      );
    }

    const region = await prisma.region.findUnique({
      where: {
        id: regionId,
      },
    });

    if (!region) {
      return NextResponse.json(
        { message: "Wilayah tidak ditemukan" },
        { status: 404 }
      );
    }

    const facility = await prisma.facility.create({
      data: {
        name,
        type,
        address,
        regionId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        phone: phone || null,
        openingHours: openingHours || null,
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Fasilitas berhasil ditambahkan",
        facility,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/facilities ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menambahkan fasilitas" },
      { status: 500 }
    );
  }
}