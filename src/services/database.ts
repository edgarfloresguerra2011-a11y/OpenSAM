// Supabase persistence layer — multi-user aware.
// All operations are scoped by the authenticated user's RLS policies.
// No more getDefaultProfile() hack: profile is fetched per-user.

import { supabase } from '../lib/supabase'
import type { BidAnalysis, CompanyProfile, Opportunity } from '../types'

// ─── Saved Opportunities ──────────────────────────────────────────────────
export async function saveOpportunity(opp: Opportunity): Promise<void> {
  const { error } = await supabase.from('saved_opportunities').upsert({
    id: opp.id,
    title: opp.title,
    agency: opp.agency,
    solicitation_number: opp.solicitationNumber,
    notice_type: opp.noticeType,
    naics_code: opp.naicsCode,
    posted_date: opp.postedDate,
    response_deadline: opp.responseDeadline,
    place_of_performance: opp.placeOfPerformance,
    set_aside: opp.setAside,
    status: opp.status,
    description: opp.description,
    pdf_url: opp.pdfUrl,
    match_score: opp.matchScore,
    saved_at: new Date().toISOString(),
  })
  if (error) throw error
}

export async function removeSavedOpportunity(id: string): Promise<void> {
  // Soft-delete so analyses remain intact
  const { error } = await supabase
    .from('saved_opportunities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    // Fall back to hard delete if the deleted_at column isn't there yet
    const hardErr = await supabase.from('saved_opportunities').delete().eq('id', id)
    if (hardErr.error) throw hardErr.error
  }
}

export async function getSavedOpportunities(): Promise<Opportunity[]> {
  // Use the active_saved_opportunities view (skips soft-deleted rows)
  const { data, error } = await supabase
    .from('active_saved_opportunities')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) {
    // Fallback: filter deleted_at in the client (pre-004 migration)
    const fallback = await supabase
      .from('saved_opportunities')
      .select('*')
      .is('deleted_at', null)
      .order('saved_at', { ascending: false })
    if (fallback.error) throw fallback.error
    return (fallback.data ?? []).map(rowToOpportunity)
  }
  return (data ?? []).map(rowToOpportunity)
}

function rowToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    agency: String(row.agency ?? ''),
    solicitationNumber: String(row.solicitation_number ?? '—'),
    noticeType: (row.notice_type as Opportunity['noticeType']) ?? 'Other',
    naicsCode: String(row.naics_code ?? ''),
    naicsDescription: '',
    postedDate: String(row.posted_date ?? ''),
    responseDeadline: String(row.response_deadline ?? ''),
    placeOfPerformance: String(row.place_of_performance ?? 'Various'),
    setAside: (row.set_aside as string | null) ?? undefined,
    status: (row.status as Opportunity['status']) ?? 'active',
    description: String(row.description ?? ''),
    pdfUrl: (row.pdf_url as string | null) ?? undefined,
    matchScore: (row.match_score as number | null) ?? undefined,
    savedAt: (row.saved_at as string | null) ?? undefined,
  }
}

// ─── Bid Analysis Cache ───────────────────────────────────────────────────
// NOTE: insert/upsert here is mostly for the Edge Function's use.
// The frontend typically reads analyses via the Edge Function.
export async function getCachedAnalysis(opportunityId: string): Promise<BidAnalysis | null> {
  const { data, error } = await supabase
    .from('bid_analyses')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  if (error || !data) return null
  return {
    summary: data.summary ?? '',
    viabilityScore: data.viability_score ?? 0,
    requirements: data.requirements ?? [],
    risks: data.risks ?? [],
    missingCertifications: data.missing_certifications ?? [],
    estimatedContractValue: data.estimated_contract_value ?? 'Not specified',
    draftProposal: data.draft_proposal ?? '',
    analyzedAt: data.analyzed_at ?? new Date().toISOString(),
  }
}

// ─── Company Profile ──────────────────────────────────────────────────────
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const { data, error } = await supabase.from('company_profiles').select('*').limit(1).maybeSingle()
  if (error || !data) return null
  return {
    id: String(data.id),
    name: data.name ?? '',
    // EIN/UEI are encrypted server-side; the client never sees plaintext.
    ein: '',
    uei: '',
    naicsCodes: data.naics_codes ?? [],
    capabilities: data.capabilities ?? [],
    certifications: data.certifications ?? [],
    pastPerformance: data.past_performance ?? [],
    state: data.state ?? '',
  }
}

export async function upsertCompanyProfile(profile: Omit<CompanyProfile, 'id'>): Promise<void> {
  const { error } = await supabase.from('company_profiles').upsert({
    name: profile.name,
    ein: profile.ein || null, // trigger encrypts before storage
    uei: profile.uei || null,
    naics_codes: profile.naicsCodes,
    capabilities: profile.capabilities,
    certifications: profile.certifications,
    past_performance: profile.pastPerformance,
    state: profile.state,
  })
  if (error) throw error
}

// Fallback for demo mode (no auth, no Supabase)
export function getDemoProfile(): CompanyProfile {
  return {
    id: 'demo',
    name: 'AliceLabs LLC',
    ein: '',
    uei: '',
    naicsCodes: ['541511', '541512', '541519', '518210'],
    capabilities: [
      'artificial intelligence',
      'machine learning',
      'cloud infrastructure',
      'software development',
      'data processing',
      'API integration',
      'React',
      'Node.js',
    ],
    certifications: ['Small Business'],
    pastPerformance: [],
    state: 'WY',
  }
}
