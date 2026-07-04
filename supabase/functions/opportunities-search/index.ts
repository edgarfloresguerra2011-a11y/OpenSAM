// Edge Function: opportunities-search
// Proxies the SAM.gov Public Opportunities API server-side so the API key
// never reaches the browser. Returns opportunities in the app's domain shape.

import { corsHeaders, handleOptions, jsonError, jsonOk } from '../_shared/cors.ts'
import { requireUser, AuthError } from '../_shared/auth.ts'
import { searchSamGov, SamError } from '../_shared/sam-gov.ts'
import type { SamOpportunityRaw } from '../_shared/sam-gov.ts'

interface SearchRequest {
  query?: string
  naicsCode?: string
  agency?: string
  noticeType?: string
  deadlineDays?: number | null
  page?: number
  limit?: number
}

interface AppOpportunity {
  id: string
  title: string
  solicitationNumber: string
  agency: string
  subAgency?: string
  noticeType: string
  naicsCode: string
  naicsDescription: string
  postedDate: string
  responseDeadline: string
  placeOfPerformance: string
  setAside?: string
  status: string
  description: string
  pdfUrl?: string
}

function mapOpportunity(raw: SamOpportunityRaw): AppOpportunity {
  return {
    id: raw.noticeId,
    title: raw.title,
    solicitationNumber: raw.solicitationNumber ?? '—',
    agency:
      raw.organizationHierarchy?.l1Name ??
      raw.fullParentPathName?.split('.')[0] ??
      'Unknown Agency',
    subAgency: raw.organizationHierarchy?.l2Name,
    noticeType: raw.type ?? 'Other',
    naicsCode: raw.naicsCode ?? '',
    naicsDescription: '',
    postedDate: raw.postedDate,
    responseDeadline: raw.responseDeadLine ?? '',
    placeOfPerformance: raw.placeOfPerformance
      ? `${raw.placeOfPerformance.city?.name ?? ''}, ${raw.placeOfPerformance.state?.code ?? ''}`
      : 'Various',
    setAside: raw.typeOfSetAsideDescription,
    status: raw.active === 'Yes' ? 'active' : 'closed',
    description: raw.description ?? '',
    pdfUrl: raw.uiLink,
  }
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
  let body: SearchRequest
  try {
    body = await req.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  // ── Build SAM.gov params ──────────────────────────────────────────────
  const deadlineFrom = body.deadlineDays ? new Date().toISOString().split('T')[0] : undefined
  const deadlineTo = body.deadlineDays
    ? new Date(Date.now() + body.deadlineDays * 86_400_000).toISOString().split('T')[0]
    : undefined

  // ── Call SAM.gov ──────────────────────────────────────────────────────
  try {
    const { opportunitiesData, totalRecords } = await searchSamGov({
      q: body.query,
      naicsCode: body.naicsCode,
      organizationName: body.agency,
      noticeType: body.noticeType,
      deadlineFrom,
      deadlineTo,
      limit: body.limit ?? 25,
      offset: (body.page ?? 0) * (body.limit ?? 25),
    })

    void auth // auth.userId available for per-user rate limiting if needed

    return jsonOk({
      data: opportunitiesData.map(mapOpportunity),
      total: totalRecords,
    })
  } catch (err) {
    if (err instanceof SamError) {
      return jsonError(err.message, err.status)
    }
    console.error('Unexpected error in opportunities-search:', err)
    return jsonError('Internal server error', 500)
  }
})

// Re-export to satisfy strict-mode unused-import warnings.
export { corsHeaders }
