/* Write the preview structure pages from shared/data.js and the existing footer facts.
   Does not change clinician scores or the data file. */
const fs = require('fs');
const path = require('path');
const window = {};
eval(fs.readFileSync('shared/data.js', 'utf8'));
const D = window.OBC;
const ORDER = ['amber', 'scott', 'shanna', 'amanda', 'aspen', 'abby'];
const byId = Object.fromEntries(D.clinicians.map(c => [c.id, c]));

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const AGE = { under8: 'children under 8', child8: 'children 8–12', teen: 'teens', adult: 'adults' };
const OFFICE = {
  draper: { name: 'Draper', line: '12401 S. 450 E, Suite F2, Draper, UT 84020', map: 'https://www.google.com/maps/search/?api=1&query=12401%20S.%20450%20E%2C%20Suite%20F2%2C%20Draper%2C%20UT%2084020' },
  bountiful: { name: 'Bountiful', line: '420 W 1500 S, Suite 100, Bountiful, UT 84010', map: 'https://www.google.com/maps/search/?api=1&query=420+W+1500+S+Suite+100+Bountiful+UT+84010' }
};
const HOURS = 'Mon–Fri 8am–9pm · Sat 8am–4pm · Sun closed';

function agesOf(c) {
  if (c.agesLabel) return c.agesLabel;
  return (c.ages || []).map(a => AGE[a] || a).join(', ');
}
function places(c) {
  const where = (c.offices || []).map(o => OFFICE[o].name).join(' & ');
  const how = (c.settings || []).includes('inperson') && (c.settings || []).includes('telehealth')
    ? 'In person & telehealth'
    : ((c.settings || []).includes('telehealth') ? 'Telehealth only' : 'In person');
  return { where, how };
}
function photo(id) {
  const file = { scott: 'scott-frazier', amber: 'amber-frazier', shanna: 'shanna-manjang', amanda: 'amanda-lloyd', aspen: 'aspen-johnson', abby: 'abby-locke' }[id];
  return '/professional/img/team/' + file + '.webp';
}

