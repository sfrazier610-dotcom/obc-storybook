(function(){
"use strict";
var KEY="obc_world_v2",RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
var REG=[
 {id:"hub",name:"Hearthstead",sub:"Hub town",x:.5,y:.5,hub:1,desc:"Your home base. Phase 5 adds decorating and crafting here."},
 {id:"anx",name:"Whirligust Heights",sub:"Anxiety",x:.2,y:.2,boss:"The Whirligust",guide:"amber",col:"#9fc6e8"},
 {id:"ptsd",name:"Echo Hollow",sub:"PTSD",x:.5,y:.13,boss:"The Echo Warden",guide:"abby",col:"#b6a0d6"},
 {id:"rel",name:"Rift Bridge",sub:"Relationships",x:.8,y:.2,boss:"The Rift Twins",guide:"shanna",col:"#e8a59f"},
 {id:"ocd",name:"Loopwright Works",sub:"OCD",x:.86,y:.55,boss:"The Loopwright",guide:"aspen",col:"#d6c08a"},
 {id:"adhd",name:"Flicker Glade",sub:"ADHD",x:.72,y:.85,boss:"The Flicker Sprite",guide:"aspen",col:"#a6e3a0"},
 {id:"ed",name:"Mirror Mist Lake",sub:"Eating disorder",x:.3,y:.85,boss:"The Mirror Mist",guide:"scott",col:"#a0d6d0"},
 {id:"grief",name:"Lantern Meadow",sub:"Grief and loss",x:.13,y:.55,boss:"The Lantern Keeper",guide:"amanda",col:"#f0c98a"},
 {id:"fog",name:"Fog Marsh",sub:"Depression",x:.36,y:.38,boss:"The Fogstorm",guide:"shanna",col:"#c3c8cf"},
 {id:"office",name:"Open Book Office",sub:"Finale",x:.64,y:.4,office:1}
];
var BOSS=["anx","ptsd","rel","ocd","adhd","ed","grief","fog"];
var OPT={
 cloak:["#3f6fb5","#b5533f","#3f9b6f","#8a5ab5","#c9a03f","#4a4a5a"],
 outfit:["Cloak","Vest","Hoodie"],
 hair:["#2a1a10","#6b4423","#c98b3f","#e8d18a","#9a9aa0","#b53f6f"],
 skin:["#f3d2b5","#e0b48e","#c08a5e","#8d5a36","#5e3a22"],
 extra:["None","Scarf","Hat","Glasses"],
 pet:["Kenneth (cat)","Ragnar (dog)","Orion (dog)"]
};
function def(){return{v:1,hero:{name:"",cloak:0,outfit:0,hair:1,skin:1,extra:0,pet:1},pv:2,made:0,at:"hub",visited:["hub"],beaten:[],pick:{},loot:[],code:""}}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.v===1)return s}catch(e){}return null}
var S=load()||def();if(!("pv" in S)){S.hero.pet=S.hero.pet===3?0:1;S.pv=2}if(!(S.hero.pet>=0&&S.hero.pet<3))S.hero.pet=1;(function(){var d=def();for(var k in d)if(!(k in S))S[k]=d[k]})();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
var app=document.getElementById("w-app");
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

/* ---------- voxel art (original block models; style only, no outside assets) ---------- */
function heroModel(h){return VX.sprite("h"+[h.outfit,h.cloak,h.hair,h.skin,h.extra].join(""),function(m){
 var cl=OPT.cloak[h.cloak],sk=OPT.skin[h.skin],hr=OPT.hair[h.hair],dk="#2b2f3d",pn="#3b4256";
 m.box(-3,0,1,3,1,3,dk).box(1,0,1,3,1,3,dk);                 // boots
 m.box(-3,1,1,2,3,3,pn).box(1,1,1,2,3,3,pn);                 // legs
 m.box(-4,4,1,8,6,4,cl);                                     // torso
 if(h.outfit===0){m.box(-5,2,3,10,8,2,VX.shade(cl,.85));m.box(-4,9,0,8,1,1,"#e9d9a8")}          // cloak + clasp row
 if(h.outfit===1){m.box(-1,4,0,2,6,1,"#f4efe4");m.box(-4,4,0,3,6,1,cl);m.box(1,4,0,3,6,1,cl)}   // vest over shirt
 if(h.outfit===2){m.box(-3,5,0,6,2,1,VX.shade(cl,.85));m.box(-4,10,4,8,3,2,cl)}                 // hoodie pocket + hood
 m.box(-6,5,2,2,5,2,cl).box(4,5,2,2,5,2,cl).box(-6,4,2,2,1,2,sk).box(4,4,2,2,1,2,sk);         // arms, hands
 m.box(-4,10,0,8,8,6,sk);                                    // big chunky head
 m.box(-4,17,0,8,2,6,hr).box(-4,13,5,8,5,1,hr).box(-4,14,1,1,3,4,hr).box(3,14,1,1,3,4,hr).box(-3,16,0,6,1,1,hr);
 m.set(-2,13,0,dk).set(-2,14,0,dk).set(1,13,0,dk).set(1,14,0,dk);   // eyes
 m.set(-1,11,0,"#c0605a").set(0,11,0,"#c0605a");                   // smile
 if(h.extra===1)m.box(-5,9,0,10,1,6,"#d6c08a").box(2,6,0,2,3,1,"#d6c08a");
 if(h.extra===2)m.box(-6,19,-1,12,1,8,"#4a3d22").box(-4,20,0,8,3,6,"#4a3d22").box(-4,20,0,8,1,1,"#c9853a");
 if(h.extra===3)m.box(-3,15,-1,3,1,1,"#1d2433").box(1,15,-1,3,1,1,"#1d2433").box(-3,12,-1,1,3,1,"#1d2433").box(3,12,-1,1,3,1,"#1d2433").set(0,15,-1,"#1d2433");
 return m})}
