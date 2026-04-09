import { useState } from 'react'
import {
  CreditCard, Plus, AlertCircle, Pencil, Trash2, Users, Zap,
} from 'lucide-react'
import { usePagos, useDeletePago, useGenerarDeudas } from '@/hooks/usePagos'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import PagoForm from '@/components/pagos/PagoForm'
import DeudoresList from '@/components/pagos/DeudoresList'
import ConfirmModal from '@/components/common/ConfirmModal'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import type { Pago } from '@/types/app.types'

const ESTADOS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pagado', label: 'Pagados' },
  { value: 'deuda', label: 'Deudas' },
  { value: 'parcial', label: 'Parciales' },
]

const estadoStyle: Record<string, { bg: string; color: string }> = {
  pagado:  { bg: '#F0FDF4', color: '#16A34A' },
  deuda:   { bg: '#FEF2F2', color: '#DC2626' },
  parcial: { bg: '#FFFBEB', color: '#D97706' },
}

export default function PagosPage() {
  const { perfil } = useAuthStore()
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null)
  const [deudoresOpen, setDeudoresOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Pago | null>(null)
  const [generarConfirm, setGenerarConfirm] = useState(false)
  const [generarResult, setGenerarResult] = useState<number | null>(null)

  const { data: pagos = [], isLoading, isError } = usePagos({
    periodo,
    estado: estadoFiltro,
  })

  const eliminar = useDeletePago()
  const generar = useGenerarDeudas()

  const handleEditar = (pago: Pago) => {
    setPagoEditando(pago)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setPagoEditando(null)
    setFormOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await eliminar.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleGenerarDeudas = async () => {
    const count = await generar.mutateAsync({ periodo, createdBy: perfil?.id })
    setGenerarConfirm(false)
    setGenerarResult(count)
  }

  // Nombres de alumnos de un pago para mostrar en la tabla
  const alumnosLabel = (pago: Pago) => {
    const detalles = pago.detalles ?? []
    if (detalles.length === 0) return <span className="text-text-muted italic">Sin alumnos</span>
    const primero = detalles[0].alumno
    const nombre = primero ? `${primero.apellido}, ${primero.nombre}` : '—'
    if (detalles.length === 1) return nombre
    return `${nombre} +${detalles.length - 1}`
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <CreditCard size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Pagos</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeudoresOpen(true)}
            className="flex items-center gap-2 bg-card text-text-primary border border-border px-3 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-surface transition-colors shadow-sm"
          >
            <Users size={16} />
            <span className="hidden sm:inline">Deudores</span>
          </button>
          <button
            onClick={() => setGenerarConfirm(true)}
            className="flex items-center gap-2 bg-warning-bg text-warning border border-warning/20 px-3 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-amber-100 transition-colors shadow-sm"
          >
            <Zap size={16} />
            <span className="hidden sm:inline">Generar deudas</span>
          </button>
          <button
            onClick={handleNuevo}
            className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nuevo pago</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex gap-1.5">
          {ESTADOS.map((e) => (
            <button
              key={e.value}
              onClick={() => setEstadoFiltro(e.value)}
              className={`px-3 py-1.5 rounded-xl font-body text-xs font-semibold transition-colors ${
                estadoFiltro === e.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-text-secondary hover:bg-surface shadow-sm'
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notificación generar deudas */}
      {generarResult !== null && (
        <div
          className="flex items-center justify-between bg-success-bg border border-success/20 rounded-xl px-4 py-3 mb-4 cursor-pointer"
          onClick={() => setGenerarResult(null)}
        >
          <p className="text-sm font-body text-success font-medium">
            ✓ Se generaron {generarResult} deuda{generarResult !== 1 ? 's' : ''} para{' '}
            {formatPeriodo(periodo)}
          </p>
          <span className="text-xs text-success/60">✕</span>
        </div>
      )}

      {/* Tabla */}
      {isLoading ? <TableSkeleton rows={6} cols={5} /> : (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar los pagos</p>
          </div>
        ) : pagos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <CreditCard size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              Sin pagos en {formatPeriodo(periodo)}
            </p>
            <p className="text-xs font-body text-text-muted">
              Registrá un pago o generá las deudas del mes
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Alumno(s)
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden md:table-cell">
                    Tipo
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Estado
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden lg:table-cell">
                    Fecha pago
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Total
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-surface/60 transition-colors">
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                      <p className="font-semibold text-text-primary">{alumnosLabel(pago)}</p>
                      {pago.forma_pago && (
                        <p className="text-xs text-text-muted capitalize mt-0.5">
                          {pago.forma_pago}
                        </p>
                      )}
                    </td>
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary capitalize hidden md:table-cell">
                      {pago.tipo_pago}
                    </td>
                    <td className="px-4 py-3.5 border-t border-border">
                      <span
                        className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full"
                        style={estadoStyle[pago.estado] ?? estadoStyle.deuda}
                      >
                        ● {pago.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden lg:table-cell">
                      {pago.fecha_pago
                        ? new Date(pago.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR')
                        : <span className="text-text-muted italic">—</span>}
                    </td>
                    <td className="text-sm font-body font-semibold text-text-primary px-4 py-3.5 border-t border-border text-right">
                      {pago.total > 0 ? formatCurrency(pago.total) : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3.5 border-t border-border">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditar(pago)}
                          className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(pago)}
                          className="p-2 rounded-lg text-text-secondary hover:bg-error-bg hover:text-error transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Contador + resumen */}
      {!isLoading && pagos.length > 0 && (
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs font-body text-text-muted">
            {pagos.length} {pagos.length === 1 ? 'registro' : 'registros'}
          </p>
          <p className="text-sm font-display font-semibold text-text-primary">
            Total:{' '}
            <span className="text-accent">
              {formatCurrency(pagos.reduce((s, p) => s + (p.total ?? 0), 0))}
            </span>
          </p>
        </div>
      )}

      {/* Modales */}
      {formOpen && <PagoForm pago={pagoEditando} onClose={() => { setFormOpen(false); setPagoEditando(null) }} />}

      {deudoresOpen && <DeudoresList onClose={() => setDeudoresOpen(false)} />}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar pago"
          description={`¿Eliminás el pago de ${formatPeriodo(deleteTarget.periodo)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          destructive
          loading={eliminar.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {generarConfirm && (
        <ConfirmModal
          title={`Generar deudas — ${formatPeriodo(periodo)}`}
          description={`Se crearán registros de deuda para todos los alumnos activos que aún no tengan pago en ${formatPeriodo(periodo)}. Los que ya tienen registro no se duplican.`}
          confirmLabel="Generar"
          loading={generar.isPending}
          onConfirm={handleGenerarDeudas}
          onCancel={() => setGenerarConfirm(false)}
        />
      )}
    </div>
  )
}
