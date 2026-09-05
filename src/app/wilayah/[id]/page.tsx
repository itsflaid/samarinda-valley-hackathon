"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { dummyRegions } from "@/lib/mock-data";
import { RegionMap } from "@/components/home/Map";
import { CardInfo } from "@/components/home/CardInfo";

export default function WilayahPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const region = dummyRegions.find(
    (item) => item.id === params.id
  );

  if (!region) {
    return (
      <main className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold">
            Wilayah tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Wilayah dengan ID {params.id} tidak tersedia.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </button>
        </div>
      </main>
    );
  }

  const regionCoords = {
    lat: region.latitude,
    lng: region.longitude,
  };

  return (
    <main className="py-8">
      <div className="mx-auto max-w-6xl px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Kembali
        </button>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">
            Detail Wilayah
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            {region.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {region.city}, {region.province}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="min-w-0">
            <RegionMap
              userCoords={regionCoords}
              userRegion={region}
            />
          </div>

          <div className="min-w-0">
            <CardInfo
              userCoords={regionCoords}
              userRegion={region}
            />
          </div>
        </div>
      </div>
    </main>
  );
}