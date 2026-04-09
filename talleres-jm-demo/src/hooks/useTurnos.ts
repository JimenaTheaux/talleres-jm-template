import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTurnos,
  getAllTurnos,
  createTurno,
  updateTurno,
  toggleTurnoActivo,
  type TurnoInsert,
} from '@/services/turnos.service'

const KEY = 'turnos'

export function useTurnos() {
  return useQuery({
    queryKey: [KEY, 'activos'],
    queryFn: getTurnos,
    staleTime: 1000 * 60 * 30,
  })
}

export function useAllTurnos() {
  return useQuery({
    queryKey: [KEY, 'todos'],
    queryFn: getAllTurnos,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateTurno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TurnoInsert) => createTurno(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateTurno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TurnoInsert> }) =>
      updateTurno(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useToggleTurnoActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      toggleTurnoActivo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
