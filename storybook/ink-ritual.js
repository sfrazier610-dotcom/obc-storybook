/* Phase 3 — Prologue ink ritual.
   A quill draws the strike and a short flourish when a fixed line rewrites
   or the visitor submits their own line. Decorative only: the words stay in
   the DOM. Calm and prefers-reduced-motion finish instantly, with no trail.
   Does not load legacy magic.js. Nothing is stored or sent. */
(function(){
'use strict';
var H=document.documentElement;
function still(){
  return H.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function stop(el){
  if(el._raf){cancelAnimationFrame(el._raf);el._raf=0}
  var v=el.querySelector('.ink-veil');if(v)v.remove();
  var drops=el.querySelectorAll('.ink-drop');
  for(var i=0;i<drops.length;i++)drops[i].remove();
  el.classList.remove('inking');
}
function drop(el,x,y,i){
  var d=document.createElement('i');
  d.className='ink-drop'+(i%3===0?' fine':'');
  d.setAttribute('aria-hidden','true');
  var j=(i%5)-2;
  d.style.left=(x+j*0.7)+'px';
  d.style.top=(y+(i%2?1.5:-0.6))+'px';
  el.appendChild(d);
}
function build(el){
  var old=el.querySelector('.rw-old');
  if(!old)return null;
  var br=el.getBoundingClientRect();
  var w=el.clientWidth,h=el.clientHeight;
  if(w<8)return null;
  var lines=Array.prototype.filter.call(old.getClientRects(),function(r){return r.width>=12&&r.height>=4});
  if(!lines.length)return null;
  var strike='';
  var endX=0,endY=0;
  for(var i=0;i<lines.length;i++){
    var r=lines[i];
    var x1=r.left-br.left-el.clientLeft;
    var x2=r.right-br.left-el.clientLeft;
    var y=r.top-br.top-el.clientTop+r.height*0.58;
    if(i===lines.length-1&&w-x2<32)x2=Math.max(x1+16,w-34);
    var span=Math.max(12,x2-x1);
    var yA=y-0.5,yB=y+1.15,yC=y-0.35;
    strike+='M'+x1.toFixed(1)+' '+yA.toFixed(1)
      +' C '+(x1+span*0.3).toFixed(1)+' '+(yA-1.7).toFixed(1)
      +', '+(x1+span*0.48).toFixed(1)+' '+(yB+1.15).toFixed(1)
      +', '+(x1+span*0.66).toFixed(1)+' '+yB.toFixed(1)
      +' S '+(x2-3).toFixed(1)+' '+(yC-1.1).toFixed(1)
      +', '+x2.toFixed(1)+' '+yC.toFixed(1);
    endX=x2;endY=yC;
  }
  var x2=endX,yC=endY;
  var flour='M'+x2.toFixed(1)+' '+yC.toFixed(1)
    +' c 7 -9, 16 -8, 18 -1'
    +' c 1.2 5.5, -7 8, -11 3'
    +' c 5 -0.4, 12 2, 14 6';
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('class','ink-veil');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  svg.setAttribute('viewBox','0 0 '+w.toFixed(1)+' '+h.toFixed(1));
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.innerHTML='<path class="strike" d="'+strike+'"></path><path class="flour" d="'+flour+'"></path>'
    +'<g class="quill"><path d="M0 0 C -3 -5 -12 -11 -22 -9 C -12 -5 -5 -1.6 0 0 Z"></path><circle class="nib" cx="0" cy="0" r="2.4"></circle></g>';
  svg._nw=el.querySelector('.rw-new');
  svg._box={br:br,left:el.clientLeft,top:el.clientTop};
  return svg;
}
function prep(path){
  var len=path.getTotalLength();
  path.style.strokeDasharray=String(len);
  path.style.strokeDashoffset=String(len);
  return len;
}
function play(el){
  if(!el)return;
  var my=(el._ink=(el._ink||0)+1);
  stop(el);
  el.classList.remove('done');
  if(still()){el.classList.add('done');return}
  void el.offsetWidth;
  var veil=build(el);
  if(!veil){el.classList.add('done');return}
  el.appendChild(veil);
  el.classList.add('inking','inked');
  requestAnimationFrame(function(){
    if(el._ink!==my)return;
    el.classList.add('done');
    try{run(el,veil,my)}catch(err){stop(el);el.classList.add('done')}
  });
}
function run(el,veil,my){
  var strike=veil.querySelector('.strike');
  var flour=veil.querySelector('.flour');
  var quill=veil.querySelector('.quill');
  var slen=prep(strike),flen=prep(flour);
  if(!(slen>1)){veil.classList.add('rest');el.classList.remove('inking');setTimeout(function(){if(veil.parentNode)veil.remove()},400);return}
  var t0=performance.now();
  var S=1100,F0=820,F=520;
  var dropped={};
  var nw=veil._nw,br=veil._box;
  if(nw&&br){
    var nr=nw.getBoundingClientRect();
    if(nr.width>8){
      var nx=nr.left-br.br.left-br.left;
      var ny=nr.bottom-br.br.top-br.top-1.5;
      for(var i=0;i<4;i++){
        (function(i){
          setTimeout(function(){
            if(el._ink!==my)return;
            drop(el,nx+nr.width*(0.12+i*0.22),ny,i+8);
          },500+i*130);
        })(i);
      }
    }
  }
  function place(pt,prev){
    var ang=Math.atan2(pt.y-prev.y,pt.x-prev.x)*180/Math.PI;
    quill.setAttribute('transform','translate('+pt.x.toFixed(2)+' '+(pt.y-7).toFixed(2)+') rotate('+(ang-18).toFixed(1)+')');
  }
  function frame(now){
    if(el._ink!==my)return;
    if(still()){stop(el);el.classList.add('done');return}
    var dt=now-t0;
    var sp=Math.min(1,dt/S);
    var se=1-Math.pow(1-sp,3);
    strike.style.strokeDashoffset=String(slen*(1-se));
    var at=Math.max(0.5,slen*se);
    place(strike.getPointAtLength(at),strike.getPointAtLength(Math.max(0,at-7)));
    var bucket=Math.floor(se*7);
    if(se>0.05&&!dropped[bucket]){dropped[bucket]=1;var p=strike.getPointAtLength(at);drop(el,p.x,p.y,bucket)}
    if(dt>F0){
      var fp=Math.min(1,(dt-F0)/F);
      var fe=1-Math.pow(1-fp,3);
      flour.style.strokeDashoffset=String(flen*(1-fe));
      if(fe>0.08){
        var fat=Math.max(0.5,flen*fe);
        place(flour.getPointAtLength(fat),flour.getPointAtLength(Math.max(0,fat-5)));
      }
    }
    if(sp<1||dt<F0+F){el._raf=requestAnimationFrame(frame);return}
    veil.classList.add('rest');
    quill.setAttribute('opacity','0');
    el.classList.remove('inking');
    el._raf=0;
    setTimeout(function(){
      if(el._ink!==my)return;
      if(veil.parentNode)veil.remove();
      var drops=el.querySelectorAll('.ink-drop');
      for(var k=0;k<drops.length;k++)drops[k].remove();
    },640);
  }
  el._raf=requestAnimationFrame(frame);
}
window.obcInk={play:play};
})();
