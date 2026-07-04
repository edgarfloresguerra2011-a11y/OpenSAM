/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_FUNCTIONS_BASE_URL?: string
  readonly VITE_DEMO_MODE?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
