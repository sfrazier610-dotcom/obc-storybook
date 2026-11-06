/* Phase 3 — opt-in hearth.
   Fireplace bed + page-turn, using storybook/audio/fireplace.* and page-turn.*.
   Default off. Never starts on load, and never on a chapter change until the
   visitor has turned it on during this visit.
   localStorage key: obcSbHearth ("1" chosen, "0" or absent off).
   The saved choice does not play by itself on the next visit; the control
   offers "Hearth sound: resume" and stays silent until pressed.
   Calm mode and prefers-reduced-motion force silence and disable the control.
   This is not legacy sound.js. */
(function(){
'use strict';
var KEY='obcSbHearth';
var VOL=0.11;
var PAGE_VOL=0.2;
var H=document.documentElement;
var btn,fa,fb,page,which=0,playing=false,watch=0,EXT;
function ext(){
  var a=document.createElement('audio');
  return a.canPlayType('audio/ogg; codecs="vorbis"')?'ogg':'mp3';
}
EXT=ext();
function still(){
  return H.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function saved(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
function store(on){try{localStorage.setItem(KEY,on?'1':'0')}catch(e){}}
function label(long,short,pressed,title){
  if(!btn)return;
  btn.disabled=!!still();
  btn.setAttribute('aria-pressed',pressed?'true':'false');
  btn.setAttribute('aria-label',long);
  btn.title=title;
  btn.innerHTML='<span class="hs-long">'+long+'</span><span class="hs-short">'+short+'</span>';
}
function paint(){
  if(!btn)return;
  if(still()){
    label('Hearth sound: quiet','Hearth: quiet',false,'Calm mode keeps the hearth silent. The choice stays on this device as obcSbHearth.');
    return;
  }
  if(playing){
    label('Hearth sound: on','Hearth: on',true,'Fireplace and page-turn are playing quietly. Saved on this device as obcSbHearth.');
    return;
  }
  if(saved()){
    label('Hearth sound: resume','Hearth: resume',false,'Saved on this device as obcSbHearth. It stays silent until you resume it.');
    return;
  }
  label('Hearth sound: off','Hearth: off',false,'Fireplace and page-turn stay off until you turn them on. Saved on this device as obcSbHearth.');
}
function fade(el,target,ms,then){
  var id=(el._fg=(el._fg||0)+1);
  var from=Math.max(0,Math.min(1,el.volume||0));
  target=Math.max(0,Math.min(1,target));
  var t0=performance.now();
  function step(now){
    if(el._fg!==id)return;
    var p=ms<=0?1:Math.max(0,Math.min(1,(now-t0)/ms));
    try{el.volume=from+(target-from)*p}catch(e){return}
    if(p<1)requestAnimationFrame(step);
    else if(then)then();
  }
  requestAnimationFrame(step);
}
function ensure(){
  if(fa)return;
  fa=new Audio();fb=new Audio();page=new Audio();
  fa.preload=fb.preload=page.preload='auto';
  fa.src=fb.src='audio/fireplace.'+EXT;
  page.src='audio/page-turn.'+EXT;
  fa.volume=fb.volume=0;
  page.volume=PAGE_VOL;
  fa.setAttribute('data-hearth','fireplace');
  page.setAttribute('data-hearth','page');
}
function active(){return which?fb:fa}
function quietDown(){
  clearInterval(watch);watch=0;
  if(fa)fade(fa,0,500,function(){fa.pause()});
  if(fb)fade(fb,0,500,function(){fb.pause()});
  if(page){try{page.pause()}catch(e){}}
}
function stop(){
  playing=false;
  quietDown();
  paint();
}
function armLoop(){
  clearInterval(watch);
  watch=setInterval(function(){
    if(!playing)return;
    var cur=active(),nxt=which?fa:fb;
    if(!cur||!cur.duration||cur._handed)return;
    if(cur.currentTime<cur.duration-1.5)return;
    cur._handed=true;
    nxt._handed=false;
    try{nxt.currentTime=0}catch(e){}
    nxt.volume=0;
    var pr=nxt.play();
    if(pr&&pr.catch)pr.catch(function(){});
    fade(nxt,VOL,1400);
    fade(cur,0,1400,function(){cur.pause();which=which?0:1});
  },200);
}
function start(){
  if(still()){stop();return}
  ensure();
  playing=true;
  store(true);
  which=0;
  fa._handed=false;fb._handed=false;
  try{fa.currentTime=0}catch(e){}
  fa.volume=0;
  fb.pause();
  var begun=fa.play();
  if(begun&&begun.catch)begun.catch(function(){playing=false;paint()});
  fade(fa,VOL,1600);
  var was=page.volume;
  page.volume=0;
  var unlock=page.play();
  var arm=function(){try{page.pause();page.currentTime=0}catch(e){}page.volume=was};
  if(unlock&&unlock.then)unlock.then(arm,arm);else arm();
  armLoop();
  paint();
}
function toggle(){
  if(still())return;
  if(playing){store(false);stop();return}
  start();
}
function cue(kind){
  if(!playing||still()||!page)return;
  if(kind!=='turn'&&kind!=='open')return;
  try{page.currentTime=0}catch(e){}
  var p=page.play();
  if(p&&p.catch)p.catch(function(){});
}
function boot(){
  btn=document.querySelector('.hearth-btn');
  if(!btn)return;
  btn.addEventListener('click',toggle);
  paint();
  var wasStill=still();
  new MutationObserver(function(){
    var now=still();
    if(now===wasStill)return;
    wasStill=now;
    if(now){if(playing)stop();else paint()}
    else paint();
  }).observe(H,{attributes:true,attributeFilter:['class']});
  var rm=matchMedia('(prefers-reduced-motion: reduce)');
  if(rm.addEventListener)rm.addEventListener('change',function(){if(still()){if(playing)stop();else paint()}else paint()});
  document.addEventListener('visibilitychange',function(){
    if(!fa||!playing||still())return;
    if(document.hidden){fa.pause();fb.pause();clearInterval(watch)}
    else{var cur=active();var p=cur.play();if(p&&p.catch)p.catch(function(){});armLoop()}
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();
window.obcHearth={cue:cue,key:KEY,playing:function(){return playing},saved:saved};
})();
