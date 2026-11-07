/* Quiet Library: restored interactive chapters.
   Insurance, fees, and FAQ blocks below stay aligned with ../shared/app.js.
   The quiz block is the Chapter I matcher: same weights (+3 / +2 / +1) and the same gender filter.
   Labeled exception: a telehealth answer does not apply in-person office points. */
(function(){if(!document.querySelector('#quiz')||!window.OBC)return;
const D=window.OBC,$=s=>document.querySelector(s),C=D.concernLabels,M=D.modLabels;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const POPULAR=['trauma','anxiety','depression','relationships','grief','burnout'];
const GROUPS=[
 ['Hard chapters',['abuse','shame','selfharm','addiction']],
 ['Body & mind',['eating','bodyimage','ocd','adhd','autism','chronic','dysregulation']],
 ['Relationships & home',['family','attachment']],
 ['Identity & belief',['faith','lgbtq','personality']],
 ['Life stage',['highprofile','transitions']]
];
const SHORT=['EMDR','ART','CBT','TF-CBT','DBT','IFS','EFT','ACT','Play','Gottman'];
function chip(map,name,k){
 return `<label><input type="checkbox" name="${name}" value="${k}">${esc(map[k]||k)}</label>`;
}
function chipRow(map,name,keys){
 return `<div class="chips">${keys.map(k=>chip(map,name,k)).join('')}</div>`;
}
const concernHost=$('#q-concerns');
concernHost.innerHTML=chipRow(C,'concern',POPULAR)
 +`<button type="button" class="btn ghost sm show-more" aria-expanded="false" aria-controls="concern-more" data-more="Show more" data-less="Show fewer">Show more</button>`
 +`<div id="concern-more" class="chip-more" hidden>${GROUPS.map((g,i)=>`<div class="chip-group" role="group" aria-labelledby="cg-${i}"><p class="chip-cat" id="cg-${i}">${esc(g[0])}</p>${chipRow(C,'concern',g[1])}</div>`).join('')}</div>`;
const moreMods=Object.keys(M).filter(k=>SHORT.indexOf(k)<0);
const modHost=$('#q-mods');
modHost.innerHTML=chipRow(M,'mod',SHORT)
 +`<button type="button" class="btn ghost sm show-more" aria-expanded="false" aria-controls="mod-more" data-more="More approaches" data-less="Fewer approaches">More approaches</button>`
 +`<div id="mod-more" class="chips" hidden>${moreMods.map(k=>chip(M,'mod',k)).join('')}</div>`;
function wireMore(root){
 if(!root||!root.querySelectorAll) return;
 root.querySelectorAll('.show-more').forEach(btn=>{
  btn.addEventListener('click',()=>{
   const panel=document.getElementById(btn.getAttribute('aria-controls'));
   const open=btn.getAttribute('aria-expanded')==='true';
   btn.setAttribute('aria-expanded',String(!open));
   if(panel) panel.hidden=open;
   btn.textContent=open?btn.getAttribute('data-more'):btn.getAttribute('data-less');
  });
 });
}
wireMore(concernHost);wireMore(modHost);
const AGE={under8:'children under 8',child8:'children 8–12',teen:'teens',adult:'adults'};
function score(c,a){let pts=0,max=0,why=[],gaps=[];
 a.concerns.forEach(x=>{max+=3;if(c.concerns.includes(x)){pts+=3;why.push(`Lists ${C[x]} (+3)`);}else gaps.push(`${C[x]} not listed`);});
 max+=2;if(c.ages===null||(c.agesPending&&!c.ages.includes(a.age)&&a.age!=='under8')){pts+=1;why.push('Age range not publicly listed (+1, confirm)');}else if(c.ages.includes(a.age)){pts+=2;why.push(`Works with ${AGE[a.age]}${c.agesLabel?' ('+c.agesLabel+')':''} (+2)`);}else gaps.push(`Doesn't list ${AGE[a.age]}`);
 max+=2;if(c.formats===null){pts+=1;why.push('Formats not publicly listed (+1, confirm)');}else if(c.formats.includes(a.format)){pts+=2;why.push(`Offers ${a.format} therapy (+2)`);}else gaps.push(`${a.format} therapy not listed`);
 if(a.setting&&a.setting!=='either'){max+=2;const sl=a.setting==='inperson'?'in-person sessions':'telehealth';if(!c.settings){pts+=1;why.push(`${sl} not confirmed (+1, confirm)`);}else if(c.settings.includes(a.setting)){pts+=2;why.push(`Offers ${sl} (+2)`);}else gaps.push(c.settings.length===1&&c.settings[0]==='telehealth'?'Telehealth only':`No ${sl}`);}
 /* Telehealth does not ask for an in-person office, and those points are not applied. */
 if(a.setting!=='telehealth'&&a.office&&a.office!=='either'){max+=2;const on=a.office==='bountiful'?'Bountiful':'Draper';const ip=c.settings&&c.settings.includes('inperson');if(c.offices&&c.offices.includes(a.office)&&ip){pts+=2;why.push(`Sees clients in ${on} (+2)`);}else gaps.push(!ip?'Telehealth only':`Not in the ${on} office`);}
 a.mods.forEach(m=>{max+=1;if(c.mods.includes(m)){pts+=1;why.push(`Uses ${M[m]} (+1)`);}else gaps.push(`${M[m]} not listed`);});
 return {c,pts,max,pct:max?Math.round(100*pts/max):0,why,gaps};}
window.obcScore=score;
function plainReason(w){
 let s=String(w).replace(/\s*\(\+\d+, confirm\)\s*$/,'').replace(/\s*\(\+\d+\)\s*$/,'');
 if(s==='Age range not publicly listed') return 'Age range is not publicly listed, so this is only a light match';
 if(/ not confirmed$/.test(s)) return s.replace(/ not confirmed$/,' is not confirmed publicly');
 if(s.indexOf('Sees clients in ')===0) return 'Sees clients in person in '+s.slice('Sees clients in '.length);
 return s;
}
function humanWhy(lines){
 const out=[];
 (lines||[]).forEach(w=>{
  const s=plainReason(w);
  if(s&&out.indexOf(s)<0) out.push(s);
 });
 return out.slice(0,3);
}
const PHOTOS={scott:'scott-frazier',amber:'amber-frazier',shanna:'shanna-manjang',amanda:'amanda-lloyd',aspen:'aspen-johnson',abby:'abby-locke'};
const AWARDS={
 scott:['<p class="award">City Weekly Best of Utah 2026: Best Experiential Therapist, 1st place</p><p class="award past">City Weekly Best of Utah 2025, 2nd place</p>'],
 amber:['<p class="award">City Weekly Best of Utah 2026: Best Psychotherapist/Counselor, 3rd place</p>']
};
function awardHtml(c){return (AWARDS[c.id]||[]).join('');}
function toolsHtml(){
 return `<div class="match-tools"><button type="button" class="btn ghost sm" data-match-act="retake">Retake</button><button type="button" class="btn ghost sm" data-match-act="adjust">Adjust answers</button></div>`;
}
function ctas(first){
 return `<div class="match-ctas"><a class="btn sm" href="/professional/intake.html">Begin with ${esc(first)}</a><a class="btn ghost sm" href="tel:3855246665">Call (385) 524-6665</a><a class="btn ghost sm" href="#team">Meet in the Hall</a></div>`;
}
function softCopy(a){
 const bits=['age','format'];
 if(a.setting&&a.setting!=='either') bits.push(a.setting==='telehealth'?'telehealth':'meeting in person');
 if(a.setting!=='telehealth'&&a.office&&a.office!=='either') bits.push('office');
 const last=bits.pop();
 const list=bits.length?bits.join(', ')+' and '+last:last;
 return `Soft match — based mainly on ${list}. These percentages can tie when the lantern has little to go on. Add a concern for a clearer light.`;
}
function resultsHtml(a){
 const G=(a.gender==='man'||a.gender==='woman')?a.gender:null;
 const tools=toolsHtml();
 if(a.age==='under8'&&!D.clinicians.some(c=>c.ages&&c.ages.includes('under8'))) return {magical:false,html:tools+'<div class="card under8-note" role="status" tabindex="-1"><p>For children under 8, please call us at <a href="tel:3855246665">(385) 524-6665</a> and we\'ll help you find the right fit or a trusted referral.</p></div>'};
 const r=D.clinicians.filter(c=>c.id!=='makayla').filter(c=>a.age!=='under8'||!c.ages||c.ages.includes('under8')).filter(c=>!G||c.gender===G).map(c=>score(c,a)).sort((x,y)=>y.pct-x.pct||y.pts-x.pts);
 if(G&&!r.length) return {magical:false,html:tools+'<div class="card" role="status" tabindex="-1"><p>None of our counselors who are '+(G==='man'?'men':'women')+' list this age group. You can choose No preference to see every counselor who does, or call us at <a href="tel:3855246665">(385) 524-6665</a> and we\'ll help you find the right fit.</p><p><button type="button" class="btn sm" data-match-act="clear-gender">Clear gender preference</button></p></div>'};
 const thin=!a.concerns.length&&!a.mods.length;
 let setNote='';
 if(a.setting==='telehealth') setNote='<p class="note">You chose telehealth, so office points were not used.</p>';
 else if(a.setting==='inperson') setNote='<p class="note">You chose in person.</p>';
 const tie=r.length>1&&r[0].pct===r[1].pct;
 const tieNote=tie?'<p class="note tie-note">Where the fit is the same, counselors stay in source-list order.</p>':'';
 const softNote=thin?`<p class="soft-note" role="status">${esc(softCopy(a))}</p>`:'';
 const tryGender=G?`<p class="note"><button type="button" class="btn ghost sm" data-match-act="clear-gender">Try without gender filter</button></p>`:'';
 const T=window.THEME||{};
 const cards=r.map((x,i)=>{const file=PHOTOS[x.c.id];const initials=esc(x.c.name.split(/\s+/).map(s=>s[0]).join(''));
  const human=humanWhy(x.why);
  const first=x.c.name.split(' ')[0];
  return `<li class="card portrait-card${i===0?' is-lead':''}" style="--i:${i}"><figure class="portrait-frame"><span class="portrait-fallback" aria-hidden="true">${initials}</span>${file?`<img class="portrait" src="../professional/img/team/${file}.webp" alt="" width="160" height="160" decoding="async">`:''}</figure><div class="portrait-body"><div class="rhead"><span class="rank">#${i+1}</span><h4 class="who"><strong>${esc(x.c.name)}</strong>, ${esc(x.c.cred)}</h4><span class="pct">${x.pct}% ${thin?'soft fit':'fit'}</span></div>
 ${awardHtml(x.c)}
 <div class="bar" role="img" aria-label="${x.pct} percent"><span style="width:${x.pct}%"></span></div>
 <p><strong>Why</strong></p><ul class="why-human">${human.map(w=>`<li>${esc(w)}</li>`).join('')||'<li>No listed overlap with your selections yet</li>'}</ul>
 <details class="score-details"><summary>Score details</summary><ul>${x.why.map(w=>`<li>${esc(w)}</li>`).join('')||'<li>No overlap with your selections</li>'}</ul></details>
 ${x.gaps.length?`<p class="gaps-label"><strong>Not listed</strong></p><ul class="gap-chips">${x.gaps.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>`:''}
 ${ctas(first)}</div></li>`;}).join('');
 const title=`<h3 id="results-title" tabindex="-1">${T.resultsTitle||'Your ranked matches'} (${a.age==='under8'?r.length+' clinicians who see children under 8':G?r.length+' of '+D.clinicians.length+' clinicians, by your gender preference':'all '+r.length+' clinicians'})</h3>`;
 return {magical:true,html:tools+title+softNote+setNote+tieNote+tryGender+`<ol class="ranked${thin?' is-soft':''}">`+cards+`</ol><p class="note">Scores reflect publicly listed specialties only, not quality. Feeling understood in the first sessions matters most. You can switch clinicians within the practice anytime.</p><p class="note"><a href="#team">Read more in the Hall of Counselors</a></p><p class="note">If you want a next chapter, the <a href="#insurance">Treasury</a> and the <a href="#locations">Two Libraries</a> are open.</p>`};
}
window.obcResultsHtml=resultsHtml;
function showResults(root){const h=root.querySelector('h3,[role="status"]');if(h){if(!h.hasAttribute('tabindex'))h.setAttribute('tabindex','-1');try{h.focus({preventScroll:true})}catch(err){h.focus()}}
 const calm=document.documentElement.classList.contains('calm')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;try{root.scrollIntoView({behavior:calm?'auto':'smooth',block:'nearest'})}catch(err){}}
let allowThin=false;
const thin=document.createElement('div');
thin.id='thin-confirm';
thin.className='thin-confirm';
thin.hidden=true;
thin.setAttribute('role','region');
thin.setAttribute('aria-label','A gentle check before the lantern lights');
thin.innerHTML='<p id="thin-title"><strong>The lantern is still dim.</strong> With no concerns and no approaches chosen, the ranking will be a near-tie. Add a concern for a clearer lantern, or light it anyway.</p><div class="thin-actions"><button type="button" class="btn sm" id="thin-back">Add a concern</button><button type="button" class="btn ghost sm" id="thin-go">Light it anyway</button></div>';
const results=$('#results');
if(results&&results.before) results.before(thin);
const thinBack=thin.querySelector('#thin-back');
const thinGo=thin.querySelector('#thin-go');
if(thinBack) thinBack.addEventListener('click',()=>{allowThin=false;thin.hidden=true;if(window.obcMatchGoto) window.obcMatchGoto(0);});
if(thinGo) thinGo.addEventListener('click',()=>{allowThin=true;thin.hidden=true;const q=$('#quiz');if(q.requestSubmit) q.requestSubmit();else q.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
window.obcMatchOnAnswersReset=function(){allowThin=false;thin.hidden=true;};
if(results) results.addEventListener('click',e=>{
 const b=e.target&&e.target.closest?e.target.closest('[data-match-act]'):null;
 if(!b) return;
 const act=b.getAttribute('data-match-act');
 if(act==='retake'&&window.obcMatchRetake) window.obcMatchRetake();
 else if(act==='adjust'&&window.obcMatchGoto) window.obcMatchGoto(-1);
 else if(act==='clear-gender'&&window.obcMatchClearGender) window.obcMatchClearGender();
});
$('#quiz').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);
 const a={concerns:f.getAll('concern'),age:f.get('age'),format:f.get('format'),mods:f.getAll('mod'),setting:f.get('setting'),office:f.get('office')||'either',gender:f.get('gender')||'any'};
 if(!a.concerns.length&&!a.mods.length&&!allowThin){thin.hidden=false;if(thinBack){try{thinBack.focus();}catch(err){}}try{thin.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(err){}return;}
 allowThin=false;thin.hidden=true;
 const out=resultsHtml(a);
 const paint=animated=>{const root=$('#results');root.classList.toggle('is-reveal',!!animated&&out.magical);root.innerHTML=out.html;root.querySelectorAll('img.portrait').forEach(img=>img.addEventListener('error',()=>img.remove()));};
 if(out.magical&&typeof window.obcMatchReveal==='function') window.obcMatchReveal(paint,()=>showResults($('#results')));
 else{paint(false);showResults($('#results'));}});
})();
(function(){if(!document.querySelector('#ins')||!window.OBC)return;
const D=window.OBC,$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// --- verbatim from shared/app.js: insurance + fees ---
// insurance
const ins=$('#ins');ins.innerHTML+=`<optgroup label="Insurance">${D.insurance.map(i=>`<option>${esc(i)}</option>`).join('')}</optgroup><optgroup label="EAP">${D.eap.map(i=>`<option>${esc(i)}</option>`).join('')}</optgroup><option value="other">My plan isn't listed</option>`;
ins.addEventListener('change',()=>{const v=ins.value;$('#ins-out').innerHTML=!v?'':v==='other'?`<p>We may still be able to help with self-pay, and we can provide superbills for out-of-network clients. Call <a href="tel:3855246665">385-524-6665</a>.</p>`:`<p class="ok">✓ ${esc(v)} is on the practice's accepted list.</p><p class="note">Credentialing varies by therapist. Please confirm your specific clinician and benefits with Makayla Jones (385-524-6665).</p>`;});
function fee(){const t=$('#fee-type').value,n=Math.max(1,Math.min(52,parseInt($('#fee-n').value)||1));$('#fee-out').textContent=`${n} × $${D.fees[t]} = $${(n*D.fees[t]).toLocaleString()}${t==='group'?' per person':''}`;}
$('#fee-type').addEventListener('input',fee);$('#fee-n').addEventListener('input',fee);fee();
})();
(function(){if(!document.querySelector('#faq-list'))return;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// --- verbatim from shared/app.js: faq ---
// faq
const faq=[["Is this an emergency service?","No. If you are in crisis, call or text 988, or call 911 for emergencies."],
["Do you offer telehealth?","Yes. Sessions are available in person in Draper and Bountiful, and online."],
["What does a session cost?","Self-pay: individual $150, couples $200, group $40 per person. Many insurance plans and EAPs are accepted."],
["Do you take my insurance?","Use the checker above. Credentialing varies by therapist, so please confirm with scheduling."],
["Who do you work with?","Individuals, couples and families, from children and teens through adults, including people in high-stress or high-visibility roles."],
["Is my information private?","Yes. Therapy is confidential within legal limits. This website's match quiz runs only in your browser and sends no data."],
["What if my first therapist isn't the right fit?","Fit matters. Let us know and we'll help you switch within the practice."],
["What are your hours?","Mon–Fri 8am–9pm, Sat 8am–4pm, closed Sunday."]];
$('#faq-list').innerHTML=faq.map(([q,a],i)=>`<div class="acc"><h3><button aria-expanded="false" aria-controls="fa${i}" id="fq${i}">${esc(q)}</button></h3><div id="fa${i}" role="region" aria-labelledby="fq${i}" hidden><p>${esc(a)}</p></div></div>`).join('');
document.querySelectorAll('.acc button').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).hidden=o;}));
})();
/* Charm covers (new, Quiet Library design): each charm card starts closed; "Turn a card over to open it". Content stays in the DOM for screen readers. */
document.addEventListener('DOMContentLoaded',function(){var root=document.getElementById('coping');if(!root)return;
 root.querySelectorAll('.skill').forEach(function(c,i){var h=c.querySelector('h3'),cat=c.querySelector('.cat');if(!h)return;
  var f=document.createElement('button');f.type='button';f.className='charm-front';/* fix18: the label carries all of the visible text (tag, name, "Turn over to open"), spaced, so it matches what is seen */
  f.setAttribute('aria-label',('Open the charm: '+(cat?cat.textContent+' ':'')+h.textContent+' Turn over to open').replace(/\s+/g,' '));
  f.innerHTML='<span class="cf-seal" aria-hidden="true"></span><span class="cf-cat">'+(cat?cat.textContent:'')+'</span> <span class="cf-name">'+h.innerHTML+'</span> <span class="cf-open">Turn over to open</span>';
  f.style.setProperty('--i',i%6);c.classList.add('closed-charm');c.appendChild(f);
  f.addEventListener('click',function(){
    if(c.classList.contains('open'))return;
    if(c.classList.contains('opening')){if(performance.now()-(c._armed||0)>650&&c._reveal)c._reveal();return}
    var calm=document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ran=false;
    function reveal(){
      if(ran)return;ran=true;
      c.classList.remove('opening');c._reveal=null;
      c.classList.add('open');
      if(!calm && !document.documentElement.classList.contains('calm') && !matchMedia('(prefers-reduced-motion: reduce)').matches)c.classList.add('rited');
      c.classList.remove('closed-charm');
      f.setAttribute('tabindex','-1');f.setAttribute('aria-hidden','true');h.setAttribute('tabindex','-1');
      setTimeout(function(){h.focus({preventScroll:true})},calm?0:40);
      setTimeout(function(){if(f.parentNode)f.remove()},calm?0:900);
    }
    c._reveal=reveal;
    if(calm||!window.obcCharm){reveal();return}
    c._armed=performance.now();
    c.classList.add('opening');
    window.obcCharm.draw(c,f,reveal);
  });
 });
});
