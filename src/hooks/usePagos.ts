import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPagos,
  createPago,
  updatePago,
  deletePago,
  generarDeudasMes,
  getDeudores,
  type PagosFilters,
  type PagoInsert,
  type DetallePagoInsert,
} from '@/services/pagos.service'

const KEY = 'pagos'

export function usePagos(filters?: PagosFilters) {
  return useQuery({
    queryKey: [KEY, filters?.periodo ?? '', filters?.estado ?? ''],
    queryFn: () => getPagos(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDeudores(periodo: string) {
  return useQuery({
    queryKey: ['deudores', periodo],
    queryFn: () => getDeudores(periodo),
    enabled: !!periodo,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pago, detalles }: { pago: PagoInsert; detalles: DetallePagoInsert[] }) =>
      createPago(pago, detalles),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['deudores'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      pago,
      detalles,
    }: {
      id: string
      pago: Partial<PagoInsert>
      detalles: DetallePagoInsert[]
    }) => updatePago(id, pago, detalles),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['deudores'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeletePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePago(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['deudores'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useGenerarDeudas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ periodo, createdBy }: { periodo: string; createdBy?: string | null }) =>
      generarDeudasMes(periodo, createdBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: ['deudores'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
