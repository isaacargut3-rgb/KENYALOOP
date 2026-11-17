/* NyumbaLoop – Find. View. Move in. MVP prototype (static front-end).
 * No backend: sample data + localStorage stand in for the API/database described in the SRS (sections 9–10).
 * Requirement IDs (SRCH-xx, LIST-xx, VER-xx, COMM-xx, SAFE-xx, ADM-xx) are referenced in comments.
 */
(() => {
'use strict';

/* ───────── Utilities ───────── */
const DAY = 864e5;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kes = n => 'KES ' + Number(n).toLocaleString('en-KE');
const daysAgo = ts => Math.floor((Date.now() - ts) / DAY);
const fmtDate = ts => new Date(ts).toLocaleDateString('en-KE', {day:'numeric', month:'short', year:'numeric'});
const fmtDT = ts => new Date(ts).toLocaleString('en-KE', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});
const rel = ts => { const m = Math.floor((Date.now() - ts) / 6e4); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const h = Math.floor(m / 60); if (h < 24) return h + ' h ago'; const d = Math.floor(h / 24); return d + ' day' + (d > 1 ? 's' : '') + ' ago'; };
const ago = d => Date.now() - d * DAY;
const uid = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
const PHONE_RE = /^(?:\+254|254|0)[17]\d{8}$/;

/* ───────── Reference data ───────── */
const TYPES = {room:'Single room', shared:'Shared room', bedsitter:'Bedsitter', studio:'Studio', '1br':'1 bedroom', '2br':'2 bedrooms', '3br':'3+ bedrooms'};
const STATUS = {draft:'Draft', submitted:'In moderation', changes_requested:'Changes requested', published:'Published', paused:'Paused', expired:'Expired', rejected:'Rejected', let:'Let / off-market'};
const ESTATES = ['Kilimani','Kileleshwa','Lavington','Westlands','South B','South C','Roysambu','Juja','Kasarani','Ruaka','Syokimau','Ongata Rongai','Umoja','Embakasi','Parklands'];
// Spelling variations common in Kenyan estate search (SRCH-02)
const ALIASES = {'sth b':'south b','southb':'south b','sth c':'south c','southc':'south c','rongai':'ongata rongai','kilimani':'kilimani','kileleshwa':'kileleshwa','kileshwa':'kileleshwa','westie':'westlands','roysa':'roysambu','ruaka':'ruaka','syo':'syokimau'};
const VERIFY = { // Approved definitions (SRS section 8); badge text is controlled here, never free text (VER-05)
  phone:    {label:'Phone verified',     does:'The account controls a verified phone number.', not:'Does not prove identity, ownership or authority.', valid:365},
  identity: {label:'Identity checked',   does:'An approved identity-check process was completed on the named advertiser.', not:'Does not prove property ownership or authority to advertise.', valid:365},
  authority:{label:'Authority reviewed', does:'The platform reviewed evidence of the advertiser’s relationship or authority concerning this property.', not:'Does not replace a legal title search or legal opinion.', valid:365},
  visited:  {label:'Property visited',   does:'A documented inspection/visit occurred on the stated date and scope.', not:'Does not guarantee condition, future availability or legal title.', valid:180},
  available:{label:'Availability confirmed', does:'The advertiser reconfirmed availability on the displayed date.', not:'Does not guarantee the property remains available after that time.', valid:14}
};
const CONFIRM_WARN = 14, CONFIRM_PAUSE = 21; // LIST-08: label as unconfirmed after 14 days, auto-pause after 21 (configurable)

/* ───────── Seed data ───────── */
const SEED_AGENTS = [
  {id:'a1', name:'Wanjiku Mwangi', kind:'Agent', agency:'Kilimani Key Realtors', phone:'0712345001', email:'wanjiku@example.co.ke', bio:'Residential lettings across Kilimani, Kileleshwa and Lavington for 6 years.', since:2021, ver:{phone:ago(120), identity:ago(110)}},
  {id:'a2', name:'Otieno Okello', kind:'Individual landlord', agency:'', phone:'0722345002', email:'otieno@example.co.ke', bio:'Owner of small apartment blocks in South B and South C.', since:2023, ver:{phone:ago(60), identity:ago(40)}},
  {id:'a3', name:'Amani Homes Ltd', kind:'Agency', agency:'Amani Homes Ltd', phone:'0733345003', email:'lettings@amani.example.co.ke', bio:'Managed rentals in Ruaka, Roysambu and Kasarani. Team of 5 agents.', since:2020, ver:{phone:ago(300), identity:ago(380)}},
  {id:'a4', name:'Kevin Kiprono', kind:'Agent', agency:'', phone:'0701345004', email:'kevin@example.co.ke', bio:'New on the platform. Listings in Syokimau and Rongai.', since:2026, ver:{phone:ago(9)}}
];
const L = (id, o) => ({id, tenure:'rent', status:'published', featured:false, photos:6, parking:'Unknown', security:'Unknown', caretaker:'Unknown', water:'Unknown', power:'Unknown', deposit:'Unknown', authority:null, visited:null, ...o});
const SEED_LISTINGS = [
  L('l1',{title:'Sunlit 2-bedroom with balcony near Yaya Centre', estate:'Kilimani', sub:'Dagoretti North', county:'Nairobi', type:'2br', beds:2, baths:2, price:75000, furnished:false, deposit:'2 months’ rent + 1 month agent fee', water:'Nairobi Water + borehole backup', power:'KPLC prepaid meter', parking:'1 covered bay', security:'24h guard, CCTV, electric fence', caretaker:'On site, weekdays', desc:'Bright corner unit on the 4th floor with a lift, generator backup and a children’s play area. Walkable to Yaya Centre and Argwings Kodhek Road matatu stage.', agent:'a1', confirmed:ago(2), authority:ago(25), visited:{at:ago(30), scope:'Unit and common areas'}, posted:ago(12), hue:150, featured:true}),
  L('l2',{title:'Affordable bedsitter, tarmac road, steady water', estate:'South B', sub:'Starehe', county:'Nairobi', type:'bedsitter', beds:1, baths:1, price:11500, furnished:false, deposit:'1 month’s rent', water:'Nairobi Water, 5 days a week', power:'KPLC prepaid meter', parking:'Street, free', security:'Gated, night guard', caretaker:'Yes', desc:'Self-contained bedsitter with tiled floor and shared compound. Five minutes to Mombasa Road stage.', agent:'a2', confirmed:ago(5), authority:ago(35), visited:null, posted:ago(20), hue:30}),
  L('l3',{title:'Modern 1-bedroom, furnished, Ruaka', estate:'Ruaka', sub:'Kiambaa', county:'Kiambu', type:'1br', beds:1, baths:1, price:32000, furnished:true, deposit:'1 month’s rent', water:'Borehole, 24h', power:'KPLC prepaid + solar water heating', parking:'1 bay', security:'Gated, CCTV', caretaker:'Yes', desc:'Furnished one-bedroom with fibre-ready wiring. Close to Two Rivers Mall.', agent:'a3', confirmed:ago(1), authority:ago(60), visited:{at:ago(45), scope:'Unit only'}, posted:ago(8), hue:200, featured:true}),
  L('l4',{title:'Spacious 3-bedroom maisonette, Lavington', estate:'Lavington', sub:'Dagoretti North', county:'Nairobi', type:'3br', beds:3, baths:3, price:160000, furnished:false, deposit:'2 months’ rent', water:'Nairobi Water + borehole', power:'KPLC, generator', parking:'3 bays', security:'24h guard, electric fence, alarm', caretaker:'Not applicable', desc:'Quiet gated community maisonette with DSQ, private garden and ample parking.', agent:'a1', confirmed:ago(3), authority:ago(50), visited:{at:ago(50), scope:'Unit and compound'}, posted:ago(15), hue:95}),
  L('l5',{title:'Cosy studio near UoN, Parklands', estate:'Parklands', sub:'Westlands', county:'Nairobi', type:'studio', beds:1, baths:1, price:28000, furnished:true, deposit:'1 month’s rent', water:'Nairobi Water, daily', power:'KPLC prepaid', parking:'Not applicable', security:'Guard, CCTV', caretaker:'Yes', desc:'Compact furnished studio ideal for a single professional. Walking distance to Aga Khan University Hospital.', agent:'a3', confirmed:ago(6), authority:ago(90), visited:null, posted:ago(30), hue:260}),
  L('l6',{title:'2-bedroom apartment, Roysambu, Thika Road', estate:'Roysambu', sub:'Roysambu', county:'Nairobi', type:'2br', beds:2, baths:1, price:28000, furnished:false, deposit:'1 month’s rent', water:'Nairobi Water, 4 days a week; storage tank', power:'KPLC prepaid', parking:'Ample', security:'Gated, guard', caretaker:'Yes', desc:'Close to TRM and Thika Road stage. Newly painted with tiled floors.', agent:'a3', confirmed:ago(17), authority:null, visited:null, posted:ago(40), hue:340}),
  L('l7',{title:'1-bedroom in Kileleshwa, near Oloitoktok Rd', estate:'Kileleshwa', sub:'Dagoretti North', county:'Nairobi', type:'1br', beds:1, baths:1, price:45000, furnished:false, deposit:'2 months’ rent', water:'Nairobi Water + borehole', power:'KPLC prepaid', parking:'1 bay', security:'24h guard', caretaker:'Yes', desc:'Quiet, tree-lined street, lift, backup generator, rooftop access.', agent:'a1', confirmed:ago(4), authority:ago(20), visited:{at:ago(18), scope:'Unit and common areas'}, posted:ago(9), hue:120}),
  L('l8',{title:'3-bedroom bungalow, Syokimau', estate:'Syokimau', sub:'Mavoko', county:'Machakos', type:'3br', beds:3, baths:2, price:55000, furnished:false, deposit:'2 months’ rent', water:'Borehole', power:'KPLC prepaid', parking:'2 bays', security:'Gated community, guard', caretaker:'Not applicable', desc:'Standalone bungalow close to Syokimau SGR station, quiet cul-de-sac.', agent:'a4', confirmed:ago(2), authority:null, visited:null, posted:ago(6), hue:60}),
  L('l9',{title:'Budget 1-bedroom, Ongata Rongai', estate:'Ongata Rongai', sub:'Kajiado North', county:'Kajiado', type:'1br', beds:1, baths:1, price:14000, furnished:false, deposit:'1 month’s rent', water:'Borehole, daily', power:'KPLC prepaid', parking:'Street', security:'Gated', caretaker:'Yes', desc:'Neat one-bedroom close to Tuskys Rongai, matatu route to town.', agent:'a4', confirmed:ago(8), authority:null, visited:null, posted:ago(14), hue:15}),
  L('l10',{title:'Bright 2-bedroom, Umoja 1', estate:'Umoja', sub:'Embakasi North', county:'Nairobi', type:'2br', beds:2, baths:1, price:22000, furnished:false, deposit:'1 month’s rent', water:'Nairobi Water, 3 days a week', power:'KPLC prepaid', parking:'Street', security:'Gated, guard', caretaker:'Yes', desc:'Ground-floor unit with private entrance and small kitchen garden.', agent:'a2', confirmed:ago(10), authority:ago(70), visited:null, posted:ago(25), hue:175}),
  L('l11',{title:'Executive 3-bedroom in Westlands', estate:'Westlands', sub:'Westlands', county:'Nairobi', type:'3br', beds:3, baths:3, price:130000, furnished:true, deposit:'2 months’ rent', water:'Nairobi Water + borehole', power:'KPLC, full generator backup', parking:'2 bays', security:'24h guard, access control, CCTV', caretaker:'Property manager', desc:'Fully furnished apartment with gym and pool access. 5 minutes to Sarit Centre.', agent:'a3', confirmed:ago(3), authority:ago(30), visited:{at:ago(28), scope:'Unit and amenities'}, posted:ago(5), hue:230, featured:true}),
  L('l12',{title:'Studio, Kasarani near Safaricom Stadium', estate:'Kasarani', sub:'Kasarani', county:'Nairobi', type:'studio', beds:1, baths:1, price:16000, furnished:false, deposit:'1 month’s rent', water:'Nairobi Water, daily', power:'KPLC prepaid', parking:'Ample', security:'Guard', caretaker:'Yes', desc:'Modern studio in a new block, tiled, with fitted kitchen.', agent:'a3', confirmed:ago(7), authority:ago(55), visited:null, posted:ago(18), hue:285}),
  L('l13',{title:'2-bedroom, South C near Nyayo Estate', estate:'South C', sub:'Lang’ata', county:'Nairobi', type:'2br', beds:2, baths:2, price:42000, furnished:false, deposit:'2 months’ rent', water:'Nairobi Water, daily', power:'KPLC prepaid', parking:'1 bay', security:'24h guard, CCTV', caretaker:'Yes', desc:'Well-maintained block with lift. Close to Wilson Airport and Mombasa Road.', agent:'a2', confirmed:ago(1), authority:ago(15), visited:{at:ago(14), scope:'Unit and common areas'}, posted:ago(4), hue:45}),
  L('l14',{title:'Newly built 1-bedroom, Embakasi', estate:'Embakasi', sub:'Embakasi Central', county:'Nairobi', type:'1br', beds:1, baths:1, price:19000, furnished:false, deposit:'1 month’s rent', water:'Nairobi Water', power:'KPLC prepaid', parking:'Ample', security:'Gated', caretaker:'Yes', desc:'Close to Jomo Kenyatta International Airport and Eastern Bypass.', agent:'a4', confirmed:ago(2), authority:null, visited:null, posted:ago(2), hue:5}),
  L('l17',{title:'Single room with shared bathroom, near JKUAT gate', estate:'Juja', sub:'Juja', county:'Kiambu', type:'room', beds:1, baths:1, price:6500, furnished:false, deposit:'1 month’s rent', water:'Borehole, daily', power:'KPLC prepaid, shared meter', parking:'Not applicable', security:'Gated, night guard', caretaker:'Yes', desc:'Tiled single room in a student-friendly plot. Walkable to the main gate; matatu stage 3 minutes away. Utilities itemised in the lease.', agent:'a3', confirmed:ago(3), authority:ago(40), visited:{at:ago(33), scope:'Room and shared facilities'}, posted:ago(3), hue:190}),
  L('l18',{title:'Shared 2-bedroom, one room available, Roysambu', estate:'Roysambu', sub:'Roysambu', county:'Nairobi', type:'shared', beds:1, baths:1, price:9000, furnished:true, deposit:'1 month’s rent', water:'Nairobi Water, 4 days a week; storage tank', power:'KPLC prepaid, shared', parking:'Unknown', security:'Gated, guard', caretaker:'Yes', desc:'One furnished room in a shared two-bedroom with two other tenants (all young professionals). Rent excludes internet.', agent:'a3', confirmed:ago(4), authority:ago(45), visited:null, posted:ago(7), hue:310}),
  // Pending moderation (visible only in Moderator console and to owner)
  L('l15',{title:'2-bedroom with sea-view style balcony, Kilimani', estate:'Kilimani', sub:'Dagoretti North', county:'Nairobi', type:'2br', beds:2, baths:2, price:68000, furnished:false, deposit:'2 months’ rent', water:'Nairobi Water', power:'KPLC prepaid', parking:'1 bay', security:'Guard', caretaker:'Yes', desc:'Newly submitted by agent for moderation.', agent:'a1', status:'submitted', confirmed:ago(0), posted:ago(0), hue:130}),
  L('l16',{title:'3-bedroom villa, Karen (price looks unusually low)', estate:'Lavington', sub:'Dagoretti North', county:'Nairobi', type:'3br', beds:3, baths:3, price:35000, furnished:false, deposit:'Pay 3 months before viewing', water:'Unknown', power:'Unknown', desc:'Submitted by a new account. Flagged by the system for review.', agent:'a4', status:'submitted', confirmed:ago(0), posted:ago(1), hue:0})
];
const SEED_REPORTS = [
  {id:'R-1001', targetType:'listing', target:'l9', category:'Asked for payment before viewing', desc:'Agent asked me to send KES 14,000 on M-Pesa to “reserve” the house before seeing it.', by:'u2', at: Date.now() - 5 * 36e5, status:'open', priority:'high'},
  {id:'R-1002', targetType:'listing', target:'l6', category:'Listing is no longer available', desc:'Called the caretaker and the unit has been taken.', by:'u3', at: Date.now() - 30 * 36e5, status:'open', priority:'normal'}
];
const SEED_AUDIT = [{at:Date.now() - 2 * DAY, actor:'System', action:'Seed data loaded', detail:'Prototype initialised'}];

/* ───────── State (localStorage with safe fallback) ───────── */
const KEY = 'nyumbaloop_v1';
let mem = null;
const load = () => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} return mem; };
const save = () => { mem = S; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
let S = load() || {role:'visitor', saved:[], enquiries:[], viewings:[], reports:SEED_REPORTS, audit:SEED_AUDIT, listings:SEED_LISTINGS, agents:SEED_AGENTS, notifications:[]};
save();
const RENTER = {id:'u1', name:'Amina Njeri'};
const ME_AGENT = 'a1'; // demo advertiser = Wanjiku
const agentOf = id => S.agents.find(a => a.id === id);
const listing = id => S.listings.find(l => l.id === id);
const audit = (action, detail) => { S.audit.unshift({at:Date.now(), actor:S.role === 'moderator' ? 'Moderator (demo)' : S.role, action, detail}); save(); };

/* ───────── Domain logic ───────── */
const lAge = l => daysAgo(l.confirmed);
const isPublic = l => l.status === 'published' && lAge(l) <= CONFIRM_PAUSE; // SRCH-01, LIST-08, LIST-10
const needsReconfirm = l => l.status === 'published' && lAge(l) > CONFIRM_WARN;
function badgesFor(l) { // VER-01/02/05/06: each check shown separately, with date, expiring
  const a = agentOf(l.agent), out = [];
  const add = (key, at, extra) => {
    const age = at ? daysAgo(at) : null;
    if (!at) out.push({key, state:'none', text:VERIFY[key].label + ': not yet', tip:'No check on record. ' + VERIFY[key].not});
    else if (age > VERIFY[key].valid) out.push({key, state:'off', text:VERIFY[key].label + ' (expired)', tip:'Last checked ' + fmtDate(at) + '. This check has expired and is no longer shown as current.'});
    else out.push({key, state:key === 'available' && age > 7 ? 'warn' : 'ok', text:VERIFY[key].label, date:at, tip:VERIFY[key].does + ' ' + (extra || '') + ' On ' + fmtDate(at) + '. ' + VERIFY[key].not});
  };
  add('phone', a.ver.phone);
  add('identity', a.ver.identity);
  add('authority', l.authority);
  add('visited', l.visited?.at, l.visited ? 'Scope: ' + l.visited.scope + '.' : '');
  add('available', l.confirmed);
  return out;
}
const badgeHTML = (b, full) => `<span class="badge ${b.state === 'ok' ? '' : b.state}" title="${esc(b.tip)}" tabindex="0">${b.state === 'ok' ? '✓ ' : b.state === 'warn' ? '! ' : ''}${esc(b.text)}${full && b.date ? ' · ' + fmtDate(b.date) : ''}</span>`;
const lvl = l => badgesFor(l).filter(b => b.state === 'ok' && b.key !== 'phone');

/* Fuzzy search (SRCH-02) */
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function lev(a, b) { if (Math.abs(a.length - b.length) > 1) return 9; const d = Array.from({length:a.length + 1}, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)); return d[a.length][b.length]; }
function matchText(l, q) {
  q = norm(q); if (!q) return true;
  for (const [k, v] of Object.entries(ALIASES)) if (q.includes(k)) q = q.replace(k, v);
  const hay = norm([l.title, l.estate, l.sub, l.county, l.desc, TYPES[l.type]].join(' '));
  const words = hay.split(' ');
  return q.split(' ').every(t => hay.includes(t) || (t.length >= 4 && words.some(w => w.length >= 4 && lev(t, w) <= 1)));
}

