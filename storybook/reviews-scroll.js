(function(){
  var R=(window.OBC_REVIEWS||[]).slice();for(var k=R.length-1;k>0;k--){var j=Math.floor(Math.random()*(k+1)),t=R[k];R[k]=R[j];R[j]=t}var S=window.OBC_REVIEWS_SUMMARY,root=document.getElementById('reviews');
  if(!root||!R.length)return;
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.toggle('rm',rm);
  root.innerHTML='<h2 class="rv-h">Words from our readers</h2>'+
   '<div class="rv-stage"><button class="rv-arrow prev" type="button" aria-label="Previous review">‹</button>'+
   '<div class="rv-scroll" tabindex="0" aria-roledescription="carousel" aria-label="Google reviews"><span class="rv-rod top"></span>'+
   '<div class="rv-paper"><blockquote class="rv-text" aria-live="polite" aria-atomic="true"></blockquote></div><span class="rv-rod bot"></span></div>'+
   '<button class="rv-arrow next" type="button" aria-label="Next review">›</button></div>'+
   '<div class="rv-ctrl"><button class="rv-pause" type="button" aria-pressed="false">❚❚ Pause</button><span class="rv-count" aria-hidden="true"></span><div class="rv-dots" role="group" aria-label="Choose review"></div></div>'+
   (S?'<p class="rv-sum"><a href="'+S.url+'" target="_blank" rel="noopener">'+S.label+'</a></p>':'');
  var sc=root.querySelector('.rv-scroll'),tx=root.querySelector('.rv-text'),dots=root.querySelector('.rv-dots'),pb=root.querySelector('.rv-pause');
  R.forEach(function(r,i){var b=document.createElement('button');b.type='button';b.className='rv-dot';b.setAttribute('aria-label','Review '+(i+1)+' of '+R.length);b.onclick=function(){go(i,true)};dots.appendChild(b)});
  var i=0,timer=null,userPaused=rm,hover=false,busy=false;
  function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function render(){var r=R[i];tx.innerHTML='<p>“'+esc(r.text)+'”</p><footer>— '+esc(r.name)+' · Google review</footer>';
    tx.scrollTop=0;root.querySelector('.rv-count').textContent=(i+1)+' / '+R.length;sc.style.setProperty('--half',(sc.querySelector('.rv-paper').offsetHeight/2-8)+'px');[].forEach.call(dots.children,function(d,k){d.setAttribute('aria-current',k===i?'true':'false')})}
  function hold(){return Math.min(22000,Math.max(7000,4000+R[i].text.length*17))}
  function sched(){clearTimeout(timer);if(userPaused||hover)return;timer=setTimeout(function(){go(i+1)},hold()+(rm?0:1400))}
  function go(n,user){if(busy)return;n=(n+R.length)%R.length;if(n===i&&!user)return;busy=true;clearTimeout(timer);
    var close=rm?400:900;sc.classList.remove('open');sc.classList.add('closing');
    setTimeout(function(){i=n;render();sc.classList.remove('closing');void sc.offsetWidth;sc.classList.add('open');
      if(!rm&&window.OBCSound&&OBCSound.page){}busy=false;sched()},close)}
  pb.onclick=function(){userPaused=!userPaused;pb.setAttribute('aria-pressed',userPaused);pb.textContent=userPaused?'▶ Play':'❚❚ Pause';sched()};
  if(rm){pb.setAttribute('aria-pressed','true');pb.textContent='▶ Play'}
  root.querySelector('.prev').onclick=function(){go(i-1,true)};root.querySelector('.next').onclick=function(){go(i+1,true)};
  root.addEventListener('mouseenter',function(){hover=true;clearTimeout(timer)});root.addEventListener('mouseleave',function(){hover=false;sched()});
  root.addEventListener('focusin',function(){hover=true;clearTimeout(timer)});root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget)){hover=false;sched()}});
  sc.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')go(i-1,true);if(e.key==='ArrowRight')go(i+1,true)});
  var x0=null;sc.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;e.stopPropagation()},{passive:true});
  sc.addEventListener('touchend',function(e){e.stopPropagation();if(x0==null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>40)go(i+(dx<0?1:-1),true)});
  render();requestAnimationFrame(function(){sc.classList.add('open');sched()});
})();
