import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

/**
 * Modal overlay component.
 * Props:
 *   isOpen    – boolean
 *   onClose   – () => void
 *   title     – string (optional)
 *   children  – React.ReactNode
 *   size      – "sm" | "md" | "lg" (default "md")
 */
export function Modal({ isOpen, onClose, title, children, size = "md", className }) {
  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full rounded-xl bg-white shadow-xl transition-all",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Tutup modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn("p-6", !title && "pt-6")}>{children}</div>
      </div>
    </div>
  )
}

/**
 * Reusable confirmation/delete dialog.
 */
export function ConfirmModal({ isOpen, onClose, onConfirm, title = "Konfirmasi", message, confirmLabel = "Hapus", danger = true, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors",
            danger
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {loading ? "Memproses..." : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
