(function(){
'use strict';
var H=document.documentElement,V=H.getAttribute('data-variant');
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var desk=matchMedia('(min-width: 900px)'),rm=matchMedia('(prefers-reduced-motion: reduce)');
var chaps=$$('.chap'),N=chaps.length,ids=chaps.map(function(c){return c.id});
var book=$('#book'),pl=$('#pl'),pr=$('#pr'),leaf=$('#leaf'),lf=$('.front',leaf),lb=$('.back',leaf),cast=$('#cast'),cover=$('#cover');
var cur=0,busy=false,opened=H.classList.contains('opened');
var calmBtns=$$('.calm-btn');
function isCalm(){return H.classList.contains('calm')}
function cueHearth(kind){if(window.obcHearth)window.obcHearth.cue(kind)}
window.__vtRuns=0;function canVT(){return !!document.startViewTransition&&!isCalm()&&!rm.matches}
var vtCur=null;
function vt(dir,fn,done){H.setAttribute('data-vt',dir);window.__vtRuns++;var t;try{t=document.startViewTransition(fn)}catch(e){H.removeAttribute('data-vt');fn();if(done)done();return}
 vtCur=t;var end=function(){if(vtCur===t){vtCur=null;H.removeAttribute('data-vt')}if(done)done()};t.finished.then(end,end)}
/* a tap that lands while a page is still turning: finish the turn at once, then hand the tap to what is under it */
document.addEventListener('click',function(e){if(!vtCur||e.target!==H)return;var t=vtCur,x=e.clientX,y=e.clientY;e.stopPropagation();t.skipTransition();
 t.finished.then(null,function(){}).then(function(){var el=document.elementFromPoint(x,y),c=el&&el.closest('button,a');if(c)c.click()})},true);
function setCalm(v,save){H.classList.toggle('calm',v);calmBtns.forEach(function(b){b.setAttribute('aria-pressed',String(v));b.textContent='Calm mode: '+(v?'on':'off')});if(save){try{localStorage.setItem('obcSbCalm',v?'1':'0')}catch(e){}}if(v)$$('[data-r]').forEach(function(el){el.classList.add('in')})}
setCalm(isCalm(),false);
calmBtns.forEach(function(b){b.addEventListener('click',function(){setCalm(!isCalm(),true)})});
if(rm.addEventListener)rm.addEventListener('change',function(e){setCalm(e.matches,false)});

var aw=$('#afterword');
function src(i){return i===N?aw:chaps[i]}
function L(i){return $('.pg-l',src(i)).innerHTML}
function R(i){return $('.pg-r',src(i)).innerHTML}
function fresh(el){el.classList.remove('fresh');void el.offsetWidth;el.classList.add('fresh')}

/* reveals */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0,rootMargin:'0px 0px -8% 0px'}):null;
function arm(root){$$('[data-r]',root).forEach(function(el){el.classList.remove('in');if(io&&!isCalm())io.observe(el);else el.classList.add('in')})}
function armOpeners(){$$('.opener').forEach(function(el){if(io&&!isCalm())io.observe(el);else el.classList.add('in')})}

