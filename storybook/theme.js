(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const desk=()=>matchMedia('(min-width:1000px)').matches;
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),3200);};
function spark(x,y){if(RM)return;const s=document.createElement('span');s.className='sparkle';s.textContent='✦';s.style.left=x+'px';s.style.top=y+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),900);}
document.addEventListener('click',e=>{if(e.target.closest('.btn'))spark(e.clientX,e.clientY);});

// ---- cover ----
const cover=$('#cover');const closeCover=()=>{cover.classList.add('gone');setTimeout(()=>cover.remove(),900);inkChapter(chs[cur]);};
if(RM||sessionStorage.getItem('obc_cover_seen')){cover.remove();}else{
 sessionStorage.setItem('obc_cover_seen','1');
 const open=()=>{cover.classList.add('opening');setTimeout(closeCover,1300);};
 $('#cover-open').onclick=open;$('#cover-skip').onclick=closeCover;const auto=setTimeout(open,2600);
 cover.addEventListener('click',()=>clearTimeout(auto),{once:true});addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.contains(cover))closeCover();});}

// ---- chapters / page turning ----
const chs=$$('.chapter');let cur=0,busy=false;const cols=['#6e1f24','#1f5a5e','#8a5a1c','#3b4f7a','#5d7a3a','#7a3b5c','#2c6a6e','#8a2d2b'];
const rib=$('.ribbons');rib.innerHTML=chs.map((c,i)=>`<a href="#${c.id}" style="--c:${cols[i%cols.length]}" data-i="${i}">${c.dataset.title}</a>`).join('');
const ribs=$$('.ribbons a');
function setActive(i){chs.forEach((c,j)=>c.classList.toggle('active',j===i));cur=i;ribs.forEach((r,j)=>r.setAttribute('aria-current',j===i));
 $('#pgno').textContent=`${chs[i].dataset.title} · page ${i*2+1}–${i*2+2} of ${chs.length*2}`;$('#prev').disabled=i===0;$('#next').disabled=i===chs.length-1;
 chs[i].querySelectorAll('.page').forEach(p=>p.scrollTop=0);}
function inkChapter(c){if(RM||!c)return;c.classList.remove('inking');void c.offsetWidth;c.classList.add('inking');}
function snap(page){const d=document.createElement('div');const cl=page.cloneNode(true);cl.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));cl.removeAttribute('id');cl.setAttribute('aria-hidden','true');cl.querySelectorAll('img[loading]').forEach(m=>m.loading='eager');d.appendChild(cl);return d;}
function turnTo(i,focus){if(i<0||i>=chs.length||i===cur||busy)return;
 if(!desk()){chs[i].scrollIntoView({behavior:RM?'auto':'smooth'});return;}
 const fwd=i>cur,from=chs[cur],to=chs[i];
 if(RM){setActive(i);if(focus)to.querySelector('h1,h2').focus?.();return;}
 busy=true;const leaf=document.createElement('div');leaf.className='leaf '+(fwd?'fwd':'back');
 const a=snap(from.querySelector(fwd?'.page.right':'.page.left'));a.className='lf';const b=snap(to.querySelector(fwd?'.page.left':'.page.right'));b.className='lb';
 leaf.append(a,b);$('#book').appendChild(leaf);
 // underneath: show from's static half + to's other half
 const under=document.createElement('div');under.className='chapter active';under.style.zIndex=1;under.setAttribute('aria-hidden','true');
 const L=fwd?snap(from.querySelector('.page.left')):snap(to.querySelector('.page.left'));const R=fwd?snap(to.querySelector('.page.right')):snap(from.querySelector('.page.right'));
 [L,R].forEach(x=>{x.style.position='relative';x.style.height='100%';x.style.overflow='hidden';under.appendChild(x);});$('#book').appendChild(under);from.classList.remove('active');
 setTimeout(()=>{setActive(i);leaf.remove();under.remove();busy=false;inkChapter(to);},900);}
window.obcTurnTo=turnTo;
$('#prev').onclick=()=>turnTo(cur-1);$('#next').onclick=()=>turnTo(cur+1);
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);const i=chs.findIndex(c=>c.id===id);if(i<0)return;
 if(desk()){e.preventDefault();turnTo(i);history.replaceState(null,'','#'+id);}});
