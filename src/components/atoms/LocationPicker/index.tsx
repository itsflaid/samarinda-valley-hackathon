"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
};

const defaultPosition: [number, number] = [
  -0.5021,
  117.1536,
];

function MapClickHandler({
  onChange,
}: {
  onChange: (
    latitude: number,
    longitude: number
  ) => void;
}) {
  useMapEvents({
    click(event) {
      onChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (
      latitude !== null &&
      longitude !== null
    ) {
      map.setView(
        [latitude, longitude],
        map.getZoom()
      );
    }
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const position: [number, number] =
    latitude !== null &&
    longitude !== null
      ? [latitude, longitude]
      : defaultPosition;

  const markerIcon = L.icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          className="h-[400px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            onChange={onChange}
          />

          <MapCenter
            latitude={latitude}
            longitude={longitude}
          />

          {latitude !== null &&
            longitude !== null && (
              <Marker
                position={[
                  latitude,
                  longitude,
                ]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker =
                      event.target;

                    const location =
                      marker.getLatLng();

                    onChange(
                      location.lat,
                      location.lng
                    );
                  },
                }}
              />
            )}
        </MapContainer>
      </div>

      <p className="text-sm text-muted-foreground">
        Klik pada peta untuk menentukan lokasi
        fasilitas, atau geser pin untuk
        menyesuaikan posisi.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Latitude
          </label>

          <input
            type="text"
            value={latitude ?? ""}
            readOnly
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm"
            placeholder="Latitude otomatis"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Longitude
          </label>

          <input
            type="text"
            value={longitude ?? ""}
            readOnly
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm"
            placeholder="Longitude otomatis"
          />
        </div>
      </div>
    </div>
  );
}