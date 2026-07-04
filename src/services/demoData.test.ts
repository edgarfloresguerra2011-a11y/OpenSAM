import { describe, it, expect } from 'vitest'
import { getDemoData } from './demoData'
import type { FilterState } from '../types'

describe('getDemoData', () => {
  it('returns a non-empty list of opportunities', () => {
    const result = getDemoData()
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.total).toBe(result.data.length)
  })

  it('every opportunity has an id, title, agency and status', () => {
    const result = getDemoData()
    for (const opp of result.data) {
      expect(opp.id).toBeTruthy()
      expect(opp.title).toBeTruthy()
      expect(opp.agency).toBeTruthy()
      expect(['active', 'closed', 'awarded', 'cancelled']).toContain(opp.status)
    }
  })

  it('accepts filter argument without error', () => {
    const filters: Partial<FilterState> = { naicsCode: '541512' }
    const result = getDemoData(filters)
    expect(result.data.length).toBeGreaterThan(0)
  })
})
