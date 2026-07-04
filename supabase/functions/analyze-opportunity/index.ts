// Edge Function: analyze-opportunity
// Calls Gemini 1.5 Pro to analyze a federal opportunity against the user's
// company profile, then caches the result in the bid_analyses table (RLS-scoped).

import { corsHeaders, handleOptions, jsonError, jsonOk } from '../_shared/cors.ts';
import { requireUser, AuthError } from '../_shared/auth.ts';
import { analyzeOpportunity, GeminiError } from '../_shared/gemini.ts';
import type { OpportunityForAnalysis, CompanyProfileForAnalysis } from '../_shared/gemini.ts';

interface AnalyzeRequest {
  opportunity: OpportunityForAnalysis & { id: string };
}

Deno.serve(async (req: Request) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405);
  }

  let auth;
  try {
    auth = await requireUser(req);
  } catch (err) {
    if (err instanceof AuthError) {
      return jsonError(err.message, err.status);
    }
    return jsonError('Authentication failed', 401);
  }

  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }
  if (!body.opportunity?.id) {
    return jsonError('Missing opportunity.id', 400);
  }

  const { data: cached, error: cacheErr } = await auth.supabase
    .from('bid_analyses')
    .select('*')
    .eq('opportunity_id', body.opportunity.id)
    .maybeSingle();

  if (cacheErr) console.error('Cache lookup failed:', cacheErr);
  if (cached) return jsonOk({ analysis: cached, cached: true });

  // Fetch user's decrypted company profile (SECURITY DEFINER RPC)
  const { data: profileRow, error: profileErr } = await auth.supabase
    .rpc('get_company_profile_decrypted', { p_user_id: auth.userId });

  if (profileErr || !profileRow || profileRow.length === 0) {
    return jsonError('Company profile not configured. Set it up first in /profile.', 422);
  }

  const p = profileRow[0];
  const profile: CompanyProfileForAnalysis = {
    name: p.name ?? '',
    state: p.state ?? '',
    uei: p.uei ?? undefined,
    naicsCodes: p.naics_codes ?? [],
    capabilities: p.capabilities ?? [],
    certifications: p.certifications ?? [],
    pastPerformance: p.past_performance ?? [],
  };

  try {
    const analysis = await analyzeOpportunity(body.opportunity, profile);

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
    });

    if (insertErr) console.error('Failed to persist analysis:', insertErr);

    return jsonOk({ analysis, cached: false });
  } catch (err) {
    if (err instanceof GeminiError) return jsonError(err.message, err.status);
    console.error('Unexpected error in analyze-opportunity:', err);
    return jsonError('Internal server error', 500);
  }
});

export { corsHeaders };
