import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConfiguracion, updateConfiguracion } from '@/services/config.service'
import type { Configuracion } from '@/types/app.types'

const KEY = 'configuracion'

export function useConfig() {
  return useQuery({
    queryKey: [KEY],
    queryFn: getConfiguracion,
    staleTime: 1000 * 60 * 60,
  })
}

export function useUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Configuracion>) => updateConfiguracion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
