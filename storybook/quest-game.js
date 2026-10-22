/* Conquering Anxiety & Depression: an educational mini-game. Not therapy. Lazy: data + CSS load on first open. */
(function(){'use strict';
var KEY='obc_quest_v1',BKEY='obc_bonus_runes',Q=null,dlg=null,S=null,MODE=null,loading=null;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){if(Q)return Promise.resolve();if(loading)return loading;
 loading=new Promise(function(ok,no){var l=document.createElement('link');l.rel='stylesheet';l.href='quest-game.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='../shared/quest-data.js';s.onload=function(){Q=window.OBC_QUEST;ok()};s.onerror=no;document.head.appendChild(s)});return loading}
function prog(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}}
function saveProg(p){try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var BONUS=[];/* bonus rune lives in memory only: resets every visit */
function bonus(){return BONUS}
function sym(id){return Q.symptoms.find(function(x){return x.id===id})}
function sp(id){return Q.spells.find(function(x){return x.id===id})}

/* ---------- pure turn math ---------- */
function newState(mode,phaseIdx){var G=Q.guide,st={comp:null,mode:mode,phase:phaseIdx||0,resolve:20,meter:20,max:20,lastSpell:null,current:null,prev:null,round:0,
  guide:{present:false,turnsLeft:0,cooldown:0},gateOpen:false,freeRest:false,freeRestUsed:false,value:'',helped:{},log:[],over:null};
 if(mode==='boss'){var P=Q.boss[st.phase];st.meter=st.max=P.meter;if(P.guide==='cooldown-start')st.guide.cooldown=G.cooldownTurns;if(P.guide==='auto'){st.guide.present=true;st.guide.turnsLeft=99}}
 if(mode==='story'){st.meter=st.max=12}
 return st}
function roster(st){if(st.mode==='story')return Q.symptoms.map(function(s){return s.id});if(st.mode==='fog'||st.mode==='storm')return Q.symptoms.filter(function(s){return s.weather===st.mode&&!(s.guideOnly&&false)}).map(function(s){return s.id});
 var P=Q.boss[st.phase];if(P.roster)return P.roster.slice();
 var w=P.id==='stair'?(st.round%2?'fog':'storm'):null;return Q.symptoms.filter(function(s){return (!w||s.weather===w)&&!s.guideOnly}).map(function(s){return s.id})}
function draw(st,rnd){rnd=rnd||Math.random;var P=st.mode==='boss'?Q.boss[st.phase]:null;
 if(P&&P.id==='gate'&&!st.gateOpen&&(st.round%3===2||st.meter<=1))return 'gate';
 if(P&&P.id==='stair'&&st.prev==='whatif')return 'worthless';
 if(P&&P.id==='lantern'&&st.meter<=1)return 'lanterns';
 var r=roster(st).filter(function(id){return id!==st.prev&&!(P&&P.id==='gate'&&st.gateOpen&&id==='gate')});return r[Math.floor(rnd()*r.length)]}
/* named companions (consent:true). Name, cred and settings come from OBC.clinicians so they never drift. */
function comp(id){if(!id||!Q)return null;var c=Q.companions.find(function(x){return x.id===id});if(!c||!c.consent)return null;
 var k=((window.OBC&&OBC.clinicians)||[]).find(function(x){return x.id===id});if(!k)return null;
 return {id:id,name:k.name,cred:k.cred,first:k.name.split(' ')[0],tele:(k.settings||[]).join()==='telehealth',storyline:c.storyline,summon:c.summon,bonus:c.bonus||{},c:c}}
function guideBonus(st,spellId){var c=comp(st.comp);if(!c||!st.guide.present)return 0;var b=c.bonus[spellId]||0;
 if(spellId==='selfkind'&&st.current==='worthless'&&c.bonus.selfkindVsWorthless)b+=c.bonus.selfkindVsWorthless;return b}
function sessTurns(st){var c=comp(st.comp);return (c&&c.c.sessionTurns)||Q.guide.sessionTurns}
function resolveTurn(st,action,opt){opt=opt||{};var G=Q.guide,s=sym(st.current),P=st.mode==='boss'?Q.boss[st.phase]:null,g=st.guide,out={action:action,symptom:s.id,cleared:0,drain:0,matched:false,hint:null,msg:''};
 var present=g.present;
 if(action==='summon'){if(present||g.cooldown>0)return {error:'unavailable'};g.present=true;g.turnsLeft=sessTurns(st);out.drain=Math.max(0,s.drain-G.drainReduce);out.msg=G.summonLines[0];out.summoned=true}
 else if(action==='rest'){if(st.freeRest&&!st.freeRestUsed){st.freeRestUsed=true;out.drain=0;out.msg='The storm rains. You rest, and nothing is lost.'}else{out.drain=Math.max(0,s.drain-(present?G.drainReduce:0));out.msg='You pause to rest. Resting is allowed.'}
  st.resolve=Math.min(20,st.resolve+3);out.rested=3}
 else{var S1=sp(action);if(!S1)return {error:'nospell'};if(S1.kind==='guided'&&!present)return {error:'needsguide'};if(st.lastSpell===action)return {error:'repeat'};
  var match=s.weakTo.indexOf(action)>=0;
  if(action==='gratitude'&&s.id==='lanterns')match=true;
  if(match){out.matched=true;var mult=(P&&P.tripleSpell===action)?3:2;out.cleared=S1.base*mult+(present?G.matchBonus:0)+guideBonus(st,action);out.drain=0}
  else if(P&&P.tripleSpell===action){out.cleared=S1.base*3+(present?G.matchBonus:0)+guideBonus(st,action);out.drain=Math.max(0,Math.ceil(s.drain/2)-(present?G.drainReduce:0))}
  else{out.cleared=(present?G.mismatchClear:1)+guideBonus(st,action);out.drain=Math.max(0,Math.ceil(s.drain/2)-(present?G.drainReduce:0));var cc=comp(st.comp);if(cc&&present&&action==='guidedstep'&&cc.c.gateNoDrainOnMiss)out.drain=0;
   out.hint=s.guideOnly?'This gate is easier with your Guide beside you.':'Hint: '+sp(s.weakTo[0]).name+' fits this weather best.'}
  if(action==='guidedstep'&&s.id==='gate')st.gateOpen=true;
  if(action==='gratitude'){out.gratitude=opt.choice==='notToday'?'notToday':'named';out.msg=opt.choice==='notToday'?'"Not today" counts. You stayed with it together.':'One small glow, named together.'}
  st.lastSpell=action;st.meter-=out.cleared;if(out.matched)st.helped[action]=(st.helped[action]||0)+1}
 /* phase locks */
 if(P&&P.id==='gate'&&!st.gateOpen&&st.meter<1){st.meter=1;out.lock='The Closed Gate still stands. It opens only with Guided Step Through the Gate.'}
 if(P&&P.id==='lantern'&&st.meter<1&&action!=='gratitude'){st.meter=1;out.lock='The great lantern lights only with the Shared Gratitude Rune.'}
 st.meter=Math.max(0,st.meter);st.resolve=Math.max(0,st.resolve-out.drain);
 if(P&&P.freeRestAt&&st.meter<=P.freeRestAt&&!st.freeRest){st.freeRest=true;out.rain=true}
 /* guide tick */
 if(present&&!out.summoned&&g.turnsLeft<99){g.turnsLeft--;if(g.turnsLeft<=0){g.present=false;g.cooldown=G.cooldownTurns;out.left=G.leaveLines[0]}}
 else if(!present&&!out.summoned&&g.cooldown>0)g.cooldown--;
 st.round++;st.prev=st.current;
 if(st.meter<=0)st.over='clear';else if(st.resolve<=0)st.over='rest';
 st.log.push(out);return out}

/* ---------- UI ---------- */
var FOOT='<footer class="qg-foot" role="contentinfo" aria-label="Disclaimer and crisis resources"><p>This is an educational game, not therapy, diagnosis, or a substitute for care. If you are in crisis or thinking about suicide, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline). In Utah, you can also use the <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT app or safeut.org</a> for 24/7 chat with a licensed counselor. In an emergency, call <a href="tel:911">911</a>.</p><a class="qg-find" href="#match" data-quiz>Find a guide for the real journey</a></footer>';
function shell(){dlg=document.createElement('dialog');dlg.className='qg';dlg.setAttribute('aria-labelledby','qg-title');
 dlg.innerHTML='<div class="qg-sky" aria-hidden="true"><i class="fog f1"></i><i class="fog f2"></i><i class="wind"></i><i class="sun"></i></div><button class="qg-x" type="button" aria-label="Close the game">✕</button><div class="qg-body"></div>'+FOOT;
 document.body.appendChild(dlg);
 dlg.querySelector('.qg-x').onclick=close;dlg.addEventListener('cancel',function(e){e.preventDefault();close()});
 dlg.addEventListener('click',function(e){var a=e.target.closest('[data-quiz]');if(a){e.preventDefault();close();var i=[].slice.call(document.querySelectorAll('.chapter')).findIndex(function(c){return c.id==='match'});if(window.obcTurnTo&&i>=0)obcTurnTo(i);else location.hash='#match';}})}
function close(){if(dlg&&dlg.open)dlg.close();var b=$('#qg-open');b&&b.focus()}
function body(h,focusSel){var b=dlg.querySelector('.qg-body');b.innerHTML=h;var f=b.querySelector(focusSel||'h2');if(f){f.setAttribute('tabindex','-1');f.focus()}}
function sky(){if(!S)return;var pct=S.max?S.meter/S.max:0;dlg.style.setProperty('--fog',pct.toFixed(2));dlg.dataset.weather=S.mode==='boss'?Q.boss[S.phase].weather:S.mode}
function title(){var p=prog();dlg.style.setProperty('--fog','1');dlg.dataset.weather='both';
 body('<h2 id="qg-title">Conquering Anxiety &amp; Depression</h2><p class="qg-lede">Symptoms are weather: fog, wind and storms that roll over the land. You are a traveler finding your way through, never fighting yourself. Each spell is a real coping skill. Different skills help different people.</p>'+
 '<div class="qg-menu"><button type="button" data-go="fog">Walk through the Gray Fog <small>depression symptoms · practice</small></button><button type="button" data-go="storm">Walk through the Storm Wind <small>anxiety symptoms · practice</small></button><button type="button" data-go="boss">The Fogstorm over the Castle <small>four phases'+(p.phase?' · resume at phase '+(p.phase+1):'')+'</small></button><button type="button" data-go="stories">Companion storylines <small>six short side-quests, one with each Open Book guide</small></button><button type="button" data-go="practice">Practice a spell <small>read the real steps, no weather</small></button></div>'+
 '<p class="qg-small">Progress is saved only in this browser. Nothing is sent to the practice. <button type="button" class="qg-link" data-go="reset">Reset my game</button></p>');
 dlg.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){var g=b.dataset.go;if(g==='reset'){localStorage.removeItem(KEY);title();say('Your game was reset.')}else if(g==='practice')practice();else if(g==='stories')stories();else if(g==='boss'&&!(prog().phase))pick();else start(g,g==='boss'?(prog().phase||0):0)}})}
function guideName(){var c=comp(S&&S.comp);return c?c.name+', '+c.cred:'Your Guide'}
function quizTop(){var el=$('#results .ranked li strong');if(!el)return null;var t=el.textContent;var k=((window.OBC&&OBC.clinicians)||[]).find(function(x){return t.indexOf(x.name)>=0});return k?k.id:null}
function stories(){var p=prog(),met=p.met||{};
 body('<h2 id="qg-title">Companion storylines</h2><p class="qg-lede">Each of Open Book\'s clinicians walks one short storyline with you as a companion guide. Inside a storyline, Call Your Guide becomes that clinician\'s signature summon. Same rules: free, uses your turn, then a short cooldown. These are game stories, not a promise of who will be your therapist.</p><div class="qg-menu">'+
 Q.companions.map(function(x){var c=comp(x.id);if(!c)return '';return '<button type="button" data-story="'+c.id+'">'+esc(c.storyline.split(':')[0])+' <small>with '+esc(c.name)+', '+esc(c.cred)+' · signature summon: '+esc(c.summon)+(c.tele?' · Telehealth only (Draper-based)':'')+(met[c.id]?' · walked ✓':'')+'</small></button>'}).join('')+
 '</div><div class="qg-row"><button type="button" class="qg-link" data-back>Back to the title page</button></div>');
 dlg.querySelectorAll('[data-story]').forEach(function(b){b.onclick=function(){start('story',0,false,b.dataset.story)}});dlg.querySelector('[data-back]').onclick=title}
function storyDone(){var c=comp(S.comp),p=prog();p.met=p.met||{};p.met[c.id]=1;p.helped=merge(p.helped,S.helped);saveProg(p);dlg.style.setProperty('--fog','0');
 body('<h2 id="qg-title">'+esc(c.storyline.split(':')[0])+': the sky clears</h2><p class="qg-lede">'+esc(c.storyline)+'. You walked it with '+esc(c.first)+'.</p><article class="qg-card gc" aria-label="Guide card"><p class="qg-tag">Guide card</p><h3>'+esc(c.name)+', '+esc(c.cred)+'</h3><p>Signature summon: '+esc(c.summon)+'.'+(c.tele?' Telehealth only (Draper-based).':'')+'</p><p class="qg-small">Game bonuses are story flavor, not claims about anyone\'s clinical work.</p></article><div class="qg-menu"><a class="qg-menu-a" href="#match" data-quiz>Want to walk with a real guide?</a><button type="button" data-back>Back to the storylines</button></div>');
 dlg.querySelector('[data-back]').onclick=stories}
function pick(){var p=prog(),met=p.met||{},top=quizTop(),ids=Q.companions.filter(function(x){return met[x.id]&&comp(x.id)}).map(function(x){return x.id});
 var sug=top&&ids.indexOf(top)>=0?top:null;
 body('<h2 id="qg-title">Who walks with you?</h2><p class="qg-lede">Before the Outer Gate, choose a companion you\'ve met in their storyline, or the generic Guide. Anyone is fine.</p>'+(top&&!sug?'<p class="qg-small">Your quiz match, '+esc(comp(top)?comp(top).name:'')+', is waiting in their storyline if you\'d like to meet them first.</p>':'')+
 '<div class="qg-menu" role="group" aria-label="Choose a companion"><button type="button" data-pick="">Your Guide <small>no name, no details</small></button>'+ids.map(function(id){var c=comp(id);return '<button type="button" data-pick="'+id+'">'+esc(c.name)+', '+esc(c.cred)+' <small>signature summon: '+esc(c.summon)+(id===sug?' · suggested by your quiz match':'')+'</small></button>'}).join('')+'</div>'+
 (ids.length?'':'<p class="qg-small">Walk a companion storyline to meet a named guide.</p>')+'<div class="qg-row"><button type="button" class="qg-link" data-back>Back to the title page</button></div>');
 dlg.querySelectorAll('[data-pick]').forEach(function(b){b.onclick=function(){start('boss',0,false,b.dataset.pick||null)}});dlg.querySelector('[data-back]').onclick=title}
function say(t){var l=dlg.querySelector('.qg-live');if(!l){l=document.createElement('p');l.className='qg-live sr';l.setAttribute('aria-live','polite');dlg.appendChild(l)}l.textContent='';setTimeout(function(){l.textContent=t},30)}
function start(mode,phase,withGuide,cid){var keep=S&&S.comp;S=newState(mode,phase);MODE=mode;S.comp=cid!==undefined?cid:(mode==='boss'?(prog().comp||null):keep||null);if(mode==='boss'){var pp=prog();pp.comp=S.comp;saveProg(pp)}if(withGuide&&!S.guide.present){S.guide.present=true;S.guide.turnsLeft=sessTurns(S);S.guide.cooldown=0}
 if(mode==='boss'){var p=prog();p.phase=Math.max(p.phase||0,phase);saveProg(p);
  if(Q.boss[phase].id==='lantern'&&!S.value)return askValue()}
 S.current=draw(S);render(null)}
function askValue(){sky();body('<h2 id="qg-title">'+Q.boss[S.phase].name+'</h2><p>'+Q.boss[S.phase].intro+'</p><form class="qg-val"><label for="qg-v">One value that matters to you (optional, stays on this screen)</label><input id="qg-v" maxlength="40" autocomplete="off" placeholder="for example kindness, family, courage"><button type="submit">Enter the Lantern Room</button></form>','#qg-v');
 dlg.querySelector('form').onsubmit=function(e){e.preventDefault();S.value=$('#qg-v').value.trim()||'what matters to you';S.current=draw(S);render(null)}}
function meter(label,v,max,cls){return '<div class="qg-meter '+cls+'" role="meter" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+max+'" aria-valuenow="'+v+'" aria-valuetext="'+label+' '+v+' of '+max+'"><span>'+label+': <b>'+v+'</b>/'+max+'</span><i style="width:'+(100*v/max)+'%"></i></div>'}
function render(res){sky();var s=sym(S.current),P=S.mode==='boss'?Q.boss[S.phase]:null,g=S.guide,G=Q.guide;
 var wname=s.weather==='fog'?'Gray Fog':'Storm Wind',mname=S.mode==='story'?'Weather':S.mode==='fog'?'Fog':S.mode==='storm'?'Storm':(P.weather==='both'?'Fogstorm':P.weather==='fog'?'Fog':'Storm');
 var C=comp(S.comp),GN=C?C.first:'Your Guide';var gtxt=g.present?(g.turnsLeft>=99?GN+' is here for this phase':GN+' is here · session candle: '+g.turnsLeft+' turn'+(g.turnsLeft>1?'s':'')+' left'):g.cooldown>0?G.cooldownLine+' ('+g.cooldown+' turn'+(g.cooldown>1?'s':'')+')':(C?'Call '+C.first+': '+C.summon:'Call Your Guide');
 var spells=Q.spells.map(function(x){var locked=x.kind==='guided'&&!g.present,rep=S.lastSpell===x.id,dis=locked||rep;
  return '<button type="button" class="qg-spell '+x.kind+'" data-spell="'+x.id+'"'+(dis?' aria-disabled="true"':'')+' aria-describedby="qgr-'+x.id+'">'+(x.kind==='guided'?'<span class="duo" aria-hidden="true"></span>':'')+esc(x.name)+'<small id="qgr-'+x.id+'">'+(locked?'🔒 Needs '+(C?C.first:'your Guide'):rep?'Just cast; try another':x.kind==='guided'?'Guided spell':'Solo spell')+'</small></button>'}).join('');
 var last=res?('<div class="qg-result'+(res.matched?' match':'')+'">'+(res.matched?'<b>Match.</b> ':'')+esc(res.msg||'')+(res.cleared?' Cleared '+res.cleared+'.':'')+(res.drain?' The weather drained '+res.drain+' Resolve.':res.action!=='summon'?' No Resolve lost.':'')+(res.rested?' You recovered 3 Resolve.':'')+(res.hint?'<br><em>'+esc(res.hint)+'</em>':'')+(res.lock?'<br><em>'+esc(res.lock)+'</em>':'')+(res.rain?'<br><em>The storm rains: your next Rest is free.</em>':'')+(res.left?'<br>'+esc(GN)+': "'+esc(res.left)+'" <a href="#match" data-quiz>Real guides exist too. Find yours</a>':'')+(res.summoned&&C?'<br>'+esc(C.summon)+': '+esc(C.first)+' joins you.':'')+(res.summoned?'<br><a href="#match" data-quiz>Real guides exist too. Find yours</a>':'')+'</div>'):(P?'<p class="qg-intro">'+esc(P.intro)+'</p>':'');
 body('<h2 id="qg-title">'+(P?esc(P.name):S.mode==='story'?esc(C.storyline.split(':')[0]):(S.mode==='fog'?'The Gray Fog':'The Storm Wind'))+'</h2>'+
 '<div class="qg-meters">'+meter('Resolve',S.resolve,20,'res')+meter(mname,S.meter,S.max,'wx')+'</div>'+last+
 '<article class="qg-card '+s.weather+'" aria-label="The weather casts '+esc(s.name)+'"><p class="qg-tag">'+wname+' casts · drain '+s.drain+(s.guideOnly?' · guided only':'')+'</p><h3>'+esc(s.name)+'</h3><p>'+esc(s.flavor)+'</p></article>'+
 '<div class="qg-guide'+(g.present?' on':'')+'">'+(C?'<p class="qg-small">Companion: '+esc(C.name)+', '+esc(C.cred)+(C.tele?' · through a glowing window (telehealth only)':'')+'</p>':'')+'<button type="button" class="qg-summon" data-act="summon"'+((g.present||g.cooldown>0)?' aria-disabled="true"':'')+'><span class="lantern" aria-hidden="true"></span>'+esc(gtxt)+'<small>'+(g.present?esc(G.summonLines[0]):esc(G.tagline)+' Costs no Resolve.')+'</small></button>'+(S.value?'<p class="qg-small">Your value: '+esc(S.value)+'</p>':'')+'</div>'+
 '<div class="qg-grid" role="group" aria-label="Spells">'+spells+'</div>'+
 '<div class="qg-row"><button type="button" class="qg-rest" data-act="rest">'+(S.freeRest&&!S.freeRestUsed?'Rest in the rain (free)':'Pause to rest (+3 Resolve)')+'</button><button type="button" class="qg-link" data-act="menu">Leave to the title page</button></div>',res?'.qg-result':'h2');
 var b=dlg.querySelector('.qg-body');
 b.querySelectorAll('[data-spell]').forEach(function(x){x.onclick=function(){var id=x.dataset.spell,sp1=sp(id);if(x.getAttribute('aria-disabled')){say(x.querySelector('small').textContent);return}scroll(sp1)}});
 b.querySelector('[data-act=summon]').onclick=function(e){if(e.currentTarget.getAttribute('aria-disabled')){say(gtxt);return}act('summon')};
 b.querySelector('[data-act=rest]').onclick=function(){act('rest')};b.querySelector('[data-act=menu]').onclick=title;
 if(res)say(b.querySelector('.qg-result').textContent+' Next: '+s.name+'.')}
function scroll(x){var s=sym(S.current),tk=x.toolkit?' <a href="#'+x.toolkit+'" class="qg-tk" data-tk="'+x.toolkit+'">Open this charm in the library</a>':'';
 var grat=x.id==='gratitude';
 body('<h2 id="qg-title">'+esc(x.name)+'</h2><p class="qg-flavor">'+esc(x.flavor)+'</p>'+(grat?'<p class="qg-say">'+esc(guideName())+': "This '+(s.weather==='fog'?'fog':'storm')+' is real, and it\'s heavy."</p>':'')+'<ol class="qg-steps">'+x.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p class="qg-small">Source: '+esc(x.source)+'.'+tk+'</p>'+
 (x.id==='guidedstep'?'<p class="qg-small">In the game, this step happens with your Guide. Real exposure work is paced with a therapist.</p>':'')+
 '<p class="qg-small">Try the skill for real if you like, then cast it.</p><div class="qg-row">'+(grat?'<button type="button" data-cast="named">Name one small glow</button>'+((comp(S.comp)||{c:{}}).c.gratitudeLovedOne&&S.guide.present?'<button type="button" data-cast="named">Name a glow with a loved one</button>':'')+'<button type="button" data-cast="notToday">Not today</button>':'<button type="button" data-cast="1">Cast '+esc(x.name)+'</button>')+'<button type="button" class="qg-link" data-back>Back to the weather</button></div>','h2');
 dlg.querySelectorAll('[data-cast]').forEach(function(b){b.onclick=function(){act(x.id,{choice:b.dataset.cast})}});dlg.querySelector('[data-back]').onclick=function(){render(null)};
 var t=dlg.querySelector('[data-tk]');t&&(t.onclick=function(e){e.preventDefault();close();var i=[].slice.call(document.querySelectorAll('.chapter')).findIndex(function(c){return c.id==='toolkit'});window.obcTurnTo&&obcTurnTo(i);setTimeout(function(){var el=document.getElementById(x.toolkit);el&&el.scrollIntoView({block:'center'})},RM?0:900)})}
function act(a,opt){var r=resolveTurn(S,a,opt);if(r.error){say(r.error==='needsguide'?'Needs your Guide.':r.error==='repeat'?'You just cast that. Try another spell.':'Not available right now.');return}
 var p=prog();p.practiced=p.practiced||{};if(a!=='summon'&&a!=='rest')p.practiced[a]=(p.practiced[a]||0)+1;if(a==='summon')p.summons=(p.summons||0)+1;saveProg(p);
 if(window.obcSound){try{if(r.matched)obcSound.chime(2);else if(r.summoned)obcSound.chime(0)}catch(e){}}
 dlg.classList.remove('pulse');void dlg.offsetWidth;if(r.matched||r.summoned)dlg.classList.add('pulse');
 if(S.over==='clear'&&S.mode==='story')return storyDone();if(S.over==='clear')return S.mode==='boss'&&S.phase<3?phaseDone():victory();if(S.over==='rest')return regroup();
 S.current=draw(S);render(r)}
function phaseDone(){var P=Q.boss[S.phase],n=S.phase+1,p=prog();p.phase=Math.max(p.phase||0,n);p.helped=merge(p.helped,S.helped);saveProg(p);sky();
 body('<h2 id="qg-title">'+esc(P.name)+': cleared</h2><p class="qg-lede">'+esc(P.outro)+'</p><div class="qg-row"><button type="button" data-qnext>Continue to '+esc(Q.boss[n].name)+'</button></div>');dlg.querySelector('[data-qnext]').onclick=function(){start('boss',n)}}
function merge(a,b){a=a||{};for(var k in b)a[k]=(a[k]||0)+b[k];return a}
function victory(){var p=prog();p.helped=merge(p.helped,S.helped);if(S.mode==='boss'){p.wins=(p.wins||0)+1;p.phase=0;p.comp=null}saveProg(p);dlg.style.setProperty('--fog','0');dlg.classList.add('won');
 var top=Object.keys(S.helped).sort(function(a,b){return S.helped[b]-S.helped[a]}).slice(0,3);var got=bonus().indexOf('gratitude')>=0;
 var boss=S.mode==='boss';
 body('<h2 id="qg-title">'+(boss?'The castle is yours again':'The sky clears')+'</h2><p class="qg-lede">'+(boss?'The castle is yours again. The weather will return some days. You carry the spells, and you know guides can walk with you.':'The weather will return some days. You carry the spells, and you know guides can walk with you.')+'</p>'+
 (boss?'<div class="qg-castle" aria-hidden="true"><i class="banner b1"></i><i class="banner b2"></i><i class="lamp l1"></i><i class="lamp l2"></i><i class="lamp l3"></i></div>':'')+
 '<section class="qg-skill" aria-label="Your skill card"><h3>Spells that helped most</h3>'+(top.length?'<ul>'+top.map(function(id){var x=sp(id);return '<li><b>'+esc(x.name)+'</b>: '+esc(x.steps.join(' '))+'</li>'}).join('')+'</ul>':'<p>Every spell you tried counts.</p>')+'</section>'+
 '<div class="qg-row"><button type="button" data-print>Print my skill card</button><button type="button" data-again>Play again</button></div>'+
 '<p class="qg-small">Have you found all five hidden runes in the book? They reveal a code word for the office.</p>'+
 (boss?'<button type="button" class="qg-rune'+(got?' found':'')+'" aria-label="'+(got?'Bonus Gratitude Rune, found':'A faint rune glows on the castle wall. Touch the Gratitude Rune')+'" aria-pressed="'+got+'">ᚷ</button>':''));
 dlg.querySelector('[data-print]').onclick=printCard;dlg.querySelector('[data-again]').onclick=function(){dlg.classList.remove('won');title()};
 var rn=dlg.querySelector('.qg-rune');rn&&(rn.onclick=function(){var b=bonus();if(b.indexOf('gratitude')<0)b.push('gratitude');rn.classList.add('found');rn.setAttribute('aria-pressed','true');rn.setAttribute('aria-label','Bonus Gratitude Rune, found');hud();say('Bonus rune found: the Gratitude Rune. It is separate from the five hidden runes.');try{obcSound.chime(3)}catch(e){}})}
function printCard(){var c=dlg.querySelector('.qg-skill').innerHTML,w=window.open('','_blank');if(!w)return;w.document.write('<title>My skill card</title><body style="font-family:Georgia,serif;max-width:560px;margin:24px auto">'+c+'<p style="font-size:.85em">Educational game, not therapy. Crisis: call or text 988. Utah: SafeUT (safeut.org). Emergency: 911.</p></body>');w.document.close();w.focus();w.print()}
function regroup(){var p=prog();p.helped=merge(p.helped,S.helped);saveProg(p);dlg.style.setProperty('--fog','.6');var mode=S.mode,ph=S.phase;
 body('<h2 id="qg-title">Rest and Regroup</h2><p class="qg-lede">Even the bravest travelers rest. The fog isn\'t your fault, and resting isn\'t losing.</p><div class="qg-menu"><button type="button" data-r="again">Try again '+(mode==='boss'?'from this phase':'')+'</button><button type="button" data-r="practice">Practice one spell</button><button type="button" data-r="guide">Try again with your Guide beside you</button><a class="qg-menu-a" href="#match" data-quiz>Talk to a real guide</a></div>');
 dlg.querySelector('[data-r=again]').onclick=function(){start(mode,ph)};dlg.querySelector('[data-r=practice]').onclick=practice;dlg.querySelector('[data-r=guide]').onclick=function(){start(mode,ph,true)}}
function practice(){body('<h2 id="qg-title">Practice a spell</h2><p>No weather here. Read a spell\'s real steps at your own pace.</p><div class="qg-grid">'+Q.spells.map(function(x){return '<details class="qg-prac"><summary>'+esc(x.name)+(x.kind==='guided'?' (guided)':'')+'</summary><ol>'+x.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p class="qg-small">'+esc(x.source)+'</p></details>'}).join('')+'</div><div class="qg-row"><button type="button" data-back>Back to the title page</button></div>');dlg.querySelector('[data-back]').onclick=title}
function hud(){var h=$('#runes-hud');if(!h)return;var b=bonus().indexOf('gratitude')>=0,el=$('#qg-bonus');if(b&&!el){el=document.createElement('span');el.id='qg-bonus';el.className='qg-bonus';el.textContent=' · Bonus rune: Gratitude ✓';h.appendChild(el)}}
function open(){var b=$('#qg-open');b&&b.setAttribute('aria-busy','true');load().then(function(){if(!dlg)shell();b&&b.removeAttribute('aria-busy');if(!dlg.open)dlg.showModal();title()})}
function init(){var b=$('#qg-open');if(b)b.addEventListener('click',open);hud()}
window.obcQuest={comp:comp,start:start,open:open,resolveTurn:resolveTurn,newState:newState,draw:draw,get state(){return S},set state(v){S=v},act:function(a,o){act(a,o)},render:function(){render(null)},load:load};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
