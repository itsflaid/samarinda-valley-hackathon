"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Role = "NAKES" | "PETUGAS";

type Region = {
  id: string;
  name: string;
  city: string;
};

type Facility = {
  id: string;
  name: string;
  type: "PUSKESMAS" | "RUMAH_SAKIT" | "KLINIK";
  region?: {
    id: string;
    name: string;
    city: string;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
  nohp: string;
  role: Role;
  profesi?: "DOKTER" | "PERAWAT" | "BIDAN" | null;
  instansi?: string | null;

  regions?: Region[];
  facilities?: Facility[];

  createdAt?: string;
};

type UserTableProps = {
  role: Role;
};

export default function UserTable({ role }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([]);
  const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>(
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    nohp: "",
    password: "",
    profesi: "",
    instansi: "",
  });

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/users?role=${role}`);

      if (!response.ok) {
        throw new Error("Gagal mengambil data user");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      toast.error("Gagal mengambil data user");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // FETCH REGIONS
  // =========================================================

  const fetchRegions = async () => {
    try {
      const response = await fetch("/api/regions");

      if (!response.ok) {
        throw new Error("Gagal mengambil wilayah");
      }

      const data = await response.json();

      setRegions(data);
    } catch (error) {
      console.error("FETCH REGIONS ERROR:", error);
      toast.error("Gagal mengambil data wilayah");
    }
  };

  // =========================================================
  // FETCH FACILITIES
  // =========================================================

  const fetchFacilities = async () => {
    try {
      const response = await fetch("/api/facilities", {
        method: "GET",
        cache: "no-store",
      });

      console.log("STATUS /api/facilities:", response.status);

      const data = await response.json();

      console.log("DATA /api/facilities:", data);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal mengambil fasilitas"
        );
      }

      // API kamu seharusnya mengembalikan array.
      // Tapi kita buat aman kalau ternyata response berbentuk { facilities: [...] }
      const facilityData = Array.isArray(data)
        ? data
        : Array.isArray(data?.facilities)
          ? data.facilities
          : [];

      console.log("FACILITY DATA:", facilityData);

      setFacilities(facilityData);
    } catch (error) {
      console.error("FETCH FACILITIES ERROR:", error);

      setFacilities([]);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data fasilitas"
      );
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
  fetchUsers();

  if (role === "NAKES") {
    fetchFacilities();
  } else {
    fetchRegions();
    setFacilities([]);
  }
}, [role]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

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

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      nohp: "",
      password: "",
      profesi: "",
      instansi: "",
    });

    setSelectedRegionIds([]);
    setSelectedFacilityIds([]);

    setEditingUser(null);
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      nohp: user.nohp,
      password: "",
      profesi: user.profesi ?? "",
      instansi: user.instansi ?? "",
    });

    // Assignment PETUGAS
    setSelectedRegionIds(
      user.regions?.map((region) => region.id) ?? []
    );

    // Assignment NAKES
    setSelectedFacilityIds(
      user.facilities?.map((facility) => facility.id) ?? []
    );

    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal = () => {
    if (isSubmitting) return;

    setIsModalOpen(false);
    resetForm();
  };

  // =========================================================
  // SUBMIT FORM
  // =========================================================

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi umum
    if (!form.name || !form.email || !form.nohp) {
      toast.error("Lengkapi data user terlebih dahulu");
      return;
    }

    // Password wajib saat tambah user
    if (!editingUser && !form.password) {
      toast.error("Password wajib diisi");
      return;
    }

    // Validasi Nakes
    if (role === "NAKES" && !form.profesi) {
      toast.error("Profesi wajib diisi untuk Nakes");
      return;
    }

    // Validasi assignment
    if (role === "NAKES" && selectedFacilityIds.length === 0) {
      toast.error("Pilih minimal satu fasilitas kesehatan");
      return;
    }

    if (role === "PETUGAS" && selectedRegionIds.length === 0) {
      toast.error("Pilih minimal satu wilayah kerja");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: form.name,
        email: form.email,
        nohp: form.nohp,
        password: form.password,
        role,
        profesi: role === "NAKES" ? form.profesi : null,
        instansi: form.instansi || null,

        ...(role === "NAKES"
          ? {
            facilityIds: selectedFacilityIds,
          }
          : {
            regionIds: selectedRegionIds,
          }),
      };

      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users";

      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menyimpan data user"
        );
      }

      toast.success(
        editingUser
          ? "User berhasil diperbarui"
          : "User berhasil ditambahkan"
      );

      setIsModalOpen(false);
      resetForm();

      await fetchUsers();
    } catch (error) {
      console.error("SUBMIT USER ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus user "${user.name}"?`
    );

    if (!confirmed) return;

    try {
      setIsDeleteLoading(true);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menghapus user"
        );
      }

      toast.success("User berhasil dihapus");

      await fetchUsers();
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus user"
      );
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // =========================================================
  // FORMAT ROLE
  // =========================================================

  const formatRole = (role: Role) => {
    if (role === "NAKES") return "Nakes";
    if (role === "PETUGAS") return "Petugas";

    return role;
  };

  // =========================================================
  // FORMAT FACILITY TYPE
  // =========================================================

  const formatFacilityType = (type: Facility["type"]) => {
    switch (type) {
      case "PUSKESMAS":
        return "Puskesmas";

      case "RUMAH_SAKIT":
        return "Rumah Sakit";

      case "KLINIK":
        return "Klinik";

      default:
        return type;
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="space-y-6">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Data {formatRole(role)}
            </h2>

            <p className="text-sm text-muted-foreground">
              Kelola akun dan penugasan {formatRole(role).toLowerCase()}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            + Tambah
          </button>
        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-semibold">
                    No
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Nama
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    No. HP
                  </th>

                  {role === "NAKES" && (
                    <th className="px-4 py-3 text-left font-semibold">
                      Profesi
                    </th>
                  )}

                  <th className="px-4 py-3 text-left font-semibold">
                    {role === "NAKES"
                      ? "Fasilitas Kerja"
                      : "Wilayah Kerja"}
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Instansi
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={role === "NAKES" ? 8 : 7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === "NAKES" ? 8 : 7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Belum ada data {formatRole(role).toLowerCase()}.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0"
                    >
                      {/* No */}
                      <td className="px-4 py-4 align-top">
                        {index + 1}
                      </td>

                      {/* Nama */}
                      <td className="px-4 py-4 align-top">
                        <div>
                          <p className="font-medium">
                            {user.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {formatRole(user.role)}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 align-top">
                        {user.email}
                      </td>

                      {/* No HP */}
                      <td className="px-4 py-4 align-top">
                        {user.nohp}
                      </td>

                      {/* Profesi Nakes */}
                      {role === "NAKES" && (
                        <td className="px-4 py-4 align-top">
                          {user.profesi || "-"}
                        </td>
                      )}

                      {/* Assignment */}
                      <td className="px-4 py-4 align-top">
                        {role === "NAKES" ? (
                          user.facilities &&
                            user.facilities.length > 0 ? (
                            <div className="space-y-1">
                              {user.facilities.map((facility) => (
                                <div key={facility.id}>
                                  <p className="font-medium">
                                    {facility.name}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {formatFacilityType(
                                      facility.type
                                    )}

                                    {facility.region
                                      ? ` • ${facility.region.name}`
                                      : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Belum ditugaskan
                            </span>
                          )
                        ) : user.regions &&
                          user.regions.length > 0 ? (
                          <div className="space-y-1">
                            {user.regions.map((region) => (
                              <div key={region.id}>
                                <p className="font-medium">
                                  {region.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {region.city}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>

                      {/* Instansi */}
                      <td className="px-4 py-4 align-top">
                        {user.instansi || "-"}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:bg-muted"
                            title="Edit user"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isDeleteLoading}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Hapus user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL */}
      {/* ===================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingUser
                    ? `Edit ${formatRole(role)}`
                    : `Tambah ${formatRole(role)}`}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Isi data akun dan penugasan.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="rounded-md p-2 transition hover:bg-muted disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] overflow-y-auto"
            >
              <div className="space-y-5 px-6 py-5">
                {/* Nama */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* No HP */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nomor HP
                  </label>

                  <input
                    type="text"
                    name="nohp"
                    value={form.nohp}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password
                    {editingUser && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (kosongkan jika tidak ingin mengubah)
                      </span>
                    )}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      editingUser
                        ? "Password baru"
                        : "Masukkan password"
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required={!editingUser}
                  />
                </div>

                {/* Profesi Nakes */}
                {role === "NAKES" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Profesi
                    </label>

                    <select
                      name="profesi"
                      value={form.profesi}
                      onChange={handleChange}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="">
                        Pilih profesi
                      </option>

                      <option value="DOKTER">
                        Dokter
                      </option>

                      <option value="PERAWAT">
                        Perawat
                      </option>

                      <option value="BIDAN">
                        Bidan
                      </option>
                    </select>
                  </div>
                )}

                {/* Instansi */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Instansi
                  </label>

                  <input
                    type="text"
                    name="instansi"
                    value={form.instansi}
                    onChange={handleChange}
                    placeholder="Contoh: Dinas Kesehatan"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* ================================================= */}
                {/* NAKES → FACILITIES */}
                {/* ================================================= */}

                {role === "NAKES" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Fasilitas Kesehatan
                    </label>

                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                      {facilities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data fasilitas.
                        </p>
                      ) : (
                        facilities.map((facility) => (
                          <label
                            key={facility.id}
                            className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm transition hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedFacilityIds.includes(
                                facility.id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFacilityIds(
                                    (prev) => [
                                      ...prev,
                                      facility.id,
                                    ]
                                  );
                                } else {
                                  setSelectedFacilityIds(
                                    (prev) =>
                                      prev.filter(
                                        (id) =>
                                          id !== facility.id
                                      )
                                  );
                                }
                              }}
                            />

                            <div>
                              <p className="font-medium">
                                {facility.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {formatFacilityType(
                                  facility.type
                                )}

                                {facility.region
                                  ? ` • ${facility.region.name}`
                                  : ""}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Pilih satu atau lebih fasilitas tempat Nakes
                      bertugas.
                    </p>
                  </div>
                ) : (
                  /* ================================================= */
                  /* PETUGAS → REGIONS */
                  /* ================================================= */

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Wilayah Kerja
                    </label>

                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                      {regions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data wilayah.
                        </p>
                      ) : (
                        regions.map((region) => (
                          <label
                            key={region.id}
                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRegionIds.includes(
                                region.id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRegionIds(
                                    (prev) => [
                                      ...prev,
                                      region.id,
                                    ]
                                  );
                                } else {
                                  setSelectedRegionIds(
                                    (prev) =>
                                      prev.filter(
                                        (id) =>
                                          id !== region.id
                                      )
                                  );
                                }
                              }}
                            />

                            <div>
                              <p className="font-medium">
                                {region.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {region.city}
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Pilih satu atau lebih wilayah yang menjadi
                      tanggung jawab Petugas.
                    </p>
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* MODAL FOOTER */}
              {/* ================================================= */}

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingUser
                      ? "Simpan Perubahan"
                      : "Tambah User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}