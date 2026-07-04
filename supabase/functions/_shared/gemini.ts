// Gemini client wrapper (server-side only).
// Uses the new unified @google/genai SDK (the legacy @google/generative-ai
// package is deprecated). Configured for Gemini 1.5 Pro (2M token context).

import { GoogleGenAI, Type } from '@google/genai';

export interface BidAnalysis {
  summary: string;
  viabilityScore: number;
  requirements: string[];
  risks: string[];
  missingCertifications: string[];
  estimatedContractValue: string;
  draftProposal: string;
  analyzedAt: string;
}

export interface OpportunityForAnalysis {
  title: string;
  agency: string;
  solicitationNumber: string;
  naicsCode: string;
  setAside?: string;
  responseDeadline: string;
  placeOfPerformance: string;
  description: string;
}

export interface CompanyProfileForAnalysis {
  name: string;
  state: string;
  uei?: string;
  naicsCodes: string[];
  capabilities: string[];
  certifications: string[];
  pastPerformance: string[];
}

// Strict JSON schema — Gemini will return exactly this shape.
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: '2-sentence plain-English summary of what the agency needs' },
    viabilityScore: { type: Type.INTEGER, minimum: 0, maximum: 100, description: 'Viability score from 0 to 100' },
    requirements: { type: Type.ARRAY, items: { type: Type.STRING }, description: '4-6 critical requirements from the solicitation' },
    risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 risks or gaps for our company' },
    missingCertifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Required certs we do not have' },
    estimatedContractValue: { type: Type.STRING, description: 'Estimate like "$500K–$2M" or "Not specified"' },
    draftProposal: { type: Type.STRING, description: 'Compelling 150-word opening paragraph for our technical proposal' },
  },
  required: [
    'summary',
    'viabilityScore',
    'requirements',
    'risks',
    'missingCertifications',
    'estimatedContractValue',
    'draftProposal',
  ],
} as const;

function buildPrompt(opp: OpportunityForAnalysis, profile: CompanyProfileForAnalysis): string {
  return `You are a senior federal contracting specialist at ${profile.name}, a US-registered IT and AI company.

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
Analyze this opportunity and respond with the JSON object described.`;
}

let cachedClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey || apiKey.startsWith('AIzaSy...')) {
    throw new GeminiError('Gemini API key not configured on the server', 503);
  }
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

export async function analyzeOpportunity(
  opp: OpportunityForAnalysis,
  profile: CompanyProfileForAnalysis,
): Promise<BidAnalysis> {
  const client = getClient();

  const result = await client.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: buildPrompt(opp, profile),
    config: {
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  const text = result.text ?? '';
  if (!text) throw new GeminiError('Gemini returned an empty response', 502);

  try {
    const parsed = JSON.parse(text) as Omit<BidAnalysis, 'analyzedAt'>;
    return {
      ...parsed,
      analyzedAt: new Date().toISOString(),
    };
  } catch {
    throw new GeminiError('Gemini returned non-JSON output', 502);
  }
}

export class GeminiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
