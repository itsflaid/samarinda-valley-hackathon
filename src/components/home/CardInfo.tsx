"use client";

import { useState } from "react";

import {
  Activity,
  Droplets,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";

import {
  statusColors,
  type DummyRegion,
} from "@/lib/mock-data";
import { HealthGuideModal } from "./HealthGuideModal";

interface CardInfoProps {
  userCoords?: {
    lat: number;
    lng: number;
  };

  userRegion?: DummyRegion;
}

export function CardInfo({
  userCoords,
  userRegion,
}: CardInfoProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  if (!userCoords) {
    return (
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
            <MapPin className="mx-auto size-6 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              Deteksi lokasi Anda
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Gunakan tombol di atas untuk melihat
              kondisi wilayah Anda.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!userRegion) {
    return (
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto size-6 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              Wilayah belum tersedia
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Wilayah Anda belum tercakup dalam data
              pemantauan.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const region = userRegion;

  return (
    <section className="px-6 pb-12">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <div className="border-b border-border p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  Wilayah Anda
                </div>

                <h2 className="text-2xl font-bold">
                  {region.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {region.city}, {region.province}
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold"
                style={{
                  color: statusColors[region.status],
                  backgroundColor: `${statusColors[region.status]}15`,
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor:
                      statusColors[region.status],
                  }}
                />

                {region.status}
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2">
            <div className="bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Droplets className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Status IPA
                  </p>

                  <p className="font-semibold">
                    {region.ipaStatus ?? "N/A"}
                  </p>
                </div>
              </div>

              {region.ipaCondition && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {region.ipaCondition}
                </p>
              )}
            </div>

            <div className="bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Laporan Gejala
                  </p>

                  <p className="font-semibold">
                    {region.symptomReports ?? "N/A"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">
                Laporan masyarakat di wilayah ini
              </p>
            </div>

            <div className="bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Activity className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Kondisi Wilayah
                  </p>

                  <p
                    className="font-semibold"
                    style={{
                      color:
                        statusColors[region.status],
                    }}
                  >
                    {region.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Clock className="size-5 text-primary" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Pembaruan Terakhir
                  </p>

                  <p className="font-semibold">
                    {region.lastUpdated ?? "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row">
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Lihat Detail Wilayah
            </button>
          </div>
        </div>
      </div>

      <HealthGuideModal
        region={region}
        open={guideOpen}
        onOpenChange={setGuideOpen}
      />
    </section>
  );
}