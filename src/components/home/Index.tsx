"use client";

import { useState } from "react";

import { Hero } from "@/components/home/Hero";
import { RegionMap } from "@/components/home/Map";
import { CardInfo } from "@/components/home/CardInfo";

import type { DummyRegion } from "@/lib/mock-data";

export function HomeContent() {
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  }>();

  const [userRegion, setUserRegion] = useState<
    DummyRegion | undefined
  >();

  return (
    <div>
      <Hero
        onLocate={(region, lat, lng) => {
          setUserCoords({
            lat,
            lng,
          });

          setUserRegion(region);
        }}
      />

      <RegionMap
        userCoords={userCoords}
        userRegion={userRegion}
      />

      <CardInfo
        userCoords={userCoords}
        userRegion={userRegion}
      />
    </div>
  );
}

