// Serverless endpoint that returns runtime JS to initialize Supabase client
// Reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from server environment (Vercel)
// and emits a small script that sets `window.SUPABASE_URL` and initializes
// `window.orbitSupabase` using the client-side SDK. This avoids storing the
// anon key in the repository while still making it available to the browser
// at runtime via your deployment environment variables.

module.exports = (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseAnon = process.env.SUPABASE_ANON_KEY || '';

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    // Allow the script to be loaded from pages on the same origin
    res.setHeader('Cache-Control', 'no-cache');

    if (!supabaseUrl || !supabaseAnon) {
      // Emit harmless JS that warns in the console and sets orbitSupabase to null
      const body = `console.warn('Supabase runtime config missing on server.'); window.SUPABASE_URL=null; window.orbitSupabase=null;`;
      return res.status(200).send(body);
    }

    // Safely JSON-encode values to embed in JS
    const urlEsc = JSON.stringify(supabaseUrl);
    const anonEsc = JSON.stringify(supabaseAnon);

    const body = `(function(){
  window.SUPABASE_URL = ${urlEsc};
  window.SUPABASE_ANON_KEY = ${anonEsc};
  try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      window.orbitSupabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    } else {
      console.warn('Supabase SDK not found; ensure @supabase/supabase-js is loaded before this script.');
      window.orbitSupabase = null;
    }
  } catch (e) {
    console.error('Failed to initialize Supabase client at runtime', e);
    window.orbitSupabase = null;
  }
})();`;

    return res.status(200).send(body);
  } catch (err) {
    console.error('supabase-config endpoint error', err);
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.status(200).send("console.error('Supabase config endpoint failed'); window.orbitSupabase=null;");
  }
};
