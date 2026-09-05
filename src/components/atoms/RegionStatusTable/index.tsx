"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Region = {
  id: string;
  name: string;
  city: string;
  province: string;
  status: "AMAN" | "WASPADA" | "SIAGA";
  ipaStatus: "AKTIF" | "MATI";
  ipaCondition?: string | null;
};

const statusStyle = {
  AMAN: "bg-green-100 text-green-700",
  WASPADA: "bg-yellow-100 text-yellow-700",
  SIAGA: "bg-red-100 text-red-700",
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
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/petugas/regions");

      if (!response.ok) {
        throw new Error("Gagal mengambil wilayah");
      }

      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data wilayah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const updateStatus = async (
    regionId: string,
    status: Region["status"]
  ) => {
    try {
      setUpdating(regionId);

      const response = await fetch(
        `/api/petugas/regions/${regionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setRegions((prev) =>
        prev.map((region) =>
          region.id === regionId
            ? { ...region, status }
            : region
        )
      );

      toast.success("Status wilayah berhasil diperbarui");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status wilayah");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full divide-y">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Kecamatan</th>
              <th className="px-4 py-3">Kota</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">IPA</th>
              <th className="px-4 py-3">Ubah Status</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center"
                >
                  Memuat data...
                </td>
              </tr>
            ) : regions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Belum ada wilayah yang ditugaskan.
                </td>
              </tr>
            ) : (
              regions.map((region, index) => (
                <tr key={region.id}>
                  <td className="px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {region.name}
                  </td>

                  <td className="px-4 py-3">
                    {region.city}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusStyle[region.status]
                      }`}
                    >
                      {region.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {region.ipaStatus === "AKTIF"
                      ? "🟢 Aktif"
                      : "🔴 Mati"}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={region.status}
                      disabled={updating === region.id}
                      onChange={(e) =>
                        updateStatus(
                          region.id,
                          e.target.value as Region["status"]
                        )
                      }
                      className="rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="AMAN">🟢 AMAN</option>
                      <option value="WASPADA">
                        🟡 WASPADA
                      </option>
                      <option value="SIAGA">🔴 SIAGA</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}