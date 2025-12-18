/* ========================================
   ORBIT — Supabase Configuration
   ======================================== */

// IMPORTANT: Do NOT hard-code secrets in source. The anon key is intended
// to be used by client-side code, but storing it in the repo is unnecessary
// and can be avoided by injecting it at build time or via a meta tag.

// Prefer configuring the runtime anon key via a meta tag injected at deploy/build:
// <meta name="supabase-url" content="https://your-project.supabase.co">
// <meta name="supabase-anon-key" content="public-anon-key-goes-here">

const SUPABASE_URL = (document.querySelector('meta[name="supabase-url"]') || {}).content || 'https://awcxgnlltfrwytwejvva.supabase.co';
const SUPABASE_ANON_KEY = (document.querySelector('meta[name="supabase-anon-key"]') || {}).content || null;

// Do NOT attach the anon key to `window`. Instead initialize the client only
// when a runtime key is available. This prevents the repo/source from containing
// the key and reduces accidental leaks.
let orbitSupabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        orbitSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        // Expose only the client (no raw key on window)
        window.orbitSupabase = orbitSupabaseClient;
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
    }
} else {
    // Warn in dev if client isn't initialized; this is expected until you inject
    // the anon key at build/deploy time or add the meta tags to your HTML.
    console.warn('Supabase client not initialized. Add a meta[name="supabase-anon-key"] tag or inject the anon key at build time.');
    window.orbitSupabase = null;
}

/* ========================================
   DATABASE SCHEMA SETUP
   ========================================
   
   Run this SQL in your Supabase SQL Editor to create the songs table:
   
   -- Create songs table
   CREATE TABLE songs (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       title TEXT NOT NULL,
       theme TEXT,
       lyrics TEXT,
       audio_url TEXT NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       published BOOLEAN DEFAULT true
   );

   -- Enable Row Level Security
   ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

   -- Policy: Anyone can read published songs
   CREATE POLICY "Public can read published songs" ON songs
       FOR SELECT USING (published = true);

   -- Policy: Authenticated users can do everything
   CREATE POLICY "Authenticated users full access" ON songs
       FOR ALL USING (auth.role() = 'authenticated');

   -- Create storage bucket for audio files
   -- Go to Storage in Supabase Dashboard and create a bucket named 'audio'
   -- Set it to public or configure appropriate policies
   
   ======================================== */

// Export for use in other modules
window.orbitSupabase = orbitSupabaseClient;
