"use client";

import { useEffect, useState } from "react";
import { MapPin, Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PreventiveSolutionModal } from "@/components/lapor/PreventiveSolutionModal";
import type { RegionData } from "@/types/region";

const LOCATION_STORAGE_KEY = "user-location";

type ReportType = "health" | "water";

interface StoredLocation {
  coords: { lat: number; lng: number };
  region: RegionData;
}

function parseLocation(stored: string | null): StoredLocation | null {
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (
      parsed?.coords &&
      typeof parsed.coords.lat === "number" &&
      typeof parsed.coords.lng === "number" &&
      parsed?.region
    ) {
      return parsed as StoredLocation;
    }
    return null;
  } catch {
    return null;
  }
}

const normalize = (value: string | null | undefined) =>
  value
    ?.toLowerCase()
    .replace(/^kecamatan\s+/i, "")
    .trim();

export default function LaporPage() {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");

  const [diarrhea, setDiarrhea] = useState(false);
  const [vomiting, setVomiting] = useState(false);
  const [fever, setFever] = useState(false);
  const [dehydration, setDehydration] = useState(false);

  const [supplyDisruption, setSupplyDisruption] = useState(false);
  const [dirtyOrSmelly, setDirtyOrSmelly] = useState(false);
  const [saltyOrBrackish, setSaltyOrBrackish] = useState(false);
  const [dryWell, setDryWell] = useState(false);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [region, setRegion] = useState<RegionData | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(LOCATION_STORAGE_KEY);
    const loc = parseLocation(stored);
    if (loc) {
      setCoords(loc.coords);
      setRegion(loc.region);
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Browser tidak mendukung deteksi lokasi.");
      return;
    }

    setLocating(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (!res.ok) throw new Error("Gagal mendapatkan alamat.");
          const data = await res.json();

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

          const matched = regions.find(
            (item) =>
              normalize(item.name) === normalize(district) &&
              normalize(item.city) === normalize(city)
          );

          if (matched) {
            setRegion(matched);
          } else {
            setLocError(
              `Wilayah ${district ?? "Anda"} belum memiliki data.`
            );
          }
        } catch {
          setLocError("Gagal menentukan wilayah Anda. Silakan coba lagi.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocError(
          "Lokasi tidak dapat dideteksi. Anda tetap dapat melaporkan data."
        );
        setLocating(false);
      }
    );
  };

  const hasSymptom =
    reportType === "health" &&
    (diarrhea || vomiting || fever || dehydration);

  const hasWaterCondition =
    reportType === "water" &&
    (supplyDisruption || dirtyOrSmelly || saltyOrBrackish || dryWell);

  const canSubmit =
    reportType &&
    reporterName.trim() &&
    reporterPhone.trim() &&
    coords &&
    region &&
    (hasSymptom || hasWaterCondition) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !reportType || !region || !coords) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const url =
        reportType === "health"
          ? "/api/reports/health"
          : "/api/reports/water";

      const body =
        reportType === "health"
          ? {
              reporterName: reporterName.trim(),
              reporterPhone: reporterPhone.trim(),
              regionId: region.id,
              diarrhea,
              vomiting,
              fever,
              dehydration,
              latitude: coords.lat,
              longitude: coords.lng,
            }
          : {
              reporterName: reporterName.trim(),
              reporterPhone: reporterPhone.trim(),
              regionId: region.id,
              supplyDisruption,
              dirtyOrSmelly,
              saltyOrBrackish,
              dryWell,
              latitude: coords.lat,
              longitude: coords.lng,
            };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim laporan");
      }

      setSuccess(true);
      setShowSolutionModal(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Gagal mengirim laporan"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <div className="px-6 py-16">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle className="size-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold">Laporan Berhasil Dikirim</h1>
            <p className="mt-2 text-muted-foreground">
              Terima kasih telah melaporkan kondisi{" "}
              {reportType === "health" ? "kesehatan" : "air"} di wilayah{" "}
              {region?.name}. Data Anda membantu pemantauan kondisi masyarakat.
            </p>
            <Button
              onClick={() => {
                setSuccess(false);
                setShowSolutionModal(false);
                setReportType(null);
                setReporterName("");
                setReporterPhone("");
                setDiarrhea(false);
                setVomiting(false);
                setFever(false);
                setDehydration(false);
                setSupplyDisruption(false);
                setDirtyOrSmelly(false);
                setSaltyOrBrackish(false);
                setDryWell(false);
                setSubmitError(null);
              }}
              className="mt-6"
            >
              Kirim Laporan Baru
            </Button>
          </div>
        </div>

        {reportType === "health" && (
          <PreventiveSolutionModal
            open={showSolutionModal}
            onOpenChange={setShowSolutionModal}
            symptoms={{
              diarrhea,
              vomiting,
              fever,
              dehydration,
            }}
            userCoords={coords}
          />
        )}
      </>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Laporkan Kondisi
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sampaikan laporan kondisi kesehatan atau air di wilayah Anda.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <p className="mb-3 text-sm font-medium">Jenis Laporan</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportType("health")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  reportType === "health"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <p className="font-semibold">Kesehatan</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Diare, muntah, demam, dehidrasi
                </p>
              </button>
              <button
                type="button"
                onClick={() => setReportType("water")}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  reportType === "water"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                <p className="font-semibold">Air</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pasokan, kualitas, kondisi sumur
                </p>
              </button>
            </div>
          </div>

          {reportType && (
            <>
              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <p className="mb-4 text-sm font-medium">Lokasi & Wilayah</p>

                {coords && region ? (
                  <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{region.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {region.city}, {region.province}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      Deteksi lokasi Anda untuk melampirkan laporan ke wilayah
                      yang tepat.
                    </p>
                    <Button
                      variant="outline"
                      onClick={detectLocation}
                      disabled={locating}
                    >
                      {locating ? (
                        <>
                          <Spinner className="mr-2" />
                          Mendeteksi...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 size-4" />
                          Deteksi Lokasi
                        </>
                      )}
                    </Button>
                    {locError && (
                      <p className="mt-2 text-sm text-destructive">{locError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <p className="mb-4 text-sm font-medium">Data Pelapor</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">
                      Nama Lengkap *
                    </label>
                    <Input
                      placeholder="Masukkan nama Anda"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm text-muted-foreground">
                      Nomor HP *
                    </label>
                    <Input
                      placeholder="08xxxxxxxxxx"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                <p className="mb-4 text-sm font-medium">
                  {reportType === "health"
                    ? "Kondisi Kesehatan *"
                    : "Kondisi Air *"}
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Pilih minimal satu kondisi yang terjadi.
                </p>

                {reportType === "health" ? (
                  <div className="space-y-3">
                    {[
                      { label: "Diare", checked: diarrhea, onChange: setDiarrhea },
                      { label: "Muntah", checked: vomiting, onChange: setVomiting },
                      { label: "Demam", checked: fever, onChange: setFever },
                      { label: "Dehidrasi", checked: dehydration, onChange: setDehydration },
                    ].map((item) => (
                      <label
                        key={item.label}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.onChange(e.target.checked)}
                          className="size-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "Pasokan air terganggu", checked: supplyDisruption, onChange: setSupplyDisruption },
                      { label: "Air keruh atau berbau", checked: dirtyOrSmelly, onChange: setDirtyOrSmelly },
                      { label: "Air asin atau payau", checked: saltyOrBrackish, onChange: setSaltyOrBrackish },
                      { label: "Sumur kering", checked: dryWell, onChange: setDryWell },
                    ].map((item) => (
                      <label
                        key={item.label}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.onChange(e.target.checked)}
                          className="size-4 rounded border-gray-300"
                        />
                        <span className="text-sm">{item.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <AlertTriangle className="size-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Kirim Laporan
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
