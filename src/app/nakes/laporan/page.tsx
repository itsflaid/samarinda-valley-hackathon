"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Report = {
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
};

type ReportsResponse = {
    latestReports: Report[];
};

export default function LaporanPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await fetch("/api/nakes/dashboard");

                if (!response.ok) {
                    throw new Error("Gagal mengambil laporan");
                }

                const result: ReportsResponse = await response.json();

                setReports(result.latestReports ?? []);
            } catch (error) {
                console.error("FETCH REPORTS ERROR:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, []);

    const getSymptoms = (report: Report) => {
        const symptoms: string[] = [];

        if (report.diarrhea) symptoms.push("Diare");
        if (report.vomiting) symptoms.push("Muntah");
        if (report.fever) symptoms.push("Demam");
        if (report.dehydration) symptoms.push("Dehidrasi");

        return symptoms.length > 0
            ? symptoms.join(", ")
            : "Tidak ada gejala";
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const sortedReports = [...reports].sort((a, b) => {
        // Belum dinilai paling atas
        if (!a.assessment && b.assessment) return -1;
        if (a.assessment && !b.assessment) return 1;

        const riskOrder = {
            TINGGI: 3,
            SEDANG: 2,
            RENDAH: 1,
        };

        const riskA = a.assessment
            ? riskOrder[a.assessment.riskLevel]
            : 4;

        const riskB = b.assessment
            ? riskOrder[b.assessment.riskLevel]
            : 4;

        return riskB - riskA;
    });

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">
                    Laporan Kesehatan
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Daftar laporan kesehatan dari wilayah fasilitas Anda.
                </p>
            </section>

            {/* REPORT LIST */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Daftar Laporan
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Laporan diurutkan berdasarkan prioritas assessment.
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Memuat laporan...
                    </p>
                ) : sortedReports.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum ada laporan kesehatan.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedReports.map((report) => (
                            <div
                                key={report.id}
                                className="flex items-center justify-between gap-4 rounded-lg border p-4"
                            >
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {getSymptoms(report)}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {report.region.name} •{" "}
                                        {report.region.city}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Pelapor: {report.reporterName}
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Dilaporkan pukul{" "}
                                        {formatTime(report.reportedAt)}
                                    </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-3">
                                    {report.assessment ? (
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                report.assessment.riskLevel ===
                                                "TINGGI"
                                                    ? "bg-red-100 text-red-700"
                                                    : report.assessment
                                                              .riskLevel ===
                                                          "SEDANG"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            Risiko{" "}
                                            {report.assessment.riskLevel}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                            Belum Dinilai
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                `/nakes/reports/${report.id}`
                                            )
                                        }
                                        className="rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                                    >
                                        Detail
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}