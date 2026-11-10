# Release Readiness

- Root `index.html` is now a self-contained playable browser demo.
- Current playable modes: Constellation Alignment, Lunar Resonance, Gravity Voyage, Little Starland star-linking and memory matching.
- GitHub Repository is public; the connected account has push permission.
- `.github/workflows/pages.yml` is present and deploys the repository root.
- GitHub Actions currently reaches **Configure Pages** but fails there because the Pages publishing source has not yet been enabled in repository settings.
- Manual action required: Repository → Settings → Pages → Build and deployment → Source → **GitHub Actions**.
- After enabling it, open Actions and verify the latest deployment run succeeds.
- Current accounts, records and scores use browser `localStorage`; they do not sync across devices or users.
- Do not use real passwords or personal data in the demo.
- Shared login and global leaderboard require a backend such as Supabase, RLS policies, and server-side score validation.
- The current scene is an animated 2.5D presentation, not the completed cinematic 3D world. The 3D roadmap remains a staged future upgrade.