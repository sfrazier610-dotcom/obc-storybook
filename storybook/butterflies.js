// Flapping butterflies/moths painted to match the luna-moth spot art. Off with prefers-reduced-motion.
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const mob=matchMedia('(max-width:999px)').matches,COUNT=mob?2:3,$$=s=>[...document.querySelectorAll(s)];
const pal=[['#cfe8c4','#7fb59a','#6e1f24'],['#f3dca0','#c89b3c','#1f5a5e'],['#bfe0dc','#4f9a9a','#8a2d2b']];
const wingSVG=(c,side)=>`<svg viewBox="0 0 50 70" aria-hidden="true"><defs><radialGradient id="g${side}${c[0].slice(1)}" cx="${side==='l'?'80%':'20%'}" cy="35%" r="80%"><stop offset="0" stop-color="#fffbe8"/><stop offset=".45" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></radialGradient></defs>
<g transform="${side==='l'?'':'translate(50,0) scale(-1,1)'}"><path d="M50 30 C 30 2, 4 4, 3 20 C 2 34, 22 40, 50 36 Z" fill="url(#g${side}${c[0].slice(1)})" stroke="#c89b3c" stroke-width="1.2"/>
<path d="M50 38 C 34 40, 14 50, 18 64 C 22 72, 40 58, 50 42 Z" fill="url(#g${side}${c[0].slice(1)})" stroke="#c89b3c" stroke-width="1.1" opacity=".95"/>
<circle cx="24" cy="21" r="4" fill="${c[2]}" opacity=".7"/><circle cx="24" cy="21" r="1.6" fill="#f6dc9c"/><path d="M10 18 Q 25 14 44 30" stroke="#fff6d8" stroke-width=".8" fill="none" opacity=".6"/></g></svg>`;
function perches(){const sel=mob?'.vwrap,.hero-page,.charm-front,.chapter .page.right':'.chapter.active .vwrap,.chapter.active .hero-page,.chapter.active .page.right';
 return $$(sel).filter(e=>!B.some(b=>b.perch===e)||e.classList.contains('page')).filter(e=>{const r=e.getBoundingClientRect();return e.offsetParent!==null&&r.width>80&&r.bottom>60&&r.top<innerHeight-60;});}
const flyLayer=document.createElement('div');flyLayer.className='bfly-layer';flyLayer.setAttribute('aria-hidden','true');document.body.appendChild(flyLayer);
const B=[];window.obcButterflies=B;
function make(i){const c=pal[i%pal.length],el=document.createElement('div');el.className='bfly';el.setAttribute('aria-hidden','true');el.style.setProperty('--s',(mob?.8:1)*(0.85+Math.random()*.35));
 el.innerHTML=`<div class="bf-inner"><div class="wing l">${wingSVG(c,'l')}</div><div class="body"></div><div class="wing r">${wingSVG(c,'r')}</div></div>`;
 const b={el,i,busy:false,hops:0,taps:0};el.addEventListener('pointerdown',e=>{e.stopPropagation();b.taps++;shimmer(el);fly(b,true);});B.push(b);return b;}
function shimmer(el){const r=el.getBoundingClientRect();for(let k=0;k<6;k++){const s=document.createElement('span');s.className='bf-spark';s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height/2)+'px';
 s.style.setProperty('--dx',(Math.random()*60-30)+'px');s.style.setProperty('--dy',(Math.random()*-50-10)+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),900);}}
function land(b,p){const r=p.getBoundingClientRect(),pg=p.classList.contains('page');const x=pg?r.width-70-Math.random()*30:10+Math.random()*(r.width-60),y=pg?(Math.random()<.5?8:Math.max(8,p.scrollTop+r.height-70)):6+Math.random()*Math.max(10,Math.min(r.height-60,150));
 if(getComputedStyle(p).position==='static')p.style.position='relative';b.el.style.transform='';b.el.style.left=x+'px';b.el.style.top=y+'px';b.el.classList.remove('flying');b.el.classList.add('perched');p.appendChild(b.el);b.perch=p;}
function fly(b,scared){if(b.busy||document.hidden)return;const ps=perches().filter(p=>p!==b.perch);if(!ps.length)return;const to=ps[Math.floor(Math.random()*ps.length)];b.busy=true;b.hops++;
 const from=b.el.isConnected&&b.el.offsetParent?b.el.getBoundingClientRect():{left:Math.random()<.5?-40:innerWidth+40,top:innerHeight*Math.random()};
 const tr=to.getBoundingClientRect();const tx=tr.left+20+Math.random()*(tr.width-80),ty=tr.top+6;
 flyLayer.appendChild(b.el);b.el.classList.remove('perched');b.el.classList.add('flying');b.el.style.left='0px';b.el.style.top='0px';
 const mx=(from.left+tx)/2+(Math.random()*200-100),my=Math.min(from.top,ty)-60-Math.random()*80;const dur=scared?1300:2200+Math.random()*1200;
 const anim=b.el.animate([{transform:`translate(${from.left}px,${from.top}px) rotate(-10deg)`},{transform:`translate(${mx}px,${my}px) rotate(12deg)`,offset:.5},{transform:`translate(${tx}px,${ty}px) rotate(-4deg)`}],{duration:dur,easing:'ease-in-out'});
 anim.onfinish=()=>{land(b,to);b.busy=false;};}
function init(){const ps=perches();if(!ps.length)return setTimeout(init,800);for(let i=0;i<COUNT;i++){const b=make(i);const art=ps.filter(p=>!p.classList.contains('page'));land(b,i<art.length?art[i]:ps[(i)%ps.length]);}
 setInterval(()=>{if(document.hidden)return;B.forEach(b=>{if(!b.busy&&(!b.el.offsetParent||Math.random()<.18))fly(b,false);});},4000);}
setTimeout(init,1500);
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('paused',document.hidden));
})();
