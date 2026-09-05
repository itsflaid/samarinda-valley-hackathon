import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const regions = await prisma.region.findMany({
            orderBy: [
                { city: "asc" },
                { name: "asc" },
            ],
            include: {
                _count: {
                    select: {
                        healthReports: true,
                        waterReports: true,
                    },
                },
            },
        });

        const data = regions.map((region) => ({
            id: region.id,
            name: region.name,
            city: region.city,
            province: region.province,
            status: region.status,
            ipaStatus: region.ipaStatus,
            ipaCondition: region.ipaCondition,
            latitude: Number(region.latitude),
            longitude: Number(region.longitude),

            symptomReports: region._count.healthReports,
            waterReports: region._count.waterReports,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/regions error:", error);

        return NextResponse.json(
            { error: "Gagal mengambil data wilayah" },
            { status: 500 }
        );
    }
}