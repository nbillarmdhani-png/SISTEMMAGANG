import { useState, useEffect, useCallback } from "react"
import { Bell, CheckCheck, Briefcase, Star, Info } from "lucide-react"
import toast from "react-hot-toast"
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../api/student.api"
import { Skeleton } from "../../components/ui/Skeleton"
import { Button } from "../../components/ui/Button"

const TIPE_ICONS = {
  lamaran: Briefcase,
  rekomendasi: Star,
}

function formatRelativeTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return "Baru saja"
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  return `${Math.floor(diff / 86400)} hari lalu`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setNotifications(await getNotifications()) }
    catch { toast.error("Gagal memuat notifikasi") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleRead(id) {
    try {
      await markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, dibaca: 1 } : n))
      )
    } catch { /* silent */ }
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: 1 })))
      toast.success("Semua notifikasi ditandai dibaca")
    } catch {
      toast.error("Gagal menandai semua")
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.dibaca).length

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-slate-500">
              {unreadCount} notifikasi belum dibaca
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
            id="btn-tandai-semua"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            {markingAll ? "Menandai..." : "Tandai Semua Dibaca"}
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Tidak ada notifikasi</h3>
          <p className="mt-2 text-sm text-slate-500">Notifikasi lamaran dan rekomendasi akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = TIPE_ICONS[notif.tipe] ?? Info
            const isUnread = !notif.dibaca

            return (
              <button
                key={notif.id}
                onClick={() => !notif.dibaca && handleRead(notif.id)}
                id={`notif-${notif.id}`}
                className={`w-full text-left rounded-xl border px-4 py-4 transition-colors ${
                  isUnread
                    ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    isUnread ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${isUnread ? "text-blue-900" : "text-slate-800"}`}>
                        {notif.judul}
                      </p>
                      {isUnread && (
                        <span className="flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-600 mt-1" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{notif.pesan}</p>
                    <p className="mt-1.5 text-xs text-slate-400">{formatRelativeTime(notif.created_at)}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
