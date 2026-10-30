import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/useAuth"
import { useEffect, useState } from "react"
import { LayoutDashboard, User, Briefcase, MessageSquare, Star, FileText, Bell, LogOut, Menu } from "lucide-react"
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
    { name: "Profil", href: "/app/profil", icon: User },
    { name: "Daftar Lowongan", href: "/app/magang", icon: Briefcase },
    { name: "Chatbot Kompetensi", href: "/app/chatbot", icon: MessageSquare },
    { name: "Rekomendasi", href: "/app/rekomendasi", icon: Star },
    { name: "Lamaran Saya", href: "/app/lamaran", icon: FileText },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Mobile Navbar */}
      <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold text-slate-900">MagangConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/app/notifikasi" className="relative p-2 text-slate-500" id="btn-notif-mobile">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r transition-transform duration-300 md:static md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-6 border-b">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">MagangConnect</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-4">
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-slate-400")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.mahasiswa?.nama_lengkap?.[0] || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900">{user?.mahasiswa?.nama_lengkap}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden h-16 items-center justify-end gap-4 border-b bg-white px-8 md:flex">
          <Link
            to="/app/notifikasi"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
            id="btn-notifikasi-bell"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
