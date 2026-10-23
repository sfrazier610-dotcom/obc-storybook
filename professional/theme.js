(function(){const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;if(RM||!('IntersectionObserver'in window))return;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('turn');io.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('main>section').forEach(s=>{s.classList.add('page');io.observe(s);});})();
(function(){const R=window.OBC_REVIEWS,card=document.getElementById('rv-card');if(!R||!R.length||!card)return;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,S=window.OBC_REVIEWS_SUMMARY||{},MAX=300,DELAY=7000;
const lk=document.getElementById('rv-link');if(S.url)lk.href=S.url;else lk.remove();
const ini=n=>(n.match(/[A-Za-z]+/g)||[]).slice(0,2).map(w=>w[0].toUpperCase()+'.').join('');
const trim=t=>{t=t.replace(/\s+/g,' ').trim();if(t.length<=MAX)return t;const c=t.slice(0,MAX);return c.slice(0,c.lastIndexOf(' ')).replace(/[,;:.!?]+$/,'')+' …';};
const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let i=0,timer=null,paused=RM,hold=false;const cnt=document.getElementById('rv-count'),pb=document.getElementById('rv-pause');
function show(n){i=(n+R.length)%R.length;const r=R[i];const draw=()=>{card.innerHTML='<span class="stars" aria-label="5 out of 5 stars">★★★★★</span><p>“'+esc(trim(r.text))+'”</p><footer>— '+ini(r.name)+', Google review</footer>';card.classList.remove('fade');};
 if(RM)draw();else{card.classList.add('fade');setTimeout(draw,200);}cnt.textContent=(i+1)+' of '+R.length;}
function sched(){clearTimeout(timer);if(!paused&&!hold)timer=setTimeout(()=>{show(i+1);sched();},DELAY);}
function setPaused(p){paused=p;pb.textContent=p?'▶':'❚❚';pb.setAttribute('aria-label',p?'Start rotation':'Pause rotation');card.setAttribute('aria-live',p?'polite':'off');sched();}
document.getElementById('rv-prev').onclick=()=>{show(i-1);sched();};document.getElementById('rv-next').onclick=()=>{show(i+1);sched();};pb.onclick=()=>setPaused(!paused);
const box=card.closest('.rv');['mouseenter','focusin'].forEach(e=>box.addEventListener(e,()=>{hold=true;clearTimeout(timer);}));
['mouseleave','focusout'].forEach(e=>box.addEventListener(e,ev=>{if(e==='focusout'&&box.contains(ev.relatedTarget))return;hold=false;sched();}));
box.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){show(i-1);}else if(e.key==='ArrowRight'){show(i+1);}});
show(0);setPaused(paused);})();
/* Team photos (from the practice's Google Site About page). Professional site only. */
(function(){const g=document.getElementById('team-grid');if(!g||!window.OBC)return;
const P={'Scott Frazier':'scott-frazier','Amber Frazier':'amber-frazier','Shanna Manjang':'shanna-manjang','Amanda Lloyd':'amanda-lloyd','Aspen Johnson':'aspen-johnson','Abby Locke':'abby-locke','Makayla Jones':'makayla-jones'};
const fix=()=>g.querySelectorAll('article.card').forEach(c=>{const a=c.querySelector('.avatar');if(!a)return;const n=c.querySelector('h3').textContent.trim(),f=P[n];if(!f)return;
const cr=(c.querySelector('.cred')||{}).textContent||'';const im=new Image();im.src='img/team/'+f+'.webp';im.width=im.height=480;im.loading='lazy';im.decoding='async';im.className='avatar photo';im.alt=n+(cr?', '+cr.trim():'');a.replaceWith(im);});
fix();new MutationObserver(fix).observe(g,{childList:true});})();