var PETN=["Kenneth","Ragnar","Orion"];
function petName(){return PETN[S.hero.pet]}
function petModel(p){return VX.sprite("p"+(p?1:0),function(m){
 if(p===0){ /* Kenneth: upright ginger tabby with red cape and red book (original voxel model) */
  var o="#e8973f",st="#b8621f",w="#fbf3e6",cp="#c8352b",bk="#d9452f",dk="#2a1e18";
  m.box(-2,0,0,2,1,2,w).box(1,0,0,2,1,2,w).box(-2,1,1,2,2,2,o).box(1,1,1,2,2,2,o);            // white feet, hind legs
  m.box(-3,3,1,6,6,3,o).box(-1,3,0,2,5,1,w);                                                    // body, white chest
  m.box(-3,4,1,6,1,3,st).box(-3,6,1,6,1,3,st).set(-1,4,0,w).set(0,4,0,w).set(-1,6,0,w).set(0,6,0,w); // tabby stripes
  m.box(-3,9,0,6,5,4,o).box(-3,12,1,6,1,3,st).set(-1,13,0,st).set(0,13,0,st);                   // head, forehead stripes
  m.box(-2,9,-1,4,2,1,w).set(-1,11,-1,"#e88a9a").set(0,11,-1,"#e88a9a");                         // white muzzle, pink nose
  m.set(-2,12,-1,"#e0a020").set(1,12,-1,"#e0a020").set(-2,12,-2,dk).set(1,12,-2,dk);           // amber eyes
  m.box(-3,14,1,2,2,2,o).box(1,14,1,2,2,2,o).set(-3,14,0,"#f2b0a8").set(2,14,0,"#f2b0a8");     // ears
  m.box(-4,8,3,8,1,2,cp).box(-5,3,4,9,5,1,cp).box(-7,2,4,3,4,1,cp).box(-8,1,4,2,2,1,VX.shade(cp,.85)); // red cape flowing back-left
  m.box(3,5,0,1,2,1,o).set(3,5,-1,w);                                                           // paw
  m.box(4,4,-1,3,4,1,bk).box(4,4,0,3,4,1,"#f4e6cc").box(4,4,0,1,4,1,VX.shade(bk,.8));           // red book with pages
  m.box(-5,1,2,2,1,1,o).box(-6,1,2,1,3,1,st);                                                   // tail
 }else{ /* Ragnar / Orion: silver-and-tan long coat, dark face, big upright ears */
  var sv="#c4c4c8",lt="#e6e4e0",tn="#c8964f",dk="#2e2a28",sd="#77737a";
  m.box(-4,2,0,8,4,4,sv).box(-4,5,0,8,1,4,sd).box(-4,1,0,8,1,4,lt);         // body, saddle, long coat skirt
  m.box(-4,0,0,2,1,1,tn).box(2,0,0,2,1,1,tn).box(-4,0,3,2,1,1,tn).box(2,0,3,2,1,1,tn);   // tan paws
  m.box(3,4,0,4,5,4,sv).box(3,4,-1,4,2,1,lt);                              // head, chest ruff
  m.box(4,6,-1,2,2,1,dk).box(4,5,-2,2,2,1,tn).set(4,6,-3,dk).set(5,6,-3,dk); // dark face mask, tan muzzle, nose
  m.set(3,7,-1,dk).set(6,7,-1,dk);                                          // eyes in the mask
  m.box(3,9,1,1,3,2,dk).box(6,9,1,1,3,2,dk).set(3,9,0,tn).set(6,9,0,tn);    // big upright ears
  m.box(-5,5,1,1,4,2,sv).box(-4,8,1,2,1,2,lt);                              // curled fluffy tail
 }
 return m})}
function drawPet(x,p){ /* origin = feet, 1 unit ~ old pet units */
 VX.shadow(x,0,9,12,3);VX.draw(x,petModel(p),0,8,2.6);
 x.fillStyle="#fff8e6";x.strokeStyle="rgba(20,24,36,.7)";x.lineWidth=3;x.font="bold 8px system-ui,sans-serif";x.textAlign="center";x.strokeText(PETN[p],0,20);x.fillText(PETN[p],0,20);
}
function drawHero(c,h,sc,bob){
 var x=c.getContext("2d"),W=c.width,H=c.height;x.save();x.translate(W/2,H/2+(bob||0));x.scale(sc,sc);
 VX.shadow(x,0,39,22,5);VX.draw(x,heroModel(h),0,38,3.3);
 x.translate(36,30);drawPet(x,h.pet);x.restore();
}
/* trees, buildings and landmarks */
function treeModel(v){return VX.sprite("t"+v,function(m){var lf=["#5fbf5a","#4fae64","#7fcc4f"][v];
 m.box(0,0,0,2,4,2,"#8a5a3a");m.ball(1,7,1,3,function(i,j,k){return (i+j+k)%3?lf:VX.shade(lf,1.12)},3);if(v===2)m.ball(1,11,1,2,lf);return m})}
function lmModel(id,col){return VX.sprite("l"+id,function(m){
 switch(id){
  case"hub":m.box(-4,0,0,8,5,6,"#f0d9b0").box(-5,5,-1,10,1,8,"#d0603f").box(-4,6,0,8,1,6,"#d0603f").box(-3,7,1,6,1,4,"#d0603f").box(-1,0,-1,2,3,1,"#7a4a2a").box(2,2,-1,1,1,1,"#ffd98a").box(-3,2,-1,1,1,1,"#ffd98a").box(2,8,3,1,2,1,"#8a8a90");break;
  case"office":m.box(-5,0,0,10,7,6,"#f4efe4").box(-5,7,0,10,1,6,"#3f6fb5").box(-2,0,-1,4,4,1,"#7a4a2a").set(0,0,-1,null).set(0,1,-1,null).set(0,2,-1,null).set(0,3,-1,"#f4efe4");
   for(var i=-4;i<5;i+=7)m.box(i,4,-1,2,2,1,"#9fd4f0");break;
  case"anx":m.box(-1,0,0,2,7,2,"#8a9ab0").box(-2,7,-1,4,1,4,col);break;
  case"ptsd":m.box(-5,0,0,10,6,5,col).box(-2,0,-1,4,4,6,"#26304a").box(-4,6,1,8,1,3,col);break;
  case"rel":m.box(-6,0,0,4,3,3,"#8a5a3a").box(2,0,0,4,3,3,"#8a5a3a").box(-6,3,0,4,1,3,col).box(2,3,0,4,1,3,col);break;
  case"ocd":m.box(-3,0,0,6,6,4,col).box(-1,6,1,2,1,2,"#6a5a30").box(-4,2,1,1,2,2,col).box(3,2,1,1,2,2,col).box(-1,2,-1,2,2,1,"#6a5a30");break;
  case"adhd":m.box(-4,0,0,8,1,6,"#4f9e48").ball(0,3,3,2,col);break;
  case"ed":m.box(-6,0,0,12,1,6,"#6fb8d8").box(-5,1,1,4,1,2,"#e8f4f2").box(1,1,3,4,1,2,"#e8f4f2");break;
  case"grief":m.box(0,0,1,1,6,1,"#4a3d22").box(-1,6,0,3,3,3,col).set(0,7,-1,"#fff4cc").box(-1,9,1,3,1,1,"#4a3d22");break;
  case"fog":m.ball(-3,4,2,3,col,2).ball(2,5,2,3,col,3).ball(5,3,2,2,col);break;
 }return m})}
