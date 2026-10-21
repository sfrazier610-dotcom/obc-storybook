(function(){
 var A=document.getElementById('awards');if(!A)return;
 var RM=matchMedia('(prefers-reduced-motion: reduce)').matches,W=A.querySelector('.aw-wand');
 if(RM){A.classList.add('rm','cast','done');W.addEventListener('click',function(){var S=window.obcSound;try{if(S&&!S.muted())S.chime(2)}catch(e){}});return;}
 A.classList.add('armed');
 var cv=A.querySelector('.aw-sparks'),cx=cv.getContext('2d'),busy=false,raf,t1,t2;
 function sparks(){var r=A.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=r.width*d;cv.height=r.height*d;cx.setTransform(d,0,0,d,0,0);
  var ox=r.width/2,oy=Math.min(170,r.height/2.5),P=[];for(var i=0;i<90;i++){var a=Math.random()*6.283,v=1.5+Math.random()*4.5;P.push({x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,s:1+Math.random()*2.5})}
  cancelAnimationFrame(raf);(function f(){cx.clearRect(0,0,r.width,r.height);var alive=0;P.forEach(function(p){if(p.l<=0)return;alive++;p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy=p.vy*.97+.04;p.l-=.012;
   cx.globalAlpha=Math.max(p.l,0);cx.fillStyle=p.l>.6?'#fff3c4':'#e8b84a';cx.shadowColor='#f3c95a';cx.shadowBlur=8;cx.beginPath();cx.arc(p.x,p.y,p.s,0,6.283);cx.fill()});
   if(alive)raf=requestAnimationFrame(f);else cx.clearRect(0,0,r.width,r.height)})()}
 function cast(){if(busy)return;busy=true;clearTimeout(t1);clearTimeout(t2);
  A.classList.remove('cast','done','swish');void A.offsetWidth;A.classList.add('swish','casting');
  var S=window.obcSound;try{if(S&&S.muted&&!S.muted())S.chime(2)}catch(e){}
  t1=setTimeout(function(){A.classList.remove('armed');A.classList.add('cast');sparks()},650);
  t2=setTimeout(function(){A.classList.add('done');A.classList.remove('swish','casting');A.querySelector('.aw-hint').textContent='Tap the wand to cast again ✦';busy=false},650+3200)}
 W.addEventListener('click',cast);
})();
