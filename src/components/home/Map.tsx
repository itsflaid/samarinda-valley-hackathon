"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    GeoJSON,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import {
    Maximize2,
    Minimize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Feature, FeatureCollection } from "geojson";

import { statusColors, type RegionData, type RegionDetail, type RegionStatus } from "@/types/region";

import "leaflet/dist/leaflet.css";

interface RegionMapProps {
    userCoords?: {
        lat: number;
        lng: number;
    };

    userRegion?: RegionData | RegionDetail;
    selectedRegion?: RegionData | RegionDetail;
}

const defaultCenter: [number, number] = [
    -0.5021,
    117.1537,
];

const defaultZoom = 11;

const userIcon = L.divIcon({
    className: "user-location-marker",
    html: `
        <div
            style="
                width: 20px;
                height: 20px;
                background: #2563eb;
                border: 3px solid white;
                border-radius: 9999px;
                box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2);
            "
        ></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

function normalize(str: string): string {
    return str
        .toUpperCase()
        .trim()
        .replace(/^KOTA\s+/i, "")
        .replace(/^KAB\.\s*/i, "")
        .replace(/^KAB\s+/i, "");
}

const defaultPolygonStyle = {
    fillOpacity: 0,
    color: "#334155",
    weight: 1.5,
    opacity: 0.7,
};

function getActiveStyle(status: RegionStatus) {
    return {
        fillColor: statusColors[status],
        fillOpacity: 0.30,
        color: "#334155",
        weight: 2.5,
        opacity: 1,
    };
}

function getHoverStyle(status: RegionStatus) {
    return {
        fillColor: statusColors[status],
        fillOpacity: 0.30,
        color: "#334155",
        weight: 3.5,
        opacity: 1,
    };
}

function MapController({
    userCoords,
    selectedCoords,
}: {
    userCoords?: {
        lat: number;
        lng: number;
    };
    selectedCoords?: {
        lat: number;
        lng: number;
    };
}) {
    const map = useMap();

    useEffect(() => {
        const target = userCoords ?? selectedCoords;
        if (!target) return;

        map.flyTo(
            [target.lat, target.lng],
            13,
            {
                duration: 1.2,
            }
        );
    }, [map, userCoords, selectedCoords]);

    return null;
}

function RegionPopup({
    region,
}: {
    region: RegionData;
}) {
    return (
        <div className="min-w-45">
            <div className="mb-2">
                <p className="font-semibold">
                    {region.name}
                </p>

                <p className="text-xs text-muted-foreground">
                    {region.city}
                </p>
            </div>

            <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-4">
                    <span>Status</span>

                    <span
                        className="font-semibold"
                        style={{
                            color: statusColors[region.status],
                        }}
                    >
                        {region.status}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <span>IPA</span>

                    <span className="font-medium">
                        {region.ipaStatus ?? "N/A"}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <span>Laporan gejala</span>

                    <span className="font-medium">
                        {region.symptomReports ?? "N/A"}
                    </span>
                </div>
            </div>
        </div>
    );
}

function UserLocationMarker({
    coords,
    userRegion,
}: {
    coords: {
        lat: number;
        lng: number;
    };

    userRegion?: RegionData | RegionDetail;
}) {
    const popupContent = userRegion ? (
        <div className="min-w-37.5">
            <p className="font-semibold">
                Lokasi Anda
            </p>

            <p className="mt-1 text-xs">
                {userRegion.name}, {userRegion.city}
            </p>

            <p
                className="mt-1 text-xs font-semibold"
                style={{
                    color: statusColors[userRegion.status],
                }}
            >
                Status: {userRegion.status}
            </p>
        </div>
    ) : (
        <div className="min-w-37.5">
            <p className="font-semibold">
                Lokasi Anda
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
                Wilayah belum tercakup dalam data
                pemantauan.
            </p>
        </div>
    );

    return (
        <Marker
            position={[
                coords.lat,
                coords.lng,
            ]}
            icon={userIcon}
        >
            <Popup>
                {popupContent}
            </Popup>
        </Marker>
    );
}

export function RegionMap({
    userCoords,
    userRegion,
    selectedRegion,
}: RegionMapProps) {
    const router = useRouter();
    const [fullscreen, setFullscreen] = useState(false);
    const [regions, setRegions] = useState<RegionData[]>([]);
    const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
    const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/regions")
            .then((res) => res.json())
            .then((data: RegionData[]) => setRegions(data))
            .catch(() => {});
    }, []);

    useEffect(() => {
        fetch("/geojson/kecamatan-kaltim.json")
            .then((res) => res.json())
            .then((data: FeatureCollection) => setGeojson(data))
            .catch(() => {});
    }, []);

    const featureByRegionId = useMemo(() => {
        if (!geojson || !regions.length) return new Map<string, Feature>();
        const fc = geojson as FeatureCollection;
        if (!fc.features) return new Map<string, Feature>();

        const map = new Map<string, Feature>();
        for (const feature of fc.features) {
            const kecName = feature.properties?.NAMA_KEC;
            const kabName = feature.properties?.NAMA_KAB;
            if (!kecName || !kabName) continue;

            const matched = regions.find(
                (r) =>
                    normalize(r.name) === normalize(kecName) &&
                    normalize(r.city) === normalize(kabName)
            );
            if (matched) map.set(matched.id, feature);
        }
        return map;
    }, [geojson, regions]);

    const regionIdByFeatureKey = useMemo(() => {
        const map = new Map<string, string>();
        for (const [regionId, feature] of featureByRegionId) {
            const key = featureKey(feature);
            map.set(key, regionId);
        }
        return map;
    }, [featureByRegionId]);

    const activeRegionId = selectedRegion?.id ?? userRegion?.id ?? null;

    const handleMarkerMouseOver = useCallback((regionId: string) => {
        setHoveredRegionId(regionId);
    }, []);

    const handleMarkerMouseOut = useCallback(() => {
        setHoveredRegionId(null);
    }, []);

    const handlePolygonMouseOver = useCallback((regionId: string) => {
        setHoveredRegionId(regionId);
    }, []);

    const handlePolygonMouseOut = useCallback(() => {
        setHoveredRegionId(null);
    }, []);

    const handlePolygonClick = useCallback((regionId: string) => {
        router.push(`/wilayah/${regionId}`);
    }, [router]);

    const geojsonStyle = useCallback(
        (feature?: Feature) => {
            if (!feature) return defaultPolygonStyle;

            const key = featureKey(feature);
            const regionId = regionIdByFeatureKey.get(key);
            if (!regionId) return defaultPolygonStyle;

            const isHovered = regionId === hoveredRegionId;
            const isActive = regionId === activeRegionId;

            if (isHovered && !isActive) {
                const region = regions.find((r) => r.id === regionId);
                return region ? getHoverStyle(region.status) : defaultPolygonStyle;
            }

            if (isActive) {
                const region = regions.find((r) => r.id === regionId);
                return region ? getActiveStyle(region.status) : defaultPolygonStyle;
            }

            return defaultPolygonStyle;
        },
        [hoveredRegionId, activeRegionId, regions, regionIdByFeatureKey]
    );

    const onEachFeature = useCallback(
        (feature: Feature, layer: L.Layer) => {
            const key = featureKey(feature);
            const regionId = regionIdByFeatureKey.get(key);
            if (!regionId) return;

            layer.on({
                mouseover: () => handlePolygonMouseOver(regionId),
                mouseout: () => handlePolygonMouseOut(),
                click: () => handlePolygonClick(regionId),
            });
        },
        [regionIdByFeatureKey, handlePolygonMouseOver, handlePolygonMouseOut, handlePolygonClick]
    );

    return (
        <section className="px-6 py-10">
            <div
                className={
                    fullscreen
                        ? "fixed inset-0 z-50 bg-background p-4"
                        : "mx-auto max-w-6xl"
                }
            >
                <div className="relative h-105 overflow-hidden rounded-2xl border border-border bg-muted shadow-sm md:h-130">
                    <MapContainer
                        center={defaultCenter}
                        zoom={defaultZoom}
                        scrollWheelZoom
                        className="z-0 h-full w-full"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapController
                            userCoords={userCoords}
                            selectedCoords={
                                selectedRegion
                                    ? { lat: selectedRegion.latitude, lng: selectedRegion.longitude }
                                    : undefined
                            }
                        />

                        {geojson && regions.length > 0 && (
                            <GeoJSON
                                key="boundaries"
                                data={geojson}
                                style={geojsonStyle}
                                onEachFeature={onEachFeature}
                            />
                        )}

                        {regions.map(
                            (region) => (
                                <Marker
                                    key={region.id}
                                    position={[
                                        region.latitude,
                                        region.longitude,
                                    ]}
                                    icon={L.divIcon({
                                        className:
                                            "region-marker",
                                        html: `
                                            <div
                                                style="
                                                    width: 16px;
                                                    height: 16px;
                                                    background: ${statusColors[region.status]};
                                                    border: 2px solid white;
                                                    border-radius: 9999px;
                                                    box-shadow: 0 1px 5px rgba(0,0,0,.3);
                                                "
                                            ></div>
                                        `,
                                        iconSize: [
                                            16,
                                            16,
                                        ],
                                        iconAnchor: [
                                            8,
                                            8,
                                        ],
                                    })}
                                    eventHandlers={{
                                        mouseover: () => handleMarkerMouseOver(region.id),
                                        mouseout: () => handleMarkerMouseOut(),
                                    }}
                                >
                                    <Popup>
                                        <RegionPopup
                                            region={region}
                                        />
                                    </Popup>
                                </Marker>
                            )
                        )}

                        {userCoords && (
                            <UserLocationMarker
                                coords={userCoords}
                                userRegion={
                                    userRegion
                                }
                            />
                        )}
                    </MapContainer>

                    <button
                        type="button"
                        onClick={() =>
                            setFullscreen(
                                (value) =>
                                    !value
                            )
                        }
                        className="absolute right-4 top-4 z-1000 inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background/95 shadow-sm backdrop-blur transition-colors hover:bg-muted"
                        aria-label={
                            fullscreen
                                ? "Keluar fullscreen"
                                : "Perbesar peta"
                        }
                    >
                        {fullscreen ? (
                            <Minimize2 className="size-4" />
                        ) : (
                            <Maximize2 className="size-4" />
                        )}
                    </button>

                    <div className="absolute bottom-4 left-4 z-1000 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur">
                        <p className="mb-2 text-xs font-semibold">
                            Status Wilayah
                        </p>

                        <div className="space-y-1.5">
                            {(
                                [
                                    "AMAN",
                                    "WASPADA",
                                    "SIAGA",
                                ] as const
                            ).map(
                                (status) => (
                                    <div
                                        key={
                                            status
                                        }
                                        className="flex items-center gap-2 text-xs"
                                    >
                                        <span
                                            className="size-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    statusColors[
                                                        status
                                                    ],
                                            }}
                                        />

                                        <span>
                                            {
                                                status
                                            }
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function featureKey(feature: Feature): string {
    const kec = feature.properties?.NAMA_KEC ?? "";
    const kab = feature.properties?.NAMA_KAB ?? "";
    return `${normalize(kec)}::${normalize(kab)}`;
}
