import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAsistencia,
  createAsistencia,
  updateAsistencia,
  deleteAsistencia,
  type AsistenciaInsert,
} from '@/services/asistencia.service'
import { getProfesores } from '@/services/perfiles.service'

const KEY = 'asistencia'

export function useAsistencia(filters: { periodo?: string; profeId?: string }) {
  return useQuery({
    queryKey: [KEY, filters.periodo ?? '', filters.profeId ?? ''],
    queryFn: () => getAsistencia(filters),
    enabled: !!(filters.periodo || filters.profeId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useProfesores() {
  return useQuery({
    queryKey: ['profesores'],
    queryFn: getProfesores,
    staleTime: 1000 * 60 * 15,
  })
}

export function useCreateAsistencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AsistenciaInsert) => createAsistencia(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateAsistencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AsistenciaInsert> }) =>
      updateAsistencia(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useDeleteAsistencia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAsistencia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
