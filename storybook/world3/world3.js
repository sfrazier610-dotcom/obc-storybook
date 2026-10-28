/* Open Book Storybook: Wanderer's Quest (v3 preview). Painted golden-hour exploration RPG.
   Original art only. Guides in the Hall use filtered photos of the real team; in-world people are generic villagers. */
(function(){"use strict";
var app=document.getElementById("w-app");
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
/* ---------- painted images ---------- */
var IM={};function img(n){var i=IM[n];if(!i){i=new Image();i.src="../img/q-"+n+".webp";IM[n]=i}return i.complete&&i.naturalWidth?i:null}
["map-town","map-cliffs","map-marsh","map-castle","sp-tree","sp-rock","sp-house","sp-chest","sp-chesto","sp-door","sp-sign","sp-lantern","sp-fog","sp-storm","sp-boss","sp-cat","sp-dog","sp-vil1","sp-vil2","sp-vil3","sp-wall"].forEach(img);
var ROCKC=null;function rockClean(){if(ROCKC)return ROCKC;var im=img("sp-rock");if(!im)return null;var cv=document.createElement("canvas");cv.width=im.naturalWidth;cv.height=im.naturalHeight;var x=cv.getContext("2d");x.drawImage(im,0,0);var d=x.getImageData(0,0,cv.width,cv.height),p=d.data,W=cv.width,H=cv.height,A=new Uint8Array(W*H);for(var i=0;i<W*H;i++)A[i]=p[i*4+3];
 for(var y=0;y<H;y++)for(var xx=0;xx<W;xx++){var i=y*W+xx,k=i*4;if(!A[i])continue;var r=p[k],g=p[k+1],b=p[k+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),edge=0;for(var dy=-3;dy<=3&&!edge;dy++)for(var dx=-3;dx<=3;dx++){var yy=y+dy,x2=xx+dx;if(yy<0||x2<0||yy>=H||x2>=W||A[yy*W+x2]<40){edge=1;break}}
  if((r+g+b)/3>150&&mx-mn<60&&(edge||y>H*.7))p[k+3]=0;else if(edge)p[k+3]=Math.min(p[k+3],170)}
 x.putImageData(d,0,0);return ROCKC=cv}
function sp(c,n,x,y,h,flip,a){var im=n==="rock"?rockClean():img("sp-"+n);if(!im)return;var w=h*(im.naturalWidth||im.width)/(im.naturalHeight||im.height);c.save();if(a!=null)c.globalAlpha=a;if(flip){c.translate(x,0);c.scale(-1,1);c.drawImage(im,-w/2,y-h,w,h)}else c.drawImage(im,x-w/2,y-h,w,h);c.restore()}
var TINT={};function tinted(n,col,k){var key=n+col+k;if(TINT[key])return TINT[key];var im=img("sp-"+n);if(!im)return null;var cv=document.createElement("canvas");cv.width=im.naturalWidth;cv.height=im.naturalHeight;var x=cv.getContext("2d");x.drawImage(im,0,0);x.globalCompositeOperation="source-atop";x.globalAlpha=k;x.fillStyle=col;x.fillRect(0,0,cv.width,cv.height);return TINT[key]=cv}
function drawC(c,cv,x,y,h,a){if(!cv||!cv.width)return;var w=h*cv.width/cv.height;c.save();if(a!=null)c.globalAlpha=a;c.drawImage(cv,x-w/2,y-h,w,h);c.restore()}
function shadow(c,x,y,rx,ry){c.save();c.fillStyle="rgba(40,25,10,.25)";c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.restore()}
function shade(hex,k){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(v){return Math.max(0,Math.min(255,Math.round(k>1?v+(255-v)*(k-1):v*k)))}return "#"+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1)}

function blob(c,x,y,rx,ry,col,ol){var g=c.createRadialGradient(x-rx*.35,y-ry*.4,1,x,y,Math.max(rx,ry)*1.1);g.addColorStop(0,shade(col,1.25));g.addColorStop(1,shade(col,.8));c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();if(ol!==0){c.strokeStyle="rgba(60,34,16,.28)";c.lineWidth=.8;c.stroke()}}
function poly(c,pts,col,ol){var ys=pts.map(function(p){return p[1]}),y0=Math.min.apply(0,ys),y1=Math.max.apply(0,ys);var g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,1.18));g.addColorStop(1,shade(col,.78));c.fillStyle=g;c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath();c.fill();if(ol!==0){c.strokeStyle="rgba(60,34,16,.28)";c.lineWidth=.8;c.stroke()}}
/* ---------- hero: painted q-sp style figures (three bases), recolored per player choice ---------- */
var BODY=[{k:"m",n:"Male"},{k:"f",n:"Female"},{k:"n",n:"Gender-neutral"}];
var COL=["#2f4a86","#3f7a5a","#8a3b3b","#6b4a8a","#b8792e","#2f6f78","#7a6a4a","#a5486e"];
var HC=["#2a1a10","#5a3418","#8a5a2a","#c9893a","#e3c27a","#a03a22","#6b6b72"];
var SKIN=["#f6d7bf","#eec19c","#d9a27a","#b97d55","#8f5a3a","#62402a"];
var PETS=[{n:"Kenneth",d:"Orange tabby in a red cape, carrying a red book"},{n:"Ragnar",d:"Loyal shepherd dog"},{n:"Orion",d:"Loyal shepherd dog, Ragnar's twin in looks"}];
var HIMG={};function himg(src){var i=HIMG[src];if(!i){i=new Image();i.src=src;HIMG[src]=i}return i.complete&&i.naturalWidth?i:null}
BODY.forEach(function(b){himg("../img/q-hero-"+b.k+".webp");himg("../img/q-hmask-"+b.k+".png")});
function hex(c){var n=parseInt(c.slice(1),16);return[n>>16,n>>8&255,n&255]}
var HCACHE={};
function heroCanvas(h){var b=BODY[h.body|0]||BODY[0],key=b.k+"|"+(h.skin|0)+"|"+(h.hc|0)+"|"+(h.c1|0);if(HCACHE[key])return HCACHE[key];
 var im=himg("../img/q-hero-"+b.k+".webp"),mk=himg("../img/q-hmask-"+b.k+".png");if(!im||!mk)return null;
 var W=im.naturalWidth,H=im.naturalHeight,cv=document.createElement("canvas");cv.width=W;cv.height=H;var x=cv.getContext("2d");x.drawImage(im,0,0);var d=x.getImageData(0,0,W,H),p=d.data;
 var mc=document.createElement("canvas");mc.width=W;mc.height=H;var mx=mc.getContext("2d");mx.drawImage(mk,0,0,W,H);var m=mx.getImageData(0,0,W,H).data;
 /* base means for each painted region so shading ratios are kept */
 var sum=[[0,0,0,0],[0,0,0,0],[0,0,0,0]];for(var i=0;i<p.length;i+=4)for(var c=0;c<3;c++)if(m[i+c]>200&&p[i+3]>200){sum[c][0]+=p[i];sum[c][1]+=p[i+1];sum[c][2]+=p[i+2];sum[c][3]++}
 var tg=[hex(HC[h.hc|0]||HC[1]),hex(SKIN[h.skin|0]||SKIN[1]),hex(COL[h.c1|0]||COL[0])];
 for(var i=0;i<p.length;i+=4){for(var c=0;c<3;c++){var w=m[i+c]/255;if(w<.02||!sum[c][3])continue;var mu=sum[c],r=p[i],g=p[i+1],bl=p[i+2],o;
   if(c===1){o=[r*tg[1][0]/(mu[0]/mu[3]),g*tg[1][1]/(mu[1]/mu[3]),bl*tg[1][2]/(mu[2]/mu[3])]}
   else{var L=(.3*r+.59*g+.11*bl)/(.3*mu[0]/mu[3]+.59*mu[1]/mu[3]+.11*mu[2]/mu[3]);o=[tg[c][0]*L,tg[c][1]*L,tg[c][2]*L];if(L>1){var k2=Math.min(1,(L-1)*.6);o=o.map(function(v){return v+(255-v)*k2*.5})}}
   p[i]=Math.min(255,r+(o[0]-r)*w);p[i+1]=Math.min(255,g+(o[1]-g)*w);p[i+2]=Math.min(255,bl+(o[2]-bl)*w)}}
 x.putImageData(d,0,0);return HCACHE[key]=cv}
/* feet at (x,y); 62 units tall at sc=1, the same height as the villagers. dir: 0 down,1 up,2 right,3 left */
/* drawHero lives with the v3i walk cycles below */
/* pets */
var PETC={};function petCanvas(i){if(PETC[i])return PETC[i];var cat=img("sp-cat"),dog=img("sp-dog");if(i===0&&!cat||i>0&&!dog)return null;var cv=document.createElement("canvas");cv.width=110;cv.height=100;var c=cv.getContext("2d");
 if(i===0){/* Kenneth: painted cape behind, the tabby, then clasp and red book in front */
  var g=c.createLinearGradient(0,26,0,96);g.addColorStop(0,"#d23a3a");g.addColorStop(1,"#7d1018");c.fillStyle=g;c.beginPath();c.moveTo(42,34);c.quadraticCurveTo(22,60,18,96);c.lineTo(86,96);c.quadraticCurveTo(84,60,68,34);c.closePath();c.fill();c.strokeStyle="rgba(60,10,10,.6)";c.lineWidth=1.4;c.stroke();
  c.drawImage(cat,24,18,61,80);
  c.fillStyle="#c02a30";c.beginPath();c.moveTo(42,52);c.quadraticCurveTo(54,60,68,51);c.lineTo(66,57);c.quadraticCurveTo(54,64,44,58);c.closePath();c.fill();
  c.fillStyle="#f0c24a";c.beginPath();c.arc(55,59,3,0,7);c.fill();
  c.save();c.translate(70,80);c.rotate(-.18);var bg=c.createLinearGradient(0,-10,0,10);bg.addColorStop(0,"#d8343a");bg.addColorStop(1,"#8d141c");c.fillStyle=bg;c.fillRect(-11,-9,22,17);c.fillStyle="#f6ecd0";c.fillRect(-10,7,20,2.5);c.fillStyle="#f0c24a";c.fillRect(-11,-9,2.5,17);c.fillRect(-4,-4,8,1.6);c.restore()}
 else{c.drawImage(dog,30,10,55,90);if(i===2){c.globalCompositeOperation="source-atop";c.fillStyle="rgba(40,40,70,.12)";c.fillRect(0,0,110,100)}}
 return PETC[i]=cv}
function petName(){return PETS[S.hero.pet|0].n}

/* ---------- save ---------- */
var KEY="obc_world_v3";
function def(){return{v:3,hero:{name:"",body:0,c1:0,hc:1,skin:1,pet:0},made:0,at:"hub",x:320,y:250,visited:["hub"],beaten:[],cleared:[],pick:{},loot:[],bag:{blanket:1,lantern:1,flowers:1},opened:[],found:[],safe:{kind:"",items:[]},code:""}}
var S=def();
try{var raw=JSON.parse(localStorage.getItem(KEY)||"null");if(raw&&raw.v===3)S=Object.assign(def(),raw);else{var o2=JSON.parse(localStorage.getItem("obc_world_v2")||"null");if(o2&&o2.hero){S.hero.name=o2.hero.name||"";S.hero.pet=o2.pv===2?(o2.hero.pet|0):(o2.hero.pet===0?0:1);S.pick=o2.pick||{}}}}catch(e){}
function heroFix(){var h=S.hero;if(h.body==null){var hr=h.hair|0;h.body=(hr===1||hr===3||hr===4||hr===6)?1:(hr===2?2:0)}["outfit","c2","hair","acc"].forEach(function(k){delete h[k]});if(!(h.body>=0&&h.body<3))h.body=0;if(!(h.skin>=0&&h.skin<6))h.skin=1;if(!(h.hc>=0&&h.hc<7))h.hc=1;if(!(h.c1>=0&&h.c1<8))h.c1=0}heroFix();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
/* ---------- regions (guides suggested; any guide can be chosen in the Hall) ---------- */
var REG=[
 {id:"anx",name:"Whirligust Heights",sub:"Anxiety",guide:"amber",col:"#9fc6e8"},
 {id:"ptsd",name:"Echo Hollow",sub:"PTSD",guide:"abby",col:"#b6a0d6"},
 {id:"rel",name:"Rift Bridge",sub:"Relationships",guide:"shanna",col:"#e8a59f"},
 {id:"ocd",name:"Loopwright Works",sub:"OCD",guide:"aspen",col:"#d6c08a"},
 {id:"adhd",name:"Flicker Glade",sub:"ADHD",guide:"aspen",col:"#a6e3a0"},
 {id:"ed",name:"Mirror Mist Lake",sub:"Eating disorder",guide:"scott",col:"#a0d6d0"},
 {id:"grief",name:"Lantern Meadow",sub:"Grief and loss",guide:"amanda",col:"#f0c98a"},
 {id:"fog",name:"Fog Marsh",sub:"Depression",guide:"shanna",col:"#c3c8cf"}];
function R(id){for(var i=0;i<REG.length;i++)if(REG[i].id===id)return REG[i];return REG[0]}
var BOSS=REG.map(function(r){return r.id});
var MIN={anx:"Worry Gust",ptsd:"Startle Echo",rel:"Snap Spark",ocd:"Doubt Loop",adhd:"Flicker Mote",ed:"Whisper Mist",grief:"Wave of Missing",fog:"Heavy Cloud"};
/* ---------- things for your safe place ---------- */
var DEC={
 blanket:{n:"Picnic blanket",d:function(c,x,y){c.save();c.translate(x,y);c.rotate(-.08);var g=c.createLinearGradient(-30,-14,30,14);g.addColorStop(0,"#c8553f");g.addColorStop(1,"#9a3a2c");c.fillStyle=g;c.fillRect(-30,-16,60,30);c.fillStyle="rgba(250,230,190,.55)";for(var i=-24;i<30;i+=12){c.fillRect(i,-16,3,30)}for(var j=-10;j<14;j+=10)c.fillRect(-30,j,60,3);c.restore()}},
 lantern:{n:"Lantern",d:function(c,x,y,t){glow(c,x,y-34,40,t);sp(c,"lantern",x,y,52)}},
 flowers:{n:"Wildflowers",d:function(c,x,y){for(var i=0;i<7;i++){var a=i*2.4,r=4+i*1.6,fx=x+Math.cos(a)*r,fy=y-4+Math.sin(a)*r*.5;c.strokeStyle="#4f7f2e";c.lineWidth=1.5;c.beginPath();c.moveTo(fx,fy+6);c.lineTo(fx,fy);c.stroke();blob(c,fx,fy,3.4,3,["#e86a8a","#ffd25a","#f4efe4","#9ac0ff","#d98ae8"][i%5],0);blob(c,fx,fy,1.2,1.2,"#c9853a",0)}}},
 bench:{n:"Wooden bench",d:function(c,x,y){shadow(c,x,y,26,5);poly(c,[[-24,-14],[24,-14],[22,-8],[-22,-8]].map(function(p){return[p[0]+x,p[1]+y]}),"#9a6a3a");c.fillStyle="#6b4520";c.fillRect(x-20,y-8,4,8);c.fillRect(x+16,y-8,4,8);poly(c,[[-24,-26],[24,-26],[24,-20],[-24,-20]].map(function(p){return[p[0]+x,p[1]+y]}),"#8a5a2a");c.fillRect(x-20,y-20,3,7);c.fillRect(x+17,y-20,3,7)}},
 campfire:{n:"Campfire",d:function(c,x,y,t){glow(c,x,y-8,46,t);for(var i=0;i<6;i++)blob(c,x+Math.cos(i)*12,y+Math.sin(i)*4,4,3,"#8a8a8a");c.fillStyle="#6b4520";c.fillRect(x-10,y-3,20,4);var f=RM?0:Math.sin(t/120)*2;blob(c,x,y-9+f*.3,6,10+f,"#f08a2a",0);blob(c,x,y-7,3.5,6,"#ffd25a",0)}},
 stone:{n:"Smooth stone",d:function(c,x,y){sp(c,"rock",x,y,32)}},
 sapling:{n:"Little tree",d:function(c,x,y){sp(c,"tree",x,y,64)}},
 shell:{n:"Spiral shell",d:function(c,x,y){blob(c,x,y-5,9,6,"#f2d6c4");c.strokeStyle="#b08070";c.lineWidth=1.2;c.beginPath();for(var a=0;a<12;a+=.3){var r=a*.7;c.lineTo(x+Math.cos(a)*r,y-5+Math.sin(a)*r*.6)}c.stroke()}},
 chime:{n:"Wind chime",d:function(c,x,y,t){c.fillStyle="#6b4520";c.fillRect(x-1,y-60,2,60);c.fillRect(x-12,y-60,24,3);for(var i=0;i<4;i++){var sw=RM?0:Math.sin(t/400+i)*1.5;c.fillStyle="#c9c2b0";c.fillRect(x-10+i*6+sw,y-56,2,12+i*3)}}},
 tent:{n:"Cozy tent",d:function(c,x,y){shadow(c,x,y,34,7);poly(c,[[x-34,y],[x,y-50],[x+34,y]],"#d9a24a");poly(c,[[x-9,y],[x,y-30],[x+9,y]],"#5a3418",0)}},
 books:{n:"Stack of books",d:function(c,x,y){["#8a3b3b","#3f5f9a","#3f7a5a"].forEach(function(col,i){poly(c,[[x-12+i,y-6-i*6],[x+12+i,y-6-i*6],[x+12+i,y-i*6],[x-12+i,y-i*6]],col);c.fillStyle="#f4efe4";c.fillRect(x-11+i,y-2-i*6,22,1.5)})}},
 chest:{n:"Little chest",d:function(c,x,y){sp(c,"chest",x,y,34)}}};
/* boss keepsakes can be placed too */
BOSS.forEach(function(id){DEC["k_"+id]={n:"",keep:id,d:function(c,x,y,t){glow(c,x,y-26,34,t,R(id).col);poly(c,[[x-12,y],[x+12,y],[x+9,y-14],[x-9,y-14]],"#b8a88a");blob(c,x,y-24,8,8,R(id).col)}}});
function decName(k){var d=DEC[k];return d&&(d.n||("Keepsake: "+(BD[d.keep]&&BD[d.keep].loot)))}
function glow(c,x,y,r,t,col){var a=RM?.3:.24+.08*Math.sin((t||0)/500+x);var g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,(col?hexA(col,a*1.6):"rgba(255,214,120,"+a*1.6+")"));g.addColorStop(1,"rgba(255,214,120,0)");c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
function hexA(h,a){var n=parseInt(h.slice(1),16);return "rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+a+")"}

