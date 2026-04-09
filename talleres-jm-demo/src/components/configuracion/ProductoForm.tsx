import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Upload, ShoppingBag } from 'lucide-react'
import { useCreateProducto, useUpdateProducto } from '@/hooks/useProductos'
import { formatCurrency } from '@/lib/utils'
import type { Producto } from '@/types/app.types'

const NOMBRES = ['Remera', 'Short', 'Medias', 'Conjunto'] as const

const MAX_SIZE = 2 * 1024 * 1024 // 2MB

const schema = z.object({
  nombre: z.enum(NOMBRES, { message: 'Elegí un nombre' }),
  detalle: z.string().optional(),
  talle: z.string().optional(),
  precio_actual: z.string().min(1, 'Requerido'),
  activo: z.boolean(),
})

type FormData = z.infer<typeof schema>

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

interface ProductoFormProps {
  producto?: Producto | null
  onClose: () => void
}

export default function ProductoForm({ producto, onClose }: ProductoFormProps) {
  const crear = useCreateProducto()
  const editar = useUpdateProducto()
  const isPending = crear.isPending || editar.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(producto?.foto_url ?? null)
  const [fotoError, setFotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { activo: true },
  })

  const precioWatch = watch('precio_actual')

  useEffect(() => {
    if (producto) {
      reset({
        nombre: producto.nombre as (typeof NOMBRES)[number],
        detalle: producto.detalle ?? '',
        talle: producto.talle ?? '',
        precio_actual: String(producto.precio_actual),
        activo: producto.activo,
      })
      setFotoPreview(producto.foto_url ?? null)
    }
  }, [producto, reset])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotoError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setFotoError('Solo se aceptan JPG, PNG o WEBP.')
      return
    }
    if (file.size > MAX_SIZE) {
      setFotoError('El archivo supera los 2 MB.')
      return
    }
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    const precio = parseFloat(data.precio_actual)
    if (isNaN(precio) || precio < 0) {
      setSubmitError('El precio debe ser un número válido.')
      return
    }

    const payload = {
      nombre: data.nombre,
      detalle: data.detalle?.trim() || null,
      talle: data.talle?.trim() || null,
      precio_actual: precio,
      activo: data.activo,
    }

    try {
      if (producto) {
        await editar.mutateAsync({
          id: producto.id,
          producto: payload,
          foto: fotoFile,
          oldFotoUrl: producto.foto_url,
        })
      } else {
        await crear.mutateAsync({ producto: { ...payload, foto_url: null }, foto: fotoFile })
      }
      onClose()
    } catch (err: any) {
      setSubmitError(err?.message ?? 'Ocurrió un error al guardar. Intentá de nuevo.')
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
            {producto ? 'Editar producto' : 'Nuevo producto'}
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
          id="producto-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Foto */}
          <div>
            <label className={LABEL_CLS}>Foto del producto</label>
            {fotoPreview ? (
              <div className="relative mb-2">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-xl border border-border"
                />
                <button
                  type="button"
                  onClick={() => { setFotoPreview(null); setFotoFile(null); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-6 cursor-pointer hover:border-accent/50 hover:bg-surface transition-all"
              >
                <ShoppingBag size={28} className="text-text-muted" />
                <p className="text-xs font-body text-text-muted">Hacé click para subir una foto</p>
                <p className="text-[11px] font-body text-text-muted/70">JPG, PNG o WEBP · Máx. 2 MB</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFoto}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-2 flex items-center gap-2 text-xs font-body font-semibold text-accent hover:text-accent-dark transition-colors"
            >
              <Upload size={13} />
              {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
            </button>
            {fotoError && <p className="mt-1 text-xs text-error">{fotoError}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className={LABEL_CLS}>
              Nombre <span className="text-error">*</span>
            </label>
            <select {...register('nombre')} className={INPUT_CLS}>
              <option value="">— elegir —</option>
              {NOMBRES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {errors.nombre && <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>}
          </div>

          {/* Detalle */}
          <div>
            <label className={LABEL_CLS}>Detalle</label>
            <input
              type="text"
              {...register('detalle')}
              placeholder="Ej: Remera oficial temporada 2025"
              className={INPUT_CLS}
            />
          </div>

          {/* Talle */}
          <div>
            <label className={LABEL_CLS}>Talle</label>
            <input
              type="text"
              {...register('talle')}
              placeholder="Ej: M, L, XL, Única"
              className={INPUT_CLS}
            />
          </div>

          {/* Precio */}
          <div>
            <label className={LABEL_CLS}>
              Precio actual <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
              <input
                type="number"
                min="0"
                step="1"
                {...register('precio_actual')}
                placeholder="0"
                className={`${INPUT_CLS} pl-7`}
              />
            </div>
            {errors.precio_actual && (
              <p className="mt-1 text-xs text-error">{errors.precio_actual.message}</p>
            )}
            {producto && precioWatch && parseFloat(precioWatch) !== producto.precio_actual && (
              <p className="mt-1 text-[11px] text-text-muted">
                Precio anterior: {formatCurrency(producto.precio_actual)} — las ventas anteriores no se verán afectadas
              </p>
            )}
          </div>

          {/* Activo */}
          <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-body font-semibold text-text-primary">Producto activo</p>
              <p className="text-xs font-body text-text-muted">Solo los activos aparecen en ventas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('activo')} className="sr-only peer" />
              <div className="w-10 h-6 bg-border rounded-full peer peer-checked:bg-accent transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
            </label>
          </div>
        </form>

        {/* Error submit */}
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
            form="producto-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : producto ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}
