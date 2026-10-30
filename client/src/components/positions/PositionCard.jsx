import { Link } from "react-router-dom"
import { MapPin, Clock, Wifi, Calendar, ArrowRight } from "lucide-react"

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
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      {/* Company header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {perusahaan?.logo ? (
            <img
              src={perusahaan.logo}
              alt={perusahaan.nama_perusahaan}
              className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-white p-1"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-lg font-bold border border-blue-100">
              {perusahaan?.nama_perusahaan?.[0] ?? "?"}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
              {judul_posisi}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {perusahaan?.nama_perusahaan ?? "Perusahaan tidak diketahui"}
            </p>
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 text-xs">
        {perusahaan?.kota && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            <MapPin className="h-3 w-3" />
            {perusahaan.kota}
          </span>
        )}
        {is_remote ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
            <Wifi className="h-3 w-3" />
            Remote
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
          <Clock className="h-3 w-3" />
          {durasi_bulan} bulan
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className={`inline-flex items-center gap-1 text-xs ${isExpiringSoon ? "text-red-500 font-medium" : "text-slate-400"}`}>
          <Calendar className="h-3.5 w-3.5" />
          Tutup {formatDate(tgl_tutup)}
          {isExpiringSoon && " · Segera!"}
        </span>
        {perusahaan?.is_verified ? (
          <span className="text-xs text-emerald-600 font-medium">✓ Terverifikasi</span>
        ) : null}
      </div>
    </Link>
  )
}
