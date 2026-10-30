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
/* Version Okami-inspired (original): bold tapered sumi outlines, flat cel fills on washi grain, vermilion brush markings, trailing ribbons. Based on Version A. v2: ~4.8-head painted proportions, hakama + long sleeves, LOD markings, cloth ribbon, symmetric swirl bosses. Tapered ink strokes, ink-wash shading, flowing robe hems and sleeves that trail the motion. */
var K="#141010",VR="#d2381e";var GRN=null;function grain(c){if(!GRN){var g=document.createElement("canvas");g.width=g.height=48;var x=g.getContext("2d"),sd=7;for(var i=0;i<260;i++){sd=(sd*9301+49297)%233280;var a=sd/233280;sd=(sd*9301+49297)%233280;var b=sd/233280;x.fillStyle=i%3?"rgba(90,60,30,.5)":"rgba(255,255,255,.7)";x.fillRect(a*48|0,b*48|0,1,i%7?1:3)}GRN=c.createPattern(g,"repeat")}return GRN}
function taper(c,pts,w){for(var i=1;i<pts.length;i++){var f=i/pts.length;c.lineWidth=w*(.35+.9*Math.sin(Math.PI*f));c.beginPath();c.moveTo(pts[i-1][0],pts[i-1][1]);c.lineTo(pts[i][0],pts[i][1]);c.stroke()}}
function wash(c,path,col,dx){c.save();c.beginPath();path();c.fillStyle=col;c.fill();c.clip();c.fillStyle="rgba(40,20,30,.2)";c.beginPath();c.moveTo(5+dx,-70);c.quadraticCurveTo(2+dx,-30,7+dx,4);c.lineTo(40,4);c.lineTo(40,-70);c.fill();c.globalAlpha=.1;c.fillStyle=grain(c);c.fillRect(-30,-70,60,74);c.globalAlpha=1;c.restore()}
function ink(c,path,w){c.strokeStyle=K;c.lineJoin="round";c.lineCap="round";c.lineWidth=w*1.2;c.beginPath();path();c.stroke();c.globalAlpha=.85;c.lineWidth=w*.8;c.save();c.translate(.7,.9);c.beginPath();path();c.stroke();c.restore();c.globalAlpha=1}
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
 if(d.hs!=="cap"){c.strokeStyle=lite(H);c.lineCap="round";c.lineWidth=1.1;c.beginPath();c.moveTo(-8,hy-4);c.quadraticCurveTo(-6,hy-10,-1,hy-10.6);c.moveTo(3,hy-10.4);c.quadraticCurveTo(7.5,hy-9.5,8.6,hy-4.5);c.stroke();c.strokeStyle=K;c.lineWidth=.9;c.beginPath();c.moveTo(1,hy-11.2);c.quadraticCurveTo(1.6,hy-8.5,1.2,hy-5.8);c.stroke()}
 if(d.hs==="long"||d.hs==="wavy"||d.hs==="bob"){var lb=d.hs==="bob"?7:9.5;p(function(){c.moveTo(-10.4,hy-1);c.quadraticCurveTo(-12.4,hy+5,-11.2,hy+lb);c.lineTo(-9.6,hy+lb-1);c.quadraticCurveTo(-10.4,hy+3,-9.4,hy-1.5)});p(function(){c.moveTo(10.4,hy-1);c.quadraticCurveTo(12.4,hy+5,11.2,hy+lb);c.lineTo(9.6,hy+lb-1);c.quadraticCurveTo(10.4,hy+3,9.4,hy-1.5)})}}
