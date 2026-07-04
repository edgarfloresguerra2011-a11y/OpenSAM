// AI analysis service (browser-side entry point).
//
// Heavy lifting — Gemini 1.5 Pro calls — happens in the `analyze-opportunity`
// Edge Function. The frontend just invokes it. This file also exposes
// scoreOpportunityLocally, a pure function used by the dashboard to give
// instant pre-AI match scores without burning Gemini credits.

import { analyzeOpportunityViaEdge } from '../lib/api'
import { isDemoMode } from '../lib/env'
import type { BidAnalysis, CompanyProfile, Opportunity } from '../types'
import { getDemoProfile } from './database'
import { generateDemoAnalysis } from './demoAnalysis'

// ── Main analyze function ────────────────────────────────────────────────
export async function analyzeOpportunity(
  opp: Opportunity,
  profile: CompanyProfile,
): Promise<BidAnalysis> {
  if (isDemoMode) {
    return generateDemoAnalysis(opp)
  }
  // Edge Function looks up the user's profile itself; we pass opp only.
  void profile
  const { analysis } = await analyzeOpportunityViaEdge(opp)
  return analysis
}

// ── Local pre-scoring (no AI credits) ────────────────────────────────────
// From srt-fbo-scraper concept. Returns 0-100.
export function scoreOpportunityLocally(opp: Opportunity, profile: CompanyProfile): number {
  let score = 50

  if (profile.naicsCodes.includes(opp.naicsCode)) score += 25

  const certs = profile.certifications.map((c) => c.toLowerCase())
  if (opp.setAside?.includes('Small Business') && certs.length > 0) score += 10
  if (opp.setAside?.includes('8(a)') && certs.includes('sba 8(a)')) score += 15
  if (opp.setAside?.includes('Women') && certs.includes('wosb')) score += 15
  if (opp.setAside?.includes('HUBZone') && certs.includes('hubzone')) score += 15

  const desc = opp.description.toLowerCase()
  const capHits = profile.capabilities.filter((c) => desc.includes(c.toLowerCase())).length
  score += Math.min(capHits * 5, 20)

  const daysLeft = (new Date(opp.responseDeadline).getTime() - Date.now()) / 86_400_000
  if (Number.isFinite(daysLeft)) {
    if (daysLeft < 7) score -= 15
    if (daysLeft < 3) score -= 20
  }

  return Math.max(0, Math.min(100, score))
}

// Convenience for demo mode consumers that don't have a profile yet
export function defaultProfile(): CompanyProfile {
  return getDemoProfile()
}
