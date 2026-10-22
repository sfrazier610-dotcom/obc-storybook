/* The Fogstorm: a small retro top-down RPG about coping skills. Educational, not therapy.
   All pixel art is original and drawn in code. Lazy: data + CSS load on first open. */
(function(){'use strict';
var KEY='obc_quest_v1',Q=null,dlg=null,loading=null,SCENE='title',raf=0,P=null,B=null,MAP=null,ENEMIES=[],PARTS=[],FLO=[],T0=0,held=null;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){if(Q)return Promise.resolve();if(loading)return loading;
 loading=new Promise(function(ok,no){var l=document.createElement('link');l.rel='stylesheet';l.href='quest-game.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='../shared/quest-data.js';s.onload=function(){Q=window.OBC_QUEST;ok()};s.onerror=no;document.head.appendChild(s)});return loading}
function prog(){try{var p=JSON.parse(localStorage.getItem(KEY))||{};return p.v===4?p:{v:4}}catch(e){return {v:4}}}
function saveProg(p){p.v=4;try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var BONUS=[];/* bonus rune lives in memory only: resets every visit */
function sym(id){return Q.symptoms.find(function(x){return x.id===id})}
function sp(id){return Q.spells.find(function(x){return x.id===id})}
function clins(){return ((window.OBC&&OBC.clinicians)||[]).filter(function(k){var c=Q.companions.find(function(x){return x.id===k.id});return c&&c.consent})}
function clin(id){return clins().find(function(k){return k.id===id})||null}
function maxRes(p){return 20+Math.min(10,2*Math.floor(((p||prog()).xp||0)/2))}
function level(p){return 1+Math.min(5,Math.floor(((p||prog()).xp||0)/2))}

/* ---------- original pixel art (code-drawn) ---------- */
var PAL={k:'#1a1a2b',h:'#5a3a22',s:'#e2ad84',c:'#1f6f73',d:'#134a4d',y:'#f3c95a',b:'#3b2a1a',w:'#ffffff'};
var HERO={down:['....kkkk....','...khhhhk...','..khhhhhhk..','..kssssssk..','..ksksskskk.','...kssssk...','..kccccccky.','.kccdccdccy.','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...'],
 side:['....kkkk....','...khhhhk...','..khhhhhhk..','..khsssssk..','..khssksk...','...kssssk...','..kccccccky.','.kccccdccy..','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...'],
 up:['....kkkk....','...khhhhk...','..khhhhhhk..','..khhhhhhk..','..khhhhhhk..','...khhhhk...','..kccccccky.','.kccccccccy.','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...']};
function legsB(r){r=r.slice();r[11]='..kb....bk..';r[12]='..kb....bk..';r[13]='..kk....kk..';return r}
var CLOUD=['....kkkkkk....','..kkggggggkk..','.kggllggggggk.','kgglllgggggggk','kggggggggggggk','kggwkggggwkggk','kggkkggggkkggk','kggggggggggggk','kgggggkkgggggk','.kggggggggggk.','..kgkggggkgk..','...k.kggk.k...'];
var FOGPAL={k:'#3d4246',g:'#9aa3a8',l:'#c9cfd2',w:'#eef2f3'},STORMPAL={k:'#1d2c3d',g:'#5d7891',l:'#8fb0c9',w:'#f3c95a'},BOSSPAL={k:'#14141c',g:'#4b4e5c',l:'#767a8a',w:'#f3c95a'};
var FACE=['...kkkkkk...','..kHHHHHHk..','.kHHHHHHHHk.','.kHssssssHk.','.kHskssksHk.','.kHssssssHk.','..kssssssk..','...kssssk...','..kAAAAAAk..','.kAAAwwAAAk.','.kAAAwwAAAk.','.kkkkkkkkkk.'];
/* portraits are stylized placeholders, not likenesses: each clinician gets their own hair and scarf colors */
var FACEPAL={scott:{H:'#6b4a2e',A:'#1f6f73'},amber:{H:'#c9863a',A:'#8a2f3c'},shanna:{H:'#2a1c14',A:'#c0782a'},amanda:{H:'#8a5a33',A:'#3f6fb0'},aspen:{H:'#d9b46a',A:'#3d8a4f'},abby:{H:'#4a2e1e',A:'#7a4fa0'}};
function px(c,rows,pal,x,y,o){o=o||{};var s=o.s||1,w=rows[0].length;for(var j=0;j<rows.length;j++)for(var i=0;i<w;i++){var ch=rows[j][i];if(ch==='.'||!ch)continue;var col=o.flash?'#ffffff':(pal[ch]||PAL[ch]);if(!col)continue;c.fillStyle=col;c.fillRect(Math.round(x+(o.flip?w-1-i:i)*s),Math.round(y+j*s),s,s)}}
function facePal(id){var f=FACEPAL[id]||{H:'#555',A:'#888'};return {k:'#1a1a2b',s:'#e2ad84',w:'#fff6dd',H:f.H,A:f.A}}

/* ---------- overworld ---------- */
var ROWS=['TTTTTTTTCCCCTTTTTTTT','TFFFFFFTCCCCTSSSSSST','TFFFFFFTCCDCTSSSSSST','TFFFFFF......SSSSSST','TFFFFFFFF.WW.SSSSSST','TFFFFFFFF.WW.SSSSSST','TFFFFFF......SSSSSST','TFFFFFFF.....SSSSSST','TFFFFFFFF.H..SSSSSST','TTFFFFFF.....SSSSSTT','TTTFFFF.......SSSTTT','TTTTTTTT....TTTTTTTT','TTTTTTTTTTTTTTTTTTTT'];
var TS=16,MW=20,MH=13,START={x:10,y:10},OFFICE={x:10,y:8},DOOR={x:10,y:2};
var SPAWN=[['f1','fog',3,2],['f2','fog',5,4],['f3','fog',2,7],['f4','fog',6,9],['f5','fog',4,10],['s1','storm',15,2],['s2','storm',17,5],['s3','storm',14,7],['s4','storm',16,9]];
function tile(x,y){return (ROWS[y]||'')[x]||'T'}
function walk(x,y){return 'FS.HD'.indexOf(tile(x,y))>=0}
function zone(x,y){var t=tile(x,y);return t==='F'?'fog':t==='S'?'storm':null}
function hash(x,y){return ((x*73856093)^(y*19349663))>>>0}
function drawTile(c,t,x,y){var X=x*TS,Y=y*TS,h=hash(x,y);
 function r(col,a,b,w,hh){c.fillStyle=col;c.fillRect(X+a,Y+b,w,hh)}
 if(t==='T'){r('#2f6b3a',0,0,16,16);r('#1e4a28',2,1,12,11);r('#2f7d40',3,2,10,8);r('#4a9a55',5,3,4,3);r('#5a3a22',6,11,4,5);r('#1e4a28',1,3,1,6);r('#1e4a28',14,3,1,6);return}
 if(t==='W'){r('#2a5f8a',0,0,16,16);r('#3f7fb0',2,4+(h%3),5,1);r('#3f7fb0',9,10-(h%3),5,1);return}
 if(t==='C'){r('#6c6f7a',0,0,16,16);c.fillStyle='#50535d';for(var i=0;i<16;i+=4){c.fillRect(X,Y+i,16,1);c.fillRect(X+((i/4)%2?0:8),Y+i,1,4)}if(y===0){r('#14141c',0,0,4,3);r('#14141c',8,0,4,3)}return}
 if(t==='D'){r('#6c6f7a',0,0,16,16);r('#3b2a1a',3,4,10,12);r('#5a3a22',4,5,8,11);r('#3b2a1a',4,3,8,1);r('#f3c95a',10,10,1,2);return}
 if(t==='H'){r('#c9a46a',0,0,16,16);r('#8a2f3c',0,0,16,6);r('#6e1f24',0,5,16,1);r('#f6ead0',2,7,12,8);r('#3b2a1a',6,10,4,6);r('#fff6dd',3,8,4,3);r('#fff6dd',9,8,4,3);r('#1a1a2b',7,8,2,3);return}
 var base=t==='F'?'#7f9a7e':t==='S'?'#7d8d99':t==='.'?'#c9b38a':'#6fa860';r(base,0,0,16,16);
 c.fillStyle=t==='F'?'#6b856b':t==='S'?'#66747f':t==='.'?'#b39d76':'#5a9150';c.fillRect(X+(h%12)+1,Y+((h>>4)%12)+1,2,1);c.fillRect(X+((h>>8)%12)+2,Y+((h>>12)%12)+2,1,2);
 if(t==='S'&&h%5===0){r('#56636d',4,8,6,4);r('#93a1ab',5,8,3,1)}}
function buildMap(){MAP=document.createElement('canvas');MAP.width=MW*TS;MAP.height=MH*TS;var c=MAP.getContext('2d');for(var y=0;y<MH;y++)for(var x=0;x<MW;x++)drawTile(c,tile(x,y),x,y)}
function spawn(){var cl=prog().cleared||[];ENEMIES=SPAWN.filter(function(e){return cl.indexOf(e[0])<0}).map(function(e){return {id:e[0],weather:e[1],x:e[2],y:e[3],fx:e[2],fy:e[3],t:Math.random()*3000}})}
function newPlayer(){var p=prog();P={x:p.x!=null?p.x:START.x,y:p.y!=null?p.y:START.y,dir:'down',moving:null,frame:0,resolve:p.resolve!=null?Math.min(p.resolve,maxRes(p)):maxRes(p)};P.fx=P.x;P.fy=P.y}
function savePos(){var p=prog();p.x=P.x;p.y=P.y;p.resolve=P.resolve;saveProg(p)}
var DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function step(dir){if(SCENE!=='map'||!P||P.moving)return false;P.dir=dir;var d=DIRS[dir],nx=P.x+d[0],ny=P.y+d[1];if(!walk(nx,ny)){status();return false}
 P.moving={sx:P.x,sy:P.y,t:0};P.x=nx;P.y=ny;P.frame^=1;if(RM){P.moving=null;P.fx=nx;P.fy=ny;arrive()}return true}
function arrive(){savePos();var t=tile(P.x,P.y);
 if(t==='D'){P.y=DOOR.y+1;P.fy=P.y;savePos();return bossIntro()}
 if(t==='H'){var m=maxRes();if(P.resolve<m){P.resolve=m;savePos();say('You rest at the Open Book office. Resolve restored to '+m+'.');toast('Rested at the office: Resolve full')}}
 var e=touching();if(e)return encounter(e);status()}
function touching(){return ENEMIES.find(function(e){return Math.abs(e.fx-P.fx)<.6&&Math.abs(e.fy-P.fy)<.6})}
function nearest(){var best=null,bd=1e9;ENEMIES.forEach(function(e){var d=Math.abs(e.x-P.x)+Math.abs(e.y-P.y);if(d<bd){bd=d;best=e}});return best}
function wander(e,dt){if(RM)return;e.t-=dt;if(e.moving){e.moving.t+=dt/400;var k=Math.min(1,e.moving.t);e.fx=e.moving.sx+(e.x-e.moving.sx)*k;e.fy=e.moving.sy+(e.y-e.moving.sy)*k;if(k>=1)e.moving=null;return}
 if(e.t>0)return;e.t=1400+Math.random()*1800;var ks=Object.keys(DIRS),d=DIRS[ks[Math.floor(Math.random()*4)]],nx=e.x+d[0],ny=e.y+d[1];
 if(zone(nx,ny)===e.weather&&!ENEMIES.some(function(o){return o!==e&&o.x===nx&&o.y===ny})&&!(nx===P.x&&ny===P.y)){e.moving={sx:e.x,sy:e.y,t:0};e.x=nx;e.y=ny}}
function drawMap(c,t,dt){c.drawImage(MAP,0,0);
 if(!RM){c.fillStyle='rgba(220,225,228,.10)';var o=(t/90)%64;for(var i=-1;i<6;i++){c.fillRect(i*64+o,30+((i*37)%40),40,6);c.fillRect(i*64-o+20,110+((i*23)%50),30,5)}
  c.fillStyle='rgba(143,176,201,.35)';for(var j=0;j<10;j++){var rx=208+((j*29+t/8)%112),ry=((j*47+t/3)%208);c.fillRect(rx,ry,1,3)}
  c.fillStyle='#5d9bc8';var wy=Math.floor(t/400)%3;c.fillRect(10*TS+3,4*TS+5+wy,6,1);c.fillRect(11*TS+6,5*TS+9-wy,6,1)}
 ENEMIES.forEach(function(e){wander(e,dt);var bob=RM?0:Math.round(Math.sin(t/300+e.x)*1);px(c,CLOUD,e.weather==='fog'?FOGPAL:STORMPAL,e.fx*TS+1,e.fy*TS+2+bob)});
 if(P.moving){P.moving.t+=dt/150;var k=Math.min(1,P.moving.t);P.fx=P.moving.sx+(P.x-P.moving.sx)*k;P.fy=P.moving.sy+(P.y-P.moving.sy)*k;if(k>=1){P.moving=null;P.fx=P.x;P.fy=P.y;arrive();if(SCENE==='map'&&held)step(held)}}
 else if(touching()&&SCENE==='map')encounter(touching());
 var rows=P.dir==='up'?HERO.up:P.dir==='down'?HERO.down:HERO.side;if(P.frame)rows=legsB(rows);var ib=(!RM&&!P.moving&&Math.floor(t/500)%2)?1:0;
 px(c,rows,PAL,P.fx*TS+2,P.fy*TS+1+ib,{flip:P.dir==='left'})}

/* ---------- battle rules (pure) ---------- */
function newBattle(kind,weather,phase){var p=prog(),G=Q.guide,st={kind:kind,mode:kind==='boss'?'boss':weather,phase:phase||0,resolve:P?P.resolve:maxRes(p),maxRes:maxRes(p),meter:8,max:8,lastSpell:null,current:null,prev:null,round:0,cooldown:0,gateOpen:false,freeRest:false,freeRestUsed:false,helped:{},over:null};
 if(kind==='boss'){var Ph=Q.boss[st.phase];st.meter=st.max=Ph.meter;if(Ph.guide==='cooldown-start')st.cooldown=G.cooldownTurns}
 st.current=draw(st);return st}
function phaseOf(st){return st.mode==='boss'?Q.boss[st.phase]:null}
function roster(st){if(st.mode!=='boss')return Q.symptoms.filter(function(s){return s.weather===st.mode}).map(function(s){return s.id});
 var Ph=Q.boss[st.phase];if(Ph.roster)return Ph.roster.slice();var w=Ph.id==='stair'?(st.round%2?'fog':'storm'):null;
 return Q.symptoms.filter(function(s){return (!w||s.weather===w)&&!s.guideOnly}).map(function(s){return s.id})}
function draw(st,rnd){rnd=rnd||Math.random;var Ph=phaseOf(st);
 if(st.mode!=='boss'&&st.current)return st.current;
 if(Ph&&Ph.id==='gate'&&!st.gateOpen&&(st.round%3===2||st.meter<=1))return 'gate';
 if(Ph&&Ph.id==='stair'&&st.prev==='whatif')return 'worthless';
 if(Ph&&Ph.id==='lantern'&&st.meter<=1)return 'lanterns';
 var r=roster(st).filter(function(id){return id!==st.prev&&!(Ph&&Ph.id==='gate'&&st.gateOpen&&id==='gate')});return r[Math.floor(rnd()*r.length)]}
function guideReady(st){var Ph=phaseOf(st);return (Ph&&Ph.guide==='auto')||st.cooldown<=0}
/* the spell a guide casts: the counter that fits the current symptom (guided spells included) */
function rightSpell(st){var s=sym(st.current),Ph=phaseOf(st);if(s.weakTo.indexOf('gratitude')>=0&&(s.id==='lanterns'))return 'gratitude';if(Ph&&Ph.id==='gate'&&s.id==='gate')return 'guidedstep';return s.weakTo[0]}
function turn(st,action,opt){opt=opt||{};var G=Q.guide,s=sym(st.current),Ph=phaseOf(st),out={action:action,symptom:s.id,cleared:0,drain:0,matched:false,hint:null};
 if(action==='guide'){if(!guideReady(st))return {error:'cooldown'};var k=clin(opt.clinician);if(!k)return {error:'noclin'};
  var x=rightSpell(st);out.spell=x;out.clinician=k.id;out.cleared=3;out.drain=0;out.matched=true;out.tip=s.tip;
  if(x==='guidedstep'&&s.id==='gate')st.gateOpen=true;if(x==='gratitude')out.gratitude=true;
  st.helped[x]=(st.helped[x]||0)+1;st.meter-=3;st.cooldown=(Ph&&Ph.guide==='auto')?0:G.cooldownTurns+1}
 else if(action==='rest'){if(st.freeRest&&!st.freeRestUsed){st.freeRestUsed=true;out.drain=0;out.free=true}else out.drain=Math.ceil(s.drain/2);st.resolve=Math.min(st.maxRes,st.resolve+3);out.rested=3}
 else{var S1=sp(action);if(!S1)return {error:'nospell'};if(S1.kind==='guided')return {error:'needsguide'};if(st.lastSpell===action)return {error:'repeat'};
  var match=s.weakTo.indexOf(action)>=0,triple=Ph&&Ph.tripleSpell===action;
  if(match){out.matched=true;out.cleared=S1.base*(triple?3:2);out.drain=0}
  else if(triple){out.cleared=S1.base*3;out.drain=Math.ceil(s.drain/2)}
  else{out.cleared=1;out.drain=Math.ceil(s.drain/2);out.hint=s.guideOnly?'This one is best faced with a guide. Try Call Guide.':(sp(s.weakTo[0]).kind==='guided'?'A guide knows the counter for this one.':'Hint: '+sp(s.weakTo[0]).name+' fits '+s.name+' best.')}
  st.lastSpell=action;st.meter-=out.cleared;if(match)st.helped[action]=(st.helped[action]||0)+1}
 if(Ph&&Ph.id==='gate'&&!st.gateOpen&&st.meter<1){st.meter=1;out.lock='The Closed Gate holds. Only Guided Step Through the Gate opens it, and that takes a guide.'}
 if(Ph&&Ph.id==='lantern'&&st.meter<1&&out.spell!=='gratitude'){st.meter=1;out.lock='The great lantern lights only with the Shared Gratitude Rune, cast with a guide.'}
 st.meter=Math.max(0,st.meter);st.resolve=Math.max(0,st.resolve-out.drain);
 if(Ph&&Ph.freeRestAt&&st.meter<=Ph.freeRestAt&&!st.freeRest){st.freeRest=true;out.rain=true}
 if(action!=='guide'||st.cooldown>0){if(st.cooldown>0)st.cooldown--}
 st.round++;st.prev=st.current;
 if(st.meter<=0)st.over='clear';else if(st.resolve<=0)st.over='rest';
 else if(st.mode==='boss')st.current=draw(st);
 return out}

/* ---------- shell + UI ---------- */
var FOOT='<footer class="qg-foot" role="contentinfo" aria-label="Disclaimer and crisis resources"><p>Educational game, not therapy, diagnosis, or a substitute for care. In crisis or thinking about suicide, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline). In Utah, use the <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT app or safeut.org</a> for 24/7 chat with a licensed counselor. In an emergency, call <a href="tel:911">911</a>.</p><a class="qg-find" href="#match" data-quiz>Find a guide for the real journey</a></footer>';
function shell(){dlg=document.createElement('dialog');dlg.className='qg';dlg.setAttribute('aria-labelledby','qg-title');
 dlg.innerHTML='<button class="qg-x" type="button" aria-label="Close the game">✕</button><button class="qg-help-btn" type="button" data-help aria-haspopup="true">How to play</button><div class="qg-body"></div><section class="qg-panel" hidden aria-labelledby="qg-ph"></section><p class="qg-live sr" aria-live="polite"></p>'+FOOT;
 document.body.appendChild(dlg);
 dlg.querySelector('.qg-x').onclick=close;dlg.querySelector('[data-help]').onclick=function(){panel('<h2 id="qg-ph">How to play</h2>'+HOWTO())};
 dlg.addEventListener('cancel',function(e){e.preventDefault();if(!dlg.querySelector('.qg-panel').hidden)return unpanel();close()});
 dlg.addEventListener('close',stopLoop);
 dlg.addEventListener('keydown',key);dlg.addEventListener('keyup',function(e){var d=KEYS[e.key];if(d&&held===d)held=null});
 dlg.addEventListener('click',function(e){var a=e.target.closest('[data-quiz]');if(a){e.preventDefault();close();var i=[].slice.call(document.querySelectorAll('.chapter')).findIndex(function(c){return c.id==='match'});if(window.obcTurnTo&&i>=0)obcTurnTo(i);else location.hash='#match'}})}
var KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
function key(e){if(SCENE!=='map'||!dlg.querySelector('.qg-panel').hidden)return;var t=e.target;if(t&&/INPUT|TEXTAREA/.test(t.tagName))return;var d=KEYS[e.key];if(!d)return;e.preventDefault();held=d;step(d)}
function HOWTO(){return '<ul class="qg-how">'+
 '<li><b>Walk</b> with the arrow keys or WASD, or the on-screen pad. The gray Fog Fields (west) hold low-mood symptoms; the blue Storm Ridge (east) holds anxious ones. The castle door at the top is the Fogstorm.</li>'+
 '<li><b>Touch a cloud</b> to start a battle. Symptoms are the weather, never you.</li>'+
 '<li><b>Resolve</b> is your HP. Symptoms drain it a little each turn. If it runs out, you go to Rest and Regroup with no penalty. The Open Book office (the red-roofed house) restores it.</li>'+
 '<li><b>Spells</b> are real coping skills. The right spell for the symptom deals double and blocks the drain. Any other spell still does 1, plus a hint. You can\'t cast the same spell twice in a row.</li>'+
 '<li><b>Call Guide</b> lets you pick any Open Book clinician. They cast the right spell for you, free: it costs no Resolve and deals 3 HP, with a short tip about the real skill. Then they rest for '+Q.guide.cooldownTurns+' turns. Gratitude and Guided Step are only cast with a guide.</li>'+
 '<li><b>Rest</b> restores 3 Resolve; the symptom still drains a little.</li></ul><p class="qg-small">Win a battle to gain experience. Every 2 wins raise your level and max Resolve. Progress stays in this browser only.</p>'}
function panel(h){var pn=dlg.querySelector('.qg-panel'),b=dlg.querySelector('.qg-body');pn._ret=document.activeElement;pn.innerHTML=h+'<div class="qg-row"><button type="button" class="qg-btn" data-unpanel>Back to the game</button></div>';b.hidden=true;pn.hidden=false;pn.querySelector('[data-unpanel]').onclick=unpanel;var f=pn.querySelector('h2');f.setAttribute('tabindex','-1');f.focus()}
function unpanel(){var pn=dlg.querySelector('.qg-panel');if(pn.hidden)return;pn.hidden=true;dlg.querySelector('.qg-body').hidden=false;var r=pn._ret;if(r&&r.isConnected&&dlg.contains(r))r.focus();else{var h=dlg.querySelector('.qg-body h2');h&&h.focus()}}
function body(h,focusSel){var b=dlg.querySelector('.qg-body');b.innerHTML=h;var f=focusSel===false?null:b.querySelector(focusSel||'h2');if(f){if(!/BUTTON|A/.test(f.tagName))f.setAttribute('tabindex','-1');f.focus()}}
function say(t){var l=dlg&&dlg.querySelector('.qg-live');if(!l)return;l.textContent='';setTimeout(function(){l.textContent=t},30)}
function toast(t){var b=dlg.querySelector('.qg-toast');if(!b)return;b.textContent=t;b.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){b.classList.remove('on')},1800)}
function close(){if(dlg&&dlg.open)dlg.close();stopLoop();var b=$('#qg-open');b&&b.focus()}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;held=null}
function loop(draw1){stopLoop();var cv=dlg.querySelector('canvas.qg-cv');if(!cv)return;var c=cv.getContext('2d');c.imageSmoothingEnabled=false;var last=performance.now();
 (function f(t){var dt=Math.min(64,t-last);last=t;if(!dlg.open||!cv.isConnected){raf=0;return}draw1(c,t,dt);drawParts(c,dt);raf=requestAnimationFrame(f)})(last)}
function burst(x,y,col,n){if(RM)return;for(var i=0;i<n;i++){var a=Math.random()*6.283,v=.04+Math.random()*.08;PARTS.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:600,c:col})}}
function drawParts(c,dt){PARTS=PARTS.filter(function(p){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.l<=0)return false;c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);return true});
 FLO=FLO.filter(function(f){f.l-=dt;if(f.l<=0)return false;c.font='bold 12px ui-monospace,Menlo,Consolas,monospace';c.fillStyle='#1a1a2b';c.fillText(f.t,f.x+1,f.y+1-(RM?0:(900-f.l)/40));c.fillStyle=f.c;c.fillText(f.t,f.x,f.y-(RM?0:(900-f.l)/40));return true})}

