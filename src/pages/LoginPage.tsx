import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Perfil } from '@/types/app.types'

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }: LoginForm) => {
    setAuthError(null)
    try {
      // 1. Autenticar con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setAuthError('Email o contraseña incorrectos')
        return
      }
      if (!data.user) {
        setAuthError('No se pudo obtener el usuario. Intentá de nuevo.')
        return
      }

      // 2. Cargar perfil
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (perfilError || !perfilData) {
        setAuthError('No se encontró el perfil de usuario. Contactá al administrador.')
        await supabase.auth.signOut()
        return
      }

      const perfil = perfilData as unknown as Perfil

      // 3. Setear auth de forma atómica (evita race condition con onAuthStateChange)
      setAuth(data.user, perfil)

      // 4. Navegar
      navigate(perfil.rol === 'profesor' ? '/mis-horas' : '/dashboard', { replace: true })
    } catch {
      setAuthError('Error de conexión. Verificá tu internet e intentá de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-display font-black text-xl">TJ</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-primary">Talleres DEMO</h1>
          <p className="text-sm font-body text-text-secondary mt-1">Ingresá a tu cuenta</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-body font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                {...register('email')}
                className="w-full bg-surface rounded-xl px-4 py-2.5 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
              />
              {errors.email && (
                <p className="mt-1 text-xs font-body text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-body font-medium uppercase tracking-wide text-text-secondary mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full bg-surface rounded-xl px-4 py-2.5 pr-10 text-sm font-body border border-border focus:ring-2 focus:ring-accent/30 focus:border-accent focus:outline-none transition-all placeholder:text-text-muted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-body text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Auth error */}
            {authError && (
              <div className="flex items-center gap-2 bg-error-bg border border-error/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-error shrink-0" />
                <p className="text-sm font-body text-error">{authError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent text-white px-5 py-3 rounded-xl font-display font-semibold text-sm hover:bg-accent-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
