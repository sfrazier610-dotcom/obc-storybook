/* Motion layer: GPU-friendly particles (one shared canvas, idle when empty) and class hooks.
   Fully disabled under prefers-reduced-motion (CSS falls back to simple fades). */
(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,$=function(s){return document.querySelector(s)},$$=function(s){return [].slice.call(document.querySelectorAll(s))};
var MOB=matchMedia('(max-width:999px)').matches||matchMedia('(pointer:coarse)').matches,K=MOB?.5:1;
document.documentElement.classList.add(RM?'mo-rm':'mo');
/* rune found state (both modes): watch class changes */
function runeWatch(){$$('.rune').forEach(function(r){if(r._mo)return;r._mo=1;new MutationObserver(function(){if(r.classList.contains('found')&&!r._f){r._f=1;if(r._clicked){r.classList.add('rune-burst');setTimeout(function(){r.classList.remove('rune-burst')},1400);burstAt(r,'rune')}}}).observe(r,{attributes:true,attributeFilter:['class']});
 r.addEventListener('click',function(){r._clicked=1},true);if(r.classList.contains('found'))r._f=1;})}
setTimeout(runeWatch,0);new MutationObserver(function(){runeWatch()}).observe(document.body,{childList:true,subtree:true});
if(RM){window.obcBurst=function(){};return;}
/* shared particle canvas */
var cv=document.createElement('canvas');cv.className='mo-fx';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);var cx=cv.getContext('2d'),P=[],raf=0,dpr=Math.min(devicePixelRatio||1,2);
function size(){cv.width=innerWidth*dpr;cv.height=innerHeight*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}size();addEventListener('resize',size);
function add(x,y,n,o){o=o||{};n=Math.round(n*K);for(var i=0;i<n;i++){var a=(o.a0||0)+Math.random()*(o.spread||6.283),v=(o.v||3)*(.35+Math.random());P.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||0),l:1,d:(o.decay||.018)*(.7+Math.random()*.6),s:(o.s||2)*(.5+Math.random()),c:o.c||(Math.random()<.5?'#fff3c4':'#f3c95a'),g:o.g==null?.03:o.g})}if(!raf)raf=requestAnimationFrame(tick)}
function tick(){cx.clearRect(0,0,innerWidth,innerHeight);cx.globalCompositeOperation='lighter';for(var i=P.length-1;i>=0;i--){var p=P[i];p.x+=p.vx;p.y+=p.vy;p.vx*=.965;p.vy=p.vy*.965+p.g;p.l-=p.d;if(p.l<=0){P.splice(i,1);continue}
 cx.globalAlpha=p.l;cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,p.s*(.6+p.l*.6),0,6.283);cx.fill();if(p.s>1.6){cx.globalAlpha=p.l*.25;cx.beginPath();cx.arc(p.x,p.y,p.s*3,0,6.283);cx.fill()}}
 cx.globalCompositeOperation='source-over';raf=P.length?requestAnimationFrame(tick):0;if(!raf)cx.clearRect(0,0,innerWidth,innerHeight)}
function burstAt(el,kind){if(RM)return;var r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
 if(kind==='rune'){add(x,y,46,{v:4.2,s:2.4,decay:.016,g:.01});add(x,y,18,{v:1.4,s:1.2,decay:.01,g:-.02,c:'#fffbe6'})}
 else if(kind==='award'){add(r.left+r.width*.12,y,26,{v:2.6,s:1.8,decay:.02,g:-.01});add(r.left+r.width*.5,y,14,{v:1.8,s:1.4,decay:.022,g:-.015})}
 else if(kind==='die'){add(x,y,30,{v:3.2,s:1.8,decay:.022,g:.04})}
 else add(x,y,20,{v:2.5})}
window.obcBurst=burstAt;
/* 1) Pen spell: glowing ink trail from the nib while writing, bursts + bloom per award */
var A=$('#awards');if(A){var pen=A.querySelector('.aw-pen'),wasCast=false,trailT=0;
 new MutationObserver(function(){var c=A.classList.contains('casting');if(c&&!wasCast){wasCast=true;var t0=performance.now();
   (function trail(now){var q=pen.getBoundingClientRect(),k=(now-t0)/650;if(k>1.6)return;var tx=q.left+q.width*.88,ty=q.top+q.height*.5;
    add(tx,ty,MOB?1:2,{v:.8,s:1.6,decay:.03,g:.02,c:'#ffe7a3'});trailT=requestAnimationFrame(trail)})(t0);
   setTimeout(function(){var ink=A.querySelector('.aw-ink');ink&&burstAt(ink,'x')},700);
   [[0,900],[1,1500],[2,2200]].forEach(function(z){setTimeout(function(){var e=A.querySelectorAll('.aw-list:not(.aw-past-list) .aw')[z[0]];e&&burstAt(e,'award')},650+z[1]+200)});
   setTimeout(function(){var e=A.querySelector('.aw-past');e&&burstAt(e,'award')},650+2800);}
  if(!c)wasCast=false}).observe(A,{attributes:true,attributeFilter:['class']});}
/* 2) Page turns: spine sparkle + sweep */
var bk=$('#book');if(bk)new MutationObserver(function(m){m.forEach(function(r){[].forEach.call(r.addedNodes,function(n){if(n.classList&&n.classList.contains('leaf')){var b=bk.getBoundingClientRect();
 setTimeout(function(){add(b.left+b.width/2,b.top+b.height*.5,22,{v:2.2,s:1.5,decay:.02,g:-.01,spread:6.283})},420)}})})}).observe(bk,{childList:true});
/* 3) d20 roll: impact burst */
var res=$('#results');if(res)new MutationObserver(function(){var d=$('.d20-roll svg');if(d&&!d._b){d._b=1;setTimeout(function(){burstAt(d,'die')},1050)}}).observe(res.parentNode,{childList:true});
/* 4) Sky + map parallax (pointer on desktop, scroll on mobile); transforms only */
var sky=$('#sky'),motes=$('#motes'),tx=0,ty=0,cxp=0,cyp=0,pr=0;
function para(){cxp+=(tx-cxp)*.08;cyp+=(ty-cyp)*.08;if(sky)sky.style.transform='translate3d('+(cxp*-10)+'px,'+(cyp*-8)+'px,0)';if(motes)motes.style.transform='translate3d('+(cxp*-22)+'px,'+(cyp*-16)+'px,0)';
 $$('.quest-map svg').forEach(function(s){s.style.transform='translate3d('+(cxp*4)+'px,'+(cyp*3)+'px,0)'});pr=(Math.abs(tx-cxp)+Math.abs(ty-cyp)>.002)?requestAnimationFrame(para):0}
if(!MOB)addEventListener('pointermove',function(e){tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;if(!pr)pr=requestAnimationFrame(para)},{passive:true});
else addEventListener('scroll',function(){ty=Math.min(1,scrollY/3000)-.5;tx=0;if(!pr)pr=requestAnimationFrame(para)},{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden){P.length=0}});
})();
