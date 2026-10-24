import test from 'node:test';
import assert from 'node:assert/strict';
import assistant from '../api/assistant.js';
import leads from '../api/leads.js';
import { photos } from '../api/_shared.js';
import { recommend, summaryText } from '../src/intake.js';
const valid = { description:'Water enters our basement after heavy rainfall.', location:'Bronx 10469', propertyType:'Residential', name:'Test Customer', email:'test@example.com' };
let ip = 0;
function req(data, override = {}) { return {method:'POST',headers:{'content-type':'application/json',host:'example.test',origin:'https://example.test','x-forwarded-for':`test-${++ip}`},body:data,...override}; }
function res() { return {code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(data){this.data=data;return this;}}; }
test('text recommendations support multiple categories and no false default', () => {
  assert.deepEqual(recommend('Basement waterproofing, beam repair, and kitchen remodeling'),['Foundation','Structural','Exterior','Interior']);
  assert.deepEqual(recommend('I need assistance with a project'),[]);
});
test('download makes missing data and email photo limitations explicit', () => {
  const text = summaryText(valid,[{name:'wall.jpg'}]);
  assert.match(text,/wall.jpg/); assert.match(text,/attached separately/); assert.match(text,/Phone: Not supplied/);
});
test('photo validator rejects disguised file types and excessive photos', () => {
  assert.throws(() => photos([{dataUrl:'data:image/jpeg;base64,SGVsbG8='}]),/contents/);
  assert.throws(() => photos([1,2,3,4]),/three/);
  assert.throws(() => photos([{dataUrl:'https://remote.example/photo.png'}]),/Invalid image/);
});
test('handlers reject cross-origin, wrong method, and missing consent', async () => {
  let out=res(); await assistant(req({}, {method:'GET'}),out); assert.equal(out.code,405);
  out=res(); const cross=req({}); cross.headers.origin='https://attacker.test'; await assistant(cross,out); assert.equal(out.code,403);
  out=res(); await leads(req({project:valid,consent:false}),out); assert.equal(out.code,400);
});
test('unconfigured services never report successful delivery or AI analysis', async () => {
  const oldKey=process.env.OPENAI_API_KEY, oldHook=process.env.LEAD_WEBHOOK_URL;
  delete process.env.OPENAI_API_KEY; delete process.env.LEAD_WEBHOOK_URL;
  try {
    let out=res(); await assistant(req({project:valid,consent:true,messages:[{role:'user',content:'What should I include?'}]}),out); assert.equal(out.code,503);
    out=res(); await leads(req({project:valid,consent:true}),out); assert.equal(out.code,503); assert.equal(out.data.reference,undefined);
  } finally { if(oldKey)process.env.OPENAI_API_KEY=oldKey; if(oldHook)process.env.LEAD_WEBHOOK_URL=oldHook; }
});
test('lead validation rejects invalid email and missing scope', async () => {
  for(const project of [{...valid,email:'invalid'},{...valid,description:'Short'}]) { const out=res(); await leads(req({project,consent:true}),out); assert.equal(out.code,400); }
});
test('lead delivery acknowledges only after upstream success and forwards contact consent', async () => {
  const oldFetch=globalThis.fetch, oldHook=process.env.LEAD_WEBHOOK_URL;
  process.env.LEAD_WEBHOOK_URL='https://configured.example/leads';
  try {
    let sent;
    globalThis.fetch=async (url,options) => { sent=JSON.parse(options.body); assert.equal(options.redirect,'error'); return {ok:true}; };
    const out=res(); await leads(req({project:valid,consent:true,photos:[]}),out);
    assert.equal(out.code,201); assert.equal(sent.reference,out.data.reference); assert.equal(sent.project.email,valid.email); assert.equal(sent.consent.contact,true);
    globalThis.fetch=async()=>({ok:false}); const failed=res(); await leads(req({project:valid,consent:true}),failed); assert.equal(failed.code,502); assert.equal(failed.data.reference,undefined);
  } finally { globalThis.fetch=oldFetch; if(oldHook)process.env.LEAD_WEBHOOK_URL=oldHook; else delete process.env.LEAD_WEBHOOK_URL; }
});
test('AI uses real image input and excludes separate contact fields', async () => {
  const oldFetch=globalThis.fetch, oldKey=process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY='test-only';
  const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4bkAAAAASUVORK5CYII=';
  try {
    globalThis.fetch=async (url,options)=>{
      assert.equal(url,'https://api.openai.com/v1/responses'); const data=JSON.parse(options.body);
      assert.equal(data.store,false); assert.equal(data.input[0].content[1].type,'input_image');
      assert.ok(!JSON.stringify(data.input).includes('test@example.com')); assert.ok(!JSON.stringify(data.input).includes('Test Customer'));
      return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({reply:'When does water appear?',summary:'Customer reports rain-related water entry.',services:['Foundation']})}]}]})};
    };
    const out=res(); await assistant(req({project:valid,photos:[{name:'test.png',dataUrl:png}],messages:[{role:'user',content:'Review this photo.'}],consent:true}),out);
    assert.equal(out.code,200); assert.deepEqual(out.data.services,['Foundation']);
    globalThis.fetch=async()=>({ok:true,json:async()=>({status:'incomplete'})});
    const partial=res(); await assistant(req({project:valid,messages:[{role:'user',content:'Help'}],consent:true}),partial); assert.equal(partial.code,502);
  } finally { globalThis.fetch=oldFetch; if(oldKey)process.env.OPENAI_API_KEY=oldKey; else delete process.env.OPENAI_API_KEY; }
});
test('per-instance AI rate limit rejects excess requests', async () => {
  const request=req({consent:false});
  let out;
  for(let i=0;i<9;i++){out=res();await assistant(request,out);}
  assert.equal(out.code,429);
});
