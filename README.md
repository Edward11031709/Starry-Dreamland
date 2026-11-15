# Starry Dreamland｜星夢樂園

**A browser-based fantasy game world.**

Live website: https://edward11031709.github.io/Starry-Dreamland/

## Game zones

### Adult challenge zone
- **月相共鳴 / Lunar Resonance** — a variable 12–15 beat timing challenge.
- **星域解碼 / Stellar Cipher** — deduce a four-symbol code from positional clues.
- **軌道接線 / Orbit Link** — rotate tiles in a randomized 5 × 5 pipe matrix to connect the source and the exit.

### 星芽探索區 / Little Starland
- **星星連連看** — connect stars in a newly randomized layout.
- **星星記憶** — match shuffled star and moon cards.
- **星座校準** — a lighter star-connection challenge.
- **引力迷航** — explore a newly generated maze, collect two Stardust fragments, and reach the exit.

Adult Stardust and kids' Stardust are tracked separately. The two zones also have separate leaderboards. The Star Arena is not open yet.

## Global accounts and cloud data

The Supabase project is provisioned and the database schema is installed. The website now includes:
- Supabase Authentication for email sign-up, sign-in, sign-out, and password reset.
- Cloud player profiles and game records.
- Separate adult and kids scores and leaderboards.
- Row Level Security (RLS) policies for account-owned data.
- A private schema for privileged internal aggregate functions.

Before the first real sign-up, configure Supabase **Authentication → URL Configuration**:

- Site URL: `https://edward11031709.github.io/Starry-Dreamland/`
- Add the same full URL to Redirect URLs.

The public browser app uses a Supabase publishable key. Never publish a `sb_secret_`, `service_role`, database password, or other private credential.

Legacy local-demo data remains in the original browser storage and is not automatically imported into cloud accounts. Current scores are calculated in the browser; production competitive rankings will need server-side score validation.

See [Supabase setup and operations (Traditional Chinese)](docs/SUPABASE_SETUP_zh-TW.md) and [the database schema](supabase/schema.sql).

## Randomized rounds

Every play creates a new rhythm, cipher, pipe layout, star position, or maze layout rather than reusing a fixed level.

## GitHub Pages deployment

The repository contains `.github/workflows/pages.yml`. Pushing to `main` triggers deployment.

## Visual direction

- Cinematic, realistic fantasy 3D in deep blue, violet, silver-white, and champagne gold.
- Start with a fixed angled overhead view of the central plaza.
- Add the castle, observatory, floating islands, and 3D games gradually.
- Free movement and camera rotation remain later-stage features.
- Use only GLB/glTF assets with clear licenses.