/* ---------- scenes ---------- */
function title(){SCENE='title';stopLoop();var p=prog(),has=p.x!=null;dlg.dataset.scene='title';
 body('<div class="qg-title-card"><canvas class="qg-cv qg-title-cv" width="160" height="56" aria-hidden="true"></canvas><h2 id="qg-title">The Fogstorm</h2><p class="qg-sub">A tiny retro RPG about coping skills</p></div>'+
 '<p class="qg-lede">Walk the valley, meet symptom clouds, and clear them with real coping skills. When you need help, call one of the Open Book clinicians as your guide.</p>'+
 '<div class="qg-menu"><button type="button" class="qg-btn" data-go="play">'+(has?'Continue':'New game')+(has?' <small>Lv '+level(p)+' · '+((p.cleared||[]).length)+' of '+SPAWN.length+' clouds cleared'+(p.phase?' · castle phase '+(p.phase+1):'')+'</small>':'')+'</button><button type="button" class="qg-btn" data-go="how">How to play</button><button type="button" class="qg-btn" data-go="practice">Practice a spell <small>read the real steps</small></button></div>'+
 '<p class="qg-small">Progress is saved only in this browser. Nothing is sent to the practice. <button type="button" class="qg-link" data-go="reset">Reset my game</button></p>',has?'[data-go=play]':'h2');
 var cv=dlg.querySelector('.qg-title-cv'),c=cv.getContext('2d');(function d(t){if(!cv.isConnected||SCENE!=='title')return;c.clearRect(0,0,160,56);c.fillStyle='#24344a';c.fillRect(0,40,160,16);px(c,CLOUD,FOGPAL,92,8+(RM?0:Math.round(Math.sin(t/400))),{s:2});px(c,HERO.side,PAL,40,14,{s:2});if(!RM)raf=requestAnimationFrame(d)})(0);
 dlg.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){var g=b.dataset.go;if(g==='reset'){stopLoop();localStorage.removeItem(KEY);P=null;title();say('Your game was reset.');toast('Game reset')}else if(g==='how')panel('<h2 id="qg-ph">How to play</h2>'+HOWTO());else if(g==='practice')practice();else map()}})}
