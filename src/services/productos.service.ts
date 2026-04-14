import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types/app.types'

export interface ProductoInsert {
  nombre: string
  detalle?: string | null
  talle?: string | null
  precio_actual: number
  foto_url?: string | null
  activo: boolean
}

const BUCKET = 'productos'

export async function getProductos(soloActivos = true): Promise<Producto[]> {
  let q = supabase
    .from('productos')
    .select('id, nombre, detalle, talle, precio_actual, foto_url, activo, created_at, updated_at')
    .order('nombre')
  if (soloActivos) q = q.eq('activo', true)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as unknown as Producto[]
}

export async function uploadFotoProducto(file: File, oldUrl?: string | null): Promise<string> {
  // Eliminar foto anterior del storage si existe
  if (oldUrl) {
    const path = oldUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function createProducto(
  producto: ProductoInsert,
  foto?: File | null
): Promise<void> {
  let foto_url = producto.foto_url ?? null
  if (foto) foto_url = await uploadFotoProducto(foto)

  const { error } = await supabase.from('productos').insert({ ...producto, foto_url })
  if (error) throw error
}

export async function updateProducto(
  id: string,
  producto: Partial<ProductoInsert>,
  foto?: File | null,
  oldFotoUrl?: string | null
): Promise<void> {
  let foto_url = producto.foto_url
  if (foto) foto_url = await uploadFotoProducto(foto, oldFotoUrl)

  const { error } = await supabase
    .from('productos')
    .update({ ...producto, foto_url })
    .eq('id', id)
  if (error) throw error
}

export async function toggleProductoActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('productos').update({ activo }).eq('id', id)
  if (error) throw error
}
