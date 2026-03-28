/**
 * Supabase persistence layer
 * Handles: saved opportunities, company profile, analysis cache
 */

import { supabase } from '../lib/supabase'
import type { Opportunity, BidAnalysis, CompanyProfile } from '../types'

// ─── Saved Opportunities ──────────────────────────────────────────────────────
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
  const { error } = await supabase.from('saved_opportunities').delete().eq('id', id)
  if (error) throw error
}

export async function getSavedOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('*')
    .order('saved_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => ({
    id: row.id,
    title: row.title,
    agency: row.agency,
    solicitationNumber: row.solicitation_number,
    noticeType: row.notice_type,
    naicsCode: row.naics_code,
    naicsDescription: '',
    postedDate: row.posted_date,
    responseDeadline: row.response_deadline,
    placeOfPerformance: row.place_of_performance,
    setAside: row.set_aside,
    status: row.status,
    description: row.description,
    pdfUrl: row.pdf_url,
    matchScore: row.match_score,
    savedAt: row.saved_at,
  }))
}

// ─── Bid Analysis Cache ───────────────────────────────────────────────────────
export async function saveAnalysis(opportunityId: string, analysis: BidAnalysis): Promise<void> {
  const { error } = await supabase.from('bid_analyses').upsert({
    opportunity_id: opportunityId,
    summary: analysis.summary,
    viability_score: analysis.viabilityScore,
    requirements: analysis.requirements,
    risks: analysis.risks,
    missing_certifications: analysis.missingCertifications,
    estimated_contract_value: analysis.estimatedContractValue,
    draft_proposal: analysis.draftProposal,
    analyzed_at: analysis.analyzedAt,
  })
  if (error) throw error
}

export async function getCachedAnalysis(opportunityId: string): Promise<BidAnalysis | null> {
  const { data, error } = await supabase
    .from('bid_analyses')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .maybeSingle()
  if (error || !data) return null
  return {
    summary: data.summary,
    viabilityScore: data.viability_score,
    requirements: data.requirements ?? [],
    risks: data.risks ?? [],
    missingCertifications: data.missing_certifications ?? [],
    estimatedContractValue: data.estimated_contract_value,
    draftProposal: data.draft_proposal,
    analyzedAt: data.analyzed_at,
  }
}

// ─── Company Profile ──────────────────────────────────────────────────────────
export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error || !data) return getDefaultProfile()
  return {
    id: data.id,
    name: data.name,
    ein: data.ein,
    uei: data.uei,
    naicsCodes: data.naics_codes ?? [],
    capabilities: data.capabilities ?? [],
    certifications: data.certifications ?? [],
    pastPerformance: data.past_performance ?? [],
    state: data.state ?? 'WY',
  }
}

export function getDefaultProfile(): CompanyProfile {
  return {
    id: 'default',
    name: 'AliceLabs LLC',
    ein: '',
    uei: '',
    naicsCodes: ['541511', '541512', '541519', '518210'],
    capabilities: ['artificial intelligence', 'machine learning', 'cloud infrastructure', 'software development', 'data processing', 'API integration', 'React', 'Node.js'],
    certifications: ['Small Business'],
    pastPerformance: [],
    state: 'WY',
  }
}
