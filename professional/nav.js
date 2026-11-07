/* Professional pages without app.js: menu toggle for the shared header. */
(function(){var b=document.querySelector('.top .menu'),n=document.getElementById('nav');if(!b||!n)return;
b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!o));n.classList.toggle('open',!o);});})();
/* Skip target and sticky crisis offset. Main is focusable; anchors clear the crisis bar. */
(function(){var main=document.getElementById('main');if(main&&!main.hasAttribute('tabindex'))main.setAttribute('tabindex','-1');
var crisis=document.querySelector('.crisis');function fit(){var h=crisis?Math.ceil(crisis.getBoundingClientRect().height):0;document.documentElement.style.setProperty('--crisis-h',h+'px');}
fit();if(crisis&&window.ResizeObserver)new ResizeObserver(fit).observe(crisis);else window.addEventListener('resize',fit);})();
