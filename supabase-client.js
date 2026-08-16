/**
 * NewWatchGuy — Supabase client (shared by all pages).
 * Depends on: js/config.js (loaded first) and the Supabase CDN script
 * (loaded first) which exposes the global `supabase` object.
 */
(function () {
  if (!window.supabase) {
    console.error('Supabase library not loaded. Check the <script> tag order in this page.');
    return;
  }
  const cfg = window.NWG_CONFIG || {};
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('YOUR-PROJECT-REF')) {
    console.warn('NewWatchGuy: Supabase is not configured yet. Edit js/config.js with your project URL and anon key.');
  }
  window.db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });
})();
