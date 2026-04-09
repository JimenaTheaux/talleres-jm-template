import { useMemo, useState } from 'react'
import { Clock, Plus, AlertCircle, Eye } from 'lucide-react'
import { useAsistencia, useProfesores } from '@/hooks/useAsistencia'
import { formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import AsistenciaForm from '@/components/asistencia/AsistenciaForm'
import AsistenciaDetalle from '@/components/asistencia/AsistenciaDetalle'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import type { Perfil } from '@/types/app.types'

interface ResumenProfe {
  profe: Perfil
  totalHoras: number
  registros: number
}

export default function AsistenciaPage() {
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)
  const [formOpen, setFormOpen] = useState(false)
  const [detalleProfe, setDetalleProfe] = useState<Perfil | null>(null)

  const { data: registros = [], isLoading, isError } = useAsistencia({ periodo })
  const { data: profesores = [] } = useProfesores()

  // Agrupar por profesor
  const resumen = useMemo<ResumenProfe[]>(() => {
    const map = new Map<string, ResumenProfe>()
    registros.forEach((r) => {
      const existing = map.get(r.profe_id)
      if (existing) {
        existing.totalHoras += r.horas_trabajadas ?? 0
        existing.registros += 1
      } else {
        const profe = r.profe ?? profesores.find((p) => p.id === r.profe_id)
        if (profe) {
          map.set(r.profe_id, {
            profe,
            totalHoras: r.horas_trabajadas ?? 0,
            registros: 1,
          })
        }
      }
    })
    return Array.from(map.values()).sort((a, b) =>
      a.profe.apellido.localeCompare(b.profe.apellido)
    )
  }, [registros, profesores])

  const totalHorasMes = resumen.reduce((s, r) => s + r.totalHoras, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Asistencia</h1>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Registrar</span>
        </button>
      </div>

      {/* Filtro período + KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
        {!isLoading && resumen.length > 0 && (
          <div className="flex gap-3">
            <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
              <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted">
                Total horas
              </p>
              <p className="text-xl font-display font-black text-primary mt-0.5">
                {totalHorasMes.toFixed(1)}h
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-2 shadow-sm">
              <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted">
                Profesores
              </p>
              <p className="text-xl font-display font-black text-primary mt-0.5">
                {resumen.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabla resumen */}
      {isLoading ? <TableSkeleton rows={4} cols={4} /> : (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar registros</p>
          </div>
        ) : resumen.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Clock size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              Sin registros en {formatPeriodo(periodo)}
            </p>
            <button
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors mt-1"
            >
              <Plus size={16} />
              Primer registro
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Profesor
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden sm:table-cell">
                  Registros
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Total horas
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              {resumen.map(({ profe, totalHoras, registros: cant }) => (
                <tr key={profe.id} className="hover:bg-surface/60 transition-colors">
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                    <p className="font-semibold text-text-primary">
                      {profe.apellido}, {profe.nombre}
                    </p>
                    <p className="text-xs text-text-muted capitalize mt-0.5">{profe.rol}</p>
                  </td>
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden sm:table-cell">
                    {cant} {cant === 1 ? 'registro' : 'registros'}
                  </td>
                  <td className="px-4 py-3.5 border-t border-border">
                    <span className="text-lg font-display font-bold text-primary">
                      {totalHoras.toFixed(1)}
                      <span className="text-sm font-body font-normal text-text-muted ml-0.5">h</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 border-t border-border text-right">
                    <button
                      onClick={() => setDetalleProfe(profe)}
                      className="inline-flex items-center gap-1.5 text-accent hover:text-accent-dark font-body font-semibold text-sm transition-colors"
                    >
                      <Eye size={15} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}

      {/* Modales */}
      {formOpen && (
        <AsistenciaForm onClose={() => setFormOpen(false)} />
      )}

      {detalleProfe && (
        <AsistenciaDetalle
          profe={detalleProfe}
          periodo={periodo}
          onClose={() => setDetalleProfe(null)}
        />
      )}
    </div>
  )
}
