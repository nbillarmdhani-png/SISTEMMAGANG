import { cn } from "../../lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Skeleton } from "./Skeleton"

/**
 * AdminTable – reusable table with horizontal scroll, sticky header, pagination.
 *
 * Props:
 *   columns  – [{ key, label, render? }]
 *   data     – array of row objects
 *   loading  – boolean
 *   page     – current page (1-based)
 *   total    – total rows
 *   pageSize – rows per page (default 10)
 *   onPageChange – (newPage) => void
 *   rowKey   – key name or fn(row) => id (default "id")
 *   emptyMsg – string
 */
export function AdminTable({
  columns = [],
  data = [],
  loading = false,
  page = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
  rowKey = "id",
  emptyMsg = "Tidak ada data.",
  className,
}) {
  const totalPages = Math.ceil(total / pageSize)
  const getKey = (row) => (typeof rowKey === "function" ? rowKey(row) : row[rowKey])

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden", className)}>
      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton.Row key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-sm text-slate-400"
                >
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={getKey(row)}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 text-slate-700"
                    >
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-slate-500">
            Halaman {page} dari {totalPages} · Total {total} baris
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
