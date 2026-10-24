import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Camera, Check, ChevronLeft, Download, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { emptyProject, recommend, summaryText } from './intake.js';
import './intake.css';

const steps = ['Your project', 'Photos & details', 'Review & send'];
const intro = 'Tell me what you want to repair or build. I can help organize the scope and suggest questions for the New Prime team.';
function download(text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'new-prime-estimate-request.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choose JPG, PNG, or WebP photos.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Each original photo must be under 10 MB.');
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', .75);
  if (dataUrl.length > 750000) throw new Error('This photo is too detailed. Please choose a smaller version.');
  return { name: file.name.slice(0, 120), dataUrl };
}
async function post(url, body) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(45000) });
  const data = await response.json().catch(() => ({ error: 'This service is unavailable. Your project details are still here.' }));
  if (!response.ok) throw new Error(data.error || 'Please try again.');
  return data;
}
export default function ProjectIntake() {
  const [step, setStep] = useState(0);
  const [project, setProject] = useState({ ...emptyProject });
  const [photos, setPhotos] = useState([]);
  const [messages, setMessages] = useState([{ role: 'assistant', content: intro }]);
  const [question, setQuestion] = useState('');
  const [aiConsent, setAiConsent] = useState(false);
  const [sendConsent, setSendConsent] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [chatError, setChatError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const chatLog = useRef(null);
  useEffect(() => { chatLog.current?.scrollTo({ top: chatLog.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);
  const update = (field, value) => { setProject(p => ({ ...p, [field]: value })); setAnalysis(null); setReceipt(null); };
  const field = (key, label, opts = {}) => <label className="np-field">{label}<input value={project[key]} onChange={e => update(key, e.target.value)} maxLength={key === 'description' ? 4000 : 200} {...opts}/></label>;
  const suggestions = recommend(project.description);
  async function ask(text = question) {
    if (!text.trim() || !aiConsent || busy || messages.length >= 25) return;
    const next = [...messages, { role: 'user', content: text.trim().slice(0, 1500) }];
    setMessages(next); setQuestion(''); setChatError(''); setBusy('ai');
    try {
      const data = await post('/api/assistant', { project: { description: project.description, location: project.location, propertyType: project.propertyType, timeline: project.timeline, budget: project.budget }, photos, messages: next.slice(-12), consent: true });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
      setAnalysis({ summary: data.summary, services: data.services });
    } catch (e) { setChatError(e.name === 'TimeoutError' ? 'The assistant took too long. You can retry or continue the form.' : e.message); }
    finally { setBusy(''); }
  }
  async function addPhotos(e) {
    const files = Array.from(e.target.files || []); e.target.value = '';
    if (photos.length + files.length > 3) { setError('You can add up to three photos.'); return; }
    setBusy('photos'); setError('');
    try { const added = await Promise.all(files.map(preparePhoto)); setPhotos(p => [...p, ...added]); setAnalysis(null); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  function advance(e) { e.preventDefault(); setError(''); setStep(s => Math.min(s + 1, 2)); }
  async function submit(e) {
    e.preventDefault(); if (busy || !sendConsent) return;
    setBusy('send'); setError('');
    try { setReceipt(await post('/api/leads', { project, photos, consent: true, website: e.target.elements.website.value })); }
    catch (e) { setError(e.name === 'TimeoutError' ? 'Delivery could not be confirmed. Please contact the office before retrying.' : e.message); }
    finally { setBusy(''); }
  }
  const emailHref = 'mailto:newprimeconstruction@yahoo.com?subject=' + encodeURIComponent('Estimate request - ' + (project.location || 'New project')) + '&body=' + encodeURIComponent(summaryText(project, photos));
  return <div className="np-intake">
    <section className="np-intro"><span className="np-eyebrow">LET'S PLAN YOUR NEXT BUILD</span><h1>A better brief.<br/><em>A clearer first step.</em></h1><p>Describe your project, add photos, and prepare an estimate request. Need help finding the words? Ask the project assistant.</p><div className="np-badges"><span><Check size={15}/> NYC & Westchester</span><span><Check size={15}/> Free estimate requests</span></div></section>
    <section className="np-workspace">
      <div className="np-main">
        <ol className="np-steps" aria-label="Estimate request steps">{steps.map((s, i) => <li key={s} aria-current={step === i ? 'step' : undefined}><span>{i < step ? <Check size={15}/> : `0${i + 1}`}</span>{s}</li>)}</ol>
        {receipt ? <div className="np-success" role="status"><Check size={36}/><h2>Your request was delivered.</h2><p>Reference: {receipt.reference}. New Prime will review the information before discussing scope or pricing.</p><button className="np-button" onClick={() => download(summaryText(project, photos))}><Download size={17}/> Save a copy</button></div> : <form onSubmit={step === 2 ? submit : advance}>
          {step === 0 && <div className="np-panel"><span className="np-eyebrow">01 / START WITH THE WORK</span><h2>What do you have in mind?</h2><label className="np-field">Project description<textarea required minLength={20} maxLength={4000} rows={6} value={project.description} onChange={e => update('description', e.target.value)} placeholder="Example: Our Bronx basement gets water after heavy rain. We'd like someone to inspect the walls and discuss waterproofing."/></label><div className="np-examples">{['Basement waterproofing', 'Roof repair', 'Kitchen remodeling'].map(t => <button type="button" key={t} onClick={() => update('description', `I need help with ${t.toLowerCase()}. `)}>{t}</button>)}</div><div className="np-grid">{field('location', 'Project neighborhood or ZIP', { required: true, placeholder: 'Bronx, 10469' })}<label className="np-field">Property type<select value={project.propertyType} onChange={e => update('propertyType', e.target.value)}>{['Residential', 'Commercial', 'Mixed use', 'Other'].map(x => <option key={x}>{x}</option>)}</select></label></div><div className="np-service"><strong>Suggested starting point</strong><p>Based on words in your description; the team will confirm the right scope.</p><div>{suggestions.length ? suggestions.map(s => <Link key={s} to={'/services/' + s.toLowerCase()}>{s}<ArrowUpRight size={14}/></Link>) : <span>Add details to see a service match.</span>}</div></div></div>}
          {step === 1 && <div className="np-panel"><span className="np-eyebrow">02 / GIVE US THE CONTEXT</span><h2>A closer look at the project.</h2><div className="np-grid"><label className="np-field">Preferred timeline<select value={project.timeline} onChange={e => update('timeline', e.target.value)}><option value="">Not sure yet</option>{['As soon as possible', 'Within 1-3 months', 'Within 3-6 months', 'Just planning'].map(x => <option key={x}>{x}</option>)}</select></label>{field('budget', 'Budget range (optional)', { placeholder: 'Your planning range, if known' })}</div><label className="np-upload"><Camera size={28}/><strong>Add project photos</strong><span>Up to 3 JPG, PNG, or WebP files. 10 MB each before resizing.</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={!!busy} onChange={addPhotos}/></label><p className="np-note">Photos stay in this page until you choose AI review or send your request. Avoid including people or private documents.</p><div className="np-photos">{photos.map((p, i) => <figure key={p.name + i}><img src={p.dataUrl} alt={`Project photo: ${p.name}`}/><figcaption>{p.name}</figcaption><button type="button" aria-label={`Remove ${p.name}`} disabled={!!busy} onClick={() => { setPhotos(v => v.filter((_, j) => i !== j)); setAnalysis(null); }}><X size={16}/></button></figure>)}</div>{photos.length > 0 && <button type="button" className="np-outline" disabled={!aiConsent || !!busy} onClick={() => ask('Review the attached project photos. Describe only visible conditions, explain uncertainty, and suggest the next questions for a site visit.')}><Sparkles size={16}/> Ask AI to review photos</button>}<p className="np-note">Photo review can help describe visible conditions. Structural condition, hidden damage, and a final scope require a professional site inspection.</p></div>}
          {step === 2 && <div className="np-panel"><span className="np-eyebrow">03 / READY FOR THE TEAM</span><h2>Review your request.</h2><div className="np-review"><p>{project.description}</p><dl>{[['Location', project.location], ['Property', project.propertyType], ['Timeline', project.timeline || 'Not decided'], ['Budget', project.budget || 'Not supplied'], ['Photos', `${photos.length} attached`]].map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div><div className="np-grid">{field('name', 'Full name', { required: true, autoComplete: 'name' })}{field('email', 'Email', { required: true, type: 'email', autoComplete: 'email' })}{field('phone', 'Phone (optional)', { type: 'tel', autoComplete: 'tel' })}</div><label className="np-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label><label className="np-consent"><input type="checkbox" required checked={sendConsent} onChange={e => setSendConsent(e.target.checked)}/>I agree to share these project details, photos, and contact information with New Prime so the team can respond to my request.</label><p className="np-note">This request is not a contract, appointment confirmation, or final price quote.</p><div className="np-backups"><button type="button" className="np-outline" onClick={() => download(summaryText(project, photos))}><Download size={16}/> Download brief</button><a className="np-outline" href={emailHref}>Open email draft <ArrowUpRight size={16}/></a></div><p className="np-note">Email drafts require you to send the email and attach photos separately.</p></div>}
          {error && <div className="np-error" role="alert">{error}</div>}
          <div className="np-actions">{step > 0 && <button type="button" className="np-outline" disabled={!!busy} onClick={() => { setStep(s => s - 1); setError(''); }}><ChevronLeft size={16}/> Back</button>}<button type="submit" className="np-button" disabled={!!busy}>{busy && <LoaderCircle className="np-spin" size={17}/>} {step === 2 ? 'Send estimate request' : 'Continue'}<ArrowUpRight size={17}/></button></div>
        </form>}
      </div>
      <aside className="np-assistant" aria-label="AI project assistant"><header><span className="np-ai-icon"><Sparkles size={20}/></span><div><h2>Project assistant</h2><span>Plan the conversation.</span></div></header><div className="np-chat" ref={chatLog} role="log" aria-live="polite">{messages.map((m,i) => <p key={i} className={`np-message np-${m.role}`}>{m.content}</p>)}{busy === 'ai' && <p className="np-message" role="status">Reviewing your project.</p>}</div>{analysis && <div className="np-analysis"><strong>AI project notes</strong><p>{analysis.summary}</p><span>{analysis.services.join(' � ') || 'Team review recommended'}</span></div>}<div className="np-chat-controls"><label className="np-consent"><input type="checkbox" checked={aiConsent} onChange={e => setAiConsent(e.target.checked)}/>Allow project details and attached photos to be sent to OpenAI for AI assistance. Contact fields are excluded.</label><form onSubmit={e => { e.preventDefault(); ask(); }}><label className="np-sr" htmlFor="np-question">Ask about your project</label><textarea id="np-question" value={question} maxLength={1500} onChange={e => setQuestion(e.target.value)} rows={2} placeholder="What details should I include?"/><button aria-label="Send question" disabled={!aiConsent || !!busy || !question.trim() || messages.length >= 25}><Send size={18}/></button></form>{chatError && <p className="np-error" role="alert">{chatError}</p>}{messages.length >= 25 && <p className="np-note">Conversation limit reached. Continue your estimate request or reload to start again.</p>}<p className="np-note">AI assistance is optional. You can complete the form at any time.</p></div></aside>
    </section><section className="np-contact-strip"><MessageCircle size={22}/><div><strong>Prefer a conversation?</strong><span>Call the office at <a href="tel:7186541048">(718) 654-1048</a>.</span></div></section>
  </div>;
}
export function AssistantLauncher() { return <Link className="np-launcher" to="/contact" aria-label="Start a project with the AI assistant"><Sparkles size={20}/><span>Plan your project</span><ArrowUpRight size={16}/></Link>; }
