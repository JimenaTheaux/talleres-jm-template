import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useTurnos } from '@/hooks/useTurnos'
import { useCreateAlumno, useUpdateAlumno } from '@/hooks/useAlumnos'
import type { Alumno } from '@/types/app.types'

const alumnoSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  fecha_nac: z.string().optional(),
  localidad: z.string().optional(),
  domicilio: z.string().optional(),
  telefono: z.string().optional(),
  nombre_tutor: z.string().optional(),
  telefono_tutor: z.string().optional(),
  turno_id: z.string().optional(),
})

type AlumnoFormData = z.infer<typeof alumnoSchema>

// Convierte string vacío a null para Supabase
const toNull = (v: string | undefined) => (v?.trim() ? v.trim() : null)

interface AlumnoFormProps {
  alumno?: Alumno | null
  onClose: () => void
}

export default function AlumnoForm({ alumno, onClose }: AlumnoFormProps) {
  const { data: turnos = [] } = useTurnos()
  const crear = useCreateAlumno()
  const editar = useUpdateAlumno()
  const isPending = crear.isPending || editar.isPending
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlumnoFormData>({
    resolver: zodResolver(alumnoSchema),
  })

  useEffect(() => {
    if (alumno) {
      reset({
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        fecha_nac: alumno.fecha_nac ?? '',
        localidad: alumno.localidad ?? '',
        domicilio: alumno.domicilio ?? '',
        telefono: alumno.telefono ?? '',
        nombre_tutor: alumno.nombre_tutor ?? '',
        telefono_tutor: alumno.telefono_tutor ?? '',
        turno_id: alumno.turno_id ?? '',
      })
    } else {
      reset()
    }
  }, [alumno, reset])

  const onSubmit = async (data: AlumnoFormData) => {
    setSubmitError(null)
    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      fecha_nac: toNull(data.fecha_nac),
      localidad: toNull(data.localidad),
      domicilio: toNull(data.domicilio),
      telefono: toNull(data.telefono),
      nombre_tutor: toNull(data.nombre_tutor),
      telefono_tutor: toNull(data.telefono_tutor),
      turno_id: toNull(data.turno_id),
    }
    try {
      if (alumno) {
        await editar.mutateAsync({ id: alumno.id, data: payload })
      } else {
        await crear.mutateAsync({ ...payload, activo: true })
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
            {alumno ? 'Editar alumno' : 'Nuevo alumno'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          id="alumno-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Datos personales */}
          <div>
            <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted mb-3">
              Datos personales
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Nombre <span className="text-error">*</span>
                </label>
                <input
                  {...register('nombre')}
                  placeholder="Juan"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Apellido <span className="text-error">*</span>
                </label>
                <input
                  {...register('apellido')}
                  placeholder="García"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
                {errors.apellido && (
                  <p className="mt-1 text-xs text-error">{errors.apellido.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Fecha de nac.
                </label>
                <input
                  type="date"
                  {...register('fecha_nac')}
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Turno
                </label>
                <select
                  {...register('turno_id')}
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all"
                >
                  <option value="">Sin turno</option>
                  {turnos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted mb-3">
              Contacto
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Teléfono
                </label>
                <input
                  {...register('telefono')}
                  placeholder="2615000000"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Localidad
                </label>
                <input
                  {...register('localidad')}
                  placeholder="Mendoza"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Domicilio
                </label>
                <input
                  {...register('domicilio')}
                  placeholder="Av. San Martín 1234"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Tutor */}
          <div>
            <p className="text-xs font-body font-medium uppercase tracking-wide text-text-muted mb-3">
              Tutor / Responsable
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Nombre del tutor
                </label>
                <input
                  {...register('nombre_tutor')}
                  placeholder="María García"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
              </div>
              <div>
                <label className="block text-xs font-body font-medium text-text-secondary mb-1">
                  Teléfono del tutor
                </label>
                <input
                  {...register('telefono_tutor')}
                  placeholder="2615000000"
                  className="w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
              </div>
            </div>
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
            form="alumno-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : alumno ? (
              'Guardar cambios'
            ) : (
              'Crear alumno'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
