import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  MapPin, Clock, Calendar, Wifi, ChevronLeft, Briefcase,
  AlertCircle, CheckCircle, Star, GraduationCap
} from "lucide-react"
import toast from "react-hot-toast"
import { getPositionById, applyToPosition } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { Button } from "../../components/ui/Button"
import { ConfirmModal } from "../../components/ui/Modal"

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function PositionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    getPositionById(id)
      .then(setPosition)
      .catch(() => toast.error("Gagal memuat detail lowongan"))
      .finally(() => setLoading(false))
  }, [id])

  async function handleApply() {
    setApplying(true)
    try {
      await applyToPosition({ lowongan_id: Number(id) })
      toast.success("Lamaran berhasil dikirim!")
      setConfirmOpen(false)
      navigate("/app/lamaran")
    } catch (err) {
      const msg = err.response?.data?.message ?? "Gagal mengirim lamaran"
      toast.error(msg)
      setConfirmOpen(false)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton.Text lines={5} />
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800">Lowongan tidak ditemukan</h2>
        <Link to="/app/magang" className="mt-4 text-blue-600 hover:underline text-sm">← Kembali ke daftar</Link>
      </div>
    )
  }

  const { judul_posisi, perusahaan, deskripsi, kuota, durasi_bulan, tgl_buka, tgl_tutup,
    min_semester, min_ipk, is_remote, lowongan_kompetensi = [] } = position

  const wajib = lowongan_kompetensi.filter((lk) => lk.wajib)
  const opsional = lowongan_kompetensi.filter((lk) => !lk.wajib)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link to="/app/magang" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors" id="link-kembali">
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Daftar
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {perusahaan?.logo ? (
            <img src={perusahaan.logo} alt={perusahaan.nama_perusahaan} className="h-16 w-16 rounded-xl object-contain border border-slate-100 bg-white p-1" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-2xl font-bold border border-blue-100">
              {perusahaan?.nama_perusahaan?.[0] ?? "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{judul_posisi}</h1>
            <p className="mt-1 text-base font-medium text-blue-600">{perusahaan?.nama_perusahaan}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {perusahaan?.kota && (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4" /> {perusahaan.kota}
                </span>
              )}
              {is_remote ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600">
                  <Wifi className="h-4 w-4" /> Remote
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Clock className="h-4 w-4" /> {durasi_bulan} bulan
              </span>
            </div>
          </div>
          <Button onClick={() => setConfirmOpen(true)} className="flex-shrink-0 hidden sm:flex" id="btn-lamar">
            Lamar Sekarang
          </Button>
        </div>
        <Button onClick={() => setConfirmOpen(true)} className="mt-4 w-full sm:hidden" id="btn-lamar-mobile">
          Lamar Sekarang
        </Button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Kuota", value: kuota + " orang", icon: Briefcase },
          { label: "Tgl Buka", value: formatDate(tgl_buka), icon: Calendar },
          { label: "Tgl Tutup", value: formatDate(tgl_tutup), icon: Calendar },
          { label: "Min. Semester", value: min_semester ? `Semester ${min_semester}` : "Bebas", icon: GraduationCap },
          ...(min_ipk ? [{ label: "Min. IPK", value: Number(min_ipk).toFixed(2), icon: Star }] : []),
        ].map((info) => (
          <div key={info.label} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <info.icon className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-1">{info.label}</p>
            <p className="text-sm font-semibold text-slate-800">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Deskripsi */}
      {deskripsi && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Deskripsi Posisi</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{deskripsi}</p>
        </div>
      )}

      {/* Kompetensi */}
      {lowongan_kompetensi.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Kompetensi yang Dibutuhkan</h2>

          {wajib.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-700">Kompetensi Wajib</h3>
              </div>
              <div className="space-y-2">
                {wajib.map((lk) => (
                  <div key={lk.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-800">{lk.kompetensi?.nama_kompetensi}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Bobot: {Number(lk.bobot).toFixed(2)}</span>
                      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Wajib</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {opsional.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-blue-700">Kompetensi Tambahan</h3>
              </div>
              <div className="space-y-2">
                {opsional.map((lk) => (
                  <div key={lk.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <span className="text-sm font-medium text-slate-700">{lk.kompetensi?.nama_kompetensi}</span>
                    <span className="text-xs text-slate-400">Bobot: {Number(lk.bobot).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Perusahaan info */}
      {perusahaan && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Tentang Perusahaan</h2>
          <div className="space-y-1 text-sm text-slate-600">
            {perusahaan.bidang_usaha && <p><span className="text-slate-400">Bidang:</span> {perusahaan.bidang_usaha}</p>}
            {perusahaan.alamat && <p><span className="text-slate-400">Alamat:</span> {perusahaan.alamat}</p>}
            {perusahaan.website && (
              <p>
                <span className="text-slate-400">Website:</span>{" "}
                <a href={perusahaan.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {perusahaan.website}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => setConfirmOpen(true)} className="shadow-lg" id="btn-lamar-sticky">
          Lamar Sekarang
        </Button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleApply}
        loading={applying}
        danger={false}
        title="Konfirmasi Lamaran"
        confirmLabel="Ya, Lamar Sekarang"
        message={`Yakin ingin melamar posisi "${judul_posisi}" di ${perusahaan?.nama_perusahaan}?`}
      />
    </div>
  )
}
