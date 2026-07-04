# Pull Request template

## Description

<!-- Brief description of the change. Link any related issues. -->

Fixes #

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactor / chore

## Checklist

- [ ] My code follows the project's style guidelines (`npm run lint`, `npm run format:check`)
- [ ] I have run `npm run typecheck` and there are no new errors
- [ ] I have added tests that prove my fix is effective or my feature works
- [ ] New and existing unit tests pass locally with `npm run test`
- [ ] I have NOT exposed any new API key or secret in the frontend bundle
- [ ] If I changed the database schema, I added a new migration in `supabase/migrations/` (not edited an existing one)
- [ ] I have updated the README / docs accordingly

## Security considerations

<!-- If this change touches auth, RLS, encryption, or external API calls,
     describe how you verified it doesn't introduce a vulnerability. -->

## Screenshots (if applicable)

<!-- Drag-and-drop before/after screenshots for UI changes. -->
