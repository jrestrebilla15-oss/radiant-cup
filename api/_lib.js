// Shared helpers for the API routes. Files starting with "_" are not deployed as endpoints.
const crypto = require('crypto');

const KEY = 'valorant-bracket:state';

// Upstash Redis REST API. Vercel's Upstash integration sets either the KV_* or UPSTASH_* pair.
function redisConfig(){
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('No database connected. Add Upstash Redis to this Vercel project (Storage tab).');
  return {url: url.replace(/\/$/, ''), token};
}

async function redis(command){
  const {url, token} = redisConfig();
  const r = await fetch(url, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(command),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || `Database error ${r.status}`);
  return j.result;
}

function sha(s){ return crypto.createHash('sha256').update(String(s)).digest(); }

// True when the request carries "Authorization: Bearer <ADMIN_PASSWORD>"
function isAdmin(req){
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const h = req.headers.authorization || '';
  const given = h.startsWith('Bearer ') ? h.slice(7) : '';
  return crypto.timingSafeEqual(sha(given), sha(pw));
}

async function readBody(req){
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body || 'null') : req.body;
  let raw = '';
  for await (const chunk of req){
    raw += chunk;
    if (raw.length > 1e6) throw Object.assign(new Error('Too large'), {status: 413});
  }
  return raw ? JSON.parse(raw) : null;
}

function send(res, status, data, cache = 'no-store'){
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.end(JSON.stringify(data));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

module.exports = {KEY, redis, isAdmin, readBody, send, sleep};
