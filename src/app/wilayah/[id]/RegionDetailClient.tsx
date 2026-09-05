"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

import type { RegionDetail } from "@/types/region";
import { CardInfo } from "@/components/home/CardInfo";

const RegionMap = dynamic(
  () =>
    import("@/components/home/Map").then(
      (mod) => mod.RegionMap
    ),
  { ssr: false }
);

export function RegionDetailClient({
  regionDetail,
}: {
  regionDetail: RegionDetail;
}) {
  const router = useRouter();

  const regionCoords = {
    lat: regionDetail.latitude,
    lng: regionDetail.longitude,
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
            {regionDetail.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {regionDetail.city}, {regionDetail.province}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="min-w-0">
            <RegionMap
              userCoords={regionCoords}
              userRegion={regionDetail}
            />
          </div>

          <div className="min-w-0">
            <CardInfo
              userCoords={regionCoords}
              userRegion={regionDetail}
              regionDetail={regionDetail}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
