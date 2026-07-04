import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { z } from 'zod'

// Validate the public env vars at build/dev time so misconfiguration
// fails loudly instead of producing a broken bundle.
const publicEnvSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().or(z.literal('')).optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_FUNCTIONS_BASE_URL: z.string().url().or(z.literal('')).optional(),
  VITE_DEMO_MODE: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
})

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const parsed = publicEnvSchema.safeParse(env)
  if (!parsed.success) {
    console.warn('[vite] Invalid VITE_ env vars:', parsed.error.flatten().fieldErrors)
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
      // Proxy to local Supabase during development (supabase functions serve)
      // — keeps the same-origin story simple.
      proxy: {
        '/functions/v1': {
          target: process.env.SUPABASE_FUNCTIONS_URL ?? 'http://localhost:54321',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode !== 'production',
      target: 'es2020',
      // Code-split Gemini / Supabase into separate chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            vendor: ['lucide-react', 'date-fns', 'recharts', 'zod'],
          },
        },
      },
    },
  }
})
