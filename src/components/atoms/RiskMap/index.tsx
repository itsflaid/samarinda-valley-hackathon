"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type RiskLevel = "RENDAH" | "SEDANG" | "TINGGI";

type RiskReport = {
  id: string;
  reporterName: string;

  diarrhea: boolean;
  vomiting: boolean;
  fever: boolean;
  dehydration: boolean;

  latitude: number;
  longitude: number;

  reportedAt: string;

  region: {
    name: string;
    city: string;
  };

  assessment: {
    id: string;
    riskLevel: RiskLevel;
  } | null;
};

type RiskMapProps = {
  reports: RiskReport[];
};

const defaultPosition: [number, number] = [
  -0.5021,
  117.1536,
];

function createMarkerIcon(riskLevel: RiskLevel | null) {
  let color = "#6b7280";

  if (riskLevel === "TINGGI") {
    color = "#dc2626";
  }

  if (riskLevel === "SEDANG") {
    color = "#f59e0b";
  }

  if (riskLevel === "RENDAH") {
    color = "#16a34a";
  }

  return L.divIcon({
    className: "",
    html: `
      <div
        style="
          width: 18px;
          height: 18px;
          background: ${color};
          border: 3px solid white;
          border-radius: 9999px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "
      ></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export default function RiskMap({
  reports,
}: RiskMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-xl border bg-muted">
        Memuat peta...
      </div>
    );
  }

  const firstReport = reports[0];

  const center: [number, number] =
    firstReport
      ? [
          firstReport.latitude,
          firstReport.longitude,
        ]
      : defaultPosition;

  const getSymptoms = (report: RiskReport) => {
    const symptoms: string[] = [];

    if (report.diarrhea) symptoms.push("Diare");
    if (report.vomiting) symptoms.push("Muntah");
    if (report.fever) symptoms.push("Demam");
    if (report.dehydration) {
      symptoms.push("Dehidrasi");
    }

    return symptoms.length > 0
      ? symptoms.join(", ")
      : "Tidak ada gejala";
  };

  return (
    <div className="space-y-3">
      {/* MAP */}

      <div className="overflow-hidden rounded-xl border">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          className="h-[450px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {reports.map((report) => {
            const riskLevel =
              report.assessment?.riskLevel ?? null;

            return (
              <Marker
                key={report.id}
                position={[
                  report.latitude,
                  report.longitude,
                ]}
                icon={createMarkerIcon(riskLevel)}
              >
                <Popup>
                  <div className="space-y-2">
                    <p className="font-semibold">
                      {getSymptoms(report)}
                    </p>

                    <p className="text-sm">
                      {report.region.name},{" "}
                      {report.region.city}
                    </p>

                    <p className="text-sm">
                      Pelapor: {report.reporterName}
                    </p>

                    <p className="text-sm font-medium">
                      Status:{" "}
                      {riskLevel
                        ? `Risiko ${riskLevel}`
                        : "Belum Dinilai"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* LEGEND */}

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-600" />
          <span>Risiko Tinggi</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span>Risiko Sedang</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-600" />
          <span>Risiko Rendah</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-500" />
          <span>Belum Dinilai</span>
        </div>
      </div>
    </div>
  );
}