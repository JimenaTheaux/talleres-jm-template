import { useNavigate } from 'react-router-dom'
import { Users, CreditCard, TrendingDown, ClipboardList, ShoppingBag } from 'lucide-react'

const ACCESOS = [
  { label: 'Alumnos', icon: Users, path: '/alumnos', color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Pagos', icon: CreditCard, path: '/pagos', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Egresos', icon: TrendingDown, path: '/egresos', color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Asistencia', icon: ClipboardList, path: '/asistencia', color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Ventas', icon: ShoppingBag, path: '/ventas', color: 'text-amber-500', bg: 'bg-amber-50' },
]

export default function AccesosRapidos() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-5 gap-3">
      {ACCESOS.map(({ label, icon: Icon, path, color, bg }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl shadow-sm px-2 py-4 hover:bg-surface hover:border-primary/20 transition-all group"
        >
          <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <Icon size={20} className={color} />
          </div>
          <span className="text-xs font-body font-semibold text-text-secondary group-hover:text-primary transition-colors">
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}
