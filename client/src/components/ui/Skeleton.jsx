import { cn } from "../../lib/utils"

/**
 * Skeleton – animated placeholder for loading states.
 * Usage:
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton.Text lines={3} />
 *   <Skeleton.Card />
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200",
        className
      )}
      {...props}
    />
  )
}

/** Multiple lines of text skeleton */
Skeleton.Text = function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  )
}

/** Full card skeleton */
Skeleton.Card = function SkeletonCard({ className }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton.Text lines={3} />
    </div>
  )
}

/** Table row skeleton */
Skeleton.Row = function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export { Skeleton }