/* ---------- the world: 4 x 5 painted screens, walk off an edge to the next ---------- */
var W=640,H=416;
/* t: tree rock house sign lantern chest wall npc look find door  */
var SC={
 hub:{n:"Hearthstead",sub:"Village",g:"town",at:[1,1],tone:"rgba(255,190,110,.10)",
  p:[["house",110,150],["house",530,150,1],["tree",60,330],["tree",590,345],["lantern",250,170],["lantern",390,170],
   ["sign",250,345,"The signpost: West to Lantern Meadow. North to Whirligust Heights. East to the Crossroads and the Hall of Guides. South to Fog Marsh. Every road is open."],
   ["npc",160,300,"vil2","Mara the lamplighter",["Welcome, wanderer. Every road out of Hearthstead is open to you.","Symptoms wander out there. Bump into one and you'll cast your skills right where you stand.","When it gets heavy, follow the lantern trail east of the well to your safe place."]],
   ["npc",470,300,"vil1","Tobin the baker",["Fresh bread and fresh starts here.","I hear the Crossroads east of here has a Hall where you can choose any guide you like."]],
   ["chest",450,375,"bench"],["door",560,330,"safe"],
   ["look",110,140,60,"Warm windows glow. Someone inside is humming."],["look",530,140,60,"A cottage with a garden of herbs by the door."]]},
 cross:{n:"The Crossroads",sub:"Hall of Guides",g:"town",at:[2,1],tone:"rgba(255,190,110,.08)",
  p:[["house",470,160,0,1.25,"hall"],["tree",120,140],["tree",160,340],["rock",560,340],["lantern",400,190],
   ["sign",250,180,"The Hall of Guides: every guide can walk with you in any region. Step inside to choose."],
   ["npc",300,300,"vil3","Wren the mapmaker",["The Hall is right there. The guides inside are the real Open Book team, shown as portraits.","Pick whoever feels right for each region. Nobody is locked to one place."]],
   ["chest",110,350,"books"]]},
 office:{n:"Open Book Office",sub:"Finale",g:"castle",at:[2,2],tone:"rgba(255,200,130,.12)",
  p:[["house",320,190,0,1.35,"office"],["lantern",230,200],["lantern",410,200],["tree",90,170],["tree",560,170],["tree",110,360],["tree",540,360],
   ["sign",250,300,"The Open Book Office. The door opens once all eight bosses are calm."],
   ["npc",400,310,"vil1","A friendly greeter",["The office opens when the eight bosses are calm. There's a prize waiting inside."]]]},
 anx1:{n:"Windy Steps",sub:"Anxiety",reg:"anx",g:"cliffs",at:[1,0],tone:"rgba(160,200,240,.12)",
  p:[["rock",140,160],["rock",500,170],["tree",90,320],["rock",560,330],["lantern",380,150],
   ["npc",220,300,"vil3","A climber catching her breath",["The wind up here makes my heart race. Breathing slow helps it pass.","The Whirligust lives west, on the Peak."]],
   ["chest",210,370,"chime"],["look",500,165,40,"The rock hums when the wind blows. You count four breaths in, four out."]],m:[[430,280],[300,180]]},
 anx2:{n:"Whirligust Peak",sub:"Anxiety boss",reg:"anx",g:"cliffs",at:[0,0],tone:"rgba(160,200,240,.18)",boss:[300,210],
  p:[["rock",130,150],["rock",520,140],["rock",120,340],["sign",470,320,"The Whirligust spins faster when you rush. Find its weak spot."]],m:[[480,240]]},
 ptsd1:{n:"Hollow Path",sub:"PTSD",reg:"ptsd",g:"marsh",at:[2,0],tone:"rgba(150,120,200,.14)",
  p:[["tree",140,150],["tree",520,160],["rock",100,330],["tree",560,330],["lantern",320,140],
   ["npc",450,300,"vil2","An old trail warden",["Sounds echo strangely here. Feet on the ground, say where you are.","The Echo Warden waits east in the Hollow."]],
   ["chest",200,320,"stone"],["look",320,135,40,"A lantern someone keeps lit for travelers. You are here, and it is now."]],m:[[260,230],[480,200]]},
 ptsd2:{n:"Echo Hollow",sub:"PTSD boss",reg:"ptsd",g:"marsh",at:[3,0],tone:"rgba(120,100,180,.2)",boss:[330,210],
  p:[["tree",120,160],["tree",540,150],["rock",520,340],["sign",160,320,"Every third breath, an echo rises. Ground yourself in the now."]],m:[[200,240]]},
 rel1:{n:"Riverbank",sub:"Relationships",reg:"rel",g:"town",at:[3,1],tone:"rgba(240,170,160,.1)",w:[[470,130,120,46]],
  p:[["tree",120,150],["tree",560,330],["rock",340,120],["npc",230,300,"vil1","A ferry keeper",["Two voices across the water, both trying to be heard. Listening first helps.","The Rift Twins are south, by the bridge."]],["chest",120,330,"tent"],["look",470,130,90,"The river runs between two banks. Somewhere, it is narrow enough to cross."]],m:[[400,290],[260,200]]},
 rel2:{n:"Rift Bridge",sub:"Relationships boss",reg:"rel",g:"town",at:[3,2],tone:"rgba(240,170,160,.16)",boss:[340,220],w:[[520,320,110,44]],
  p:[["tree",120,150],["tree",130,340],["sign",470,170,"Listen first. Repair lands better after you have listened."]],m:[[220,250]]},
 grief1:{n:"Lantern Meadow",sub:"Grief and loss",reg:"grief",g:"castle",at:[0,1],tone:"rgba(255,200,120,.14)",
  p:[["lantern",160,170],["lantern",260,150],["lantern",480,160],["tree",560,330],["tree",90,330],
   ["npc",380,300,"vil2","A gardener tending lanterns",["Each lantern here is a memory someone wanted to keep.","The Lantern Keeper is south. There's no rush, and no way to lose."]],
   ["find",220,330,"flowers"],["chest",500,260,"sapling"],["look",260,145,40,"A lantern with a name carved small on its base."]],m:[[300,230]]},
 grief2:{n:"Lantern Hill",sub:"Grief boss",reg:"grief",g:"castle",at:[0,2],tone:"rgba(255,190,110,.2)",boss:[320,220],
  p:[["lantern",150,180],["lantern",500,180],["tree",110,340],["tree",540,340],["sign",420,320,"The Lantern Keeper is gentle. Rest is always allowed here."]],m:[]},
 fog1:{n:"Misty Fen",sub:"Depression",reg:"fog",g:"marsh",at:[1,2],tone:"rgba(150,160,175,.18)",w:[[480,300,90,40]],
  p:[["tree",130,150],["tree",520,140],["rock",120,330],["lantern",260,320],
   ["npc",380,200,"vil3","A traveler under a blanket",["Some mornings the fog is thick. One small step is still a step.","The Fogstorm sits south, in the deep marsh."]],
   ["chest",560,370,"campfire"],["look",480,300,70,"Still water. The fog lifts a little where light touches it."]],m:[[250,240],[420,330]]},
 fog2:{n:"Deep Fog Marsh",sub:"Depression boss",reg:"fog",g:"marsh",at:[1,3],tone:"rgba(110,120,140,.26)",boss:[320,230],
  p:[["tree",110,150],["tree",540,150],["tree",120,350],["sign",500,330,"Small steps build momentum. Each one makes the next skill stronger."]],m:[[200,300]]},
 ocd1:{n:"Loop Lane",sub:"OCD",reg:"ocd",g:"town",at:[2,3],tone:"rgba(220,200,140,.12)",
  p:[["house",130,160],["tree",560,160],["wall",480,330],["wall",544,330],["npc",300,310,"vil1","A clockmaker",["I used to check every lock five times. Letting the urge pass got easier with practice.","The Loopwright works east of here."]],["chest",420,200,"shell"],["look",130,150,60,"A door with three locks. One is open, and the house is still fine."]],m:[[240,230],[470,260]]},
 ocd2:{n:"Loopwright Works",sub:"OCD boss",reg:"ocd",g:"castle",at:[3,3],tone:"rgba(220,200,140,.18)",boss:[330,220],
  p:[["wall",120,150],["wall",184,150],["wall",480,150],["wall",544,150],["sign",160,320,"Checking adds locks. Letting the urge pass breaks them all."]],m:[[470,320]]},
 woods:{n:"Quiet Woods",sub:"A resting place",g:"town",at:[1,4],tone:"rgba(255,200,130,.1)",
  p:[["tree",150,160],["tree",250,140],["tree",470,150],["tree",540,320],["rock",140,330],["npc",350,300,"vil2","A woodcutter on break",["Not every road has a symptom on it. Some are just for breathing."]],["chest",440,250,"chest"],["look",250,135,40,"Birdsong. You notice your shoulders drop a little."]]},
 adhd1:{n:"Flicker Path",sub:"ADHD",reg:"adhd",g:"town",at:[2,4],tone:"rgba(170,230,160,.12)",
  p:[["tree",130,150],["tree",520,160],["tree",560,330],["rock",120,330],["npc",260,300,"vil3","A juggler",["Ten ideas at once! Writing down just the first step helps me.","The Flicker Sprite darts around the Glade, east."]],["find",430,320,"flowers"],["look",520,155,40,"A tree carved with a tiny to-do list. Item one: start."]],m:[[350,220],[460,280]]},
 adhd2:{n:"Flicker Glade",sub:"ADHD boss",reg:"adhd",g:"castle",at:[3,4],tone:"rgba(170,230,160,.18)",boss:[340,220],
  p:[["tree",120,150],["tree",540,150],["tree",130,350],["sign",470,330,"Switch skills for a novelty boost. Repeating one makes focus slip."]],m:[[220,260]]},
 ed1:{n:"Lakeshore",sub:"Eating disorder",reg:"ed",g:"town",at:[0,3],tone:"rgba(160,214,208,.14)",w:[[400,130,170,52]],
  p:[["tree",110,160],["tree",560,330],["rock",130,330],["npc",300,300,"vil1","A kind lake guide",["The mist whispers rules. They are the disorder's voice, not yours.","Reaching out to someone you trust is brave. The Mirror Mist is south."]],["find",470,280,"shell"],["look",400,130,120,"The lake reflects the sky, not a verdict."]],m:[[240,230]]},
 ed2:{n:"Mirror Mist Lake",sub:"Eating disorder boss",reg:"ed",g:"marsh",at:[0,4],tone:"rgba(160,214,208,.2)",boss:[330,230],w:[[140,330,100,40]],
  p:[["tree",110,150],["tree",540,150],["sign",500,330,"Reaching out raises a shield. Recovery is possible, and support helps."]],m:[[480,250]]}
};
var GRID={};Object.keys(SC).forEach(function(k){var s=SC[k];s.id=k;GRID[s.at[0]+","+s.at[1]]=k});
function nb(s,dir){if(s.id==="safe")return dir==="s"?"hub":null;if(s.id==="hollow")return dir==="s"?"woods":null;var d={n:[0,-1],s:[0,1],w:[-1,0],e:[1,0]}[dir];return GRID[(s.at[0]+d[0])+","+(s.at[1]+d[1])]||null}
SC.safe={id:"safe",n:"Your Safe Place",sub:"Home base",g:"town",at:[-9,-9],p:[["sign",320,395,"The path home to Hearthstead is just south of here. Press Decorate to place your treasures."]]};
/* collision footprints and draw heights */
var FT={tree:[16,9,110],rock:[22,11,54],house:[52,18,124],sign:[8,5,42],lantern:[6,4,56],chest:[15,8,34],wall:[30,9,58],npc:[10,6,58],door:[16,6,52]};
function build(s){if(s.built)return;s.built=1;var B=[],k=s.g==="cliffs"?"rock":"tree";
 function row(x0,y0,dx,dy,n,gap){for(var i=0;i<n;i++){var x=x0+dx*i,y=y0+dy*i;if(gap&&gap(x,y))continue;B.push([i%3===2&&k==="tree"?"rock":k,x+(i%2?6:-4),y,i%2])}}
 var N=nb(s,"n"),So=nb(s,"s"),We=nb(s,"w"),E=nb(s,"e");
 if(s.id==="safe"&&S.safe.kind==="beach"){row(20,420,75,0,9,function(x){return x>250&&x<390})}
 else{row(20,48,72,0,9,N?function(x){return x>230&&x<410}:0);row(20,426,72,0,9,So?function(x){return x>230&&x<410}:0);
 row(16,100,0,56,6,We?function(x,y){return y>150&&y<300}:0);row(624,100,0,56,6,E?function(x,y){return y>150&&y<300}:0)}
 s.items=B.map(function(a){return{t:a[0],x:a[1],y:a[2],flip:a[3]}}).concat(s.p.map(function(a){var o={t:a[0],x:a[1],y:a[2]};
  if(a[0]==="sign")o.text=a[3];else if(a[0]==="npc"){o.spr=a[3];o.name=a[4];o.lines=a[5]}else if(a[0]==="chest"||a[0]==="find")o.item=a[3];else if(a[0]==="look"){o.r=a[3];o.text=a[4]}else if(a[0]==="door")o.go=a[3];else if(a[0]==="qitem")o.qk=a[3];else if(a[0]==="page")o.pg=a[3];else if(a[0]==="house"){o.flip=a[3];o.sc=a[4]||1;o.role=a[5]}else{o.flip=a[3];if(GJT[a[0]])o.gj=a[3]}return o}));
 s.ens=(s.m||[]).map(function(p,i){return{id:s.id+":"+i,hx:p[0],hy:p[1],x:p[0],y:p[1],reg:s.reg,ph:Math.random()*6,cd:0}});
 s.items.forEach(function(o,i){o.key=s.id+":"+i});
 if(s.boss)s.ens.push({id:"boss:"+s.reg,boss:1,hx:s.boss[0],hy:s.boss[1],x:s.boss[0],y:s.boss[1],reg:s.reg,ph:0,cd:0})}
var CFG={breath:true};
var CL=(window.OBC&&window.OBC.clinicians)||[];
function C(id){for(var i=0;i<CL.length;i++)if(CL[i].id===id)return CL[i];return{id:id,name:id,cred:"",concerns:[],mods:[]}}
function guideOf(rid){return C(S.pick[rid]||R(rid).guide)}
var TAG={trauma:"Trauma",abuse:"Abuse",anxiety:"Anxiety",depression:"Depression",eating:"Eating disorders",ocd:"OCD",adhd:"ADHD",addiction:"Addiction",personality:"Personality",highprofile:"High-profile clients",lgbtq:"LGBTQ+",grief:"Grief",shame:"Shame",family:"Family",faith:"Faith transitions",transitions:"Life transitions",relationships:"Relationships",autism:"Autism",selfharm:"Self-harm",chronic:"Chronic illness",attachment:"Attachment",dysregulation:"Emotional regulation",burnout:"Burnout"};
function focus(c){var l=c.specialties&&c.specialties.length?c.specialties.slice():(c.concerns||[]).map(function(t){return TAG[t]||t}),k=/Trauma|PTSD|Anxiety|Depression|Obsessive|OCD|ADHD|Eating|Grief|Relationship/;return l.filter(function(v){return k.test(v)}).concat(l.filter(function(v){return !k.test(v)}))}
function portrait(id){return "../img/q-pt-"+id+".webp"}
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
/* ---------- play screen ---------- */
var cur=null,stage,cv,cx,raf=0,last=0,held={},tgt=null,P={x:320,y:250,dir:0,ph:0,trail:[]},OV=null,DM=null,B=null,VIEW={s:1,ox:0,oy:0},fade=0,lastT=0;
function scr(){return cur}
function top(){return '<div class="w-top"><h1>Wanderer\'s Quest</h1><span class="w-where" id="w-where"></span>'+
 '<button class="w-btn" id="t-look" title="L">Look around</button><button class="w-btn" id="t-bag" title="I">Satchel</button><button class="w-btn" id="t-jr" title="J">Journal</button><button class="w-btn" id="t-map" title="M">Map</button>'+
 '<button class="w-btn" id="t-safe">Safe place</button><button class="w-btn" id="t-hall">Hall of Guides</button><button class="w-btn" id="t-hero">Hero</button></div>'}
function play(){
 cancelAnimationFrame(raf);
 app.innerHTML=top()+'<div class="w-stage" id="w-stage" tabindex="0" role="application" aria-roledescription="game" aria-label="Play area. Arrow keys or WASD to walk, E or Enter to interact. Tap or click to walk."><canvas id="w-cv" aria-hidden="true"></canvas><div class="w-sr" id="w-live" aria-live="polite"></div></div>';
 stage=document.getElementById("w-stage");cv=document.getElementById("w-cv");cx=cv.getContext("2d");
 document.getElementById("t-look").onclick=lookAround;document.getElementById("t-jr").onclick=journal;document.getElementById("t-bag").onclick=satchel;document.getElementById("t-map").onclick=mapPanel;
 document.getElementById("t-safe").onclick=goSafe;document.getElementById("t-hall").onclick=function(){hall()};document.getElementById("t-hero").onclick=function(){if(!B)creator()};
 cv.addEventListener("pointerdown",pdown);cv.addEventListener("pointermove",pmove);addEventListener("pointerup",function(){drag=null});
 enter(S.at in SC?S.at:"hub",S.x,S.y,1);
 last=performance.now();raf=requestAnimationFrame(loop);stage.focus();
}
function live(t){var l=document.getElementById("w-live");if(l)l.textContent=t}
function enter(id,x,y,quiet){var s=SC[id]||SC.hub;build(s);cur=s;S.at=s.id;if(S.visited.indexOf(s.id)<0)S.visited.push(s.id);
 var p=free(s,x==null?320:x,y==null?250:y);P.x=p[0];P.y=p[1];P.trail=[];tgt=null;save();fade=RM?0:1;
 var w=document.getElementById("w-where");if(w)w.textContent=s.n+(s.sub?" · "+s.sub:"");
 if(!quiet)live("You arrive at "+s.n+". "+(s.sub||""));
 if(s.id==="safe"&&!S.safe.kind)safeChoice();sniff(s);if(!quiet)gjEnter(s)}
function blocked(s,x,y){if(x<6||x>W-6||y<62||y>H-6)return false;
 for(var i=0;i<s.items.length;i++){var o=s.items[i],f=FT[o.t];if(!f)continue;var k=o.sc||1,dx=(x-o.x)/(f[0]*k+8),dy=(y-o.y)/(f[1]*k+5);if(dx*dx+dy*dy<1)return true}
 var wa=s.w||[];for(i=0;i<wa.length;i++){dx=(x-wa[i][0])/wa[i][2];dy=(y-wa[i][1])/wa[i][3];if(dx*dx+dy*dy<1)return true}
 if(s.id==="safe"&&S.safe.kind==="beach"&&y<130)return true;
 return false}
function free(s,x,y){if(!blocked(s,x,y)&&x>8&&x<W-8&&y>66&&y<H-8)return[x,y];for(var r=8;r<300;r+=8)for(var a=0;a<6.28;a+=.4){var X=x+Math.cos(a)*r,Y=y+Math.sin(a)*r;if(X>20&&X<W-20&&Y>80&&Y<H-20&&!blocked(s,X,Y))return[X,Y]}return[320,250]}
function busy(){return !!(OV||B)}
function loop(t){if(!document.body.contains(cv))return;var dt=Math.min(.05,(t-last)/1000);last=t;lastT=t;update(dt,t);render(t);raf=requestAnimationFrame(loop)}
function update(dt,t){var s=cur;if(fade>0)fade=Math.max(0,fade-dt*3);
 var vx=0,vy=0;if(!busy()||(DM&&DM.sel==null&&!OVblock())){
  if(held.ArrowLeft||held.a)vx-=1;if(held.ArrowRight||held.d)vx+=1;if(held.ArrowUp||held.w)vy-=1;if(held.ArrowDown||held.s)vy+=1;
  if(vx||vy)tgt=null;else if(tgt){var dx=tgt.x-P.x,dy=tgt.y-P.y,dd=Math.hypot(dx,dy);var reach=tgt.o?44:4;if(dd<reach){var o=tgt.o;tgt=null;if(o)interact(o)}else{vx=dx/dd;vy=dy/dd}}}
 if(vx||vy){var l=Math.hypot(vx,vy),sp=135*dt;vx/=l;vy/=l;var nx=P.x+vx*sp,ny=P.y+vy*sp,moved=0;
  if(!blocked(s,nx,P.y)){P.x=nx;moved=1}if(!blocked(s,P.x,ny)){P.y=ny;moved=1}
  if(!moved&&tgt)tgt=null;
  P.dir=Math.abs(vx)>Math.abs(vy)?(vx>0?2:3):(vy<0?1:0);P.ph+=dt*12;
  P.trail.push([P.x,P.y]);PETW.d+=sp;if(PETW.d>900){PETW.d=0;bondAdd(1)}if(P.trail.length>40)P.trail.shift();
  edges(s)}else P.ph=0;
 /* symptoms wander; touching one begins the casting right here */
 (s.ens||[]).forEach(function(e){if(gone(e))return;if(e.cd>0)e.cd-=dt;
  if(!RM&&!B&&!e.boss){e.ph+=dt*.7;e.x=e.hx+Math.cos(e.ph)*40;e.y=e.hy+Math.sin(e.ph*1.3)*22}
  if(!busy()&&e.cd<=0&&Math.hypot(P.x-e.x,(P.y-e.y)*1.3)<(e.boss?(e.reg==="fog"?62:50):26))battle(e)})}
function OVblock(){return OV&&OV!=="dec"}
function edges(s){var d=null;if(P.x<6)d="w";else if(P.x>W-6)d="e";else if(P.y<62)d="n";else if(P.y>H-6)d="s";if(!d)return;
 var n=nb(s,d);if(!n){P.x=Math.max(6.5,Math.min(W-6.5,P.x));P.y=Math.max(62.5,Math.min(H-6.5,P.y));return}
 if(DM)return endDecorate(),void 0;
 if(s.id==="safe"){enter("hub",560,370);return}
 if(s.id==="hollow"){enter("woods",590,120);return}
 var x=P.x,y=P.y;if(d==="w")x=W-14;if(d==="e")x=14;if(d==="n")y=H-14;if(d==="s")y=70;enter(n,x,y)}
function gone(e){return e.boss?S.beaten.indexOf(e.reg)>=0:S.cleared.indexOf(e.id)>=0}
/* ---------- drawing ---------- */
var PAT={},WXK="";
function render(t){var r=stage.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);if(r.width<2||r.height<2)return;
 var w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}
 var c=cx,s=cur,sc=Math.min(r.width/W,r.height/H),ox=(r.width-W*sc)/2,oy=(r.height-H*sc)/2;
 if(B){var hud=stage.querySelector(".w-bhud"),bot=stage.querySelector(".w-bbot"),t0=hud?hud.getBoundingClientRect().bottom-r.top:0,b0=bot?bot.getBoundingClientRect().top-r.top:r.height;
  sc=Math.max(sc,Math.min(r.width/W,(b0-t0)/(H*.62)));var fx=(P.x+B.e.x)/2,fy=(P.y+B.e.y)/2-40;var tx=r.width/2-fx*sc,ty=(t0+b0)/2-fy*sc;
  if(RM||VIEW.b!==B){ox=tx;oy=ty}else{ox=VIEW.ox+(tx-VIEW.ox)*.15;oy=VIEW.oy+(ty-VIEW.oy)*.15}VIEW.b=B}else VIEW.b=null;
 VIEW.s=sc;VIEW.ox=ox;VIEW.oy=oy;var so=shakeOff();ox+=so[0];oy+=so[1];
 c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle="#3a2c18";c.fillRect(0,0,r.width,r.height);
 var gi=img("map-"+s.g);if(gi&&!(s.id==="safe"&&S.safe.kind==="beach")){if(!PAT[s.g])PAT[s.g]=c.createPattern(gi,"repeat");c.save();c.translate(ox,oy);c.scale(sc,sc);c.fillStyle=PAT[s.g];c.fillRect(-ox/sc-W,-oy/sc-H,r.width/sc+2*W,r.height/sc+2*H);c.restore();c.fillStyle="rgba(30,20,10,.45)";c.fillRect(0,0,r.width,r.height)}
 c.setTransform(dpr*sc,0,0,dpr*sc,dpr*ox,dpr*oy);
 c.save();c.beginPath();c.rect(0,0,W,H);c.clip();
 if(s.id==="safe"&&S.safe.kind==="beach")beach(c,t);else if(gi)c.drawImage(gi,0,0,W,H);
 (s.w||[]).forEach(function(a){water(c,a[0],a[1],a[2],a[3],t)});
 if(s.id==="safe"&&S.safe.kind==="forest")water(c,520,110,70,26,t);
 c.restore();
 var L=[];s.items.forEach(function(o){if(o.t!=="look")L.push({y:o.y,f:function(){drawItem(c,o,t)}})});
 (s.ens||[]).forEach(function(e){if(!gone(e))L.push({y:e.y,f:function(){drawEnemy(c,e,t)}})});
 if(s.id==="safe")S.safe.items.forEach(function(it,i){L.push({y:it.y,f:function(){var d=DEC[it.k];if(d)d.d(c,it.x,it.y,t);if(DM&&DM.sel===i){c.strokeStyle="#ffd98a";c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.ellipse(it.x,it.y-6,30,14,0,0,7);c.stroke();c.setLineDash([])}}})});
 var pt=P.trail.length>12?P.trail[P.trail.length-12]:[P.x-26,P.y+4];
 L.push({y:pt[1]-.1,f:function(){drawPet(c,pt[0],pt[1],t)}});
 L.push({y:P.y,f:function(){drawHero(c,S.hero,P.x,P.y,1,B?(B.e.x<P.x?3:2):P.dir,RM?0:P.ph);if(B&&B.shield){c.strokeStyle="rgba(255,214,120,.8)";c.lineWidth=3;c.beginPath();c.arc(P.x,P.y-30,34,0,7);c.stroke()}}});
 L.sort(function(a,b){return a.y-b.y}).forEach(function(d){d.f()});
 c.save();c.beginPath();c.rect(0,0,W,H);c.clip();
 if(s.tone){c.fillStyle=s.tone;c.fillRect(0,0,W,H)}
 WXK=weather(c,s,t);
 var g=c.createRadialGradient(W*.55,H*.3,60,W/2,H/2,W*.75);g.addColorStop(0,"rgba(255,220,150,.10)");g.addColorStop(1,"rgba(60,30,10,.32)");c.fillStyle=g;c.fillRect(0,0,W,H);
 if(B){c.fillStyle="rgba(30,20,40,.18)";c.fillRect(0,0,W,H)}
 if(fade>0){c.fillStyle="rgba(20,12,4,"+fade+")";c.fillRect(0,0,W,H)}
 c.restore();
 drawFX(c,t);drawSparks(c);
 if(!busy()){var n=near();if(n)label(c,n)}
 if(DM&&DM.pick){c.fillStyle="rgba(255,214,120,.5)";c.beginPath();c.ellipse(P.x,P.y-34,6,6,0,0,7);c.fill()}}
function label(c,o){var t=verb(o)+(o.name?" "+o.name:"");var y=o.y-(FT[o.t]?FT[o.t][2]*(o.sc||1):30)-8;if(o.t==="look")y=o.y-20;c.font="600 13px system-ui,sans-serif";var w=c.measureText(t).width+14,x=Math.max(w/2+2,Math.min(W-w/2-2,o.x));y=Math.max(20,y);c.fillStyle="rgba(250,240,215,.92)";c.strokeStyle="#8a6a3e";c.lineWidth=1;c.beginPath();if(c.roundRect)c.roundRect(x-w/2,y-16,w,21,8);else c.rect(x-w/2,y-16,w,21);c.fill();c.stroke();c.fillStyle="#3b2a1a";c.textAlign="center";c.fillText(t,x,y-1);c.textAlign="left"}
function verb(o){return "E: "+({sign:"Read",npc:"Talk to",chest:"Open chest",find:"Pick up",look:"Look",door:"Lantern trail to your safe place",page:"Pick up a journal page",path:"Push through the ferns",fish:"Fish at the pond",qitem:"Pick up",house:o.role==="hall"?"Enter the Hall of Guides":o.role==="office"?"Knock on the office door":"Look"}[o.t]||"Look")}
function water(c,x,y,rx,ry,t){var g=c.createRadialGradient(x,y-ry*.3,4,x,y,rx);g.addColorStop(0,"rgba(120,180,190,.95)");g.addColorStop(1,"rgba(60,110,125,.9)");c.save();try{c.filter="blur(1.5px)"}catch(e){}c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();c.restore();
 c.strokeStyle="rgba(240,230,190,.45)";c.lineWidth=1.2;for(var i=0;i<4;i++){var ph=RM?0:(t/900+i)%1;c.beginPath();c.ellipse(x+(i-1.5)*rx*.35,y+(i%2?6:-6),10+ph*8,2,0,0,Math.PI);c.stroke()}}
