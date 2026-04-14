import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// Cuando Vercel hace un nuevo deploy, los chunks JS cambian de hash.
// El SW puede servir un index.html viejo que referencia chunks que ya no
// existen en la nueva versión → "Failed to fetch dynamically imported module".
// La solución es detectar el error y recargar la página para obtener el
// index.html nuevo con los hashes correctos.
function isChunkLoadError(msg: string): boolean {
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Unable to preload CSS')
  )
}

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const msg = String(event.reason?.message ?? event.reason ?? '')
  if (isChunkLoadError(msg)) {
    console.warn('[app] chunk load error — recargando para nueva versión', msg)
    event.preventDefault()
    window.location.reload()
  }
})

window.addEventListener('error', (event: ErrorEvent) => {
  if (isChunkLoadError(event.message)) {
    console.warn('[app] chunk load error (global) — recargando', event.message)
    window.location.reload()
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 min — datos considerados frescos
      gcTime: 1000 * 60 * 10,        // 10 min antes de limpiar del caché
      retry: 2,                       // 2 reintentos ante error de red
      retryDelay: 1000,               // 1 segundo entre reintentos
      refetchOnWindowFocus: false,    // no re-fetch al volver a la pestaña
      refetchOnReconnect: true,       // re-fetch al recuperar conexión (mobile)
      refetchOnMount: true,           // siempre re-fetch al montar el componente
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
