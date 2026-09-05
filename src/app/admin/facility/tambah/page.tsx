"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LocationPicker } from "@/components/atoms/LocationPicker";

type Region = {
    id: string;
    name: string;
    city: string;
};

export default function TambahFasilitasPage() {
    const router = useRouter();

    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "",
        regionId: "",
        address: "",
        phone: "",
        openingHours: "",
        latitude: null as number | null,
        longitude: null as number | null,
    });

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch("/api/regions");

                if (!response.ok) {
                    throw new Error("Gagal mengambil wilayah");
                }

                const data = await response.json();

                setRegions(data);
            } catch (error) {
                console.error(error);
                toast.error("Gagal mengambil data wilayah");
            } finally {
                setIsLoadingRegions(false);
            }
        };

        fetchRegions();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.type ||
            !form.regionId ||
            !form.address
        ) {
            toast.error("Data wajib belum lengkap");
            return;
        }

        try {
            setIsSubmitting(true);

            // Belum dikirim ke API.
            // Latitude & longitude akan kita tambahkan setelah LocationPicker.

            console.log("Data form:", form);

            toast.success("Data form berhasil disiapkan");
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">
                    Tambah Fasilitas Kesehatan
                </h1>

                <p className="text-sm text-muted-foreground">
                    Tambahkan data fasilitas kesehatan baru.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <div className="rounded-xl border bg-card p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold">
                            Data Fasilitas
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Masukkan informasi dasar fasilitas kesehatan.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {/* Nama */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Nama Fasilitas
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Contoh: Puskesmas Sungai Pinang"
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                            />
                        </div>

                        {/* Jenis */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Jenis Fasilitas
                            </label>

                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                            >
                                <option value="">
                                    Pilih jenis fasilitas
                                </option>

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

                        {/* Wilayah */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Wilayah
                            </label>

                            <select
                                name="regionId"
                                value={form.regionId}
                                onChange={handleChange}
                                disabled={isLoadingRegions}
                                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
                            >
                                <option value="">
                                    {isLoadingRegions
                                        ? "Memuat wilayah..."
                                        : "Pilih wilayah"}
                                </option>

                                {regions.map((region) => (
                                    <option
                                        key={region.id}
                                        value={region.id}
                                    >
                                        {region.name} - {region.city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Alamat
                            </label>

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Masukkan alamat lengkap fasilitas"
                                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                            />
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Lokasi Fasilitas
                            </label>

                            <p className="mb-3 text-sm text-muted-foreground">
                                Tentukan lokasi fasilitas dengan klik pada peta atau geser pin.
                            </p>

                            <LocationPicker
                                latitude={form.latitude}
                                longitude={form.longitude}
                                onChange={(latitude, longitude) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        latitude,
                                        longitude,
                                    }));
                                }}
                            />
                        </div>

                        {/* Phone + Opening Hours */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Nomor Telepon
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Contoh: 0541xxxxxxx"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Jam Operasional
                                </label>

                                <input
                                    type="text"
                                    name="openingHours"
                                    value={form.openingHours}
                                    onChange={handleChange}
                                    placeholder="Contoh: Senin-Jumat 08:00-16:00"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tombol */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="rounded-md border px-5 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
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
                            : "Lanjut"}
                    </button>
                </div>
            </form>
        </div>
    );
}