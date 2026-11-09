/* Wanderer's Quest vista.
   Default: original shaded diorama, quantized to a low internal resolution and integer-upscaled.
   ?art=tiles keeps the earlier Kenney CC0 16px atlas. Older looks stay on ?art=storybook|diorama|pixel|ink|classic|blend.
   No Nintendo assets. */
(function(){"use strict";
var keep=/[?&]art=(storybook|diorama|pixel|ink|classic|blend)\b/;
if(keep.test(location.search))return;
if(/[?&]art=tiles\b/.test(location.search)){
 document.documentElement.classList.add("vista-tiles");
/* Vista look: 16px pixel tiles and sprites.
   Terrain tiles are from Kenney's Roguelike/RPG pack (CC0). See ASSETS-LICENSES.md.
   The hero, counselors, villagers, pets, houses, and symptom clouds in the atlas
   are original pixel art drawn for this game. No Nintendo assets. */
(function(){"use strict";
var keep=/[?&]art=(storybook|diorama|pixel|ink|classic|blend)\b/;
if(keep.test(location.search))return;
document.documentElement.classList.add("vista");
var W=640,H=416,RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
try{if(localStorage.getItem("obcSbCalm")==="1")RM=true}catch(e){}
function still(){return RM||window.OBC_STILL}
function hsh(s){var n=2166136261;for(var i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0}
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
var MAP={"grass0":[0,0,16,16],"grass1":[16,0,16,16],"grass2":[32,0,16,16],"grass3":[48,0,16,16],"grass4":[64,0,16,16],"grass5":[80,0,16,16],"dirt0":[96,0,16,16],"dirt1":[112,0,16,16],"water0":[128,0,16,16],"water1":[144,0,16,16],"stone0":[160,0,16,16],"stone1":[176,0,16,16],"cliff0":[192,0,16,16],"cliff1":[208,0,16,16],"cliff2":[224,0,16,16],"tree0":[240,0,16,16],"tree1":[256,0,16,16],"tree2":[272,0,16,16],"tree3":[288,0,16,16],"bush":[304,0,16,16],"house":[0,32,32,32],"sign":[48,32,16,16],"lantern":[64,32,16,16],"chest":[80,32,16,16],"chesto":[96,32,16,16],"rock":[112,32,16,16],"cloud0":[0,64,32,24],"cloud1":[32,64,32,24],"hero_0_0":[0,96,16,24],"hero_0_1":[16,96,16,24],"hero_0_2":[32,96,16,24],"hero_0_3":[48,96,16,24],"hero_1_0":[64,96,16,24],"hero_1_1":[80,96,16,24],"hero_1_2":[96,96,16,24],"hero_1_3":[112,96,16,24],"hero_2_0":[128,96,16,24],"hero_2_1":[144,96,16,24],"hero_2_2":[160,96,16,24],"hero_2_3":[176,96,16,24],"amber_0_0":[0,128,16,24],"amber_0_1":[16,128,16,24],"amber_0_2":[32,128,16,24],"amber_0_3":[48,128,16,24],"amber_1_0":[64,128,16,24],"amber_1_1":[80,128,16,24],"amber_1_2":[96,128,16,24],"amber_1_3":[112,128,16,24],"amber_2_0":[128,128,16,24],"amber_2_1":[144,128,16,24],"amber_2_2":[160,128,16,24],"amber_2_3":[176,128,16,24],"abby_0_0":[0,160,16,24],"abby_0_1":[16,160,16,24],"abby_0_2":[32,160,16,24],"abby_0_3":[48,160,16,24],"abby_1_0":[64,160,16,24],"abby_1_1":[80,160,16,24],"abby_1_2":[96,160,16,24],"abby_1_3":[112,160,16,24],"abby_2_0":[128,160,16,24],"abby_2_1":[144,160,16,24],"abby_2_2":[160,160,16,24],"abby_2_3":[176,160,16,24],"shanna_0_0":[0,192,16,24],"shanna_0_1":[16,192,16,24],"shanna_0_2":[32,192,16,24],"shanna_0_3":[48,192,16,24],"shanna_1_0":[64,192,16,24],"shanna_1_1":[80,192,16,24],"shanna_1_2":[96,192,16,24],"shanna_1_3":[112,192,16,24],"shanna_2_0":[128,192,16,24],"shanna_2_1":[144,192,16,24],"shanna_2_2":[160,192,16,24],"shanna_2_3":[176,192,16,24],"aspen_0_0":[0,224,16,24],"aspen_0_1":[16,224,16,24],"aspen_0_2":[32,224,16,24],"aspen_0_3":[48,224,16,24],"aspen_1_0":[64,224,16,24],"aspen_1_1":[80,224,16,24],"aspen_1_2":[96,224,16,24],"aspen_1_3":[112,224,16,24],"aspen_2_0":[128,224,16,24],"aspen_2_1":[144,224,16,24],"aspen_2_2":[160,224,16,24],"aspen_2_3":[176,224,16,24],"scott_0_0":[0,256,16,24],"scott_0_1":[16,256,16,24],"scott_0_2":[32,256,16,24],"scott_0_3":[48,256,16,24],"scott_1_0":[64,256,16,24],"scott_1_1":[80,256,16,24],"scott_1_2":[96,256,16,24],"scott_1_3":[112,256,16,24],"scott_2_0":[128,256,16,24],"scott_2_1":[144,256,16,24],"scott_2_2":[160,256,16,24],"scott_2_3":[176,256,16,24],"amanda_0_0":[0,288,16,24],"amanda_0_1":[16,288,16,24],"amanda_0_2":[32,288,16,24],"amanda_0_3":[48,288,16,24],"amanda_1_0":[64,288,16,24],"amanda_1_1":[80,288,16,24],"amanda_1_2":[96,288,16,24],"amanda_1_3":[112,288,16,24],"amanda_2_0":[128,288,16,24],"amanda_2_1":[144,288,16,24],"amanda_2_2":[160,288,16,24],"amanda_2_3":[176,288,16,24],"makayla_0_0":[0,320,16,24],"makayla_0_1":[16,320,16,24],"makayla_0_2":[32,320,16,24],"makayla_0_3":[48,320,16,24],"makayla_1_0":[64,320,16,24],"makayla_1_1":[80,320,16,24],"makayla_1_2":[96,320,16,24],"makayla_1_3":[112,320,16,24],"makayla_2_0":[128,320,16,24],"makayla_2_1":[144,320,16,24],"makayla_2_2":[160,320,16,24],"makayla_2_3":[176,320,16,24],"npc0_0_0":[0,352,16,24],"npc0_0_1":[16,352,16,24],"npc0_0_2":[32,352,16,24],"npc0_0_3":[48,352,16,24],"npc0_1_0":[64,352,16,24],"npc0_1_1":[80,352,16,24],"npc0_1_2":[96,352,16,24],"npc0_1_3":[112,352,16,24],"npc0_2_0":[128,352,16,24],"npc0_2_1":[144,352,16,24],"npc0_2_2":[160,352,16,24],"npc0_2_3":[176,352,16,24],"npc1_0_0":[0,384,16,24],"npc1_0_1":[16,384,16,24],"npc1_0_2":[32,384,16,24],"npc1_0_3":[48,384,16,24],"npc1_1_0":[64,384,16,24],"npc1_1_1":[80,384,16,24],"npc1_1_2":[96,384,16,24],"npc1_1_3":[112,384,16,24],"npc1_2_0":[128,384,16,24],"npc1_2_1":[144,384,16,24],"npc1_2_2":[160,384,16,24],"npc1_2_3":[176,384,16,24],"npc2_0_0":[0,416,16,24],"npc2_0_1":[16,416,16,24],"npc2_0_2":[32,416,16,24],"npc2_0_3":[48,416,16,24],"npc2_1_0":[64,416,16,24],"npc2_1_1":[80,416,16,24],"npc2_1_2":[96,416,16,24],"npc2_1_3":[112,416,16,24],"npc2_2_0":[128,416,16,24],"npc2_2_1":[144,416,16,24],"npc2_2_2":[160,416,16,24],"npc2_2_3":[176,416,16,24],"cat_0_0":[0,448,16,16],"cat_0_1":[16,448,16,16],"cat_1_0":[32,448,16,16],"cat_1_1":[48,448,16,16],"cat_2_0":[64,448,16,16],"cat_2_1":[80,448,16,16],"dog_0_0":[0,464,16,16],"dog_0_1":[16,464,16,16],"dog_1_0":[32,464,16,16],"dog_1_1":[48,464,16,16],"dog_2_0":[64,464,16,16],"dog_2_1":[80,464,16,16]};
var ATLAS=new Image();ATLAS.src="img/atlas.png";
function blit(c,name,dx,dy,dw,dh){
 var t=MAP[name];if(!t||!ATLAS.complete)return;
 c.imageSmoothingEnabled=false;
 c.drawImage(ATLAS,t[0],t[1],t[2],t[3],dx,dy,dw==null?t[2]:dw,dh==null?t[3]:dh);
}
var THEME={
 hub:{cliff:0},anx:{cliff:1,wash:"#ffe9a0"},ptsd:{cliff:1,wash:"#d4c4ea"},
 rel:{cliff:0,wash:"#d4f2ff"},ocd:{cliff:0,wash:"#f3e4c0"},adhd:{cliff:0,wash:"#e4ffc0"},
 ed:{cliff:0,wash:"#d8fff2"},grief:{cliff:0,wash:"#ffe0a8"},fog:{cliff:1,wash:"#d0dde4"},
 castle:{cliff:1,wash:"#ffe6c4"}
};
function themeOf(s){var k=s.reg||String(s.id||"").replace(/\d+$/,"");if(k==="cross"||k==="woods"||k==="town"||k==="safe")k="hub";if(k==="office")k="castle";return THEME[k]||THEME.hub}
function lay(s){
 var cx=W/2,cy=H*0.62,at=s.at||[0,0],ends=[];
 function nb(dx,dy){var SC=window.obcWorld3&&obcWorld3.SC;if(!SC)return 0;for(var k in SC){var a=SC[k].at;if(a&&a[0]===at[0]+dx&&a[1]===at[1]+dy)return 1}return 0}
 if(nb(-1,0))ends.push([0,cy]);if(nb(1,0))ends.push([W,cy]);if(nb(0,-1))ends.push([cx,56]);if(nb(0,1))ends.push([cx,H]);
 (s.items||[]).forEach(function(o){if(o.t==="house"||o.t==="door")ends.push([o.x,o.y+8])});
 if(!ends.length)ends.push([0,cy],[W,cy]);
 return{c:[cx,cy],ends:ends,seed:hsh(s.id||"x")}
}
function onPath(L,x,y){
 var best=Math.hypot(L.c[0]-x,(L.c[1]-y)*1.35)-22;
 L.ends.forEach(function(e){for(var k=0;k<=12;k++){var t=k/12,px=e[0]*(1-t)+L.c[0]*t,py=e[1]*(1-t)+L.c[1]*t,d=Math.hypot(px-x,py-y);if(d<best)best=d}});
 return best<18
}
var GRASS=["grass0","grass1","grass2","grass3","grass4","grass5"];
function plate(s){
 var A=document.createElement("canvas");A.width=W*2;A.height=H*2;var a=A.getContext("2d");
 a.imageSmoothingEnabled=false;a.setTransform(2,0,0,2,0,0);
 if(!ATLAS.complete){a.fillStyle="#4ea84a";a.fillRect(0,0,W,H);return A}
 var g=themeOf(s),L=lay(s),seed=L.seed;
 for(var ty=0;ty<26;ty++)for(var tx=0;tx<40;tx++){
  var x=tx*16,y=ty*16,n=rnd(seed+tx*9+ty*13),id;
  if(g.cliff&&y<112){
   if(x>W/2-24&&x<W/2+24&&y>=48)id=(ty%2?"dirt0":"stone1");
   else if(y<64)id="grass0";
   else id=n<.5?"cliff0":"cliff1";
  }else if(onPath(L,x+8,y+8))id=n<.55?"dirt0":"dirt1";
  else id=n<0.8?(n<.45?"grass0":"grass1"):GRASS[2+((n*4)|0)%4];
  blit(a,id,x,y,16,16);
 }
 (s.w||[]).forEach(function(q){
  for(var ty=0;ty<26;ty++)for(var tx=0;tx<40;tx++){
   var cx=tx*16+8,cy=ty*16+8,dx=(cx-q[0])/q[2],dy=(cy-q[1])/q[3],dd=dx*dx+dy*dy;
   if(dd<1)blit(a,(tx+ty)%2?"water1":"water0",tx*16,ty*16,16,16);
   else if(dd<1.55)blit(a,"dirt1",tx*16,ty*16,16,16);
  }
 });
 if(g.wash){a.globalCompositeOperation="soft-light";a.globalAlpha=.4;a.fillStyle=g.wash;a.fillRect(0,0,W,H);a.globalAlpha=1;a.globalCompositeOperation="source-over"}
 return A
}
function prop(name,dw,dh){return function(c){blit(c,name,-dw/2,-dh,dw,dh)}}
var SP={
 tree:function(c){var x=0;try{x=Math.abs(c.getTransform().e)|0}catch(e){}blit(c,["tree0","tree1","tree2","tree3"][x%4],-20,-48,40,48)},
 rock:prop("rock",28,28),
 house:prop("house",64,64),
 sign:prop("sign",28,28),
 lantern:prop("lantern",28,32),
 chest:prop("chest",28,28),
 chesto:prop("chesto",28,28),
 wall:function(c){blit(c,"cliff2",-24,-20,48,20)},
 door:function(c){blit(c,"house",-28,-48,56,48)}
};
function fx(){}
var dust=[];
function live(c,s,t){
 if(!ATLAS.complete)return;
 var T=(t||0)/1000,api=window.obcWorld3,P=api&&api.P;
 c.save();c.imageSmoothingEnabled=false;
 if(!still()&&s&&s.w){(s.w).forEach(function(q,n){
  var frame=((T*2+n)|0)%2?"water1":"water0";
  for(var ty=Math.max(0,(q[1]-q[3])/16|0);ty<26&&ty*16<q[1]+q[3];ty++)for(var tx=Math.max(0,(q[0]-q[2])/16|0);tx<40&&tx*16<q[0]+q[2];tx++){
   var cx=tx*16+8,cy=ty*16+8,dx=(cx-q[0])/q[2],dy=(cy-q[1])/q[3];
   if(dx*dx+dy*dy<0.85)blit(c,frame,tx*16,ty*16,16,16);
  }
 })}
 if(P&&!still()){if(Math.abs(P.ph-(live._p||0))>0.08&&dust.length<10)dust.push({x:P.x,y:P.y,a:1});live._p=P.ph}
 var keep=[];
 for(var i=0;i<dust.length;i++){var q=dust[i];q.a-=0.05;if(q.a<=0)continue;keep.push(q);c.globalAlpha=q.a;blit(c,"stone1",q.x-4,q.y-2,8,4)}
 dust=keep;c.globalAlpha=1;c.restore();
}
function ripple(){}
function margin(x,tw,th){
 x.imageSmoothingEnabled=false;x.fillStyle="#5ea848";x.fillRect(0,0,tw,th);
 if(!ATLAS.complete)return;
 for(var y=0;y<th;y+=16)for(var i=0;i<tw;i+=16)blit(x,(i+y)%32?"grass0":"grass1",i,y,16,16);
}
function ground(w,h){
 var A=document.createElement("canvas");A.width=w;A.height=h;var a=A.getContext("2d");
 a.imageSmoothingEnabled=false;a.fillStyle="#8fd4f2";a.fillRect(0,0,w,h*.55);a.fillStyle="#5ea848";a.fillRect(0,h*.5,w,h*.5);
 return A
}
function whoOf(p){
 if(p.who==="hero")return "hero";
 if(MAP[p.who+"_0_0"])return p.who;
 var n=0,s=String(p.who||"npc");for(var i=0;i<s.length;i++)n=(n+s.charCodeAt(i))%3;
 return "npc"+n
}
function fig(c,x,y,h,p,t,flip,E){
 var dir=p.dir!=null?p.dir:(p.back?1:(flip?3:0));
 var quiet=(E&&E.RM)||still(),moving=!quiet&&(p.walk||0)>0.2;
 var frame=moving?((p.walk*1.4)|0)%4:0,name=whoOf(p)+"_"+(dir===3?2:dir)+"_"+frame;
 var sp=MAP[name]||MAP.hero_0_0;if(!sp||!ATLAS.complete)return true;
 var dh=Math.max(16,Math.round(h/8)*8),dw=Math.round(dh*sp[2]/sp[3]);
 c.imageSmoothingEnabled=false;
 c.save();if(dir===3){c.translate(x,0);c.scale(-1,1);c.drawImage(ATLAS,sp[0],sp[1],sp[2],sp[3],-dw/2,y-dh,dw,dh)}else c.drawImage(ATLAS,sp[0],sp[1],sp[2],sp[3],x-dw/2,y-dh,dw,dh);
 c.restore();return true
}
function pet(c,x,y,i,dir,t,E){
 var quiet=(E&&E.RM)||still(),frame=quiet?0:((t/180)|0)%2,kind=i?"dog":"cat";
 var name=kind+"_"+(dir===3?2:dir)+"_"+frame,sp=MAP[name];if(!sp||!ATLAS.complete)return true;
 c.imageSmoothingEnabled=false;c.save();
 if(dir===3){c.translate(x,0);c.scale(-1,1);c.drawImage(ATLAS,sp[0],sp[1],16,16,-12,y-20,24,24)}
 else c.drawImage(ATLAS,sp[0],sp[1],16,16,x-12,y-20,24,24);
 c.restore();return true
}
function cloud(c,x,y,r,col,t,boss,hap,E){
 var hq=hap===true?1:(+hap||0),bat=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();
 if(bat&&boss&&bat.max)hq=Math.max(hq,1-bat.hp/Math.max(1,bat.max));
 var sp=MAP[hq>=.5?"cloud1":"cloud0"];if(!sp||!ATLAS.complete)return true;
 var quiet=(E&&E.RM)||still(),bob=quiet?0:Math.sin((t||0)/600)*2;
 var dw=r*1.5,dh=dw*sp[3]/sp[2];
 c.imageSmoothingEnabled=false;
 c.drawImage(ATLAS,sp[0],sp[1],sp[2],sp[3],x-dw/2,y-dh+bob,dw,dh);
 return true
}
window.OBC_COZY={name:"vista",ink:"#214028",bg:"#2f6a32",plate:plate,post:function(){},sp:SP,fx:fx,live:live,ripple:ripple,margin:margin,ground:ground,frame:function(){},deco:function(){return[]},nn:true};
window.OBC_CHARS={fig:fig,pet:pet,cloud:cloud,v:"vista"};
})();

 return;}
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
try{if(localStorage.getItem("obcSbCalm")==="1")RM=true}catch(e){}
/* Vista diorama: original shaded shapes, drawn into the scene and then
   shown through a low-resolution crisp upscale (see pixelate). No Nintendo art.
   Optional 16px tiles remain at ?art=tiles. */
document.documentElement.classList.add("vista");
var W=640,H=416;
function still(){return RM||window.OBC_STILL}
function hsh(s){var n=2166136261;s=String(s||"x");for(var i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0}
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function shade(hex,m){if(!hex||hex.charAt(0)!=="#")return hex||"#c08060";var n=parseInt(hex.slice(1),16);if(hex.length<7||isNaN(n))return hex;function ch(v){return Math.max(0,Math.min(255,(v*m)|0))}return "rgb("+ch(n>>16)+","+ch((n>>8)&255)+","+ch(n&255)+")"}
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
var AT={"0,0":1,"1,0":1,"2,0":1,"3,0":1,"0,1":1,"1,1":1,"2,1":1,"3,1":1,"0,2":1,"1,2":1,"2,2":1,"3,2":1,"0,3":1,"1,3":1,"2,3":1,"3,3":1,"0,4":1,"1,4":1,"2,4":1,"3,4":1};
function exits(s){var a=s.at||[9,9];return{n:!!AT[a[0]+","+(a[1]-1)],s:!!AT[a[0]+","+(a[1]+1)],w:!!AT[(a[0]-1)+","+a[1]],e:!!AT[(a[0]+1)+","+a[1]]}}
var PAL={
 town:{g0:"#3eae4c",g1:"#2c8a38",g2:"#7ed25f",sand:"#efc98a",sand2:"#c9964c",water:"#3aa8c8",water2:"#1e7490",earth:["#f0d0a0","#e0b06a","#c88848","#a86838","#8a5030"]},
 marsh:{g0:"#7f9c86",g1:"#5c7a6a",g2:"#b7cbb4",sand:"#d2c09a",sand2:"#a89068",water:"#6e9eaa",water2:"#3e6e7c",earth:["#d8d0bc","#b8aa90","#98886e","#786854","#5c5040"],mute:1},
 cliffs:{g0:"#4eb24c",g1:"#348438",g2:"#8ed864",sand:"#e8c890",sand2:"#c09048",water:"#58b0c4",water2:"#2a7890",earth:["#f2d2a4","#e2b46e","#cc8c4c","#b07038","#8c542c"],cliff:1},
 castle:{g0:"#46a84e",g1:"#2e8438",g2:"#b6dc6a",sand:"#f0d09a",sand2:"#c9a05a",water:"#48b0c0",water2:"#2a7888",earth:["#f0d0a0","#e0b06a","#c88848","#a86838","#8a5030"]}
};
function palOf(s){var g=s&&s.g;if(s&&s.reg==="fog")g="marsh";if(s&&(s.g==="cliffs"||s.reg==="anx"))g="cliffs";return PAL[g]||PAL.town}
function blob(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill()}
function grass(c,pal,seed){
 c.fillStyle=pal.g0;c.fillRect(0,0,W,H);
 var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,pal.g2);g.addColorStop(1,pal.g1);c.globalAlpha=.35;c.fillStyle=g;c.fillRect(0,0,W,H);c.globalAlpha=1;
 for(var i=0;i<8;i++){var x=rnd(seed+i*3)*W,y=rnd(seed+i*5+2)*H,rx=80+rnd(seed+i*7)*70;
  var gg=c.createRadialGradient(x,y,8,x,y,rx);gg.addColorStop(0,"rgba(255,255,220,.1)");gg.addColorStop(1,"rgba(255,255,220,0)");
  c.fillStyle=gg;c.beginPath();c.ellipse(x,y,rx,rx*.62,0,0,6.283);c.fill()}
}
function clump(c,x,y,r){
 c.fillStyle="rgba(16,36,14,.4)";c.beginPath();c.ellipse(x+r*.22,y+r*.42,r*.78,r*.26,0,0,6.283);c.fill();
 c.fillStyle="#1c5a28";c.beginPath();c.arc(x+r*.12,y+r*.08,r*.92,0,6.283);c.fill();
 c.fillStyle="#3f9a38";c.beginPath();c.arc(x-r*.22,y-r*.12,r*.62,0,6.283);c.fill();
 c.fillStyle="#7ec85a";c.beginPath();c.arc(x-r*.28,y-r*.32,r*.28,0,6.283);c.fill();
}
function shrub(c,x,y,r){clump(c,x,y,r)}
function stone(c,x,y,r){
 c.fillStyle="rgba(30,24,16,.3)";c.beginPath();c.ellipse(x+2,y+r*.45,r,r*.35,0,0,6.283);c.fill();
 var g=c.createRadialGradient(x-r*.3,y-r*.4,r*.1,x,y,r);g.addColorStop(0,"#f4f0e4");g.addColorStop(.5,"#b7b2a4");g.addColorStop(1,"#6e6a60");
 c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.72,0,0,6.283);c.fill();
}
function pot(c,x,y){
 c.fillStyle="rgba(40,24,12,.3)";c.beginPath();c.ellipse(x+2,y+2,9,3.2,0,0,6.283);c.fill();
 var g=c.createLinearGradient(x-8,y,x+8,y);g.addColorStop(0,"#8a3c28");g.addColorStop(.4,"#f0a878");g.addColorStop(1,"#6a2c1c");
 c.fillStyle=g;c.beginPath();c.ellipse(x,y-8,8,11,0,0,6.283);c.fill();
 c.fillStyle="#5a2818";rr(c,x-5,y-18,10,5,2);c.fill();
}
function fence(c,x,y,n){
 c.strokeStyle="#a06a3c";c.lineWidth=3;c.lineCap="round";c.beginPath();c.moveTo(x,y-11);c.lineTo(x+n*14,y-11);c.moveTo(x,y-5);c.lineTo(x+n*14,y-5);c.stroke();
 c.fillStyle="#6a4424";for(var i=0;i<=n;i++)c.fillRect(x+i*14-2,y-18,4,16);
 c.fillStyle="rgba(255,220,160,.35)";c.fillRect(x,y-12,n*14,2);
}
function bloom(c,x,y,n,seed){
 var cols=["#ffe27a","#f090a8","#fff8ee","#e8a0d8","#ffd0a0"];
 for(var i=0;i<n;i++){var a=i*2.3+seed,r=3+i*2.4,fx=x+Math.cos(a)*r,fy=y+Math.sin(a)*r*.62;
  c.fillStyle="#2f7a34";c.beginPath();c.ellipse(fx,fy+2,3.4,1.8,a,0,6.283);c.fill();
  c.fillStyle=cols[(i+seed)%cols.length];c.beginPath();c.arc(fx,fy,2.8,0,6.283);c.fill();
  c.fillStyle="rgba(255,255,255,.7)";c.beginPath();c.arc(fx-.8,fy-.8,1,0,6.283);c.fill()}
}
function reeds(c,q,mute){
 c.lineCap="round";c.strokeStyle=mute?"#8aa484":"#3e8a40";c.lineWidth=2;
 for(var a=.4;a<2.7;a+=.42){var x=q[0]+Math.cos(a)*q[2]*.92,y=q[1]+Math.sin(a)*q[3]*.88;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+5,y-14,x-1,y-26);c.stroke();
  c.fillStyle=mute?"#c4b48a":"#e8c85a";c.beginPath();c.ellipse(x-1,y-26,2.2,3.4,0,0,6.283);c.fill()}
}
function pond(c,q,pal){
 c.fillStyle=pal.sand2;c.beginPath();c.ellipse(q[0],q[1]+3,q[2]+16,q[3]+12,0,0,6.283);c.fill();
 c.fillStyle="rgba(40,70,40,.35)";c.beginPath();c.ellipse(q[0],q[1]+2,q[2]+8,q[3]+6,0,0,6.283);c.fill();
 var g=c.createRadialGradient(q[0]-q[2]*.2,q[1]-q[3]*.3,4,q[0],q[1],q[2]);
 g.addColorStop(0,"#d8f4f8");g.addColorStop(.35,pal.water);g.addColorStop(1,pal.water2);
 c.fillStyle=g;c.beginPath();c.ellipse(q[0],q[1],q[2],q[3],0,0,6.283);c.fill();
 c.fillStyle="rgba(255,255,255,.35)";c.beginPath();c.ellipse(q[0]-q[2]*.25,q[1]-q[3]*.28,q[2]*.28,q[3]*.18,0,0,6.283);c.fill();
}
function sampleLine(pts){var out=[];
 for(var i=0;i<pts.length-1;i++){var a=pts[i],b=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/14));
  for(var k=0;k<=n;k++){var t=k/n;out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}
 return out}
