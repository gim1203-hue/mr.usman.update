import { randomUUID } from 'node:crypto';
import { body, photos, project, rateLimit, reject, start } from './_shared.js';
export const maxDuration = 30;
export default async function handler(req,res) {
  if (!start(req,res) || !rateLimit(req,res,'leads',4)) return;
  let details, images;
  try {
    const data = body(req); if (data.consent !== true) throw new Error('Please agree to share the request with New Prime.');
    if (data.website) throw new Error('Unable to submit this request.');
    details = project(data.project); images = photos(data.photos);
    if (details.description.length < 20 || !details.location || !details.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) throw new Error('Please include your name, valid email, project location, and at least 20 characters of project details.');
  } catch(e) { return reject(res,400,e.message); }
  if (!process.env.LEAD_WEBHOOK_URL) return reject(res,503,'Online delivery is not connected yet. Download your brief or use Open email draft, then attach your photos and send it to New Prime.');
  let url;
  try { url = new URL(process.env.LEAD_WEBHOOK_URL); if (url.protocol !== 'https:') throw new Error(); }
  catch { return reject(res,503,'Online delivery is unavailable. Please email or call New Prime.'); }
  const reference = randomUUID();
  try {
    const response = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json', ...(process.env.LEAD_WEBHOOK_TOKEN ? {Authorization:`Bearer ${process.env.LEAD_WEBHOOK_TOKEN}`} : {})}, body:JSON.stringify({reference,receivedAt:new Date().toISOString(),project:details,photos:images,consent:{contact:true,noticeVersion:'2026-10-24'},source:'new-prime-website'}),redirect:'error',signal:AbortSignal.timeout(20000)});
    if (!response.ok) return reject(res,502,'The delivery service did not confirm your request. Please email or call the office.');
    return res.status(201).json({reference});
  } catch { return reject(res,502,'Delivery could not be confirmed. Please contact the office before retrying.'); }
}