function hudHtml(){var p=prog();return '<div class="qg-hud" role="status"><span>Lv '+level(p)+'</span><span class="qg-hp" aria-label="Resolve '+P.resolve+' of '+maxRes(p)+'">Resolve <b>'+P.resolve+'</b>/'+maxRes(p)+'<i><em style="width:'+(100*P.resolve/maxRes(p))+'%"></em></i></span><span>Clouds '+((p.cleared||[]).length)+'/'+SPAWN.length+'</span></div>'}
function map(){SCENE='map';dlg.dataset.scene='map';if(!MAP)buildMap();if(!P)newPlayer();spawn();
 body('<h2 id="qg-title" class="sr">The valley map</h2>'+hudHtml()+'<div class="qg-stage"><canvas class="qg-cv qg-map" width="'+MW*TS+'" height="'+MH*TS+'" role="img" aria-label="Top-down pixel map: your traveler, the Fog Fields to the west, the Storm Ridge to the east, the Open Book office in the middle and the castle to the north"></canvas><div class="qg-toast" aria-hidden="true"></div></div>'+
 '<p class="qg-status" id="qg-status"></p><div class="qg-controls"><div class="qg-pad" role="group" aria-label="Move">'+['up','left','right','down'].map(function(d){return '<button type="button" class="qg-d '+d+'" data-dir="'+d+'" aria-label="Walk '+d+'"><span aria-hidden="true">'+{up:'▲',down:'▼',left:'◀',right:'▶'}[d]+'</span></button>'}).join('')+'</div>'+
 '<div class="qg-side"><button type="button" class="qg-btn" data-near>Face the nearest cloud</button><button type="button" class="qg-btn" data-castle>Go to the castle</button><button type="button" class="qg-link" data-menu>Title screen</button></div></div>',false);
 var pad=dlg.querySelectorAll('[data-dir]');pad.forEach(function(b){var d=b.dataset.dir,iv=null;function go(e){e.preventDefault();held=d;step(d)}function stop(){if(held===d)held=null}
  b.addEventListener('pointerdown',go);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);b.addEventListener('click',function(e){if(e.detail===0)step(d)})});
 dlg.querySelector('[data-near]').onclick=function(){var e=nearest();if(e)encounter(e);else say('No clouds left in the fields. Try the castle.')};
 dlg.querySelector('[data-castle]').onclick=bossIntro;dlg.querySelector('[data-menu]').onclick=function(){savePos();title()};
 status();var cvf=dlg.querySelector('.qg-map');cvf.setAttribute('tabindex','0');cvf.focus();loop(drawMap)}
