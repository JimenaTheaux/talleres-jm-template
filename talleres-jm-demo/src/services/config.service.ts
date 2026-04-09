import { supabase } from '@/lib/supabase'
import type { Configuracion } from '@/types/app.types'

export async function getConfiguracion(): Promise<Configuracion> {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .single()
  if (error) throw error
  return data as unknown as Configuracion
}

export async function updateConfiguracion(data: Partial<Configuracion>): Promise<void> {
  const { error } = await supabase
    .from('configuracion')
    .update(data)
    .not('id', 'is', null)
  if (error) throw error
}
