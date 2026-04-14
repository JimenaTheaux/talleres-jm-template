import { useState } from 'react'
import { Users, Plus, Search, Pencil, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import { useAlumnos, useToggleAlumnoActivo } from '@/hooks/useAlumnos'
import { useTurnos } from '@/hooks/useTurnos'
import AlumnoForm from '@/components/alumnos/AlumnoForm'
import ConfirmModal from '@/components/common/ConfirmModal'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import type { Alumno } from '@/types/app.types'

export default function AlumnosPage() {
  const [search, setSearch] = useState('')
  const [turnoId, setTurnoId] = useState<string>('')
  const [soloActivos, setSoloActivos] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [alumnoEditando, setAlumnoEditando] = useState<Alumno | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Alumno | null>(null)

  const filters = {
    search: search || undefined,
    turnoId: turnoId || undefined,
    activo: soloActivos ? true : undefined,
  }

  const { data: alumnos = [], isLoading, isError } = useAlumnos(filters)
  const { data: turnos = [] } = useTurnos()
  const toggleActivo = useToggleAlumnoActivo()

  const handleEditar = (alumno: Alumno) => {
    setAlumnoEditando(alumno)
    setFormOpen(true)
  }

  const handleNuevo = () => {
    setAlumnoEditando(null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setAlumnoEditando(null)
  }

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return
    await toggleActivo.mutateAsync({ id: toggleTarget.id, activo: !toggleTarget.activo })
    setToggleTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary" />
          <h1 className="text-2xl font-display font-bold text-primary">Alumnos</h1>
        </div>
        <button
          onClick={handleNuevo}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nuevo alumno</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o apellido..."
            className="w-full bg-card rounded-xl pl-9 pr-4 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted shadow-sm"
          />
        </div>
        <select
          value={turnoId}
          onChange={(e) => setTurnoId(e.target.value)}
          className="bg-card rounded-xl px-4 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none shadow-sm min-w-[160px]"
        >
          <option value="">Todos los turnos</option>
          {turnos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSoloActivos((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-body text-sm border transition-colors shadow-sm whitespace-nowrap ${
            soloActivos
              ? 'bg-success-bg text-success border-success/20'
              : 'bg-card text-text-secondary border-border hover:bg-surface'
          }`}
        >
          {soloActivos ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {soloActivos ? 'Solo activos' : 'Todos'}
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? <TableSkeleton rows={7} cols={5} /> : (
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle size={36} className="text-error" />
            <p className="font-body text-text-secondary text-sm">Error al cargar los alumnos</p>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Users size={40} className="text-text-muted" />
            <p className="font-body font-semibold text-text-primary text-sm">
              No hay alumnos{search || turnoId ? ' con esos filtros' : ' registrados'}
            </p>
            {!search && !turnoId && (
              <button
                onClick={handleNuevo}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors mt-1"
              >
                <Plus size={16} />
                Crear primer alumno
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface">
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Alumno
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden md:table-cell">
                    Turno
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left hidden lg:table-cell">
                    Teléfono tutor
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-left">
                    Estado
                  </th>
                  <th className="text-xs font-body font-medium uppercase tracking-wide text-text-secondary px-4 py-3 text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-surface/60 transition-colors">
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border">
                      <p className="font-semibold text-text-primary">
                        {alumno.apellido}, {alumno.nombre}
                      </p>
                      {alumno.fecha_nac && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {new Date(alumno.fecha_nac + 'T00:00:00').toLocaleDateString('es-AR')}
                        </p>
                      )}
                    </td>
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden md:table-cell">
                      {alumno.turno?.nombre ?? (
                        <span className="text-text-muted italic">Sin turno</span>
                      )}
                    </td>
                    <td className="text-sm font-body px-4 py-3.5 border-t border-border text-text-secondary hidden lg:table-cell">
                      {alumno.telefono_tutor ?? (
                        <span className="text-text-muted italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 border-t border-border">
                      <span
                        className="text-[11px] font-body font-semibold px-2.5 py-0.5 rounded-full"
                        style={
                          alumno.activo
                            ? { background: '#F0FDF4', color: '#16A34A' }
                            : { background: '#F1F5F9', color: '#64748B' }
                        }
                      >
                        ● {alumno.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 border-t border-border">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditar(alumno)}
                          className="p-2 rounded-lg text-text-secondary hover:bg-surface hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setToggleTarget(alumno)}
                          className={`p-2 rounded-lg transition-colors ${
                            alumno.activo
                              ? 'text-text-secondary hover:bg-error-bg hover:text-error'
                              : 'text-text-secondary hover:bg-success-bg hover:text-success'
                          }`}
                          title={alumno.activo ? 'Desactivar' : 'Activar'}
                        >
                          {alumno.activo ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Contador */}
      {!isLoading && alumnos.length > 0 && (
        <p className="text-xs font-body text-text-muted mt-3 text-right">
          {alumnos.length} {alumnos.length === 1 ? 'alumno' : 'alumnos'}
        </p>
      )}

      {/* Modal formulario */}
      {formOpen && (
        <AlumnoForm alumno={alumnoEditando} onClose={handleCloseForm} />
      )}

      {/* Modal confirmación toggle */}
      {toggleTarget && (
        <ConfirmModal
          title={toggleTarget.activo ? 'Desactivar alumno' : 'Activar alumno'}
          description={`¿Confirmas que querés ${toggleTarget.activo ? 'desactivar' : 'activar'} a ${toggleTarget.nombre} ${toggleTarget.apellido}?${toggleTarget.activo ? ' No aparecerá en la generación de deudas.' : ''}`}
          confirmLabel={toggleTarget.activo ? 'Desactivar' : 'Activar'}
          destructive={toggleTarget.activo}
          loading={toggleActivo.isPending}
          onConfirm={handleConfirmToggle}
          onCancel={() => setToggleTarget(null)}
        />
      )}
    </div>
  )
}
