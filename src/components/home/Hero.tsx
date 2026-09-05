"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

import type { RegionData } from "@/types/region";

interface HeroProps {
    onLocate?: (
        region: RegionData,
        lat: number,
        lng: number
    ) => void;
}

export function Hero({ onLocate }: HeroProps) {
    const [locating, setLocating] = useState(false);
    const [coords, setCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [region, setRegion] = useState<RegionData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const normalize = (value: string | null | undefined) =>
        value
            ?.toLowerCase()
            .replace(/^kecamatan\s+/i, "")
            .trim();

    const handleDetect = () => {
        if (!navigator.geolocation) {
            setError("Browser tidak mendukung deteksi lokasi.");
            return;
        }

        setLocating(true);
        setError(null);
        setRegion(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                setCoords({
                    lat: latitude,
                    lng: longitude,
                });

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );

                    if (!response.ok) {
                        throw new Error("Gagal mendapatkan alamat.");
                    }

                    const data = await response.json();

                    const district =
                        data.address?.city_district ??
                        data.address?.district ??
                        data.address?.suburb ??
                        null;

                    const city =
                        data.address?.city ??
                        data.address?.town ??
                        null;

                    const regionsRes = await fetch("/api/regions");
                    const regions: RegionData[] = await regionsRes.json();

                    const matchedRegion = regions.find(
                        (item) =>
                            normalize(item.name) === normalize(district) &&
                            normalize(item.city) === normalize(city)
                    );

                    if (!matchedRegion) {
                        setError(
                            `Wilayah ${district ?? "Anda"} belum memiliki data.`
                        );
                        return;
                    }

                    setRegion(matchedRegion);

                    onLocate?.(
                        matchedRegion,
                        latitude,
                        longitude
                    );
                } catch (err) {
                    console.error(err);

                    setError(
                        "Gagal menentukan wilayah Anda. Silakan coba lagi."
                    );
                } finally {
                    setLocating(false);
                }
            },
            () => {
                setError(
                    "Lokasi tidak dapat dideteksi. Anda tetap dapat menjelajahi wilayah melalui peta."
                );

                setLocating(false);
            }
        );
    };

    return (
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 pt-10 text-center">
            <div className="max-w-3xl">
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
                    Deteksi Dini Risiko Kesehatan Akibat Kondisi Air Kaltim
                </h1>

                <p className="mb-8 text-base text-muted-foreground md:text-lg">
                    Pantau kondisi layanan air dan indikator kesehatan masyarakat
                    di berbagai wilayah Kalimantan Timur dalam satu tempat.
                </p>

                <button
                    onClick={handleDetect}
                    disabled={locating}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    <MapPin className="size-4" />

                    {locating
                        ? "Mendeteksi..."
                        : "Deteksi Lokasi Saya"}
                </button>

                {coords && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Koordinat: {coords.lat.toFixed(4)},{" "}
                        {coords.lng.toFixed(4)}
                    </p>
                )}

                {region && (
                    <div className="mt-4">
                        <p className="text-sm font-medium">
                            Wilayah Anda: {region.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {region.city}, {region.province}
                        </p>
                    </div>
                )}

                {error && (
                    <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}

