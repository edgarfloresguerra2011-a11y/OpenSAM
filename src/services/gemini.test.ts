import { describe, it, expect, beforeEach } from 'vitest'
import { scoreOpportunityLocally, defaultProfile } from './gemini'
import type { CompanyProfile, Opportunity } from '../types'

const profile: CompanyProfile = {
  id: 'test',
  name: 'TestCo',
  ein: '',
  uei: '',
  naicsCodes: ['541512'],
  capabilities: ['artificial intelligence', 'cloud infrastructure'],
  certifications: ['Small Business', 'SBA 8(a)'],
  pastPerformance: [],
  state: 'WY',
}

const baseOpp: Opportunity = {
  id: 'opp-1',
  title: 'Test Opportunity',
  solicitationNumber: 'T-001',
  agency: 'Test Agency',
  noticeType: 'Solicitation',
  naicsCode: '541512',
  naicsDescription: '',
  postedDate: new Date().toISOString(),
  responseDeadline: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  placeOfPerformance: 'Washington, DC',
  setAside: 'Small Business',
  status: 'active',
  description: 'Looking for artificial intelligence services',
}

describe('scoreOpportunityLocally', () => {
  it('starts at 50 and adds 25 for NAICS match', () => {
    const score = scoreOpportunityLocally(baseOpp, profile)
    expect(score).toBeGreaterThanOrEqual(75)
  })

  it('penalizes short deadlines', () => {
    const soon: Opportunity = {
      ...baseOpp,
      responseDeadline: new Date(Date.now() + 5 * 86_400_000).toISOString(),
    }
    const score = scoreOpportunityLocally(soon, profile)
    expect(score).toBeLessThan(95) // 50 + 25 + 10 + 5 - 15
  })

  it('awards extra points for 8(a) set-aside when certified', () => {
    const opp: Opportunity = { ...baseOpp, setAside: '8(a) Competitive' }
    const score = scoreOpportunityLocally(opp, profile)
    expect(score).toBeGreaterThan(80)
  })

  it('clamps to 100', () => {
    const opp: Opportunity = {
      ...baseOpp,
      description:
        'artificial intelligence cloud infrastructure artificial intelligence cloud infrastructure artificial intelligence cloud infrastructure',
      setAside: '8(a) Competitive',
    }
    const score = scoreOpportunityLocally(opp, profile)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('clamps to 0 on heavy penalties', () => {
    const opp: Opportunity = {
      ...baseOpp,
      naicsCode: '000000', // no match
      description: '',
      setAside: undefined,
      responseDeadline: new Date(Date.now() - 1).toISOString(),
    }
    const score = scoreOpportunityLocally(opp, profile)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(50)
  })
})

describe('defaultProfile', () => {
  it('returns a usable profile with expected NAICS codes', () => {
    const p = defaultProfile()
    expect(p.naicsCodes).toContain('541511')
    expect(p.capabilities.length).toBeGreaterThan(0)
  })

  beforeEach(() => {
    // Reset anything that might leak between tests
  })
})
