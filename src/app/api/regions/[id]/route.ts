import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        const region = await prisma.region.findUnique({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        healthReports: true,
                        waterReports: true,
                    },
                },
                healthReports: {
                    orderBy: {
                        reportedAt: "desc",
                    },
                    take: 20,
                    select: {
                        id: true,
                        diarrhea: true,
                        vomiting: true,
                        fever: true,
                        dehydration: true,
                        reportedAt: true,
                    },
                },
                waterReports: {
                    orderBy: {
                        reportedAt: "desc",
                    },
                    take: 20,
                    select: {
                        id: true,
                        supplyDisruption: true,
                        dirtyOrSmelly: true,
                        saltyOrBrackish: true,
                        dryWell: true,
                        reportedAt: true,
                    },
                },
            },
        });

        if (!region) {
            return NextResponse.json(
                { error: "Wilayah tidak ditemukan" },
                { status: 404 }
            );
        }

        const latestHealthReport = region.healthReports[0];
        const latestWaterReport = region.waterReports[0];

        const lastUpdated =
            latestHealthReport && latestWaterReport
                ? latestHealthReport.reportedAt > latestWaterReport.reportedAt
                    ? latestHealthReport.reportedAt
                    : latestWaterReport.reportedAt
                : latestHealthReport?.reportedAt ??
                latestWaterReport?.reportedAt ??
                null;

        const healthBreakdown = {
            diarrhea: region.healthReports.filter(
                (report) => report.diarrhea
            ).length,
            vomiting: region.healthReports.filter(
                (report) => report.vomiting
            ).length,
            fever: region.healthReports.filter(
                (report) => report.fever
            ).length,
            dehydration: region.healthReports.filter(
                (report) => report.dehydration
            ).length,
        };

        const waterBreakdown = {
            supplyDisruption: region.waterReports.filter(
                (report) => report.supplyDisruption
            ).length,
            dirtyOrSmelly: region.waterReports.filter(
                (report) => report.dirtyOrSmelly
            ).length,
            saltyOrBrackish: region.waterReports.filter(
                (report) => report.saltyOrBrackish
            ).length,
            dryWell: region.waterReports.filter(
                (report) => report.dryWell
            ).length,
        };

        return NextResponse.json({
            id: region.id,
            name: region.name,
            city: region.city,
            province: region.province,
            status: region.status,
            ipaStatus: region.ipaStatus,
            ipaCondition: region.ipaCondition,
            latitude: Number(region.latitude),
            longitude: Number(region.longitude),

            healthReports: {
                total: region._count.healthReports,
                ...healthBreakdown,
            },

            waterReports: {
                total: region._count.waterReports,
                ...waterBreakdown,
            },

            lastUpdated,
        });
    } catch (error) {
        console.error("GET /api/regions/[id] error:", error);

        return NextResponse.json(
            { error: "Gagal mengambil detail wilayah" },
            { status: 500 }
        );
    }
}