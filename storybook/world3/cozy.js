/* cozy art modes: three complete "library meets mountain cabin" looks for the whole game.
   ?art=storybook | ?art=diorama | ?art=pixel (or localStorage obc_art). Original art drawn in code. */
(function(){"use strict";
var MODES={storybook:1,diorama:1,pixel:1},qm=location.search.match(/[?&]art=([a-z]+)/),M=null;
if(qm){if(MODES[qm[1]])M=qm[1]}else{var ls=null;try{ls=localStorage.getItem("obc_art");if(MODES[ls])M=ls}catch(e){}if(!M&&!ls&&MODES[window.OBC_COZY_FORCE])M=window.OBC_COZY_FORCE}
if(!M)return;
document.documentElement.classList.add("cozy","cozy-"+M);
var RM=matchMedia("(prefers-reduced-motion: reduce)").matches,SB=M==="storybook",DI=M==="diorama",PX=M==="pixel";
var W=640,H=416;
/* ---------- small helpers ---------- */
function mk(w,h){var e=document.createElement("canvas");e.width=Math.max(1,Math.ceil(w));e.height=Math.max(1,Math.ceil(h));return e}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function toHex(r,g,b){return"#"+((1<<24)+((Math.max(0,Math.min(255,r))|0)<<16)+((Math.max(0,Math.min(255,g))|0)<<8)+(Math.max(0,Math.min(255,b))|0)).toString(16).slice(1)}
function sh(h,k){var c=rgb(h);if(k<1)return toHex(c[0]*k,c[1]*k,c[2]*k);return toHex(c[0]+(255-c[0])*(k-1),c[1]+(255-c[1])*(k-1),c[2]+(255-c[2])*(k-1))}
function mix(a,b,t){var x=rgb(a),y=rgb(b);return toHex(x[0]+(y[0]-x[0])*t,x[1]+(y[1]-x[1])*t,x[2]+(y[2]-x[2])*t)}
function rgba(h,a){var c=rgb(h);return"rgba("+c[0]+","+c[1]+","+c[2]+","+a+")"}
function seeded(s){s=(s|0)||1;return function(){s=(s*16807)%2147483647;return(s-1)/2147483646}}
function hsh(str){var s=7;for(var i=0;i<str.length;i++)s=(s*31+str.charCodeAt(i))%1000003;return s}
function rn(i){var x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)}
function ts(c){var m=c.getTransform?c.getTransform():null;return m?Math.hypot(m.a,m.b):2}
function zb(z){return Math.pow(2,Math.round(Math.log(Math.max(.5,Math.min(14,z)))/Math.LN2*3)/3)}
/* sprite cache: characters and clouds are painted once per pose frame and zoom bucket, then blitted */
var SC={},SCN=0;function cached(key,w,h,k,draw){var e=SC[key];if(e)return e;if(SCN>520){SC={};SCN=0}var cv=mk(w*k,h*k),x=cv.getContext("2d");x.scale(k,k);x.lineJoin="round";x.lineCap="round";draw(x);if(PX)pixelize(cv);SC[key]=cv;SCN++;return cv}
/* pixel mode: snap a low-res sprite to hard alpha, a reduced palette and a 1px selective outline */
function pixelize(cv){var x=cv.getContext("2d"),w=cv.width,h=cv.height,d=x.getImageData(0,0,w,h),p=d.data,i,a=new Uint8Array(w*h);
 for(i=0;i<w*h;i++){var al=p[i*4+3];if(al<110){p[i*4+3]=0;a[i]=0}else{a[i]=1;var f=255/al;p[i*4]=Math.min(255,p[i*4]*(al<250?f:1));p[i*4+1]=Math.min(255,p[i*4+1]*(al<250?f:1));p[i*4+2]=Math.min(255,p[i*4+2]*(al<250?f:1));p[i*4+3]=255;
  for(var ch=0;ch<3;ch++)p[i*4+ch]=Math.round(p[i*4+ch]/24)*24}}
 for(var y=0;y<h;y++)for(var xx=0;xx<w;xx++){i=y*w+xx;if(a[i])continue;var n=-1;if(xx>0&&a[i-1])n=i-1;else if(xx<w-1&&a[i+1])n=i+1;else if(y>0&&a[i-w])n=i-w;else if(y<h-1&&a[i+w])n=i+w;if(n<0)continue;
  p[i*4]=p[n*4]*.32+10;p[i*4+1]=p[n*4+1]*.28+6;p[i*4+2]=p[n*4+2]*.3+12;p[i*4+3]=255}
 x.putImageData(d,0,0)}
function blit(c,cv,x,y,ax,ay,s,flip){c.save();if(PX)c.imageSmoothingEnabled=false;c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(cv,-ax*s,-ay*s,cv.width/cv.k*s,cv.height/cv.k*s);c.restore()}
/* paper / grain textures */
var GR=null;function grain(c){if(!GR){var g=mk(96,96),x=g.getContext("2d"),r=seeded(9);for(var i=0;i<900;i++){x.fillStyle=r()<.5?"rgba(80,50,20,"+(r()*.35)+")":"rgba(255,250,235,"+(r()*.4)+")";x.fillRect(r()*96,r()*96,1+r()*1.5,1+r()*1.5)}GR=g}return c.createPattern(GR,"repeat")}
/* ---------- palettes ---------- */
var OUT=SB?"#4a3222":DI?"#3a2a22":"#2a1a22";
var GD={makayla:{coat:"#c9798d",hair:"#3a2414",skin:"#e0ac84",hs:"bun",prop:"book",acc:"#f2e2b0",pants:"#5a4a5a",cut:"cardi"},
amber:{coat:"#3f8f8a",hair:"#a8682c",skin:"#f3d2b3",hs:"bob",prop:"mug",acc:"#e8a33a",pants:"#3a4a5a",cut:"tunic"},
abby:{coat:"#6f7a3a",hair:"#1e1a1a",skin:"#9a6440",hs:"curly",prop:"lantern",acc:"#c8322a",pants:"#4a3a2a",cut:"parka"},
shanna:{coat:"#7a4a8a",hair:"#6a3e1e",skin:"#c68a62",hs:"long",prop:"umbrella",acc:"#e8c070",pants:"#3a2a4a",cut:"cardi"},
aspen:{coat:"#4a8a5a",hair:"#d8b060",skin:"#f3d2b3",hs:"cap",prop:"pack",acc:"#c8602a",pants:"#5a4030",cut:"parka"},
scott:{coat:"#3a4a7a",hair:"#5a3a1e",skin:"#e0ac84",hs:"short",prop:"staff",acc:"#a0703a",pants:"#3a3a4a",cut:"flannel"},
amanda:{coat:"#c08a3a",hair:"#7a7a82",skin:"#6e4428",hs:"wavy",prop:"flowers",acc:"#7a3a5a",pants:"#4a3a3a",cut:"poncho"}};
function spec(p){var g=GD[p.who];if(g)return g;var hero=p.who==="hero",b=(p.body|0)%3,sd=(p.seed||0)|0;
 return{coat:p.coat||"#7a6a5a",hair:p.hair||"#4a3020",skin:p.skin||"#e0ac84",hs:hero?["short","long","pig"][b]:["short","bob","long","curly","bun","cap"][sd%6],prop:hero?"satchel":["","basket","","hoe","",""][(p.acc||0)%6],acc:p.acc2||"#c9a24a",pants:p.pants||"#4a4a6a",cut:hero?["flannel","tunic","cardi"][b]:["flannel","tunic","parka","cardi","tunic","parka"][sd%6],hero:hero}}
/* ---------- the three paint models: one shape, three finishes ---------- */
function paint(c,path,col,b,o){o=o||{};var cx=b[0],cy=b[1],rx=b[2],ry=b[3];c.beginPath();path();
 if(SB){var g=c.createLinearGradient(cx-rx,cy-ry,cx+rx*.6,cy+ry);g.addColorStop(0,sh(col,1.16));g.addColorStop(.55,col);g.addColorStop(1,sh(col,.78));c.fillStyle=g;c.fill();
  if(!o.noLine){c.strokeStyle=rgba(OUT,.92);c.lineWidth=(o.lw||1.15)*1.65;c.stroke()}
  c.save();c.clip();c.globalAlpha=.16;c.fillStyle=grain(c);c.fillRect(cx-rx-2,cy-ry-2,rx*2+4,ry*2+4);c.globalAlpha=1;
  if(!o.flat){c.fillStyle=rgba("#fff6e0",.22);c.beginPath();c.ellipse(cx-rx*.45,cy-ry*.5,rx*.5,ry*.35,-.5,0,6.283);c.fill()}c.restore()}
 else if(DI){var r0=Math.max(rx,ry),g2=c.createRadialGradient(cx-rx*.38,cy-ry*.48,0,cx,cy,r0*1.25);g2.addColorStop(0,sh(col,1.38));g2.addColorStop(.42,col);g2.addColorStop(1,sh(col,.55));c.fillStyle=g2;c.fill();
  if(o.gloss!==0){c.fillStyle="rgba(255,255,255,"+(o.gloss||.28)+")";c.beginPath();c.ellipse(cx-rx*.42,cy-ry*.55,Math.max(.6,rx*.22),Math.max(.5,ry*.14),-.6,0,6.283);c.fill()}
  if(o.rim!==0){c.save();c.beginPath();path();c.clip();c.strokeStyle="rgba(255,210,150,.35)";c.lineWidth=1.4;c.beginPath();c.ellipse(cx+rx*.15,cy+ry*.1,rx,ry,0,-.4,1.1);c.stroke();c.restore()}}
 else{c.fillStyle=col;c.fill();c.save();c.clip();c.fillStyle=sh(col,.7);c.fillRect(cx+rx*.38,cy-ry-1,rx*2,ry*2+2);c.fillRect(cx-rx-1,cy+ry*.55,rx*2+2,ry);c.fillStyle=sh(col,1.22);c.fillRect(cx-rx-1,cy-ry-1,rx*.55,ry*.6);c.restore()}}
function limb(c,x0,y0,x1,y1,w,col){c.lineCap="round";if(SB){c.strokeStyle=rgba(OUT,.92);c.lineWidth=w+3.3;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke()}
 c.strokeStyle=DI?sh(col,.8):col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
 c.strokeStyle=sh(col,DI?1.3:1.14);c.lineWidth=w*.38;c.beginPath();c.moveTo(x0-w*.18,y0-w*.1);c.lineTo(x1-w*.18,y1-w*.1);c.stroke()}
function ell(cx,cy,rx,ry,c){return function(){c.moveTo(cx+rx,cy);c.ellipse(cx,cy,rx,ry,0,0,6.283)}}
/* body plan per style: storybook is slender and painted, diorama is a chunky clay toy, pixel is compact */
var F=SB?{hr:13.6,hy:-46.5,sh:-32.5,hip:-14,tw:9.4,ew:2.7,eh:3.4}:DI?{hr:13.8,hy:-44,sh:-29,hip:-12.5,tw:10.5,ew:2.5,eh:3.1}:{hr:12.2,hy:-44,sh:-30.5,hip:-13.5,tw:9.6,ew:2.2,eh:2.8};
function hairBack(c,d,r){var hy=F.hy,hr=F.hr,col=d.hair;
 if(d.hs==="long"||d.hs==="wavy"){var L=d.hs==="wavy"?6:0;paint(c,function(){c.moveTo(-hr-1,hy);c.quadraticCurveTo(-hr-3-L*.3,hy+16,-hr+1+r.sw*.6,F.sh+12);c.lineTo(hr-1+r.sw*.6,F.sh+12);c.quadraticCurveTo(hr+3+L*.3,hy+16,hr+1,hy);c.closePath()},col,[0,hy+10,hr+2,14])}
 if(d.hs==="pig"){for(var s=-1;s<=1;s+=2){var px=s*(hr+3),py=hy+5+Math.abs(r.sw)*.4;paint(c,ell(px,py+5,3.6,6.5,c),col,[px,py+5,3.6,6.5]);paint(c,ell(px,py-1.5,2.2,1.6,c),d.acc,[px,py-1.5,2.2,1.6],{flat:1})}}
 if(d.hs==="bun")paint(c,ell(0,hy-hr-1.5,5.2,4.6,c),col,[0,hy-hr-1.5,5.2,4.6])}
function hairFront(c,d,r,back){var hy=F.hy,hr=F.hr,col=d.hair,i;
 if(back){paint(c,function(){c.arc(0,hy,hr+.8,0,6.283)},col,[0,hy,hr,hr]);if(d.hs==="cap")beanie(c,d,hy,hr);return}
 switch(d.hs){
 case"curly":for(i=0;i<9;i++){var a=Math.PI*(1.02+i*.12),cx=Math.cos(a)*(hr-.5),cy=hy+Math.sin(a)*(hr-.5);paint(c,ell(cx,cy,4.2,4,c),col,[cx,cy,4.2,4],{gloss:.15})}break;
 case"cap":beanie(c,d,hy,hr);paint(c,function(){c.moveTo(-hr,hy-1);c.quadraticCurveTo(-hr-1.5,hy+5,-hr+2.5,hy+6);c.lineTo(-hr+3,hy-1);c.closePath();c.moveTo(hr,hy-1);c.quadraticCurveTo(hr+1.5,hy+5,hr-2.5,hy+6);c.lineTo(hr-3,hy-1);c.closePath()},col,[0,hy+2,hr,4]);break;
 default:paint(c,function(){c.moveTo(-hr-1,hy+(d.hs==="bob"||d.hs==="long"||d.hs==="wavy"?7:1));c.arc(0,hy,hr+1,Math.PI*1.02,Math.PI*1.98);c.lineTo(hr+1,hy+(d.hs==="bob"||d.hs==="long"||d.hs==="wavy"?7:1));
  c.quadraticCurveTo(hr-2,hy-2,hr-4,hy-4.5);c.quadraticCurveTo(hr*.35,hy-1.5,hr*.1,hy-5.5);c.quadraticCurveTo(-hr*.25,hy-1.5,-hr*.7,hy-4.5);c.quadraticCurveTo(-hr+1.5,hy-2,-hr-1,hy+1);c.closePath()},col,[0,hy-hr*.4,hr+1,hr*.7]);
  if(d.hs==="short"&&!SB){}}
}
function beanie(c,d,hy,hr){var col=d.acc;paint(c,function(){c.moveTo(-hr-1,hy-2);c.arc(0,hy-1,hr+1,Math.PI,0);c.closePath()},col,[0,hy-hr*.5,hr,hr*.5]);
 paint(c,function(){c.rect(-hr-1.5,hy-3.5,hr*2+3,4)},sh(col,.82),[0,hy-1.5,hr,2],{flat:1});c.strokeStyle=rgba(sh(col,.6),.6);c.lineWidth=.6;for(var k=-hr;k<hr;k+=2.4){c.beginPath();c.moveTo(k,hy-3.3);c.lineTo(k,hy+.3);c.stroke()}
 paint(c,ell(0,hy-hr-2.4,3.4,3.2,c),"#f4ead6",[0,hy-hr-2.4,3.4,3.2])}
function face(c,d,r){var hy=F.hy,ew=F.ew,eh=F.eh,ex=SB?5.2:DI?5:4.4,ey=hy+1.6;
 if(r.blink){c.strokeStyle="#2a1a14";c.lineWidth=1.1;for(var s=-1;s<=1;s+=2){c.beginPath();c.moveTo(s*ex-ew,ey+.3);c.quadraticCurveTo(s*ex,ey+1.3,s*ex+ew,ey+.3);c.stroke()}}
 else for(var s2=-1;s2<=1;s2+=2){c.fillStyle="#2a1a16";c.beginPath();c.ellipse(s2*ex,ey,ew,eh,0,0,6.283);c.fill();if(!PX){c.fillStyle=DI?"#5a3a2a":"#4a2e22";c.beginPath();c.ellipse(s2*ex,ey+eh*.35,ew*.7,eh*.45,0,0,6.283);c.fill()}
  c.fillStyle="#fff";c.beginPath();c.arc(s2*ex-ew*.35,ey-eh*.42,PX?.9:Math.max(.6,ew*.42),0,6.283);c.fill();if(!PX){c.beginPath();c.arc(s2*ex+ew*.35,ey+eh*.3,ew*.18,0,6.283);c.fill()}}
 c.strokeStyle=rgba(sh(d.hair,.7),.9);c.lineWidth=1;for(var s3=-1;s3<=1;s3+=2){c.beginPath();c.moveTo(s3*(ex-2),ey-eh-1.6);c.quadraticCurveTo(s3*ex,ey-eh-2.5,s3*(ex+2),ey-eh-1.4);c.stroke()}
 c.fillStyle=rgba("#e86a6a",PX?.6:.38);c.beginPath();c.ellipse(-ex-2.4,ey+3.4,2.4,1.5,0,0,6.283);c.ellipse(ex+2.4,ey+3.4,2.4,1.5,0,0,6.283);c.fill();
 c.strokeStyle="#5a2a1e";c.lineWidth=1.05;c.beginPath();var mw=SB?2.8:1.8;c.lineWidth=SB?1.5:1.05;c.moveTo(-mw,ey+5.2);c.quadraticCurveTo(0,ey+5.4+mw,mw,ey+5.2);c.stroke();
 if(SB){c.fillStyle=rgba(sh(d.skin,.75),.7);c.beginPath();c.arc(.4,ey+3,.7,0,6.283);c.fill()}}
function torso(c,d,r){var S=F.sh+r.br,hp=F.hip,tw=F.tw,col=d.coat,cut=d.cut,hem=cut==="tunic"?hp+5:cut==="cardi"||cut==="parka"?hp+3:cut==="poncho"?hp+1:hp+1.5,hw=cut==="tunic"?tw+3.4:cut==="poncho"?tw+4:tw+.8;
 var body=function(){c.moveTo(-tw+1.5,S-1);c.quadraticCurveTo(-tw-1,S,-tw-.4,S+5);c.lineTo(-hw,hem);c.quadraticCurveTo(0,hem+1.8,hw,hem);c.lineTo(tw+.4,S+5);c.quadraticCurveTo(tw+1,S,tw-1.5,S-1);c.closePath()};
 paint(c,body,col,[0,(S+hem)/2,hw,(hem-S)/2]);
 c.save();c.beginPath();body();c.clip();
 if(cut==="flannel"){c.strokeStyle=rgba(sh(col,.62),.55);c.lineWidth=1.3;for(var k=-14;k<16;k+=4.5){c.beginPath();c.moveTo(k,S-2);c.lineTo(k,hem+2);c.stroke()}c.lineWidth=1;for(var j=S+2;j<hem;j+=4.5){c.beginPath();c.moveTo(-16,j);c.lineTo(16,j);c.stroke()}}
 else if(cut==="cardi"||cut==="tunic"){c.strokeStyle=rgba(sh(col,1.25),.5);c.lineWidth=.9;for(var k2=-6;k2<=6;k2+=6){c.beginPath();for(var j2=S+2;j2<hem;j2+=2.4){c.moveTo(k2-1.1,j2);c.lineTo(k2,j2+1.2);c.lineTo(k2+1.1,j2)}c.stroke()}}
 else if(cut==="parka"){c.strokeStyle=rgba(sh(col,.66),.6);c.lineWidth=1;for(var j3=S+4;j3<hem;j3+=4.2){c.beginPath();c.moveTo(-15,j3);c.quadraticCurveTo(0,j3+1.4,15,j3);c.stroke()}}
 else if(cut==="poncho"){c.strokeStyle=rgba(d.acc,.85);c.lineWidth=1.6;c.beginPath();c.moveTo(-hw,hem-3);c.lineTo(-hw*.5,hem-6);c.lineTo(0,hem-3);c.lineTo(hw*.5,hem-6);c.lineTo(hw,hem-3);c.stroke()}
 c.fillStyle=sh(col,.78);c.fillRect(-hw-1,hem-2.2,hw*2+2,3);
 if(cut==="cardi"){c.strokeStyle=rgba(sh(col,.6),.8);c.lineWidth=1;c.beginPath();c.moveTo(0,S+1);c.lineTo(0,hem);c.stroke();c.fillStyle="#f4e6c4";for(var b=S+5;b<hem-2;b+=4.5){c.beginPath();c.arc(1.4,b,.8,0,6.283);c.fill()}}
 c.restore();
 /* knit scarf: the cozy signature */
 var sc=d.hero?d.acc==="#a0703a"?"#b8463a":d.acc:d.acc;paint(c,function(){c.moveTo(-tw+.5,S-2.5);c.quadraticCurveTo(0,S+3,tw-.5,S-2.5);c.lineTo(tw-1,S+1.2);c.quadraticCurveTo(0,S+6,-tw+1,S+1.2);c.closePath()},sc,[0,S+1,tw,3]);
 if(!r.back){var tx=3.5+r.sw*.6;paint(c,function(){c.moveTo(tx-1.5,S+2);c.lineTo(tx+2.6,S+2);c.lineTo(tx+3.4+r.sw,S+11);c.lineTo(tx+.2+r.sw,S+11.6);c.closePath()},sc,[tx+1,S+7,2.4,5]);c.fillStyle="#f4e6c4";c.fillRect(tx+r.sw+.2,S+10.2,3.4,1.3)}}
function legs(c,d,r){var hp=F.hip,wk=r.wk,boot=SB?"#6a4428":DI?"#7a4a2e":"#6a4024",lz=Math.max(0,wk)*3.2,rz=Math.max(0,-wk)*3.2;
 for(var s=-1;s<=1;s+=2){var lift=s<0?lz:rz,x=s*4.3+(s<0?wk:-wk)*1.4;limb(c,s*3.8,hp,x,-3.4-lift,DI?6.2:5.4,d.pants);
  paint(c,ell(x+s*.6,-2.2-lift,DI?4.6:4.1,DI?3.1:2.6,c),boot,[x+s*.6,-2.2-lift,4.1,2.6],{gloss:.35});c.fillStyle=SB?"#efe2c6":"#f2e6cc";c.fillRect(x-2.8,-5.8-lift,5.6,1.6)}}
function arms(c,d,r,back){var S=F.sh+r.br+2,tw=F.tw,wk=r.wk,i;
 for(var s=-1;s<=1;s+=2){var sw=(s<0?-wk:wk)*.42+r.sw*.05,ang=s*.22+sw,L=DI?13:14.5,hx=s*(tw+.6)+Math.sin(ang)*L,hy=S+Math.cos(ang)*L;
  if(!back&&s>0&&d.prop&&d.prop!=="satchel"&&d.prop!=="pack"){hx=tw-1.6;hy=S+9.5}
  limb(c,s*(tw-.8),S,hx,hy,DI?5.6:4.6,d.coat);c.fillStyle=sh(d.coat,.78);c.beginPath();c.arc(hx,hy,2.3,0,6.283);c.fill();
  paint(c,ell(hx,hy+1.3,DI?2.6:2.2,DI?2.6:2.2,c),d.skin,[hx,hy+1.3,2.2,2.2],{gloss:.2,lw:.9})}}
function propDraw(c,d,r,back){var a=d.acc,T=r.T,tw=F.tw,S=F.sh+r.br+2;if(back&&d.prop!=="satchel"&&d.prop!=="pack")return;var hx=tw-1.6,hy=S+11;
 switch(d.prop){
 case"satchel":if(!back){c.strokeStyle=SB?rgba(OUT,.9):"#5a3a1e";c.lineWidth=1.6;c.beginPath();c.moveTo(-tw+1.5,S-3.5);c.lineTo(tw-2,F.hip-1);c.stroke();c.strokeStyle="#8a5a2e";c.lineWidth=1;c.beginPath();c.moveTo(-tw+1.5,S-3.5);c.lineTo(tw-2,F.hip-1);c.stroke()}
  paint(c,function(){c.rect(tw-5.5,F.hip-4,9,7.5)},"#9a6234",[tw-1,F.hip,4.5,3.8]);c.fillStyle="#e8c06a";c.fillRect(tw-1.8,F.hip-1,2,2);
  /* a tiny storybook peeking out of the satchel */c.fillStyle="#b8463a";c.fillRect(tw-4.4,F.hip-6,3.2,2.6);c.fillStyle="#f4e6c4";c.fillRect(tw-4.4,F.hip-6,3.2,.8);break;
 case"book":c.save();c.translate(hx+1,hy-4);c.rotate(-.18);paint(c,function(){c.rect(-4.5,-5.5,9,11)},"#b8463a",[0,0,4.5,5.5]);c.fillStyle="#f4e6c4";c.fillRect(-4.5,4,9,1.4);c.fillStyle="#e8c06a";c.fillRect(-1,-5.5,2,11);c.restore();break;
 case"mug":paint(c,function(){c.rect(hx-2,hy-6.5,6.5,7)},"#f4ead2",[hx+1,hy-3,3.2,3.5]);c.strokeStyle=SB?OUT:"#8a6a4a";c.lineWidth=1;c.beginPath();c.arc(hx+5,hy-3,2,-1.4,1.4);c.stroke();c.fillStyle=a;c.fillRect(hx-2,hy-4.5,6.5,1.6);
  if(!RM){c.strokeStyle="rgba(255,255,255,.55)";c.lineWidth=.9;for(var i=0;i<2;i++){var o=Math.sin(T/320+i)*1.4;c.beginPath();c.moveTo(hx+i*2,hy-7.5);c.quadraticCurveTo(hx-1+i*2+o,hy-11,hx+1+i*2,hy-14);c.stroke()}}break;
 case"lantern":c.strokeStyle="#3a2a1a";c.lineWidth=.9;c.beginPath();c.moveTo(hx+1,hy-2);c.lineTo(hx+1,hy+2);c.stroke();var gg=c.createRadialGradient(hx+1,hy+6,0,hx+1,hy+6,12);gg.addColorStop(0,"rgba(255,214,120,.55)");gg.addColorStop(1,"rgba(255,214,120,0)");c.fillStyle=gg;c.fillRect(hx-11,hy-6,24,24);
  paint(c,function(){c.rect(hx-2.2,hy+2,6.4,8)},"#f4c058",[hx+1,hy+6,3.2,4],{gloss:.5});c.fillStyle="#3a2a1a";c.fillRect(hx-2.8,hy+1,7.6,1.4);c.fillRect(hx-2.8,hy+9.6,7.6,1.4);break;
 case"umbrella":c.strokeStyle="#4a3020";c.lineWidth=1.2;c.beginPath();c.moveTo(hx+1,hy+8);c.lineTo(hx+1,hy-22);c.stroke();c.beginPath();c.arc(hx-.8,hy+8,1.8,0,3.1);c.stroke();paint(c,function(){c.moveTo(hx+1,hy-28);c.lineTo(hx+6,hy-19);c.lineTo(hx-4,hy-19);c.closePath()},a,[hx+1,hy-23,4,4]);break;
 case"pack":paint(c,function(){c.rect(-tw-4.5,S-4,6.5,14)},a,[-tw-1.2,S+3,3.2,7]);c.fillStyle="#f4e6c4";c.fillRect(-tw-4.5,S+1,6.5,1.3);break;
 case"staff":c.strokeStyle="#6a4a2a";c.lineWidth=2;c.beginPath();c.moveTo(hx+1,hy+12);c.lineTo(hx+1.6,hy-24);c.stroke();c.strokeStyle="#4a8a5a";c.lineWidth=1.4;c.beginPath();c.moveTo(hx+1.6,hy-22);c.quadraticCurveTo(hx+5,hy-25,hx+5.5,hy-21);c.stroke();break;
 case"flowers":c.strokeStyle="#4a7a3a";c.lineWidth=.9;for(var f=0;f<3;f++){c.beginPath();c.moveTo(hx+1,hy+2);c.lineTo(hx-2+f*3,hy-7);c.stroke();paint(c,ell(hx-2+f*3,hy-8,2,2,c),["#e86a7a","#f4c058","#a88ad8"][f],[hx-2+f*3,hy-8,2,2],{flat:1,lw:.7})}break;
 case"basket":paint(c,function(){c.moveTo(hx-4,hy);c.lineTo(hx+6,hy);c.lineTo(hx+4.5,hy+6);c.lineTo(hx-2.5,hy+6);c.closePath()},"#b8894e",[hx+1,hy+3,5,3]);c.fillStyle="#d8503a";c.beginPath();c.arc(hx,hy-.4,1.6,0,6.283);c.arc(hx+3,hy-.6,1.6,0,6.283);c.fill();break;
 case"hoe":c.strokeStyle="#6a4a2a";c.lineWidth=1.6;c.beginPath();c.moveTo(hx+1,hy+12);c.lineTo(hx+1,hy-20);c.stroke();c.fillStyle="#7a7a82";c.fillRect(hx-3,hy-21,6,2.5);break}}
function figDraw(c,d,r){var back=r.back;
 /* contact shadow baked into the sprite only for diorama (soft ambient occlusion) */
 if(DI){var g=c.createRadialGradient(0,0,0,0,0,16);g.addColorStop(0,"rgba(40,25,15,.45)");g.addColorStop(1,"rgba(40,25,15,0)");c.fillStyle=g;c.beginPath();c.ellipse(0,0,17,4.6,0,0,6.283);c.fill()}
 if(!back)hairBack(c,d,r);
 if(back&&(d.prop==="satchel"||d.prop==="pack")){}
 legs(c,d,r);
 if(back){arms(c,d,r,1);torso(c,d,r);if(d.hs==="long"||d.hs==="wavy")hairBack(c,d,r);if(d.hs==="pig"||d.hs==="bun")hairBack(c,d,r);propDraw(c,d,r,1)}
 else{torso(c,d,r);arms(c,d,r,0);propDraw(c,d,r,0)}
 var hy=F.hy+r.br*.6,hr=F.hr;c.save();c.translate(0,r.br*.6);
 if(!back){paint(c,ell(-hr+.4,F.hy+2.5,2.4,3,c),d.skin,[-hr,F.hy+2.5,2.4,3],{gloss:0,lw:.9});paint(c,ell(hr-.4,F.hy+2.5,2.4,3,c),d.skin,[hr,F.hy+2.5,2.4,3],{gloss:0,lw:.9})}
 paint(c,function(){c.arc(0,F.hy,hr,0,6.283)},d.skin,[0,F.hy,hr,hr],{gloss:.22});
 if(!back)face(c,d,r);hairFront(c,d,r,back);c.restore()}
/* pose from game state: quantized so sprites cache, smooth bob added at blit time */
/* stage scale: cozy figures, pets and clouds read larger in the world and in fights (render only; positions and hit areas are unchanged) */
function zs(k){var g=window.OBC_STAGE;return g?(g===2?k[1]:k[0]):1}
function fig(c,x,y,h,p,t,flip,E){h*=zs([1.42,1.5]);var d=spec(p),T=RM?0:t||0,sd=hsh(p.who||"")%100/16+(p.seed||0),wk=p.walk||0,wq=Math.round(wk*3)/3,br=RM?0:Math.round((Math.sin(T/650+sd)*.5+.5)*3)/3*-.9,
 blink=!RM&&((T/1000+sd*.73)%3.7)<.13,sw=RM?0:Math.round(Math.sin(T/480+sd)*2)/2,back=!!p.back;
 var s=h/58,k=PX?pxk(c,s):zb(ts(c)*s);
 var key=M+"|f|"+(p.who||"")+"|"+d.coat+d.hair+d.skin+d.hs+d.cut+d.acc+d.pants+"|"+(back?1:0)+"|"+wq+"|"+br+"|"+(blink?1:0)+"|"+sw+"|"+k;
 var cv=cached(key,64,96,k,function(x){x.translate(32,86);figDraw(x,d,{wk:wq,br:br,blink:blink,sw:sw,back:back,T:T})});cv.k=k;
 var bob=RM?0:(wk?-Math.abs(wk)*1.6:0);
 if(!DI){c.fillStyle=PX?"rgba(30,20,30,.35)":"rgba(40,26,16,.3)";c.beginPath();c.ellipse(x,y,13*s,3.6*s,0,0,6.283);c.fill()}
 else{/* diorama: the key light sits upper left, so each figure casts a long soft shadow to the lower right */c.save();c.translate(x,y);c.transform(1,0,-.9,-.32,0,0);c.globalAlpha=.3;c.fillStyle="#2a1c18";c.beginPath();c.ellipse(0,-26*s,10*s,26*s,0,0,6.283);c.fill();c.restore();c.fillStyle="rgba(30,20,15,.4)";c.beginPath();c.ellipse(x,y,11*s,3*s,0,0,6.283);c.fill()}
 blit(c,cv,x,y+bob*s,32,86,s,flip);
 /* steam of the mug and other live bits are cheap enough to stay live */
 return true}
/* ---------- companions: Kenneth (orange tabby, red cape, red book), Ragnar and Orion (long-haired shepherds, blue and green collars) ---------- */
function fluffPath(c,cx,cy,rx,ry,a0,a1,n,j){c.moveTo(cx+Math.cos(a0)*rx,cy+Math.sin(a0)*ry);for(var k=1;k<=n;k++){var a=a0+(a1-a0)*k/n,am=a0+(a1-a0)*(k-.5)/n;c.quadraticCurveTo(cx+Math.cos(am)*(rx+j),cy+Math.sin(am)*(ry+j),cx+Math.cos(a)*rx,cy+Math.sin(a)*ry)}}
function petLeg(c,x,top,sw,col,w,paw){var fx=x+sw*3.4,fy=-1.2-Math.max(0,sw)*1.6;limb(c,x,top,fx,fy,w,col);paint(c,ell(fx+1,fy+.2,w*.62,w*.38,c),paw||col,[fx+1,fy,w*.6,w*.4],{gloss:.2,lw:.8})}
function dogDraw(c,i,r){var tan="#c98d4c",blk="#2b231d",crm="#e9c48e",col=i===1?"#3a72c8":"#3f9a4e",wq=r.wk,wg=r.wag;
 /* far legs */petLeg(c,-9,-13,-wq,sh(tan,.78),4.6,sh(tan,.7));petLeg(c,10,-14,wq,sh(tan,.78),4.6,sh(tan,.7));
 /* bushy tail with long feathering */
 paint(c,function(){c.moveTo(-13,-23);c.quadraticCurveTo(-27,-22+wg*2,-33,-8+wg*3);c.quadraticCurveTo(-34,-1+wg*3,-29,-2.5+wg*2.6);c.quadraticCurveTo(-27.5,-5+wg*2,-26,-3.5+wg*2.4);c.quadraticCurveTo(-22,-9+wg,-12,-14.5);c.closePath()},tan,[-22,-12,10,9]);
 c.fillStyle=blk;c.beginPath();c.moveTo(-14,-21.5);c.quadraticCurveTo(-24,-20+wg*2,-28,-11+wg*3);c.quadraticCurveTo(-21,-14+wg,-13,-17.5);c.fill();
 /* body + saddle */
 var bd=function(){c.moveTo(-15,-18);c.quadraticCurveTo(-15,-27,-3,-26.5);c.quadraticCurveTo(10,-27,14,-22);c.quadraticCurveTo(16,-14,10,-11);fluffPath(c,0,-11,10,1.6,0,Math.PI,6,1.8);c.quadraticCurveTo(-16,-12,-15,-18);c.closePath()};
 paint(c,bd,tan,[0,-18,15,8]);c.save();c.beginPath();bd();c.clip();c.fillStyle=SB?rgba(blk,.95):blk;c.beginPath();c.ellipse(-2,-25.5,14,6.2,-.05,0,6.283);c.fill();if(DI){c.fillStyle="rgba(255,255,255,.14)";c.beginPath();c.ellipse(-5,-27,8,2,0,0,6.283);c.fill()}c.fillStyle=rgba(crm,.6);c.beginPath();c.ellipse(1,-10.5,11,3.2,0,0,6.283);c.fill();c.restore();
 /* long coat: belly fringe, leg feathering and wisps along the back */c.fillStyle=sh(tan,.92);c.beginPath();fluffPath(c,0,-11.5,11.5,2.2,.15,Math.PI-.15,7,3.2);c.closePath();c.fill();c.strokeStyle=rgba(sh(tan,.62),.8);c.lineWidth=.7;c.beginPath();for(var q2=-12;q2<=8;q2+=3.4){c.moveTo(q2,-9.6);c.lineTo(q2-.8,-7.2)}c.stroke();/* near legs */petLeg(c,-6,-13,wq,tan,5,crm);petLeg(c,12.5,-14,-wq,tan,5,crm);
 /* chest ruff */paint(c,function(){c.moveTo(10,-28);c.quadraticCurveTo(19,-26,18,-16);fluffPath(c,14,-16,4,2,0,Math.PI,3,1.6);c.quadraticCurveTo(8,-20,10,-28);c.closePath()},crm,[14,-21,5,7]);
 
 /* thick mane of a long-haired shepherd */paint(c,function(){c.moveTo(9,-22);fluffPath(c,14.5,-29,7.6,8.4,Math.PI*.55,Math.PI*1.95,7,2.4);c.quadraticCurveTo(20,-21,16,-19);c.closePath()},tan,[13,-30,7,7]);c.fillStyle=rgba(blk,.85);c.beginPath();c.ellipse(12,-33,4.4,3.4,-.4,0,6.283);c.fill();/* collar sits over the ruff so blue (Ragnar) and green (Orion) read clearly */c.save();c.translate(16,-25.5);c.rotate(.42);paint(c,function(){c.rect(-2,-6.2,4,12.4)},col,[0,0,2,6.2],{flat:1,lw:.8});c.restore();paint(c,ell(18.6,-20,1.9,1.9,c),"#e8c06a",[18.6,-20,1.9,1.9],{lw:.6});/* head */var hb=r.br*.4;c.save();c.translate(0,hb);
 paint(c,function(){c.moveTo(13,-36);c.lineTo(12.2,-46);c.lineTo(17.6,-37.6);c.closePath()},blk,[14,-40,3,5]);paint(c,function(){c.moveTo(17,-37);c.lineTo(19.2,-46.6);c.lineTo(22,-36.4);c.closePath()},blk,[19,-40,3,5]);c.fillStyle="#8a5a3a";c.beginPath();c.moveTo(18.6,-38);c.lineTo(19.5,-44);c.lineTo(20.8,-37.6);c.fill();c.fillStyle=rgba(crm,.9);c.beginPath();c.moveTo(13.6,-37.4);c.lineTo(13.4,-41.5);c.lineTo(15.6,-38);c.fill();c.strokeStyle=rgba(crm,.8);c.lineWidth=.6;c.beginPath();c.moveTo(22.6,-36);c.quadraticCurveTo(24.6,-34,24.2,-31.6);c.moveTo(12,-29);c.quadraticCurveTo(10.6,-27,11,-25);c.stroke();
 paint(c,ell(18,-31,7.4,6.4,c),tan,[18,-31,7.4,6.4]);paint(c,ell(24.6,-28.4,5.2,3.4,c),tan,[24.6,-28.4,5.2,3.4],{gloss:.15});
 c.fillStyle=blk;c.beginPath();c.ellipse(21.5,-33.5,5.8,3.1,-.2,0,6.283);c.fill();c.beginPath();c.ellipse(26,-29.6,3.6,1.7,-.1,0,6.283);c.fill();
 c.fillStyle="#141010";c.beginPath();c.ellipse(29.4,-29.2,1.9,1.5,0,0,6.283);c.fill();c.fillStyle="rgba(255,255,255,.6)";c.beginPath();c.arc(29,-29.9,.55,0,6.283);c.fill();
 c.strokeStyle="#3a2418";c.lineWidth=.9;c.beginPath();c.moveTo(28.5,-26.4);c.quadraticCurveTo(26,-25,23.5,-26);c.stroke();if(r.hap){c.fillStyle="#e87a8a";c.beginPath();c.ellipse(26,-24.8,1.6,2,0,0,6.283);c.fill()}
 if(r.blink){c.strokeStyle="#1a1210";c.lineWidth=1;c.beginPath();c.moveTo(19.4,-32.4);c.lineTo(22.4,-32.4);c.stroke()}else{c.fillStyle="#2a1a12";c.beginPath();c.ellipse(21,-32.6,1.6,1.9,0,0,6.283);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(20.5,-33.3,.65,0,6.283);c.fill()}
 c.fillStyle=rgba(crm,.85);c.beginPath();c.ellipse(19.8,-35.6,1.6,.8,0,0,6.283);c.fill();
 c.restore()}
function catDraw(c,r){var org="#e58b3a",dk="#b45a20",wh="#f6e8d2",cape="#c8322a",wq=r.wk,wg=r.wag;
 /* tail curls up behind */c.strokeStyle=SB?rgba(OUT,.9):sh(org,.6);c.lineWidth=SB?6:4.8;c.beginPath();c.moveTo(-10,-11);c.quadraticCurveTo(-21,-14,-19+wg*1.5,-26);c.quadraticCurveTo(-18+wg*2,-31,-14+wg*2,-30);c.stroke();
 c.strokeStyle=org;c.lineWidth=SB?4:4.4;c.stroke();c.strokeStyle=dk;c.lineWidth=1.2;for(var k=0;k<3;k++){var tt=k/3,px=-13-tt*7+wg*tt,py=-13-tt*13;c.beginPath();c.moveTo(px-2,py);c.lineTo(px+2,py+.6);c.stroke()}
 petLeg(c,-7,-8,-wq,sh(org,.78),3.8,sh(wh,.85));petLeg(c,7,-8,wq,sh(org,.78),3.8,sh(wh,.85));
 var bd=function(){c.moveTo(-12,-11);c.quadraticCurveTo(-12,-19,-2,-18.5);c.quadraticCurveTo(9,-19,11,-14);c.quadraticCurveTo(12,-7.5,6,-6.5);c.lineTo(-8,-6.5);c.quadraticCurveTo(-12.5,-7,-12,-11);c.closePath()};
 paint(c,bd,org,[0,-12.5,12,6]);c.save();c.beginPath();bd();c.clip();c.strokeStyle=rgba(dk,.85);c.lineWidth=1.6;for(var s=-8;s<=4;s+=4){c.beginPath();c.moveTo(s,-19);c.quadraticCurveTo(s+1.5,-15,s,-12.5);c.stroke()}c.fillStyle=rgba(wh,.9);c.beginPath();c.ellipse(2,-6.8,8,2.4,0,0,6.283);c.fill();c.restore();
 petLeg(c,-4.5,-8,wq,org,4,wh);petLeg(c,9,-8.5,-wq,org,4,wh);
 /* the red book rides on his back, strapped under the cape */
 c.save();c.translate(-3,-19.5);c.rotate(-.08);paint(c,function(){c.rect(-4.6,-3.6,9.2,4.6)},"#9e2420",[0,-1.3,4.6,2.3],{lw:.8});c.fillStyle="#f4e6c4";c.fillRect(-4.6,.2,9.2,.9);c.fillStyle="#e8c06a";c.fillRect(-.7,-3.6,1.4,4.6);c.restore();
 /* cape flows from the neck over the back */
 var cw=r.sw*1.2;paint(c,function(){c.moveTo(9,-19.5);c.quadraticCurveTo(2,-17.5,-4,-16);c.quadraticCurveTo(-10,-14,-13.5+cw,-8.5);c.lineTo(-10+cw,-10.5);c.lineTo(-8+cw*.6,-8);c.quadraticCurveTo(-2,-11.5,6,-13.2);c.quadraticCurveTo(10,-14.5,11,-17);c.closePath()},cape,[-1,-14,11,4]);
 paint(c,ell(10.5,-17.6,1.5,1.5,c),"#e8c06a",[10.5,-17.6,1.5,1.5],{lw:.6});
 /* head */c.save();c.translate(0,r.br*.4);
 paint(c,function(){c.moveTo(9.5,-24.5);c.lineTo(10,-32);c.lineTo(14,-27);c.closePath();c.moveTo(16,-27);c.lineTo(19.6,-32.4);c.lineTo(20.2,-24.6);c.closePath()},org,[15,-28,5,4]);c.fillStyle="#f0a0a0";c.beginPath();c.moveTo(10.8,-26);c.lineTo(11.1,-29.8);c.lineTo(13,-27.2);c.fill();c.beginPath();c.moveTo(17.4,-27.2);c.lineTo(19.2,-30);c.lineTo(19.3,-26);c.fill();
 paint(c,ell(15,-22,7,6,c),org,[15,-22,7,6]);c.strokeStyle=rgba(dk,.9);c.lineWidth=1.1;c.beginPath();c.moveTo(13.2,-27.4);c.lineTo(13.8,-25.2);c.moveTo(15.4,-27.8);c.lineTo(15.4,-25.4);c.moveTo(17.4,-27.4);c.lineTo(16.9,-25.2);c.stroke();
 c.fillStyle=wh;c.beginPath();c.ellipse(17.6,-19.4,4.4,2.8,0,0,6.283);c.fill();
 if(r.blink){c.strokeStyle="#2a1a10";c.lineWidth=.9;c.beginPath();c.moveTo(12.4,-22.6);c.quadraticCurveTo(13.6,-21.8,14.8,-22.6);c.moveTo(17.4,-22.6);c.quadraticCurveTo(18.6,-21.8,19.8,-22.6);c.stroke()}
 else{c.fillStyle="#7ab84a";c.beginPath();c.ellipse(13.6,-22.6,1.7,2,0,0,6.283);c.ellipse(18.6,-22.6,1.7,2,0,0,6.283);c.fill();c.fillStyle="#1a1410";c.beginPath();c.ellipse(13.8,-22.5,.6,1.6,0,0,6.283);c.ellipse(18.8,-22.5,.6,1.6,0,0,6.283);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(13.2,-23.3,.5,0,6.283);c.arc(18.2,-23.3,.5,0,6.283);c.fill()}
 c.fillStyle="#e87a8a";c.beginPath();c.moveTo(15.4,-20.4);c.lineTo(17,-20.4);c.lineTo(16.2,-19.4);c.fill();c.strokeStyle="#5a3020";c.lineWidth=.7;c.beginPath();c.moveTo(16.2,-19.4);c.quadraticCurveTo(15.4,-18.2,14.6,-18.8);c.moveTo(16.2,-19.4);c.quadraticCurveTo(17,-18.2,17.8,-18.8);c.stroke();
 if(!PX){c.strokeStyle="rgba(255,250,240,.75)";c.lineWidth=.45;c.beginPath();c.moveTo(19.5,-19.6);c.lineTo(24,-20.6);c.moveTo(19.5,-18.9);c.lineTo(24,-18.6);c.stroke()}
 c.restore()}
var PS={};function pet(c,x,y,i,dir,t,E){var T=RM?0:t||performance.now(),st=PS[i]||(PS[i]={x:x,y:y,ph:0}),dd=Math.hypot(x-st.x,y-st.y);if(dd>.15&&dd<40)st.ph+=dd*.22;else if(dd<=.15)st.ph*=.0;st.x=x;st.y=y;
 var fl=dir===3||(dir!==2&&x>(E&&E.hx!=null?E.hx:x)),wk=RM||dd<=.15?0:Math.sin(st.ph),wq=Math.round(wk*2)/2,wag=RM?0:Math.round(Math.sin(T/(i?190:420))*2)/2,br=RM?0:Math.round((Math.sin(T/700+i)*.5+.5)*2)/2*-.8,blink=!RM&&((T/1000+i*1.7)%4.1)<.14,sw=RM?0:Math.round(Math.sin(T/520+i)*2)/2;
 var ps=zs([1.4,1.5]),k=PX?pxk(c,ps):zb(ts(c)*ps),key=M+"|p|"+i+"|"+wq+"|"+wag+"|"+br+"|"+(blink?1:0)+"|"+sw+"|"+k;
 var cv=cached(key,72,60,k,function(x2){x2.translate(36,54);if(DI){var g=x2.createRadialGradient(0,0,0,0,0,20);g.addColorStop(0,"rgba(40,25,15,.42)");g.addColorStop(1,"rgba(40,25,15,0)");x2.fillStyle=g;x2.beginPath();x2.ellipse(0,0,i?24:16,4.4,0,0,6.283);x2.fill()}
  var rr={wk:wq,wag:wag,br:br,blink:blink,sw:sw,hap:1};if(i)dogDraw(x2,i,rr);else catDraw(x2,rr)});cv.k=k;
 if(!DI){c.fillStyle=PX?"rgba(30,20,30,.35)":"rgba(40,26,16,.22)";c.beginPath();c.ellipse(x,y,(i?20:14)*ps,3.6*ps,0,0,6.283);c.fill()}
 blit(c,cv,x,y-(wk?Math.abs(wk)*1.2:0)*ps,36,54,ps,fl);return true}
/* ---------- symptom clouds: stormy and frowning, then warm and smiling once calmed ---------- */
var LOB=[[-17,4,11],[-7,-7,14],[8,-6,13],[18,4,10.5],[0,8,12.5],[-9,9,9],[10,9,9]];
function cloudDraw(c,col,hq,boss,br){var happy=hq>=.5,base=mix(mix("#8c8aa2",col||"#9a9aa8",.28),mix("#fff2e2",col||"#ffffff",.14),hq),i;
 c.save();c.scale(1+br*.03,1-br*.03);
 if(DI){LOB.slice().sort(function(a,b){return a[1]-b[1]}).forEach(function(l){paint(c,ell(l[0],l[1],l[2],l[2]*.94,c),base,[l[0],l[1],l[2],l[2]],{gloss:.32})})}
 else{var pth=function(){LOB.forEach(function(l){c.moveTo(l[0]+l[2],l[1]);c.arc(l[0],l[1],l[2],0,6.283)})};
  if(SB){c.strokeStyle=rgba(OUT,.85);c.lineWidth=2.6;c.beginPath();pth();c.stroke()}
  c.fillStyle=base;c.beginPath();pth();c.fill();c.save();c.beginPath();pth();c.clip();
  var g=c.createLinearGradient(0,-22,0,22);g.addColorStop(0,"rgba(255,255,255,"+(.18+.3*hq)+")");g.addColorStop(.55,"rgba(0,0,0,0)");g.addColorStop(1,happy?"rgba(255,170,150,.4)":"rgba(40,30,70,.42)");c.fillStyle=g;c.fillRect(-32,-24,64,48);
  if(SB){c.globalAlpha=.2;c.fillStyle=grain(c);c.fillRect(-32,-24,64,48);c.globalAlpha=1;c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=1.6;LOB.forEach(function(l){c.beginPath();c.arc(l[0],l[1],l[2]-2.4,3.6,4.9);c.stroke()})}
  if(PX){c.fillStyle=sh(base,1.18);LOB.forEach(function(l){c.fillRect(l[0]-l[2]*.6,l[1]-l[2]*.85,l[2]*.7,2.5)})}
  c.restore()}
 /* face */var ex=7,ey=1;
 if(happy){c.strokeStyle="#4a2a2a";c.lineWidth=boss?2.1:1.9;for(var s=-1;s<=1;s+=2){c.beginPath();c.arc(s*ex,ey+1.5,3,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  c.fillStyle="#6a2a2a";c.beginPath();c.moveTo(-4.6,ey+6);c.quadraticCurveTo(0,ey+13,4.6,ey+6);c.closePath();c.fill();c.fillStyle="#e87a8a";c.beginPath();c.ellipse(0,ey+9.6,2.4,1.5,0,0,6.283);c.fill();
  c.fillStyle="rgba(240,110,120,.45)";c.beginPath();c.ellipse(-ex-5,ey+5,3.6,2.2,0,0,6.283);c.ellipse(ex+5,ey+5,3.6,2.2,0,0,6.283);c.fill()}
 else{for(var s2=-1;s2<=1;s2+=2){c.fillStyle="#241a28";c.beginPath();c.ellipse(s2*ex,ey+1.6,2.5,3.1,0,0,6.283);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(s2*ex-.8,ey+.4,.9,0,6.283);c.fill();
   c.strokeStyle="#241a28";c.lineWidth=boss?2.4:2;c.beginPath();c.moveTo(s2*(ex+4),ey-4.6);c.lineTo(s2*(ex-3.4),ey-2.2);c.stroke()}
  c.strokeStyle="#241a28";c.lineWidth=boss?2.2:1.9;c.beginPath();c.moveTo(-4.6,ey+9.2);c.quadraticCurveTo(0,ey+5,4.6,ey+9.2);c.stroke()}
 c.restore()}
function cloud(c,x,y,r,col,t,boss,hap,E){r*=zs([1.2,1.14]);var T=RM?0:t||0,hq=hap==null||hap===false?0:hap===true?1:Math.round(Math.max(0,Math.min(1,+hap))*4)/4,br=RM?0:Math.round(Math.sin(T/700+x*.01)*2)/2,s=r/26,k=PX?pxk(c,s):zb(ts(c)*s);
 var bob=RM?0:Math.sin(T/600+x*.02)*2.2,key=M+"|c|"+(col||"")+"|"+hq+"|"+(boss?1:0)+"|"+br+"|"+k;
 if(hq>=.5){var gg=c.createRadialGradient(x,y+bob,r*.2,x,y+bob,r*1.6);gg.addColorStop(0,"rgba(255,214,140,.28)");gg.addColorStop(1,"rgba(255,214,140,0)");c.fillStyle=gg;c.fillRect(x-r*1.6,y+bob-r*1.6,r*3.2,r*3.2)}
 var cv=cached(key,76,60,k,function(x2){x2.translate(38,30);cloudDraw(x2,col&&col.length===7?col:"#9a9aa8",hq,boss,br)});cv.k=k;
 blit(c,cv,x,y+bob,38,30,s,false);
 /* live: a little drizzle under an upset cloud, tiny hearts above a happy boss */
 if(!RM){var i,ph;if(hq<.5){c.strokeStyle=PX?"rgba(150,170,230,.85)":"rgba(140,160,220,.6)";c.lineWidth=Math.max(1,s*1.1);for(i=0;i<3;i++){ph=((T/900+i/3)%1);var dx=x+(i-1)*r*.42,dy=y+bob+r*.55+ph*r*.7;c.globalAlpha=1-ph;c.beginPath();c.moveTo(dx,dy);c.lineTo(dx-s*.8,dy+s*3.6);c.stroke()}c.globalAlpha=1}
  else if(boss){for(i=0;i<2;i++){ph=((T/2200+i/2)%1);var hx=x+(i?r*.55:-r*.6)+Math.sin(T/500+i)*3,hy=y+bob-r*.7-ph*r*.6,hs=s*2.6*(1-ph*.4);c.globalAlpha=(1-ph)*.85;c.fillStyle="#f07a8a";c.beginPath();c.moveTo(hx,hy+hs*.9);c.bezierCurveTo(hx-hs*1.6,hy-hs*.2,hx-hs*.6,hy-hs*1.3,hx,hy-hs*.4);c.bezierCurveTo(hx+hs*.6,hy-hs*1.3,hx+hs*1.6,hy-hs*.2,hx,hy+hs*.9);c.fill()}c.globalAlpha=1}}
 return true}
/* ---------- scenery props (100 units tall, feet at y=0): snowy pines, log cabins, lanterns, book signs ---------- */
function facet(c,pts,col){/* clay: rounded silhouette, left-lit gradient, soft rim and a glossy highlight */
 var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
 var path=function(){c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath()};
 var g=c.createLinearGradient(x0,y0,x1,y1+(y1-y0)*.3);g.addColorStop(0,sh(col,1.28));g.addColorStop(.45,col);g.addColorStop(1,sh(col,.62));
 path();c.fillStyle=g;c.lineJoin="round";c.strokeStyle=g;c.lineWidth=Math.min(7,(x1-x0)*.25);c.stroke();c.fill();
 c.save();path();c.clip();c.strokeStyle=rgba(sh(col,.5),.5);c.lineWidth=3;c.stroke();var hg=c.createRadialGradient(x0+(x1-x0)*.3,y0+(y1-y0)*.25,0,x0+(x1-x0)*.3,y0+(y1-y0)*.25,(x1-x0)*.45);hg.addColorStop(0,"rgba(255,250,236,.55)");hg.addColorStop(1,"rgba(255,250,236,0)");c.fillStyle=hg;c.fillRect(x0-4,y0-4,x1-x0+8,y1-y0+8);c.restore()}
function facetOld(c,pts,col){/* diorama: split a shape along its center into a lit left face and a shaded right face */
 var cx=0;pts.forEach(function(p){cx+=p[0]});cx/=pts.length;var path=function(){pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath()};
 c.beginPath();path();c.fillStyle=sh(col,1.12);c.fill();c.save();c.beginPath();path();c.clip();c.fillStyle=sh(col,.7);c.fillRect(cx,-200,200,400);c.fillStyle="rgba(255,240,210,.18)";c.fillRect(cx-200,-200,200-(cx<0?0:0),400);c.restore()}
function shape(c,pts,col,o){if(DI){facet(c,pts,col);return}var minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;pts.forEach(function(p){minx=Math.min(minx,p[0]);maxx=Math.max(maxx,p[0]);miny=Math.min(miny,p[1]);maxy=Math.max(maxy,p[1])});
 paint(c,function(){pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath()},col,[(minx+maxx)/2,(miny+maxy)/2,(maxx-minx)/2,(maxy-miny)/2],o||{lw:SB?2.6:2.2,flat:1})}
function snowCap(c,pts){c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath();c.fillStyle=DI?"#f6f8fc":"#f4f2ec";c.fill();if(SB){c.strokeStyle=rgba("#6a7a9a",.55);c.lineWidth=1.4;c.stroke()}c.fillStyle="rgba(150,170,210,.35)";c.fill()}
function contact(c,rx){if(!DI)return;var g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,"rgba(30,20,15,.45)");g.addColorStop(1,"rgba(30,20,15,0)");c.fillStyle=g;c.beginPath();c.ellipse(0,0,rx,rx*.22,0,0,6.283);c.fill()}
var SP={
 tree:function(c,L,x){var v=Math.abs(x*7|0)%3,g=[["#2f5a3c","#3f7048"],["#2a4e3a","#3a6450"],["#36603a","#4a784a"]][v];contact(c,30);
  shape(c,[[-5,0],[-4,-16],[4,-16],[5,0]],"#5a3a24");
  var tiers=[[-16,-44,30],[-36,-64,24],[-54,-82,18],[-70,-100,11]];tiers.forEach(function(q,i){var yb=q[0],yt=q[1],hw=q[2],pts=[[-hw,yb],[0,yt-6],[hw,yb],[hw*.4,yb-3],[0,yb+1],[-hw*.4,yb-3]];shape(c,pts,g[i%2]);
   snowCap(c,[[-hw*.52,yt+(yb-yt)*.5],[0,yt-6],[hw*.52,yt+(yb-yt)*.5],[hw*.3,yt+(yb-yt)*.42],[hw*.1,yt+(yb-yt)*.55],[-hw*.15,yt+(yb-yt)*.4]])})},
 rock:function(c,L,x){var v=Math.abs(x*13|0)%3;c.scale(1.2,.64);contact(c,50);var pts=[[-44,0],[-48,-30],[-24,-52+v*4],[6,-62],[30,-50],[46,-22],[44,0]];shape(c,pts,"#8a8a8e");
  if(!DI){c.fillStyle=rgba("#5a5a66",.5);c.beginPath();c.moveTo(10,-58);c.lineTo(42,-24);c.lineTo(40,-2);c.lineTo(8,-2);c.closePath();c.fill()}
  c.fillStyle="#6f8a4a";c.beginPath();c.ellipse(-26,-8,16,6,0,0,6.283);c.fill();snowCap(c,[[-30,-46],[-24,-52+v*4],[6,-62],[30,-50],[24,-44],[8,-50],[-12,-44]])},
 house:function(c,L){contact(c,58);
  /* log walls */shape(c,[[-42,0],[-42,-56],[42,-56],[42,0]],"#8a5a34");
  for(var y=-52;y<0;y+=8){c.fillStyle=y%16?rgba("#5a3a20",.45):rgba("#c08a5a",.35);c.fillRect(-42,y,84,3);if(!PX){c.fillStyle="#b07a48";c.beginPath();c.arc(-43,y+2,3.4,0,6.283);c.arc(43,y+2,3.4,0,6.283);c.fill();c.strokeStyle="#6a4024";c.lineWidth=.8;c.stroke()}}
  /* chimney */shape(c,[[18,-70],[18,-96],[32,-96],[32,-66]],"#8a8478");c.fillStyle="#f4f2ec";c.fillRect(17,-99,16,4);
  /* roof with heavy snow */shape(c,[[-54,-52],[0,-94],[54,-52]],"#6a3428");snowCap(c,[[-56,-50],[0,-96],[56,-50],[48,-46],[38,-50],[26,-45],[12,-52],[0,-47],[-14,-52],[-28,-45],[-40,-50],[-50,-45]]);
  /* glowing windows with book spines */[-28,16].forEach(function(wx){var gg=c.createRadialGradient(wx+6,-38,1,wx+6,-38,22);gg.addColorStop(0,"rgba(255,206,110,.55)");gg.addColorStop(1,"rgba(255,206,110,0)");c.fillStyle=gg;c.fillRect(wx-16,-60,44,44);
   c.fillStyle="#ffd98a";c.fillRect(wx,-46,13,14);var bc=["#b8463a","#3a5a8a","#4a7a4a","#c89a3a","#7a4a8a"];for(var b=0;b<5;b++){c.fillStyle=bc[b];c.fillRect(wx+1+b*2.4,-37-(b%2)*1.5,2,5+(b%2)*1.5)}
   c.strokeStyle="#4a2a18";c.lineWidth=2;c.strokeRect(wx,-46,13,14);c.beginPath();c.moveTo(wx+6.5,-46);c.lineTo(wx+6.5,-32);c.moveTo(wx,-39.5);c.lineTo(wx+13,-39.5);c.stroke();c.fillStyle="#f4f2ec";c.fillRect(wx-2,-33,17,2.4)});
  /* door */shape(c,[[-8,0],[-8,-24],[0,-30],[8,-24],[8,0]],"#4a2a18");c.fillStyle="#e8c06a";c.beginPath();c.arc(4,-12,1.4,0,6.283);c.fill();c.fillStyle="#3a6a3a";c.beginPath();c.arc(0,-21,4,0,6.283);c.fill();c.fillStyle="#c8322a";c.beginPath();c.arc(0,-17.5,1.3,0,6.283);c.fill()},
 sign:function(c,L){contact(c,16);shape(c,[[-3,0],[-3,-60],[3,-60],[3,0]],"#6a4a2a");
  /* an open book as the sign board */shape(c,[[-38,-64],[-36,-90],[-2,-86],[0,-62]],"#f2e6c8");shape(c,[[0,-62],[2,-86],[36,-90],[38,-64]],"#efe0be");c.strokeStyle="#b8463a";c.lineWidth=3;c.beginPath();c.moveTo(-38,-63);c.quadraticCurveTo(0,-58,38,-63);c.stroke();
  c.strokeStyle=rgba("#5a3a24",.6);c.lineWidth=1.6;for(var i=0;i<3;i++){c.beginPath();c.moveTo(-30,-82+i*6);c.lineTo(-8,-80+i*6);c.moveTo(8,-80+i*6);c.lineTo(30,-82+i*6);c.stroke()}snowCap(c,[[-36,-90],[-2,-86],[2,-86],[36,-90],[30,-86],[0,-83],[-30,-86]])},
 lantern:function(c,L){contact(c,14);shape(c,[[-3,0],[-3,-72],[3,-72],[3,0]],"#2e2a2a");c.strokeStyle="#2e2a2a";c.lineWidth=3;c.beginPath();c.moveTo(0,-70);c.quadraticCurveTo(10,-82,16,-74);c.stroke();
  var gg=c.createRadialGradient(16,-56,2,16,-56,30);gg.addColorStop(0,"rgba(255,200,100,.6)");gg.addColorStop(1,"rgba(255,200,100,0)");c.fillStyle=gg;c.fillRect(-14,-86,60,60);
  shape(c,[[8,-70],[24,-70],[22,-42],[10,-42]],"#ffcf6a",{lw:2,gloss:.5});c.fillStyle="#fff2c0";c.beginPath();c.ellipse(16,-56,3.4,6.5,0,0,6.283);c.fill();c.fillStyle="#2e2a2a";c.fillRect(6,-74,20,4);c.fillRect(8,-43,16,3);c.fillRect(15,-70,2,28)},
 chest:function(c,L){contact(c,50);shape(c,[[-44,0],[-44,-46],[44,-46],[44,0]],"#8a5a30");shape(c,[[-46,-46],[-40,-70],[40,-70],[46,-46]],"#a06a38");c.fillStyle="#c9a24a";[-30,30].forEach(function(bx){c.fillRect(bx-3,-70,6,70)});c.fillRect(-46,-48,92,4);shape(c,[[-8,-56],[8,-56],[8,-38],[-8,-38]],"#e0b85a");c.fillStyle="#5a3a1e";c.fillRect(-1.5,-50,3,6)},
 chesto:function(c,L){contact(c,50);shape(c,[[-44,0],[-44,-46],[44,-46],[44,0]],"#8a5a30");shape(c,[[-44,-48],[-38,-94],[38,-94],[44,-48]],"#5a3a1e");var gg=c.createRadialGradient(0,-52,2,0,-60,46);gg.addColorStop(0,"rgba(255,230,150,.9)");gg.addColorStop(1,"rgba(255,230,150,0)");c.fillStyle=gg;c.fillRect(-50,-110,100,70);
  c.fillStyle="#fff4d2";[[-16,-68,-.4],[4,-78,.2],[18,-64,.5]].forEach(function(p){c.save();c.translate(p[0],p[1]);c.rotate(p[2]);c.fillRect(-6,-4,12,8);c.restore()})},
 wall:function(c,L){contact(c,52);shape(c,[[-50,0],[-48,-50],[48,-50],[50,0]],"#8e8a82");c.strokeStyle=DI?"rgba(40,30,30,.35)":rgba(OUT,.55);c.lineWidth=1.6;
  for(var r=0;r<3;r++){var y=-14-r*14;c.beginPath();c.moveTo(-50,y);c.lineTo(50,y);c.stroke();for(var k=-44+(r%2)*10;k<46;k+=20){c.beginPath();c.moveTo(k,y);c.lineTo(k,y+14);c.stroke()}}
  var bc=["#b8463a","#3a5a8a","#c89a3a","#4a7a4a"];for(var b=0;b<4;b++){c.fillStyle=bc[b];c.fillRect(14+b*0,-56-b*5,26-b*3,5)}snowCap(c,[[-50,-52],[-48,-58],[12,-58],[12,-52],[-20,-49]])},
 door:function(c,L){contact(c,34);shape(c,[[-36,0],[-36,-74],[-20,-94],[20,-94],[36,-74],[36,0]],"#8e8a82");shape(c,[[-26,0],[-26,-68],[0,-86],[26,-68],[26,0]],"#6a3a22");c.strokeStyle=rgba("#3a1e10",.6);c.lineWidth=2;for(var k=-16;k<=16;k+=10){c.beginPath();c.moveTo(k,-72+Math.abs(k));c.lineTo(k,0);c.stroke()}c.fillStyle="#e8c06a";c.beginPath();c.arc(12,-36,3,0,6.283);c.fill();snowCap(c,[[-36,-74],[-20,-96],[20,-96],[36,-74],[24,-80],[0,-90],[-24,-80]])}};
/* ---------- ground plate: region palettes gradient-mapped from the map's own light, plus snow and water ---------- */
var PAL={storybook:{town:["#56602e","#86883e","#bca85c","#ead6a0"],cliffs:["#5a4e4a","#86786a","#b4a690","#ece4d6"],marsh:["#2c3c2a","#44563a","#687646","#9aa06a"],castle:["#6e7684","#9aa4b2","#c8d0dc","#f2f4f8"]},
 diorama:{town:["#4a6a4a","#6a8e5e","#98b47e","#dce6c8"],cliffs:["#5a5a62","#828074","#b0aa9a","#f0eee8"],marsh:["#344a30","#4e6440","#76864e","#a8b074"],castle:["#7a8292","#a6b0be","#d2dae4","#f6f8fa"]},
 pixel:{town:["#2e5436","#467e3c","#7eaa48","#cfd486"],cliffs:["#4a4652","#6e6a6a","#9e968a","#e8e4dc"],marsh:["#28382e","#3e5236","#627444","#94a066"],castle:["#666e80","#929cb0","#c4ccda","#f0f2f8"]}};
var SNOW={town:.12,cliffs:.4,marsh:0,castle:.55};
function noise2(W2,H2,sd,cells){var cv=mk(cells,Math.ceil(cells*H2/W2)),x=cv.getContext("2d"),r=seeded(sd),d=x.createImageData(cv.width,cv.height);for(var i=0;i<d.data.length;i+=4){var v=r()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);var o=mk(W2,H2),ox=o.getContext("2d");ox.imageSmoothingEnabled=true;try{ox.filter="blur("+(W2/cells*.5)+"px)"}catch(e){}ox.drawImage(cv,0,0,W2,H2);return ox.getImageData(0,0,W2,H2).data}
/* ---------- scene layout shared by the grounds: worn paths from the exits and doors to a little plaza ---------- */
var LAY={};
function layout(s){if(LAY[s.id])return LAY[s.id];var SCs=(window.obcWorld3&&obcWorld3.SC)||{},at=s.at||[0,0],nb=function(dx,dy){for(var k in SCs){var a=SCs[k].at;if(a&&a[0]===at[0]+dx&&a[1]===at[1]+dy)return 1}return 0};
 var it=s.items||[],cx0=W/2,cy0=H*.62,hs=it.filter(function(o){return o.t==="house"||o.t==="door"});
 if(hs.length){var sx=0,sy=0;hs.forEach(function(o){sx+=o.x;sy+=o.y+30});cx0=cx0*.5+sx/hs.length*.5;cy0=Math.max(150,Math.min(H-70,cy0*.5+sy/hs.length*.5))}
 var ends=[];if(nb(-1,0))ends.push([-12,cy0+10]);if(nb(1,0))ends.push([W+12,cy0-8]);if(nb(0,-1))ends.push([cx0+14,30]);if(nb(0,1))ends.push([cx0-10,H+12]);
 if(ends.length<2)ends.push([-12,cy0+6],[W+12,cy0-4]);
 hs.forEach(function(o){ends.push([o.x,o.y+4])});
 var r=seeded(hsh(s.id)+21),paths=ends.map(function(e){return[e[0],e[1],(e[0]+cx0)/2+(r()-.5)*70,(e[1]+cy0)/2+(r()-.5)*44,cx0,cy0]});
 return LAY[s.id]={c:[cx0,cy0],paths:paths}}
function pathD(L,x,y){var best=Math.hypot(L.c[0]-x,(L.c[1]-y)*1.4)-28;L.paths.forEach(function(p){for(var k=0;k<=20;k++){var t=k/20,u=1-t,px=u*u*p[0]+2*u*t*p[2]+t*t*p[4],py=u*u*p[1]+2*u*t*p[3]+t*t*p[5],d=Math.hypot(px-x,py-y);if(d<best)best=d}});return best}
function strokePaths(a,L,w,col){a.strokeStyle=col;a.fillStyle=col;a.lineWidth=w;a.lineCap="round";a.lineJoin="round";L.paths.forEach(function(p){a.beginPath();a.moveTo(p[0],p[1]);a.quadraticCurveTo(p[2],p[3],p[4],p[5]);a.stroke()});a.beginPath();a.ellipse(L.c[0],L.c[1],28+w/2,(28+w/2)/1.4,0,0,6.283);a.fill()}
function statics(s){return(s.items||[]).filter(function(o){return SP[o.t]})}
var GPAL={town:{sb:["#5e6a2e","#7e8a3a","#a6a24c","#d8c47a"],di:["#3e7a3a","#5a9a46","#86b85a"],px:["#2e5a36","#3e7a3e","#5e9a46","#8ebc5a"]},
 cliffs:{sb:["#5a564e","#7a7262","#a49a84","#d8d0bc"],di:["#8a8a86","#a8a69c","#cac6b8"],px:["#4a4a56","#666270","#8a8890","#b8b6bc"]},
 marsh:{sb:["#34442e","#4a5c3a","#6a7a48","#96a066"],di:["#3a5e3e","#557a46","#7a9a56"],px:["#22382e","#2e4c36","#466a3e","#6a8a4a"]},
 castle:{sb:["#5e6a76","#86929e","#b4bcc6","#eef0f4"],di:["#9aa6b4","#bcc6d2","#e0e6ee"],px:["#4e5a6e","#6a7890","#98a6b8","#d8dee8"]}};
/* storybook: an underpainting of soft washes, then thousands of short directional brush strokes picked from it, painted shade pools under props and warm lamplight pools */
function groundSB(s,a,L,g,k){var P=GPAL[g].sb,r=seeded(hsh(s.id)+3),i,x,y;
 a.fillStyle=P[1];a.fillRect(0,0,W,H);
 for(i=0;i<46;i++){x=r()*W;y=r()*H;var rr=40+r()*120,c=P[[0,2,2,3][r()*4|0]],gg=a.createRadialGradient(x,y,0,x,y,rr);gg.addColorStop(0,rgba(c,.42));gg.addColorStop(1,rgba(c,0));a.fillStyle=gg;a.fillRect(x-rr,y-rr,rr*2,rr*2)}
 var sn=SNOW[g]||0;if(sn){var n=noise2(W,H,hsh(s.id)+9,9);for(i=0;i<1400;i++){x=r()*W;y=r()*H;var v=n[((y|0)*W+(x|0))*4]/255;if(v>1-sn*1.1){a.fillStyle=rgba("#f6f4ee",.55+r()*.4);a.beginPath();a.ellipse(x,y,6+r()*10,3+r()*5,r()*.6-.3,0,6.283);a.fill()}}}
 strokePaths(a,L,40,rgba("#5a3a1e",.22));strokePaths(a,L,30,g==="castle"?"#c8b89a":"#c49c62");strokePaths(a,L,16,rgba(g==="castle"?"#e8dcc4":"#e6c890",.75));
 statics(s).forEach(function(o){var sc=(o.sc||1)*(o.t==="house"?1.2:o.t==="tree"?.8:.6),gg=a.createRadialGradient(o.x+8,o.y+2,0,o.x+8,o.y+2,44*sc);gg.addColorStop(0,"rgba(40,26,14,.5)");gg.addColorStop(1,"rgba(40,26,14,0)");a.fillStyle=gg;a.beginPath();a.ellipse(o.x+8,o.y+2,48*sc,20*sc,0,0,6.283);a.fill()});
 (s.w||[]).forEach(function(q){a.fillStyle="#3e6a8a";a.beginPath();a.ellipse(q[0],q[1],q[2],q[3],0,0,6.283);a.fill();var wg=a.createLinearGradient(0,q[1]-q[3],0,q[1]+q[3]);wg.addColorStop(0,"#8ab6cc");wg.addColorStop(1,"#3a5e7e");a.fillStyle=wg;a.beginPath();a.ellipse(q[0],q[1],q[2]-3,q[3]-3,0,0,6.283);a.fill()});
 var cw=a.canvas.width,ch=a.canvas.height,d=a.getImageData(0,0,cw,ch).data;
 for(i=0;i<5200;i++){x=r()*W;y=r()*H;var pi=((Math.min(ch-1,y*k|0))*cw+(Math.min(cw-1,x*k|0)))*4,f=.8+r()*.36,an=Math.sin(x*.012+y*.006)*.7+(r()-.5)*.6,len=5+r()*13,wd=1.4+r()*3.4,cx=Math.cos(an)*len/2,cy=Math.sin(an)*len/2;
  a.strokeStyle="rgb("+Math.min(255,d[pi]*f+(f>1?8:0)|0)+","+Math.min(255,d[pi+1]*f+(f>1?6:0)|0)+","+Math.min(255,d[pi+2]*f*.96|0)+")";a.lineWidth=wd;a.lineCap="round";a.beginPath();a.moveTo(x-cx,y-cy);a.quadraticCurveTo(x+Math.sin(an)*2.2,y-Math.cos(an)*2.2,x+cx,y+cy);a.stroke()}
 (s.w||[]).forEach(function(q){a.strokeStyle=rgba(OUT,.9);a.lineWidth=3.4;a.beginPath();a.ellipse(q[0],q[1],q[2],q[3],0,0,6.283);a.stroke();a.strokeStyle="rgba(250,240,220,.7)";a.lineWidth=2;for(var j=0;j<5;j++){var yy=q[1]-q[3]*.5+j*q[3]*.22,xw=q[2]*(.5-Math.abs(j-2)*.08);a.beginPath();a.moveTo(q[0]-xw*.6+j*4,yy);a.lineTo(q[0]+xw*.4+j*4,yy);a.stroke()}});
 if(g!=="cliffs"){var fc=["#f2c25a","#e87a7a","#f4ecdc","#b48ad8"];for(i=0;i<34;i++){x=20+r()*(W-40);y=70+r()*(H-90);if(pathD(L,x,y)<22)continue;var fcol=fc[r()*4|0];for(var j2=0;j2<5;j2++){var fx=x+(r()-.5)*16,fy=y+(r()-.5)*8;a.fillStyle=rgba(OUT,.7);a.beginPath();a.arc(fx,fy,2.6,0,6.283);a.fill();a.fillStyle=fcol;a.beginPath();a.arc(fx-.3,fy-.4,1.9,0,6.283);a.fill()}}}
 if(g==="marsh"){for(i=0;i<46;i++){x=r()*W;y=60+r()*(H-60);a.strokeStyle=rgba("#2a3a1e",.85);a.lineWidth=2.2;a.beginPath();a.moveTo(x,y);a.quadraticCurveTo(x+3,y-10,x+1,y-20);a.stroke();a.fillStyle="#6a4626";a.beginPath();a.ellipse(x+1,y-22,2.2,5,0,0,6.283);a.fill()}}
 a.save();a.globalCompositeOperation="multiply";a.globalAlpha=.55;a.fillStyle=grain(a);a.fillRect(0,0,W,H);a.restore()}
/* diorama: a sculpted clay terrain lit from the upper left (a height field with real normals), paths pressed into it, clay tufts and pebbles, and the cut front edge of the board */
function groundDI(s,a,L,g){var P=GPAL[g].di,r=seeded(hsh(s.id)+5),i,x,y,w=W,h=H;
 var n1=noise2(w,h,hsh(s.id)+3,5),n2=noise2(w,h,hsh(s.id)+7,12),sn=g==="town"?.25:(SNOW[g]||0)*1.2;
 var M=mk(w,h),m=M.getContext("2d");m.fillStyle="#000";m.fillRect(0,0,w,h);try{m.filter="blur(5px)"}catch(e){}strokePaths(m,L,30,"#fff");m.filter="none";var md=m.getImageData(0,0,w,h).data;
 (s.w||[]).forEach(function(q){m.fillStyle="#000"});
 var Hf=new Float32Array(w*h);for(i=0;i<w*h;i++)Hf[i]=n1[i*4]/255*1.0+n2[i*4]/255*.35-md[i*4]/255*.55;
 var Id=a.createImageData(w,h),p=Id.data,c0=rgb(P[0]),c1=rgb(P[1]),c2=rgb(P[2]),pc=rgb(g==="castle"?"#d8d0c4":"#e4c896"),sw=rgb("#f8f6f2");
 for(y=0;y<h;y++)for(x=0;x<w;x++){i=y*w+x;var hx=(Hf[Math.min(w*h-1,i+3)]-Hf[Math.max(0,i-3)])/3,hy=(Hf[Math.min(w*h-1,i+3*w)]-Hf[Math.max(0,i-3*w)])/3,lit=Math.max(.6,Math.min(1.25,1+(hx*.9+hy*1.1)*7)),
  t=Math.max(0,Math.min(1,Hf[i]*.9)),col=t<.5?[c0[0]+(c1[0]-c0[0])*t*2,c0[1]+(c1[1]-c0[1])*t*2,c0[2]+(c1[2]-c0[2])*t*2]:[c1[0]+(c2[0]-c1[0])*(t-.5)*2,c1[1]+(c2[1]-c1[1])*(t-.5)*2,c1[2]+(c2[2]-c1[2])*(t-.5)*2],pm=Math.min(1,md[i*4]/255*1.6);
  if(pm>0){col=[col[0]+(pc[0]-col[0])*pm,col[1]+(pc[1]-col[1])*pm,col[2]+(pc[2]-col[2])*pm]}
  if(sn){var sv=n2[i*4]/255*.6+n1[i*4]/255*.4-pm*.5;if(sv>1-sn*.8){var ww=Math.min(1,(sv-(1-sn*.8))*14);col=[col[0]+(sw[0]-col[0])*ww,col[1]+(sw[1]-col[1])*ww,col[2]+(sw[2]-col[2])*ww]}}
  p[i*4]=col[0]*lit;p[i*4+1]=col[1]*lit;p[i*4+2]=col[2]*lit*.98;p[i*4+3]=255}
 var T=mk(w,h);T.getContext("2d").putImageData(Id,0,0);a.save();a.setTransform(1,0,0,1,0,0);a.imageSmoothingEnabled=true;a.drawImage(T,0,0,a.canvas.width,a.canvas.height);a.restore();
 (s.w||[]).forEach(function(q){var bank=a.createRadialGradient(q[0]-q[2]*.2,q[1]-q[3]*.3,0,q[0],q[1],q[2]+8);bank.addColorStop(.8,"rgba(60,40,30,.5)");bank.addColorStop(1,"rgba(60,40,30,0)");a.fillStyle=bank;a.beginPath();a.ellipse(q[0]+2,q[1]+3,q[2]+8,q[3]+7,0,0,6.283);a.fill();
  var wg=a.createLinearGradient(q[0]-q[2],q[1]-q[3],q[0]+q[2],q[1]+q[3]);wg.addColorStop(0,"#1e5a8a");wg.addColorStop(.6,"#3a8ab8");wg.addColorStop(1,"#6ab8d8");a.fillStyle=wg;a.beginPath();a.ellipse(q[0],q[1],q[2],q[3],0,0,6.283);a.fill();
  a.fillStyle="rgba(255,255,255,.55)";a.beginPath();a.ellipse(q[0]-q[2]*.4,q[1]-q[3]*.45,q[2]*.28,q[3]*.12,-.15,0,6.283);a.fill();a.strokeStyle="rgba(255,255,255,.35)";a.lineWidth=2;a.beginPath();a.ellipse(q[0],q[1],q[2]-2,q[3]-2,0,3.6,5.6);a.stroke()});
 for(i=0;i<70;i++){x=16+r()*(W-32);y=60+r()*(H-80);if(pathD(L,x,y)<20)continue;var cl=r()<.6?P[1]:P[2];if(r()<.55){/* clay grass tuft: three rounded cones */for(var j=-1;j<=1;j++){a.save();a.translate(x+j*3.4,y);a.rotate(j*.35);paint(a,function(){a.moveTo(-2.6,0);a.quadraticCurveTo(-1.6,-9,0,-11);a.quadraticCurveTo(1.6,-9,2.6,0);a.closePath()},sh(cl,.86),[0,-5,2.6,6],{gloss:.35});a.restore()}}
  else{/* clay pebble */a.fillStyle="rgba(40,26,20,.3)";a.beginPath();a.ellipse(x+3,y+2,7,3,0,0,6.283);a.fill();paint(a,ell(x,y-2,5.6,3.8,a),g==="marsh"?"#8a8a7a":"#b0a898",[x,y-2,5.6,3.8],{gloss:.45})}}
 if(g!=="cliffs")for(i=0;i<26;i++){x=20+r()*(W-40);y=70+r()*(H-90);if(pathD(L,x,y)<22)continue;var fcol=["#f4b8c8","#f6d878","#fff4e8","#c8b0f0"][r()*4|0];for(var j2=0;j2<3;j2++)paint(a,ell(x+j2*4-4,y-(j2%2)*3,2.4,2.4,a),fcol,[x+j2*4-4,y-(j2%2)*3,2.4,2.4],{gloss:.6})}
 if(g==="marsh")for(i=0;i<34;i++){x=r()*W;y=60+r()*(H-60);paint(a,function(){a.moveTo(x-1.6,y);a.quadraticCurveTo(x,y-14,x+.4,y-18);a.quadraticCurveTo(x+1.6,y-12,x+1.6,y);a.closePath()},"#5a7a3a",[x,y-8,1.6,9],{gloss:.3});paint(a,ell(x+.4,y-19,1.8,4,a),"#7a5030",[x,y-19,1.8,4],{gloss:.4})}
 /* the board's cut front edge: grass lip, soil strata and pebbles, so the world reads as a model on a table */
 var e0=H-13,lip=a.createLinearGradient(0,e0-3,0,e0+3);lip.addColorStop(0,sh(P[1],1.2));lip.addColorStop(1,sh(P[0],.8));a.fillStyle=lip;a.fillRect(0,e0-3,W,6);
 var soil=a.createLinearGradient(0,e0+3,0,H);soil.addColorStop(0,"#8a5a36");soil.addColorStop(.5,"#6e4428");soil.addColorStop(1,"#4a2c1a");a.fillStyle=soil;a.fillRect(0,e0+3,W,H-e0-3);
 a.strokeStyle="rgba(240,200,150,.28)";a.lineWidth=1;for(i=0;i<3;i++){a.beginPath();for(x=0;x<=W;x+=8)a.lineTo(x,e0+5+i*3+Math.sin(x*.05+i*2)*.8);a.stroke()}
 for(i=0;i<40;i++){x=r()*W;y=e0+4+r()*8;paint(a,ell(x,y,1.2+r()*1.6,1+r(),a),r()<.5?"#a89880":"#5a3a26",[x,y,2,1.4],{gloss:.4})}
 a.fillStyle="rgba(255,240,210,.35)";a.fillRect(0,e0-3,W,1.2)}
/* pixel: a hand-placed-looking tile map on a 2-unit pixel grid: checkered grass tiles, tufts and flowers, auto-tiled dirt paths with edge pixels, blocky snow and stone, pixel ponds */
function groundPX(s,a,L,g){var P=GPAL[g].px,u=2,w=W/u,h=H/u,r=seeded(hsh(s.id)+7),i,x,y;
 var M=mk(w,h),m=M.getContext("2d");m.imageSmoothingEnabled=false;m.setTransform(1/u,0,0,1/u,0,0);strokePaths(m,L,26,"#fff");m.setTransform(1,0,0,1,0,0);var md=m.getImageData(0,0,w,h).data,pa=new Uint8Array(w*h);for(i=0;i<w*h;i++)pa[i]=md[i*4+3]>140?1:0;
 var wa=new Uint8Array(w*h);(s.w||[]).forEach(function(q){for(y=0;y<h;y++)for(x=0;x<w;x++){var dx=(x*u-q[0])/q[2],dy=(y*u-q[1])/q[3];if(dx*dx+dy*dy<1)wa[y*w+x]=1}});
 var n=noise2(w,h,hsh(s.id)+9,10),sn=(SNOW[g]||0),C=P.map(rgb),dirt=rgb(g==="castle"?"#a8a4a0":g==="cliffs"?"#8a7a66":"#b08a58"),dirtD=rgb(g==="castle"?"#7a7680":g==="cliffs"?"#665a4c":"#7e5a38"),dirtL=rgb(g==="castle"?"#cac6c0":"#d0aa70"),snw=rgb("#f0f2f6"),snS=rgb("#b8c4d8"),wt=rgb("#3a6ab0"),wtL=rgb("#6aa0d8"),wtD=rgb("#24447a");
 var CM=[(C[1][0]+C[2][0]*2)/3|0,(C[1][1]+C[2][1]*2)/3|0,(C[1][2]+C[2][2]*2)/3|0],Id=m.createImageData(w,h),p=Id.data,put=function(j,c){p[j*4]=c[0];p[j*4+1]=c[1];p[j*4+2]=c[2];p[j*4+3]=255};
 for(y=0;y<h;y++)for(x=0;x<w;x++){i=y*w+x;var tx=x>>3,ty=y>>3,chk=(tx+ty)&1,rv=rn(i*.37+hsh(s.id)),c=chk?C[2]:CM;
  if(rv<.07)c=C[0];else if(rv>.96)c=C[3];
  if(sn&&n[i*4]/255>1-sn){var sv=n[i*4]/255;c=sv>1-sn+.04?snw:snS}
  if(g==="cliffs"&&!chk&&rv>.5&&rv<.53)c=C[0];
  if(pa[i]){var edge=(x>0&&!pa[i-1])||(x<w-1&&!pa[i+1])||(y>0&&!pa[i-w])||(y<h-1&&!pa[i+w]);c=edge?dirtD:(rv<.08?dirtD:rv>.93?dirtL:dirt);if(g==="castle"&&!edge&&((x%6===0)||(y%5===0&&((x/6|0)+(y/5|0))%2)))c=dirtD}
  else if(y>0&&pa[i-w])c=C[0];
  if(wa[i]){var we=(x>0&&!wa[i-1])||(x<w-1&&!wa[i+1])||(y>0&&!wa[i-w])||(y<h-1&&!wa[i+w]);c=we?wtD:(rv>.9&&(y&1)?wtL:wt)}
  put(i,c)}
 var px=function(xx,yy,c){if(xx<0||yy<0||xx>=w||yy>=h)return;put(yy*w+xx,c)};
 for(i=0;i<260;i++){x=r()*w|0;y=(30+r()*(h-30))|0;if(pa[y*w+x]||wa[y*w+x])continue;var t=r();
  if(t<.55){var dk=C[0],lt=C[3];px(x,y,dk);px(x-1,y-1,dk);px(x+1,y-1,dk);px(x,y-1,lt);px(x-1,y-2,lt);px(x+1,y-2,lt)}
  else if(t<.8&&g!=="cliffs"){var fl=rgb(["#f0d060","#e86a6a","#f4f0e0","#b080e0"][r()*4|0]);px(x,y-1,fl);px(x-1,y,fl);px(x+1,y,fl);px(x,y+1,fl);px(x,y,rgb("#fff4c0"))}
  else{var st=rgb("#8a8890"),sl=rgb("#c0c0c8");px(x,y,st);px(x+1,y,st);px(x,y-1,sl);px(x+1,y+1,rgb("#4a4652"))}}
 if(g==="marsh")for(i=0;i<60;i++){x=r()*w|0;y=(30+r()*(h-30))|0;var rd=rgb("#4a6a2e"),ct=rgb("#7a4a26");for(var k=0;k<5;k++)px(x,y-k,rd);px(x,y-5,ct);px(x,y-6,ct)}
 (s.w||[]).forEach(function(q){for(var k=0;k<6;k++){var yy=Math.round((q[1]-q[3]*.4+k*q[3]*.16)/u),xx=Math.round((q[0]-q[2]*.4+(k%3)*q[2]*.2)/u);for(var j=0;j<4;j++)px(xx+j,yy,rgb("#cfe4f4"))}});
 m.putImageData(Id,0,0);a.save();a.setTransform(1,0,0,1,0,0);a.imageSmoothingEnabled=false;a.drawImage(M,0,0,a.canvas.width,a.canvas.height);a.restore();
 statics(s).forEach(function(o){var sc=(o.sc||1)*(o.t==="house"?1.3:o.t==="tree"?.8:.6);a.fillStyle="rgba(20,16,30,.32)";for(var q=0;q<3;q++){var hw=Math.round((34-q*8)*sc/u)*u;a.fillRect(Math.round(o.x/u)*u-hw+4,Math.round(o.y/u)*u-2+q*u,hw*2,u)}})}
function plate(s,gi,w2,h2){var g=s.g in GPAL?s.g:"town",A=mk(w2,h2),a=A.getContext("2d"),k=w2/W,L=layout(s);a.setTransform(k,0,0,k,0,0);a.lineJoin="round";a.lineCap="round";
 if(SB)groundSB(s,a,L,g,k);else if(DI)groundDI(s,a,L,g);else groundPX(s,a,L,g);a.setTransform(1,0,0,1,0,0);return A}
/* pixel post: downscale the finished plate, snap to a cozy palette with ordered dithering */
var PXP=null,BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function pxPalette(){if(PXP)return PXP;var L=[];["#1e1418","#2a1a22","#3a2a2a","#4a3428","#6a4428","#8a5a34","#b07a48","#d8a868","#f2d29a","#fff4dc","#f4f2ec","#d8dce4","#a8b0c0","#7a8296","#4e566a","#2e3448","#283a2e","#3e5a2e","#5e7e3a","#8ea44a","#c8c878","#3e5236","#627444","#94a066","#4a4652","#6e6a6a","#9e968a","#e8e4dc","#5a8ec0","#3a6a9a","#9ac4e0","#b8463a","#8a2a24","#e86a5a","#c89a3a","#e8c06a","#7a4a8a","#3a5a8a","#c8602a","#f0a0a0"].forEach(function(h){L.push(rgb(h))});return PXP=L}
function post(A,s,f){if(!PX)return;f=f||2;var dw=Math.round(A.width/f),dh=Math.round(A.height/f),D=mk(dw,dh),x=D.getContext("2d");x.imageSmoothingEnabled=true;x.drawImage(A,0,0,dw,dh);var d=x.getImageData(0,0,dw,dh),p=d.data,P=pxPalette(),cache={};
 for(var y=0;y<dh;y++)for(var xx=0;xx<dw;xx++){var i=(y*dw+xx)*4,bt=(BAY[(y&3)*4+(xx&3)]/16-.5)*22,r=p[i]+bt,g=p[i+1]+bt,b=p[i+2]+bt,key=(r>>3)<<10|(g>>3)<<5|(b>>3),best=cache[key];
  if(!best){var bd=1e9;for(var k=0;k<P.length;k++){var c=P[k],dr=r-c[0],dg=g-c[1],db=b-c[2],dd=dr*dr*.3+dg*dg*.59+db*db*.11;if(dd<bd){bd=dd;best=c}}cache[key]=best}
  p[i]=best[0];p[i+1]=best[1];p[i+2]=best[2]}
 x.putImageData(d,0,0);var a=A.getContext("2d");a.save();a.setTransform(1,0,0,1,0,0);a.imageSmoothingEnabled=false;a.clearRect(0,0,A.width,A.height);a.drawImage(D,0,0,A.width,A.height);a.restore()}
/* ---------- post grade over the cached base (runs only when the scene state changes) ---------- */
var OV={};function overlay(id){if(OV[id])return OV[id];var A=mk(W*2,H*2),a=A.getContext("2d");a.scale(2,2);var r=seeded(hsh(id)+1);
 if(SB){a.globalAlpha=.5;a.fillStyle=grain(a);a.fillRect(0,0,W,H);a.globalAlpha=1;a.strokeStyle="rgba(110,80,40,.09)";for(var f=0;f<120;f++){a.lineWidth=.5+r()*.5;var fx=r()*W,fy=r()*H;a.beginPath();a.moveTo(fx,fy);a.bezierCurveTo(fx+r()*16-8,fy+r()*10-5,fx+r()*20-10,fy+r()*12-6,fx+r()*26-13,fy+r()*14-7);a.stroke()}
  var v=a.createRadialGradient(W/2,H*.48,H*.35,W/2,H/2,W*.72);v.addColorStop(0,"rgba(255,248,232,0)");v.addColorStop(1,"rgba(120,80,40,.55)");a.fillStyle=v;a.fillRect(0,0,W,H)}
 else if(DI){var v2=a.createRadialGradient(W*.42,H*.36,H*.3,W/2,H/2,W*.75);v2.addColorStop(0,"rgba(255,255,255,0)");v2.addColorStop(1,"rgba(60,40,30,.5)");a.fillStyle=v2;a.fillRect(0,0,W,H)}
 else{for(var k=0;k<5;k++){a.strokeStyle="rgba(42,26,34,"+(.12+k*.05)+")";a.lineWidth=4;a.strokeRect(2+k*0,2,W-4,H-4);a.strokeStyle="rgba(42,26,34,"+(.3-k*.05)+")";a.strokeRect(k*4+2,k*4+2,W-k*8-4,H-k*8-4)}}
 var ks=Object.keys(OV);if(ks.length>3)delete OV[ks[0]];return OV[id]=A}
var TS=null,TG=null,DIGR="saturate(1.35) contrast(1.12) brightness(.96)";
function fx(c,m,cur){var id=cur?cur.id:"x";c.save();
 if(m<1){var g=c.createRadialGradient(W/2,H*.55,Math.max(0,m*W*.9-80),W/2,H*.55,m*W*.9+1);g.addColorStop(0,"rgba(128,128,128,0)");g.addColorStop(1,"rgba(128,128,128,1)");c.globalCompositeOperation="saturation";c.globalAlpha=.85;c.fillStyle=g;c.fillRect(0,0,W,H);
  c.globalAlpha=.3*(1-m);c.globalCompositeOperation="multiply";c.fillStyle=SB?"#d8c8ac":DI?"#c8c0c8":"#b8a8b8";c.fillRect(0,0,W,H);c.globalAlpha=1}
 if(DI&&c.canvas){/* tilt-shift: a blurred copy masked to the top and bottom gives the miniature-model depth of field */if(!TS)TS=mk(W,H);var tx=TS.getContext("2d");tx.setTransform(1,0,0,1,0,0);tx.globalCompositeOperation="source-over";tx.clearRect(0,0,W,H);try{tx.filter="blur(4.5px)"}catch(e){}tx.drawImage(c.canvas,0,0,W,H);tx.filter="none";
  var mg=tx.createLinearGradient(0,0,0,H);mg.addColorStop(0,"rgba(0,0,0,1)");mg.addColorStop(.27,"rgba(0,0,0,0)");mg.addColorStop(.72,"rgba(0,0,0,0)");mg.addColorStop(1,"rgba(0,0,0,.9)");tx.globalCompositeOperation="destination-in";tx.fillStyle=mg;tx.fillRect(0,0,W,H);c.drawImage(TS,0,0,W,H);
  var kl=c.createRadialGradient(W*.2,-H*.1,10,W*.3,H*.2,W*.8);kl.addColorStop(0,"rgba(255,226,170,.5)");kl.addColorStop(1,"rgba(255,226,170,0)");c.globalCompositeOperation="overlay";c.globalAlpha=.35;c.fillStyle=kl;c.fillRect(0,0,W,H);c.globalAlpha=1;
  /* diorama grade: richer clay colour and contrast so the miniature reads lit, not hazy (cached base only) */try{var cw=c.canvas.width,chh=c.canvas.height;if(!TG||TG.width!==cw||TG.height!==chh)TG=mk(cw,chh);var gx=TG.getContext("2d");gx.setTransform(1,0,0,1,0,0);gx.clearRect(0,0,cw,chh);gx.filter=DIGR;gx.drawImage(c.canvas,0,0);gx.filter="none";c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation="copy";c.globalAlpha=1;c.drawImage(TG,0,0);c.restore()}catch(e){}}
 else if(SB&&cur){/* storybook: an early-evening wash, then warm painted pools of lamplight at every lantern, window, hearth and reading lamp */
  c.globalCompositeOperation="multiply";c.globalAlpha=.55;c.fillStyle="#9a8aa8";c.fillRect(0,0,W,H);c.globalAlpha=1;c.globalCompositeOperation="lighter";
  var pools=[];(cur.items||[]).forEach(function(o){var u=(o.sc||1);if(o.t==="lantern")pools.push([o.x+9*u,o.y-36*u,70]);if(o.t==="house"){pools.push([o.x-20*u,o.y-24*u,64]);pools.push([o.x+24*u,o.y-24*u,64])}});
  (DECO[cur.id]||[]).forEach(function(o){if(o.t==="hearth")pools.push([o.x,o.y-8,90]);if(o.t==="nook")pools.push([o.x+48,o.y-40,70]);if(o.t==="stack")pools.push([o.x,o.y-40,46])});
  pools.forEach(function(p){var g=c.createRadialGradient(p[0],p[1],0,p[0],p[1]+10,p[2]);g.addColorStop(0,"rgba(255,186,96,.5)");g.addColorStop(.5,"rgba(230,140,60,.18)");g.addColorStop(1,"rgba(200,110,40,0)");c.fillStyle=g;c.beginPath();c.ellipse(p[0],p[1]+10,p[2],p[2]*.7,0,0,6.283);c.fill()});
  c.globalCompositeOperation="soft-light";c.globalAlpha=.25;c.fillStyle="#ffcf8a";c.fillRect(0,0,W,H);c.globalAlpha=1}
 else{c.globalCompositeOperation="soft-light";c.globalAlpha=SB?.22+.14*m:.18+.1*m;c.fillStyle=SB?"#ffcf8a":"#ffb880";c.fillRect(0,0,W,H);c.globalAlpha=1}
 c.globalCompositeOperation=SB?"multiply":"source-over";c.drawImage(overlay(id),0,0,W,H);c.restore()}
/* diorama: every prop casts a projected silhouette shadow away from the key light */
var CSH={};function castWrap(n,f){return function(c,L,x){var k=Math.max(1,Math.min(4,ts(c))),key=n+"|"+(x*7|0)%3+"|"+k,o=CSH[key];
 if(!o){o=mk(Math.ceil(200*k),Math.ceil(140*k));var q=o.getContext("2d");q.setTransform(k,0,0,k,100*k,130*k);f(q,L,x);q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation="source-in";q.fillStyle="#22160f";q.fillRect(0,0,o.width,o.height);CSH[key]=o}
 c.save();c.transform(1,0,-.85,-.3,0,0);c.globalAlpha=.26;c.drawImage(o,-100,-130,200,140);c.restore();f(c,L,x)}}
if(DI)for(var spn in SP)SP[spn]=castWrap(spn,SP[spn]);
/* ---------- library-meets-cabin decor placed into every outdoor scene: shelves, book stacks, reading nooks, hearths, quilts ---------- */
var BKC=["#b8463a","#3a5a8a","#4a7a4a","#c89a3a","#7a4a8a","#2e6a6a","#a0522d","#d8c8a8"],QC=["#b8463a","#e8c06a","#4a7a8a","#f2e6c8","#7a9a4a","#c87a8a"];
function bk(c,x,y,w,h,col,o){shape(c,[[x,y],[x,y-h],[x+w,y-h],[x+w,y]],col,o);if(!DI&&h>6&&w>h){c.fillStyle="#f4ecd8";c.fillRect(x+w-3,y-h+1.6,2.2,h-3.2)}if(w<h&&h>14){c.fillStyle=rgba("#f4e2a8",.85);c.fillRect(x+1,y-h*.75,w-2,1.4);c.fillRect(x+1,y-h*.3,w-2,1.4)}}
function quilt(c,pts,r,n){c.save();c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath();var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
 c.fillStyle=QC[0];c.fill();c.clip();var cw=(x1-x0)/n,chh=(y1-y0)/Math.max(2,Math.round(n*(y1-y0)/(x1-x0)));for(var yy=y0;yy<y1;yy+=chh)for(var xx=x0;xx<x1;xx+=cw){var col=QC[(r()*QC.length)|0];c.fillStyle=DI?sh(col,1.05-(xx-x0)/(x1-x0)*.25):col;c.fillRect(xx,yy,cw+.5,chh+.5);if(!PX){c.strokeStyle=rgba("#fff8e8",.7);c.setLineDash([2,2]);c.lineWidth=.9;c.strokeRect(xx+1.5,yy+1.5,cw-3,chh-3);c.setLineDash([])}}
 if(DI){var g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,"rgba(255,250,235,.35)");g.addColorStop(1,"rgba(30,20,20,.25)");c.fillStyle=g;c.fillRect(x0,y0,x1-x0,y1-y0)}c.restore();
 c.beginPath();pts.forEach(function(p,i){i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])});c.closePath();c.strokeStyle=rgba(OUT,SB?.9:DI?.25:.95);c.lineWidth=SB?2.6:DI?1:2;c.stroke()}
