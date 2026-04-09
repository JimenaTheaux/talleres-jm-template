import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, ChevronDown, ShoppingBag } from 'lucide-react'
import ProductoThumb from '@/components/common/ProductoThumb'
import { useCreateVenta, useUpdateVenta } from '@/hooks/useVentas'
import { useProductosActivos } from '@/hooks/useProductos'
import { useAlumnos } from '@/hooks/useAlumnos'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency } from '@/lib/utils'
import { ESTADOS_VENTA } from '@/lib/constants'
import type { Venta, Producto } from '@/types/app.types'

const schema = z.object({
  producto_id: z.string().min(1, 'Elegí un producto'),
  alumno_id: z.string().optional(),
  precio_venta: z.string().min(1, 'Requerido'),
  cantidad: z.string().min(1, 'Requerido'),
  fecha_venta: z.string().min(1, 'Requerido'),
  estado: z.enum(ESTADOS_VENTA),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function hoy() {
  return new Date().toISOString().split('T')[0]
}

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

interface VentaFormProps {
  venta?: Venta | null
  onClose: () => void
}

// Selector custom de producto con thumbnail
function ProductoSelector({
  productos,
  value,
  onChange,
  error,
}: {
  productos: Producto[]
  value: string
  onChange: (id: string) => void
  error?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = productos.find((p) => p.id === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5 border text-left transition-all ${
          open ? 'border-accent ring-2 ring-accent/30' : 'border-border'
        } ${error ? 'border-error' : ''}`}
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-border bg-card flex items-center justify-center">
          <ProductoThumb src={selected?.foto_url} alt={selected?.nombre} />
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="text-sm font-body font-semibold text-text-primary truncate">
                {selected.nombre}{selected.talle ? ` · ${selected.talle}` : ''}
              </p>
              <p className="text-xs font-body text-text-muted">{formatCurrency(selected.precio_actual)}</p>
            </>
          ) : (
            <p className="text-sm font-body text-text-muted">— elegir producto —</p>
          )}
        </div>
        <ChevronDown size={16} className={`text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
            {productos.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm font-body text-text-muted">
                <ShoppingBag size={16} />
                Sin productos activos
              </div>
            ) : (
              productos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface transition-colors ${
                    p.id === value ? 'bg-accent/5' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border bg-surface flex items-center justify-center">
                    <ProductoThumb src={p.foto_url} alt={p.nombre} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-semibold text-text-primary truncate">
                      {p.nombre}{p.talle ? ` · ${p.talle}` : ''}
                    </p>
                    {p.detalle && (
                      <p className="text-xs font-body text-text-muted truncate">{p.detalle}</p>
                    )}
                  </div>
                  <span className="text-sm font-display font-bold text-primary shrink-0">
                    {formatCurrency(p.precio_actual)}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function VentaForm({ venta, onClose }: VentaFormProps) {
  const { perfil } = useAuthStore()
  const { data: productos = [] } = useProductosActivos()
  const { data: alumnos = [] } = useAlumnos({ activo: true })
  const crear = useCreateVenta()
  const editar = useUpdateVenta()
  const isPending = crear.isPending || editar.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha_venta: hoy(),
      cantidad: '1',
      estado: 'pagado',
    },
  })

  const productoId  = useWatch({ control, name: 'producto_id' })
  const precioVenta = useWatch({ control, name: 'precio_venta' })
  const cantidad    = useWatch({ control, name: 'cantidad' })

  const total = (parseFloat(precioVenta) || 0) * (parseInt(cantidad) || 0)

  // Al cambiar producto → snapshot del precio actual
  useEffect(() => {
    if (!venta) {
      const prod = productos.find((p) => p.id === productoId)
      if (prod) setValue('precio_venta', String(prod.precio_actual))
    }
  }, [productoId, productos, setValue, venta])

  // Pre-poblar al editar
  useEffect(() => {
    if (venta) {
      reset({
        producto_id: venta.producto_id,
        alumno_id: venta.alumno_id ?? '',
        precio_venta: String(venta.precio_venta),
        cantidad: String(venta.cantidad),
        fecha_venta: venta.fecha_venta,
        estado: venta.estado as FormData['estado'],
        observaciones: venta.observaciones ?? '',
      })
    }
  }, [venta, reset])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    const precio = parseFloat(data.precio_venta)
    const cant = parseInt(data.cantidad)
    if (isNaN(precio) || precio <= 0 || isNaN(cant) || cant <= 0) return

    const payload = {
      producto_id: data.producto_id,
      alumno_id: data.alumno_id || null,
      precio_venta: precio,
      cantidad: cant,
      total: precio * cant,
      fecha_venta: data.fecha_venta,
      estado: data.estado,
      observaciones: data.observaciones?.trim() || null,
      created_by: perfil?.id ?? null,
    }

    try {
      if (venta) {
        await editar.mutateAsync({ id: venta.id, data: payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onClose()
    } catch {
      setSubmitError('Ocurrió un error al guardar. Intentá de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {venta ? 'Editar venta' : 'Registrar venta'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          id="venta-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Producto — selector custom con foto */}
          <div>
            <label className={LABEL_CLS}>
              Producto <span className="text-error">*</span>
            </label>
            <ProductoSelector
              productos={productos}
              value={productoId ?? ''}
              onChange={(id) => setValue('producto_id', id, { shouldValidate: true })}
              error={errors.producto_id?.message}
            />
            {/* campo hidden para react-hook-form */}
            <input type="hidden" {...register('producto_id')} />
            {errors.producto_id && (
              <p className="mt-1 text-xs text-error">{errors.producto_id.message}</p>
            )}
          </div>

          {/* Alumno (opcional) */}
          <div>
            <label className={LABEL_CLS}>Alumno (opcional)</label>
            <select {...register('alumno_id')} className={INPUT_CLS}>
              <option value="">Venta directa / sin alumno</option>
              {alumnos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.apellido}, {a.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Precio + Cantidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>
                Precio unitario <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register('precio_venta')}
                  placeholder="0"
                  className={`${INPUT_CLS} pl-7`}
                />
              </div>
              {errors.precio_venta && (
                <p className="mt-1 text-xs text-error">{errors.precio_venta.message}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLS}>
                Cantidad <span className="text-error">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                {...register('cantidad')}
                className={INPUT_CLS}
              />
              {errors.cantidad && (
                <p className="mt-1 text-xs text-error">{errors.cantidad.message}</p>
              )}
            </div>
          </div>

          {/* Total calculado */}
          {total > 0 && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
              <span className="text-sm font-body font-medium text-text-secondary">Total</span>
              <span className="text-lg font-display font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          )}

          {/* Fecha + Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>
                Fecha <span className="text-error">*</span>
              </label>
              <input type="date" {...register('fecha_venta')} className={INPUT_CLS} />
              {errors.fecha_venta && (
                <p className="mt-1 text-xs text-error">{errors.fecha_venta.message}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLS}>Estado</label>
              <select {...register('estado')} className={INPUT_CLS}>
                <option value="pagado">Pagado</option>
                <option value="deuda">Deuda</option>
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className={LABEL_CLS}>Observaciones</label>
            <textarea
              {...register('observaciones')}
              rows={2}
              placeholder="Notas opcionales..."
              className={`${INPUT_CLS} resize-none`}
            />
          </div>
        </form>

        {/* Error de submit */}
        {submitError && (
          <div className="px-6 pb-2">
            <p className="text-xs text-error bg-error-bg border border-error/20 rounded-xl px-3 py-2">
              {submitError}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 bg-card text-text-primary border border-border px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="venta-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : venta ? (
              'Guardar cambios'
            ) : (
              'Registrar venta'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
