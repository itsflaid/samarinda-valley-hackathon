"use client";

import { useState } from "react";

import { Hero } from "@/components/home/Hero";
import { RegionMap } from "@/components/home/Map";
import { CardInfo } from "@/components/home/CardInfo";

import type { DummyRegion } from "@/lib/mock-data";

const LOCATION_STORAGE_KEY = "user-location";

interface UserLocation {
  coords: {
    lat: number;
    lng: number;
  };
  region: DummyRegion;
}

function getStoredLocation(): UserLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(
    LOCATION_STORAGE_KEY
  );

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored);

    if (
      parsed?.coords &&
      typeof parsed.coords.lat === "number" &&
      typeof parsed.coords.lng === "number" &&
      parsed?.region
    ) {
      return parsed;
    }

    sessionStorage.removeItem(LOCATION_STORAGE_KEY);

    return null;
  } catch (error) {
    console.error(
      "Gagal membaca lokasi dari sessionStorage:",
      error
    );

    sessionStorage.removeItem(LOCATION_STORAGE_KEY);

    return null;
  }
}

export function HomeContent() {
  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(() => getStoredLocation());

  return (
    <div>
      <Hero
        onLocate={(region, lat, lng) => {
          const location: UserLocation = {
            coords: {
              lat,
              lng,
            },
            region,
          };

          setUserLocation(location);

          sessionStorage.setItem(
            LOCATION_STORAGE_KEY,
            JSON.stringify(location)
          );
        }}
      />

      <RegionMap
        userCoords={userLocation?.coords}
        userRegion={userLocation?.region}
      />

      <CardInfo
        userCoords={userLocation?.coords}
        userRegion={userLocation?.region}
      />
    </div>
  );
}

