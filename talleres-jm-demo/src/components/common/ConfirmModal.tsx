import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      <div className="relative bg-card rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              destructive ? 'bg-error-bg' : 'bg-warning-bg'
            }`}
          >
            <AlertTriangle
              size={20}
              className={destructive ? 'text-error' : 'text-warning'}
            />
          </div>
          <div>
            <h3 className="font-display font-semibold text-text-primary text-base">{title}</h3>
            <p className="mt-1 text-sm font-body text-text-secondary">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-card text-text-primary border border-border px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-surface transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-display font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              destructive
                ? 'bg-error-bg text-error border border-error/20 hover:bg-red-100'
                : 'bg-accent text-white hover:bg-accent-dark'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