function flame(c,x,y,s){c.fillStyle="#f08a2a";c.beginPath();c.moveTo(x-6*s,y);c.quadraticCurveTo(x-7*s,y-10*s,x,y-20*s);c.quadraticCurveTo(x+7*s,y-10*s,x+6*s,y);c.closePath();c.fill();c.fillStyle="#ffd860";c.beginPath();c.moveTo(x-3*s,y);c.quadraticCurveTo(x-3.5*s,y-6*s,x,y-12*s);c.quadraticCurveTo(x+3.5*s,y-6*s,x+3*s,y);c.closePath();c.fill()}
var DK={
 shelf:function(c,r,snow){contact(c,40);shape(c,[[-36,0],[-36,-112],[36,-112],[36,0]],"#6a4224");c.fillStyle="#2e1c12";c.fillRect(-30,-106,60,100);
  for(var sh0=0;sh0<3;sh0++){var by=-8-sh0*33,x=-29;while(x<26){var w=4+r()*4,h=19+r()*8,col=BKC[(r()*BKC.length)|0];if(x+w>29)break;if(r()<.12&&x<20){c.save();c.translate(x,by);c.rotate(.25);bk(c,0,0,w,h,col,{lw:SB?1.6:1,flat:1});c.restore();x+=w+5}else{bk(c,x,by,w,h,col,{lw:SB?1.6:1,flat:1});x+=w+.4}}
   shape(c,[[-31,by],[-31,by+4],[31,by+4],[31,by]],"#8a5a34")}
  shape(c,[[-40,-110],[-40,-118],[40,-118],[40,-110]],"#7a4a2a");if(snow)snowCap(c,[[-42,-117],[42,-117],[40,-112],[20,-114],[0,-111],[-24,-114],[-40,-112]])},
 stack:function(c,r){contact(c,26);var y=0;for(var i=0;i<4+(r()*2|0);i++){var w=30+r()*12,h=7+r()*3,x=-w/2+(r()-.5)*6;bk(c,x,y,w,h,BKC[(r()*BKC.length)|0]);y-=h}
  if(!DI){shape(c,[[-2.4,y],[-2.4,y-12],[2.4,y-12],[2.4,y]],"#f4ead6");flame(c,0,y-12,.42)}else{paint(c,ell(0,y-6,7,6,c),"#e8c06a",[0,y-6,7,6],{gloss:.5})}},
 nook:function(c,r){contact(c,52);/* bench */shape(c,[[-38,0],[-38,-18],[-34,-18],[-34,0]],"#5a3a24");shape(c,[[34,0],[34,-18],[38,-18],[38,0]],"#5a3a24");shape(c,[[-44,-18],[-44,-24],[44,-24],[44,-18]],"#8a5a34");shape(c,[[-44,-24],[-44,-50],[-40,-50],[-40,-24]],"#7a4a2a");shape(c,[[-44,-50],[-44,-54],[44,-54],[44,-50]],"#8a5a34");shape(c,[[40,-24],[40,-50],[44,-50],[44,-24]],"#7a4a2a");
  quilt(c,[[-30,-24],[16,-24],[20,-8],[-26,-6]],r,5);/* open book */shape(c,[[18,-25],[20,-32],[30,-31],[30,-25]],"#f4ecd8");shape(c,[[30,-25],[30,-31],[40,-32],[42,-25]],"#efe2c4");
  /* side table and lamp */shape(c,[[48,0],[48,-26],[51,-26],[51,0]],"#5a3a24");shape(c,[[44,-26],[44,-30],[62,-30],[62,-26]],"#8a5a34");shape(c,[[59,0],[59,-26],[56,-26],[56,0]],"#5a3a24");shape(c,[[52,-30],[52,-40],[55,-40],[55,-30]],"#c8a24a");shape(c,[[46,-40],[49,-52],[58,-52],[61,-40]],"#f2d08a");
  var gg=c.createRadialGradient(53,-46,1,53,-46,22);gg.addColorStop(0,"rgba(255,214,120,.55)");gg.addColorStop(1,"rgba(255,214,120,0)");c.fillStyle=gg;c.fillRect(31,-68,44,44)},
 hearth:function(c,r){contact(c,40);for(var i=0;i<12;i++){var a=i/12*6.283,x=Math.cos(a)*24,y=Math.sin(a)*8-4;paint(c,ell(x,y,6,4.4,c),i%3?"#8a8680":"#a8a49c",[x,y,6,4.4],{lw:SB?1.2:.8,gloss:.3})}
  c.fillStyle="#2a1a12";c.beginPath();c.ellipse(0,-4,19,6,0,0,6.283);c.fill();shape(c,[[-16,-2],[-14,-7],[14,-3],[12,2]],"#6a4024");shape(c,[[-14,-3],[12,-8],[14,-3],[-12,2]],"#7a4a2a");flame(c,0,-4,1.05);
  /* log stools */[[-46,6],[44,4]].forEach(function(p){shape(c,[[p[0]-8,p[1]],[p[0]-8,p[1]-12],[p[0]+8,p[1]-12],[p[0]+8,p[1]]],"#8a5a34");paint(c,ell(p[0],p[1]-12,8,3,c),"#d8b27a",[p[0],p[1]-12,8,3],{flat:1,lw:SB?1.2:.8})})},
 picnic:function(c,r){quilt(c,[[-40,-16],[30,-18],[42,2],[-34,4]],r,6);shape(c,[[-14,-8],[-12,-14],[0,-13],[0,-7]],"#f4ecd8");shape(c,[[0,-7],[0,-13],[12,-14],[14,-8]],"#efe2c4");shape(c,[[18,-6],[18,-14],[25,-14],[25,-6]],"#c8463a");c.strokeStyle="#c8463a";c.lineWidth=1.6;c.beginPath();c.arc(26.5,-10,3,-1.4,1.4);c.stroke();
  shape(c,[[-34,-4],[-32,-16],[-16,-16],[-14,-4]],"#b08a4a");c.strokeStyle="#7a5a2a";c.lineWidth=1.8;c.beginPath();c.arc(-24,-16,7,3.14,6.283);c.stroke()},
 giant:function(c,r){contact(c,48);bk(c,-46,0,80,16,"#b8463a");bk(c,-40,-16,70,14,"#3a5a8a");bk(c,-30,-30,54,12,"#e8c06a");shape(c,[[40,0],[40,-62],[58,-62],[58,0]],"#4a7a4a");c.fillStyle=rgba("#f4e2a8",.9);c.fillRect(42,-50,14,2.4);c.fillRect(42,-14,14,2.4)},
 crate:function(c,r){contact(c,26);shape(c,[[-22,0],[-22,-26],[22,-26],[22,0]],"#a0703a");c.strokeStyle="#6a4424";c.lineWidth=2;c.beginPath();c.moveTo(-22,-13);c.lineTo(22,-13);c.moveTo(-22,-1);c.lineTo(22,-25);c.stroke();var x=-20;while(x<17){var w=4+r()*3,h=8+r()*8;bk(c,x,-26,w,h,BKC[(r()*BKC.length)|0],{lw:1,flat:1});x+=w+.6}}
};
var DSETS=SB?["nook","stack","hearth","picnic","stack","shelf"]:DI?["giant","hearth","nook","picnic","giant","shelf"]:["crate","hearth","picnic","stack","nook","crate"],DECO={};
function deco(s){if(DECO[s.id])return DECO[s.id];var out=[];if(!s.items||s.id==="safe"||s.id==="office"){return DECO[s.id]=out}
 var r=seeded(hsh(s.id)+101),L=layout(s),it=s.items,snow=(SNOW[s.g]||0)>0||s.g==="town",taken=[],ok=function(x,y,rad){if(x<rad||x>W-rad||y>H-26)return false;for(var i=0;i<it.length;i++){var o=it[i],d=Math.hypot(o.x-x,(o.y-y)*1.3);if(d<(o.t==="house"?78:o.t==="tree"?34:44)+rad*.5)return false}
  for(var j=0;j<taken.length;j++)if(Math.hypot(taken[j][0]-x,taken[j][1]-y)<taken[j][2]+rad)return false;
  var w=s.w||[];for(var q=0;q<w.length;q++){var dx=(x-w[q][0])/(w[q][2]+rad),dy=(y-w[q][1])/(w[q][3]+rad*.5);if(dx*dx+dy*dy<1)return false}return true};
 /* a run of bookshelves along the back wall of the scene, clear of the north path */
 for(var x=50;x<W-40;x+=66){if(pathD(L,x,58)<50||!ok(x,58,30))continue;if(r()<.55){(function(x){var sd=r()*1e6|0;out.push({y:58,t:"shelf",x:x,f:function(a){a.save();a.translate(x,58);a.scale(.78,.78);DK.shelf(a,seeded(sd),snow);a.restore()}})})(x);taken.push([x,58,34]);x+=20}}
 var n=0;for(var tries=0;tries<220&&n<5;tries++){var px=40+r()*(W-80),py=96+r()*(H-140),t=DSETS[n%DSETS.length];if(t==="shelf")t=DSETS[(n+1)%DSETS.length];var rad=t==="nook"?66:t==="hearth"||t==="giant"||t==="picnic"?50:30;
  if(pathD(L,px,py)<rad*.55+18||Math.hypot(px-L.c[0],py-L.c[1])<110||!ok(px,py,rad))continue;taken.push([px,py,rad]);n++;
  (function(px,py,t,sd){var fn=DI?castWrap("dk"+t+sd,function(a,L){DK[t](a,seeded(sd),snow)}):function(a){DK[t](a,seeded(sd),snow)};out.push({y:py,t:t,x:px,f:function(a){a.save();a.translate(px,py);a.scale(.9,.9);fn(a,0,0);a.restore()}})})(px,py,t,r()*1e6|0)}
 return DECO[s.id]=out}