function beach(c,t){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#3f7f9a");g.addColorStop(.26,"#7fb6c2");g.addColorStop(.3,"#f0dfb0");g.addColorStop(1,"#d9b97c");c.fillStyle=g;c.fillRect(0,0,W,H);
 var gl=c.createLinearGradient(0,0,0,110);gl.addColorStop(0,"rgba(255,190,120,.35)");gl.addColorStop(1,"rgba(255,190,120,0)");c.fillStyle=gl;c.fillRect(0,0,W,110);
 for(var i=0;i<3;i++){var o=RM?0:Math.sin(t/1200+i)*6;c.strokeStyle="rgba(255,250,235,"+(.7-i*.18)+")";c.lineWidth=3-i;c.beginPath();for(var x=0;x<=W;x+=16)c.lineTo(x,112+i*7+o+Math.sin(x/40+i)*3);c.stroke()}
 c.fillStyle="rgba(160,120,70,.18)";for(var k=0;k<60;k++){var hx=(k*97)%W,hy=140+(k*53)%270;c.fillRect(hx,hy,2,1.5)}}
function drawItem(c,o,t){var f=FT[o.t];switch(o.t){
 case"tree":shadow(c,o.x,o.y,26,7);sp(c,"tree",o.x,o.y+4,110,o.flip);break;
 case"rock":shadow(c,o.x,o.y+2,22,5);sp(c,"rock",o.x,o.y+5,54,o.flip);break;
 case"house":shadow(c,o.x,o.y,56*o.sc,10*o.sc);sp(c,"house",o.x,o.y+6,124*o.sc,o.flip);if(o.role){c.font="600 12px Georgia,serif";c.textAlign="center";var lb=o.role==="hall"?"Hall of Guides":"Open Book Office";var lw=c.measureText(lb).width+12;c.fillStyle="rgba(250,240,215,.9)";c.fillRect(o.x-lw/2,o.y-124*o.sc-12,lw,17);c.fillStyle="#5a2e0e";c.fillText(lb,o.x,o.y-124*o.sc+1);c.textAlign="left";if(o.role==="office")glow(c,o.x,o.y-30,50,t)}break;
 case"sign":shadow(c,o.x,o.y,10,3);sp(c,"sign",o.x,o.y+2,42);break;
 case"lantern":glow(c,o.x,o.y-44,44,t);sp(c,"lantern",o.x,o.y+2,56);break;
 case"chest":shadow(c,o.x,o.y,16,4);sp(c,S.opened.indexOf(o.key)>=0?"chesto":"chest",o.x,o.y+3,34);break;
 case"wall":shadow(c,o.x,o.y,32,6);sp(c,"wall",o.x,o.y+4,58);break;
 case"npc":shadow(c,o.x,o.y,11,4);sp(c,o.spr,o.x,o.y+2,58,P.x<o.x);break;
 case"door":glow(c,o.x,o.y-20,40,t);sp(c,"door",o.x,o.y+2,52);sp(c,"lantern",o.x-22,o.y+2,34);sp(c,"lantern",o.x+22,o.y+2,34);break;
 case"page":if(S.pages.indexOf(o.pg)<0){glowDot(c,o.x,o.y-6,14,"#fff4d0",RM?.4:.25+.2*Math.sin(t/500+o.x));c.save();c.translate(o.x,o.y-4);c.rotate(-.2);c.fillStyle="#f4ead2";c.fillRect(-7,-5,14,10);c.strokeStyle="rgba(120,90,50,.6)";c.lineWidth=.8;for(var pl=-2;pl<4;pl+=2){c.beginPath();c.moveTo(-5,pl);c.lineTo(5,pl);c.stroke()}c.restore()}break;
 case"path":var pd=Math.hypot(P.x-o.x,P.y-o.y);if(pd<110){var pa=(1-pd/110)*(RM?.5:.35+.2*Math.sin(t/300));glowDot(c,o.x,o.y,26,"#d8ffb0",pa)}break;
 case"fish":c.strokeStyle="rgba(250,240,210,.8)";c.lineWidth=1.2;c.beginPath();c.moveTo(o.x+18,o.y+6);c.lineTo(o.x+30,o.y-30);c.stroke();blob(c,o.x,o.y-4+(RM?0:Math.sin(t/400)*1.5),3.5,3,"#e0503a",0);c.fillStyle="#5a3418";c.fillRect(o.x+16,o.y+2,16,4);break;
 case"qitem":if(S.q[o.qk]===1&&!S.q[o.qk+"_got"]){glowDot(c,o.x,o.y-6,22,"#ffd98a",RM?.5:.35+.2*Math.sin(t/400));if(o.qk==="q_wick"){c.strokeStyle="#f4efe4";c.lineWidth=2.5;c.beginPath();c.moveTo(o.x-8,o.y-2);c.quadraticCurveTo(o.x,o.y-12,o.x+8,o.y-4);c.stroke()}else{poly(c,[[o.x-7,o.y-12],[o.x+7,o.y-12],[o.x+7,o.y],[o.x-7,o.y]],"#c9a24a");blob(c,o.x,o.y-6,3,3,"#e86a8a",0)}}break;
 case"find":if(S.found.indexOf(o.key)<0){glow(c,o.x,o.y-8,26,t);DEC[o.item].d(c,o.x,o.y,t)}break;
 default:if(GJT[o.t])gjDraw(c,o,t)}}
function drawEnemy(c,e,t){var col=R(e.reg).col,bob=RM?0:Math.sin(t/400+e.ph)*3,inB=B&&B.e===e,x=e.x,y=e.y;
 if(inB){var pul=RM?.5:.5+.3*Math.sin(t/250);c.fillStyle="rgba(255,207,90,"+(.18*pul)+")";c.beginPath();c.ellipse(x,y,e.boss?70:36,e.boss?18:10,0,0,7);c.fill()}
 shadow(c,x,y,e.boss?44:18,e.boss?9:5);
 if(!e.boss){drawC(c,tinted(e.reg==="fog"?"storm":"fog",col,.4),x,y-6+bob,50,.95);if(inB&&B.worries)for(var wj=0;wj<B.worries;wj++){var wb=(RM?wj*2:t/500)+wj*2.1;drawC(c,tinted("fog",col,.3),x+Math.cos(wb)*44,y-10+Math.sin(wb)*16,22,.9)}}
 else switch(e.reg){
  case"anx":drawC(c,tinted("storm",col,.35),x,y-10+bob,130);if(inB&&B.worries)for(var wi=0;wi<B.worries;wi++){var wa=(RM?wi*2:t/500)+wi*2.1;drawC(c,tinted("storm",col,.3),x+Math.cos(wa)*110,y-30+Math.sin(wa)*30,44,.9)}var n=3+(inB?B.gust:0);c.strokeStyle="rgba(230,245,255,.7)";c.lineWidth=2;for(var i=0;i<n;i++){var a=(RM?0:t/600)+i*6.28/n;c.beginPath();c.arc(x,y-70,70+i*3,a,a+.7);c.stroke()}break;
  case"ptsd":drawC(c,tinted("fog",col,.45),x,y-8+bob,120);if(inB&&(B.turn+1)%3===0){for(i=1;i<=3;i++){c.strokeStyle="rgba(200,180,240,"+(.6-i*.15)+")";c.lineWidth=2;c.beginPath();c.ellipse(x,y-60,60+i*16,40+i*10,0,0,7);c.stroke()}}break;
  case"rel":drawC(c,tinted("fog",col,.45),x-58,y-6+bob,96);drawC(c,tinted("fog","#f6d0c8",.45),x+58,y-6-bob,96);c.strokeStyle="rgba(60,30,40,.55)";c.lineWidth=3;c.beginPath();c.moveTo(x,y-80);c.lineTo(x-5,y-55);c.lineTo(x+4,y-35);c.lineTo(x-3,y-10);c.stroke();break;
  case"ocd":drawC(c,tinted("storm",col,.45),x,y-10+bob,130);var lk=inB?B.locks:2;for(i=0;i<lk;i++){var a2=(RM?0:t/900)+i*2.1;lock(c,x+Math.cos(a2)*80,y-70+Math.sin(a2)*36)}break;
  case"adhd":var jx=RM||!inB?0:Math.sin(t/90)*6;drawC(c,tinted("fog",col,.4),x+jx,y-14+bob*2,76);for(i=0;i<6;i++){var a3=(RM?0:t/300)+i;c.fillStyle="rgba(230,255,200,.85)";c.beginPath();c.arc(x+Math.cos(a3)*54,y-50+Math.sin(a3*1.7)*28,3,0,7);c.fill()}break;
  case"ed":drawC(c,tinted("fog",col,.5),x,y-8+bob,124,.82);break;
  case"grief":glow(c,x,y-70,90,t);sp(c,"lantern",x,y+2,120);var lit=inB?Math.round((B.max-B.hp)/B.max*5):0;for(i=0;i<5;i++){var lx=x-80+i*40;glow(c,lx,y-150,i<lit?24:0,t);sp(c,"lantern",lx,y-136,30,0,i<lit?1:.45)}break;
  case"fog":drawC(c,img("sp-boss"),x,y+10+bob,236,.97);if(inB&&B.phase){glowDot(c,x,y-60,150,"#d8dde4",.45)}break}
 if(inB&&B.hit===1)B.hit=performance.now();if(inB&&B.hit){var k=Math.max(0,1-(performance.now()-B.hit)/350);if(k>0){c.fillStyle="rgba(255,250,230,"+(.5*k)+")";c.beginPath();c.arc(x,y-(e.boss?70:28),(e.boss?80:30)*(1.2-k*.2),0,7);c.fill();if(B.crack){c.strokeStyle="rgba(255,200,80,"+k+")";c.lineWidth=3;c.beginPath();c.arc(x,y-(e.boss?70:28),(e.boss?90:36)*(1.5-k*.5),0,7);c.stroke()}}}}
function lock(c,x,y){c.strokeStyle="#5a4a20";c.lineWidth=3;c.beginPath();c.arc(x,y-6,6,Math.PI,0);c.stroke();poly(c,[[x-9,y-6],[x+9,y-6],[x+9,y+8],[x-9,y+8]],"#c9a84a");c.fillStyle="#3b2a1a";c.fillRect(x-1,y-1,2,5)}
/* ---------- interaction ---------- */
function interactables(){return cur.items.filter(function(o){return (GJT[o.t]&&(o.t!=="clue"||S.clues.indexOf(o.gj)<0))||o.t==="sign"||o.t==="npc"||o.t==="look"||o.t==="door"||(o.t==="chest"&&S.opened.indexOf(o.key)<0)||(o.t==="find"&&S.found.indexOf(o.key)<0)||(o.t==="page"&&S.pages.indexOf(o.pg)<0)||o.t==="fish"||(o.t==="path"&&Math.hypot(P.x-o.x,P.y-o.y)<70)||(o.t==="qitem"&&S.q[o.qk]===1&&!S.q[o.qk+"_got"])||(o.t==="house"&&(o.role||o.look))||o.t==="chest"})}
function dist(o){return Math.hypot(P.x-o.x,(P.y-o.y)*1.2)-(o.t==="look"?o.r*.6:o.t==="house"?40*(o.sc||1):0)}
function near(){var b=null,bd=52;interactables().forEach(function(o){var d=dist(o);if(d<bd){bd=d;b=o}});return b}
function give(k){S.bag[k]=(S.bag[k]||0)+1;save()}
function interact(o){if(!o)return;switch(o.t){
 case"sign":say(o.text,"Signpost");break;
 case"look":say(o.text);break;
 case"npc":var qk=questFor(o.name);gjNpc(o);if(qk)questTalk(o,qk);else say(o.lines,o.name);break;
 case"page":S.pages.push(o.pg);if(S.secrets.indexOf("page")<0)S.secrets.push("page");save();say(["You found a journal page ("+S.pages.length+" of "+PAGES.length+").","\u201c"+PAGES[o.pg]+"\u201d","It's saved in your skill journal."],"Journal page");break;
 case"path":if(S.secrets.indexOf("path")<0){S.secrets.push("path");save()}enter("hollow",320,370);say("You push through the ferns and find a hidden hollow with a still pond.");break;
 case"fish":fishing();break;
 case"qitem":S.q[o.qk+"_got"]=1;save();say("You found the "+QS[o.qk].item.toLowerCase()+". Bring it back to "+QS[o.qk].npc+".");break;
 case"chest":if(S.opened.indexOf(o.key)>=0){say("The chest is empty now. You already took what was inside.");break}S.opened.push(o.key);give(o.item);say("Inside the chest: "+decName(o.item)+". It's in your satchel, ready for your safe place.");break;
 case"find":S.found.push(o.key);give(o.item);say("You found "+decName(o.item)+". It's in your satchel.");break;
 case"door":goSafe();break;
 case"house":if(o.role==="hall")hall();else if(o.role==="office"){if(officeOpen())office();else say("The door is closed for now. A note reads: \"Calm all eight bosses and come in.\" Bosses calmed: "+S.beaten.length+" of 8.","Open Book Office")}break}}
function officeOpen(){return BOSS.every(function(b){return S.beaten.indexOf(b)>=0})}
function closeOV(){var o=stage&&stage.querySelector(".w-say,.w-pan");if(o)o.remove();OV=DM?"dec":null;if(stage)stage.focus()}
function say(lines,who){if(typeof lines==="string")lines=[lines];if(gjFeel){if(gjFeel.who===who)lines=lines.concat(gjFeel.l);gjFeel=null}var i=0;closeOV();OV="say";held={};
 var d=document.createElement("div");d.className="w-say w-par";d.setAttribute("role","dialog");d.setAttribute("aria-label",who||"Message");stage.appendChild(d);
 function show(){d.innerHTML=(who?'<p class="w-who">'+esc(who)+'</p>':'')+'<p>'+esc(lines[i])+'</p><div class="w-sayb">'+(i<lines.length-1?'<button class="w-btn pri" id="s-next">Next</button>':'<button class="w-btn pri" id="s-ok">Close</button>')+'</div>';
  var n=d.querySelector("#s-next"),k=d.querySelector("#s-ok");if(n){n.onclick=function(){i++;show()};n.focus()}if(k){k.onclick=closeOV;k.focus()}live((who?who+": ":"")+lines[i])}
 show()}
function panel(html,lbl){closeOV();OV="pan";held={};var d=document.createElement("div");d.className="w-pan w-par";d.setAttribute("role","dialog");d.setAttribute("aria-label",lbl);d.innerHTML=html+'<p><button class="w-btn pri" id="p-close">Back to exploring</button></p>';stage.appendChild(d);d.querySelector("#p-close").onclick=closeOV;var h=d.querySelector("h2");if(h){h.tabIndex=-1;h.focus()}return d}
function lookAround(){if(B)return;var s=cur,seen=interactables().map(function(o){return o.name||({sign:"a signpost",look:"something worth a closer look",door:"the lantern trail to your safe place",chest:"a chest",find:"something glinting on the ground",page:"a loose journal page",path:"a gap in the ferns",fish:"a fishing spot",qitem:"something someone lost",house:o.role==="hall"?"the Hall of Guides":"the Open Book Office"}[o.t])});
 var en=(s.ens||[]).filter(function(e){return !gone(e)}).map(function(e){return e.boss?BD[e.reg].name:"a "+MIN[e.reg]});
 var ex=["n","e","s","w"].filter(function(d){return nb(s,d)}).map(function(d){return {n:"north",e:"east",s:"south",w:"west"}[d]+" to "+SC[nb(s,d)].n});
 say([s.n+(s.sub?" ("+s.sub+")":"")+". You see: "+(seen.length?seen.join(", "):"open ground")+".",en.length?"Symptoms here: "+en.join(", ")+". Walk into one to begin casting.":"No symptoms are wandering here right now.","Paths lead "+(ex.join("; ")||"nowhere else")+"."])}
function satchel(){if(B)return;var ks=Object.keys(S.bag).filter(function(k){return S.bag[k]>0});
 panel('<h2>Your satchel</h2><p>Treasures for your safe place:</p><ul>'+(ks.length?ks.map(function(k){return '<li>'+esc(decName(k))+(S.bag[k]>1?' ×'+S.bag[k]:'')+'</li>'}).join(""):'<li>Nothing right now. Everything is placed in your safe place.</li>')+'</ul>'+
 '<p>Keepsakes from bosses: '+(S.loot.length?S.loot.map(esc).join(", "):'none yet')+'.</p><p>Bosses calmed: '+S.beaten.length+' of 8. Symptoms settled: '+S.cleared.length+'.</p><p>Traveling with you: '+esc(petName())+' (bond level '+bondLv()+'). <button class="w-btn" id="sa-pet">Companion</button></p><h3>Side quests</h3>'+questList(),"Satchel");document.getElementById("sa-pet").onclick=function(){companion()}}
function mapPanel(){if(B)return;var cells=[];for(var y=0;y<5;y++)for(var x=0;x<4;x++){var k=GRID[x+","+y];if(!k)continue;var s=SC[k];
  cells.push('<button class="w-btn'+(k===cur.id?' here':'')+'" data-go="'+k+'">'+esc(s.n)+'<small>'+esc(s.sub||"")+(s.reg&&S.beaten.indexOf(s.reg)>=0&&s.boss?' · calmed':'')+(S.visited.indexOf(k)<0?' · not visited yet':'')+'</small></button>')}
 var d=panel('<h2>Map of the land</h2><p>Every region is open. Walk off any edge to reach the next area, or travel straight to a place below.</p><div class="w-map">'+cells.join("")+'</div>',"Map");
 d.querySelectorAll("[data-go]").forEach(function(b){b.onclick=function(){closeOV();enter(b.dataset.go,320,250)}})}
/* ---------- input ---------- */
var drag=null;
function toWorld(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-VIEW.ox)/VIEW.s,y:(e.clientY-r.top-VIEW.oy)/VIEW.s}}
function pdown(e){stage.focus();var p=toWorld(e);
 if(DM){decPointer(p);return}
 if(busy())return;
 var hit=null,hd=34;interactables().forEach(function(o){var d=Math.hypot(p.x-o.x,p.y-(o.y-20))-(o.t==="look"?o.r*.5:o.t==="house"?50*(o.sc||1):0);if(d<hd){hd=d;hit=o}});
 if(hit){if(dist(hit)<52)interact(hit);else tgt={x:hit.x,y:hit.y+(hit.t==="house"?20*(hit.sc||1):12),o:hit};return}
 var x=p.x,y=p.y,s=cur;if(x<24&&nb(s,"w"))x=-10;if(x>W-24&&nb(s,"e"))x=W+10;if(y<80&&nb(s,"n"))y=50;if(y>H-24&&nb(s,"s"))y=H+10;tgt={x:x,y:y}}
function pmove(e){if(drag&&DM&&DM.sel!=null){var p=toWorld(e),it=S.safe.items[DM.sel];if(it){it.x=Math.max(20,Math.min(W-20,p.x));it.y=Math.max(S.safe.kind==="beach"?140:80,Math.min(H-12,p.y));save()}}}
var MV={ArrowLeft:1,ArrowRight:1,ArrowUp:1,ArrowDown:1,a:1,d:1,w:1,s:1};
document.addEventListener("keydown",function(e){if(!stage||!document.body.contains(stage))return;var ae=document.activeElement,k=e.key.length===1?e.key.toLowerCase():e.key;
 if(e.key==="Escape"){if(OV==="say"||OV==="pan"){closeOV();e.preventDefault()}else if(DM&&DM.sel!=null){DM.sel=null;decUI()}return}
 if(ae!==stage&&ae!==document.body)return;
 if(DM&&DM.sel!=null&&MV[k]){var it=S.safe.items[DM.sel],st=6;if(k==="ArrowLeft"||k==="a")it.x-=st;if(k==="ArrowRight"||k==="d")it.x+=st;if(k==="ArrowUp"||k==="w")it.y-=st;if(k==="ArrowDown"||k==="s")it.y+=st;it.x=Math.max(20,Math.min(W-20,it.x));it.y=Math.max(80,Math.min(H-12,it.y));save();e.preventDefault();return}
 if(DM&&(k==="Delete"||k==="Backspace")&&DM.sel!=null){putAway();e.preventDefault();return}
 if(MV[k]){held[k]=1;e.preventDefault();return}
 if(k==="Enter"||k==="e"||k===" "){e.preventDefault();if(DM&&DM.pick){placeAt(P.x,P.y-28);return}if(!busy())interact(near());return}
 if(!busy()){if(k==="l")lookAround();else if(k==="i")satchel();else if(k==="m")mapPanel();else if(k==="j")journal()}});
document.addEventListener("keyup",function(e){var k=e.key.length===1?e.key.toLowerCase():e.key;delete held[k]});
addEventListener("blur",function(){held={}});
/* ---------- casting battle, overlaid on the scene where you met the symptom ---------- */
var BRK=0;
function battle(e){if(B)return;closeOV();held={};tgt=null;
 var id=e.reg,base=BD[id],d=e.echo?echoD(id):e.boss?base:Object.assign({},base,{name:"The "+MIN[id],hp:10,mini:1,tip:"A smaller symptom. "+base.tip}),g=guideOf(id);
 B={e:e,id:id,d:d,g:g,hp:d.hp,max:d.hp,hope:10,hmax:10,turn:0,weak:Math.floor(Math.random()*4),chg:0,last:null,recent:[],gust:0,locks:0,shield:0,mom:0,listen:-9,gUsed:0,gShield:0,gMod:0,log:[],say:null,card:0,over:0,busy:0,hit:0,crack:0};
 var o=document.createElement("div");o.className="w-bov";o.setAttribute("role","region");o.setAttribute("aria-label","Casting battle with "+d.name);
 o.innerHTML='<div class="w-bhud w-par"><h2>'+esc(d.name)+'</h2><div class="w-bars"><div class="w-bar"><span>'+(d.gentle?'Lanterns lit':esc(d.name.replace("The ","")))+'</span><i><b id="b-bh"></b></i><em id="b-bhn"></em></div>'+
 '<div class="w-bar hope"><span>Your hope</span><i><b id="b-hh"></b></i><em id="b-hhn"></em></div></div><button class="w-btn" id="b-leave">Step back</button><p class="w-bwarn" id="b-warn"></p>'+(id==="ed"?EDHELP:'')+'</div>'+
 '<div class="w-breath w-par" id="b-br" hidden></div>'+
 '<div class="w-bbot w-par"><div class="w-bmsg" id="b-msg" aria-live="polite"></div><div class="w-sk" id="b-sk">'+d.sk.map(function(s,i){return '<button class="w-btn" data-s="'+i+'">'+esc(s[1])+'</button>'}).join("")+'</div>'+
 '<div class="w-sk2"><button class="w-btn pri" id="b-sig" disabled>'+SIG.name+' <small id="b-chg"></small></button><button class="w-btn" id="b-guide">Call '+esc(g.name.split(" ")[0])+'</button>'+
 (d.twist==="lock"?'<button class="w-btn" id="b-check">Check one more time</button>':'')+'<label class="w-tog"><input type="checkbox" id="b-btog"'+(CFG.breath?' checked':'')+'> Breath timing</label></div></div>';
 stage.appendChild(o);
 o.querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){act(+b.dataset.s)}});
 document.getElementById("b-sig").onclick=function(){act("sig")};document.getElementById("b-guide").onclick=function(){act("guide")};
 var ck=document.getElementById("b-check");if(ck)ck.onclick=function(){act("check")};
 document.getElementById("b-btog").onchange=function(ev){CFG.breath=ev.target.checked};
 document.getElementById("b-leave").onclick=function(){stepBack()};
 msg(esc(d.name)+(e.boss?' rises before you.':' drifts into your path.')+' '+esc(g.name)+' and '+esc(petName())+' are with you. '+esc(d.tip));
 gjStart(); ui();live("A casting battle begins with "+d.name+".");o.querySelector("[data-s]").focus()}
