/* Quiet Library craft (Phases 1–2).
   One dust-mote loop for the reading room. Not the legacy magic.js / motion.js stack.
   Hard off when html.calm or prefers-reduced-motion. Pauses when the tab is hidden
   or the book stage has scrolled away. Matching score math is not in this file. */
(function(){
'use strict';
var H = document.documentElement;
var stage = document.getElementById('stage');
if(!stage) return;
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
var narrow = window.matchMedia('(max-width: 899px)');
var canvas = document.createElement('canvas');
canvas.className = 'atmo-canvas';
canvas.setAttribute('aria-hidden','true');
stage.appendChild(canvas);
var ctx = canvas.getContext('2d', {alpha:true});
var dpr = 1, w = 0, h = 0, raf = 0, running = false, onScreen = true, last = 0;
var motes = [], burst = [];
var sprite = document.createElement('canvas');
sprite.width = sprite.height = 32;
(function(){
  var c = sprite.getContext('2d');
  var g = c.createRadialGradient(16,16,0,16,16,16);
  g.addColorStop(0,'rgba(255,236,206,0.95)');
  g.addColorStop(0.45,'rgba(255,206,140,0.35)');
  g.addColorStop(1,'rgba(255,206,140,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(16,16,16,0,6.2832);
  c.fill();
})();

function hardOff(){
  return H.classList.contains('calm') || reduce.matches;
}
function moteCount(){
  return narrow.matches ? 14 : 32;
}
function make(y){
  return {
    x: Math.random(),
    y: y == null ? Math.random() : y,
    r: (Math.random()*1.15+0.45) * (narrow.matches ? 0.85 : 1),
    s: Math.random()*0.012+0.0035,
    drift: (Math.random()-0.5)*0.018,
    a: Math.random()*0.28+0.08,
    phase: Math.random()*6.2832
  };
}
function seed(){
  var n = moteCount();
  motes = [];
  for(var i=0;i<n;i++) motes.push(make(Math.random()));
}
function resize(){
  var r = stage.getBoundingClientRect();
  if(r.width < 2 || r.height < 2) return;
  dpr = Math.min(narrow.matches ? 1 : 1.2, window.devicePixelRatio || 1);
  w = Math.max(1, Math.floor(r.width * dpr));
  h = Math.max(1, Math.floor(r.height * dpr));
  var cap = narrow.matches ? 600000 : 1100000;
  if(w*h > cap){
    var s = Math.sqrt(cap/(w*h));
    w = Math.floor(w*s);
    h = Math.floor(h*s);
  }
  canvas.width = w;
  canvas.height = h;
  seed();
}
function burstAt(){
  if(hardOff()) return;
  var n = narrow.matches ? 6 : 14;
  for(var i=0;i<n;i++){
    var a = Math.random()*6.2832;
    var sp = 0.05+Math.random()*0.09;
    burst.push({
      x: 0.5+(Math.random()-0.5)*0.12,
      y: 0.46+(Math.random()-0.5)*0.08,
      vx: Math.cos(a)*sp,
      vy: Math.sin(a)*sp*0.7-0.02,
      life: 1,
      r: 0.7+Math.random()*1.5,
      a: 0.28+Math.random()*0.3
    });
  }
}
var wasOpening = false;
function watchOpen(){
  var opening = H.classList.contains('opening');
  if(opening && !wasOpening) burstAt();
  wasOpening = opening;
}
function frame(t){
  raf = 0;
  if(!running) return;
  if(document.hidden || hardOff() || !onScreen){ stop(); return; }
  var dt = Math.min(0.05, last ? (t-last)/1000 : 0.016);
  last = t;
  watchOpen();
  ctx.clearRect(0,0,w,h);
  var i, m, alpha, size, px, py;
  for(i=0;i<motes.length;i++){
    m = motes[i];
    m.y -= m.s * dt;
    m.x += (m.drift + Math.sin(t/1000 + m.phase)*0.01) * dt;
    if(m.y < -0.03){ motes[i] = make(1.03); continue; }
    if(m.x < -0.03) m.x = 1.03;
    if(m.x > 1.03) m.x = -0.03;
    alpha = m.a * (0.65+0.35*Math.sin(t/800 + m.phase));
    size = m.r * dpr * 7;
    px = m.x * w;
    py = m.y * h;
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, px-size, py-size, size*2, size*2);
  }
  for(i=burst.length-1;i>=0;i--){
    var b = burst[i];
    b.life -= dt * 0.65;
    if(b.life <= 0){ burst.splice(i,1); continue; }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.vy -= 0.015 * dt;
    size = b.r * dpr * 8;
    ctx.globalAlpha = b.a * b.life;
    ctx.drawImage(sprite, b.x*w-size, b.y*h-size, size*2, size*2);
  }
  ctx.globalAlpha = 1;
  raf = requestAnimationFrame(frame);
}
function start(){
  if(running || hardOff() || document.hidden || !onScreen) return;
  if(!w) resize();
  running = true;
  last = 0;
  raf = requestAnimationFrame(frame);
}
function stop(){
  running = false;
  if(raf) cancelAnimationFrame(raf);
  raf = 0;
  if(ctx && w) ctx.clearRect(0,0,w,h);
}
function sync(){
  var off = hardOff();
  H.classList.toggle('atmo-off', off);
  canvas.hidden = off;
  if(off || document.hidden || !onScreen) stop();
  else start();
}
if('IntersectionObserver' in window){
  new IntersectionObserver(function(es){
    onScreen = es[0].isIntersecting;
    sync();
  }, {threshold:0}).observe(stage);
}
if('ResizeObserver' in window){
  new ResizeObserver(function(){ if(!hardOff()) resize(); }).observe(stage);
}else{
  window.addEventListener('resize', function(){ if(!hardOff()) resize(); });
}
new MutationObserver(sync).observe(H, {attributes:true, attributeFilter:['class']});
document.addEventListener('visibilitychange', sync);
if(reduce.addEventListener) reduce.addEventListener('change', sync);
if(narrow.addEventListener) narrow.addEventListener('change', function(){ resize(); sync(); });
sync();

/* Phase 2: light pools tied to the painted sources already marked on each plate. */
var MAP = {
  hero:[['book','40%','46%'],['candle','6%','42%'],['candle','95%','62%'],['moon','83%','17%']],
  'ch-quiz':[['lantern','20%','66%'],['portal','45%','24%'],['portal','59%','22%'],['portal','73%','24%']],
  'ch-team':[['candle','31%','13%'],['candle','77%','12%'],['hearth','96%','56%'],['book','57%','50%']],
  'ch-approaches':[['candle','82%','26%'],['book','45%','32%'],['pen','36%','64%']],
  'ch-charms':[['jar','33%','52%'],['jar','48%','16%'],['candle','46%','48%']],
  'ch-quest':[['lantern','32%','70%'],['sun','54%','15%']],
  'ch-treasury':[['chest','36%','46%'],['torch','91%','22%']],
  'ch-locations':[['lantern','29%','54%'],['lantern','33%','66%'],['lantern','86%','62%'],['aurora','55%','14%']],
  'ch-faq':[['candle','68%','13%'],['book','60%','42%']],
  'ch-careers':[['lantern','82%','22%'],['seal','41%','76%']],
  afterword:[['candle','60%','50%'],['moon','83%','18%'],['jar','74%','62%']]
};
function mountLights(root){
  var scenes = (root || document).querySelectorAll('.scene[data-scene]');
  for(var i=0;i<scenes.length;i++){
    var sc = scenes[i];
    if(sc.querySelector('.sc-map')) continue;
    var spec = MAP[sc.getAttribute('data-scene')];
    if(!spec) continue;
    var glow = sc.querySelector('.sc-glow') || sc;
    var d = document.createElement('div');
    d.className = 'sc-map';
    d.setAttribute('aria-hidden','true');
    for(var k=0;k<spec.length;k++){
      var lt = document.createElement('i');
      lt.className = 'lt lt-'+spec[k][0];
      lt.style.left = spec[k][1];
      lt.style.top = spec[k][2];
      d.appendChild(lt);
    }
    glow.appendChild(d);
  }
}
mountLights(document);
})();
