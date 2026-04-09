import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import type { ChartPoint } from '@/services/dashboard.service'

interface IngresoChartProps {
  data: ChartPoint[]
  loading?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 text-sm font-body">
      <p className="font-semibold text-text-primary mb-2">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name === 'ingresos' ? 'Ingresos' : 'Egresos'}: {formatCurrency(entry.value)}
        </p>
      ))}
      {payload.length === 2 && (
        <p className="mt-1.5 pt-1.5 border-t border-border font-semibold text-text-primary">
          Ganancia: {formatCurrency(payload[0].value - payload[1].value)}
        </p>
      )}
    </div>
  )
}

export default function IngresoChart({ data, loading }: IngresoChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = data.some((d) => d.ingresos > 0 || d.egresos > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm font-body text-text-muted">
        Sin datos para mostrar
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #E5E7EB)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans', fill: 'var(--color-text-secondary, #6B7280)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fontFamily: 'Plus Jakarta Sans', fill: 'var(--color-text-muted, #9CA3AF)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface, #F9FAFB)', radius: 4 }} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 12, fontFamily: 'Plus Jakarta Sans', color: 'var(--color-text-secondary)' }}>
              {value === 'ingresos' ? 'Ingresos' : 'Egresos'}
            </span>
          )}
        />
        <Bar dataKey="ingresos" name="ingresos" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="egresos" name="egresos" fill="#EF4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
