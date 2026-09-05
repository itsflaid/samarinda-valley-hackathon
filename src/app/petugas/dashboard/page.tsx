"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Region = {
    id: string;
    name: string;
    city: string;
    province: string;
    status: "AMAN" | "WASPADA" | "SIAGA";
    ipaStatus: "AKTIF" | "MATI";
    ipaCondition: string | null;
};

type DashboardData = {
    regions: Region[];
};

const statusStyle = {
    AMAN: "bg-green-100 text-green-700",
    WASPADA: "bg-yellow-100 text-yellow-700",
    SIAGA: "bg-red-100 text-red-700",
};

const ipaStyle = {
    AKTIF: "bg-green-100 text-green-700",
    MATI: "bg-red-100 text-red-700",
};

export default function PetugasDashboardPage() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch(
                    "/api/petugas/regions",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Gagal mengambil data wilayah"
                    );
                }

                const data: Region[] =
                    await response.json();

                setRegions(data);
            } catch (error) {
                console.error(
                    "FETCH PETUGAS DASHBOARD ERROR:",
                    error
                );

                toast.error(
                    "Gagal mengambil data dashboard"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegions();
    }, []);

    const totalWilayah = regions.length;

    const totalIpaAktif = regions.filter(
        (region) => region.ipaStatus === "AKTIF"
    ).length;

    const totalIpaMati = regions.filter(
        (region) => region.ipaStatus === "MATI"
    ).length;

    const totalPerhatian = regions.filter(
        (region) =>
            region.status === "WASPADA" ||
            region.status === "SIAGA"
    ).length;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <section>
                <h1 className="text-2xl font-bold">
                    Dashboard Petugas
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Pantau kondisi air dan IPA pada
                    wilayah yang menjadi tanggung jawab Anda.
                </p>
            </section>

            {/* SUMMARY */}
            <section className="grid gap-4 md:grid-cols-4">
                {/* WILAYAH */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Wilayah Saya
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : totalWilayah}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Wilayah yang ditugaskan
                    </p>
                </div>

                {/* IPA AKTIF */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        IPA Aktif
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : totalIpaAktif}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Instalasi berjalan normal
                    </p>
                </div>

                {/* IPA MATI */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        IPA Mati
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : totalIpaMati}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Membutuhkan perhatian
                    </p>
                </div>

                {/* PERHATIAN */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Waspada / Siaga
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                        {isLoading
                            ? "..."
                            : totalPerhatian}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                        Wilayah perlu ditindaklanjuti
                    </p>
                </div>
            </section>

            {/* STATUS WILAYAH */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">
                        Kondisi Wilayah Saya
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Status terakhir dari wilayah
                        yang Anda tangani.
                    </p>
                </div>

                {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                        Memuat wilayah...
                    </p>
                ) : regions.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Belum ada wilayah yang
                            ditugaskan.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {regions.map((region) => (
                            <div
                                key={region.id}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-semibold">
                                            {region.name}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {region.city} •{" "}
                                            {region.province}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                            statusStyle[
                                                region.status
                                            ]
                                        }`}
                                    >
                                        {region.status}
                                    </span>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-md bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Status IPA
                                        </p>

                                        <span
                                            className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                                                ipaStyle[
                                                    region
                                                        .ipaStatus
                                                ]
                                            }`}
                                        >
                                            {region.ipaStatus ===
                                            "AKTIF"
                                                ? "🟢 Aktif"
                                                : "🔴 Mati"}
                                        </span>
                                    </div>

                                    <div className="rounded-md bg-muted/40 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            Kondisi
                                        </p>

                                        <p className="mt-1 text-sm">
                                            {region.ipaCondition ||
                                                "Belum diperiksa"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-red-800">
                            Perlu melakukan pemeriksaan?
                        </h2>

                        <p className="text-sm text-red-700">
                            Buka halaman wilayah untuk
                            memperbarui status IPA dan
                            kondisi air.
                        </p>
                    </div>

                    <a
                        href="/petugas/status"
                        className="inline-flex w-fit rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Pemeriksaan Air
                    </a>
                </div>
            </section>
        </div>
    );
}