/* ───────── Router ───────── */
const main = $('#main');
function parseHash() { const h = location.hash.replace(/^#/, '') || '/'; const [path, qs = ''] = h.split('?'); return {path, params:Object.fromEntries(new URLSearchParams(qs)), parts:path.split('/').filter(Boolean)}; }
const qsOf = o => { const p = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v !== '' && v != null && v !== false) p.set(k, v); }); return p.toString(); };
function go(path) { location.hash = path; }

function route() {
  const {path, params, parts} = parseHash();
  closeModal();
  let html, nav = parts[0] || 'home';
  const [a, b] = parts;
  if (!a) html = vHome();
  else if (a === 'search') html = vSearch(params);
  else if (a === 'listing') html = vListing(b);
  else if (a === 'agent') html = vAgent(b);
  else if (a === 'verification') html = vVerification();
  else if (a === 'safety') html = vSafety();
  else if (a === 'saved') html = vSaved();
  else if (a === 'activity') html = vActivity();
  else if (a === 'advertiser') html = guard(['advertiser'], () => b === 'new' ? vWizard(params) : vDashboard(params));
  else if (a === 'admin') html = guard(['moderator'], () => vAdmin(params));
  else if (a === 'list') html = vList();
  else if (a === 'report') html = vReportPage();
  else if (['about','contact','terms','privacy'].includes(a)) html = vStatic(a);
  else html = vError('404', 'Page not found', 'That page does not exist or has moved.');
  main.innerHTML = html;
  $$('.nav a').forEach(x => x.classList.toggle('active', x.dataset.nav === nav));
  document.title = nav === 'home' ? 'NyumbaLoop – Find. View. Move in.' : (main.querySelector('h1')?.textContent || '') + ' – NyumbaLoop';
  window.scrollTo(0, 0);
  bindView(path);
  syncChrome();
}
function guard(roles, fn) {
  if (roles.includes(S.role)) return fn();
  return vError('403', 'Access denied', `This area is for ${roles.join('/')} accounts. Use the role switcher at the top of the page to preview it (demo only). In production, access is enforced server-side with RBAC (SRS §3.1).`);
}
const vError = (code, t, m) => `<div class="wrap page-head"><div class="empty"><h1>${code}</h1><h2>${esc(t)}</h2><p>${m}</p><a class="btn" href="#/">Back to home</a></div></div>`;