/* warm animated light on the decor: hearth fire, nook lamps and candles */
function decoLive(c,s,T){var d=DECO[s.id];if(!d)return;d.forEach(function(o,i){var lx=o.x,ly=o.y,rad=0;if(o.t==="hearth"){ly-=8;rad=60}else if(o.t==="nook"){lx+=48;ly-=42;rad=46}else if(o.t==="stack"&&!DI){ly-=44;rad=30}else return;
 var f=RM?1:.82+.12*Math.sin(T*9+i)+.06*Math.sin(T*23+i*3);var g=c.createRadialGradient(lx,ly,0,lx,ly,rad*f);g.addColorStop(0,"rgba(255,190,90,"+(.42*f)+")");g.addColorStop(1,"rgba(255,170,80,0)");c.globalCompositeOperation="lighter";c.fillStyle=g;c.fillRect(lx-rad,ly-rad,rad*2,rad*2);c.globalCompositeOperation="source-over";
 if(o.t==="hearth")for(var k=0;k<4;k++){var ph=RM?k/4:(T*.9+k/4+i*.3)%1;c.globalAlpha=(1-ph);dot(c,lx+Math.sin(ph*7+k)*6,ly-4-ph*30,PX?1:1.2,"#ffb050")}c.globalAlpha=1})}
