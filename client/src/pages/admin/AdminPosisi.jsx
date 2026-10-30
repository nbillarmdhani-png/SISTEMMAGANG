import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2, PlusCircle, X } from "lucide-react"
import toast from "react-hot-toast"

import { AdminTable } from "../../components/ui/AdminTable"
import { Modal, ConfirmModal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import {
  getAdminPositions,
  createAdminPosition,
  updateAdminPosition,
  deleteAdminPosition,
} from "../../api/admin.api"
import { getAdminCompanies, getAdminCompetencies } from "../../api/admin.api"

const kompetensiItem = z.object({
  kompetensi_id: z.coerce.number().int().positive("Pilih kompetensi"),
  bobot: z.coerce.number().min(0.01).max(9.99),
  is_wajib: z.coerce.number().int().min(0).max(1),
})

const schema = z.object({
  perusahaan_id: z.coerce.number().int().positive("Pilih perusahaan"),
  judul_posisi: z.string().min(2, "Minimal 2 karakter"),
  deskripsi: z.string().optional(),
  kuota: z.coerce.number().int().min(1, "Min 1"),
  durasi_bulan: z.coerce.number().int().min(1).max(24),
  tgl_buka: z.string().min(1, "Wajib diisi"),
  tgl_tutup: z.string().min(1, "Wajib diisi"),
  min_semester: z.coerce.number().int().min(1).max(14).optional().nullable(),
  min_ipk: z.coerce.number().min(0).max(4).optional().nullable(),
  is_remote: z.coerce.number().int().min(0).max(1),
  link_pendaftaran: z.string().url("URL tidak valid").optional().or(z.literal("")).nullable(),
  status: z.enum(["draft", "aktif", "ditutup"]),
  kompetensi: z.array(kompetensiItem).optional(),
}).refine((d) => !d.tgl_buka || !d.tgl_tutup || d.tgl_tutup >= d.tgl_buka, {
  message: "Tanggal tutup harus >= tanggal buka",
  path: ["tgl_tutup"],
})

const defaultValues = {
  perusahaan_id: "",
  judul_posisi: "",
  deskripsi: "",
  kuota: 1,
  durasi_bulan: 3,
  tgl_buka: "",
  tgl_tutup: "",
  min_semester: "",
  min_ipk: "",
  is_remote: 0,
  link_pendaftaran: "",
  status: "draft",
  kompetensi: [],
}

const STATUS_COLORS = {
  aktif: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
  ditutup: "bg-red-100 text-red-700",
}

function toDateInput(val) {
  if (!val) return ""
  return new Date(val).toISOString().split("T")[0]
}

export default function AdminPosisi() {
  const [positions, setPositions] = useState([])
  const [companies, setCompanies] = useState([])
  const [competencies, setCompetencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { fields: kompFields, append: appendKomp, remove: removeKomp } = useFieldArray({
    control,
    name: "kompetensi",
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [pos, comp, komps] = await Promise.all([
        getAdminPositions(),
        getAdminCompanies(),
        getAdminCompetencies(),
      ])
      setPositions(pos)
      setCompanies(comp)
      setCompetencies(komps)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  function openCreate() {
    setEditing(null)
    reset(defaultValues)
    setFormOpen(true)
  }

  function openEdit(pos) {
    setEditing(pos)
    reset({
      perusahaan_id: pos.perusahaan_id,
      judul_posisi: pos.judul_posisi,
      deskripsi: pos.deskripsi ?? "",
      kuota: pos.kuota,
      durasi_bulan: pos.durasi_bulan,
      tgl_buka: toDateInput(pos.tgl_buka),
      tgl_tutup: toDateInput(pos.tgl_tutup),
      min_semester: pos.min_semester ?? "",
      min_ipk: pos.min_ipk ?? "",
      is_remote: pos.is_remote,
      link_pendaftaran: pos.link_pendaftaran ?? "",
      status: pos.status,
      kompetensi: (pos.lowongan_kompetensi ?? []).map((lk) => ({
        kompetensi_id: lk.kompetensi_id,
        bobot: Number(lk.bobot),
        is_wajib: lk.wajib ?? 0,
      })),
    })
    setFormOpen(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      const payload = {
        ...values,
        min_semester: values.min_semester || null,
        min_ipk: values.min_ipk || null,
      }
      if (editing) {
        await updateAdminPosition(editing.id, payload)
        toast.success("Posisi berhasil diperbarui")
      } else {
        await createAdminPosition(payload)
        toast.success("Posisi berhasil ditambahkan")
      }
      setFormOpen(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menyimpan")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAdminPosition(deleteTarget.id)
      toast.success("Posisi berhasil dihapus")
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menghapus")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: "judul_posisi",
      label: "Posisi",
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.judul_posisi}</div>
          <div className="text-xs text-slate-400">{row.perusahaan?.nama_perusahaan}</div>
        </div>
      ),
    },
    { key: "kuota", label: "Kuota" },
    { key: "durasi_bulan", label: "Durasi (bln)" },
    {
      key: "tgl_tutup",
      label: "Tutup",
      render: (row) => toDateInput(row.tgl_tutup),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[row.status] ?? ""}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors" title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Hapus">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Posisi / Lowongan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola lowongan magang beserta kompetensi yang dibutuhkan</p>
        </div>
        <Button onClick={openCreate} id="btn-tambah-posisi">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Posisi
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={positions}
        loading={loading}
        total={positions.length}
        emptyMsg="Belum ada posisi."
      />

      {/* Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Posisi" : "Tambah Posisi"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1" id="form-posisi">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Perusahaan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Perusahaan <span className="text-red-500">*</span>
              </label>
              <select
                {...register("perusahaan_id")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="select-perusahaan"
              >
                <option value="">-- Pilih Perusahaan --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.nama_perusahaan}</option>
                ))}
              </select>
              {errors.perusahaan_id && <p className="mt-1 text-xs text-red-500">{errors.perusahaan_id.message}</p>}
            </div>

            {/* Judul Posisi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Judul Posisi <span className="text-red-500">*</span>
              </label>
              <input
                {...register("judul_posisi")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer Intern"
                id="input-judul-posisi"
              />
              {errors.judul_posisi && <p className="mt-1 text-xs text-red-500">{errors.judul_posisi.message}</p>}
            </div>

            {/* Kuota */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kuota</label>
              <input type="number" {...register("kuota")} min={1} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-kuota" />
            </div>

            {/* Durasi */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (bulan)</label>
              <input type="number" {...register("durasi_bulan")} min={1} max={24} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-durasi" />
            </div>

            {/* Tgl Buka */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Buka <span className="text-red-500">*</span></label>
              <input type="date" {...register("tgl_buka")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-tgl-buka" />
              {errors.tgl_buka && <p className="mt-1 text-xs text-red-500">{errors.tgl_buka.message}</p>}
            </div>

            {/* Tgl Tutup */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tgl Tutup <span className="text-red-500">*</span></label>
              <input type="date" {...register("tgl_tutup")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-tgl-tutup" />
              {errors.tgl_tutup && <p className="mt-1 text-xs text-red-500">{errors.tgl_tutup.message}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select {...register("status")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="select-status">
                <option value="draft">Draft</option>
                <option value="aktif">Aktif</option>
                <option value="ditutup">Ditutup</option>
              </select>
            </div>

            {/* Is Remote */}
            <div className="flex items-center gap-3 pt-5">
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" {...register("is_remote")} value="1" className="sr-only peer" id="toggle-remote" />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
                <span className="ml-2 text-sm font-medium text-slate-700">Remote</span>
              </label>
            </div>

            {/* Min Semester */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Semester</label>
              <input type="number" {...register("min_semester")} min={1} max={14} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kosongkan jika tidak ada" id="input-min-semester" />
            </div>

            {/* Min IPK */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min IPK</label>
              <input type="number" {...register("min_ipk")} min={0} max={4} step={0.01} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kosongkan jika tidak ada" id="input-min-ipk" />
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <textarea
                {...register("deskripsi")}
                rows={3}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deskripsi singkat posisi..."
                id="input-deskripsi"
              />
            </div>

            {/* Link Pendaftaran Resmi */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link Pendaftaran Resmi (Portal Karir / Google Form)
              </label>
              <input
                {...register("link_pendaftaran")}
                type="url"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://careers.perusahaan.com/jobs/..."
                id="input-link-pendaftaran"
              />
              {errors.link_pendaftaran && <p className="mt-1 text-xs text-red-500">{errors.link_pendaftaran.message}</p>}
              <p className="mt-1 text-xs text-slate-400">
                Mahasiswa akan diarahkan ke link ini saat mengklik tombol lamar di situs resmi.
              </p>
            </div>
          </div>

          {/* Kompetensi Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Kompetensi yang Dibutuhkan</h3>
              <button
                type="button"
                onClick={() => appendKomp({ kompetensi_id: "", bobot: 1, is_wajib: 0 })}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                id="btn-tambah-kompetensi-posisi"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Tambah Kompetensi
              </button>
            </div>
            {kompFields.length === 0 && (
              <p className="text-xs text-slate-400 italic">Tidak ada kompetensi dipilih.</p>
            )}
            <div className="space-y-2">
              {kompFields.map((field, i) => (
                <div key={field.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <select
                    {...register(`kompetensi.${i}.kompetensi_id`)}
                    className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih --</option>
                    {competencies.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama_kompetensi}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <label className="text-xs text-slate-500">Bobot</label>
                    <input
                      type="number"
                      {...register(`kompetensi.${i}.bobot`)}
                      min={0.01}
                      max={9.99}
                      step={0.01}
                      className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`kompetensi.${i}.is_wajib`)}
                      value="1"
                      className="rounded"
                    />
                    Wajib
                  </label>
                  <button
                    type="button"
                    onClick={() => removeKomp(i)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving} id="btn-simpan-posisi">
              {saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambahkan"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Posisi"
        message={`Yakin ingin menghapus posisi "${deleteTarget?.judul_posisi}"?`}
      />
    </div>
  )
}