function cube(col){return VX.sprite("c"+col,function(m){return m.set(0,0,0,col)})}
function landmark(x,r,cx,cy,t){
 var bob=RM?0:Math.sin(t*2+cx)*1.5;VX.shadow(x,cx,cy+6,24,6);
 VX.draw(x,lmModel(r.id,r.col||"#ffd98a"),cx,cy+6+(r.id==="fog"||r.id==="anx"?bob:0),3.4);
 if(r.id==="anx"||r.id==="adhd")for(var i=0;i<4;i++){var a=i*1.57+t*(RM?0:1.6);VX.draw(x,cube(r.col),cx+Math.cos(a)*16,cy+8+Math.sin(a)*5,3.4)}
}
var MAPBG=null;
function mapBG(W,H,d){
 var k=W+"x"+H+"x"+d;if(MAPBG&&MAPBG.k===k)return MAPBG.c;
 var c=document.createElement("canvas");c.width=W*d;c.height=H*d;var x=c.getContext("2d");x.scale(d,d);
 var T=Math.max(14,Math.round(Math.min(W,H)/20)),cols=Math.ceil(W/T)+1,rows=Math.ceil(H/T)+1,hub=R("hub"),path={};
 x.fillStyle="#a7dcef";x.fillRect(0,0,W,H);
 REG.forEach(function(r){if(r.hub)return;for(var s=0;s<=1;s+=.01){var u=1-s,mx=(hub.x+r.x)/2*W+20,my=(hub.y+r.y)/2*H-20,
  px=u*u*hub.x*W+2*u*s*mx+s*s*r.x*W,py=u*u*hub.y*H+2*u*s*my+s*s*r.y*H;path[Math.floor(px/T)+","+Math.floor(py/T)]=1}});
 for(var j=0;j<rows;j++)for(var i=0;i<cols;i++){var p=path[i+","+j],base=p?"#e8c98a":((i+j)%2?"#7fd36a":"#74c962");
  x.fillStyle=VX.shade(base,.7);x.fillRect(i*T,j*T,T,T);            // side under tile
  x.fillStyle=base;x.fillRect(i*T,j*T-3,T-1,T-1);                     // raised top
  x.fillStyle="rgba(255,255,255,.12)";x.fillRect(i*T,j*T-3,T-1,2)}
 // trees on free tiles, deterministic, away from regions and paths
 var seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
 var trees=[];for(var n=0;n<60;n++){var tx=rnd()*W,ty=rnd()*H,ok=!path[Math.floor(tx/T)+","+Math.floor(ty/T)];
  REG.forEach(function(r){if(Math.hypot(r.x*W-tx,(r.y*H-20)-ty)<Math.min(W,H)*.13)ok=0});if(ok)trees.push([tx,ty,n%3])}
 trees.sort(function(a,b){return a[1]-b[1]}).forEach(function(t){VX.shadow(x,t[0]+2,t[1],9,3);VX.draw(x,treeModel(t[2]),t[0]-3,t[1],Math.max(2.2,T/7))});
 MAPBG={k:k,c:c};return c}

/* ---------- hero screen ---------- */
function heroScreen(){
 var h=S.hero;
 function chips(k,label,sw){return '<fieldset><legend>'+label+'</legend>'+OPT[k].map(function(v,i){
  return '<button type="button" class="w-chip'+(sw?' w-sw':'')+'" data-k="'+k+'" data-i="'+i+'" aria-pressed="'+(h[k]===i)+'" aria-label="'+label+' '+(sw?'option '+(i+1):v)+'"'+(sw?' style="background:'+v+'"':'')+'>'+(sw?'':esc(v))+'</button>'}).join("")+'</fieldset>'}
 app.innerHTML='<div class="w-top"><h1>Make your hero</h1><span class="w-hint">No size or shape options, just style.</span></div>'+
 '<div class="w-hero"><div class="w-prev"><canvas id="w-hc" width="240" height="200" aria-label="Hero preview" role="img"></canvas></div><div class="w-opts">'+
 '<label>Hero name <input id="w-name" maxlength="16" value="'+esc(h.name)+'" placeholder="Wanderer" autocomplete="off"></label>'+
 chips("outfit","Outfit")+chips("cloak","Outfit color",1)+chips("hair","Hair color",1)+chips("skin","Skin tone",1)+chips("extra","Accessory")+chips("pet","Support animal")+
 '</div></div><div class="w-panel"><p>You can change your look any time from the map.</p><button class="w-btn pri" id="w-go">'+(S.made?'Back to the map':'Start exploring')+'</button></div>';
 var c=document.getElementById("w-hc");function rd(){c.getContext("2d").clearRect(0,0,c.width,c.height);drawHero(c,h,1.9)}rd();
 app.querySelectorAll(".w-chip").forEach(function(b){b.onclick=function(){var k=b.dataset.k;h[k]=+b.dataset.i;
  app.querySelectorAll('[data-k="'+k+'"]').forEach(function(o){o.setAttribute("aria-pressed",o===b)});rd();save()}});
 document.getElementById("w-name").oninput=function(e){h.name=e.target.value.slice(0,16);save()};
 document.getElementById("w-go").onclick=function(){S.made=1;save();mapScreen()};
}

