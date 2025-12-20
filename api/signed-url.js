// Serverless function: return a short-lived signed URL for a Supabase storage object
// Requires these env vars in your deployment (Vercel):
// - SUPABASE_URL (https://<project>.supabase.co)
// - SUPABASE_SERVICE_ROLE_KEY (service_role key, keep secret)

module.exports = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'audio';

    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Server misconfigured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.' });
    }

    const objectPath = (req.query && req.query.path) || (req.body && req.body.path);
    if (!objectPath) return res.status(400).json({ error: 'Missing `path` query param. Example: ?path=songs/file.mp3' });

    // Build sign endpoint URL. Use encodeURIComponent for bucket, encodeURI for object path (preserve slashes)
    const signUrl = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${encodeURI(objectPath)}`;

    const fetchRes = await fetch(signUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 300 })
    });

    const json = await fetchRes.json();
    if (!fetchRes.ok) {
      return res.status(fetchRes.status).json(json);
    }

    // Normalize response to include `url` field for client convenience
    const signedUrl = json?.signedURL || json?.signedUrl || json?.signed_url || json?.url;
    return res.status(200).json({ url: signedUrl, raw: json });
  } catch (err) {
    console.error('signed-url error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
