import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateAsistencia, useUpdateAsistencia, useProfesores } from '@/hooks/useAsistencia'
import type { AsistenciaProfe, Perfil } from '@/types/app.types'

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/

const schema = z.object({
  profe_id: z.string().min(1, 'Requerido'),
  fecha: z.string().min(1, 'Requerido'),
  hora_entrada: z.string().regex(HORA_REGEX, 'Formato HH:MM (ej: 08:30)'),
  hora_salida: z.string().regex(HORA_REGEX, 'Formato HH:MM (ej: 17:00)'),
  horas_trabajadas: z.string().optional(),
  observaciones: z.string().optional(),
})

type FormData = z.infer<typeof schema>

function calcHoras(entrada: string, salida: string): string {
  if (!entrada || !salida) return ''
  const [eh, em] = entrada.split(':').map(Number)
  const [sh, sm] = salida.split(':').map(Number)
  const mins = sh * 60 + sm - (eh * 60 + em)
  if (mins <= 0) return ''
  return String(Math.round((mins / 60) * 100) / 100)
}

function hoy() {
  return new Date().toISOString().split('T')[0]
}

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

interface AsistenciaFormProps {
  registro?: AsistenciaProfe | null
  profeId?: string       // fijo cuando se abre desde detalle de un profe
  profeActual?: Perfil   // profe logueado (para vista profesor)
  onClose: () => void
}

export default function AsistenciaForm({
  registro,
  profeId,
  profeActual,
  onClose,
}: AsistenciaFormProps) {
  const { data: profesores = [] } = useProfesores()
  const crear = useCreateAsistencia()
  const editar = useUpdateAsistencia()
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
      profe_id: profeId ?? profeActual?.id ?? '',
      fecha: hoy(),
    },
  })

  const horaEntrada = useWatch({ control, name: 'hora_entrada' })
  const horaSalida = useWatch({ control, name: 'hora_salida' })

  // Auto-calcular horas cuando cambian entrada/salida
  useEffect(() => {
    const calc = calcHoras(horaEntrada ?? '', horaSalida ?? '')
    if (calc) setValue('horas_trabajadas', calc)
  }, [horaEntrada, horaSalida, setValue])

  // Pre-poblar al editar
  useEffect(() => {
    if (registro) {
      reset({
        profe_id: registro.profe_id,
        fecha: registro.fecha,
        hora_entrada: registro.hora_entrada,
        hora_salida: registro.hora_salida,
        horas_trabajadas: registro.horas_trabajadas != null ? String(registro.horas_trabajadas) : '',
        observaciones: registro.observaciones ?? '',
      })
    }
  }, [registro, reset])

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)

    // Validar que salida > entrada
    const calc = calcHoras(data.hora_entrada, data.hora_salida)
    if (!calc) {
      setSubmitError('La hora de salida debe ser posterior a la hora de entrada.')
      return
    }

    const payload = {
      profe_id: data.profe_id,
      fecha: data.fecha,
      hora_entrada: data.hora_entrada,
      hora_salida: data.hora_salida,
      horas_trabajadas: data.horas_trabajadas ? parseFloat(data.horas_trabajadas) : null,
      observaciones: data.observaciones?.trim() || null,
    }
    try {
      if (registro) {
        await editar.mutateAsync({ id: registro.id, data: payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onClose()
    } catch {
      setSubmitError('Ocurrió un error al guardar. Intentá de nuevo.')
    }
  }

  const profeFixed = !!(profeId || profeActual)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {registro ? 'Editar registro' : 'Registrar asistencia'}
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
          id="asistencia-form"
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-5 space-y-4"
        >
          {/* Profesor — solo si no está fijo */}
          {!profeFixed && (
            <div>
              <label className={LABEL_CLS}>
                Profesor <span className="text-error">*</span>
              </label>
              <select {...register('profe_id')} className={INPUT_CLS}>
                <option value="">— elegir —</option>
                {profesores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.apellido}, {p.nombre}
                  </option>
                ))}
              </select>
              {errors.profe_id && (
                <p className="mt-1 text-xs text-error">{errors.profe_id.message}</p>
              )}
            </div>
          )}

          {/* Fecha */}
          <div>
            <label className={LABEL_CLS}>
              Fecha <span className="text-error">*</span>
            </label>
            <input type="date" {...register('fecha')} className={INPUT_CLS} />
            {errors.fecha && (
              <p className="mt-1 text-xs text-error">{errors.fecha.message}</p>
            )}
          </div>

          {/* Horario — texto libre, siempre 24h */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>
                Entrada <span className="text-error">*</span>
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="08:00"
                {...register('hora_entrada')}
                className={INPUT_CLS}
              />
              {errors.hora_entrada && (
                <p className="mt-1 text-xs text-error">{errors.hora_entrada.message}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLS}>
                Salida <span className="text-error">*</span>
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="17:00"
                {...register('hora_salida')}
                className={INPUT_CLS}
              />
              {errors.hora_salida && (
                <p className="mt-1 text-xs text-error">{errors.hora_salida.message}</p>
              )}
            </div>
          </div>

          {/* Horas trabajadas */}
          <div>
            <label className={LABEL_CLS}>Horas trabajadas</label>
            <input
              type="number"
              step="0.25"
              min="0"
              {...register('horas_trabajadas')}
              placeholder="Auto-calculado"
              className={INPUT_CLS}
            />
            <p className="mt-1 text-xs text-text-muted">Se calcula automáticamente. Podés ajustarlo.</p>
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
          <div className="px-6 pt-0 pb-2">
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
            form="asistencia-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : registro ? (
              'Guardar cambios'
            ) : (
              'Registrar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
