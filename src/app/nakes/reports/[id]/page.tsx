"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type Assessment = {
  id: string;
  riskLevel: "RENDAH" | "SEDANG" | "TINGGI";
  notes: string | null;
  actionTaken: string | null;
  assessedAt: string;
  nakes: {
    name: string;
    profesi: "DOKTER" | "PERAWAT" | "BIDAN" | null;
  };
};

type Report = {
  id: string;
  reporterName: string;
  reporterPhone: string;

  diarrhea: boolean;
  vomiting: boolean;
  fever: boolean;
  dehydration: boolean;

  latitude: number;
  longitude: number;

  reportedAt: string;

  region: {
    id: string;
    name: string;
    city: string;
    province: string;
    status: "AMAN" | "WASPADA" | "SIAGA";
    ipaStatus: "AKTIF" | "MATI";
    ipaCondition: string | null;
  };

  assessment: Assessment | null;
};

export default function NakesReportDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // ASSESSMENT STATE
  // =====================================================

  const [riskLevel, setRiskLevel] = useState<
    "RENDAH" | "SEDANG" | "TINGGI" | ""
  >("");

  const [notes, setNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // FETCH REPORT
  // =====================================================

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `/api/nakes/reports/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Gagal mengambil laporan"
          );
        }

        setReport(data);
      } catch (error) {
        console.error(
          "FETCH REPORT DETAIL ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil laporan"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  // =====================================================
  // SUBMIT ASSESSMENT
  // =====================================================

  const handleSubmitAssessment = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!report) {
      toast.error("Data laporan belum tersedia");
      return;
    }

    if (!riskLevel) {
      toast.error("Pilih tingkat risiko terlebih dahulu");
      return;
    }

    if (!notes.trim()) {
      toast.error("Catatan assessment wajib diisi");
      return;
    }

    if (!actionTaken.trim()) {
      toast.error("Tindakan wajib diisi");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/nakes/assessments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            healthReportId: report.id,
            riskLevel,
            notes: notes.trim(),
            actionTaken: actionTaken.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menyimpan assessment"
        );
      }

      toast.success("Assessment berhasil disimpan");

      // Langsung tampilkan hasil tanpa reload
      setReport((prev) =>
        prev
          ? {
              ...prev,
              assessment: data.assessment,
            }
          : prev
      );

      setRiskLevel("");
      setNotes("");
      setActionTaken("");
    } catch (error) {
      console.error(
        "SUBMIT ASSESSMENT ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan assessment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // HELPER
  // =====================================================

  const formatStatus = (
    status: Report["region"]["status"]
  ) => {
    if (status === "SIAGA") return "Siaga";
    if (status === "WASPADA") return "Waspada";
    return "Aman";
  };

  const getStatusClass = (
    status: Report["region"]["status"]
  ) => {
    if (status === "SIAGA") {
      return "bg-red-100 text-red-700";
    }

    if (status === "WASPADA") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  const getRiskClass = (
    risk: Assessment["riskLevel"]
  ) => {
    if (risk === "TINGGI") {
      return "bg-red-100 text-red-700";
    }

    if (risk === "SEDANG") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const symptoms = report
    ? [
        report.diarrhea && "Diare",
        report.vomiting && "Muntah",
        report.fever && "Demam",
        report.dehydration && "Dehidrasi",
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold">
          Detail Laporan Kesehatan
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Informasi laporan kesehatan dari wilayah Anda.
        </p>
      </section>

      {/* LOADING */}
      {isLoading && (
        <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
          Memuat detail laporan...
        </div>
      )}

      {/* ERROR */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* CONTENT */}
      {!isLoading && !error && report && (
        <>
          {/* INFORMASI LAPORAN */}
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">
                Informasi Laporan
              </h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    Nama Pelapor
                  </p>

                  <p className="font-medium">
                    {report.reporterName}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Nomor HP
                  </p>

                  <p className="font-medium">
                    {report.reporterPhone}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">
                    Waktu Laporan
                  </p>

                  <p className="font-medium">
                    {formatDate(report.reportedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* WILAYAH */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Wilayah
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.region.city},{" "}
                    {report.region.province}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    report.region.status
                  )}`}
                >
                  {formatStatus(report.region.status)}
                </span>
              </div>

              <p className="font-medium">
                {report.region.name}
              </p>
            </div>
          </section>

          {/* GEJALA */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Gejala yang Dilaporkan
            </h2>

            {symptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada gejala yang dilaporkan.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <span
                    key={String(symptom)}
                    className="rounded-full border px-3 py-2 text-sm font-medium"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* KONDISI AIR */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Kondisi Wilayah & Air
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Status Wilayah
                </p>

                <p className="mt-1 font-semibold">
                  {formatStatus(report.region.status)}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Status IPA
                </p>

                <p className="mt-1 font-semibold">
                  {report.region.ipaStatus === "AKTIF"
                    ? "Aktif"
                    : "Mati"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Kondisi IPA
                </p>

                <p className="mt-1 font-semibold">
                  {report.region.ipaCondition || "-"}
                </p>
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* ASSESSMENT */}
          {/* ================================================= */}

          {report.assessment ? (
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Hasil Assessment
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Laporan sudah dinilai oleh Nakes.
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskClass(
                    report.assessment.riskLevel
                  )}`}
                >
                  Risiko {report.assessment.riskLevel}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Nakes
                  </p>

                  <p className="mt-1 font-medium">
                    {report.assessment.nakes.name}

                    {report.assessment.nakes.profesi
                      ? ` • ${report.assessment.nakes.profesi}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Catatan
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {report.assessment.notes || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Tindakan
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {report.assessment.actionTaken || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Dinilai pada{" "}
                    {formatDate(
                      report.assessment.assessedAt
                    )}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Buat Assessment
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Tentukan tingkat risiko dan tindakan berdasarkan
                  laporan kesehatan.
                </p>
              </div>

              <form
                onSubmit={handleSubmitAssessment}
                className="space-y-5"
              >
                {/* TINGKAT RISIKO */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tingkat Risiko
                  </label>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* RENDAH */}
                    <button
                      type="button"
                      onClick={() =>
                        setRiskLevel("RENDAH")
                      }
                      className={`rounded-lg border p-4 text-left transition ${
                        riskLevel === "RENDAH"
                          ? "border-green-500 bg-green-50"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold">
                        Rendah
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Kondisi relatif stabil.
                      </p>
                    </button>

                    {/* SEDANG */}
                    <button
                      type="button"
                      onClick={() =>
                        setRiskLevel("SEDANG")
                      }
                      className={`rounded-lg border p-4 text-left transition ${
                        riskLevel === "SEDANG"
                          ? "border-yellow-500 bg-yellow-50"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold">
                        Sedang
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Membutuhkan pemantauan.
                      </p>
                    </button>

                    {/* TINGGI */}
                    <button
                      type="button"
                      onClick={() =>
                        setRiskLevel("TINGGI")
                      }
                      className={`rounded-lg border p-4 text-left transition ${
                        riskLevel === "TINGGI"
                          ? "border-red-500 bg-red-50"
                          : "hover:bg-muted"
                      }`}
                    >
                      <p className="font-semibold">
                        Tinggi
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Membutuhkan tindakan segera.
                      </p>
                    </button>
                  </div>
                </div>

                {/* CATATAN */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Catatan Assessment
                  </label>

                  <textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value)
                    }
                    rows={4}
                    placeholder="Tuliskan hasil pemeriksaan atau pertimbangan risiko..."
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* TINDAKAN */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tindakan
                  </label>

                  <textarea
                    value={actionTaken}
                    onChange={(e) =>
                      setActionTaken(e.target.value)
                    }
                    rows={4}
                    placeholder="Tuliskan tindakan yang dilakukan..."
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* BUTTON */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : "Simpan Assessment"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* LOKASI */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">
              Lokasi Laporan
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Latitude
                </p>

                <p className="mt-1 font-mono text-sm">
                  {report.latitude}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Longitude
                </p>

                <p className="mt-1 font-mono text-sm">
                  {report.longitude}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}