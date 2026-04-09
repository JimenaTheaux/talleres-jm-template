import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingDown,
  Clock,
  ShoppingBag,
  Settings,
  LogOut,
  X,
  Timer,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { getAlumnos } from '@/services/alumnos.service'
import { getPagos } from '@/services/pagos.service'
import { getEgresos } from '@/services/egresos.service'
import { getVentas } from '@/services/ventas.service'
import { getDashboardKpis } from '@/services/dashboard.service'
import { getCurrentPeriodo } from '@/lib/utils'

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  const { perfil, clear } = useAuthStore()
  const qc = useQueryClient()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await supabase.auth.signOut()
    clear()
  }

  // Prefetch de datos + chunk JS al hacer hover sobre cada sección
  const prefetch = (path: string) => {
    const periodo = getCurrentPeriodo()
    switch (path) {
      case '/alumnos':
        qc.prefetchQuery({ queryKey: ['alumnos', '', '', true], queryFn: () => getAlumnos({ activo: true }), staleTime: 1000 * 60 * 5 })
        import('@/pages/AlumnosPage')
        break
      case '/pagos':
        qc.prefetchQuery({ queryKey: ['pagos', periodo, ''], queryFn: () => getPagos({ periodo }), staleTime: 1000 * 60 * 5 })
        import('@/pages/PagosPage')
        break
      case '/egresos':
        qc.prefetchQuery({ queryKey: ['egresos', periodo, ''], queryFn: () => getEgresos({ periodo }), staleTime: 1000 * 60 * 5 })
        import('@/pages/EgresosPage')
        break
      case '/ventas':
        qc.prefetchQuery({ queryKey: ['ventas', periodo, ''], queryFn: () => getVentas({ periodo }), staleTime: 1000 * 60 * 5 })
        import('@/pages/VentasPage')
        break
      case '/dashboard':
        qc.prefetchQuery({ queryKey: ['dashboard', 'kpis', periodo], queryFn: () => getDashboardKpis(periodo), staleTime: 1000 * 60 * 5 })
        import('@/pages/DashboardPage')
        break
      case '/asistencia':
        import('@/pages/AsistenciaPage')
        break
      case '/configuracion':
        import('@/pages/ConfiguracionPage')
        break
    }
  }

  const esProfesor = perfil?.rol === 'profesor'

  const navItems = [
    { path: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard, soloAdmin: true  },
    { path: '/alumnos',       label: 'Alumnos',        icon: Users,           soloAdmin: false },
    { path: '/pagos',         label: 'Pagos',          icon: CreditCard,      soloAdmin: true  },
    { path: '/egresos',       label: 'Egresos',        icon: TrendingDown,    soloAdmin: true  },
    { path: '/asistencia',    label: 'Asistencia',     icon: Clock,           soloAdmin: true  },
    { path: '/ventas',        label: 'Ventas',         icon: ShoppingBag,     soloAdmin: true  },
    { path: '/configuracion', label: 'Configuración',  icon: Settings,        soloAdmin: true  },
    { path: '/mis-horas',     label: 'Mis Horas',      icon: Timer,           soloAdmin: false, soloProfesor: true },
  ].filter((item) => {
    if (esProfesor) return !item.soloAdmin
    return !('soloProfesor' in item && item.soloProfesor)
  })

  return (
    <div className="flex flex-col h-full w-64 bg-gradient-to-b from-primary to-secondary">
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div>
          <p className="text-xs font-body font-medium text-white/50 uppercase tracking-widest">
            Club
          </p>
          <h1 className="text-lg font-display font-bold text-white leading-tight">
            Talleres JM
          </h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            onMouseEnter={() => prefetch(path)}
            onFocus={() => prefetch(path)}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl bg-white/15 text-white font-body font-semibold text-sm'
                : 'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all font-body text-sm'
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/10">
        {perfil && (
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-display font-bold">
                {perfil.nombre[0]}{perfil.apellido[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-body font-semibold text-white truncate">
                {perfil.nombre} {perfil.apellido}
              </p>
              <p className="text-xs font-body text-white/50 capitalize">{perfil.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all font-body text-sm disabled:opacity-50"
        >
          {loggingOut
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <LogOut size={18} />
          }
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