/* ───────── Reusable view pieces ───────── */
const house = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16 16 5l13 11v11a1 1 0 0 1-1 1h-7v-9h-10v9H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>';
const bg = (h, i = 0) => `background:linear-gradient(${135 + i * 25}deg,hsl(${(h + i * 12) % 360} 45% 38%),hsl(${(h + 40 + i * 12) % 360} 50% 26%))`;
function cardHTML(l) {
  const a = agentOf(l.agent), saved = S.saved.includes(l.id), bs = lvl(l);
  return `<article class="card">
    <div class="photo" style="${bg(l.hue)}">${house}
      ${l.featured ? '<span class="ribbon">Featured · verified</span>' : ''}
      <button class="save-btn" data-act="save" data-id="${l.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save'} ${esc(l.title)}">${saved ? '♥' : '♡'}</button>
      <span class="count">${l.photos} photos</span></div>
    <div class="body">
      <div class="price">${kes(l.price)} <small>/ month</small></div>
      <a class="title" href="#/listing/${l.id}">${esc(l.title)}</a>
      <div class="meta"><span>📍 ${esc(l.estate)}, ${esc(l.county)}</span><span>${TYPES[l.type]}</span><span>${l.furnished ? 'Furnished' : 'Unfurnished'}</span></div>
      <div class="badges">${bs.length ? bs.slice(0, 3).map(b => badgeHTML(b)).join('') : '<span class="badge none" title="No identity, authority or inspection check completed yet.">Not yet verified</span>'}${needsReconfirm(l) ? '<span class="badge warn" title="Not reconfirmed in the last 14 days. Ask before travelling.">Availability unconfirmed</span>' : ''}</div>
      <div class="muted small">By <a href="#/agent/${a.id}">${esc(a.name)}</a> · confirmed ${rel(l.confirmed)}</div>
    </div></article>`;
}
function typeOptions(sel = '') { return '<option value="">Any type</option>' + Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${sel === k ? 'selected' : ''}>${v}</option>`).join(''); }

/* ───────── Views ───────── */
function vHome() {
  const feat = S.listings.filter(l => isPublic(l) && l.featured);
  const newest = S.listings.filter(isPublic).sort((a, b) => b.posted - a.posted || a.id.localeCompare(b.id)).slice(0, 6);
  return `
  <section class="hero"><div class="wrap">
    <span class="principle">Find. View. Move in.</span>
    <h1>Find a home that<br>fits your life.</h1>
    <p class="lead">See what has been checked before you contact an advertiser. We show which checks were done and when. We never claim a listing is “100% verified”, and we never hold your deposit.</p>
  </div></section>
  <div class="wrap">
    <form class="searchbox" id="homeSearch" role="search" aria-label="Search rentals">
      <div><label for="q">Where would you like to live?</label><input id="q" name="q" list="estates" placeholder="Estate, town or neighbourhood, e.g. Kilimani" autocomplete="off"><datalist id="estates">${ESTATES.map(e => `<option value="${e}">`).join('')}</datalist></div>
      <div><label for="type">Property type</label><select id="type" name="type">${typeOptions()}</select></div>
      <div><label for="min">Min (KES)</label><input id="min" name="min" type="number" min="0" step="1000" inputmode="numeric" placeholder="0"></div>
      <div><label for="max">Max (KES)</label><input id="max" name="max" type="number" min="0" step="1000" inputmode="numeric" placeholder="Any"></div>
      <button class="btn" type="submit">Search</button>
    </form>
    <div class="chips" aria-label="Quick filters">${Object.entries(TYPES).map(([k, v]) => `<a class="chip" href="#/search?type=${k}">${v}</a>`).join('')}<a class="chip" href="#/search?furn=1">Furnished</a><a class="chip" href="#/search?max=20000">Under KES 20,000</a></div>

    <section class="block"><h2>Featured verified listings</h2>
      <p class="muted small">Featured placement is editorial for now. If paid boosts launch later they will be clearly labelled, and payment can never buy or override a verification badge.</p>
      <div class="cards">${feat.map(cardHTML).join('')}</div></section>

    <section class="block"><h2>Newest listings</h2><div class="cards">${newest.map(cardHTML).join('')}</div>
      <p style="margin-top:18px"><a class="btn ghost" href="#/search">Browse all ${S.listings.filter(isPublic).length} listings</a></p></section>

    <section class="block"><h2>Homes for every household</h2>
      <div class="audience">
        <a class="panel" href="#/search?type=room"><b>Students &amp; first-time renters</b>Single rooms, bedsitters and shared rooms with clear deposit and utility details.</a>
        <a class="panel" href="#/search?type=1br"><b>Young professionals</b>Search by estate near work, transport and services.</a>
        <a class="panel" href="#/search?type=3br"><b>Families</b>Bedrooms, parking, water and power information up front.</a>
        <a class="panel" href="#/safety"><b>Kenyans abroad</b>Dated checks, a clear scope for each badge and remote viewing requests.</a>
      </div></section>

    <section class="block"><div class="cta-band"><div><h2>List your property. Reach the right people.</h2><p>Landlords and agents: publish, pause and reconfirm listings, and answer enquiries and viewing requests in one dashboard.</p></div><a class="btn gold" href="#/list">List your property</a></div></section>

    <section class="block"><div class="layout" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <div class="panel"><h3>See what has been checked</h3><p>Five separate checks, each with a date and a plain-English explanation of what it does <em>and does not</em> prove.</p><a href="#/verification">How verification works →</a></div>
      <div class="panel"><h3>Spotted something suspicious?</h3><p>Every listing and advertiser profile has a Report button. We aim for first review within 24 hours in staffed support hours.</p><a href="#/report">Report a listing →</a></div>
      <div class="panel"><h3>Renting safely</h3><p>View the property and confirm the details before making any payment. Meet at the property in daylight.</p><a href="#/safety">Visit the Safety centre →</a></div>
    </div></section>
  </div>`;
}

function vSearch(p) {
  const f = {q:p.q || '', type:p.type || '', min:p.min || '', max:p.max || '', furn:p.furn || '', sort:p.sort || 'new', page:Math.max(1, parseInt(p.page) || 1)};
  let rs = S.listings.filter(isPublic).filter(l => matchText(l, f.q) && (!f.type || l.type === f.type) && (!f.min || l.price >= +f.min) && (!f.max || l.price <= +f.max) && (!f.furn || l.furnished));
  const cmp = {new:(a, b) => b.posted - a.posted, lo:(a, b) => a.price - b.price, hi:(a, b) => b.price - a.price}[f.sort] || ((a, b) => b.posted - a.posted);
  rs.sort((a, b) => cmp(a, b) || a.id.localeCompare(b.id)); // stable tie-break → no duplicates across pages (SRCH-04)
  const PER = 6, pages = Math.max(1, Math.ceil(rs.length / PER)); f.page = Math.min(f.page, pages);
  const slice = rs.slice((f.page - 1) * PER, f.page * PER);
  const link = pg => '#/search?' + qsOf({...f, page:pg === 1 ? '' : pg, sort:f.sort === 'new' ? '' : f.sort});
  const pager = pages > 1 ? `<nav class="pager" aria-label="Pagination">${Array.from({length:pages}, (_, i) => `<a class="chip ${i + 1 === f.page ? 'on' : ''}" href="${link(i + 1)}" ${i + 1 === f.page ? 'aria-current="page"' : ''}>${i + 1}</a>`).join('')}</nav>` : '';
  const hasFilter = f.q || f.type || f.min || f.max || f.furn;
  return `<div class="wrap page-head"><h1>Browse rentals</h1></div>
  <div class="wrap layout side">
    <form class="panel sticky" id="filterForm" aria-label="Filters">
      <h3>Filters</h3>
      <div class="field"><label for="fq">Estate, town or keyword</label><input id="fq" name="q" value="${esc(f.q)}" list="estates" placeholder="Kilimani, Ruaka…"><datalist id="estates">${ESTATES.map(e => `<option value="${e}">`).join('')}</datalist></div>
      <div class="field"><label for="ft">Property type</label><select id="ft" name="type">${typeOptions(f.type)}</select></div>
      <div class="grid2"><div class="field"><label for="fmin">Min KES</label><input id="fmin" name="min" type="number" min="0" step="1000" value="${esc(f.min)}"></div><div class="field"><label for="fmax">Max KES</label><input id="fmax" name="max" type="number" min="0" step="1000" value="${esc(f.max)}"></div></div>
      <label class="check field"><input type="checkbox" name="furn" value="1" ${f.furn ? 'checked' : ''}> Furnished only</label>
      <div class="field"><label for="fs">Sort by</label><select id="fs" name="sort"><option value="new" ${f.sort === 'new' ? 'selected' : ''}>Newest</option><option value="lo" ${f.sort === 'lo' ? 'selected' : ''}>Price: low to high</option><option value="hi" ${f.sort === 'hi' ? 'selected' : ''}>Price: high to low</option></select></div>
      <button class="btn" type="submit" style="width:100%">Apply filters</button>
      ${hasFilter ? '<a class="btn ghost" style="width:100%;margin-top:8px" href="#/search">Clear all filters</a>' : ''}
    </form>
    <div>
      <div class="toolbar"><strong aria-live="polite">${rs.length} listing${rs.length === 1 ? '' : 's'} found</strong><span class="muted small">Only published, unexpired, non-suspended listings are shown.</span></div>
      ${slice.length ? `<div class="cards">${slice.map(cardHTML).join('')}</div>${pager}` : `<div class="empty"><h2>No listings match those filters</h2><p>Try a nearby estate, widen your budget, or remove the property type.</p><a class="btn" href="#/search">Clear all filters</a></div>`}
    </div></div>`;
}

function vListing(id) {
  const l = listing(id);
  const owner = S.role === 'advertiser' && l && l.agent === ME_AGENT, mod = S.role === 'moderator';
  if (!l || (!isPublic(l) && !owner && !mod)) return vError('404', 'Listing unavailable', 'This listing is not available. It may have been let, paused, expired or removed.');
  const a = agentOf(l.agent), saved = S.saved.includes(l.id), bs = badgesFor(l);
  const U = v => (!v || v === 'Unknown') ? '<span class="unknown">Not provided</span>' : esc(v);
  return `<div class="wrap page-head"><div class="crumbs"><a href="#/">Home</a> › <a href="#/search">Browse</a> › ${esc(l.estate)}</div>
    ${!isPublic(l) ? `<div class="notice bad"><b>Status: ${STATUS[l.status]}.</b> This listing is not visible to the public.</div>` : ''}
    <h1>${esc(l.title)}</h1><p class="muted">📍 ${esc(l.estate)}, ${esc(l.sub)}, ${esc(l.county)} County</p></div>
  <div class="wrap layout detail">
    <div>
      <div class="gallery">${[0, 1, 2].map(i => `<div class="photo" style="${bg(l.hue, i)}">${house}${i === 0 ? `<span class="count">${l.photos} photos</span>` : ''}</div>`).join('')}</div>
      <p class="muted small">Sample illustration. Real listings require uploaded photos, compressed and stripped of metadata (LIST-05).</p>
      <section class="panel" style="margin-top:16px"><h2>${kes(l.price)} <small class="muted" style="font:500 1rem var(--font)">per month</small></h2>
        <dl class="specs"><dt>Type</dt><dd>${TYPES[l.type]} · to rent</dd><dt>Bedrooms / baths</dt><dd>${l.beds} / ${l.baths}</dd><dt>Furnishing</dt><dd>${l.furnished ? 'Furnished' : 'Unfurnished'}</dd><dt>Deposit terms</dt><dd>${U(l.deposit)}</dd></dl></section>
      <section class="panel" style="margin-top:16px"><h3>About this property</h3><p>${esc(l.desc)}</p></section>
      <section class="panel" style="margin-top:16px"><h3>Utilities &amp; features</h3>
        <dl class="specs"><dt>Water</dt><dd>${U(l.water)}</dd><dt>Electricity</dt><dd>${U(l.power)}</dd><dt>Parking</dt><dd>${U(l.parking)}</dd><dt>Security</dt><dd>${U(l.security)}</dd><dt>Caretaker</dt><dd>${U(l.caretaker)}</dd></dl></section>
      <section class="panel" style="margin-top:16px"><h3>Location</h3><div class="mapbox"><div><b>Approximate area: ${esc(l.estate)}</b><br>Exact address is not shown publicly. The advertiser shares it once a viewing is arranged.</div></div></section>
    </div>
    <aside>
      <div class="panel sticky">
        <div class="badges" style="margin-bottom:10px">${needsReconfirm(l) ? '<span class="badge warn">Availability unconfirmed</span>' : ''}</div>
        <h3>Verification</h3>
        <ul style="list-style:none;padding:0;margin:0 0 8px;display:grid;gap:8px">${bs.map(b => `<li>${badgeHTML(b, true)}<div class="hint">${esc(b.tip)}</div></li>`).join('')}</ul>
        <p class="small"><a href="#/verification">What each check does and doesn’t mean</a></p>
        <hr style="border:0;border-top:1px solid var(--line);margin:14px 0">
        <h3>Advertised by</h3>
        <p><a href="#/agent/${a.id}"><b>${esc(a.name)}</b></a><br><span class="muted small">${esc(a.kind)}${a.agency ? ' · ' + esc(a.agency) : ''}</span></p>
        <p class="small muted">Availability last confirmed ${fmtDate(l.confirmed)} (${rel(l.confirmed)}).</p>
        <div style="display:grid;gap:8px">
          <button class="btn" data-act="enquire" data-id="${l.id}">Send enquiry</button>
          <button class="btn ghost" data-act="viewing" data-id="${l.id}">Request a viewing</button>
          <button class="btn ghost" data-act="save" data-id="${l.id}" aria-pressed="${saved}">${saved ? '♥ Saved' : '♡ Save listing'}</button>
          <button class="btn ghost" data-act="reveal" data-id="${l.id}" id="revealBtn">Show contact number</button>
          <button class="btn ghost sm" data-act="report" data-id="${l.id}" data-type="listing">⚑ Report this listing</button>
        </div>
        <div class="notice small"><b>Stay safe.</b> View the property in person before paying anything. Never send deposits or “reservation fees” by M-Pesa to personal numbers. The platform does not hold or guarantee payments.</div>
      </div></aside></div>`;
}

function vAgent(id) {
  const a = agentOf(id); if (!a) return vError('404', 'Profile not found', 'No such advertiser.');
  const ls = S.listings.filter(l => l.agent === id && isPublic(l));
  const fake = {agent:id, authority:null, visited:null, confirmed:Date.now()};
  const bs = badgesFor(fake).filter(b => b.key === 'phone' || b.key === 'identity');
  return `<div class="wrap page-head"><div class="crumbs"><a href="#/">Home</a> › Advertiser</div><h1>${esc(a.name)}</h1>
    <p class="muted">${esc(a.kind)}${a.agency ? ' · ' + esc(a.agency) : ''} · On platform since ${a.since}</p>
    <div class="badges" style="margin:8px 0">${bs.map(b => badgeHTML(b, true)).join('')}</div>
    <p class="prose">${esc(a.bio)}</p>
    <p class="notice small">Advertiser identity checks do not prove ownership of any property. Look for “Authority reviewed” on each listing. Phone numbers and ID details are never shown on profiles.</p>
    <button class="btn ghost sm" data-act="report" data-id="${a.id}" data-type="agent">⚑ Report this advertiser</button>
    <h2 style="margin-top:28px">Active listings (${ls.length})</h2></div>
    <div class="wrap">${ls.length ? `<div class="cards">${ls.map(cardHTML).join('')}</div>` : '<div class="empty">No active listings.</div>'}</div>`;
}

function vVerification() {
  return `<div class="wrap page-head prose"><h1>How verification works</h1>
  <p>We do not use a single “100% verified” badge, because no single check can prove everything. Each badge below is shown separately with the date it was completed. Checks expire, and expired checks stop showing as current.</p>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Badge</th><th>What it means</th><th>What it does NOT mean</th><th>Valid for</th></tr></thead><tbody>
  ${Object.values(VERIFY).map(v => `<tr><th scope="row">${esc(v.label)}</th><td>${esc(v.does)}</td><td>${esc(v.not)}</td><td>${v.valid} days</td></tr>`).join('')}</tbody></table></div>
  <h2>Our guardrails</h2><ul>
    <li>Paying for a subscription or boost can never buy, hide or override a verification badge.</li>
    <li>Identity-check status is tracked separately from property-authority status.</li>
    <li>Evidence is kept in restricted private storage, access is logged, and ID numbers or private phone numbers are never shown publicly.</li>
    <li>The MVP does not collect biometric data (no selfie/liveness checks).</li>
    <li>We make no claim that a title or ownership is legally confirmed. For that you need a qualified advocate and an official search.</li></ul>
  <h2>Availability</h2><p>Advertisers must reconfirm availability every 14 days. After that the listing is labelled “Availability unconfirmed”, and after 21 days it is paused automatically.</p></div>`;
}

function vSafety() {
  return `<div class="wrap page-head prose"><h1>Safety centre</h1>
  <ol class="steplist">
    <li><b>View first, pay later.</b> Never pay a deposit, “booking fee” or “viewing fee” before seeing the property and meeting the advertiser.</li>
    <li><b>Check the badges.</b> “Authority reviewed” shows we looked at evidence that the advertiser may let this property. “Identity checked” alone does not.</li>
    <li><b>Ask for documents.</b> For tenancy, ask for a written agreement. Consider having an advocate review it, and confirm who is receiving rent.</li>
    <li><b>Be careful with deals that look too good.</b> Prices far below the area’s norm are a classic warning sign.</li>
    <li><b>Meet safely.</b> Tell someone where you’re going, visit in daylight and don’t go alone if you can avoid it.</li>
    <li><b>Report it.</b> If something feels wrong, use the Report button on the listing or profile.</li></ol>
  <p class="notice">The platform does not hold deposits or guarantee payments in this release. You and the advertiser arrange viewings and payments directly.</p>
  <a class="btn" href="#/report">Report a listing</a></div>`;
}

function vStatic(k) {
  const c = {
    about:['About NyumbaLoop', '<p>NyumbaLoop (<i>Nyumba</i> = home in Kiswahili) is a web-first property discovery platform piloting rentals in Nairobi. Our principle: <b>accurate listings, accountable advertisers, clear information, safer house hunting.</b></p><p class="notice small">“NyumbaLoop” is a working name, subject to KIPI trademark clearance and domain checks.</p><p>This repository is the front-end prototype of the MVP described in the Software Requirements Specification. It uses sample data only.</p>'],
    contact:['Contact', '<p>This is a prototype. In production, contact details for support, safety reports and privacy requests would appear here.</p><p class="muted">Placeholder: support@example.co.ke</p>'],
    terms:['Terms of use', '<p class="notice">Placeholder text. Terms must be drafted or approved by a qualified Kenyan legal adviser before launch (SRS §12).</p><p>Key principles to be reflected: no platform-held deposits in MVP; users transact directly with independently verified parties; verification badges describe specific checks only.</p>'],
    privacy:['Privacy notice', '<p class="notice">Placeholder text. Must be prepared against the Kenya Data Protection Act, 2019 with a qualified adviser (SRS §12.1).</p><p>Principles: data minimisation, purpose limitation, retention schedules, access/correction/deletion requests, no biometric collection in MVP, and no public exposure of ID numbers or private phone numbers.</p>']
  }[k];
  return `<div class="wrap page-head prose"><h1>${c[0]}</h1>${c[1]}</div>`;
}

function vList() {
  return `<div class="wrap page-head prose"><h1>List your property. Reach the right people.</h1>
  <p>NyumbaLoop is built for landlords, agents and agencies who want qualified enquiries and a credible profile.</p>
  <ol class="steplist"><li><b>Register and verify your contact details.</b> Choose landlord or agent. Privileged roles need administrator approval.</li>
  <li><b>Complete the checks that apply.</b> Identity and property authority are tracked separately and shown as separate, dated badges.</li>
  <li><b>Create your listing.</b> A guided wizard asks for rent, deposit terms, location, utilities and photos.</li>
  <li><b>Moderation, then publish.</b> A reviewer approves, requests changes or rejects with a reason.</li>
  <li><b>Stay fresh.</b> Reconfirm availability every 14 days or the listing is labelled, then paused.</li></ol>
  <p class="notice small">Subscriptions and promoted listings can never buy or override a verification badge. MVP: free listing allowance, manual billing.</p>
  ${S.role === 'advertiser' ? '<a class="btn" href="#/advertiser">Open my dashboard</a>' : '<button class="btn" data-act="asadv">Preview as demo agent (Wanjiku)</button>'}</div>`;
}

/* Renter pages */
function vSaved() {
  const ls = S.saved.map(listing).filter(Boolean);
  return `<div class="wrap page-head"><h1>Saved listings</h1></div><div class="wrap">${ls.length ? `<div class="cards">${ls.map(l => isPublic(l) ? cardHTML(l) : `<article class="card"><div class="body"><div class="badge off">No longer available</div><b>${esc(l.title)}</b><p class="muted small">This listing was ${STATUS[l.status].toLowerCase()} or paused. It may not be available. (SAVE-02)</p><button class="btn ghost sm" data-act="save" data-id="${l.id}" aria-pressed="true">Remove</button></div></article>`).join('')}</div>` : '<div class="empty"><h2>Nothing saved yet</h2><p>Tap the heart on any listing to keep it here.</p><a class="btn" href="#/search">Browse listings</a></div>'}</div>`;
}
function vActivity() {
  if (S.role === 'visitor') return vError('401', 'Sign in required', 'Switch to “Renter” in the role switcher to view your enquiries and viewing requests (demo).');
  const e = S.enquiries.filter(x => x.by === RENTER.id), v = S.viewings.filter(x => x.by === RENTER.id);
  const row = (x, kind) => { const l = listing(x.listing); return `<tr><td><a href="#/listing/${x.listing}">${esc(l?.title)}</a></td><td>${kind === 'v' ? esc(x.slot) : esc(x.message.slice(0, 80))}</td><td><span class="badge ${x.status === 'confirmed' ? '' : x.status === 'declined' ? 'off' : 'info'}">${esc(x.status)}</span>${x.note ? `<div class="hint">${esc(x.note)}</div>` : ''}</td><td>${fmtDT(x.updated || x.at)}</td></tr>`; };
  return `<div class="wrap page-head"><h1>My enquiries &amp; viewings</h1></div><div class="wrap">
  <h2>Viewing requests</h2>${v.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>Preferred slot</th><th>Status</th><th>Updated</th></tr></thead><tbody>${v.map(x => row(x, 'v')).join('')}</tbody></table></div>` : '<p class="muted">None yet.</p>'}
  <h2 style="margin-top:28px">Enquiries</h2>${e.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>Message</th><th>Status</th><th>Sent</th></tr></thead><tbody>${e.map(x => row(x, 'e')).join('')}</tbody></table></div>` : '<p class="muted">None yet.</p>'}</div>`;
}
function vReportPage() {
  return `<div class="wrap page-head prose"><h1>Report a listing or advertiser</h1><p>Tell us what’s wrong. You’ll get a case reference and we aim to review within 24 hours during staffed hours.</p>
  <div class="panel"><form id="reportForm" novalidate>${reportFields()}<div class="field"><label for="rtarget">Listing</label><select id="rtarget" name="listingId">${S.listings.filter(isPublic).map(l => `<option value="${l.id}">${esc(l.title)}</option>`).join('')}</select></div><button class="btn" type="submit">Submit report</button></form></div></div>`;
}
const reportFields = () => `<div class="field"><label for="rcat">What’s the problem?</label><select id="rcat" name="category" required><option value="">Choose a category</option>${['Asked for payment before viewing','Suspected scam or fake listing','Listing is no longer available','Photos or details are misleading','Duplicate listing','Advertiser behaviour','Other'].map(c => `<option>${c}</option>`).join('')}</select></div>
  <div class="field"><label for="rdesc">Describe what happened</label><textarea id="rdesc" name="desc" required minlength="10"></textarea></div>`;

/* Advertiser */
function vDashboard(p) {
  const tab = p.tab || 'listings', mine = S.listings.filter(l => l.agent === ME_AGENT);
  const myE = S.enquiries.filter(e => mine.some(l => l.id === e.listing)), myV = S.viewings.filter(v => mine.some(l => l.id === v.listing));
  const a = agentOf(ME_AGENT);
  const tabs = [['listings', 'Listings'], ['enquiries', `Enquiries (${myE.length})`], ['viewings', `Viewings (${myV.length})`], ['verification', 'Verification']];
  let body = '';
  if (tab === 'listings') body = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>Status</th><th>Availability</th><th>Actions</th></tr></thead><tbody>${mine.map(l => `<tr><td><a href="#/listing/${l.id}"><b>${esc(l.title)}</b></a><div class="muted small">${kes(l.price)} · ${esc(l.estate)}</div>${l.modNote ? `<div class="notice small">Moderator: ${esc(l.modNote)}</div>` : ''}</td>
    <td><span class="badge ${l.status === 'published' ? '' : l.status === 'rejected' ? 'off' : 'info'}">${STATUS[l.status]}</span></td>
    <td>${l.status === 'published' ? `Confirmed ${rel(l.confirmed)}${needsReconfirm(l) ? '<br><span class="badge warn">Please reconfirm</span>' : ''}` : '–'}</td>
    <td style="display:flex;gap:6px;flex-wrap:wrap">${l.status === 'published' || l.status === 'paused' ? `<button class="btn sm" data-act="reconfirm" data-id="${l.id}">Reconfirm</button>` : ''}${l.status === 'published' ? `<button class="btn sm ghost" data-act="setstatus" data-id="${l.id}" data-v="paused">Pause</button><button class="btn sm ghost" data-act="setstatus" data-id="${l.id}" data-v="let">Mark let</button>` : ''}${l.status === 'paused' ? `<button class="btn sm ghost" data-act="setstatus" data-id="${l.id}" data-v="published">Resume</button>` : ''}${l.status === 'changes_requested' ? `<button class="btn sm ghost" data-act="setstatus" data-id="${l.id}" data-v="submitted">Resubmit</button>` : ''}${l.status === 'draft' ? `<button class="btn sm" data-act="setstatus" data-id="${l.id}" data-v="submitted">Submit for moderation</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'enquiries') body = myE.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>From</th><th>Message</th><th>Received</th></tr></thead><tbody>${myE.map(e => `<tr><td>${esc(listing(e.listing).title)}</td><td>${esc(e.name)}<div class="hint">${esc(e.contact)}</div></td><td>${esc(e.message)}</td><td>${fmtDT(e.at)}<div class="hint">Email: ${esc(e.delivery)}</div></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No enquiries yet. Switch to “Renter” and send one to see it here.</p>';
  if (tab === 'viewings') body = myV.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>Renter</th><th>Preferred slot</th><th>Status</th><th>Respond</th></tr></thead><tbody>${myV.map(v => `<tr><td>${esc(listing(v.listing).title)}</td><td>${esc(v.name)}</td><td>${esc(v.slot)}</td><td><span class="badge ${v.status === 'confirmed' ? '' : v.status === 'declined' ? 'off' : 'info'}">${esc(v.status)}</span><div class="hint">${fmtDT(v.updated || v.at)}</div></td><td style="display:flex;gap:6px;flex-wrap:wrap">${v.status === 'pending' || v.status === 'alternative proposed' ? `<button class="btn sm" data-act="vconfirm" data-id="${v.id}">Confirm</button><button class="btn sm ghost" data-act="vpropose" data-id="${v.id}">Propose another</button><button class="btn sm ghost" data-act="vdecline" data-id="${v.id}">Decline</button>` : '–'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No viewing requests yet.</p>';
  if (tab === 'verification') { const bs = badgesFor({agent:ME_AGENT, authority:null, visited:null, confirmed:Date.now()}).filter(b => ['phone', 'identity'].includes(b.key)); body = `<div class="panel"><h3>Your verification status</h3><div class="badges">${bs.map(b => badgeHTML(b, true)).join('')}</div><p class="small muted" style="margin-top:10px">Identity and property-authority are tracked separately. Evidence you upload is stored privately and only authorised reviewers can open it. Subscription tier never affects these badges.</p><button class="btn ghost" data-act="toast" data-msg="In production this opens the secure evidence upload flow.">Submit authority evidence</button></div>`; }
  return `<div class="wrap page-head"><h1>Advertiser dashboard</h1><p class="muted">${esc(a.name)} · ${esc(a.kind)} · ${esc(a.agency)}</p>
    <div class="stats"><div class="stat"><b>${mine.filter(l => l.status === 'published').length}</b>Active listings</div><div class="stat"><b>${myE.length}</b>Enquiries</div><div class="stat"><b>${myV.filter(v => v.status === 'pending').length}</b>Viewings to answer</div><div class="stat"><b>${mine.filter(needsReconfirm).length}</b>Need reconfirming</div></div>
    <a class="btn" href="#/advertiser/new">+ Create listing</a></div>
    <div class="wrap"><div class="tabs" role="tablist">${tabs.map(([k, v]) => `<button role="tab" aria-selected="${tab === k}" data-act="tab" data-tab="${k}">${v}</button>`).join('')}</div>${body}
    <p class="muted small" style="margin-top:20px">Billing placeholder: free listing allowance and manual invoicing in MVP (SRS §16).</p></div>`;
}

let wiz = null;
function vWizard(p) {
  if (!wiz || p.reset) wiz = {step:1, d:{}};
  const d = wiz.d, s = wiz.step;
  const v = k => esc(d[k] ?? '');
  const sel = (k, opts) => opts.map(o => `<option ${d[k] === o ? 'selected' : ''}>${o}</option>`).join('');
  const steps = {
    1:`<h2>1. Property details</h2>
      <div class="field"><label for="w_title">Title</label><input id="w_title" name="title" required minlength="8" maxlength="90" value="${v('title')}"><div class="hint">Be specific: size, standout feature, nearby landmark.</div></div>
      <div class="field"><label for="w_desc">Description</label><textarea id="w_desc" name="desc" required minlength="30">${v('desc')}</textarea></div>
      <div class="grid2"><div class="field"><label for="w_type">Type</label><select id="w_type" name="type" required>${Object.entries(TYPES).map(([k, t]) => `<option value="${k}" ${d.type === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label for="w_price">Monthly rent (KES)</label><input id="w_price" name="price" type="number" min="1000" required value="${v('price')}"></div>
      <div class="field"><label for="w_beds">Bedrooms</label><input id="w_beds" name="beds" type="number" min="0" max="12" required value="${v('beds') || 1}"></div>
      <div class="field"><label for="w_baths">Bathrooms</label><input id="w_baths" name="baths" type="number" min="0" max="12" required value="${v('baths') || 1}"></div></div>
      <div class="field"><label for="w_dep">Deposit terms</label><input id="w_dep" name="deposit" placeholder="e.g. 2 months’ rent" value="${v('deposit')}"><div class="hint">Leave blank if unknown. It is displayed as “Not provided”.</div></div>
      <label class="check field"><input type="checkbox" name="furnished" ${d.furnished ? 'checked' : ''}> Furnished</label>`,
    2:`<h2>2. Location &amp; utilities</h2>
      <div class="grid2"><div class="field"><label for="w_county">County</label><select id="w_county" name="county" required>${sel('county', ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado'])}</select></div>
      <div class="field"><label for="w_sub">Sub-county / town</label><input id="w_sub" name="sub" required value="${v('sub')}"></div></div>
      <div class="field"><label for="w_estate">Estate / neighbourhood</label><select id="w_estate" name="estate" required>${sel('estate', ESTATES)}</select><div class="hint">Your exact unit address is never public by default.</div></div>
      <div class="grid2"><div class="field"><label for="w_water">Water supply</label><input id="w_water" name="water" placeholder="Unknown / N/A allowed" value="${v('water')}"></div><div class="field"><label for="w_power">Electricity</label><input id="w_power" name="power" value="${v('power')}"></div>
      <div class="field"><label for="w_park">Parking</label><input id="w_park" name="parking" value="${v('parking')}"></div><div class="field"><label for="w_sec">Security features</label><input id="w_sec" name="security" value="${v('security')}"></div></div>`,
    3:`<h2>3. Photos &amp; review</h2>
      <div class="field"><label for="w_photos">Photos (up to 12 · JPG, PNG or WebP · max 5 MB each)</label><input id="w_photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple><div class="hint" id="photoMsg">${d.photoCount ? d.photoCount + ' photo(s) accepted' : 'At least 1 photo required.'} Prototype: files are validated but not uploaded. Production compresses them and strips metadata.</div><div class="err" id="photoErr"></div></div>
      <div class="notice"><b>${esc(d.title)}</b><br>${kes(d.price || 0)} · ${esc(d.estate)}, ${esc(d.county)}<br>On submit, your listing stays private until a moderator approves it.</div>`
  };
  return `<div class="wrap page-head prose"><div class="crumbs"><a href="#/advertiser">Dashboard</a> › New listing</div><h1>Create a listing</h1>
  <div class="steps" aria-hidden="true">${[1, 2, 3].map(i => `<span class="${i <= s ? 'on' : ''}"></span>`).join('')}</div>
  <form id="wizForm" class="panel" novalidate>${steps[s]}<div style="display:flex;gap:8px;justify-content:space-between;margin-top:8px">${s > 1 ? '<button class="btn ghost" type="button" data-act="wizback">Back</button>' : '<span></span>'}<button class="btn" type="submit">${s < 3 ? 'Next' : 'Submit for moderation'}</button></div></form></div>`;
}

/* Moderator */
function vAdmin(p) {
  const tab = p.tab || 'queue', pend = S.listings.filter(l => l.status === 'submitted');
  const open = S.reports.filter(r => r.status === 'open');
  const expiring = [];
  S.agents.forEach(a => ['phone', 'identity'].forEach(k => { const at = a.ver[k]; if (at && VERIFY[k].valid - daysAgo(at) < 60) expiring.push({who:a.name, check:VERIFY[k].label, left:VERIFY[k].valid - daysAgo(at)}); }));
  S.listings.forEach(l => { if (l.authority && VERIFY.authority.valid - daysAgo(l.authority) < 60) expiring.push({who:l.title, check:'Authority reviewed', left:VERIFY.authority.valid - daysAgo(l.authority)}); });
  const sla = r => { const h = (Date.now() - r.at) / 36e5; return h > 24 ? '<span class="badge off">SLA breached</span>' : h > 16 ? '<span class="badge warn">Due soon</span>' : '<span class="badge">Within SLA</span>'; };
  const tabs = [['queue', `Listing queue (${pend.length})`], ['reports', `Reports (${open.length})`], ['verif', `Expiring checks (${expiring.length})`], ['audit', 'Audit log'], ['metrics', 'Metrics']];
  let body = '';
  if (tab === 'queue') body = pend.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Listing</th><th>Advertiser</th><th>Risk signals</th><th>Decision</th></tr></thead><tbody>${pend.map(l => { const a = agentOf(l.agent), flags = []; if (!l.authority) flags.push('No authority evidence'); if (l.price < 40000 && l.type === '3br' && ['Lavington', 'Westlands', 'Kilimani', 'Kileleshwa'].includes(l.estate)) flags.push('Price far below area norm'); if (/before viewing/i.test(l.deposit)) flags.push('Asks for payment before viewing'); if (!a.ver.identity) flags.push('Identity not checked'); return `<tr><td><a href="#/listing/${l.id}"><b>${esc(l.title)}</b></a><div class="muted small">${kes(l.price)} · ${esc(l.estate)}</div></td><td>${esc(a.name)}<div class="hint">${esc(a.kind)}</div></td><td>${flags.length ? flags.map(f => `<span class="badge warn">${esc(f)}</span>`).join(' ') : '<span class="badge">None</span>'}<div class="hint">Flags prompt human review; they are not accusations (LIST-09).</div></td><td style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn sm" data-act="mod" data-id="${l.id}" data-v="published">Approve</button><button class="btn sm ghost" data-act="mod" data-id="${l.id}" data-v="changes_requested">Request changes</button><button class="btn sm danger" data-act="mod" data-id="${l.id}" data-v="rejected">Reject</button></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">Queue is clear 🎉</div>';
  if (tab === 'reports') body = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Case</th><th>Target</th><th>Category</th><th>Age / SLA</th><th>Status</th><th>Action</th></tr></thead><tbody>${S.reports.map(r => `<tr><td><b>${esc(r.id)}</b><div class="hint">${esc(r.priority)} priority</div></td><td>${r.targetType === 'listing' ? `<a href="#/listing/${r.target}">${esc(listing(r.target)?.title)}</a>` : esc(agentOf(r.target)?.name)}</td><td>${esc(r.category)}<div class="hint">${esc(r.desc)}</div></td><td>${rel(r.at)}<br>${r.status === 'open' ? sla(r) : ''}</td><td><span class="badge ${r.status === 'open' ? 'warn' : ''}">${esc(r.status)}</span>${r.reason ? `<div class="hint">${esc(r.reason)}</div>` : ''}</td><td style="display:flex;gap:6px;flex-wrap:wrap">${r.status === 'open' ? `<button class="btn sm danger" data-act="rhide" data-id="${r.id}">Hide listing</button><button class="btn sm ghost" data-act="rdismiss" data-id="${r.id}">Dismiss</button>` : r.status === 'actioned' && r.targetType === 'listing' ? `<button class="btn sm ghost" data-act="rrestore" data-id="${r.id}">Restore</button>` : '–'}</td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'verif') body = expiring.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Subject</th><th>Check</th><th>Days left</th></tr></thead><tbody>${expiring.sort((a, b) => a.left - b.left).map(e => `<tr><td>${esc(e.who)}</td><td>${esc(e.check)}</td><td>${e.left < 0 ? '<span class="badge off">Expired ' + (-e.left) + ' days ago</span>' : e.left + ' days'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Nothing expiring in 60 days.</p>';
  if (tab === 'audit') body = `<p class="muted small">Append-only from the application interface (ADM-02). Every high-risk action requires a reason.</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead><tbody>${S.audit.map(x => `<tr><td>${fmtDT(x.at)}</td><td>${esc(x.actor)}</td><td>${esc(x.action)}</td><td>${esc(x.detail)}</td></tr>`).join('')}</tbody></table></div>`;
  if (tab === 'metrics') body = `<p class="muted small">Calculation window: all time in this prototype session (ADM-03).</p><div class="stats"><div class="stat"><b>${S.listings.filter(isPublic).length}</b>Active listings</div><div class="stat"><b>${S.enquiries.length}</b>Enquiries</div><div class="stat"><b>${S.viewings.length}</b>Viewing requests</div><div class="stat"><b>${S.reports.length}</b>Reports</div><div class="stat"><b>${S.agents.length}</b>Advertisers</div></div>`;
  return `<div class="wrap page-head"><h1>Moderation console</h1></div><div class="wrap"><div class="tabs" role="tablist">${tabs.map(([k, v]) => `<button role="tab" aria-selected="${tab === k}" data-act="tab" data-tab="${k}">${v}</button>`).join('')}</div>${body}</div>`;
}

/* ───────── Modals & toasts ───────── */
let lastFocus = null;
function openModal(html) { lastFocus = document.activeElement; $('#modalBody').innerHTML = html; $('#modal').hidden = false; (($('#modalBody input, #modalBody textarea, #modalBody select, #modalBody button')) || $('#modalClose')).focus(); }
function closeModal() { if ($('#modal').hidden) return; $('#modal').hidden = true; lastFocus?.focus?.(); }
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200); }
function needRenter() {
  if (S.role === 'renter') return true;
  openModal(`<h2 id="modalTitle">Sign in to continue</h2><p>Enquiries, viewing requests and saved lists need a verified account to reduce spam. In this demo you can continue as a sample renter.</p><button class="btn" data-act="asrenter">Continue as Amina (demo renter)</button>`);
  return false;
}
function reasonModal(title, cb, label = 'Reason (required, recorded in the audit log)') {
  openModal(`<h2 id="modalTitle">${esc(title)}</h2><form id="reasonForm" novalidate><div class="field"><label for="reason">${esc(label)}</label><textarea id="reason" required minlength="5"></textarea><div class="err" id="reasonErr"></div></div><button class="btn" type="submit">Confirm</button></form>`);
  $('#reasonForm').onsubmit = e => { e.preventDefault(); const v = $('#reason').value.trim(); if (v.length < 5) { $('#reasonErr').textContent = 'Please give a reason (at least 5 characters).'; $('#reason').setAttribute('aria-invalid', 'true'); return; } closeModal(); cb(v); route(); };
}
function showErr(form, map) { $$('.err.f', form).forEach(x => x.remove()); $$('[aria-invalid]', form).forEach(x => x.removeAttribute('aria-invalid')); Object.entries(map).forEach(([n, m]) => { const el = form.elements[n]; if (!el) return; el.setAttribute('aria-invalid', 'true'); const d = document.createElement('div'); d.className = 'err f'; d.textContent = m; el.insertAdjacentElement('afterend', d); }); const first = form.querySelector('[aria-invalid]'); first?.focus(); return !Object.keys(map).length; }

/* ───────── Actions ───────── */
const actions = {
  save(t) { if (S.role === 'visitor') return needRenter(); const id = t.dataset.id; S.saved = S.saved.includes(id) ? S.saved.filter(x => x !== id) : [...new Set([...S.saved, id])]; save(); toast(S.saved.includes(id) ? 'Saved' : 'Removed from saved'); route(); },
  enquire(t) { if (!needRenter()) return; const l = listing(t.dataset.id);
    openModal(`<h2 id="modalTitle">Enquire about this property</h2><p class="muted small">${esc(l.title)}</p><form id="enqForm" novalidate>
      <div class="field"><label for="e_name">Your name</label><input id="e_name" name="name" value="${RENTER.name}" required></div>
      <div class="field"><label for="e_phone">Kenyan mobile number</label><input id="e_phone" name="phone" inputmode="tel" placeholder="07XX XXX XXX" required><div class="hint">Shared only with this advertiser (COMM-05).</div></div>
      <div class="field"><label for="e_msg">Message</label><textarea id="e_msg" name="message" required>Hello, is this property still available? Could I view it this week?</textarea></div>
      <div class="notice small">Don’t pay anything before viewing. The platform does not hold deposits.</div>
      <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true"><button class="btn" type="submit">Send enquiry</button></form>`);
    $('#enqForm').onsubmit = e => { e.preventDefault(); const f = e.target, er = {}; if (f.elements.name.value.trim().length < 2) er.name = 'Enter your name.'; if (!PHONE_RE.test(f.phone.value.replace(/\s/g, ''))) er.phone = 'Enter a valid Kenyan mobile, e.g. 0712 345 678.'; if (f.message.value.trim().length < 10) er.message = 'Message must be at least 10 characters.'; if (!showErr(f, er)) return;
      if (f.website.value) return; // honeypot spam control (COMM-01)
      const recent = S.enquiries.filter(x => x.by === RENTER.id && Date.now() - x.at < 6e4).length; if (recent >= 3) return toast('Slow down: please wait a minute before sending more enquiries.');
      S.enquiries.unshift({id:uid('E'), listing:l.id, by:RENTER.id, name:f.elements.name.value.trim(), contact:f.phone.value.trim(), message:f.message.value.trim(), at:Date.now(), status:'sent', delivery:'queued (simulated)'}); save(); closeModal(); toast('Enquiry sent. Track it under My activity.'); syncChrome(); };
  },
  viewing(t) { if (!needRenter()) return; const l = listing(t.dataset.id), min = new Date(Date.now() + DAY).toISOString().slice(0, 10);
    openModal(`<h2 id="modalTitle">Request a viewing</h2><p class="muted small">${esc(l.title)}</p><form id="vForm" novalidate>
      <div class="field"><label for="v_date">Preferred date</label><input id="v_date" name="date" type="date" min="${min}" required></div>
      <div class="field"><label for="v_win">Time window</label><select id="v_win" name="win"><option>Morning (8am – 12pm)</option><option>Afternoon (12pm – 4pm)</option><option>Late afternoon (4pm – 6pm)</option></select></div>
      <div class="field"><label for="v_phone">Kenyan mobile number</label><input id="v_phone" name="phone" inputmode="tel" required></div>
      <div class="notice small">Visit in daylight, tell someone where you’re going, and don’t pay before viewing.</div><button class="btn" type="submit">Send request</button></form>`);
    $('#vForm').onsubmit = e => { e.preventDefault(); const f = e.target, er = {}; if (!f.date.value || f.date.value < min) er.date = 'Choose a future date.'; if (!PHONE_RE.test(f.phone.value.replace(/\s/g, ''))) er.phone = 'Enter a valid Kenyan mobile number.'; if (!showErr(f, er)) return;
      S.viewings.unshift({id:uid('V'), listing:l.id, by:RENTER.id, name:RENTER.name, slot:new Date(f.date.value).toLocaleDateString('en-KE', {weekday:'short', day:'numeric', month:'short'}) + ', ' + f.win.value, status:'pending', at:Date.now()}); save(); closeModal(); toast('Viewing requested'); };
  },
  reveal(t) { if (!needRenter()) return; const a = agentOf(listing(t.dataset.id).agent); t.outerHTML = `<div class="notice small"><b>${esc(a.phone)}</b><br>Number shown because you chose to contact. Remember: no payment before viewing.</div>`; audit('Contact revealed', a.name + ' (listing ' + t.dataset.id + ')'); },
  report(t) { if (S.role === 'visitor') { S.role = 'renter'; save(); syncChrome(); } const type = t.dataset.type, id = t.dataset.id;
    openModal(`<h2 id="modalTitle">Report ${type === 'agent' ? 'advertiser' : 'listing'}</h2><form id="rForm" novalidate>${reportFields()}<button class="btn" type="submit">Submit report</button></form>`);
    $('#rForm').onsubmit = e => { e.preventDefault(); submitReport(e.target, type, id, () => closeModal()); }; },
  asadv() { setRole('advertiser'); go('/advertiser'); },
  asrenter() { setRole('renter'); closeModal(); toast('Signed in as demo renter'); },
  tab(t) { const {path} = parseHash(); go(path + '?tab=' + t.dataset.tab); },
  toast(t) { toast(t.dataset.msg); },
  reconfirm(t) { const l = listing(t.dataset.id); l.confirmed = Date.now(); if (l.status === 'paused') l.status = 'published'; audit('Availability reconfirmed', l.title); save(); toast('Availability reconfirmed'); route(); },
  setstatus(t) { const l = listing(t.dataset.id), v = t.dataset.v; l.status = v; audit('Listing status → ' + STATUS[v], l.title); save(); toast('Listing: ' + STATUS[v]); route(); },
  vconfirm(t) { const v = S.viewings.find(x => x.id === t.dataset.id); v.status = 'confirmed'; v.updated = Date.now(); v.note = 'Confirmed by advertiser. Exact address shared by message.'; save(); toast('Viewing confirmed'); route(); },
  vdecline(t) { reasonModal('Decline viewing', r => { const v = S.viewings.find(x => x.id === t.dataset.id); v.status = 'declined'; v.updated = Date.now(); v.note = r; save(); }, 'Reason shown to the renter'); },
  vpropose(t) { reasonModal('Propose another time', r => { const v = S.viewings.find(x => x.id === t.dataset.id); v.status = 'alternative proposed'; v.updated = Date.now(); v.note = 'Proposed: ' + r; save(); }, 'Proposed date and time'); },
  wizback() { collectWiz(); wiz.step--; route(); },
  mod(t) { const l = listing(t.dataset.id), v = t.dataset.v; reasonModal(`${v === 'published' ? 'Approve' : v === 'rejected' ? 'Reject' : 'Request changes to'}: ${l.title}`, r => { l.status = v; l.modNote = v === 'published' ? '' : r; if (v === 'published') l.confirmed = Date.now(); audit('Listing ' + STATUS[v].toLowerCase(), l.title + ' – ' + r); save(); toast('Decision recorded'); }); },
  rhide(t) { const r = S.reports.find(x => x.id === t.dataset.id); reasonModal('Hide reported listing', why => { const l = listing(r.target); if (l) l.status = 'paused'; r.status = 'actioned'; r.reason = why; audit('Report ' + r.id + ' actioned: listing hidden', why); save(); }); },
  rdismiss(t) { const r = S.reports.find(x => x.id === t.dataset.id); reasonModal('Dismiss report', why => { r.status = 'dismissed'; r.reason = why; audit('Report ' + r.id + ' dismissed', why); save(); }); },
  rrestore(t) { const r = S.reports.find(x => x.id === t.dataset.id); reasonModal('Restore listing', why => { const l = listing(r.target); if (l) l.status = 'published'; r.status = 'restored'; audit('Report ' + r.id + ' restored listing', why); save(); }); }
};
function submitReport(f, type, id, done) {
  const er = {}; if (!f.category.value) er.category = 'Choose a category.'; if (f.desc.value.trim().length < 10) er.desc = 'Please describe the problem (10+ characters).'; if (!showErr(f, er)) return;
  const ref = 'R-' + (1000 + S.reports.length + 1);
  S.reports.unshift({id:ref, targetType:type, target:id, category:f.category.value, desc:f.desc.value.trim(), by:RENTER.id, at:Date.now(), status:'open', priority:/payment|scam/i.test(f.category.value) ? 'high' : 'normal'}); save(); done();
  openModal(`<h2 id="modalTitle">Report received</h2><p>Thank you. Your case reference is <b>${ref}</b>. We aim to review it within 24 hours during staffed hours.</p><button class="btn" data-act="closemodal">Close</button>`);
}
actions.closemodal = closeModal;

function collectWiz() {
  const f = $('#wizForm'); if (!f) return;
  [...f.elements].forEach(el => { if (!el.name || el.type === 'file') return; wiz.d[el.name] = el.type === 'checkbox' ? el.checked : el.value; });
}
function bindView() {
  const hs = $('#homeSearch'); if (hs) hs.onsubmit = e => { e.preventDefault(); const d = new FormData(hs); go('/search?' + qsOf(Object.fromEntries(d))); };
  const ff = $('#filterForm'); if (ff) { ff.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(ff)); if (d.sort === 'new') delete d.sort; go('/search?' + qsOf(d)); }; }
  const rf = $('#reportForm'); if (rf) rf.onsubmit = e => { e.preventDefault(); if (S.role === 'visitor') { S.role = 'renter'; save(); syncChrome(); } submitReport(rf, 'listing', rf.elements.listingId.value, () => {}); };
  const wf = $('#wizForm'); if (wf) {
    const pf = $('#w_photos'); if (pf) pf.onchange = () => { const fs = [...pf.files], bad = fs.find(x => !/^image\/(jpeg|png|webp)$/.test(x.type) || x.size > 5 * 1048576); $('#photoErr').textContent = fs.length > 12 ? 'Maximum 12 photos.' : bad ? `“${bad.name}” is not allowed: use JPG/PNG/WebP under 5 MB.` : ''; wiz.d.photoCount = $('#photoErr').textContent ? 0 : fs.length; $('#photoMsg').firstChild.textContent = wiz.d.photoCount + ' photo(s) accepted. '; };
    wf.onsubmit = e => { e.preventDefault(); const er = {}; [...wf.elements].forEach(el => { if (el.required && !el.value.trim()) er[el.name] = 'This field is required.'; else if (el.minLength > 0 && el.value && el.value.trim().length < el.minLength) er[el.name] = `Please write at least ${el.minLength} characters.`; else if (el.type === 'number' && el.value && (+el.value < +(el.min || -1e9))) er[el.name] = 'Value is too low.'; });
      if (wiz.step === 3 && !wiz.d.photoCount) er.photos = 'Add at least one valid photo.';
      if (!showErr(wf, er)) return; collectWiz();
      if (wiz.step < 3) { wiz.step++; return route(); }
      const d = wiz.d, n = {title:d.title, desc:d.desc, type:d.type, price:+d.price, beds:+d.beds, baths:+d.baths, deposit:d.deposit || 'Unknown', furnished:!!d.furnished, county:d.county, sub:d.sub, estate:d.estate, water:d.water || 'Unknown', power:d.power || 'Unknown', parking:d.parking || 'Unknown', security:d.security || 'Unknown'};
      S.listings.push(L('l' + (S.listings.length + 1) + Date.now().toString(36), {...n, tenure:'rent', agent:ME_AGENT, status:'submitted', confirmed:Date.now(), posted:Date.now(), photos:wiz.d.photoCount, hue:Math.floor(Math.random() * 360)})); audit('Listing submitted', d.title); save(); wiz = null; toast('Submitted for moderation'); go('/advertiser');
    };
  }
}

/* ───────── Global chrome ───────── */
function setRole(r) { S.role = r; save(); syncChrome(); if (/^\/(advertiser|admin)/.test(parseHash().path) || parseHash().path === '/activity') route(); }
function syncChrome() {
  $('#roleSelect').value = S.role;
  const c = $('#savedCount'); c.textContent = S.saved.length; c.hidden = !S.saved.length;
  const items = {renter:[['activity', 'My activity']], advertiser:[['advertiser', 'Dashboard']], moderator:[['admin', 'Moderation']], visitor:[]}[S.role];
  $('#roleNav').innerHTML = items.map(([h, t]) => `<a href="#/${h}" data-nav="${h}" class="${parseHash().parts[0] === h ? 'active' : ''}">${t}</a>`).join('');
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (t && actions[t.dataset.act]) { e.preventDefault(); actions[t.dataset.act](t); return; }
  if (e.target === $('#modal') || e.target.closest('#modalClose')) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
$('#roleSelect').addEventListener('change', e => { setRole(e.target.value); toast('Demo role: ' + e.target.selectedOptions[0].text); });
$('#navToggle').addEventListener('click', e => { const n = $('#nav'); const o = n.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); });
$('#nav').addEventListener('click', e => { if (e.target.closest('a')) $('#nav').classList.remove('open'); });
window.addEventListener('hashchange', route);
route();
})();
