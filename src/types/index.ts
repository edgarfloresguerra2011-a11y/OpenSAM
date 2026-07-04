// Core types for Alice SAM Agent

export type OpportunityStatus = 'active' | 'closed' | 'awarded' | 'cancelled'
export type MatchScore = 'high' | 'medium' | 'low'
export type NoticeType = 'Solicitation' | 'Award' | 'Presolicitation' | 'Sources Sought' | 'Other'

export interface Opportunity {
  id: string
  title: string
  solicitationNumber: string
  agency: string
  subAgency?: string
  noticeType: NoticeType
  naicsCode: string
  naicsDescription: string
  postedDate: string
  responseDeadline: string
  placeOfPerformance: string
  setAside?: string
  status: OpportunityStatus
  description: string
  pdfUrl?: string
  matchScore?: number // 0-100 — calculated by AI (from srt-fbo-scraper logic)
  aiAnalysis?: BidAnalysis
  savedAt?: string
}

export interface BidAnalysis {
  summary: string
  viabilityScore: number // 0-100
  requirements: string[]
  risks: string[]
  draftProposal: string
  missingCertifications: string[]
  estimatedContractValue?: string
  analyzedAt: string
}

export interface CompanyProfile {
  id: string
  name: string
  ein?: string
  uei?: string
  naicsCodes: string[]
  capabilities: string[]
  certifications: string[] // SBA 8(a), HUBZone, SDVOSB, WOSB…
  pastPerformance: string[]
  state: string
}

export interface DashboardStats {
  totalOpportunities: number
  highMatch: number
  mediumMatch: number
  savedOpportunities: number
  deadlinesSoon: number // closing in next 7 days
}

export interface FilterState {
  query: string
  naicsCode: string
  agency: string
  noticeType: NoticeType | ''
  setAside: string
  deadlineDays: number | null // 7, 14, 30, null=all
  matchScore: MatchScore | ''
}

// SAM.gov Public API shape (simplified from openapi spec)
export interface SamOpportunityRaw {
  noticeId: string
  title: string
  solicitationNumber: string
  fullParentPathName: string
  postedDate: string
  type: string
  baseType: string
  archiveType: string
  archiveDate: string
  typeOfSetAsideDescription: string
  responseDeadLine: string
  naicsCode: string
  naicsCodes: string[]
  classificationCode: string
  active: string
  award?: { date: string; amount: string; awardee: { name: string } }
  pointOfContact: Array<{
    fax: string
    type: string
    email: string
    phone: string
    title: string
    fullName: string
  }>
  description: string
  organizationHierarchy: { l1Name: string; l2Name: string }
  placeOfPerformance?: { city: { name: string }; state: { code: string } }
  links: Array<{ rel: string; href: string }>
  uiLink: string
}
