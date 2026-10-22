/* Storybook "quest" layer: original fantasy-RPG touches. All stats come from shared/data.js counts. */
(function(){
var D=window.OBC||{},RM=matchMedia('(prefers-reduced-motion: reduce)').matches,$=function(s){return document.querySelector(s)};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
/* 1) Clinician cards as party-member sheets */
var grid=$('#team-grid');
function sheets(){if(!grid)return;grid.querySelectorAll('article.card:not(.sheet)').forEach(function(a){var h=a.querySelector('h3');if(!h)return;
 var c=(D.clinicians||[]).find(function(x){return x.name===h.textContent});if(!c)return;a.classList.add('sheet');
 var top=document.createElement('p');top.className='sheet-tag';top.textContent='Party member · Character sheet';a.insertBefore(top,a.firstChild);
 var st=document.createElement('dl');st.className='sheet-stats';st.setAttribute('aria-label','Counts from this guide\u2019s listed information');
 var rows=[['Approaches listed',c.mods.length],['Concerns listed',c.concerns.length],['Offices',c.offices?c.offices.length:'Confirm'],['Session types',c.settings?c.settings.length:'Confirm']];
 st.innerHTML=rows.map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join('');
 var ap=[].slice.call(a.querySelectorAll('p')).filter(function(p){return /^Approaches:/.test(p.textContent)})[0];
 if(ap){ap.classList.add('sheet-approaches');ap.parentNode.insertBefore(st,ap)}else a.appendChild(st);});}
if(grid){sheets();new MutationObserver(sheets).observe(grid,{childList:true});}
/* 2) Quiz as a quest: d20 roll before results */
var quiz=$('#quiz'),res=$('#results');
if(quiz&&res){var intro=document.createElement('p');intro.className='quest-intro';intro.textContent='Your quest: answer a few questions, then roll the die to gather your party of guides.';quiz.parentNode.insertBefore(intro,quiz);
 var die='<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,4 92,28 92,72 50,96 8,72 8,28" class="d-out"/><polygon points="50,22 76,66 24,66" class="d-in"/><path d="M50 4 L50 22 M92 28 L76 66 M8 28 L24 66 M92 72 L76 66 M8 72 L24 66 M50 96 L50 66 M50 22 L92 28 M50 22 L8 28" class="d-edge"/><text x="50" y="54" text-anchor="middle">\u2726</text></svg>';
 quiz.addEventListener('submit',function(){if(RM)return;var r=document.createElement('div');r.className='d20-roll';r.setAttribute('role','status');r.innerHTML=die+'<span>Rolling for your guide\u2026</span>';
  res.classList.add('rolling');res.parentNode.insertBefore(r,res);try{window.obcSound&&!obcSound.muted()&&obcSound.chime(3)}catch(e){}
  setTimeout(function(){r.remove();res.classList.remove('rolling')},1300)});}
/* 3) Parchment quest map of the chapters, with both offices as landmarks */
var loc=$('#locations .page.left');
if(loc){var ch=[].slice.call(document.querySelectorAll('.chapter')).map(function(c){return {id:c.id,t:c.dataset.title}});
 var pts=[[40,250],[95,190],[60,120],[130,70],[200,110],[250,175],[320,140],[355,60]];
 var path='M'+pts.slice(0,ch.length).map(function(p){return p.join(' ')}).join(' L');
 var m=document.createElement('figure');m.className='quest-map';
 m.innerHTML='<figcaption>The quest map</figcaption><svg viewBox="0 0 400 290" role="img" aria-label="Parchment map of the chapters of this book, with the Bountiful and Draper offices marked">'
 +'<path class="qm-mtn" d="M150 285 l25-40 25 40 M185 285 l30-52 30 52 M300 285 l22-34 22 34"/>'
 +'<path class="qm-road" d="'+path+'"/>'
 +ch.map(function(c,i){var p=pts[i];if(!p)return'';return '<a href="#'+c.id+'"><circle class="qm-pt" cx="'+p[0]+'" cy="'+p[1]+'" r="7"/><text x="'+p[0]+'" y="'+(p[1]-12)+'" text-anchor="middle">'+esc(c.t)+'</text></a>'}).join('')
 +'<a href="https://maps.google.com/?q=420+W+1500+S+Suite+100+Bountiful+UT+84010" target="_blank" rel="noopener"><path class="qm-tower" d="M268 30 h14 v-14 h-3 v4 h-3 v-4 h-2 v4 h-3 v-4 h-3z"/><text class="qm-land" x="275" y="45" text-anchor="middle">Bountiful</text></a>'
 +'<a href="https://maps.google.com/?q=12401+S+450+E+Suite+F2+Draper+UT+84020" target="_blank" rel="noopener"><path class="qm-tower" d="M108 268 h14 v-14 h-3 v4 h-3 v-4 h-2 v4 h-3 v-4 h-3z"/><text class="qm-land" x="115" y="283" text-anchor="middle">Draper</text></a>'
 +'<text class="qm-n" x="385" y="282" text-anchor="end">N \u2191</text></svg>';
 var dc=loc.querySelector('.dropcap');(dc||loc.lastChild).after(m);}
/* 4) Coping skills as spell scrolls */
document.querySelectorAll('#coping .skill').forEach(function(s){s.classList.add('scroll')});
new MutationObserver(function(){document.querySelectorAll('#coping .skill:not(.scroll)').forEach(function(s){s.classList.add('scroll')})}).observe($('#coping')||document.createElement('i'),{childList:true});
/* 5) Torches */
var b=$('#book');if(b&&!RM){['l','r'].forEach(function(s){var t=document.createElement('span');t.className='torch torch-'+s;t.setAttribute('aria-hidden','true');t.innerHTML='<i></i>';b.appendChild(t)})}
})();
