import { useState } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { useAsistencia } from '@/hooks/useAsistencia'
import { useAuthStore } from '@/store/authStore'
import { formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import { TableSkeleton } from '@/components/common/TableSkeleton'

export default function MisHorasPage() {
  const { perfil } = useAuthStore()
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)

  const { data: registros = [], isLoading, isError } = useAsistencia({
    profeId: perfil?.id,
    periodo,
  })

  const totalHoras = registros.reduce((s, r) => s + (r.horas_trabajadas ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Clock size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Mis Horas</h1>
        </div>
        {perfil && (
          <p className="text-sm font-body text-text-secondary ml-9">
            {perfil.nombre} {perfil.apellido}
          </p>
        )}
      </div>

      {/* Período + KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
        {!isLoading && (
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl px-5 py-3 shadow-md">
            <p className="text-xs font-body font-medium uppercase tracking-wide text-white/60">
              Total {formatPeriodo(periodo)}
            </p>
            <p className="text-3xl font-display font-black text-white mt-0.5">
              {totalHoras.toFixed(1)}
              <span className="text-lg font-body font-normal text-white/70 ml-1">horas</span>
            </p>
          </div>
        )}
      </div>

      {/* Lista de registros */}
      {isLoading ? <TableSkeleton rows={5} cols={5} /> : (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar tus registros</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Clock size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              Sin registros en {formatPeriodo(periodo)}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Fecha
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Entrada
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Salida
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                  Horas
                </th>
                <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden sm:table-cell">
                  Observaciones
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-surface/60 transition-colors">
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border font-semibold text-text-primary whitespace-nowrap">
                    {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </td>
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary">
                    {r.hora_entrada.slice(0, 5)}
                  </td>
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary">
                    {r.hora_salida.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3.5 border-t border-border">
                    {r.horas_trabajadas != null ? (
                      <span className="font-display font-bold text-primary">
                        {r.horas_trabajadas}h
                      </span>
                    ) : (
                      <span className="text-text-muted italic text-sm">—</span>
                    )}
                  </td>
                  <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden sm:table-cell">
                    {r.observaciones ?? <span className="text-text-muted italic">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  )
}
