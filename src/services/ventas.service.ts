import { supabase } from '@/lib/supabase'
import type { Venta } from '@/types/app.types'

export interface VentasFilters {
  periodo?: string
  estado?: string
}

export interface VentaInsert {
  producto_id: string
  alumno_id?: string | null
  precio_venta: number
  cantidad: number
  total: number
  fecha_venta: string
  estado: string
  observaciones?: string | null
  created_by?: string | null
}

function periodoARango(periodo: string) {
  const [y, m] = periodo.split('-').map(Number)
  const ultimo = new Date(y, m, 0).getDate()
  return {
    gte: `${y}-${String(m).padStart(2, '0')}-01`,
    lte: `${y}-${String(m).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`,
  }
}

const VENTA_QUERY = `
  *,
  producto:productos(id, nombre, talle, detalle, precio_actual, activo, foto_url, created_at, updated_at),
  alumno:alumnos(id, nombre, apellido, turno_id, activo, created_at, updated_at,
    nombre_tutor, telefono_tutor, fecha_nac, localidad, domicilio, telefono,
    turno:turnos(id, nombre, horario, dias, categoria, activo, created_at))
`

export async function getVentas(filters?: VentasFilters): Promise<Venta[]> {
  let q = supabase
    .from('ventas')
    .select(VENTA_QUERY)
    .order('fecha_venta', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters?.periodo) {
    const { gte, lte } = periodoARango(filters.periodo)
    q = q.gte('fecha_venta', gte).lte('fecha_venta', lte)
  }
  if (filters?.estado && filters.estado !== 'todos') q = q.eq('estado', filters.estado)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Venta[]
}

export async function createVenta(venta: VentaInsert): Promise<void> {
  const { error } = await supabase.from('ventas').insert(venta)
  if (error) throw error
}

export async function updateVenta(id: string, venta: Partial<VentaInsert>): Promise<void> {
  const { error } = await supabase.from('ventas').update(venta).eq('id', id)
  if (error) throw error
}

export async function deleteVenta(id: string): Promise<void> {
  const { error } = await supabase.from('ventas').delete().eq('id', id)
  if (error) throw error
}