/* ---------- map screen ---------- */
var raf=0,tok={x:.5,y:.5};
function R(id){for(var i=0;i<REG.length;i++)if(REG[i].id===id)return REG[i]}
function officeOpen(){return BOSS.every(function(b){return S.beaten.indexOf(b)>=0})}
function mapScreen(){
 var cur=R(S.at)||REG[0];tok={x:cur.x,y:cur.y};
 app.innerHTML='<div class="w-top"><h1>The Open World</h1><span class="w-hint">Every region is open. Arrow keys or tap to travel, Enter to visit.</span>'+
 '<span><button class="w-btn" id="w-hall">Hall of Guides</button> <button class="w-btn" id="w-edit">Edit hero</button> <button class="w-btn" id="w-new">New game</button></span></div>'+
 '<div class="w-map" id="w-map"><canvas id="w-mc" aria-hidden="true"></canvas>'+
 REG.map(function(r){var done=S.beaten.indexOf(r.id)>=0,lock=r.office&&!officeOpen();
  return '<button class="w-node'+(r.hub?' hub':'')+(done?' done':'')+'" data-id="'+r.id+'" style="left:'+r.x*100+'%;top:'+r.y*100+'%"'+(lock?' aria-disabled="true"':'')+
  ' aria-label="'+esc(r.name+", "+r.sub+(done?", cleared":"")+(lock?", opens after all eight bosses":""))+'">'+esc(r.name)+'<small>'+esc(r.sub)+'</small></button>'}).join("")+
 '</div><div class="w-panel" id="w-pan"></div>';
 var map=document.getElementById("w-map"),cv=document.getElementById("w-mc");
 function size(){var r=map.getBoundingClientRect(),d=Math.min(2,devicePixelRatio||1);cv.width=r.width*d;cv.height=r.height*d;cv._d=d}
 size();window.onresize=size;
 app.querySelectorAll(".w-node").forEach(function(b){b.onclick=function(){go(b.dataset.id,1)};b.onfocus=function(){go(b.dataset.id,0)};b.onkeydown=keys});
 document.getElementById("w-edit").onclick=heroScreen;document.getElementById("w-hall").onclick=function(){hallScreen()};
 document.getElementById("w-new").onclick=function(){if(confirm("Start a new game? This clears your saved hero and progress on this device.")){S=def();save();heroScreen()}};
 panel(cur);
 var t0=performance.now();cancelAnimationFrame(raf);
 (function loop(t){if(!document.body.contains(cv))return;
  var to=R(S.at);tok.x+=(to.x-tok.x)*(RM?1:.15);tok.y+=(to.y-tok.y)*(RM?1:.15);
  paint(cv,(t-t0)/1000);raf=requestAnimationFrame(loop)})(t0);
 var f=app.querySelector('.w-node[data-id="'+S.at+'"]');if(f)f.classList.add("sel");
}
function go(id,enter){
 S.at=id;if(S.visited.indexOf(id)<0)S.visited.push(id);save();
 app.querySelectorAll(".w-node").forEach(function(n){n.classList.toggle("sel",n.dataset.id===id)});
 panel(R(id),enter);
}
function keys(e){
 var dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
 if(!dir)return;e.preventDefault();var c=R(S.at),best=null,bs=1e9;
 REG.forEach(function(r){if(r===c)return;var dx=r.x-c.x,dy=r.y-c.y,along=dx*dir[0]+dy*dir[1];if(along<=0.01)return;
  var off=Math.abs(dx*dir[1])+Math.abs(dy*dir[0]),sc=along+off*2;if(sc<bs){bs=sc;best=r}});
 if(best){var b=app.querySelector('.w-node[data-id="'+best.id+'"]');b.focus()}
}
function panel(r,enter){
 var p=document.getElementById("w-pan"),h=S.hero,nm=h.name||"Wanderer",html,n=S.beaten.length;
 if(r.hub)html='<p><b>'+esc(r.name)+'</b>: '+esc(nm)+' and '+petName()+' rest here. Bosses cleared: '+n+' of 8.'+(S.loot.length?' Satchel: '+S.loot.map(esc).join(", ")+'.':'')+'</p><button class="w-btn" id="w-hall2">Hall of Guides</button>';
 else if(r.office)html=officeOpen()?'<p><b>Open Book Office</b>: all eight bosses are cleared. The door is open.</p><button class="w-btn pri" id="w-off">Enter the office</button>':'<p><b>Open Book Office</b>: opens after all eight bosses are cleared, in any order. Cleared: '+n+' of 8.</p>';
 else{var g=guideOf(r.id),done=S.beaten.indexOf(r.id)>=0;
  html='<p><b>'+esc(r.name)+'</b> ('+esc(r.sub)+'): '+esc(r.boss)+(done?' has been calmed. You can face it again any time.':' waits here.')+' Your guide: '+esc(g.name)+'.</p><span><button class="w-btn" id="w-pickg">Change guide</button> <button class="w-btn pri" id="w-fight">'+(done?'Face it again':'Face '+esc(r.boss))+'</button></span>'}
 p.innerHTML=html;
 var b;if(b=document.getElementById("w-fight"))b.onclick=function(){battle(r.id)};
 if(b=document.getElementById("w-pickg"))b.onclick=function(){hallScreen(r.id)};
 if(b=document.getElementById("w-hall2"))b.onclick=function(){hallScreen()};
 if(b=document.getElementById("w-off"))b.onclick=officeScreen;
}
function paint(cv,t){
 var x=cv.getContext("2d"),d=cv._d||1,W=cv.width/d,H=cv.height/d;if(W<2||H<2)return;x.setTransform(1,0,0,1,0,0);
 x.drawImage(mapBG(W,H,d),0,0);x.setTransform(d,0,0,d,0,0);
 REG.slice().sort(function(a,b){return a.y-b.y}).forEach(function(r){landmark(x,r,r.x*W,r.y*H-30,t)});
 var tx=tok.x*W+34,ty=tok.y*H+10,bob=RM?0:Math.abs(Math.sin(t*3))*-2;
 x.save();x.translate(tx,ty+bob);drawHero({getContext:function(){return x},width:0,height:0},S.hero,.45,0);x.restore();
}
/* ===== Hall of Guides, boss battles, office finale ===== */
var CFG={breath:true};
var CL=(window.OBC&&window.OBC.clinicians)||[];
function C(id){for(var i=0;i<CL.length;i++)if(CL[i].id===id)return CL[i];return{id:id,name:id,cred:"",concerns:[],mods:[]}}
function guideOf(rid){return C(S.pick[rid]||R(rid).guide)}
var TAG={trauma:"Trauma",abuse:"Abuse",anxiety:"Anxiety",depression:"Depression",eating:"Eating disorders",ocd:"OCD",adhd:"ADHD",addiction:"Addiction",personality:"Personality",highprofile:"High-profile clients",lgbtq:"LGBTQ+",grief:"Grief",shame:"Shame",family:"Family",faith:"Faith transitions",transitions:"Life transitions",relationships:"Relationships",autism:"Autism",selfharm:"Self-harm",chronic:"Chronic illness",attachment:"Attachment",dysregulation:"Emotional regulation",burnout:"Burnout"};
function focus(c){var l=c.specialties&&c.specialties.length?c.specialties.slice():(c.concerns||[]).map(function(t){return TAG[t]||t}),k=/Trauma|PTSD|Anxiety|Depression|Obsessive|OCD|ADHD|Eating|Grief|Relationship/;return l.filter(function(v){return k.test(v)}).concat(l.filter(function(v){return !k.test(v)}))}
function portrait(id){return "../img/q-pt-"+id+".webp"}
function hallScreen(rid){
 cancelAnimationFrame(raf);
 var r=rid&&R(rid);
 app.innerHTML='<div class="w-top"><h1>Hall of Guides</h1><span class="w-hint">'+(r?'Pick any guide for '+esc(r.name)+'.':'Any guide can walk with you in any region.')+'</span><button class="w-btn" id="w-back">Back to the map</button></div>'+
 '<div class="w-hall">'+CL.map(function(c){
  var leads=REG.filter(function(x){return x.guide===c.id}).map(function(x){return x.sub}),f=focus(c),cur=r&&guideOf(rid).id===c.id;
  return '<article class="w-gcard'+(cur?' cur':'')+'"><img src="'+portrait(c.id)+'" alt="Illustrated portrait of '+esc(c.name)+'" width="72" height="72" loading="lazy"><div><h2>'+esc(c.name)+'</h2><p class="w-cred">'+esc(c.cred)+'</p>'+
  '<p class="w-focus"><span>Focus areas:</span> '+f.slice(0,6).map(esc).join(", ")+(f.length>6?' and more':'')+'</p>'+
  (leads.length?'<p class="w-lead">Suggested guide for: '+leads.map(esc).join(", ")+'</p>':'')+
  '<p class="w-gact">'+(r?'<button class="w-btn'+(cur?'':' pri')+'" data-g="'+c.id+'">'+(cur?'Current guide':'Choose for this region')+'</button> ':'')+
  '<a href="../#team" target="_blank" rel="noopener">Meet the real clinician</a></p></div></article>'}).join("")+'</div>'+
 '<div class="w-panel"><p>Portraits are filtered photos of the real Open Book Counseling team. Guides in the game are characters; the real clinicians are linked above.</p></div>';
 document.getElementById("w-back").onclick=function(){mapScreen();var b=r&&app.querySelector('.w-node[data-id="'+r.id+'"]');if(b)b.focus()};
 app.querySelectorAll("[data-g]").forEach(function(b){b.onclick=function(){S.pick[rid]=b.dataset.g;save();hallScreen(rid);var n=app.querySelector('[data-g="'+b.dataset.g+'"]');if(n)n.focus()}});
 var h=app.querySelector("h1");h.tabIndex=-1;h.focus();
}

