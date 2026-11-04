/* Quiet Library: restored interactive chapters.
   The code inside each block below is copied verbatim from ../shared/app.js (same scoring, same data from ../shared/data.js).
   Only the wrapper and the existence guard are new. */
(function(){if(!document.querySelector('#quiz')||!window.OBC)return;
const D=window.OBC,$=s=>document.querySelector(s),C=D.concernLabels,M=D.modLabels;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// --- verbatim from shared/app.js: quiz ---
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
 <a class="btn sm" href="/professional/intake.html">${(window.THEME&&window.THEME.reqWord)||'Request'} ${esc(x.c.name.split(' ')[0])}</a></li>`).join('')+`</ol><p class="note">Scores reflect publicly listed specialties only, not quality. Feeling understood in the first sessions matters most. You can switch clinicians within the practice anytime.</p>`;
 $('#results').scrollIntoView({behavior:'smooth'});});
})();
/* Charm covers (new, Quiet Library design): each charm card starts closed; "Turn a card over to open it". Content stays in the DOM for screen readers. */
document.addEventListener('DOMContentLoaded',function(){var root=document.getElementById('coping');if(!root)return;
 root.querySelectorAll('.skill').forEach(function(c,i){var h=c.querySelector('h3'),cat=c.querySelector('.cat');if(!h)return;
  var f=document.createElement('button');f.type='button';f.className='charm-front';f.setAttribute('aria-label','Open the charm: '+h.textContent);
  f.innerHTML='<span class="cf-seal" aria-hidden="true"></span><span class="cf-cat">'+(cat?cat.textContent:'')+'</span><span class="cf-name">'+h.innerHTML+'</span><span class="cf-open">Turn over to open</span>';
  f.style.setProperty('--i',i%6);c.classList.add('closed-charm');c.appendChild(f);
  f.addEventListener('click',function(){c.classList.add('open');c.classList.remove('closed-charm');f.setAttribute('tabindex','-1');f.setAttribute('aria-hidden','true');h.setAttribute('tabindex','-1');setTimeout(function(){h.focus({preventScroll:true})},60);setTimeout(function(){f.remove()},900)});
 });
});
