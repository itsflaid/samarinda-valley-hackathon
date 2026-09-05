"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import type { RegionData, RegionStatus } from "@/types/region";
import { statusColors } from "@/types/region";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<RegionStatus, string> = {
  AMAN: "Aman",
  WASPADA: "Waspada",
  SIAGA: "Siaga",
};

const ipaDot: Record<string, string> = {
  AKTIF: "bg-green-500",
  MATI: "bg-red-500",
};

function ipaLabel(v: string | null) {
  if (v === "AKTIF") return "Operasional normal";
  if (v === "MATI") return "Tidak beroperasi / mengalami gangguan";
  return "Belum tersedia";
}

export default function WilayahPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<RegionStatus | "">("");
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/regions")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data wilayah");
        return res.json();
      })
      .then((data: RegionData[]) => setRegions(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = regions.length;
  const countAman = regions.filter((r) => r.status === "AMAN").length;
  const countWaspada = regions.filter((r) => r.status === "WASPADA").length;
  const countSiaga = regions.filter((r) => r.status === "SIAGA").length;

  const filtered = useMemo(() => {
    return regions.filter((region) => {
      const matchesSearch =
        !search ||
        region.name.toLowerCase().includes(search.toLowerCase()) ||
        region.city.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = !filterStatus || region.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [search, filterStatus, regions]);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Kondisi Wilayah
          </h1>
          <p className="mt-2 text-muted-foreground">
            Pantau status risiko dan kondisi infrastruktur air di setiap wilayah.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Data berdasarkan wilayah kecamatan
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-border bg-white p-12 text-center dark:bg-black">
            <p className="font-medium text-destructive">Gagal memuat data</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari wilayah atau kota..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary dark:bg-black"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["", "AMAN", "WASPADA", "SIAGA"] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                        filterStatus === status
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {status === "" ? "Semua" : statusLabels[status]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Total Wilayah</p>
                <p className="mt-1 text-2xl font-bold">{total}</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Aman</p>
                <p className="mt-1 text-2xl font-bold text-green-500">{countAman}</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Waspada</p>
                <p className="mt-1 text-2xl font-bold text-yellow-500">
                  {countWaspada}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Siaga</p>
                <p className="mt-1 text-2xl font-bold text-red-500">{countSiaga}</p>
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-border bg-white p-12 text-center dark:bg-black">
                <p className="font-medium">Wilayah tidak ditemukan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba ubah kata pencarian atau filter status yang digunakan.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((region) => (
                <div
                  key={region.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-white p-5 dark:bg-black"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{region.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {region.city}
                        </p>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: statusColors[region.status],
                          color: region.status === "SIAGA" ? "#fff" : "#111827",
                        }}
                      >
                        {region.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Status IPA
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${ipaDot[region.ipaStatus ?? ""] ?? "bg-gray-400"}`}
                          />
                          <span className="text-sm">{ipaLabel(region.ipaStatus)}</span>
                        </div>
                        {region.ipaCondition && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {region.ipaCondition}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          Laporan
                        </p>
                        <p className="mt-0.5 text-sm">
                          {region.symptomReports} laporan gejala, {region.waterReports} laporan air
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/wilayah/${region.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Lihat Detail →
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
