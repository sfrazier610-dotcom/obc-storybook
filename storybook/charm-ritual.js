/* Phase 3 — Charm Library draw.
   Opening a charm pauses for a lantern and a short gold path, then the
   existing card turn (and Phase 2 moth) finish the beat. Not a quiz.
   Skill text is untouched. Calm and reduced motion open at once, with no
   path and no moth. Nothing is stored. */
(function(){
'use strict';
function still(){
  return document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function draw(card,front,done){
  if(still()){done();return}
  var rite=document.createElement('span');
  rite.className='charm-rite';
  rite.setAttribute('aria-hidden','true');
  var w=Math.max(80,front.clientWidth),h=Math.max(80,front.clientHeight);
  var x=Math.max(16,w-15);
  var y1=h-20;
  var d='M'+x.toFixed(1)+' 62 C '+(x-8).toFixed(1)+' 92, '+(x+6).toFixed(1)+' 118, '+x.toFixed(1)+' '+((62+y1)/2).toFixed(1)
    +' S '+(x-4).toFixed(1)+' '+(y1-16).toFixed(1)+', '+x.toFixed(1)+' '+y1.toFixed(1);
  var sw='M'+x.toFixed(1)+' '+y1.toFixed(1)+' c -10 -6, -4 -14, 2 -8';
  rite.innerHTML='<svg class="rite-svg" viewBox="0 0 '+w.toFixed(1)+' '+h.toFixed(1)+'" aria-hidden="true" focusable="false">'
    +'<path class="rite-path" d="'+d+'"></path>'
    +'<path class="rite-swash" d="'+sw+'"></path>'
    +'<circle class="rite-gem" cx="'+x.toFixed(1)+'" cy="'+(y1-2).toFixed(1)+'" r="2.6"></circle></svg>'
    +'<svg class="rite-lantern" viewBox="0 0 120 184" aria-hidden="true" focusable="false"><use href="#i-margin-lantern"></use></svg>';
  front.appendChild(rite);
  [rite.querySelector('.rite-path'),rite.querySelector('.rite-swash')].forEach(function(path){
    if(!path||!path.getTotalLength)return;
    var len=path.getTotalLength();
    if(!len)return;
    path.style.strokeDasharray=String(len);
    path.style.strokeDashoffset=String(len);
  });
  void rite.offsetWidth;
  rite.classList.add('go');
  var ended=false,timer=0,mo=null;
  function finish(){
    if(ended)return;
    ended=true;
    clearTimeout(timer);
    if(mo)mo.disconnect();
    done();
  }
  var path=rite.querySelector('.rite-path');
  if(path)path.addEventListener('animationend',finish);
  timer=setTimeout(finish,1200);
  mo=new MutationObserver(function(){if(still())finish()});
  mo.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
}
window.obcCharm={draw:draw};
})();
