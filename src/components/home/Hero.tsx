"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

export function Hero({ onLocate }: { onLocate?: (lat: number, lng: number) => void }) {
    const [locating, setLocating] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDetect = () => {
        if (!navigator.geolocation) {
            setError("Browser tidak mendukung deteksi lokasi.");
            return;
        }
        setLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                setLocating(false);
                onLocate?.(latitude, longitude);
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
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-6 pt-10  text-center">
            <div className="max-w-3xl">
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
                    Kenali kondisi wilayah.
                    <br />
                    Jaga kesehatan lebih awal.
                </h1>

                <p className="mb-8 text-base text-muted-foreground md:text-lg">
                    Pantau kondisi layanan air dan indikator kesehatan masyarakat di
                    berbagai wilayah Kalimantan Timur dalam satu tempat.
                </p>

                <button
                    onClick={handleDetect}
                    disabled={locating}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                    <MapPin className="size-4" />
                    {locating ? "Mendeteksi..." : "Deteksi Lokasi Saya"}
                </button>

                {coords && (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Koordinat: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                    </p>
                )}

                {error && (
                    <p className="mt-4 max-w-md mx-auto text-sm text-muted-foreground">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}