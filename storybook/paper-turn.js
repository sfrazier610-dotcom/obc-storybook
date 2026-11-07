/* Not used by the storybook page. The turn is the flat flip in index.html.
   Soft fold for the Quiet Library, adapted from StPageFlip's HTML soft
   page (MIT). One whole copy of the page is clipped to a moving polygon,
   translated, and rotated. A shadow rides the crease. It is a fold, not a
   curved sheet. Calm and reduced motion never build one. The copy is
   aria-hidden, ids and form names are stripped, and the real pages keep
   every listener. */
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
  var named=d.querySelectorAll('[name]');
  for(var n=0;n<named.length;n++)named[n].removeAttribute('name');
  var labels=d.querySelectorAll('label[for]');
  for(var f=0;f<labels.length;f++)labels[f].removeAttribute('for');
  var tab=d.querySelectorAll('a,button,input,textarea,select');
  for(var j=0;j<tab.length;j++){
    tab[j].setAttribute('tabindex','-1');
    if(tab[j].tagName==='A')tab[j].removeAttribute('href');
  }
  return d.innerHTML;
}
function dist(a,b){
  if(!a||!b)return Infinity;
  var dx=a.x-b.x,dy=a.y-b.y;
  return Math.sqrt(dx*dx+dy*dy);
}
function limitCircle(start,radius,limited){
  if(dist(start,limited)<=radius)return limited;
  var a=start.x,b=start.y,n=limited.x,m=limited.y;
  var x=Math.sqrt((radius*radius*(a-n)*(a-n))/((a-n)*(a-n)+(b-m)*(b-m)))+a;
  if(limited.x<0)x*=-1;
  var y=((x-a)*(b-m))/(a-n)+b;
  if(a-n+b===0)y=radius;
  return {x:x,y:y};
}
function inRect(rect,pos){
  if(!pos||!isFinite(pos.x)||!isFinite(pos.y))return null;
  if(pos.x>=rect.left&&pos.x<=rect.left+rect.width&&pos.y>=rect.top&&pos.y<=rect.top+rect.height)return pos;
  return null;
}
function lineHit(one,two){
  var A1=one[0].y-one[1].y,A2=two[0].y-two[1].y;
  var B1=one[1].x-one[0].x,B2=two[1].x-two[0].x;
  var C1=one[0].x*one[1].y-one[1].x*one[0].y;
  var C2=two[0].x*two[1].y-two[1].x*two[0].y;
  var det=A1*B2-A2*B1;
  if(Math.abs(det)<1e-8)return null;
  var x=-((C1*B2-C2*B1)/det),y=-((A1*C2-A2*C1)/det);
  if(!isFinite(x)||!isFinite(y))return null;
  return {x:x,y:y};
}
function segHit(rect,one,two){return inRect(rect,lineHit(one,two))}
function angBetween(a,b){
  var A1=a[0].y-a[1].y,A2=b[0].y-b[1].y,B1=a[1].x-a[0].x,B2=b[1].x-b[0].x;
  var d=(A1*A2+B1*B2)/(Math.sqrt(A1*A1+B1*B1)*Math.sqrt(A2*A2+B2*B2));
  return Math.acos(clamp(d,-1,1));
}
/* Bottom-corner forward fold. Same construction as StPageFlip's
   FlipCalculation for a soft page: the corner is the pulled point,
   the visible sheet is the clipped remainder. */