function endBattle(){if(!B)return;B.over=1;var o=stage.querySelector(".w-bov");if(o)o.remove();var e=B.e;B=null;if(e&&e.echo&&cur){var k=cur.ens.indexOf(e);if(k>=0)cur.ens.splice(k,1)}return e}
function stepBack(){var e=endBattle();if(!e)return;e.cd=3;var dx=P.x-e.x,dy=P.y-e.y,l=Math.hypot(dx,dy)||1,p=free(cur,P.x+dx/l*60,P.y+dy/l*60);P.x=p[0];P.y=p[1];stage.focus()}
var EDHELP='<p class="w-edhelp">Need support with eating? <a href="https://www.anad.org/get-help/eating-disorders-helpline/" target="_blank" rel="noopener">ANAD helpline</a> · free · <a href="tel:+18883757767">1-888-375-7767</a> · Mon–Fri, 9am–9pm Central</p>';
var _hit=function(){};
function bend(html,btns){var o=stage.querySelector(".w-bov");o.querySelectorAll(".w-bbot,.w-breath").forEach(function(n){n.remove()});var d=document.createElement("div");d.className="w-bend w-par";d.innerHTML=html+'<p>'+btns+'</p>';o.appendChild(d);var f=d.querySelector("button");if(f)f.focus()}
function win(){if(B.d.practice)return gjEchoWin();var d=B.d,e=B.e,id=B.id,drop="";B.over=1;bondAdd(2);
 if(e.boss){if(S.beaten.indexOf(id)<0)S.beaten.push(id);if(S.loot.indexOf(d.loot)<0){S.loot.push(d.loot);give("k_"+id)}}
 else{if(S.cleared.indexOf(e.id)<0){S.cleared.push(e.id);drop=["stone","flowers","shell","lantern","sapling","chime","books","blanket"][S.cleared.length%8];give(drop)}}
 save();var all=officeOpen();
 bend((e.boss?'<canvas class="w-vic" width="320" height="200" role="img" aria-label="Your hero stands in the golden light, holding up the '+esc(d.loot)+', with '+esc(petName())+' hopping beside them."></canvas>':'')+'<h2>'+esc(d.name)+(d.gentle?' glows softly. '+(e.boss?'Every lantern is lit.':'The wave passes.'):(id==='rel'&&e.boss?' calm and drift apart, gently.':' calms and drifts away.'))+'</h2>'+
 (e.boss?'<p>You found the <b>'+esc(d.loot)+'</b>. It can rest in your safe place as a keepsake.</p>':'<p>It left something behind: <b>'+esc(decName(drop)||"a quiet moment")+'</b>.</p>')+
 '<p>'+esc(B.g.name)+': "You used real skills there. They work outside the game too."</p>'+(e.boss?'<p>Bosses calmed: '+S.beaten.length+' of 8.'+(all?' The Open Book Office is open now.':'')+'</p>':'')+(id==="ed"?EDHELP:''),
 '<button class="w-btn pri" id="b-on">Keep exploring</button>');
 gjWin(e,id);var vc=stage.querySelector('.w-vic');if(vc)victory(vc,id);
 document.getElementById("b-on").onclick=function(){endBattle();stage.focus();if(all&&e.boss)say("Word travels fast: the Open Book Office door is open. It's south of the Crossroads.")}}
function lose(){var d=B.d;B.over=1;
 bend('<h2>Time to rest and regroup</h2><p>'+esc(d.name)+' was strong today. That happens, in the game and in life. Your hope refills when you rest.</p>',
 '<button class="w-btn pri" id="b-again">Try again</button> <button class="w-btn" id="b-rest">Rest at your safe place</button> <button class="w-btn" id="b-back">Step back</button>');
 document.getElementById("b-again").onclick=function(){var e=endBattle();battle(e)};
 document.getElementById("b-rest").onclick=function(){endBattle();goSafe()};
 document.getElementById("b-back").onclick=function(){B.over=0;stepBack()}}
function msg(h,rl){var m=document.getElementById("b-msg");if(m)m.innerHTML='<p>'+h+'</p>'+(rl?'<details class="w-rl"'+(innerWidth>760?' open':'')+'><summary><b>In real life</b></summary> '+esc(rl)+'</details>':'')}
function ui(){
 var d=B.d,w=d.sk[B.weak];
 function bar(id,v,mx){document.getElementById(id).style.width=Math.max(0,v/mx*100)+"%"}
 if(d.gentle){bar("b-bh",B.max-B.hp,B.max)}else bar("b-bh",B.hp,B.max);
 bar("b-hh",B.hope,B.hmax);
 document.getElementById("b-bhn").textContent=d.noNum?"":d.gentle?(B.max-B.hp)+"/"+B.max:B.hp+"/"+B.max;
 document.getElementById("b-hhn").textContent=d.noNum?"":B.hope+"/"+B.hmax;
 var sb=document.getElementById("b-sig");sb.disabled=B.chg<4||B.busy;document.getElementById("b-chg").textContent=B.chg>=4?"ready":"charging";
 sb.setAttribute("aria-label",SIG.name+(B.chg>=4?", ready":", charging. Use different skills to charge it"));
 var gb=document.getElementById("b-guide");gb.disabled=!!B.busy||(B.gShield&&B.gMod);
 app.querySelectorAll("[data-s]").forEach(function(b){b.disabled=!!B.busy;b.classList.toggle("weak",+b.dataset.s===B.weak)});
 var ck=document.getElementById("b-check");if(ck)ck.disabled=!!B.busy;
 var hit=drain(0),wn=d.twist==="echo"&&(B.turn+1)%3===0?'An echo is rising. ':'';
 if(d.twist==="gust"&&B.gust)wn+='Gusts stacked: '+B.gust+'. ';
 if(d.twist==="lock"&&B.locks)wn+='Locks: '+B.locks+'. ';
 if(d.twist==="shield"&&B.shield)wn+='Your shield is up. ';
 if(d.twist==="momentum"&&B.mom)wn+='Momentum: +'+B.mom+'. ';
 if(B.worries)wn+='Small worries: '+B.worries+'. ';var cs=B.seq||[],cn=0;for(var ci=Math.min(3,cs.length);ci>0;ci--){if(cs.slice(-ci).join()===comboOf(d).slice(0,ci).join()){cn=ci;break}}
 var hide=B.fogHide>0;app.querySelectorAll('[data-s]').forEach(function(b){if(hide)b.classList.remove('weak')});
 document.getElementById("b-warn").innerHTML=wn+'<span class="w-combo">Combo: '+esc(comboName(d))+(cn?' ('+cn+' of 3)':'')+'</span> '+(hide?'The weak spot is hidden in the fog':'Watch for: <b>'+esc(w[2])+'</b>. Weak spot: <b>'+esc(w[1])+'</b>')+(d.noNum||d.gentle?'.':'. If missed, the next hit takes '+hit+' hope.');
}
function drain(weakHit){var d=B.d;if(B.fogHide>0)weakHit=1;var n=weakHit?1:2;if(d.twist==="gust")n+=weakHit?0:B.gust;if(d.twist==="echo"&&(B.turn+1)%3===0&&!weakHit)n*=2;if(!weakHit&&B.worries)n+=B.worries;return n}
function act(k){
 if(B.busy||B.over)return;
 if(k==="guide"){photoCard();return}
 if(k==="check"){B.locks+=2;B.hope=Math.min(B.hmax,B.hope+1);castSay();boss(0);msg('You check one more time. Relief for a moment, and two new locks click shut.','Checking calms the worry briefly, then the urge comes back stronger.');ui();return}
 if(CFG.breath){B.busy=1;ui();breathCast(function(bonus){B.busy=0;resolve(k,bonus)})}else resolve(k,0);
}
function pickMod(g,id){var pref={anx:["CBT","ACT","EMDR"],ptsd:["EMDR","IFS","CBT"],rel:["Gottman","EFT","IFS"],ocd:["ERP","ACT","CBT"],adhd:["CBT","DBT","ACT"],ed:["ACT","DBT","IFS"],grief:["ACT","IFS","EMDR"],fog:["CBT","ACT","DBT"]}[id]||[];
 var mods=g.mods||[];for(var i=0;i<pref.length;i++)for(var j=0;j<mods.length;j++)if(mods[j].indexOf(pref[i])===0)return mods[j];return mods[0]||""}
function resolve(k,bonus){
 var d=B.d,txt,rl,dmg,weakHit=0;
 if(k==="sig"){fx("sig");B.chg=0;dmg=5+bonus;weakHit=1;txt=SIG.name+'! Two skills shine at once.';rl=SIG.rl}
 else{var s=d.sk[k];fx(s[0]);weakHit=k===B.weak;dmg=2+(weakHit?2:0)+bonus;
  var fresh=B.recent.indexOf(k)<0;B.chg=Math.min(4,B.chg+(fresh?2:(B.last===k?0:1)));
  if(d.twist==="gust"){if(weakHit)B.gust=Math.max(0,B.gust-1);else B.gust++}
  if(d.twist==="listen"){if(s[0]==="listen")B.listen=B.turn;if((s[0]==="repair"||s[0]==="soft")&&B.turn-B.listen>2){dmg=Math.max(1,dmg-2);txt=s[1]+' lands softly. Listening first would help it land.'}}
  if(d.twist==="lock"){if(s[0]==="erp"){dmg+=B.locks;B.locks=0}else dmg=Math.max(1,dmg-Math.min(2,B.locks))}
  if(d.twist==="spark"){if(B.last===k)dmg=Math.max(1,dmg-1);else if(B.last!==null)dmg+=1}
  if(d.twist==="momentum"){dmg+=B.mom;if(s[0]==="step")B.mom=Math.min(2,B.mom+1)}
  if(d.twist==="shield"&&s[0]==="reach")B.shield=1;
  var cmb=0;B.seq=(B.seq||[]).concat([k]).slice(-3);if(B.seq.join()===comboOf(d).join()){cmb=1;B.seq=[];B.combos=(B.combos|0)+1;dmg+=2;B.hope=Math.min(B.hmax,B.hope+1);fx("sig")}
  if(B.phase&&PHASE[B.id]&&PHASE[B.id][1]===s[0]){if(B.id==="adhd"||B.id==="ed")dmg+=1;else B.hope=Math.min(B.hmax,B.hope+1)}
  if(B.id==="anx"){if(weakHit||s[0]==="ground"){if(B.worries){B.worries--;B.popped=(B.popped|0)+1}B.miss=0}else{B.miss=(B.miss|0)+1;if(B.miss>=2&&(B.worries|0)<3){B.worries=(B.worries|0)+1;B.miss=0;B.split=1}}}
  var lvUp=skUse(s);
  B.recent.push(k);if(B.recent.length>2)B.recent.shift();B.last=k;
  txt=txt||((weakHit?'Weak spot! ':'')+esc(s[1])+(d.gentle?' lights a lantern.':' works.'));rl=s[3];
  if(cmb)txt+=' Combo! '+esc(comboName(d))+' flows together for a bonus.';
  if(B.split){B.split=0;txt+=' Ignored too long, the worry splits into '+(B.worries>1?B.worries+' small worries':'a small worry')+'. Hit the weak spot or ground yourself to pop them.'}
  else if(B.id==="anx"&&B.popped&&(weakHit||s[0]==="ground")&&B.lastPop!==B.popped){B.lastPop=B.popped;txt+=' A small worry pops.'}
  if(lvUp)txt+=' Skill journal: '+esc(s[1])+' reached level '+lvUp+'. A new real-life tip is unlocked.'}
 if(bonus)txt+=' Your breath gave it extra strength.';
 B.hp=Math.max(0,B.hp-dmg);B.hit=1;B.crack=weakHit;hitFX(weakHit||k==='sig',typeof cmb!=='undefined'&&cmb);
 if(B.e.boss&&!B.phase&&B.hp>0&&B.hp<=B.max/2&&PHASE[B.id]){B.phase=1;if(B.id==='ocd')B.locks=Math.min(3,B.locks+1);if(B.id==='fog'){B.fogHide=3;B.fogSet=B.turn}txt+=' '+PHASE[B.id][0]}
 if(B.hp<=0){ui();return win()}
 castSay();var lost=boss(weakHit);B.turn++;B.weak=B.d.practice?B.d.fixWeak:(B.weak+1+Math.floor(Math.random()*3))%4;
 if(d.twist==="lock"&&k!=="sig"&&d.sk[k][0]!=="erp")B.locks=Math.min(3,B.locks+1);
 if(B.comfMsg){B.comfMsg=0;txt+=' '+esc(petName())+' curls up beside you. You feel comforted, and some hope comes back.'}
 if(B.fogHide&&B.turn>B.fogSet)B.fogHide--;
 msg(txt+(lost?(d.noNum||d.gentle?' '+esc(d.name)+' presses in.':' '+esc(d.name)+' strikes: -'+lost+' hope.'):' The hit is blocked.'),rl);
 ui();
 if(B.hope<=0){if(d.gentle){B.hope=B.hmax;msg('You sit and rest by the lantern. The Keeper waits as long as you need. Your hope is restored.','Grief has no deadline. Rest is allowed.');ui()}else lose()}
}
function boss(weakHit){if(B.d.practice){drain(weakHit);return 0}var n=drain(weakHit);if(B.shield){B.shield=0;return 0}B.hope=Math.max(0,B.hope-n);if(B.hope>0&&B.hope<=3&&!B.comf&&bondLv()>=3){B.comf=1;B.comfT=performance.now();B.hope=Math.min(B.hmax,B.hope+2);B.comfMsg=1}return n}
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
/* ---------- guide photocard, shield, method skills, skill animations ---------- */
var MX={EMDR:"EMDR: I'll follow a light side to side while I hold the memory in mind, so my brain can file it away.",
ART:"Accelerated Resolution Therapy: I'll follow eye movements and picture the hard scene changing, so it feels less raw.",
CBT:"CBT: I'll catch the thought, check if it's really true, and try a more helpful one.",
"TF-CBT":"Trauma-Focused CBT: I'll learn calming skills first, then tell my story a little at a time.",
DBT:"DBT: When a feeling gets huge, I'll use a skill to ride it out without making things worse.",
EFT:"Emotionally Focused Therapy: We'll spot the cycle we get stuck in and share the softer feeling underneath.",
IFS:"Internal Family Systems: I'll get curious about the part of me that's scared, instead of fighting it.",
Imago:"Imago: I'll listen, repeat back what I heard, and ask if I got it right before I answer.",
ACT:"ACT: I'll make room for the hard feeling and still take a step toward what matters to me.",
Gottman:"Gottman Method: I'll start gently and make a repair attempt instead of keeping score.",
ERP:"ERP: I'll face the worry a little at a time without doing the ritual, so the urge fades on its own.",
SFBT:"Solution-Focused: I'll notice what's already working and do a little more of it.",
MBCT:"Mindfulness-Based CBT: I'll watch my thoughts drift by like clouds instead of getting pulled in.",
Narrative:"Narrative: I'm not the problem. I'll retell my story with me as the one who pushes back.",
CPT:"Cognitive Processing: I'll question the stuck thoughts a hard event left behind.",
MI:"Motivational Interviewing: I'll say my own reasons for change, in my own words.",
Mindfulness:"Mindfulness: I'll notice my breath and this moment, without judging it.",
ArtTherapy:"Art Therapy: I'll draw the feeling, so I can see it outside of me.",
Play:"Play therapy: I'll use play to show what's hard to say in words.",
Sandplay:"Sandplay: I'll build a small world in the sand to show what's going on inside.",
Interpersonal:"Interpersonal: I'll look at how my relationships and my mood affect each other.",
PersonCentered:"Person-Centered: I'll be heard without judgment and trust that I can find my way forward.",
Attachment:"Attachment-based: I'll lean on a steady, safe connection while I learn to feel secure.",
FamilyMarital:"Family therapy: We'll work on this together, so no one carries it alone.",
TraumaFocused:"Trauma-focused care: We'll go at my pace, with safety first.",
Psychodynamic:"Psychodynamic: I'll notice old patterns from my past that still show up today.",
PositivePsych:"Positive Psychology: I'll name my strengths and what's going right, and build on them.",
Integrative:"Integrative: My guide will blend a few approaches to fit what I need.",
Relational:"Relational: I'll notice how I feel in a safe connection, then practice that out in the world."};
var MATCH={anx:["CBT","ACT","MBCT","Mindfulness","DBT"],ptsd:["EMDR","ART","TF-CBT","CPT","TraumaFocused","IFS"],rel:["Imago","EFT","Gottman","FamilyMarital","Attachment"],ocd:["ERP","ACT","CBT"],adhd:["CBT","DBT","MI","SFBT"],ed:["DBT","ACT","IFS","CBT"],grief:["Narrative","ACT","IFS","PersonCentered","ArtTherapy"],fog:["CBT","ACT","Interpersonal","MBCT","DBT","MI"]};
function modLabel(m){var L=(window.OBC&&OBC.modLabels)||{};return L[m]||m}
function guideMethods(g,id){var mt=MATCH[id]||[],l=(g.mods||[]).filter(function(m){return MX[m]});return l.filter(function(m){return mt.indexOf(m)>=0}).sort(function(a,b){return mt.indexOf(a)-mt.indexOf(b)}).concat(l.filter(function(m){return mt.indexOf(m)<0}))}
function halfHP(hp){return Math.max(1,Math.ceil(hp/2))}
function photoCard(){if(!B||B.busy||B.over)return;var o=stage.querySelector(".w-bov");if(!o||o.querySelector(".w-pc"))return;var g=B.g,ms=guideMethods(g,B.id),mt=MATCH[B.id]||[];
 var d=document.createElement("div");d.className="w-pc w-par";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-label",g.name+" guide card");
 d.innerHTML='<button class="w-btn w-pcx" id="pc-x" aria-label="Close card">Close</button><div class="w-pch"><img src="'+portrait(g.id)+'" alt="Filtered portrait of '+esc(g.name)+'"><div><h3>'+esc(g.name)+'</h3><p class="w-pcc">'+esc(g.cred)+'</p><p class="w-pcm"><b>Methods:</b> '+(g.mods||[]).map(function(m){return esc(modLabel(m))}).join(", ")+'</p></div></div>'+
 '<div class="w-pca"><button class="w-btn pri" id="pc-sh"'+(B.gShield?' disabled':'')+'>Cast a shield'+(B.gShield?' (used)':'')+'</button></div>'+
 '<p class="w-pcn">'+(B.gMod?'You used a method skill this battle.':'Pick one method skill, once per battle. It calms half of what is left.')+'</p><div class="w-pcs">'+ms.map(function(m){var good=mt.indexOf(m)>=0;return '<button class="w-btn'+(good?' good':'')+'" data-m="'+esc(m)+'"'+(B.gMod?' disabled':'')+'>'+esc(modLabel(m))+(good?' <small>good match</small>':'')+'</button>'}).join("")+'</div>';
 o.appendChild(d);B.card=1;
 d.querySelector("#pc-x").onclick=closeCard;d.querySelector("#pc-sh").onclick=function(){closeCard();castShield()};
 d.querySelectorAll("[data-m]").forEach(function(b){b.onclick=function(){closeCard();castMethod(b.dataset.m)}});
 d.addEventListener("keydown",function(e){if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closeCard()}else if(e.key==="Tab"){var f=[].slice.call(d.querySelectorAll("button:not([disabled])")),i=f.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}});
 (d.querySelector("#pc-sh:not([disabled])")||d.querySelector("[data-m]:not([disabled])")||d.querySelector("#pc-x")).focus();live(g.name+" guide card open.")}
function closeCard(){var d=stage.querySelector(".w-pc");if(d)d.remove();if(B){B.card=0;var gb=document.getElementById("b-guide");if(gb&&!gb.disabled)gb.focus();else{var f=app.querySelector("[data-s]");if(f)f.focus()}}}
function castShield(){if(!B||B.gShield)return;B.gShield=1;B.shield=Math.max(B.shield,1);B.hope=Math.min(B.hmax,B.hope+2);fx("shield");
 msg(esc(B.g.name)+' casts a shield around you. It will block the next hit, and your hope rises.','Asking for help is a skill. A therapist can walk with you through hard seasons.');ui()}
function castMethod(m){if(!B||B.gMod||B.busy||(B.g.mods||[]).indexOf(m)<0||!MX[m])return;var good=(MATCH[B.id]||[]).indexOf(m)>=0,line=MX[m];B.gMod=m;B.busy=1;B.log.push("explain:"+m);
 B.say={text:line,t0:performance.now()};msg('<b>'+esc(S.hero.name||"You")+':</b> "'+esc(line)+'"');ui();live(line);
 setTimeout(function(){if(!B||B.over)return;B.say=null;B.log.push("cast:"+m);fx("m:"+m);
  setTimeout(function(){if(!B||B.over)return;var d=B.d,n=halfHP(B.hp);B.hp=Math.max(0,B.hp-n);B.hit=1;B.crack=good;if(good)B.hope=Math.min(B.hmax,B.hope+2);B.busy=0;
   var t=esc(B.g.name)+' and you use '+esc(modLabel(m))+'. '+(good?'Good match! ':'')+(d.gentle?'Half of the dark lanterns begin to glow.':d.noNum?esc(d.name)+' loosens its hold.':esc(d.name)+' loses half its strength.')+(good?' Your hope rises too.':'');
   if(B.hp<=0){ui();return win()}msg(t,line.replace(/^[^:]+: /,"In therapy: "));ui();var f=app.querySelector("[data-s]");if(f)f.focus()},RM?500:1100)},2600)}
