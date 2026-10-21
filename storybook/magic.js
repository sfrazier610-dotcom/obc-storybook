// Ambient magic. Uses only transforms and opacity, with a single rAF loop that pauses when the tab is hidden.
// Turned off entirely for prefers-reduced-motion.
(function(){
if(matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('rm');return;}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],mob=matchMedia('(max-width:999px)').matches||matchMedia('(pointer:coarse)').matches;
document.documentElement.classList.add('magic');
// floating background books
const sky=document.createElement('div');sky.className='floaters';sky.setAttribute('aria-hidden','true');
const nB=mob?1:3;for(let i=0;i<nB;i++){const im=document.createElement('img');im.src='img/spot-book.webp';im.alt='';im.className='floater f'+i;sky.appendChild(im);}document.body.appendChild(sky);
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
