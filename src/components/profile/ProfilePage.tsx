import { useEffect, useState, type FormEvent } from 'react'
import { Building2, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { TopBar } from '../layout/Sidebar'
import { getCompanyProfile, upsertCompanyProfile } from '../../services/database'
import { useAuth } from '../../lib/auth'
import type { CompanyProfile } from '../../types'

const EMPTY: CompanyProfile = {
  id: '',
  name: '',
  ein: '',
  uei: '',
  naicsCodes: [],
  capabilities: [],
  certifications: [],
  pastPerformance: [],
  state: '',
}

function csvToArr(s: string): string[] {
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY)
  const [naicsInput, setNaicsInput] = useState('')
  const [capsInput, setCapsInput] = useState('')
  const [certsInput, setCertsInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    getCompanyProfile()
      .then((p) => {
        if (cancelled || !p) return
        setProfile(p)
        setNaicsInput(p.naicsCodes.join(', '))
        setCapsInput(p.capabilities.join(', '))
        setCertsInput(p.certifications.join(', '))
      })
      .catch(() => {
        /* ignore — empty form is fine */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const next: CompanyProfile = {
        ...profile,
        naicsCodes: csvToArr(naicsInput),
        capabilities: csvToArr(capsInput),
        certifications: csvToArr(certsInput),
      }
      await upsertCompanyProfile(next)
      setProfile(next)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar title="Company Profile" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="card animate-pulse space-y-3 p-6" aria-busy="true">
              <div className="h-4 w-1/4 rounded bg-slate-100" />
              <div className="h-9 rounded bg-slate-100" />
              <div className="h-4 w-1/4 rounded bg-slate-100" />
              <div className="h-9 rounded bg-slate-100" />
              <div className="mt-4 h-9 w-1/3 rounded bg-slate-100" />
            </div>
          ) : (
            <form onSubmit={onSubmit} className="card space-y-5 p-6">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <p className="text-sm font-medium">
                  Profile {user?.email ? `for ${user.email}` : ''}
                </p>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">Company name</span>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input mt-1"
                  required
                  aria-label="Company name"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    EIN <span className="text-slate-400">(encrypted at rest)</span>
                  </span>
                  <input
                    type="text"
                    value={profile.ein}
                    onChange={(e) => setProfile({ ...profile, ein: e.target.value })}
                    className="input mt-1"
                    placeholder="XX-XXXXXXX"
                    aria-label="Employer Identification Number"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    UEI <span className="text-slate-400">(encrypted at rest)</span>
                  </span>
                  <input
                    type="text"
                    value={profile.uei}
                    onChange={(e) => setProfile({ ...profile, uei: e.target.value })}
                    className="input mt-1"
                    placeholder="12-character UEI"
                    aria-label="Unique Entity Identifier"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">State</span>
                <input
                  type="text"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="input mt-1"
                  placeholder="WY"
                  maxLength={2}
                  aria-label="State"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  NAICS codes <span className="text-slate-400">(comma-separated)</span>
                </span>
                <input
                  type="text"
                  value={naicsInput}
                  onChange={(e) => setNaicsInput(e.target.value)}
                  className="input mt-1"
                  placeholder="541511, 541512, 518210"
                  aria-label="NAICS codes"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Capabilities <span className="text-slate-400">(comma-separated)</span>
                </span>
                <textarea
                  value={capsInput}
                  onChange={(e) => setCapsInput(e.target.value)}
                  className="input mt-1 min-h-[80px]"
                  placeholder="artificial intelligence, machine learning, cloud infrastructure"
                  aria-label="Capabilities"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-slate-600">
                  Certifications <span className="text-slate-400">(comma-separated)</span>
                </span>
                <input
                  type="text"
                  value={certsInput}
                  onChange={(e) => setCertsInput(e.target.value)}
                  className="input mt-1"
                  placeholder="Small Business, 8(a), WOSB, HUBZone"
                  aria-label="Certifications"
                />
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  {error}
                </div>
              )}

              {saved && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  Profile saved.
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Save profile
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
