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
