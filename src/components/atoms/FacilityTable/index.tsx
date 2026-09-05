"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type FacilityType =
    | "PUSKESMAS"
    | "RUMAH_SAKIT"
    | "KLINIK";

type Region = {
    id: string;
    name: string;
    city: string;
};

type Staff = {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        profesi?: "DOKTER" | "PERAWAT" | "BIDAN" | null;
    };
};

type Facility = {
    id: string;
    name: string;
    type: FacilityType;
    address: string;
    regionId: string;
    region: Region;
    latitude: number;
    longitude: number;
    phone?: string | null;
    openingHours?: string | null;
    isActive: boolean;
    staffs: Staff[];
};

export function FacilityTable({
    title,
    subtitle,
}: {
    title: string;
    subtitle: string;
}) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteLoading, setIsDeleteLoading] =
        useState(false);

    const fetchFacilities = async () => {
        try {
            setIsLoading(true);

            const response = await fetch("/api/facilities");

            if (!response.ok) {
                throw new Error("Gagal mengambil data fasilitas");
            }

            const data = await response.json();

            console.log("STATUS API:", response.status);
            console.log("DATA FACILITIES:", data);

            setFacilities(data);
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengambil data fasilitas");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const formatType = (type: FacilityType) => {
        if (type === "PUSKESMAS") {
            return "Puskesmas";
        }

        if (type === "RUMAH_SAKIT") {
            return "Rumah Sakit";
        }

        return "Klinik";
    };

    const handleEdit = (facility: Facility) => {
        console.log("Edit fasilitas:", facility);

        // Form Edit akan kita pasang di tahap berikutnya.
    };

    const handleDelete = async (facility: Facility) => {
        const confirmed = window.confirm(
            `Apakah kamu yakin ingin menghapus ${facility.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setIsDeleteLoading(true);

            const response = await fetch(
                `/api/facilities/${facility.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(
                    data.message ||
                    "Gagal menghapus fasilitas"
                );

                return;
            }

            toast.success(
                "Fasilitas berhasil dihapus"
            );

            await fetchFacilities();
        } catch (error) {
            console.error(error);

            toast.error("Terjadi kesalahan");
        } finally {
            setIsDeleteLoading(false);
        }
    };

    return (
        <div className="w-full space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        {title}
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                <Link
                    href="/admin/fasilitas/tambah"
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    + Tambah
                </Link>
            </div>

            {/* Table */}
            <section className="min-w-0 w-full">
                <div className="overflow-x-auto rounded-xl border border-border bg-card">

                    <table className="min-w-full divide-y divide-border">

                        <thead>
                            <tr className="text-left text-sm font-medium text-muted-foreground">

                                <th className="px-4 py-3">
                                    No
                                </th>

                                <th className="px-4 py-3">
                                    Nama Fasilitas
                                </th>

                                <th className="px-4 py-3">
                                    Jenis
                                </th>

                                <th className="px-4 py-3">
                                    Wilayah
                                </th>

                                <th className="px-4 py-3">
                                    Alamat
                                </th>

                                <th className="px-4 py-3">
                                    Nakes
                                </th>

                                <th className="px-4 py-3">
                                    Status
                                </th>

                                <th className="px-4 py-3">
                                    Aksi
                                </th>

                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">

                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Memuat data fasilitas...
                                    </td>
                                </tr>
                            ) : facilities.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={8}
                                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada data fasilitas.
                                    </td>
                                </tr>
                            ) : (
                                facilities.map((facility, index) => (
                                    <tr
                                        key={facility.id}
                                        className="text-sm text-foreground even:bg-muted/40"
                                    >

                                        {/* No */}
                                        <td className="px-4 py-3">
                                            {index + 1}
                                        </td>

                                        {/* Nama */}
                                        <td className="px-4 py-3 font-medium">
                                            {facility.name}
                                        </td>

                                        {/* Jenis */}
                                        <td className="px-4 py-3">
                                            {formatType(facility.type)}
                                        </td>

                                        {/* Wilayah */}
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">
                                                    {facility.region.name}
                                                </p>

                                                <p className="text-xs text-muted-foreground">
                                                    {facility.region.city}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Alamat */}
                                        <td className="max-w-xs px-4 py-3">
                                            <p className="truncate">
                                                {facility.address}
                                            </p>
                                        </td>

                                        {/* Nakes */}
                                        <td className="px-4 py-3">
                                            {facility.staffs.length > 0 ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {facility.staffs.length} Nakes
                                                    </p>

                                                    <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                                                        {facility.staffs
                                                            .map(
                                                                (staff) =>
                                                                    staff.user.name
                                                            )
                                                            .join(", ")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Belum ada
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {facility.isActive ? (
                                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                    Tidak Aktif
                                                </span>
                                            )}
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(facility)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                                                >
                                                    <Pencil className="size-3" />
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(facility)
                                                    }
                                                    disabled={isDeleteLoading}
                                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 className="size-3" />
                                                    Hapus
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>
            </section>

        </div>
    );
}
