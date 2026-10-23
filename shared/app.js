(function(){
const D=window.OBC,$=s=>document.querySelector(s),C=D.concernLabels,M=D.modLabels;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// nav
const mb=$('.menu');mb.addEventListener('click',()=>{const o=mb.getAttribute('aria-expanded')==='true';mb.setAttribute('aria-expanded',!o);$('#nav').classList.toggle('open',!o);});
// quiz chips
$('#q-concerns').innerHTML=Object.entries(C).map(([k,v])=>`<label><input type="checkbox" name="concern" value="${k}">${esc(v)}</label>`).join('');
$('#q-mods').innerHTML=Object.entries(M).map(([k,v])=>`<label><input type="checkbox" name="mod" value="${k}">${esc(v)}</label>`).join('');
const AGE={under8:'children under 8',child8:'children 8–12',teen:'teens',adult:'adults'};
function ageText(g){const o=[];if(g.includes('under8')&&g.includes('child8'))o.push('children (including under 8)');else{if(g.includes('under8'))o.push('children under 8');if(g.includes('child8'))o.push('children 8–12');}if(g.includes('teen'))o.push('teens');if(g.includes('adult'))o.push('adults');return o.join(', ');}
function score(c,a){let pts=0,max=0,why=[],gaps=[];
 a.concerns.forEach(x=>{max+=3;if(c.concerns.includes(x)){pts+=3;why.push(`Lists ${C[x]} (+3)`);}else gaps.push(`${C[x]} not listed`);});
 max+=2;if(c.ages===null||(c.agesPending&&!c.ages.includes(a.age)&&a.age!=='under8')){pts+=1;why.push('Age range not publicly listed (+1, confirm)');}else if(c.ages.includes(a.age)){pts+=2;why.push(`Works with ${AGE[a.age]}${c.agesLabel?' ('+c.agesLabel+')':''} (+2)`);}else gaps.push(`Doesn't list ${AGE[a.age]}`);
 max+=2;if(c.formats===null){pts+=1;why.push('Formats not publicly listed (+1, confirm)');}else if(c.formats.includes(a.format)){pts+=2;why.push(`Offers ${a.format} therapy (+2)`);}else gaps.push(`${a.format} therapy not listed`);
 if(a.setting&&a.setting!=='either'){max+=2;const sl=a.setting==='inperson'?'in-person sessions':'telehealth';if(!c.settings){pts+=1;why.push(`${sl} not confirmed (+1, confirm)`);}else if(c.settings.includes(a.setting)){pts+=2;why.push(`Offers ${sl} (+2)`);}else gaps.push(c.settings.length===1&&c.settings[0]==='telehealth'?'Telehealth only':`No ${sl}`);}
 if(a.office!=='either'){max+=2;const on=a.office==='bountiful'?'Bountiful':'Draper';const ip=c.settings&&c.settings.includes('inperson');if(c.offices&&c.offices.includes(a.office)&&ip){pts+=2;why.push(`Sees clients in ${on} (+2)`);}else gaps.push(!ip?'Telehealth only':`Not in the ${on} office`);}
 a.mods.forEach(m=>{max+=1;if(c.mods.includes(m)){pts+=1;why.push(`Uses ${M[m]} (+1)`);}else gaps.push(`${M[m]} not listed`);});
 return {c,pts,max,pct:Math.round(100*pts/max),why,gaps};}
window.obcScore=score;
$('#quiz').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
 const a={concerns:f.getAll('concern'),age:f.get('age'),format:f.get('format'),mods:f.getAll('mod'),setting:f.get('setting'),office:f.get('office')||'either'};
 if(a.age==='under8'&&!D.clinicians.some(c=>c.ages&&c.ages.includes('under8'))){$('#results').innerHTML='<div class="card under8-note" role="status"><p>For children under 8, please call us at <a href="tel:3855246665">(385) 524-6665</a> and we\'ll help you find the right fit or a trusted referral.</p></div>';$('#results').scrollIntoView&&$('#results').focus&&0;return;}
 const r=D.clinicians.filter(c=>a.age!=='under8'||!c.ages||c.ages.includes('under8')).map(c=>score(c,a)).sort((x,y)=>y.pct-x.pct||y.pts-x.pts);
 const setNote=a.setting==='either'?'':`<p class="note">You chose ${a.setting==='inperson'?'in person':'telehealth'}.</p>`;
 const T=window.THEME||{};$('#results').innerHTML=`<h3>${T.resultsTitle||'Your ranked matches'} (${a.age==='under8'?r.length+' clinicians who see children under 8':'all '+r.length+' clinicians'})</h3>${setNote}${a.age==='under8'?'<p class="note">For children under 8, you can also call us at <a href="tel:3855246665">(385) 524-6665</a> and we\'ll help you find the right fit.</p>':''}<ol class="ranked">`+r.map((x,i)=>`<li class="card"><div class="rhead"><span class="rank">#${i+1}</span><strong>${esc(x.c.name)}</strong>, ${esc(x.c.cred)}<span class="pct">${x.pct}% fit (${x.pts}/${x.max} pts)</span></div>
 <div class="bar" role="img" aria-label="${x.pct} percent"><span style="width:${x.pct}%"></span></div>
 <p><strong>Why:</strong></p><ul>${x.why.map(w=>`<li>${esc(w)}</li>`).join('')||'<li>No overlap with your selections</li>'}</ul>
 ${x.gaps.length?`<p class="gaps"><strong>Not listed:</strong> ${esc(x.gaps.join('; '))}</p>`:''}
 <a class="btn sm" href="https://openbook-counseling.clientsecure.me" target="_blank" rel="noopener">${(window.THEME&&window.THEME.reqWord)||'Request'} ${esc(x.c.name.split(' ')[0])}</a></li>`).join('')+`</ol><p class="note">Scores reflect publicly listed specialties only, not quality. Feeling understood in the first sessions matters most. You can switch clinicians within the practice anytime.</p>`;
 $('#results').scrollIntoView({behavior:'smooth'});});
