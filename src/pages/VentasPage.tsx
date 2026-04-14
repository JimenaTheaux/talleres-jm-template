import { useState } from 'react'
import { ShoppingBag, Plus, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import ProductoThumb from '@/components/common/ProductoThumb'
import { useVentas, useDeleteVenta } from '@/hooks/useVentas'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import VentaForm from '@/components/ventas/VentaForm'
import ConfirmModal from '@/components/common/ConfirmModal'
import type { Venta } from '@/types/app.types'

const estadoStyle: Record<string, { bg: string; color: string }> = {
  pagado: { bg: '#F0FDF4', color: '#16A34A' },
  deuda:  { bg: '#FEF2F2', color: '#DC2626' },
}

const FILTROS = [
  { value: 'todos',  label: 'Todos' },
  { value: 'pagado', label: 'Pagados' },
  { value: 'deuda',  label: 'Deudas' },
]

export default function VentasPage() {
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [ventaEditando, setVentaEditando] = useState<Venta | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Venta | null>(null)

  const { data: ventas = [], isLoading, isError } = useVentas({ periodo, estado: estadoFiltro })
  const eliminar = useDeleteVenta()

  const totalVentas   = ventas.reduce((s, v) => s + v.total, 0)
  const totalCobrado  = ventas.filter((v) => v.estado === 'pagado').reduce((s, v) => s + v.total, 0)
  const totalPendiente = ventas.filter((v) => v.estado === 'deuda').reduce((s, v) => s + v.total, 0)

  const handleEditar = (venta: Venta) => {
    setVentaEditando(venta)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setVentaEditando(null)
    setFormOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Ventas</h1>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nueva venta</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
        <div className="flex gap-1.5">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setEstadoFiltro(f.value)}
              className={`px-3 py-1.5 rounded-xl font-body text-xs font-semibold transition-colors ${
                estadoFiltro === f.value
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-text-secondary hover:bg-surface shadow-sm'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs rápidos */}
      {!isLoading && ventas.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total ventas', value: totalVentas, color: 'text-primary' },
            { label: 'Cobrado', value: totalCobrado, color: 'text-success' },
            { label: 'Pendiente', value: totalPendiente, color: 'text-error' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card rounded-2xl border border-border shadow-sm px-4 py-3">
              <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted">
                {label}
              </p>
              <p className={`text-lg font-display font-black mt-0.5 ${color}`}>
                {formatCurrency(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar las ventas</p>
          </div>
        ) : ventas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShoppingBag size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              Sin ventas en {formatPeriodo(periodo)}
            </p>
            <button
              onClick={handleNuevo}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors mt-1"
            >
              <Plus size={16} />
              Registrar primera venta
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
                    Producto
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden md:table-cell">
                    Alumno
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right hidden sm:table-cell">
                    Cant.
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right hidden lg:table-cell">
                    P. unitario
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Total
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Estado
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta) => {
                  const style = estadoStyle[venta.estado] ?? estadoStyle.pagado
                  return (
                    <tr key={venta.id} className="hover:bg-surface/60 transition-colors">
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary whitespace-nowrap">
                        {new Date(venta.fecha_venta + 'T00:00:00').toLocaleDateString('es-AR')}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface flex items-center justify-center">
                            <ProductoThumb src={venta.producto?.foto_url} alt={venta.producto?.nombre} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary truncate">
                              {venta.producto?.nombre ?? '—'}
                            </p>
                            {venta.producto?.talle && (
                              <p className="text-xs text-text-muted">Talle {venta.producto.talle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden md:table-cell">
                        {venta.alumno
                          ? `${venta.alumno.apellido}, ${venta.alumno.nombre}`
                          : <span className="text-text-muted italic">Venta directa</span>}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary text-right hidden sm:table-cell">
                        {venta.cantidad}
                      </td>
                      <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary text-right hidden lg:table-cell">
                        {formatCurrency(venta.precio_venta)}
                      </td>
                      <td className="text-sm font-body font-semibold text-text-primary px-4 py-3.5 border-t border-border text-right whitespace-nowrap">
                        {formatCurrency(venta.total)}
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <span
                          className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full"
                          style={style}
                        >
                          ● {venta.estado.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 border-t border-border">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditar(venta)}
                            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(venta)}
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

      {/* Contador */}
      {!isLoading && ventas.length > 0 && (
        <p className="text-xs font-body text-text-muted mt-3 text-right">
          {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
        </p>
      )}

      {/* Modales */}
      {formOpen && (
        <VentaForm
          venta={ventaEditando}
          onClose={() => { setFormOpen(false); setVentaEditando(null) }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar venta"
          description={`¿Eliminás la venta de "${deleteTarget.producto?.nombre ?? 'producto'}" por ${formatCurrency(deleteTarget.total)}?`}
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
    </div>
  )
}