function avoid(s,p){(s.w||[]).forEach(function(q){var dx=(p[0]-q[0])/(q[2]+20),dy=(p[1]-q[1])/(q[3]+16),dd=dx*dx+dy*dy;if(dd<1){var l=Math.sqrt(dd)||.001;p[0]=q[0]+dx/l*(q[2]+22);p[1]=q[1]+dy/l*(q[3]+18)}});return p}
function road(c,s,pts,pal){
 var samples=sampleLine(pts).map(function(p){return avoid(s,p)});
 c.fillStyle=pal.sand2;samples.forEach(function(p,i){c.beginPath();c.ellipse(p[0],p[1],16+(i%5),11+(i%3),(i%6)*.12,0,6.283);c.fill()});
 c.fillStyle=pal.sand;samples.forEach(function(p,i){c.beginPath();c.ellipse(p[0]-1,p[1]-2,11+(i%4),7,(i%5)*.1,0,6.283);c.fill()});
 c.fillStyle="rgba(255,244,214,.4)";samples.forEach(function(p,i){if(i%2)return;c.beginPath();c.ellipse(p[0]-3,p[1]-3,5,2.4,0,0,6.283);c.fill()});
}
function roadsFor(s){
 var id=s.id,e=exits(s),c=[320,220],list=[];
 if(id==="hub")return[[[320,12],[330,90],[320,220]],[[320,404],[320,220]],[[12,214],[160,230],[320,220]],[[628,214],[480,224],[320,220]],[[210,200],[260,220],[320,220]],[[430,200],[380,220],[320,220]]];
 if(id==="fog1")return[[[320,16],[260,110],[210,190],[230,280],[300,400]],[[16,220],[120,240],[210,200]]];
 if(id==="anx1"||id==="anx2")return[[[320,8],[320,150],[320,404]],[[16,230],[180,250],[320,220]],[[624,230],[460,240],[320,220]]];
 if(e.n)list.push([[320,12],c]);if(e.s)list.push([[320,404],c]);if(e.w)list.push([[12,220],c]);if(e.e)list.push([[628,220],c]);
 if(!list.length)list.push([[180,200],[460,250]]);
 return list}
