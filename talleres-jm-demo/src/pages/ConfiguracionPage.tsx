import { useState } from 'react'
import { Settings, Lock } from 'lucide-react'
import ConfigNegocio from '@/components/configuracion/ConfigNegocio'
import UsuariosSection from '@/components/configuracion/UsuariosSection'
import TurnosSection from '@/components/configuracion/TurnosSection'
import ProductosSection from '@/components/configuracion/ProductosSection'
import CambiarContrasenaModal from '@/components/common/CambiarContrasenaModal'

const TABS = [
  { id: 'negocio',   label: 'Negocio' },
  { id: 'usuarios',  label: 'Usuarios' },
  { id: 'turnos',    label: 'Turnos' },
  { id: 'productos', label: 'Productos' },
]

type Tab = 'negocio' | 'usuarios' | 'turnos' | 'productos'

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('negocio')
  const [passModalOpen, setPassModalOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-primary" />
        <h1 className="text-2xl font-display font-bold text-primary">Configuración</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 bg-surface border border-border rounded-xl p-1 w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-4 py-2 rounded-lg font-body text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-card text-primary shadow-sm border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'negocio'   && <ConfigNegocio />}
      {tab === 'usuarios'  && <UsuariosSection />}
      {tab === 'turnos'    && <TurnosSection />}
      {tab === 'productos' && <ProductosSection />}

      {/* Mi cuenta — siempre visible en Configuración */}
      <div className="mt-10 pt-6 border-t border-border">
        <h2 className="text-base font-display font-bold text-text-primary mb-4">Mi cuenta</h2>
        <button
          onClick={() => setPassModalOpen(true)}
          className="flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3.5 hover:bg-surface transition-colors shadow-sm text-left w-full sm:w-auto"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Lock size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-display font-semibold text-text-primary">Cambiar contraseña</p>
            <p className="text-xs font-body text-text-muted">Actualizá tu contraseña de acceso</p>
          </div>
        </button>
      </div>

      <CambiarContrasenaModal
        open={passModalOpen}
        onClose={() => setPassModalOpen(false)}
      />
    </div>
  )
}
