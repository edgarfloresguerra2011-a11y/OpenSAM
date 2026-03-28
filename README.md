# OpenSAM — Autonomous Federal AI Agent

OpenSAM is a professional, B2B SaaS platform built by [AliceLabs](https://alicelabs.site) designed to automate the discovery, analysis, and proposal drafting for government contracts from **SAM.gov**.

Built for speed, reliability, and technical advantage in the federal contracting space.

## 🚀 Key Features

- **Automated Discovery**: Real-time integration with the SAM.gov Public API.
- **AI-Powered Analysis**: Leverages **Gemini 1.5 Pro** (2M token window) to read full RFP/Solicitation documents.
- **Smart Scoring**: Automated viability assessment (0-100) based on company capabilities and NAICS alignment.
- **Proposal Drafting**: Generates professional technical proposal openings in seconds.
- **Engagement CRM**: Save and track opportunities within a high-performance database.

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS (Professional HubSpot-inspired UI)
- **Database / Auth**: Supabase (PostgreSQL)
- **AI Core**: Google Gemini 1.5 Pro API
- **Data Source**: GSA SAM.gov API

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Supabase Project
- SAM.gov API Key
- Google AI Studio API Key (Gemini)

### 2. Configuration
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_SAM_GOV_API_KEY=your-sam-gov-api-key
```

### 3. Database Setup
Execute the SQL migration located in `supabase/migrations/001_schema.sql` within your Supabase SQL Editor.

### 4. Installation & Run
```bash
npm install
npm run dev
```

## 📜 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by AliceLabs LLC.
