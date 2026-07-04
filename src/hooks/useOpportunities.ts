import { useState, useEffect, useCallback } from 'react'
import { searchOpportunities } from '../services/samApi'
import { scoreOpportunityLocally, defaultProfile } from '../services/gemini'
import { getCompanyProfile } from '../services/database'
import type { CompanyProfile, DashboardStats, FilterState, Opportunity } from '../types'

const DEFAULT_FILTERS: FilterState = {
  query: '',
  naicsCode: '',
  agency: '',
  noticeType: '',
  setAside: '',
  deadlineDays: null,
  matchScore: '',
}

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile())

  // Load profile once
  useEffect(() => {
    let cancelled = false
    getCompanyProfile()
      .then((p) => {
        if (!cancelled && p) setProfile(p)
      })
      .catch(() => {
        /* falls back to defaultProfile */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchOpportunities(filters, page)
      const scored = result.data.map((opp) => ({
        ...opp,
        matchScore: opp.matchScore ?? scoreOpportunityLocally(opp, profile),
      }))
      setOpportunities(scored)
      setTotal(result.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }, [filters, page, profile])

  useEffect(() => {
    load()
  }, [load])

  const stats: DashboardStats = {
    totalOpportunities: total || opportunities.length,
    highMatch: opportunities.filter((o) => (o.matchScore ?? 0) >= 70).length,
    mediumMatch: opportunities.filter((o) => (o.matchScore ?? 0) >= 40 && (o.matchScore ?? 0) < 70)
      .length,
    savedOpportunities: 0,
    deadlinesSoon: opportunities.filter((o) => {
      const days = (new Date(o.responseDeadline).getTime() - Date.now()) / 86_400_000
      return days >= 0 && days <= 7
    }).length,
  }

  const applyFilters = (f: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...f }))
    setPage(0)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setPage(0)
  }

  return {
    opportunities,
    filters,
    applyFilters,
    resetFilters,
    loading,
    error,
    stats,
    total,
    page,
    setPage,
    refresh: load,
  }
}
