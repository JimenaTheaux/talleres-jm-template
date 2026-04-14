import { supabase } from '@/lib/supabase'
import type { Turno } from '@/types/app.types'

export interface TurnoInsert {
  nombre: string
  dias: string
  horario: string
  categoria?: string | null
}

export async function getTurnos(): Promise<Turno[]> {
  const { data, error } = await supabase
    .from('turnos')
    .select('id, nombre, dias, horario, categoria, activo, created_at')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return (data ?? []) as Turno[]
}

export async function getAllTurnos(): Promise<Turno[]> {
  const { data, error } = await supabase
    .from('turnos')
    .select('id, nombre, dias, horario, categoria, activo, created_at')
    .order('nombre')
  if (error) throw error
  return (data ?? []) as Turno[]
}

export async function createTurno(turno: TurnoInsert): Promise<void> {
  const { error } = await supabase.from('turnos').insert(turno)
  if (error) throw error
}

export async function updateTurno(id: string, turno: Partial<TurnoInsert>): Promise<void> {
  const { error } = await supabase.from('turnos').update(turno).eq('id', id)
  if (error) throw error
}

export async function toggleTurnoActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('turnos').update({ activo }).eq('id', id)
  if (error) throw error
}