function status(){var el=dlg&&dlg.querySelector('#qg-status');if(!el||!P)return;var z=zone(P.x,P.y),t=tile(P.x,P.y),e=nearest();
 el.textContent=(t==='H'?'At the Open Book office. ':z==='fog'?'In the Fog Fields. ':z==='storm'?'On the Storm Ridge. ':'On the valley path. ')+(e?'Nearest cloud: '+(Math.abs(e.x-P.x)+Math.abs(e.y-P.y))+' steps away.':'All field clouds cleared.')}
function encounter(e){if(SCENE!=='map')return;held=null;savePos();var st=newBattle('enemy',e.weather);st.enemy=e.id;startBattle(st)}
function bossIntro(){if(SCENE==='map')savePos();held=null;var p=prog(),ph=p.phase||0;SCENE='bossintro';stopLoop();var Ph=Q.boss[ph];
 body('<h2 id="qg-title">The Fogstorm over the Castle</h2><p class="qg-lede">The big storm has four phases. '+(ph?'You are on phase '+(ph+1)+' of 4.':'')+'</p><div class="qg-msg"><b>'+esc(Ph.name)+'</b><br>'+esc(Ph.intro)+'</div><div class="qg-menu"><button type="button" class="qg-btn" data-b>Enter '+esc(Ph.name)+'</button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-b]');
 dlg.querySelector('[data-b]').onclick=function(){startBattle(newBattle('boss',null,ph))};dlg.querySelector('[data-m]').onclick=map}