/* ---------- live particles: snow, chimney smoke, lantern embers, marsh fireflies, dust in the lamplight ---------- */
function dot(c,x,y,r,col){if(PX){c.fillStyle=col;var q=Math.max(1,Math.round(r));c.fillRect(Math.round(x),Math.round(y),q,q)}else{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}}
function live(c,s,t,B){if(RM)t=0;var g=s.g||"town",i,ph,T=t/1000;c.save();decoLive(c,s,T);
 var ns=g==="cliffs"||g==="castle"?26:g==="town"?12:0;for(i=0;i<ns;i++){var sp=8+rn(i)*14,x=(rn(i+.3)*W+Math.sin(T*.8+i)*12+T*6)%W,y=(rn(i+.7)*H+T*sp)%H,r=rn(i+.9)*1.4+.9;dot(c,x,y,PX?(r>1.6?2:1):r,"rgba(255,255,255,"+(.55+rn(i)*.4)+")")}
 (s.items||[]).forEach(function(o,j){var u=1.24*(o.sc||1);if(o.t==="house"){var cx=o.x+(o.flip?-25:25)*u,cy=o.y+6-98*u;for(i=0;i<5;i++){ph=(T*.22+i/5)%1;var px=cx+Math.sin(ph*5+j)*5*ph+ph*12,py=cy-ph*46,pr=(3+ph*9)*(PX?1:1);c.globalAlpha=(1-ph)*.42;dot(c,px,py,pr,DI?"#f4efe8":"#e8e2dc")}c.globalAlpha=1}
  if(o.t==="lantern"||o.t==="house"&&o.role){for(i=0;i<3;i++){ph=(T*.4+i/3+j*.17)%1;var ex=o.x+(o.t==="lantern"?16*(o.sc||1)*.6:0)+Math.sin(ph*9+i)*6,ey=o.y-(o.t==="lantern"?44:34)-ph*30;c.globalAlpha=(1-ph)*.9;dot(c,ex,ey,PX?1:1.1,"#ffc860")}c.globalAlpha=1}});
 if(g==="marsh"){for(i=0;i<10;i++){var a=T*.6+i*2.1,fx=(rn(i)*W+Math.cos(a)*24),fy=(rn(i+.5)*H+Math.sin(a*1.3)*16),al=.5+.5*Math.sin(a*3);var gg=c.createRadialGradient(fx,fy,0,fx,fy,8);gg.addColorStop(0,"rgba(230,255,150,"+(.5*al)+")");gg.addColorStop(1,"rgba(230,255,150,0)");c.fillStyle=gg;c.fillRect(fx-8,fy-8,16,16);dot(c,fx,fy,1.3,"rgba(250,255,200,"+al+")")}}
 for(i=0;i<8;i++){var mx=(rn(i+4)*W+Math.sin(T*.3+i)*30)%W,my=(rn(i+6)*H+Math.cos(T*.25+i)*20);c.globalAlpha=.25+.2*Math.sin(T+i);dot(c,mx,my,PX?1:1.2,"#fff0c8")}c.globalAlpha=1;c.restore()}
