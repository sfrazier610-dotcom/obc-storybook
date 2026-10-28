/* Tiny voxel sprite renderer (original code). Builds block models, renders them once
   to offscreen canvases with simple top/front/side lighting, then blits them. */
(function(){
"use strict";
var U=12,KX=-.38,KY=-.5,cache={};
function hex(c){c=c.replace("#","");if(c.length===3)c=c.replace(/./g,"$&$&");var n=parseInt(c,16);return[n>>16&255,n>>8&255,n&255]}
function shade(c,f,add){var r=hex(c);return"#"+r.map(function(v){return(256+Math.max(0,Math.min(255,Math.round(v*f+(add||0))))).toString(16).slice(1)}).join("")}
function M(){this.v={}}
M.prototype.set=function(x,y,z,c){if(c)this.v[x+","+y+","+z]=c;else delete this.v[x+","+y+","+z];return this};
M.prototype.box=function(x,y,z,w,h,d,c){for(var i=0;i<w;i++)for(var j=0;j<h;j++)for(var k=0;k<d;k++)this.set(x+i,y+j,z+k,c);return this};
M.prototype.ball=function(cx,cy,cz,r,c,ry){ry=ry||r;for(var i=-r;i<=r;i++)for(var j=-ry;j<=ry;j++)for(var k=-r;k<=r;k++)if(i*i/(r*r)+j*j/(ry*ry)+k*k/(r*r)<=1.05)this.set(cx+i,cy+j,cz+k,typeof c==="function"?c(i,j,k):c);return this};
M.prototype.has=function(x,y,z){return(x+","+y+","+z)in this.v};
function P(x,y,z){return[(x+KX*z)*U,(-y+KY*z)*U]}
function render(m){
 var L=[],a,mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
 for(var k in m.v){a=k.split(",").map(Number);a.push(m.v[k]);L.push(a)}
 L.forEach(function(p){[[0,0,0],[1,1,0],[0,1,1],[1,0,1]].forEach(function(o){var q=P(p[0]+o[0],p[1]+o[1],p[2]+o[2]);mnx=Math.min(mnx,q[0]);mxx=Math.max(mxx,q[0]);mny=Math.min(mny,q[1]);mxy=Math.max(mxy,q[1])})});
 // far (high z) first, then low y, then high x (left side is visible: KX<0 means depth goes left)
 L.sort(function(p,q){return q[2]-p[2]||p[1]-q[1]||q[0]-p[0]});
 var pad=2,c=document.createElement("canvas");c.width=Math.ceil(mxx-mnx)+pad*2;c.height=Math.ceil(mxy-mny)+pad*2;
 var x=c.getContext("2d"),ox=-mnx+pad,oy=-mny+pad;x.translate(ox,oy);x.lineJoin="round";
 function quad(pts,col){x.beginPath();pts.forEach(function(p,i){var q=P(p[0],p[1],p[2]);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});x.closePath();x.fillStyle=col;x.fill();x.strokeStyle=col;x.lineWidth=.6;x.stroke()}
 L.forEach(function(p){var X=p[0],Y=p[1],Z=p[2],c=p[3];
  if(!m.has(X-1,Y,Z))quad([[X,Y,Z],[X,Y,Z+1],[X,Y+1,Z+1],[X,Y+1,Z]],shade(c,.72));        // left side
  if(!m.has(X,Y+1,Z))quad([[X,Y+1,Z],[X+1,Y+1,Z],[X+1,Y+1,Z+1],[X,Y+1,Z+1]],shade(c,1.08,18)); // top, lit
  if(!m.has(X,Y,Z-1)){quad([[X,Y,Z],[X+1,Y,Z],[X+1,Y+1,Z],[X,Y+1,Z]],shade(c,.94));            // front
   x.strokeStyle="rgba(0,0,0,.07)";x.lineWidth=1;var q=P(X,Y,Z);x.strokeRect(q[0]+.5,q[1]-U+.5,U-1,U-1)}
 });
 return{c:c,ox:ox,oy:oy};
}
function sprite(key,build){return cache[key]||(cache[key]=render(build(new M())))}
/* draw sprite so model origin lands at (x,y); s = canvas units per voxel */
function draw(ctx,sp,x,y,s){if(!sp.c.width||!sp.c.height||!(s>0))return;var f=s/U;ctx.drawImage(sp.c,x-sp.ox*f,y-sp.oy*f,sp.c.width*f,sp.c.height*f)}
function shadow(ctx,x,y,rx,ry){ctx.save();ctx.fillStyle="rgba(10,20,30,.28)";ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill();ctx.restore()}
window.VX={M:M,sprite:sprite,draw:draw,shadow:shadow,shade:shade,U:U,stats:function(){return Object.keys(cache).length}};
})();
