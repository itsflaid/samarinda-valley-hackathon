"use client";

import { useState } from "react";
import { Hero } from "@/components/home/Hero";
import { RegionMap } from "@/components/home/Map";
import { CardInfo } from "@/components/home/CardInfo";

export function HomeContent() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | undefined>();

  return (
    <div>
      <Hero onLocate={(lat, lng) => setUserCoords({ lat, lng })} />
      <RegionMap userCoords={userCoords} />
      <CardInfo userCoords={userCoords} />
    </div>
  );
}