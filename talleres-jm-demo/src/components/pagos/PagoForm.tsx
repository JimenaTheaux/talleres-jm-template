import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Search, Plus, Minus } from 'lucide-react'
import { useAlumnos } from '@/hooks/useAlumnos'
import { useCreatePago, useUpdatePago } from '@/hooks/usePagos'
import { useAuthStore } from '@/store/authStore'
import { formatCurrency, getCurrentPeriodo } from '@/lib/utils'
import { FORMAS_PAGO, TIPOS_PAGO, ESTADOS_PAGO } from '@/lib/constants'
import type { Pago, Alumno } from '@/types/app.types'

const pagoSchema = z.object({
  periodo: z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM'),
  tipo_pago: z.enum(TIPOS_PAGO),
  estado: z.enum(ESTADOS_PAGO),
  fecha_pago: z.string().optional(),
  forma_pago: z.enum(FORMAS_PAGO).optional(),
  observaciones: z.string().optional(),
})

type PagoFormData = z.infer<typeof pagoSchema>

interface AlumnoSeleccionado {
  alumno: Alumno
  subtotal: number
}

interface PagoFormProps {
  pago?: Pago | null
  onClose: () => void
}

const INPUT_CLS =
  'w-full bg-surface rounded-xl px-3 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted'
const LABEL_CLS = 'block text-xs font-body font-medium text-text-secondary mb-1'
const SECTION_CLS = 'text-xs font-body font-medium uppercase tracking-wide text-text-muted mb-3'