function ripple(c,s,t){var T=RM?0:t;c.save();(s.w||[]).forEach(function(q){for(var n=0;n<3;n++){var ph=RM?n/3:((T/2600+n/3)%1),rx=q[2]*(.3+.6*ph),ry=q[3]*(.3+.6*ph);c.globalAlpha=(1-ph)*.8;
  if(PX){c.fillStyle="#e8f2fa";for(var a=3.6;a<5.9;a+=.35)c.fillRect(Math.round(q[0]+Math.cos(a)*rx),Math.round(q[1]+Math.sin(a)*ry),2,1)}
  else{c.strokeStyle=DI?"rgba(255,255,255,.75)":"rgba(250,246,236,.7)";c.lineWidth=DI?1.6:1.2*(1-ph)+.5;c.beginPath();c.ellipse(q[0],q[1],rx,ry,0,3.5,6);c.stroke()}}
  if(DI){c.globalAlpha=.5;c.fillStyle="rgba(255,255,255,.6)";c.beginPath();c.ellipse(q[0]-q[2]*.35,q[1]-q[3]*.4,q[2]*.18,q[3]*.08,-.2,0,6.283);c.fill()}});c.restore()}
/* ---------- margins: a dim library bookshelf around the world (or the wooden tabletop the diorama sits on) ---------- */
function margin(x,tw,th){var r=seeded(31);x.save();
 if(DI){x.fillStyle="#5a3e28";x.fillRect(0,0,tw,th);for(var y=0;y<th;y+=th/6){x.fillStyle=r()<.5?"#634430":"#563a26";x.fillRect(0,y,tw,th/6-2);x.fillStyle="#3a2618";x.fillRect(0,y+th/6-2,tw,2);x.strokeStyle="rgba(30,18,10,.25)";x.lineWidth=1;for(var k=0;k<4;k++){x.beginPath();x.moveTo(0,y+8+k*12);for(var xx=0;xx<=tw;xx+=40)x.lineTo(xx,y+8+k*12+Math.sin(xx/70+k+y)*3);x.stroke()}}
  x.fillStyle="rgba(20,12,6,.35)";x.fillRect(0,0,tw,th)}
 else{x.fillStyle=PX?"#22161c":"#2a1c12";x.fillRect(0,0,tw,th);var sh2=th/4,bc=["#8a2a24","#2e4a6a","#3e5a32","#a07a2a","#5a3a6a","#6a3a22","#2a5a5a","#9a5a2a"];
  for(var row=0;row<4;row++){var y0=row*sh2,xx2=4;while(xx2<tw-6){var bw=8+r()*12|0,bh=sh2*(.62+r()*.26)|0,col=bc[r()*bc.length|0];if(PX){bw=bw>>1<<1;bh=bh>>1<<1}x.fillStyle=col;x.fillRect(xx2,y0+sh2-10-bh,bw,bh);x.fillStyle="rgba(232,192,106,.7)";x.fillRect(xx2,y0+sh2-10-bh+6,bw,2);x.fillRect(xx2,y0+sh2-10-14,bw,2);x.fillStyle="rgba(0,0,0,.3)";x.fillRect(xx2+bw-2,y0+sh2-10-bh,2,bh);xx2+=bw+1;if(r()<.08){xx2+=14}}
   x.fillStyle="#5a3a22";x.fillRect(0,y0+sh2-10,tw,10);x.fillStyle="#7a5232";x.fillRect(0,y0+sh2-10,tw,2)}
  x.fillStyle="rgba(18,10,4,.5)";x.fillRect(0,0,tw,th)}
 x.restore()}