function facePath(c,x,y,rw,rh,face){
 c.beginPath();c.moveTo(x+10,y+rh-10);c.lineTo(x+rw-10,y+rh-10);
 c.quadraticCurveTo(x+rw+16,y+rh+face*.4,x+rw-18,y+rh+face);
 c.quadraticCurveTo(x+rw/2,y+rh+face+16,x+18,y+rh+face);
 c.quadraticCurveTo(x-16,y+rh+face*.4,x+10,y+rh-10);c.closePath();
}
function raised(c,pal,x,y,rw,rh,face){
 var bands=pal.earth;
 c.fillStyle="rgba(20,14,8,.4)";c.beginPath();c.ellipse(x+rw/2+8,y+rh+face+6,rw*.48,13,0,0,6.283);c.fill();
 c.save();facePath(c,x,y,rw,rh,face);c.clip();
 for(var i=0;i<bands.length;i++){var y0=y+rh-12+face*i/bands.length;c.fillStyle=bands[i];c.fillRect(x-24,y0,rw+48,face/bands.length+3);c.fillStyle="rgba(255,244,214,.2)";c.fillRect(x-24,y0,rw+48,2)}
 c.restore();
 c.fillStyle="rgba(24,14,8,.8)";c.beginPath();c.ellipse(x+rw/2,y+rh+face+2,rw*.4,5,0,0,Math.PI);c.fill();
 c.fillStyle=bands[1];rr(c,x-12,y+22,18,rh-20,8);c.fill();
 c.fillStyle=bands[4]||bands[3];rr(c,x+rw-6,y+26,18,rh-24,8);c.fill();
 var top=c.createLinearGradient(x,y,x,y+rh);top.addColorStop(0,pal.g2);top.addColorStop(1,pal.g0);
 c.fillStyle=top;rr(c,x,y,rw,rh,22);c.fill();
 c.fillStyle="rgba(255,255,220,.85)";c.beginPath();c.ellipse(x+rw/2,y+rh-7,rw*.36,6,0,0,Math.PI);c.fill();
 c.fillStyle="rgba(255,255,236,.4)";c.fillRect(x+3,y+16,6,rh-32);c.fillRect(x+rw-9,y+18,6,rh-34);
}
function stair(c,x,y,face){
 var sx=x-28;c.fillStyle="#3eae4c";rr(c,sx-6,y-12,68,16,4);c.fill();
 for(var s=0;s<5;s++){var sy=y+s*face/5,g=c.createLinearGradient(sx,sy,sx,sy+face/5);g.addColorStop(0,"#fff0d0");g.addColorStop(1,"#c49258");c.fillStyle=g;rr(c,sx,sy,56,Math.max(5,face/5-1),3);c.fill();c.fillStyle="rgba(70,40,16,.35)";c.fillRect(sx+2,sy+face/5-3,52,2)}
}
function edgeShrubs(c,s,pal){
 var e=exits(s),seed=hsh(s.id||"e");
 function row(vert,fixed,gap){for(var i=0;i<14;i++){var t=28+i*46;if(gap&&t>gap[0]&&t<gap[1])continue;var jx=(rnd(seed+i*9)-.5)*10,r=16+rnd(seed+i*4)*10;
  if(vert)shrub(c,fixed+jx,t,r,seed+i);else shrub(c,t+jx,fixed,r,seed+i)}}
 row(0,30,e.n?[250,400]:0);row(0,H-28,e.s?[250,400]:0);row(1,26,e.w?[160,290]:0);row(1,W-26,e.e?[160,290]:0);
}
function spots(id){
 var m={hub:[[160,240],[196,262],[470,236],[500,262],[300,320]],fog1:[[150,150],[188,200],[120,260]],fog2:[[180,180],[460,200]],
  grief1:[[210,250],[360,230],[150,210]],anx1:[[150,300],[500,280]],anx2:[[170,300],[470,310]],
  rel1:[[180,240],[300,280]],ed1:[[180,250],[250,300]],cross:[[200,260],[340,300]],woods:[[200,240],[400,220]]};
 return m[id]||[[150,200],[480,220]]}