function foldAt(pageW,pageH,pos){
  var angle,rect;
  function update(p){
    var left=pageW-p.x+1,top=pageH-p.y;
    var ang=2*Math.acos(left/Math.sqrt(top*top+left*left));
    if(top<0)ang=-ang;
    var da=Math.PI-ang;
    if(!isFinite(ang)||(da>=0&&da<0.003))throw new Error('small');
    angle=-ang;
    function grot(tp){
      return {
        x:tp.x*Math.cos(angle)+tp.y*Math.sin(angle)+p.x,
        y:tp.y*Math.cos(angle)-tp.x*Math.sin(angle)+p.y
      };
    }
    rect={
      topLeft:grot({x:0,y:-pageH}),
      topRight:grot({x:pageW,y:-pageH}),
      bottomLeft:grot({x:0,y:0}),
      bottomRight:grot({x:pageW,y:0})
    };
  }
  function check(checked){
    var result=checked;
    var tmp=limitCircle({x:0,y:pageH},pageW,result);
    if(result!==tmp){result=tmp;update(result)}
    var rad=Math.sqrt(pageW*pageW+pageH*pageH);
    if(rect.topRight.x<=0){
      var bottomPoint=limitCircle({x:0,y:0},rad,rect.bottomLeft);
      if(bottomPoint!==result){result=bottomPoint;update(result)}
    }
    return result;
  }
  var finger=pos;
  update(finger);
  finger=check(finger);
  if(Math.abs(finger.x-pageW)<1&&Math.abs(finger.y)<1)throw new Error('tiny');
  var bound={left:-1,top:-1,width:pageW+2,height:pageH+2};
  var topI=segHit(bound,[rect.topLeft,rect.topRight],[{x:0,y:0},{x:pageW,y:0}]);
  var sideI=segHit(bound,[finger,rect.topLeft],[{x:pageW,y:0},{x:pageW,y:pageH}]);
  var botI=segHit(bound,[rect.bottomLeft,rect.bottomRight],[{x:0,y:pageH},{x:pageW,y:pageH}]);
  var clip=[rect.topLeft,topI];
  if(!sideI)clip.push(botI);
  else clip.push(sideI,botI);
  clip.push(rect.bottomLeft);
  var shadowStart=sideI||topI;
  var second=(shadowStart!==sideI&&sideI)?sideI:botI;
  var shadowAngle=0;
  if(shadowStart&&second)shadowAngle=angBetween([shadowStart,second],[{x:0,y:0},{x:pageW,y:0}]);
  return {
    finger:finger,
    angle:-angle,
    active:rect.topLeft,
    clip:clip,
    rect:rect,
    progress:Math.abs(((finger.x-pageW)/(2*pageW))*100),
    shadowPos:shadowStart,
    shadowAngle:shadowAngle
  };
}
function spin(p,ang,ox,oy){
  var c=Math.cos(ang),s=Math.sin(ang);
  return {x:p.x*c+p.y*s+ox,y:p.y*c-p.x*s+oy};
}
function polyOf(points,pos,ang,ox,oy){
  var parts=[],i,p,g;
  for(i=0;i<points.length;i++){
    p=points[i];
    if(!p||!isFinite(p.x)||!isFinite(p.y))continue;
    g=spin({x:p.x-pos.x,y:p.y-pos.y},ang,ox||0,oy||0);
    if(!isFinite(g.x)||!isFinite(g.y))continue;
    parts.push(g.x.toFixed(1)+'px '+g.y.toFixed(1)+'px');
  }
  if(parts.length<3)return '';
  return 'polygon('+parts.join(',')+')';
}
function play(opts){
  if(!opts||still()){if(opts&&opts.onDone)opts.onDone();return}
  if(running)running.stop();
  var host=opts.host;
  if(!host){if(opts.onDone)opts.onDone();return}
  var mobile=!!opts.mobile,fwd=!!opts.fwd,spread=!mobile;
  var dur=1750;
  var box=host.getBoundingClientRect();
  var width,height,top=0,left=0;
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
  var pageW=spread?width/2:width,pageH=height,spineX=spread?pageW:0;
  var rig=document.createElement('div');
  rig.className='paper-rig'+(mobile?' mobile':' desk')+(fwd?' fwd':' bwd')+(fwd?'':' mirror');
  rig.setAttribute('aria-hidden','true');
  if(mobile){rig.style.left=left+'px';rig.style.top=top+'px';rig.style.width=width+'px';rig.style.height=height+'px'}
  var fold=document.createElement('div');
  fold.className='paper-fold';
  fold.style.width=pageW+'px';
  fold.style.height=pageH+'px';
  var inn=document.createElement('div');
  inn.className='paper-inn';
  inn.innerHTML=soften(fwd?opts.frontHTML:opts.backHTML);
  var imgs=inn.querySelectorAll('img');
  for(var im=0;im<imgs.length;im++)imgs[im].loading='eager';
  fold.appendChild(inn);
  var outer=document.createElement('i');
  outer.className='paper-shadow outer';
  var inner=document.createElement('i');
  inner.className='paper-shadow inner';
  var dot=document.createElement('i');
  dot.className='paper-dot';
  rig.appendChild(fold);rig.appendChild(outer);rig.appendChild(inner);rig.appendChild(dot);
  (spread?host:document.body).appendChild(rig);
  var margin=pageH/10;
  var start={x:pageW-margin,y:pageH-margin};
  var dest={x:-pageW,y:pageH};
  function fingerAt(s){
    return {x:start.x+(dest.x-start.x)*s,y:start.y+(dest.y-start.y)*s};
  }
  var last=null;
  function solve(s){
    try{last=foldAt(pageW,pageH,fingerAt(clamp(s,0,1)))}catch(e){}
    return last;
  }
  function toBook(p){return {x:p.x+spineX,y:p.y}}
  function paint(foldState){
    if(!foldState){
      fold.style.clipPath='none';
      fold.style.transform='translate3d('+spineX+'px,0,0)';
      outer.style.opacity='0';inner.style.opacity='0';
      return;
    }
    var shape=polyOf(foldState.clip,foldState.active,foldState.angle,0,0);
    fold.style.clipPath=shape||'none';
    fold.style.webkitClipPath=shape||'none';
    var g=toBook(foldState.active);
    fold.style.transform='translate3d('+g.x.toFixed(2)+'px,'+g.y.toFixed(2)+'px,0) rotate('+foldState.angle.toFixed(4)+'rad)';
    var prog=clamp(foldState.progress,0,100);
    var sw=(pageW*0.75)*prog/100;
    var op=(100-prog)/100;
    var ang=foldState.shadowAngle+3*Math.PI/2;
    if(!(sw>2)||!foldState.shadowPos||!isFinite(ang)){
      outer.style.opacity='0';inner.style.opacity='0';
    }else{
      var sp=toBook(foldState.shadowPos);
      var pageBox=[{x:0,y:0},{x:pageW,y:0},{x:pageW,y:pageH},{x:0,y:pageH}];
      var outerShape=polyOf(pageBox,foldState.shadowPos,ang,0,100);
      outer.style.opacity='1';
      outer.style.width=sw.toFixed(1)+'px';
      outer.style.height=(pageH*2)+'px';
      outer.style.background='linear-gradient(to right, rgba(24,12,6,'+op.toFixed(3)+'), rgba(24,12,6,0))';
      outer.style.transformOrigin='0px 100px';
      outer.style.transform='translate3d('+sp.x.toFixed(2)+'px,'+(sp.y-100).toFixed(2)+'px,0) rotate('+ang.toFixed(4)+'rad)';
      outer.style.clipPath=outerShape||'none';
      var iw=sw*0.75, r=foldState.rect;
      var innerPts=[r.topLeft,r.topRight,r.bottomRight,r.bottomLeft];
      var innerShape=polyOf(innerPts,foldState.shadowPos,ang,iw,100);
      inner.style.opacity='1';
      inner.style.width=iw.toFixed(1)+'px';
      inner.style.height=(pageH*2)+'px';
      inner.style.background='linear-gradient(to left, rgba(24,12,6,'+op.toFixed(3)+') 5%, rgba(24,12,6,.05) 15%, rgba(24,12,6,'+(op*0.65).toFixed(3)+') 35%, rgba(24,12,6,0) 100%)';
      inner.style.transformOrigin=iw.toFixed(1)+'px 100px';
      inner.style.transform='translate3d('+(sp.x-iw).toFixed(2)+'px,'+(sp.y-100).toFixed(2)+'px,0) rotate('+ang.toFixed(4)+'rad)';
      inner.style.clipPath=innerShape||'none';
    }
    fold.style.opacity='1';
    var mark=toBook(foldState.finger);
    dot.style.left=mark.x+'px';
    dot.style.top=mark.y+'px';
  }
  /* The pulled corner already travels in a straight line, so time
     and on-screen position stay in step for the whole second. */
  function along(t){return clamp(t,0,1)}
  var raf=0,finished=0,token={};
  running=token;
  var t0=performance.now();
  function pose(t){
    paint(solve(along(t)));
  }
  function frame(now){
    if(running!==token)return;
    var hold=window.obcPaper&&typeof window.obcPaper.hold==='number'?window.obcPaper.hold:null;
    var t=hold!=null?clamp(hold,0,0.999):(now-t0)/dur;
    if(still())t=1;
    pose(clamp(t,0,1));
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
