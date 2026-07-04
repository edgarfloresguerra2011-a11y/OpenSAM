# Contributing to OpenSAM

Thanks for your interest in making OpenSAM better! This guide covers setup,
conventions, and the review process.

## Getting started

```bash
git clone https://github.com/edgarfloresguerra2011-a11y/OpenSAM.git
cd OpenSAM
npm install
npm run dev
```

You'll need Node ≥ 18 (see `.nvmrc`). The app runs in demo mode without any
backend — perfect for UI work. To test the full stack locally, follow the
[Quick start](README.md#-quick-start) section of the README.

## Development workflow

1. **Branch from `main`** — never commit directly to `main`.
2. **Use conventional commit messages** when possible:
   - `feat: add proposal editor`
   - `fix: correct NAICS filter type cast`
   - `chore: bump supabase-js to 2.46`
3. **Run all checks locally before pushing:**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```
   These all run in CI too, but catching them locally is much faster.
4. **Open a PR** against `main`. Fill in the PR template (especially the
   security section).

## Code style

- **Prettier** + **ESLint** enforce formatting and lint rules. The pre-commit
  hook (Husky + lint-staged) runs them automatically on staged files.
- TypeScript is in **strict mode** with `noUnusedLocals` and
  `noUnusedParameters`. Avoid `any` — if you genuinely need it, add an inline
  `// eslint-disable-next-line` with a justification comment.
- Prefer **named exports** for components and utilities. Only the route-level
  page components use default exports (React Router convention).
- Use the **path alias `@/`** for absolute imports into `src/` (configured in
  `tsconfig.json` and `vite.config.ts`).

## Database migrations

- **Never edit an existing migration file** — add a new one numbered `005_…`,
  `006_…`, etc. This keeps the migration history replayable.
- Always include `-- ── X. <section> ──────────` separator comments for
  readability.
- Test your migration both ways: `up` (apply) and `down` (manual revert in a
  scratch query).
- If you add a new column that needs back-filling, do it in the same migration.

## Edge Functions

- Edge Functions live in `supabase/functions/` and run on Deno.
- Shared helpers go in `supabase/functions/_shared/`.
- **Never import Node built-ins** (`fs`, `path`, etc.) — Deno doesn't have them.
- Use the `import_map.json` for clean imports.
- Always verify JWT in every function unless you have a very good reason not
  to (`verify_jwt = true` in `supabase/config.toml` is the default).

## Security review checklist

Before opening a PR, double-check:

- [ ] I did **not** add a new `VITE_` variable that contains a secret.
- [ ] If I added a new Edge Function, it requires JWT auth.
- [ ] If I touched a database table, I added RLS policies scoped to
      `auth.uid()` (or used `SECURITY DEFINER` deliberately).
- [ ] If I added a new PII field, I considered whether it should be encrypted.
- [ ] I did not bypass the audit log on any sensitive action.

## Adding tests

- Place test files next to the source: `src/services/gemini.ts` →
  `src/services/gemini.test.ts`.
- Prefer **behavioral** tests over implementation-coupled ones.
- Use the Testing Library queries (`getByRole`, `getByLabelText`) — they
  encourage accessibility at the same time.
- Coverage thresholds are set in `vitest.config.ts`. Don't lower them to make
  CI pass; add more tests instead.

## Reporting bugs

Open a GitHub issue with:

1. OpenSAM version (or git commit hash).
2. Browser + OS.
3. Steps to reproduce (numbered list).
4. Expected vs. actual behavior.
5. Console errors / network trace if applicable.
6. Whether you're running in demo mode or with a live Supabase project.

## Reporting security issues

**Do not open a public issue for security problems.** See [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the MIT
License alongside the rest of the project.
