/* Original hand-drawn magic carpet: click -> choose office -> carpet flies away -> Google Maps (same tab). */
(function(){
  var OFFICES={
    draper:{name:'Draper',url:'https://www.google.com/maps/search/?api=1&query=12401%20S.%20450%20E%2C%20Suite%20F2%2C%20Draper%2C%20UT%2084020'},
    bountiful:{name:'Bountiful',url:'https://www.google.com/maps/search/?api=1&query=420%20W%201500%20S%2C%20Suite%20100%2C%20Bountiful%2C%20UT%2084010'}
  };
  var SVG='<svg viewBox="0 0 240 120" aria-hidden="true" focusable="false"><defs>'
   +'<linearGradient id="cpG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a2d2b"/><stop offset=".55" stop-color="#6e1f24"/><stop offset="1" stop-color="#4a1418"/></linearGradient>'
   +'<linearGradient id="cpS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>'
   +'<ellipse cx="120" cy="108" rx="80" ry="7" fill="url(#cpS)"/>'
   +'<path class="cp-body" d="M30 52 C70 34 110 66 150 48 C178 36 200 44 214 52 L206 84 C190 76 168 70 140 82 C104 98 66 70 24 86 Z" fill="url(#cpG)" stroke="#3a0f12" stroke-width="2"/>'
   +'<path d="M38 58 C74 44 110 72 148 56 C172 46 192 52 204 58 L198 78 C184 72 166 68 140 78 C106 92 70 66 32 80 Z" fill="none" stroke="#c89b3c" stroke-width="3"/>'
   +'<path d="M50 64 C80 56 110 76 146 64 C166 58 182 62 192 66" fill="none" stroke="#1f5a5e" stroke-width="5" stroke-linecap="round"/>'
   +'<g fill="#eadcbc" stroke="#c89b3c" stroke-width="1.5"><path d="M86 66 l8 -6 l8 6 l-8 6z"/><path d="M128 70 l8 -6 l8 6 l-8 6z"/><path d="M166 62 l7 -5 l7 5 l-7 5z"/></g>'
   +'<g stroke="#c89b3c" stroke-width="2.5" stroke-linecap="round"><path d="M24 86 l-6 6M27 78 l-8 3M30 70 l-8 0M30 60 l-8 -3"/><path d="M206 84 l6 6M209 76 l8 2M211 68 l8 0M213 58 l8 -2"/></g>'
   +'</svg>';
  function init(){
    var host=document.querySelector('#locations .page.right');if(!host||document.getElementById('carpet-btn'))return;
    var wrap=document.createElement('div');wrap.className='carpet-wrap';
    wrap.innerHTML='<button type="button" id="carpet-btn" class="carpet-btn" aria-haspopup="dialog" aria-label="Magic carpet: travel to one of our offices on Google Maps">'+SVG+'<span class="carpet-cap">Ride the magic carpet to an office</span></button>';
    var hours=host.querySelectorAll('.card')[2];host.insertBefore(wrap,hours||null);
    var dlg=document.createElement('div');dlg.className='carpet-dlg';dlg.hidden=true;
    dlg.innerHTML='<div class="carpet-dlg-box" role="dialog" aria-modal="true" aria-labelledby="carpet-q"><button type="button" class="carpet-x" aria-label="Close">×</button><h3 id="carpet-q">Travel to Draper or Bountiful?</h3><div class="carpet-choices"><button type="button" class="btn" data-office="draper">Draper</button><button type="button" class="btn" data-office="bountiful">Bountiful</button></div></div>';
    document.body.appendChild(dlg);
    var btn=wrap.querySelector('#carpet-btn'),busy=false;
    function open(){dlg.hidden=false;dlg.querySelector('[data-office]').focus();}
    function close(){dlg.hidden=true;btn.focus();}
    btn.addEventListener('click',open);
    dlg.querySelector('.carpet-x').addEventListener('click',close);
    dlg.addEventListener('click',function(e){if(e.target===dlg)close();});
    document.addEventListener('keydown',function(e){
      if(dlg.hidden)return;
      if(e.key==='Escape'){e.preventDefault();close();}
      if(e.key==='Tab'){var f=dlg.querySelectorAll('button'),a=f[0],z=f[f.length-1];
        if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
    });
    dlg.querySelectorAll('[data-office]').forEach(function(b){b.addEventListener('click',function(){
      if(busy)return;busy=true;var o=OFFICES[b.dataset.office];dlg.hidden=true;
      var go=function(){window.location.assign(o.url);};
      if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){go();return;}
      var r=btn.querySelector('svg').getBoundingClientRect();
      var fly=document.createElement('div');fly.className='carpet-fly';fly.innerHTML=SVG;
      fly.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
      document.body.appendChild(fly);btn.classList.add('carpet-gone');
      var done=false,fin=function(){if(!done){done=true;go();}};
      fly.addEventListener('animationend',fin);setTimeout(fin,1500);
    });});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
