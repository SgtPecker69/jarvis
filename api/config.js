// Keys that are safe to sync to the cloud (excludes expiring OAuth tokens and ephemeral data)
const SYNC_KEYS = [
  "jarvis_api_key", "jarvis_groq_key", "jarvis_eleven_key", "jarvis_voice_id",
  "jarvis_spotify_cid",
  "jarvis_gcal_cid",
  "jarvis_webhooks",
  "jarvis_memories", "jarvis_memory_file", "jarvis_memory_updated",
  "jarvis_continuous_mode",
  "jarvis_crypto_enabled",
  "jarvis_hue",
  "jarvis_measurements",
  "jarvis_sleep",
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const pat    = process.env.GITHUB_PAT;
  const gistId = process.env.GITHUB_GIST_ID;

  if (!pat || !gistId) {
    return res.status(503).json({
      error: 'not-configured',
      message: 'Add GITHUB_PAT and GITHUB_GIST_ID to Vercel environment variables to enable cloud sync.',
    });
  }

  const ghHeaders = {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'Jarvis-Config-Sync',
  };

  // ── GET — read config from Gist ───────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const r = await fetch(`https://api.github.com/gists/${gistId}`, { headers: ghHeaders });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        return res.status(r.status).json({ error: e.message || 'Failed to read Gist' });
      }
      const data    = await r.json();
      const content = data.files?.['jarvis-config.json']?.content;
      if (!content) return res.status(200).json({});
      return res.status(200).json(JSON.parse(content));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST — write config to Gist ───────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      // Whitelist only known safe keys — never store tokens or session state
      const config = {};
      for (const [key, value] of Object.entries(req.body || {})) {
        if (SYNC_KEYS.includes(key)) config[key] = value;
      }
      const r = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: ghHeaders,
        body: JSON.stringify({
          files: { 'jarvis-config.json': { content: JSON.stringify(config, null, 2) } },
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        return res.status(r.status).json({ error: e.message || 'Failed to update Gist' });
      }
      return res.status(200).json({ ok: true, updatedAt: new Date().toISOString() });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
