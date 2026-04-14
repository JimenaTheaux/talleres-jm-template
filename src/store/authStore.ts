import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Perfil } from '@/types/app.types'

interface AuthState {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  setUser: (user: User | null) => void
  setPerfil: (perfil: Perfil | null) => void
  setAuth: (user: User, perfil: Perfil) => void   // actualización atómica
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  perfil: null,
  loading: true,
  setUser: (user) => set({ user }),
  setPerfil: (perfil) => set({ perfil }),
  setAuth: (user, perfil) => set({ user, perfil, loading: false }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, perfil: null, loading: false }),
}))