function plate(s){
 var A=document.createElement("canvas");A.width=W*2;A.height=H*2;var a=A.getContext("2d");a.setTransform(2,0,0,2,0,0);
 var pal=palOf(s),seed=hsh(s.id||"v");
 grass(a,pal,seed);
 if(pal.cliff)raised(a,pal,90,36,460,130,52);
 if(s.id==="hub")raised(a,pal,150,36,340,100,42);
 (s.w||[]).forEach(function(q){pond(a,q,pal);reeds(a,q,pal.mute)});
 if(s.id==="hub"){blob(a,320,250,78,46,pal.sand2);blob(a,318,246,64,36,pal.sand);
  for(var k=0;k<8;k++)stone(a,320+Math.cos(k*.78)*62,248+Math.sin(k*.78)*34,6+k%3)}
 roadsFor(s).forEach(function(pts){road(a,s,pts,pal)});
 if(pal.cliff)stair(a,320,166,52);
 if(s.id==="hub")stair(a,320,136,42);
 spots(s.id).forEach(function(p,i){bloom(a,p[0],p[1],5+(i%3),i+2)});
 if(s.id==="hub"){
  [[120,90],[250,70],[400,78],[520,96],[100,300],[180,340],[470,330],[560,290],[300,370]].forEach(function(p,i){shrub(a,p[0],p[1],14+(i%3)*5);if(i%2)shrub(a,p[0]+18,p[1]+8,11)});
  fence(a,160,200,5);fence(a,390,200,5);fence(a,240,330,4);
  pot(a,175,200);pot(a,250,198);pot(a,400,200);pot(a,470,198);
  stone(a,190,120,8);stone(a,450,110,7);stone(a,230,310,9);
 }
 if(s.id==="cross"){pot(a,400,230);fence(a,250,250,4);shrub(a,180,200,18,2);shrub(a,210,220,14,4)}
 if(pal.cliff){shrub(a,120,80,18,2);shrub(a,180,70,14,5);shrub(a,500,78,16,3);shrub(a,90,280,20,6);shrub(a,540,300,18,7)}
 edgeShrubs(a,s,pal);
 var glow=a.createRadialGradient(W*.48,H*.32,30,W*.5,H*.55,420);glow.addColorStop(0,pal.mute?"rgba(210,220,210,.1)":"rgba(255,214,140,.2)");glow.addColorStop(1,"rgba(255,214,140,0)");
 a.fillStyle=glow;a.fillRect(0,0,W,H);
 return A}
