"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DummyRegion } from "@/lib/mock-data";
import { RegionMap } from "@/components/home/Map";
import { CardInfo } from "@/components/home/CardInfo";

export default function WilayahPage() {
  const { id } = useParams();
  const [region, setRegion] = useState<DummyRegion | null>(null);

  useEffect(() => {
    const findRegion = () => {
      const regions = require("@/lib/mock-data").dummyRegions;
      const found = regions.find((r: DummyRegion) => r.id === id);
      if (found) setRegion(found);
    };
    findRegion();
  }, [id]);

  if (!region) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Wilayah tidak ditemukan</h2>
        <p className="text-muted-foreground">Region ID: {id}</p>
      </div>
    );
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <RegionMap
              userCoords={{ lat: region.latitude, lng: region.longitude }}
            />
          </div>
          <div>
            <CardInfo region={region} onDetail={() => {}} />
          </div>
        </div>
      </div>
    </main>
  );
}
