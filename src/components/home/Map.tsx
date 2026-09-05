"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Maximize2, X } from "lucide-react";
import { dummyRegions, statusColors, type DummyRegion } from "@/lib/mock-data";
import { findNearestRegion } from "@/lib/geo";

function createIcon(color: string) {
    return L.divIcon({
        className: "",
        html: `<svg width="16" height="16" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L10 8L16 8L12 2ZM12 10L8.5 14L15.5 14L12 10ZM12 16L8.5 20L15.5 20L12 16Z"/></svg>`,
        iconSize: [16, 16],
        iconAnchor: [8, 16],
        popupAnchor: [0, -12],
    });
}

const markerIcons: Record<string, L.DivIcon> = {
    AMAN: createIcon(statusColors.AMAN),
    WASPADA: createIcon(statusColors.WASPADA),
    SIAGA: createIcon(statusColors.SIAGA),
    "N/A": createIcon(statusColors["N/A"]),
};

const userIcon = L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 0 2px rgba(59,130,246,0.5);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const USER_LOCATION_ZOOM = 13;

function PopupContent({ region }: { region: DummyRegion }) {
    return (
        <div className="min-w-40 text-sm">
            <p className="font-semibold">{region.name}</p>
            {region.status === "N/A" ? (
                <p className="mt-1 text-xs text-muted-foreground">DATA BELUM TERSEDIA</p>
            ) : (
                <>
                    {/* FIX: sebelumnya warna teks di-hardcode "#ef4444" (merah) untuk
                        semua status, jadi wilayah AMAN pun teks statusnya ikut merah
                        walau ikon titiknya sudah benar. Sekarang ikut statusColors. */}
                    <p className="mt-1 text-xs font-medium" style={{ color: statusColors[region.status] }}>
                        ● {region.status}
                    </p>
                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-4">
                            <span>Layanan air</span>
                            <span>{region.ipaStatus === "AKTIF" ? "Aktif" : "Mati"}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>Laporan 24 jam</span>
                            <span>{region.symptomReports ?? "-"}</span>
                        </div>
                    </div>
                </>
            )}
            <p className="mt-2">
                <a href={`/wilayah/${region.id}`} className="text-xs font-medium text-primary hover:underline">
                    Lihat wilayah →
                </a>
            </p>
        </div>
    );
}

function Legend() {
    const items = [
        { label: "Aman", color: statusColors.AMAN },
        { label: "Waspada", color: statusColors.WASPADA },
        { label: "Siaga", color: statusColors.SIAGA },
        { label: "Data belum tersedia", color: statusColors["N/A"] },
    ];
    return (
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {items.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.label}
                </span>
            ))}
        </div>
    );
}

export function RegionMap({ userCoords }: { userCoords?: { lat: number; lng: number } }) {
    const [expanded, setExpanded] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const center: [number, number] = [-0.3, 117.0];

    useEffect(() => {
        if (!userCoords || !mapRef.current) return;

        mapRef.current.flyTo([userCoords.lat, userCoords.lng], USER_LOCATION_ZOOM, {
            duration: 1.5,
        });

        // FIX: sebelumnya popup titik lokasi user cuma teks statis "Lokasi Anda"
        // tanpa data apa pun. Sekarang dicocokkan ke wilayah mock terdekat
        // (fungsi yang sama dipakai CardInfo), jadi popup-nya nampilin data
        // yang benar-benar sesuai lokasi yang terdeteksi.
        const matchedRegion = findNearestRegion(userCoords.lat, userCoords.lng);
        const popupHtml = matchedRegion
            ? `<div style="font-size:13px"><strong>${matchedRegion.name}</strong><br/><span style="color:${statusColors[matchedRegion.status]}">${matchedRegion.status}</span></div>`
            : `<div style="font-size:13px">Lokasi Anda<br/><span style="color:#6b7280">Wilayah belum tercakup dalam data</span></div>`;

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
            userMarkerRef.current.setPopupContent(popupHtml);
        } else {
            userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
                .bindPopup(popupHtml)
                .addTo(mapRef.current);
        }

        userMarkerRef.current.openPopup();
    }, [userCoords]);

    useEffect(() => {
        const id = requestAnimationFrame(() => mapRef.current?.invalidateSize());
        return () => cancelAnimationFrame(id);
    }, [expanded]);

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <h2 className="text-xl font-semibold">Pantau Kondisi Wilayah Kaltim</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Lihat tingkat kewaspadaan berbagai wilayah Kalimantan Timur.
                </p>

                <div
                    className={
                        expanded
                            ? "fixed inset-0 z-50 bg-background"
                            : "relative mt-6 h-87.5 overflow-hidden rounded-lg border border-border md:h-105"
                    }
                >
                    {expanded ? (
                        <button
                            onClick={() => setExpanded(false)}
                            aria-label="Tutup peta"
                            className="absolute right-4 top-4 z-60 rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-100"
                        >
                            <X className="size-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setExpanded(true)}
                            aria-label="Perbesar peta"
                            className="absolute right-3 top-3 z-40 rounded-full bg-white p-2 shadow-sm transition-colors hover:bg-gray-100"
                        >
                            <Maximize2 className="size-4" />
                        </button>
                    )}

                    <MapContainer
                        center={center}
                        zoom={7}
                        className="h-full w-full"
                        scrollWheelZoom={expanded}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {dummyRegions.map((region) => (
                            <Marker
                                key={region.id}
                                position={[region.latitude, region.longitude]}
                                icon={markerIcons[region.status]}
                            >
                                <Popup>
                                    <PopupContent region={region} />
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <Legend />
            </div>
        </section>
    );
}