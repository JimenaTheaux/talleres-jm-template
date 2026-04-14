import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAlumnos,
  createAlumno,
  updateAlumno,
  toggleAlumnoActivo,
  type AlumnosFilters,
  type AlumnoInsert,
  type AlumnoUpdate,
} from '@/services/alumnos.service'
import type { Alumno } from '@/types/app.types'

const KEY = 'alumnos'

// Claves primitivas explícitas: evita miss de caché por referencia de objeto
export function useAlumnos(filters?: AlumnosFilters) {
  return useQuery({
    queryKey: [KEY, filters?.search ?? '', filters?.turnoId ?? '', filters?.activo ?? null],
    queryFn: () => getAlumnos(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AlumnoInsert) => createAlumno(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AlumnoUpdate }) => updateAlumno(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useToggleAlumnoActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      toggleAlumnoActivo(id, activo),

    // Optimistic update: UI cambia antes de que llegue la respuesta
    onMutate: async ({ id, activo }) => {
      await qc.cancelQueries({ queryKey: [KEY] })
      const snapshot = qc.getQueriesData<Alumno[]>({ queryKey: [KEY] })
      qc.setQueriesData<Alumno[]>({ queryKey: [KEY] }, (old) =>
        old?.map((a) => (a.id === id ? { ...a, activo } : a))
      )
      return { snapshot }
    },

    // Si falla, revertir al snapshot
    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data))
    },

    onSettled: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
