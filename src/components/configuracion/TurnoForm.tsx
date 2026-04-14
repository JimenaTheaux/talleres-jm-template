import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateTurno, useUpdateTurno } from '@/hooks/useTurnos'
import type { Turno } from '@/types/app.types'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  dias: z.string().min(1, 'Requerido'),
  horario: z.string().min(1, 'Requerido'),
  categoria: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

interface TurnoFormProps {
  turno?: Turno | null
  onClose: () => void
}

export default function TurnoForm({ turno, onClose }: TurnoFormProps) {
  const crear = useCreateTurno()
  const editar = useUpdateTurno()
  const isPending = crear.isPending || editar.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', dias: '', horario: '', categoria: '' },
  })

  useEffect(() => {
    if (turno) {
      reset({
        nombre: turno.nombre,
        dias: turno.dias,
        horario: turno.horario,
        categoria: turno.categoria ?? '',
      })
    }
  }, [turno, reset])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    const payload = {
      nombre: data.nombre,
      dias: data.dias,
      horario: data.horario,
      categoria: data.categoria?.trim() || null,
    }
    try {
      if (turno) {
        await editar.mutateAsync({ id: turno.id, data: payload })
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
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {turno ? 'Editar turno' : 'Nuevo turno'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form id="turno-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div>
            <label className={LABEL_CLS}>
              Nombre <span className="text-error">*</span>
            </label>
            <input
              type="text"
              {...register('nombre')}
              placeholder="Ej: Sub-10 Tarde"
              className={INPUT_CLS}
            />
            {errors.nombre && (
              <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLS}>
              Días <span className="text-error">*</span>
            </label>
            <input
              type="text"
              {...register('dias')}
              placeholder="Ej: Lunes, Miércoles y Viernes"
              className={INPUT_CLS}
            />
            {errors.dias && (
              <p className="mt-1 text-xs text-error">{errors.dias.message}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLS}>
              Horario <span className="text-error">*</span>
            </label>
            <input
              type="text"
              {...register('horario')}
              placeholder="Ej: 17:00 - 18:30"
              className={INPUT_CLS}
            />
            {errors.horario && (
              <p className="mt-1 text-xs text-error">{errors.horario.message}</p>
            )}
          </div>

          <div>
            <label className={LABEL_CLS}>Categoría (opcional)</label>
            <input
              type="text"
              {...register('categoria')}
              placeholder="Ej: Sub-8, Sub-10, Libre"
              className={INPUT_CLS}
            />
          </div>
        </form>

        {submitError && (
          <div className="px-6 pb-2">
            <p className="text-xs text-error bg-error-bg border border-error/20 rounded-xl px-3 py-2">
              {submitError}
            </p>
          </div>
        )}

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
            form="turno-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : turno ? (
              'Guardar cambios'
            ) : (
              'Crear turno'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
