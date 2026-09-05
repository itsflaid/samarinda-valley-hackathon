import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateHealthReportInput } from "@/types/report";

export async function POST(request: Request) {
    try {
        const body =
            (await request.json()) as Partial<CreateHealthReportInput>;

        const {
            reporterName,
            reporterPhone,
            regionId,

            diarrhea,
            vomiting,
            fever,
            dehydration,

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

        const hasSymptom =
            diarrhea ||
            vomiting ||
            fever ||
            dehydration;

        if (!hasSymptom) {
            return NextResponse.json(
                {
                    error:
                        "Pilih minimal satu kondisi kesehatan",
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

        const report = await prisma.healthReport.create({
            data: {
                reporterName: reporterName.trim(),
                reporterPhone: reporterPhone.trim(),

                regionId,

                diarrhea: Boolean(diarrhea),
                vomiting: Boolean(vomiting),
                fever: Boolean(fever),
                dehydration: Boolean(dehydration),

                latitude,
                longitude,
            },
        });

        return NextResponse.json(
            {
                message:
                    "Laporan kesehatan berhasil dikirim",
                id: report.id,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error(
            "POST /api/reports/health error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Gagal menyimpan laporan kesehatan",
            },
            {
                status: 500,
            },
        );
    }
}