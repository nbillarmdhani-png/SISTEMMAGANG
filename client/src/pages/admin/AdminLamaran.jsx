import { useState, useEffect, useCallback } from "react"
import { Download } from "lucide-react"
import toast from "react-hot-toast"

import { AdminTable } from "../../components/ui/AdminTable"
import { Modal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import { getAdminApplications, updateAdminApplicationStatus, exportAdminApplicationsCSV } from "../../api/admin.api"

const STATUS_COLORS = {
  menunggu: "bg-amber-100 text-amber-700",
  diterima: "bg-emerald-100 text-emerald-700",
  ditolak: "bg-red-100 text-red-700",
  dibatalkan: "bg-slate-100 text-slate-600",
}

const STATUS_OPTIONS = ["menunggu", "diterima", "ditolak", "dibatalkan"]

export default function AdminLamaran() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null) // application object
  const [editStatus, setEditStatus] = useState("")
  const [editCatatan, setEditCatatan] = useState("")
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterStatus, setFilterStatus] = useState("semua")

  const load = useCallback(async () => {
    setLoading(true)
    try { setApplications(await getAdminApplications()) }
    catch { toast.error("Gagal memuat lamaran") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(app) {
    setEditTarget(app)
    setEditStatus(app.status)
    setEditCatatan(app.catatan_perusahaan ?? "")
  }

  async function handleSave() {
    if (!editTarget) return
    setSaving(true)
    try {
      await updateAdminApplicationStatus(editTarget.id, { status: editStatus, catatan_perusahaan: editCatatan })
      toast.success("Status lamaran diperbarui")
      setEditTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const response = await exportAdminApplicationsCSV()
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `lamaran-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("File CSV berhasil diunduh")
    } catch {
      toast.error("Gagal mengekspor data")
    } finally {
      setExporting(false)
    }
  }

  const displayed =
    filterStatus === "semua"
      ? applications
      : applications.filter((a) => a.status === filterStatus)

  const columns = [
    {
      key: "mahasiswa",
      label: "Mahasiswa",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 text-sm">{row.mahasiswa?.nama_lengkap}</div>
          <div className="text-xs text-slate-400">{row.mahasiswa?.nim} · {row.mahasiswa?.program_studi?.nama_prodi}</div>
        </div>
      ),
    },
    {
      key: "posisi",
      label: "Posisi",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-800 text-sm">{row.lowongan_magang?.judul_posisi}</div>
          <div className="text-xs text-slate-400">{row.lowongan_magang?.perusahaan?.nama_perusahaan}</div>
        </div>
      ),
    },
    {
      key: "tgl_lamar",
      label: "Tgl Lamar",
      render: (row) =>
        new Date(row.tgl_lamar).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[row.status] ?? ""}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <Button size="sm" variant="outline" onClick={() => openEdit(row)} id={`btn-edit-lamaran-${row.id}`}>
          Ubah Status
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lamaran</h1>
          <p className="mt-1 text-sm text-slate-500">Tinjau dan perbarui status lamaran mahasiswa</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          id="btn-export-csv"
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Mengekspor..." : "Ekspor CSV"}
        </Button>
      </div>

      {/* Filter by status */}
      <div className="flex flex-wrap gap-2">
        {["semua", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            id={`filter-${s}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "semua" ? "Semua" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "semua" && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                {applications.filter((a) => a.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={displayed}
        loading={loading}
        total={displayed.length}
        emptyMsg="Tidak ada lamaran dengan status ini."
      />

      {/* Edit modal */}
      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Perbarui Status Lamaran"
        size="sm"
      >
        {editTarget && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-800">{editTarget.mahasiswa?.nama_lengkap}</p>
              <p className="text-slate-500">melamar: {editTarget.lowongan_magang?.judul_posisi}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="select-status-lamaran"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Perusahaan</label>
              <textarea
                value={editCatatan}
                onChange={(e) => setEditCatatan(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opsional, terlihat oleh mahasiswa..."
                id="input-catatan-perusahaan"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Batal</Button>
              <Button onClick={handleSave} disabled={saving} id="btn-simpan-status-lamaran">
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
