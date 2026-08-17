/**
 * NewWatchGuy — SITE CONFIGURATION
 * ---------------------------------------------------------------------
 * This is the ONLY file you need to edit to connect the website to
 * your own Supabase project.
 *
 * Where to get these values: Supabase Dashboard → Project Settings → API
 *   - SUPABASE_URL       → "Project URL"
 *   - SUPABASE_ANON_KEY  → "anon" / "public" key (NOT the service_role key)
 *
 * These two values are SAFE to publish in frontend code — they are
 * public by design and every row is protected by Row Level Security
 * (see supabase/rls.sql). NEVER put the service_role key here or
 * anywhere in this project.
 * ---------------------------------------------------------------------
 */
window.NWG_CONFIG = {
  SUPABASE_URL: 'https://dsnmguedorabszqqtbid.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_LHC4Jj3HT1MYU9GuM6V7gw_6AMBKEn3',

  // Used to build affiliate click rows and page paths. Leave as-is
  // unless you rename the repo.
  SITE_NAME: 'NewWatchGuy'
};
