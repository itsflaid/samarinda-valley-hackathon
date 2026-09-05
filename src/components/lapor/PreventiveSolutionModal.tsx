"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  singleSymptomSolutions,
  singleSymptomClosing,
  emergencyWarning,
} from "@/lib/prevention-data";
import type { FacilityData } from "@/types/facility";

interface HealthSymptoms {
  diarrhea: boolean;
  vomiting: boolean;
  fever: boolean;
  dehydration: boolean;
}

interface PreventiveSolutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symptoms: HealthSymptoms;
  userCoords: { lat: number; lng: number } | null;
}

function getSymptomKeys(symptoms: HealthSymptoms): string[] {
  const keys: string[] = [];
  if (symptoms.diarrhea) keys.push("diarrhea");
  if (symptoms.vomiting) keys.push("vomiting");
  if (symptoms.fever) keys.push("fever");
  if (symptoms.dehydration) keys.push("dehydration");
  return keys;
}


function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function PreventiveSolutionModal({
  open,
  onOpenChange,
  symptoms,
  userCoords,
}: PreventiveSolutionModalProps) {
  const symptomKeys = getSymptomKeys(symptoms);
  const symptomCount = symptomKeys.length;
  const isEmergency = symptomCount >= 2;

  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  useEffect(() => {
    if (!isEmergency || !open) return;

    const fetchFacilities = async () => {
      setLoadingFacilities(true);
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error("Gagal memuat data faskes");
        const data: FacilityData[] = await res.json();

        const active = data.filter((f) => f.isActive);

        if (userCoords) {
          active.sort((a, b) => {
            const distA = haversineDistance(
              userCoords.lat,
              userCoords.lng,
              a.latitude,
              a.longitude
            );
            const distB = haversineDistance(
              userCoords.lat,
              userCoords.lng,
              b.latitude,
              b.longitude
            );
            return distA - distB;
          });
        }

        setFacilities(active.slice(0, 3));
      } catch {
        setFacilities([]);
      } finally {
        setLoadingFacilities(false);
      }
    };

    fetchFacilities();
  }, [isEmergency, open, userCoords]);

  if (symptomCount === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[85vh] overflow-y-auto z-10000"
        showCloseButton={false}
      >
        {isEmergency ? (
          <EmergencyContent
            facilities={facilities}
            loadingFacilities={loadingFacilities}
            userCoords={userCoords}
          />
        ) : (
          <SingleSymptomContent symptomKey={symptomKeys[0]} />
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SingleSymptomContent({ symptomKey }: { symptomKey: string }) {
  const data = singleSymptomSolutions[symptomKey];
  if (!data) return null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-green-600" />
          Solusi Preventif Mandiri
        </DialogTitle>
        <DialogDescription>
          Berdasarkan gejala yang Anda laporkan
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <p className="mb-2 text-sm font-semibold text-green-800 dark:text-green-200">
            {data.title}
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            {data.solution}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            {singleSymptomClosing}
          </p>
        </div>
      </div>
    </>
  );
}

function EmergencyContent({
  facilities,
  loadingFacilities,
  userCoords,
}: {
  facilities: FacilityData[];
  loadingFacilities: boolean;
  userCoords: { lat: number; lng: number } | null;
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="size-5" />
          {emergencyWarning.title}
        </DialogTitle>
        <DialogDescription>{emergencyWarning.message}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive mb-1">
            Fasilitas Kesehatan Terdekat
          </p>

          {loadingFacilities ? (
            <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mencari faskes terdekat...
            </div>
          ) : facilities.length > 0 ? (
            <div className="space-y-3 mt-2">
              {facilities.map((f) => {
                const dist =
                  userCoords
                    ? haversineDistance(
                        userCoords.lat,
                        userCoords.lng,
                        f.latitude,
                        f.longitude
                      )
                    : null;

                return (
                  <div
                    key={f.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {f.address}
                        </p>
                        {dist !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ~{dist.toFixed(1)} km dari posisi Anda
                          </p>
                        )}
                        {f.phone && (
                          <a
                            href={`tel:${f.phone}`}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Phone className="size-3" />
                            {f.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              Faskes tidak ditemukan di sekitar Anda.
            </p>
          )}
        </div>

        <a
          href="tel:112"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
        >
          <Phone className="size-4" />
          Panggil Ambulans / Call Center Darurat (112)
        </a>
      </div>
    </>
  );
}
