import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],

      // El SW nuevo toma control inmediatamente sin esperar que se cierren
      // las pestañas abiertas — evita que el usuario corra una versión vieja
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Limpia caches de versiones anteriores del SW al activar la nueva.
        // Evita que chunks viejos (hashes anteriores) persistan y entren en
        // conflicto con el index.html nuevo después de un redeploy en Vercel.
        cleanupOutdatedCaches: true,

        // Estrategias de caché en runtime
        runtimeCaching: [
          // Llamadas a la API REST de Supabase: NetworkFirst
          // Intenta la red; si falla (offline/timeout) sirve desde caché
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.supabase.co') &&
              url.pathname.startsWith('/rest/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-rest',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 5, // 5 minutos
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Fuentes de Google: CacheFirst (casi nunca cambian)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },

      manifest: {
        name: 'Talleres JM',
        short_name: 'Talleres JM',
        description: 'Gestión interna Talleres JM',
        theme_color: '#05173B',
        background_color: '#F8FAFC',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('react-router'))
            return 'vendor-react'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('@tanstack')) return 'vendor-query'
          if (id.includes('recharts')) return 'vendor-charts'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('/zod/'))
            return 'vendor-forms'
        },
      },
    },
  },
})
