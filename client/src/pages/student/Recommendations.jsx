import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { Star, RefreshCw, ArrowRight, MapPin, Clock, Wifi } from "lucide-react"
import toast from "react-hot-toast"
import { getRecommendations, refreshRecommendations } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { Button } from "../../components/ui/Button"

function ScoreBadge({ score }) {
  const pct = Math.round(score)
  let colorClass = "bg-red-100 text-red-700"
  if (pct >= 75) colorClass = "bg-emerald-100 text-emerald-700"
  else if (pct >= 50) colorClass = "bg-amber-100 text-amber-700"

  return (
    <div className={`flex flex-col items-center rounded-xl px-3 py-2 ${colorClass}`}>
      <span className="text-2xl font-extrabold leading-none">{pct}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80 mt-0.5">Skor</span>
    </div>
  )
}

function RecommendationCard({ rec, rank }) {
  const { lowongan_magang: pos, skor_kecocokan, detail_perhitungan } = rec
  const score = Number(skor_kecocokan)

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
      {/* Rank badge */}
      <div className="absolute -top-2.5 -left-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
        #{rank}
      </div>

      <div className="flex items-start gap-4">
        {/* Company logo */}
        {pos?.perusahaan?.logo ? (
          <img src={pos.perusahaan.logo} alt={pos.perusahaan.nama_perusahaan} className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-white p-1 flex-shrink-0" />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-lg font-bold border border-blue-100">
            {pos?.perusahaan?.nama_perusahaan?.[0] ?? "?"}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {pos?.judul_posisi ?? "Posisi tidak diketahui"}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{pos?.perusahaan?.nama_perusahaan}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2 text-xs">
            {pos?.perusahaan?.kota && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                <MapPin className="h-3 w-3" /> {pos.perusahaan.kota}
              </span>
            )}
            {pos?.is_remote ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                <Wifi className="h-3 w-3" /> Remote
              </span>
            ) : null}
            {pos?.durasi_bulan && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                <Clock className="h-3 w-3" /> {pos.durasi_bulan} bln
              </span>
            )}
          </div>

          {/* Detail & Skill Gap */}
          {detail_perhitungan && (
            <div className="mt-2.5 space-y-1.5">
              <p className={`text-xs font-medium flex items-center gap-1 ${
                detail_perhitungan.wajib_terpenuhi ? "text-emerald-600" : "text-amber-600"
              }`}>
                {detail_perhitungan.wajib_terpenuhi
                  ? "✓ Semua kompetensi wajib terpenuhi"
                  : "⚠ Ada kompetensi wajib yang belum dimiliki"}
              </p>
              {Array.isArray(detail_perhitungan.kompetensi_kurang) && detail_perhitungan.kompetensi_kurang.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-slate-400">Skill gap:</span>
                  {detail_perhitungan.kompetensi_kurang.slice(0, 3).map((k, idx) => (
                    <span
                      key={idx}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        k.wajib ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {k.nama} {k.wajib && "*"}
                    </span>
                  ))}
                  {detail_perhitungan.kompetensi_kurang.length > 3 && (
                    <span className="text-[10px] text-slate-400">
                      +{detail_perhitungan.kompetensi_kurang.length - 3} lainnya
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Score */}
        <ScoreBadge score={score} />
      </div>

      {/* View detail link */}
      <Link
        to={`/app/magang/${pos?.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        id={`btn-detail-rekomendasi-${pos?.id}`}
      >
        Lihat Detail & Lamar
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function EmptyState({ onRefresh, refreshing }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <Star className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800">Belum ada rekomendasi</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        Lengkapi profil kompetensimu terlebih dahulu melalui Chatbot atau input manual, lalu klik
        &quot;Perbarui Rekomendasi&quot;.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/app/chatbot">
          <Button>Mulai Chatbot</Button>
        </Link>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing} id="btn-perbarui-empty">
          {refreshing ? "Memperbarui..." : "Coba Perbarui"}
        </Button>
      </div>
    </div>
  )
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getRecommendations()
      setRecommendations(data)
    } catch {
      toast.error("Gagal memuat rekomendasi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const data = await refreshRecommendations()
      setRecommendations(data)
      toast.success("Rekomendasi berhasil diperbarui!")
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memperbarui")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Rekomendasi Magang</h1>
          <p className="mt-2 text-slate-500">
            Top {recommendations.length || "N"} lowongan paling cocok berdasarkan kompetensimu (metode SAW)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          id="btn-perbarui-rekomendasi"
          className="flex-shrink-0"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Memperbarui..." : "Perbarui"}
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          { label: "≥ 75 Sangat Cocok", color: "bg-emerald-100 text-emerald-700" },
          { label: "50–74 Cukup Cocok", color: "bg-amber-100 text-amber-700" },
          { label: "< 50 Perlu Belajar", color: "bg-red-100 text-red-700" },
        ].map((l) => (
          <span key={l.label} className={`rounded-full px-3 py-1 font-medium ${l.color}`}>
            {l.label}
          </span>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.Card key={i} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState onRefresh={handleRefresh} refreshing={refreshing} />
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, i) => (
            <RecommendationCard key={rec.id ?? i} rec={rec} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