function updateUI(){
 var status=$('#chapter-status'),label;
 if(cur===N){label='Afterword';$('#pgno').textContent='Afterword \u00b7 a hidden page'}
 else{var c=chaps[cur];label=c.getAttribute('data-label')+' \u00b7 '+c.getAttribute('data-short');$('#pgno').textContent=c.getAttribute('data-label')+' \u00b7 '+(cur+1)+' of '+N}
 if(status&&status.textContent!==label)status.textContent=label;
 $('#prev').disabled=cur===0;$('#next').disabled=cur>=N-1;
 $$('.ribbon').forEach(function(r,k){r.setAttribute('aria-current',k===cur?'true':'false')});
 H.setAttribute('data-scene',cur===N?'afterword':ids[cur]);
}
/* hide hotspots that the crop of a painting leaves out of view, so focus never lands on something unseen */
function fitHots(root){
 $$('.hot',root).forEach(function(h){var sc=h.closest('.scene');if(!sc)return;h.classList.remove('off');var a=sc.getBoundingClientRect(),b=h.getBoundingClientRect();
  if(!a.width){return}var ok=b.left>a.left+8&&b.left<a.right-8&&b.top>a.top+8&&b.top<a.bottom-8;if(ok&&b.top>0&&b.top<innerHeight&&b.left>0&&b.left<innerWidth){var t=document.elementFromPoint(b.left,b.top);ok=!t||h.contains(t)}h.classList.toggle('off',!ok);var bt=$('.hot-btn',h);if(bt)bt.tabIndex=ok?0:-1});
}
function showBody(i,anim){
 i=Math.min(i,N-1);
 var go=function(){chaps.forEach(function(c,k){c.classList.toggle('active',k===i);c.classList.toggle('swap',k===i&&!!anim)});arm(chaps[i])};
 go();
}
function paint(i){pl.innerHTML=L(i);pr.innerHTML=R(i);fitHots(pl);fitHots(pr)}
var hashWait=null;
function chapterFromLocation(){
 var raw=(location.hash||'').replace(/^#/,'').split('&')[0].replace(/-body$/,'');
 if(!raw)return 0;
 return ids.indexOf(raw);
}
function writeHash(to,fromHist){
 var id=ids[to];if(!id)return;
 var next='#'+id;
 if((location.hash||'')===next)return;
 try{if(fromHist)history.replaceState({obc:id},'',next);else history.pushState({obc:id},'',next)}catch(e){}
}
function followLocation(){
 var i=chapterFromLocation();
 if(i<0||i===cur)return;
 if(busy){hashWait=i;return}
 turnTo(i,{fromHist:true});
}
function followWaiting(){
 if(hashWait==null)return;
 var n=hashWait;hashWait=null;
 if(n!==cur)turnTo(n,{fromHist:true});
}

function turnTo(to,opts){
 opts=opts||{};
 if(typeof to==='string')to=ids.indexOf(to);
 if(to<0||to>N||(to===N&&!opts.secret))return;
 if(!desk.matches){if(to===N){if(!opened)openBook(true);return}if(!opened){cur=to;openBook(true);return}if(to===cur||busy)return;var mf=to>cur;cur=to;cueHearth('turn');writeHash(to,!!opts.fromHist);
  var mswap=function(focus){chaps.forEach(function(c,k){c.classList.toggle('active',k===to);c.classList.remove('mt-f','mt-b')});arm(chaps[to]);var shown=chaps[to]&&chaps[to].querySelector('.opener');if(shown){shown.classList.add('in','shown');shown.querySelectorAll('img').forEach(function(img){img.loading='eager'})}
  if(focus===false)return;updateUI();window.scrollTo(0,0);refit();var hd=$('.ctitle',chaps[to])||chaps[to];if(!hd.hasAttribute('tabindex'))hd.setAttribute('tabindex','-1');hd.focus({preventScroll:true})};
  if(isCalm()||rm.matches){mswap();return}
  busy=true;var story=$('#story');if(story)story.classList.add('flat-turn');mswap(false);var chap=chaps[to];if(chap){void chap.offsetWidth;chap.classList.add(mf?'mt-f':'mt-b')}
  setTimeout(function(){if(chap)chap.classList.remove('mt-f','mt-b');if(story)story.classList.remove('flat-turn');busy=false;mswap();followWaiting()},1000);return}
 if(!opened){cur=to;openBook(false);return}
 if(busy||to===cur)return;
 var from=cur;cur=to;updateUI();
 writeHash(to,!!opts.fromHist);
 if(isCalm()||rm.matches){
  paint(to);[pl,pr].forEach(function(p){p.classList.remove('fade');void p.offsetWidth;p.classList.add('fade')});
  showBody(to,false);cueHearth('turn');return;
 }
 busy=true;var fwd=to>from;cueHearth('turn');
 pr.classList.remove('fresh');pl.classList.remove('warm');
 lf.innerHTML=fwd?R(from):R(to);lb.innerHTML=fwd?L(to):L(from);
 var nick=document.createElement('i');nick.className='nick';nick.setAttribute('aria-hidden','true');(fwd?lf:lb).appendChild(nick);
 [lf,lb].forEach(function(face){face.querySelectorAll('img').forEach(function(img){img.loading='eager'})});
 leaf.className='leaf on '+(fwd?'fwd':'bwd');cast.className='cast '+(fwd?'fwd':'bwd');
 book.classList.add('turning');
 void leaf.offsetWidth;
 if(fwd){pr.innerHTML=R(to)}else{pl.innerHTML=L(to)}
 requestAnimationFrame(function(){leaf.classList.add('go');cast.classList.add('go')});
 setTimeout(function(){var side=fwd?pl:pr;side.innerHTML=fwd?L(to):R(to);side.classList.remove('warm','fresh');side.querySelectorAll('img').forEach(function(img){img.loading='eager'});showBody(to,false)},650);
 setTimeout(function(){leaf.className='leaf';cast.className='cast';book.classList.remove('turning');lf.innerHTML='';lb.innerHTML='';busy=false;fitHots(pl);fitHots(pr);followWaiting()},1000);
}

function pageCurl(fwd){if(desk.matches||isCalm()||rm.matches)return;var c=$('#page-curl');if(!c)return;c.classList.remove('on','f','b');void c.offsetWidth;c.classList.add('on',fwd?'f':'b');clearTimeout(pageCurl._t);pageCurl._t=setTimeout(function(){c.classList.remove('on','f','b')},520)}
function openBook(instant){
 if(opened)return;opened=true;
 try{sessionStorage.setItem('obcSbOpen','1')}catch(e){}
 paint(cur);fresh(pr);warm(pl);showBody(cur,false);updateUI();armOpeners();if(!desk.matches)chaps.forEach(arm);
 if(instant||isCalm()){H.classList.remove('closed');H.classList.add('opened');afterOpen(instant);return}
 H.classList.add('opening');H.classList.remove('closed');cueHearth('open');
 setTimeout(function(){cover.classList.add('gone')},1150);
 setTimeout(function(){H.classList.remove('opening');H.classList.add('opened');afterOpen(false)},1650);
}
function refit(){if(desk.matches){fitHots(pl);fitHots(pr);return}fitHots($('#story'));clearTimeout(refit._t);refit._t=setTimeout(function(){if(!desk.matches)fitHots($('#story'))},1450)}
function afterOpen(instant){
 setTimeout(function(){fitHots(pl);fitHots(pr);if(!desk.matches)refit()},80);
 if(!desk.matches){window.scrollTo(0,0);var s=$('#story');if(s&&s.focus)s.focus({preventScroll:true})}
 else{var nb=$('#next');if(nb&&!instant)nb.focus({preventScroll:true})}
}

/* ink-in: wrap each word of a chapter title in a span (text stays in the DOM, read normally) */
function inkWords(el){if(!el||el.getAttribute('data-ink'))return;el.setAttribute('data-ink','1');var k=0;
 (function walk(n){Array.prototype.slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var parts=c.nodeValue.split(/(\s+)/),f=document.createDocumentFragment();parts.forEach(function(p){if(!p)return;if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(p))}else{var sp=document.createElement('span');sp.className='w';sp.style.setProperty('--w',k++);sp.textContent=p;f.appendChild(sp)}});n.replaceChild(f,c)}
  else if(c.nodeType===1&&c.tagName!=='SVG'&&!(c.classList&&c.classList.contains('sr')))walk(c)})})(el);
 el.style.setProperty('--n',k)}
