// SAM.gov opportunity search — browser entry point.
//
// In production this delegates to the `opportunities-search` Edge Function
// (which keeps the SAM.gov API key on the server). In demo mode (no Supabase
// configured) it returns a small local dataset so the UI is still explorable.
//
// Inspired by: GSA/srt-fbo-scraper + OpenSAM project
// Docs: https://open.gsa.gov/api/get-opportunities-public-api/

import { searchOpportunitiesViaEdge } from '../lib/api'
import { isDemoMode } from '../lib/env'
import type { FilterState, Opportunity } from '../types'
import { getDemoData } from './demoData'

export interface SearchResult {
  data: Opportunity[]
  total: number
}

export async function searchOpportunities(
  filters: Partial<FilterState>,
  page = 0,
  limit = 25,
): Promise<SearchResult> {
  if (isDemoMode) {
    return getDemoData(filters)
  }
  return searchOpportunitiesViaEdge(filters, page, limit)
}
