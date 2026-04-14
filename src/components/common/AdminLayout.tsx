import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/store/authStore'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { perfil } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface">
      {/* Sidebar desktop: fijo, siempre visible */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40 shadow-xl">
        <Sidebar />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile: drawer */}
      <div
        className={`fixed left-0 top-0 h-full z-50 lg:hidden transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Topbar mobile — altura fija + safe-area iOS */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-border flex items-end justify-between px-4 z-30"
        style={{
          paddingBottom: '0.75rem',
          paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
        }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
        >
          <Menu size={22} />
        </button>
        <span className="font-display font-bold text-primary text-base">Talleres DEMO</span>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-xs font-display font-bold">
            {perfil ? `${perfil.nombre[0]}${perfil.apellido[0]}` : '?'}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Mobile: push below topbar (topbar ~3.5rem + safe-area-top) */}
        <div
          className="lg:hidden h-14"
          style={{ height: 'calc(3.5rem + env(safe-area-inset-top))' }}
          aria-hidden
        />
        <div
          className="p-4 lg:p-8"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  )
}
