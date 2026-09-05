"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  nohp: string;
  role: "NAKES" | "PETUGAS";
  profesi?: "DOKTER" | "PERAWAT" | "BIDAN";
  instansi?: string;
  wilayahKerja?: string;
};

const users: User[] = [
  {
    id: "1",
    name: "Budi Santoso",
    email: "budi@gmail.com",
    nohp: "081234567890",
    role: "NAKES",
    profesi: "DOKTER",
    instansi: "Puskesmas Palaran",
    wilayahKerja: "Samarinda",
  },
  {
    id: "2",
    name: "Siti Aminah",
    email: "siti@gmail.com",
    nohp: "081234567891",
    role: "NAKES",
    profesi: "PERAWAT",
    instansi: "Puskesmas Samarinda",
    wilayahKerja: "Samarinda",
  },
  {
    id: "3",
    name: "Andi Saputra",
    email: "andi@gmail.com",
    nohp: "081234567892",
    role: "PETUGAS",
    instansi: "Puskesmas Palaran",
    wilayahKerja: "Samarinda",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    email: "dewi@gmail.com",
    nohp: "081234567893",
    role: "PETUGAS",
    instansi: "Puskesmas Sungai Kunjang",
    wilayahKerja: "Samarinda",
  },
];

const formatRole = (role: User["role"]) => {
  if (role === "NAKES") return "Nakes";
  return "Petugas";
};

const formatProfesi = (profesi?: User["profesi"]) => {
  if (!profesi) return "-";

  return (
    profesi.charAt(0) +
    profesi.slice(1).toLowerCase()
  );
};

export function UserTable({
  title,
  subtitle,
  role,
}: {
  title: string;
  subtitle: string;
  role: User["role"];
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [isDeleteLoading, setIsDeleteLoading] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    nohp: "",
    password: "",
    profesi: "",
    instansi: "",
    wilayahKerja: "",
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/users?role=${role}`
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const data = await response.json();

      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

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
        instansi: form.instansi,
        wilayahKerja: form.wilayahKerja,
      };

      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users";

      const method = editingUser
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Gagal menyimpan user"
        );
        return;
      }

      alert(
        editingUser
          ? "User berhasil diperbarui"
          : "User berhasil ditambahkan"
      );

      setIsModalOpen(false);
      setEditingUser(null);

      setForm({
        name: "",
        email: "",
        nohp: "",
        password: "",
        profesi: "",
        instansi: "",
        wilayahKerja: "",
      });

      await fetchUsers();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      nohp: user.nohp,
      password: "",
      profesi: user.profesi ?? "",
      instansi: user.instansi ?? "",
      wilayahKerja: user.wilayahKerja ?? "",
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleteLoading(true);

      const response = await fetch(
        `/api/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Gagal menghapus user"
        );
        return;
      }

      alert("User berhasil dihapus");

      await fetchUsers();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      nohp: "",
      password: "",
      profesi: "",
      instansi: "",
      wilayahKerja: "",
    });

    setIsModalOpen(true);
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

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          + Tambah
        </button>
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
                  Nama Lengkap
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  No HP
                </th>

                {role === "NAKES" && (
                  <th className="px-4 py-3">
                    Profesi
                  </th>
                )}

                <th className="px-4 py-3">
                  Instansi
                </th>

                <th className="px-4 py-3">
                  Wilayah Kerja
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
                    colSpan={role === "NAKES" ? 8 : 7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="text-sm text-foreground even:bg-muted/40"
                  >
                    {/* isi tabel lu */}
                  </tr>
                ))
              )}

              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="text-sm text-foreground even:bg-muted/40"
                >

                  <td className="px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {user.name}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {user.nohp}
                  </td>

                  {role === "NAKES" && (
                    <td className="px-4 py-3">
                      {formatProfesi(user.profesi)}
                    </td>
                  )}

                  <td className="px-4 py-3">
                    {user.instansi ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    {user.wilayahKerja ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">

                      <button
                        type="button"
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        <Pencil className="size-3" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={isDeleteLoading}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="size-3" />
                        Hapus
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={role === "NAKES" ? 8 : 7}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </section>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background p-6 shadow-xl">

            {/* Header Modal */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {editingUser ? "Edit" : "Tambah"}{" "}
                  {role === "NAKES"
                    ? "Nakes"
                    : "Petugas"}
                </h3>

                <p className="text-sm text-muted-foreground">
                  Masukkan data user baru
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                }}
                className="rounded-md p-2 hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Nama */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                  placeholder="contoh@email.com"
                />
              </div>

              {/* No HP */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  No HP
                </label>

                <input
                  type="tel"
                  value={form.nohp}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nohp: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
                  placeholder="081234567890"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Password
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  minLength={6}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder={
                    editingUser
                      ? "Kosongkan jika tidak ingin mengubah password"
                      : "Minimal 6 karakter"
                  }
                />
              </div>

              {/* Profesi */}
              {role === "NAKES" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Profesi
                  </label>

                  <select
                    value={form.profesi}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        profesi: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-medium">
                  Instansi
                </label>

                <input
                  type="text"
                  value={form.instansi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      instansi: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Contoh: Puskesmas Palaran"
                />
              </div>

              {/* Wilayah */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Wilayah Kerja
                </label>

                <input
                  type="text"
                  value={form.wilayahKerja}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      wilayahKerja: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Contoh: Samarinda"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                  }}
                  disabled={isSubmitting}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Menyimpan..."
                    : "Simpan"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
