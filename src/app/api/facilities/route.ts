import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const facilities = await prisma.facility.findMany({
            where: {
                isActive: true,
            },
            include: {
                region: {
                    select: {
                        id: true,
                        name: true,
                        city: true,
                        province: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const data = facilities.map((facility) => ({
            id: facility.id,
            name: facility.name,
            type: facility.type,
            address: facility.address,
            regionId: facility.regionId,
            latitude: facility.latitude,
            longitude: facility.longitude,
            phone: facility.phone,
            openingHours: facility.openingHours,
            isActive: facility.isActive,

            region: facility.region,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/facilities error:", error);

        return NextResponse.json(
            { error: "Gagal mengambil data fasilitas kesehatan" },
            { status: 500 }
        );
    }
}
