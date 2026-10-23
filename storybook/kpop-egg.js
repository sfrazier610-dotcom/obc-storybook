/* Hidden K-pop photocard easter egg (storybook only). Original CSS/SVG art; just for fun, not clinical. */
(function(){
const css=`.kp-egg{position:absolute;right:10px;bottom:10px;width:30px;height:40px;padding:0;border:1px solid #c89b3c;border-radius:5px;background:linear-gradient(160deg,#ffd9ec,#d9c8ff 60%,#bfe9ff);box-shadow:0 1px 4px rgba(0,0,0,.25);cursor:pointer;opacity:.55;transform:rotate(-8deg);transition:opacity .3s,transform .3s;z-index:2}
.kp-egg svg{width:100%;height:100%;display:block}
.kp-egg:hover,.kp-egg:focus-visible{opacity:1;transform:rotate(0) scale(1.15)}
.kp-egg:focus-visible{outline:2px solid #174a4f;outline-offset:2px}
@media(prefers-reduced-motion:no-preference){.kp-egg{animation:kpglow 3.5s ease-in-out infinite}@keyframes kpglow{0%,100%{box-shadow:0 1px 4px rgba(0,0,0,.25)}50%{box-shadow:0 0 10px 2px rgba(255,170,220,.7)}}}
.staff-card{position:relative}
.kp-pop{position:fixed;inset:0;z-index:299;display:flex;align-items:center;justify-content:center;background:rgba(10,20,30,.55);padding:16px}
.kp-pop[hidden]{display:none}
.kp-card{max-width:340px;background:linear-gradient(170deg,#fff7fb,#f3ecff);border:2px solid #c89b3c;border-radius:16px;padding:20px 22px;text-align:center;font-family:"EB Garamond",serif;color:#2a2340;box-shadow:0 10px 40px rgba(0,0,0,.4)}
.kp-card h2{margin:.3em 0;font-size:1.4rem;color:#174a4f}.kp-card p{margin:.5em 0;line-height:1.4}.kp-card small{display:block;opacity:.75;margin-top:.6em}
.kp-card .kp-row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px}
.kp-card a,.kp-card button{display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;font:inherit;font-size:1rem;line-height:1.2;cursor:pointer}
.kp-card a{background:linear-gradient(#2a7076,#174a4f);color:#fff8e6;border:1px solid #c89b3c;text-decoration:none}
.kp-card button{background:transparent;border:1.5px solid #174a4f;color:#174a4f}`;
const art=`<svg viewBox="0 0 30 40" aria-hidden="true"><circle cx="15" cy="13" r="5" fill="#fff" opacity=".9"/><circle cx="15" cy="13" r="3" fill="#ff8cc6"/><rect x="13.6" y="17" width="2.8" height="12" rx="1.4" fill="#7a5cc4"/><path d="M8 33c-1.6-1.4-1.6-3.2 0-3.6 .8-.2 1.4.4 1.6.9.2-.5.8-1.1 1.6-.9 1.6.4 1.6 2.2 0 3.6l-1.6 1.3z" fill="#ff6fae"/><circle cx="23" cy="7" r="1.2" fill="#fff"/><circle cx="6" cy="9" r=".9" fill="#fff"/><path d="M21 30v-5l4-1v5" stroke="#174a4f" stroke-width="1" fill="none"/><circle cx="20.2" cy="30.3" r="1.1" fill="#174a4f"/><circle cx="24.2" cy="29.3" r="1.1" fill="#174a4f"/></svg>`;
function add(){const c=document.querySelector('.staff-card[data-staff*="makayla"]')||[...document.querySelectorAll('.staff-card')].find(e=>/Makayla/.test(e.textContent));if(!c||c.querySelector('.kp-egg'))return !!c;
const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
const b=document.createElement('button');b.type='button';b.className='kp-egg';b.setAttribute('aria-label','A hidden photocard. Open it');b.title='A tucked-away photocard…';b.innerHTML=art;c.appendChild(b);
const p=document.createElement('div');p.className='kp-pop';p.hidden=true;p.innerHTML=`<div class="kp-card" role="dialog" aria-modal="true" aria-labelledby="kp-h"><div aria-hidden="true">${art.replace('<svg','<svg width="48" height="64"')}</div><h2 id="kp-h">You found a hidden photocard!</h2><p>Makayla loves K-pop music and trading cards. Want to talk K-pop or trade cards?</p><div class="kp-row"><a href="mailto:makayla@openbooktherapist.com?subject=${encodeURIComponent('K-pop & trading cards')}">Email Makayla</a><button type="button" class="kp-x">Close</button></div><small>Just for fun! This is a friendly hobby chat, not counseling or clinical advice. Please don't include health details.</small></div>`;
document.body.appendChild(p);let last;
const close=()=>{p.hidden=true;last&&last.focus()};
b.onclick=()=>{last=b;const cb=document.querySelector('.crisis');p.style.top=(cb?Math.max(0,cb.getBoundingClientRect().bottom):0)+'px';p.hidden=false;p.querySelector('a').focus()};
p.querySelector('.kp-x').onclick=close;p.onclick=e=>{if(e.target===p)close()};
p.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const f=[...p.querySelectorAll('a,button')];const i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
return true;}
let n=0;const t=setInterval(()=>{if(add()||++n>40)clearInterval(t)},250);
})();
