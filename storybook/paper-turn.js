/* Flexible paper turns for the Quiet Library.
   The sheet is one piece of paper: each strip shares an edge with the next
   and follows a soft curl, so the fore-edge leads and the page bows instead
   of spinning like a board. The back of the sheet is the page that lands.
   Calm and reduced motion never build one. The sheet is aria-hidden, not
   focusable, and carries no ids, so forms and the matching guide keep the
   real pages. */
(function(){
'use strict';
var running=null;
function still(){
  return document.documentElement.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function ease(t){
  t=clamp(t,0,1);
  var s=t*t*t*(t*(t*6-15)+10);
  var o=1-Math.pow(1-t,3);
  return s*0.55+o*0.45;
}
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
function thetaAt(x,sim){
  var lead=Math.pow(clamp(x,0,1),0.72);
  var delay=(1-lead)*0.48;
  var local=(sim-delay)/(1-delay*0.45);
  local=clamp(local,0,1);
  var sm=local*local*(3-2*local);
  return Math.PI*sm;
}
function play(opts){
  if(!opts||still()){if(opts&&opts.onDone)opts.onDone();return}
  if(running)running.stop();
  var host=opts.host;
  if(!host){if(opts.onDone)opts.onDone();return}
  var mobile=!!opts.mobile,fwd=!!opts.fwd,spread=!mobile;
  var n=mobile?1:36;
  var curl=mobile?0.78:0.7;
  var dur=mobile?1120:1360;
  var box=host.getBoundingClientRect();
  var W,H,width,height,top=0,left=0,originRight=!spread&&!fwd;
  if(spread){
    width=host.clientWidth;height=host.clientHeight;W=width/2;H=height;
  }else{
    var head=document.querySelector('.top'),crisis=document.querySelector('.crisis'),nav=document.querySelector('.mnav');
    var minTop=crisis?crisis.getBoundingClientRect().bottom:0;
    if(head)minTop=Math.max(minTop,head.getBoundingClientRect().bottom);
    top=Math.max(box.top,minTop);
    var maxB=window.innerHeight;
    if(nav&&getComputedStyle(nav).display!=='none')maxB=Math.min(maxB,nav.getBoundingClientRect().top);
    height=Math.max(180,Math.min(box.bottom,maxB)-top);
    left=Math.max(0,box.left);width=Math.min(box.width,window.innerWidth-left);
    W=width;H=height;
  }
  if(!(W>40)||!(H>40)){if(opts.onDone)opts.onDone();return}
  var sw=W/n;
  var spineX=spread?W:(originRight?W:0);
  var rig=document.createElement('div');
  rig.className='paper-rig'+(mobile?' mobile':' desk')+(fwd?' fwd':' bwd');
  rig.setAttribute('aria-hidden','true');
  if(mobile){rig.style.left=left+'px';rig.style.top=top+'px';rig.style.width=width+'px';rig.style.height=height+'px'}
  var cast=document.createElement('i');
  cast.className='paper-cast';
  rig.appendChild(cast);
  var frontHTML=soften(opts.frontHTML),backHTML=soften(opts.backHTML);
  var segs=[];
  for(var i=0;i<n;i++){
    var seg=document.createElement('div');
    seg.className='pseg'+(i===n-1?' fore':'');
    seg.style.width=(sw+1.5)+'px';
    seg.style.zIndex=String(3+i);
    var fin=document.createElement('div');
    fin.className='pinner front';
    fin.style.width=W+'px';
    fin.style.transform='translateX('+(-(originRight?n-1-i:i)*sw)+'px)';
    fin.innerHTML=frontHTML;
    var bin=document.createElement('div');
    bin.className='pinner back';
    bin.style.width=W+'px';
    bin.style.visibility='hidden';
    bin.style.transform='translateX('+(-(originRight?i:n-1-i)*sw)+'px)';
    bin.innerHTML=backHTML;
    var shade=document.createElement('i');
    shade.className='pshade';
    seg.appendChild(fin);seg.appendChild(bin);seg.appendChild(shade);
    rig.appendChild(seg);
    segs.push({el:seg,front:fin,back:bin,shade:shade,i:i});
  }
  (spread?host:document.body).appendChild(rig);
  var t0=performance.now(),raf=0,finished=0,token={};
  running=token;
  function pose(sim){
    if(mobile){
      var bow=Math.min(1,sim/0.68);
      var slide=Math.max(0,(sim-0.6)/0.4);
      slide=slide*slide*(3-2*slide);
      var off=(originRight?1:-1)*slide*(W+48);
      rig.style.opacity=sim>0.84?String(Math.max(0,1-(sim-0.84)/0.16)):'1';
      for(var m=0;m<segs.length;m++){
        var sm=segs[m];
        var ang=bow*0.5;
        sm.front.style.visibility='visible';
        sm.back.style.visibility='hidden';
        sm.el.style.width=W+'px';
        sm.el.style.transformOrigin=originRight?'right center':'left center';
        sm.el.style.transform='translate3d('+off.toFixed(2)+'px,0,'+(Math.sin(ang)*30).toFixed(2)+'px) rotateY('+((originRight?1:-1)*ang*180/Math.PI).toFixed(2)+'deg) skewY('+((originRight?1:-1)*bow*1.4).toFixed(2)+'deg)';
        sm.shade.style.opacity=String(clamp(Math.sin(ang)*0.45,0,0.45));
      }
      cast.style.opacity=String(clamp(bow*0.35,0,0.35));
      cast.style.width=Math.round(W*0.55)+'px';
      cast.style.transform='translateX('+(originRight?W*0.15:W*0.35)+'px)';
      return;
    }
    var x=spineX,z=0,peakZ=0,peakX=spineX;
    for(var k=0;k<segs.length;k++){
      var s=segs[k];
      var th0=thetaAt(s.i/n,sim);
      var th1=thetaAt((s.i+1)/n,sim);
      var showBack=th0>Math.PI*0.5;
      s.front.style.visibility=showBack?'hidden':'visible';
      s.back.style.visibility=showBack?'visible':'hidden';
      var px,origin,deg;
      if(!originRight){
        if(!showBack){px=x;origin='left center';deg=-th0*180/Math.PI}
        else{px=x-(sw+1.5);origin='right center';deg=(Math.PI-th0)*180/Math.PI}
      }else if(!showBack){px=x-(sw+1.5);origin='right center';deg=th0*180/Math.PI}
      else{px=x;origin='left center';deg=-(Math.PI-th0)*180/Math.PI}
      s.el.style.transformOrigin=origin;
      s.el.style.transform='translate3d('+px.toFixed(2)+'px,0,'+z.toFixed(2)+'px) rotateY('+deg.toFixed(2)+'deg)';
      s.shade.style.opacity=String(clamp(Math.sin(Math.min(Math.PI,th0))*0.42,0,0.42));
      if(z>peakZ){peakZ=z;peakX=x}
      var mid=(th0+th1)/2;
      var step=sw*Math.cos(mid);
      x+=originRight?-step:step;
      z+=sw*Math.sin(mid);
    }
    cast.style.opacity=String(clamp(peakZ/(W*0.28)*0.5,0,0.55));
    cast.style.width=Math.round(W*0.5)+'px';
    cast.style.transform='translateX('+(peakX-W*0.22).toFixed(1)+'px)';
  }
  function frame(now){
    if(running!==token)return;
    var hold=window.obcPaper&&typeof window.obcPaper.hold==='number'?window.obcPaper.hold:null;
    var t=hold!=null?clamp(hold,0,0.999):(now-t0)/dur;
    if(still())t=1;
    var sim=ease(clamp(t,0,1));
    if(!fwd&&spread)sim=1-ease(clamp(t,0,1));
    pose(sim);
    if(!mobile)rig.style.opacity=t>0.72?String(clamp(1-(t-0.72)/0.22,0,1)):'1';
    if(t>0.46&&opts.onMid){try{opts.onMid()}catch(e){}opts.onMid=null}
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
  raf=requestAnimationFrame(frame);
}
window.obcPaper={
  play:play,
  cancel:function(){if(running)running.stop()},
  hold:null,
  get busy(){return !!running}
};
})();
