/* One continuous sheet for the Quiet Library.
   The earlier strip mesh redrew the page as dozens of slices. In Edge those
   slices overlapped and tore; when the slices failed to paint, the next page
   was already underneath and the turn looked like no animation at all.
   This is a single leaf with a front and a back. Calm and reduced motion
   never build one. The sheet is aria-hidden and carries no ids, so forms
   and the matching guide keep the real pages. */
(function(){
'use strict';
var running=null;
function still(){
  return document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function soften(html){
  var d=document.createElement('div');
  d.innerHTML=html||'';
  var ids=d.querySelectorAll('[id]');
  for(var i=0;i<ids.length;i++)ids[i].removeAttribute('id');
  var tab=d.querySelectorAll('a,button,input,textarea,select');
  for(var j=0;j<tab.length;j++){
    tab[j].setAttribute('tabindex','-1');
    if(tab[j].tagName==='A')tab[j].removeAttribute('href');
  }
  return d.innerHTML;
}
/* 0–180 degrees. Most of the time is on a readable face.
   The edge-on moment is a short pass, not a place the page sits. */
function angleAt(t){
  t=clamp(t,0,1);
  if(t<0.40){var u=t/0.40;return (1-Math.pow(1-u,2))*68}
  if(t<0.56)return 68+((t-0.40)/0.16)*44;
  if(t<0.92){var v=(t-0.56)/0.36;return 112+(1-Math.pow(1-v,2))*68}
  return 180;
}
function play(opts){
  if(!opts||still()){if(opts&&opts.onDone)opts.onDone();return}
  if(running)running.stop();
  var host=opts.host;
  if(!host){if(opts.onDone)opts.onDone();return}
  var mobile=!!opts.mobile,fwd=!!opts.fwd,spread=!mobile;
  var dur=mobile?2400:2500;
  var box=host.getBoundingClientRect();
  var width,height,top=0,left=0,originRight=!spread&&!fwd;
  if(spread){
    width=host.clientWidth;height=host.clientHeight;
  }else{
    var head=document.querySelector('.top'),crisis=document.querySelector('.crisis'),nav=document.querySelector('.mnav');
    var minTop=crisis?crisis.getBoundingClientRect().bottom:0;
    if(head)minTop=Math.max(minTop,head.getBoundingClientRect().bottom);
    top=Math.max(box.top,minTop);
    var maxB=window.innerHeight;
    if(nav&&getComputedStyle(nav).display!=='none')maxB=Math.min(maxB,nav.getBoundingClientRect().top);
    height=Math.max(180,Math.min(box.bottom,maxB)-top);
    left=Math.max(0,box.left);width=Math.min(box.width,window.innerWidth-left);
  }
  if(!(width>40)||!(height>40)){if(opts.onDone)opts.onDone();return}
  var rig=document.createElement('div');
  rig.className='paper-rig'+(mobile?' mobile':' desk')+(fwd?' fwd':' bwd');
  rig.setAttribute('aria-hidden','true');
  if(mobile){rig.style.left=left+'px';rig.style.top=top+'px';rig.style.width=width+'px';rig.style.height=height+'px'}
  var cast=document.createElement('i');
  cast.className='paper-cast';
  rig.appendChild(cast);
  var leaf=document.createElement('div');
  leaf.className='paper-leaf';
  if(spread){
    leaf.style.left='50%';
    leaf.style.width='50%';
    leaf.style.transformOrigin='left center';
  }else{
    leaf.style.left='0';
    leaf.style.width='100%';
    leaf.style.transformOrigin=originRight?'right center':'left center';
  }
  var front=document.createElement('div');
  front.className='paper-face front';
  front.innerHTML=soften(opts.frontHTML);
  var back=document.createElement('div');
  back.className='paper-face back';
  back.innerHTML=soften(opts.backHTML);
  var shade=document.createElement('i');
  shade.className='paper-shade';
  leaf.appendChild(front);leaf.appendChild(back);leaf.appendChild(shade);
  rig.appendChild(leaf);
  (spread?host:document.body).appendChild(rig);
  var t0=performance.now(),raf=0,finished=0,token={};
  running=token;
  var sign=originRight?1:-1;
  function pose(t){
    var ang=angleAt(t);
    if(!fwd)ang=180-ang;
    var rad=ang*Math.PI/180;
    leaf.style.transform='rotateY('+(sign*ang).toFixed(2)+'deg)';
    shade.style.opacity=String(clamp(Math.sin(rad)*0.55,0,0.55));
    cast.style.opacity=String(clamp(Math.sin(rad)*0.62,0,0.62));
    if(spread){
      cast.style.width='42%';
      cast.style.transform='translateX('+(fwd?(width*0.5-Math.sin(rad)*width*0.22):(width*0.08+Math.sin(rad)*width*0.2)).toFixed(1)+'px)';
    }else{
      cast.style.width='55%';
      cast.style.transform='translateX('+(originRight?width*0.2:width*0.25)+'px)';
    }
    rig.style.opacity=t>0.93?String(clamp(1-(t-0.93)/0.07,0,1)):'1';
  }
  function frame(now){
    if(running!==token)return;
    var hold=window.obcPaper&&typeof window.obcPaper.hold==='number'?window.obcPaper.hold:null;
    var t=hold!=null?clamp(hold,0,0.999):(now-t0)/dur;
    if(still())t=1;
    pose(clamp(t,0,1));
    /* Place the real page while the sheet still covers it, so the
       handoff is not the moment images and entrance effects begin. */
    if(t>0.70&&opts.onMid){try{opts.onMid()}catch(e){}opts.onMid=null}
    if(t>=1&&hold==null){end();return}
    raf=requestAnimationFrame(frame);
  }
  function end(){
    if(finished)return;
    finished=1;
    if(running===token)running=null;
    cancelAnimationFrame(raf);
    try{if(opts.onDone)opts.onDone()}catch(e){}
    if(rig.parentNode)rig.remove();
  }
  token.stop=end;
  pose(0);
  if(opts.onCover){try{opts.onCover()}catch(e){}}
  raf=requestAnimationFrame(frame);
}
window.obcPaper={
  play:play,
  cancel:function(){if(running)running.stop()},
  hold:null,
  get busy(){return !!running}
};
})();