/* effects: painted soft-light canvas animations, no stars; reduced motion shows a simple fade */
var FXL=[];
function fx(k){FXL.push({k:k,t0:performance.now(),dur:RM?700:(k.indexOf("m:")===0?1300:900)});if(B)B.fxLog=(B.fxLog||[]).concat(k)}
var FXK={breath:["ring","#9fd3e8"],ground:["ripple","#b49060"],reframe:["bend","#f0d37a"],step:["path","#9fd08a"],safe:["dome2","#b6a0d6"],reach:["bridge","#f2b29a"],listen:["ear","#9fc6e8"],soft:["petals","#f3a6b0"],repair:["mend","#e8c27a"],erp:["fadeup","#d6c08a"],name:["tag","#e8e0b0"],rule:["unknot","#c9b48a"],values:["compass","#a6c8e0"],timer:["arc","#f0b070"],quest:["scroll","#e0c890"],double:["twin","#a6e3a0"],pause:["still","#c8d8e0"],kind:["warm","#f4b8a0"],opp:["flip","#9fc6c0"],wave:["swell","#7fb6c2"],memory:["motes","#f0c98a"],rest:["lantern","#ffd98a"],walk:["steps","#e8c8a0"],sig:["golden","#ffcf6a"],shield:["dome","#ffd678"]};
var MFX={EMDR:["sweep","#bde0ff"],ART:["sweep2","#d8c0f0"],CBT:["bend","#a8e0b8"],"TF-CBT":["scroll","#c8a8e8"],DBT:["swell","#8fc0d8"],EFT:["bridge","#f4a0a8"],IFS:["parts","#e8b880"],Imago:["mirror","#f0b0c8"],ACT:["compass","#b8e0a0"],Gottman:["mend","#f0c090"],ERP:["fadeup","#e0d090"],SFBT:["path","#f0e080"],MBCT:["clouds","#d0dcea"],Narrative:["scroll2","#e8d0a0"],CPT:["unknot","#c0c8f0"],MI:["tag","#a0e0d0"],Mindfulness:["ring","#c8f0e0"],ArtTherapy:["paint","#f08080"],Play:["bubbles","#a0d8f8"],Sandplay:["sand","#e0c080"],Interpersonal:["twin","#f0a8c8"],PersonCentered:["warm","#f8c8a0"],Attachment:["dome2","#f8b0b0"],FamilyMarital:["circle","#c8e0a0"],TraumaFocused:["still","#d0b8e0"],Psychodynamic:["motes","#c8b0a0"],PositivePsych:["lantern","#ffe090"],Integrative:["weave","#b0d0f0"],Relational:["ear","#f0c0d0"]};
function glowDot(c,x,y,r,col,a){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(.5,rgba(col,a*.45));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
function rgba(h,a){var n=parseInt(h.slice(1),16);return "rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+Math.max(0,Math.min(1,a)).toFixed(3)+")"}
function drawFX(c,t){var now=performance.now();FXL=FXL.filter(function(f){return now-f.t0<f.dur});if(!B){FXL=[];return}
 var hx=P.x,hy=P.y-32,e=B.e,ex=e.x,ey=e.y-(e.boss?70:28);
 FXL.forEach(function(f){var p=(now-f.t0)/f.dur,a=Math.sin(Math.PI*Math.min(1,p)),m=f.k.indexOf("m:")===0,spec=m?MFX[f.k.slice(2)]:FXK[f.k];if(!spec)spec=["ring","#ffffff"];var ty=spec[0],col=spec[1],self=ty==="dome"||ty==="dome2"&&!m,X=self?hx:ex,Y=self?hy:ey;
  c.save();c.globalCompositeOperation="lighter";
  if(RM){glowDot(c,X,Y,60,col,.55*a);c.restore();return}
  var i,k,q,s=t/1000;
  switch(ty){
  case"ring":for(i=0;i<3;i++){q=(p*1.4-i*.2);if(q<0||q>1)continue;c.strokeStyle=rgba(col,(1-q)*.8);c.lineWidth=6*(1-q)+1;c.beginPath();c.ellipse(X,Y,20+q*70,(20+q*70)*.7,0,0,7);c.stroke()}break;
  case"ripple":for(i=0;i<4;i++){q=(p*1.3-i*.15);if(q<0||q>1)continue;c.strokeStyle=rgba(col,(1-q)*.8);c.lineWidth=3;c.beginPath();c.ellipse(X,e.y,15+q*90,(15+q*90)*.25,0,0,7);c.stroke()}glowDot(c,X,e.y,40,col,.4*a);break;
  case"bend":c.strokeStyle=rgba(col,.8*a);c.lineWidth=5;c.beginPath();for(i=0;i<=20;i++){k=i/20;var bx=hx+(ex-hx)*k,by=hy+(ey-hy)*k-Math.sin(k*Math.PI)*60*(1-p)+Math.sin(k*12+s*6)*8*(1-p);i?c.lineTo(bx,by):c.moveTo(bx,by)}c.stroke();glowDot(c,ex,ey,50*p,col,.6*a);break;
  case"path":for(i=0;i<6;i++){k=i/5;if(k>p*1.2)break;glowDot(c,hx+(ex-hx)*k,hy+30+(ey+20-hy-30)*k,14,col,.7*a)}break;
  case"dome":case"dome2":c.fillStyle=rgba(col,.18*a);c.strokeStyle=rgba(col,.85*a);c.lineWidth=3;c.beginPath();c.arc(X,Y+(self?4:0),24+28*Math.min(1,p*2),Math.PI,0);c.lineTo(X+24+28*Math.min(1,p*2),Y+(self?30:20));c.lineTo(X-24-28*Math.min(1,p*2),Y+(self?30:20));c.closePath();c.fill();c.stroke();for(i=0;i<5;i++)glowDot(c,X+Math.cos(s*2+i*1.25)*44,Y-10+Math.sin(s*2+i*1.25)*18,9,col,.6*a);break;
  case"bridge":c.strokeStyle=rgba(col,.85*a);c.lineWidth=6;c.beginPath();c.moveTo(hx,hy);k=Math.min(1,p*1.6);c.quadraticCurveTo((hx+ex)/2,Math.min(hy,ey)-90,hx+(ex-hx)*k,hy+(ey-hy)*k-Math.sin(k*Math.PI)*0);c.stroke();glowDot(c,hx+(ex-hx)*k,hy+(ey-hy)*k,26,col,.8*a);break;
  case"ear":for(i=0;i<3;i++){q=(p*1.3-i*.18);if(q<0||q>1)continue;c.strokeStyle=rgba(col,(1-q)*.85);c.lineWidth=4;c.beginPath();c.arc(hx,hy,18+q*60,-.7,.7);c.stroke();c.beginPath();c.arc(ex,ey,18+q*60,Math.PI-.7,Math.PI+.7);c.stroke()}break;
  case"petals":for(i=0;i<10;i++){k=i/10*6.283+s*2;var r=60*(1-p)+10;c.fillStyle=rgba(col,.75*a);c.beginPath();c.ellipse(X+Math.cos(k)*r,Y+Math.sin(k)*r*.6,7,3.5,k,0,7);c.fill()}break;
  case"mend":c.strokeStyle=rgba(col,.9*a);c.lineWidth=4;for(i=0;i<4;i++){var yy=Y-30+i*20,w=40*(1-Math.min(1,p*1.5))+6;c.beginPath();c.moveTo(X-w,yy-6);c.lineTo(X+w,yy+6);c.stroke()}glowDot(c,X,Y,55,col,.5*a);break;
  case"fadeup":for(i=0;i<8;i++){k=(p+i/8)%1;glowDot(c,X-40+i*11,Y+30-k*90,11,col,.7*a*(1-k))}break;
  case"tag":c.fillStyle=rgba(col,.8*a);c.fillRect(X-38,Y-80+20*(1-p),76,22);c.fillStyle=rgba("#3b2a1a",a);c.font="600 12px Georgia,serif";c.textAlign="center";c.fillText(m?f.k.slice(2):"named",X,Y-65+20*(1-p));c.textAlign="left";glowDot(c,X,Y,45,col,.4*a);break;
  case"unknot":c.strokeStyle=rgba(col,.85*a);c.lineWidth=4;c.beginPath();for(i=0;i<=40;i++){k=i/40;var lr=20*(1-p);c.lineTo(X-60+k*120+Math.cos(k*25)*lr,Y+Math.sin(k*25)*lr)}c.stroke();break;
  case"compass":c.strokeStyle=rgba(col,.85*a);c.lineWidth=3;c.beginPath();c.arc(X,Y,44,0,7);c.stroke();k=s*3*(1-p)+p*(Math.atan2(ey-hy,ex-hx)>0?1:-1);c.beginPath();c.moveTo(X-Math.cos(k)*36,Y-Math.sin(k)*36);c.lineTo(X+Math.cos(k)*36,Y+Math.sin(k)*36);c.lineWidth=5;c.stroke();break;
  case"arc":c.strokeStyle=rgba(col,.9*a);c.lineWidth=7;c.beginPath();c.arc(X,Y,42,-Math.PI/2,-Math.PI/2+p*6.283);c.stroke();break;
  case"scroll":case"scroll2":c.fillStyle=rgba(col,.55*a);var sw=90*Math.min(1,p*1.8);c.fillRect(X-sw/2,Y-60,sw,46);c.strokeStyle=rgba(col,.9*a);c.lineWidth=2;for(i=0;i<3;i++){c.beginPath();c.moveTo(X-sw/2+8,Y-50+i*12);c.lineTo(X-sw/2+8+(sw-16)*Math.min(1,p*2-i*.2),Y-50+i*12);c.stroke()}break;
  case"twin":for(i=0;i<2;i++){k=s*3+i*Math.PI;glowDot(c,X+Math.cos(k)*40,Y+Math.sin(k)*20,18,col,.8*a)}break;
  case"still":c.fillStyle=rgba(col,.25*a);c.fillRect(0,0,W,H);glowDot(c,X,Y,80,col,.5*a);break;
  case"warm":glowDot(c,hx,hy,70*a+10,col,.6*a);glowDot(c,X,Y,60*p,col,.4*a);break;
  case"flip":c.strokeStyle=rgba(col,.85*a);c.lineWidth=5;c.beginPath();c.ellipse(X,Y,50,Math.max(.5,Math.abs(50*Math.cos(p*Math.PI))),0,0,7);c.stroke();break;
  case"swell":c.strokeStyle=rgba(col,.85*a);c.lineWidth=6;c.beginPath();for(i=0;i<=30;i++){k=i/30;c.lineTo(X-90+k*180,Y+30-Math.sin(k*Math.PI)*60*Math.sin(p*Math.PI)+Math.sin(k*10+s*5)*4)}c.stroke();break;
  case"motes":for(i=0;i<12;i++){k=i*2.4+s;glowDot(c,X+Math.cos(k)*(30+i*4)*p,Y+Math.sin(k*1.3)*(20+i*3)*p,8,col,.7*a)}break;
  case"lantern":for(i=0;i<5;i++){var lx=X-60+i*30,ly=Y+40-p*70-(i%2)*14;glowDot(c,lx,ly,16,col,.8*a);c.fillStyle=rgba("#8a5a2a",.6*a);c.fillRect(lx-3,ly-9,6,4)}break;
  case"steps":for(i=0;i<6;i++){k=i/5;if(k>p*1.2)break;c.fillStyle=rgba(col,.75*a);c.beginPath();c.ellipse(hx+(ex-hx)*k+(i%2?6:-6),P.y+(e.y-P.y)*k,6,3,0,0,7);c.fill()}glowDot(c,hx,hy,30,col,.4*a);break;
  case"golden":c.fillStyle=rgba(col,.22*a);c.fillRect(0,0,W,H);for(i=0;i<14;i++){k=i/14;glowDot(c,hx+(ex-hx)*((p+k)%1),hy+(ey-hy)*((p+k)%1)-Math.sin(((p+k)%1)*Math.PI)*70,13,col,.8*a)}glowDot(c,ex,ey,90*p,col,.6*a);break;
  case"sweep":case"sweep2":var sx=X+Math.sin(p*Math.PI*6)*70;glowDot(c,sx,Y-50,20,col,.95*a);c.strokeStyle=rgba(col,.35*a);c.lineWidth=2;c.beginPath();c.moveTo(X-70,Y-50);c.lineTo(X+70,Y-50);c.stroke();if(ty==="sweep2")glowDot(c,X,Y,55*p,col,.4*a);break;
  case"parts":for(i=0;i<4;i++){k=i*1.571+s;var pr=40*(1-p)+4;glowDot(c,X+Math.cos(k)*pr,Y+Math.sin(k)*pr*.7,15,["#e8b880","#a0c0e8","#e8a0a0","#a0e0b0"][i],.8*a)}break;
  case"mirror":c.strokeStyle=rgba(col,.85*a);c.lineWidth=4;var mo=60*(1-p);c.beginPath();c.arc(X-mo-10,Y,22,0,7);c.stroke();c.beginPath();c.arc(X+mo+10,Y,22,0,7);c.stroke();glowDot(c,X,Y,30*p,col,.7*a);break;
  case"clouds":for(i=0;i<4;i++){glowDot(c,X-80+((p*160+i*45)%160),Y-40+i*16,26,col,.55*a)}break;
  case"paint":for(i=0;i<5;i++){c.strokeStyle=rgba(["#f08080","#f0c060","#80c0f0","#a0e090","#c090e0"][i],.75*a);c.lineWidth=8;c.lineCap="round";c.beginPath();c.moveTo(X-50,Y-30+i*14);c.quadraticCurveTo(X,Y-50+i*14,X-50+100*Math.min(1,p*1.6),Y-30+i*14);c.stroke()}break;
  case"bubbles":for(i=0;i<9;i++){k=(p+i/9)%1;c.strokeStyle=rgba(col,.8*a*(1-k));c.lineWidth=2;c.beginPath();c.arc(X-40+i*10,Y+30-k*100,6+i%3*3,0,7);c.stroke()}break;
  case"sand":for(i=0;i<30;i++){k=(i*37%30)/30;c.fillStyle=rgba(col,.7*a);c.fillRect(X-60+k*120,Y-60+((p*1.5+i*.07)%1)*90,3,3)}c.fillStyle=rgba(col,.4*a);c.beginPath();c.ellipse(X,Y+34,60*p,10,0,0,7);c.fill();break;
  case"circle":for(i=0;i<5;i++){k=i*1.257+s*.8;glowDot(c,X+Math.cos(k)*50,Y+Math.sin(k)*26,14,col,.8*a)}c.strokeStyle=rgba(col,.5*a);c.lineWidth=2;c.beginPath();c.ellipse(X,Y,50,26,0,0,7);c.stroke();break;
  case"weave":c.lineWidth=4;for(i=0;i<3;i++){c.strokeStyle=rgba(["#b0d0f0","#f0c0a0","#c0e0b0"][i],.8*a);c.beginPath();for(k=0;k<=30;k++){var u=k/30;c.lineTo(hx+(ex-hx)*u*Math.min(1,p*1.4),hy+(ey-hy)*u+Math.sin(u*12+i*2.1)*14)}c.stroke()}break;
  default:glowDot(c,X,Y,60,col,.6*a)}
  if(m&&!RM){c.globalCompositeOperation="source-over";c.font="700 14px Georgia,serif";c.textAlign="center";c.fillStyle="rgba(40,24,10,"+(.8*a)+")";c.fillText(modLabel(f.k.slice(2)),ex,ey-(e.boss?84:40));c.textAlign="left"}
  c.restore()});
 castBubble(c,now);
 if(B.say)bubble(c,hx,P.y-66,B.say.text,Math.min(1,(now-B.say.t0)/(RM?1:250)))}
/* boss cast bubbles: attack name + the plain thought it pushes */
var CASTL={"Racing heart":"Your heart speeds up. Something must be wrong.","Spinning room":"Everything feels too fast to keep up with.","What-if storm":"What if it all goes wrong?","Urge to avoid":"Just skip it. Staying away feels safer.",
"Echo of the past":"An old memory feels like it is happening now.","Alarm bells":"Danger! Even when you are safe.","Tight chest":"Your body braces for a hit that isn't coming.","Feeling alone":"No one could understand this.",
"Defensiveness":"It's not my fault, it's yours.","Criticism":"You always do this.","Shutting down":"I'm done talking.","Contempt":"Rolling eyes instead of listening.",
"Pull to check":"Check it again, just to be sure.","Sticky thought":"Having this thought must mean something.","Guilt spiral":"You should feel bad about that thought.","Stuck in loops":"Do it again until it feels right.",
"Too-big task":"This is too much. Where would you even start?","Time slipping":"Just five more minutes... and the hour is gone.","Can't start":"You'll start later, when you feel like it.","Shame spiral":"Why can't you just do it like everyone else?",
"Harsh inner voice":"You're not good enough.","Lost in the mist":"Forget what you care about. Follow the rules.","Hiding":"Don't tell anyone how you're really doing.","Rule whispers":"Follow the rules or else.",
"A wave of missing":"A wave of missing them rolls in.","Silence":"It's easier not to talk about them.","Carrying it alone":"You should carry this by yourself.","Worn out":"Grief makes everything heavy and tiring.",
"Heavy morning":"Stay in bed. Why bother today?","Pull to hide":"Cancel the plans. Stay inside.","Inner critic":"You're lazy. You'll never change.","Isolation":"Nobody wants to hear from you."};
function castSay(){if(!B||!B.d)return;var a=B.d.sk[B.weak][2];B.cast={name:a,line:CASTL[a]||"",t0:performance.now()};(B.castLog=B.castLog||[]).push(a)}
function castBubble(c,now){var el=document.getElementById("b-cast"),cb=B&&B.cast;var D=RM?2600:2400,age=cb?now-cb.t0:0;
 if(!cb||age>D){if(cb)B.cast=null;if(el)el.hidden=true;return}
 var ov=document.querySelector(".w-bov"),cv=c.canvas;if(!ov||!cv)return;
 if(!el){el=document.createElement("div");el.id="b-cast";el.className="w-cast";el.setAttribute("aria-hidden","true");ov.appendChild(el)}
 if(el.dataset.k!==cb.name+cb.t0){el.dataset.k=cb.name+cb.t0;el.innerHTML='<b></b><i></i>';el.firstChild.textContent=(B.d.gentle?"The Keeper\u2019s lantern flickers: ":"Casts: ")+cb.name+(S.clues&&S.clues.indexOf(B.id)>=0&&!B.d.practice?" \u00b7 from your clue page":"");el.lastChild.textContent=cb.line?"\u201C"+cb.line+"\u201D":"";el.classList.toggle("rm",!!RM)}
 el.hidden=false;var R=cv.getBoundingClientRect(),O=ov.getBoundingClientRect(),k=R.width/W,e=B.e;
 var hud=document.querySelector(".w-bhud"),hb=hud?hud.getBoundingClientRect().bottom-O.top:0;
 var sk=document.querySelector(".w-bpan,.w-bact,[data-s]"),pan=sk&&sk.closest(".w-bov>*")||sk,pt=pan?pan.getBoundingClientRect().top-O.top:R.height;
 var bw=el.offsetWidth,bh=el.offsetHeight,ex=(e.x)*k+(R.left-O.left),top=(e.y-(B.d.big?200:e.boss?160:80))*k+(R.top-O.top);
 var lx=Math.max(8,Math.min(R.width-bw-8,ex-bw/2)),ly=Math.max(hb+10,Math.min(pt-bh-10,top-bh-14));
 el.style.left=lx+"px";el.style.top=ly+"px";el.style.setProperty("--tx",Math.max(16,Math.min(bw-24,ex-lx))+"px");
 el.style.opacity=RM?1:Math.max(0,Math.min(1,age/220,(D-age)/300));
 B.castRect={l:lx+O.left,t:ly+O.top,r:lx+O.left+bw,b:ly+O.top+bh}}
function wrapL(c,t,mw){var ws=t.split(" "),out=[],ln="";ws.forEach(function(w){var tt=ln?ln+" "+w:w;if(c.measureText(tt).width>mw&&ln){out.push(ln);ln=w}else ln=tt});out.push(ln);return out}
function bubble(c,x,y,txt,a){c.save();c.globalAlpha=a;c.font="600 13px system-ui,sans-serif";var words=txt.split(" "),lines=[],ln="",mw=Math.min(280,W-30);words.forEach(function(w){var tt=ln?ln+" "+w:w;if(c.measureText(tt).width>mw-20&&ln){lines.push(ln);ln=w}else ln=tt});lines.push(ln);
 var bw=Math.max.apply(0,lines.map(function(l){return c.measureText(l).width}))+20,bh=lines.length*17+12,bx=Math.max(6,Math.min(W-bw-6,x-bw/2)),by=Math.max(6,y-bh);
 c.fillStyle="rgba(255,250,235,.96)";c.strokeStyle="#8a6a3e";c.lineWidth=1.5;c.beginPath();if(c.roundRect)c.roundRect(bx,by,bw,bh,10);else c.rect(bx,by,bw,bh);c.fill();c.stroke();
 c.beginPath();c.moveTo(Math.max(bx+12,Math.min(bx+bw-12,x))-7,by+bh-1);c.lineTo(Math.max(bx+12,Math.min(bx+bw-12,x)),by+bh+9);c.lineTo(Math.max(bx+12,Math.min(bx+bw-12,x))+7,by+bh-1);c.fill();c.stroke();
 c.fillStyle="#3b2a1a";lines.forEach(function(l,i){c.fillText(l,bx+10,by+20+i*17)});c.restore()}
/* original boss art: simple shapes, no stars */
/* ---------- your safe place ---------- */
function goSafe(){if(B)return;closeOV();enter("safe",320,360)}
function safeChoice(){var d=panel('<h2>Choose your safe place</h2><p>This is your calm home base. You can come back any time, decorate it with treasures you find, and rest here after a hard battle.</p>'+
 '<p><button class="w-btn pri" data-k="forest">A quiet forest glade</button> <button class="w-btn pri" data-k="beach">A warm beach cove</button></p>',"Choose your safe place");
 d.querySelector("#p-close").remove();d.querySelectorAll("[data-k]").forEach(function(b){b.onclick=function(){S.safe.kind=b.dataset.k;SC.safe.built=0;save();closeOV();enter("safe",320,360);say("Welcome to your "+(S.safe.kind==="beach"?"beach cove":"forest glade")+". Press Decorate to place the treasures in your satchel.","Your safe place")}});d.querySelector("[data-k]").focus()}
function decorate(){if(B||cur.id!=="safe")return;closeOV();DM={pick:null,sel:null};OV="dec";decUI()}
function endDecorate(){DM=null;OV=null;var o=stage.querySelector(".w-dec");if(o)o.remove();save();stage.focus();safeBar()}
function safeBar(){var o=stage.querySelector(".w-dec");if(o)o.remove();if(cur.id!=="safe"||!S.safe.kind)return;var d=document.createElement("div");d.className="w-dec w-par";d.innerHTML='<b>Your '+(S.safe.kind==="beach"?"beach cove":"forest glade")+'</b> <button class="w-btn pri" id="d-on">Decorate</button> <button class="w-btn" id="d-swap">Switch to '+(S.safe.kind==="beach"?"forest":"beach")+'</button> <span>Walk south to head home.</span>';stage.appendChild(d);
 d.querySelector("#d-on").onclick=decorate;d.querySelector("#d-swap").onclick=function(){S.safe.kind=S.safe.kind==="beach"?"forest":"beach";S.safe.items.forEach(function(it){if(S.safe.kind==="beach"&&it.y<140)it.y=150});SC.safe.built=0;save();enter("safe",P.x,P.y);safeBar()}}
function decUI(){var o=stage.querySelector(".w-dec");if(o)o.remove();var ks=Object.keys(S.bag).filter(function(k){return S.bag[k]>0&&DEC[k]});
 var d=document.createElement("div");d.className="w-dec w-par";d.setAttribute("role","region");d.setAttribute("aria-label","Decorate your safe place");
 d.innerHTML='<p id="d-help">'+(DM.pick?'Placing '+esc(decName(DM.pick))+'. Click or tap a spot, or walk there and press Enter.':DM.sel!=null?'Moving '+esc(decName(S.safe.items[DM.sel].k))+'. Drag it, or use the arrow keys on the play area. Esc to let go.':'Pick a treasure to place, or click a placed one to move it.')+'</p>'+
 (ks.length?ks.map(function(k){return '<button class="w-btn" data-p="'+k+'" aria-pressed="'+(DM.pick===k)+'">'+esc(decName(k))+(S.bag[k]>1?' ×'+S.bag[k]:'')+'</button>'}).join(""):'<span>Your satchel is empty. Explore to find more.</span>')+
 ' <button class="w-btn" id="d-next"'+(S.safe.items.length?'':' disabled')+'>Select placed item</button><button class="w-btn" id="d-away"'+(DM.sel!=null?'':' disabled')+'>Put away</button><button class="w-btn pri" id="d-done">Done and save</button>';
 stage.appendChild(d);
 d.querySelectorAll("[data-p]").forEach(function(b){b.onclick=function(){DM.pick=DM.pick===b.dataset.p?null:b.dataset.p;DM.sel=null;decUI();stage.focus()}});
 d.querySelector("#d-next").onclick=function(){DM.pick=null;DM.sel=DM.sel==null?0:(DM.sel+1)%S.safe.items.length;decUI();stage.focus()};
 d.querySelector("#d-away").onclick=putAway;d.querySelector("#d-done").onclick=endDecorate;live(d.querySelector("#d-help").textContent)}
function placeAt(x,y){if(!DM||!DM.pick||!(S.bag[DM.pick]>0))return;x=Math.max(20,Math.min(W-20,x));y=Math.max(S.safe.kind==="beach"?140:80,Math.min(H-12,y));
 S.safe.items.push({k:DM.pick,x:Math.round(x),y:Math.round(y)});S.bag[DM.pick]--;if(S.bag[DM.pick]<=0){delete S.bag[DM.pick];DM.pick=null}save();decUI()}
function putAway(){if(!DM||DM.sel==null)return;var it=S.safe.items.splice(DM.sel,1)[0];give(it.k);DM.sel=null;save();decUI();stage.focus()}
function decPointer(p){if(DM.pick){placeAt(p.x,p.y);return}var b=-1,bd=30;S.safe.items.forEach(function(it,i){var d=Math.hypot(p.x-it.x,p.y-(it.y-10));if(d<bd){bd=d;b=i}});DM.sel=b<0?null:b;if(b>=0)drag=1;decUI()}
/* ---------- Hall of Guides (inside the play area) ---------- */
function hall(rid){if(B)return;rid=rid||(cur&&cur.reg)||"anx";var r=R(rid);
 var d=panel('<h2>Hall of Guides</h2><p>Choose any guide for any region. Region:</p><p>'+REG.map(function(x){return '<button class="w-btn" data-r="'+x.id+'" aria-pressed="'+(x.id===rid)+'">'+esc(x.sub)+'</button>'}).join(" ")+'</p>'+
 '<div class="w-hall">'+CL.map(function(c){var leads=REG.filter(function(x){return x.guide===c.id}).map(function(x){return x.sub}),f=focus(c),isCur=guideOf(rid).id===c.id;
  return '<article class="w-gcard'+(isCur?' cur':'')+'"><img src="'+portrait(c.id)+'" alt="Illustrated portrait of '+esc(c.name)+'" width="72" height="72" loading="lazy"><div><h3>'+esc(c.name)+'</h3><p>'+esc(c.cred)+'</p><p><b>Focus areas:</b> '+f.slice(0,6).map(esc).join(", ")+(f.length>6?' and more':'')+'</p>'+(leads.length?'<p>Suggested guide for: '+leads.map(esc).join(", ")+'</p>':'')+
  '<p><button class="w-btn'+(isCur?'':' pri')+'" data-g="'+c.id+'">'+(isCur?'Current guide for '+esc(r.sub):'Choose for '+esc(r.sub))+'</button> <a href="../#team" target="_blank" rel="noopener">Meet the real clinician</a></p></div></article>'}).join("")+'</div>'+
 '<p>Portraits are filtered photos of the real Open Book Counseling team. Guides in the game are characters; the real clinicians are linked above.</p>',"Hall of Guides");
 d.querySelectorAll("[data-r]").forEach(function(b){b.onclick=function(){hall(b.dataset.r);var n=stage.querySelector('[data-r="'+b.dataset.r+'"]');if(n)n.focus()}});
 d.querySelectorAll("[data-g]").forEach(function(b){b.onclick=function(){S.pick[rid]=b.dataset.g;save();hall(rid);var n=stage.querySelector('[data-g="'+b.dataset.g+'"]');if(n)n.focus()}})}
function portrait(id){return "../img/q-pt-"+id+".webp"}
/* ---------- office finale ---------- */
function office(){if(B||!officeOpen())return;
 if(!S.code){var A="ABCDEFGHJKMNPQRSTUVWXYZ23456789",a=new Uint32Array(8);crypto.getRandomValues(a);var c="";for(var i=0;i<8;i++)c+=A[a[i]%A.length];S.code="OBC-"+c.slice(0,4)+"-"+c.slice(4);S.wonAt=new Date().toISOString().slice(0,10);save()}
 panel('<h2>Welcome to the Open Book Office</h2><p>'+esc(S.hero.name||"Wanderer")+', you and '+esc(petName())+' calmed all eight bosses. Your satchel holds: '+S.loot.map(esc).join(", ")+'.</p>'+
 '<p class="w-code">Your prize code: <b id="w-code">'+esc(S.code)+'</b></p>'+
 '<div class="w-rules"><h3>Prize rules</h3><ul><li>Anyone who beats the game can get one free fidget stress ring at an Open Book Counseling office.</li><li>One ring per person per year, while supplies last.</li><li>Show this code at the front desk.</li><li>The code is saved on this device. Write it down or take a screenshot.</li></ul></div>'+
 '<div class="w-gj-end"><h3>Want to keep going with a real person?</h3><p>Open Book Counseling offers a free 15-minute consultation. The guides you met are real clinicians on our team.</p><p><a class="w-btn pri" href="https://www.openbooktherapist.com/professional/intake.html" target="_blank" rel="noopener">Start the intake form</a></p></div>'+
 '<p><a class="w-btn" href="../#team">Meet the real team</a></p>',"Open Book Office")}
/* ---------- hero creator ---------- */
function creator(){cancelAnimationFrame(raf);stage=null;var h=S.hero,dirs=0;
 function grp(lbl,key,list,sw){return '<fieldset><legend>'+lbl+'</legend>'+list.map(function(v,i){return sw?'<button type="button" class="w-btn w-sw" data-k="'+key+'" data-v="'+i+'" aria-pressed="'+(h[key]===i)+'" aria-label="'+lbl+' '+(i+1)+'" style="background:'+v+'"></button>':'<button type="button" class="w-btn" data-k="'+key+'" data-v="'+i+'" aria-pressed="'+(h[key]===i)+'">'+esc(v)+'</button>'}).join("")+'</fieldset>'}
 app.innerHTML='<div class="w-top"><h1>Wanderer\'s Quest</h1><span class="w-where">Create your hero</span></div><div class="w-cr"><div class="w-cprev"><canvas id="c-prev" role="img" aria-label="Your hero preview"></canvas></div><div class="w-copts w-par">'+
 '<h2>Who sets out today?</h2><p><label>Name <input type="text" id="c-name" maxlength="20" value="'+esc(h.name)+'" placeholder="Wanderer"></label></p>'+
 grp("Character","body",BODY.map(function(b){return b.n}))+grp("Skin tone","skin",SKIN,1)+grp("Hair color","hc",HC,1)+grp("Tunic color","c1",COL,1)+
 '<fieldset><legend>Companion</legend><div class="w-pets">'+PETS.map(function(p,i){return '<button type="button" class="w-btn w-pet" data-k="pet" data-v="'+i+'" aria-pressed="'+(h.pet===i)+'"><canvas data-pc="'+i+'" width="140" height="140" aria-hidden="true"></canvas><b>'+p.n+'</b><small>'+esc(p.d)+'</small></button>'}).join("")+'</div></fieldset>'+
 '<p><button class="w-btn" id="c-turn">Turn</button> <button class="w-btn pri" id="c-go">'+(S.made?'Back to the adventure':'Begin your journey')+'</button></p></div></div>';
 app.querySelectorAll("[data-k]").forEach(function(b){b.onclick=function(){h[b.dataset.k]=+b.dataset.v;app.querySelectorAll('[data-k="'+b.dataset.k+'"]').forEach(function(x){x.setAttribute("aria-pressed",x===b)});save();prev()}});
 document.getElementById("c-name").oninput=function(e){h.name=e.target.value.slice(0,20);save()};
 document.getElementById("c-turn").onclick=function(){dirs=(dirs+1)%2;prev()};
 document.getElementById("c-go").onclick=function(){if(!h.name.trim())h.name="Wanderer";S.made=1;save();play()};
 function prev(){var c=document.getElementById("c-prev");if(!c)return;var r=c.getBoundingClientRect(),dp=Math.min(2,devicePixelRatio||1);if(r.width<2||r.height<2)return;c.width=r.width*dp;c.height=r.height*dp;var x=c.getContext("2d");x.setTransform(dp,0,0,dp,0,0);
  var gi=img("map-town");if(gi){var k=Math.max(r.width/W,r.height/H);x.drawImage(gi,(r.width-W*k)/2,(r.height-H*k)/2,W*k,H*k)}x.fillStyle="rgba(255,200,120,.12)";x.fillRect(0,0,r.width,r.height);
  var pc=petCanvas(h.pet|0),pr=pc?pc.width/pc.height:1.1,sc=Math.min(r.height/80,r.width/(36+40*pr+8)),ph=sc*40,pw=ph*pr,gw=sc*36+pw,lx=(r.width-gw)/2,fy=r.height*.86;drawHero(x,h,lx+sc*15,fy,sc,dirs?3:2,0);if(pc)x.drawImage(pc,lx+sc*34,fy-ph,pw,ph)
  app.querySelectorAll("[data-pc]").forEach(function(cc){var i=+cc.dataset.pc,p=petCanvas(i),g=cc.getContext("2d");g.clearRect(0,0,140,140);if(p){var hh=130,ww=hh*p.width/p.height;g.drawImage(p,70-ww/2,5,ww,hh)}})}
 prev();setTimeout(prev,300);setTimeout(prev,900);setTimeout(prev,2000);app.querySelector("h2").tabIndex=-1;document.getElementById("c-name").focus()}
/* ---------- start ---------- */
var _play=play;play=function(){_play();safeBar()};
var _enter=enter;enter=function(id,x,y,q){_enter(id,x,y,q);if(stage)setTimeout(safeBar,0)};

/* ===== v3i: walk cycles, weather, sparks, quests, secrets, pet bond, combos, phases, skill journal ===== */
function extFix(){if(!S.bond||S.bond.length!==3)S.bond=[0,0,0];S.q=S.q||{};S.pages=S.pages||[];S.skx=S.skx||{};S.fishN=S.fishN|0;S.secrets=S.secrets||[];S.sniffed=S.sniffed||[];gjFix()}extFix();
/* --- 1. walk cycles: front, back (painted hair over the face), side (narrowed, leaning, striding) --- */
var BACKC={};
function heroBack(h){var cv=heroCanvas(h);if(!cv)return null;var b=BODY[h.body|0]||BODY[0],key=b.k+"|"+(h.skin|0)+"|"+(h.hc|0)+"|"+(h.c1|0);if(BACKC[key])return BACKC[key];
 var mk=himg("../img/q-hmask-"+b.k+".png");if(!mk)return null;var Wd=cv.width,Hd=cv.height,o=document.createElement("canvas");o.width=Wd;o.height=Hd;var x=o.getContext("2d");x.drawImage(cv,0,0);
 var mc=document.createElement("canvas");mc.width=Wd;mc.height=Hd;var mx=mc.getContext("2d");mx.drawImage(mk,0,0,Wd,Hd);var m=mx.getImageData(0,0,Wd,Math.round(Hd*.36)).data,x0=Wd,x1=0,y0=Hd,y1=0;
 for(var yy=0;yy<Math.round(Hd*.36);yy+=2)for(var xx=0;xx<Wd;xx+=2){if(m[(yy*Wd+xx)*4+1]>180){if(xx<x0)x0=xx;if(xx>x1)x1=xx;if(yy<y0)y0=yy;if(yy>y1)y1=yy}}
 if(x1<=x0)return BACKC[key]=cv;var hc=hex(HC[h.hc|0]||HC[1]),cx0=(x0+x1)/2,cy0=(y0+y1)/2,rx=(x1-x0)/2+Wd*.015,ry=(y1-y0)/2+Hd*.008;
 x.save();x.globalCompositeOperation="source-atop";var g=x.createRadialGradient(cx0-rx*.3,cy0-ry*.4,2,cx0,cy0,Math.max(rx,ry)*1.2);
 g.addColorStop(0,"rgb("+Math.min(255,hc[0]*1.25|0)+","+Math.min(255,hc[1]*1.25|0)+","+Math.min(255,hc[2]*1.25|0)+")");g.addColorStop(1,"rgb("+(hc[0]*.7|0)+","+(hc[1]*.7|0)+","+(hc[2]*.7|0)+")");
 x.fillStyle=g;x.beginPath();x.ellipse(cx0,cy0,rx,ry,0,0,7);x.fill();
 x.strokeStyle="rgba(30,18,8,.28)";x.lineWidth=Math.max(1,Wd*.006);for(var i=-3;i<=3;i++){x.beginPath();x.moveTo(cx0+i*rx*.18,cy0-ry*.9);x.quadraticCurveTo(cx0+i*rx*.26,cy0,cx0+i*rx*.2,cy0+ry*.95);x.stroke()}
 x.restore();return BACKC[key]=o}
function heroFrame(dir){return dir===1?"back":dir>=2?"side":"front"}
function drawHero(c,h,x,y,sc,dir,ph){var back=dir===1,cv=back?(heroBack(h)||heroCanvas(h)):heroCanvas(h);shadow(c,x,y,13*sc,4*sc);if(!cv)return;
 var hh=62*sc,ww=hh*cv.width/cv.height,mv=!RM&&ph>0,s=Math.sin(ph||0),bob=mv?Math.abs(s)*1.6*sc:0,side=dir>=2,sy=Math.round(cv.height*.66),top=hh*.66,lw=cv.width/2;
 var lift=mv?s*2.4*sc:0,sw=mv&&side?s*3.2*sc:0;
 c.save();c.translate(x,y);if(dir===3)c.scale(-1,1);if(side){c.scale(.86,1);if(mv)c.transform(1,0,-.05,1,0,0)}
 c.drawImage(cv,0,sy,lw,cv.height-sy,-ww/2+sw,-hh+top-bob-Math.max(0,lift),ww/2,hh-top);
 c.drawImage(cv,lw,sy,cv.width-lw,cv.height-sy,-sw,-hh+top-bob-Math.max(0,-lift),ww/2,hh-top);
 c.drawImage(cv,0,0,cv.width,sy+1,-ww/2,-hh-bob,ww,top+hh/cv.height);
 c.restore();HF=heroFrame(dir)}
var HF="front",PT={x:0,y:0,dir:0,ph:0,trick:null,frame:"front"},PBACK={};
function petBack(i){var pc=petCanvas(i);if(!pc)return null;if(PBACK[i])return PBACK[i];var o=document.createElement("canvas");o.width=pc.width;o.height=pc.height;var x=o.getContext("2d");x.drawImage(pc,0,0);x.globalCompositeOperation="source-atop";var g=x.createLinearGradient(0,0,0,o.height);g.addColorStop(0,"rgba(50,32,16,.62)");g.addColorStop(.55,"rgba(50,32,16,.3)");g.addColorStop(1,"rgba(50,32,16,.05)");x.fillStyle=g;x.fillRect(0,0,o.width,o.height);return PBACK[i]=o}
function drawPet(c,px,py,t){var i=S.hero.pet|0,dx=px-PT.x,dy=py-PT.y,mv=Math.hypot(dx,dy)>.15;if(mv){PT.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:3):(dy<0?1:0);PT.ph+=.35}else PT.ph=0;PT.x=px;PT.y=py;
 if(B)PT.dir=B.e.x>px?2:3;var back=PT.dir===1,pc=back?petBack(i):petCanvas(i);PT.frame=back?"back":PT.dir>=2?"side":"front";shadow(c,px,py,13,4);if(!pc)return;
 var ph=i===0?48:46,w=ph*pc.width/pc.height,s=Math.sin(PT.ph),bob=RM||!mv?0:Math.abs(s)*2.2,tilt=RM||!mv?0:s*.06,flip=PT.dir===2||(PT.dir!==3&&px>P.x),hop=0,rot=0;
 var tr=PT.trick;if(tr){var k=(performance.now()-tr.t0)/1200;if(k>=1)PT.trick=null;else if(!RM){if(tr.k===0){rot=k*6.283}else{hop=Math.sin(k*Math.PI)*16}}else glowDot(c,px,py-24,30,"#ffd98a",.5*(1-k))}
 if(B&&B.comfT){var ck=(performance.now()-B.comfT)/1500;if(ck<1)glowDot(c,px,py-24,40,"#ffc6d0",.55*(1-ck))}
 c.save();c.translate(px,py-bob-hop);if(flip)c.scale(-1,1);c.rotate(tilt);if(rot){c.translate(0,-ph/2);c.rotate(rot);c.translate(0,ph/2)}if(PT.dir===0||back)c.scale(.92,1);c.drawImage(pc,-w/2,-ph,w,ph);c.restore()}