var BA={eFlash:0,pFlash:0,guide:null,gT:0,shake:0};
function startBattle(st){B=st;SCENE='battle';dlg.dataset.scene='battle';BA={eFlash:0,pFlash:0,guide:null,gT:0};var s=sym(B.current);
 battleUI(null,s.name+' rolls in! '+s.flavor);say(s.name+' appears. '+s.flavor+' Choose Spells, Call Guide or Rest.')}
function hpBar(lbl,v,m,cls){return '<div class="qg-bar '+cls+'" role="meter" aria-label="'+esc(lbl)+'" aria-valuemin="0" aria-valuemax="'+m+'" aria-valuenow="'+v+'" aria-valuetext="'+esc(lbl)+' '+v+' of '+m+'"><span>'+esc(lbl)+' <b>'+v+'</b>/'+m+'</span><i><em style="width:'+(100*v/m)+'%"></em></i></div>'}
function battleUI(menu,msg,fsel){var s=sym(B.current),Ph=phaseOf(B),g=guideReady(B);
 var top=Ph?'<p class="qg-phase">'+esc(Ph.name)+' · Castle phase '+(B.phase+1)+' of 4'+(B.freeRest&&!B.freeRestUsed?' · next Rest is free':'')+'</p>':'';
 var m='';
 if(menu==='spells')m='<div class="qg-list" role="group" aria-label="Spells">'+Q.spells.map(function(x){var g1=x.kind==='guided',rep=B.lastSpell===x.id;return '<button type="button" class="qg-btn sp'+(g1?' locked':'')+'" data-spell="'+x.id+'"'+((g1||rep)?' aria-disabled="true"':'')+'>'+esc(x.name.replace(' (solo)',''))+'<small>'+(g1?'Only with a guide':rep?'Just cast':'Solo')+'</small></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';
 else if(menu==='guides')m='<p class="qg-small">Choose who helps. They cast the right spell for '+esc(s.name)+': no Resolve cost, 3 HP. Portraits are stylized pixel art, not likenesses.</p><div class="qg-list guides" role="group" aria-label="Open Book clinicians">'+clins().map(function(k){return '<button type="button" class="qg-btn gd" data-clin="'+k.id+'"><canvas width="12" height="12" data-face="'+k.id+'" aria-hidden="true"></canvas><span>'+esc(k.name)+'<small>'+esc(k.cred)+((k.settings||[]).join()==='telehealth'?' · telehealth only':'')+'</small></span></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';
 else m='<div class="qg-cmd" role="group" aria-label="Battle commands"><button type="button" class="qg-btn" data-m="spells">Spells</button><button type="button" class="qg-btn" data-m="guides"'+(g?'':' aria-disabled="true"')+'>Call Guide<small>'+(g?'free · 3 HP':'resting '+B.cooldown+' turn'+(B.cooldown>1?'s':''))+'</small></button><button type="button" class="qg-btn" data-m="rest">Rest<small>+3 Resolve</small></button></div>';
 body('<h2 id="qg-title" class="qg-bt">'+esc(s.name)+' <small>'+(s.weather==='fog'?'Gray Fog':'Storm Wind')+' symptom</small></h2>'+top+
 '<div class="qg-stage battle"><canvas class="qg-cv qg-bcv" width="320" height="150" role="img" aria-label="Battle: your traveler faces '+esc(s.name)+'"></canvas></div>'+
 '<div class="qg-bars">'+hpBar(s.name+(Ph?' (phase HP)':'')+' HP',B.meter,B.max,'e')+hpBar('Your Resolve',B.resolve,B.maxRes,'p')+'</div>'+
 '<div class="qg-msg" id="qg-msg">'+msg+'</div>'+m,fsel||(menu?'.qg-list .qg-btn':'.qg-cmd .qg-btn'));
 dlg.querySelectorAll('[data-face]').forEach(function(cv){var c=cv.getContext('2d');px(c,FACE,facePal(cv.dataset.face),0,0)});
 var bk=dlg.querySelector('[data-back]');bk&&(bk.onclick=function(){battleUI(null,msg)});
 dlg.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var k=b.dataset.m;if(b.getAttribute('aria-disabled')){say('Your guides are resting for '+B.cooldown+' more turn'+(B.cooldown>1?'s':'')+'. Try a spell or Rest.');return}if(k==='rest')return act('rest');battleUI(k,msg)}});
 dlg.querySelectorAll('[data-spell]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled')){say(b.querySelector('small').textContent==='Just cast'?'You just cast that. Try another spell.':'That spell is only cast with a guide. Use Call Guide.');return}act(b.dataset.spell)}});
 dlg.querySelectorAll('[data-clin]').forEach(function(b){b.onclick=function(){act('guide',{clinician:b.dataset.clin})}});
 loop(drawBattle)}
