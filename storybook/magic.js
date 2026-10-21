// Ambient magic. Uses only transforms and opacity, with a single rAF loop that pauses when the tab is hidden.
// Turned off entirely for prefers-reduced-motion.
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('rm');return;}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],mob=matchMedia('(max-width:999px)').matches||matchMedia('(pointer:coarse)').matches;
document.documentElement.classList.add('magic');
// shooting star on the hero
const hp=$('#home .hero-page');if(hp){const s=document.createElement('span');s.className='shoot';s.setAttribute('aria-hidden','true');hp.appendChild(s);}
// wrap all illustrations for parallax + shimmer
$$('.vignette').forEach(v=>{let w=v.parentElement;if(!w.classList.contains('vwrap')){w=document.createElement('div');w.className='vwrap';v.before(w);w.appendChild(v);}w.classList.add('shimmer');});
// quill flourish writer
const q=document.createElement('div');q.className='quillwrite';q.setAttribute('aria-hidden','true');
q.innerHTML='<svg viewBox="0 0 220 60"><path d="M5 40 C 30 5, 55 5, 60 30 S 90 55, 110 30 S 150 5, 165 30 S 200 50, 215 20"/></svg><img src="img/spot-quill.webp" alt="">';
function writeFlourish(){if(document.hidden)return;const pg=$('.chapter.active .page.right')||$('.chapter .page.right');if(!pg)return;pg.appendChild(q);q.classList.remove('go');void q.offsetWidth;q.classList.add('go');}
setTimeout(writeFlourish,4000);setInterval(writeFlourish,mob?40000:22000);
// ink bloom where you tap
addEventListener('pointerdown',e=>{const b=document.createElement('span');b.className='bloom';b.style.transform=`translate(${e.clientX-30}px,${e.clientY-30}px)`;document.body.appendChild(b);setTimeout(()=>b.remove(),1100);},{passive:true});
// sparkle trail (throttled, pooled)
const pool=[];const N=mob?8:16;for(let i=0;i<N;i++){const s=document.createElement('span');s.className='trail';s.setAttribute('aria-hidden','true');document.body.appendChild(s);pool.push(s);}
let pi=0,lt=0;addEventListener('pointermove',e=>{const now=performance.now();if(now-lt<(mob?70:40))return;lt=now;const s=pool[pi++%N];s.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;s.classList.remove('on');void s.offsetWidth;s.classList.add('on');},{passive:true});
// parallax of illustrations (rAF; desktop pointer only)
let mx=0,my=0,dirty=false;if(!mob)addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;dirty=true;},{passive:true});
// fireflies + motes are on #motes canvas in theme.js; add fireflies layer here
const cv=document.createElement('canvas');cv.className='fireflies';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);const x=cv.getContext('2d');let W,H;const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};rs();addEventListener('resize',rs);
const F=Array.from({length:mob?4:9},()=>({x:Math.random(),y:Math.random(),a:Math.random()*6.28,s:.0006+Math.random()*.0008,ph:Math.random()*6.28}));
let run=true,raf=0;function loop(t){if(!run)return;
 if(dirty){dirty=false;$$('.chapter.active .vignette, .chapter.active .hero-art').forEach(v=>v.style.transform=`translate3d(${mx*-10}px,${my*-8}px,0) scale(1.04)`);}
 x.clearRect(0,0,W,H);for(const f of F){f.a+=(Math.random()-.5)*.2;f.x+=Math.cos(f.a)*f.s;f.y+=Math.sin(f.a)*f.s;if(f.x<0||f.x>1)f.a=Math.PI-f.a;if(f.y<0||f.y>1)f.a=-f.a;
  const g=Math.max(0,Math.sin(t/700+f.ph));if(g<.05)continue;const px=f.x*W,py=f.y*H;const gr=x.createRadialGradient(px,py,0,px,py,10);gr.addColorStop(0,`rgba(230,255,150,${.8*g})`);gr.addColorStop(1,'rgba(230,255,150,0)');x.fillStyle=gr;x.fillRect(px-10,py-10,20,20);}
 raf=requestAnimationFrame(loop);}
