import { supabase } from '@/lib/supabase'

function periodoARango(periodo: string) {
  const [y, m] = periodo.split('-').map(Number)
  const ultimo = new Date(y, m, 0).getDate()
  return {
    gte: `${y}-${String(m).padStart(2, '0')}-01`,
    lte: `${y}-${String(m).padStart(2, '0')}-${String(ultimo).padStart(2, '0')}`,
  }
}

function getLast6Periodos(referencia: string): string[] {
  const [y, m] = referencia.split('-').map(Number)
  const result: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - 1 - i)
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return result
}

export interface DashboardKpis {
  ingresos: number
  egresos: number
  ganancia: number
  alumnosActivos: number
  deudores: number
}

export interface ChartPoint {
  periodo: string
  label: string
  ingresos: number
  egresos: number
}

export async function getDashboardKpis(periodo: string): Promise<DashboardKpis> {
  const { gte, lte } = periodoARango(periodo)

  const [pagosRes, ventasRes, egresosRes, alumnosRes, deudoresRes] = await Promise.all([
    supabase
      .from('pagos')
      .select('total, estado')
      .eq('periodo', periodo)
      .in('estado', ['pagado', 'parcial']),
    supabase
      .from('ventas')
      .select('total')
      .eq('estado', 'pagado')
      .gte('fecha_venta', gte)
      .lte('fecha_venta', lte),
    supabase
      .from('egresos')
      .select('monto')
      .eq('periodo', periodo),
    supabase
      .from('alumnos')
      .select('id', { count: 'exact', head: true })
      .eq('activo', true),
    supabase
      .from('pagos')
      .select('id', { count: 'exact', head: true })
      .eq('periodo', periodo)
      .in('estado', ['deuda', 'parcial']),
  ])

  if (pagosRes.error) throw pagosRes.error
  if (ventasRes.error) throw ventasRes.error
  if (egresosRes.error) throw egresosRes.error
  if (alumnosRes.error) throw alumnosRes.error
  if (deudoresRes.error) throw deudoresRes.error

  const ingPagos = (pagosRes.data ?? []).reduce((s, p) => s + p.total, 0)
  const ingVentas = (ventasRes.data ?? []).reduce((s, v) => s + v.total, 0)
  const ingresos = ingPagos + ingVentas
  const egresos = (egresosRes.data ?? []).reduce((s, e) => s + e.monto, 0)

  return {
    ingresos,
    egresos,
    ganancia: ingresos - egresos,
    alumnosActivos: alumnosRes.count ?? 0,
    deudores: deudoresRes.count ?? 0,
  }
}

const MESES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export async function getChartData(periodoActual: string): Promise<ChartPoint[]> {
  const periodos = getLast6Periodos(periodoActual)

  const results = await Promise.all(
    periodos.map(async (p) => {
      const { gte, lte } = periodoARango(p)
      const [pagosRes, ventasRes, egresosRes] = await Promise.all([
        supabase
          .from('pagos')
          .select('total')
          .eq('periodo', p)
          .in('estado', ['pagado', 'parcial']),
        supabase
          .from('ventas')
          .select('total')
          .eq('estado', 'pagado')
          .gte('fecha_venta', gte)
          .lte('fecha_venta', lte),
        supabase
          .from('egresos')
          .select('monto')
          .eq('periodo', p),
      ])

      const ingPagos = (pagosRes.data ?? []).reduce((s, x) => s + x.total, 0)
      const ingVentas = (ventasRes.data ?? []).reduce((s, x) => s + x.total, 0)
      const egresos = (egresosRes.data ?? []).reduce((s, x) => s + x.monto, 0)

      const [, m] = p.split('-').map(Number)
      return {
        periodo: p,
        label: MESES_ES[m - 1],
        ingresos: ingPagos + ingVentas,
        egresos,
      }
    })
  )

  return results
}