function propShadow(c,rx,ry){c.fillStyle="rgba(24,32,16,.3)";c.beginPath();c.ellipse(4,2,rx,ry,0,0,6.283);c.fill()}
var SP={
 tree:function(c,L,x){var r=36+((x|0)%4)*3;propShadow(c,r*.85,r*.26);
  c.fillStyle="#6a4428";rr(c,-6,-34,12,34,4);c.fill();c.fillStyle="#8a5a34";c.fillRect(-6,-34,5,34);
  clump(c,-2,-r*.95,r);clump(c,r*.32,-r*.7,r*.62)},
 rock:function(c){propShadow(c,26,8);var g=c.createRadialGradient(-10,-16,2,0,-6,28);g.addColorStop(0,"#f7f3e8");g.addColorStop(.55,"#b2aea0");g.addColorStop(1,"#6a675c");c.fillStyle=g;c.beginPath();c.ellipse(0,-12,26,16,0,0,6.283);c.fill()},
 house:function(c){propShadow(c,40,12);
  var w=c.createLinearGradient(-36,0,36,0);w.addColorStop(0,"#f4e2c4");w.addColorStop(.55,"#e7c89a");w.addColorStop(1,"#c49664");c.fillStyle=w;rr(c,-34,-62,68,58,10);c.fill();
  c.fillStyle="#8d5a34";rr(c,-9,-32,18,30,6);c.fill();c.fillStyle="#e8c27a";c.beginPath();c.arc(5,-16,2,0,6.283);c.fill();
  [[-24,-48],[14,-48]].forEach(function(p){var wg=c.createLinearGradient(p[0],p[1],p[0]+12,p[1]+14);wg.addColorStop(0,"#fff2c4");wg.addColorStop(1,"#e0a050");c.fillStyle=wg;rr(c,p[0],p[1],14,14,3);c.fill();c.strokeStyle="rgba(90,50,20,.45)";c.strokeRect(p[0],p[1],14,14)});
  var rf=c.createRadialGradient(-8,-78,4,0,-64,48);rf.addColorStop(0,"#f0a070");rf.addColorStop(.45,"#c45a3a");rf.addColorStop(1,"#7a2e24");c.fillStyle=rf;c.beginPath();c.ellipse(0,-60,48,26,0,0,6.283);c.fill();
  c.fillStyle="rgba(255,220,170,.35)";c.beginPath();c.ellipse(-10,-70,18,7,0,0,6.283);c.fill();
  var ch=c.createLinearGradient(16,-90,28,-60);ch.addColorStop(0,"#f2ebe0");ch.addColorStop(1,"#b8aa9a");c.fillStyle=ch;rr(c,16,-88,12,22,2);c.fill();
  c.fillStyle="#6a4030";rr(c,14,-94,16,8,2);c.fill()},
 sign:function(c){propShadow(c,16,5);c.fillStyle="#7a5230";rr(c,-3,-48,6,48,2);c.fill();var g=c.createLinearGradient(-20,-70,20,-40);g.addColorStop(0,"#f0d7a4");g.addColorStop(1,"#c89658");c.fillStyle=g;rr(c,-22,-78,44,28,5);c.fill();c.strokeStyle="#8a5a28";c.lineWidth=2;c.stroke();c.fillStyle="rgba(90,50,20,.45)";c.fillRect(-14,-70,22,2);c.fillRect(-14,-62,16,2)},
 lantern:function(c){propShadow(c,10,4);c.fillStyle="#3a2c22";rr(c,-2,-58,4,58,2);c.fill();var g=c.createLinearGradient(-8,-50,10,-20);g.addColorStop(0,"#ffe7a8");g.addColorStop(1,"#e07030");c.fillStyle=g;rr(c,-8,-52,16,26,6);c.fill();c.fillStyle="rgba(255,255,220,.8)";c.beginPath();c.ellipse(0,-40,4,7,0,0,6.283);c.fill();c.fillStyle="#5a3a22";c.fillRect(-10,-54,20,4);c.fillRect(-10,-28,20,4)},
 chest:function(c){propShadow(c,22,6);var g=c.createLinearGradient(-20,0,20,-20);g.addColorStop(0,"#a86a38");g.addColorStop(.5,"#e0a060");g.addColorStop(1,"#7a4a24");c.fillStyle=g;rr(c,-22,-28,44,28,5);c.fill();c.fillStyle="#c08040";c.beginPath();c.ellipse(0,-28,22,8,0,Math.PI,0);c.fill();c.fillStyle="#f0d080";c.fillRect(-4,-24,8,8)},
 chesto:function(c){SP.chest(c);c.fillStyle="#3a2414";c.beginPath();c.ellipse(0,-30,20,7,0,Math.PI,0,true);c.fill()},
 wall:function(c){fence(c,-28,-2,4)},
 door:function(c){propShadow(c,18,6);var g=c.createLinearGradient(-16,0,16,-40);g.addColorStop(0,"#f0d8b0");g.addColorStop(1,"#c89860");c.fillStyle=g;c.beginPath();c.moveTo(-16,0);c.lineTo(-16,-36);c.quadraticCurveTo(0,-62,16,-36);c.lineTo(16,0);c.closePath();c.fill();c.fillStyle="#6a3e24";c.beginPath();c.moveTo(-8,0);c.lineTo(-8,-28);c.quadraticCurveTo(0,-44,8,-28);c.lineTo(8,0);c.fill()}
};
function margin(x,tw,th,gi,s){var pal=palOf(s||{g:"town"});x.fillStyle=pal.g0;x.fillRect(0,0,tw,th);var g=x.createLinearGradient(0,0,0,th);g.addColorStop(0,pal.g2);g.addColorStop(1,pal.g1);x.globalAlpha=.35;x.fillStyle=g;x.fillRect(0,0,tw,th);x.globalAlpha=1}
function ground(w,h){var A=document.createElement("canvas");A.width=w;A.height=h;var a=A.getContext("2d"),g=a.createLinearGradient(0,0,0,h);g.addColorStop(0,"#b7dc78");g.addColorStop(.5,"#3eae4c");g.addColorStop(1,"#2c8a38");a.fillStyle=g;a.fillRect(0,0,w,h);return A}
var dust=[];
function live(c,s,t){if(still()||!s)return;var T=(t||0)/1000;
 (s.w||[]).forEach(function(q,n){c.fillStyle="rgba(255,255,255,.18)";c.beginPath();c.ellipse(q[0]+Math.sin(T+n)*q[2]*.2,q[1]-q[3]*.15,q[2]*.22,q[3]*.1,0,0,6.283);c.fill()});
 (s.items||[]).forEach(function(o){if(o.t==="lantern"&&o.lit){var g=c.createRadialGradient(o.x,o.y-28,2,o.x,o.y-28,36);g.addColorStop(0,"rgba(255,210,120,.55)");g.addColorStop(1,"rgba(255,210,120,0)");c.fillStyle=g;c.fillRect(o.x-40,o.y-70,80,70)}});
}
/* Copy the low-res frame, then paint it onto a full-resolution canvas with nearest-neighbor at an integer scale. */
function pixelate(c){
 var px=window.OBC_PIX;if(!px)return;
 var cv=c.canvas,src=pixelate.src||(pixelate.src=document.createElement("canvas"));
 if(src.width!==px.gW||src.height!==px.gH){src.width=px.gW;src.height=px.gH}
 var sx=src.getContext("2d");sx.imageSmoothingEnabled=false;sx.clearRect(0,0,px.gW,px.gH);sx.drawImage(cv,0,0,px.gW,px.gH,0,0,px.gW,px.gH);
 var dw=Math.round(px.cssW*px.dev),dh=Math.round(px.cssH*px.dev),ow=px.gW*px.K,oh=px.gH*px.K;
 var corner=sx.getImageData(1,1,1,1).data;
 cv.width=dw;cv.height=dh;cv.style.width=px.cssW+"px";cv.style.height=px.cssH+"px";cv.style.left="0";cv.style.top="0";cv.style.right="auto";cv.style.bottom="auto";
 c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;
 c.fillStyle="rgb("+corner[0]+","+corner[1]+","+corner[2]+")";c.fillRect(0,0,dw,dh);
 c.drawImage(src,0,0,px.gW,px.gH,0,0,ow,oh);
}
function whoCol(p){return{coat:p.coat||"#3d7ec4",hair:p.hair||"#5a3418",skin:p.skin||"#f0c3a0",pants:p.pants||"#3e4a62"}}
function mix(a,b,t){function p(h){var n=parseInt(String(h).slice(1),16);return [n>>16,(n>>8)&255,n&255]}if(!a||a.charAt(0)!=="#"||!b||b.charAt(0)!=="#")return a||b;var A=p(a),B=p(b);function ch(i){return Math.max(0,Math.min(255,A[i]+(B[i]-A[i])*t)|0)}return "rgb("+ch(0)+","+ch(1)+","+ch(2)+")"}
var MOOD={
 calm:{mute:0,slump:0,gaze:0,eyes:"open",mouth:"soft",tense:0,pack:0,fx:null},
 worried:{mute:.35,slump:.12,gaze:.05,eyes:"wide",mouth:"flat",tense:.9,pack:0,fx:"scribble"},
 overwhelmed:{mute:.45,slump:.72,gaze:.35,eyes:"wide",mouth:"flat",tense:.25,pack:1.45,fx:"scribble"},
 withdrawn:{mute:.55,slump:.95,gaze:1,eyes:"down",mouth:"flat",tense:-.35,pack:0,fx:"cloud"},
 panicked:{mute:.2,slump:0,gaze:0,eyes:"wide",mouth:"open",tense:1.2,pack:0,fx:"scribble",jitter:1},
 exhausted:{mute:.65,slump:1,gaze:.85,eyes:"tired",mouth:"flat",tense:-.25,pack:1.15,fx:"cloud"},
 help:{mute:.05,slump:.02,gaze:0,eyes:"open",mouth:"soft",tense:0,pack:0,fx:null,reach:1},
 breath:{mute:.05,slump:.06,gaze:.1,eyes:"closed",mouth:"soft",tense:0,pack:0,fx:"breath",hand:"chest"},
 support:{mute:-.15,slump:0,gaze:0,eyes:"open",mouth:"smile",tense:0,pack:0,fx:"leaves",warm:1},
 recover:{mute:-.22,slump:0,gaze:0,eyes:"open",mouth:"smile",tense:0,pack:0,fx:"glow",warm:1}
};
function symptomState(id,B){
 if(id==="anx"&&B&&((B.worries|0)>=2||B.hope<=4))return "panicked";
 if(id==="fog")return B&&B.hope<=4?"exhausted":"withdrawn";
 if(id==="ocd")return "overwhelmed";
 if(id==="ptsd")return "withdrawn";
 if(id==="grief"||id==="ed")return "exhausted";
 return "worried"}