// team
const fc=$('#f-concern'),fm=$('#f-mod');
fc.innerHTML+=Object.entries(C).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
fm.innerHTML+=Object.entries(M).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('');
const BOU={'2026':{img:'../shared/img/best-of-utah-2026.webp',url:'https://www.cityweekly.net/best-of-utah/best-of-utah-body-mind-2026--medical-dental-912e5f78',alt:'City Weekly Best of Utah Body & Mind 2026 badge'},'2025':{img:'../shared/img/best-of-utah-2025-cover.webp',url:'https://www.cityweekly.net/best-of-utah/best-of-utah-body-mind-2025-22863581',alt:'Cover of Salt Lake City Weekly, Best of Utah Body & Mind, March 20, 2025'}};
const PRACTICE='Open Book Counseling · Best of Utah 2026, Best Mental Health Treatment Center, 3rd place';
function badges(x){if(!x.badges)return`<div class="bou-badges"><a class="bou-badge bou-2026 bou-practice" href="${BOU['2026'].url}" target="_blank" rel="noopener" title="City Weekly Best of Utah 2026, Best Mental Health Treatment Center, 3rd place"><img src="${BOU['2026'].img}" alt="${esc(BOU['2026'].alt)}: ${esc(PRACTICE)}" loading="lazy" width="70" height="100"><span>${esc(PRACTICE)}</span></a></div>`;return`<p class="bou-practice-line"><a href="${BOU['2026'].url}" target="_blank" rel="noopener">${esc(PRACTICE)}</a></p><div class="bou-badges">${x.badges.map(y=>{const b=BOU[y],t=y==='2026'?x.award:x.award2025;return`<a class="bou-badge bou-${y}" href="${b.url}" target="_blank" rel="noopener" title="${esc(t)}"><img src="${b.img}" alt="${esc(b.alt)}: ${esc(t)}" loading="lazy" width="${y==='2026'?70:64}" height="${y==='2026'?100:71}"><span>${esc(t.replace('City Weekly Best of Utah ','Best of Utah '))}</span></a>`}).join('')}</div>`;}
(function(){const g=$('#team-grid');if(!g||$('.bou-ribbon'))return;const r=document.createElement('a');r.className='bou-ribbon';r.href=BOU['2026'].url;r.target='_blank';r.rel='noopener';
r.innerHTML=`<img src="${BOU['2026'].img}" alt="City Weekly Best of Utah Body & Mind 2026 badge" width="56" height="80"><span><strong>Open Book Counseling</strong> · City Weekly Best of Utah 2026, Best Mental Health Treatment Center, 3rd place</span>`;g.parentNode.insertBefore(r,g);})();
function team(){const c=fc.value,m=fm.value,a=$('#f-age').value,q=$('#f-q').value.toLowerCase();
 const list=D.clinicians.filter(x=>(!c||x.concerns.includes(c))&&(!m||x.mods.includes(m))&&(!a||x.ages===null||x.ages.includes(a))&&(!q||JSON.stringify(x).toLowerCase().includes(q)));
 $('#team-count').textContent=`Showing ${list.length} of ${D.clinicians.length} clinicians`+(a?' (clinicians with unlisted age ranges are included)':'');
 $('#team-grid').innerHTML=list.map(x=>`<article class="card"><div class="avatar" aria-hidden="true">${x.name.split(' ').map(s=>s[0]).join('')}</div><h3>${esc(x.name)}</h3><p class="cred">${esc(x.cred)}</p><p>${esc(x.card||x.style)}</p>${x.bio?`<details class="bio"><summary>Read full bio</summary><p>${esc(x.bio)}</p></details>`:''}
 ${badges(x)}${x.license?`<p class="note">${esc(x.license)}</p>`:''}${x.edu?`<p class="note">${esc(x.edu)}</p>`:''}${x.specialties?`<details class="bio"><summary>Specialties</summary><p>${x.specialties.map(esc).join(' · ')}</p></details>`:''}<p><strong>Ages:</strong> ${x.agesLabel?esc(x.agesLabel):x.ages?ageText(x.ages)+(x.agesPending?'; adults: confirm':''):'Confirm'} · <strong>Formats:</strong> ${x.formats?x.formats.join(', '):'Confirm'} · <strong>Location:</strong> ${x.offices?(x.settings&&!x.settings.includes('inperson')?'Telehealth ('+x.offices.map(o=>o[0].toUpperCase()+o.slice(1)).join(' &amp; ')+' office)':x.offices.map(o=>o[0].toUpperCase()+o.slice(1)).join(' &amp; ')):'Confirm'} · <strong>Sessions:</strong> ${x.settings?(x.settings.length===1&&x.settings[0]==='telehealth'?'Telehealth only':'In person &amp; telehealth'):'Confirm'}</p>
 <p class="tags">${x.concerns.map(k=>`<span>${esc(C[k])}</span>`).join('')}</p><p><strong>Approaches:</strong> ${x.mods.length?x.mods.map(k=>esc(M[k])).join(', '):'Confirm'}</p></article>`).join('')||'<p>No one matches every filter. Try removing one.</p>';
 if(D.staff)$('#team-grid').insertAdjacentHTML('beforeend',D.staff.map(x=>`<article class="card staff-card" data-staff="${esc(x.id)}"><div class="avatar" aria-hidden="true">${x.name.split(' ').map(s=>s[0]).join('')}</div><h3>${esc(x.name)}</h3><p class="cred">${esc(x.role)} · Office staff (not a clinician)</p><p>${esc(x.card)}</p><details class="bio"><summary>Read full bio</summary><p>${esc(x.bio)}</p></details>${badges({})}<p><strong>Contact:</strong> <a href="tel:3855246665">385-524-6665</a> · <a href="mailto:${esc(x.email)}">${esc(x.email)}</a></p></article>`).join(''));}
