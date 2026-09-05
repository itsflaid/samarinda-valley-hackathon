"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function LaporanPage() {
    const [reports, setReports] =
        useState<Report[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch(
                    "/api/petugas/reports",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Gagal mengambil laporan"
                    );
                }

                const result =
                    await response.json();

                setReports(
                    Array.isArray(result)
                        ? result
                        : []
                );
            } catch (error) {
                console.error(
                    "FETCH PETUGAS REPORTS ERROR:",
                    error
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    // ==========================================
    // KELUHAN AIR
    // ==========================================

    const getProblems = (
        report: Report
    ) => {
        const problems: string[] = [];

        if (report.supplyDisruption) {
            problems.push(
                "Distribusi terganggu"
            );
        }

        if (report.dirtyOrSmelly) {
            problems.push(
                "Air keruh / berbau"
            );
        }

        if (report.saltyOrBrackish) {
            problems.push(
                "Air asin / payau"
            );
        }

        if (report.dryWell) {
            problems.push(
                "Sumur kering"
            );
        }

        return problems.length > 0
            ? problems.join(", ")
            : "Tidak ada keluhan";
    };

    // ==========================================
    // WAKTU
    // ==========================================

    const formatTime = (
        date: string
    ) => {
        return new Date(
            date
        ).toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // ==========================================
    // PRIORITAS LAPORAN
    // ==========================================

    const getPriority = (
        report: Report
    ) => {
        let score = 0;

        if (report.supplyDisruption) {
            score += 2;
        }

        if (report.dirtyOrSmelly) {
            score += 2;
        }

        if (report.saltyOrBrackish) {
            score += 1;
        }

        if (report.dryWell) {
            score += 2;
        }

        if (
            report.region.status ===
            "SIAGA"
        ) {
            score += 3;
        } else if (
            report.region.status ===
            "WASPADA"
        ) {
            score += 1;
        }

        return score;
    };

    const sortedReports = [
        ...reports,
    ].sort(
        (a, b) =>
            getPriority(b) -
            getPriority(a)
    );

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">
                    Laporan Kondisi Air
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Laporan kondisi air dari
                    wilayah yang menjadi
                    tanggung jawab Anda.
                </p>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Laporan
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : reports.length}
                    </h2>
                </div>

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Wilayah Waspada
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : reports.filter(
                                  (report) =>
                                      report.region
                                          .status ===
                                      "WASPADA"
                              ).length}
                    </h2>
                </div>

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Wilayah Siaga
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : reports.filter(
                                  (report) =>
                                      report.region
                                          .status ===
                                      "SIAGA"
                              ).length}
                    </h2>
                </div>
            </section>

            {/* LIST */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Daftar Laporan
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Laporan dengan kondisi
                        paling mendesak ditampilkan
                        terlebih dahulu.
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Memuat laporan...
                    </p>
                ) : sortedReports.length ===
                  0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum ada laporan
                            kondisi air.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedReports.map(
                            (report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium">
                                            {getProblems(
                                                report
                                            )}
                                        </p>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {
                                                report
                                                    .region
                                                    .name
                                            }{" "}
                                            •{" "}
                                            {
                                                report
                                                    .region
                                                    .city
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Pelapor:{" "}
                                            {
                                                report
                                                    .reporterName
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {
                                                formatTime(
                                                    report.reportedAt
                                                )
                                            }
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-3">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                report
                                                    .region
                                                    .status ===
                                                "SIAGA"
                                                    ? "bg-red-100 text-red-700"
                                                    : report
                                                          .region
                                                          .status ===
                                                      "WASPADA"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {
                                                report
                                                    .region
                                                    .status
                                            }
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/petugas/laporan/${report.id}`
                                                )
                                            }
                                            className="rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                                        >
                                            Detail
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}