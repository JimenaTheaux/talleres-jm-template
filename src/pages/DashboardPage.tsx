import { useState } from 'react'
import { LayoutDashboard, TrendingUp, TrendingDown, Wallet, Users, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useDashboardKpis, useDashboardChart } from '@/hooks/useDashboard'
import { formatCurrency, formatPeriodo, getCurrentPeriodo } from '@/lib/utils'
import PeriodoPicker from '@/components/common/PeriodoPicker'
import KpiCard from '@/components/dashboard/KpiCard'
import IngresoChart from '@/components/dashboard/IngresoChart'
import AccesosRapidos from '@/components/dashboard/AccesosRapidos'
import DeudoresList from '@/components/pagos/DeudoresList'
import { KpiSkeleton } from '@/components/common/TableSkeleton'

export default function DashboardPage() {
  const { perfil } = useAuthStore()
  const [periodo, setPeriodo] = useState(getCurrentPeriodo)
  const [deudoresOpen, setDeudoresOpen] = useState(false)

  const { data: kpis, isLoading: kpisLoading } = useDashboardKpis(periodo)
  const { data: chartData = [], isLoading: chartLoading } = useDashboardChart(periodo)

  const saludo = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LayoutDashboard size={24} className="text-primary" />
            <h1 className="text-2xl font-display font-bold text-primary">Dashboard</h1>
          </div>
          <p className="text-sm font-body text-text-secondary pl-9">
            {saludo}{perfil ? `, ${perfil.nombre}` : ''}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm">
          <PeriodoPicker value={periodo} onChange={setPeriodo} />
        </div>
      </div>

      {/* KPIs */}
      {kpisLoading ? <div className="mb-5"><KpiSkeleton count={4} /></div> : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="Ingresos"
          value={formatCurrency(kpis?.ingresos ?? 0)}
          icon={<TrendingUp size={20} />}
          variant="success"
        />
        <KpiCard
          label="Egresos"
          value={formatCurrency(kpis?.egresos ?? 0)}
          icon={<TrendingDown size={20} />}
          variant="error"
        />
        <KpiCard
          label="Ganancia neta"
          value={formatCurrency(kpis?.ganancia ?? 0)}
          icon={<Wallet size={20} />}
          variant="primary"
        />
        <KpiCard
          label="Alumnos activos"
          value={String(kpis?.alumnosActivos ?? 0)}
          icon={<Users size={20} />}
          variant="default"
        />
      </div>
      )}

      {/* Alerta deudores */}
      {!kpisLoading && (kpis?.deudores ?? 0) > 0 && (
        <button
          onClick={() => setDeudoresOpen(true)}
          className="w-full flex items-center justify-between bg-error-bg border border-error/20 rounded-2xl px-4 py-3 mb-5 hover:bg-error/10 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-error shrink-0" />
            <span className="text-sm font-body font-semibold text-error">
              {kpis!.deudores} {kpis!.deudores === 1 ? 'deudor' : 'deudores'} en {formatPeriodo(periodo)}
            </span>
          </div>
          <span className="text-xs font-body font-medium text-error/70 group-hover:text-error transition-colors">
            Ver deudores →
          </span>
        </button>
      )}

      {/* Gráfico */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-5 py-5 mb-5">
        <h2 className="text-sm font-display font-bold text-text-primary mb-4">
          Ingresos vs Egresos — últimos 6 meses
        </h2>
        <IngresoChart data={chartData} loading={chartLoading} />
      </div>

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-sm font-display font-bold text-text-primary mb-3">Accesos rápidos</h2>
        <AccesosRapidos />
      </div>

      {/* Modal deudores */}
      {deudoresOpen && <DeudoresList periodoInicial={periodo} onClose={() => setDeudoresOpen(false)} />}
    </div>
  )
}
