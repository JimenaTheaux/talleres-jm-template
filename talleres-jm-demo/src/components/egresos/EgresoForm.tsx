import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateEgreso, useUpdateEgreso } from '@/hooks/useEgresos'
import { useAuthStore } from '@/store/authStore'
import { CATEGORIAS_EGRESO } from '@/lib/constants'
import type { Egreso } from '@/types/app.types'

const egresoSchema = z.object({
  fecha_egreso: z.string().min(1, 'Requerido'),
  categoria: z.enum(CATEGORIAS_EGRESO),
  concepto: z.string().min(1, 'Requerido'),
  monto: z.string().min(1, 'Requerido'),
})

type EgresoFormData = z.infer<typeof egresoSchema>

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

function periodoDesde(fecha: string) {
  const [y, m] = fecha.split('-')
  return `${y}-${m}`
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

interface EgresoFormProps {
  egreso?: Egreso | null
  onClose: () => void
}

export default function EgresoForm({ egreso, onClose }: EgresoFormProps) {
  const { perfil } = useAuthStore()
  const crear = useCreateEgreso()
  const editar = useUpdateEgreso()
  const isPending = crear.isPending || editar.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EgresoFormData>({
    resolver: zodResolver(egresoSchema),
    defaultValues: { fecha_egreso: hoy(), categoria: 'sueldos', monto: '' },
  })

  useEffect(() => {
    if (egreso) {
      reset({
        fecha_egreso: egreso.fecha_egreso,
        categoria: egreso.categoria,
        concepto: egreso.concepto,
        monto: String(egreso.monto),
      })
    } else {
      reset({ fecha_egreso: hoy(), categoria: 'sueldos' })
    }
  }, [egreso, reset])

  const onSubmit = async (data: EgresoFormData) => {
    setSubmitError(null)
    const monto = parseFloat(data.monto)
    if (isNaN(monto) || monto <= 0) {
      setSubmitError('El monto debe ser un número mayor a 0.')
      return
    }
    const payload = {
      fecha_egreso: data.fecha_egreso,
      categoria: data.categoria,
      concepto: data.concepto,
      monto,
      periodo: periodoDesde(data.fecha_egreso),
      created_by: perfil?.id ?? null,
    }
    try {
      if (egreso) {
        await editar.mutateAsync({ id: egreso.id, data: payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onClose()
    } catch {
      setSubmitError('Ocurrió un error al guardar. Intentá de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />
      <div className="relative w-full max-w-md bg-card h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {egreso ? 'Editar egreso' : 'Nuevo egreso'}
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
          id="egreso-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Fecha */}
          <div>
            <label className={LABEL_CLS}>
              Fecha <span className="text-error">*</span>
            </label>
            <input type="date" {...register('fecha_egreso')} className={INPUT_CLS} />
            {errors.fecha_egreso && (
              <p className="mt-1 text-xs text-error">{errors.fecha_egreso.message}</p>
            )}
            <p className="mt-1 text-xs text-text-muted">El período se calcula automáticamente</p>
          </div>

          {/* Categoría */}
          <div>
            <label className={LABEL_CLS}>
              Categoría <span className="text-error">*</span>
            </label>
            <select {...register('categoria')} className={INPUT_CLS}>
              {CATEGORIAS_EGRESO.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Concepto */}
          <div>
            <label className={LABEL_CLS}>
              Concepto <span className="text-error">*</span>
            </label>
            <input
              {...register('concepto')}
              placeholder="Ej: Sueldo Juan García — Abril"
              className={INPUT_CLS}
            />
            {errors.concepto && (
              <p className="mt-1 text-xs text-error">{errors.concepto.message}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className={LABEL_CLS}>
              Monto <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-body">
                $
              </span>
              <input
                type="number"
                min="0"
                step="1"
                {...register('monto')}
                placeholder="0"
                className={`${INPUT_CLS} pl-7`}
              />
            </div>
            {errors.monto && (
              <p className="mt-1 text-xs text-error">{errors.monto.message}</p>
            )}
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
            form="egreso-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : egreso ? (
              'Guardar cambios'
            ) : (
              'Registrar egreso'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
