import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { getPositions } from "../../api/student.api"
import { useDebounce } from "../../hooks/useDebounce"
import { PositionCard } from "../../components/positions/PositionCard"
import { Skeleton } from "../../components/ui/Skeleton"

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Search className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Tidak ada lowongan ditemukan</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs">
        Coba ubah kata kunci atau hapus filter untuk melihat lebih banyak lowongan.
      </p>
    </div>
  )
}

export default function PositionList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [positions, setPositions] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  // Filter state
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [kota, setKota] = useState(searchParams.get("kota") ?? "")
  const [isRemote, setIsRemote] = useState(searchParams.get("is_remote") ?? "")
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1))

  const debouncedQuery = useDebounce(query, 400)
  const debouncedKota = useDebounce(kota, 400)

  const load = useCallback(async () => {
    setLoading(true)
    const params = { page, limit: 12 }
    if (debouncedQuery) params.q = debouncedQuery
    if (debouncedKota) params.kota = debouncedKota
    if (isRemote) params.is_remote = isRemote

    // Sync URL
    const sp = new URLSearchParams()
    if (debouncedQuery) sp.set("q", debouncedQuery)
    if (debouncedKota) sp.set("kota", debouncedKota)
    if (isRemote) sp.set("is_remote", isRemote)
    if (page > 1) sp.set("page", page)
    setSearchParams(sp, { replace: true })

    try {
      const res = await getPositions(params)
      setPositions(res.data)
      setMeta(res.meta)
    } catch {
      setPositions([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, debouncedKota, isRemote, page, setSearchParams])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, debouncedKota, isRemote])

  useEffect(() => {
    load()
  }, [load])

  function clearFilters() {
    setQuery("")
    setKota("")
    setIsRemote("")
    setPage(1)
  }

  const hasFilters = debouncedQuery || debouncedKota || isRemote

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daftar Lowongan Magang</h1>
        <p className="mt-2 text-slate-500">Temukan peluang magang yang sesuai dengan kompetensimu</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="input-cari-lowongan"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari posisi, nama perusahaan..."
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          id="btn-filter"
          onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors ${
            filterOpen || hasFilters
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {hasFilters && (
            <span className="ml-1 rounded-full bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center">
              {[debouncedQuery, debouncedKota, isRemote].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Kota</label>
            <input
              id="input-filter-kota"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              placeholder="Jakarta, Bandung..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Tipe Kerja</label>
            <select
              id="select-filter-remote"
              value={isRemote}
              onChange={(e) => setIsRemote(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="true">Remote</option>
              <option value="false">Onsite</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              id="btn-hapus-filter"
              onClick={clearFilters}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hapus Filter
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-slate-500">
          Menampilkan <span className="font-semibold text-slate-700">{positions.length}</span> dari{" "}
          <span className="font-semibold text-slate-700">{meta.total}</span> lowongan
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : positions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {positions.map((pos) => (
            <PositionCard key={pos.id} position={pos} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            id="btn-prev-page"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-sm text-slate-500">
            Halaman {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            id="btn-next-page"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      )}
    </div>
  )
}
