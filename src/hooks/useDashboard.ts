import { useQuery } from '@tanstack/react-query'
import { getDashboardKpis, getChartData } from '@/services/dashboard.service'

export function useDashboardKpis(periodo: string) {
  return useQuery({
    queryKey: ['dashboard', 'kpis', periodo],
    queryFn: () => getDashboardKpis(periodo),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDashboardChart(periodo: string) {
  return useQuery({
    queryKey: ['dashboard', 'chart', periodo],
    queryFn: () => getChartData(periodo),
    staleTime: 1000 * 60 * 10,
  })
}
