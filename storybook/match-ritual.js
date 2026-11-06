/* Chapter I ritual: one question at a time, then the lantern reveal.
   Scoring stays in quiet-shared.js. This file only walks the form and plays the ending. */
(function(){
'use strict';
var quiz=document.getElementById('quiz');
if(!quiz) return;
var fs=Array.prototype.slice.call(quiz.querySelectorAll('fieldset'));
if(!fs.length) return;
var sub=quiz.querySelector('button[type="submit"]');
var qi=0, booted=false;

function isCalm(){
 return document.documentElement.classList.contains('calm') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function legendText(f){
 var leg=f.querySelector('legend');
 return (leg?leg.textContent:'Question').replace(/\s+/g,' ').trim();
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

function lanternSVG(){
 return '<svg class="lantern-svg" viewBox="0 0 64 88" aria-hidden="true" focusable="false">'
  +'<path fill="#9A4A2E" d="M30 2h4v11h-4z"/>'
  +'<path fill="#16323A" d="M22 13h20l3 6H19z"/>'
  +'<path fill="#F7F4EE" stroke="#16323A" stroke-width="1.6" d="M16 22h32l6 9v22l-6 11H16l-6-11V31z"/>'
  +'<path fill="#1F6F6B" opacity=".55" d="M20 34h24M19 44h26M20 54h24"/>'
  +'<path fill="#16323A" d="M18 64h28l4 8H14z"/>'
  +'<path class="flame" fill="#c89b3c" d="M32 58c6-7 4-16 0-22-5 7-7 14 0 22z"/>'
  +'<path fill="#f0d79a" d="M32 52c2-2 1.2-5 0-7-1.5 2-2.2 4.2 0 7z"/>'
  +'</svg>';
}

var head=document.createElement('div');
head.className='lantern-head';
head.style.setProperty('--lit','0');
var live=document.createElement('div');
live.className='lantern-live';
live.setAttribute('aria-hidden','true');
live.innerHTML='<span class="lantern-glow"></span>'
 +['m1','m2','m3','m4','m5'].map(function(c){return '<span class="moth '+c+'" aria-hidden="true"><svg viewBox="0 0 20 12" focusable="false"><path fill="currentColor" d="M10 6C12 2 18 1 19 4c-3 1-6 2-9 2zm0 0C8 2 2 1 1 4c3 1 6 2 9 2z"/></svg></span>';}).join('')
 +lanternSVG();
var path=document.createElement('ol');
path.className='step-path';
path.setAttribute('role','list');
path.setAttribute('aria-label','Seven steps');
fs.forEach(function(f,i){
 var li=document.createElement('li');
 var b=document.createElement('button');
 b.type='button';
 b.innerHTML='<span class="pip">'+(i+1)+'</span>';
 b.setAttribute('aria-label','Step '+(i+1)+' of '+fs.length+': '+legendText(f));
 b.addEventListener('click',function(){go(i, i>qi?1:-1);});
 li.appendChild(b);
 path.appendChild(li);
});
head.appendChild(live);
head.appendChild(path);
quiz.insertBefore(head, quiz.firstChild);

var nav=document.createElement('div');
nav.className='quiz-nav';
var back=document.createElement('button');
back.type='button'; back.className='btn ghost sm'; back.id='q-back'; back.textContent='Back';
var count=document.createElement('p');
count.className='quiz-count'; count.id='q-cnt'; count.setAttribute('aria-live','polite');
var next=document.createElement('button');
next.type='button'; next.className='btn sm'; next.id='q-next'; next.textContent='Next';
nav.appendChild(back); nav.appendChild(count); nav.appendChild(next);
if(sub){sub.before(nav); nav.appendChild(sub);} else quiz.appendChild(nav);
back.addEventListener('click',function(){go(qi-1,-1);});
next.addEventListener('click',function(){go(qi+1,1);});

function show(dir){
 fs.forEach(function(f,j){
  var on=j===qi;
  f.hidden=!on;
  f.classList.toggle('is-step', on);
  f.classList.remove('from-next','from-back');
  if(on && dir) f.classList.add(dir>0?'from-next':'from-back');
 });
 var last=fs.length-1;
 var lit=last===0?1:qi/last;
 head.style.setProperty('--lit', String(lit));
 path.style.setProperty('--lit', String(lit));
 live.querySelectorAll('.moth').forEach(function(m,i){m.classList.toggle('on', i<qi);});
 Array.prototype.forEach.call(path.children, function(li,i){
  li.classList.toggle('is-done', i<qi);
  var b=li.querySelector('button');
  if(i===qi) b.setAttribute('aria-current','step');
  else b.removeAttribute('aria-current');
 });
 if(count) count.textContent='Step '+(qi+1)+' of '+fs.length;
 back.disabled=qi===0;
 next.hidden=qi===last;
 if(sub) sub.hidden=qi!==last;
 if(booted){
  var leg=fs[qi].querySelector('legend');
  if(leg){leg.setAttribute('tabindex','-1'); try{leg.focus({preventScroll:true});}catch(e){leg.focus();}}
 }
}
function go(n, dir){
 n=Math.max(0, Math.min(fs.length-1, n));
 if(n===qi) return;
 qi=n; show(dir|| (n>qi?1:-1));
}
quiz.classList.add('wizard');
decorate();
show(0);
booted=true;

quiz.addEventListener('submit', function(e){
 if(qi<fs.length-1){e.preventDefault(); e.stopImmediatePropagation(); go(qi+1,1);}
}, true);
quiz.addEventListener('keydown', function(e){
 if(e.key!=='Enter') return;
 if(e.target && e.target.closest && e.target.closest('button')) return;
 if(qi<fs.length-1){e.preventDefault(); go(qi+1,1);}
});

var bloom=document.createElement('div');
bloom.id='lantern-bloom';
bloom.className='lantern-bloom';
bloom.hidden=true;
bloom.setAttribute('role','dialog');
bloom.setAttribute('aria-modal','true');
bloom.setAttribute('aria-labelledby','bloom-title');
bloom.innerHTML='<div class="bloom-wash" aria-hidden="true"></div><div class="bloom-stage"><div class="bloom-lantern" aria-hidden="true">'
 +'<span class="bloom-moth a"><svg viewBox="0 0 20 12"><path fill="currentColor" d="M10 6C12 2 18 1 19 4c-3 1-6 2-9 2zm0 0C8 2 2 1 1 4c3 1 6 2 9 2z"/></svg></span>'
 +'<span class="bloom-moth b"><svg viewBox="0 0 20 12"><path fill="currentColor" d="M10 6C12 2 18 1 19 4c-3 1-6 2-9 2zm0 0C8 2 2 1 1 4c3 1 6 2 9 2z"/></svg></span>'
 +'<span class="bloom-moth c"><svg viewBox="0 0 20 12"><path fill="currentColor" d="M10 6C12 2 18 1 19 4c-3 1-6 2-9 2zm0 0C8 2 2 1 1 4c3 1 6 2 9 2z"/></svg></span>'
 +lanternSVG()+'</div><p class="bloom-title" id="bloom-title">The lantern opens</p><button type="button" class="btn ghost" id="bloom-skip">Skip</button></div>';
document.body.appendChild(bloom);
var skip=bloom.querySelector('#bloom-skip');
var story=document.getElementById('story');
var revealEnd=null;
document.addEventListener('keydown', function(e){
 if(bloom.hidden||!revealEnd) return;
 if(e.key==='Escape'){e.preventDefault(); e.stopPropagation(); revealEnd(false);}
 else if(e.key==='Tab'){e.preventDefault(); try{skip.focus();}catch(err){}}
}, true);
new MutationObserver(function(){
 if(!bloom.hidden && revealEnd && isCalm()) revealEnd(false);
}).observe(document.documentElement,{attributes:true, attributeFilter:['class']});

window.obcMatchReveal=function(paint, finish){
 if(isCalm()){paint(false); finish(); return;}
 var results=document.getElementById('results');
 var done=false, timer=0;
 if(results) results.setAttribute('aria-busy','true');
 function lock(on){if(story && 'inert' in story) story.inert=on;}
 function end(animated){
  if(done) return;
  done=true;
  revealEnd=null;
  clearTimeout(timer);
  bloom.hidden=true;
  lock(false);
  if(results) results.setAttribute('aria-busy','false');
  try{paint(!!animated);}finally{finish();}
 }
 revealEnd=end;
 bloom.hidden=false;
 lock(true);
 try{skip.focus();}catch(e){}
 skip.onclick=function(){end(false);};
 timer=setTimeout(function(){end(true);}, 2200);
};
})();