function drawBattle(c,t,dt){var s=sym(B.current),boss=B.mode==='boss';
 c.fillStyle=s.weather==='fog'?'#5d666b':'#2c3d52';c.fillRect(0,0,320,150);c.fillStyle=s.weather==='fog'?'#7f9a7e':'#7d8d99';c.fillRect(0,108,320,42);
 c.fillStyle=s.weather==='fog'?'#6b856b':'#66747f';for(var i=0;i<320;i+=24)c.fillRect(i+((i/24)%2)*8,116+((i/24)%3)*8,4,2);
 if(boss){c.fillStyle='#3a3c47';c.fillRect(230,40,70,70);c.fillRect(222,30,14,80);c.fillRect(294,30,14,80);c.fillStyle='#14141c';c.fillRect(256,80,18,30)}
 c.fillStyle='rgba(0,0,0,.25)';c.fillRect(196,104,72,6);c.fillRect(36,128,56,6);
 if(BA.eFlash>0)BA.eFlash-=dt;if(BA.pFlash>0)BA.pFlash-=dt;
 var bob=RM?0:Math.round(Math.sin(t/350)*2),ef=BA.eFlash>0&&Math.floor(BA.eFlash/80)%2===0,pf=BA.pFlash>0&&Math.floor(BA.pFlash/80)%2===0;
 px(c,CLOUD,boss?BOSSPAL:s.weather==='fog'?FOGPAL:STORMPAL,boss?190:204,(boss?14:44)+bob,{s:boss?6:4,flash:ef});
 if(!RM&&s.weather==='storm'){c.fillStyle='rgba(143,176,201,.6)';for(var j=0;j<14;j++)c.fillRect((j*23+t/6)%320,(j*31+t/2)%108,1,4)}
 var ib=RM?0:(Math.floor(t/450)%2);px(c,HERO.side,PAL,40,72+ib,{s:4,flash:pf});
 if(BA.guide){BA.gT-=dt;if(BA.gT<=0)BA.guide=null;else{var a=RM?1:Math.min(1,(1800-BA.gT)/250,BA.gT/300);c.globalAlpha=Math.max(0,a);px(c,FACE,facePal(BA.guide),104,70,{s:3});c.globalAlpha=1}}}
