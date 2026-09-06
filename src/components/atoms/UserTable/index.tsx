"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Role =
  | "NAKES"
  | "PETUGAS";

type Region = {
  id: string;
  name: string;
  city: string;
};

type Facility = {
  id: string;
  name: string;
  type:
    | "PUSKESMAS"
    | "RUMAH_SAKIT"
    | "KLINIK";
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
  profesi?:
    | "DOKTER"
    | "PERAWAT"
    | "BIDAN"
    | null;
  instansi?: string | null;

  regions?: Region[];
  facilities?: Facility[];

  createdAt?: string;
};

type UserTableProps = {
  role: Role;
};

export default function UserTable({
  role,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>(
    []
  );

  const [regions, setRegions] = useState<
    Region[]
  >([]);

  const [facilities, setFacilities] =
    useState<Facility[]>([]);

  const [
    selectedRegionIds,
    setSelectedRegionIds,
  ] = useState<string[]>([]);

  const [
    selectedFacilityIds,
    setSelectedFacilityIds,
  ] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isDeleteLoading,
    setIsDeleteLoading,
  ] = useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    nohp: "",
    password: "",
    profesi: "",
    instansi: "",
  });

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const usersRequest = fetch(
          `/api/users?role=${role}`,
          {
            cache: "no-store",
          }
        );

        const secondaryRequest =
          role === "NAKES"
            ? fetch("/api/facilities", {
                cache: "no-store",
              })
            : fetch("/api/regions", {
                cache: "no-store",
              });

        const [
          usersResponse,
          secondaryResponse,
        ] = await Promise.all([
          usersRequest,
          secondaryRequest,
        ]);

        const usersData =
          await usersResponse.json();

        const secondaryData =
          await secondaryResponse.json();

        if (!usersResponse.ok) {
          throw new Error(
            usersData?.message ||
              "Gagal mengambil data user"
          );
        }

        if (!secondaryResponse.ok) {
          throw new Error(
            secondaryData?.message ||
              (role === "NAKES"
                ? "Gagal mengambil fasilitas"
                : "Gagal mengambil wilayah")
          );
        }

        setUsers(
          Array.isArray(usersData)
            ? usersData
            : []
        );

        if (role === "NAKES") {
          const facilityData =
            Array.isArray(
              secondaryData
            )
              ? secondaryData
              : secondaryData?.facilities;

          setFacilities(
            Array.isArray(
              facilityData
            )
              ? facilityData
              : []
          );

          setRegions([]);
        } else {
          const regionData =
            Array.isArray(
              secondaryData
            )
              ? secondaryData
              : secondaryData?.regions;

          setRegions(
            Array.isArray(regionData)
              ? regionData
              : []
          );

          setFacilities([]);
        }
      } catch (error) {
        console.error(
          "FETCH USER TABLE ERROR:",
          error
        );

        setUsers([]);
        setRegions([]);
        setFacilities([]);

        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [role]);

  // =========================================================
  // REFRESH USERS
  // =========================================================

  const refreshUsers = async () => {
    try {
      const response = await fetch(
        `/api/users?role=${role}`,
        {
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengambil data user"
        );
      }

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "REFRESH USERS ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data user"
      );
    }
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement |
        HTMLTextAreaElement
    >
  ) => {
    const { name, value } =
      e.target;

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

    setSelectedRegionIds(
      []
    );

    setSelectedFacilityIds(
      []
    );

    setEditingUser(null);
  };

  // =========================================================
  // ADD
  // =========================================================

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (
    user: User
  ) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      nohp: user.nohp,
      password: "",
      profesi:
        user.profesi ?? "",
      instansi:
        user.instansi ?? "",
    });

    setSelectedRegionIds(
      user.regions?.map(
        (region) => region.id
      ) ?? []
    );

    setSelectedFacilityIds(
      user.facilities?.map(
        (facility) => facility.id
      ) ?? []
    );

    setIsModalOpen(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleCloseModal =
    () => {
      if (isSubmitting) {
        return;
      }

      setIsModalOpen(false);
      resetForm();
    };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.nohp
    ) {
      toast.error(
        "Lengkapi data user terlebih dahulu"
      );
      return;
    }

    if (
      !editingUser &&
      !form.password
    ) {
      toast.error(
        "Password wajib diisi"
      );
      return;
    }

    if (
      role === "NAKES" &&
      !form.profesi
    ) {
      toast.error(
        "Profesi wajib diisi untuk Nakes"
      );
      return;
    }

    if (
      role === "NAKES" &&
      selectedFacilityIds.length === 0
    ) {
      toast.error(
        "Pilih minimal satu fasilitas kesehatan"
      );
      return;
    }

    if (
      role === "PETUGAS" &&
      selectedRegionIds.length === 0
    ) {
      toast.error(
        "Pilih minimal satu wilayah kerja"
      );
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
        profesi:
          role === "NAKES"
            ? form.profesi
            : null,
        instansi:
          form.instansi || null,

        ...(role === "NAKES"
          ? {
              facilityIds:
                selectedFacilityIds,
            }
          : {
              regionIds:
                selectedRegionIds,
            }),
      };

      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users";

      const method = editingUser
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal menyimpan data user"
        );
      }

      toast.success(
        editingUser
          ? "User berhasil diperbarui"
          : "User berhasil ditambahkan"
      );

      setIsModalOpen(false);
      resetForm();

      await refreshUsers();
    } catch (error) {
      console.error(
        "SUBMIT USER ERROR:",
        error
      );

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
  // DELETE
  // =========================================================

  const handleDelete = async (
    user: User
  ) => {
    const confirmed =
      window.confirm(
        `Yakin ingin menghapus user "${user.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleteLoading(true);

      const response =
        await fetch(
          `/api/users/${user.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal menghapus user"
        );
      }

      toast.success(
        "User berhasil dihapus"
      );

      await refreshUsers();
    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

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
  // FORMAT
  // =========================================================

  const formatRole = (
    userRole: Role
  ) => {
    if (userRole === "NAKES") {
      return "Nakes";
    }

    return "Petugas";
  };

  const formatFacilityType = (
    type: Facility["type"]
  ) => {
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
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Data{" "}
              {formatRole(role)}
            </h2>

            <p className="text-sm text-muted-foreground">
              Kelola akun dan penugasan{" "}
              {formatRole(
                role
              ).toLowerCase()}
              .
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

        {/* TABLE */}

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

                  {role ===
                    "NAKES" && (
                    <th className="px-4 py-3 text-left font-semibold">
                      Profesi
                    </th>
                  )}

                  <th className="px-4 py-3 text-left font-semibold">
                    {role ===
                    "NAKES"
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
                      colSpan={
                        role ===
                        "NAKES"
                          ? 8
                          : 7
                      }
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : users.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={
                        role ===
                        "NAKES"
                          ? 8
                          : 7
                      }
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Belum ada data{" "}
                      {formatRole(
                        role
                      ).toLowerCase()}
                      .
                    </td>
                  </tr>
                ) : (
                  users.map(
                    (
                      user,
                      index
                    ) => (
                      <tr
                        key={
                          user.id
                        }
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-4 align-top">
                          {index + 1}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div>
                            <p className="font-medium">
                              {
                                user.name
                              }
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {formatRole(
                                user.role
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 align-top">
                          {
                            user.email
                          }
                        </td>

                        <td className="px-4 py-4 align-top">
                          {
                            user.nohp
                          }
                        </td>

                        {role ===
                          "NAKES" && (
                          <td className="px-4 py-4 align-top">
                            {user.profesi ||
                              "-"}
                          </td>
                        )}

                        {/* ASSIGNMENT */}

                        <td className="px-4 py-4 align-top">
                          {role ===
                          "NAKES" ? (
                            user.facilities &&
                            user
                              .facilities
                              .length >
                              0 ? (
                              <div className="space-y-1">
                                {user.facilities.map(
                                  (
                                    facility
                                  ) => (
                                    <div
                                      key={
                                        facility.id
                                      }
                                    >
                                      <p className="font-medium">
                                        {
                                          facility.name
                                        }
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
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                Belum ditugaskan
                              </span>
                            )
                          ) : user.regions &&
                            user.regions
                              .length >
                              0 ? (
                            <div className="space-y-1">
                              {user.regions.map(
                                (
                                  region
                                ) => (
                                  <div
                                    key={
                                      region.id
                                    }
                                  >
                                    <p className="font-medium">
                                      {
                                        region.name
                                      }
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {
                                        region.city
                                      }
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Belum ditugaskan
                            </span>
                          )}
                        </td>

                        {/* INSTANSI */}

                        <td className="px-4 py-4 align-top">
                          {user.instansi ||
                            "-"}
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  user
                                )
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border transition hover:bg-muted"
                              title="Edit user"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                              disabled={
                                isDeleteLoading
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Hapus user"
                            >
                              <Trash2 className="h-4 w-4" />
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
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingUser
                    ? `Edit ${formatRole(
                        role
                      )}`
                    : `Tambah ${formatRole(
                        role
                      )}`}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Isi data akun dan
                  penugasan.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={
                  isSubmitting
                }
                className="rounded-md p-2 transition hover:bg-muted disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* BODY */}

            <form
              onSubmit={
                handleSubmit
              }
              className="max-h-[75vh] overflow-y-auto"
            >
              <div className="space-y-5 px-6 py-5">
                {/* NAMA */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nama Lengkap
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="contoh@email.com"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* NO HP */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Nomor HP
                  </label>

                  <input
                    type="text"
                    name="nohp"
                    value={
                      form.nohp
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Password

                    {editingUser && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (kosongkan jika
                        tidak ingin
                        mengubah)
                      </span>
                    )}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      editingUser
                        ? "Password baru"
                        : "Masukkan password"
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                    required={
                      !editingUser
                    }
                  />
                </div>

                {/* PROFESI */}

                {role ===
                  "NAKES" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Profesi
                    </label>

                    <select
                      name="profesi"
                      value={
                        form.profesi
                      }
                      onChange={
                        handleChange
                      }
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

                {/* INSTANSI */}

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Instansi
                  </label>

                  <input
                    type="text"
                    name="instansi"
                    value={
                      form.instansi
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: Dinas Kesehatan"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* NAKES → FACILITY */}

                {role ===
                "NAKES" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Fasilitas Kesehatan
                    </label>

                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                      {facilities.length ===
                      0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data
                          fasilitas.
                        </p>
                      ) : (
                        facilities.map(
                          (
                            facility
                          ) => (
                            <label
                              key={
                                facility.id
                              }
                              className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm transition hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                className="mt-1"
                                checked={selectedFacilityIds.includes(
                                  facility.id
                                )}
                                onChange={(
                                  e
                                ) => {
                                  if (
                                    e
                                      .target
                                      .checked
                                  ) {
                                    setSelectedFacilityIds(
                                      (
                                        prev
                                      ) => [
                                        ...prev,
                                        facility.id,
                                      ]
                                    );
                                  } else {
                                    setSelectedFacilityIds(
                                      (
                                        prev
                                      ) =>
                                        prev.filter(
                                          (
                                            id
                                          ) =>
                                            id !==
                                            facility.id
                                        )
                                    );
                                  }
                                }}
                              />

                              <div>
                                <p className="font-medium">
                                  {
                                    facility.name
                                  }
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
                          )
                        )
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Pilih satu atau
                      lebih fasilitas
                      tempat Nakes
                      bertugas.
                    </p>
                  </div>
                ) : (
                  /* PETUGAS → REGION */

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Wilayah Kerja
                    </label>

                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                      {regions.length ===
                      0 ? (
                        <p className="text-sm text-muted-foreground">
                          Belum ada data
                          wilayah.
                        </p>
                      ) : (
                        regions.map(
                          (
                            region
                          ) => (
                            <label
                              key={
                                region.id
                              }
                              className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm transition hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRegionIds.includes(
                                  region.id
                                )}
                                onChange={(
                                  e
                                ) => {
                                  if (
                                    e
                                      .target
                                      .checked
                                  ) {
                                    setSelectedRegionIds(
                                      (
                                        prev
                                      ) => [
                                        ...prev,
                                        region.id,
                                      ]
                                    );
                                  } else {
                                    setSelectedRegionIds(
                                      (
                                        prev
                                      ) =>
                                        prev.filter(
                                          (
                                            id
                                          ) =>
                                            id !==
                                            region.id
                                        )
                                    );
                                  }
                                }}
                              />

                              <div>
                                <p className="font-medium">
                                  {
                                    region.name
                                  }
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {
                                    region.city
                                  }
                                </p>
                              </div>
                            </label>
                          )
                        )
                      )}
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Pilih satu atau
                      lebih wilayah
                      yang menjadi
                      tanggung jawab
                      Petugas.
                    </p>
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    isSubmitting
                  }
                  className="rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting
                  }
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