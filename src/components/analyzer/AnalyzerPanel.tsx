import { useState } from 'react'
import type { Opportunity, BidAnalysis } from '../../types'
import { useAnalyzer } from '../../hooks/useAnalyzer'
import {
  X, Zap, CheckCircle2, AlertTriangle, FileText, Shield,
  TrendingUp, ExternalLink, Copy, Check, Loader2
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
    <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${bgColor}`}>
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-slate-500 font-medium">Viability</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="btn-secondary py-1 px-2 text-xs">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function AnalyzerPanel({ opportunity: opp, onClose }: Props) {
  const { analysis, loading, error, analyze } = useAnalyzer()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{opp.agency}</p>
            <h2 className="text-base font-semibold text-slate-900 leading-snug">{opp.title}</h2>
            <p className="text-xs text-slate-500 mt-1">Sol # {opp.solicitationNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Meta strip */}
        <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex-shrink-0 flex-wrap gap-y-2">
          <span><b className="text-slate-700">NAICS:</b> {opp.naicsCode}</span>
          <span><b className="text-slate-700">Deadline:</b> {opp.responseDeadline ? format(new Date(opp.responseDeadline), 'MMM d, yyyy') : '—'}</span>
          <span><b className="text-slate-700">Type:</b> {opp.noticeType}</span>
          {opp.setAside && <span className="badge-blue">{opp.setAside}</span>}
          <a href={opp.pdfUrl} target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1 text-brand-600 hover:underline">
            <ExternalLink className="w-3 h-3" /> SAM.gov
          </a>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Agency Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{opp.description}</p>
          </div>

          {/* Analyze CTA */}
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl space-y-3">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-800">Analyze with Alice AI</p>
                <p className="text-xs text-slate-500 mt-0.5">Get viability score, risks & a draft proposal in seconds</p>
              </div>
              <button onClick={() => analyze(opp)} className="btn-primary">
                <Zap className="w-4 h-4" /> Run Analysis
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-sm text-slate-600">Gemini 1.5 Pro is reading the solicitation...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-5">
              {/* Score + Summary */}
              <div className="flex items-start gap-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <ScoreRing score={analysis.viabilityScore} />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Executive Summary</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{analysis.summary}</p>
                  {analysis.estimatedContractValue && (
                    <div className="mt-3 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Est. Value: {analysis.estimatedContractValue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Critical Requirements
                </h3>
                <ul className="space-y-1.5">
                  {analysis.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Risks & Gaps
                </h3>
                <ul className="space-y-1.5">
                  {analysis.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missing certs */}
              {analysis.missingCertifications.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-red-500" /> Missing Certifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingCertifications.map((c, i) => (
                      <span key={i} className="badge-red">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Draft proposal */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-brand-500" /> Draft Proposal Opening
                  </h3>
                  <CopyButton text={analysis.draftProposal} />
                </div>
                <div className="p-4 bg-brand-50 border border-brand-100 rounded-lg text-sm text-slate-700 leading-relaxed italic">
                  "{analysis.draftProposal}"
                </div>
              </div>

              <p className="text-center text-[10px] text-slate-400">
                Analyzed {format(new Date(analysis.analyzedAt), 'MMM d, yyyy · h:mm a')} · Powered by Gemini 1.5 Pro
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
