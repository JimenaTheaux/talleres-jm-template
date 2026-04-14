import { useState } from 'react'
import { X, Plus, Pencil, Trash2, Clock, AlertCircle } from 'lucide-react'
import { useAsistencia, useDeleteAsistencia } from '@/hooks/useAsistencia'
import AsistenciaForm from './AsistenciaForm'
import ConfirmModal from '@/components/common/ConfirmModal'
import { formatPeriodo } from '@/lib/utils'
import type { AsistenciaProfe, Perfil } from '@/types/app.types'

interface AsistenciaDetalleProps {
  profe: Perfil
  periodo: string
  onClose: () => void
}

export default function AsistenciaDetalle({ profe, periodo, onClose }: AsistenciaDetalleProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState<AsistenciaProfe | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AsistenciaProfe | null>(null)

  const { data: registros = [], isLoading, isError } = useAsistencia({
    profeId: profe.id,
    periodo,
  })
  const eliminar = useDeleteAsistencia()

  const totalHoras = registros.reduce((s, r) => s + (r.horas_trabajadas ?? 0), 0)

  const handleEditar = (r: AsistenciaProfe) => {
    setEditando(r)
    setFormOpen(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-lg font-display font-bold text-text-primary">
                {profe.apellido}, {profe.nombre}
              </h2>
              <p className="text-xs font-body text-text-muted mt-0.5">
                {formatPeriodo(periodo)} — {registros.length} registro{registros.length !== 1 ? 's' : ''} · {totalHoras.toFixed(1)}h totales
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditando(null); setFormOpen(true) }}
                className="flex items-center gap-1.5 bg-accent text-white px-3 py-2 rounded-xl font-display font-semibold text-xs hover:bg-accent-dark transition-colors"
              >
                <Plus size={14} />
                Registrar
              </button>
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
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <AlertCircle size={32} className="text-error" />
                <p className="text-sm font-body text-text-secondary">Error al cargar registros</p>
              </div>
            ) : registros.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Clock size={36} className="text-text-muted" />
                <p className="text-sm font-body font-semibold text-text-primary">
                  Sin registros en {formatPeriodo(periodo)}
                </p>
                <button
                  onClick={() => { setEditando(null); setFormOpen(true) }}
                  className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
                >
                  <Plus size={16} />
                  Primer registro
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface">
                    {['Fecha', 'Entrada', 'Salida', 'Horas', 'Observaciones', ''].map((h) => (
                      <th
                        key={h}
                        className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r) => (
                    <tr key={r.id} className="hover:bg-surface/60 transition-colors">
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-primary whitespace-nowrap">
                        {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary">
                        {r.hora_entrada.slice(0, 5)}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary">
                        {r.hora_salida.slice(0, 5)}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                        {r.horas_trabajadas != null ? (
                          <span className="font-semibold text-primary">{r.horas_trabajadas}h</span>
                        ) : (
                          <span className="text-text-muted italic">—</span>
                        )}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary max-w-[180px] truncate">
                        {r.observaciones ?? <span className="text-text-muted italic">—</span>}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditar(r)}
                            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(r)}
                            className="p-1.5 rounded-lg text-text-secondary hover:bg-error-bg hover:text-error transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer total */}
          {registros.length > 0 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-end">
              <p className="text-sm font-display font-semibold text-text-primary">
                Total:{' '}
                <span className="text-primary text-base">{totalHoras.toFixed(1)} horas</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <AsistenciaForm
          registro={editando}
          profeId={profe.id}
          onClose={() => { setFormOpen(false); setEditando(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar registro"
          description={`¿Eliminás el registro del ${new Date(deleteTarget.fecha + 'T00:00:00').toLocaleDateString('es-AR')}?`}
          confirmLabel="Eliminar"
          destructive
          loading={eliminar.isPending}
          onConfirm={async () => {
            await eliminar.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