function heroState(){
 if(window.OBC_MOOD)return window.OBC_MOOD;
 var api=window.obcWorld3,B=api&&api.B&&api.B();
 if(!B||!B.d)return "calm";
 var br=document.getElementById("b-br");
 if(br&&!br.hidden)return "breath";
 if(B.asking||document.querySelector(".w-pc"))return "help";
 var prog=B.max?(B.d.gentle?(B.max-B.hp)/B.max:1-B.hp/B.max):0;
 if(prog>=.62)return "recover";
 if(prog>=.28)return "support";
 return symptomState(B.id,B)}
function effectOf(state,id){
 if(state==="calm")return null;
 if(state==="breath")return "breath";
 if(state==="help")return null;
 if(state==="recover")return "glow";
 if(state==="support")return "leaves";
 if(id==="ocd")return "foot";
 if(id==="ptsd")return "shadow";
 if(id==="ed")return "pack";
 if(id==="anx"||id==="adhd"||state==="panicked"||state==="worried"||state==="overwhelmed")return "scribble";
 if(id==="fog"||id==="grief"||state==="withdrawn"||state==="exhausted")return "cloud";
 return MOOD[state]&&MOOD[state].fx}
function fxLayer(c,s,name,quiet,t){
 var ang=quiet?0.4:(t||0)/700;
 if(name==="cloud"){c.fillStyle="#c5c8cc";c.beginPath();c.ellipse(0,-62*s,10*s,6*s,0,0,6.283);c.fill();c.beginPath();c.ellipse(-7*s,-58*s,6*s,4*s,0,0,6.283);c.fill();c.fillStyle="#a8adb2";c.beginPath();c.ellipse(6*s,-57*s,5*s,3.5*s,0,0,6.283);c.fill()}
 else if(name==="scribble"){c.strokeStyle="#7d8ea8";c.lineWidth=Math.max(1,1.4*s);c.lineCap="round";for(var i=0;i<3;i++){c.beginPath();var a=ang+i*2.1;c.arc(Math.cos(a)*10*s, -58*s+Math.sin(a)*4*s, 5*s, a, a+1.4);c.stroke()}}
 else if(name==="foot"){c.fillStyle="rgba(90,70,40,.55)";for(var f=0;f<3;f++){var p=quiet?f*.8:(f*.8+ang);c.beginPath();c.ellipse(-8*s-f*7*s, 2*s+Math.sin(p)*2*s, 3.2*s, 1.8*s, -.4, 0, 6.283);c.fill()}}
 else if(name==="shadow"){c.fillStyle="rgba(40,50,40,.28)";c.beginPath();c.ellipse(7*s,1*s,8*s,3*s,0,0,6.283);c.fill();c.fillStyle="rgba(40,50,40,.18)";c.beginPath();c.ellipse(-9*s,3*s,5*s,2*s,.3,0,6.283);c.fill()}
 else if(name==="breath"){c.strokeStyle="rgba(120,170,120,.8)";c.lineWidth=Math.max(1,1.3*s);c.beginPath();c.arc(0,-28*s,quiet?8*s:8*s+Math.sin((t||0)/500)*2*s,Math.PI*.15,Math.PI*.85);c.stroke()}
 else if(name==="leaves"){c.fillStyle="#5eae48";c.beginPath();c.ellipse(-14*s,-50*s,5*s,2.6*s,-.7,0,6.283);c.fill();c.beginPath();c.ellipse(13*s,-44*s,4.2*s,2.2*s,.6,0,6.283);c.fill();c.fillStyle="#c6e86a";c.beginPath();c.ellipse(-14*s,-51*s,2*s,1.2*s,-.7,0,6.283);c.fill()}
 else if(name==="glow"){var hg=c.createRadialGradient(0,-16*s,2*s,0,-18*s,36*s);hg.addColorStop(0,"rgba(255,210,110,.18)");hg.addColorStop(.5,"rgba(255,196,80,.07)");hg.addColorStop(1,"rgba(255,196,80,0)");c.fillStyle=hg;c.beginPath();c.ellipse(0,-16*s,32*s,36*s,0,0,6.283);c.fill();c.strokeStyle="rgba(255,206,100,.30)";c.lineWidth=Math.max(1,1.6*s);c.beginPath();c.ellipse(1*s,2*s,15*s,5*s,0,0,6.283);c.stroke();c.fillStyle="rgba(255,214,120,.5)";for(var p=0;p<5;p++){var pa=quiet?p*1.25:p*1.25+(t||0)/800,px=Math.cos(pa)*20*s,py=-6*s+Math.sin(pa*1.3)*12*s;c.beginPath();c.ellipse(px,py,1.5*s,1*s,pa,0,6.283);c.fill()}}
 else if(name==="pack"){}
}
function chibi(c,x,y,h,o){
 var fit=o.fit!=null?o.fit:(window.OBC_PIX&&window.OBC_PIX.fig?window.OBC_PIX.fig:1);
 var mood=MOOD[o.mood]||MOOD.calm,s=h/58*fit,sw=o.sw||0,dir=o.dir||0,quiet=o.quiet;
 var slump=mood.slump||0,tense=mood.tense||0,jitter=(!quiet&&mood.jitter)?Math.sin((o.t||0)/90)*1.6*s:0;
 c.save();c.translate(x+jitter,y+slump*3*s);if(dir===3)c.scale(-1,1);
 var coat=mix(o.col.coat,"#9a948c",Math.max(0,Math.min(.7,mood.mute)));
 if(mood.warm||mood.mute<0)coat=mix(o.col.coat,"#ffe0a0",mood.warm?.38:.22);
 var skin=mood.warm?mix(o.col.skin,"#ffd0b0",.22):o.col.skin,pants=mix(o.col.pants,"#8a8680",Math.max(0,mood.mute*.6));
 var fx=o.fx||mood.fx;
 if(o.mood==="recover"||o.mood==="support"||fx==="glow")fxLayer(c,s,"glow",quiet,o.t);
 c.fillStyle="rgba(20,36,16,.28)";c.beginPath();c.ellipse(2*s,2*s,12*s,4.2*s,0,0,6.283);c.fill();
 if(mood.fx==="shadow"||o.fx==="shadow")fxLayer(c,s,"shadow",1,0);
 var side=dir>=2,back=dir===1,reach=mood.reach&&!back,chest=mood.hand==="chest"&&!back;
 function limb(px,py,dx,dy,fill){var rad=Math.min(dx,dy)*.4;c.fillStyle=shade(fill,.78);rr(c,px,py+s,dx,dy,rad);c.fill();c.fillStyle=fill;rr(c,px,py,dx,dy*.72,rad);c.fill()}
 var stride=sw*(quiet?0:5)*s;
 limb(-7*s+stride,-14*s,5.2*s,12*s,pants);limb(1.6*s-stride,-14*s,5.2*s,12*s,pants);
 c.fillStyle="#2a241c";rr(c,-8.1*s+stride,-3.4*s,6.8*s,3.6*s,1.6*s);c.fill();rr(c,1.1*s-stride,-3.4*s,6.8*s,3.6*s,1.6*s);c.fill();
 c.fillStyle="#5a5048";rr(c,-7.4*s+stride,-3.2*s,3.1*s,1.5*s,.8*s);c.fill();rr(c,1.7*s-stride,-3.2*s,3.1*s,1.5*s,.8*s);c.fill();
 var pack=mood.pack||0;
 if(pack){var pr=7*s+pack*6*s;c.fillStyle="#4e321c";c.beginPath();c.ellipse(side?5*s:0,-18*s-pack*2*s,pr,pr*1.05,0,0,6.283);c.fill();c.fillStyle="#8a5a32";c.beginPath();c.ellipse(-1*s,-26*s-pack*5*s,pr*.62,pr*.42,-.2,0,6.283);c.fill();c.fillStyle="#d7c4a2";c.fillRect(-pr*.15,-20*s,Math.max(2,pr*.28),pr*1.15)}
 var bw=(side?13:18)+Math.max(0,tense)*4,by=-28*s+slump*7*s-Math.max(0,tense)*4*s,bh=14*s;
 c.fillStyle=shade(coat,.72);rr(c,-bw*s/2+s,by+s,bw*s,bh,7*s);c.fill();
 c.fillStyle=coat;rr(c,-bw*s/2,by,bw*s,bh*.72,7*s);c.fill();
 if(tense>.4&&!back){c.fillStyle=shade(coat,.88);c.beginPath();c.ellipse(-bw*s*.42,by+2*s,4.2*s,2.6*s+tense*s,0,0,6.283);c.fill();if(!side){c.beginPath();c.ellipse(bw*s*.42,by+2*s,4.2*s,2.6*s+tense*s,0,0,6.283);c.fill()}}
 var ay=tense>0?-7*s*Math.min(1,tense):slump*3*s,hand=(!quiet&&tense>.5)?Math.sin((o.t||0)/140)*2*s:0;
 if(!reach){limb(-12*s,by+3*s+ay,5*s,12*s,coat);if(!chest)limb(7*s+hand,by+3*s+ay,5*s,12*s,coat)}
 else limb(-12*s,by+4*s,5*s,11*s,coat);
 c.fillStyle=skin;
 if(!reach){c.beginPath();c.arc(-9.6*s,by+14*s+ay,2.5*s,0,6.283);c.fill();if(!chest){c.beginPath();c.arc(9.6*s+hand,by+14*s+ay,2.5*s,0,6.283);c.fill()}}
 else{c.beginPath();c.arc(-9.6*s,by+14*s,2.5*s,0,6.283);c.fill()}
 if(chest){c.fillStyle=shade(coat,.82);c.beginPath();c.ellipse(1*s,by+7*s,8*s,3.3*s,-.45,0,6.283);c.fill();c.fillStyle=skin;c.beginPath();c.arc(-1*s,by+5.5*s,2.8*s,0,6.283);c.fill()}
 var hr=side?12*s:15*s,headDrop=Math.max(0,slump-.15)*9*s,hy=by-8*s+headDrop;
 c.fillStyle=shade(skin,.82);c.beginPath();c.arc(s,hy+s,hr,0,6.283);c.fill();
 c.fillStyle=skin;c.beginPath();c.arc(0,hy,hr,0,6.283);c.fill();
 c.save();c.beginPath();c.rect(-hr-2*s,hy-hr-4*s,hr*2+4*s,hr*.9);c.clip();c.fillStyle=o.col.hair;c.beginPath();c.arc(0,hy,hr,0,6.283);c.fill();c.restore();
 if(!back){var ey=hy+(mood.eyes==="down"?5*s:mood.gaze*3*s),wide=mood.eyes==="wide",er=wide?2.5*s:1.55*s,ex=side?3*s:-4*s;
  if(mood.eyes!=="closed"){c.fillStyle="#fffdf8";c.beginPath();c.ellipse(ex,ey,er*1.45,wide?er*1.35:er,0,0,6.283);c.fill();if(!side){c.beginPath();c.ellipse(4*s,ey,er*1.45,wide?er*1.35:er,0,0,6.283);c.fill()}
   c.fillStyle="#2a241c";c.beginPath();c.arc(ex+(wide?.4*s:0),ey,er*.72,0,6.283);c.fill();if(!side){c.beginPath();c.arc(4.4*s,ey,er*.72,0,6.283);c.fill()}
   if(wide){c.fillStyle="#fff";c.beginPath();c.arc(ex,ey-er*.45,er*.28,0,6.283);c.fill();if(!side){c.beginPath();c.arc(3.6*s,ey-er*.45,er*.28,0,6.283);c.fill()}}}
  if(mood.eyes==="tired"||mood.eyes==="down"){c.strokeStyle=shade(skin,.62);c.lineWidth=Math.max(1.2,wide?1.2*s:2*s);c.beginPath();c.moveTo(ex-er*1.3,ey-er*.2);c.lineTo(ex+er*1.2,ey+er*.15);if(!side){c.moveTo(2*s,ey-er*.2);c.lineTo(6.2*s,ey+er*.15)}c.stroke()}
  if(mood.eyes==="closed"){c.strokeStyle="#2a241c";c.lineWidth=Math.max(1.2,1.3*s);c.beginPath();c.moveTo(-6.5*s,ey);c.quadraticCurveTo(-4*s,ey+2.4*s,-1.5*s,ey);if(!side){c.moveTo(1.5*s,ey);c.quadraticCurveTo(4*s,ey+2.4*s,6.5*s,ey)}c.stroke()}
  c.strokeStyle=mood.mouth==="smile"?"#c46a5a":"#8a7068";c.lineWidth=Math.max(1.2,1.15*s);c.lineCap="round";
  c.beginPath();var my=hy+6.2*s;if(mood.mouth==="open"){c.fillStyle="#e09088";c.beginPath();c.ellipse(side?2*s:0,my,2.3*s,2.6*s,0,0,6.283);c.fill()}else if(mood.mouth==="flat"){c.moveTo(-3.4*s,my);c.lineTo(3.4*s,my);c.stroke()}else{c.arc(side?2*s:0,my-1.4*s,mood.mouth==="smile"?3.1*s:2.4*s,.15,Math.PI-.15);c.stroke()}
  if(mood.mouth==="smile"||mood.warm){c.fillStyle="rgba(220,110,100,.5)";c.beginPath();c.arc(-6.2*s,hy+3*s,2*s,0,6.283);c.fill();if(!side){c.beginPath();c.arc(6.2*s,hy+3*s,2*s,0,6.283);c.fill()}}}
 if(reach){var ax=hr+1.5*s,top=hy-hr-1*s;limb(ax-2.2*s,top,(by+2*s)-top>0?5*s:5*s,Math.max(8*s,(by+3*s)-top),coat);c.fillStyle=skin;c.beginPath();c.arc(ax+.2*s,top-.4*s,3*s,0,6.283);c.fill();c.beginPath();c.arc(ax-2.2*s,top-2.8*s,1.35*s,0,6.283);c.fill();c.beginPath();c.arc(ax+1.5*s,top-3*s,1.35*s,0,6.283);c.fill()}
 var book=o.book,big=book&&pack;
 if(book&&!reach){c.strokeStyle="#6b4428";c.lineWidth=Math.max(1.4,1.8*s);c.beginPath();c.moveTo(-2*s,by+4*s);c.lineTo(10*s,by+8*s);c.stroke();
  c.fillStyle="#6b4428";rr(c,7*s,by+2*s,big?14*s:10*s,big?16*s:12*s,2*s);c.fill();
  c.fillStyle="#f3e2c4";c.fillRect(9*s,by+4*s,big?8*s:6*s,big?8*s:7*s);c.fillStyle="#a33b3b";c.fillRect(9*s,by+4*s,big?8*s:6*s,2.4*s)}
 if(fx&&fx!=="shadow"&&fx!=="pack"&&fx!=="glow")fxLayer(c,s,fx,quiet,o.t);
 if(o.mood==="recover")fxLayer(c,s,"leaves",1,0);
 c.restore()}
