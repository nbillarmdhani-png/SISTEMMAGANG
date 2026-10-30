import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { FileText, ArrowRight, Calendar, XCircle, Clock, Building, Compass } from "lucide-react"
import toast from "react-hot-toast"
import { getMyApplications, cancelApplication } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { ConfirmModal } from "../../components/ui/Modal"

const STATUS_CONFIG = {
  menunggu:   { label: "Menunggu Review", color: "bg-amber-50 text-amber-700 border border-amber-200",   dot: "bg-amber-500 animate-pulse" },
  diterima:   { label: "Diterima",        color: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  ditolak:    { label: "Ditolak",         color: "bg-red-50 text-red-700 border border-red-200",       dot: "bg-red-500" },
  dibatalkan: { label: "Dibatalkan",      color: "bg-slate-50 text-slate-600 border border-slate-200",   dot: "bg-slate-400" },
}

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [activeFilter, setActiveFilter] = useState("semua")

  const load = useCallback(async () => {
    setLoading(true)
    try { setApplications(await getMyApplications()) }
    catch { toast.error("Gagal memuat lamaran") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelApplication(cancelTarget.id)
      toast.success("Lamaran berhasil dibatalkan")
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal membatalkan")
    } finally {
      setCancelling(false)
    }
  }

  const filters = ["semua", ...Object.keys(STATUS_CONFIG)]
  const displayed =
    activeFilter === "semua"
      ? applications
      : applications.filter((a) => a.status === activeFilter)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Status Lamaran Saya</h1>
        <p className="mt-1 text-xs text-slate-500">Pantau dan kelola riwayat lamaran magang yang telah kamu kirimkan ke perusahaan mitra</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f === "semua" ? applications.length : applications.filter((a) => a.status === f).length
          const isActive = activeFilter === f
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              id={`tab-lamaran-${f}`}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "semua" ? "Semua Status" : STATUS_CONFIG[f]?.label ?? f}
              <span className={`ml-2 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-600"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton.Card key={i} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {activeFilter === "semua" ? "Belum Ada Lamaran Terkirim" : `Tidak ada lamaran dengan status "${STATUS_CONFIG[activeFilter]?.label}"`}
          </h3>
          {activeFilter === "semua" && (
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
              Jelajahi lowongan magang yang direkomendasikan dan ajukan lamaran pertamamu sekarang.
            </p>
          )}
          <Link
            to="/app/magang"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-all"
            id="link-cari-lowongan"
          >
            <Compass className="h-4 w-4" />
            Eksplor Lowongan
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.menunggu
            const pos = app.lowongan_magang

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-blue-200 transition-all"
                id={`lamaran-${app.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Company avatar */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-base font-bold shadow-sm shadow-blue-500/20">
                      {pos?.perusahaan?.nama_perusahaan?.[0] ?? "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {pos?.judul_posisi ?? "Posisi Lowongan"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-slate-400" />
                        {pos?.perusahaan?.nama_perusahaan}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Diajukan: {formatDate(app.tgl_lamar)}
                        </span>
                        {app.tgl_respons && (
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Calendar className="h-3 w-3" />
                            Direspons: {formatDate(app.tgl_respons)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold self-start ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Catatan perusahaan */}
                {app.catatan_perusahaan && (
                  <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Catatan Perusahaan: </span>
                    {app.catatan_perusahaan}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                  {pos?.id && (
                    <Link
                      to={`/app/magang/${pos.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                      id={`btn-lihat-detail-${app.id}`}
                    >
                      Detail Lowongan <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                  {app.status === "menunggu" && (
                    <button
                      onClick={() => setCancelTarget(app)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
                      id={`btn-batal-${app.id}`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Batalkan Lamaran
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Batalkan Lamaran"
        confirmLabel="Batalkan Lamaran"
        message={`Yakin ingin membatalkan lamaran ke "${cancelTarget?.lowongan_magang?.judul_posisi}"?`}
      />
    </div>
  )
}
