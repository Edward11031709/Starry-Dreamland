# Starry Dreamland Agent Guide

## Non-negotiable release policy
- Work on a dedicated `dev/*` or `feature/*` branch. Never commit directly to `main`.
- `main` is the reviewed candidate source; the public GitHub Pages site must remain on the last owner-approved release.
- Never publish automatically on push, pull request merge, or a scheduled development run.
- Production publication is an explicit, owner-approved GitHub Actions workflow dispatch from `main`, protected by the GitHub Environment named `production` with required reviewers.
- Do not merge a PR or trigger production deployment unless the owner explicitly asks. A passing CI check is not release approval.
- Keep previous approved releases identifiable by immutable commit SHA/tag. Rollback means selecting a previous approved code release; never roll back player data or database state.

## Data and economy safety
- Preserve existing Supabase project, accounts, profiles, appearance JSON, owned cosmetics, Stardust balances, game records, chat, and exploration data.
- Do not run migrations, alter schema/RLS/RPC, or write production Supabase data without explicit approval for that specific change.
- Client input must never be trusted for Stardust, score rewards, cosmetic ownership, admin privileges, or other economy/security decisions. Validate privileged actions server-side.
- Never expose service-role/secret keys in browser code, repository files, logs, or build artifacts.
- Previewing locked cosmetics must never spend Stardust. Only a validated server-side unlock action may spend it.
- Admin-only actions require server-side authorization, not merely hidden UI.
- Private previews must use a private Storage bucket and an admin-verified Edge Function that issues short-lived signed URLs; never publish preview files to public Pages.
- Preview upload workflows must run only by explicit owner dispatch from `main`, must not execute candidate-commit scripts while holding server secrets, and must use an isolated sandbox iframe without `allow-same-origin`.

## Development workflow
1. Read this guide, README_zh-TW.md, the relevant docs, the existing implementation, and current tests before changing code.
2. Prefer small, reviewable changes with backward-compatible defaults.
3. Keep all user-facing UI in Traditional Chinese (Taiwan); preserve the established deep-blue, violet/lavender, silver-white, and champagne-gold fantasy style.
4. Prioritize polished character models/customization, safe wardrobe preview/unlock, park rides/buildings, multiplayer appearance sync, and desktop/mobile performance.
5. Do not add fake bystander NPCs.
6. Run JavaScript syntax checks and relevant automated tests. Record what was and was not verified; do not claim browser/device testing without doing it.
7. Open a PR with screenshots or clear test evidence when applicable. Do not merge or deploy.
8. At the end of each development batch, review whether this guide needs a substantive update; do not edit it for trivial changes.

## Release checklist
- PR reviewed and explicitly approved by the owner.
- Automated checks pass.
- Preview tested by the owner; desktop and mobile checks recorded.
- Supabase compatibility and RLS/RPC impact reviewed; no production database mutation without separate approval.
- Production deploy is started manually from `main` with explicit confirmation and the protected `production` environment approval.
- Record the deployed commit SHA and retain the previous approved SHA for rollback.
