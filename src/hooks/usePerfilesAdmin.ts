import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAllPerfiles,
  updatePerfil,
  togglePerfilActivo,
  createUsuario,
  type PerfilUpdate,
  type UsuarioCreate,
} from '@/services/perfiles.service'

const KEY = 'perfiles'

export function useAllPerfiles() {
  return useQuery({
    queryKey: [KEY, 'todos'],
    queryFn: getAllPerfiles,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UsuarioCreate) => createUsuario(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdatePerfil() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PerfilUpdate }) =>
      updatePerfil(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useTogglePerfilActivo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      togglePerfilActivo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
