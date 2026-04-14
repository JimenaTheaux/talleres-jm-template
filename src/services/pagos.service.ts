import { supabase } from '@/lib/supabase'
import type { Pago } from '@/types/app.types'

export interface PagosFilters {
  periodo?: string
  estado?: string
}

export interface DetallePagoInsert {
  alumno_id: string
  subtotal: number
  monto_esperado: number
}

export interface PagoInsert {
  periodo: string
  fecha_pago?: string | null
  forma_pago?: string | null
  tipo_pago: string
  estado: string
  total: number
  observaciones?: string | null
  created_by?: string | null
}

const DETALLE_QUERY = `
  id, alumno_id, subtotal, monto_esperado,
  alumno:alumnos(id, nombre, apellido, nombre_tutor, telefono_tutor, turno_id)
`

// Query extendida con turno (para listado general de pagos donde se muestra el turno)
const DETALLE_QUERY_CON_TURNO = `
  id, alumno_id, subtotal, monto_esperado,
  alumno:alumnos(id, nombre, apellido, nombre_tutor, telefono_tutor, turno_id,
    turno:turnos(id, nombre, horario, dias, categoria, activo, created_at))
`

const PAGO_QUERY = `*, detalles:detalle_pago(${DETALLE_QUERY_CON_TURNO})`
const PAGO_QUERY_DEUDORES = `*, detalles:detalle_pago(${DETALLE_QUERY})`

export async function getPagos(filters?: PagosFilters): Promise<Pago[]> {
  let q = supabase
    .from('pagos')
    .select(PAGO_QUERY)
    .order('created_at', { ascending: false })

  if (filters?.periodo) q = q.eq('periodo', filters.periodo)
  if (filters?.estado && filters.estado !== 'todos') q = q.eq('estado', filters.estado)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Pago[]
}

export async function createPago(
  pago: PagoInsert,
  detalles: DetallePagoInsert[]
): Promise<void> {
  const { data: pagoData, error: pagoError } = await supabase
    .from('pagos')
    .insert(pago)
    .select('id')
    .single()

  if (pagoError) throw pagoError

  if (detalles.length > 0) {
    const { error: detError } = await supabase
      .from('detalle_pago')
      .insert(detalles.map((d) => ({ ...d, pago_id: pagoData.id })))

    if (detError) {
      await supabase.from('pagos').delete().eq('id', pagoData.id)
      throw detError
    }
  }
}

export async function updatePago(
  id: string,
  pago: Partial<PagoInsert>,
  detalles: DetallePagoInsert[]
): Promise<void> {
  const { error: pagoError } = await supabase.from('pagos').update(pago).eq('id', id)
  if (pagoError) throw pagoError

  await supabase.from('detalle_pago').delete().eq('pago_id', id)

  if (detalles.length > 0) {
    const { error: detError } = await supabase
      .from('detalle_pago')
      .insert(detalles.map((d) => ({ ...d, pago_id: id })))
    if (detError) throw detError
  }
}

export async function deletePago(id: string): Promise<void> {
  const { error } = await supabase.from('pagos').delete().eq('id', id)
  if (error) throw error
}

export async function generarDeudasMes(
  periodo: string,
  createdBy?: string | null
): Promise<number> {
  const { data: alumnos, error: eA } = await supabase
    .from('alumnos')
    .select('id')
    .eq('activo', true)
  if (eA) throw eA
  if (!alumnos?.length) return 0

  const { data: existentes, error: eE } = await supabase
    .from('detalle_pago')
    .select('alumno_id, pagos!inner(periodo)')
    .eq('pagos.periodo', periodo)
  if (eE) throw eE

  const conPago = new Set((existentes ?? []).map((d: { alumno_id: string }) => d.alumno_id))
  const sinPago = alumnos.filter((a: { id: string }) => !conPago.has(a.id))

  for (const alumno of sinPago) {
    const { data: pago, error: eP } = await supabase
      .from('pagos')
      .insert({
        periodo,
        estado: 'deuda',
        tipo_pago: 'mensual',
        total: 0,
        ...(createdBy ? { created_by: createdBy } : {}),
      })
      .select('id')
      .single()
    if (eP) throw eP

    const { error: eD } = await supabase
      .from('detalle_pago')
      .insert({ pago_id: pago.id, alumno_id: alumno.id, subtotal: 0, monto_esperado: 0 })
    if (eD) throw eD
  }

  return sinPago.length
}

export async function getDeudores(periodo: string): Promise<Pago[]> {
  const { data, error } = await supabase
    .from('pagos')
    .select(PAGO_QUERY_DEUDORES)
    .eq('periodo', periodo)
    .in('estado', ['deuda', 'parcial'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Pago[]
}