$$('.opener .ctitle').forEach(inkWords);$$('.rw-new').forEach(inkWords);
/* professional-to-fantasy plate: a crisp label layer that fades as the painting warms in */
$$('.opener .scene').forEach(function(sc){var ch=sc.closest('.chap'),i=document.createElement('i'),t=document.createElement('span');i.className='blend';i.setAttribute('aria-hidden','true');t.className='blend-tag';
 if(ch){var a=ch.getAttribute('data-label'),b=ch.getAttribute('data-short');t.textContent=a===b?a:a+' \u00b7 '+b}i.appendChild(t);var g=document.createElement('i');g.className='blend-g';g.setAttribute('aria-hidden','true');sc.appendChild(g);sc.appendChild(i)});
function warm(p){p.classList.remove('warm');void p.offsetWidth;p.classList.add('warm')}
if(aw)$$('.ctitle',aw).forEach(inkWords);
var ghosts=$$('.gleaf');
/* rewrite band: tap to (re)write a line; the band writes itself once when it scrolls into view */
function rwPlay(el){if(window.obcInk&&!el.classList.contains('rw-line')){window.obcInk.play(el);return}el.classList.remove('done');void el.offsetWidth;el.classList.add('done')}
$$('.rw').forEach(function(b){b.addEventListener('click',function(){rwPlay(b)})});
var band=$('.rewrite');
if(band){var rws=$$('.rw',band);if(!('IntersectionObserver' in window)){rws.forEach(function(b){rwPlay(b)})}else{var bio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;bio.disconnect();rws.forEach(function(b,k){setTimeout(function(){rwPlay(b)},isCalm()?0:500+k*900)})})},{threshold:.35});bio.observe(band)}}
/* the small rewrite line on the Prologue page cycles through the same pairs, only while that page is showing */
var PAIRS=$$('.rw').map(function(b){var o=b.querySelector('.rw-old').cloneNode(true),n=b.querySelector('.rw-new').cloneNode(true);$$('.sr',o).concat($$('.sr',n)).forEach(function(x){x.remove()});return[o.textContent.trim(),n.innerHTML]}),rwK=0;
function rwLine(){var l=$('.rw-line',pr);if(!l||!PAIRS.length)return null;return l}
function rwShow(k,anim){var l=rwLine();if(!l)return;var p=PAIRS[k%PAIRS.length];$('.rw-old',l).textContent=p[0];var nw=$('.rw-new',l);nw.innerHTML=p[1];nw.style.setProperty('--n',$$('.w',nw).length);l.classList.remove('out');if(anim)rwPlay(l);else l.classList.add('done')}
setInterval(function(){if(isCalm()||document.hidden||!desk.matches||!opened||busy||cur!==0)return;var l=rwLine();if(!l)return;if(!l.classList.contains('done')){rwShow(rwK,true);return}
 l.classList.add('out');setTimeout(function(){rwK=(rwK+1)%PAIRS.length;rwShow(rwK,true)},520)},4800);
