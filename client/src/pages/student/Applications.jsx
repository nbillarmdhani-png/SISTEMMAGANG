import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { FileText, ArrowRight, Calendar, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { getMyApplications, cancelApplication } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { ConfirmModal } from "../../components/ui/Modal"

const STATUS_CONFIG = {
  menunggu:   { label: "Menunggu",   color: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  diterima:   { label: "Diterima",   color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  ditolak:    { label: "Ditolak",    color: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  dibatalkan: { label: "Dibatalkan", color: "bg-slate-100 text-slate-600",   dot: "bg-slate-400" },
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lamaran Saya</h1>
        <p className="mt-2 text-slate-500">Pantau status lamaran magang yang telah kamu kirim</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f === "semua" ? applications.length : applications.filter((a) => a.status === f).length
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              id={`tab-lamaran-${f}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "semua" ? "Semua" : STATUS_CONFIG[f]?.label ?? f}
              <span className={`ml-1.5 rounded-full px-1.5 text-xs ${activeFilter === f ? "bg-white/20" : "bg-slate-100"}`}>
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">
            {activeFilter === "semua" ? "Belum ada lamaran" : `Tidak ada lamaran dengan status "${STATUS_CONFIG[activeFilter]?.label}"`}
          </h3>
          {activeFilter === "semua" && (
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Temukan lowongan yang cocok dan mulai lamar sekarang.
            </p>
          )}
          <Link to="/app/magang" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" id="link-cari-lowongan">
            Cari Lowongan
            <ArrowRight className="h-4 w-4" />
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
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                id={`lamaran-${app.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Company avatar */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-lg font-bold border border-blue-100">
                      {pos?.perusahaan?.nama_perusahaan?.[0] ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {pos?.judul_posisi ?? "Posisi tidak tersedia"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{pos?.perusahaan?.nama_perusahaan}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Lamar: {formatDate(app.tgl_lamar)}
                        </span>
                        {app.tgl_respons && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Respons: {formatDate(app.tgl_respons)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                {/* Catatan perusahaan */}
                {app.catatan_perusahaan && (
                  <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Catatan: </span>
                    {app.catatan_perusahaan}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                  {pos?.id && (
                    <Link
                      to={`/app/magang/${pos.id}`}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      id={`btn-lihat-detail-${app.id}`}
                    >
                      Lihat Detail <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                  {app.status === "menunggu" && (
                    <button
                      onClick={() => setCancelTarget(app)}
                      className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                      id={`btn-batal-${app.id}`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Batalkan
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
