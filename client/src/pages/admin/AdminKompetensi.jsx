import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { AdminTable } from "../../components/ui/AdminTable"
import { Modal, ConfirmModal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import {
  getAdminCompetencies,
  createAdminCompetency,
  updateAdminCompetency,
  deleteAdminCompetency,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminStudyPrograms,
  createAdminStudyProgram,
  updateAdminStudyProgram,
  deleteAdminStudyProgram,
} from "../../api/admin.api"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const competencySchema = z.object({
  kategori_id: z.coerce.number().int().positive("Pilih kategori"),
  nama_kompetensi: z.string().min(2, "Minimal 2 karakter"),
  deskripsi: z.string().optional(),
})

const categorySchema = z.object({
  nama_kategori: z.string().min(2, "Minimal 2 karakter"),
  deskripsi: z.string().optional(),
})

const studyProgramSchema = z.object({
  kode_prodi: z.string().min(1).max(10),
  nama_prodi: z.string().min(2),
  fakultas: z.string().min(2),
  jenjang: z.enum(["D3", "S1", "S2"]),
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function CompetencyTab() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(competencySchema),
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [komps, cats] = await Promise.all([getAdminCompetencies(), getAdminCategories()])
      setItems(komps)
      setCategories(cats)
    } catch { toast.error("Gagal memuat data") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditing(null); reset({ kategori_id: "", nama_kompetensi: "", deskripsi: "" }); setFormOpen(true) }
  function openEdit(item) { setEditing(item); reset({ kategori_id: item.kategori_id, nama_kompetensi: item.nama_kompetensi, deskripsi: item.deskripsi ?? "" }); setFormOpen(true) }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (editing) { await updateAdminCompetency(editing.id, values); toast.success("Kompetensi diperbarui") }
      else { await createAdminCompetency(values); toast.success("Kompetensi ditambahkan") }
      setFormOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? "Gagal menyimpan") }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try { await deleteAdminCompetency(deleteTarget.id); toast.success("Dihapus"); setDeleteTarget(null); load() }
    catch (err) { toast.error(err.response?.data?.message ?? "Gagal menghapus") }
    finally { setDeleting(false) }
  }

  const columns = [
    { key: "nama_kompetensi", label: "Nama Kompetensi" },
    { key: "kategori_kompetensi", label: "Kategori", render: (r) => r.kategori_kompetensi?.nama_kategori ?? "—" },
    { key: "deskripsi", label: "Deskripsi", render: (r) => <span className="text-slate-500 text-xs">{r.deskripsi ? r.deskripsi.slice(0, 60) + (r.deskripsi.length > 60 ? "…" : "") : "—"}</span> },
    {
      key: "actions", label: "Aksi", render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm" id="btn-tambah-kompetensi"><Plus className="mr-2 h-4 w-4" />Tambah Kompetensi</Button>
      </div>
      <AdminTable columns={columns} data={items} loading={loading} total={items.length} emptyMsg="Belum ada kompetensi." />
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Kompetensi" : "Tambah Kompetensi"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-kompetensi">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
            <select {...register("kategori_id")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="select-kategori">
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
            </select>
            {errors.kategori_id && <p className="mt-1 text-xs text-red-500">{errors.kategori_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama <span className="text-red-500">*</span></label>
            <input {...register("nama_kompetensi")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="React.js" id="input-nama-kompetensi" />
            {errors.nama_kompetensi && <p className="mt-1 text-xs text-red-500">{errors.nama_kompetensi.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea {...register("deskripsi")} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-deskripsi-kompetensi" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving} id="btn-simpan-kompetensi">{saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambahkan"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Kompetensi" message={`Hapus "${deleteTarget?.nama_kompetensi}"? Tidak dapat dihapus jika masih digunakan lowongan.`} />
    </div>
  )
}

function CategoryTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(categorySchema) })

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await getAdminCategories()) }
    catch { toast.error("Gagal memuat kategori") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditing(null); reset({ nama_kategori: "", deskripsi: "" }); setFormOpen(true) }
  function openEdit(item) { setEditing(item); reset({ nama_kategori: item.nama_kategori, deskripsi: item.deskripsi ?? "" }); setFormOpen(true) }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (editing) { await updateAdminCategory(editing.id, values); toast.success("Kategori diperbarui") }
      else { await createAdminCategory(values); toast.success("Kategori ditambahkan") }
      setFormOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? "Gagal") }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try { await deleteAdminCategory(deleteTarget.id); toast.success("Dihapus"); setDeleteTarget(null); load() }
    catch (err) { toast.error(err.response?.data?.message ?? "Gagal") }
    finally { setDeleting(false) }
  }

  const columns = [
    { key: "nama_kategori", label: "Nama Kategori" },
    { key: "_count", label: "Jml Kompetensi", render: (r) => r._count?.kompetensi ?? 0 },
    { key: "deskripsi", label: "Deskripsi", render: (r) => <span className="text-slate-500 text-xs">{r.deskripsi ?? "—"}</span> },
    {
      key: "actions", label: "Aksi", render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm" id="btn-tambah-kategori"><Plus className="mr-2 h-4 w-4" />Tambah Kategori</Button>
      </div>
      <AdminTable columns={columns} data={items} loading={loading} total={items.length} emptyMsg="Belum ada kategori." />
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Kategori" : "Tambah Kategori"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-kategori">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama <span className="text-red-500">*</span></label>
            <input {...register("nama_kategori")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-nama-kategori" />
            {errors.nama_kategori && <p className="mt-1 text-xs text-red-500">{errors.nama_kategori.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
            <textarea {...register("deskripsi")} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="input-deskripsi-kategori" />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving} id="btn-simpan-kategori">{saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambahkan"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Kategori" message={`Hapus "${deleteTarget?.nama_kategori}"?`} />
    </div>
  )
}

function StudyProgramTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(studyProgramSchema), defaultValues: { jenjang: "S1" } })

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await getAdminStudyPrograms()) }
    catch { toast.error("Gagal memuat prodi") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() { setEditing(null); reset({ kode_prodi: "", nama_prodi: "", fakultas: "", jenjang: "S1" }); setFormOpen(true) }
  function openEdit(item) { setEditing(item); reset({ kode_prodi: item.kode_prodi, nama_prodi: item.nama_prodi, fakultas: item.fakultas, jenjang: item.jenjang }); setFormOpen(true) }

  async function onSubmit(values) {
    setSaving(true)
    try {
      if (editing) { await updateAdminStudyProgram(editing.id, values); toast.success("Prodi diperbarui") }
      else { await createAdminStudyProgram(values); toast.success("Prodi ditambahkan") }
      setFormOpen(false); load()
    } catch (err) { toast.error(err.response?.data?.message ?? "Gagal") }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    setDeleting(true)
    try { await deleteAdminStudyProgram(deleteTarget.id); toast.success("Dihapus"); setDeleteTarget(null); load() }
    catch (err) { toast.error(err.response?.data?.message ?? "Gagal") }
    finally { setDeleting(false) }
  }

  const columns = [
    { key: "kode_prodi", label: "Kode" },
    { key: "nama_prodi", label: "Nama Prodi" },
    { key: "fakultas", label: "Fakultas" },
    { key: "jenjang", label: "Jenjang" },
    {
      key: "actions", label: "Aksi", render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeleteTarget(row)} className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm" id="btn-tambah-prodi"><Plus className="mr-2 h-4 w-4" />Tambah Prodi</Button>
      </div>
      <AdminTable columns={columns} data={items} loading={loading} total={items.length} emptyMsg="Belum ada program studi." />
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Program Studi" : "Tambah Program Studi"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-prodi">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kode Prodi</label>
              <input {...register("kode_prodi")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="IF" id="input-kode-prodi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jenjang</label>
              <select {...register("jenjang")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" id="select-jenjang">
                <option value="D3">D3</option><option value="S1">S1</option><option value="S2">S2</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Prodi</label>
              <input {...register("nama_prodi")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Informatika" id="input-nama-prodi" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fakultas</label>
              <input {...register("fakultas")} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Teknik" id="input-fakultas" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving} id="btn-simpan-prodi">{saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambahkan"}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Prodi" message={`Hapus "${deleteTarget?.nama_prodi}"?`} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "kompetensi", label: "Kompetensi" },
  { id: "kategori", label: "Kategori" },
  { id: "prodi", label: "Program Studi" },
]

export default function AdminKompetensi() {
  const [activeTab, setActiveTab] = useState("kompetensi")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kompetensi & Master Data</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola kompetensi, kategori, dan program studi</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-4" aria-label="Tab master data">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-${tab.id}`}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "kompetensi" && <CompetencyTab />}
      {activeTab === "kategori" && <CategoryTab />}
      {activeTab === "prodi" && <StudyProgramTab />}
    </div>
  )
}
