"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useSyncExternalStore,
} from "react";

import { Hero } from "@/components/home/Hero";
import { CardInfo } from "@/components/home/CardInfo";

import type { DummyRegion } from "@/lib/mock-data";

const RegionMap = dynamic(
  () =>
    import("@/components/home/Map").then(
      (mod) => mod.RegionMap
    ),
  {
    ssr: false,
  }
);

const LOCATION_STORAGE_KEY = "user-location";

interface UserLocation {
  coords: {
    lat: number;
    lng: number;
  };
  region: DummyRegion;
}


function subscribe(
  callback: () => void
) {
  window.addEventListener(
    "user-location-change",
    callback
  );

  return () => {
    window.removeEventListener(
      "user-location-change",
      callback
    );
  };
}


function getServerSnapshot() {
  return null;
}

function getClientSnapshot() {
  return sessionStorage.getItem(
    LOCATION_STORAGE_KEY
  );
}

function parseLocation(
  stored: string | null
): UserLocation | null {
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
      return parsed as UserLocation;
    }

    sessionStorage.removeItem(
      LOCATION_STORAGE_KEY
    );

    return null;
  } catch (error) {
    console.error(
      "Gagal membaca lokasi dari sessionStorage:",
      error
    );

    sessionStorage.removeItem(
      LOCATION_STORAGE_KEY
    );

    return null;
  }
}

export function HomeContent() {
  const storedLocation =
    useSyncExternalStore(
      subscribe,
      getClientSnapshot,
      getServerSnapshot
    );

  const userLocation =
    parseLocation(storedLocation);

  const saveLocation = useCallback(
    (
      region: DummyRegion,
      lat: number,
      lng: number
    ) => {
      const location: UserLocation = {
        coords: {
          lat,
          lng,
        },
        region,
      };

      sessionStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
      );

      window.dispatchEvent(
        new Event("user-location-change")
      );
    },
    []
  );

  return (
    <div>
      <Hero onLocate={saveLocation} />

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