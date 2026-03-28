/**
 * Gemini AI Analysis Service
 * Uses Gemini 1.5 Pro (2M token context — can read full RFP PDFs)
 * Inspired by: PowerRFP AI + srt-fbo-scraper bid scoring logic
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { BidAnalysis, Opportunity, CompanyProfile } from '../types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string

function getClient() {
  if (!API_KEY || API_KEY.startsWith('AIzaSy...')) return null
  return new GoogleGenerativeAI(API_KEY)
}

// ─── Core analysis prompt ─────────────────────────────────────────────────────
function buildPrompt(opp: Opportunity, profile: CompanyProfile): string {
  return `
You are a senior federal contracting specialist at AliceLabs LLC, a US-registered IT and AI company.

## COMPANY PROFILE
Name: ${profile.name}
State: ${profile.state}
UEI: ${profile.uei ?? 'pending'}
NAICS Codes: ${profile.naicsCodes.join(', ')}
Capabilities: ${profile.capabilities.join(', ')}
Certifications: ${profile.certifications.join(', ') || 'none yet'}
Past Performance: ${profile.pastPerformance.join(', ') || 'none on record'}

## FEDERAL OPPORTUNITY
Title: ${opp.title}
Agency: ${opp.agency}
Solicitation #: ${opp.solicitationNumber}
NAICS: ${opp.naicsCode}
Set-Aside: ${opp.setAside ?? 'None'}
Deadline: ${opp.responseDeadline}
Place of Performance: ${opp.placeOfPerformance}

Description:
${opp.description}

---

Analyze this opportunity and respond ONLY with a valid JSON object matching this exact schema:
{
  "summary": "string — 2-sentence plain-English summary of what the agency needs",
  "viabilityScore": number between 0 and 100,
  "requirements": ["array of 4-6 critical requirements from the solicitation"],
  "risks": ["array of 3-5 risks or gaps for our company"],
  "missingCertifications": ["list any required certs we don't have"],
  "estimatedContractValue": "string — estimate like '$500K–$2M' or 'Not specified'",
  "draftProposal": "string — a compelling 150-word opening paragraph for our technical proposal"
}
`
}

// ─── Main analyze function ────────────────────────────────────────────────────
export async function analyzeOpportunity(
  opp: Opportunity,
  profile: CompanyProfile,
): Promise<BidAnalysis> {
  const client = getClient()

  // Demo mode — no API key
  if (!client) {
    return generateDemoAnalysis(opp)
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' })
  const result = await model.generateContent(buildPrompt(opp, profile))
  const text = result.response.text()

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Invalid AI response format')

  const parsed = JSON.parse(jsonMatch[0])

  return {
    ...parsed,
    analyzedAt: new Date().toISOString(),
  }
}

// ─── Demo fallback ────────────────────────────────────────────────────────────
function generateDemoAnalysis(opp: Opportunity): BidAnalysis {
  const score = opp.matchScore ?? 65
  return {
    summary: `${opp.agency} requires specialized services in ${opp.naicsDescription || 'technology'}. This is a competitive small-business set-aside acquisition with a firm fixed-price structure.`,
    viabilityScore: score,
    requirements: [
      'Active SAM.gov registration with valid UEI',
      `NAICS ${opp.naicsCode} primary code required`,
      opp.setAside ? `Applicable set-aside: ${opp.setAside}` : 'Open competition',
      'Past performance references (3 within last 5 years)',
      'Technical proposal + price volume submission',
    ],
    risks: [
      score < 50 ? 'NAICS code mismatch reduces eligibility' : 'Strong NAICS alignment',
      'Clearance requirements may apply — verify solicitation',
      'Short response deadline — resource allocation required',
    ],
    missingCertifications: score < 60
      ? ['FedRAMP authorization may be required', 'Verify set-aside eligibility']
      : [],
    estimatedContractValue: 'Not specified in presolicitation',
    draftProposal: `AliceLabs LLC is a Wyoming-registered technology firm specializing in artificial intelligence, cloud infrastructure, and custom software development. We respond to ${opp.solicitationNumber} with a proven track record of delivering scalable, secure, and compliant federal IT solutions. Our team brings deep expertise in the exact capability areas outlined in this solicitation, combining agile delivery with rigorous quality assurance. We are committed to mission success for ${opp.agency} and will leverage our full suite of AI-driven tooling to exceed every performance requirement within budget and on schedule.`,
    analyzedAt: new Date().toISOString(),
  }
}

// ─── Batch scoring (from srt-fbo-scraper concept) ────────────────────────────
export function scoreOpportunityLocally(
  opp: Opportunity,
  profile: CompanyProfile,
): number {
  let score = 50

  // NAICS match
  if (profile.naicsCodes.includes(opp.naicsCode)) score += 25

  // Set-aside eligibility
  const certs = profile.certifications.map(c => c.toLowerCase())
  if (opp.setAside?.includes('Small Business') && certs.length > 0) score += 10
  if (opp.setAside?.includes('8(a)') && certs.includes('sba 8(a)')) score += 15
  if (opp.setAside?.includes('Women') && certs.includes('wosb')) score += 15
  if (opp.setAside?.includes('HUBZone') && certs.includes('hubzone')) score += 15

  // Keyword match in description
  const desc = opp.description.toLowerCase()
  const capHits = profile.capabilities.filter(c => desc.includes(c.toLowerCase())).length
  score += Math.min(capHits * 5, 20)

  // Deadline penalty — less than 7 days
  const daysLeft = (new Date(opp.responseDeadline).getTime() - Date.now()) / 86400000
  if (daysLeft < 7) score -= 15
  if (daysLeft < 3) score -= 20

  return Math.max(0, Math.min(100, score))
}