function fig(c,x,y,h,p,t,flip,E){
 var quiet=(E&&E.RM)||still(),dir=p.dir!=null?p.dir:(p.back?1:(flip?3:0));
 var hero=p.who==="hero",state=hero?heroState():"calm",B=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();
 var fx=hero?effectOf(state,B&&B.id):null,mood=MOOD[state]||MOOD.calm;
 var moving=!quiet&&(p.walk||0)>0.2&&(mood.slump||0)<.7,sw=moving?Math.sin((p.walk||0)*1.15):0,bob=moving?Math.abs(sw)*(mood.slump?1.2:3):0;
 if(hero)window.OBC_MOOD_NOW=state;
 chibi(c,x,y-bob,h,{sw:sw,dir:dir,quiet:quiet,t:t,mood:state,fx:fx,book:hero,fit:null,col:whoCol(p)});
 return true}
function moodDraw(c,x,y,h,state){
 chibi(c,x,y,h,{sw:0,dir:0,quiet:true,t:0,mood:state,fx:effectOf(state,""),book:true,fit:1,col:whoCol({who:"hero",coat:"#3d7ec4",hair:"#5a3418",skin:"#f0c3a0",pants:"#3e4a62"})})}
function pet(c,x,y,i,dir,t,E){
 var quiet=(E&&E.RM)||still(),bob=quiet?0:Math.abs(Math.sin((t||0)/180))*2.2,fit=window.OBC_PIX&&window.OBC_PIX.fig?window.OBC_PIX.fig:1;
 c.save();c.translate(x,y);c.scale(fit,fit);c.translate(-x,-y);c.translate(x,y-bob);if(dir===3)c.scale(-1,1);
 c.fillStyle="rgba(20,36,16,.3)";c.beginPath();c.ellipse(2,1,10,3.5,0,0,6.283);c.fill();
 if(!i){var g=c.createRadialGradient(-3,-14,1,0,-8,12);g.addColorStop(0,"#ffd2a4");g.addColorStop(1,"#e0863a");c.fillStyle=g;c.beginPath();c.ellipse(0,-10,10,8,0,0,6.283);c.fill();
  c.fillStyle="#f0a060";c.beginPath();c.moveTo(-8,-14);c.lineTo(-4,-22);c.lineTo(-1,-14);c.fill();c.beginPath();c.moveTo(8,-14);c.lineTo(4,-22);c.lineTo(1,-14);c.fill();
  c.fillStyle="#a82828";c.beginPath();c.ellipse(0,-12,8,5,-.4,0,6.283);c.fill();
  c.fillStyle="#f4e4c8";rr(c,6,-16,7,8,1);c.fill();c.fillStyle="#a82828";c.fillRect(6,-16,7,2);
  c.fillStyle="#2a241c";c.beginPath();c.arc(-3,-12,1.1,0,6.283);c.fill();c.beginPath();c.arc(3,-12,1.1,0,6.283);c.fill()}
 else{var dg=c.createRadialGradient(-4,-12,1,0,-6,14);dg.addColorStop(0,"#f0e2c8");dg.addColorStop(1,i===2?"#6a8a58":"#8a6840");c.fillStyle=dg;c.beginPath();c.ellipse(0,-8,12,8,0,0,6.283);c.fill();
  c.fillStyle=i===2?"#3a6a40":"#2a4a88";c.fillRect(-6,-10,12,3);c.fillStyle="#2a241c";c.beginPath();c.arc(-3,-10,1.1,0,6.283);c.fill();c.beginPath();c.arc(3,-10,1.1,0,6.283);c.fill()}
 c.restore();return true}