setTimeout(function(){if(cur===0)rwShow(0,!isCalm())},1500);
/* your story so far: last chapter + chapters read, kept in localStorage on this device only */
function lsGet(k,d){try{var v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var seen=lsGet('obcSbSeen',[]);if(!Array.isArray(seen))seen=[];
function chapName(id){var c=chaps[ids.indexOf(id)];if(!c)return'';var a=c.getAttribute('data-label'),l=c.getAttribute('aria-label')||'',t=l.indexOf(':')>=0?l.slice(l.indexOf(':')+1).trim():c.getAttribute('data-short');return a+' \u00b7 '+t}
function remember(i){if(i<0||i>=N)return;var id=ids[i];lsSet('obcSbLast',id);if(seen.indexOf(id)<0){seen.push(id);lsSet('obcSbSeen',seen)}drawProgress()}
function drawProgress(){var p=$('.toc-prog');if(!p)return;var n=seen.filter(function(id){return ids.indexOf(id)>=0}).length;p.hidden=n<2;
 $('.prog-t',p).textContent=n+' of '+N+' chapters read';$('.prog-bar',p).style.setProperty('--p',n/N);
 $$('.toc a[href^="#"]').forEach(function(a){var id=a.getAttribute('href').slice(1),k=ids.indexOf(id);if(k<0)return;var r=seen.indexOf(id)>=0;a.classList.toggle('seen',r);a.setAttribute('aria-current',(opened&&k===cur)?'true':'false');var sr=$('.sr',a);if(r&&!sr){a.insertAdjacentHTML('beforeend','<span class="sr"> (read)</span>')}else if(!r&&sr){sr.remove()}})
 /* fix13: the end of the book offers the next unread chapter (from obcSbSeen only) */
 var nu=null;for(var q=0;q<N;q++){if(ids[q]!=='careers'&&seen.indexOf(ids[q])<0){nu=ids[q];break}}
 $$('.next-unread').forEach(function(x){x.hidden=!nu||n<2;var l=$('a',x);if(nu){l.setAttribute('href','#'+nu);$('.nu-where',x).textContent=chapName(nu)}})}
function forget(){seen=[];try{localStorage.removeItem('obcSbLast');localStorage.removeItem('obcSbSeen')}catch(e){}try{sessionStorage.removeItem('obcSbOpen')}catch(e){}var r=$('.resume');if(r)r.hidden=true;drawProgress()}
(function(){var last=lsGet('obcSbLast',null),r=$('.resume');if(!r)return;
 if(last&&last!=='home'&&ids.indexOf(last)>0&&!opened){$('.resume-where',r).textContent=chapName(last);r.hidden=false}
 $('.resume-btn',r).addEventListener('click',function(){r.hidden=true;turnTo(last)});
 $('.resume-x',r).addEventListener('click',function(){forget();var o=$('#open');if(o)o.focus()})})();
var fg=$('.forget');if(fg)fg.addEventListener('click',function(){forget();var t=$('.prog-t');var a=$('a',toc);if(a)a.focus()});
var _upd=updateUI;updateUI=function(){_upd();if(opened)remember(cur);else drawProgress();if(mnP){mnP.disabled=cur===0;mnN.disabled=cur>=N-1;mnNo.textContent=$('#pgno').textContent}};
if('IntersectionObserver' in window){var rio=new IntersectionObserver(function(es){return;es.forEach(function(e){if(e.isIntersecting)remember(chaps.indexOf(e.target))})},{rootMargin:'-45% 0px -50% 0px'});chaps.forEach(function(c){rio.observe(c)})}
/* paintings react to a tap with a few motes (not on hotspots; calm off) */
document.addEventListener('pointerdown',function(e){if(isCalm())return;var sc=e.target.closest&&e.target.closest('.scene');if(!sc||e.target.closest('button,a,.hot-note'))return;
 var b=sc.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;for(var k=0;k<7;k++){var m=document.createElement('i'),a=Math.random()*6.283,d=24+Math.random()*46;m.className='tapmote';m.setAttribute('aria-hidden','true');
  m.style.left=x+'px';m.style.top=y+'px';m.style.setProperty('--dx',(Math.cos(a)*d).toFixed(1)+'px');m.style.setProperty('--dy',(Math.sin(a)*d-18).toFixed(1)+'px');m.style.animationDelay=(k*25)+'ms';
  m.addEventListener('animationend',function(){this.remove()});sc.appendChild(m)}},{passive:true});
/* fix5: rewrite your own line. Text lives only in these inputs and this card: no storage, no network */
(function(){var o=$('#rw-in-old'),n=$('#rw-in-new'),card=$('.rw-own-card'),msg=$('.rw-own-msg');if(!o||!n||!card)return;
 function build(a,b){while(card.firstChild)card.removeChild(card.firstChild);var s=document.createElement('s');s.className='rw-old';var s1=document.createElement('span');s1.className='sr';s1.textContent='Old line: ';s.appendChild(s1);s.appendChild(document.createTextNode(a));
  var w=document.createElement('span');w.className='rw-new';var s2=document.createElement('span');s2.className='sr';s2.textContent='Rewritten: ';w.appendChild(s2);w.appendChild(document.createTextNode(b));card.appendChild(s);card.appendChild(w);inkWords(w)}
 function go(){var a=o.value.trim(),b=n.value.trim();msg.textContent='';if(!a){msg.textContent='Write an old line first.';o.focus();return}if(!b){msg.textContent='Now write a new line.';n.focus();return}
  build(a,b);card.hidden=false;card.classList.remove('done');if(window.obcInk){window.obcInk.play(card)}else if(isCalm()||rm.matches){card.classList.add('done')}else{void card.offsetWidth;requestAnimationFrame(function(){card.classList.add('done')})}}
 $('.rw-go').addEventListener('click',go);
 [o,n].forEach(function(el){el.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();if(el===o&&!n.value.trim())n.focus();else go()}})});
 $('.rw-erase').addEventListener('click',function(){o.value='';n.value='';msg.textContent='';while(card.firstChild)card.removeChild(card.firstChild);card.hidden=true;card.classList.remove('done');o.focus()});
 window.addEventListener('pagehide',function(){o.value='';n.value='';while(card.firstChild)card.removeChild(card.firstChild)})})();