function act(a,opt){var s=sym(B.current),r=turn(B,a,opt);if(r.error){say({cooldown:'Your guides are resting. Try a spell or Rest.',needsguide:'That spell is only cast with a guide.',repeat:'You just cast that. Try another spell.'}[r.error]||'Not available.');return}
 var p=prog();p.practiced=p.practiced||{};var used=r.spell||a;if(a!=='rest')p.practiced[used]=(p.practiced[used]||0)+1;saveProg(p);
 var x=sp(r.spell||a),k=r.clinician&&clin(r.clinician),line='';
 if(k)line='<b>'+esc(k.name)+', '+esc(k.cred)+'</b> casts <b>'+esc(x.name.replace(' (solo)',''))+'</b> with you. '+(r.gratitude?'First they name how heavy this is. Then you can name one small good thing, or just say "not today." Both count. ':'')+'<b>3 damage</b>, no Resolve spent.<br><span class="qg-tip">Tip: '+esc(r.tip)+'</span>';
 else if(a==='rest')line='You rest and recover 3 Resolve.'+(r.free?' The storm rains, so nothing drains this turn.':'');
 else line='You cast <b>'+esc(x.name.replace(' (solo)',''))+'</b>. '+(r.matched?'<b>It fits!</b> '+r.cleared+' damage. '+esc(x.fits||''):'Partial fit: '+r.cleared+' damage. '+esc(r.hint||''));
 if(r.drain)line+='<br>'+esc(s.name)+' drains '+r.drain+' Resolve.';else if(a!=='rest'||r.free)line+='<br>'+esc(s.name)+' can\'t drain you this turn.';else line+='<br>'+esc(s.name)+' drains nothing.';
 if(r.lock)line+='<br><em>'+esc(r.lock)+'</em>';if(r.rain)line+='<br><em>The storm rains: your next Rest is free.</em>';
 if(window.obcSound){try{if(r.matched)obcSound.chime(2)}catch(e){}}
 if(P)P.resolve=B.resolve;
 BA.eFlash=r.cleared?400:0;BA.pFlash=r.drain?400:0;if(k){BA.guide=k.id;BA.gT=1800;burst(128,86,'#f3c95a',16)}
 if(r.cleared){burst(232,70,r.matched?'#fff3c4':'#c9cfd2',r.matched?18:6);FLO.push({t:'-'+r.cleared,x:236,y:40,l:900,c:'#fff3c4'})}
 if(r.drain)FLO.push({t:'-'+r.drain,x:56,y:70,l:900,c:'#f08a8a'});if(r.rested)FLO.push({t:'+3',x:76,y:70,l:900,c:'#9fe0a8'});
 if(B.over==='clear')return setTimeout(function(){won(line)},RM?0:650);
 if(B.over==='rest')return setTimeout(regroup,RM?0:650);
 var next=sym(B.current);if(B.mode==='boss'&&next.id!==s.id)line+='<br>The storm shifts: <b>'+esc(next.name)+'</b>. '+esc(next.flavor);
 battleUI(null,line,'#qg-msg');var m=dlg.querySelector('#qg-msg');m&&m.setAttribute('tabindex','-1');say(dlg.querySelector('#qg-msg').textContent)}
