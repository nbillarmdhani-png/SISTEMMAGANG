import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useEffect, useState } from "react"
import { LayoutDashboard, User, Briefcase, MessageSquare, Star, FileText, Bell, LogOut, Menu, Sparkles, ChevronRight, X } from "lucide-react"
import { cn } from "../lib/utils"
import { getNotifications } from "../api/student.api"

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll notifikasi setiap 30 detik
  useEffect(() => {
    let cancelled = false
    async function fetchUnread() {
      try {
        const data = await getNotifications()
        if (!cancelled) setUnreadCount(data.filter((n) => !n.dibaca).length)
      } catch { /* silent */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Reset badge saat berada di halaman notifikasi
  useEffect(() => {
    if (location.pathname === "/app/notifikasi") setUnreadCount(0)
  }, [location.pathname])

  const navItems = [
    { name: "Dashboard", href: "/app", icon: LayoutDashboard },
    { name: "Profil Mahasiswa", href: "/app/profil", icon: User },
    { name: "Eksplor Lowongan", href: "/app/magang", icon: Briefcase },
    { name: "Asisten AI Kompetensi", href: "/app/chatbot", icon: MessageSquare, badge: "AI" },
    { name: "Rekomendasi Magang", href: "/app/rekomendasi", icon: Star },
    { name: "Status Lamaran", href: "/app/lamaran", icon: FileText },
  ]

  const activePage = navItems.find((item) =>
    item.href === "/app"
      ? location.pathname === item.href
      : location.pathname.startsWith(item.href)
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row antialiased">
      {/* Mobile Navbar */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur px-4 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">MagangConnect</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/notifikasi" className="relative p-2 text-slate-600 hover:text-blue-600" id="btn-notif-mobile">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 md:static md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">MagangConnect</span>
            <span className="text-[11px] font-medium text-slate-400 block">Sistem Rekomendasi Karir</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === "/app"
                  ? location.pathname === item.href
                  : location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-50/80 text-blue-700 font-semibold shadow-sm shadow-blue-500/5"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-200/70 bg-white mb-2 shadow-subtle">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user?.mahasiswa?.nama_lengkap?.[0] || "M"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
                {user?.mahasiswa?.nama_lengkap || "Mahasiswa"}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/70 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Keluar dari Akun
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 md:flex sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Portal Mahasiswa</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-800">{activePage?.name || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/app/notifikasi"
              className="relative rounded-xl border border-slate-200/80 bg-white p-2.5 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-subtle"
              id="btn-notifikasi-bell"
              title="Notifikasi"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
