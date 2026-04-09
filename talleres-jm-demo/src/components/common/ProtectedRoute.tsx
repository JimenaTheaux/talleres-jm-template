import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import SplashScreen from './SplashScreen'
import type { Rol } from '@/lib/constants'

interface ProtectedRouteProps {
  allowedRoles?: Rol[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, perfil, loading } = useAuthStore()

  // Durante la verificación de sesión inicial mostrar el mismo splash
  if (loading) return <SplashScreen />

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && perfil && !allowedRoles.includes(perfil.rol as Rol)) {
    const destino = perfil.rol === 'profesor' ? '/mis-horas' : '/login'
    return <Navigate to={destino} replace />
  }

  return <Outlet />
}
