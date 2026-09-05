"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Building2, Phone, Clock, MapPin } from "lucide-react";
import type { FacilityData, FacilityType } from "@/types/facility";
import { Skeleton } from "@/components/ui/skeleton";

const facilityTypeLabels: Record<FacilityType, string> = {
  PUSKESMAS: "Puskesmas",
  RUMAH_SAKIT: "Rumah Sakit",
  KLINIK: "Klinik",
};

const facilityTypeColors: Record<FacilityType, string> = {
  PUSKESMAS: "#10b981",
  RUMAH_SAKIT: "#3b82f6",
  KLINIK: "#8b5cf6",
};

export default function FasilitasPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FacilityType | "">("");
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/facilities")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat data fasilitas");
        return res.json();
      })
      .then((data: FacilityData[]) => setFacilities(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = facilities.length;
  const countPuskesmas = facilities.filter((f) => f.type === "PUSKESMAS").length;
  const countRumahSakit = facilities.filter((f) => f.type === "RUMAH_SAKIT").length;
  const countKlinik = facilities.filter((f) => f.type === "KLINIK").length;

  const filtered = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesSearch =
        !search ||
        facility.name.toLowerCase().includes(search.toLowerCase()) ||
        facility.address.toLowerCase().includes(search.toLowerCase()) ||
        facility.region.name.toLowerCase().includes(search.toLowerCase()) ||
        facility.region.city.toLowerCase().includes(search.toLowerCase());
      const matchesType = !filterType || facility.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [search, filterType, facilities]);

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Fasilitas Kesehatan
          </h1>
          <p className="mt-2 text-muted-foreground">
            Daftar fasilitas kesehatan di Kalimantan Timur.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Puskesmas, rumah sakit, dan klinik
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
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
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
                  placeholder="Cari nama, alamat, atau wilayah..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary dark:bg-black"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["", "PUSKESMAS", "RUMAH_SAKIT", "KLINIK"] as const).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                        filterType === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {type === "" ? "Semua" : facilityTypeLabels[type]}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Total Fasilitas</p>
                <p className="mt-1 text-2xl font-bold">{total}</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Puskesmas</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: facilityTypeColors.PUSKESMAS }}>
                  {countPuskesmas}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Rumah Sakit</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: facilityTypeColors.RUMAH_SAKIT }}>
                  {countRumahSakit}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 dark:bg-black">
                <p className="text-sm text-muted-foreground">Klinik</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: facilityTypeColors.KLINIK }}>
                  {countKlinik}
                </p>
              </div>
            </div>

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-border bg-white p-12 text-center dark:bg-black">
                <p className="font-medium">Fasilitas tidak ditemukan</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Coba ubah kata pencarian atau filter yang digunakan.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {filtered.map((facility) => {
                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;

                return (
                  <div
                    key={facility.id}
                    className="rounded-2xl border border-border bg-white p-5 dark:bg-black"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${facilityTypeColors[facility.type]}15` }}
                        >
                          <Building2
                            className="size-5"
                            style={{ color: facilityTypeColors[facility.type] }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{facility.name}</h3>
                            <span
                              className="inline-flex shrink-0 items-center rounded px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: `${facilityTypeColors[facility.type]}15`,
                                color: facilityTypeColors[facility.type],
                              }}
                            >
                              {facilityTypeLabels[facility.type]}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {facility.address}
                          </p>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {facility.region.name}, {facility.region.city}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {facility.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="size-3.5" />
                                {facility.phone}
                              </span>
                            )}
                            {facility.openingHours && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {facility.openingHours}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        <MapPin className="size-4" />
                        Rute
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
