/* Vista look for Wanderer's Quest.
   Original procedural canvas art. No third-party sprites, fonts, audio files,
   or Nintendo characters, names, logos, or UI. License: CC0-style dedication
   by the site authors — reuse freely; this file is the license record.
   Inspired by the feeling of a bright top-down adventure (saturated color,
   soft light, raised ledges). The shapes, palette, and props are new. */
(function(){"use strict";
var keep=/[?&]art=(storybook|diorama|pixel|ink|classic|blend)\b/;
if(keep.test(location.search))return;
var W=640,H=416,RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
try{if(localStorage.getItem("obcSbCalm")==="1")RM=true}catch(e){}
function still(){return RM||window.OBC_STILL}
function hsh(s){var n=2166136261;for(var i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0}
function rnd(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function hex(r,g,b){return"#"+((1<<24)|((r&255)<<16)|((g&255)<<8)|(b&255)).toString(16).slice(1)}
function mix(a,b,t){var x=rgb(a),y=rgb(b);return hex(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t)}
function sh(h,k){var c=rgb(h);return hex(Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k))}
var PAL={
 town:{g:["#3ecf55","#2eae44","#57e06a"],p:"#e6b85a",d:"#c48a3a",w:"#3ec4e8",s:"#f4efe4"},
 cliffs:{g:["#7ecf6a","#62b856","#a4e090"],p:"#d8c4a0",d:"#b09878",w:"#5ec8e0",s:"#efe6d4"},
 marsh:{g:["#3aaa78","#2e9468","#54c48c"],p:"#c8b07a",d:"#a08858",w:"#2eb8d8",s:"#e8f6ea"},
 castle:{g:["#62c878","#4eb468","#86d890"],p:"#e8d09a",d:"#c4a46a",w:"#4ec0e4",s:"#f7f1e4"}
};
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
 var g=PAL[s.g]||PAL.town,A=document.createElement("canvas");A.width=W*2;A.height=H*2;var a=A.getContext("2d");
 a.setTransform(2,0,0,2,0,0);a.imageSmoothingEnabled=false;
 var u=16,L=lay(s),seed=L.seed;
 for(var y=0;y<H;y+=u)for(var x=0;x<W;x+=u){
  var n=rnd(seed+x*3+y*17),col=g.g[n<.62?0:n<.9?1:2];
  if(onPath(L,x+8,y+8))col=n<.5?g.p:g.d;
  a.fillStyle=col;a.fillRect(x,y,u+0.5,u+0.5);
  if(!onPath(L,x+8,y+8)&&n>0.82&&y>56){a.fillStyle=n>0.93?"#ffe56a":"#ff8fb0";a.fillRect(x+6,y+7,3,3);a.fillStyle="#2f8a32";a.fillRect(x+7,y+10,1,3)}
 }
 (s.w||[]).forEach(function(q){
  a.fillStyle="#1e88b0";a.beginPath();a.ellipse(q[0]+3,q[1]+4,q[2]+2,q[3]+2,0,0,6.3);a.fill();
  var wg=a.createLinearGradient(q[0],q[1]-q[3],q[0],q[1]+q[3]);wg.addColorStop(0,"#b8f4ff");wg.addColorStop(0.45,"#3ec8ee");wg.addColorStop(1,"#1a78b0");
  a.fillStyle=wg;a.beginPath();a.ellipse(q[0],q[1],q[2],q[3],0,0,6.3);a.fill();
  a.fillStyle="rgba(255,255,255,.55)";a.beginPath();a.ellipse(q[0]-q[2]*.35,q[1]-q[3]*.35,q[2]*.28,q[3]*.12,-.2,0,6.3);a.fill();
 });
 /* raised north ledge: a grass cap, a shaded face, and a cast shadow. Gap where a path leaves north. */
 var gap=false;L.ends.forEach(function(e){if(e[1]<60)gap=true});
 a.fillStyle=sh(g.g[1],.55);a.fillRect(0,46,W,16);
 a.fillStyle=g.g[2];a.fillRect(0,28,W,18);
 if(gap){a.fillStyle=g.p;a.fillRect(W/2-36,28,72,34)}
 a.fillStyle="rgba(30,50,20,.28)";a.fillRect(0,62,W,8);
 /* side hedges read as low cliffs */
 a.fillStyle=sh(g.g[0],.7);a.fillRect(0,70,18,H-90);a.fillRect(W-18,70,18,H-90);
 a.fillStyle=g.s;a.fillRect(0,70,18,6);a.fillRect(W-18,70,18,6);
 a.fillStyle="rgba(20,40,16,.22)";a.fillRect(18,76,8,H-96);a.fillRect(W-26,76,8,H-96);
 /* soft light from the upper left, baked once */
 var lg=a.createLinearGradient(0,0,W,H);lg.addColorStop(0,"rgba(255,244,200,.22)");lg.addColorStop(.45,"rgba(255,244,200,0)");lg.addColorStop(1,"rgba(40,80,40,.08)");
 a.fillStyle=lg;a.fillRect(0,0,W,H);
 return A
}
function shadow(c,rx){c.fillStyle="rgba(20,40,16,.28)";c.beginPath();c.ellipse(6,3,rx,rx*.28,0,0,6.3);c.fill()}
function blob(c,x,y,rx,ry,col){var g=c.createRadialGradient(x-rx*.3,y-ry*.35,1,x,y,Math.max(rx,ry));g.addColorStop(0,mix(col,"#fff",.28));g.addColorStop(1,col);c.fillStyle=g;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.3);c.fill()}
var SP={
 tree:function(c){shadow(c,22);c.fillStyle="#8a5a32";c.fillRect(-5,-18,10,18);blob(c,0,-36,26,22,"#2f9a3a");blob(c,-10,-30,16,14,"#46c85a");blob(c,12,-28,14,12,"#1f7a30");c.fillStyle="#ffe56a";c.beginPath();c.arc(-6,-40,3,0,6.3);c.fill()},
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
 c.restore();
}
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
window.OBC_COZY={name:"vista",ink:"#214028",bg:"#1c6b38",plate:plate,post:function(){},sp:SP,fx:fx,live:live,ripple:ripple,margin:margin,ground:ground,frame:frame,deco:function(){return[]},nn:false};
})();
