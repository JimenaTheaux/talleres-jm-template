import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProductos,
  createProducto,
  updateProducto,
  toggleProductoActivo,
  type ProductoInsert,
} from '@/services/productos.service'
import type { Producto } from '@/types/app.types'

const KEY = 'productos'

export function useProductos(soloActivos = false) {
  return useQuery({
    queryKey: [KEY, soloActivos],
    queryFn: () => getProductos(soloActivos),
    staleTime: 1000 * 60 * 15,
  })
}

export function useProductosActivos() {
  const { data: todos = [], ...rest } = useProductos(true)
  return { data: todos, ...rest }
}

export function useCreateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ producto, foto }: { producto: ProductoInsert; foto?: File | null }) =>
      createProducto(producto, foto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      producto,
      foto,
      oldFotoUrl,
    }: {
      id: string
      producto: Partial<ProductoInsert>
      foto?: File | null
      oldFotoUrl?: string | null
    }) => updateProducto(id, producto, foto, oldFotoUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useToggleProductoActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      toggleProductoActivo(id, activo),
    onMutate: async ({ id, activo }) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const snapshot = qc.getQueriesData<Producto[]>({ queryKey: [KEY] })
      qc.setQueriesData<Producto[]>({ queryKey: [KEY] }, (old) =>
        old?.map((p) => (p.id === id ? { ...p, activo } : p))
      )
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