/* phones and tablets: a page-turn bar and swipe */
var mnav=document.createElement('div'),mnP,mnN,mnNo;mnav.className='mnav';mnav.setAttribute('role','group');mnav.setAttribute('aria-label',$('#pgno').getAttribute('aria-label')||'Pages');
mnP=document.createElement('button');mnP.type='button';mnP.className='tbtn';mnP.innerHTML=$('#prev').innerHTML;
mnN=document.createElement('button');mnN.type='button';mnN.className='tbtn';mnN.innerHTML=$('#next').innerHTML;
var mid=document.createElement('div');mid.className='mn-mid';mnNo=document.createElement('span');mnNo.className='mn-no';mnNo.setAttribute('aria-hidden','true');
var mnT=document.createElement('button');mnT.type='button';mnT.className='toc-btn mn-toc';mnT.textContent=$('.toc-btn').textContent.trim();mnT.setAttribute('aria-haspopup','true');
mid.appendChild(mnNo);mid.appendChild(mnT);mnav.appendChild(mnP);mnav.appendChild(mid);mnav.appendChild(mnN);document.body.appendChild(mnav);
mnP.addEventListener('click',function(){turnTo(cur-1)});mnN.addEventListener('click',function(){turnTo(cur+1)});
mnT.addEventListener('click',function(e){e.stopPropagation();window.scrollTo(0,0);$('.toc-btn').click()});
(function(){var st=$('#story'),tx=null,ty=0;if(!st)return;
 st.addEventListener('touchstart',function(e){if(desk.matches||!opened||e.touches.length!==1||e.target.closest('input,textarea,select,.hot-note')){tx=null;return}tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
 st.addEventListener('touchend',function(e){if(tx===null)return;var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;tx=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)turnTo(dx<0?cur+1:cur-1)},{passive:true});
 st.addEventListener('touchcancel',function(){tx=null},{passive:true})})();
/* boot */
var hashIdx=ids.indexOf((location.hash||'').replace('#','').replace('-body',''));
if(hashIdx>=0)cur=hashIdx;
 /* fix14: same-tab reload (book already open this session, no #chapter in the URL) reopens at the last chapter read */
 else if(opened){try{var lastI=ids.indexOf(JSON.parse(localStorage.getItem('obcSbLast')));if(lastI>0)cur=lastI}catch(e){}}
H.setAttribute('data-scene',ids[cur]);
if(opened){opened=false;H.classList.remove('opened');H.classList.add('closed');openBook(true)}
else{updateUI()}

$('#open').addEventListener('click',function(){openBook(false)});
$('#skip').addEventListener('click',function(){openBook(true)});
cover.addEventListener('click',function(){if(!opened)openBook(false)});
$('#prev').addEventListener('click',function(){turnTo(cur-1)});
$('#next').addEventListener('click',function(){turnTo(cur+1)});

/* any in-page link to a chapter turns the page */
document.addEventListener('click',function(ev){
 var a=ev.target.closest&&ev.target.closest('a[href^="#"]');if(!a)return;
 var id=a.getAttribute('href').slice(1);
 if(id==='steffani-profile'){ev.preventDefault();closeToc();turnTo('potions');setTimeout(function(){var el=document.getElementById('steffani-profile');if(el)el.scrollIntoView({behavior:isCalm()?'auto':'smooth',block:'start'});},900);return}
 if(ids.indexOf(id)>=0){ev.preventDefault();closeToc();turnTo(id);if(desk.matches&&a.closest('.story'))window.scrollTo({top:0,behavior:isCalm()?'auto':'smooth'});return}
 if(/-body$/.test(id)){var el=document.getElementById(id);if(el){ev.preventDefault();el.scrollIntoView({behavior:isCalm()?'auto':'smooth'})}}
 if(id==='story'&&!opened){openBook(true)}
});

/* keyboard. Arrows turn the page only from the pager, not from header, links, or bios. */
function pageNavFocused(t){return !!(t&&t.closest&&t.closest('#prev,#next,.mnav .tbtn'));}
document.addEventListener('keydown',function(ev){
 if(ev.altKey||ev.ctrlKey||ev.metaKey)return;
 var t=ev.target;if(t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||(t.closest&&t.closest('#quiz,#lantern-bloom'))))return;
 if(ev.key==='Escape')closeToc();
 if(ev.key!=='ArrowRight'&&ev.key!=='ArrowLeft')return;
 if(!pageNavFocused(t))return;
 if(!desk.matches&&!opened)return;
 if(!opened&&ev.key==='ArrowRight'){openBook(false);return}
 ev.preventDefault();
 if(ev.key==='ArrowRight'){if(cur===N-1&&opened&&!busy&&window.__eggPast){window.__eggPast();return}turnTo(cur+1)}
 if(ev.key==='ArrowLeft')turnTo(cur-1);
});
window.addEventListener('hashchange',followLocation);
window.addEventListener('popstate',followLocation);

/* swipe on the book */
var sx=null,sy=0;
book.addEventListener('pointerdown',function(e){if(e.target.closest('a,button'))return;sx=e.clientX;sy=e.clientY});
book.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){if(!opened){openBook(false);return}turnTo(dx<0?cur+1:cur-1)}});
book.addEventListener('pointercancel',function(){sx=null});

/* contents menu */
var tb=$('.toc-btn'),toc=$('#toc');
function closeToc(){toc.hidden=true;tb.setAttribute('aria-expanded','false')}
tb.addEventListener('click',function(){var o=toc.hidden;toc.hidden=!o;tb.setAttribute('aria-expanded',String(o));if(o){var f=$('a',toc);if(f)f.focus()}});
document.addEventListener('click',function(e){if(!toc.hidden&&!e.target.closest('.toc-wrap'))closeToc()});

/* unfurls: closed panels stay out of the accessibility tree and tab order */
function setUnfurl(panel,open){
 panel.classList.toggle('open',!!open);
 if(open){panel.setAttribute('aria-hidden','false');panel.inert=false;}
 else{panel.setAttribute('aria-hidden','true');panel.inert=true;}
}
document.querySelectorAll('.unfurl').forEach(function(panel){setUnfurl(panel,panel.classList.contains('open'));});
document.addEventListener('click',function(e){
 var b=e.target.closest('.unfurl-btn');if(!b)return;
 var p=document.getElementById(b.getAttribute('aria-controls'));if(!p)return;
 var o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));setUnfurl(p,o);
});

