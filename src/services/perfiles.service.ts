import { supabase } from '@/lib/supabase'
import type { Perfil } from '@/types/app.types'

export interface PerfilUpdate {
  nombre?: string
  apellido?: string
  rol?: string
  telefono?: string | null
  activo?: boolean
}

export interface UsuarioCreate {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: string
  telefono?: string | null
}

export async function getProfesores(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol, telefono, activo, created_at, updated_at')
    .eq('activo', true)
    .eq('rol', 'profesor')
    .order('apellido')
  if (error) throw error
  return (data ?? []) as unknown as Perfil[]
}

export async function getAllPerfiles(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido, rol, telefono, activo, created_at, updated_at')
    .order('apellido')
  if (error) throw error
  return (data ?? []) as unknown as Perfil[]
}

export async function updatePerfil(id: string, data: PerfilUpdate): Promise<void> {
  const { error } = await supabase.from('perfiles').update(data).eq('id', id)
  if (error) throw error
}

export async function togglePerfilActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('perfiles').update({ activo }).eq('id', id)
  if (error) throw error
}

export async function createUsuario(data: UsuarioCreate): Promise<void> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })
  if (signUpError) throw signUpError

  if (signUpData.user) {
    const { error: perfilError } = await supabase.from('perfiles').upsert({
      id: signUpData.user.id,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      telefono: data.telefono ?? null,
      activo: true,
    })
    if (perfilError) throw perfilError
  }
}
