/* Vista look for Wanderer's Quest.
   Original procedural canvas art. No third-party sprites, fonts, audio files,
   or Nintendo characters, names, logos, or UI. License: CC0-style dedication
   by the site authors — reuse freely; this file is the license record.
   Inspired by the feeling of a bright top-down adventure (saturated color,
   soft light, raised ledges). The shapes, palette, and props are new. */
(function(){"use strict";
var keep=/[?&]art=(storybook|diorama|pixel|ink|classic|blend)\b/;
if(keep.test(location.search))return;
document.documentElement.classList.add("vista");
var W=640,H=416,RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
try{if(localStorage.getItem("obcSbCalm")==="1")RM=true}catch(e){}
function still(){return RM||window.OBC_STILL}
function hsh(s){var n=2166136261;for(var i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0}
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function hex(r,g,b){return"#"+((1<<24)|((r&255)<<16)|((g&255)<<8)|(b&255)).toString(16).slice(1)}
function mix(a,b,t){var x=rgb(a),y=rgb(b);return hex(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t)}
function sh(h,k){var c=rgb(h);return hex(Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k))}
var THEME={
 hub:{g:["#4ed25a","#36b648","#78e884"],p:"#e8c56a",d:"#c89840",e:"#2e9440",w:"#4ec8ee"},
 anx:{g:["#c6e86a","#a8d84e","#e4f59a"],p:"#e6d2a4",d:"#c4b07a",e:"#8aaa44",w:"#7ec8e8",cliff:1,face:"#8d8678",cap:"#d9d4c6"},
 ptsd:{g:["#6e8a72","#5a7460","#8aa484"],p:"#b7a48a",d:"#8c7860",e:"#4e6458",w:"#7a78b8",cliff:1,face:"#5c5870",cap:"#b0b4c8"},
 rel:{g:["#46d07a","#2eae62","#7eeca0"],p:"#f0d39a",d:"#d2a86a",e:"#2e9458",w:"#3eb6ea"},
 ocd:{g:["#c4b86a","#a89a4e","#e4d48a"],p:"#e6d2a4",d:"#c4a878",e:"#7a8440",w:"#d8c070"},
 adhd:{g:["#8ef25a","#62d844","#c8ff86"],p:"#f0d878",d:"#d8b050",e:"#46b040",w:"#7ee0ff"},
 ed:{g:["#9ad8c8","#78c4b4","#c8eee4"],p:"#f0e2c0",d:"#d8c4a0",e:"#5ea898",w:"#5ec8dc"},
 grief:{g:["#e2d46a","#c8b84e","#f2ea98"],p:"#f0c878",d:"#d8a050",e:"#a89840",w:"#f0d090"},
 fog:{g:["#8aa8a4","#709490","#b4ccc8"],p:"#c8c0b0",d:"#a09888",e:"#5a7874",w:"#6a9098",cliff:1,face:"#5a686c",cap:"#c5d0d2"},
 castle:{g:["#8ecf78","#6eb860","#d4e6c0"],p:"#e6d8bc",d:"#c4b498",e:"#5a9458",w:"#8ec4d8",cliff:1,face:"#9a9084",cap:"#efe6d8"}
};
function themeOf(s){var k=s.reg||String(s.id||"").replace(/\d+$/,"");if(k==="cross"||k==="woods"||k==="town"||k==="safe")k="hub";if(k==="office")k="castle";return THEME[k]||THEME.hub}
function lay(s){
 var id=s.id||"x",cx=W/2,cy=H*0.62,at=s.at||[0,0];
 var ends=[];
 function nb(dx,dy){var SC=window.obcWorld3&&obcWorld3.SC;if(!SC)return 0;for(var k in SC){var a=SC[k].at;if(a&&a[0]===at[0]+dx&&a[1]===at[1]+dy)return 1}return 0}
 if(nb(-1,0))ends.push([0,cy]);if(nb(1,0))ends.push([W,cy]);if(nb(0,-1))ends.push([cx,48]);if(nb(0,1))ends.push([cx,H]);
 (s.items||[]).forEach(function(o){if(o.t==="house"||o.t==="door")ends.push([o.x,o.y+8])});
 if(!ends.length)ends.push([0,cy],[W,cy]);
 return{c:[cx,cy],ends:ends,seed:hsh(id)}
}
function onPath(L,x,y){
 var best=Math.hypot(L.c[0]-x,(L.c[1]-y)*1.35)-26;
 L.ends.forEach(function(e){
  for(var k=0;k<=16;k++){var t=k/16,px=e[0]*(1-t)+L.c[0]*t,py=e[1]*(1-t)+L.c[1]*t,d=Math.hypot(px-x,py-y);if(d<best)best=d}
 });
 return best<22
}
function plate(s){
 var g=themeOf(s),A=document.createElement("canvas");A.width=W*2;A.height=H*2;var a=A.getContext("2d");
 a.setTransform(2,0,0,2,0,0);
 var L=lay(s),seed=L.seed;
 a.fillStyle=g.g[1];a.fillRect(0,0,W,H);
 for(var i=0;i<70;i++){var x=rnd(seed+i)*W,y=rnd(seed+i*3)*H,rr=18+rnd(seed+i*5)*50;a.fillStyle=g.g[rnd(seed+i*7)<.5?0:2];a.globalAlpha=.55;a.beginPath();a.ellipse(x,y,rr,rr*.72,0,0,6.3);a.fill()}
 a.globalAlpha=1;
 function strokePath(w,col){a.strokeStyle=col;a.lineWidth=w;a.lineCap="round";a.lineJoin="round";L.ends.forEach(function(e){a.beginPath();a.moveTo(e[0],e[1]);a.quadraticCurveTo((e[0]+L.c[0])/2+(rnd(seed+e[0])-.5)*40,(e[1]+L.c[1])/2,L.c[0],L.c[1]);a.stroke()});a.beginPath();a.ellipse(L.c[0],L.c[1],34,24,0,0,6.3);a.fillStyle=col;a.fill()}
 strokePath(54,g.e);strokePath(36,g.d);strokePath(22,g.p);
 for(var f=0;f<40;f++){var fx=rnd(seed+80+f)*W,fy=70+rnd(seed+90+f)*(H-90);if(onPath(L,fx,fy))continue;a.fillStyle=f%3?"#ffd56a":"#ff8fb0";a.fillRect(fx,fy,3,3);a.fillStyle=g.e;a.fillRect(fx+1,fy+3,1,3)}
 (s.w||[]).forEach(function(q){
  a.fillStyle=g.p;a.beginPath();a.ellipse(q[0],q[1],q[2]+10,q[3]+8,0,0,6.3);a.fill();
  a.fillStyle="rgba(20,40,30,.28)";a.beginPath();a.ellipse(q[0]+4,q[1]+5,q[2],q[3],0,0,6.3);a.fill();
  var wg=a.createLinearGradient(q[0],q[1]-q[3],q[0],q[1]+q[3]);wg.addColorStop(0,mix(g.w,"#fff",.45));wg.addColorStop(.5,g.w);wg.addColorStop(1,sh(g.w,.7));
  a.fillStyle=wg;a.beginPath();a.ellipse(q[0],q[1],q[2],q[3],0,0,6.3);a.fill();
  a.fillStyle="rgba(255,255,255,.5)";a.beginPath();a.ellipse(q[0]-q[2]*.3,q[1]-q[3]*.35,q[2]*.3,q[3]*.12,-.2,0,6.3);a.fill();
 });
 if(g.cliff){
  a.fillStyle=g.face;a.fillRect(0,108,W,26);
  a.fillStyle=g.cap;a.fillRect(0,72,W,38);
  a.fillStyle=g.g[0];a.fillRect(0,72,W,8);
  for(var st=0;st<5;st++){a.fillStyle=st%2?g.cap:g.face;a.fillRect(W/2-30,128-st*8,60,10);a.fillStyle="rgba(20,30,20,.25)";a.fillRect(W/2-30+4,136-st*8,60,3)}
  a.fillStyle="rgba(20,30,16,.38)";a.fillRect(4,134,W,12);
 }
 var lg=a.createLinearGradient(0,0,W*.7,H);lg.addColorStop(0,"rgba(255,244,200,.2)");lg.addColorStop(.5,"rgba(255,244,200,0)");a.fillStyle=lg;a.fillRect(0,0,W,H);
 return A
}
function shadow(c,rx){c.fillStyle="rgba(20,40,16,.28)";c.beginPath();c.ellipse(6,3,rx,rx*.28,0,0,6.3);c.fill()}
function blob(c,x,y,rx,ry,col){var g=c.createRadialGradient(x-rx*.3,y-ry*.35,1,x,y,Math.max(rx,ry));g.addColorStop(0,mix(col,"#fff",.28));g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.3);c.fill()}
var SP={
 tree:function(c){shadow(c,26);c.fillStyle="#8a5a32";c.fillRect(-5,-22,10,22);c.strokeStyle="#2a241c";c.lineWidth=2;blob(c,0,-46,28,24,"#2f9a3a");c.stroke();blob(c,-12,-38,16,14,"#46c85a");blob(c,14,-36,14,12,"#1f7a30");c.fillStyle="#ffe56a";c.beginPath();c.arc(-8,-50,3,0,6.3);c.fill()},
 rock:function(c){shadow(c,20);blob(c,2,-16,22,16,"#d8d2c4");blob(c,-6,-20,10,8,"#f4f0e6");c.fillStyle="#8a8478";c.beginPath();c.ellipse(8,-8,6,3,0,0,6.3);c.fill()},
 house:function(c){shadow(c,36);c.fillStyle="#fff6e4";c.fillRect(-34,-48,68,48);c.fillStyle="#e07050";c.beginPath();c.moveTo(-40,-46);c.lineTo(0,-78);c.lineTo(40,-46);c.closePath();c.fill();c.fillStyle="#c45238";c.beginPath();c.moveTo(0,-78);c.lineTo(40,-46);c.lineTo(34,-46);c.lineTo(0,-72);c.closePath();c.fill();
  c.fillStyle="#6a4630";c.fillRect(-8,-26,16,26);c.fillStyle="#f0c24a";c.beginPath();c.arc(4,-14,2,0,6.3);c.fill();
  c.fillStyle="#7ec8f0";c.fillRect(-26,-38,14,12);c.fillRect(14,-38,14,12);c.strokeStyle="#fff";c.lineWidth=1;c.strokeRect(-26,-38,14,12);c.strokeRect(14,-38,14,12);
  c.fillStyle="#f4efe4";c.fillRect(18,-70,10,16);c.fillStyle="#e07050";c.fillRect(16,-74,14,6)},
 sign:function(c){shadow(c,10);c.fillStyle="#8a5a32";c.fillRect(-3,-36,6,36);c.fillStyle="#f4e2b0";c.fillRect(-16,-52,32,18);c.strokeStyle="#6a4630";c.lineWidth=2;c.strokeRect(-16,-52,32,18);c.fillStyle="#6a4630";c.fillRect(-10,-46,8,2);c.fillRect(-10,-41,12,2)},
 lantern:function(c){shadow(c,8);c.fillStyle="#3a342c";c.fillRect(-2,-48,4,48);c.fillStyle="#ffe08a";c.fillRect(-7,-40,14,16);c.fillStyle="#fff6c8";c.fillRect(-3,-36,6,8);var g=c.createRadialGradient(0,-32,2,0,-32,28);g.addColorStop(0,"rgba(255,220,120,.65)");g.addColorStop(1,"rgba(255,220,120,0)");c.fillStyle=g;c.beginPath();c.arc(0,-32,28,0,6.3);c.fill()},
 chest:function(c){shadow(c,16);c.fillStyle="#c4843a";c.fillRect(-16,-22,32,22);c.fillStyle="#e0a44a";c.fillRect(-18,-28,36,10);c.fillStyle="#f4e2b0";c.fillRect(-4,-20,8,8);c.fillStyle="#6a4630";c.fillRect(-1,-16,2,4)},
 chesto:function(c){shadow(c,16);c.fillStyle="#c4843a";c.fillRect(-16,-16,32,16);c.fillStyle="#e0a44a";c.beginPath();c.moveTo(-18,-16);c.lineTo(0,-32);c.lineTo(18,-16);c.closePath();c.fill();c.fillStyle="#fff6c0";c.fillRect(-6,-12,12,6)},
 wall:function(c){shadow(c,24);c.fillStyle="#c8c0b0";c.fillRect(-28,-20,56,20);c.fillStyle="#efe8dc";c.fillRect(-28,-24,56,6);c.strokeStyle="#8a8478";c.lineWidth=1;for(var i=-20;i<24;i+=12){c.strokeRect(i,-18,10,8);c.strokeRect(i+6,-8,10,8)}c.fillStyle="#3ecf55";c.fillRect(-28,-26,56,4)},
 door:function(c){shadow(c,18);c.fillStyle="#8a5a32";c.fillRect(-4,-40,8,40);c.fillStyle="#ffe08a";c.beginPath();c.arc(0,-44,10,0,6.3);c.fill();c.strokeStyle="#f4efe4";c.lineWidth=3;c.beginPath();c.arc(0,-8,16,Math.PI,0);c.stroke()}
};
function fx(){}
function live(c,s,t){
 var T=(t||0)/1000,Lseed=hsh((s&&s.id)||"x");
 c.save();
 if(!still()){
  for(var i=0;i<3;i++){
   var x=80+i*180+Math.sin(T*.2+i)*8;
   var g=c.createLinearGradient(x,0,x+70,H);
   g.addColorStop(0,"rgba(255,244,200,.12)");g.addColorStop(1,"rgba(255,244,200,0)");
   c.fillStyle=g;c.beginPath();c.moveTo(x,0);c.lineTo(x+36,0);c.lineTo(x+90,H);c.lineTo(x+40,H);c.closePath();c.fill();
  }
 }
 if(still()){c.restore();return}
 for(var i=0;i<18;i++){
  var x=(rnd(Lseed+i)*W),y=70+rnd(Lseed+i*9)*(H-90);
  var lean=Math.sin(T*1.6+i)*3;
  c.strokeStyle="#1f7a30";c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+lean,y-6,x+lean*1.4,y-12);c.stroke();
 }
 (s.w||[]).forEach(function(q,n){
  var ph=(T*0.6+n)%1;
  c.globalAlpha=0.35+0.25*Math.sin(T*3+n);
  c.fillStyle="#e8fbff";
  c.fillRect(q[0]-q[2]*0.3+ph*q[2]*0.4,q[1]-2,10,2);
 });
 var api=window.obcWorld3,P=api&&api.P,ph=P?P.ph:0;
 if(P&&!still()){if(Math.abs(ph-(live._p||0))>0.05&&live.d.length<14)live.d.push({x:P.x+(rnd(ph)*10-5),y:P.y,a:1});live._p=ph}
 live.d=live.d.filter(function(q){q.a-=0.04;if(q.a<=0)return false;c.globalAlpha=q.a*.6;c.fillStyle="#f4efe4";c.beginPath();c.ellipse(q.x,q.y,3+ (1-q.a)*4,1.6,0,0,6.3);c.fill();return true});
 c.globalAlpha=1;c.restore();
}
live.d=[];
function ripple(c,s,t){
 if(still())return;
 var T=t/1000;c.save();
 (s.w||[]).forEach(function(q){
  for(var n=0;n<2;n++){
   var ph=(T/2.2+n/2)%1;
   c.globalAlpha=(1-ph)*0.7;c.strokeStyle="#f4fdff";c.lineWidth=2;
   c.beginPath();c.ellipse(q[0],q[1],q[2]*(0.35+0.55*ph),q[3]*(0.35+0.55*ph),0,0,6.3);c.stroke();
  }
 });
 c.restore();
}
function margin(x,tw,th){
 x.fillStyle="#2eae44";x.fillRect(0,0,tw,th);
 x.fillStyle="#3ecf55";
 for(var y=0;y<th;y+=16)for(var i=0;i<tw;i+=16){if(((i*3+y*7)/16|0)%3===0)x.fillRect(i,y,16,16)}
 x.fillStyle="rgba(20,50,16,.18)";x.fillRect(0,0,tw,10);x.fillRect(0,th-10,tw,10);
}
function ground(w,h){
 var A=document.createElement("canvas");A.width=w;A.height=h;var a=A.getContext("2d");
 var g=a.createLinearGradient(0,0,0,h);g.addColorStop(0,"#8fd8ff");g.addColorStop(.45,"#c8f0ff");g.addColorStop(1,"#3ecf55");
 a.fillStyle=g;a.fillRect(0,0,w,h);
 a.fillStyle="#2eae44";a.beginPath();a.moveTo(0,h*.62);a.lineTo(w*.2,h*.5);a.lineTo(w*.45,h*.6);a.lineTo(w*.7,h*.48);a.lineTo(w,h*.58);a.lineTo(w,h);a.lineTo(0,h);a.fill();
 a.fillStyle="rgba(20,40,16,.25)";a.fillRect(0,h*.6,w,8);
 return A
}
function frame(){}
var CAST={amber:{coat:"#3f8f8a",hair:"#c4843a",skin:"#f3d2b3",pants:"#3a4a5a"},abby:{coat:"#6f7a3a",hair:"#2a2420",skin:"#9a6440",pants:"#4a3a2a"},shanna:{coat:"#7a4a8a",hair:"#6a3e1e",skin:"#c68a62",pants:"#3a2a4a"},aspen:{coat:"#4a8a5a",hair:"#e0c070",skin:"#f3d2b3",pants:"#5a4030"},scott:{coat:"#3a4a7a",hair:"#5a3a1e",skin:"#e0ac84",pants:"#3a3a4a"},amanda:{coat:"#c08a3a",hair:"#8a8a92",skin:"#6e4428",pants:"#4a3a3a"},makayla:{coat:"#c9798d",hair:"#3a2414",skin:"#e0ac84",pants:"#5a4a5a"}};
function look(p){var g=CAST[p.who];if(g)return g;return{coat:p.coat||"#c08a3a",hair:p.hair||"#5a3418",skin:p.skin||"#e0ac84",pants:p.pants||"#4a4a6a"}}
function fig(c,x,y,h,p,t,flip,E){
 var d=look(p),dir=p.dir!=null?p.dir:(p.back?1:(flip?3:0)),quiet=(E&&E.RM)||still(),moving=!quiet&&Math.abs(p.walk||0)>0.08;
 var frame=moving?((t/140)|0)%4:0,idle=moving||quiet?0:Math.sin((t||0)/480)*1.5,step=[-3,0,3,0][frame];
 c.save();c.translate(x,y);if(dir===3)c.scale(-1,1);var sc=h/36;c.scale(sc,sc);c.translate(0,idle);
 c.fillStyle="rgba(20,40,16,.32)";c.beginPath();c.ellipse(4,2,9,3.2,0,0,6.3);c.fill();
 c.lineJoin="round";c.lineWidth=1.5;c.strokeStyle="#2a241c";
 function box(x0,y0,w,ht,col){c.fillStyle=col;c.beginPath();if(c.roundRect)c.roundRect(x0,y0,w,ht,3);else c.rect(x0,y0,w,ht);c.fill();c.stroke()}
 function leg(x0,lift){box(x0,-12,4,12-lift,d.pants);c.fillStyle="#5a4030";c.fillRect(x0-.4,-2,4.8,3)}
 if(dir===1){leg(-5,frame%2?0:2);leg(1,frame%2?2:0);box(-8,-28,16,18,sh(d.coat,.82));c.fillStyle=d.hair;c.beginPath();c.arc(0,-34,8,0,6.3);c.fill();c.stroke()}
 else if(dir>=2){leg(-2+step,frame%2?1:0);box(-6,-28,12,18,d.coat);c.fillStyle=mix(d.coat,"#fff",.22);c.fillRect(-4,-24,5,6);c.fillStyle=d.skin;c.beginPath();c.arc(4,-34,7,0,6.3);c.fill();c.stroke();c.fillStyle=d.hair;c.beginPath();c.arc(2,-37,7,Math.PI*1.1,Math.PI*1.9);c.fill();c.fillStyle="#2a241c";c.beginPath();c.arc(8,-34,1.2,0,6.3);c.fill()}
 else{leg(-5+step,0);leg(1-step,0);box(-8,-28,16,18,d.coat);c.fillStyle=mix(d.coat,"#fff",.28);c.beginPath();c.ellipse(-2,-22,5,4,-.4,0,6.3);c.fill();c.fillStyle=d.skin;c.beginPath();c.arc(0,-34,8,0,6.3);c.fill();c.stroke();c.fillStyle=d.hair;c.beginPath();c.arc(0,-37,8.2,Math.PI,0);c.fill();c.fillStyle="#2a241c";c.beginPath();c.arc(-3,-34,1.3,0,6.3);c.arc(3,-34,1.3,0,6.3);c.fill();c.beginPath();c.arc(0,-31,2,.25,2.9);c.stroke()}
 if(p.who==="hero"||!CAST[p.who]){c.fillStyle="#a06a32";c.fillRect(dir>=2?3:-11,-18,7,6);c.strokeRect(dir>=2?3:-11,-18,7,6)}
 c.restore();return true
}
function pet(c,x,y,i,dir,t){
 var quiet=still(),moving=!quiet,frame=moving?((t/160)|0)%2:0;
 c.save();c.translate(x,y);if(dir===3)c.scale(-1,1);
 c.fillStyle="rgba(20,40,16,.3)";c.beginPath();c.ellipse(3,1,8,2.4,0,0,6.3);c.fill();
 c.strokeStyle="#2a241c";c.lineWidth=1.4;c.lineJoin="round";
 var coat=i? "#8a5a32":"#e0903a",body=function(){c.beginPath();c.ellipse(0,-8,9,6,0,0,6.3);c.fill();c.stroke()};
 c.fillStyle=coat;body();
 if(dir!==1){c.fillStyle="#2a241c";c.beginPath();c.arc(dir>=2?5: -3,-9,1.1,0,6.3);if(dir<2)c.arc(3,-9,1.1,0,6.3);c.fill()}
 c.fillStyle=coat;c.beginPath();c.ellipse(dir===1?-2:6,-8,4,3,0,0,6.3);c.fill();c.stroke();
 if(!i){c.fillStyle="#c8322a";c.fillRect(-3,-12,6,4)}
 c.fillStyle="#5a4030";c.fillRect(-4,frame?-2:-1,3,3);c.fillRect(3,frame?-1:-2,3,3);
 c.restore();return true
}
function cloud(c,x,y,r,col,t,boss,hap,E){
 var hq=hap===true?1:(+hap||0),bat=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();
 if(bat&&boss&&bat.max)hq=Math.max(hq,1-bat.hp/Math.max(1,bat.max));
 var quiet=(E&&E.RM)||still(),bob=quiet?0:Math.sin((t||0)/600)*2,body=mix(col||"#8aa0c0","#f7fbff",.2+hq*.6);
 c.save();c.translate(x,y+bob);c.scale(r/26,r/26);
 c.fillStyle="rgba(20,30,40,.28)";c.beginPath();c.ellipse(4,18,16,5,0,0,6.3);c.fill();
 c.fillStyle=body;c.strokeStyle=mix("#2a241c",body,.35);c.lineWidth=2.2;c.beginPath();c.ellipse(0,0,18,12,0,0,6.3);c.ellipse(-12,2,10,8,0,0,6.3);c.ellipse(12,3,10,8,0,0,6.3);c.fill();c.stroke();
 c.fillStyle=mix(body,"#fff",.35);c.beginPath();c.ellipse(-4,-4,8,4,-.4,0,6.3);c.fill();
 if(hq<0.45&&!quiet){c.strokeStyle=mix(col,"#244",.4);c.globalAlpha=.7;c.lineWidth=1.5;for(var i=0;i<3;i++){c.beginPath();c.moveTo(-8+i*8,10);c.lineTo(-10+i*8,16+((t/200+i)%3));c.stroke()}}
 c.globalAlpha=1;c.fillStyle="#2a241c";c.beginPath();c.arc(-5,-1,1.6,0,6.3);c.arc(5,-1,1.6,0,6.3);c.fill();
 c.strokeStyle="#2a241c";c.lineWidth=1.4;c.beginPath();if(hq>=.5)c.arc(0,3,3,.2,2.9);else c.arc(0,6,3,3.4,6.0);c.stroke();
 c.restore();return true
}
window.OBC_COZY={name:"vista",ink:"#214028",bg:"#1c6b38",plate:plate,post:function(){},sp:SP,fx:fx,live:live,ripple:ripple,margin:margin,ground:ground,frame:frame,deco:function(){return[]},nn:false};
window.OBC_CHARS={fig:fig,pet:pet,cloud:cloud,v:"vista"};
})();