raf=requestAnimationFrame(loop);
document.addEventListener('visibilitychange',()=>{run=!document.hidden;document.documentElement.classList.toggle('paused',document.hidden);if(run)raf=requestAnimationFrame(loop);else cancelAnimationFrame(raf);});
window.obcMagic={pause(){run=false;cancelAnimationFrame(raf);},running:()=>run};
})();
// v7 night sky: layered twinkling stars, open-book constellation, occasional shooting stars.
// Reduced motion: drawn once, static.
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,mob=matchMedia('(max-width:999px)').matches;
const cv=document.getElementById('sky');if(!cv||!cv.getContext)return;const x=cv.getContext('2d');let W,H,dpr=Math.min(devicePixelRatio||1,mob?1.5:2);
const S=Array.from({length:mob?110:240},()=>({x:Math.random(),y:Math.random(),r:Math.random()<.85?Math.random()*1.1+.45:Math.random()*1.5+1.2,ph:Math.random()*6.28,sp:.4+Math.random()*1.6,c:Math.random()<.15?'255,226,160':(Math.random()<.2?'190,200,255':'255,255,255')}));
// open-book constellation (normalized points), upper left; lines form the two pages and spine
const C=[[.10,.20],[.16,.16],[.22,.19],[.22,.29],[.16,.26],[.10,.30],[.28,.16],[.34,.20],[.34,.30],[.28,.26]].map(([a,b])=>[a*.9+.02,b*.9]);
const L=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,8],[8,9],[9,3]];
let shoot=null,next=performance.now()+4000;
const rs=()=>{W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';x.setTransform(dpr,0,0,dpr,0,0);if(RM)draw(0);};
function draw(t){x.clearRect(0,0,W,H);
 for(const s of S){const a=RM?.75:.45+.55*Math.abs(Math.sin(t/1000*s.sp+s.ph));x.globalAlpha=a;x.fillStyle=`rgb(${s.c})`;x.beginPath();x.arc(s.x*W,s.y*H,s.r,0,6.283);x.fill();}
 const cs=Math.min(W,H*1.6);const P=C.map(([a,b])=>[a*cs,b*cs*.75+40]);
 x.globalAlpha=.22;x.strokeStyle='#f3d995';x.lineWidth=.8;x.beginPath();L.forEach(([i,j])=>{x.moveTo(...P[i]);x.lineTo(...P[j]);});x.stroke();
 P.forEach((p,i)=>{x.globalAlpha=RM?.9:.6+.4*Math.abs(Math.sin(t/900+i));x.fillStyle='#ffe9b0';x.shadowBlur=8;x.shadowColor='#f3c96a';x.beginPath();x.arc(p[0],p[1],1.6,0,6.283);x.fill();});x.shadowBlur=0;
 if(shoot){const k=(t-shoot.t0)/900;if(k>1)shoot=null;else{const hx=shoot.x+shoot.dx*k,hy=shoot.y+shoot.dy*k;const g=x.createLinearGradient(hx,hy,hx-shoot.dx*.25,hy-shoot.dy*.25);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.globalAlpha=1-k*.6;x.strokeStyle=g;x.lineWidth=1.6;x.beginPath();x.moveTo(hx,hy);x.lineTo(hx-shoot.dx*.25,hy-shoot.dy*.25);x.stroke();}}
 x.globalAlpha=1;}
rs();addEventListener('resize',rs);if(RM)return;
let last=0;(function f(t){if(document.hidden){return setTimeout(()=>requestAnimationFrame(f),500);}
 if(mob&&t-last<32){requestAnimationFrame(f);return;}last=t;
 if(!shoot&&t>next){shoot={x:Math.random()*W*.8+W*.2,y:Math.random()*H*.3,dx:-(180+Math.random()*220),dy:90+Math.random()*80,t0:t};next=t+7000+Math.random()*9000;}
 draw(t);requestAnimationFrame(f);})(0);
// gold motes rising from the book's gutter (desktop spread only)
const bk=document.getElementById('book');if(bk&&!mob){const g=document.createElement('div');g.className='gutter-motes';g.setAttribute('aria-hidden','true');for(let i=0;i<7;i++){const m=document.createElement('i');m.style.animationDelay=(-i*1).toFixed(1)+'s';m.style.setProperty('--dx',((Math.random()-.5)*60).toFixed(0)+'px');g.appendChild(m);}bk.appendChild(g);}
})();
