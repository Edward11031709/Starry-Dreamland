// Pinned Supabase JavaScript SDK version. The key loaded here is a public publishable key.
(async function () {
  try {
    const cfg = window.STARRY_CONFIG || {};
    if (cfg.mode !== "supabase" || !cfg.supabaseUrl || !cfg.supabasePublishableKey) {
      throw new Error("Supabase 專案設定尚未完成。");
    }
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm");
    // Keep Supabase's existing default storage key so current sessions remain valid.
    // Explicit localStorage persistence keeps the login across page refreshes.
    const authStorage = window.localStorage;
    window.SD_SUPABASE = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
      auth: { storage: authStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    window.dispatchEvent(new Event("starry-supabase-ready"));
  } catch (error) {
    window.SD_SUPABASE_ERROR = error && error.message ? error.message : String(error);
    window.dispatchEvent(new Event("starry-supabase-error"));
  }
})();
