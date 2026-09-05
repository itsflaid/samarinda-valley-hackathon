import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateWaterReportInput } from "@/types/report";

export async function POST(request: Request) {
    try {
        const body =
            (await request.json()) as Partial<CreateWaterReportInput>;

        const {
            reporterName,
            reporterPhone,
            regionId,

            supplyDisruption,
            dirtyOrSmelly,
            saltyOrBrackish,
            dryWell,

            latitude,
            longitude,
        } = body;

        if (!reporterName?.trim()) {
            return NextResponse.json(
                {
                    error: "Nama pelapor wajib diisi",
                },
                {
                    status: 400,
                },
            );
        }

        if (!reporterPhone?.trim()) {
            return NextResponse.json(
                {
                    error: "Nomor HP wajib diisi",
                },
                {
                    status: 400,
                },
            );
        }

        if (!regionId) {
            return NextResponse.json(
                {
                    error: "Wilayah wajib ditentukan",
                },
                {
                    status: 400,
                },
            );
        }

        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number"
        ) {
            return NextResponse.json(
                {
                    error: "Lokasi wajib tersedia",
                },
                {
                    status: 400,
                },
            );
        }

        const hasCondition =
            supplyDisruption ||
            dirtyOrSmelly ||
            saltyOrBrackish ||
            dryWell;

        if (!hasCondition) {
            return NextResponse.json(
                {
                    error:
                        "Pilih minimal satu kondisi air",
                },
                {
                    status: 400,
                },
            );
        }

        const region = await prisma.region.findUnique({
            where: {
                id: regionId,
            },
        });

        if (!region) {
            return NextResponse.json(
                {
                    error: "Wilayah tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        const report = await prisma.waterReport.create({
            data: {
                reporterName: reporterName.trim(),
                reporterPhone: reporterPhone.trim(),

                regionId,

                supplyDisruption: Boolean(
                    supplyDisruption,
                ),
                dirtyOrSmelly: Boolean(
                    dirtyOrSmelly,
                ),
                saltyOrBrackish: Boolean(
                    saltyOrBrackish,
                ),
                dryWell: Boolean(dryWell),

                latitude,
                longitude,
            },
        });

        return NextResponse.json(
            {
                message:
                    "Laporan air berhasil dikirim",
                id: report.id,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(
            "POST /api/reports/water error:",
            error,
        );

        return NextResponse.json(
            {
                error: "Gagal menyimpan laporan air",
            },
            {
                status: 500,
            },
        );
    }
}