function merge(a,b){a=a||{};for(var k in b)a[k]=(a[k]||0)+b[k];return a}
function won(line){var p=prog();p.helped=merge(p.helped,B.helped);
 if(B.kind==='enemy'){var before=level(p);p.cleared=(p.cleared||[]).concat([B.enemy]);p.xp=(p.xp||0)+1;var up=level(p)>before;p.resolve=Math.min(maxRes(p),B.resolve+(up?2:0));P.resolve=p.resolve;saveProg(p);ENEMIES=ENEMIES.filter(function(e){return e.id!==B.enemy});var s=sym(B.current);SCENE='won';stopLoop();
  body('<h2 id="qg-title">'+esc(s.name)+' clears!</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">+1 experience.'+(up?' <b>Level up!</b> You are now level '+level(p)+' with '+maxRes(p)+' max Resolve.':'')+'</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-m]');
  if(window.obcSound){try{obcSound.chime(3)}catch(e){}}dlg.querySelector('[data-m]').onclick=map;return}
 var Ph=Q.boss[B.phase];P.resolve=B.resolve;
 if(B.phase<3){p.phase=B.phase+1;p.resolve=B.resolve;saveProg(p);SCENE='won';stopLoop();var n=Q.boss[B.phase+1];
  body('<h2 id="qg-title">'+esc(Ph.name)+': cleared</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">'+esc(Ph.outro)+'</p><div class="qg-msg"><b>Next: '+esc(n.name)+'</b><br>'+esc(n.intro)+'</div><div class="qg-menu"><button type="button" class="qg-btn" data-n>Continue</button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-n]');
  dlg.querySelector('[data-n]').onclick=function(){startBattle(newBattle('boss',null,B.phase+1))};dlg.querySelector('[data-m]').onclick=map;return}
 p.wins=(p.wins||0)+1;p.phase=0;p.cleared=[];p.resolve=maxRes(p);P.resolve=p.resolve;saveProg(p);victory(line)}
function victory(line){SCENE='victory';stopLoop();var top=Object.keys(B.helped).sort(function(a,b){return B.helped[b]-B.helped[a]}).slice(0,3),got=BONUS.indexOf('gratitude')>=0;
 body('<h2 id="qg-title">The castle is yours again</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">The Fogstorm lifts. The weather will roll back in some days, and the clouds return to the fields. You carry the spells, and you know guides can walk with you.</p>'+
 '<section class="qg-skill" aria-label="Your skill card"><h3>Spells that helped most</h3>'+(top.length?'<ul>'+top.map(function(id){var x=sp(id);return '<li><b>'+esc(x.name)+'</b>: '+esc(x.steps.join(' '))+'</li>'}).join('')+'</ul>':'<p>Every spell you tried counts.</p>')+'</section>'+
 '<div class="qg-row"><button type="button" class="qg-btn" data-print>Print my skill card</button><button type="button" class="qg-btn" data-again>Back to the map</button></div>'+
 '<p class="qg-small">Have you found all five hidden runes in the book? They reveal a code word for the office.</p>'+
 '<button type="button" class="qg-rune'+(got?' found':'')+'" aria-label="'+(got?'Bonus Gratitude Rune, found':'A faint rune glows on the castle wall. Touch the Gratitude Rune')+'" aria-pressed="'+got+'">ᚷ</button>');
 dlg.querySelector('[data-print]').onclick=printCard;dlg.querySelector('[data-again]').onclick=map;
 var rn=dlg.querySelector('.qg-rune');rn.onclick=function(){if(BONUS.indexOf('gratitude')<0)BONUS.push('gratitude');rn.classList.add('found');rn.setAttribute('aria-pressed','true');rn.setAttribute('aria-label','Bonus Gratitude Rune, found');hud();say('Bonus rune found: the Gratitude Rune. It is separate from the five hidden runes.');try{obcSound.chime(3)}catch(e){}}}
function printCard(){var c=dlg.querySelector('.qg-skill').innerHTML,w=window.open('','_blank');if(!w)return;w.document.write('<title>My skill card</title><body style="font-family:Georgia,serif;max-width:560px;margin:24px auto">'+c+'<p style="font-size:.85em">Educational game, not therapy. Crisis: call or text 988. Utah: SafeUT (safeut.org). Emergency: 911.</p></body>');w.document.close();w.focus();w.print()}
function regroup(){var p=prog();p.helped=merge(p.helped,B.helped);p.resolve=maxRes(p);p.x=OFFICE.x+1;p.y=OFFICE.y;saveProg(p);P=null;newPlayer();SCENE='regroup';stopLoop();var boss=B.mode==='boss';
 body('<h2 id="qg-title">Rest and Regroup</h2><p class="qg-lede">Even the bravest travelers rest. The weather isn\'t your fault, and resting isn\'t losing. You wake up by the Open Book office with full Resolve. Nothing is lost'+(boss?'; the castle waits at the same phase.':'.')+'</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button><button type="button" class="qg-btn" data-p>Practice a spell</button><a class="qg-btn qg-menu-a" href="#match" data-quiz>Talk to a real guide</a></div>','[data-m]');
 dlg.querySelector('[data-m]').onclick=map;dlg.querySelector('[data-p]').onclick=practice}
function practice(){SCENE='practice';stopLoop();body('<h2 id="qg-title">Practice a spell</h2><p>No battles here. Read each spell\'s real steps at your own pace.</p><div class="qg-pracs">'+Q.spells.map(function(x){return '<details class="qg-prac"><summary>'+esc(x.name)+(x.kind==='guided'?' (with a guide)':'')+'</summary><ol>'+x.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p class="qg-small">'+esc(x.source)+'</p></details>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back to the title screen</button></div>');dlg.querySelector('[data-back]').onclick=title}
function hud(){var h=$('#runes-hud');if(!h)return;var b=BONUS.indexOf('gratitude')>=0,el=$('#qg-bonus');if(b&&!el){el=document.createElement('span');el.id='qg-bonus';el.className='qg-bonus';el.textContent=' · Bonus rune: Gratitude ✓';h.appendChild(el)}}
function open(){var b=$('#qg-open');b&&b.setAttribute('aria-busy','true');return load().then(function(){if(!dlg)shell();b&&b.removeAttribute('aria-busy');if(!dlg.open)dlg.showModal();title()})}
function init(){var b=$('#qg-open');if(b)b.addEventListener('click',open);hud()}
window.obcQuest={open:open,map:map,title:title,step:step,turn:turn,newBattle:newBattle,draw:draw,rightSpell:rightSpell,encounter:function(id){var e=ENEMIES.find(function(x){return x.id===id})||ENEMIES[0];e&&encounter(e)},boss:function(ph){var p=prog();p.phase=ph||0;saveProg(p);startBattle(newBattle('boss',null,ph||0))},act:function(a,o){act(a,o)},
 get battle(){return B},get player(){return P},get scene(){return SCENE},get enemies(){return ENEMIES},rows:ROWS,load:load};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
