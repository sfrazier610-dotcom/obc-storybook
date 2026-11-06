/* Chapter I ritual: one question at a time, then the lantern reveal.
   Scoring stays in quiet-shared.js (same weights, with the labeled telehealth/office exception).
   This file walks the form, draws the lantern, and plays the ending. */
(function(){
'use strict';
var quiz=document.getElementById('quiz');
if(!quiz) return;
var fs=Array.prototype.slice.call(quiz.querySelectorAll('fieldset'));
if(!fs.length) return;
var sub=quiz.querySelector('button[type="submit"]');
var qi=0, reached=0, lastEdit=0, booted=false;
var bloomAnims=[];

function isCalm(){
 return document.documentElement.classList.contains('calm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function legendText(f){
 var leg=f.querySelector('legend');
 return (leg?leg.textContent:'Question').replace(/\s+/g,' ').trim();
}
function stepName(f){
 var set=f.getAttribute('data-step');
 if(set) return set;
 var inp=f.querySelector('input');
 return inp?inp.name:'';
}
function indexOfStep(name){
 for(var i=0;i<fs.length;i++) if(stepName(fs[i])===name) return i;
 return -1;
}

var S='fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
var GLYPH={
 shield:'<path '+S+' d="M12 3 19 6v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
 wave:'<path '+S+' d="M3 15c2 0 2-3 4-3s2 3 4 3 2-3 4-3 2 3 4 3"/>',
 cloud:'<path '+S+' d="M7 18h9a4 4 0 0 0 .3-8 5 5 0 0 0-9.5-1.2A3.5 3.5 0 0 0 7 18z"/>',
 knot:'<path '+S+' d="M8 8c0 4 8 4 8 8M16 8c0 4-8 4-8 8"/>',
 leaf:'<path '+S+' d="M5 19C5 11 12 5 20 4 19 12 13 19 5 19z"/><path '+S+' d="M9 15c2-2 4-4 7-6"/>',
 mirror:'<rect '+S+' x="7" y="3" width="10" height="13" rx="5"/><path '+S+' d="M9 21h6M12 16v5"/>',
 link:'<path '+S+' d="M9 12h6"/><path '+S+' d="M8 9H7a3 3 0 0 0 0 6h1M16 9h1a3 3 0 0 1 0 6h-1"/>',
 flame:'<path '+S+' d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1.2-3.2 2.2-4.2.2 2 2 2.2 2-1.2C12.2 8 13 9 13 11c0-2 .2-4-1-8z"/>',
 crown:'<path '+S+' d="M4 16h16L18 8l-4 4-2-6-2 6-4-4z"/>',
 candle:'<path '+S+' d="M12 11v8M9 21h6"/><path '+S+' d="M12 4c1.4 1.6 2.2 2.6 2.2 3.6a2.2 2.2 0 1 1-4.4 0C9.8 6.6 10.6 5.6 12 4z"/>',
 mask:'<path '+S+' d="M4 10c0 5 3.2 9 8 9s8-4 8-9c-2 1.4-4.2 2-8 2s-6-.6-8-2z"/><path '+S+' d="M9 12h.01M15 12h.01"/>',
 home:'<path '+S+' d="M4 11 12 4l8 7v8H4z"/><path '+S+' d="M10 19v-5h4v5"/>',
 window:'<path '+S+' d="M5 4h14v16H5zM12 4v16M5 12h14"/>',
 diamond:'<path '+S+' d="M12 3 20 12 12 21 4 12z"/>',
 loop:'<path '+S+' d="M8 15a4 4 0 1 1 .8-6.2L15 15a4 4 0 1 0 .8-6.2"/>',
 spark:'<path '+S+' d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3.2 3.2M14.8 14.8 18 18M18 6l-3.2 3.2M9.2 14.8 6 18"/>',
 infinity:'<path '+S+' d="M8 15c-2.4 0-4-1.6-4-3s1.6-3 4-3c2.6 0 3.4 2 4 3s1.4 3 4 3c2.4 0 4-1.6 4-3s-1.6-3-4-3c-2.6 0-3.4 2-4 3s-1.4 3-4 3z"/>',
 heart:'<path '+S+' d="M12 19s-6.5-4-6.5-8.2A3.4 3.4 0 0 1 12 8a3.4 3.4 0 0 1 6.5 2.8C18.5 15 12 19 12 19z"/>',
 path:'<path '+S+' d="M5 19c3-6 3-8 7-8s4 2 7-6"/><circle cx="5" cy="19" r="1.2" fill="currentColor"/><circle cx="19" cy="5" r="1.2" fill="currentColor"/>',
 quill:'<path '+S+' d="M14 4c-4 5-6 8-8 14 4-1 6-3 8-6"/><path '+S+' d="M14 4c2 2 3 4 2 7"/>',
 book:'<path '+S+' d="M12 7v13M12 7a4 4 0 0 0-4-2H5v13h3a4 4 0 0 1 4 2 4 4 0 0 1 4-2h3V5h-3a4 4 0 0 0-4 2z"/>',
 lantern:'<path '+S+' d="M10 3h4M12 3v3M9 6h6l2 3v7l-2 3H9l-2-3V9z"/><path '+S+' d="M12 10v4"/>',
 sprout:'<path '+S+' d="M12 21V11"/><path '+S+' d="M12 14c0-4 4-6 8-6-1 4-4 6-8 6zM12 16c0-3-3.5-5-7-5 1 3 3.5 5 7 5"/>',
 person:'<circle cx="12" cy="8" r="2.5" '+S+'/><path '+S+' d="M7 19c.6-3 2.4-4.5 5-4.5s4.4 1.5 5 4.5"/>',
 people:'<circle cx="9" cy="8" r="2" '+S+'/><circle cx="16" cy="9" r="1.6" '+S+'/><path '+S+' d="M4.5 19c.5-2.8 2-4.2 4.3-4.2 1.5 0 2.5.7 3.2 1.7M12.8 19c.4-2.2 1.7-3.4 3.5-3.4 1.6 0 2.8 1 3.4 2.8"/>',
 door:'<path '+S+' d="M7 20V5l10-2v17"/><path '+S+' d="M7 20h10"/><circle cx="14.2" cy="12" r=".8" fill="currentColor"/>',
 screen:'<rect '+S+' x="3.5" y="5" width="17" height="11" rx="1.5"/><path '+S+' d="M8 20h8M12 16v4"/>',
 fork:'<path '+S+' d="M12 21V11"/><path '+S+' d="M12 13C12 8 6 6 6 6M12 13c0-5 6-7 6-7"/>',
 peaks:'<path '+S+' d="m3 18 6-10 4 6 3-4 5 8z"/>',
 tree:'<path '+S+' d="M12 21v-7"/><path '+S+' d="M12 14 7 18h10zM12 8l-3.5 6h7z"/>',
 venus:'<circle cx="12" cy="9" r="3.2" '+S+'/><path '+S+' d="M12 12.2V20M9.2 17h5.6"/>',
 mars:'<circle cx="10" cy="14" r="3.5" '+S+'/><path '+S+' d="m12.5 11.5 5-5M17.5 6.5h-4.2M17.5 6.5v4.2"/>',
 eye:'<path '+S+' d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.1" '+S+'/>',
 rings:'<circle cx="9" cy="12" r="3.2" '+S+'/><circle cx="15" cy="12" r="3.2" '+S+'/>',
 brush:'<path '+S+' d="M15 4c2 2 2 4 .8 6L9 18H6v-3l6.8-8c.6-2 1-3 2.2-3z"/>',
 breath:'<circle cx="12" cy="12" r="3" '+S+'/><circle cx="12" cy="12" r="6.5" '+S+'/>',
 blocks:'<path '+S+' d="M4 14h6v6H4zM13 4h7v6h-7zM9 8h6v5H9z"/>'
};
var CONCERN={trauma:'shield',abuse:'shield',anxiety:'wave',depression:'cloud',addiction:'knot',eating:'leaf',bodyimage:'mirror',relationships:'link',burnout:'flame',highprofile:'crown',grief:'candle',shame:'mask',family:'home',faith:'window',lgbtq:'diamond',ocd:'loop',adhd:'spark',personality:'mask',attachment:'link',dysregulation:'wave',autism:'infinity',selfharm:'heart',chronic:'leaf',transitions:'path'};
var MOD={EMDR:'eye',ART:'eye',Play:'blocks',Gottman:'rings',EFT:'rings',Imago:'rings',ArtTherapy:'brush',Sandplay:'brush',Mindfulness:'breath',MBCT:'breath',ACT:'breath'};
var CHOICE={
 'age:under8':'sprout','age:child8':'book','age:teen':'quill','age:adult':'lantern',
 'format:individual':'person','format:couples':'people','format:family':'home','format:child':'sprout',
 'setting:inperson':'door','setting:telehealth':'screen','setting:either':'fork',
 'office:draper':'peaks','office:bountiful':'tree','office:either':'fork',
 'gender:woman':'venus','gender:man':'mars','gender:any':'lantern'
};
function iconFor(input){
 var name=input.name, value=input.value, key='quill';
 if(CHOICE[name+':'+value]) key=CHOICE[name+':'+value];
 else if(name==='concern') key=CONCERN[value]||'heart';
 else if(name==='mod') key=MOD[value]||'book';
 var body=GLYPH[key]||GLYPH.quill;
 return '<span class="chip-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" focusable="false" aria-hidden="true">'+body+'</svg></span>';
}
function decorate(){
 quiz.querySelectorAll('label').forEach(function(label){
  if(label.querySelector('.chip-ico')) return;
  var input=label.querySelector('input');
  if(!input) return;
  input.insertAdjacentHTML('afterend', iconFor(input));
 });
}

function mothSVG(){
 return '<svg viewBox="0 0 36 20" focusable="false" aria-hidden="true">'
  +'<path class="wing l" fill="currentColor" d="M17 10C12 2 3 1 1.5 6.5 6 8 12 9.2 17 10z"/>'
  +'<path class="wing l2" fill="currentColor" opacity=".5" d="M17 11C13 16 6 18.5 2 15.5 7 13.5 12 12 17 11z"/>'
  +'<path class="wing r" fill="currentColor" d="M19 10C24 2 33 1 34.5 6.5 30 8 24 9.2 19 10z"/>'
  +'<path class="wing r2" fill="currentColor" opacity=".5" d="M19 11C23 16 30 18.5 34 15.5 29 13.5 24 12 19 11z"/>'
  +'<ellipse cx="18" cy="10.6" rx="1.2" ry="3.3" fill="#16323A"/>'
  +'<circle cx="18" cy="7.1" r="1" fill="#16323A"/>'
  +'</svg>';
}
function lanternSVG(id){
 var g=function(name){return id+'-'+name;};
 return '<svg class="lantern-svg is-layered" viewBox="0 0 120 184" aria-hidden="true" focusable="false">'
  +'<defs>'
  +'<linearGradient id="'+g('metal')+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8edd0"/><stop offset=".32" stop-color="#e2c278"/><stop offset=".55" stop-color="#a56b2e"/><stop offset=".78" stop-color="#f0d79a"/><stop offset="1" stop-color="#6a431c"/></linearGradient>'
  +'<linearGradient id="'+g('dome')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e6b8"/><stop offset=".5" stop-color="#c89b3c"/><stop offset="1" stop-color="#7a4e22"/></linearGradient>'
  +'<radialGradient id="'+g('glass')+'" cx="50%" cy="36%" r="70%"><stop offset="0" stop-color="#fff8ea" stop-opacity=".58"/><stop offset=".48" stop-color="#f0d79a" stop-opacity=".24"/><stop offset="1" stop-color="#1F6F6B" stop-opacity=".22"/></radialGradient>'
  +'<radialGradient id="'+g('glow')+'" cx="50%" cy="58%" r="55%"><stop offset="0" stop-color="#fff4cc" stop-opacity=".95"/><stop offset=".45" stop-color="#f0d79a" stop-opacity=".5"/><stop offset="1" stop-color="#f0d79a" stop-opacity="0"/></radialGradient>'
  +'<linearGradient id="'+g('ink')+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4e56"/><stop offset="1" stop-color="#16323A"/></linearGradient>'
  +'</defs>'
  +'<path d="M60 1.2l1.8 3.6 4 .3-3 2.6.9 3.8L60 9.6 56.3 11.5l.9-3.8-3-2.6 4-.3z" fill="url(#'+g('metal')+')" stroke="#16323A" stroke-width=".45"/>'
  +'<circle cx="60" cy="16.5" r="4.6" fill="#F7F4EE" stroke="url(#'+g('metal')+')" stroke-width="1.8"/>'
  +'<circle cx="60" cy="16.5" r="1.5" fill="#9A4A2E"/>'
  +'<path d="M32 52c0-18 12-30 28-34 16 4 28 16 28 34 0 5-2 7-5 8H37c-3-1-5-3-5-8z" fill="url(#'+g('dome')+')" stroke="#16323A" stroke-width="1"/>'
  +'<path d="M40 34v16M80 34v16" fill="none" stroke="#f8edd0" stroke-width="1.15" opacity=".85"/>'
  +'<path d="M50 18C38 14 30 26 34 42" fill="none" stroke="url(#'+g('metal')+')" stroke-width="1.7" stroke-linecap="round"/>'
  +'<path d="M70 18C82 14 90 26 86 42" fill="none" stroke="url(#'+g('metal')+')" stroke-width="1.7" stroke-linecap="round"/>'
  +'<path d="M30 58h60l-4 7H34z" fill="url(#'+g('ink')+')" stroke="#c89b3c" stroke-width=".9"/>'
  +'<path d="M38 61h44" stroke="#f0d79a" stroke-width=".7" opacity=".8"/>'
  +'<path d="M36 66h48l8 12v40l-12 16H40L28 118V78z" fill="#241910"/>'
  +'<ellipse class="glass-glow" cx="60" cy="98" rx="18" ry="28" fill="url(#'+g('glow')+')"/>'
  +'<rect x="54" y="102" width="12" height="20" rx="1.2" fill="#F7F4EE" stroke="#9A4A2E" stroke-width=".8"/>'
  +'<path d="M56 107c2 1.6 6 1.6 8 0" fill="none" stroke="#e7d3a4" stroke-width=".7"/>'
  +'<path d="M60 102V95" stroke="#16323A" stroke-width="1.15" stroke-linecap="round"/>'
  +'<g class="flame-rig">'
  +'<path class="flame-outer" d="M60 68c8 10 11 20 0 34-11-14-8-24 0-34z"/>'
  +'<path class="flame-inner" d="M60 80c3.4 5 4 10.5 0 17-4-6.5-3.4-12 0-17z"/>'
  +'</g>'
  +'<path d="M36 66h48l8 12v40l-12 16H40L28 118V78z" fill="url(#'+g('glass')+')"/>'
  +'<path class="glass-glint" d="M34 78l7-2 5 34-9 5z" fill="#fff"/>'
  +'<path d="M36 66h48l8 12v40l-12 16H40L28 118V78z" fill="none" stroke="url(#'+g('metal')+')" stroke-width="2.5" stroke-linejoin="round"/>'
  +'<path d="M46 82v36M60 76v46M74 82v36" fill="none" stroke="#16323A" stroke-width="1.2" opacity=".88"/>'
  +'<path d="M38 94h44M40 108h40" fill="none" stroke="#1F6F6B" stroke-width="1.15" opacity=".82"/>'
  +'<path d="M40 80c6-12 12-16 20-16s14 4 20 16" fill="none" stroke="#f0d79a" stroke-width="1.2"/>'
  +'<circle cx="36" cy="70" r="1.2" fill="#f0d79a"/><circle cx="84" cy="70" r="1.2" fill="#f0d79a"/>'
  +'<circle cx="32" cy="116" r="1.2" fill="#f0d79a"/><circle cx="88" cy="116" r="1.2" fill="#f0d79a"/>'
  +'<path d="M30 130h60l-8 12H38z" fill="url(#'+g('metal')+')" stroke="#16323A" stroke-width=".85"/>'
  +'<path d="M44 142h32l-6 6H50z" fill="url(#'+g('ink')+')" stroke="#c89b3c" stroke-width=".65"/>'
  +'<path d="M46 134h28" stroke="#fff6df" stroke-width=".6" opacity=".75"/>'
  +'<polygon points="60,150 69,160 60,172 51,160" fill="#1F6F6B" stroke="#c89b3c" stroke-width="1.25"/>'
  +'<polygon points="60,154 65,160 60,167 55,160" fill="#f0d79a" opacity=".72"/>'
  +'</svg>';
}

var head=document.createElement('div');
head.className='lantern-head';
head.style.setProperty('--lit','0');
var live=document.createElement('div');
live.className='lantern-live';
live.setAttribute('aria-hidden','true');
live.innerHTML='<span class="lantern-glow a"></span><span class="lantern-glow b"></span>'
 +'<canvas class="mote-canvas" aria-hidden="true"></canvas>'
 +['m1','m2','m3','m4','m5'].map(function(c){return '<span class="moth '+c+'">'+mothSVG()+'</span>';}).join('')
 +lanternSVG('lnH');
var path=document.createElement('ol');
path.className='step-path';
path.setAttribute('role','list');
path.setAttribute('aria-label','Seven steps');
fs.forEach(function(f,i){
 var li=document.createElement('li');
 var b=document.createElement('button');
 b.type='button';
 b.innerHTML='<span class="pip">'+(i+1)+'</span>';
 var label='Step '+(i+1)+' of '+fs.length+': '+legendText(f);
 b.setAttribute('aria-label', label);
 b.setAttribute('data-label', label);
 b.addEventListener('click', function(){ if(!b.disabled) go(i); });
 li.appendChild(b);
 path.appendChild(li);
});
head.appendChild(live);
head.appendChild(path);
quiz.insertBefore(head, quiz.firstChild);

var nav=document.createElement('div');
nav.className='quiz-nav';
var hint=document.createElement('p');
hint.className='step-hint';
hint.id='step-hint';
hint.setAttribute('role','status');
var back=document.createElement('button');
back.type='button'; back.className='btn ghost sm'; back.id='q-back'; back.textContent='Back';
var count=document.createElement('p');
count.className='quiz-count'; count.id='q-cnt'; count.setAttribute('aria-live','polite');
var none=document.createElement('button');
none.type='button'; none.className='btn ghost sm'; none.id='q-none'; none.textContent='None of these'; none.hidden=true;
var next=document.createElement('button');
next.type='button'; next.className='btn sm'; next.id='q-next'; next.textContent='Next';
nav.appendChild(hint); nav.appendChild(back); nav.appendChild(count); nav.appendChild(none); nav.appendChild(next);
if(sub){sub.before(nav); nav.appendChild(sub);} else quiz.appendChild(nav);

var officeNote=document.createElement('p');
officeNote.className='step-note';
officeNote.id='telehealth-office-note';
officeNote.hidden=true;
officeNote.textContent='Telehealth skips the office step. In-person office points are not used.';
var settingFs=fs[indexOfStep('setting')]||null;
if(settingFs) settingFs.appendChild(officeNote);

function officeSkipped(){
 var s=quiz.querySelector('input[name="setting"]:checked');
 return !!(s && s.value==='telehealth');
}
function isOffice(i){return fs[i] && stepName(fs[i])==='office';}
function stepOk(i){
 var f=fs[i];
 if(!f || !f.querySelector('input[type="radio"]')) return true;
 if(stepName(f)==='office') return true;
 return !!f.querySelector('input[type="radio"]:checked');
}
function nextIndex(from){
 var n=from+1;
 while(n<fs.length && officeSkipped() && isOffice(n)) n++;
 return n;
}
function setHint(msg){hint.textContent=msg||'';}
function setRadio(name, value){
 var el=quiz.querySelector('input[name="'+name+'"][value="'+value+'"]');
 if(el) el.checked=true;
}
function scrollQuiz(){
 var root=document.getElementById('match-body')||quiz;
 try{root.scrollIntoView({behavior:isCalm()?'auto':'smooth', block:'start'});}catch(e){}
}
function paintPips(){
 var skipped=officeSkipped();
 if(officeNote) officeNote.hidden=!skipped;
 Array.prototype.forEach.call(path.children, function(li,i){
  var b=li.querySelector('button');
  var off=skipped && isOffice(i);
  li.classList.toggle('is-done', i<qi && !off);
  li.classList.toggle('is-skipped', off);
  b.disabled=off || i>reached;
  if(i===qi) b.setAttribute('aria-current','step');
  else b.removeAttribute('aria-current');
  b.setAttribute('aria-label', off
    ? ('Step '+(i+1)+' of '+fs.length+': office, not used for telehealth')
    : b.getAttribute('data-label'));
 });
}
function show(dir){
 fs.forEach(function(f,j){
  var on=j===qi;
  f.hidden=!on;
  f.classList.toggle('is-step', on);
  f.classList.remove('from-next','from-back');
  if(on && dir){
   void f.offsetWidth;
   f.classList.add(dir>0?'from-next':'from-back');
  }
 });
 var last=fs.length-1;
 var lit=last===0?1:qi/last;
 head.style.setProperty('--lit', String(lit));
 path.style.setProperty('--lit', String(lit));
 live.querySelectorAll('.moth').forEach(function(m,i){m.classList.toggle('on', i<qi);});
 paintPips();
 var multi=!!fs[qi].querySelector('input[type="checkbox"]');
 var anyChecked=!!fs[qi].querySelector('input[type="checkbox"]:checked');
 if(count){
  var msg='Step '+(qi+1)+' of '+fs.length;
  if(officeSkipped() && stepName(fs[qi])==='gender') msg+='. Office skipped for telehealth.';
  count.textContent=msg;
 }
 back.disabled=qi===0;
 next.hidden=qi===last;
 next.textContent=(multi && !anyChecked)?'Skip for now':'Next';
 none.hidden=!multi;
 if(sub) sub.hidden=qi!==last;
 setHint('');
 if(booted){
  var leg=fs[qi].querySelector('legend');
  if(leg){leg.setAttribute('tabindex','-1'); try{leg.focus({preventScroll:true});}catch(e){leg.focus();}}
 }
 kickMotes();
}
function go(n, dir){
 var forward=dir==null ? n>qi : dir>0;
 var guard=0;
 while(n>=0 && n<fs.length && officeSkipped() && isOffice(n) && guard++<4){
  n=forward?n+1:n-1;
 }
 n=Math.max(0, Math.min(fs.length-1, n));
 if(officeSkipped() && isOffice(n)) return;
 if(n===qi) return;
 forward=dir==null ? n>qi : dir>0;
 if(forward && !stepOk(qi)){
  setHint('Choose one to turn the page.');
  var leg=fs[qi].querySelector('legend');
  if(leg){leg.setAttribute('tabindex','-1'); try{leg.focus();}catch(e){}}
  return;
 }
 if(forward && n>reached){
  if(n!==nextIndex(qi)) return;
  reached=n;
 }
 qi=n;
 show(forward?1:-1);
}

back.addEventListener('click', function(){go(qi-1,-1);});
next.addEventListener('click', function(){go(qi+1,1);});
none.addEventListener('click', function(){
 Array.prototype.forEach.call(fs[qi].querySelectorAll('input[type="checkbox"]'), function(inp){inp.checked=false;});
 go(qi+1, 1);
});
quiz.addEventListener('change', function(e){
 lastEdit=qi;
 if(e.target && e.target.name==='setting'){
  paintPips();
  if(officeSkipped() && isOffice(qi)) go(nextIndex(qi), 1);
 }
 if(e.target && (e.target.name==='concern' || e.target.name==='mod')){
  var multi=!!fs[qi].querySelector('input[type="checkbox"]');
  var anyChecked=!!fs[qi].querySelector('input[type="checkbox"]:checked');
  if(multi) next.textContent=anyChecked?'Next':'Skip for now';
 }
});
quiz.classList.add('wizard');
decorate();
show(0);
booted=true;

quiz.addEventListener('submit', function(e){
 if(window.obcMatchForce) return;
 if(qi<fs.length-1){e.preventDefault(); e.stopImmediatePropagation(); go(qi+1,1);}
}, true);
quiz.addEventListener('keydown', function(e){
 if(e.key!=='Enter') return;
 if(e.target && e.target.closest && e.target.closest('button')) return;
 if(qi<fs.length-1){e.preventDefault(); go(qi+1,1);}
});

window.obcMatchGoto=function(n){
 if(typeof n!=='number' || n<0) n=lastEdit;
 if(officeSkipped() && isOffice(n)) n=indexOfStep('setting');
 if(n<0) n=0;
 n=Math.max(0, Math.min(fs.length-1, reached, n));
 var d=n===qi?0:(n>qi?1:-1);
 qi=n;
 show(d);
 scrollQuiz();
};
window.obcMatchRetake=function(){
 Array.prototype.forEach.call(quiz.querySelectorAll('input[type="checkbox"]'), function(inp){inp.checked=false;});
 setRadio('age','adult');
 setRadio('format','individual');
 setRadio('setting','either');
 setRadio('office','either');
 setRadio('gender','any');
 if(typeof window.obcMatchOnAnswersReset==='function') window.obcMatchOnAnswersReset();
  reached=0; lastEdit=0; qi=0;
  var results=document.getElementById('results');
  if(results){results.innerHTML=''; results.classList.remove('is-reveal');}
  show(0);
  scrollQuiz();
};
window.obcMatchClearGender=function(){
 setRadio('gender','any');
 window.obcMatchForce=true;
 try{
  if(quiz.requestSubmit) quiz.requestSubmit();
  else quiz.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
 }finally{ window.obcMatchForce=false; }
};

var bloom=document.createElement('div');
bloom.id='lantern-bloom';
bloom.className='lantern-bloom';
bloom.hidden=true;
bloom.setAttribute('role','dialog');
bloom.setAttribute('aria-modal','true');
bloom.setAttribute('aria-labelledby','bloom-title');
bloom.setAttribute('aria-describedby','bloom-desc');
bloom.innerHTML='<div class="bloom-wash" aria-hidden="true"></div><div class="bloom-stage"><div class="bloom-lantern" aria-hidden="true">'
 +'<span class="lantern-glow a"></span><span class="lantern-glow b"></span>'
 +'<canvas class="mote-canvas" aria-hidden="true"></canvas>'
 +'<span class="bloom-moth a">'+mothSVG()+'</span>'
 +'<span class="bloom-moth b">'+mothSVG()+'</span>'
 +'<span class="bloom-moth c">'+mothSVG()+'</span>'
 +'<span class="bloom-moth d">'+mothSVG()+'</span>'
 +lanternSVG('lnB')+'</div>'
 +'<p class="bloom-title" id="bloom-title" tabindex="-1" aria-describedby="bloom-desc">The lantern opens</p>'
 +'<p class="sr" id="bloom-desc">The lantern is finding counselors who match your answers. Skip to see them now.</p>'
 +'<button type="button" class="btn ghost" id="bloom-skip">Skip</button></div>';
document.body.appendChild(bloom);
var skip=bloom.querySelector('#bloom-skip');
var bloomTitle=bloom.querySelector('#bloom-title');
var bloomLantern=bloom.querySelector('.bloom-lantern');
var story=document.getElementById('story');
var revealEnd=null;
function bloomNodes(){return [bloomTitle, skip];}
document.addEventListener('keydown', function(e){
 if(bloom.hidden||!revealEnd) return;
 if(e.key==='Escape'){e.preventDefault(); e.stopPropagation(); revealEnd(false); return;}
 if(e.key!=='Tab') return;
 var nodes=bloomNodes();
 var i=nodes.indexOf(document.activeElement);
 e.preventDefault();
 if(i<0){try{nodes[e.shiftKey?nodes.length-1:0].focus();}catch(err){} return;}
 var n=e.shiftKey?(i-1+nodes.length)%nodes.length:(i+1)%nodes.length;
 try{nodes[n].focus();}catch(err){}
}, true);

/* Motes: one capped loop, paused when the tab is hidden or calm is on. */
var layers=[];
var rafId=0, lastT=0, lanternOnScreen=true;
function litNow(){
 var n=parseFloat(head.style.getPropertyValue('--lit'));
 if(isNaN(n)) n=0;
 return Math.max(0, Math.min(1, n));
}
function addLayer(canvas, mode){
 if(!canvas || !canvas.getContext) return null;
 var ctx=canvas.getContext('2d');
 if(!ctx) return null;
 var layer={canvas:canvas, ctx:ctx, mode:mode, parts:[], w:0, h:0};
 layers.push(layer);
 return layer;
}
function sizeLayer(L){
 var r=L.canvas.getBoundingClientRect();
 var dpr=Math.min(2, window.devicePixelRatio||1);
 L.w=Math.max(0, r.width); L.h=Math.max(0, r.height);
 if(L.w<2||L.h<2) return false;
 var pw=Math.round(L.w*dpr), ph=Math.round(L.h*dpr);
 if(L.canvas.width!==pw||L.canvas.height!==ph){
  L.canvas.width=pw; L.canvas.height=ph;
  L.ctx.setTransform(dpr,0,0,dpr,0,0);
 }
 return true;
}
function clearLayer(L){ if(L.w&&L.h) L.ctx.clearRect(0,0,L.w,L.h); }
var riseLayer=addLayer(live.querySelector('canvas'), 'rise');
var burstLayer=addLayer(bloom.querySelector('canvas'), 'burst');
function spawnRise(L){
 L.parts.push({
  x:L.w*(0.42+Math.random()*0.16),
  y:L.h*0.64,
  vx:(Math.random()-0.5)*14,
  vy:-(16+Math.random()*26),
  life:0,
  max:1500+Math.random()*1100,
  r:0.9+Math.random()*1.35
 });
 if(L.parts.length>14) L.parts.splice(0, L.parts.length-14);
}
function burstEmbers(){
 if(!burstLayer || isCalm()) return;
 if(!sizeLayer(burstLayer)) return;
 var n=Math.min(32, 36-burstLayer.parts.length);
 var i;
 for(i=0;i<n;i++){
  burstLayer.parts.push({
   x:burstLayer.w*0.5+(Math.random()-0.5)*12,
   y:burstLayer.h*0.46,
   vx:(Math.random()-0.5)*34,
   vy:-(26+Math.random()*48),
   life:0,
   max:640+Math.random()*240,
   r:1.1+Math.random()*1.6
  });
 }
 if(burstLayer.parts.length>36) burstLayer.parts.splice(0, burstLayer.parts.length-36);
 kickMotes();
}
function moteNeeds(){
 if(document.hidden||isCalm()) return false;
 if(lanternOnScreen && riseLayer) return true;
 return !!(burstLayer && burstLayer.parts.length);
}
function frame(t){
 rafId=0;
 if(document.hidden||isCalm()){
  lastT=0;
  layers.forEach(function(L){L.parts.length=0; clearLayer(L);});
  return;
 }
 var dt=lastT?Math.min(34, t-lastT):16;
 lastT=t;
 if(riseLayer && lanternOnScreen && sizeLayer(riseLayer)){
  var want=Math.max(0, Math.min(14, Math.round(2+litNow()*12)));
  if(riseLayer.parts.length<want && Math.random()<0.5) spawnRise(riseLayer);
 }
 if(burstLayer) sizeLayer(burstLayer);
 layers.forEach(function(L){
  if(!L.w||!L.h) return;
  var s=dt/1000, next=[], i, p, a;
  for(i=0;i<L.parts.length;i++){
   p=L.parts[i];
   p.life+=dt;
   if(p.life>=p.max) continue;
   p.x+=p.vx*s;
   p.y+=p.vy*s;
   next.push(p);
  }
  L.parts=next;
  L.ctx.clearRect(0,0,L.w,L.h);
  for(i=0;i<L.parts.length;i++){
   p=L.parts[i];
   a=1-p.life/p.max;
   L.ctx.globalAlpha=a*a*0.9;
   L.ctx.fillStyle=a>0.75?'#fff6d8':'#f0d79a';
   L.ctx.beginPath();
   L.ctx.arc(p.x,p.y,p.r,0,6.2832);
   L.ctx.fill();
  }
  L.ctx.globalAlpha=1;
 });
 if(moteNeeds()) rafId=requestAnimationFrame(frame);
}
function kickMotes(){
 if(!rafId && moteNeeds()) rafId=requestAnimationFrame(frame);
}
if('IntersectionObserver' in window){
 new IntersectionObserver(function(es){
  lanternOnScreen=!!(es[0]&&es[0].isIntersecting);
  if(lanternOnScreen) kickMotes();
 },{threshold:0.08}).observe(head);
}
document.addEventListener('visibilitychange', function(){
 document.documentElement.classList.toggle('page-hidden', document.hidden);
 if(document.hidden){
  lastT=0;
  if(rafId){cancelAnimationFrame(rafId); rafId=0;}
  bloomAnims.forEach(function(a){try{a.pause();}catch(e){}});
 }else{
  bloomAnims.forEach(function(a){try{a.play();}catch(e){}});
  kickMotes();
 }
});
new MutationObserver(function(){
 if(!isCalm()){kickMotes(); return;}
 layers.forEach(function(L){L.parts.length=0; clearLayer(L);});
 if(rafId){cancelAnimationFrame(rafId); rafId=0;}
 if(!bloom.hidden && revealEnd) revealEnd(false);
}).observe(document.documentElement,{attributes:true, attributeFilter:['class']});
kickMotes();

function cancelBloomAnims(){
 bloomAnims.forEach(function(a){try{a.cancel();}catch(e){}});
 bloomAnims=[];
}
window.obcMatchReveal=function(paint, finish){
 if(isCalm()){paint(false); finish(); return;}
 var results=document.getElementById('results');
 var done=false;
 if(results) results.setAttribute('aria-busy','true');
 function lock(on){
  if(story && 'inert' in story) story.inert=on;
  var bar=document.querySelector('.mnav');
  if(bar && 'inert' in bar) bar.inert=on;
 }
 function end(animated){
  if(done) return;
  done=true;
  revealEnd=null;
  cancelBloomAnims();
  if(burstLayer){burstLayer.parts.length=0; clearLayer(burstLayer);}
  bloom.hidden=true;
  lock(false);
  if(results) results.setAttribute('aria-busy','false');
  try{paint(!!animated);}finally{finish();}
 }
 revealEnd=end;
 bloom.hidden=false;
 if(bloomLantern) bloomLantern.style.setProperty('--lit','1');
 lock(true);
 try{bloomTitle.focus();}catch(e){try{skip.focus();}catch(err){}}
 skip.onclick=function(){end(false);};
 burstEmbers();
 cancelBloomAnims();
 if(bloomLantern && bloomLantern.animate){
  bloomAnims.push(bloomLantern.animate([
   {transform:'scale(.62)', filter:'brightness(1.65) drop-shadow(0 0 0 rgba(240,215,154,0))'},
   {transform:'scale(1.045)', filter:'brightness(1.12) drop-shadow(0 0 26px rgba(240,215,154,.9))', offset:.58},
   {transform:'scale(1)', filter:'brightness(1) drop-shadow(0 0 16px rgba(240,215,154,.72))'}
  ], {duration:1800, easing:'cubic-bezier(.16,.7,.2,1)', fill:'forwards'}));
  bloomAnims[0].onfinish=function(){ if(revealEnd) revealEnd(true); };
 }else{
  bloomAnims.push({cancel:function(){}, pause:function(){}, play:function(){}, _t:setTimeout(function(){ if(revealEnd) revealEnd(true); }, 1800)});
  bloomAnims[0].cancel=function(){clearTimeout(bloomAnims[0]._t);};
 }
};
})();