/* boss data: 4 skills each (weak spot rotates through them), real-life line per skill, plus a twist */
var BD={
 anx:{name:"The Whirligust",hp:30,loot:"Calm Stone",col:"#9fc6e8",
  sk:[["breath","Box Breathing","Racing heart","In 4, hold 4, out 4, hold 4. Try it at a red light or before a hard email."],
      ["ground","5-4-3-2-1 Grounding","Spinning room","Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste."],
      ["reframe","Thought-Bending","What-if storm","Ask: what is most likely, not just most scary? Write the balanced thought down."],
      ["step","Step Toward It","Urge to avoid","Pick one small thing you have been avoiding and do 5 minutes of it today."]],
  twist:"gust",tip:"Each turn you miss its weak spot, the gusts stack and hit harder."},
 ptsd:{name:"The Echo Warden",hp:26,loot:"Anchor Charm",col:"#b6a0d6",
  sk:[["ground","Grounding in the Now","Echo of the past","Feet on the floor. Say today's date and where you are, out loud."],
      ["safe","Safe Place","Alarm bells","Picture a place where you feel safe. Notice its colors, sounds and temperature."],
      ["breath","Slow Breath","Tight chest","Breathe out longer than you breathe in. Six slow breaths can settle your body."],
      ["reach","Reach Toward Support","Feeling alone","Text one safe person: \"Rough moment, can you talk?\""]],
  twist:"echo",tip:"Every third turn an echo rises. Ground yourself in the now or it hits twice."},
 rel:{name:"The Rift Twins",hp:26,loot:"Bridge Plank",col:"#e8a59f",
  sk:[["listen","Listen First","Defensiveness","Repeat back what you heard before you answer: \"So you felt…\""],
      ["soft","Soft Start-Up","Criticism","Start with \"I feel… about… and I need…\" instead of \"You always…\""],
      ["pause","Pause and Return","Shutting down","Say \"I need 20 minutes, then I'll come back,\" and come back."],
      ["repair","Repair Attempt","Contempt","A small \"I'm sorry, let me try that again\" can turn a fight around."]],
  twist:"listen",tip:"Repair and Soft Start-Up land fully only after you've listened in the last two turns."},
 ocd:{name:"The Loopwright",hp:28,loot:"Unlocked Key",col:"#d6c08a",
  sk:[["erp","Let the Urge Pass","Pull to check","Notice the urge, don't act on it, and let the wave rise and fall on its own."],
      ["name","Name the Doubt","Sticky thought","Say \"That's an OCD thought,\" not \"That's a fact.\""],
      ["kind","Self-Kindness","Guilt spiral","Talk to yourself the way you'd talk to a friend having this thought."],
      ["values","Values Step","Stuck in loops","Do one thing that matters to you while the doubt is still there."]],
  twist:"lock",tip:"Checking feels like relief now but adds locks. Letting the urge pass breaks every lock."},
 adhd:{name:"The Flicker Sprite",hp:30,loot:"Focus Bell",col:"#a6e3a0",
  sk:[["quest","Small-Quest Log","Too-big task","Break the task into a first step that takes under 2 minutes."],
      ["timer","Timer Burst","Time slipping","Set a 10-minute timer and work only until it rings."],
      ["double","Body Double","Can't start","Work next to someone, in person or on a call, while you both do your tasks."],
      ["kind","Self-Kindness","Shame spiral","Your brain works differently, not badly. Name one thing you did finish."]],
  twist:"spark",tip:"Switching skills gives a novelty boost. Repeating the same skill makes focus slip."},
 ed:{name:"The Mirror Mist",hp:28,loot:"Kind Mirror",col:"#a0d6d0",noNum:1,
  sk:[["kind","Self-Kindness","Harsh inner voice","Place a hand on your heart and say one kind sentence to yourself."],
      ["values","Values Compass","Lost in the mist","Name what you care about most: people, creativity, adventure, faith."],
      ["reach","Reach Out","Hiding","Tell one trusted person or your care team how today is really going."],
      ["rule","Name the Rule","Rule whispers","Say \"That's the disorder's voice, not mine,\" and choose your own next step."]],
  twist:"shield",tip:"Reaching out raises a shield against the next whisper. Recovery is possible, and support helps."},
 grief:{name:"The Lantern Keeper",hp:26,loot:"Lit Lantern",col:"#f0c98a",gentle:1,
  sk:[["wave","Ride the Wave","A wave of missing","Grief comes in waves. Let it rise, breathe, and let it pass on its own time."],
      ["memory","Share a Memory","Silence","Tell someone a favorite story about the one you miss."],
      ["walk","Let Someone Walk With You","Carrying it alone","Say yes the next time someone offers help, even with something small."],
      ["rest","Rest by the Lantern","Worn out","Grief is tiring. Rest, water and gentle routines are part of grieving."]],
  twist:"wave",tip:"There is no losing here. Each kind act lights a lantern."},
 fog:{name:"The Fogstorm",hp:34,loot:"Sunlit Lamp",col:"#c3c8cf",big:1,
  sk:[["step","Small Step","Heavy morning","Pick one tiny action: open the curtains, shower, step outside for 2 minutes."],
      ["opp","Opposite Action","Pull to hide","When depression says stay in, do the opposite in a small way: one text, one walk."],
      ["kind","Self-Kindness","Inner critic","Swap \"I'm lazy\" for \"I'm struggling, and I'm still trying.\""],
      ["reach","Reach Out","Isolation","Send one message to someone you trust, even just \"thinking of you.\""]],
  twist:"momentum",tip:"Small Steps build momentum: each one makes your next skill stronger."}
};
var SIG={name:"Golden Hour",rl:"Stack two skills: a short walk outside while you call a friend."};
var B=null,bRaf=0;
function battle(id){
 var d=BD[id],g=guideOf(id);cancelAnimationFrame(raf);cancelAnimationFrame(bRaf);
 B={id:id,d:d,g:g,hp:d.hp,max:d.hp,hope:10,hmax:10,turn:0,weak:0,chg:0,last:null,recent:[],gust:0,locks:0,shield:0,mom:0,listen:-9,gUsed:0,over:0,log:[],busy:0,hit:0,crack:0};
 B.weak=Math.floor(Math.random()*4);
 app.innerHTML='<div class="w-bt" role="region" aria-label="Battle with '+esc(d.name)+'">'+
 '<div class="w-btop"><h1>'+esc(d.name)+'</h1><div class="w-bars"><div class="w-bar"><span>'+(d.gentle?'Lanterns lit':d.name.replace("The ",""))+'</span><i><b id="b-bh"></b></i><em id="b-bhn"></em></div>'+
 '<div class="w-bar hope"><span>Your hope</span><i><b id="b-hh"></b></i><em id="b-hhn"></em></div></div><button class="w-btn" id="b-leave">Leave</button></div>'+
 '<div class="w-stage"><canvas id="b-cv" role="img" aria-label="'+esc(d.name)+'"></canvas><div class="w-breath" id="b-br" hidden></div></div>'+
 '<p class="w-warn" id="b-warn"></p><div class="w-msg" id="b-msg" aria-live="polite"></div>'+
 '<div class="w-sk" id="b-sk">'+d.sk.map(function(s,i){return '<button class="w-btn" data-s="'+i+'">'+esc(s[1])+'</button>'}).join("")+'</div>'+
 '<div class="w-sk2"><button class="w-btn pri" id="b-sig" disabled>'+SIG.name+' <small id="b-chg"></small></button><button class="w-btn" id="b-guide">Call '+esc(g.name.split(" ")[0])+'</button>'+
 (d.twist==="lock"?'<button class="w-btn" id="b-check">Check one more time</button>':'')+
 '<label class="w-tog"><input type="checkbox" id="b-btog"'+(CFG.breath?' checked':'')+'> Breath timing</label></div></div>';
 document.getElementById("b-leave").onclick=function(){endBattle();mapScreen();focusNode(id)};
 app.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){act(+b.dataset.s)}});
 document.getElementById("b-sig").onclick=function(){act("sig")};
 document.getElementById("b-guide").onclick=function(){act("guide")};
 var ck=document.getElementById("b-check");if(ck)ck.onclick=function(){act("check")};
 document.getElementById("b-btog").onchange=function(e){CFG.breath=e.target.checked};
 msg(esc(g.name)+' and '+petName()+' are with you. '+esc(d.tip));
 ui();
 var cv=document.getElementById("b-cv"),t0=performance.now();
 (function loop(t){if(!document.body.contains(cv))return;drawBoss(cv,(t-t0)/1000);bRaf=requestAnimationFrame(loop)})(t0);
 app.querySelector("[data-s]").focus();
}
function focusNode(id){var b=app.querySelector('.w-node[data-id="'+id+'"]');if(b)b.focus()}
function endBattle(){cancelAnimationFrame(bRaf);B&&(B.over=1)}
function msg(h,rl){var m=document.getElementById("b-msg");if(m)m.innerHTML='<p>'+h+'</p>'+(rl?'<p class="w-rl"><b>In real life:</b> '+esc(rl)+'</p>':'')}
function ui(){
 var d=B.d,w=d.sk[B.weak];
 function bar(id,v,mx){document.getElementById(id).style.width=Math.max(0,v/mx*100)+"%"}
 if(d.gentle){bar("b-bh",B.max-B.hp,B.max)}else bar("b-bh",B.hp,B.max);
 bar("b-hh",B.hope,B.hmax);
 document.getElementById("b-bhn").textContent=d.noNum?"":d.gentle?(B.max-B.hp)+"/"+B.max:B.hp+"/"+B.max;
 document.getElementById("b-hhn").textContent=d.noNum?"":B.hope+"/"+B.hmax;
 var sb=document.getElementById("b-sig");sb.disabled=B.chg<4||B.busy;document.getElementById("b-chg").textContent=B.chg>=4?"ready":"charging";
 sb.setAttribute("aria-label",SIG.name+(B.chg>=4?", ready":", charging. Use different skills to charge it"));
 var gb=document.getElementById("b-guide");gb.disabled=B.gUsed||B.busy;
 app.querySelectorAll("[data-s]").forEach(function(b){b.disabled=!!B.busy;b.classList.toggle("weak",+b.dataset.s===B.weak)});
 var ck=document.getElementById("b-check");if(ck)ck.disabled=!!B.busy;
 var hit=drain(0),wn=d.twist==="echo"&&(B.turn+1)%3===0?'An echo is rising. ':'';
 if(d.twist==="gust"&&B.gust)wn+='Gusts stacked: '+B.gust+'. ';
 if(d.twist==="lock"&&B.locks)wn+='Locks: '+B.locks+'. ';
 if(d.twist==="shield"&&B.shield)wn+='Your shield is up. ';
 if(d.twist==="momentum"&&B.mom)wn+='Momentum: +'+B.mom+'. ';
 document.getElementById("b-warn").innerHTML=wn+'Watch for: <b>'+esc(w[2])+'</b>. Weak spot: <b>'+esc(w[1])+'</b>'+(d.noNum||d.gentle?'.':'. If missed, the next hit takes '+hit+' hope.');
}
function drain(weakHit){var d=B.d,n=weakHit?1:2;if(d.twist==="gust")n+=weakHit?0:B.gust;if(d.twist==="echo"&&(B.turn+1)%3===0&&!weakHit)n*=2;return n}
function act(k){
 if(B.busy||B.over)return;
 if(k==="guide"){B.gUsed=1;var m=pickMod(B.g,B.id);B.hope=Math.min(B.hmax,B.hope+3);B.shield=Math.max(B.shield,1);
  msg(esc(B.g.name)+' steps in'+(m?' with '+esc(m):'')+'. Your hope rises and a shield forms.','Asking for help is a skill. A therapist can walk with you through hard seasons.');ui();return}
 if(k==="check"){B.locks+=2;B.hope=Math.min(B.hmax,B.hope+1);boss(0);msg('You check one more time. Relief for a moment, and two new locks click shut.','Checking calms the worry briefly, then the urge comes back stronger.');ui();return}
 if(CFG.breath){B.busy=1;ui();breathCast(function(bonus){B.busy=0;resolve(k,bonus)})}else resolve(k,0);
}
function pickMod(g,id){var pref={anx:["CBT","ACT","EMDR"],ptsd:["EMDR","IFS","CBT"],rel:["Gottman","EFT","IFS"],ocd:["ERP","ACT","CBT"],adhd:["CBT","DBT","ACT"],ed:["ACT","DBT","IFS"],grief:["ACT","IFS","EMDR"],fog:["CBT","ACT","DBT"]}[id]||[];
 var mods=g.mods||[];for(var i=0;i<pref.length;i++)for(var j=0;j<mods.length;j++)if(mods[j].indexOf(pref[i])===0)return mods[j];return mods[0]||""}
