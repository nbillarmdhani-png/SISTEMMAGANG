import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  MapPin, Clock, Calendar, Wifi, ChevronLeft, Briefcase,
  AlertCircle, CheckCircle2, Star, GraduationCap, ExternalLink, ShieldCheck, Check
} from "lucide-react"
import toast from "react-hot-toast"
import { getPositionById, applyToPosition, getMyApplications } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { Button } from "../../components/ui/Button"

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function PositionDetail() {
  const { id } = useParams()
  const [position, setPosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    Promise.all([
      getPositionById(id),
      getMyApplications().catch(() => []),
    ])
      .then(([posData, appsData]) => {
        setPosition(posData)
        setApplications(appsData)
      })
      .catch(() => toast.error("Gagal memuat detail lowongan"))
      .finally(() => setLoading(false))
  }, [id])

  const existingApp = applications.find(
    (a) => a.lowongan_id === Number(id) && a.status !== "dibatalkan"
  )

  const officialApplyUrl =
    position?.link_pendaftaran ||
    (position?.perusahaan?.website
      ? (position.perusahaan.website.startsWith("http") ? position.perusahaan.website : `https://${position.perusahaan.website}`)
      : "https://kampusmerdeka.kemdikbud.go.id/program/magang")

  async function handleOpenPortalAndTrack() {
    // 1. Buka situs pendaftaran resmi di tab baru
    window.open(officialApplyUrl, "_blank", "noopener,noreferrer")

    // 2. Jika belum tercatat di tracker, otomatis tandai
    if (!existingApp) {
      setMarking(true)
      try {
        const newApp = await applyToPosition({ lowongan_id: Number(id) })
        setApplications((prev) => [...prev, newApp])
        toast.success("Membuka portal resmi & ditandai di Lamaran Saya!")
      } catch {
        // Silent jika sudah ada
      } finally {
        setMarking(false)
      }
    } else {
      toast.success("Membuka portal pendaftaran resmi...")
    }
  }

  async function handleManualTrack() {
    setMarking(true)
    try {
      const newApp = await applyToPosition({ lowongan_id: Number(id) })
      setApplications((prev) => [...prev, newApp])
      toast.success("Lowongan berhasil ditandai di Lamaran Saya!")
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menandai lamaran")
    } finally {
      setMarking(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton.Text lines={5} />
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Lowongan tidak ditemukan</h2>
        <Link to="/app/magang" className="mt-4 text-blue-600 hover:underline text-xs font-semibold">
          ← Kembali ke daftar lowongan
        </Link>
      </div>
    )
  }

  const {
    judul_posisi,
    perusahaan,
    deskripsi,
    kuota,
    durasi_bulan,
    tgl_buka,
    tgl_tutup,
    min_semester,
    min_ipk,
    is_remote,
    lowongan_kompetensi = [],
  } = position

  const wajib = lowongan_kompetensi.filter((lk) => lk.wajib)
  const opsional = lowongan_kompetensi.filter((lk) => !lk.wajib)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        to="/app/magang"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        id="link-kembali"
      >
        <ChevronLeft className="h-4 w-4" />
        Kembali ke Daftar Lowongan
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-subtle space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {perusahaan?.logo ? (
              <img
                src={perusahaan.logo}
                alt={perusahaan.nama_perusahaan}
                className="h-16 w-16 rounded-2xl object-contain border border-slate-100 bg-white p-1.5 shadow-sm shrink-0"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-2xl font-bold shadow-md shadow-blue-500/20">
                {perusahaan?.nama_perusahaan?.[0] ?? "P"}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-blue-600">{perusahaan?.nama_perusahaan}</span>
                {perusahaan?.is_verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> Mitra Terverifikasi
                  </span>
                ) : null}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {judul_posisi}
              </h1>
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
                {perusahaan?.kota && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {perusahaan.kota}
                  </span>
                )}
                {is_remote ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <Wifi className="h-3.5 w-3.5" /> Remote
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Onsite
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> {durasi_bulan} Bulan
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto">
            <Button
              onClick={handleOpenPortalAndTrack}
              disabled={marking}
              className="rounded-xl shadow-md shadow-blue-600/20 justify-center"
              id="btn-lamar-portal-resmi"
            >
              <span>Lamar di Situs Resmi</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            {!existingApp ? (
              <Button
                variant="outline"
                onClick={handleManualTrack}
                disabled={marking}
                className="rounded-xl text-xs justify-center"
                id="btn-tandai-lamar"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {marking ? "Menandai..." : "Tandai Sudah Dilamar"}
              </Button>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sudah Masuk Tracker
              </span>
            )}
          </div>
        </div>

        {/* Info Banner: Official External Portal Notice */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 mb-0.5">Pendaftaran Resmi & Transparan</p>
            Proses seleksi berkas dilakukan langsung di website resmi <strong>{perusahaan?.nama_perusahaan}</strong>. MagangConnect membantu menganalisis kesesuaian skill Anda dengan kualifikasi posisi secara objektif melalui algoritma AI & metode SAW.
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Kuota Dibuka", value: `${kuota} Orang`, icon: Briefcase },
          { label: "Periode Pendaftaran", value: `${formatDate(tgl_buka)} - ${formatDate(tgl_tutup)}`, icon: Calendar },
          { label: "Batas Semester", value: min_semester ? `Min. Semester ${min_semester}` : "Terbuka Semua", icon: GraduationCap },
          ...(min_ipk ? [{ label: "Min. IPK", value: Number(min_ipk).toFixed(2), icon: Star }] : []),
        ].map((info) => (
          <div key={info.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-subtle text-center">
            <div className="flex h-8 w-8 mx-auto mb-2 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <info.icon className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{info.label}</p>
            <p className="text-xs font-bold text-slate-900">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Deskripsi Posisi */}
      {deskripsi && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-3">
          <h2 className="text-base font-bold text-slate-900">Deskripsi & Tanggung Jawab Posisi</h2>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{deskripsi}</p>
        </div>
      )}

      {/* Kompetensi yang Dibutuhkan */}
      {lowongan_kompetensi.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Kebutuhan Kompetensi & Skill</h2>
            <p className="text-xs text-slate-500 mt-0.5">Kriteria pembobotan yang digunakan sistem SAW untuk mencocokkan profilmu</p>
          </div>

          {wajib.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>Kompetensi Wajib</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {wajib.map((lk) => (
                  <div key={lk.id} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/60 p-3">
                    <span className="text-xs font-bold text-slate-800">{lk.kompetensi?.nama_kompetensi}</span>
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-700">Wajib</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {opsional.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Kompetensi Pendukung (Nilai Tambah)</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {opsional.map((lk) => (
                  <div key={lk.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                    <span className="text-xs font-medium text-slate-700">{lk.kompetensi?.nama_kompetensi}</span>
                    <span className="text-[11px] text-slate-400 font-semibold">Bobot: {Number(lk.bobot).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profil Perusahaan */}
      {perusahaan && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle space-y-3">
          <h2 className="text-base font-bold text-slate-900">Tentang {perusahaan.nama_perusahaan}</h2>
          <div className="grid gap-3 sm:grid-cols-2 text-xs text-slate-600">
            {perusahaan.bidang_usaha && (
              <div>
                <span className="text-slate-400 block mb-0.5">Bidang Industri:</span>
                <span className="font-semibold text-slate-800">{perusahaan.bidang_usaha}</span>
              </div>
            )}
            {perusahaan.kota && (
              <div>
                <span className="text-slate-400 block mb-0.5">Lokasi Kantor:</span>
                <span className="font-semibold text-slate-800">{perusahaan.kota}, {perusahaan.provinsi || "Indonesia"}</span>
              </div>
            )}
            {perusahaan.website && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Situs Resmi Perusahaan:</span>
                <a
                  href={perusahaan.website.startsWith("http") ? perusahaan.website : `https://${perusahaan.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  {perusahaan.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom CTA Bar */}
      <div className="sticky bottom-4 rounded-2xl glass-panel p-4 shadow-elevated flex items-center justify-between gap-4">
        <div className="hidden sm:block">
          <p className="text-xs font-bold text-slate-900">{judul_posisi}</p>
          <p className="text-[11px] text-slate-500">{perusahaan?.nama_perusahaan}</p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {!existingApp && (
            <Button
              variant="outline"
              onClick={handleManualTrack}
              disabled={marking}
              className="rounded-xl text-xs"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Tandai Dilamar
            </Button>
          )}
          <Button
            onClick={handleOpenPortalAndTrack}
            disabled={marking}
            className="rounded-xl shadow-sm text-xs"
          >
            <span>Buka Portal Resmi</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