addEventListener('keydown',e=>{if(!desk()||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if(e.key==='PageDown')turnTo(cur+1);if(e.key==='PageUp')turnTo(cur-1);});
let tx=null;$('#book').addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
const start=Math.max(0,chs.findIndex(c=>'#'+c.id===location.hash));setActive(start);
if(!document.body.contains(cover))inkChapter(chs[start]);
// staircase ribbons: ribbons gently step in and out (order never changes)
let off=0;const stair=()=>ribs.forEach((r,j)=>r.style.setProperty('--st',`${[0,4,8,4][(j+off)%4]}px`));stair();if(!RM)setInterval(()=>{off++;stair();},4000);

// ---- quiz as page-by-page story ----
const fs=$$('#quiz fieldset'),sub=$('#quiz button[type=submit]');let qi=0;
const qn=document.createElement('div');qn.className='quiz-nav';qn.innerHTML='<button type="button" class="btn ghost sm" id="q-back">‹ Back</button><span class="cnt" id="q-cnt"></span><button type="button" class="btn sm" id="q-next">Turn the page ›</button>';
sub.before(qn);const qShow=()=>{fs.forEach((f,j)=>f.hidden=j!==qi);$('#q-cnt').textContent=`Page ${qi+1} of ${fs.length}`;$('#q-back').disabled=qi===0;$('#q-next').hidden=qi===fs.length-1;sub.hidden=qi!==fs.length-1;
 if(!RM){fs[qi].classList.remove('pf');void fs[qi].offsetWidth;fs[qi].classList.add('pf');}};
$('#q-next').onclick=()=>{qi=Math.min(fs.length-1,qi+1);qShow();};$('#q-back').onclick=()=>{qi=Math.max(0,qi-1);qShow();};qShow();
window.obcQuizAll=()=>{fs.forEach(f=>f.hidden=false);};
// illustrated result cards
const spots=['lantern','key','quill','moth','book','fox'];
new MutationObserver(()=>{$$('.ranked>li').forEach((li,i)=>{if(li.querySelector('.seal'))return;const n=li.querySelector('strong').textContent;const s=document.createElement('div');s.className='seal';s.setAttribute('aria-hidden','true');s.textContent=n.split(' ').map(w=>w[0]).join('');
 const im=document.createElement('img');im.className='rspot';im.alt='';im.loading='lazy';im.src=`img/spot-${spots[i%6]}.webp`;li.prepend(s);li.append(im);});}).observe($('#results'),{childList:true});

// ---- charms: flippable illustrated cards ----
const cs=['lantern','moth','key','book','fox','quill'];
$$('#coping .skill').forEach((k,i)=>{const h=k.querySelector('h3');const f=document.createElement('div');f.className='charm-front';
 f.innerHTML=`<img src="img/spot-${cs[i%6]}.webp" alt="" loading="lazy"><h4>${h.childNodes[0].textContent.trim()}</h4><p>${(h.querySelector('small')||{}).textContent||''}</p><button class="btn sm" type="button">Turn the card over</button>`;
 f.querySelector('button').onclick=()=>{k.classList.add('open');setTimeout(()=>(k.querySelector('button:not(.charm-front button),input,textarea')||h).focus({preventScroll:true}),RM?0:500);};k.prepend(f);});
// pageflip on charm steps
document.addEventListener('click',e=>{const b=e.target.closest('[data-next],[data-prev]');if(!b||RM)return;const li=[...b.closest('.skill').querySelectorAll('.steps li')].find(l=>!l.hidden);if(li){li.classList.remove('pf');void li.offsetWidth;li.classList.add('pf');}});

// ---- dust motes (parallax) ----
const cv=$('#motes');if(!RM&&cv.getContext){const x=cv.getContext('2d');let W,H,mx=0,my=0;const P=Array.from({length:70},()=>({x:Math.random(),y:Math.random(),z:Math.random()*.8+.2,r:Math.random()*1.6+.4,v:Math.random()*.0003+.0001}));
 const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};rs();addEventListener('resize',rs);addEventListener('mousemove',e=>{mx=e.clientX/W-.5;my=e.clientY/H-.5;});
 (function f(t){x.clearRect(0,0,W,H);P.forEach(p=>{p.y-=p.v*p.z;if(p.y<-.05)p.y=1.05;const px=(p.x+Math.sin(t/4000+p.x*9)*.01-mx*.03*p.z)*W,py=(p.y-my*.03*p.z)*H;
  x.beginPath();x.arc(px,py,p.r*p.z*1.4,0,7);x.fillStyle=`rgba(255,214,140,${.25+.35*p.z})`;x.shadowBlur=8;x.shadowColor='#ffcf7a';x.fill();});requestAnimationFrame(f);})(0);}

// ---- Easter eggs ----
const room=$('#secret-room');window.obcOpenRoom=()=>{room.hidden=false;$('#sr-close').focus();};$('#sr-close').onclick=()=>room.hidden=true;room.addEventListener('keydown',e=>{if(e.key==='Escape')room.hidden=true;});
const glyphs=['ᚠ','ᚱ','ᛟ','ᛉ','ᛞ'],hs=['#match h2','#team h2','#services h2','#toolkit h2','#faq h2'].map(s=>$(s));let found=0;
hs.forEach((h,i)=>{const b=document.createElement('button');b.className='rune';b.textContent=glyphs[i];b.setAttribute('aria-label','Hidden rune '+(i+1));
 b.onclick=e=>{if(b.classList.contains('found'))return;b.classList.add('found');found++;$('#rune-count').textContent=found;spark(e.clientX,e.clientY);toast(found<5?`A rune glows. ${5-found} still hidden.`:'All five runes glow. A bookcase swings open…');if(found===5)setTimeout(obcOpenRoom,RM?0:700);};h.appendChild(b);});
const K=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let ki=0;
addEventListener('keydown',e=>{ki=(e.key===K[ki])?ki+1:(e.key===K[0]?1:0);if(ki===K.length){ki=0;document.body.dataset.konami='1';obcOpenRoom();}});
let bc=0;$('.brand').addEventListener('click',()=>{if(++bc===3){bc=0;toast('The library whispers: "Every chapter can be rewritten."');}});
// the fox on the last page says hello
$$('.spot').forEach(s=>{s.style.cursor='pointer';s.addEventListener('click',e=>{spark(e.clientX,e.clientY);toast(s.src.includes('fox')?'The fox yawns: "Rest is part of the story too."':'Something shimmers in the margin…');});});
// mobile menu closes after choosing
$$('#nav a').forEach(a=>a.addEventListener('click',()=>{$('#nav').classList.remove('open');$('.menu').setAttribute('aria-expanded','false');}));
})();