function resolve(k,bonus){
 var d=B.d,txt,rl,dmg,weakHit=0;
 if(k==="sig"){B.chg=0;dmg=5+bonus;weakHit=1;txt=SIG.name+'! Two skills shine at once.';rl=SIG.rl}
 else{var s=d.sk[k];weakHit=k===B.weak;dmg=2+(weakHit?2:0)+bonus;
  var fresh=B.recent.indexOf(k)<0;B.chg=Math.min(4,B.chg+(fresh?2:(B.last===k?0:1)));
  if(d.twist==="gust"){if(weakHit)B.gust=Math.max(0,B.gust-1);else B.gust++}
  if(d.twist==="listen"){if(s[0]==="listen")B.listen=B.turn;if((s[0]==="repair"||s[0]==="soft")&&B.turn-B.listen>2){dmg=Math.max(1,dmg-2);txt=s[1]+' lands softly. Listening first would help it land.'}}
  if(d.twist==="lock"){if(s[0]==="erp"){dmg+=B.locks;B.locks=0}else dmg=Math.max(1,dmg-Math.min(2,B.locks))}
  if(d.twist==="spark"){if(B.last===k)dmg=Math.max(1,dmg-1);else if(B.last!==null)dmg+=1}
  if(d.twist==="momentum"){dmg+=B.mom;if(s[0]==="step")B.mom=Math.min(2,B.mom+1)}
  if(d.twist==="shield"&&s[0]==="reach")B.shield=1;
  B.recent.push(k);if(B.recent.length>2)B.recent.shift();B.last=k;
  txt=txt||((weakHit?'Weak spot! ':'')+esc(s[1])+(d.gentle?' lights a lantern.':' works.'));rl=s[3]}
 if(bonus)txt+=' Your breath gave it extra strength.';
 B.hp=Math.max(0,B.hp-dmg);B.hit=1;B.crack=weakHit;
 if(B.hp<=0){ui();return win()}
 var lost=boss(weakHit);B.turn++;B.weak=(B.weak+1+Math.floor(Math.random()*3))%4;
 if(d.twist==="lock"&&k!=="sig"&&d.sk[k][0]!=="erp")B.locks=Math.min(3,B.locks+1);
 msg(txt+(lost?(d.noNum||d.gentle?' '+esc(d.name)+' presses in.':' '+esc(d.name)+' strikes: -'+lost+' hope.'):' The hit is blocked.'),rl);
 ui();
 if(B.hope<=0){if(d.gentle){B.hope=B.hmax;msg('You sit and rest by the lantern. The Keeper waits as long as you need. Your hope is restored.','Grief has no deadline. Rest is allowed.');ui()}else lose()}
}
function boss(weakHit){var n=drain(weakHit);if(B.shield){B.shield=0;return 0}B.hope=Math.max(0,B.hope-n);return n}
function win(){
 var d=B.d;endBattle();if(S.beaten.indexOf(B.id)<0)S.beaten.push(B.id);if(S.loot.indexOf(d.loot)<0)S.loot.push(d.loot);save();
 var all=officeOpen();
 app.querySelector(".w-bt").innerHTML='<div class="w-end"><h1>'+esc(d.name)+(d.gentle?' smiles. Every lantern is lit.':(B.id==='rel'?' calm':' calms')+' and drift'+(B.id==='rel'?'':'s')+' away.')+'</h1>'+
 '<p>You found the <b>'+esc(d.loot)+'</b>. It goes in your satchel.</p><p>'+esc(B.g.name)+': "You used real skills there. They work outside the game too."</p>'+
 '<p>Bosses cleared: '+S.beaten.length+' of 8.'+(all?' The Open Book Office is now open.':'')+'</p><p><button class="w-btn pri" id="b-map">Back to the map</button>'+(all?' <button class="w-btn" id="b-off">Go to the office</button>':'')+'</p></div>';
 document.getElementById("b-map").onclick=function(){mapScreen();focusNode(B.id)};
 var o=document.getElementById("b-off");if(o)o.onclick=officeScreen;
 document.getElementById("b-map").focus();
}
function lose(){
 var d=B.d;endBattle();
 app.querySelector(".w-bt").innerHTML='<div class="w-end"><h1>Time to rest and regroup</h1><p>'+esc(d.name)+' was strong today. That happens, in the game and in life. Your hope refills when you rest.</p>'+
 '<p><button class="w-btn pri" id="b-again">Try again</button> <button class="w-btn" id="b-map">Back to the map</button></p></div>';
 document.getElementById("b-again").onclick=function(){battle(B.id)};
 document.getElementById("b-map").onclick=function(){mapScreen();focusNode(B.id)};
 document.getElementById("b-again").focus();
}
/* breath timing: ring fills over 1.6s; release in the glowing band (55-100%) for a bonus. Esc skips. */
function breathCast(cb){
 var el=document.getElementById("b-br"),done=0,t0=performance.now(),D=1600,id;
 el.hidden=false;
 el.innerHTML=RM?'<p>Take one slow breath out.</p><button class="w-btn pri" id="b-bo">Breathe out and cast</button>':'<div class="w-ring" id="b-ring"></div><p>Press when the ring glows</p><button class="w-btn pri" id="b-bo">Breathe out now</button><small>Esc to skip</small>';
 var bt=document.getElementById("b-bo");bt.focus();
 function fin(b){if(done)return;done=1;cancelAnimationFrame(id);el.hidden=true;el.innerHTML="";document.removeEventListener("keydown",kd,true);cb(b);var f=app.querySelector("[data-s]");if(f&&!B.over)f.focus()}
 function kd(e){if(e.key==="Escape"){e.preventDefault();fin(0)}}
 document.addEventListener("keydown",kd,true);
 bt.onclick=function(){if(RM)return fin(1);var p=(performance.now()-t0)/D;fin(p>=.55&&p<=1.05?1:0)};
 if(!RM)(function lp(){var p=(performance.now()-t0)/D,r=document.getElementById("b-ring");if(!r)return;
  r.style.background='conic-gradient('+(p>=.55?'#ffd98a':'#8fa3c9')+' '+Math.min(1,p)*360+'deg,#2c3956 0)';
  if(p>1.25)return fin(0);id=requestAnimationFrame(lp)})();
}
/* original boss art: simple shapes, no stars */
function bossModel(id,col){return VX.sprite("b"+id,function(m){var dk="#1d2433",lt=VX.shade(col,1.15);
 function eyes2(y,z,x0){x0=x0||0;m.box(x0-3,y,z,2,2,1,dk).box(x0+2,y,z,2,2,1,dk).set(x0-3,y+1,z,"#ffffff").set(x0+2,y+1,z,"#ffffff")}
 switch(id){
  case"anx":m.ball(0,0,0,5,function(i,j,k){return (i+j)%2?col:lt});eyes2(0,-6);break;
  case"ptsd":m.box(-8,-9,0,16,14,7,col).box(-6,5,1,12,3,5,col).box(-4,8,2,8,2,3,col).box(-5,-9,-1,10,4,1,VX.shade(col,.8));eyes2(0,-1);break;
  case"rel1":m.ball(0,0,0,5,col,7);eyes2(-1,-6);break;
  case"rel2":m.ball(0,0,0,5,lt,7);eyes2(1,-6);break;
  case"wall":m.box(-1,-9,0,2,18,3,"#3a3f52");break;
  case"ocd":m.ball(0,0,0,7,function(i,j,k){return (Math.abs(i)+Math.abs(j))%4?col:lt});eyes2(0,-8);break;
  case"adhd":m.ball(0,0,0,4,col);eyes2(0,-5);break;
  case"ed":m.ball(0,0,0,7,function(i,j,k){return (i*3+j*5+k)%4?col:"#e8f4f2"},9);eyes2(0,-8);break;   /* soft mist blob, no body form */
  case"grief":m.box(0,-12,1,2,14,2,"#4a3d22").box(-4,2,-1,10,9,6,col).box(-3,3,-2,8,7,1,"#fff1c2").box(-4,11,0,10,1,4,"#4a3d22");m.set(-1,7,-3,dk).set(2,7,-3,dk);break;
  case"fog":[[-9,0,0,6],[-3,3,0,7],[5,1,0,6],[10,-1,0,4],[0,-3,0,6]].forEach(function(c){m.ball(c[0],c[1],c[2],c[3],function(i,j,k){return j>2?lt:col})});eyes2(0,-7);break;
 }return m})}
