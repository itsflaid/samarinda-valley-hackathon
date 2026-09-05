"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";

import type { RegionDetail } from "@/types/region";
import type { FacilityData } from "@/types/facility";
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
    facilities,
}: {
    regionDetail: RegionDetail;
    facilities: FacilityData[];
}) {
    const router = useRouter();

    return (
        <main className="py-8">
            <div className="mx-auto max-w-6xl px-6">



                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">

                    <div>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </button>


                        <div className="min-w-0">
                            <RegionMap
                                selectedRegion={regionDetail}
                                facilities={facilities}
                            />
                        </div>
                    </div>

                    <div className="min-w-0">
                        <CardInfo
                            userCoords={{
                                lat: regionDetail.latitude,
                                lng: regionDetail.longitude,
                            }}
                            userRegion={regionDetail}
                            regionDetail={regionDetail}
                            facilities={facilities}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
