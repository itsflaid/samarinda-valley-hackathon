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
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const router = useRouter();

    const ITEMS_PER_PAGE = 10;
    const MAX_REPORTS = 20;

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(
                    "/api/petugas/reports",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Gagal mengambil laporan air"
                    );
                }

                const result = await response.json();

                const data: Report[] =
                    Array.isArray(result)
                        ? result
                        : Array.isArray(result?.reports)
                          ? result.reports
                          : [];

                // Ambil 20 laporan terbaru
                const latestReports = [...data]
                    .sort(
                        (a, b) =>
                            new Date(
                                b.reportedAt
                            ).getTime() -
                            new Date(
                                a.reportedAt
                            ).getTime()
                    )
                    .slice(0, MAX_REPORTS);

                setReports(latestReports);
                setCurrentPage(1);
            } catch (error) {
                console.error(
                    "FETCH PETUGAS REPORTS ERROR:",
                    error
                );

                setReports([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    // ==========================================
    // MASALAH AIR
    // ==========================================

    const getProblems = (report: Report) => {
        const problems: string[] = [];

        if (report.supplyDisruption) {
            problems.push("Distribusi terganggu");
        }

        if (report.dirtyOrSmelly) {
            problems.push("Air keruh / berbau");
        }

        if (report.saltyOrBrackish) {
            problems.push("Air asin / payau");
        }

        if (report.dryWell) {
            problems.push("Sumur kering");
        }

        return problems.length > 0
            ? problems.join(", ")
            : "Tidak ada keluhan";
    };

    // ==========================================
    // PRIORITAS
    // ==========================================

    const getPriority = (report: Report) => {
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

        if (report.region.status === "SIAGA") {
            score += 3;
        } else if (
            report.region.status === "WASPADA"
        ) {
            score += 1;
        }

        return score;
    };

    // ==========================================
    // FORMAT TANGGAL
    // ==========================================

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString(
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
    // PAGINATION
    // ==========================================

    const totalPages = Math.ceil(
        reports.length / ITEMS_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const endIndex =
        startIndex + ITEMS_PER_PAGE;

    const currentReports = reports.slice(
        startIndex,
        endIndex
    );

    const goToPage = (page: number) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);
    };

    // ==========================================
    // SORTING PRIORITAS DALAM 20 TERBARU
    // ==========================================
    //
    // HAPUS bagian ini kalau kamu ingin
    // murni berdasarkan waktu terbaru.
    //
    // Karena kamu sebelumnya ingin laporan
    // terbaru di atas, kita TIDAK pakai
    // sorting prioritas untuk tampilan akhir.

    void getPriority;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">
                    Laporan Kondisi Air
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Menampilkan 20 laporan kondisi air
                    terbaru dari wilayah yang menjadi
                    tanggung jawab Anda.
                </p>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 md:grid-cols-3">
                {/* TOTAL */}
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

                {/* WASPADA */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Laporan Wilayah Waspada
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : reports.filter(
                                  (report) =>
                                      report.region.status ===
                                      "WASPADA"
                              ).length}
                    </h2>
                </div>

                {/* SIAGA */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Laporan Wilayah Siaga
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : reports.filter(
                                  (report) =>
                                      report.region.status ===
                                      "SIAGA"
                              ).length}
                    </h2>
                </div>
            </section>

            {/* TABLE */}
            <section className="rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b px-5 py-4">
                    <h2 className="text-lg font-semibold">
                        Laporan Terbaru
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Laporan diurutkan berdasarkan
                        waktu masuk terbaru.
                    </p>
                </div>

                {isLoading ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Memuat laporan...
                    </div>
                ) : reports.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                        Belum ada laporan kondisi air.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left">
                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            No
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Pelapor
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Keluhan Air
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Wilayah
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Status
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 font-semibold">
                                            Waktu
                                        </th>

                                        <th className="whitespace-nowrap px-4 py-3 text-right font-semibold">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {currentReports.map(
                                        (
                                            report,
                                            index
                                        ) => {
                                            const rowNumber =
                                                startIndex +
                                                index +
                                                1;

                                            return (
                                                <tr
                                                    key={
                                                        report.id
                                                    }
                                                    className="border-b last:border-b-0 hover:bg-muted/30"
                                                >
                                                    {/* NO */}
                                                    <td className="px-4 py-4 align-top">
                                                        {
                                                            rowNumber
                                                        }
                                                    </td>

                                                    {/* PELAPOR */}
                                                    <td className="min-w-[160px] px-4 py-4 align-top">
                                                        <p className="font-medium">
                                                            {
                                                                report.reporterName
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                report.reporterPhone
                                                            }
                                                        </p>
                                                    </td>

                                                    {/* KELUHAN */}
                                                    <td className="min-w-[220px] max-w-[300px] px-4 py-4 align-top">
                                                        <p className="font-medium">
                                                            {getProblems(
                                                                report
                                                            )}
                                                        </p>
                                                    </td>

                                                    {/* WILAYAH */}
                                                    <td className="px-4 py-4 align-top">
                                                        <p className="font-medium">
                                                            {
                                                                report
                                                                    .region
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                report
                                                                    .region
                                                                    .city
                                                            }
                                                        </p>
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="px-4 py-4 align-top">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
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
                                                    </td>

                                                    {/* WAKTU */}
                                                    <td className="whitespace-nowrap px-4 py-4 align-top text-muted-foreground">
                                                        {formatDate(
                                                            report.reportedAt
                                                        )}
                                                    </td>

                                                    {/* AKSI */}
                                                    <td className="px-4 py-4 text-right align-top">
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
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan{" "}
                                <span className="font-medium text-foreground">
                                    {startIndex + 1}
                                </span>{" "}
                                -{" "}
                                <span className="font-medium text-foreground">
                                    {Math.min(
                                        endIndex,
                                        reports.length
                                    )}
                                </span>{" "}
                                dari{" "}
                                <span className="font-medium text-foreground">
                                    {reports.length}
                                </span>{" "}
                                laporan
                            </p>

                            <div className="flex items-center gap-1">
                                {/* SEBELUMNYA */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            currentPage -
                                                1
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        1
                                    }
                                    className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>

                                {/* NOMOR */}
                                {Array.from(
                                    {
                                        length: totalPages,
                                    },
                                    (_, index) =>
                                        index + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() =>
                                            goToPage(
                                                page
                                            )
                                        }
                                        className={`h-9 min-w-9 rounded-md px-3 text-sm font-medium transition ${
                                            currentPage ===
                                            page
                                                ? "bg-red-600 text-white"
                                                : "border hover:bg-muted"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* BERIKUTNYA */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            currentPage +
                                                1
                                        )
                                    }
                                    disabled={
                                        currentPage ===
                                        totalPages
                                    }
                                    className="rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}