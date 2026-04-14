import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LogOut, Lock, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import CambiarContrasenaModal from './CambiarContrasenaModal'

export default function ProfesorLayout() {
  const { perfil, clear } = useAuthStore()
  const [passModalOpen, setPassModalOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clear()
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Topbar */}
      <header
        className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-secondary flex items-end justify-between px-4 z-30 shadow-md"
        style={{
          paddingBottom: '0.75rem',
          paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-white text-base">Talleres DEMO</span>
          <NavLink
            to="/alumnos"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body font-semibold transition-colors ${
                isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Users size={16} />
            <span>Alumnos</span>
          </NavLink>
        </div>
        <div className="flex items-center gap-1">
          {perfil && (
            <span className="text-sm font-body text-white/80 hidden sm:block mr-2">
              {perfil.nombre} {perfil.apellido}
            </span>
          )}
          <button
            onClick={() => setPassModalOpen(true)}
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Cambiar contraseña"
          >
            <Lock size={18} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen">
        <div
          className="h-14"
          style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }}
          aria-hidden
        />
        <div
          className="p-4 lg:p-8 max-w-4xl mx-auto"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </div>
      </main>

      <CambiarContrasenaModal
        open={passModalOpen}
        onClose={() => setPassModalOpen(false)}
      />
    </div>
  )
}