function shell(opt) {
  const depth = opt.depth || 0;
  const pre = '../'.repeat(depth);
  const canon = 'https://www.openbooktherapist.com' + opt.path;
  const story = opt.story || '/storybook/#home';
  const org = opt.person ? '' : `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'Open Book Counseling, PLLC', url: 'https://www.openbooktherapist.com/professional/',
    telephone: '+1-385-524-6665', email: 'makayla@openbooktherapist.com'
  })}</script>`;
  const person = opt.person ? `<script type="application/ld+json">${JSON.stringify(opt.person)}</script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(opt.title)}</title>
<meta name="description" content="${esc(opt.description)}">
<link rel="canonical" href="${canon}">
<link rel="icon" type="image/png" sizes="32x32" href="${pre}shared/img/favicon-32.png">
<link rel="stylesheet" href="${pre}shared/base.css"><link rel="stylesheet" href="${pre}professional/theme.css">
${org}${person}
</head><body>
<a class="skip" href="#main">Skip to content</a>
<div class="crisis" role="region" aria-label="Crisis resources">In crisis? Call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline, 24/7) · Utah: <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT</a> · Emergency: <a href="tel:911">911</a> · This site is not monitored for emergencies. · <a href="/crisis/">Crisis resources</a></div>
<header class="top"><a class="brand" href="/professional/"><img class="brand-mark" src="${pre}shared/img/logo-mark.webp" alt="" width="52" height="33"><span>Open Book Counseling</span></a>
<a class="top-call" href="tel:+13855246665"><span class="ico" aria-hidden="true">☎</span><span class="tc-n">(385) 524-6665</span><span class="sr"> Call Open Book Counseling</span></a>
<button class="menu" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
<nav id="nav" aria-label="Main"><a href="/professional/services/">Find care</a><a href="/professional/team.html"${opt.nav === 'team' ? ' aria-current="page"' : ''}>Counselors</a><a href="/professional/fees-insurance.html"${opt.nav === 'fees' ? ' aria-current="page"' : ''}>Fees &amp; insurance</a><a href="/professional/locations/"${opt.nav === 'locations' ? ' aria-current="page"' : ''}>Locations</a><a href="/professional/about.html"${opt.nav === 'about' ? ' aria-current="page"' : ''}>About</a><a href="/professional/match.html"${opt.nav === 'match' ? ' aria-current="page"' : ''}>Find my match</a><a class="btn sm" href="/professional/request-appointment.html"${opt.nav === 'request' ? ' aria-current="page"' : ''}>Request appointment</a></nav></header>
<main id="main">
${opt.main}
</main>
<footer class="site-foot"><div class="fwrap">
<div><p><strong>Open Book Counseling, PLLC</strong><br>Trauma &amp; mental health outpatient group practice</p></div>
<div><h2>Offices</h2><p>Draper: 12401 S. 450 E, Suite F2, Draper, UT 84020</p><p>Bountiful: 420 W 1500 S, Suite 100, Bountiful, UT 84010</p><p>Online sessions also available.</p></div>
<div><h2>Hours &amp; contact</h2><p>${HOURS}</p><p><a href="tel:+13855246665">(385) 524-6665</a><br><a href="mailto:makayla@openbooktherapist.com">makayla@openbooktherapist.com</a></p><p>Please don't send health details by email.</p></div>
<div><h2>Explore</h2><p><a href="/professional/services/">Find care</a> · <a href="/professional/team.html">Counselors</a> · <a href="/professional/fees-insurance.html">Fees &amp; insurance</a> · <a href="/professional/locations/">Locations</a> · <a href="/professional/about.html">About</a> · <a href="/professional/resources/">Articles</a> · <a href="/professional/resources.html">Support resources</a> · <a href="/professional/careers/">Careers</a> · <a href="/sitemap.xml">Sitemap</a></p><p><a class="sb-link" href="${story}">Storybook view</a></p></div>
</div><p class="fine">Crisis: call or text <a href="tel:988">988</a> · Utah: <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT</a> · Emergency: <a href="tel:911">911</a> · This site is not monitored for emergencies.</p></footer>
<nav class="mbar" aria-label="Quick actions"><a href="/professional/request-appointment.html">Request</a><a href="tel:+13855246665">Call</a><a href="/professional/match.html">Match</a></nav>
<script src="${pre}professional/nav.js"></script></body></html>
`;
}

