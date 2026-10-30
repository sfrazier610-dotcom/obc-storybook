(function(){"use strict";
/* shared: guide wardrobe (clothing/color/props only, generic non-likeness figures) + pose rig */
var GD={makayla:{coat:"#c9798d",hair:"#3a2414",skin:"#e0ac84",hs:"bun",prop:"book",acc:"#f2e2b0",pants:"#5a4a5a"},
amber:{coat:"#3f8f8a",hair:"#a8682c",skin:"#f3d2b3",hs:"bob",prop:"mug",acc:"#e8a33a",pants:"#3a4a5a"},
abby:{coat:"#6f7a3a",hair:"#1e1a1a",skin:"#9a6440",hs:"curly",prop:"lantern",acc:"#c8322a",pants:"#4a3a2a"},
shanna:{coat:"#7a4a8a",hair:"#6a3e1e",skin:"#c68a62",hs:"long",prop:"umbrella",acc:"#e8c070",pants:"#3a2a4a"},
aspen:{coat:"#4a8a5a",hair:"#d8b060",skin:"#f3d2b3",hs:"cap",prop:"pack",acc:"#c8602a",pants:"#5a4030"},
scott:{coat:"#3a4a7a",hair:"#5a3a1e",skin:"#e0ac84",hs:"short",prop:"staff",acc:"#a0703a",pants:"#3a3a4a"},
amanda:{coat:"#c08a3a",hair:"#7a7a82",skin:"#6e4428",hs:"wavy",prop:"flowers",acc:"#7a3a5a",pants:"#4a3a3a"}};
function spec(p){var g=GD[p.who];if(g)return g;var hero=p.who==="hero";return{coat:p.coat,hair:p.hair,skin:p.skin,hs:hero?["short","long","pig"][(p.body|0)%3]:["short","bob","long","curly","bun","cap"][(p.seed||0)%6],prop:hero?"satchel":["","basket","","hoe","",""][(p.acc||0)%6],acc:p.acc2||"#c9a24a",pants:p.pants||"#4a4a6a",hero:hero}}
function seedOf(p){var s=0,k=p.who||"";for(var i=0;i<k.length;i++)s=(s*31+k.charCodeAt(i))%997;return (s%100)/16+(p.seed||0)}
function rig(p,t,RM){var T=t||0,sd=seedOf(p),wk=p.walk||0;return{T:T,sd:sd,wk:wk,lift:Math.abs(wk),idle:RM?0:Math.sin(T/650+sd),blink:!RM&&((T/1000+sd*.73)%3.7)<.13,sway:RM?0:Math.sin(T/480+sd)}}
function shade(h,k){var n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;if(k<1){r*=k;g*=k;b*=k}else{r+=(255-r)*(k-1);g+=(255-g)*(k-1);b+=(255-b)*(k-1)}return"rgb("+(r|0)+","+(g|0)+","+(b|0)+")"}
function hex(h,k){var n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;if(k<1){r*=k;g*=k;b*=k}else{r+=(255-r)*(k-1);g+=(255-g)*(k-1);b+=(255-b)*(k-1)}return"#"+((1<<24)+((r|0)<<16)+((g|0)<<8)+(b|0)).toString(16).slice(1)}
/* Version A: sumi-e brush figures. Tapered ink strokes, ink-wash shading, flowing robe hems and sleeves that trail the motion. */
var K="#1a1410";
function taper(c,pts,w){for(var i=1;i<pts.length;i++){var f=i/pts.length;c.lineWidth=w*(.35+.9*Math.sin(Math.PI*f));c.beginPath();c.moveTo(pts[i-1][0],pts[i-1][1]);c.lineTo(pts[i][0],pts[i][1]);c.stroke()}}
function wash(c,path,col,dx){c.save();c.beginPath();path();c.fillStyle=col;c.fill();c.clip();var g=c.createLinearGradient(-14+dx,0,16+dx,0);g.addColorStop(0,"rgba(255,250,235,.28)");g.addColorStop(.45,"rgba(255,250,235,0)");g.addColorStop(1,"rgba(26,20,16,.32)");c.fillStyle=g;c.fillRect(-30,-70,60,72);c.restore()}
function ink(c,path,w){c.strokeStyle=K;c.lineJoin="round";c.lineCap="round";c.lineWidth=w;c.beginPath();path();c.stroke();c.globalAlpha=.35;c.lineWidth=w*.5;c.save();c.translate(.5,.6);c.beginPath();path();c.stroke();c.restore();c.globalAlpha=1}
function props(c,d,r,L){var a=d.acc;c.strokeStyle=K;c.lineCap="round";switch(d.prop){
 case"book":c.save();c.translate(11,-24);c.rotate(-.2);c.fillStyle=a;c.fillRect(-4,-5,8,10);c.lineWidth=L*.8;c.strokeRect(-4,-5,8,10);c.beginPath();c.moveTo(0,-5);c.lineTo(0,5);c.stroke();c.restore();break;
 case"mug":c.fillStyle="#f4ead2";c.fillRect(10,-25,6,6);c.lineWidth=L*.8;c.strokeRect(10,-25,6,6);c.beginPath();c.arc(17,-22,2,-1.5,1.5);c.stroke();c.strokeStyle="rgba(26,20,16,.35)";c.lineWidth=.8;for(var i=0;i<2;i++){c.beginPath();c.moveTo(12+i*2,-27);c.quadraticCurveTo(10+i*2+Math.sin(r.T/300+i)*2,-31,13+i*2,-34);c.stroke()}break;
 case"lantern":var gl=.25+(.08*Math.sin(r.T/400));c.lineWidth=L*.7;c.beginPath();c.moveTo(14,-20);c.lineTo(14,-15);c.stroke();c.fillStyle="#f4c058";c.beginPath();c.ellipse(14,-11,3.6,4.6,0,0,6.283);c.fill();c.stroke();c.fillStyle="rgba(255,214,120,"+gl+")";c.beginPath();c.arc(14,-11,11,0,6.283);c.fill();break;
 case"umbrella":c.lineWidth=L*.8;c.beginPath();c.moveTo(13,-6);c.lineTo(13,-30);c.stroke();c.beginPath();c.moveTo(13,-6);c.arc(11,-6,2,0,3.1);c.stroke();c.fillStyle=a;c.beginPath();c.moveTo(13,-36);c.lineTo(19,-28);c.lineTo(13,-30);c.closePath();c.fill();c.stroke();break;
 case"pack":c.fillStyle=a;c.beginPath();c.moveTo(-15,-36);c.lineTo(-19,-34);c.lineTo(-19,-20);c.lineTo(-13,-19);c.closePath();c.fill();c.lineWidth=L*.8;c.stroke();break;
 case"staff":c.lineWidth=L*1.1;c.strokeStyle="#6a4a2a";c.beginPath();c.moveTo(15,0);c.quadraticCurveTo(16,-25,13,-46);c.stroke();c.strokeStyle=K;c.lineWidth=L*.5;c.stroke();c.fillStyle=a;c.beginPath();c.arc(13,-46,2.2,0,6.283);c.fill();break;
 case"flowers":c.lineWidth=.9;c.strokeStyle="#3a6a2a";for(var j=0;j<3;j++){c.beginPath();c.moveTo(13,-18);c.lineTo(10+j*3,-28);c.stroke()}["#ff8fb0","#f4c058","#c7a6ff"].forEach(function(f,j){c.fillStyle=f;c.beginPath();c.arc(10+j*3,-29,2.2,0,6.283);c.fill()});break;
 case"satchel":c.fillStyle="#a0703a";c.lineWidth=L*.7;c.beginPath();c.moveTo(-7,-38);c.lineTo(10,-16);c.stroke();c.beginPath();c.roundRect?c.roundRect(-16,-21,8,7,2):c.rect(-16,-21,8,7);c.fill();c.stroke();break;
 case"basket":c.fillStyle="#c89a58";c.lineWidth=L*.7;c.beginPath();c.ellipse(14,-16,5,3.5,0,0,3.15);c.fill();c.stroke();c.beginPath();c.arc(14,-16,4,3.3,6.1);c.stroke();break;
 case"hoe":c.lineWidth=L;c.strokeStyle="#6a4a2a";c.beginPath();c.moveTo(15,-2);c.lineTo(13,-44);c.stroke();c.fillStyle="#7a7a82";c.fillRect(9,-46,8,3);break}}
function hair(c,d,r,L,back,hy){var H=d.hair,s=r.sway;var p=function(f){c.beginPath();f();c.fillStyle=H;c.fill();ink(c,f,L*.8)};
 if(back){p(function(){c.arc(0,hy-1,10.5,0,6.283)});if(d.hs==="long"||d.hs==="wavy")p(function(){c.moveTo(-10,hy);c.quadraticCurveTo(-11+s,hy+16,-6+s,hy+20);c.lineTo(6+s,hy+20);c.quadraticCurveTo(11+s,hy+16,10,hy)});if(d.hs==="bun")p(function(){c.arc(0,hy-10,4.5,0,6.283)});return}
 if(d.hs==="pig"){p(function(){c.ellipse(-11.5,hy+5+s*.4,3,6,.3,0,6.283)});p(function(){c.ellipse(11.5,hy+5+s*.4,3,6,-.3,0,6.283)})}
 if(d.hs==="bun")p(function(){c.arc(0,hy-11,4.5,0,6.283)});
 if(d.hs==="curly")p(function(){for(var i=0;i<7;i++){var a=Math.PI+i*Math.PI/6;c.moveTo(Math.cos(a)*10+3.6,hy+Math.sin(a)*10);c.arc(Math.cos(a)*10,hy+Math.sin(a)*10,3.6,0,6.283)}});
 p(function(){c.moveTo(-10.5,hy+1);c.quadraticCurveTo(-11,hy-12,0,hy-11.5);c.quadraticCurveTo(11,hy-12,10.5,hy+1);c.quadraticCurveTo(7,hy-6,1,hy-5.5);c.quadraticCurveTo(-5,hy-7,-10.5,hy+1)});
 if(d.hs==="cap"){p(function(){c.moveTo(-11,hy-3);c.quadraticCurveTo(0,hy-17,11,hy-3);c.closePath()});c.fillStyle=d.acc;c.beginPath();c.moveTo(-11,hy-3);c.quadraticCurveTo(0,hy-17,11,hy-3);c.closePath();c.fill();ink(c,function(){c.moveTo(-11,hy-3);c.lineTo(16,hy-3)},L)}
 c.strokeStyle="rgba(26,20,16,.45)";c.lineWidth=.6;for(var k=0;k<3;k++){c.beginPath();c.moveTo(-6+k*5,hy-10);c.quadraticCurveTo(-4+k*5,hy-7,-5+k*5,hy-5);c.stroke()}}
function face(c,d,r,L,hy){c.fillStyle=K;c.strokeStyle=K;c.lineCap="round";
 if(r.blink){c.lineWidth=1.1;c.beginPath();c.moveTo(-5,hy+1);c.quadraticCurveTo(-3.5,hy+2,-2,hy+1);c.moveTo(2,hy+1);c.quadraticCurveTo(3.5,hy+2,5,hy+1);c.stroke()}
 else{c.beginPath();c.ellipse(-3.5,hy+.5,1.3,1.8,0,0,6.283);c.ellipse(3.5,hy+.5,1.3,1.8,0,0,6.283);c.fill();c.fillStyle="#fff";c.beginPath();c.arc(-3.1,hy-.2,.45,0,6.283);c.arc(3.9,hy-.2,.45,0,6.283);c.fill()}
 c.lineWidth=.9;c.beginPath();c.moveTo(-6,hy-3.2);c.quadraticCurveTo(-3.5,hy-4.4-(d.hero?0:.6),-1.6,hy-3.4);c.moveTo(1.6,hy-3.4);c.quadraticCurveTo(3.5,hy-4.4-(d.hero?0:.6),6,hy-3.2);c.stroke();
 c.fillStyle="rgba(222,110,100,.45)";c.beginPath();c.ellipse(-6.2,hy+3.6,1.9,1.2,0,0,6.283);c.ellipse(6.2,hy+3.6,1.9,1.2,0,0,6.283);c.fill();
 c.lineWidth=1;c.beginPath();c.arc(0,hy+3.3,2.4,.35,2.8);c.stroke()}
function fig(c,x,y,h,p,t,flip,E){var d=spec(p),r=rig(p,t,E.RM),s=h/58,L=Math.max(1.1,2*s)/s,wk=r.wk,bob=-r.lift*1.6+r.idle*.4,sw=r.sway*1.2+wk*2.2;
 c.save();c.translate(x,y);c.scale(flip?-s:s,s);
 c.fillStyle="rgba(26,20,16,.18)";c.beginPath();c.ellipse(0,0,13+r.lift*2,3.2,0,0,6.283);c.fill();
 c.fillStyle="rgba(26,20,16,.12)";c.beginPath();c.ellipse(-2,.5,9,1.8,0,0,6.283);c.fill();
 /* feet step under the hem */
 var fl=wk*5,fr=-wk*5;[[fl,wk>0?-1.5*wk:0],[fr,wk<0?1.5*wk:0]].forEach(function(f,i){c.fillStyle=d.pants;c.fillRect(-4+i*5+f[0]*.5,-10+f[1],3.4,8);c.beginPath();c.ellipse(-2.4+i*5+f[0],-1.8+f[1],4.2,2,0,0,6.283);c.fillStyle="#2a1c14";c.fill()});
 c.translate(0,bob);
 /* robe: hem ripples and trails opposite the step */
 var hem=function(){c.moveTo(-8,-38);c.quadraticCurveTo(-12,-25,-14-sw*.6,-8);for(var i=0;i<=4;i++){var hx=-14+i*7-sw*.6+(i===4?sw*0:0),hy2=-7+Math.sin(r.T/260+i*1.7+r.sd)*(E.RM?0:.9)+(i%2?1.2:0);c.lineTo(hx,hy2)}c.quadraticCurveTo(12,-25,8,-38);c.quadraticCurveTo(0,-41,-8,-38)};
 if(d.prop==="pack")props(c,d,r,L);
 wash(c,hem,d.coat,0);ink(c,hem,L);
 c.strokeStyle="rgba(26,20,16,.5)";taper(c,[[2,-30],[3+sw*.3,-20],[1-sw*.5,-9]],1.4);taper(c,[[-4,-28],[-6-sw*.2,-16],[-7-sw*.4,-9]],1);
 /* collar + sash with trailing tail */
 ink(c,function(){c.moveTo(-6,-37.5);c.lineTo(1.5,-28);c.lineTo(6,-37.5)},L*.7);
 c.fillStyle=d.acc;c.fillRect(-11,-25,22,3.4);ink(c,function(){c.rect(-11,-25,22,3.4)},L*.6);
 c.beginPath();c.moveTo(-9,-22);c.quadraticCurveTo(-12-sw,-16,-13-sw*1.6,-11);c.lineTo(-10-sw,-12);c.closePath();c.fill();ink(c,function(){c.moveTo(-9,-22);c.quadraticCurveTo(-12-sw,-16,-13-sw*1.6,-11)},L*.5);
 /* sleeves swing with the step, hands lead */
 [[-1,wk],[1,-wk]].forEach(function(q){var k=q[0],a=q[1]*3.4,sl=function(){c.moveTo(k*7.5,-37);c.quadraticCurveTo(k*15,-30,k*14+a,-19);c.lineTo(k*9+a,-17-r.lift);c.quadraticCurveTo(k*9,-27,k*5.5,-32)};wash(c,sl,shade(d.coat,.85),k*4);ink(c,sl,L*.8);c.beginPath();c.arc(k*12+a,-17.5,2.5,0,6.283);c.fillStyle=d.skin;c.fill();ink(c,function(){c.arc(k*12+a,-17.5,2.5,0,6.283)},L*.5)});
 var hy=-48+r.idle*.3;
 if(!p.back&&(d.hs==="long"||d.hs==="wavy")){var s2=r.sway,hf=function(){c.moveTo(-10,hy-3);c.quadraticCurveTo(-14+s2*.8,hy+12,-9+s2,hy+20);c.lineTo(9+s2,hy+20);c.quadraticCurveTo(14+s2*.8,hy+12,10,hy-3)};c.beginPath();hf();c.fillStyle=d.hair;c.fill();ink(c,hf,L*.8)}
 /* head with wash shadow */
 var hd=function(){c.ellipse(0,hy,9.6,10.2,0,0,6.283)};wash(c,hd,d.skin,2);ink(c,hd,L);
 hair(c,d,r,L,p.back,hy);if(!p.back)face(c,d,r,L,hy);
 if(d.prop!=="pack"&&!p.back)props(c,d,r,L);
 c.restore();return true}
function cloud(c,x,y,r,col,t,boss,hap,E){var T=t||0,RM=E.RM,bob=RM?0:Math.sin(T/600)*2.2,s=r/26,tint=col&&col.length===7?col:"#9a9aa8";c.save();c.translate(x,y+bob);c.scale(s,s);
 var br=RM?1:1+Math.sin(T/700)*.03;c.scale(br,2-br);
 var lobes=[[-17,4,11],[-7,-7,14],[8,-6,13],[18,4,10.5],[0,8,12.5],[-9,9,9],[10,9,9]];
 var pth=function(){lobes.forEach(function(l,i){var w=RM?0:Math.sin(T/500+i)*.6;c.moveTo(l[0]+l[2]+w,l[1]);c.arc(l[0],l[1],l[2]+w,0,6.283)})};
 /* ink wash body: dark storm ink when upset, warm paper when calmed */
 c.strokeStyle=K;c.lineJoin="round";c.lineWidth=boss?6.5:5;c.beginPath();pth();c.stroke();c.globalAlpha=.25;c.lineWidth=boss?11:9;c.beginPath();pth();c.stroke();c.globalAlpha=1;
 c.fillStyle=hap?"#fbf3e0":"#cfcbd6";c.beginPath();pth();c.fill();
 c.save();c.beginPath();pth();c.clip();var g=c.createLinearGradient(0,-20,0,22);g.addColorStop(0,hap?"rgba(255,255,255,.6)":"rgba(255,255,255,.25)");g.addColorStop(.5,"rgba(0,0,0,0)");g.addColorStop(1,hap?shade(tint,1.3):shade(tint,.55));c.fillStyle=g;c.fillRect(-32,-24,64,48);
 c.globalAlpha=hap?.15:.18;c.strokeStyle=hap?"#c9a24a":K;c.lineWidth=1.2;for(var i=0;i<3;i++){c.beginPath();var q=[[-14,2,6],[9,-7,6],[17,5,4]][i];for(var u=0;u<=24;u++){var th=u/24*8+(RM?0:T/900)*(i%2?1:-1),rr=q[2]*(1-u/28);u?c.lineTo(q[0]+Math.cos(th)*rr,q[1]+Math.sin(th)*rr):c.moveTo(q[0]+rr,q[1])}c.stroke()}c.globalAlpha=1;c.restore();
 /* dry-brush flicks off the rim */c.strokeStyle=K;c.lineCap="round";[[-28,-2,-33,-6],[27,0,32,-3],[-12,-21,-15,-25],[14,-19,18,-23]].forEach(function(f){c.lineWidth=1.6;c.beginPath();c.moveTo(f[0],f[1]);c.lineTo(f[2],f[3]);c.stroke()});
 if(!hap&&!RM){c.strokeStyle="rgba(26,20,16,.4)";c.lineWidth=1.1;for(var d=0;d<3;d++){var dy=((T/12+d*9)%18);c.beginPath();c.moveTo(-10+d*10,20+dy);c.lineTo(-11+d*10,24+dy);c.stroke()}}
 /* face */
 c.strokeStyle=K;c.fillStyle=K;c.lineCap="round";
 if(hap){c.lineWidth=2;c.beginPath();c.arc(-6,1,2.8,3.5,5.9);c.moveTo(8.8,1);c.arc(6,1,2.8,3.5,5.9);c.stroke();c.beginPath();c.arc(0,4,5,.25,2.9);c.stroke();c.fillStyle="rgba(235,120,120,.55)";c.beginPath();c.ellipse(-11,5,3,1.8,0,0,6.283);c.ellipse(11,5,3,1.8,0,0,6.283);c.fill()}
 else{c.lineWidth=2.2;c.beginPath();c.moveTo(-11,-5);c.quadraticCurveTo(-7,-5,-3,-2);c.moveTo(11,-5);c.quadraticCurveTo(7,-5,3,-2);c.stroke();c.beginPath();c.ellipse(-6,1.5,1.7,2.2,0,0,6.283);c.ellipse(6,1.5,1.7,2.2,0,0,6.283);c.fill();c.lineWidth=2.4;c.beginPath();c.moveTo(-5,11);c.quadraticCurveTo(0,6.5,5,11);c.stroke()}
 c.restore();return true}
window.OBC_CHARS={fig:fig,cloud:cloud,v:"a"}})();
