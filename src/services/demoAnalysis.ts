// Demo AI analysis fallback — used when Supabase is not configured.
// Produces deterministic-looking output for UI exploration.

import type { BidAnalysis, Opportunity } from '../types'

export function generateDemoAnalysis(opp: Opportunity): BidAnalysis {
  const score = opp.matchScore ?? 65
  return {
    summary: `${opp.agency} requires specialized services in ${
      opp.naicsDescription || 'technology'
    }. This is a competitive small-business set-aside acquisition with a firm fixed-price structure.`,
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
    missingCertifications:
      score < 60 ? ['FedRAMP authorization may be required', 'Verify set-aside eligibility'] : [],
    estimatedContractValue: 'Not specified in presolicitation',
    draftProposal: `AliceLabs LLC is a Wyoming-registered technology firm specializing in artificial intelligence, cloud infrastructure, and custom software development. We respond to ${opp.solicitationNumber} with a proven track record of delivering scalable, secure, and compliant federal IT solutions. Our team brings deep expertise in the exact capability areas outlined in this solicitation, combining agile delivery with rigorous quality assurance. We are committed to mission success for ${opp.agency} and will leverage our full suite of AI-driven tooling to exceed every performance requirement within budget and on schedule.`,
    analyzedAt: new Date().toISOString(),
  }
}
