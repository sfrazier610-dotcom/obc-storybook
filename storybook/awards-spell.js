(function(){
 var A=document.getElementById('awards');if(!A)return;
 var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(RM){A.classList.add('rm','cast','done');A.querySelector('.aw-replay').hidden=true;return;}
 var cv=A.querySelector('.aw-sparks'),cx=cv.getContext('2d'),busy=false,raf;
 function sparks(){var r=A.getBoundingClientRect(),d=devicePixelRatio||1;cv.width=r.width*d;cv.height=r.height*d;cx.setTransform(d,0,0,d,0,0);
  var ox=r.width/2,oy=Math.min(110,r.height/3),P=[];for(var i=0;i<90;i++){var a=Math.random()*6.283,v=1.5+Math.random()*4.5;P.push({x:ox,y:oy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,s:1+Math.random()*2.5})}
  cancelAnimationFrame(raf);(function f(){cx.clearRect(0,0,r.width,r.height);var alive=0;P.forEach(function(p){if(p.l<=0)return;alive++;p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy=p.vy*.97+.04;p.l-=.012;
   cx.globalAlpha=Math.max(p.l,0);cx.fillStyle=p.l>.6?'#fff3c4':'#e8b84a';cx.shadowColor='#f3c95a';cx.shadowBlur=8;cx.beginPath();cx.arc(p.x,p.y,p.s,0,6.283);cx.fill()});
   if(alive)raf=requestAnimationFrame(f);else cx.clearRect(0,0,r.width,r.height)})()}
 function cast(){if(busy)return;busy=true;A.classList.remove('cast','done');void A.offsetWidth;A.classList.add('cast');sparks();
  var S=window.obcSound;try{if(S&&S.muted&&!S.muted())S.chime(2)}catch(e){}
  setTimeout(function(){A.classList.add('done');busy=false},3200)}
 A.querySelector('.aw-replay').onclick=cast;
 A.addEventListener('mouseenter',function(){if(A.classList.contains('done'))cast()});
 var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();cast()}},{threshold:.45});io.observe(A);
})();