function face(c,d,r,L,hy,sm){c.fillStyle=K;c.strokeStyle=K;c.lineCap="round";
 if(sm){/* small on screen: bold dot eyes, thick brows, simple smile */if(r.blink){c.lineWidth=1.8;c.beginPath();c.moveTo(-5.4,hy+1);c.lineTo(-2,hy+1);c.moveTo(2,hy+1);c.lineTo(5.4,hy+1);c.stroke()}else{c.beginPath();c.ellipse(-3.7,hy+.6,1.9,2.3,0,0,6.283);c.ellipse(3.7,hy+.6,1.9,2.3,0,0,6.283);c.fill()}c.lineWidth=1.7;c.beginPath();c.moveTo(-6.2,hy-3.4);c.lineTo(-1.8,hy-3.9);c.moveTo(1.8,hy-3.9);c.lineTo(6.2,hy-3.4);c.stroke();c.lineWidth=1.5;c.beginPath();c.arc(0,hy+3.6,2.4,.4,2.75);c.stroke();return}
 if(r.blink){c.lineWidth=1.1;c.beginPath();c.moveTo(-5,hy+1);c.quadraticCurveTo(-3.5,hy+2,-2,hy+1);c.moveTo(2,hy+1);c.quadraticCurveTo(3.5,hy+2,5,hy+1);c.stroke()}
 else{c.beginPath();c.moveTo(-6,hy+.6);c.quadraticCurveTo(-3.6,hy-2.8,-1.4,hy+.4);c.quadraticCurveTo(-3.6,hy+2.4,-6,hy+.6);c.moveTo(6,hy+.6);c.quadraticCurveTo(3.6,hy-2.8,1.4,hy+.4);c.quadraticCurveTo(3.6,hy+2.4,6,hy+.6);c.fill()}
 c.lineWidth=.9;c.beginPath();c.moveTo(-6,hy-3.2);c.quadraticCurveTo(-3.5,hy-4.4-(d.hero?0:.6),-1.6,hy-3.4);c.moveTo(1.6,hy-3.4);c.quadraticCurveTo(3.5,hy-4.4-(d.hero?0:.6),6,hy-3.2);c.stroke();
 c.fillStyle="rgba(210,56,30,.38)";c.beginPath();c.ellipse(-6.2,hy+3.6,1.9,1.2,0,0,6.283);c.ellipse(6.2,hy+3.6,1.9,1.2,0,0,6.283);c.fill();
 c.lineWidth=1;c.beginPath();c.arc(0,hy+3.3,2.4,.35,2.8);c.stroke()}