[fc,fm,$('#f-age'),$('#f-q')].forEach(el=>el.addEventListener('input',team));team();
// modalities
const ex={EMDR:"Eye Movement Desensitization and Reprocessing. Uses guided eye movements or taps while you briefly recall a hard memory, helping your brain re-file it so it feels less raw.",
ART:"Accelerated Resolution Therapy. A short-term, eye-movement-based approach where you can change how a distressing image feels without having to talk through every detail.",
CBT:"Cognitive Behavioral Therapy. Notice the thought-feeling-action loop and practice more helpful thoughts and behaviors.",
"TF-CBT":"Trauma-Focused CBT. A structured CBT model for children, teens and caregivers recovering from trauma, with skills plus a trauma narrative.",
DBT:"Dialectical Behavior Therapy. Skills for big emotions: mindfulness, distress tolerance, emotion regulation and relationships.",
IFS:"Internal Family Systems. Get to know the 'parts' of you (the protector, the critic, the hurt part) with curiosity instead of shame.",
EFT:"Emotionally Focused Therapy. Mostly for couples. Find the cycle you get stuck in and rebuild a secure emotional bond.",
ACT:"Acceptance and Commitment Therapy. Make room for hard feelings and take steps toward what you value.",
Gottman:"A research-based approach for couples that builds friendship, manages conflict, and strengthens connection.",
Imago:"Imago Relationship Therapy. Structured couples dialogue that helps partners really hear each other and the history behind their reactions.",
SFBT:"Solution-Focused Brief Therapy. Focuses on goals, strengths and what's already working.",
Play:"Play therapy. Children use play, their natural language, to work through feelings and experiences with a trained therapist."};
$('#mods').innerHTML=Object.keys(M).filter(k=>ex[k]).map(k=>{const who=D.clinicians.filter(c=>c.mods.includes(k)).map(c=>c.name);return `<details class="card"><summary><strong>${esc(M[k])}</strong></summary><p>${esc(ex[k])}</p><p class="note">Offered by: ${esc(who.join(', '))}</p></details>`}).join('');
// insurance
const ins=$('#ins');ins.innerHTML+=`<optgroup label="Insurance">${D.insurance.map(i=>`<option>${esc(i)}</option>`).join('')}</optgroup><optgroup label="EAP">${D.eap.map(i=>`<option>${esc(i)}</option>`).join('')}</optgroup><option value="other">My plan isn't listed</option>`;
ins.addEventListener('change',()=>{const v=ins.value;$('#ins-out').innerHTML=!v?'':v==='other'?`<p>We may still be able to help with self-pay or out-of-network superbills [CONFIRM]. Call <a href="tel:3855246665">385-524-6665</a>.</p>`:`<p class="ok">✓ ${esc(v)} is on the practice's accepted list.</p><p class="note">Credentialing varies by therapist. Please confirm your specific clinician and benefits with Makayla Jones (385-524-6665).</p>`;});
function fee(){const t=$('#fee-type').value,n=Math.max(1,Math.min(52,parseInt($('#fee-n').value)||1));$('#fee-out').textContent=`${n} × $${D.fees[t]} = $${(n*D.fees[t]).toLocaleString()}${t==='group'?' per person':''}`;}
$('#fee-type').addEventListener('input',fee);$('#fee-n').addEventListener('input',fee);fee();
// faq
const faq=[["Is this an emergency service?","No. If you are in crisis, call or text 988, or call 911 for emergencies."],
["Do you offer telehealth?","Yes. Sessions are available in person in Draper and Bountiful, and online."],
["What does a session cost?","Self-pay: individual $150, couples $200, group $40 per person. Many insurance plans and EAPs are accepted."],
["Do you take my insurance?","Use the checker above. Credentialing varies by therapist, so please confirm with scheduling."],
["Who do you work with?","Individuals, couples and families, from children and teens through adults, including people in high-stress or high-visibility roles."],
["Is my information private?","Yes. Therapy is confidential within legal limits. This website's match quiz runs only in your browser and sends no data."],
["What if my first therapist isn't the right fit?","Fit matters. Let us know and we'll help you switch within the practice."],
["What are your hours?","Mon–Fri 8am–8pm, Sat 8am–6pm, closed Sunday."]];
$('#faq-list').innerHTML=faq.map(([q,a],i)=>`<div class="acc"><h3><button aria-expanded="false" aria-controls="fa${i}" id="fq${i}">${esc(q)}</button></h3><div id="fa${i}" role="region" aria-labelledby="fq${i}" hidden><p>${esc(a)}</p></div></div>`).join('');
document.querySelectorAll('.acc button').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).hidden=o;}));
})();