/* depth: a light that follows the pointer, parallax layers and tilt (fine pointers, desktop, calm off) */
var fine=matchMedia('(pointer: fine)');
function tiltOn(){return fine.matches&&desk.matches&&!isCalm()}
function syncTilt(){H.classList.toggle('tilt',tiltOn());if(!tiltOn()){book.style.setProperty('--px',0);book.style.setProperty('--py',0);book.classList.remove('lit')}}
syncTilt();calmBtns.forEach(function(b){b.addEventListener('click',syncTilt)});if(desk.addEventListener)desk.addEventListener('change',syncTilt);
var stage=$('#stage'),raf=0,lastE=null;
stage.addEventListener('pointermove',function(e){if(!tiltOn())return;lastE=e;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var r=book.getBoundingClientRect(),x=lastE.clientX-r.left,y=lastE.clientY-r.top;
 var px=Math.max(-1,Math.min(1,(x/r.width)*2-1)),py=Math.max(-1,Math.min(1,(y/r.height)*2-1));
 book.style.setProperty('--px',px.toFixed(3));book.style.setProperty('--py',py.toFixed(3));book.style.setProperty('--mx',x+'px');book.style.setProperty('--my',y+'px');
 book.classList.toggle('lit',opened&&x>-40&&y>-40&&x<r.width+40&&y<r.height+40)})});
stage.addEventListener('pointerleave',function(){book.classList.remove('lit');book.style.setProperty('--px',0);book.style.setProperty('--py',0)});
/* cards lean toward the pointer */
document.addEventListener('pointermove',function(e){if(!H.classList.contains('tilt'))return;var c=e.target.closest&&e.target.closest('.bookplate');if(!c)return;var r=c.getBoundingClientRect();
 c.style.setProperty('--tx',(((e.clientX-r.left)/r.width-.5)*6).toFixed(2)+'deg');c.style.setProperty('--ty',((.5-(e.clientY-r.top)/r.height)*6).toFixed(2)+'deg')});

/* phone: paintings drift as they scroll, and the header picks up each chapter's colour */
var vis=[];
if('IntersectionObserver' in window){
 var sio=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('vis',e.isIntersecting);if(e.isIntersecting&&!desk.matches)fitHots(e.target);var i=vis.indexOf(e.target);if(e.isIntersecting&&i<0)vis.push(e.target);if(!e.isIntersecting&&i>=0)vis.splice(i,1)})},{rootMargin:'60px 0px'});
 $$('.story .scene').forEach(function(s){sio.observe(s)});
 var cio=new IntersectionObserver(function(es){if(desk.matches)return;es.forEach(function(e){if(e.isIntersecting)H.setAttribute('data-scene',e.target.id==='afterword'?'afterword':e.target.id)})},{rootMargin:'-45% 0px -50% 0px'});
 chaps.forEach(function(c){cio.observe(c)});if(aw)cio.observe(aw);
}
var sraf=0;
window.addEventListener('scroll',function(){if(desk.matches||isCalm()||sraf)return;sraf=requestAnimationFrame(function(){sraf=0;var vh=innerHeight;vis.forEach(function(s){var r=s.getBoundingClientRect();var p=((r.top+r.height/2)/vh)*2-1;s.style.setProperty('--py',Math.max(-1.4,Math.min(1.4,p)).toFixed(3))})})},{passive:true});
window.addEventListener('resize',function(){fitHots(pl);fitHots(pr);if(!desk.matches)fitHots($('#story'))});
if(!desk.matches)setTimeout(function(){fitHots($('#story'))},50);

/* pause the one ambient loop when the tab is hidden */
document.addEventListener('visibilitychange',function(){H.classList.toggle('paused',document.hidden)});

/* phone openers reveal as they scroll in; desktop re-paints if the window crosses the breakpoint */

var mqh=function(){if(opened&&desk.matches){paint(cur);showBody(cur,false);updateUI()}};
if(desk.addEventListener)desk.addEventListener('change',mqh);

window.__sb={turnTo:turnTo,openBook:openBook,get cur(){return cur},get opened(){return opened},N:N,desk:desk,isCalm:isCalm,fitHots:fitHots,updateUI:updateUI};
})();

