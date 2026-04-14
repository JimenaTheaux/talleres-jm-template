import { useState } from 'react'
import { Plus, Pencil, Users, AlertCircle } from 'lucide-react'
import { useAllPerfiles, useTogglePerfilActivo } from '@/hooks/usePerfilesAdmin'
import { useAuthStore } from '@/store/authStore'
import UsuarioForm from './UsuarioForm'
import type { Perfil } from '@/types/app.types'

const rolStyle: Record<string, { bg: string; color: string }> = {
  superadmin: { bg: '#EFF6FF', color: '#1D4ED8' },
  admin:      { bg: '#F0FDF4', color: '#16A34A' },
  profesor:   { bg: '#FFF7ED', color: '#EA580C' },
}

export default function UsuariosSection() {
  const { perfil: perfilActual } = useAuthStore()
  const { data: perfiles = [], isLoading, isError } = useAllPerfiles()
  const toggle = useTogglePerfilActivo()
  const [formOpen, setFormOpen] = useState(false)
  const [perfilEditando, setPerfilEditando] = useState<Perfil | null>(null)

  const handleEditar = (p: Perfil) => {
    setPerfilEditando(p)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setPerfilEditando(null)
    setFormOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <h2 className="text-sm font-display font-bold text-text-primary">Usuarios</h2>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-1.5 bg-accent text-white px-3 py-2 rounded-xl font-display font-semibold text-xs hover:bg-accent-dark transition-colors"
        >
          <Plus size={14} />
          Nuevo usuario
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <AlertCircle size={28} className="text-error" />
            <p className="text-sm font-body text-text-secondary">Error al cargar los usuarios</p>
          </div>
        ) : perfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Users size={32} className="text-text-muted" />
            <p className="text-sm font-body text-text-secondary">Sin usuarios registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {perfiles.map((p) => {
              const style = rolStyle[p.rol] ?? rolStyle.profesor
              const esSelf = p.id === perfilActual?.id
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-body font-semibold ${p.activo ? 'text-text-primary' : 'text-text-muted'}`}>
                        {p.apellido}, {p.nombre}
                        {esSelf && (
                          <span className="ml-1.5 text-[10px] text-text-muted font-normal">(vos)</span>
                        )}
                      </p>
                      <span
                        className="text-[10px] font-body font-semibold px-2 py-0.5 rounded-full"
                        style={style}
                      >
                        {p.rol}
                      </span>
                      {!p.activo && (
                        <span className="text-[10px] font-body font-semibold bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border">
                          Inactivo
                        </span>
                      )}
                    </div>
                    {p.telefono && (
                      <p className="text-xs font-body text-text-secondary mt-0.5">{p.telefono}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => handleEditar(p)}
                      className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Pencil size={15} />
                    </button>
                    {!esSelf && (
                      <button
                        onClick={() => toggle.mutate({ id: p.id, activo: !p.activo })}
                        disabled={toggle.isPending}
                        className={`px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-colors ${
                          p.activo
                            ? 'bg-surface border border-border text-text-secondary hover:bg-error-bg hover:text-error hover:border-error/30'
                            : 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                        }`}
                      >
                        {p.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <UsuarioForm
          perfil={perfilEditando}
          onClose={() => { setFormOpen(false); setPerfilEditando(null) }}
        />
      )}
    </div>
  )
}
