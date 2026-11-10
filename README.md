# Starry Dreamland｜星夢樂園

A browser-first fantasy mini-game platform. The intended entry point is `index.html`; players should be able to open the website directly without installing a desktop client.

## Current project direction

- Traditional Chinese interface.
- Cinematic, realistic fantasy 3D art direction: deep blue, violet, silver-white and warm gold.
- Existing V4.1 browser demo is the stable gameplay baseline.
- The plaza starts with a fixed angled camera. Free movement and camera rotation are a final-stage upgrade, not a prerequisite for launch.
- Use licensed, pre-existing GLB/glTF models only. Do not create custom 3D models.

## Publish with GitHub Pages

After the website files are uploaded to the repository root:

1. Open **Settings → Pages**.
2. Set Source to **Deploy from a branch**.
3. Select branch `main` and folder `/(root)`.
4. Save and wait for the deployment check.
5. The expected site URL is https://Edward11031709.github.io/Starry-Dreamland/

The website package is a static site. It does not require npm or a build step in the current version.

## Current limitations

- The current demo uses browser-local storage; records do not synchronize between devices.
- GitHub Pages is static hosting only. Shared accounts and global leaderboards require a backend such as Supabase with Row Level Security.
- Never commit passwords, service-role keys, private credentials, or real player personal data.

## Documentation

- [Traditional Chinese project guide](README_zh-TW.md)
- [Cinematic 3D roadmap](docs/3D_ROADMAP_CINEMATIC_FREE_ROAM_zh-TW.md)
- [GitHub Pages deployment guide](docs/GITHUB_PAGES_DEPLOYMENT_zh-TW.md)
- [Asset license register](LICENSES.md)