/* ---------- opening and character-creator backdrop: dawn or night over snowy peaks, pines and a far cabin (no stars) ---------- */
function ground(w,h,top,night){var A=mk(w,h),a=A.getContext("2d"),r=seeded(w*7+h+top),i,x;
 var sky=a.createLinearGradient(0,0,0,top+20);if(night){sky.addColorStop(0,"#1c2240");sky.addColorStop(1,"#4a4468")}else{sky.addColorStop(0,"#f2c896");sky.addColorStop(.6,"#f6dcb4");sky.addColorStop(1,"#fbecd2")}a.fillStyle=sky;a.fillRect(0,0,w,top+30);
 if(night){var mg=a.createRadialGradient(w*.84,top*.38,4,w*.84,top*.38,top*.9);mg.addColorStop(0,"rgba(255,240,200,.35)");mg.addColorStop(1,"rgba(255,240,200,0)");a.fillStyle=mg;a.fillRect(0,0,w,top)}
 else{var sg=a.createRadialGradient(w*.18,top*.55,4,w*.18,top*.55,top);sg.addColorStop(0,"rgba(255,236,180,.8)");sg.addColorStop(1,"rgba(255,236,180,0)");a.fillStyle=sg;a.fillRect(0,0,w,top+20)}
 var ML=night?[["#3a3e60","#6a6e90"],["#2e3450","#5a6080"],["#263044","#4a5470"]]:[["#a8a4c0","#f4f0f4"],["#8a8aa8","#eceaf0"],["#6c7a8a","#e4e6ea"]];
 for(var l=0;l<3;l++){var base=top*(.62+l*.16),pk=[],n=4+l,px=-w*.1;for(i=0;i<=n;i++){pk.push([px,base-(top*(.32-l*.06))*(.6+r()*.6)]);px+=w*1.2/n}
  a.beginPath();a.moveTo(0,top+20);a.lineTo(-10,base);pk.forEach(function(p,j){var vx=p[0]+w*.6/n;a.lineTo(p[0],p[1]);a.lineTo(vx,base-(top*.08)*r())});a.lineTo(w+10,base);a.lineTo(w,top+20);a.closePath();
  a.fillStyle=ML[l][0];a.fill();if(DI){a.save();a.clip();pk.forEach(function(p){a.fillStyle="rgba(0,0,30,.18)";a.beginPath();a.moveTo(p[0],p[1]);a.lineTo(p[0]+w*.6/n,base);a.lineTo(p[0],top+20);a.closePath();a.fill()});a.restore()}
  a.fillStyle=ML[l][1];pk.forEach(function(p){var d=(base-p[1])*.38;a.beginPath();a.moveTo(p[0],p[1]);a.lineTo(p[0]+d*.9,p[1]+d);a.lineTo(p[0]+d*.4,p[1]+d*.8);a.lineTo(p[0],p[1]+d*1.05);a.lineTo(p[0]-d*.45,p[1]+d*.78);a.lineTo(p[0]-d*.9,p[1]+d);a.closePath();a.fill()});
  if(SB){a.strokeStyle=rgba(OUT,.35);a.lineWidth=1.2;a.beginPath();a.moveTo(-10,base);pk.forEach(function(p){a.lineTo(p[0],p[1]);a.lineTo(p[0]+w*.6/n,base-(top*.04))});a.stroke()}}
 /* pine band and far cabin */var pc=night?"#1a2a26":"#3a5a48";for(x=-10;x<w+10;x+=9+r()*8){var ph=14+r()*16,by=top+6+r()*6;a.fillStyle=pc;a.beginPath();a.moveTo(x-ph*.32,by);a.lineTo(x,by-ph);a.lineTo(x+ph*.32,by);a.fill();a.fillStyle=night?"rgba(200,210,230,.5)":"rgba(255,255,255,.8)";a.beginPath();a.moveTo(x-ph*.1,by-ph*.7);a.lineTo(x,by-ph);a.lineTo(x+ph*.1,by-ph*.7);a.fill()}
 var cx=w*.72,cy=top+4;a.fillStyle="#5a3a24";a.fillRect(cx-12,cy-12,24,12);a.fillStyle="#f4f2ec";a.beginPath();a.moveTo(cx-15,cy-11);a.lineTo(cx,cy-22);a.lineTo(cx+15,cy-11);a.fill();a.fillStyle="#ffd27a";a.fillRect(cx-6,cy-8,5,4);a.fillRect(cx+2,cy-8,5,4);a.fillStyle="rgba(230,230,235,.5)";for(i=0;i<4;i++){a.beginPath();a.arc(cx+8+i*3,cy-26-i*7,2+i*1.4,0,6.283);a.fill()}
 /* snowy meadow */var mb=night?["#3a4a52","#34444a","#2e3c42","#283438"]:["#e8ece8","#d6e0d2","#bccaa8","#a8ba8a"];for(var b=0;b<4;b++){var y0=top+12+(h-top)*b/4.2,amp=5+r()*6,ph2=r()*6;a.beginPath();a.moveTo(0,h);for(x=0;x<=w;x+=8)a.lineTo(x,y0+Math.sin(x/(60+b*20)+ph2)*amp);a.lineTo(w,h);a.closePath();a.fillStyle=mb[b];a.fill();
  if(SB){a.strokeStyle=rgba(OUT,.25);a.lineWidth=1.2;a.beginPath();for(x=0;x<=w;x+=8){var yy=y0+Math.sin(x/(60+b*20)+ph2)*amp;x?a.lineTo(x,yy):a.moveTo(x,yy)}a.stroke()}}
 a.fillStyle=night?"rgba(150,170,200,.3)":"rgba(120,140,180,.18)";for(i=0;i<26;i++){a.beginPath();a.ellipse(r()*w,top+30+r()*(h-top-30),10+r()*24,2+r()*3,0,0,6.283);a.fill()}
 a.strokeStyle=night?"rgba(120,150,110,.6)":"rgba(80,110,60,.6)";a.lineWidth=1.1;for(i=0;i<50;i++){var gx=r()*w,gy=top+30+r()*(h-top-30);a.beginPath();a.moveTo(gx-2,gy);a.lineTo(gx,gy-5);a.moveTo(gx+2,gy);a.lineTo(gx,gy-5);a.stroke()}
 if(SB){a.globalCompositeOperation="multiply";a.globalAlpha=.35;a.fillStyle=grain(a);a.fillRect(0,0,w,h);a.globalAlpha=1;a.globalCompositeOperation="source-over"}
 if(PX){var D=mk(w/2,h/2),dx=D.getContext("2d");dx.drawImage(A,0,0,w/2,h/2);a.imageSmoothingEnabled=false;a.clearRect(0,0,w,h);a.drawImage(D,0,0,w,h)}
 return A}
