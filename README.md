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

## Randomized rounds

Every play creates a new rhythm, cipher, pipe layout, star position, or maze layout rather than reusing a fixed level.

## Current data mode and global accounts

The public site still uses browser `localStorage` for demo nicknames, scores, and history. Data stays in the current browser and is not synchronized across devices. Global sign-up/sign-in is **not enabled yet**.

The initial Supabase schema and setup notes are prepared:
- [Supabase global-account setup (Traditional Chinese)](docs/SUPABASE_SETUP_zh-TW.md)
- [Supabase schema and RLS SQL](supabase/schema.sql)

To enable global accounts, a Supabase project must be created, the SQL must be run, and the project URL plus public publishable/anon key must be connected to the site. Never publish a `service_role` key or any private secret.

GitHub Pages hosts the static site; Supabase will provide authentication, cross-device data, and shared leaderboards. Fair competitive rankings will need additional server-side score validation.

## GitHub Pages deployment

The repository contains `.github/workflows/pages.yml`. Pushing to `main` automatically triggers deployment.

## Visual direction

- Cinematic, realistic fantasy 3D in deep blue, violet, silver-white, and champagne gold.
- Start with a fixed angled overhead view of the central plaza.
- Add the castle, observatory, floating islands, and 3D games gradually.
- Free movement and camera rotation remain later-stage features.
- Use only GLB/glTF assets with clear licenses.
