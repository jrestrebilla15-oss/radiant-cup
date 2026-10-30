// GET  /api/state  → the published bracket (anyone)
// PUT  /api/state  → publish a new bracket (admin password required)
const {KEY, redis, isAdmin, readBody, send, sleep} = require('./_lib');

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET'){
      const raw = await redis(['GET', KEY]);
      const doc = raw ? JSON.parse(raw) : {state: null, updatedAt: 0};
      // Viewers poll this; a 3-second CDN cache keeps database reads low however many people watch.
      // The admin page adds ?fresh=… to skip the cache.
      const fresh = new URL(req.url, 'http://x').searchParams.has('fresh');
      return send(res, 200, doc, fresh ? 'no-store' : 'public, max-age=0, s-maxage=3, stale-while-revalidate=5');
    }
    if (req.method === 'PUT'){
      if (!isAdmin(req)){ await sleep(500); return send(res, 401, {error: 'Not authorized'}); }
      const body = await readBody(req);
      const s = body && body.state;
      const valid = s === null || (s && typeof s === 'object' && Array.isArray(s.rounds) && Array.isArray(s.teams));
      if (!valid) return send(res, 400, {error: 'Invalid bracket data'});
      const doc = {state: s, updatedAt: Date.now()};
      const json = JSON.stringify(doc);
      if (json.length > 500000) return send(res, 413, {error: 'Bracket data too large'});
      await redis(['SET', KEY, json]);
      return send(res, 200, {ok: true, updatedAt: doc.updatedAt});
    }
    res.setHeader('Allow', 'GET, PUT');
    return send(res, 405, {error: 'Method not allowed'});
  } catch (e){
    return send(res, e.status || 500, {error: e.message});
  }
};