/* opening-card look per style (render only): storybook = lamplit evening wash, diorama = tilt-shift miniature, pixel = low-res pass */
var FG=null;function cardGrade(c,w,h){var cv=c.canvas,k=cv.width/w;try{c.save();c.setTransform(1,0,0,1,0,0);var W2=cv.width,H2=cv.height;
 if(SB){c.globalCompositeOperation="soft-light";c.fillStyle="rgba(240,176,90,.55)";c.fillRect(0,0,W2,H2);c.globalCompositeOperation="source-over";var g=c.createRadialGradient(W2*.5,H2*.55,H2*.25,W2*.5,H2*.55,W2*.62);g.addColorStop(0,"rgba(255,214,140,.10)");g.addColorStop(1,"rgba(48,24,8,.55)");c.fillStyle=g;c.fillRect(0,0,W2,H2)}
 else if(DI){if(!FG||FG.width!==W2||FG.height!==H2)FG=mk(W2,H2);var f=FG.getContext("2d");f.setTransform(1,0,0,1,0,0);f.clearRect(0,0,W2,H2);f.filter="saturate(1.3) contrast(1.08)";f.drawImage(cv,0,0);f.filter="none";c.globalCompositeOperation="copy";c.drawImage(FG,0,0);c.globalCompositeOperation="source-over";
  f.clearRect(0,0,W2,H2);f.filter="blur("+(2.4*k)+"px)";f.drawImage(cv,0,0);f.filter="none";c.save();c.beginPath();c.rect(0,0,W2,H2*.3);c.rect(0,H2*.86,W2,H2*.14);c.clip();c.drawImage(FG,0,0);c.restore();c.globalAlpha=.6;c.save();c.beginPath();c.rect(0,H2*.3,W2,H2*.08);c.rect(0,H2*.8,W2,H2*.06);c.clip();c.drawImage(FG,0,0);c.restore();c.globalAlpha=1}
 c.restore()}catch(e){c.restore()}if(PX)pixelate(c,k)}
function frame(c,w,h){cardGrade(c,w,h);c.save();if(SB){c.strokeStyle="#5a3a22";c.lineWidth=6;c.strokeRect(3,3,w-6,h-6);c.strokeStyle="#c9a24a";c.lineWidth=1.2;c.strokeRect(8,8,w-16,h-16)}
 else if(DI){var g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,"#8a6040");g.addColorStop(1,"#5a3a24");c.strokeStyle=g;c.lineWidth=8;c.beginPath();c.roundRect?c.roundRect(4,4,w-8,h-8,14):c.rect(4,4,w-8,h-8);c.stroke();c.strokeStyle="rgba(255,230,190,.4)";c.lineWidth=1.5;c.beginPath();c.roundRect?c.roundRect(8,8,w-16,h-16,10):c.rect(8,8,w-16,h-16);c.stroke()}
 else{c.fillStyle="#2a1a22";c.fillRect(0,0,w,4);c.fillRect(0,h-4,w,4);c.fillRect(0,0,4,h);c.fillRect(w-4,0,4,h);c.fillStyle="#e8c06a";c.fillRect(6,6,w-12,2);c.fillRect(6,h-8,w-12,2);c.fillRect(6,6,2,h-12);c.fillRect(w-8,6,2,h-12)}c.restore()}
/* ---------- victory: inside a warm cabin library, fire crackling, snowy peaks through the window ---------- */
var VB=null;function vicBase(){if(VB)return VB;var A=mk(640,400),a=A.getContext("2d");a.scale(2,2);var r=seeded(77);
 a.fillStyle="#6a4428";a.fillRect(0,0,320,200);for(var y=0;y<160;y+=12){a.fillStyle=y%24?"#734a2c":"#664026";a.fillRect(0,y,320,11);a.fillStyle="rgba(30,15,5,.4)";a.fillRect(0,y+11,320,1)}
 /* bookshelf on the left */a.fillStyle="#3e2616";a.fillRect(8,14,92,150);for(var row=0;row<4;row++){var y0=20+row*36,xx=12;while(xx<94){var bw=5+r()*6|0,bh=22+r()*9|0;a.fillStyle=["#8a2a24","#2e4a6a","#3e5a32","#a07a2a","#5a3a6a","#2a5a5a"][r()*6|0];a.fillRect(xx,y0+30-bh,bw,bh);a.fillStyle="rgba(232,192,106,.7)";a.fillRect(xx,y0+30-bh+4,bw,1.5);xx+=bw+1}a.fillStyle="#5a3a22";a.fillRect(8,y0+30,92,5)}
 /* window onto snowy peaks */a.fillStyle="#4a2e1a";a.fillRect(224,20,82,70);var sk=a.createLinearGradient(0,24,0,86);sk.addColorStop(0,"#f2c08a");sk.addColorStop(1,"#f8e4c4");a.fillStyle=sk;a.fillRect(229,25,72,60);
 a.fillStyle="#9a98b8";a.beginPath();a.moveTo(229,85);a.lineTo(246,46);a.lineTo(262,70);a.lineTo(280,40);a.lineTo(301,76);a.lineTo(301,85);a.fill();a.fillStyle="#f4f2f6";a.beginPath();a.moveTo(240,58);a.lineTo(246,46);a.lineTo(252,56);a.moveTo(274,52);a.lineTo(280,40);a.lineTo(287,52);a.fill();
 a.fillStyle="#3a5a48";for(var k=0;k<7;k++){a.beginPath();a.moveTo(230+k*11,86);a.lineTo(235+k*11,70);a.lineTo(240+k*11,86);a.fill()}a.fillStyle="#4a2e1a";a.fillRect(263,25,3,60);a.fillRect(229,53,72,3);a.fillStyle="#f4f2ec";a.fillRect(226,86,78,4);
 /* stone fireplace */a.fillStyle="#7a746c";a.fillRect(126,40,74,124);for(var s2=0;s2<14;s2++){a.fillStyle=r()<.5?"#8a847a":"#6a645c";a.fillRect(128+(s2%4)*18,44+(s2>>2)*16,16,14)}a.fillStyle="#2a1810";a.beginPath();a.moveTo(138,164);a.lineTo(138,118);a.quadraticCurveTo(163,98,188,118);a.lineTo(188,164);a.fill();a.fillStyle="#5a3a22";a.fillRect(120,36,86,8);
 a.fillStyle="#b8463a";a.fillRect(140,26,6,10);a.fillStyle="#3a5a8a";a.fillRect(147,24,5,12);a.fillStyle="#c89a3a";a.fillRect(184,30,10,6);
 /* floor and rug */a.fillStyle="#4a2e1a";a.fillRect(0,160,320,40);var rg=a.createRadialGradient(160,186,10,160,186,120);rg.addColorStop(0,"#b84a3a");rg.addColorStop(.7,"#8a2e26");rg.addColorStop(1,"#6a2a20");a.fillStyle=rg;a.beginPath();a.ellipse(160,186,130,18,0,0,6.283);a.fill();a.strokeStyle="#e8c06a";a.lineWidth=1.5;a.beginPath();a.ellipse(160,186,116,14,0,0,6.283);a.stroke();
 if(PX){var D=mk(160,100),dx=D.getContext("2d");dx.drawImage(A,0,0,160,100);a.setTransform(1,0,0,1,0,0);a.imageSmoothingEnabled=false;a.clearRect(0,0,640,400);a.drawImage(D,0,0,640,400)}
 return VB=A}
function vic(c,k){c.save();if(PX)c.imageSmoothingEnabled=false;c.drawImage(vicBase(),0,0,320,200);c.restore();var f=RM?.5:.5+.25*Math.sin(k*9)+.15*Math.sin(k*23);
 var g=c.createRadialGradient(163,150,4,163,150,120);g.addColorStop(0,"rgba(255,170,80,"+(.5+f*.2)+")");g.addColorStop(1,"rgba(255,140,60,0)");c.fillStyle=g;c.fillRect(0,0,320,200);
 c.fillStyle="#f08a2c";c.beginPath();c.moveTo(146,162);c.quadraticCurveTo(152,136-f*10,163,122-f*8);c.quadraticCurveTo(172,138-f*6,180,162);c.fill();c.fillStyle="#ffd36a";c.beginPath();c.moveTo(154,162);c.quadraticCurveTo(160,146-f*6,164,136-f*6);c.quadraticCurveTo(170,148,173,162);c.fill();c.fillStyle="#5a3a22";c.fillRect(144,158,40,5)}
/* pixel mode: the finished world frame is resampled to a coarse grid (3 css px per pixel) and scaled back up with nearest-neighbour, so every sprite, prop, particle and light is true low-res pixel art; labels and battle text are drawn after this, crisp */
var PXB=null;function pxk(c,s){return Math.max(.34,Math.round(ts(c)*s/(3*(window.OBC_DPR||1))*6)/6)}
function pixelate(c,dpr){if(!PX)return;var cv=c.canvas,b=3*dpr,w=Math.ceil(cv.width/b),h=Math.ceil(cv.height/b);if(!PXB)PXB=mk(w,h);if(PXB.width!==w||PXB.height!==h){PXB.width=w;PXB.height=h}var x=PXB.getContext("2d");x.imageSmoothingEnabled=true;x.imageSmoothingQuality="low";x.drawImage(cv,0,0,w*b,h*b,0,0,w,h);
 c.save();c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.drawImage(PXB,0,0,w,h,0,0,w*b,h*b);c.restore();c.imageSmoothingEnabled=true}
/* storybook fights: a lamplit cabin reading room, painted once per fight into an offscreen canvas anchored on the boss (x) and the hero's feet (y).
   It covers the whole visible stage, margins included, so the boss, hero and companion stand in the room instead of on the region map. */
