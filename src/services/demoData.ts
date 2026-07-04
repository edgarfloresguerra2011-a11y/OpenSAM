// Demo dataset for local development without API keys.
// Returned as-is when isDemoMode === true.

import type { FilterState, Opportunity } from '../types'

export function getDemoData(_filters?: Partial<FilterState>): {
  data: Opportunity[]
  total: number
} {
  const DEMO: Opportunity[] = [
    {
      id: 'demo-001',
      title: 'AI-Powered Data Processing Services for Federal Agency',
      solicitationNumber: 'DOS-2026-AI-0041',
      agency: 'Department of State',
      subAgency: 'Bureau of Information Resource Management',
      noticeType: 'Solicitation',
      naicsCode: '541512',
      naicsDescription: 'Computer Systems Design Services',
      postedDate: '2026-03-20T00:00:00Z',
      responseDeadline: '2026-04-30T17:00:00Z',
      placeOfPerformance: 'Washington, DC',
      setAside: 'Small Business',
      status: 'active',
      description:
        'The Department of State requires AI-powered data processing services including NLP, document classification, and automated report generation for diplomatic communications.',
      matchScore: 89,
      pdfUrl: 'https://sam.gov/opp/demo-001',
    },
    {
      id: 'demo-002',
      title: 'Cloud Infrastructure Modernization — USDA',
      solicitationNumber: 'USDA-2026-CLD-0088',
      agency: 'Department of Agriculture',
      subAgency: 'Farm Service Agency',
      noticeType: 'Solicitation',
      naicsCode: '518210',
      naicsDescription: 'Data Processing, Hosting, and Related Services',
      postedDate: '2026-03-15T00:00:00Z',
      responseDeadline: '2026-04-14T17:00:00Z',
      placeOfPerformance: 'Kansas City, MO',
      setAside: 'Total Small Business',
      status: 'active',
      description:
        'Migration of legacy on-prem workloads to AWS GovCloud. Contractor must hold FedRAMP authorization and have demonstrated cloud migration experience.',
      matchScore: 72,
      pdfUrl: 'https://sam.gov/opp/demo-002',
    },
    {
      id: 'demo-003',
      title: 'Cybersecurity Assessment & Penetration Testing',
      solicitationNumber: 'DHS-2026-CSEC-0012',
      agency: 'Department of Homeland Security',
      subAgency: 'CISA',
      noticeType: 'Sources Sought',
      naicsCode: '541519',
      naicsDescription: 'Other Computer Related Services',
      postedDate: '2026-03-25T00:00:00Z',
      responseDeadline: '2026-04-08T17:00:00Z',
      placeOfPerformance: 'Remote / Various',
      setAside: 'SDVOSB',
      status: 'active',
      description:
        'DHS/CISA seeks qualified vendors to provide comprehensive cybersecurity risk assessments, red-team exercises, and penetration testing for critical infrastructure systems.',
      matchScore: 55,
      pdfUrl: 'https://sam.gov/opp/demo-003',
    },
    {
      id: 'demo-004',
      title: 'Software Development — Benefits Administration Portal',
      solicitationNumber: 'SSA-2026-SW-0099',
      agency: 'Social Security Administration',
      noticeType: 'Solicitation',
      naicsCode: '541511',
      naicsDescription: 'Custom Computer Programming Services',
      postedDate: '2026-03-18T00:00:00Z',
      responseDeadline: '2026-05-01T17:00:00Z',
      placeOfPerformance: 'Baltimore, MD',
      setAside: '8(a) Competitive',
      status: 'active',
      description:
        'Full-stack development of a modernized benefits administration portal using React, Node.js, and PostgreSQL. Accessibility (WCAG 2.1 AA) compliance required.',
      matchScore: 91,
      pdfUrl: 'https://sam.gov/opp/demo-004',
    },
    {
      id: 'demo-005',
      title: 'IT Support Services — DOD Military Installations',
      solicitationNumber: 'DOD-2026-IT-0221',
      agency: 'Department of Defense',
      subAgency: 'Defense Information Systems Agency',
      noticeType: 'Presolicitation',
      naicsCode: '811212',
      naicsDescription: 'Computer and Office Machine Repair and Maintenance',
      postedDate: '2026-03-10T00:00:00Z',
      responseDeadline: '2026-04-10T17:00:00Z',
      placeOfPerformance: 'Fort Meade, MD',
      setAside: 'HUBZone',
      status: 'active',
      description:
        'Tier 1-3 IT helpdesk support, hardware maintenance, and network troubleshooting across 12 military installations. Secret clearance required for key personnel.',
      matchScore: 34,
      pdfUrl: 'https://sam.gov/opp/demo-005',
    },
    {
      id: 'demo-006',
      title: 'Machine Learning Model Training & MLOps Pipeline',
      solicitationNumber: 'NIH-2026-ML-0034',
      agency: 'National Institutes of Health',
      subAgency: 'National Cancer Institute',
      noticeType: 'Solicitation',
      naicsCode: '541715',
      naicsDescription: 'Research and Development in the Physical Sciences',
      postedDate: '2026-03-22T00:00:00Z',
      responseDeadline: '2026-04-22T17:00:00Z',
      placeOfPerformance: 'Bethesda, MD',
      setAside: 'Women-Owned Small Business',
      status: 'active',
      description:
        'Design, train and deploy ML models for cancer biomarker detection. Requires experience with Python, TensorFlow/PyTorch, and HIPAA-compliant cloud environments.',
      matchScore: 78,
      pdfUrl: 'https://sam.gov/opp/demo-006',
    },
  ]

  return { data: DEMO, total: DEMO.length }
}