/* --- 2. weather and time of day per region --- */
var WX={fog:"fog",anx:"wind",grief:"dusk",ptsd:"drizzle",rel:"petals",ocd:"sunbeams",adhd:"fireflies",ed:"mist"};
function wxKind(s){return s.reg?WX[s.reg]:s.id==="hollow"?"fireflies":s.id==="office"?"sunbeams":"golden"}
function rnd(n){var x=Math.sin(n*127.1)*43758.5;return x-Math.floor(x)}
function weather(c,s,t){var k=wxKind(s),T=RM?0:t,i,x,y,a;c.save();
 switch(k){
 case"fog":c.fillStyle="rgba(120,130,150,.16)";c.fillRect(0,0,W,H);for(i=0;i<9;i++){x=((rnd(i)*W+T*(.008+rnd(i+9)*.012))%(W+260))-130;y=90+rnd(i+3)*300;a=.14+rnd(i+5)*.12;var g=c.createRadialGradient(x,y,4,x,y,110);g.addColorStop(0,"rgba(225,230,238,"+a+")");g.addColorStop(1,"rgba(225,230,238,0)");c.fillStyle=g;c.beginPath();c.ellipse(x,y,130,46,0,0,7);c.fill()}break;
 case"wind":c.strokeStyle="rgba(240,248,255,.42)";c.lineWidth=1.6;c.lineCap="round";for(i=0;i<16;i++){x=((rnd(i)*W+T*(.25+rnd(i+2)*.2))%(W+120))-60;y=70+rnd(i+7)*330+Math.sin(T/500+i)*6;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+22,y-5,x+48,y+2);c.stroke()}
  for(i=0;i<7;i++){x=((rnd(i+40)*W+T*(.18+rnd(i)*.1))%(W+40))-20;y=80+rnd(i+33)*300+Math.sin(T/300+i)*14;c.save();c.translate(x,y);c.rotate(RM?i:T/260+i);c.fillStyle=["#c9a24a","#a7b85a","#d08a3a"][i%3];c.beginPath();c.ellipse(0,0,5,2.4,0,0,7);c.fill();c.restore()}break;
 case"dusk":var dg=c.createLinearGradient(0,0,0,H);dg.addColorStop(0,"rgba(110,60,120,.30)");dg.addColorStop(.45,"rgba(240,140,80,.14)");dg.addColorStop(1,"rgba(40,20,40,.22)");c.fillStyle=dg;c.fillRect(0,0,W,H);
  for(i=0;i<8;i++){x=40+rnd(i+11)*560+Math.sin(T/1500+i)*10;y=H-((rnd(i+21)*H+T*.012*(1+rnd(i)))%(H-40));glowDot(c,x,y,16,"#ffc070",.55);c.fillStyle="rgba(255,226,160,.95)";c.beginPath();c.ellipse(x,y,2.6,3.4,0,0,7);c.fill()}break;
 case"drizzle":c.fillStyle="rgba(60,60,110,.16)";c.fillRect(0,0,W,H);c.strokeStyle="rgba(210,210,240,.35)";c.lineWidth=1;for(i=0;i<46;i++){x=(rnd(i)*W+T*.03)%W;y=(rnd(i+50)*H+T*.35)%H;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+9);c.stroke()}break;
 case"petals":for(i=0;i<12;i++){x=((rnd(i)*W+T*(.03+rnd(i+3)*.03))%(W+30))-15;y=((rnd(i+8)*H+T*(.02+rnd(i+1)*.02))%H);c.save();c.translate(x,y);c.rotate(RM?i:T/700+i);c.fillStyle="rgba(248,190,200,.85)";c.beginPath();c.ellipse(0,0,4.5,2.6,0,0,7);c.fill();c.restore()}break;
 case"sunbeams":c.globalCompositeOperation="lighter";for(i=0;i<4;i++){x=90+i*150;var sg=c.createLinearGradient(x,0,x+120,H);sg.addColorStop(0,"rgba(255,220,150,.13)");sg.addColorStop(1,"rgba(255,220,150,0)");c.fillStyle=sg;c.beginPath();c.moveTo(x,0);c.lineTo(x+50,0);c.lineTo(x+170,H);c.lineTo(x+90,H);c.fill()}
  c.globalCompositeOperation="source-over";for(i=0;i<14;i++){x=(rnd(i)*W+Math.sin(T/2000+i)*20);y=(rnd(i+4)*H+T*.006)%H;glowDot(c,x,y,3,"#fff0c0",.7)}break;
 case"fireflies":c.fillStyle="rgba(30,50,40,.12)";c.fillRect(0,0,W,H);for(i=0;i<14;i++){x=rnd(i)*W+Math.sin(T/900+i*2)*30;y=90+rnd(i+6)*300+Math.cos(T/1100+i)*20;a=RM?.7:.35+.5*Math.max(0,Math.sin(T/400+i*1.7));glowDot(c,x,y,9,"#e6ffb0",a)}break;
 case"mist":for(i=0;i<5;i++){x=((rnd(i)*W+T*.01)%(W+300))-150;y=300+rnd(i+2)*100;var mg=c.createRadialGradient(x,y,4,x,y,140);mg.addColorStop(0,"rgba(220,240,240,.22)");mg.addColorStop(1,"rgba(220,240,240,0)");c.fillStyle=mg;c.beginPath();c.ellipse(x,y,170,36,0,0,7);c.fill()}break;
 default:var gg=c.createLinearGradient(W,0,0,H);gg.addColorStop(0,"rgba(255,200,120,.16)");gg.addColorStop(1,"rgba(255,200,120,0)");c.fillStyle=gg;c.fillRect(0,0,W,H);for(i=0;i<10;i++){x=(rnd(i)*W+Math.sin(T/1800+i)*16);y=(H-(rnd(i+3)*H+T*.008)%H);glowDot(c,x,y,3.5,"#ffe2a0",.6)}}
 c.restore();return k}
/* --- 3. hit sparks, screen shake, victory --- */
var SPK=[],SHK={t0:0,a:0},SPN=0;
function sparks(x,y,n,col){var now=performance.now();SPN+=n;for(var i=0;i<n;i++){var a=Math.random()*6.283,v=1.2+Math.random()*2.4;SPK.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,t0:now,col:col||"#ffd27a",r:2+Math.random()*2.5})}}
function shake(a){if(RM)return;SHK.t0=performance.now();SHK.a=a}
function shakeOff(){if(RM||!SHK.a)return[0,0];var k=1-(performance.now()-SHK.t0)/320;if(k<=0){SHK.a=0;return[0,0]}var m=SHK.a*k;return[Math.sin(performance.now()/16)*m,Math.cos(performance.now()/21)*m*.6]}
function drawSparks(c){var now=performance.now();SPK=SPK.filter(function(p){return now-p.t0<700});SPK.forEach(function(p){var k=(now-p.t0)/700,f=RM?0:(now-p.t0)/16;var x=p.x+p.vx*f,y=p.y+p.vy*f+(RM?0:f*f*.02);
 c.strokeStyle=rgba(p.col,.7*(1-k));c.lineWidth=p.r*.8;c.lineCap="round";if(!RM){c.beginPath();c.moveTo(x-p.vx*3,y-p.vy*3);c.lineTo(x,y);c.stroke()}glowDot(c,x,y,p.r*2.2,p.col,1-k)})}
