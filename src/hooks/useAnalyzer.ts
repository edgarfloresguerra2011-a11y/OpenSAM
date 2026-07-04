import { useState, useCallback } from 'react'
import { analyzeOpportunity, defaultProfile } from '../services/gemini'
import { getCachedAnalysis, getCompanyProfile } from '../services/database'
import type { BidAnalysis, CompanyProfile, Opportunity } from '../types'

export function useAnalyzer() {
  const [analysis, setAnalysis] = useState<BidAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const analyze = useCallback(async (opp: Opportunity) => {
    setLoading(true)
    setError(null)
    setAnalysis(null)
    setFromCache(false)

    try {
      // 1. Check Supabase cache first (saves Gemini credits)
      const cached = await getCachedAnalysis(opp.id).catch(() => null)
      if (cached) {
        setAnalysis(cached)
        setFromCache(true)
        setLoading(false)
        return
      }

      // 2. Load the user's profile (or fall back to demo defaults)
      const profile: CompanyProfile =
        (await getCompanyProfile().catch(() => null)) ?? defaultProfile()

      // 3. Run analysis (Edge Function in prod, demo generator in demo mode)
      const result = await analyzeOpportunity(opp, profile)
      setAnalysis(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = () => {
    setAnalysis(null)
    setError(null)
    setFromCache(false)
  }

  return { analysis, loading, error, analyze, clear, fromCache }
}
