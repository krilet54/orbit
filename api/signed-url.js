// Vercel serverless function to generate Supabase signed URLs for private storage objects
// Requires these environment variables to be set in your deployment (do NOT commit them):
// - SUPABASE_URL (e.g. https://xyz.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY (the service_role key, keep this secret)
// - SUPABASE_STORAGE_BUCKET (optional, defaults to 'audio')

module.exports = async (req, res) => {
  try {
    // Allow CORS from any origin (adjust to restrict to your site if needed)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'audio';

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server misconfigured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.' });
    }

    const objectPath = (req.query && req.query.path) || (req.body && req.body.path);
    if (!objectPath) return res.status(400).json({ error: 'Missing `path` query param. Example: ?path=songs/filename.mp3' });

    // Build request to Supabase Storage sign endpoint
    // Build sign endpoint URL. Use encodeURIComponent for bucket (no slashes)
    // and encodeURI for the object path so internal slashes are preserved.
    const signUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeURI(objectPath)}`;

    // Ask Supabase to create a short-lived signed URL (expiresIn seconds)
    const fetchRes = await fetch(signUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 60 })
    });

    const json = await fetchRes.json();
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json(json);
    }

    // Supabase returns a JSON object containing a signed URL (key name varies)
    // We'll forward the response as-is so the client can use whichever property is present.
    return res.status(200).json(json);
  } catch (err) {
    console.error('signed-url error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
