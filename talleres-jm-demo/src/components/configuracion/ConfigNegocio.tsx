import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Building2 } from 'lucide-react'
import { useConfig, useUpdateConfig } from '@/hooks/useConfig'

const schema = z.object({
  nombre_negocio: z.string().min(1, 'Requerido'),
  telefono_whatsapp: z.string().optional(),
  mensaje_deuda: z.string().min(1, 'Requerido'),
})

type FormData = z.infer<typeof schema>

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'

export default function ConfigNegocio() {
  const { data: config, isLoading } = useConfig()
  const actualizar = useUpdateConfig()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre_negocio: '', telefono_whatsapp: '', mensaje_deuda: '' },
  })

  useEffect(() => {
    if (config) {
      reset({
        nombre_negocio: config.nombre_negocio,
        telefono_whatsapp: config.telefono_whatsapp ?? '',
        mensaje_deuda: config.mensaje_deuda,
      })
    }
  }, [config, reset])

  const onSubmit = async (data: FormData) => {
    await actualizar.mutateAsync({
      nombre_negocio: data.nombre_negocio,
      telefono_whatsapp: data.telefono_whatsapp?.trim() || null,
      mensaje_deuda: data.mensaje_deuda,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div className="flex items-center gap-2 mb-2">
        <Building2 size={16} className="text-primary" />
        <h2 className="text-sm font-display font-bold text-text-primary">Datos del negocio</h2>
      </div>

      <div>
        <label className={LABEL_CLS}>
          Nombre del negocio <span className="text-error">*</span>
        </label>
        <input
          type="text"
          {...register('nombre_negocio')}
          placeholder="Ej: Talleres JM"
          className={INPUT_CLS}
        />
        {errors.nombre_negocio && (
          <p className="mt-1 text-xs text-error">{errors.nombre_negocio.message}</p>
        )}
      </div>

      <div>
        <label className={LABEL_CLS}>Teléfono WhatsApp</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">+</span>
          <input
            type="text"
            {...register('telefono_whatsapp')}
            placeholder="5491122334455"
            className={`${INPUT_CLS} pl-6`}
          />
        </div>
        <p className="mt-1 text-[11px] text-text-muted">
          Código de país + número sin espacios ni guiones
        </p>
      </div>

      <div>
        <label className={LABEL_CLS}>
          Mensaje de deuda (WhatsApp) <span className="text-error">*</span>
        </label>
        <textarea
          {...register('mensaje_deuda')}
          rows={4}
          placeholder="Hola {nombre}! Te recordamos que tenés una deuda pendiente de {monto} en {periodo}."
          className={`${INPUT_CLS} resize-none`}
        />
        <p className="mt-1 text-[11px] text-text-muted">
          Variables disponibles: {'{nombre}'}, {'{monto}'}, {'{periodo}'}
        </p>
        {errors.mensaje_deuda && (
          <p className="mt-1 text-xs text-error">{errors.mensaje_deuda.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isDirty || actualizar.isPending}
        className="flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-50"
      >
        {actualizar.isPending ? (
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Guardar cambios
      </button>

      {actualizar.isSuccess && (
        <p className="text-xs text-success font-body">Configuración guardada correctamente.</p>
      )}
    </form>
  )
}
