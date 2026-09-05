"use client";

import { MapPin, CheckCircle, AlertCircle, AlertOctagon } from "lucide-react";
import { findNearestRegion } from "@/lib/geo";
import { statusColors, type DummyRegion } from "@/lib/mock-data";

interface CardInfoProps {
  userCoords?: { lat: number; lng: number };
  onDetail?: () => void;
}

const riskIcons: Record<DummyRegion["status"], typeof CheckCircle> = {
  AMAN: CheckCircle,
  WASPADA: AlertCircle,
  SIAGA: AlertOctagon,
  "N/A": AlertCircle,
};

const riskDescs: Record<DummyRegion["status"], string> = {
  AMAN: "Risiko terendah",
  WASPADA: "Risiko sanitasi air perlu diperhatikan",
  SIAGA: "Risiko tinggi, tindakan segera",
  "N/A": "Data belum tersedia",
};

export function CardInfo({ userCoords, onDetail }: CardInfoProps) {
  // State 1: pengguna belum klik "Deteksi Lokasi Saya" di Hero.
  if (!userCoords) {
    return (
      <div className="py-12 px-6 max-w-3xl mx-auto text-center">
        <div className="border rounded-2xl border-border bg-white dark:bg-black p-8 shadow-sm">
          <MapPin className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Klik &quot;Deteksi Lokasi Saya&quot; di atas untuk melihat kondisi wilayah Anda.
          </p>
        </div>
      </div>
    );
  }

  const region = findNearestRegion(userCoords.lat, userCoords.lng);

  // State 2: lokasi terdeteksi, tapi tidak ada wilayah mock yang cukup dekat.
  if (!region) {
    return (
      <div className="py-12 px-6 max-w-3xl mx-auto text-center">
        <div className="border rounded-2xl border-border bg-white dark:bg-black p-8 shadow-sm">
          <MapPin className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Wilayah Anda ({userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}) belum
            tercakup dalam data pemantauan.
          </p>
        </div>
      </div>
    );
  }

  // State 3: ketemu wilayah mock yang cocok dengan lokasi pengguna.
  const RiskIcon = riskIcons[region.status];

  return (
    <div className="py-12 px-6 max-w-3xl mx-auto">
      <div className="border rounded-2xl border-border bg-white dark:bg-black p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">Wilayah Anda</span>
          </div>

          <button
            onClick={onDetail}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lihat Detail
          </button>
        </div>

        <h2 className="text-xl font-bold text-primary mb-1">{region.name}</h2>
        <p className="text-base text-muted-foreground">{region.city}</p>

        <div className="mt-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-sm font-medium"
            style={{
              backgroundColor: statusColors[region.status],
              color: region.status === "SIAGA" ? "#fff" : "#111827",
            }}
          >
            <RiskIcon className="size-3.5" />
            {region.status}
          </span>
          <span className="text-sm text-muted-foreground">{riskDescs[region.status]}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Status IPA</p>
            <p className="mt-1">{region.ipaStatus === "MATI" ? "MATI" : "AKTIF"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Laporan 24 Jam</p>
            <p className="mt-1">
              {region.symptomReports != null ? region.symptomReports : "Belum tersedia"} laporan
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {region.ipaCondition ? "Gangguan operasional: " + region.ipaCondition : "Operasional normal"}
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          Diperbarui {region.lastUpdated || "beberapa saat"} lalu
        </p>

        <div className="mt-6">
          <button
            onClick={onDetail}
            className="w-full rounded-lg bg-primary px-4 py-2 text-lg font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Lihat Detail Wilayah
          </button>
        </div>
      </div>
    </div>
  );
}