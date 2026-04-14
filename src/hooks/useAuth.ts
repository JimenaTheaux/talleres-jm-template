import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Perfil } from '@/types/app.types'

/**
 * fetchPerfil con AbortController propio de 6 segundos.
 * Si Supabase tarda más (proyecto pausado, red lenta), lanza error
 * en lugar de colgar para siempre.
 */
async function fetchPerfil(userId: string): Promise<Perfil | null> {
  const controller = new AbortController()
  const abort = setTimeout(() => {
    console.warn('[fetchPerfil] abortando — sin respuesta en 6s')
    controller.abort()
  }, 6000)

  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .abortSignal(controller.signal)
      .single()

    clearTimeout(abort)
    if (error) throw error
    return data as Perfil | null
  } catch (err) {
    clearTimeout(abort)
    throw err
  }
}

export function useAuth() {
  const { loading, setAuth, setLoading, clear } = useAuthStore()

  useEffect(() => {
    // Timeout de seguridad total — si en 10s no resolvió, forzar salida
    const globalTimeout = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        console.error('[useAuth] timeout global — Supabase no respondió')
        setLoading(false)
      }
    }, 10000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[useAuth] onAuthStateChange', event, session?.user?.id ?? 'no-session')

        // ⚠️  CRÍTICO: diferir el trabajo con setTimeout(0).
        // onAuthStateChange mantiene un lock interno de Supabase.
        // Si hacemos una query de Supabase DENTRO del callback sin diferir,
        // y esa query intenta refrescar el token, intenta adquirir el mismo
        // lock → deadlock → la query cuelga indefinidamente.
        setTimeout(async () => {
          if (!session?.user) {
            clearTimeout(globalTimeout)
            clear()
            return
          }

          const state = useAuthStore.getState()

          // Mismo usuario y perfil ya cargados → solo asegurar loading:false
          if (state.user?.id === session.user.id && state.perfil) {
            clearTimeout(globalTimeout)
            if (state.loading) setLoading(false)
            return
          }

          console.log('[useAuth] fetchPerfil para', session.user.id)
          try {
            const p = await fetchPerfil(session.user.id)
            console.log('[useAuth] fetchPerfil ok', !!p)
            clearTimeout(globalTimeout)
            if (p) {
              setAuth(session.user, p)
            } else {
              await supabase.auth.signOut()
              setLoading(false)
            }
          } catch (err) {
            console.error('[useAuth] fetchPerfil falló', err)
            clearTimeout(globalTimeout)
            setLoading(false)
          }
        }, 0)
      }
    )

    return () => {
      clearTimeout(globalTimeout)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    clear()
  }

  return { loading, logout }
}
