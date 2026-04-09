import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'loading' | 'slow' | 'retry'>('loading')

  useEffect(() => {
    // Después de 3s: aviso de conexión lenta
    const t1 = setTimeout(() => setPhase('slow'), 3000)
    // Después de 7s: botón de reintentar
    const t2 = setTimeout(() => setPhase('retry'), 7000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-5 px-8">
      <img
        src="/favicon.svg"
        alt="Talleres JM"
        width={96}
        height={92}
        style={{ filter: 'drop-shadow(0 4px 16px rgba(134,59,255,0.18))' }}
      />
      <p className="font-display font-bold text-xl" style={{ color: '#05173B' }}>
        Talleres JM
      </p>

      {phase === 'loading' && (
        <div
          className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: '#3B82F6', borderTopColor: 'transparent' }}
        />
      )}

      {phase === 'slow' && (
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: '#3B82F6', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-body text-center" style={{ color: '#64748B' }}>
            Conectando con el servidor…
          </p>
        </div>
      )}

      {phase === 'retry' && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-body text-center" style={{ color: '#64748B' }}>
            La conexión está tardando más de lo esperado.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold text-sm text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
