// POST /api/login with "Authorization: Bearer <password>" → 200 if it is the admin password
const {isAdmin, send, sleep} = require('./_lib');

module.exports = async (req, res) => {
  if (req.method !== 'POST'){ res.setHeader('Allow', 'POST'); return send(res, 405, {error: 'Method not allowed'}); }
  if (!process.env.ADMIN_PASSWORD) return send(res, 500, {error: 'ADMIN_PASSWORD is not set in Vercel yet.'});
  if (!isAdmin(req)){ await sleep(500); return send(res, 401, {error: 'Wrong password'}); }
  return send(res, 200, {ok: true});
};
