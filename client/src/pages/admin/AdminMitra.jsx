import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2, Building2, CheckCircle, XCircle } from "lucide-react"
import toast from "react-hot-toast"

import { AdminTable } from "../../components/ui/AdminTable"
import { Modal, ConfirmModal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import {
  getAdminCompanies,
  createAdminCompany,
  updateAdminCompany,
  deleteAdminCompany,
} from "../../api/admin.api"

const schema = z.object({
  nama_perusahaan: z.string().min(2, "Minimal 2 karakter"),
  bidang_usaha: z.string().optional(),
  kota: z.string().optional(),
  provinsi: z.string().optional(),
  website: z.string().url("URL tidak valid").optional().or(z.literal("")),
  email_kontak: z.string().email("Email tidak valid").optional().or(z.literal("")),
  no_telp: z.string().optional(),
  verified: z.coerce.number().int(),
})

export default function AdminMitra() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // company object or null
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { verified: 0 },
  })

  async function loadData() {
    try {
      setLoading(true)
      const data = await getAdminCompanies()
      setCompanies(data)
    } catch {
      toast.error("Gagal memuat data mitra")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function openCreate() {
    setEditing(null)
    reset({ verified: 0 })
    setFormOpen(true)
  }

  function openEdit(company) {
    setEditing(company)
    reset({
      nama_perusahaan: company.nama_perusahaan,
      bidang_usaha: company.bidang_usaha ?? "",
      kota: company.kota ?? "",
      provinsi: company.provinsi ?? "",
      website: company.website ?? "",
      email_kontak: company.email_kontak ?? "",
      no_telp: company.no_telp ?? "",
      verified: company.verified,
    })
    setFormOpen(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (editing) {
        await updateAdminCompany(editing.id, values)
        toast.success("Mitra berhasil diperbarui")
      } else {
        await createAdminCompany(values)
        toast.success("Mitra berhasil ditambahkan")
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
      await deleteAdminCompany(deleteTarget.id)
      toast.success("Mitra berhasil dihapus")
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menghapus")
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    { key: "nama_perusahaan", label: "Nama Perusahaan" },
    { key: "bidang_usaha", label: "Bidang Usaha" },
    { key: "kota", label: "Kota" },
    {
      key: "verified",
      label: "Terverifikasi",
      render: (row) =>
        row.verified ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <CheckCircle className="h-4 w-4" /> Terverifikasi
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
            <XCircle className="h-4 w-4" /> Belum
          </span>
        ),
    },
    {
      key: "actions",
      label: "Aksi",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mitra / Perusahaan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola data perusahaan mitra magang</p>
        </div>
        <Button onClick={openCreate} id="btn-tambah-mitra">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Mitra
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Mitra", value: companies.length, icon: Building2, color: "text-blue-600 bg-blue-50" },
          {
            label: "Terverifikasi",
            value: companies.filter((c) => c.verified).length,
            icon: CheckCircle,
            color: "text-emerald-600 bg-emerald-50",
          },
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

      {/* Table */}
      <AdminTable
        columns={columns}
        data={companies}
        loading={loading}
        total={companies.length}
        emptyMsg="Belum ada mitra. Klik 'Tambah Mitra' untuk menambahkan."
      />

      {/* Form Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Mitra" : "Tambah Mitra"}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-mitra">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                {...register("nama_perusahaan")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PT Contoh Indonesia"
                id="input-nama-perusahaan"
              />
              {errors.nama_perusahaan && (
                <p className="mt-1 text-xs text-red-500">{errors.nama_perusahaan.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bidang Usaha</label>
              <input
                {...register("bidang_usaha")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Teknologi Informasi"
                id="input-bidang-usaha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
              <input
                {...register("kota")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jakarta"
                id="input-kota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
              <input
                {...register("provinsi")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="DKI Jakarta"
                id="input-provinsi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input
                {...register("website")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                id="input-website"
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Kontak</label>
              <input
                {...register("email_kontak")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="hr@example.com"
                id="input-email-kontak"
              />
              {errors.email_kontak && (
                <p className="mt-1 text-xs text-red-500">{errors.email_kontak.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon</label>
              <input
                {...register("no_telp")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="021-xxxxxxx"
                id="input-no-telp"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <label className="relative inline-flex cursor-pointer items-center" id="label-verified">
                <input
                  type="checkbox"
                  {...register("verified")}
                  value="1"
                  className="sr-only peer"
                  id="toggle-verified"
                  defaultChecked={editing?.verified === 1}
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full"></div>
                <span className="ml-2 text-sm font-medium text-slate-700">Terverifikasi</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving} id="btn-simpan-mitra">
              {saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambahkan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Mitra"
        message={`Yakin ingin menghapus "${deleteTarget?.nama_perusahaan}"? Semua lowongan terkait juga akan terhapus.`}
      />
    </div>
  )
}
