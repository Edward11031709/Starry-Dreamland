# Starry Dreamland｜星夢樂園

A browser-first celestial mini-game platform. The game opens directly from the repository-root `index.html`; no desktop installation or build step is required for this starter version.

## Current playable entry

- Traditional Chinese UI.
- Starry Dream Plaza with three game entrances.
- Constellation Alignment, Lunar Resonance and Gravity Voyage.
- Little Starland: star connecting and memory matching.
- Local demo profile, Stardust scoring, records and local leaderboard.
- Locked Cosmic Stadium placeholder.

## Important demo limitation

This starter version uses browser `localStorage`. Demo accounts, scores and history are stored only in the current browser profile. They do not sync between devices or between different visitors. Do not enter a real password or real personal information. Global accounts and a shared leaderboard require a backend such as Supabase with Row Level Security and server-validated score submissions.

## GitHub Pages

Expected URL: https://Edward11031709.github.io/Starry-Dreamland/

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. The repository already contains `.github/workflows/pages.yml`.
4. Open the **Actions** tab and verify that **Deploy Starry Dreamland to GitHub Pages** completes successfully.
5. Then open the URL above.

No npm installation or build step is required by the current single-file demo.

## 3D direction

The confirmed art direction is cinematic realistic fantasy 3D, with fixed angled plaza camera first. Free movement, mouse camera rotation and zoom are postponed until the plaza, game loop and data layer are stable. Use only existing GLB/glTF assets with verified licences; do not create custom models.

## Documentation

- [Traditional Chinese guide](README_zh-TW.md)
- [Cinematic 3D roadmap](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [GitHub Pages deployment guide](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)
- [GaiaCraft reference notes](docs/REFERENCE_GAIACRAFT_zh-TW.md)
- [Asset licence register](LICENSES.md)

Never commit passwords, private credentials, service-role keys, or real player personal data.