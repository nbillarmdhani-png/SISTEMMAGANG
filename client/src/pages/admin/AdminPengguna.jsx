import { useState, useEffect, useCallback } from "react"
import { Users, CheckCircle, XCircle, Search } from "lucide-react"
import toast from "react-hot-toast"

import { AdminTable } from "../../components/ui/AdminTable"
import { ConfirmModal } from "../../components/ui/Modal"
import { getAdminUsers, updateAdminUserStatus } from "../../api/admin.api"

const ROLE_LABELS = { mahasiswa: "Mahasiswa", admin: "Admin", dosen: "Dosen", perusahaan: "Perusahaan" }
const ROLE_COLORS = {
  mahasiswa: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  dosen: "bg-amber-100 text-amber-700",
  perusahaan: "bg-teal-100 text-teal-700",
}

export default function AdminPengguna() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [toggleTarget, setToggleTarget] = useState(null) // { user, toActive: bool }
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminUsers()
      setUsers(data)
      setFiltered(data)
    } catch {
      toast.error("Gagal memuat pengguna")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      users.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.mahasiswa?.nama_lengkap?.toLowerCase().includes(q) ||
          u.mahasiswa?.nim?.toLowerCase().includes(q)
      )
    )
  }, [search, users])

  async function handleToggle() {
    if (!toggleTarget) return
    setToggling(true)
    try {
      await updateAdminUserStatus(toggleTarget.user.id, toggleTarget.toActive ? 1 : 0)
      toast.success(
        toggleTarget.toActive ? "Pengguna diaktifkan" : "Pengguna dinonaktifkan"
      )
      setToggleTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal")
    } finally {
      setToggling(false)
    }
  }

  const columns = [
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 text-sm">{row.email}</div>
          {row.mahasiswa && (
            <div className="text-xs text-slate-400">
              {row.mahasiswa.nama_lengkap} · {row.mahasiswa.nim}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: "Peran",
      render: (row) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[row.role] ?? ""}`}>
          {ROLE_LABELS[row.role] ?? row.role}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) =>
        row.is_active ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <CheckCircle className="h-4 w-4" /> Aktif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
            <XCircle className="h-4 w-4" /> Nonaktif
          </span>
        ),
    },
    {
      key: "created_at",
      label: "Bergabung",
      render: (row) =>
        new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <button
          onClick={() => setToggleTarget({ user: row, toActive: !row.is_active })}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            row.is_active
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
          }`}
          id={`btn-toggle-user-${row.id}`}
        >
          {row.is_active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengguna</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola status akun pengguna</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total", value: users.length, color: "text-blue-600 bg-blue-50", icon: Users },
          { label: "Aktif", value: users.filter((u) => u.is_active).length, color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
          { label: "Nonaktif", value: users.filter((u) => !u.is_active).length, color: "text-red-600 bg-red-50", icon: XCircle },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`inline-flex rounded-lg p-2 ${s.color} mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari email, nama, atau NIM..."
          className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          id="input-cari-pengguna"
        />
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        loading={loading}
        total={filtered.length}
        emptyMsg="Tidak ada pengguna yang cocok."
      />

      <ConfirmModal
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggle}
        loading={toggling}
        danger={!toggleTarget?.toActive}
        title={toggleTarget?.toActive ? "Aktifkan Pengguna" : "Nonaktifkan Pengguna"}
        confirmLabel={toggleTarget?.toActive ? "Aktifkan" : "Nonaktifkan"}
        message={`Yakin ingin ${toggleTarget?.toActive ? "mengaktifkan" : "menonaktifkan"} akun ${toggleTarget?.user?.email}?`}
      />
    </div>
  )
}
