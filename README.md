# Starry Dreamland｜星夢樂園

**A browser-based, first-person fantasy theme park with interactive rides, mini-games and cloud profiles.**

Live website: https://edward11031709.github.io/Starry-Dreamland/

## Current experience

The homepage contains an explorable Three.js night park, opening at eye level from the player's own viewpoint. Players can walk with WASD / arrow keys, run with Shift, rotate their view by dragging, and zoom with the mouse wheel. A camera toggle switches to third-person so players can admire their avatar.

The park is built from procedural geometry and original materials, with the supplied concept board guiding its deep-indigo night sky, violet crystal accents, silver architecture, warm gold illumination and ornate fantasy silhouettes. It includes a multi-spire castle, observatory, themed ride districts, lantern-lit paths, floating gardens, a starfield and a distant ringed planet. The center plaza uses a low-profile astral compass inlay; the floating island underside now tapers down below the walkable deck instead of protruding through the surface.

- An interactive 2D guide map sits at the upper-left of the park view. It shows the entrance, castle, rides, games, service points, the player's position and nearby online visitors; the map can be expanded for a full view.
- The entrance is framed by a curved celestial arch. The castle has more detailed towers, illuminated windows, portico columns and orbital star ornaments; garden trees use layered crystal-evergreen forms.
- Attraction signs are attached to their matching models rather than scattered overhead.
- Five rides can be boarded and exited: the Starlight Carousel, Moonlight Teacups, Galaxy Ferris Wheel, Galaxy Drop Tower and Cosmic Coaster. Approach a ride and press E (or the mobile Interact button), or click the ride when close enough. While seated, the player follows the moving seat, gondola, platform or coaster cart; interact again to dismount at a nearby safe spot.
- The ticket booth is a service point for park information, not a mini-game entrance.
- Shooting and mirror-memory challenges have their own dedicated building façades.
- Movement uses walk-surface height metadata for paths and plazas and approximate circular blockers for attractions, the castle, the observatory and trees.
- If WebGL or the CDN is unavailable, the HTML game cards remain available.

The scene is still a procedural 3D prototype, not a finished photorealistic asset pack. Collision is currently an intentionally lightweight approximation rather than a full physics engine. Visual and gameplay review in a real browser/WebGL session is still needed.

## Interactive attraction rides

All five park rides expose an actual boarding point and a safe dismount point:

- **星光旋轉木馬** — board one of the moving carousel seats.
- **星月茶杯** — ride one of the rotating teacups as the platform turns.
- **星河摩天輪** — ride a gondola that travels around the wheel.
- **星際自由落體** — ride the lift platform as it rises and falls.
- **星際雲霄飛車** — board the cart as it travels back and forth along the coaster curve.

On desktop, walk close and press E, or click a ride when nearby. On mobile, approach and use the contextual Interact button. The interaction label changes between approaching, boarding and dismounting. Dismounting searches for a nearby walkable position outside the ride's collision boundary.

## Mobile and first-person controls

- The park opens in first-person eye-level view so the player can look around naturally. A view toggle switches to third-person follow view to see the selected avatar.
- On touch devices in portrait orientation, the park shows a rotate-to-landscape overlay.
- The full-screen control requests browser fullscreen and then attempts the Screen Orientation API landscape lock. Browsers that do not support orientation locking require the player to rotate the device manually.
- In landscape touch mode, the left virtual joystick moves the player, the Run button increases speed, and the Interact button boards or exits rides and uses nearby service points.
- Dragging the open right side of the 3D view looks around. In first-person mode, vertical dragging looks up and down.
- Desktop players can still use WASD / arrow keys, Shift, E, mouse drag and wheel zoom.

The viewport respects device safe areas. The park uses system Traditional Chinese font fallbacks and auto-fits attraction sign text to reduce font substitution and clipping across devices.

## Multiplayer park and public chat

Signed-in non-admin players can join the shared park lounge:

- Supabase Realtime Presence lists who is online.
- Broadcast syncs player positions so other visitors can appear as 3D avatars in the same park.
- The upper-left map also marks online visitors.
- Public chat messages are stored in `sd_chat_messages` and delivered through Realtime database changes.
- Chat writes are authenticated, server-stamped with the profile nickname, and rate-limited. Message bodies are limited to 180 characters by the app and 240 by the database.
- Administrator accounts are excluded from public presence, movement broadcasts, chat reads/writes, and public rankings. The admin account can still view its own profile and history after signing in.

The Realtime channel uses the private `park:lobby` topic. Confirm the Supabase Realtime project setting permits private channels and does not permit public access before opening the multiplayer park to other visitors. A real second-player browser session is still required to validate the end-to-end online experience.

## High-fidelity park art and live avatar preview

The park's stone walls, roofs, walkways and plazas now use generated repeating surface patterns with subtle bump detail. The main moon light casts real-time soft shadows (higher resolution on desktop and reduced resolution on smaller viewports). Crystal evergreen trees have faceted layered canopies, the castle has additional carved tower ribs and a stained-glass astral rose window, and the central plaza has fine flush star-compass inlays. A restrained layer of floating star motes adds depth without using placeholder people.

The Traveler Atelier includes an actual Three.js 3D preview using the same player model as the park. Drag the preview to rotate the character, change archetype and appearance controls for immediate updates, and preview any outfit—including locked outfits—before deciding to equip or unlock it. Previewing does not spend Star Dust.

## Real-player visibility and deferred NPCs

No ambient or placeholder visitor characters are spawned in the park. The only other humanoid characters shown in the 3D world are authenticated, currently online, non-admin players received through Supabase Realtime. Offline names, demo silhouettes and scripted crowd models are not rendered.

NPCs are intentionally deferred. A later NPC phase should define individual identities, visual concepts, schedules, pathing, dialogue and interactions before any characters are placed in the park.

## Player wardrobe

The default Star Traveler appearance is designed as a complete fantasy outfit (layered robe, mantle, boots, hair, headpiece and celestial details), not a placeholder sphere. The character atelier supports five traveler archetypes (Wanderer, Astral Mage, Star Knight, Moon Priest and Celestial Guardian), selectable hair styles, hair colors, skin tones and star-trim colors. These settings are stored in the Supabase profile and synced to other online players. The wardrobe contains six outfits:

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
