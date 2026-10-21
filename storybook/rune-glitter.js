(function(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var N=8,C=['','w','v','','w','t','','w'];
 function deco(b){if(b.querySelector('.gl'))return;for(var i=0;i<N;i++){var s=document.createElement('span');s.className='gl '+C[i];s.setAttribute('aria-hidden','true');
  s.style.setProperty('--a',Math.round(i*45+Math.random()*25)+'deg');s.style.setProperty('--r0',(10+Math.random()*6).toFixed(0)+'px');s.style.setProperty('--r1',(26+Math.random()*12).toFixed(0)+'px');
  s.style.animationDelay=(-Math.random()*2.6).toFixed(2)+'s';s.style.animationDuration=(1.8+Math.random()*1.4).toFixed(2)+'s';b.appendChild(s);}}
 function scan(){document.querySelectorAll('.rune').forEach(deco)}
 scan();new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});
})();
