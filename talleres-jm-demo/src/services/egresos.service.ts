import { supabase } from '@/lib/supabase'
import type { Egreso } from '@/types/app.types'

export interface EgresosFilters {
  periodo?: string
  categoria?: string
}

export interface EgresoInsert {
  periodo: string
  fecha_egreso: string
  categoria: string
  concepto: string
  monto: number
  created_by?: string | null
}

export async function getEgresos(filters?: EgresosFilters): Promise<Egreso[]> {
  let q = supabase
    .from('egresos')
    .select('*')
    .order('fecha_egreso', { ascending: false })

  if (filters?.periodo) q = q.eq('periodo', filters.periodo)
  if (filters?.categoria && filters.categoria !== 'todos') q = q.eq('categoria', filters.categoria)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Egreso[]
}

export async function createEgreso(egreso: EgresoInsert): Promise<void> {
  const { error } = await supabase.from('egresos').insert(egreso)
  if (error) throw error
}

export async function updateEgreso(id: string, egreso: Partial<EgresoInsert>): Promise<void> {
  const { error } = await supabase.from('egresos').update(egreso).eq('id', id)
  if (error) throw error
}

export async function deleteEgreso(id: string): Promise<void> {
  const { error } = await supabase.from('egresos').delete().eq('id', id)
  if (error) throw error
}
