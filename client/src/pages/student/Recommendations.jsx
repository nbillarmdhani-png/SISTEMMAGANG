import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { RefreshCw, ArrowRight, MapPin, Clock, Wifi, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from "lucide-react"
import toast from "react-hot-toast"
import { getRecommendations, refreshRecommendations } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { Button } from "../../components/ui/Button"

function ScoreBadge({ score }) {
  const pct = Math.round(score)
  let colorClass = "bg-red-50 text-red-700 border-red-200"
  if (pct >= 75) colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200"
  else if (pct >= 50) colorClass = "bg-amber-50 text-amber-700 border-amber-200"

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border px-3.5 py-2.5 min-w-[72px] shadow-subtle ${colorClass}`}>
      <span className="text-2xl font-extrabold leading-none tracking-tight">{pct}%</span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-1">Kecocokan</span>
    </div>
  )
}

function RecommendationCard({ rec, rank }) {
  const { lowongan_magang: pos, skor_kecocokan, detail_perhitungan } = rec
  const score = Number(skor_kecocokan)

  return (
    <div className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-blue-300 transition-all duration-200">
      {/* Rank badge */}
      <div className="absolute -top-3 -left-2 flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">
        #{rank}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Company logo */}
          {pos?.perusahaan?.logo ? (
            <img src={pos.perusahaan.logo} alt={pos.perusahaan.nama_perusahaan} className="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-white p-1 flex-shrink-0 shadow-sm" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-sm shadow-blue-500/20">
              {pos?.perusahaan?.nama_perusahaan?.[0] ?? "P"}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {pos?.judul_posisi ?? "Posisi Lowongan"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">{pos?.perusahaan?.nama_perusahaan}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 text-xs">
              {pos?.perusahaan?.kota && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 px-2.5 py-1 text-slate-600 text-[11px] font-medium">
                  <MapPin className="h-3 w-3 text-slate-400" /> {pos.perusahaan.kota}
                </span>
              )}
              {pos?.is_remote ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                  <Wifi className="h-3 w-3" /> Remote
                </span>
              ) : null}
              {pos?.durasi_bulan && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 text-[11px] font-medium border border-blue-100">
                  <Clock className="h-3 w-3" /> {pos.durasi_bulan} Bulan
                </span>
              )}
            </div>

            {/* Detail & Skill Gap */}
            {detail_perhitungan && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${
                  detail_perhitungan.wajib_terpenuhi ? "text-emerald-700" : "text-amber-700"
                }`}>
                  {detail_perhitungan.wajib_terpenuhi ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Semua kompetensi wajib terpenuhi</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                      <span>Ada kompetensi wajib yang belum dimiliki</span>
                    </>
                  )}
                </p>
                {Array.isArray(detail_perhitungan.kompetensi_kurang) && detail_perhitungan.kompetensi_kurang.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-medium text-slate-400">Skill belum ada:</span>
                    {detail_perhitungan.kompetensi_kurang.slice(0, 3).map((k, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          k.wajib ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {k.nama} {k.wajib && "*"}
                      </span>
                    ))}
                    {detail_perhitungan.kompetensi_kurang.length > 3 && (
                      <span className="text-[10px] font-medium text-slate-400">
                        +{detail_perhitungan.kompetensi_kurang.length - 3} lainnya
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Score badge */}
        <div className="self-end sm:self-center">
          <ScoreBadge score={score} />
        </div>
      </div>

      {/* View detail link */}
      <Link
        to={`/app/magang/${pos?.id}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all group-hover:bg-blue-50/50"
        id={`btn-detail-rekomendasi-${pos?.id}`}
      >
        <span>Lihat Detail Posisi & Ajukan Lamaran</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

function EmptyState({ onRefresh, refreshing }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Sparkles className="h-8 w-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900">Belum Ada Rekomendasi Magang</h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
        Lengkapi profil kompetensimu terlebih dahulu melalui Asisten AI atau input manual, lalu perbarui daftar rekomendasi.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to="/app/chatbot">
          <Button className="rounded-xl shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Mulai Asisten AI
          </Button>
        </Link>
        <Button variant="outline" onClick={onRefresh} disabled={refreshing} id="btn-perbarui-empty" className="rounded-xl">
          {refreshing ? "Memperbarui..." : "Perbarui Sekarang"}
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
      toast.success("Rekomendasi berhasil diperbarui")
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Gagal memperbarui")
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-2">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Algoritma SAW (Simple Additive Weighting)</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Rekomendasi Magang</h1>
          <p className="mt-1 text-xs text-slate-500">
            Daftar {recommendations.length} posisi yang paling cocok dihitung berdasarkan pembobotan kompetensi profilmu
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing || loading}
          id="btn-perbarui-rekomendasi"
          className="rounded-xl shadow-subtle hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Menghitung..." : "Perbarui Rekomendasi"}
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 mr-1">Tingkat Kecocokan:</span>
        <span className="rounded-lg px-2.5 py-1 font-semibold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">
          Sangat Cocok (≥ 75%)
        </span>
        <span className="rounded-lg px-2.5 py-1 font-semibold text-[11px] bg-amber-50 text-amber-700 border border-amber-100">
          Cukup Cocok (50% – 74%)
        </span>
        <span className="rounded-lg px-2.5 py-1 font-semibold text-[11px] bg-red-50 text-red-700 border border-red-100">
          Perlu Adaptasi (&lt; 50%)
        </span>
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
