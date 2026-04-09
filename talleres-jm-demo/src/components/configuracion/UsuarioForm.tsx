import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { useCreateUsuario, useUpdatePerfil } from '@/hooks/usePerfilesAdmin'
import type { Perfil } from '@/types/app.types'

const baseSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  rol: z.enum(['admin', 'profesor']),
  telefono: z.string().optional(),
  // campos opcionales para modo edición (ignorados en create)
  email: z.string().optional(),
  password: z.string().optional(),
})

const createSchema = baseSchema.extend({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type CreateData = z.infer<typeof createSchema>

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

interface UsuarioFormProps {
  perfil?: Perfil | null
  onClose: () => void
}

export default function UsuarioForm({ perfil, onClose }: UsuarioFormProps) {
  const crear = useCreateUsuario()
  const editar = useUpdatePerfil()
  const isPending = crear.isPending || editar.isPending
  const isEdit = !!perfil
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEdit ? baseSchema : createSchema) as any,
    defaultValues: { nombre: '', apellido: '', rol: 'profesor', telefono: '', email: '', password: '' },
  })

  useEffect(() => {
    if (perfil) {
      reset({
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        rol: perfil.rol === 'admin' ? 'admin' : 'profesor',
        telefono: perfil.telefono ?? '',
      })
    }
  }, [perfil, reset])

  const onSubmit = async (data: CreateData) => {
    setSubmitError(null)
    try {
      if (isEdit) {
        await editar.mutateAsync({
          id: perfil!.id,
          data: {
            nombre: data.nombre,
            apellido: data.apellido,
            rol: data.rol,
            telefono: data.telefono?.trim() || null,
          },
        })
      } else {
        await crear.mutateAsync({
          email: data.email!,
          password: data.password!,
          nombre: data.nombre,
          apellido: data.apellido,
          rol: data.rol,
          telefono: data.telefono?.trim() || null,
        })
      }
      onClose()
    } catch (err: any) {
      const msg = err?.message ?? ''
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setSubmitError('Ya existe un usuario con ese email.')
      } else {
        setSubmitError('Ocurrió un error al guardar. Intentá de nuevo.')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />
      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-display font-bold text-text-primary">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="usuario-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {!isEdit && (
            <>
              <div>
                <label className={LABEL_CLS}>
                  Email <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="usuario@ejemplo.com"
                  className={INPUT_CLS}
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className={LABEL_CLS}>
                  Contraseña <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Mínimo 6 caracteres"
                  className={INPUT_CLS}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-error">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>
                Nombre <span className="text-error">*</span>
              </label>
              <input
                type="text"
                {...register('nombre')}
                placeholder="Juan"
                className={INPUT_CLS}
              />
              {errors.nombre && (
                <p className="mt-1 text-xs text-error">{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label className={LABEL_CLS}>
                Apellido <span className="text-error">*</span>
              </label>
              <input
                type="text"
                {...register('apellido')}
                placeholder="García"
                className={INPUT_CLS}
              />
              {errors.apellido && (
                <p className="mt-1 text-xs text-error">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLS}>Rol</label>
              <select {...register('rol')} className={INPUT_CLS}>
                <option value="profesor">Profesor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLS}>Teléfono</label>
              <input
                type="text"
                {...register('telefono')}
                placeholder="Opcional"
                className={INPUT_CLS}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-2.5">
              <p className="text-[11px] font-body text-text-secondary leading-relaxed">
                Se enviará un email de confirmación al nuevo usuario. Si la confirmación está desactivada en Supabase, se cerrará la sesión actual.
              </p>
            </div>
          )}
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
            form="usuario-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isEdit ? (
              'Guardar cambios'
            ) : (
              'Crear usuario'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
