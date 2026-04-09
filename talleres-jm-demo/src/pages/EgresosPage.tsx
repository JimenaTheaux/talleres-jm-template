import { useState } from 'react'
import { TrendingDown, Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { useEgresos, useDeleteEgreso } from '@/hooks/useEgresos'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import { CATEGORIAS_EGRESO } from '@/lib/constants'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import EgresoForm from '@/components/egresos/EgresoForm'
import ConfirmModal from '@/components/common/ConfirmModal'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import type { Egreso } from '@/types/app.types'

const categoriaStyle: Record<string, { bg: string; color: string }> = {
  sueldos:      { bg: '#EFF6FF', color: '#1D4ED8' },
  alquiler:     { bg: '#F5F3FF', color: '#7C3AED' },
  equipamiento: { bg: '#FFF7ED', color: '#C2410C' },
  otros:        { bg: '#F8FAFC', color: '#64748B' },
}

const FILTROS_CAT = [{ value: 'todos', label: 'Todos' }, ...CATEGORIAS_EGRESO.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}))]

export default function EgresosPage() {
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [egresoEditando, setEgresoEditando] = useState<Egreso | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Egreso | null>(null)

  const { data: egresos = [], isLoading, isError } = useEgresos({
    periodo,
    categoria: categoriaFiltro,
  })
  const eliminar = useDeleteEgreso()

  const total = egresos.reduce((s, e) => s + e.monto, 0)

  const handleEditar = (egreso: Egreso) => {
    setEgresoEditando(egreso)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setEgresoEditando(null)
    setFormOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await eliminar.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingDown size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Egresos</h1>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo egreso</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS_CAT.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategoriaFiltro(f.value)}
              className={`px-3 py-1.5 rounded-xl font-body text-xs font-semibold transition-colors ${
                categoriaFiltro === f.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-text-secondary hover:bg-surface shadow-sm'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? <TableSkeleton rows={6} cols={5} /> : (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar los egresos</p>
          </div>
        ) : egresos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <TrendingDown size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              Sin egresos en {formatPeriodo(periodo)}
            </p>
            <button
              onClick={handleNuevo}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors mt-1"
            >
              <Plus size={16} />
              Registrar egreso
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Fecha
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Categoría
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Concepto
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Monto
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {egresos.map((egreso) => {
                  const style = categoriaStyle[egreso.categoria] ?? categoriaStyle.otros
                  return (
                    <tr key={egreso.id} className="hover:bg-surface/60 transition-colors">
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary whitespace-nowrap">
                        {new Date(egreso.fecha_egreso + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <span
                          className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full capitalize"
                          style={style}
                        >
                          {egreso.categoria}
                        </span>
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-primary">
                        {egreso.concepto}
                      </td>
                      <td className="text-sm font-body font-semibold text-text-primary px-4 py-3.5 border-t border-border text-right whitespace-nowrap">
                        {formatCurrency(egreso.monto)}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditar(egreso)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(egreso)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-error-bg hover:text-error transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Resumen */}
      {!isLoading && egresos.length > 0 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-body text-text-muted">
            {egresos.length} {egresos.length === 1 ? 'egreso' : 'egresos'}
          </p>
          <p className="text-sm font-display font-semibold text-text-primary">
            Total:{' '}
            <span className="text-error">{formatCurrency(total)}</span>
          </p>
        </div>
      )}

      {/* Modales */}
      {formOpen && (
        <EgresoForm
          egreso={egresoEditando}
          onClose={() => { setFormOpen(false); setEgresoEditando(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar egreso"
          description={`¿Eliminás "${deleteTarget.concepto}" por ${formatCurrency(deleteTarget.monto)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          destructive
          loading={eliminar.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
