import { useState } from 'react'
import { Plus, Pencil, ShoppingBag, Search, AlertCircle } from 'lucide-react'
import ProductoThumb from '@/components/common/ProductoThumb'
import { useProductos, useToggleProductoActivo } from '@/hooks/useProductos'
import { formatCurrency } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import ProductoForm from './ProductoForm'
import type { Producto } from '@/types/app.types'

export default function ProductosSection() {
  const { data: productos = [], isLoading, isError } = useProductos(false)
  const toggle = useToggleProductoActivo()

  const [formOpen, setFormOpen] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [search, setSearch] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('todos')

  const handleEditar = (p: Producto) => {
    setProductoEditando(p)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setProductoEditando(null)
    setFormOpen(true)
  }

  const filtrados = productos.filter((p) => {
    const matchSearch = !search || p.nombre.toLowerCase().includes(search.toLowerCase()) || (p.detalle ?? '').toLowerCase().includes(search.toLowerCase())
    const matchActivo =
      filtroActivo === 'todos' ||
      (filtroActivo === 'activos' && p.activo) ||
      (filtroActivo === 'inactivos' && !p.activo)
    return matchSearch && matchActivo
  })

  return (
    <div>
      {/* Header de sección */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-primary" />
          <h2 className="text-sm font-display font-bold text-text-primary">Productos</h2>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-1.5 bg-accent text-white px-3 py-2 rounded-xl font-display font-semibold text-xs hover:bg-accent-dark transition-colors"
        >
          <Plus size={14} />
          Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o detalle..."
            className="w-full bg-card rounded-xl pl-8 pr-4 py-2 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none placeholder:text-text-muted shadow-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {(['todos', 'activos', 'inactivos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroActivo(f)}
              className={`px-3 py-2 rounded-xl font-body text-xs font-semibold transition-colors capitalize ${
                filtroActivo === f
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-text-secondary hover:bg-surface shadow-sm'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 bg-card border border-border rounded-2xl">
          <AlertCircle size={28} className="text-error" />
          <p className="text-sm font-body text-text-secondary">Error al cargar los productos</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-card border border-border rounded-2xl">
          <ShoppingBag size={36} className="text-text-muted" />
          <p className="text-sm font-body font-semibold text-text-primary">
            {productos.length === 0 ? 'Aún no hay productos.' : 'Sin resultados para esos filtros.'}
          </p>
          {productos.length === 0 && (
            <button
              onClick={handleNuevo}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
            >
              <Plus size={15} />
              Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {filtrados.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface/60 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border bg-surface flex items-center justify-center">
                  <ProductoThumb src={p.foto_url} alt={p.nombre} iconSize={20} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-body font-semibold ${p.activo ? 'text-text-primary' : 'text-text-muted'}`}>
                      {p.nombre}
                    </p>
                    {p.talle && (
                      <span className="text-[10px] font-body font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {p.talle}
                      </span>
                    )}
                    {!p.activo && (
                      <span className="text-[10px] font-body font-semibold bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {p.detalle && (
                    <p className="text-xs font-body text-text-muted mt-0.5 truncate">{p.detalle}</p>
                  )}
                </div>

                {/* Precio */}
                <div className="shrink-0 text-right mr-2">
                  <p className="text-sm font-display font-bold text-primary">
                    {formatCurrency(p.precio_actual)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEditar(p)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggle.mutate({ id: p.id, activo: !p.activo })}
                    disabled={toggle.isPending}
                    className={`px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-colors ${
                      p.activo
                        ? 'bg-surface border border-border text-text-secondary hover:bg-error-bg hover:text-error hover:border-error/30'
                        : 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                    }`}
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contador */}
      {!isLoading && filtrados.length > 0 && (
        <p className="text-xs font-body text-text-muted mt-3 text-right">
          {filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}
        </p>
      )}

      {formOpen && (
        <ProductoForm
          producto={productoEditando}
          onClose={() => { setFormOpen(false); setProductoEditando(null) }}
        />
      )}
    </div>
  )
}
