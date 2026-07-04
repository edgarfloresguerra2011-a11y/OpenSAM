# Security Policy

OpenSAM takes security seriously. This document explains how to report
vulnerabilities and what hardening measures are already in place.

## Reporting a Vulnerability

If you discover a security issue, **please do NOT open a public GitHub issue**.

Instead, email **security@alicelabs.site** with:

1. A description of the issue and its potential impact.
2. Steps to reproduce (PoC, screenshots, or HTTP traces).
3. Any suggested remediation.

We will acknowledge receipt within 72 hours and aim to ship a fix within
30 days for high-severity issues. Reporters will be credited in the release
notes (unless they prefer to remain anonymous).

## Scope

This policy covers the code in this repository, including:

- Frontend (`src/`)
- Supabase Edge Functions (`supabase/functions/`)
- Database migrations (`supabase/migrations/`)

It does **not** cover:

- Third-party dependencies (report to upstream maintainers).
- Vulnerabilities in your own Supabase project configuration.
- Issues requiring privileged access to a production deployment.

## Hardening checklist (already implemented)

The codebase applies the following measures:

| Area             | Measure                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API keys         | `GEMINI_API_KEY` and `SAM_GOV_API_KEY` live only on the server (Supabase secrets). The browser never sees them.                                                                                                            |
| RLS              | Every table has Row Level Security enabled with policies scoped to `auth.uid()`. The legacy `using (true)` policies were dropped in migration `002`.                                                                       |
| PII at rest      | `company_profiles.ein` and `.uei` are encrypted via Supabase Vault + pgsodium (migration `003`). The plaintext columns are dropped; a `SECURITY DEFINER` function with `service_role`-only access decrypts them on demand. |
| Auth             | Supabase Auth with PKCE flow, email confirmation configurable, no anonymous sign-ins.                                                                                                                                      |
| CORS             | Edge Functions return per-origin `Access-Control-Allow-Origin` controlled by the `CORS_ALLOW_ORIGIN` secret (defaults to `*` only in dev).                                                                                 |
| JWT verification | `verify_jwt = true` on every Edge Function — invalid or expired tokens are rejected before the function body runs.                                                                                                         |
| Audit log        | Every AI analysis run is recorded in `audit_log` with `user_id`, `entity_id`, and `metadata` (migration `004`).                                                                                                            |
| Soft delete      | Saved opportunities are soft-deleted (`deleted_at`) so analysis history is preserved.                                                                                                                                      |
| Dependencies     | `npm audit` runs in CI. Renovate is recommended (see `CONTRIBUTING.md`).                                                                                                                                                   |
| Secret scanning  | `.gitignore` blocks `.env*`; `.env.example` ships with placeholders only.                                                                                                                                                  |

## Hardening checklist (recommended for production deployments)

If you deploy OpenSAM to production, also:

1. Set `CORS_ALLOW_ORIGIN` to your exact production origin (no wildcard).
2. Enable email confirmation in Supabase Auth.
3. Configure CAPTCHA on the auth endpoints (Supabase supports hCaptcha).
4. Set up Supabase rate limiting on Edge Functions.
5. Add a Sentry / Datadog integration for frontend + function errors.
6. Enable database backups in Supabase (Point-in-Time Recovery on Pro+ plans).
7. For federal customers: deploy in AWS GovCloud or Azure Government with
   FedRAMP-authorized services (Supabase is **not** FedRAMP-authorized).
8. Review the SAM.gov API Terms of Use at
   https://open.gsa.gov/api/api-terms-of-use/ before any commercial use.