function cloud(c,x,y,r,col,t,boss,hap,E){
 var quiet=(E&&E.RM)||still(),bob=quiet?0:Math.sin((t||0)/600)*2,hq=hap===true?1:Math.max(0,Math.min(1,+hap||0));
 var bat=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();if(bat&&boss&&bat.max)hq=Math.max(hq,1-bat.hp/Math.max(1,bat.max));
 var body=mix("#8a919a","#f6f3ec",hq),shadeC=mix("#5c656e","#d5dce4",hq),hi=mix("#c5ccd3","#fffdf8",hq);
 if(hq>.45){body=mix(body,"#fff3d4",(hq-.45)*.7);hi=mix(hi,"#ffe7a8",(hq-.45)*.8)}
 c.save();c.translate(x,y+bob);
 c.fillStyle="rgba(40,48,40,.2)";c.beginPath();c.ellipse(3,r*.46,r*.58,r*.13,0,0,6.283);c.fill();
 if(hq>.3){var glow=c.createRadialGradient(-r*.05,-r*.08,r*.08,0,0,r*1.15);glow.addColorStop(0,"rgba(255,214,130,"+(.04+hq*.16)+")");glow.addColorStop(1,"rgba(255,214,130,0)");c.fillStyle=glow;c.beginPath();c.ellipse(0,-r*.04,r*1.05,r*.72,0,0,6.283);c.fill()}
 function lobe(lx,ly,rx,ry,fill){c.fillStyle=fill;c.beginPath();c.ellipse(lx,ly,rx,ry,0,0,6.283);c.fill()}
 lobe(-r*.34,r*.06,r*.44,r*.3,shadeC);lobe(r*.36,r*.08,r*.4,r*.28,shadeC);lobe(0,r*.02,r*.5,r*.32,shadeC);
 lobe(-r*.28,-r*.06,r*.4,r*.28,body);lobe(r*.28,-r*.02,r*.38,r*.26,body);lobe(0,-r*.18,r*.48,r*.32,body);
 lobe(-r*.1,-r*.26,r*.22,r*.14,hi);
 if(hq<.65){c.strokeStyle="rgba(80,100,120,"+(0.15+0.4*(1-hq))+")";c.lineWidth=Math.max(1,r*.035);c.lineCap="round";var drops=boss?7:4;for(var i=0;i<drops;i++){var dx=(i-(drops-1)/2)*r*.15,dy=r*.32+(i%3)*r*.05,len=r*(.16+.1*(1-hq));c.beginPath();c.moveTo(dx,dy);c.lineTo(dx-r*.04,dy+len);c.stroke()}}
 var eyeY=-r*.02,eyeDX=r*.16,er=Math.max(1.6,r*.075);
 c.fillStyle="#3e3832";c.beginPath();c.ellipse(-eyeDX,eyeY,er*1.2,er*(hq>.55?1.05:.72),0,0,6.283);c.fill();c.beginPath();c.ellipse(eyeDX,eyeY,er*1.2,er*(hq>.55?1.05:.72),0,0,6.283);c.fill();
 c.fillStyle="rgba(255,255,255,.9)";c.beginPath();c.arc(-eyeDX-er*.35,eyeY-er*.35,er*.32,0,6.283);c.fill();c.beginPath();c.arc(eyeDX-er*.35,eyeY-er*.35,er*.32,0,6.283);c.fill();
 c.strokeStyle=mix("#6a5a50","#c47868",hq);c.lineWidth=Math.max(1.25,r*.045);c.lineCap="round";c.beginPath();
 if(hq<.35)c.arc(0,eyeY+r*.18,r*.08,.15*Math.PI,.85*Math.PI,true);
 else if(hq<.7){c.moveTo(-r*.08,eyeY+r*.14);c.quadraticCurveTo(0,eyeY+r*.17,r*.08,eyeY+r*.14)}
 else c.arc(0,eyeY+r*.08,r*.11,.12*Math.PI,.88*Math.PI);
 c.stroke();
 if(hq>.55){c.fillStyle="rgba(255,160,140,"+(.2+(hq-.55)*.7)+")";c.beginPath();c.ellipse(-eyeDX*1.75,eyeY+r*.08,r*.055,r*.035,0,0,6.283);c.fill();c.beginPath();c.ellipse(eyeDX*1.75,eyeY+r*.08,r*.055,r*.035,0,0,6.283);c.fill()}
 c.restore();return true}
window.OBC_COZY={name:"vista",ink:"#5a3a18",bg:"#3eae4c",plate:plate,post:function(){},sp:SP,fx:function(){},live:live,ripple:function(){},margin:margin,ground:ground,frame:function(){},deco:function(){return[]},pixelate:pixelate,nn:true};
window.OBC_CHARS={fig:fig,pet:pet,cloud:cloud,moodDraw:moodDraw,v:"vista"};

})();
