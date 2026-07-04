// Edge Function: analyze-opportunity
// Calls Gemini 1.5 Pro to analyze a federal opportunity against the user's
// company profile, then caches the result in the bid_analyses table (RLS-scoped).

import { corsHeaders, handleOptions, jsonError, jsonOk } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { analyzeOpportunity, GeminiError } from '../_shared/gemini.ts'
import type { OpportunityForAnalysis, CompanyProfileForAnalysis } from '../_shared/gemini.ts'

interface AnalyzeRequest {
  opportunity: OpportunityForAnalysis & { id: string }
}

Deno.serve(async (req: Request) => {
  const options = handleOptions(req)
  if (options) return options

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405)
  }

  // ── Auth ──────────────────────────────────────────────────────────────
  let auth
  try {
    auth = await requireUser(req)
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonError(err.message, err.status)
    }
    return jsonError('Authentication failed', 401)
  }

  // ── Parse body ────────────────────────────────────────────────────────
  let body: AnalyzeRequest
  try {
    body = await req.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }
  if (!body.opportunity?.id) {
    return jsonError('Missing opportunity.id', 400)
  }

  // ── Cache lookup ──────────────────────────────────────────────────────
  const { data: cached, error: cacheErr } = await auth.supabase
    .from('bid_analyses')
    .select('*')
    .eq('opportunity_id', body.opportunity.id)
    .maybeSingle()

  if (cacheErr) {
    console.error('Cache lookup failed:', cacheErr)
  }
  if (cached) {
    return jsonOk({
      analysis: cached,
      cached: true,
    })
  }

  // ── Fetch user's company profile (RLS ensures it belongs to them) ─────
  const { data: profileRow, error: profileErr } = await auth.supabase
    .from('company_profiles')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (profileErr || !profileRow) {
    return jsonError('Company profile not configured. Set it up first in /profile.', 422)
  }

  const profile: CompanyProfileForAnalysis = {
    name: profileRow.name,
    state: profileRow.state ?? '',
    uei: profileRow.uei ?? undefined,
    naicsCodes: profileRow.naics_codes ?? [],
    capabilities: profileRow.capabilities ?? [],
    certifications: profileRow.certifications ?? [],
    pastPerformance: profileRow.past_performance ?? [],
  }

  // ── Call Gemini ───────────────────────────────────────────────────────
  try {
    const analysis = await analyzeOpportunity(body.opportunity, profile)

    // Persist (RLS will check ownership via user_id column).
    const { error: insertErr } = await auth.supabase.from('bid_analyses').upsert({
      opportunity_id: body.opportunity.id,
      user_id: auth.userId,
      summary: analysis.summary,
      viability_score: analysis.viabilityScore,
      requirements: analysis.requirements,
      risks: analysis.risks,
      missing_certifications: analysis.missingCertifications,
      estimated_contract_value: analysis.estimatedContractValue,
      draft_proposal: analysis.draftProposal,
      analyzed_at: analysis.analyzedAt,
    })

    if (insertErr) {
      console.error('Failed to persist analysis:', insertErr)
      // We still return the analysis — the user gets value, we just log.
    }

    return jsonOk({ analysis, cached: false })
  } catch (err) {
    if (err instanceof GeminiError) {
      return jsonError(err.message, err.status)
    }
    console.error('Unexpected error in analyze-opportunity:', err)
    return jsonError('Internal server error', 500)
  }
})

// Re-export to satisfy strict-mode unused-import warnings.
export { corsHeaders }
