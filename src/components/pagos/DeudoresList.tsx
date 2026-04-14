import { MessageCircle, X, Users, AlertCircle } from 'lucide-react'
import { useDeudores } from '@/hooks/usePagos'
import { useConfig } from '@/hooks/useConfig'
import { buildWhatsAppUrl, formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import { useState } from 'react'

interface DeudoresListProps {
  onClose: () => void
  periodoInicial?: string
}

export default function DeudoresList({ onClose, periodoInicial }: DeudoresListProps) {
  const [periodo, setPeriodo] = useState(periodoInicial ?? getCurrentPeriodo)
  const { data: pagos = [], isLoading, isError, error } = useDeudores(periodo)
  const { data: config } = useConfig()

  // Aplanar detalles en filas individuales de deudores
  const deudores = pagos.flatMap((p) =>
    (p.detalles ?? []).map((d) => ({
      pagoId: p.id,
      estado: p.estado,
      alumnoNombre: d.alumno ? `${d.alumno.apellido}, ${d.alumno.nombre}` : '—',
      tutorNombre: d.alumno?.nombre_tutor ?? null,
      tutorTelefono: d.alumno?.telefono_tutor ?? null,
      monto: d.monto_esperado || d.subtotal,
    }))
  )

  const getWhatsAppUrl = (deudor: (typeof deudores)[0]) => {
    if (!config || !deudor.tutorTelefono) return null
    return buildWhatsAppUrl(deudor.tutorTelefono, config.mensaje_deuda, {
      alumno: deudor.alumnoNombre,
      tutor: deudor.tutorNombre ?? 'tutor/a',
      periodo: formatPeriodo(periodo),
      monto: formatCurrency(deudor.monto),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-display font-bold text-text-primary">Deudores</h2>
            <p className="text-xs font-body text-text-muted mt-0.5">
              {deudores.length} alumno{deudores.length !== 1 ? 's' : ''} con deuda
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodoPicker value={periodo} onChange={setPeriodo} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={36} className="text-error" />
              <p className="font-body text-text-secondary text-sm">Error al cargar deudores</p>
              {error instanceof Error && (
                <p className="font-body text-text-muted text-xs max-w-xs text-center">{error.message}</p>
              )}
            </div>
          ) : deudores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users size={40} className="text-text-muted" />
              <p className="font-body font-semibold text-text-primary text-sm">
                Sin deudores en {formatPeriodo(periodo)}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Alumno
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Estado
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Monto
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    WA
                  </th>
                </tr>
              </thead>
              <tbody>
                {deudores.map((d, i) => {
                  const waUrl = getWhatsAppUrl(d)
                  return (
                    <tr key={`${d.pagoId}-${i}`} className="hover:bg-surface/60 transition-colors">
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                        <p className="font-semibold text-text-primary">{d.alumnoNombre}</p>
                        {d.tutorNombre && (
                          <p className="text-xs text-text-muted">Tutor: {d.tutorNombre}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <span
                          className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full"
                          style={
                            d.estado === 'parcial'
                              ? { background: '#FFFBEB', color: '#D97706' }
                              : { background: '#FEF2F2', color: '#DC2626' }
                          }
                        >
                          ● {d.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-sm font-body font-semibold text-text-primary px-4 py-3.5 border-t border-border text-right">
                        {d.monto > 0 ? formatCurrency(d.monto) : <span className="text-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border text-right">
                        {waUrl ? (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-xl font-display font-semibold text-xs hover:bg-[#1ebe59] transition-colors"
                          >
                            <MessageCircle size={14} />
                            WA
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted italic">Sin tel.</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {deudores.length > 0 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between">
            <p className="text-xs font-body text-text-muted">
              {deudores.filter((d) => d.tutorTelefono).length} con teléfono disponible
            </p>
            <p className="text-sm font-display font-semibold text-text-primary">
              Total deuda:{' '}
              <span className="text-error">
                {formatCurrency(deudores.reduce((s, d) => s + d.monto, 0))}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
