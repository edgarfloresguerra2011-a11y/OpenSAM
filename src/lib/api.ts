// Thin wrappers around the two Supabase Edge Functions.
// The frontend never calls SAM.gov or Gemini directly.

import { supabase } from './supabase'
import type { BidAnalysis, FilterState, Opportunity } from '../types'

// ── opportunities-search ────────────────────────────────────────────────
export interface SearchResponse {
  data: Opportunity[]
  total: number
}

export async function searchOpportunitiesViaEdge(
  filters: Partial<FilterState>,
  page = 0,
  limit = 25,
): Promise<SearchResponse> {
  const { data, error } = await supabase.functions.invoke<SearchResponse>('opportunities-search', {
    body: {
      query: filters.query || undefined,
      naicsCode: filters.naicsCode || undefined,
      agency: filters.agency || undefined,
      noticeType: filters.noticeType || undefined,
      deadlineDays: filters.deadlineDays,
      page,
      limit,
    },
  })
  if (error) throw new Error(error.message ?? 'Failed to fetch opportunities')
  return data ?? { data: [], total: 0 }
}

// ── analyze-opportunity ─────────────────────────────────────────────────
export interface AnalyzeResponse {
  analysis: BidAnalysis
  cached: boolean
}

export async function analyzeOpportunityViaEdge(
  opportunity: Opportunity,
): Promise<AnalyzeResponse> {
  const { data, error } = await supabase.functions.invoke<AnalyzeResponse>('analyze-opportunity', {
    body: {
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        agency: opportunity.agency,
        solicitationNumber: opportunity.solicitationNumber,
        naicsCode: opportunity.naicsCode,
        setAside: opportunity.setAside,
        responseDeadline: opportunity.responseDeadline,
        placeOfPerformance: opportunity.placeOfPerformance,
        description: opportunity.description,
      },
    },
  })
  if (error) throw new Error(error.message ?? 'Failed to analyze opportunity')
  if (!data) throw new Error('Empty response from analyze-opportunity')
  return data
}
