/* Professional pages without app.js: menu toggle for the shared header. */
(function(){var b=document.querySelector('.top .menu'),n=document.getElementById('nav');if(!b||!n)return;
b.addEventListener('click',function(){var o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!o));n.classList.toggle('open',!o);});})();
