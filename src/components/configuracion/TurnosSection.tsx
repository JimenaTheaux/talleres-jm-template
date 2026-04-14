import { useState } from 'react'
import { Plus, Pencil, Clock, AlertCircle } from 'lucide-react'
import { useAllTurnos, useToggleTurnoActivo } from '@/hooks/useTurnos'
import TurnoForm from './TurnoForm'
import type { Turno } from '@/types/app.types'

export default function TurnosSection() {
  const { data: turnos = [], isLoading, isError } = useAllTurnos()
  const toggle = useToggleTurnoActivo()
  const [formOpen, setFormOpen] = useState(false)
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null)

  const handleEditar = (t: Turno) => {
    setTurnoEditando(t)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setTurnoEditando(null)
    setFormOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <h2 className="text-sm font-display font-bold text-text-primary">Turnos</h2>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-1.5 bg-accent text-white px-3 py-2 rounded-xl font-display font-semibold text-xs hover:bg-accent-dark transition-colors"
        >
          <Plus size={14} />
          Nuevo turno
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
            <p className="text-sm font-body text-text-secondary">Error al cargar los turnos</p>
          </div>
        ) : turnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Clock size={32} className="text-text-muted" />
            <p className="text-sm font-body text-text-secondary">Sin turnos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {turnos.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3.5 hover:bg-surface/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-body font-semibold ${t.activo ? 'text-text-primary' : 'text-text-muted line-through'}`}>
                      {t.nombre}
                    </p>
                    {t.categoria && (
                      <span className="text-[10px] font-body font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {t.categoria}
                      </span>
                    )}
                    {!t.activo && (
                      <span className="text-[10px] font-body font-semibold bg-surface text-text-muted px-2 py-0.5 rounded-full border border-border">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-body text-text-secondary mt-0.5">
                    {t.dias} · {t.horario}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => handleEditar(t)}
                    className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                    title="Editar"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => toggle.mutate({ id: t.id, activo: !t.activo })}
                    disabled={toggle.isPending}
                    className={`px-3 py-1.5 rounded-xl text-xs font-body font-semibold transition-colors ${
                      t.activo
                        ? 'bg-surface border border-border text-text-secondary hover:bg-error-bg hover:text-error hover:border-error/30'
                        : 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                    }`}
                  >
                    {t.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <TurnoForm
          turno={turnoEditando}
          onClose={() => { setFormOpen(false); setTurnoEditando(null) }}
        />
      )}
    </div>
  )
}
