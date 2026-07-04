import { useEffect, useRef, useState } from 'react'
import type { Opportunity } from '../../types'
import { useAnalyzer } from '../../hooks/useAnalyzer'
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  opportunity: Opportunity
  onClose: () => void
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-red-600'
  const bgColor = score >= 70 ? 'bg-emerald-50' : score >= 40 ? 'bg-amber-50' : 'bg-red-50'
  return (
    <div
      className={`flex h-20 w-20 flex-col items-center justify-center rounded-full ${bgColor}`}
      role="img"
      aria-label={`Viability score ${score} out of 100`}
    >
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] font-medium text-slate-500">Viability</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can fail in non-secure contexts — silently ignore.
    }
  }
  return (
    <button
      onClick={copy}
      className="btn-secondary px-2 py-1 text-xs"
      aria-label={copied ? 'Copied to clipboard' : 'Copy draft proposal to clipboard'}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function AnalyzerPanel({ opportunity: opp, onClose }: Props) {
  const { analysis, loading, error, analyze } = useAnalyzer()
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus the close button on mount, and trap Escape to close.
  useEffect(() => {
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analyzer-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close analysis panel"
        tabIndex={-1}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between border-b border-slate-200 p-6">
          <div className="min-w-0 flex-1 pr-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
              {opp.agency}
            </p>
            <h2 id="analyzer-title" className="text-base font-semibold leading-snug text-slate-900">
              {opp.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Sol # {opp.solicitationNumber}</p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Close panel"
          >
            <X className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {/* Meta strip */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-6 gap-y-2 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">
          <span>
            <b className="text-slate-700">NAICS:</b> {opp.naicsCode}
          </span>
          <span>
            <b className="text-slate-700">Deadline:</b>{' '}
            {opp.responseDeadline ? format(new Date(opp.responseDeadline), 'MMM d, yyyy') : '—'}
          </span>
          <span>
            <b className="text-slate-700">Type:</b> {opp.noticeType}
          </span>
          {opp.setAside && <span className="badge-blue">{opp.setAside}</span>}
          {opp.pdfUrl && (
            <a
              href={opp.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-brand-600 hover:underline"
              aria-label="Open opportunity on SAM.gov (new tab)"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" /> SAM.gov
            </a>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Description */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Agency Description
            </h3>
            <p className="text-sm leading-relaxed text-slate-700">{opp.description}</p>
          </div>

          {/* Analyze CTA */}
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-slate-200 py-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <Zap className="h-6 w-6 text-brand-600" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-800">Analyze with OpenSAM AI</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Get viability score, risks &amp; a draft proposal in seconds
                </p>
              </div>
              <button onClick={() => analyze(opp)} className="btn-primary">
                <Zap className="h-4 w-4" aria-hidden="true" /> Run Analysis
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              className="flex flex-col items-center justify-center space-y-3 py-12"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" aria-hidden="true" />
              <p className="text-sm text-slate-600">Gemini 1.5 Pro is reading the solicitation…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-5">
              {/* Score + Summary */}
              <div className="flex items-start gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <ScoreRing score={analysis.viabilityScore} />
                <div className="flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Executive Summary
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
                  {analysis.estimatedContractValue && (
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span className="text-xs font-semibold text-emerald-700">
                        Est. Value: {analysis.estimatedContractValue}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />{' '}
                  Critical Requirements
                </h3>
                <ul className="space-y-1.5">
                  {analysis.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400"
                        aria-hidden="true"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Risks */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> Risks
                  &amp; Gaps
                </h3>
                <ul className="space-y-1.5">
                  {analysis.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400"
                        aria-hidden="true"
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Missing certs */}
              {analysis.missingCertifications.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <Shield className="h-3.5 w-3.5 text-red-500" aria-hidden="true" /> Missing
                    Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingCertifications.map((c, i) => (
                      <span key={i} className="badge-red">
                        {c}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Draft proposal */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    <FileText className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" /> Draft
                    Proposal Opening
                  </h3>
                  <CopyButton text={analysis.draftProposal} />
                </div>
                <div className="rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm italic leading-relaxed text-slate-700">
                  &ldquo;{analysis.draftProposal}&rdquo;
                </div>
              </section>

              <p className="text-center text-[10px] text-slate-400">
                Analyzed {format(new Date(analysis.analyzedAt), 'MMM d, yyyy · h:mm a')} · Powered
                by Gemini 1.5 Pro
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
