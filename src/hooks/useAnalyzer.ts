import { useState, useCallback } from 'react'
import { analyzeOpportunity } from '../services/gemini'
import { saveAnalysis, getCachedAnalysis, getDefaultProfile } from '../services/database'
import type { Opportunity, BidAnalysis } from '../types'

export function useAnalyzer() {
  const [analysis, setAnalysis] = useState<BidAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (opp: Opportunity) => {
    setLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      // 1. Check Supabase cache first (save Gemini credits)
      const cached = await getCachedAnalysis(opp.id).catch(() => null)
      if (cached) {
        setAnalysis(cached)
        setLoading(false)
        return
      }

      // 2. Run Gemini analysis
      const profile = getDefaultProfile()
      const result = await analyzeOpportunity(opp, profile)
      setAnalysis(result)

      // 3. Persist to Supabase
      await saveAnalysis(opp.id, result).catch(() => {/* non-blocking */})
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = () => { setAnalysis(null); setError(null) }

  return { analysis, loading, error, analyze, clear }
}
