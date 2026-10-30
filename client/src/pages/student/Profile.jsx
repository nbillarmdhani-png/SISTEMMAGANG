import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import api from "../../api/axios"
import { useAuth } from "../../context/useAuth"

import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card"
import { Skeleton } from "../../components/ui/Skeleton"
import { Modal, ConfirmModal } from "../../components/ui/Modal"
import {
  User, Mail, BookOpen, GraduationCap, Phone, MapPin, Upload,
  Plus, Trash2, Pencil, CheckCircle, Star, Key,
} from "lucide-react"
import {
  getMyCompetencies,
  addCompetency,
  deleteCompetency,
  getAllCompetencies,
} from "../../api/student.api"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  semester: z.coerce.number().int().min(1).max(14),
  ipk: z.coerce.number().min(0).max(4).multipleOf(0.01),
  no_telp: z.string().optional(),
  alamat: z.string().optional(),
  porto_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
})

const competencySchema = z.object({
  kompetensi_id: z.coerce.number().int().positive("Pilih kompetensi"),
  level: z.enum(["pemula", "menengah", "mahir"]),
  bukti_url: z.string().url("URL tidak valid").optional().or(z.literal("")),
})

const LEVEL_CONFIG = {
  pemula:   { label: "Pemula",   color: "bg-blue-100 text-blue-700" },
  menengah: { label: "Menengah", color: "bg-amber-100 text-amber-700" },
  mahir:    { label: "Mahir",    color: "bg-emerald-100 text-emerald-700" },
}

const SUMBER_LABEL = {
  manual: { label: "Manual", color: "bg-slate-100 text-slate-600" },
  chatbot: { label: "Chatbot", color: "bg-purple-100 text-purple-700" },
}

// ─── Tab: Info Akademik ───────────────────────────────────────────────────────