var ARS={1:["#3a3a6a","#c89ab0","#f6c8a0"],anx:["#46507a","#b8a0c8","#f4cfa8"],ptsd:["#2c3a62","#7a88b0","#e8c0a0"],rel:["#5a3a5a","#d29aa8","#f8d2b0"],ocd:["#3a4a6a","#9ab0c8","#f0d8b8"],adhd:["#40507a","#c0a8d0","#f8d8a0"],ed:["#4a3a5a","#c8a0b8","#f6d0b0"],grief:["#4a3050","#b8889a","#f0bc98"],fog:["#4a5468","#a8b0bc","#e8d8c4"]};
var AB=null,AK="",ACT=0;
function arenaPaint(a,ext,reg,hx){var r=seeded(hsh(reg)+31),X0=ext[0],Y0=ext[1],X1=ext[2],Y1=ext[3],yF=-62,P=ARS[reg]||ARS[1];
 /* back wall: warm vertical planks, darker toward the beams */
 var g=a.createLinearGradient(0,Y0,0,yF);g.addColorStop(0,"#3a2414");g.addColorStop(.55,"#6a4426");g.addColorStop(1,"#8a5a32");a.fillStyle=g;a.fillRect(X0,Y0,X1-X0,yF-Y0+2);
 for(var x=Math.floor(X0/28)*28;x<X1;x+=28){a.fillStyle=rgba(r()<.5?"#2a1608":"#c88a50",.05+r()*.08);a.fillRect(x,Y0,28,yF-Y0);a.strokeStyle=rgba(OUT,.38);a.lineWidth=1.4;a.beginPath();a.moveTo(x,Y0);a.lineTo(x,yF);a.stroke();
  for(var k=0;k<2;k++){a.strokeStyle=rgba("#2a1608",.12);a.lineWidth=.8;a.beginPath();var yy=Y0+r()*(yF-Y0);a.moveTo(x+4+r()*20,yy);a.quadraticCurveTo(x+14,yy+20,x+6+r()*16,yy+44);a.stroke()}}
 /* wainscot rail */
 a.fillStyle="#5a3a20";a.fillRect(X0,yF-46,X1-X0,46);a.fillStyle=rgba("#2a1608",.25);for(x=Math.floor(X0/70)*70;x<X1;x+=70){a.fillRect(x+6,yF-40,58,32)}
 a.fillStyle="#9a6a3c";a.fillRect(X0,yF-52,X1-X0,8);a.strokeStyle=rgba(OUT,.9);a.lineWidth=2;a.strokeRect(X0-2,yF-52,X1-X0+4,8);
 /* floor: boards receding toward the wall */
 g=a.createLinearGradient(0,yF,0,Y1);g.addColorStop(0,"#6a4224");g.addColorStop(.4,"#8a5a32");g.addColorStop(1,"#5a3820");a.fillStyle=g;a.fillRect(X0,yF,X1-X0,Y1-yF);
 for(var i=1,yy0=yF;yy0<Y1;i++){var yy1=yF+5*i*i*.55+6*i;a.strokeStyle=rgba(OUT,.42);a.lineWidth=1.2+i*.08;a.beginPath();a.moveTo(X0,yy1);a.lineTo(X1,yy1);a.stroke();
  var off=r()*90;for(x=X0+off;x<X1;x+=120+r()*80){a.beginPath();a.moveTo(x,yy0);a.lineTo(x,yy1);a.stroke()}
  a.fillStyle=rgba("#f0c080",.04+r()*.05);a.fillRect(X0,yy0+1,X1-X0,(yy1-yy0)*.4);yy0=yy1}
 a.fillStyle=rgba("#1a0c04",.35);a.fillRect(X0,yF,X1-X0,5);
 /* arched window onto snowy peaks, behind the boss */
 var wx0=-118,wx1=118,wS=yF-60,wT=-205,wR=118;function wpath(){a.beginPath();a.moveTo(wx0,wS);a.lineTo(wx0,wT);a.arc(0,wT,wR,Math.PI,0);a.lineTo(wx1,wS);a.closePath()}
 a.save();wpath();a.clip();g=a.createLinearGradient(0,wT-wR,0,wS);g.addColorStop(0,P[0]);g.addColorStop(.6,P[1]);g.addColorStop(1,P[2]);a.fillStyle=g;a.fillRect(wx0,wT-wR,wx1-wx0,wS-wT+wR);
 a.fillStyle=rgba("#fff4dc",.85);a.beginPath();a.arc(58,wT-40,13,0,6.283);a.fill();a.fillStyle=rgba("#fff4dc",.18);a.beginPath();a.arc(58,wT-40,26,0,6.283);a.fill();
 var pk=[[-150,wS-40],[-96,wS-150],[-60,wS-110],[-18,wS-176],[30,wS-120],[70,wS-160],[130,wS-70],[150,wS-40]];
 shape(a,pk.concat([[150,wS+4],[-150,wS+4]]),mix(P[0],"#8a90b0",.4),{lw:1.6,flat:1});
 [[-96,wS-150],[-18,wS-176],[70,wS-160]].forEach(function(p){snowCap(a,[[p[0]-22,p[1]+34],[p[0],p[1]],[p[0]+22,p[1]+36],[p[0]+10,p[1]+28],[p[0]+2,p[1]+40],[p[0]-8,p[1]+30]])});
 shape(a,[[-150,wS-30],[-80,wS-70],[-20,wS-48],[40,wS-80],[100,wS-46],[150,wS-60],[150,wS+4],[-150,wS+4]],mix(P[0],"#5a6a8a",.5),{lw:1.4,flat:1});
 for(i=0;i<9;i++){var tx=wx0+8+i*28+r()*10,th=26+r()*22;shape(a,[[tx,wS-th],[tx-10,wS-th*.45],[tx-6,wS-th*.45],[tx-13,wS],[tx+13,wS],[tx+6,wS-th*.45],[tx+10,wS-th*.45]],"#2e4a42",{lw:1.2,flat:1});a.fillStyle=rgba("#f4f2ec",.8);a.fillRect(tx-8,wS-th*.48,16,2)}
 a.fillStyle="#f4f2ec";a.fillRect(wx0,wS-6,wx1-wx0,8);a.restore();
 /* window frame, mullions, sill */
 a.lineJoin="round";wpath();a.strokeStyle=OUT;a.lineWidth=17;a.stroke();a.strokeStyle="#8a5a32";a.lineWidth=12;a.stroke();a.strokeStyle=rgba("#e8b878",.5);a.lineWidth=2;a.stroke();
 a.save();wpath();a.clip();a.strokeStyle=OUT;a.lineWidth=7;a.beginPath();a.moveTo(0,wT-wR);a.lineTo(0,wS);a.moveTo(wx0,wT+20);a.lineTo(wx1,wT+20);a.stroke();a.strokeStyle="#9a6a3c";a.lineWidth=4;a.stroke();a.restore();
 shape(a,[[wx0-22,wS],[wx1+22,wS],[wx1+16,wS+12],[wx0-16,wS+12]],"#9a6a3c",{lw:2});
 /* curtains */
 [[-1,"#a8402e"],[1,"#a8402e"]].forEach(function(q){var s=q[0],x0=s*(wR+6),x1=s*(wR+44);shape(a,[[x0-s*4,wT-wR+10],[x1,wT-wR+4],[x1+s*6,wT],[x1-s*2,wS+20],[x1+s*4,wS+30],[x0+s*14,wS+30],[x0+s*24,wT+30],[x0-s*2,wT-40]],q[1],{lw:2.2});
  a.strokeStyle=rgba("#5a1e14",.45);a.lineWidth=1.4;for(var j=1;j<4;j++){a.beginPath();a.moveTo(x0+s*(8+j*8),wT-wR+12);a.quadraticCurveTo(x0+s*(4+j*10),wT,x0+s*(10+j*7),wS+26);a.stroke()}
  paint(a,ell(x0+s*20,wT+32,6,5,a),"#e8c06a",[x0+s*20,wT+32,6,5])});
 a.fillStyle="#5a3a20";a.fillRect(-wR-64,wT-wR-2,2*wR+128,7);a.strokeStyle=OUT;a.lineWidth=1.6;a.strokeRect(-wR-64,wT-wR-2,2*wR+128,7);
 /* bookshelves: three cases, books in warm library colours, a ladder */
 var BC=["#8a2e22","#2e4a6a","#3e6a4a","#b8862e","#6a3a5a","#a8562e","#2a3a4a","#c8a868","#5a2a1a","#4a5a3a"];
 function shelf(x0,x1,top){var bot=yF+16;shape(a,[[x0-8,top-10],[x1+8,top-10],[x1+8,bot],[x0-8,bot]],"#6a4224",{lw:2.4,flat:1});a.fillStyle="#2e1a0c";a.fillRect(x0,top,x1-x0,bot-top-10);
  for(var y=top+52;y<bot-6;y+=52){var bx=x0+2;while(bx<x1-6){var bw=7+r()*7,bh=30+r()*16;if(bx+bw>x1-2)break;if(r()<.08&&bx+20<x1){bk(a,bx,y,22,8,BC[(r()*BC.length)|0]);bk(a,bx+2,y-8,18,7,BC[(r()*BC.length)|0]);bx+=24;continue}
    if(r()<.06){a.save();a.translate(bx,y);a.rotate(-.22);bk(a,0,0,bw,bh,BC[(r()*BC.length)|0],{lw:1.4,flat:1});a.restore();bx+=bw+8;continue}bk(a,bx,y,bw,bh,BC[(r()*BC.length)|0],{lw:1.4,flat:1});bx+=bw+.6}
   a.fillStyle="#8a5a32";a.fillRect(x0-4,y,x1-x0+8,7);a.strokeStyle=OUT;a.lineWidth=1.6;a.strokeRect(x0-4,y,x1-x0+8,7)}
  a.fillStyle=rgba("#1a0c04",.3);a.fillRect(x0,top,x1-x0,14)}
 shelf(-400,-182,-330);shelf(400,640,-330);shelf(-680,-418,-330);if(X1>650)shelf(660,900,-330);if(X0<-690)shelf(-940,-700,-330);
 a.lineCap="round";[[-330,-250]].forEach(function(l){a.strokeStyle=OUT;a.lineWidth=8;a.beginPath();a.moveTo(l[0],yF+22);a.lineTo(l[0]+40,-320);a.moveTo(l[1],yF+22);a.lineTo(l[1]+40,-320);a.stroke();a.strokeStyle="#b07a44";a.lineWidth=5;a.stroke();
  for(var j=0;j<9;j++){var u=(j+.5)/9,y=yF+22+(-320-yF-22)*u;a.strokeStyle=OUT;a.lineWidth=6;a.beginPath();a.moveTo(l[0]+40*u,y);a.lineTo(l[1]+40*u,y);a.stroke();a.strokeStyle="#c88a50";a.lineWidth=3.4;a.stroke()}});
 /* stone hearth with a mantel of books and candles */
 var hx0=176,hx1=380,mT=yF-118;for(var sy=yF+14;sy>Y0;sy-=24){for(var sx=hx0+((sy/24|0)%2?0:-14);sx<hx1;sx+=34+r()*10){var w=Math.min(30+r()*10,hx1-sx);if(w<10)continue;shape(a,[[sx+2,sy],[sx+w,sy],[sx+w,sy-22],[sx+2,sy-22]],mix("#8a7a6a","#b8a088",r()),{lw:1.6,flat:1})}}
 shape(a,[[218,yF+14],[218,yF-58],[248,yF-88],[308,yF-88],[338,yF-58],[338,yF+14]],"#2a140a",{lw:2.6,flat:1,noLine:0});
 g=a.createRadialGradient(278,yF,4,278,yF-20,80);g.addColorStop(0,"#c8501e");g.addColorStop(1,"rgba(60,20,8,0)");a.fillStyle=g;a.fillRect(218,yF-90,120,104);
 bk(a,236,yF+8,84,9,"#4a2a14");bk(a,244,yF-1,70,9,"#5a3420");
 shape(a,[[hx0-16,mT],[hx1+16,mT],[hx1+12,mT+16],[hx0-12,mT+16]],"#7a4a28",{lw:2.4});
 bk(a,196,mT,12,40,"#2e4a6a");bk(a,208,mT,10,34,"#8a2e22");bk(a,218,mT,13,42,"#3e6a4a");a.save();a.translate(232,mT);a.rotate(-.3);bk(a,0,0,10,36,"#b8862e");a.restore();
 bk(a,312,mT,40,9,"#6a3a5a");bk(a,316,mT-9,32,8,"#2e4a6a");
 shape(a,[[268,mT],[290,mT],[288,mT-14],[270,mT-14]],"#a8562e",{lw:1.6});paint(a,ell(279,mT-24,14,12,a),"#4a7a4a",[279,mT-24,14,12]);
 [[258,mT,20],[340,mT-17,14],[352,mT-17,10]].forEach(function(cd){shape(a,[[cd[0]-3.5,cd[1]],[cd[0]+3.5,cd[1]],[cd[0]+3.5,cd[1]-cd[2]],[cd[0]-3.5,cd[1]-cd[2]]],"#f4ead2",{lw:1.3,flat:1})});
 /* ceiling beam */
 shape(a,[[X0-10,Y0-10],[X1+10,Y0-10],[X1+10,-334],[X0-10,-334]],"#4a2c16",{lw:2.6,flat:1});a.fillStyle=rgba("#e8b878",.2);a.fillRect(X0,-344,X1-X0,3);
 /* rug: a braided oval under the hero and companion */
 var rc=["#9a4a36","#d8b878","#5a7a66","#eadcc0","#8a4a32","#c09a5a","#4e6278"];a.save();a.translate(hx,8);
 a.fillStyle=rgba("#1a0c04",.35);a.beginPath();a.ellipse(4,6,236,56,0,0,6.283);a.fill();
 for(i=0;i<8;i++){var k2=1-i/8;a.fillStyle=mix(rc[i%rc.length],"#8a5a3a",.22);a.beginPath();a.ellipse(0,0,230*k2,52*k2,0,0,6.283);a.fill();a.strokeStyle=rgba(OUT,.45);a.lineWidth=1.2;a.stroke();
  a.strokeStyle=rgba("#fff6e0",.25);a.lineWidth=1;a.setLineDash([4,5]);a.beginPath();a.ellipse(0,0,230*k2-3,52*k2-1.5,0,0,6.283);a.stroke();a.setLineDash([])}
 a.strokeStyle=OUT;a.lineWidth=2.2;a.beginPath();a.ellipse(0,0,230,52,0,0,6.283);a.stroke();a.restore();
 /* floor book stacks with candles, an armchair corner and a basket of logs */
 function stack(x,y,n){for(var j=0;j<n;j++){var w=34+r()*12;bk(a,x-w/2+(r()-.5)*6,y-j*8,w,8,BC[(r()*BC.length)|0])}shape(a,[[x-4,y-n*8],[x+4,y-n*8],[x+4,y-n*8-18],[x-4,y-n*8-18]],"#f4ead2",{lw:1.3,flat:1});return[x,y-n*8-18]}
 var C1=stack(-238,-8,5),C2=stack(410,30,4),C3=stack(-470,40,6);
 shape(a,[[392,yF+8],[452,yF+8],[446,yF+40],[398,yF+40]],"#a8743e",{lw:2});for(i=0;i<4;i++)paint(a,ell(404+i*12,yF+4-(i%2)*6,7,7,a),"#7a4a28",[404+i*12,yF+4,7,7]);
 /* gouache finish: paper grain, a warm wash pooled at the hearth, soft vignette away from the stage */
 a.globalCompositeOperation="multiply";a.globalAlpha=.22;a.fillStyle=grain(a);a.fillRect(X0,Y0,X1-X0,Y1-Y0);a.globalAlpha=1;
 g=a.createRadialGradient(0,-80,120,0,-80,620);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(1,"rgba(120,80,60,1)");a.fillStyle=g;a.fillRect(X0,Y0,X1-X0,Y1-Y0);a.globalCompositeOperation="source-over";
 for(i=0;i<260;i++){var bx2=X0+r()*(X1-X0),by2=Y0+r()*(Y1-Y0);a.strokeStyle=rgba(r()<.5?"#fff0d0":"#3a2010",.035);a.lineWidth=3+r()*5;a.beginPath();a.moveTo(bx2,by2);a.quadraticCurveTo(bx2+10,by2+(r()-.5)*8,bx2+22+r()*20,by2+(r()-.5)*10);a.stroke()}
 return{c:[C1,C2,C3,[258,mT-20],[340,mT-31],[352,mT-27]]}}
function arena(c,s,t,B,P){if(!SB||!B)return false;var T=c.getTransform(),cv=c.canvas,iv=T.inverse();
 if(!B._ar)B._ar={x:B.e.x,y:P.y,hx:Math.max(-120,Math.min(120,P.x-B.e.x))};var A=B._ar,p0=iv.transformPoint({x:0,y:0}),p1=iv.transformPoint({x:cv.width,y:cv.height});
 var vx0=p0.x-A.x,vy0=p0.y-A.y,vx1=p1.x-A.x,vy1=p1.y-A.y,sc=Math.hypot(T.a,T.b),reg=B.e.reg||s.g||"1";
 if(!AB||AK!==reg+"|"+A.hx||vx0<AB.e[0]||vy0<AB.e[1]||vx1>AB.e[2]||vy1>AB.e[3]){var m=90,e=[Math.floor(Math.min(vx0,-260)-m),Math.floor(Math.min(vy0,-360)-m),Math.ceil(Math.max(vx1,260)+m),Math.ceil(Math.max(vy1,200)+m)],k=Math.max(1.2,Math.min(2.6,sc));
  while((e[2]-e[0])*(e[3]-e[1])*k*k>7e6&&k>1)k-=.1;var cvs=AB&&AB.cv||mk(1,1);cvs.width=Math.ceil((e[2]-e[0])*k);cvs.height=Math.ceil((e[3]-e[1])*k);var a=cvs.getContext("2d");a.setTransform(k,0,0,k,-e[0]*k,-e[1]*k);
  var info=arenaPaint(a,e,reg,A.hx);AB={cv:cvs,e:e,c:info.c};AK=reg+"|"+A.hx}
 c.save();c.translate(A.x,A.y);c.drawImage(AB.cv,AB.e[0],AB.e[1],AB.e[2]-AB.e[0],AB.e[3]-AB.e[1]);
 var f=RM?.5:.5+.22*Math.sin(t*.009)+.14*Math.sin(t*.023+1),yF=-62;
 /* hearth fire and its light across the room */
 c.globalCompositeOperation="lighter";var g=c.createRadialGradient(278,yF-30,10,278,yF-30,300);g.addColorStop(0,"rgba(255,150,60,"+(.26+f*.1)+")");g.addColorStop(1,"rgba(255,120,40,0)");c.fillStyle=g;c.fillRect(-40,yF-330,640,460);
 g=c.createRadialGradient(0,-120,20,0,-120,260);g.addColorStop(0,"rgba(255,220,170,.10)");g.addColorStop(1,"rgba(255,200,140,0)");c.fillStyle=g;c.fillRect(-260,-380,520,520);c.globalCompositeOperation="source-over";
 for(var i=0;i<4;i++){var fx=250+i*18,fh=.9+.5*Math.sin(t*.011+i*1.7)*(RM?0:1)+(i%2?.3:.5);flame(c,fx,yF-8,fh)}
 AB.c.forEach(function(p,j){var q=RM?0:Math.sin(t*.013+j*2.1);c.globalCompositeOperation="lighter";var g2=c.createRadialGradient(p[0],p[1]-6,1,p[0],p[1]-6,34);g2.addColorStop(0,"rgba(255,200,110,"+(.32+q*.06)+")");g2.addColorStop(1,"rgba(255,170,80,0)");c.fillStyle=g2;c.fillRect(p[0]-34,p[1]-40,68,68);c.globalCompositeOperation="source-over";flame(c,p[0],p[1],.42+q*.04)});
 /* snow outside the window only */
 c.save();c.beginPath();c.moveTo(-118,yF-60);c.lineTo(-118,-205);c.arc(0,-205,118,Math.PI,0);c.lineTo(118,yF-60);c.closePath();c.clip();c.fillStyle="rgba(255,255,255,.85)";
 for(i=0;i<26;i++){var u=rn(i),v=rn(i+40),yy=((v*300+(RM?0:t*.018*(.6+u)))%300)-330,xx=-118+u*236+Math.sin(t*.001+i)*6;c.beginPath();c.arc(xx,yy,1+u*1.4,0,6.283);c.fill()}c.restore();
 /* dust motes in the warm light */
 if(!RM)for(i=0;i<14;i++){var u2=rn(i+90),ph=(t*.00004*(1+u2)+u2)%1;c.fillStyle="rgba(255,226,160,"+(.35*Math.sin(ph*3.14))+")";c.beginPath();c.arc(-200+u2*480+Math.sin(t*.0007+i)*14,-40-ph*240,1.3,0,6.283);c.fill()}
 /* soft contact shadows for the stage */
 c.fillStyle="rgba(30,14,4,.28)";c.beginPath();c.ellipse(P.x-A.x,P.y-A.y+2,30,7,0,0,6.283);c.fill();c.fillStyle="rgba(30,14,4,.16)";c.beginPath();c.ellipse(B.e.x-A.x,yF+40,70,12,0,0,6.283);c.fill();
 c.restore();ACT=t;return true}
window.OBC_COZY={name:M,ink:SB?"#3d2a1c":DI?"#2e2420":"#2a1a22",bg:SB?"#2a1c12":DI?"#3a2a1e":"#22161c",plate:plate,post:function(A,s){},sp:SP,fx:fx,live:live,ripple:ripple,margin:margin,ground:ground,frame:frame,vic:vic,nn:PX,pixelate:pixelate,deco:deco,arena:SB?arena:null};
window.OBC_CHARS={fig:fig,cloud:cloud,pet:pet,v:M};
})();
