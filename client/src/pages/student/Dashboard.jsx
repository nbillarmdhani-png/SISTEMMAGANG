import { useEffect, useState } from "react"
import { useAuth } from "../../context/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card"
import { Link } from "react-router-dom"
import { ArrowRight, Briefcase, Star, MessageSquare, ChevronRight } from "lucide-react"
import { getRecommendations, getMyApplications } from "../../api/student.api"

function ScoreDot({ score }) {
  const pct = Math.round(score)
  let color = "bg-red-500"
  if (pct >= 75) color = "bg-emerald-500"
  else if (pct >= 50) color = "bg-amber-500"
  return (
    <span className={`inline-flex h-6 w-10 items-center justify-center rounded-full ${color} text-white text-xs font-bold`}>
      {pct}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Halo, {user?.mahasiswa?.nama_lengkap || "Mahasiswa"}! 👋
        </h1>
        <p className="text-slate-500 mt-2">
          Selamat datang di portal MagangConnect. Berikut ringkasan aktivitasmu.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rekomendasi Tersedia</CardTitle>
            <Star className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loadingRec ? "—" : recommendations.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Berdasarkan profil kompetensimu</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lamaran Aktif</CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {loadingApp ? "—" : activeApps}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {loadingApp ? "..." : `${applications.length} total lamaran`}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Kompetensi Profil</CardTitle>
            <MessageSquare className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {user?.mahasiswa?.mahasiswa_kompetensi?.length ?? "—"}
            </div>
            <p className="text-xs text-slate-500 mt-1">Gunakan chatbot untuk menambah</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rekomendasi Teratas</CardTitle>
              <CardDescription>Lowongan paling cocok untukmu</CardDescription>
            </div>
            <Link to="/app/rekomendasi" className="text-xs text-blue-600 hover:underline flex items-center gap-1" id="link-lihat-semua-rekomendasi">
              Lihat semua <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {loadingRec ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Star className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm text-slate-500 max-w-xs">
                  Belum ada rekomendasi. Lengkapi kompetensimu melalui Chatbot.
                </p>
                <Link
                  to="/app/chatbot"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  id="btn-mulai-chatbot-dashboard"
                >
                  <MessageSquare className="h-4 w-4" />
                  Mulai Chatbot
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <Link
                    key={rec.id ?? i}
                    to={`/app/magang/${rec.lowongan_magang?.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    id={`dashboard-rec-${rec.lowongan_magang?.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {rec.lowongan_magang?.judul_posisi}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {rec.lowongan_magang?.perusahaan?.nama_perusahaan}
                      </p>
                    </div>
                    <ScoreDot score={Number(rec.skor_kecocokan)} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Lanjutkan perjalanan magangmu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Jelajahi Lowongan", desc: "Temukan posisi magang terbaru", href: "/app/magang", icon: Briefcase },
              { label: "Analisis Kompetensi", desc: "Chat dengan AI untuk memetakan skill", href: "/app/chatbot", icon: MessageSquare },
              { label: "Lihat Lamaran Saya", desc: "Pantau status lamaranmu", href: "/app/lamaran", icon: ArrowRight },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.href}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                id={`quick-action-${a.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <a.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{a.label}</p>
                  <p className="text-xs text-slate-400">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