function spiral(cx,cy,r0,turns,dir,n){var a=[];for(var u=0;u<=n;u++){var f=u/n,th=dir*(f*turns*6.283),rr=r0*(1-f*.85);a.push([cx+Math.cos(th)*rr,cy+Math.sin(th)*rr])}return a}
function accent(c,pts,w){c.strokeStyle=K;taper(c,pts,w)}
var SOFT={};function soft(h){if(!h||h.length!==7)return h;if(SOFT[h])return SOFT[h];var R=parseInt(h.slice(1,3),16),G=parseInt(h.slice(3,5),16),B=parseInt(h.slice(5,7),16),l=.3*R+.59*G+.11*B,k=l<70?.24:l<100?.12:0;var f=function(v,t){return Math.round(v+(t-v)*k).toString(16).padStart(2,"0")};return SOFT[h]="#"+f(R,120)+f(G,92)+f(B,78)}
function lite(h){var R=parseInt(h.slice(1,3),16),G=parseInt(h.slice(3,5),16),B=parseInt(h.slice(5,7),16);return "rgba("+Math.min(255,R+70)+","+Math.min(255,G+60)+","+Math.min(255,B+50)+",.75)"}
function fig(c,x,y,h,p,t,flip,E){var d=Object.assign({},spec(p)),r=rig(p,t,E.RM),sm=h<=60,_h=(d.hair=soft(d.hair)),s=h/58*(sm?1.3:1),L=Math.max(1.2,2.1*s)/s,wk=r.wk,bob=-r.lift*1.4+r.idle*.35,sw=r.sway*1.1+wk*2.4,T=E.RM?0:r.T,bw=[1,.9,.95][(p.body|0)%3]||1,lod=s<1.8;
 var hk=d.pants&&d.pants!=="#4a4a6a"?d.pants:shade(d.coat,.5);
 c.save();c.translate(x,y);c.scale(flip?-s:s,s);
 c.fillStyle="rgba(20,16,16,.2)";c.beginPath();c.ellipse(0,0,11+r.lift*2,2.8,0,0,6.283);c.fill();
 /* sandals step under the hakama */
 c.fillStyle="#1e1612";[[-3.5+wk*4,wk>0?-1.2*wk:0],[3.5-wk*4,wk<0?1.2*wk:0]].forEach(function(f){c.beginPath();c.ellipse(f[0],-1.2+f[1],3.2,1.4,0,0,6.283);c.fill()});
 c.translate(0,bob);
 /* flowing ribbon behind: wide cloth band, lags the body, tapers to a forked tip */
 var rb=[],N=8;for(var i=0;i<=N;i++)rb.push([-2-i*2.9-sw*i*.45,-44+i*2.3+Math.sin(T/230-i*.7)*i*.55]);
 var hw=function(i){return 3.1*Math.pow(1-i/(N+1),.55)};
 var rib=function(){c.moveTo(rb[0][0],rb[0][1]-hw(0));for(var i=1;i<=N;i++)c.lineTo(rb[i][0],rb[i][1]-hw(i));c.lineTo(rb[N][0]-3,rb[N][1]+1.5);c.lineTo(rb[N][0]-.5,rb[N][1]+.6);c.lineTo(rb[N][0]-2,rb[N][1]+3);for(var i=N;i>=0;i--)c.lineTo(rb[i][0],rb[i][1]+hw(i))};
 c.fillStyle=VR;c.beginPath();rib();c.fill();c.strokeStyle="rgba(255,214,190,.55)";c.lineWidth=1.1;c.beginPath();rb.slice(1,N-1).forEach(function(q,i){i?c.lineTo(q[0],q[1]-.4):c.moveTo(q[0],q[1]-.4)});c.stroke();ink(c,rib,L*.32);
 if(d.prop==="pack"){c.save();c.translate(-3,-7);props(c,d,r,L);c.restore()}
 /* hakama: two flared legs, hems trail the step with follow-through */
 var la=wk*3.2-sw*.7,ra=-wk*3.2-sw*.7,rip=function(k){return Math.sin(T/260+k+r.sd)*(E.RM?0:.6)};
 var hak=function(){c.moveTo(-6.5*bw,-31);c.quadraticCurveTo(-10*bw+la*.3,-16,-12.5+la,-2.5+rip(1));c.lineTo(-6+la,-1.5+rip(2));c.lineTo(-.8+la*.4,-3.5);c.lineTo(.8+ra*.4,-3.5);c.lineTo(6+ra,-1.5+rip(3));c.lineTo(12.5+ra,-2.5+rip(4));c.quadraticCurveTo(10*bw+ra*.3,-16,6.5*bw,-31);c.closePath()};
 wash(c,hak,hk,0);ink(c,hak,L);
 c.strokeStyle="rgba(20,16,16,.55)";taper(c,[[-3,-27],[-5+la*.4,-14],[-7+la*.8,-4]],1.3);taper(c,[[3,-27],[5+ra*.4,-14],[7+ra*.8,-4]],1.3);taper(c,[[0,-28],[0,-12],[0,-5]],1);
 accent(c,[[10*bw,-26],[11.5+ra*.4,-15],[12.5+ra,-3]],2.6);accent(c,[[-12.5+la,-2.5],[-9+la,-1.6],[-6+la,-1.5]],2);
 /* bold vermilion stripe across the hakama: one clear shape at region size */
 c.strokeStyle=VR;taper(c,[[-11+la*.9,-6.5],[-6+la*.6,-7.2],[-1.5,-7.5]],lod?3:2.2);taper(c,[[1.5,-7.5],[6+ra*.6,-7.2],[11+ra*.9,-6.5]],lod?3:2.2);
 /* kimono top */
 var top=function(){c.moveTo(-7*bw,-45);c.quadraticCurveTo(-8.5*bw,-38,-7*bw,-28.5);c.lineTo(7*bw,-28.5);c.quadraticCurveTo(8.5*bw,-38,7*bw,-45);c.quadraticCurveTo(0,-47.5,-7*bw,-45)};
 wash(c,top,d.coat,0);ink(c,top,L*.9);
 c.fillStyle="#f4ead2";c.beginPath();c.moveTo(-3,-46);c.lineTo(1,-36);c.lineTo(3.5,-46);c.closePath();c.fill();c.fillStyle=d.skin;c.beginPath();c.moveTo(-2.2,-46.5);c.lineTo(.9,-40);c.lineTo(2.6,-46.5);c.closePath();c.fill();ink(c,function(){c.moveTo(-3.5,-46);c.lineTo(1.5,-35);c.moveTo(3.5,-46);c.lineTo(.5,-38)},L*.7);
 if(!lod){c.strokeStyle=VR;taper(c,spiral(-3.5,-38,3.2,.9,1,8),1.6)}
 /* obi + knot */
 c.fillStyle=d.acc;c.fillRect(-7*bw,-31.5,14*bw,4);ink(c,function(){c.rect(-7*bw,-31.5,14*bw,4)},L*.6);
 c.beginPath();c.moveTo(-5,-28);c.quadraticCurveTo(-7-sw*.6,-23,-8-sw*1.2,-18);c.lineTo(-5.5-sw,-19);c.closePath();c.fill();ink(c,function(){c.moveTo(-5,-28);c.quadraticCurveTo(-7-sw*.6,-23,-8-sw*1.2,-18)},L*.5);
 /* long sleeves swing opposite the step, cuff hems lag behind */
 [[-1,wk],[1,-wk]].forEach(function(q){var k=q[0],a=q[1]*3,lg=-sw*.5,sl=function(){c.moveTo(k*6*bw,-45);c.quadraticCurveTo(k*11*bw,-42,k*11.5+a,-30);c.quadraticCurveTo(k*12.5+a+lg,-23,k*10.5+a+lg,-21.5);c.quadraticCurveTo(k*8+a,-22,k*7.5+a*.8,-27);c.quadraticCurveTo(k*7,-36,k*5.5*bw,-40)};
  wash(c,sl,shade(d.coat,.88),k*3);ink(c,sl,L*.8);accent(c,[[k*11*bw,-42],[k*12+a,-32],[k*11.5+a+lg,-23]],k>0?2.2:1.4);
  c.strokeStyle=VR;taper(c,[[k*8.5+a,-35],[k*11+a,-33],[k*10.8+a,-30],[k*9+a,-31]],lod?2.6:1.8);
  c.beginPath();c.arc(k*8.6+a,-25.2,2.7,0,6.283);c.fillStyle=d.skin;c.fill();ink(c,function(){c.arc(k*8.6+a,-25.2,2.7,0,6.283)},L*.4)});
 /* neck + head at 0.72 scale for ~4.6 heads tall */
 var hy=-54+r.idle*.3,HS=.72,Lh=L*.95;
 c.fillStyle=d.skin;c.fillRect(-2.6,-51,5.2,6);
 c.save();c.translate(0,hy);c.scale(HS,HS);
 if(!p.back&&(d.hs==="long"||d.hs==="wavy")){var s2=r.sway,hf=function(){c.moveTo(-10.5,-2);c.quadraticCurveTo(-13+s2*.8,9,-10+s2,16);c.quadraticCurveTo(0+s2,18.5,10+s2,16);c.quadraticCurveTo(13+s2*.8,9,10.5,-2)};c.beginPath();hf();c.fillStyle=shade(d.hair,.82);c.fill();ink(c,hf,Lh*.7);c.strokeStyle=lite(d.hair);c.lineWidth=.9;c.lineCap="round";[-8,-4.5,4.5,8].forEach(function(q){c.beginPath();c.moveTo(q*1.05,4);c.quadraticCurveTo(q*1.15+s2*.5,10,q+s2,15);c.stroke()})}
 var hd=function(){c.ellipse(0,0,9.2,10.4,0,0,6.283)};wash(c,hd,d.skin,2);c.beginPath();c.ellipse(0,.4,8.9,10,0,0,6.283);c.fillStyle=d.skin;c.fill();ink(c,hd,Lh);
 hair(c,d,r,Lh,p.back,0);if(!p.back){var tf=c.getTransform(),dpx=Math.hypot(tf.a,tf.b)/(window.devicePixelRatio||1);face(c,d,r,Lh,0,dpx<1.45)}
 c.restore();
 if(d.prop!=="pack"&&!p.back){c.save();c.translate(-3.4,-7.5);props(c,d,r,L);c.restore()}
 c.restore();return true}