/* ===== Scene notes and easter eggs ===== */
(function(){
'use strict';
var T=window.__sb;if(!T)return;
var H=document.documentElement;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var EGGS={
 bookmark:{name:'A tucked-in note',hint:'A ribbon hangs where no chapter is marked.'},
 lamp:{name:'The lamp\u2019s three moods',hint:'A lamp likes to be asked three times.'},
 stars:{name:'The night-sky book',hint:'Type the first word of our name, or an old game code.'},
 pups:{name:'Ragnar and Orion',hint:'Two small friends hide behind a folded corner among the counselors.'},
 afterword:{name:'The hidden last page',hint:'The end is not quite the end. Try going past it.'},
 wish:{name:'A wish on the moon',hint:'The moon in the first painting will take a wish.'}
};
var KEYS=Object.keys(EGGS),found={};
try{found=JSON.parse(localStorage.getItem('obcSbEggs')||'{}')||{}}catch(e){found={}}
var toast=$('#egg-toast'),tt=0,sealWrap=$('.egg-seal-wrap'),sealBtn=$('.egg-seal'),list=$('#egg-list');
function count(){return KEYS.filter(function(k){return found[k]}).length}
function renderSeal(){
 var n=count();if(!sealWrap)return;sealWrap.hidden=n===0;$('.egg-count',sealWrap).textContent=n+' of '+KEYS.length+' found';
 list.innerHTML='<p class="clabel">Small things tucked in the book</p><ul>'+KEYS.map(function(k){return found[k]?'<li class="got">'+EGGS[k].name+'</li>':'<li class="todo">'+EGGS[k].hint+'</li>'}).join('')+'</ul>'+(n===KEYS.length?'<p class="note">You found them all. Thank you for looking closely.</p>':'');
}
function say(msg){toast.innerHTML='<svg class="seal-ico" aria-hidden="true"><use href="#i-seal"/></svg><span>'+msg+'</span>';toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},4200)}
function find(k,msg){
 var first=!found[k];found[k]=1;try{localStorage.setItem('obcSbEggs',JSON.stringify(found))}catch(e){}
 renderSeal();say(msg+(first?' ('+count()+' of '+KEYS.length+' found)':''));
}
renderSeal();
sealBtn&&sealBtn.addEventListener('click',function(){var o=list.hidden;list.hidden=!o;sealBtn.setAttribute('aria-expanded',String(o))});

/* scene notes */
/* keep an open note fully on its painting: nudge it sideways, or flip it below/above the dot */
function placeNote(h){var n=$('.hot-note',h),sc=h.closest('.scene');if(!n||!sc)return;
 h.classList.remove('flip-d','flip-u');n.style.setProperty('--ndx','0px');
 var a=sc.getBoundingClientRect(),r=n.getBoundingClientRect(),m=8,dx=0;
 if(r.left<a.left+m)dx=a.left+m-r.left;else if(r.right>a.right-m)dx=a.right-m-r.right;
 if(dx)n.style.setProperty('--ndx',Math.round(dx)+'px');
 var down=h.classList.contains('n-down'),hb=h.getBoundingClientRect(),up=hb.top-a.top,dn=a.bottom-hb.top;
 if(!down&&r.top<a.top+m&&dn>up){h.classList.add('flip-d');down=true}else if(down&&r.bottom>a.bottom-m&&up>dn){h.classList.add('flip-u');down=false}
 n.style.setProperty('--ndy','0px');r=n.getBoundingClientRect();var dy=0;
 if(r.bottom>a.bottom-m)dy=a.bottom-m-r.bottom;if(r.top+dy<a.top+m)dy=a.top+m-r.top;
 if(dy)n.style.setProperty('--ndy',Math.round(dy)+'px');
}
window.addEventListener('resize',function(){$$('.hot.open').forEach(placeNote)});
function closeNotes(except){$$('.hot.open').forEach(function(h){if(h!==except){h.classList.remove('open');var b=$('.hot-btn',h);b&&b.setAttribute('aria-expanded','false')}})}
document.addEventListener('click',function(e){
 var b=e.target.closest&&e.target.closest('.hot-btn');
 if(!b){if(!(e.target.closest&&e.target.closest('.hot-note')))closeNotes();return}
 var h=b.parentNode,o=!h.classList.contains('open');closeNotes(h);h.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o));
 if(o)placeNote(h);
 if(o&&b.getAttribute('data-egg')==='wish'){var mv=b.closest('.sc-mv');if(mv){mv.classList.remove('wish');void mv.offsetWidth;mv.classList.add('wish')}find('wish','A shooting star crossed the moon.')}
});

/* the lamp: three clicks change the light */
var MOODS=['','moon','dawn','candle'],MNAME={'':'lamplight',moon:'moonlight',dawn:'dawn',candle:'candlelight'},clicks=0,ct=0;
document.addEventListener('click',function(e){
 var l=e.target.closest&&e.target.closest('.hang');if(!l)return;
 l.classList.remove('swing');void l.offsetWidth;l.classList.add('swing');
 clicks++;clearTimeout(ct);ct=setTimeout(function(){clicks=0},1800);
 if(clicks>=3){clicks=0;var m=H.getAttribute('data-mood')||'';var nx=MOODS[(MOODS.indexOf(m)+1)%MOODS.length];
  if(nx)H.setAttribute('data-mood',nx);else H.removeAttribute('data-mood');
  find('lamp','The lamp turned the room to '+MNAME[nx]+'.')}
});

