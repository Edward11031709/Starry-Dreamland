// Pinned Supabase JavaScript SDK version. The key loaded here is a public publishable key.
(async function () {
  try {
    const cfg = window.STARRY_CONFIG || {};
    if (cfg.mode !== "supabase" || !cfg.supabaseUrl || !cfg.supabasePublishableKey) {
      throw new Error("Supabase 專案設定尚未完成。");
    }
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/+esm");
    window.SD_SUPABASE = createClient(cfg.supabaseUrl, cfg.supabasePublishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    window.dispatchEvent(new Event("starry-supabase-ready"));
  } catch (error) {
    window.SD_SUPABASE_ERROR = error && error.message ? error.message : String(error);
    window.dispatchEvent(new Event("starry-supabase-error"));
  }
})();
