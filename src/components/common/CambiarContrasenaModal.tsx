import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const schema = z
  .object({
    actual: z.string().min(1, 'Requerido'),
    nueva: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmar: z.string().min(1, 'Requerido'),
  })
  .refine((d) => d.nueva === d.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type FormData = z.infer<typeof schema>

const INPUT =
  'w-full bg-surface rounded-xl px-3 py-2.5 pr-10 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL =
  'block text-xs font-body font-medium text-text-secondary mb-1'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CambiarContrasenaModal({ open, onClose }: Props) {
  const [showActual, setShowActual]     = useState(false)
  const [showNueva, setShowNueva]       = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [submitError, setSubmitError]   = useState<string | null>(null)
  const [success, setSuccess]           = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const handleClose = () => {
    reset()
    setSubmitError(null)
    setSuccess(false)
    onClose()
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError(null)
    try {
      const { error } = await supabase.auth.updateUser({ password: data.nueva })
      if (error) {
        setSubmitError('No se pudo actualizar la contraseña. Intentá de nuevo.')
        return
      }
      setSuccess(true)
      // Cerrar automáticamente después de 1.8s para que el usuario vea el éxito
      setTimeout(handleClose, 1800)
    } catch {
      setSubmitError('Error de conexión. Verificá tu internet e intentá de nuevo.')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isSubmitting ? handleClose : undefined}
      />

      <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            <h2 className="text-lg font-display font-bold text-text-primary">
              Cambiar contraseña
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10">
            <CheckCircle2 size={48} className="text-success" />
            <p className="font-display font-semibold text-text-primary text-base">
              ¡Contraseña actualizada!
            </p>
          </div>
        ) : (
          <form
            id="cambiar-pass-form"
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 py-5 space-y-4"
          >
            {/* Contraseña actual */}
            <div>
              <label className={LABEL}>Contraseña actual</label>
              <div className="relative">
                <input
                  type={showActual ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('actual')}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => setShowActual((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showActual ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.actual && (
                <p className="mt-1 text-xs text-error">{errors.actual.message}</p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Nueva contraseña */}
            <div>
              <label className={LABEL}>Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNueva ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  {...register('nueva')}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => setShowNueva((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showNueva ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.nueva && (
                <p className="mt-1 text-xs text-error">{errors.nueva.message}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className={LABEL}>Confirmar nueva contraseña</label>
              <div className="relative">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  placeholder="Repetí la nueva contraseña"
                  autoComplete="new-password"
                  {...register('confirmar')}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmar && (
                <p className="mt-1 text-xs text-error">{errors.confirmar.message}</p>
              )}
            </div>

            {submitError && (
              <p className="text-xs text-error bg-error-bg border border-error/20 rounded-xl px-3 py-2">
                {submitError}
              </p>
            )}
          </form>
        )}

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 bg-card text-text-primary border border-border px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="cambiar-pass-form"
              disabled={isSubmitting}
              className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                'Guardar contraseña'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
