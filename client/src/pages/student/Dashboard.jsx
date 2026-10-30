import { useEffect, useState } from "react"
import { useAuth } from "../../context/useAuth"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, Star, MessageSquare, ChevronRight, Sparkles, Award, CheckCircle2, TrendingUp, Compass } from "lucide-react"
import { getRecommendations, getMyApplications } from "../../api/student.api"

function ScorePill({ score }) {
  const pct = Math.round(score)
  let badgeClass = "bg-red-50 text-red-700 border-red-200"
  if (pct >= 75) badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200"
  else if (pct >= 50) badgeClass = "bg-amber-50 text-amber-700 border-amber-200"

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${badgeClass}`}>
      <TrendingUp className="h-3 w-3" />
      {pct}% Cocok
    </span>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [applications, setApplications] = useState([])
  const [loadingRec, setLoadingRec] = useState(true)
  const [loadingApp, setLoadingApp] = useState(true)

  useEffect(() => {
    getRecommendations()
      .then(setRecommendations)
      .catch(() => {})
      .finally(() => setLoadingRec(false))
    getMyApplications()
      .then(setApplications)
      .catch(() => {})
      .finally(() => setLoadingApp(false))
  }, [])

  const activeApps = applications.filter((a) => a.status === "menunggu").length
  const competenciesCount = user?.mahasiswa?.mahasiswa_kompetensi?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Modern Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-200 backdrop-blur-md border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Portal Rekomendasi Magang Berbasis AI</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Selamat Datang, {user?.mahasiswa?.nama_lengkap || "Mahasiswa"}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Jelajahi lowongan magang yang paling sesuai dengan keahlianmu menggunakan analisis algoritma SAW dan asisten AI interaktif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/app/chatbot"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              id="btn-hero-chatbot"
            >
              <MessageSquare className="h-4 w-4" />
              Konsultasi AI
            </Link>
            <Link
              to="/app/magang"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all"
            >
              <Compass className="h-4 w-4" />
              Eksplor Lowongan
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Rekomendasi Magang
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Star className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {loadingRec ? "—" : recommendations.length}
            </span>
            <span className="text-xs text-slate-500">posisi cocok</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500">Dihitung otomatis via SAW</span>
            <Link to="/app/rekomendasi" className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              Lihat <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Lamaran Berjalan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {loadingApp ? "—" : activeApps}
            </span>
            <span className="text-xs text-slate-500">
              {loadingApp ? "memuat..." : `dari ${applications.length} total diajukan`}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500">Menunggu review mitra</span>
            <Link to="/app/lamaran" className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
              Pantau <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-subtle hover:shadow-card hover:border-indigo-200 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Kompetensi Terdaftar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {competenciesCount}
            </span>
            <span className="text-xs text-slate-500">keahlian dikuasai</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-500">Mempengaruhi akurasi rekomendasi</span>
            <Link to="/app/profil" className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
              Kelola <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommendations & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Top Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Rekomendasi Teratas Untukmu</h2>
                <p className="text-xs text-slate-500 mt-0.5">Disesuaikan dengan profil kompetensi dan preferensimu</p>
              </div>
              <Link
                to="/app/rekomendasi"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
                id="link-lihat-semua-rekomendasi"
              >
                Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loadingRec ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Belum Ada Rekomendasi Magang</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Lakukan pemetaan skill dengan chatbot AI atau tambahkan kompetensi di profilmu untuk menghasilkan rekomendasi.
                </p>
                <Link
                  to="/app/chatbot"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-all"
                  id="btn-mulai-chatbot-dashboard"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Mulai Pemetaan AI
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recommendations.slice(0, 4).map((rec, i) => (
                  <Link
                    key={rec.id ?? i}
                    to={`/app/magang/${rec.lowongan_magang?.id}`}
                    className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 hover:bg-white hover:border-blue-200 hover:shadow-subtle transition-all"
                    id={`dashboard-rec-${rec.lowongan_magang?.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 font-bold text-blue-600 text-sm shadow-subtle">
                        {rec.lowongan_magang?.perusahaan?.nama_perusahaan?.[0] || "P"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {rec.lowongan_magang?.judul_posisi}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {rec.lowongan_magang?.perusahaan?.nama_perusahaan} · {rec.lowongan_magang?.perusahaan?.kota || "Indonesia"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScorePill score={Number(rec.skor_kecocokan)} />
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-subtle">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">Aksi Cepat</h2>
              <p className="text-xs text-slate-500 mt-0.5">Navigasi praktis ke fitur-fitur penting</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Eksplor Lowongan Baru",
                  desc: "Temukan posisi magang terbaru dan terverifikasi",
                  href: "/app/magang",
                  icon: Compass,
                  color: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Konsultasi Asisten AI",
                  desc: "Petakan dan validasi skill teknis & non-teknismu",
                  href: "/app/chatbot",
                  icon: MessageSquare,
                  color: "bg-indigo-50 text-indigo-600",
                },
                {
                  label: "Lacak Status Lamaran",
                  desc: "Lihat tanggapan dari perusahaan tempatmu melamar",
                  href: "/app/lamaran",
                  icon: Briefcase,
                  color: "bg-emerald-50 text-emerald-600",
                },
                {
                  label: "Perbarui Berkas Profil",
                  desc: "Upload CV terbaru dan lengkapi tautan portofolio",
                  href: "/app/profil",
                  icon: CheckCircle2,
                  color: "bg-amber-50 text-amber-600",
                },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.label}
                    to={a.href}
                    className="group flex items-center gap-3.5 rounded-xl border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-subtle transition-all"
                    id={`quick-action-${a.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${a.color} transition-transform group-hover:scale-105`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {a.label}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{a.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
