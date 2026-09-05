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

        // ================================================
        // FASILITAS NAKES
        // ================================================

        const facilityStaff =
            await prisma.facilityStaff.findMany({
                where: {
                    userId: session.user.id,
                },
                select: {
                    id: true,
                    reporterName: true,

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
                            assessedAt: true,
                        },
                    },
                },
            });

        // ================================================
        // REGION UNIK
        // ================================================

        const regionsMap = new Map();

        for (const item of facilityStaff) {
            regionsMap.set(
                item.facility.region.id,
                item.facility.region
            );
        }

        const regions = Array.from(
            regionsMap.values()
        );

        const regionIds = regions.map(
            (region) => region.id
        );

        if (regionIds.length === 0) {
            return NextResponse.json({
                totalReports: 0,
                totalAssessed: 0,
                totalUnassessed: 0,
                totalHighRisk: 0,
                totalDiarrhea: 0,
                totalVomiting: 0,
                totalFever: 0,
                totalDehydration: 0,
                alerts: [],
                latestReports: [],
            });
        }

        // ================================================
        // REPORTS
        // ================================================

        const reports =
            await prisma.healthReport.findMany({
                where: {
                    regionId: {
                        in: regionIds,
                    },
                },
                select: {
                    id: true,
                    reporterName: true,
                    diarrhea: true,
                    vomiting: true,
                    fever: true,
                    dehydration: true,
                    reportedAt: true,

                    region: {
                        select: {
                            id: true,
                            name: true,
                            city: true,
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
                            assessedAt: true,
                        },
                    },
                },
                orderBy: {
                    reportedAt: "desc",
                },
            });

        // ================================================
        // STATISTIK
        // ================================================

        const totalReports = reports.length;

        const totalAssessed = reports.filter(
            (report) =>
                report.assessments.length > 0
        ).length;

        const totalUnassessed =
            totalReports - totalAssessed;

        const totalHighRisk = reports.filter(
            (report) =>
                report.assessments[0]?.riskLevel ===
                "TINGGI"
        ).length;

        const totalDiarrhea = reports.filter(
            (report) => report.diarrhea
        ).length;

        const totalVomiting = reports.filter(
            (report) => report.vomiting
        ).length;

        const totalFever = reports.filter(
            (report) => report.fever
        ).length;

        const totalDehydration = reports.filter(
            (report) => report.dehydration
        ).length;

        // ================================================
        // ALERT
        // ================================================

        const alerts = regions
            .filter(
                (region) =>
                    region.status === "WASPADA" ||
                    region.status === "SIAGA"
            )
            .map((region) => ({
                id: region.id,
                name: region.name,
                city: region.city,
                status: region.status,
                totalReports: reports.filter(
                    (report) =>
                        report.region.id === region.id
                ).length,
            }))
            .sort((a, b) => {
                if (
                    a.status === "SIAGA" &&
                    b.status !== "SIAGA"
                ) {
                    return -1;
                }

                if (
                    a.status !== "SIAGA" &&
                    b.status === "SIAGA"
                ) {
                    return 1;
                }

                return b.totalReports - a.totalReports;
            });

        // ================================================
        // LAPORAN TERBARU
        // ================================================

        const latestReports = reports
            .slice(0, 10)
            .map((report) => ({
                id: report.id,
                reporterName: report.reporterName,

                diarrhea: report.diarrhea,
                vomiting: report.vomiting,
                fever: report.fever,
                dehydration: report.dehydration,

                latitude: report.latitude,
                longitude: report.longitude,

                reportedAt: report.reportedAt,

                region: report.region,

                assessment:
                    report.assessments[0] ?? null,
            }));

        // ================================================
        // RESPONSE
        // ================================================

        return NextResponse.json({
            totalReports,
            totalAssessed,
            totalUnassessed,
            totalHighRisk,

            totalDiarrhea,
            totalVomiting,
            totalFever,
            totalDehydration,

            alerts,
            latestReports,
        });
    } catch (error) {
        console.error(
            "GET /api/nakes/dashboard ERROR:",
            error
        );

        return NextResponse.json(
            {
                message:
                    "Gagal mengambil data dashboard Nakes",
            },
            { status: 500 }
        );
    }
}