function write(rel, html) {
  const file = path.join(process.cwd(), rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log('wrote', rel);
}

function counselorPage(c) {
  const p = places(c);
  const concerns = (c.concerns || []).map(id => D.concernLabels[id] || id);
  const mods = (c.mods || []).map(id => D.modLabels[id] || id);
  const slug = { scott: 'scott-frazier', amber: 'amber-frazier', shanna: 'shanna-manjang', amanda: 'amanda-lloyd', aspen: 'aspen-johnson', abby: 'abby-locke' }[c.id];
  const text = c.bio || c.card || c.style || '';
  const main = `<section class="page-hero"><p class="eyebrow">Counselor</p><h1>${esc(c.name)}</h1><p class="lead">${esc(c.cred)}</p>
<p><img src="${photo(c.id)}" alt="${esc(c.name + ', ' + c.cred)}" width="160" height="160"></p>
${c.award ? `<p>${esc(c.award)}</p>` : ''}${c.award2025 ? `<p>${esc(c.award2025)}</p>` : ''}
<dl class="facts"><div><dt>Ages</dt><dd>${esc(agesOf(c))}</dd></div><div><dt>Formats</dt><dd>${esc((c.formats || []).join(', '))}</dd></div><div><dt>Offices</dt><dd>${esc(p.where || 'See locations')}</dd></div><div><dt>Sessions</dt><dd>${esc(p.how)}</dd></div></dl>
</section>
<section><h2>About this counselor</h2><p>${esc(text)}</p></section>
${concerns.length ? `<section><h2>Listed concerns</h2><ul>${concerns.map(x => '<li>' + esc(x) + '</li>').join('')}</ul></section>` : ''}
${mods.length ? `<section><h2>Listed approaches</h2><ul>${mods.map(x => '<li>' + esc(x) + '</li>').join('')}</ul></section>` : ''}
<section class="cta-band"><h2>Request an appointment</h2><p>Call or email to request. Please don't send health details by email.</p>
<p><a class="btn" href="/professional/request-appointment.html">Request appointment</a> <a class="btn call" href="tel:+13855246665">Call (385) 524-6665</a></p>
<p><a href="/professional/team.html#${c.id}">Back to the counselor list</a> · <a href="/storybook/#team">Storybook hall</a></p></section>`;
  write('professional/team/' + slug + '.html', shell({
    depth: 2, path: '/professional/team/' + slug + '.html', title: c.name + ' | Open Book Counseling, PLLC',
    description: (c.card || c.style || c.name + ', ' + c.cred).slice(0, 180),
    nav: 'team', story: '/storybook/#team', main,
    person: { '@context': 'https://schema.org', '@type': 'Person', name: c.name, jobTitle: c.cred, worksFor: { '@type': 'Organization', name: 'Open Book Counseling, PLLC' } }
  }));
  return '/professional/team/' + slug + '.html';
}

const slugs = {};
for (const id of ORDER) slugs[id] = counselorPage(byId[id]);

function peopleList(filter) {
  return ORDER.filter(filter).map(id => {
    const c = byId[id];
    return `<li><a href="${slugs[id]}">${esc(c.name)}</a>, ${esc(c.cred)}</li>`;
  }).join('');
}

write('professional/locations/index.html', shell({
  depth: 2, path: '/professional/locations/', nav: 'locations', story: '/storybook/#locations',
  title: 'Locations | Open Book Counseling, PLLC',
  description: 'Open Book Counseling offices in Draper and Bountiful, Utah, plus online sessions.',
  main: `<section class="page-hero"><p class="eyebrow">Locations</p><h1>Draper, Bountiful, and online</h1><p class="lead">Online sessions also available. ${HOURS}</p></section>
<section><h2>Offices</h2><ul>
<li><a href="/professional/locations/draper.html">Draper: 12401 S. 450 E, Suite F2, Draper, UT 84020</a></li>
<li><a href="/professional/locations/bountiful.html">Bountiful: 420 W 1500 S, Suite 100, Bountiful, UT 84010</a></li>
</ul><p><a href="/professional/services/telehealth.html">Telehealth</a></p></section>`
}));

function officePage(key) {
  const o = OFFICE[key];
  const inPerson = ORDER.filter(id => (byId[id].offices || []).includes(key) && (byId[id].settings || []).includes('inperson'));
  write('professional/locations/' + key + '.html', shell({
    depth: 2, path: '/professional/locations/' + key + '.html', nav: 'locations', story: '/storybook/#locations',
    title: o.name + ' office | Open Book Counseling, PLLC',
    description: 'Open Book Counseling, ' + o.line + '.',
    main: `<section class="page-hero"><p class="eyebrow">${esc(o.name)}</p><h1>${esc(o.line)}</h1><p class="lead">${HOURS}. Online sessions also available.</p>
<p><a href="${o.map}">Map</a> · <a href="/professional/services/telehealth.html">Telehealth</a></p></section>
<section><h2>Counselors who see clients in person here</h2><ul>${peopleList(id => inPerson.includes(id))}</ul>
${key === 'draper' ? '<p>Amanda Lloyd is telehealth only. Her office base in the counselor list is Draper.</p>' : ''}</section>`
  }));
}
officePage('draper');
officePage('bountiful');

const ins = D.insurance.map(x => '<li>' + esc(x) + '</li>').join('');
const eap = D.eap.map(x => '<li>' + esc(x) + '</li>').join('');
write('professional/fees-insurance.html', shell({
  depth: 1, path: '/professional/fees-insurance.html', nav: 'fees', story: '/storybook/#insurance',
  title: 'Fees and insurance | Open Book Counseling, PLLC',
  description: 'Self-pay fees and the insurance and EAP names listed by Open Book Counseling.',
  main: `<section class="page-hero"><p class="eyebrow">Fees &amp; insurance</p><h1>Fees and insurance</h1>
<p class="lead">Self-pay: individual $150, couples $200, group $40 per person. Self-pay clients have the right to a Good Faith Estimate under the No Surprises Act.</p></section>
<section><h2>Insurance accepted by the practice</h2><ul>${ins}</ul><h2>EAPs</h2><ul>${eap}</ul>
<p class="note">Credentialing varies by counselor. Please confirm your counselor and benefits with Makayla Jones at <a href="tel:+13855246665">(385) 524-6665</a>.</p>
<p><a class="btn" href="/professional/request-appointment.html">Request appointment</a></p></section>`
}));

write('professional/request-appointment.html', shell({
  depth: 1, path: '/professional/request-appointment.html', nav: 'request', story: '/storybook/#home',
  title: 'Request an appointment | Open Book Counseling, PLLC',
  description: 'Call or email Open Book Counseling to request an appointment.',
  main: `<section class="page-hero"><p class="eyebrow">Request</p><h1>Request an appointment</h1>
<p class="lead">Call or email to request.</p>
<p><a class="btn call" href="tel:+13855246665">Call (385) 524-6665</a></p>
<p><a href="mailto:makayla@openbooktherapist.com">makayla@openbooktherapist.com</a></p>
<p>Please don't send health details by email.</p>
<p><a href="/professional/match.html">Find my match</a> · <a href="/crisis/">If you are in crisis</a></p></section>`
}));

write('professional/get-started.html', shell({
  depth: 1, path: '/professional/get-started.html', nav: '', story: '/storybook/#home',
  title: 'Get started | Open Book Counseling, PLLC',
  description: 'Choose a counselor or use the matching guide, then call or email to request an appointment.',
  main: `<section class="page-hero"><p class="eyebrow">Get started</p><h1>How to get started</h1></section>
<ol>
<li><a href="/professional/team.html">Choose a counselor</a> or <a href="/professional/match.html">use the matching guide</a>.</li>
<li><a href="/professional/fees-insurance.html">Fees and insurance</a> are optional to read. They are not a gate.</li>
<li><a href="/professional/request-appointment.html">Call or email to request an appointment</a>.</li>
</ol>
<p>If you are in crisis, <a href="/crisis/">use the crisis page</a>. This site is not monitored for emergencies.</p>`
}));

write('professional/match.html', shell({
  depth: 1, path: '/professional/match.html', nav: 'match', story: '/storybook/#match',
  title: 'Find my match | Open Book Counseling, PLLC',
  description: 'Open the counselor-matching guide. It runs only in your browser.',
  main: `<section class="page-hero"><p class="eyebrow">Find my match</p><h1>Find my match</h1>
<p class="lead">Private. Runs only in your browser. Every counselor is shown unless you choose a gender preference.</p>
<p>The questions, scores, and results are the storybook matching guide. This page does not keep a second copy of the scoring.</p>
<p><a class="btn" href="/storybook/#match">Open the matching guide</a></p>
<p><a href="/professional/request-appointment.html">Request an appointment</a> when you are ready. Call or email. Please don't send health details by email.</p></section>`
}));

const mods = Object.keys(D.modLabels).map(k => '<li>' + esc(D.modLabels[k]) + '</li>').join('');
write('professional/approaches/index.html', shell({
  depth: 2, path: '/professional/approaches/', nav: '', story: '/storybook/#services',
  title: 'Approaches | Open Book Counseling, PLLC',
  description: 'Approach names used at Open Book Counseling, with explanations in the storybook Skill Book.',
  main: `<section class="page-hero"><p class="eyebrow">Approaches</p><h1>Approaches</h1>
<p class="lead">The explanations already written for these names are in the storybook Skill Book. This list is the same set of names.</p>
<p><a href="/storybook/#services">Open the Skill Book</a></p></section>
<section><h2>Names</h2><ul>${mods}</ul></section>`
}));

write('crisis/index.html', shell({
  depth: 1, path: '/crisis/', nav: '', story: '/storybook/#home',
  title: 'If you are in crisis | Open Book Counseling, PLLC',
  description: 'This site is not monitored for emergencies. Call or text 988, use SafeUT, or call 911.',
  main: `<section class="page-hero"><h1>If you are in crisis</h1>
<p class="lead">This site is not monitored for emergencies.</p>
<ul>
<li>Call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline, 24/7).</li>
<li>Utah: <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT</a>.</li>
<li>Emergency: <a href="tel:911">911</a>.</li>
</ul></section>`
}));

const locs = [
  '/',
  '/professional/',
  '/professional/about.html',
  '/professional/contact.html',
  '/professional/services/',
  '/professional/services/individual.html',
  '/professional/services/couples.html',
  '/professional/services/family.html',
  '/professional/services/children-teens.html',
  '/professional/services/trauma-ptsd.html',
  '/professional/services/anxiety-depression.html',
  '/professional/services/telehealth.html',
  '/professional/team.html',
  ...ORDER.map(id => slugs[id]),
  '/professional/policies-faq.html',
  '/professional/intake.html',
  '/professional/resources.html',
  '/professional/resources/',
  '/professional/resources/trauma-talk.html',
  '/professional/resources/people-pleasers-and-codependents.html',
  '/professional/careers/',
  '/professional/fees-insurance.html',
  '/professional/locations/',
  '/professional/locations/draper.html',
  '/professional/locations/bountiful.html',
  '/professional/get-started.html',
  '/professional/match.html',
  '/professional/request-appointment.html',
  '/professional/approaches/',
  '/crisis/',
  '/storybook/'
];
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + locs.map(u => '  <url><loc>https://www.openbooktherapist.com' + u + '</loc></url>').join('\n')
  + '\n</urlset>\n';
fs.writeFileSync('sitemap.xml', xml);
console.log('sitemap', locs.length);

function patchNav(file) {
  let html = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/');
  let story = '/storybook/#home';
  if (rel.endsWith('team.html') || rel.includes('/team/')) story = '/storybook/#team';
  else if (rel.includes('/services/') || rel.includes('/approaches/')) story = '/storybook/#services';
  else if (rel.includes('fees-insurance')) story = '/storybook/#insurance';
  else if (rel.includes('/locations/')) story = '/storybook/#locations';
  else if (rel.endsWith('policies-faq.html')) story = '/storybook/#faq';
  else if (rel.includes('/careers/')) story = '/storybook/#careers';
  else if (rel.includes('match.html')) story = '/storybook/#match';
  else if (rel.includes('/resources')) story = '/storybook/resources/';
  const nav = `<nav id="nav" aria-label="Main"><a href="/professional/services/">Find care</a><a href="/professional/team.html">Counselors</a><a href="/professional/fees-insurance.html">Fees &amp; insurance</a><a href="/professional/locations/">Locations</a><a href="/professional/about.html">About</a><a href="/professional/match.html">Find my match</a><a class="btn sm" href="/professional/request-appointment.html">Request appointment</a></nav>`;
  if (!html.includes('<nav id="nav"')) return;
  html = html.replace(/<nav id="nav" aria-label="Main">[\s\S]*?<\/nav>/, nav);
  html = html.replace(/<nav class="mbar" aria-label="Quick actions">[\s\S]*?<\/nav>/, '<nav class="mbar" aria-label="Quick actions"><a href="/professional/request-appointment.html">Request</a><a href="tel:+13855246665">Call</a><a href="/professional/match.html">Match</a></nav>');
  if (!html.includes('href="/crisis/"') && html.includes('not monitored for emergencies.')) {
    html = html.replace('not monitored for emergencies.</div>', 'not monitored for emergencies. · <a href="/crisis/">Crisis resources</a></div>');
  }
  html = html.replace(/<a class="sb-link" href="[^"]*">/, `<a class="sb-link" href="${story}">`);
  fs.writeFileSync(file, html);
  console.log('patched', rel);
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) walk(file);
    else if (name.endsWith('.html')) patchNav(file);
  }
}
walk('professional');
console.log('done');