function lockModel(col){return VX.sprite("k"+col,function(m){return m.box(0,0,0,3,3,1,col).set(0,3,0,col).set(2,3,0,col).set(1,4,0,col).set(1,1,-1,"#1d2433")})}
function lanternModel(on){return VX.sprite("n"+on,function(m){return m.box(0,0,0,2,2,2,on?"#ffd98a":"#5a5f70")})}
function drawBoss(cv,t){
 var r=cv.getBoundingClientRect(),dp=Math.min(2,devicePixelRatio||1);if(cv.width!==Math.round(r.width*dp)){cv.width=r.width*dp;cv.height=r.height*dp}
 var x=cv.getContext("2d"),W=r.width,H=r.height,d=B.d,m=RM?0:1;x.setTransform(dp,0,0,dp,0,0);
 var g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,"#bfe6f7");g.addColorStop(.62,"#e8f4fa");g.addColorStop(.62,"#8fd27a");g.addColorStop(1,"#6cbb5c");x.fillStyle=g;x.fillRect(0,0,W,H);
 x.fillStyle="rgba(255,255,255,.18)";for(var gx=0;gx<W;gx+=24)x.fillRect(gx,H*.62,12,H);
 var sc=Math.min(W/420,H/220)*(d.big?1.6:1),cx=W*.62,cy=H*.5;if(d.big){sc=Math.min(sc,(W*.4-6)/115);cx=W*.6}
 if(B.hit&&m){B.hit=0}
 var bob=m?Math.sin(t*1.6)*4:0,ph=t*m,u=5;
 x.save();x.translate(cx,cy);x.scale(sc,sc);VX.shadow(x,0,d.big?70:62,d.big?90:50,9);x.translate(0,bob);
 function S1(id,px,py,s){VX.draw(x,bossModel(id,d.col),px||0,py||0,s||u)}
 function orbit(n,rx,ry,sp,col,front){for(var i=0;i<n;i++){var a=i*6.283/n+ph*sp,z=Math.sin(a);if((z>0)===front)VX.draw(x,cube(col),Math.cos(a)*rx,z*ry,u*1.2)}}
 switch(B.id){
  case"anx":orbit(10,62,18,1.5,d.col,false);S1("anx");orbit(10,62,18,1.5,d.col,true);break;
  case"ptsd":for(var e=1;e<4;e++){x.globalAlpha=.25/e;x.strokeStyle=d.col;x.lineWidth=6;x.strokeRect(-50-e*14-(ph*20%14),-60-e*14-(ph*20%14),100+e*28+(ph*40%28),110+e*28+(ph*40%28))}x.globalAlpha=1;S1("ptsd",0,40);break;
  case"rel":var o=m?Math.sin(t)*4:0;S1("wall",0,45);S1("rel1",-44-o,0);S1("rel2",44+o,0);break;
  case"ocd":orbit(10,58,16,.5,"#3a3f52",false);S1("ocd");orbit(10,58,16,.5,"#3a3f52",true);for(var k=0;k<B.locks;k++)VX.draw(x,lockModel(d.col),-30+k*22,72,u);break;
  case"adhd":orbit(9,60,26,2,d.col,false);S1("adhd");orbit(9,60,26,2,d.col,true);break;
  case"ed":S1("ed");x.globalAlpha=.4;x.fillStyle="#ffffff";for(var q=0;q<3;q++){x.beginPath();x.ellipse(-60+q*60,62+(m?Math.sin(t+q)*3:0),40,8,0,0,7);x.fill()}x.globalAlpha=1;break;
  case"grief":S1("grief",0,0);var lit=B.max-B.hp;for(var l=0;l<6;l++)VX.draw(x,lanternModel(l<lit/2?1:0),-90+l*36,66,u);break;
  case"fog":S1("fog");for(var rr=0;rr<6;rr++)VX.draw(x,cube("#7f8ea6"),-55+rr*22,50+((ph*30+rr*9)%22),u*.8);break;
 }
 if(B.crack){x.strokeStyle="#ffd98a";x.lineWidth=3;x.beginPath();x.moveTo(-12,-30);x.lineTo(-4,-18);x.lineTo(-10,-8);x.lineTo(2,4);x.stroke()}
 x.restore();
 var hc={getContext:function(){return x},width:0,height:0};x.save();x.translate(W*.18,H*.62);drawHero(hc,S.hero,Math.min(1.3,H/170)*.9,0);x.restore();
}
function eyes(x,ox,oy,soft){x.fillStyle="#1d2433";x.beginPath();x.arc(ox-10,oy,soft?3:4,0,7);x.arc(ox+10,oy,soft?3:4,0,7);x.fill()}

