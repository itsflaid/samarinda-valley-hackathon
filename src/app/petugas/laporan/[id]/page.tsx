"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Report = {
    id: string;
    reporterName: string;
    reporterPhone: string;

    supplyDisruption: boolean;
    dirtyOrSmelly: boolean;
    saltyOrBrackish: boolean;
    dryWell: boolean;

    latitude: number;
    longitude: number;

    reportedAt: string;

    region: {
        id: string;
        name: string;
        city: string;
        province: string;
        status: "AMAN" | "WASPADA" | "SIAGA";
        ipaStatus: "AKTIF" | "MATI";
        ipaCondition: string | null;
    };
};

export default function PetugasReportDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [report, setReport] =
        useState<Report | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await fetch(
                    `/api/petugas/reports/${params?.id}`
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                            "Gagal mengambil detail laporan"
                    );
                }

                setReport(data);
            } catch (error) {
                console.error(
                    "FETCH REPORT DETAIL ERROR:",
                    error
                );

                setError(
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil detail laporan"
                );
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchReport();
        }
    }, [params.id]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const problems = report
        ? [
              report.supplyDisruption
                  ? "Distribusi air terganggu"
                  : null,

              report.dirtyOrSmelly
                  ? "Air keruh atau berbau"
                  : null,

              report.saltyOrBrackish
                  ? "Air asin atau payau"
                  : null,

              report.dryWell
                  ? "Sumur kering"
                  : null,
          ].filter(Boolean)
        : [];

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-6">
                <p className="text-sm text-muted-foreground">
                    Memuat detail laporan...
                </p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border bg-card p-6">
                    <h1 className="text-lg font-semibold">
                        Laporan tidak ditemukan
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {error ||
                            "Data laporan tidak tersedia."}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/petugas/laporan"
                        )
                    }
                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                    Kembali ke Laporan
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            "/petugas/laporan"
                        )
                    }
                    className="mb-3 text-sm text-muted-foreground hover:underline"
                >
                    ← Kembali ke Laporan
                </button>

                <h1 className="text-2xl font-bold">
                    Detail Laporan Air
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Informasi lengkap laporan
                    kondisi air.
                </p>
            </section>

            {/* PELAPOR */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">
                    Informasi Pelapor
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Nama
                        </p>

                        <p className="mt-1 font-medium">
                            {report.reporterName}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Nomor HP
                        </p>

                        <p className="mt-1 font-medium">
                            {report.reporterPhone}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Waktu Laporan
                        </p>

                        <p className="mt-1 font-medium">
                            {formatDate(
                                report.reportedAt
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Lokasi
                        </p>

                        <p className="mt-1 font-medium">
                            {report.region.name},{" "}
                            {report.region.city}
                        </p>
                    </div>
                </div>
            </section>

            {/* KELUHAN */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">
                    Keluhan Kondisi Air
                </h2>

                {problems.length === 0 ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Tidak ada keluhan yang
                        dicentang.
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {problems.map(
                            (problem) => (
                                <div
                                    key={String(
                                        problem
                                    )}
                                    className="rounded-lg border bg-muted/30 p-4"
                                >
                                    <p className="text-sm font-medium">
                                        {problem}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            {/* STATUS WILAYAH */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">
                    Kondisi Wilayah Saat Ini
                </h2>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {/* STATUS */}
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">
                            Status Wilayah
                        </p>

                        <p
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                report.region.status ===
                                "SIAGA"
                                    ? "bg-red-100 text-red-700"
                                    : report.region.status ===
                                      "WASPADA"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {report.region.status}
                        </p>
                    </div>

                    {/* IPA */}
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">
                            Status IPA
                        </p>

                        <p
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                report.region.ipaStatus ===
                                "MATI"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                        >
                            {report.region.ipaStatus ===
                            "AKTIF"
                                ? "Aktif"
                                : "Mati"}
                        </p>
                    </div>

                    {/* KONDISI */}
                    <div className="rounded-lg border p-4">
                        <p className="text-xs text-muted-foreground">
                            Kondisi IPA / Air
                        </p>

                        <p className="mt-2 text-sm">
                            {report.region
                                .ipaCondition ||
                                "Belum ada pemeriksaan"}
                        </p>
                    </div>
                </div>
            </section>

            {/* LOKASI */}
            <section className="rounded-xl border bg-card p-5 shadow-sm">
                <h2 className="text-lg font-semibold">
                    Lokasi Laporan
                </h2>

                <div className="mt-4 rounded-lg bg-muted/40 p-4">
                    <p className="text-sm">
                        Latitude:{" "}
                        <span className="font-medium">
                            {report.latitude}
                        </span>
                    </p>

                    <p className="mt-1 text-sm">
                        Longitude:{" "}
                        <span className="font-medium">
                            {report.longitude}
                        </span>
                    </p>
                </div>
            </section>
        </div>
    );
}