import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEgresos,
  createEgreso,
  updateEgreso,
  deleteEgreso,
  type EgresosFilters,
  type EgresoInsert,
} from '@/services/egresos.service'

const KEY = 'egresos'

export function useEgresos(filters?: EgresosFilters) {
  return useQuery({
    queryKey: [KEY, filters?.periodo ?? '', filters?.categoria ?? ''],
    queryFn: () => getEgresos(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: EgresoInsert) => createEgreso(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EgresoInsert> }) =>
      updateEgreso(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEgreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEgreso(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
