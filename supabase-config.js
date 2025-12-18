/* ========================================
   ORBIT — Supabase Configuration
   ======================================== */

// IMPORTANT: Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://awcxgnlltfrwytwejvva.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3Y3hnbmxsdGZyd3l0d2VqdnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTQ5NTksImV4cCI6MjA4MTE5MDk1OX0.Sx_DaV3iXlEABX3r3pqU0t2_XndHvdDKMvxiXG9Ksho';

// expose values on window for other scripts that check them
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase client (use a distinct name to avoid colliding with the library global)
const orbitSupabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

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
