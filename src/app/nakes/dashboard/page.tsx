"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RiskMap from "@/components/atoms/RiskMap";

type DashboardData = {
    totalReports: number;
    totalAssessed: number;
    totalUnassessed: number;
    totalHighRisk: number;

    totalDiarrhea: number;
    totalVomiting: number;
    totalFever: number;
    totalDehydration: number;

    alerts: {
        id: string;
        name: string;
        city: string;
        status: "AMAN" | "WASPADA" | "SIAGA";
        totalReports: number;
    }[];

    latestReports: {
        id: string;
        reporterName: string;

        diarrhea: boolean;
        vomiting: boolean;
        fever: boolean;
        dehydration: boolean;

        reportedAt: string;

        region: {
            name: string;
            city: string;
        };

        assessment: {
            id: string;
            riskLevel: "RENDAH" | "SEDANG" | "TINGGI";
            assessedAt: string;
        } | null;
    }[];
};

export default function NakesDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await fetch("/api/nakes/dashboard");

                if (!response.ok) {
                    throw new Error("Gagal mengambil dashboard");
                }

                const result = await response.json();

                setData(result);
            } catch (error) {
                console.error("FETCH NAKES DASHBOARD ERROR:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const formatStatus = (
        status: "AMAN" | "WASPADA" | "SIAGA"
    ) => {
        if (status === "SIAGA") return "Siaga";
        if (status === "WASPADA") return "Waspada";
        return "Aman";
    };

    const getStatusClass = (
        status: "AMAN" | "WASPADA" | "SIAGA"
    ) => {
        if (status === "SIAGA") {
            return "bg-red-100 text-red-700";
        }

        if (status === "WASPADA") {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-green-100 text-green-700";
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">Dashboard Nakes</h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Pantau kondisi kesehatan di wilayah fasilitas Anda.
                </p>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Laporan
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading ? "..." : data?.totalReports ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Belum Dinilai
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading ? "..." : data?.totalUnassessed ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Risiko Tinggi
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading ? "..." : data?.totalHighRisk ?? 0}
                    </h2>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Sudah Dinilai
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading ? "..." : data?.totalAssessed ?? 0}
                    </h2>
                </div>
            </section>

            {/* PRIORITAS */}
            <section className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-red-800">
                        Prioritas Hari Ini
                    </h2>

                    <p className="text-sm text-red-700">
                        Fokus pada laporan yang membutuhkan perhatian terlebih dahulu.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* BELUM DINILAI */}
                    <div className="rounded-lg border border-red-200 bg-white p-4">
                        <p className="text-sm text-muted-foreground">
                            Belum Dinilai
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {isLoading ? "..." : data?.totalUnassessed ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Laporan yang belum mendapatkan assessment
                        </p>
                    </div>

                    {/* RISIKO TINGGI */}
                    <div className="rounded-lg border border-red-200 bg-white p-4">
                        <p className="text-sm text-muted-foreground">
                            Risiko Tinggi
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {isLoading ? "..." : data?.totalHighRisk ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Laporan dengan hasil assessment tinggi
                        </p>
                    </div>

                    {/* SIAGA */}
                    <div className="rounded-lg border border-red-200 bg-white p-4">
                        <p className="text-sm text-muted-foreground">
                            Wilayah Siaga
                        </p>

                        <p className="mt-2 text-2xl font-bold">
                            {isLoading
                                ? "..."
                                : data?.alerts.filter(
                                    (alert) => alert.status === "SIAGA"
                                ).length ?? 0}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Wilayah yang membutuhkan perhatian
                        </p>
                    </div>
                </div>
            </section>

            {/* ALERT */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Peringatan Kesehatan
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Wilayah yang membutuhkan perhatian.
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Memuat alert...
                    </p>
                ) : data?.alerts.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum ada alert kesehatan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data?.alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {alert.name}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {alert.city} • {alert.totalReports} laporan kesehatan
                                    </p>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                        alert.status
                                    )}`}
                                >
                                    {formatStatus(alert.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* PETA RISIKO */}
<section className="rounded-xl border border-border bg-card p-5 shadow-sm">
  <div className="mb-4">
    <h2 className="text-lg font-semibold">
      Peta Risiko Kesehatan
    </h2>

    <p className="text-sm text-muted-foreground">
      Sebaran laporan kesehatan berdasarkan lokasi.
    </p>
  </div>

  <RiskMap
    reports={data?.latestReports ?? []}
  />
</section>

        </div>
    );
}

