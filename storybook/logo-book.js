/* Cover logo: a small closed book opens to reveal the Open Book Counseling logo. Plays once when visible; click/tap replays. */
(function(){
  var el=document.querySelector('.logo-book');if(!el)return;
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(){el.classList.remove('play');el.classList.add('opened');}
  function play(){if(rm){show();return;}el.classList.remove('opened','play');void el.offsetWidth;el.classList.add('play');}
  el.addEventListener('animationend',function(e){if(e.target.tagName==='IMG')show();});
  el.addEventListener('click',function(e){e.stopPropagation();play();});
  if(rm){show();return;}
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();play();}});io.observe(el);}else play();
})();
