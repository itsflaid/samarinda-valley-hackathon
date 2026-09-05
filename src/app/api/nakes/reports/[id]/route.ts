import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
    params: Promise<{
        id: string;
    }>;
};

export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        // =====================================================
        // 1. CEK LOGIN
        // =====================================================

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

        // =====================================================
        // 2. CEK ROLE
        // =====================================================

        if (session.user.role !== "NAKES") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                }
            );
        }

        // =====================================================
        // 3. AMBIL ID
        // =====================================================

        const { id } = await params;

        // =====================================================
        // 4. CARI FASILITAS NAKES
        // =====================================================

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
                {
                    status: 403,
                }
            );
        }

        // =====================================================
        // 5. CARI LAPORAN
        // =====================================================

        const report = await prisma.healthReport.findFirst({
            where: {
                id,
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
                    orderBy: {
                        assessedAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        riskLevel: true,
                        notes: true,
                        actionTaken: true,
                        assessedAt: true,

                        nakes: {
                            select: {
                                name: true,
                                profesi: true,
                            },
                        },
                    },
                },
            },
        });

        // =====================================================
        // 6. REPORT TIDAK DITEMUKAN
        // =====================================================

        if (!report) {
            return NextResponse.json(
                {
                    message: "Laporan tidak ditemukan",
                },
                {
                    status: 404,
                }
            );
        }

        // =====================================================
        // 7. RESPONSE
        // =====================================================

        return NextResponse.json({
            ...report,
            assessment: report.assessments[0] ?? null,
        });
    } catch (error) {
        console.error(
            "GET /api/nakes/reports/[id] ERROR:",
            error
        );

        return NextResponse.json(
            {
                message: "Gagal mengambil detail laporan",
            },
            {
                status: 500,
            }
        );
    }
}