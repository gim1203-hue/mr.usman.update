export function reject(res, status, error) { return res.status(status).json({ error }); }
export function start(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); reject(res, 405, 'Use POST for this request.'); return false; }
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin) { try { if (new URL(origin).host !== host) { reject(res, 403, 'Please use the form on the New Prime website.'); return false; } } catch { reject(res, 403, 'Invalid origin.'); return false; } }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) { reject(res, 415, 'Send JSON data.'); return false; }
  return true;
}
export function body(req) {
  let data;
  try { data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { throw new Error('Invalid JSON.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid request.');
  if (Buffer.byteLength(JSON.stringify(data)) > 2500000) throw new Error('Request too large. Please use smaller photos.');
  return data;
}
const limits = { description: 4000, location: 200, propertyType: 40, timeline: 200, budget: 200, name: 200, email: 200, phone: 200 };
export function project(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Project details are required.');
  const result = {};
  for (const [key, max] of Object.entries(limits)) {
    if (input[key] != null && typeof input[key] !== 'string') throw new Error(`Invalid ${key}.`);
    const value = (input[key] || '').trim();
    if (value.length > max) throw new Error(`${key} is too long.`);
    result[key] = value;
  }
  return result;
}
export function photos(input = []) {
  if (!Array.isArray(input) || input.length > 3) throw new Error('Use at most three photos.');
  return input.map(p => {
    if (!p || typeof p.dataUrl !== 'string' || p.dataUrl.length > 750000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(p.dataUrl)) throw new Error('Invalid image. Use JPG, PNG, or WebP.');
    const bytes = Buffer.from(p.dataUrl.split(',')[1], 'base64');
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp = bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!(jpeg && p.dataUrl.startsWith('data:image/jpeg;') || png && p.dataUrl.startsWith('data:image/png;') || webp && p.dataUrl.startsWith('data:image/webp;'))) throw new Error('Image contents do not match the file type.');
    return { name: typeof p.name === 'string' ? p.name.slice(0,120) : 'Project photo', dataUrl: p.dataUrl };
  });
}
// Best-effort per-instance guard. Configure durable rate limiting in the hosting firewall for production.
const buckets = new Map();
export function rateLimit(req, res, prefix, limit) {
  const address = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const key = `${prefix}:${address}`; const now = Date.now();
  for (const [k,v] of buckets) if (v.until < now) buckets.delete(k);
  if (buckets.size > 10000) { reject(res, 429, 'Please try again later.'); return false; }
  const bucket = buckets.get(key) || { count: 0, until: now + 60000 };
  bucket.count++; buckets.set(key, bucket);
  if (bucket.count > limit) { res.setHeader('Retry-After','60'); reject(res,429,'Too many requests. Please wait a minute.'); return false; }
  return true;
}