export default function PagoForm({ pago, onClose }: PagoFormProps) {
  const { perfil } = useAuthStore()
  const { data: todosAlumnos = [] } = useAlumnos({ activo: true })
  const crear = useCreatePago()
  const editar = useUpdatePago()
  const isPending = crear.isPending || editar.isPending

  const [seleccionados, setSeleccionados] = useState<AlumnoSeleccionado[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [errorAlumnos, setErrorAlumnos] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const total = seleccionados.reduce((s, a) => s + a.subtotal, 0)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: { periodo: getCurrentPeriodo(), tipo_pago: 'mensual', estado: 'deuda' },
  })

  const estado = useWatch({ control, name: 'estado' })

  // Pre-poblar al editar
  useEffect(() => {
    if (pago) {
      reset({
        periodo: pago.periodo,
        tipo_pago: pago.tipo_pago as PagoFormData['tipo_pago'],
        estado: pago.estado as PagoFormData['estado'],
        fecha_pago: pago.fecha_pago ?? '',
        forma_pago: (pago.forma_pago as PagoFormData['forma_pago']) ?? undefined,
        observaciones: pago.observaciones ?? '',
      })
      if (pago.detalles) {
        setSeleccionados(
          pago.detalles
            .filter((d) => d.alumno)
            .map((d) => ({ alumno: d.alumno as Alumno, subtotal: d.subtotal }))
        )
      }
    }
  }, [pago, reset])

  const toggleAlumno = (alumno: Alumno) => {
    setErrorAlumnos(false)
    setSeleccionados((prev) => {
      const existe = prev.find((s) => s.alumno.id === alumno.id)
      if (existe) return prev.filter((s) => s.alumno.id !== alumno.id)
      return [...prev, { alumno, subtotal: 0 }]
    })
  }

  const setSubtotal = (alumnoId: string, value: string) => {
    const num = parseFloat(value) || 0
    setSeleccionados((prev) =>
      prev.map((s) => (s.alumno.id === alumnoId ? { ...s, subtotal: num } : s))
    )
  }

  const alumnosFiltrados = todosAlumnos.filter((a) => {
    const term = busqueda.toLowerCase()
    return (
      !term ||
      a.nombre.toLowerCase().includes(term) ||
      a.apellido.toLowerCase().includes(term)
    )
  })

  const onSubmit = async (data: PagoFormData) => {
    setSubmitError(null)
    if (seleccionados.length === 0) {
      setErrorAlumnos(true)
      return
    }

    const pagoData = {
      periodo: data.periodo,
      tipo_pago: data.tipo_pago,
      estado: data.estado,
      total,
      fecha_pago: estado === 'deuda' ? null : data.fecha_pago || null,
      forma_pago: estado === 'deuda' ? null : data.forma_pago || null,
      observaciones: data.observaciones || null,
      created_by: perfil?.id ?? null,
    }

    const detalles = seleccionados.map((s) => ({
      alumno_id: s.alumno.id,
      subtotal: s.subtotal,
      monto_esperado: s.subtotal,
    }))

    try {
      if (pago) {
        await editar.mutateAsync({ id: pago.id, pago: pagoData, detalles })
      } else {
        await crear.mutateAsync({ pago: pagoData, detalles })
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
            {pago ? 'Editar pago' : 'Registrar pago'}
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
          id="pago-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Período + Tipo */}
          <div>
            <p className={SECTION_CLS}>Período y tipo</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>
                  Período <span className="text-error">*</span>
                </label>
                <input
                  type="month"
                  {...register('periodo')}
                  className={INPUT_CLS}
                />
                {errors.periodo && (
                  <p className="mt-1 text-xs text-error">{errors.periodo.message}</p>
                )}
              </div>
              <div>
                <label className={LABEL_CLS}>Tipo de pago</label>
                <select {...register('tipo_pago')} className={INPUT_CLS}>
                  <option value="mensual">Mensual</option>
                  <option value="parcial">Parcial</option>
                  <option value="adelanto">Adelanto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estado + Forma + Fecha */}
          <div>
            <p className={SECTION_CLS}>Estado del pago</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL_CLS}>Estado</label>
                <select {...register('estado')} className={INPUT_CLS}>
                  <option value="deuda">Deuda</option>
                  <option value="pagado">Pagado</option>
                  <option value="parcial">Parcial</option>
                </select>
              </div>
              {estado !== 'deuda' && (
                <div>
                  <label className={LABEL_CLS}>Forma de pago</label>
                  <select {...register('forma_pago')} className={INPUT_CLS}>
                    <option value="">— elegir —</option>
                    {FORMAS_PAGO.map((f) => (
                      <option key={f} value={f} className="capitalize">
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {estado !== 'deuda' && (
              <div className="mt-3">
                <label className={LABEL_CLS}>Fecha de pago</label>
                <input type="date" {...register('fecha_pago')} className={INPUT_CLS} />
              </div>
            )}
          </div>

          {/* Alumnos */}
          <div>
            <p className={`${SECTION_CLS} ${errorAlumnos ? 'text-error' : ''}`}>
              Alumnos {errorAlumnos && '— seleccioná al menos uno'}
            </p>

            {/* Seleccionados */}
            {seleccionados.length > 0 && (
              <div className="mb-3 space-y-2">
                {seleccionados.map(({ alumno, subtotal }) => (
                  <div
                    key={alumno.id}
                    className="flex items-center gap-2 bg-accent/5 border border-accent/20 rounded-xl px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => toggleAlumno(alumno)}
                      className="p-1 rounded-full text-error hover:bg-error-bg transition-colors shrink-0"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-body font-medium text-text-primary flex-1 truncate">
                      {alumno.apellido}, {alumno.nombre}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-text-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={subtotal || ''}
                        onChange={(e) => setSubtotal(alumno.id, e.target.value)}
                        placeholder="0"
                        className="w-24 bg-white rounded-lg px-2 py-1 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Buscador */}
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar alumno..."
                className="w-full bg-surface rounded-xl pl-8 pr-4 py-2 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none placeholder:text-text-muted"
              />
            </div>

            {/* Lista */}
            <div className="max-h-44 overflow-y-auto border border-border rounded-xl divide-y divide-border">
              {alumnosFiltrados.length === 0 ? (
                <p className="text-sm font-body text-text-muted text-center py-4">
                  Sin resultados
                </p>
              ) : (
                alumnosFiltrados.map((alumno) => {
                  const estaSeleccionado = seleccionados.some((s) => s.alumno.id === alumno.id)
                  return (
                    <button
                      key={alumno.id}
                      type="button"
                      onClick={() => toggleAlumno(alumno)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                        estaSeleccionado
                          ? 'bg-accent/5'
                          : 'hover:bg-surface'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-body font-medium text-text-primary">
                          {alumno.apellido}, {alumno.nombre}
                        </p>
                        {alumno.turno && (
                          <p className="text-xs text-text-muted">{alumno.turno.nombre}</p>
                        )}
                      </div>
                      {estaSeleccionado ? (
                        <span className="text-xs font-body font-semibold text-accent">✓</span>
                      ) : (
                        <Plus size={14} className="text-text-muted" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Total */}
          {seleccionados.length > 0 && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
              <span className="text-sm font-body font-medium text-text-secondary">Total</span>
              <span className="text-lg font-display font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>
          )}

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
            form="pago-form"
            disabled={isPending}
            className="flex-1 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : pago ? (
              'Guardar cambios'
            ) : (
              'Registrar pago'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
