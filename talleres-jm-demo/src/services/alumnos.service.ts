import { supabase } from '@/lib/supabase'
import type { Alumno } from '@/types/app.types'

export interface AlumnosFilters {
  search?: string
  turnoId?: string | null
  activo?: boolean
}

export type AlumnoInsert = Omit<Alumno, 'id' | 'created_at' | 'updated_at' | 'turno'>
export type AlumnoUpdate = Partial<AlumnoInsert>

export async function getAlumnos(filters?: AlumnosFilters): Promise<Alumno[]> {
  let query = supabase
    .from('alumnos')
    .select('*, turno:turnos(id, nombre, horario, dias, categoria, activo, created_at)')
    .order('apellido')
    .order('nombre')

  if (filters?.activo !== undefined) {
    query = query.eq('activo', filters.activo)
  }
  if (filters?.turnoId) {
    query = query.eq('turno_id', filters.turnoId)
  }
  if (filters?.search) {
    const term = filters.search.trim()
    query = query.or(`nombre.ilike.%${term}%,apellido.ilike.%${term}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as Alumno[]
}

export async function createAlumno(alumno: AlumnoInsert): Promise<Alumno> {
  const { data, error } = await supabase
    .from('alumnos')
    .insert(alumno)
    .select('*, turno:turnos(id, nombre, horario, dias, categoria, activo, created_at)')
    .single()
  if (error) throw error
  return data as unknown as Alumno
}

export async function updateAlumno(id: string, alumno: AlumnoUpdate): Promise<Alumno> {
  const { data, error } = await supabase
    .from('alumnos')
    .update(alumno)
    .eq('id', id)
    .select('*, turno:turnos(id, nombre, horario, dias, categoria, activo, created_at)')
    .single()
  if (error) throw error
  return data as unknown as Alumno
}

export async function toggleAlumnoActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('alumnos')
    .update({ activo })
    .eq('id', id)
  if (error) throw error
}