/* office finale */
function officeScreen(){
 cancelAnimationFrame(raf);endBattle();
 if(!officeOpen()){mapScreen();return}
 if(!S.code){var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",a=new Uint32Array(8);crypto.getRandomValues(a);var c="";for(var i=0;i<8;i++)c+=A[a[i]%A.length];S.code="OBC-"+c.slice(0,4)+"-"+c.slice(4);S.wonAt=new Date().toISOString().slice(0,10);save()}
 app.innerHTML='<div class="w-end w-office"><h1>Welcome to the Open Book Office</h1><p>'+esc(S.hero.name||"Wanderer")+', you and '+petName()+' calmed all eight bosses. Your satchel holds: '+S.loot.map(esc).join(", ")+'.</p>'+
 '<canvas class="w-oscene" id="w-osc" aria-hidden="true"></canvas>'+'<p class="w-code">Your prize code: <b id="w-code">'+esc(S.code)+'</b></p>'+
 '<div class="w-rules"><h2>Prize rules</h2><ul><li>Anyone who beats the game can get one free fidget stress ring at an Open Book Counseling office.</li><li>One ring per person per year, while supplies last.</li><li>Show this code at the front desk.</li><li>The code is saved on this device. Write it down or take a screenshot.</li></ul></div>'+
 '<p><button class="w-btn pri" id="w-omap">Back to the map</button> <a class="w-btn" href="../#team">Meet the real team</a></p></div>';
 document.getElementById("w-omap").onclick=function(){mapScreen();focusNode("office")};
 var oc=document.getElementById("w-osc"),orr=oc.getBoundingClientRect(),od=Math.min(2,devicePixelRatio||1);if(orr.width>1&&orr.height>1){oc.width=orr.width*od;oc.height=orr.height*od;
 var ox=oc.getContext("2d");ox.scale(od,od);var os=orr.height/150;VX.shadow(ox,orr.width/2,orr.height*.84,70*os,10*os);VX.draw(ox,lmModel("office"),orr.width/2,orr.height*.84,9*os);
 ox.save();ox.translate(orr.width/2-110*os,orr.height*.84-40*os*.9);ox.scale(os*.9,os*.9);drawHero({getContext:function(){return ox},width:0,height:0},S.hero,1,0);ox.restore();}
 var h=app.querySelector("h1");h.tabIndex=-1;h.focus();
}
// boot
if(S.made)mapScreen();else heroScreen();
window.obcWorld={state:function(){return JSON.parse(JSON.stringify(S))},go:go,open:officeOpen,battle:battle,hall:hallScreen,office:officeScreen,map:mapScreen,bt:function(){return B},cfg:CFG};
})();