function hitFX(weak,combo){if(!B)return;var e=B.e,y=e.y-(e.boss?70:28);sparks(e.x,y,combo?26:weak?16:8,combo?"#ffe9a8":weak?"#ffc35a":"#fff0d0");shake(combo?7:weak?5:2.5)}
var VIC=0;
function victory(el,id){var c=el.getContext("2d"),t0=performance.now(),K=DEC["k_"+id];
 function fr(t){if(!document.body.contains(el))return;var k=(t-t0)/1000;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,el.width,el.height);
  var g=c.createRadialGradient(160,120,10,160,120,200);g.addColorStop(0,"rgba(255,220,150,.95)");g.addColorStop(.6,"rgba(240,160,90,.55)");g.addColorStop(1,"rgba(120,70,60,0)");c.fillStyle=g;c.fillRect(0,0,320,200);
  c.fillStyle="rgba(120,150,70,.6)";c.beginPath();c.ellipse(160,200,200,40,0,0,7);c.fill();
  var hop=RM?0:Math.abs(Math.sin(k*3.2))*10;for(var i=0;i<14;i++){var px=(rnd(i)*320+(RM?0:Math.sin(k+i)*14)),py=RM?rnd(i+3)*180:((rnd(i+3)*200+k*40*(1+rnd(i)))%200);c.fillStyle=["#f7b6c2","#ffd98a","#f4efe4"][i%3];c.beginPath();c.ellipse(px,py,4,2.2,i,0,7);c.fill()}
  glowDot(c,160,40-hop,40,"#fff2c0",.8);c.save();c.translate(0,-hop);drawHero(c,S.hero,150,182,2.3,0,0);if(K)K.d(c,150,48,t);c.restore();
  var pc=petCanvas(S.hero.pet|0);if(pc){var ph=58,w=ph*pc.width/pc.height,ph2=RM?0:Math.abs(Math.sin(k*3.2+1))*8;c.drawImage(pc,228-w/2,186-ph-ph2,w,ph)}
  VIC++;if(!RM)requestAnimationFrame(fr)}
 requestAnimationFrame(fr)}
/* --- 7. combos --- */
function comboOf(d){return[0,1,2]}
function comboName(d){return d.sk[0][1]+" → "+d.sk[1][1]+" → "+d.sk[2][1]}
/* --- 8. symptoms that change mid-fight --- */
var PHASE={ptsd:["The echo shifts. It softens when you stay present: grounding now also restores hope.","ground"],rel:["Both sides start talking at once. Listening first now also restores hope.","listen"],ocd:["A new loop forms around the doubt. One more lock clicks shut.",""],adhd:["The sprite splits its attention into more motes. Timer Burst lands harder now.","timer"],ed:["The mist rises higher. Self-kindness cuts through it more easily now.","kind"],grief:["The lanterns flicker and a memory surfaces. Sharing a memory now also restores hope.","memory"],fog:["The fog thickens. The weak spot hides from view for two turns.",""]};
/* --- 9. skill journal --- */
var TIPS={breath:["Try breathing out a little longer than you breathe in, for a few rounds.","Practice when you're already calm, so it feels familiar when you need it."],
 ground:["Name five things you can see, out loud or in your head.","Press your feet into the floor and notice the support under you."],
 reframe:["Ask yourself: what would I say to a friend who had this thought?","Look for one other way to read the situation, even if you're not sure it's true yet."],
 step:["Pick the smallest version of the step, one you're fairly sure you can do.","Notice how you feel afterward, not just before."],
 safe:["Picture a place where you feel at ease and notice its sounds and colors.","Some people keep a small object that reminds them of that place."],
 reach:["A short text counts. You don't have to explain everything.","Write down two or three people you could reach out to."],
 listen:["Try repeating back what you heard before you answer.","Ask one curious question before giving your side."],
 soft:["Try starting with: \"I feel… about… and I need…\"","When you can, bring things up at a calmer moment."],
 pause:["It's okay to say: \"I need twenty minutes, then let's come back to this.\"","Use the break to calm your body, not to rehearse the argument."],
 repair:["A small \"I'm sorry, can we start over?\" can turn a conversation around.","A bit of humor or a gentle tone can be a repair attempt too."],
 erp:["Notice the urge, name it, and let a little time pass before acting on it.","This skill is best practiced with a therapist trained in ERP, starting with small steps."],
 name:["Try putting \"I'm having the thought that…\" in front of the thought.","Naming a thought doesn't make it true, and you don't have to act on it."],
 kind:["Speak to yourself the way you would speak to a good friend.","Mistakes are part of being human. Everyone makes them."],
 values:["Write down three things that matter most to you.","Choose one small action today that fits one of those values."],
 quest:["Write the very first step on a sticky note.","Cross things off as you go. Seeing progress helps."],
 timer:["Set a timer for a short burst of work, then take a break when it rings.","Keep a clock where you can see it, so time is easier to track."],
 double:["Work next to a friend, in person or on a video call.","Tell someone what you're about to start and when."],
 rule:["When you notice a strict rule in your head, write it down and ask where it came from.","Share those rules with your treatment team so you don't carry them alone."],
 wave:["Feelings rise and fall like waves. You can let this one move through.","It's okay to cry, rest, or take a quiet moment when a wave comes."],
 memory:["Telling a story about someone you miss can keep their memory close.","Some people write a letter to the person they lost."],
 walk:["Let a trusted person know what kind of support helps you most.","Grief support groups are one place to find people who understand."],
 rest:["Rest is part of grieving, not a break from it.","Gentle routines, like a short walk or some fresh air, can help on hard days."],
 opp:["When a feeling tells you to hide, try one small opposite action, like opening the curtains.","Opposite action is a DBT skill. A therapist can help you practice it."]};
var LV=[1,4,9];
function skLv(id){var n=S.skx[id]|0;return n>=LV[2]?3:n>=LV[1]?2:n>=LV[0]?1:0}
function skUse(s){var before=skLv(s[0]);S.skx[s[0]]=(S.skx[s[0]]|0)+1;save();var a=skLv(s[0]);return a>before&&a>1?a:0}
var REALL={};BOSS.forEach(function(id){(BD[id].sk||[]).forEach(function(s){if(!REALL[s[0]])REALL[s[0]]=[s[1],s[3]]})});
function journal(){if(B)return;var ids=Object.keys(S.skx).filter(function(k){return S.skx[k]>0&&REALL[k]});
 var h='<h2>Skill journal</h2><p>Each skill grows as you use it. New levels unlock real-life tips.</p>'+(ids.length?'<ul class="w-jr">'+ids.map(function(k){var l=skLv(k),n=S.skx[k],nx=l<3?LV[l]-n:0;return '<li data-sk="'+k+'"><b>'+esc(REALL[k][0])+'</b> · level '+l+(nx>0?' <small>('+nx+' more '+(nx>1?'uses':'use')+' to level '+(l+1)+')</small>':' <small>(mastered)</small>')+'<ul><li>'+esc(REALL[k][1])+'</li>'+(l>=2?'<li>'+esc(TIPS[k][0])+'</li>':'')+(l>=3?'<li>'+esc(TIPS[k][1])+'</li>':'')+'</ul></li>'}).join("")+'</ul>':'<p>No skills used yet. Walk into a symptom to begin.</p>')+
 '<h3>Journal pages found: '+S.pages.length+' of '+PAGES.length+'</h3>'+(S.pages.length?'<ol class="w-jp">'+PAGES.map(function(p,i){return S.pages.indexOf(i)>=0?'<li>'+esc(p)+'</li>':''}).join("")+'</ol>':'<p>Pages are tucked away around the land. Look closely.</p>')+
 '<h3>Secrets found: '+S.secrets.length+'</h3><p>Fish caught at the hidden pond: '+S.fishN+'.</p>'+gjJournal();
 panel(h,"Skill journal")}
/* --- 5. secrets: journal pages, hidden path, fishing --- */
var PAGES=["Slow breathing, with an out-breath a little longer than the in-breath, is a common way people help their body settle.",
 "Putting a feeling into words, like \"I feel anxious,\" is a simple step many people find makes it more manageable.",
 "Grounding uses your senses to bring your attention back to the present moment.",
 "Avoiding a fear brings quick relief, but it can keep the fear going. Small, gradual steps toward it are part of approaches like exposure therapy.",
 "Moving your body, even a short walk, is something many people find lifts their mood a little.",
 "Rest and sleep affect how big emotions feel.",
 "Reaching out to someone you trust is a coping skill, not a weakness.",
 "Grief doesn't follow a set schedule. There is no single right way to grieve.",
 "Breaking a big task into one small first step can make it easier to start.",
 "If you're in crisis in the US, you can call or text 988 any time."];
var PAGEAT=[["hub",380,390],["cross",120,250],["woods",560,250],["anx1",520,370],["ptsd1",110,380],["rel1",130,380],["ocd1",540,380],["adhd1",540,240],["grief1",110,380],["hollow",460,210]];
SC.hollow={id:"hollow",n:"Hidden Hollow",sub:"A secret place",g:"town",at:[-7,-7],tone:"rgba(120,170,140,.12)",w:[[330,170,120,46]],
 p:[["sign",420,380,"A hollow few wanderers find. The ferns to the south lead back to the Quiet Woods."],["lantern",180,200],["lantern",480,300],["tree",120,140],["tree",540,140],["fish",330,236],["look",330,160,60,"The pond is so still it holds the whole sky. Little fish circle near the reeds."]]};
SC.woods.p.push(["path",600,96]);
SC.grief1.p.push(["qitem",520,380,"q_wick"]);SC.woods.p.push(["qitem",120,250,"q_seed"]);
PAGEAT.forEach(function(a,i){SC[a[0]].p.push(["page",a[1],a[2],i])});
FT.fish=[0,0,0];
function fishing(){if(B)return;closeOV();OV="pan";held={};var d=document.createElement("div");d.className="w-pan w-par w-fish";d.setAttribute("role","dialog");d.setAttribute("aria-label","Fishing");stage.appendChild(d);var tm=0,st=0;
 function close(){clearTimeout(tm);closeOV()}
 function idle(t){st=0;d.innerHTML='<h2>The hidden pond</h2><p>'+esc(t||"Cast your line and wait. When the bobber dips, reel in.")+'</p><p><button class="w-btn pri" id="f-cast">Cast line</button> <button class="w-btn" id="f-x">Back to exploring</button></p>';d.querySelector("#f-cast").onclick=cast;d.querySelector("#f-x").onclick=close;d.querySelector("#f-cast").focus();live(t||"Fishing. Cast your line.")}
 function cast(){st=1;d.innerHTML='<h2>Waiting…</h2><p>The bobber floats. Breathe slowly while you wait.</p><p><button class="w-btn" id="f-reel">Reel in</button> <button class="w-btn" id="f-x">Stop fishing</button></p>';d.querySelector("#f-reel").onclick=reel;d.querySelector("#f-x").onclick=close;d.querySelector("#f-reel").focus();
  tm=setTimeout(function(){st=2;var h=d.querySelector("h2");if(h)h.textContent="A tug! Reel in now.";live("A tug! Reel in now.");tm=setTimeout(function(){if(st===2)idle("It slipped away. That's okay. Try again whenever you like.")},FISH.win)},FISH.wait())}
 function reel(){clearTimeout(tm);if(st!==2)return idle("Too early. The pond is patient. Try again.");S.fishN++;var r=S.fishN===1||S.fishN%3===0?"lily":["stone","shell"][S.fishN%2];give(r);if(S.secrets.indexOf("fish")<0)S.secrets.push("fish");save();idle("You caught a little fish and let it go. Something came up with it: "+decName(r)+". It's in your satchel.")}
 idle()}
var FISH={wait:function(){return 900+Math.random()*1400},win:1400};
/* --- 4. villager side quests --- */
var QS={q_wick:{npc:"Mara the lamplighter",ask:["My spare lantern wick blew away toward Lantern Meadow, west of here. Could you look for it?"],item:"Lantern wick",done:function(){return S.q.q_wick_got},thanks:"You found it! Here, take this birdhouse I painted. It would look lovely in your safe place.",reward:"birdhouse"},
 q_calm:{npc:"Tobin the baker",ask:["Folks have been uneasy with symptoms wandering the roads. Could you settle three of them? Any kind will do."],need:3,done:function(){return S.cleared.length>=3},thanks:"The roads feel lighter already. Here's a hammock for your safe place. Rest is part of the work.",reward:"hammock"},
 q_map:{npc:"Wren the mapmaker",ask:["I'm drawing a new map. Visit ten places and come tell me about them?"],done:function(){return S.visited.length>=10},thanks:"Wonderful. Take these stepping stones. Every path starts with one.",reward:"stones"},
 q_seed:{npc:"A gardener tending lanterns",ask:["I dropped a packet of flower seeds in the Quiet Woods. Would you bring it back?"],item:"Seed packet",done:function(){return S.q.q_seed_got},thanks:"Thank you. I grew this flower arch from the last packet. It's yours.",reward:"arch"},
 q_pet:{npc:"A woodcutter on break",ask:["Animals are good company on hard days. Spend time with your companion until they learn a trick, then show me."],done:function(){return bondLv()>=2},thanks:"What a clever companion! Here's a cozy pet bed for your safe place.",reward:"petbed"}};
function questFor(name){for(var k in QS)if(QS[k].npc===name)return k;return null}
function questTalk(o,qk){var q=QS[qk],st=S.q[qk]|0;
 if(st===2)return say(o.lines.concat(["Thanks again for your help."]),o.name);
 if(st===1){if(q.done()){S.q[qk]=2;give(q.reward);save();return say([q.thanks,decName(q.reward)+" is in your satchel."],o.name)}return say([q.ask[0],"Still looking? No rush at all."],o.name)}
 closeOV();OV="say";held={};var d=document.createElement("div");d.className="w-say w-par";d.setAttribute("role","dialog");d.setAttribute("aria-label",o.name);stage.appendChild(d);
 d.innerHTML='<p class="w-who">'+esc(o.name)+'</p><p>'+esc(o.lines[0])+'</p><p>'+esc(q.ask[0])+'</p><div class="w-sayb"><button class="w-btn pri" id="q-yes">I\'ll help</button> <button class="w-btn" id="q-no">Maybe later</button>'+(gjFeel?' <button class="w-btn" id="q-feel">What does it feel like here?</button>':'')+'</div>';var fl=gjFeel;gjFeel=null;if(fl)d.querySelector("#q-feel").onclick=function(){say(fl.l,o.name)};
 live(o.name+": "+q.ask[0]);d.querySelector("#q-yes").onclick=function(){S.q[qk]=1;save();closeOV();say(q.done()?"You already have what's needed. Talk to "+o.name+" again.":"Quest added. You can see it in your satchel.",o.name)};d.querySelector("#q-no").onclick=closeOV;d.querySelector("#q-yes").focus()}
function questList(){var ks=Object.keys(QS).filter(function(k){return S.q[k]});return ks.length?'<ul>'+ks.map(function(k){var q=QS[k];return '<li>'+esc(q.npc)+': '+esc(q.ask[0])+(S.q[k]===2?' <b>Done.</b>':q.done()?' <b>Ready to return.</b>':'')+'</li>'}).join("")+'</ul>':'<p>No side quests yet. Villagers may ask for help.</p>'}
DEC.birdhouse={n:"Painted birdhouse",d:function(c,x,y){c.fillStyle="#6b4520";c.fillRect(x-2,y-40,4,40);poly(c,[[x-14,y-40],[x+14,y-40],[x+14,y-62],[x-14,y-62]],"#d9a24a");poly(c,[[x-18,y-60],[x,y-74],[x+18,y-60]],"#b8553f");blob(c,x,y-52,4,4,"#3a2414",0)}};
DEC.hammock={n:"Hammock",d:function(c,x,y){shadow(c,x,y,40,6);c.fillStyle="#6b4520";c.fillRect(x-40,y-40,5,40);c.fillRect(x+35,y-40,5,40);c.strokeStyle="#e8c87a";c.lineWidth=7;c.beginPath();c.moveTo(x-36,y-34);c.quadraticCurveTo(x,y-4,x+36,y-34);c.stroke();c.strokeStyle="#c45a3c";c.lineWidth=2;c.stroke()}};
DEC.stones={n:"Stepping stones",d:function(c,x,y){for(var i=0;i<4;i++)blob(c,x-27+i*18,y-(i%2)*6,8,4.5,"#a9a39a",0)}};
DEC.arch={n:"Flower arch",d:function(c,x,y){c.strokeStyle="#5f8a3a";c.lineWidth=5;c.beginPath();c.arc(x,y-20,26,Math.PI,0);c.lineTo(x+26,y);c.moveTo(x-26,y-20);c.lineTo(x-26,y);c.stroke();for(var a=Math.PI;a<=6.3;a+=.35)blob(c,x+Math.cos(a)*26,y-20+Math.sin(a)*26,3.6,3.2,["#e86a8a","#ffd25a","#f4efe4"][Math.round(a*3)%3],0)}};
DEC.petbed={n:"Cozy pet bed",d:function(c,x,y){shadow(c,x,y,24,6);blob(c,x,y-5,24,10,"#8a5a9a",0);blob(c,x,y-7,16,6,"#efe0c8",0)}};
DEC.lily={n:"Pond lily",d:function(c,x,y){blob(c,x,y-3,14,6,"#4f8f4a",0);blob(c,x+2,y-7,5,4,"#f6d0dc",0);blob(c,x+2,y-8,2,1.6,"#ffd25a",0)}};
/* --- 6. pet bond --- */
var TRICK=[["Cape twirl","Book fetch"],["Spin","High paw"],["Roll over","Happy hop"]];
var BL=[0,5,15,30];
function bondLv(){var b=S.bond[S.hero.pet|0]||0;return b>=BL[3]?4:b>=BL[2]?3:b>=BL[1]?2:1}
function bondAdd(n){var i=S.hero.pet|0,before=bondLv();S.bond[i]=(S.bond[i]||0)+n;save();var a=bondLv();if(a>before)toast(petName()+" feels closer to you. Bond level "+a+": "+bondPerk(a)+".");return a}
function bondPerk(l){return l===2?"learned "+TRICK[S.hero.pet|0][0]+" and can sniff out treasures":l===3?"will comfort you when hope runs low":l===4?"learned "+TRICK[S.hero.pet|0][1]:"follows you everywhere"}
var PETW={d:0,last:0};
function toast(t){live(t);if(!stage)return;var o=stage.querySelector(".w-toast");if(o)o.remove();o=document.createElement("div");o.className="w-toast w-par";o.setAttribute("role","status");o.textContent=t;stage.appendChild(o);setTimeout(function(){if(o.parentNode)o.remove()},3800)}
function petTrick(n){var l=bondLv();if(n===0&&l<2||n===1&&l<4)return false;PT.trick={k:n,t0:performance.now()};live(petName()+" does "+TRICK[S.hero.pet|0][n]+"!");return true}
function petPet(){var now=performance.now();if(now-PETW.last<8000){toast(petName()+" leans into you, happy.");return 0}PETW.last=now;bondAdd(1);toast("You give "+petName()+" some attention. Bond grows.");return 1}
function sniff(s){if(bondLv()<2||S.sniffed.indexOf(s.id)>=0||s.id==="safe")return;S.sniffed.push(s.id);if(S.sniffed.length%3!==1)return save();var k=["stone","shell","flowers"][S.sniffed.length%3];give(k);setTimeout(function(){toast(petName()+" sniffed out "+decName(k)+"! It's in your satchel.")},600)}
function companion(){var i=S.hero.pet|0,l=bondLv(),b=S.bond[i]||0,nx=l<4?BL[l]-b:0;
 var d=panel('<h2>'+esc(petName())+'</h2><p>Bond level '+l+' of 4'+(nx>0?' · '+nx+' more to the next level':' · best friends')+'.</p><p>Your bond grows as you walk together, calm symptoms, and spend time with '+esc(petName())+'.</p><ul>'+[1,2,3,4].map(function(k){return '<li'+(l>=k?'':' class="w-lock"')+'>Level '+k+': '+esc(bondPerk(k))+(l>=k?'':' (not yet)')+'</li>'}).join("")+'</ul>'+
 '<p><button class="w-btn" id="pb-pet">Spend time with '+esc(petName())+'</button> <button class="w-btn" id="pb-t0"'+(l<2?' disabled':'')+'>'+esc(TRICK[i][0])+'</button> <button class="w-btn" id="pb-t1"'+(l<4?' disabled':'')+'>'+esc(TRICK[i][1])+'</button></p>',"Companion");
 d.querySelector("#pb-pet").onclick=function(){petPet();closeOV();companion()};d.querySelector("#pb-t0").onclick=function(){closeOV();petTrick(0)};d.querySelector("#pb-t1").onclick=function(){closeOV();petTrick(1)}}
/* ---------- guides journey: mentors at each gate, echo practice, waystations, clues, calm spots, reflections ---------- */
var GJT={mentor:1,way:1,clue:1,calm:1};FT.mentor=[10,6,58];FT.way=[14,7,50];
var GJF={fast:1};
/* each region's gate mentor. Method must be listed for them in shared/data.js; skill must be one of the region's skills */
var GJ={
 anx:{g:"amber",m:"CBT",sk:"reframe",at:"anx1",xy:[70,175],tag:"anxiety",
  teach:"In CBT, you practice catching a worried thought and checking it against the facts. Ask: what is most likely, not just most scary? Then write down a more balanced thought.",
  why:"Checking a scary thought against the facts can turn the volume down on worry. That is a core idea in CBT."},
 ptsd:{g:"abby",m:"TF-CBT",sk:"ground",at:"ptsd1",xy:[575,180],tag:"trauma",tough:1,
  teach:"Trauma-Focused CBT starts with skills for feeling safe in your body before anything else. One is grounding: feet on the floor, then say today's date and where you are, out loud.",
  why:"Grounding helps your body notice that you are safe right now, here and today, not back then."},
 rel:{g:"shanna",m:"Gottman",sk:"soft",at:"rel1",xy:[205,385],tag:"relationships",
  teach:"The Gottman Method teaches a soft start-up. Instead of \"You always\u2026\", try \"I feel\u2026 about\u2026 and I need\u2026\". How a hard talk starts often shapes how it goes.",
  why:"Starting gently helps the other person stay open instead of getting defensive."},
 ocd:{g:"aspen",m:"ERP",sk:"erp",at:"ocd1",xy:[590,210],tag:"ocd",
  teach:"In Exposure and Response Prevention, you notice the urge to check and you don't do the ritual. The worry rises, then fades on its own. With practice, the urge gets weaker.",
  why:"Each time you let an urge pass without the ritual, your brain learns the worry can fade on its own."},
 adhd:{g:"aspen",m:"CBT",sk:"quest",at:"adhd1",xy:[588,190],tag:"adhd",
  teach:"CBT for ADHD includes practical planning skills. One is breaking a big task into a first step that takes under two minutes, then starting there.",
  why:"A tiny first step lowers the hurdle to starting, and starting builds momentum."},
 ed:{g:"scott",m:"ACT",sk:"values",at:"ed1",xy:[205,388],tag:"eating",tough:1,
  teach:"In ACT, you name what matters most to you, your values, and take one small step toward them, even while a harsh voice is loud.",
  why:"Values give you a direction that belongs to you, not to the disorder's voice. Support helps recovery too."},
 grief:{g:"amanda",m:"ACT",sk:"wave",at:"grief1",xy:[205,392],tag:"grief",
  teach:"ACT helps you make room for hard feelings instead of fighting them. Grief comes in waves. Let the wave rise, breathe, and let it pass in its own time.",
  why:"Making room for grief, instead of pushing it away, can help the waves feel more bearable over time."},
 fog:{g:"shanna",m:"CBT",sk:"step",at:"fog1",xy:[205,385],tag:"depression",tough:1,big:1,
  teach:"CBT for depression often uses behavioral activation: small, doable actions, even before you feel like doing them. Motivation often follows action, not the other way around.",
  why:"Small actions can lift mood a little, even before motivation shows up. That is called behavioral activation."}};
