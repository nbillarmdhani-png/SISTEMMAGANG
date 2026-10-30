import { Link } from "react-router-dom"
import { MapPin, Clock, Wifi, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export function PositionCard({ position }) {
  const {
    id,
    judul_posisi,
    perusahaan,
    is_remote,
    durasi_bulan,
    tgl_tutup,
  } = position

  const isExpiringSoon = tgl_tutup
    ? (new Date(tgl_tutup) - new Date()) / (1000 * 60 * 60 * 24) <= 7
    : false

  return (
    <Link
      to={`/app/magang/${id}`}
      id={`position-card-${id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div>
        {/* Company header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            {perusahaan?.logo ? (
              <img
                src={perusahaan.logo}
                alt={perusahaan.nama_perusahaan}
                className="h-11 w-11 rounded-xl object-contain border border-slate-100 bg-white p-1 shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-base font-bold shadow-sm shadow-blue-500/20">
                {perusahaan?.nama_perusahaan?.[0] ?? "P"}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                {judul_posisi}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {perusahaan?.nama_perusahaan ?? "Perusahaan Mitra"}
              </p>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 text-xs mb-4">
          {perusahaan?.kota && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2.5 py-1 text-slate-600 font-medium text-[11px]">
              <MapPin className="h-3 w-3 text-slate-400" />
              {perusahaan.kota}
            </span>
          )}
          {is_remote ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium text-[11px] border border-emerald-100">
              <Wifi className="h-3 w-3" />
              Remote
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 font-medium text-[11px] border border-blue-100">
            <Clock className="h-3 w-3" />
            {durasi_bulan} Bulan
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className={`inline-flex items-center gap-1.5 ${isExpiringSoon ? "text-red-600 font-semibold" : "text-slate-400"}`}>
          <Calendar className="h-3.5 w-3.5" />
          Batas: {formatDate(tgl_tutup)}
          {isExpiringSoon && " (Segera Ditutup)"}
        </span>
        {perusahaan?.is_verified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 className="h-3 w-3" />
            Terverifikasi
          </span>
        ) : null}
      </div>
    </Link>
  )
}
