import { describe, it, expect } from 'vitest'
import { isDemoMode, supabaseAnonKey, supabaseUrl } from './env'

describe('env', () => {
  it('exposes supabaseUrl as a string (possibly empty in tests)', () => {
    expect(typeof supabaseUrl).toBe('string')
  })

  it('exposes supabaseAnonKey as a string', () => {
    expect(typeof supabaseAnonKey).toBe('string')
  })

  it('isDemoMode is a boolean', () => {
    expect(typeof isDemoMode).toBe('boolean')
  })

  it('in test environment (no env), demo mode is enabled', () => {
    // Vitest doesn't load .env.local by default, so demo mode kicks in.
    expect(isDemoMode).toBe(true)
  })
})
