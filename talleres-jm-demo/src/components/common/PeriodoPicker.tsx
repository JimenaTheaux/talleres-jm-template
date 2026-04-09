import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPeriodo } from '@/lib/utils'

interface PeriodoPickerProps {
  value: string // YYYY-MM
  onChange: (periodo: string) => void
  className?: string
}

function navMes(periodo: string, delta: number): string {
  const [y, m] = periodo.split('-').map(Number)
  const d = new Date(y, m - 1 + delta)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function PeriodoPicker({ value, onChange, className = '' }: PeriodoPickerProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => onChange(navMes(value, -1))}
        className="p-1.5 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="font-display font-semibold text-text-primary min-w-[130px] text-center text-sm">
        {formatPeriodo(value)}
      </span>
      <button
        onClick={() => onChange(navMes(value, 1))}
        className="p-1.5 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
