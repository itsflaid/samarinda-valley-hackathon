import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const allowedRoles = ["NAKES", "PETUGAS"] as const;
type AllowedRole = (typeof allowedRoles)[number];

const allowedProfesi = ["DOKTER", "PERAWAT", "BIDAN"] as const;
type AllowedProfesi = (typeof allowedProfesi)[number];

export async function POST(request: Request) {
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
        // VALIDASI WAJIB
        // =====================================================

        if (!name || !email || !nohp || !password || !role) {
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
        // VALIDASI PROFESI NAKES
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
        // CEK EMAIL
        // =====================================================

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
                { status: 409 }
            );
        }

        // =====================================================
        // CEK NO HP
        // =====================================================

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
                { status: 409 }
            );
        }

        // =====================================================
        // HASH PASSWORD
        // =====================================================

        const hashedPassword = await bcrypt.hash(password, 10);

        // =====================================================
        // TRANSACTION
        // =====================================================

        const user = await prisma.$transaction(async (tx) => {
            // ---------------------------------------------------
            // CREATE USER
            // ---------------------------------------------------

            const createdUser = await tx.user.create({
                data: {
                    name,
                    email,
                    nohp,
                    password: hashedPassword,
                    role,
                    profesi: role === "NAKES" ? profesi : null,
                    instansi: instansi || null,
                },
            });

            // ---------------------------------------------------
            // PETUGAS → USER REGION
            // ---------------------------------------------------

            if (
                role === "PETUGAS" &&
                Array.isArray(regionIds) &&
                regionIds.length > 0
            ) {
                await tx.userRegion.createMany({
                    data: regionIds.map((regionId: string) => ({
                        userId: createdUser.id,
                        regionId,
                    })),
                    skipDuplicates: true,
                });
            }

            // ---------------------------------------------------
            // NAKES → FACILITY STAFF
            // ---------------------------------------------------

            if (
                role === "NAKES" &&
                Array.isArray(facilityIds) &&
                facilityIds.length > 0
            ) {
                await tx.facilityStaff.createMany({
                    data: facilityIds.map((facilityId: string) => ({
                        userId: createdUser.id,
                        facilityId,
                    })),
                    skipDuplicates: true,
                });
            }

            return createdUser;
        });

        // =====================================================
        // RESPONSE
        // =====================================================

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

        const { searchParams } = new URL(request.url);

        const role = searchParams.get("role");

        // =====================================================
        // VALIDASI ROLE QUERY
        // =====================================================

        if (
            role &&
            role !== "NAKES" &&
            role !== "PETUGAS"
        ) {
            return NextResponse.json(
                {
                    message: "Role tidak valid",
                },
                { status: 400 }
            );
        }

        // =====================================================
        // GET USERS
        // =====================================================

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
                createdAt: true,

                // ===============================================
                // PETUGAS → REGIONS
                // ===============================================

                regions: {
                    include: {
                        region: {
                            select: {
                                id: true,
                                name: true,
                                city: true,
                            },
                        },
                    },
                },

                // ===============================================
                // NAKES → FACILITIES
                // ===============================================

                facilities: {
                    include: {
                        facility: {
                            select: {
                                id: true,
                                name: true,
                                type: true,

                                region: {
                                    select: {
                                        id: true,
                                        name: true,
                                        city: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        // =====================================================
        // RAPikan response
        // =====================================================

        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            nohp: user.nohp,
            role: user.role,
            profesi: user.profesi,
            instansi: user.instansi,
            createdAt: user.createdAt,

            regions: user.regions.map(
                (item) => item.region
            ),

            facilities: user.facilities.map(
                (item) => item.facility
            ),
        }));

        return NextResponse.json(formattedUsers);
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