function ProfileTab({ user, onRefresh }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPhotoLoading, setIsPhotoLoading] = useState(false)
  const mhs = user?.mahasiswa

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      semester: mhs?.semester ?? "",
      ipk: mhs?.ipk ?? "",
      no_telp: mhs?.no_telp ?? "",
      alamat: mhs?.alamat ?? "",
      porto_url: mhs?.porto_url ?? "",
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await api.put("/students/me", {
        semester: parseInt(data.semester),
        ipk: parseFloat(data.ipk),
        no_telp: data.no_telp,
        alamat: data.alamat,
        porto_url: data.porto_url,
      })
      toast.success("Profil berhasil diperbarui")
      onRefresh?.()
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    const loadingToast = toast.loading(`Mengunggah ${type === "cv" ? "CV" : "Foto"}...`)
    try {
      if (type === "foto") setIsPhotoLoading(true)
      const endpoint = type === "cv" ? "/students/me/cv" : "/students/me/photo"
      await api.post(endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } })
      toast.success(`${type === "cv" ? "CV" : "Foto"} berhasil diunggah`, { id: loadingToast })
      onRefresh?.()
    } catch (error) {
      toast.error(`Gagal mengunggah ${type}`, { id: loadingToast })
    } finally {
      if (type === "foto") setIsPhotoLoading(false)
    }
  }

  if (!mhs) return null

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Foto & Identitas */}
      <Card className="md:col-span-1 h-fit">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 flex items-center justify-center">
              {mhs.foto ? (
                <img
                  src={mhs.foto.startsWith("http") ? mhs.foto : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students/files/${mhs.foto}`}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-slate-400" />
              )}
              {isPhotoLoading && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-full">
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
              <Upload className="h-4 w-4" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "foto")} />
            </label>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{mhs.nama_lengkap}</h2>
          <p className="text-sm font-medium text-blue-600 mt-1">{mhs.nim}</p>
          <div className="w-full mt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span>{mhs.program_studi?.nama_prodi ?? `Prodi ID: ${mhs.prodi_id}`}</span>
            </div>
            {mhs.semester && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>Semester {mhs.semester} · IPK {Number(mhs.ipk ?? 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form akademik */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Informasi Akademik & Kontak</CardTitle>
          <CardDescription>Pastikan data IPK dan Semester sesuai dengan transkrip terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="form-profil">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" /> Semester
                </label>
                <Input type="number" min="1" max="14" {...register("semester")} id="input-semester" />
                {errors.semester && <p className="text-xs text-red-500">{errors.semester.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" /> IPK
                </label>
                <Input type="number" step="0.01" min="0" max="4.00" {...register("ipk")} id="input-ipk" />
                {errors.ipk && <p className="text-xs text-red-500">{errors.ipk.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" /> No. Telepon / WA
              </label>
              <Input placeholder="08123456789" {...register("no_telp")} id="input-no-telp" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" /> Alamat Domisili
              </label>
              <textarea
                {...register("alamat")}
                className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="Jl. Merdeka No. 123, Kota..."
                id="input-alamat"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL Portofolio / GitHub / LinkedIn</label>
              <Input placeholder="https://github.com/username" {...register("porto_url")} id="input-porto" />
              {errors.porto_url && <p className="text-xs text-red-500">{errors.porto_url.message}</p>}
            </div>

            {/* CV Upload */}
            <div className="pt-4 border-t flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Curriculum Vitae (CV)</h4>
                <p className="text-xs text-slate-500 mt-1">Unggah CV terbaru format PDF (Max 2MB)</p>
              </div>
              <div className="flex gap-2">
                {mhs.cv_path && (
                  <a
                    href={mhs.cv_path.startsWith("http") ? mhs.cv_path : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/students/files/${mhs.cv_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-100 text-slate-900 px-4 py-2 hover:bg-slate-200"
                  >
                    Lihat CV
                  </a>
                )}
                <label className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200" id="label-upload-cv">
                  <Upload className="h-4 w-4 mr-2" /> Unggah Baru
                  <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, "cv")} />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isLoading} id="btn-simpan-profil">
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Tab: Kompetensi ──────────────────────────────────────────────────────────

function CompetencyTab() {
  const [myCompetencies, setMyCompetencies] = useState([])
  const [allCompetencies, setAllCompetencies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null) // { kompetensi_id, level, bukti_url } or null
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeCat, setActiveCat] = useState("semua")

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(competencySchema),
    defaultValues: { kompetensi_id: "", level: "pemula", bukti_url: "" },
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mine, all] = await Promise.all([getMyCompetencies(), getAllCompetencies()])
      setMyCompetencies(mine)
      setAllCompetencies(all)
      // Build category list from all competencies
      const catMap = new Map()
      all.forEach((k) => {
        if (k.kategori_kompetensi) catMap.set(k.kategori_kompetensi.id, k.kategori_kompetensi.nama_kategori)
      })
      setCategories(Array.from(catMap.entries()).map(([id, nama]) => ({ id, nama })))
    } catch { toast.error("Gagal memuat kompetensi") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditItem(null)
    reset({ kompetensi_id: "", level: "pemula", bukti_url: "" })
    setFormOpen(true)
  }

  function openEdit(item) {
    setEditItem(item)
    reset({ kompetensi_id: item.kompetensi_id, level: item.level, bukti_url: item.bukti_url ?? "" })
    setFormOpen(true)
  }

  async function onSubmit(values) {
    setSaving(true)
    try {
      await addCompetency({
        kompetensi_id: Number(values.kompetensi_id),
        level: values.level,
        bukti_url: values.bukti_url || null,
      })
      toast.success(editItem ? "Kompetensi diperbarui" : "Kompetensi ditambahkan")
      setFormOpen(false)
      load()
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
      await deleteCompetency(deleteTarget.kompetensi_id)
      toast.success("Kompetensi dihapus")
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal menghapus")
    } finally {
      setDeleting(false)
    }
  }

  // Filter by category
  const displayed =
    activeCat === "semua"
      ? myCompetencies
      : myCompetencies.filter((m) => String(m.kompetensi?.kategori_kompetensi?.id) === String(activeCat))

  // Exclude already-added competencies from dropdown (allow re-edit)
  const addedIds = myCompetencies.map((m) => m.kompetensi_id)
  const availableComps = allCompetencies.filter((k) => !addedIds.includes(k.id) || k.id === editItem?.kompetensi_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kompetensi Saya</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {myCompetencies.length} kompetensi tercatat · Gunakan Chatbot untuk ekstraksi otomatis
          </p>
        </div>
        <Button onClick={openAdd} id="btn-tambah-kompetensi-profil">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kompetensi
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCat("semua")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${activeCat === "semua" ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          Semua ({myCompetencies.length})
        </button>
        {categories.map((cat) => {
          const count = myCompetencies.filter((m) => m.kompetensi?.kategori_kompetensi?.id === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCat(String(cat.id))}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${activeCat === String(cat.id) ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {cat.nama} ({count})
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center rounded-xl border border-dashed border-slate-300">
          <Star className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">Belum ada kompetensi{activeCat !== "semua" ? " di kategori ini" : ""}</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan secara manual atau gunakan Chatbot</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {displayed.map((item) => {
            const lvl = LEVEL_CONFIG[item.level] ?? LEVEL_CONFIG.pemula
            const src = SUMBER_LABEL[item.sumber] ?? SUMBER_LABEL.manual
            return (
              <div
                key={item.id}
                className="relative rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow"
                id={`kompeten-${item.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {item.kompetensi?.nama_kompetensi}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.kompetensi?.kategori_kompetensi?.nama_kategori ?? "—"}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      id={`btn-edit-kompetensi-${item.id}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      id={`btn-hapus-kompetensi-${item.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${lvl.color}`}>
                    {lvl.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${src.color}`}>
                    {src.label}
                  </span>
                  {item.bukti_url && (
                    <a
                      href={item.bukti_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 hover:underline"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Bukti
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editItem ? "Edit Kompetensi" : "Tambah Kompetensi"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="form-kompetensi-profil">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Kompetensi <span className="text-red-500">*</span>
            </label>
            <select
              {...register("kompetensi_id")}
              disabled={!!editItem}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              id="select-kompetensi"
            >
              <option value="">-- Pilih Kompetensi --</option>
              {availableComps.map((k) => (
                <option key={k.id} value={k.id}>{k.nama_kompetensi} ({k.kategori_kompetensi?.nama_kategori})</option>
              ))}
            </select>
            {errors.kompetensi_id && <p className="mt-1 text-xs text-red-500">{errors.kompetensi_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
            <div className="flex gap-2">
              {Object.entries(LEVEL_CONFIG).map(([val, cfg]) => {
                const checked = watch("level") === val
                return (
                  <label
                    key={val}
                    className={`flex-1 flex items-center justify-center rounded-lg border py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                      checked ? `${cfg.color} border-current` : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <input type="radio" {...register("level")} value={val} className="sr-only" />
                    {cfg.label}
                  </label>
                )
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Bukti (Opsional)</label>
            <input
              {...register("bukti_url")}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/proyek atau sertifikat online"
              id="input-bukti-url"
            />
            {errors.bukti_url && <p className="mt-1 text-xs text-red-500">{errors.bukti_url.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Batal</Button>
            <Button type="submit" disabled={saving} id="btn-simpan-kompetensi-profil">
              {saving ? "Menyimpan..." : editItem ? "Perbarui" : "Tambahkan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Kompetensi"
        message={`Hapus "${deleteTarget?.kompetensi?.nama_kompetensi}" dari profil?`}
      />
    </div>
  )
}

// ─── Password Change Tab ───────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  })

function PasswordTab() {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.patch("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success("Password berhasil diperbarui!")
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengubah password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Keamanan & Ganti Password
        </CardTitle>
        <CardDescription>
          Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password Saat Ini</label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("currentPassword")}
              className={errors.currentPassword ? "border-red-500" : ""}
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password Baru</label>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              {...register("newPassword")}
              className={errors.newPassword ? "border-red-500" : ""}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
            <Input
              type="password"
              placeholder="Ulangi password baru"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} id="btn-ganti-password" className="w-full sm:w-auto">
            {loading ? "Menyimpan..." : "Perbarui Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

const TABS = [
  { id: "profil", label: "Info Akademik" },
  { id: "kompetensi", label: "Kompetensi" },
  { id: "keamanan", label: "Ganti Password" },
]

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("profil")

  // Trigger re-read from context after update
  async function handleRefresh() {
    if (typeof refreshUser === "function") {
      await refreshUser()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
        <p className="text-slate-500 mt-2">Kelola informasi data diri, akademik, dan kompetensimu.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              id={`tab-profil-${tab.id}`}
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

      {activeTab === "profil" && <ProfileTab user={user} onRefresh={handleRefresh} />}
      {activeTab === "kompetensi" && <CompetencyTab />}
      {activeTab === "keamanan" && <PasswordTab />}
    </div>
  )
}
