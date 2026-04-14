import { supabase } from '@/lib/supabase'
import type { AsistenciaProfe } from '@/types/app.types'

export interface AsistenciaInsert {
  profe_id: string
  fecha: string
  hora_entrada: string
  hora_salida: string
  horas_trabajadas?: number | null
  observaciones?: string | null
}

function periodoARango(periodo: string) {
  const [y, m] = periodo.split('-').map(Number)
  const ultimo = new Date(y, m, 0).getDate()
  return {
    gte: `${y}-${String(m).padStart(2, '0')}-01`,
    lte: `${y}-${String(m).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`,
  }
}

export async function getAsistencia(filters: {
  periodo?: string
  profeId?: string
}): Promise<AsistenciaProfe[]> {
  let q = supabase
    .from('asistencia_profes')
    .select('*, profe:perfiles(id, nombre, apellido, rol, telefono, activo, created_at, updated_at)')
    .order('fecha', { ascending: false })

  if (filters.profeId) q = q.eq('profe_id', filters.profeId)
  if (filters.periodo) {
    const { gte, lte } = periodoARango(filters.periodo)
    q = q.gte('fecha', gte).lte('fecha', lte)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as AsistenciaProfe[]
}

export async function createAsistencia(data: AsistenciaInsert): Promise<void> {
  const { error } = await supabase.from('asistencia_profes').insert(data)
  if (error) throw error
}

export async function updateAsistencia(
  id: string,
  data: Partial<AsistenciaInsert>
): Promise<void> {
  const { error } = await supabase.from('asistencia_profes').update(data).eq('id', id)
  if (error) throw error
}

export async function deleteAsistencia(id: string): Promise<void> {
  const { error } = await supabase.from('asistencia_profes').delete().eq('id', id)
  if (error) throw error
}