function cloud(c,x,y,r,col,t,boss,hap,E){var T=t||0,RM=E.RM,bob=RM?0:Math.sin(T/600)*2.2,s=r/26,tint=col&&col.length===7?col:"#9a9aa8";c.save();c.translate(x,y+bob);c.scale(s,s);
 var br=RM?1:1+Math.sin(T/700)*.03;c.scale(br,2-br);
 var lobes=[[-17,4,11],[-7,-7,14],[8,-6,13],[18,4,10.5],[0,8,12.5],[-9,9,9],[10,9,9]];
 var pth=function(){lobes.forEach(function(l,i){var w=RM?0:Math.sin(T/500+i)*.6;c.moveTo(l[0]+l[2]+w,l[1]);c.arc(l[0],l[1],l[2]+w,0,6.283)})};
 /* ink wash body: dark storm ink when upset, warm paper when calmed */
 c.strokeStyle=K;c.lineJoin="round";c.lineWidth=boss?6.5:5;c.beginPath();pth();c.stroke();c.globalAlpha=.25;c.lineWidth=boss?11:9;c.beginPath();pth();c.stroke();c.globalAlpha=1;
 c.fillStyle=hap?"#ffeedd":"#c4bfcc";c.beginPath();pth();c.fill();
 c.save();c.beginPath();pth();c.clip();var g=c.createLinearGradient(0,-20,0,22);g.addColorStop(0,hap?"rgba(255,255,255,.6)":"rgba(255,255,255,.25)");g.addColorStop(.5,"rgba(0,0,0,0)");g.addColorStop(1,hap?"rgba(255,190,170,.45)":"rgba(150,40,40,.35)");c.fillStyle=g;c.fillRect(-32,-24,64,48);c.globalAlpha=.12;c.fillStyle=grain(c);c.fillRect(-32,-24,64,48);c.globalAlpha=1;
 c.globalAlpha=hap?.45:.75;c.strokeStyle=hap?"#e0a070":K;c.lineWidth=hap?1.3:2;for(var i=0;i<3;i++){c.beginPath();var q=[[-10,8,5,-1],[10,8,5,1],[0,-12,4.5,1]][i];for(var u=0;u<=24;u++){var th=q[3]*(u/24*8)+(RM?0:T/900)*q[3],rr=q[2]*(1-u/28);u?c.lineTo(q[0]+Math.cos(th)*rr,q[1]+Math.sin(th)*rr):c.moveTo(q[0]+rr,q[1])}c.stroke()}c.globalAlpha=1;c.restore();
 c.strokeStyle=hap?"rgba(232,160,112,.8)":VR;c.lineCap="round";[-1,1].forEach(function(k){taper(c,spiral(k*17,-12,5.5,1.1,k,14),hap?1.6:2.6);taper(c,spiral(k*22,9,3.4,.9,-k,10),hap?1.2:2)});
 /* dry-brush flicks off the rim */c.strokeStyle=K;c.lineCap="round";[[-28,-2,-33,-6],[27,0,32,-3],[-12,-21,-15,-25],[14,-19,18,-23]].forEach(function(f,i){c.strokeStyle=K;c.lineWidth=2.2;c.beginPath();c.moveTo(f[0],f[1]);c.lineTo(f[2],f[3]);c.stroke()});
 if(!hap&&!RM){c.strokeStyle="rgba(26,20,16,.4)";c.lineWidth=1.1;for(var d=0;d<3;d++){var dy=((T/12+d*9)%18);c.beginPath();c.moveTo(-10+d*10,20+dy);c.lineTo(-11+d*10,24+dy);c.stroke()}}
 /* face */
 c.strokeStyle=K;c.fillStyle=K;c.lineCap="round";
 if(hap){c.lineWidth=2;c.beginPath();c.arc(-6,1,2.8,3.5,5.9);c.moveTo(3.4,0);c.arc(6,1,2.8,3.5,5.9);c.stroke();c.beginPath();c.arc(0,4,5,.25,2.9);c.stroke();c.fillStyle="rgba(235,120,120,.55)";c.beginPath();c.ellipse(-11,5,3,1.8,0,0,6.283);c.ellipse(11,5,3,1.8,0,0,6.283);c.fill()}
 else{c.lineWidth=2.2;c.beginPath();c.moveTo(-11,-5);c.quadraticCurveTo(-7,-5,-3,-2);c.moveTo(11,-5);c.quadraticCurveTo(7,-5,3,-2);c.stroke();c.beginPath();c.ellipse(-6,1.5,1.7,2.2,0,0,6.283);c.ellipse(6,1.5,1.7,2.2,0,0,6.283);c.fill();c.lineWidth=2.4;c.beginPath();c.moveTo(-5,11);c.quadraticCurveTo(0,6.5,5,11);c.stroke()}
 c.restore();return true}
window.OBC_CHARS={fig:fig,cloud:cloud,v:"okami"}})();