/* optional local talks: what the symptom can feel like, plus weak-spot hints taken from the boss's own skills */
var FEEL={
 anx:["Anxiety can feel like your heart racing and your mind jumping to the worst case."],
 ptsd:["After something scary, a sound or smell can make it feel like it's happening again, even when you're safe."],
 rel:["When people we love argue, it can feel like we're on opposite banks, both shouting and nobody hearing."],
 ocd:["OCD can feel like a door that won't stay locked in your mind. You check, feel better for a moment, then the doubt comes back."],
 adhd:["ADHD can feel like ten ideas at once, and the one task you need slipping away."],
 ed:["The mist can feel like a strict voice that's always watching and always making rules."],
 grief:["Grief can feel heavy and quiet, and then a wave of missing someone arrives out of nowhere."],
 fog:["Depression can feel like a heavy fog. Getting out of bed takes everything, and a voice says, why bother."]};
function feelOf(r){var k=BD[r].sk;return FEEL[r].concat(["A hint: when it casts "+k[0][2]+", "+k[0][1]+" is its weak spot. When it casts "+k[1][2]+", try "+k[1][1]+"."])}
var CLUEAT={anx:["anx1",290,118],ptsd:["ptsd1",230,122],rel:["rel1",560,232],ocd:["ocd1",320,118],adhd:["adhd1",330,118],ed:["ed1",80,240],grief:["grief1",370,115],fog:["fog1",330,115]};
var CALMAT={anx:["anx1",380,380],ptsd:["ptsd1",380,372],rel:["rel1",450,376],ocd:["ocd1",440,385],adhd:["adhd1",220,385],ed:["ed1",440,385],grief:["grief1",90,232],fog:["fog1",430,382]};
var WAYAT=[["cross",420,330],["woods",240,360]];
REG.forEach(function(r){var g=GJ[r.id];SC[g.at].p.push(["mentor",g.xy[0],g.xy[1],r.id]);var c=CLUEAT[r.id];SC[c[0]].p.push(["clue",c[1],c[2],r.id]);var k=CALMAT[r.id];SC[k[0]].p.push(["calm",k[1],k[2],r.id]);
});
WAYAT.forEach(function(a){SC[a[0]].p.push(["way",a[1],a[2],"makayla"])});
function gjFix(){S.met=S.met||[];S.clues=S.clues||[];S.duo=S.duo||{};S.refl=S.refl||{};S.calm=S.calm|0;S.calmUsed=S.calmUsed||[];S.practiced=S.practiced||[]}gjFix();
function photo(id){var c=id==="makayla"?((window.OBC&&OBC.staff)||[]).filter(function(s){return s.id==="makayla"})[0]:C(id);return "../../professional/img/team/"+String(c&&c.name||id).toLowerCase().replace(/[^a-z]+/g,"-")+".webp"}
function gskill(rid){var g=GJ[rid],l=BD[rid].sk;for(var i=0;i<l.length;i++)if(l[i][0]===g.sk)return i;return 0}
function gjOK(rid){var g=GJ[rid],c=C(g.g);return (c.mods||[]).indexOf(g.m)>=0&&(c.concerns||[]).indexOf(g.tag)>=0}
function staff(){return ((window.OBC&&OBC.staff)||[]).filter(function(s){return s.id==="makayla"})[0]||{name:"Makayla Jones",role:"Admin Manager",email:"makayla@openbooktherapist.com"}}
function gjDraw(c,o,t){var pulse=RM?.45:.3+.15*Math.sin(t/500+o.x);switch(o.t){
 case"mentor":var col=R(o.gj).col;glowDot(c,o.x,o.y-26,30,col,S.met.indexOf(o.gj)>=0?.25:pulse+.1);shadow(c,o.x,o.y,12,4);
  c.fillStyle="#6b4520";c.fillRect(o.x-2,o.y-44,4,44);poly(c,[[o.x-14,o.y-52],[o.x+14,o.y-52],[o.x+12,o.y-38],[o.x-12,o.y-38]],"#f4ead2");c.strokeStyle="#8a5a2a";c.lineWidth=1.5;c.beginPath();c.moveTo(o.x,o.y-52);c.lineTo(o.x,o.y-38);c.stroke();
  c.font="600 11px Georgia,serif";c.textAlign="center";var lb=C(GJ[o.gj].g).name.split(" ")[0]+"'s gate";var lw=c.measureText(lb).width+10;c.fillStyle="rgba(250,240,215,.9)";c.fillRect(o.x-lw/2,o.y-70,lw,15);c.fillStyle="#5a2e0e";c.fillText(lb,o.x,o.y-59);c.textAlign="left";break;
 case"way":glow(c,o.x,o.y-30,44,t);shadow(c,o.x,o.y,16,5);poly(c,[[o.x-16,o.y-30],[o.x+16,o.y-30],[o.x+12,o.y],[o.x-12,o.y]],"#9a6a3a");poly(c,[[o.x-18,o.y-34],[o.x+18,o.y-34],[o.x+16,o.y-28],[o.x-16,o.y-28]],"#c8553f");sp(c,"lantern",o.x+22,o.y+2,34);
  c.font="600 11px Georgia,serif";c.textAlign="center";lw=c.measureText("Waystation").width+10;c.fillStyle="rgba(250,240,215,.9)";c.fillRect(o.x-lw/2,o.y-54,lw,15);c.fillStyle="#5a2e0e";c.fillText("Waystation",o.x,o.y-43);c.textAlign="left";break;
 case"clue":if(S.clues.indexOf(o.gj)<0){glowDot(c,o.x,o.y-6,16,"#ffe6a8",pulse);c.save();c.translate(o.x,o.y-4);c.rotate(.25);c.fillStyle="#efe0bc";c.fillRect(-8,-6,16,12);c.strokeStyle="#8a5a2a";c.lineWidth=1;c.strokeRect(-8,-6,16,12);c.restore()}break;
 case"calm":var used=S.calmUsed.indexOf(o.gj)>=0;for(var i=0;i<7;i++){var a=i/7*6.283;blob(c,o.x+Math.cos(a)*18,o.y+Math.sin(a)*7,3.2,2.4,"#a9a294")}glowDot(c,o.x,o.y-4,22,"#bfe8d8",used?.15:pulse);break}}
function gjInteract(o){switch(o.t){case"mentor":mentor(o.gj);break;case"way":waystation();break;case"clue":clue(o.gj);break;case"calm":calmSpot(o.gj);break}}
var gjFeel=null;function gjNpc(o){var r=cur&&cur.reg;gjFeel=r&&GJ[r]&&GJ[r].at===cur.id&&FEEL[r]?{who:o.name,l:feelOf(r)}:null}
function card(id,role,extra){var c=id==="makayla"?staff():C(id);return '<div class="w-gj-card"><img src="'+photo(id)+'" alt="Photo of '+esc(c.name)+'" width="88" height="88"><div><h3>'+esc(c.name)+'</h3><p class="w-pcc">'+esc(role||c.cred)+'</p>'+(extra||'')+'</div></div>'}
function mentor(rid){if(B)return;var g=GJ[rid],c=C(g.g),s=BD[rid].sk[gskill(rid)],first=S.met.indexOf(rid)<0;if(first){S.met.push(rid);save()}
 var d=panel('<h2>'+esc(R(rid).name)+' gate</h2>'+card(g.g,null,'<p><b>Lists among their methods:</b> '+esc(modLabel(g.m))+'</p>')+
  '<p class="w-gj-sk"><b>Skill to carry in: '+esc(s[1])+'</b></p><p>'+esc(g.teach)+'</p><p class="w-gj-rl"><b>In real life:</b> '+esc(s[3])+'</p>'+
  (first?'<p class="w-gj-note">A page about '+esc(c.name.split(" ")[0])+' was added to your skill journal.</p>':'')+
  '<p><button class="w-btn pri" id="gj-prac">Practice with an echo</button> '+(g.tough?'<button class="w-btn" id="gj-duo">Choose two guides for the boss</button> ':'')+'<a href="../#team" target="_blank" rel="noopener">Meet the real '+esc(c.name.split(" ")[0])+'</a></p>'+
  '<p class="w-gj-small">The photo is the real '+esc(c.name)+'. In the game, the skill is a short practice, not therapy.</p>',c.name+" at the gate");
 d.querySelector("#gj-prac").onclick=function(){practice(rid)};var du=d.querySelector("#gj-duo");if(du)du.onclick=function(){duo(rid)};
 live(c.name+" waits at the gate and shares a skill: "+s[1])}
function practice(rid){closeOV();var e={id:"echo:"+rid,echo:1,reg:rid,hx:P.x,hy:P.y-70,x:P.x,y:Math.max(110,P.y-70),ph:0,cd:0};cur.ens.push(e);battle(e)}
function echoD(rid){var base=BD[rid],i=gskill(rid);return Object.assign({},base,{name:"An echo of "+base.name.replace("The ",""),hp:6,mini:1,practice:1,fixWeak:i,tip:"Practice round: echoes can't take your hope. Try "+base.sk[i][1]+"."})}
function gjStart(){if(!B)return;var add=[];
 if(B.d.practice){B.weak=B.d.fixWeak;ui();return}
 var du=S.duo[B.id];if(du&&du.length===2&&B.e.boss){B.g=C(du[0]);B.g2=C(du[1]);B.shield=Math.max(B.shield,1);add.push(esc(B.g.name)+' and '+esc(B.g2.name)+' walk in with you. '+esc(B.g2.name.split(" ")[0])+' raises a shield for the first hit.');var gb=document.getElementById("b-guide");if(gb)gb.textContent="Call "+B.g.name.split(" ")[0]}
 if(S.calm){S.calm=0;save();B.shield=Math.max(B.shield,1);add.push('The calm from your grounding stays with you: a small shield blocks the next hit.')}
 if(add.length){var m=document.getElementById("b-msg");if(m)m.insertAdjacentHTML("beforeend",'<p class="w-gj-add">'+add.join(" ")+'</p>');ui()}}
function gjEchoWin(){var id=B.id,g=GJ[id],s=BD[id].sk[gskill(id)];B.over=1;if(S.practiced.indexOf(id)<0){S.practiced.push(id);save()}
 bend('<h2>The echo fades.</h2><p>Practice done. You\'re ready to use <b>'+esc(s[1])+'</b> on '+esc(BD[id].name)+'.</p><p class="w-gj-why"><b>Why it works:</b> '+esc(g.why)+'</p>'+(id==="ed"?EDHELP:''),'<button class="w-btn pri" id="b-on">Back to the gate</button>');
 document.getElementById("b-on").onclick=function(){endBattle();stage.focus()}}
function gjWin(e,id){var bd=stage.querySelector(".w-bend");if(!bd||!GJ[id])return;var p=bd.querySelector("p:last-child"),s=BD[id].sk[gskill(id)];
 var h='<p class="w-gj-why"><b>Why it works:</b> '+esc(GJ[id].why)+'</p>';
 if(e.boss)h+='<div class="w-gj-refl"><label for="gj-rt"><b>When might you try '+esc(s[1])+' this week?</b></label><textarea id="gj-rt" rows="2" maxlength="300" placeholder="For example: before a hard conversation">'+esc(S.refl[id]||"")+'</textarea><p class="w-gj-small">Kept only on this device, in your journal. Nothing is sent anywhere.</p><button class="w-btn" id="gj-rs">Save to my journal</button> <span id="gj-rok" role="status"></span></div>';
 p.insertAdjacentHTML("beforebegin",h);var rs=document.getElementById("gj-rs");if(rs)rs.onclick=function(){var v=document.getElementById("gj-rt").value.trim().slice(0,300);if(v)S.refl[id]=v;else delete S.refl[id];save();document.getElementById("gj-rok").textContent=v?"Saved on this device.":"Cleared."}}
function fitOf(c,rid){var g=GJ[rid],mt=(c.mods||[]).filter(function(m){return (MATCH[rid]||[]).indexOf(m)>=0}),f=(c.concerns||[]).indexOf(g.tag)>=0;
 return{score:(f?2:0)+mt.length,text:(f?'Lists '+(TAG[g.tag]||g.tag)+' as a focus area. ':'')+(mt.length?'Methods that fit this fight: '+mt.map(modLabel).join(", ")+'.':'No listed methods match this fight closely, but any guide can walk with you.')}}
function duo(rid){var pick=(S.duo[rid]||[]).slice(),r=R(rid);
 function draw(){var d=panel('<h2>Two guides for '+esc(BD[rid].name)+'</h2><p>This is a tougher boss. Pick two guides. The first leads; the second raises a shield for the first hit. The fit notes come from each person\'s listed focus areas and methods.</p>'+
  '<div class="w-hall">'+CL.slice().sort(function(a,b){return fitOf(b,rid).score-fitOf(a,rid).score}).map(function(c){var on=pick.indexOf(c.id);return '<article class="w-gcard'+(on>=0?' cur':'')+'">'+'<img src="'+photo(c.id)+'" alt="Photo of '+esc(c.name)+'" width="72" height="72"><div><h3>'+esc(c.name)+'</h3><p>'+esc(c.cred)+'</p><p class="w-gj-fit">'+esc(fitOf(c,rid).text)+'</p><p><button class="w-btn'+(on>=0?' pri':'')+'" data-duo="'+c.id+'" aria-pressed="'+(on>=0)+'">'+(on===0?'Leads':on===1?'Shields':'Choose')+'</button></p></div></article>'}).join("")+'</div>'+
  '<p id="gj-duos" role="status">'+(pick.length===2?'Ready: '+esc(C(pick[0]).name)+' leads, '+esc(C(pick[1]).name)+' shields.':'Chosen: '+pick.length+' of 2.')+'</p>',"Choose two guides");
  d.querySelectorAll("[data-duo]").forEach(function(b){b.onclick=function(){var id=b.dataset.duo,i=pick.indexOf(id);if(i>=0)pick.splice(i,1);else{pick.push(id);if(pick.length>2)pick.shift()}if(pick.length===2)S.duo[rid]=pick.slice();else delete S.duo[rid];save();draw();var n=stage.querySelector('[data-duo="'+id+'"]');if(n)n.focus()}})}
 draw()}
function clue(rid){if(S.clues.indexOf(rid)<0){S.clues.push(rid);save()}var d=BD[rid];
 say(["You found a clue page about "+d.name+".","It is known to cast: "+d.sk.map(function(s){return s[2]}).join(", ")+".","Matching each one: "+d.sk.map(function(s){return s[2]+" \u2192 "+s[1]}).join("; ")+".","When it casts, the bubble will mark the ones you've read about."],"Clue page")}
function calmSpot(rid){if(B)return;var edr=rid==="ed",D=30000/GJF.fast;
 var d=panel('<h2>A calm spot</h2><p>Take a short pause here. Finish the activity and you\'ll carry a small shield into your next fight.</p><p><button class="w-btn pri" id="gj-cb">Breathing circle</button>'+(edr?'':' <button class="w-btn" id="gj-cg">5-4-3-2-1 senses</button>')+'</p><div id="gj-ca" aria-live="polite"></div>'+(S.calm?'<p class="w-gj-small">Your shield is already waiting for the next fight.</p>':''),"Calm spot");
 function run(kind){var a=d.querySelector("#gj-ca"),t0=performance.now(),tm;d.querySelectorAll("#gj-cb,#gj-cg").forEach(function(b){b.disabled=true});
  var G=["Name 5 things you can see.","Name 4 things you can feel.","Name 3 things you can hear.","Name 2 things you can smell.","Name 1 thing you can taste, or one slow breath."];
  a.innerHTML='<div class="w-gj-circ'+(RM?' rm':'')+'" id="gj-circ" aria-hidden="true"></div><p id="gj-ct"></p><div class="w-gj-prog"><i id="gj-cp"></i></div><p><button class="w-btn" id="gj-cx">Stop</button></p>';
  function tick(){var p=Math.min(1,(performance.now()-t0)/D),el=document.getElementById("gj-ct");if(!el){clearInterval(tm);return}
   document.getElementById("gj-cp").style.width=(p*100)+"%";
   if(kind==="b"){var ph=((performance.now()-t0)*GJF.fast/1000)%10,inh=ph<4;el.textContent=inh?"Breathe in slowly as the circle grows.":"Breathe out slowly as it shrinks.";var ci=document.getElementById("gj-circ");if(!RM)ci.style.transform="scale("+(inh?.6+.4*ph/4:1-.4*(ph-4)/6)+")";else ci.textContent=inh?"in":"out"}
   else el.textContent=G[Math.min(4,Math.floor(p*5))];
   if(p>=1){clearInterval(tm);S.calm=1;if(S.calmUsed.indexOf(rid)<0)S.calmUsed.push(rid);save();a.innerHTML='<p class="w-gj-done"><b>Nice.</b> You took a real pause. A small shield will block the first hit in your next fight.</p>';live("Calm spot complete. A small shield is ready for your next fight.")}}
  tm=setInterval(tick,RM?500:100);tick();d.querySelector("#gj-cx").onclick=function(){clearInterval(tm);calmSpot(rid)};}
 d.querySelector("#gj-cb").onclick=function(){run("b")};var g=d.querySelector("#gj-cg");if(g)g.onclick=function(){run("g")}}
function nextReg(){for(var i=0;i<REG.length;i++)if(S.beaten.indexOf(REG[i].id)<0)return REG[i];return null}
function waystation(){if(B)return;var m=staff();
 var d=panel('<h2>Waystation</h2>'+card("makayla",m.role,'<p>In real life, '+esc(m.name.split(" ")[0])+' helps people get scheduled and answers their questions. She is not a therapist, so the skills come from the guides.</p>')+
  '<p><button class="w-btn pri" id="gj-kit">Pack a prep kit</button> <button class="w-btn" id="gj-sv">Save my progress</button> <button class="w-btn" id="gj-pv">What\'s ahead?</button></p><div id="gj-wo" aria-live="polite"></div>'+
  '<p class="w-gj-small">Questions about real appointments: <a href="mailto:'+esc(m.email)+'">'+esc(m.email)+'</a></p>',"Waystation with "+m.name);
 var o=d.querySelector("#gj-wo");
 d.querySelector("#gj-kit").onclick=function(){S.kit=1;CFG.breath=true;save();o.innerHTML='<div class="w-gj-kit"><h3>Your coping card</h3><ul><li>Breathe out a little longer than you breathe in.</li><li>Name a few things you can see around you.</li><li>Text one safe person.</li><li>Crisis: call or text 988 \u00b7 SafeUT \u00b7 911.</li></ul><p><b>Breathe reminder:</b> breath timing is on for your next fight. Press when the ring glows.</p><p class="w-gj-small">The coping card is in your journal.</p></div>'};
 d.querySelector("#gj-sv").onclick=function(){save();o.innerHTML='<p>Progress saved on this device. Bosses calmed: '+S.beaten.length+' of 8. Guides met: '+S.met.length+' of 8.</p>'};
 d.querySelector("#gj-pv").onclick=function(){var r=nextReg();if(!r){o.innerHTML='<p>Every boss is calm. The Open Book Office is waiting for you, south of the Crossroads.</p>';return}var g=GJ[r.id],c=C(g.g);
  o.innerHTML='<p><b>Ahead: '+esc(r.name)+'</b> ('+esc(r.sub)+'). '+esc(c.name)+' waits at the gate'+(S.met.indexOf(r.id)>=0?' (met)':'')+'. '+(S.clues.indexOf(r.id)>=0?'You have the clue page.':'A clue page is hidden nearby.')+' '+(S.calmUsed.indexOf(r.id)>=0?'You visited its calm spot.':'There is a calm spot there too.')+(g.tough?' This boss is tougher, so you can pick two guides.':'')+'</p>'}}
function gjJournal(){var h='';
 if(S.met.length)h+='<h3>Guides you\'ve met: '+S.met.length+' of 8</h3><div class="w-gj-pages">'+S.met.map(function(rid){var g=GJ[rid],c=C(g.g),s=BD[rid].sk[gskill(rid)];return '<article class="w-gj-pg">'+card(g.g,null,'<p><b>'+esc(R(rid).sub)+':</b> '+esc(s[1])+' ('+esc(modLabel(g.m))+')</p>')+'<p>'+esc(g.teach)+'</p><p><b>In real life:</b> '+esc(s[3])+'</p>'+(S.refl[rid]?'<p><b>My plan this week:</b> '+esc(S.refl[rid])+'</p>':'')+'</article>'}).join("")+'</div>';
 if(S.clues.length)h+='<h3>Clue pages: '+S.clues.length+' of 8</h3><ul>'+S.clues.map(function(rid){return '<li><b>'+esc(BD[rid].name)+':</b> '+BD[rid].sk.map(function(s){return esc(s[2])}).join(", ")+'</li>'}).join("")+'</ul>';
 if(S.kit)h+='<h3>Coping card</h3><p>Breathe out longer than in. Name a few things you can see. Text one safe person. Crisis: 988 \u00b7 SafeUT \u00b7 911.</p>';
 var rf=Object.keys(S.refl).filter(function(k){return S.met.indexOf(k)<0});if(rf.length)h+='<h3>My plans this week</h3><ul>'+rf.map(function(k){return '<li>'+esc(R(k).sub)+': '+esc(S.refl[k])+'</li>'}).join("")+'</ul>';
 return h}
function gjEnter(s){if(s.boss&&s.reg&&S.met.indexOf(s.reg)<0&&S.beaten.indexOf(s.reg)<0){var g=GJ[s.reg];setTimeout(function(){toast(C(g.g).name+" waits at the gate in "+SC[g.at].n+" with a skill for this boss.")},500)}}
window.obcWorld3={gj:{GJ:GJ,FEEL:FEEL,feel:feelOf,F:GJF,mentor:mentor,practice:practice,duo:duo,clue:clue,calm:calmSpot,way:waystation,journal:gjJournal,ok:gjOK,photo:photo,fit:fitOf,fix:gjFix},state:function(){return S},scr:function(){return cur&&cur.id},P:P,go:function(id,x,y){closeOV();if(B)endBattle();enter(id,x,y)},battle:function(i){var e=(cur.ens||[]).filter(function(e){return !gone(e)})[i||0];if(e)battle(e);return !!e},
 B:function(){return B},near:function(){var n=near();return n&&(n.name||n.t)},interact:function(){interact(near())},safe:goSafe,decorate:decorate,hall:hall,office:office,cfg:CFG,SC:SC,build:build,guide:{MX:MX,MATCH:MATCH,methods:guideMethods,half:halfHP,card:photoCard,fx:function(){return FXL.length}},x:{frame:function(){return HF},petFrame:function(){return PT.frame},wx:function(){return WXK},sparks:function(){return SPN},shake:function(){return SHK},vic:function(){return VIC},journal:journal,skx:function(){return S.skx},tips:TIPS,pages:PAGES,quests:QS,companion:companion,bondLv:bondLv,bondAdd:bondAdd,trick:petTrick,petPet:petPet,fish:FISH,fishing:fishing,combo:comboOf,phase:PHASE,lv:LV},reset:function(){localStorage.removeItem(KEY);location.reload()}};
if(S.made)play();else creator();
})();
