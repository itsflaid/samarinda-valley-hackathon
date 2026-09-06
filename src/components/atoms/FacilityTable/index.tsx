"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
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
        profesi?:
            | "DOKTER"
            | "PERAWAT"
            | "BIDAN"
            | null;
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
    const [facilities, setFacilities] =
        useState<Facility[]>([]);

    const [regions, setRegions] =
        useState<Region[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isDeleteLoading, setIsDeleteLoading] =
        useState(false);

    const [editingFacility, setEditingFacility] =
        useState<Facility | null>(null);

    const [isEditSubmitting, setIsEditSubmitting] =
        useState(false);

    const [editForm, setEditForm] = useState({
        name: "",
        type: "PUSKESMAS" as FacilityType,
        address: "",
        regionId: "",
        latitude: "",
        longitude: "",
        phone: "",
        openingHours: "",
        isActive: true,
    });

    // =========================================================
    // FETCH DATA
    // =========================================================

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);

                const [
                    facilitiesResponse,
                    regionsResponse,
                ] = await Promise.all([
                    fetch("/api/facilities", {
                        cache: "no-store",
                    }),
                    fetch("/api/regions", {
                        cache: "no-store",
                    }),
                ]);

                const facilitiesData =
                    await facilitiesResponse.json();

                const regionsData =
                    await regionsResponse.json();

                if (!facilitiesResponse.ok) {
                    throw new Error(
                        facilitiesData?.message ||
                            "Gagal mengambil data fasilitas"
                    );
                }

                if (!regionsResponse.ok) {
                    throw new Error(
                        regionsData?.message ||
                            "Gagal mengambil data wilayah"
                    );
                }

                const facilityList = Array.isArray(
                    facilitiesData
                )
                    ? facilitiesData
                    : facilitiesData?.facilities;

                const regionList = Array.isArray(
                    regionsData
                )
                    ? regionsData
                    : regionsData?.regions;

                setFacilities(
                    Array.isArray(facilityList)
                        ? facilityList
                        : []
                );

                setRegions(
                    Array.isArray(regionList)
                        ? regionList
                        : []
                );
            } catch (error) {
                console.error(
                    "FETCH FACILITY DATA ERROR:",
                    error
                );

                setFacilities([]);
                setRegions([]);

                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Gagal mengambil data fasilitas"
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // =========================================================
    // REFRESH FACILITIES
    // =========================================================

    const refreshFacilities = async () => {
        try {
            const response = await fetch(
                "/api/facilities",
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Gagal mengambil data fasilitas"
                );
            }

            const facilityList = Array.isArray(data)
                ? data
                : data?.facilities;

            setFacilities(
                Array.isArray(facilityList)
                    ? facilityList
                    : []
            );
        } catch (error) {
            console.error(
                "REFRESH FACILITIES ERROR:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui data fasilitas"
            );
        }
    };

    // =========================================================
    // FORMAT TYPE
    // =========================================================

    const formatType = (
        type: FacilityType
    ) => {
        if (type === "PUSKESMAS") {
            return "Puskesmas";
        }

        if (type === "RUMAH_SAKIT") {
            return "Rumah Sakit";
        }

        return "Klinik";
    };

    // =========================================================
    // HANDLE EDIT
    // =========================================================

    const handleEdit = (
        facility: Facility
    ) => {
        setEditingFacility(facility);

        setEditForm({
            name: facility.name,
            type: facility.type,
            address: facility.address,
            regionId: facility.regionId,
            latitude: String(
                facility.latitude
            ),
            longitude: String(
                facility.longitude
            ),
            phone: facility.phone ?? "",
            openingHours:
                facility.openingHours ?? "",
            isActive: facility.isActive,
        });
    };

    // =========================================================
    // HANDLE EDIT CHANGE
    // =========================================================

    const handleEditChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
                HTMLSelectElement |
                HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } =
            e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? (
                          e.target as HTMLInputElement
                      ).checked
                    : value,
        }));
    };

    // =========================================================
    // SUBMIT EDIT
    // =========================================================

    const handleEditSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!editingFacility) {
            return;
        }

        if (
            !editForm.name.trim() ||
            !editForm.address.trim() ||
            !editForm.regionId ||
            !editForm.latitude ||
            !editForm.longitude
        ) {
            toast.error(
                "Lengkapi data fasilitas terlebih dahulu"
            );
            return;
        }

        try {
            setIsEditSubmitting(true);

            const response = await fetch(
                `/api/facilities/${editingFacility.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        name: editForm.name.trim(),
                        type: editForm.type,
                        address:
                            editForm.address.trim(),
                        regionId:
                            editForm.regionId,
                        latitude: Number(
                            editForm.latitude
                        ),
                        longitude: Number(
                            editForm.longitude
                        ),
                        phone:
                            editForm.phone.trim() ||
                            null,
                        openingHours:
                            editForm.openingHours.trim() ||
                            null,
                        isActive:
                            editForm.isActive,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Gagal memperbarui fasilitas"
                );
            }

            toast.success(
                "Fasilitas berhasil diperbarui"
            );

            setEditingFacility(null);

            await refreshFacilities();
        } catch (error) {
            console.error(
                "EDIT FACILITY ERROR:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui fasilitas"
            );
        } finally {
            setIsEditSubmitting(false);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (
        facility: Facility
    ) => {
        const confirmed =
            window.confirm(
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

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Gagal menghapus fasilitas"
                );
            }

            toast.success(
                "Fasilitas berhasil dihapus"
            );

            await refreshFacilities();
        } catch (error) {
            console.error(
                "DELETE FACILITY ERROR:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal menghapus fasilitas"
            );
        } finally {
            setIsDeleteLoading(false);
        }
    };

    return (
        <>
            <div className="w-full space-y-4">
                {/* HEADER */}
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

                {/* TABLE */}
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
                                ) : facilities.length ===
                                  0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-muted-foreground"
                                        >
                                            Belum ada data fasilitas.
                                        </td>
                                    </tr>
                                ) : (
                                    facilities.map(
                                        (
                                            facility,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    facility.id
                                                }
                                                className="text-sm text-foreground even:bg-muted/40"
                                            >
                                                {/* NO */}
                                                <td className="px-4 py-3">
                                                    {index +
                                                        1}
                                                </td>

                                                {/* NAMA */}
                                                <td className="px-4 py-3 font-medium">
                                                    {
                                                        facility.name
                                                    }
                                                </td>

                                                {/* JENIS */}
                                                <td className="px-4 py-3">
                                                    {formatType(
                                                        facility.type
                                                    )}
                                                </td>

                                                {/* WILAYAH */}
                                                <td className="px-4 py-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {
                                                                facility
                                                                    .region
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-muted-foreground">
                                                            {
                                                                facility
                                                                    .region
                                                                    .city
                                                            }
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* ALAMAT */}
                                                <td className="max-w-xs px-4 py-3">
                                                    <p className="truncate">
                                                        {
                                                            facility.address
                                                        }
                                                    </p>
                                                </td>

                                                {/* NAKES */}
                                                <td className="px-4 py-3">
                                                    {facility.staffs.length >
                                                    0 ? (
                                                        <div className="space-y-1">
                                                            <p className="font-medium">
                                                                {
                                                                    facility
                                                                        .staffs
                                                                        .length
                                                                }{" "}
                                                                Nakes
                                                            </p>

                                                            <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                                                                {facility.staffs
                                                                    .map(
                                                                        (
                                                                            staff
                                                                        ) =>
                                                                            staff
                                                                                .user
                                                                                .name
                                                                    )
                                                                    .join(
                                                                        ", "
                                                                    )}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Belum ada
                                                        </span>
                                                    )}
                                                </td>

                                                {/* STATUS */}
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

                                                {/* AKSI */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    facility
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                                                        >
                                                            <Pencil className="size-3" />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    facility
                                                                )
                                                            }
                                                            disabled={
                                                                isDeleteLoading
                                                            }
                                                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="size-3" />
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* =====================================================
                MODAL EDIT
            ===================================================== */}

            {editingFacility && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Edit Fasilitas
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Perbarui informasi fasilitas kesehatan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingFacility(
                                        null
                                    )
                                }
                                disabled={
                                    isEditSubmitting
                                }
                                className="rounded-md p-2 hover:bg-muted disabled:opacity-50"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={
                                handleEditSubmit
                            }
                            className="max-h-[75vh] overflow-y-auto"
                        >
                            <div className="space-y-5 px-6 py-5">
                                {/* NAMA */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Nama Fasilitas
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            editForm.name
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                {/* JENIS */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Jenis Fasilitas
                                    </label>

                                    <select
                                        name="type"
                                        value={
                                            editForm.type
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="PUSKESMAS">
                                            Puskesmas
                                        </option>

                                        <option value="RUMAH_SAKIT">
                                            Rumah Sakit
                                        </option>

                                        <option value="KLINIK">
                                            Klinik
                                        </option>
                                    </select>
                                </div>

                                {/* WILAYAH */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Wilayah
                                    </label>

                                    <select
                                        name="regionId"
                                        value={
                                            editForm.regionId
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    >
                                        <option value="">
                                            Pilih wilayah
                                        </option>

                                        {regions.map(
                                            (
                                                region
                                            ) => (
                                                <option
                                                    key={
                                                        region.id
                                                    }
                                                    value={
                                                        region.id
                                                    }
                                                >
                                                    {
                                                        region.name
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        region.city
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* ALAMAT */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Alamat
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            editForm.address
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        rows={3}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                {/* LATITUDE */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Latitude
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={
                                            editForm.latitude
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                {/* LONGITUDE */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Longitude
                                    </label>

                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={
                                            editForm.longitude
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                        required
                                    />
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Nomor Telepon
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            editForm.phone
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* JAM */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Jam Operasional
                                    </label>

                                    <input
                                        type="text"
                                        name="openingHours"
                                        value={
                                            editForm.openingHours
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        placeholder="08:00 - 16:00"
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>

                                {/* STATUS */}
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={
                                            editForm.isActive
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                    />

                                    <span className="text-sm font-medium">
                                        Fasilitas aktif
                                    </span>
                                </label>
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-3 border-t px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingFacility(
                                            null
                                        )
                                    }
                                    disabled={
                                        isEditSubmitting
                                    }
                                    className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isEditSubmitting
                                    }
                                    className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isEditSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}