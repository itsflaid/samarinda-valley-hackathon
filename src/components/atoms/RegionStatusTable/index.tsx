"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";

type Region = {
  id: string;
  name: string;
  city: string;
  province: string;
  status: "AMAN" | "WASPADA" | "SIAGA";
  ipaStatus: "AKTIF" | "MATI";
  ipaCondition: string | null;
};

const statusStyle = {
  AMAN: "bg-green-100 text-green-700",
  WASPADA: "bg-yellow-100 text-yellow-700",
  SIAGA: "bg-red-100 text-red-700",
};

const ipaStyle = {
  AKTIF: "bg-green-100 text-green-700",
  MATI: "bg-red-100 text-red-700",
};

export function RegionStatusTable({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingRegion, setEditingRegion] =
    useState<Region | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    status: "AMAN" as Region["status"],
    ipaStatus: "AKTIF" as Region["ipaStatus"],
    ipaCondition: "",
  });

  // =========================================================
  // FETCH WILAYAH
  // =========================================================

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const response = await fetch(
          "/api/petugas/regions",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Gagal mengambil wilayah"
          );
        }

        setRegions(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "FETCH PETUGAS REGIONS ERROR:",
          error
        );

        setRegions([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data wilayah"
        );
      } finally {
        setLoading(false);
      }
    };

    loadRegions();
  }, []);

  // =========================================================
  // BUKA MODAL PEMERIKSAAN
  // =========================================================

  const handleEdit = (region: Region) => {
    setEditingRegion(region);

    setForm({
      status: region.status,
      ipaStatus: region.ipaStatus,
      ipaCondition: region.ipaCondition ?? "",
    });
  };

  // =========================================================
  // SIMPAN PEMERIKSAAN
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingRegion) {
      return;
    }

    if (!form.ipaCondition.trim()) {
      toast.error(
        "Kondisi air wajib diisi"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/petugas/regions/${editingRegion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: form.status,
            ipaStatus: form.ipaStatus,
            ipaCondition:
              form.ipaCondition.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal memperbarui pemeriksaan"
        );
      }

      // Update state lokal
      setRegions((prev) =>
        prev.map((region) =>
          region.id === editingRegion.id
            ? {
                ...region,
                status: form.status,
                ipaStatus:
                  form.ipaStatus,
                ipaCondition:
                  form.ipaCondition.trim(),
              }
            : region
        )
      );

      setEditingRegion(null);

      toast.success(
        "Pemeriksaan air berhasil diperbarui"
      );
    } catch (error) {
      console.error(
        "UPDATE WATER STATUS ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui kondisi air"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-4">
        {/* HEADER */}
        <div>
          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="min-w-full divide-y">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-4 py-3">
                  No
                </th>

                <th className="px-4 py-3">
                  Kecamatan
                </th>

                <th className="px-4 py-3">
                  Kota
                </th>

                <th className="px-4 py-3">
                  Status Wilayah
                </th>

                <th className="px-4 py-3">
                  IPA
                </th>

                <th className="px-4 py-3">
                  Kondisi
                </th>

                <th className="px-4 py-3">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : regions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Belum ada wilayah yang
                    ditugaskan.
                  </td>
                </tr>
              ) : (
                regions.map(
                  (region, index) => (
                    <tr
                      key={region.id}
                      className="text-sm"
                    >
                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-medium">
                        {region.name}
                      </td>

                      <td className="px-4 py-3">
                        {region.city}
                      </td>

                      {/* STATUS WILAYAH */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusStyle[
                              region.status
                            ]
                          }`}
                        >
                          {region.status}
                        </span>
                      </td>

                      {/* IPA */}
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            ipaStyle[
                              region.ipaStatus
                            ]
                          }`}
                        >
                          {region.ipaStatus ===
                          "AKTIF"
                            ? "Aktif"
                            : "Mati"}
                        </span>
                      </td>

                      {/* KONDISI */}
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate">
                          {region.ipaCondition ||
                            "Belum diperiksa"}
                        </p>
                      </td>

                      {/* AKSI */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(region)
                          }
                          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Periksa
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          MODAL PEMERIKSAAN
      ===================================================== */}

      {editingRegion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Pemeriksaan Air
                </h3>

                <p className="text-sm text-muted-foreground">
                  {editingRegion.name} •{" "}
                  {editingRegion.city}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingRegion(null)
                }
                disabled={isSubmitting}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-5"
            >
              {/* IPA */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status IPA
                </label>

                <select
                  value={form.ipaStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ipaStatus:
                        e.target
                          .value as Region["ipaStatus"],
                    }))
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="AKTIF">
                    🟢 Aktif
                  </option>

                  <option value="MATI">
                    🔴 Mati
                  </option>
                </select>
              </div>

              {/* KONDISI AIR */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Kondisi Air
                </label>

                <textarea
                  value={form.ipaCondition}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ipaCondition:
                        e.target.value,
                    }))
                  }
                  placeholder="Contoh: Air keruh dan berbau, distribusi masih berjalan."
                  rows={4}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* STATUS WILAYAH */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Status Wilayah
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status:
                        e.target.value as Region["status"],
                    }))
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="AMAN">
                    🟢 Aman
                  </option>

                  <option value="WASPADA">
                    🟡 Waspada
                  </option>

                  <option value="SIAGA">
                    🔴 Siaga
                  </option>
                </select>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setEditingRegion(null)
                  }
                  disabled={isSubmitting}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : "Simpan Pemeriksaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}