/* bookmark: a kind note */
var note=$('#kind-note'),lastFocus=null,noteInert=[];
function noteFocusables(){return [].slice.call(note.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(el){return !el.disabled&&el.offsetParent!==null;});}
function setNoteInert(on){noteInert.forEach(function(el){el.inert=false;});noteInert=[];if(!on)return;[].forEach.call(document.body.children,function(el){if(el===note||el.contains(note))return;el.inert=true;noteInert.push(el);});}
function openNote(){lastFocus=document.activeElement;note.hidden=false;note.setAttribute('aria-modal','true');setNoteInert(true);var b=$('button',note);b&&b.focus();find('bookmark','You found a note tucked in the book.')}
function closeNote(){if(note.hidden)return;note.hidden=true;note.removeAttribute('aria-modal');setNoteInert(false);if(lastFocus&&lastFocus.focus)lastFocus.focus()}
note.addEventListener('keydown',function(e){if(note.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeNote();return;}if(e.key!=='Tab')return;var f=noteFocusables();if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
document.addEventListener('click',function(e){
 if(e.target.closest&&e.target.closest('.bookmark')){e.preventDefault();openNote();return}
 if(e.target.closest&&e.target.closest('[data-close="kind-note"]')){closeNote();return}
 if(!note.hidden&&!(e.target.closest&&e.target.closest('#kind-note')))closeNote();
});

/* dog-ear: the puppies */
document.addEventListener('click',function(e){
 var d=e.target.closest&&e.target.closest('.dogear');if(!d)return;
 var w=d.parentNode,o=!w.classList.contains('on');w.classList.toggle('on',o);d.setAttribute('aria-expanded',String(o));
 var p=$('.pups',w);p&&p.setAttribute('aria-hidden',String(!o));
 var pg=w.closest('.pg-r');
 if(pg){if(o&&!T.desk.matches&&p){pg.style.paddingBottom=(p.offsetHeight+16)+'px';setTimeout(function(){if(w.classList.contains('on'))p.scrollIntoView({block:'nearest',behavior:T.isCalm()?'auto':'smooth'})},T.isCalm()?0:820)}else pg.style.paddingBottom=''}
 if(o)find('pups','Ragnar and Orion say hello.');
});

/* the afterword: past the end */
var past=0,pt=0,aw=$('#afterword');
function showAfterword(){
 if(T.desk.matches){T.turnTo(T.N,{secret:true});window.scrollTo({top:0,behavior:T.isCalm()?'auto':'smooth'})}
 else if(aw){aw.hidden=false;aw.classList.add('in');T.fitHots(aw);aw.scrollIntoView({behavior:T.isCalm()?'auto':'smooth',block:'start'})}
 find('afterword','You found the hidden last page.');
}
window.__eggPast=function(){
 past++;clearTimeout(pt);pt=setTimeout(function(){past=0;T.updateUI()},6000);
 if(past===1){$('#pgno').textContent='The end\u2026 or is it?'}
 if(past>=3){past=0;showAfterword()}
};
document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.fleuron-btn'))showAfterword()});

/* the night sky: Konami code or typing "open" */
var night=$('#night'),sky=$('#sky'),built=false,nightFocus=null;
var VAL=[['Courage',150,390],['Connection',320,250],['Compassion',500,160],['Healing',680,250],['Growth',850,390],['Hope',500,430]];
var LINES=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,4],[2,5]];
function buildSky(){
 if(built)return;built=true;var ns='http://www.w3.org/2000/svg',h='<defs><radialGradient id="sg"><stop offset="0" stop-color="#fff8e0"/><stop offset=".35" stop-color="#f0d79a" stop-opacity=".8"/><stop offset="1" stop-color="#f0d79a" stop-opacity="0"/></radialGradient></defs>';
 var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
 for(var i=0;i<90;i++){h+='<circle class="bg-star" cx="'+(rnd()*1000).toFixed(0)+'" cy="'+(rnd()*600).toFixed(0)+'" r="'+(rnd()*1.3+.4).toFixed(2)+'" style="animation-delay:'+(rnd()*4).toFixed(2)+'s"/>'}
 LINES.forEach(function(l,k){var a=VAL[l[0]],b=VAL[l[1]];h+='<line class="v-line" x1="'+a[1]+'" y1="'+a[2]+'" x2="'+b[1]+'" y2="'+b[2]+'" style="animation-delay:'+(600+k*220)+'ms"/>'});
 VAL.forEach(function(v,k){h+='<g class="v-star" style="animation-delay:'+(200+k*160)+'ms"><circle cx="'+v[1]+'" cy="'+v[2]+'" r="22" fill="url(#sg)"/><circle cx="'+v[1]+'" cy="'+v[2]+'" r="3.4" fill="#fffaf0"/><text x="'+v[1]+'" y="'+(v[2]+(k===2?-30:42))+'" text-anchor="middle">'+v[0]+'</text></g>'});
 sky.innerHTML=h;
}
function openSky(){if(!night.hidden)return;buildSky();nightFocus=document.activeElement;night.hidden=false;var c=$('#night-close');c&&c.focus({preventScroll:true});find('stars','The book became a night sky.')}
function closeSky(){if(night.hidden)return;night.hidden=true;if(nightFocus&&nightFocus.focus)nightFocus.focus({preventScroll:true})}
$('#night-close').addEventListener('click',closeSky);
var KON=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],kp=0,typed='';
window.addEventListener('keydown',function(ev){
 if(ev.altKey||ev.ctrlKey||ev.metaKey)return;var t=ev.target;if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;
 var k=ev.key&&ev.key.length===1?ev.key.toLowerCase():ev.key;
 if(k==='Escape'){closeNotes();closeNote();closeSky();if(list&&!list.hidden){list.hidden=true;sealBtn.setAttribute('aria-expanded','false')}return}
 if(k===KON[kp]){kp++;if(kp>2&&/^Arrow(Left|Right)$/.test(k)){ev.preventDefault();ev.stopImmediatePropagation()}if(kp===KON.length){kp=0;openSky()}}
 else{kp=k===KON[0]?1:0}
 if(k&&k.length===1&&/[a-z]/.test(k)){typed=(typed+k).slice(-4);if(typed==='open'){typed='';openSky()}}
},true);

window.__eggs={find:find,openSky:openSky,showAfterword:showAfterword,openNote:openNote};
})();
