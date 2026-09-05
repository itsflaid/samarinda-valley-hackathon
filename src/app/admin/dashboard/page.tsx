"use client";

import { useEffect, useState } from "react";

type DashboardData = {
    statistics: {
        totalNakes: number;
        totalPetugas: number;
        totalFacilities: number;
        totalHealthReports: number;
        totalWaterReports: number;
    };

    regions: {
        aman: number;
        waspada: number;
        siaga: number;
    };

    alerts: {
        highRisk: number;
        unassessed: number;
    };
};

export default function AdminDashboardPage() {
    const [data, setData] =
        useState<DashboardData | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch(
                    "/api/admin/dashboard"
                );

                if (!response.ok) {
                    throw new Error(
                        "Gagal mengambil dashboard admin"
                    );
                }

                const result =
                    await response.json();

                setData(result);
            } catch (error) {
                console.error(
                    "FETCH ADMIN DASHBOARD ERROR:",
                    error
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const statistics =
        data?.statistics;

    const regions =
        data?.regions;

    const alerts =
        data?.alerts;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">
                    Dashboard Admin
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Pantau pengguna, fasilitas,
                    wilayah, dan kondisi kesehatan
                    sistem.
                </p>
            </section>

            {/* STATISTICS */}
            <section className="grid gap-4 md:grid-cols-4">
                {/* NAKES */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Nakes
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : statistics?.totalNakes ??
                              0}
                    </h2>
                </div>

                {/* PETUGAS */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Petugas
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : statistics?.totalPetugas ??
                              0}
                    </h2>
                </div>

                {/* FASILITAS */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Fasilitas
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : statistics?.totalFacilities ??
                              0}
                    </h2>
                </div>

                {/* LAPORAN */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Laporan Kesehatan
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : statistics?.totalHealthReports ??
                              0}
                    </h2>
                </div>
            </section>

            {/* MONITORING WILAYAH */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Kondisi Wilayah
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Status wilayah berdasarkan
                        kondisi monitoring.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* AMAN */}
                    <div className="rounded-lg border bg-green-50 p-4">
                        <p className="text-sm font-medium text-green-700">
                            Aman
                        </p>

                        <p className="mt-2 text-3xl font-bold text-green-800">
                            {isLoading
                                ? "..."
                                : regions?.aman ??
                                  0}
                        </p>

                        <p className="mt-1 text-xs text-green-700">
                            Wilayah dalam kondisi
                            aman
                        </p>
                    </div>

                    {/* WASPADA */}
                    <div className="rounded-lg border bg-yellow-50 p-4">
                        <p className="text-sm font-medium text-yellow-700">
                            Waspada
                        </p>

                        <p className="mt-2 text-3xl font-bold text-yellow-800">
                            {isLoading
                                ? "..."
                                : regions?.waspada ??
                                  0}
                        </p>

                        <p className="mt-1 text-xs text-yellow-700">
                            Wilayah membutuhkan
                            perhatian
                        </p>
                    </div>

                    {/* SIAGA */}
                    <div className="rounded-lg border bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-700">
                            Siaga
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-800">
                            {isLoading
                                ? "..."
                                : regions?.siaga ??
                                  0}
                        </p>

                        <p className="mt-1 text-xs text-red-700">
                            Wilayah membutuhkan
                            tindakan
                        </p>
                    </div>
                </div>
            </section>

            {/* ALERT */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Perlu Perhatian
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Data yang perlu segera
                        diperhatikan oleh Admin.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* RISIKO TINGGI */}
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                            Risiko Tinggi
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-800">
                            {isLoading
                                ? "..."
                                : alerts?.highRisk ??
                                  0}
                        </p>

                        <p className="mt-1 text-xs text-red-700">
                            Laporan dengan hasil
                            assessment risiko tinggi
                        </p>
                    </div>

                    {/* BELUM DINILAI */}
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-sm text-yellow-700">
                            Belum Dinilai
                        </p>

                        <p className="mt-2 text-3xl font-bold text-yellow-800">
                            {isLoading
                                ? "..."
                                : alerts?.unassessed ??
                                  0}
                        </p>

                        <p className="mt-1 text-xs text-yellow-700">
                            Laporan kesehatan yang
                            belum mendapatkan assessment
                        </p>
                    </div>
                </div>
            </section>

            {/* LAPORAN AIR */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Monitoring Laporan Air
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Total laporan kondisi
                            air yang masuk.
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Total
                        </p>

                        <p className="text-3xl font-bold">
                            {isLoading
                                ? "..."
                                : statistics?.totalWaterReports ??
                                  0}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}