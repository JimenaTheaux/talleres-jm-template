import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getVentas,
  createVenta,
  updateVenta,
  deleteVenta,
  type VentasFilters,
  type VentaInsert,
} from '@/services/ventas.service'

const KEY = 'ventas'

export function useVentas(filters?: VentasFilters) {
  return useQuery({
    queryKey: [KEY, filters?.periodo ?? '', filters?.estado ?? ''],
    queryFn: () => getVentas(filters),
    staleTime: 1000 * 60 * 5,
  })
}

// Re-export desde useProductos para compatibilidad backward
export { useProductosActivos as useProductos } from '@/hooks/useProductos'

export function useCreateVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VentaInsert) => createVenta(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VentaInsert> }) =>
      updateVenta(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVenta(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
