(function(){const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;if(RM||!('IntersectionObserver'in window))return;
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('turn');io.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('main>section').forEach(s=>{s.classList.add('page');io.observe(s);});})();
