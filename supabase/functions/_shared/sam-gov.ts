// SAM.gov API client (server-side only).
// Keeps the API key on the server and centralizes rate-limit / retry logic.

export interface SamSearchParams {
  q?: string;
  naicsCode?: string;
  organizationName?: string;
  noticeType?: string;
  deadlineFrom?: string; // YYYY-MM-DD
  deadlineTo?: string; // YYYY-MM-DD
  limit?: number;
  offset?: number;
}

export interface SamOpportunityRaw {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAsideDescription: string;
  responseDeadLine: string;
  naicsCode: string;
  naicsCodes: string[];
  classificationCode: string;
  active: string;
  award?: { date: string; amount: string; awardee: { name: string } };
  pointOfContact: Array<{ fax: string; type: string; email: string; phone: string; title: string; fullName: string }>;
  description: string;
  organizationHierarchy: { l1Name: string; l2Name: string };
  placeOfPerformance?: { city: { name: string }; state: { code: string } };
  links: Array<{ rel: string; href: string }>;
  uiLink: string;
}

const SAM_BASE = 'https://api.sam.gov/opportunities/v2/search';

export async function searchSamGov(
  params: SamSearchParams,
): Promise<{ opportunitiesData: SamOpportunityRaw[]; totalRecords: number }> {
  const apiKey = Deno.env.get('SAM_GOV_API_KEY');
  if (!apiKey || apiKey.startsWith('your-')) {
    throw new SamError('SAM.gov API key not configured on the server', 503);
  }

  const url = new URL(SAM_BASE);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('limit', String(params.limit ?? 25));
  url.searchParams.set('offset', String(params.offset ?? 0));
  url.searchParams.set('active', 'Yes');
  if (params.q) url.searchParams.set('q', params.q);
  if (params.naicsCode) url.searchParams.set('naicsCode', params.naicsCode);
  if (params.organizationName) url.searchParams.set('organizationName', params.organizationName);
  if (params.noticeType) url.searchParams.set('noticeType', params.noticeType);
  if (params.deadlineFrom) url.searchParams.set('rdlfrom', params.deadlineFrom);
  if (params.deadlineTo) url.searchParams.set('rdlto', params.deadlineTo);

  // Retry with exponential backoff for transient 5xx / 429.
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.status === 429 || res.status >= 500) {
        throw new Error(`SAM.gov transient error: ${res.status}`);
      }
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new SamError(`SAM.gov API error: ${res.status} ${body.slice(0, 200)}`, res.status);
      }

      const json = await res.json();
      return {
        opportunitiesData: json.opportunitiesData ?? [],
        totalRecords: json.totalRecords ?? 0,
      };
    } catch (err) {
      if (err instanceof SamError && err.status >= 400 && err.status < 500 && err.status !== 429) {
        // Non-retryable client error
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      // Exponential backoff: 200ms, 400ms, 800ms
      await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
    }
  }

  throw new SamError(
    `SAM.gov request failed after retries: ${lastError?.message ?? 'unknown error'}`,
    502,
  );
}

export class SamError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
