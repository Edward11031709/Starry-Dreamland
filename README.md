# Starry Dreamland｜星夢樂園

**A browser-based, third-person fantasy theme park with mini-games and cloud profiles.**

Live website: https://edward11031709.github.io/Starry-Dreamland/

## Current experience

The homepage contains an explorable Three.js night park, viewed from behind the player at the entrance. Players can walk with WASD / arrow keys, run with Shift, rotate the camera by dragging, and zoom with the mouse wheel.

The park is built from procedural geometry and original materials. It includes a castle, observatory, themed ride districts, lantern-lit paths, floating gardens, a starfield and a distant ringed planet. The center plaza's old raised crystal has been replaced by a low-profile astral compass inlay to keep the central walkway visually open.

- The attraction signs are attached to their matching models rather than scattered overhead.
- The carousel has visible horses and a ride interaction; press E nearby to board or leave.
- The ticket booth is a service point for park information, not a mini-game entrance.
- Shooting and mirror-memory challenges have their own dedicated building façades.
- Movement uses walk-surface height metadata for paths and plazas and approximate circular blockers for attractions, the castle, the observatory and trees.
- If WebGL or the CDN is unavailable, the HTML game cards remain available.

The scene is still a procedural 3D prototype, not a finished photorealistic asset pack. Collision is currently an intentionally lightweight approximation rather than a full physics engine. Visual and gameplay review in a real browser/WebGL session is still needed.

## Player wardrobe

The default Star Traveler appearance is designed as a complete fantasy outfit (layered robe, mantle, boots, hair, headpiece and celestial details), not a placeholder sphere. The wardrobe contains six styles:

- Star Traveler — free default outfit.
- Moonlight Priestess.
- Nebula Prince.
- Crystal Witch.
- Astral Knight.
- Celestial Guardian.

The five premium outfits are unlocked with adult Stardust. Unlocks and equipped styles are stored in the signed-in player's Supabase profile. Avatar ownership, point spending and equipping are validated by database functions; public profile updates cannot directly change avatar ownership or the selected style.

## Game zones

### Adult challenge zone

- **月相共鳴 / Lunar Resonance** — a variable 12–15 beat timing challenge.
- **星域解碼 / Stellar Cipher** — deduce a four-symbol code from positional clues.
- **軌道接線 / Orbit Link** — rotate tiles in a randomized 5 × 5 pipe matrix to connect the source and the exit.
- **霓虹神射手 / Neon Shooting Gallery** — hit six targets in sequence before the timer runs out.
- **幻影鏡屋 / Mirror House** — reproduce progressively longer light-and-symbol sequences.

### 星芽探索區 / Little Starland

- **星星連連看** — connect stars in a newly randomized layout.
- **星星記憶** — match shuffled star and moon cards.
- **星座校準** — a lighter star-connection challenge.
- **引力迷航** — explore a newly generated maze, collect two Stardust fragments, and reach the exit.

Adult Stardust and kids' Stardust are tracked separately. The two zones also have separate leaderboards.

## Global accounts, administrator role and cloud data

Supabase stores player profiles and game records. Email sign-up/sign-in, sign-out, password reset, cloud profiles, game records, and global leaderboards are included.

- Only a public Publishable key is used in the browser. Never publish a secret key, service-role key, database password, or administrator credential.
- Administrator membership is stored in a private schema, not in editable user metadata.
- The global best-score function excludes administrators in the database query, so administrator records are not part of adult or kids' public rankings.
- Avatar purchases and equipped styles are validated by server-side database functions.
- Current game scores are still calculated by the browser; competitive rankings will eventually need server-side score validation.
- Configure Supabase Authentication → URL Configuration with the live site URL before relying on verified sign-ups.

## Deployment

The repository contains a GitHub Actions Pages workflow. Pushing to the main branch triggers deployment. Three.js is loaded from a pinned CDN version; if the CDN is unavailable, the game cards still provide access to the games.

## Deferred idea: Anomaly / horror-world mode

**This is a future concept only. It is not implemented or enabled in the current park.** The normal fantasy theme park must be polished and stable first.

Possible future direction:

1. A player must pass a reliable 18+ age-verification flow before the mode can appear.
2. The mode is opt-in and must be explicitly enabled or approved by an administrator. The park owner/admin has the final decision to open the transition.
3. The ordinary park gradually experiences an original supernatural anomaly. A portal or event transports eligible players from the theme park into a separate, much larger rules-based survival world, which can later expand into multiple regions and locations.
4. The world, rules, entities, story and missions should be original creations inspired by the broad rules-horror genre, not copied characters or passages from an existing novel.
5. Adult-mode data, content and progression must remain separate from the children's exploration zone.

No work on this mode should begin until the regular theme park is considered complete and the administrator explicitly approves the next phase.
