import { useState, useEffect } from "react"
import { Users, Briefcase, Building2, MessageSquare, FileText, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { Skeleton } from "../../components/ui/Skeleton"
import { getAdminStats } from "../../api/admin.api"
import toast from "react-hot-toast"

const STAT_STATUS_COLORS = {
  menunggu: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-400" },
  diterima: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500" },
  ditolak: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-400" },
  dibatalkan: { bg: "bg-slate-100", text: "text-slate-600", bar: "bg-slate-400" },
}

function StatCard({ label, value, icon: Icon, color, href }) {
  return (
    <Link to={href ?? "#"} className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <TrendingUp className="h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        <div className="mt-1 text-sm text-slate-500">{label}</div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => toast.error("Gagal memuat statistik"))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: "Total Mahasiswa", value: stats?.totalStudents, icon: Users, color: "bg-blue-50 text-blue-600", href: "/admin/pengguna" },
    { label: "Lowongan Terdaftar", value: stats?.totalPositions, icon: Briefcase, color: "bg-purple-50 text-purple-600", href: "/admin/posisi" },
    { label: "Total Perusahaan Mitra", value: stats?.totalCompanies, icon: Building2, color: "bg-teal-50 text-teal-600", href: "/admin/mitra" },
    { label: "Total Lamaran", value: stats?.totalApplications, icon: FileText, color: "bg-amber-50 text-amber-600", href: "/admin/lamaran" },
    { label: "Sesi Chatbot", value: stats?.totalSessions, icon: MessageSquare, color: "bg-rose-50 text-rose-600" },
  ]

  const appByStatus = stats?.applicationsByStatus ?? []
  const maxCount = Math.max(...appByStatus.map((s) => s.count), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan aktivitas sistem MagangConnect</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))
          : statCards.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
      </div>

      {/* Applications by status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Lamaran per Status</h2>
        {loading ? (
          <Skeleton.Text lines={4} />
        ) : appByStatus.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada data lamaran.</p>
        ) : (
          <div className="space-y-4">
            {appByStatus.map((s) => {
              const pct = Math.round((s.count / maxCount) * 100)
              const colors = STAT_STATUS_COLORS[s.status] ?? { bg: "bg-slate-50", text: "text-slate-700", bar: "bg-slate-400" }
              return (
                <div key={s.status} className="flex items-center gap-4">
                  <div className={`w-28 shrink-0 rounded-full px-3 py-1 text-center text-xs font-medium ${colors.bg} ${colors.text}`}>
                    {s.status}
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-semibold text-slate-700">{s.count}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Aksi Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {[
            { label: "Tambah Mitra", href: "/admin/mitra", icon: Building2 },
            { label: "Buat Lowongan", href: "/admin/posisi", icon: Briefcase },
            { label: "Tinjau Lamaran", href: "/admin/lamaran", icon: FileText },
            { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
          ].map((a) => (
            <Link
              key={a.label}
              to={a.href}
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              id={`quick-${a.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              <a.icon className="h-5 w-5 text-blue-500" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
