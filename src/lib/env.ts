// Centralized, validated environment variables for the frontend.
// IMPORTANT: only VITE_SUPABASE_* should be exposed to the browser.
// Gemini and SAM.gov API keys MUST stay on the server (Edge Functions).

import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL').or(z.literal('')),
  VITE_SUPABASE_ANON_KEY: z.string(),
  // Optional: explicit override of the Edge Function base URL.
  // Defaults to `${VITE_SUPABASE_URL}/functions/v1`.
  VITE_FUNCTIONS_BASE_URL: z.string().url().or(z.literal('')).optional(),
  VITE_DEMO_MODE: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  // Log clear, actionable errors at boot rather than cryptic undefined strings later.
  console.error('[env] Invalid environment variables:', parsed.error.flatten().fieldErrors)
}

const env = parsed.success
  ? parsed.data
  : {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_FUNCTIONS_BASE_URL: '',
      VITE_DEMO_MODE: true,
    }

export const isDemoMode =
  env.VITE_DEMO_MODE ||
  !env.VITE_SUPABASE_URL ||
  !env.VITE_SUPABASE_ANON_KEY ||
  env.VITE_SUPABASE_URL.startsWith('https://placeholder')

export const supabaseUrl = env.VITE_SUPABASE_URL
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY
export const functionsBaseUrl =
  env.VITE_FUNCTIONS_BASE_URL ||
  (env.VITE_SUPABASE_URL ? `${env.VITE_SUPABASE_URL}/functions/v1` : '')

export type AppEnv = typeof env
