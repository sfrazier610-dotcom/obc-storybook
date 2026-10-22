/* The Fogstorm: a small retro top-down story RPG about coping skills. Educational, not therapy.
   All pixel art is original and drawn in code. Lazy: data + CSS load on first open. */
(function(){'use strict';
var KEY='obc_quest_v1',Q=null,dlg=null,loading=null,SCENE='title',raf=0,P=null,B=null,MAPS={},ENEMIES=[],PARTS=[],FLO=[],held=null,TALK=null,LIFT=0,ITEM=0;
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var BOOK='https://openbook-counseling.clientsecure.me';
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){if(Q)return Promise.resolve();if(loading)return loading;
 loading=new Promise(function(ok,no){var l=document.createElement('link');l.rel='stylesheet';l.href='quest-game.css';document.head.appendChild(l);
  var s=document.createElement('script');s.src='../shared/quest-data.js';s.onload=function(){Q=window.OBC_QUEST;ok()};s.onerror=no;document.head.appendChild(s)});return loading}
function prog(){try{var p=JSON.parse(localStorage.getItem(KEY))||{};return p.v===5?p:{v:5}}catch(e){return {v:5}}}
function saveProg(p){p.v=5;try{localStorage.setItem(KEY,JSON.stringify(p))}catch(e){}}
var BONUS=[];/* bonus rune lives in memory only: resets every visit */
function sym(id){return Q.symptoms.find(function(x){return x.id===id})}
function sp(id){return Q.spells.find(function(x){return x.id===id})||exSp(id)}
function clins(){return ((window.OBC&&OBC.clinicians)||[]).filter(function(k){var c=Q.companions.find(function(x){return x.id===k.id});return c&&c.consent})}
function clin(id){return clins().find(function(k){return k.id===id})||null}
/* growth XP comes from right choices (matching spell, calling a guide, resting when low). Old saves: 3 growth per cleared cloud. */
var LVX=[0,4,10,18,28];
function gxp(p){p=p||prog();return p.gxp!=null?p.gxp:3*(p.xp||0)}
function level(p){var g=gxp(p),l=1;for(var i=1;i<LVX.length;i++)if(g>=LVX[i])l=i+1;return l}
function maxRes(p){return 20+2*(level(p)-1)}
function bonus(p){return level(p)-1}
function nextAt(p){var l=level(p);return l<LVX.length?LVX[l]:null}
/* spells you unlock by leveling up. Each fits a few clouds (never the guide-only ones). */
var EXTRA=[{id:'boxbreath',lv:2,kind:'solo',base:3,name:'Box Breathing',fits:'Even breaths settle a racing body.',for:['heart','squall','scattered','flee']},
 {id:'nameit',lv:3,kind:'solo',base:3,name:'Name It to Tame It',fits:'Naming the feeling turns its volume down.',for:['critic','whatif','graylens','loop','thunder']},
 {id:'reachout',lv:4,kind:'solo',base:3,name:'Reach Out',fits:'One message to someone safe lets light in.',for:['sleep','cloak','worthless']}];
function exSp(id){return EXTRA.find(function(x){return x.id===id})}
function fitsSp(s,id){var e=exSp(id);return s.weakTo.indexOf(id)>=0||!!(e&&e.for.indexOf(s.id)>=0)}
function addXP(n,why){var p=prog(),b=level(p);p.gxp=gxp(p)+n;saveProg(p);var a=level(p);if(a>b){if(B)B.bonus=bonus(p),B.maxRes=maxRes(p);if(P)P.resolve=Math.min(maxRes(p),(P.resolve||0)+2);if(B)B.resolve=Math.min(B.maxRes,B.resolve+2);levelUp(a)}return a>b}
function levelUp(l){var u=EXTRA.filter(function(x){return x.lv===l})[0];SFX('level');var d=document.createElement('div');d.className='qg-lvl';d.setAttribute('role','status');
 d.innerHTML='<b>Level up! Lv '+l+'</b><span>Your skills grew stronger. Your spells now deal +'+(l-1)+' damage.</span>'+(u?'<span>New spell: '+esc(u.name)+'</span>':'');
 (dlg||document.body).appendChild(d);setTimeout(function(){d.remove()},RM?2600:2400);if(!RM){burst(160,60,'#f3c95a',20);burst(160,60,'#9fe0a8',14)}}

function topGuide(p){var g=(p||prog()).guides||{},ks=Object.keys(g).filter(function(k){return clin(k)}).sort(function(a,b){return g[b]-g[a]});return ks[0]||null}

/* ---------- original pixel art (code-drawn) ---------- */
var PAL={k:'#1a1a2b',h:'#5a3a22',s:'#e2ad84',c:'#1f6f73',d:'#134a4d',y:'#f3c95a',b:'#3b2a1a',w:'#ffffff'};
var HERO={down:['....kkkk....','...khhhhk...','..khhhhhhk..','..kssssssk..','..ksksskskk.','...kssssk...','..kccccccky.','.kccdccdccy.','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...'],
 side:['....kkkk....','...khhhhk...','..khhhhhhk..','..khsssssk..','..khssksk...','...kssssk...','..kccccccky.','.kccccdccy..','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...'],
 up:['....kkkk....','...khhhhk...','..khhhhhhk..','..khhhhhhk..','..khhhhhhk..','...khhhhk...','..kccccccky.','.kccccccccy.','.kccccccck..','..kcccccck..','..kddddddk..','...kb..bk...','...kb..bk...','...kk..kk...']};
/* Makayla, the lantern-keeper: original sprite, long hair and a dress */
var GIRL={down:['...kkkkkk...','..khhhhhhk..','.khhhhhhhhk.','.khsssssshk.','.khsksskshk.','.khhsssshhk.','.khkcccckhk.','..kccddcck.y','..kcccccck..','.kcccccccck.','.kddddddddk.','...kb..bk...','...kb..bk...','...kk..kk...'],
 side:['...kkkkkk...','..khhhhhhk..','.khhhhhhhhk.','.khhsssssk..','.khhssksk...','.khhssssk...','.khhkcccck..','..khccdccky.','..kcccccck..','.kcccccccck.','.kddddddddk.','...kb..bk...','...kb..bk...','...kk..kk...']};
GIRL.up=['...kkkkkk...','..khhhhhhk..','.khhhhhhhhk.','.khhhhhhhhk.','.khhhhhhhhk.','.khhhhhhhhk.','.khhhhhhhhk.','..khcccchky.','..kcccccck..','.kcccccccck.','.kddddddddk.','...kb..bk...','...kb..bk...','...kk..kk...'];
function legsB(r){r=r.slice();r[11]='..kb....bk..';r[12]='..kb....bk..';r[13]='..kk....kk..';return r}
var CLOUD=['....kkkkkk....','..kkggggggkk..','.kggllggggggk.','kgglllgggggggk','kggggggggggggk','kggwkggggwkggk','kggkkggggkkggk','kggggggggggggk','kgggggkkgggggk','.kggggggggggk.','..kgkggggkgk..','...k.kggk.k...'];
var FOGPAL={k:'#3d4246',g:'#9aa3a8',l:'#c9cfd2',w:'#eef2f3'},STORMPAL={k:'#1d2c3d',g:'#5d7891',l:'#8fb0c9',w:'#f3c95a'},BOSSPAL={k:'#14141c',g:'#4b4e5c',l:'#767a8a',w:'#f3c95a'};
var FACE16=['.....kkkkkk.....', '...kkHHHHHHkk...', '..kHHHHHHHHHHk..', '..kHHhHHHHHHHk..', '..kHHssssssHHk..', '..kHssssssssHk..', '..kssWkssWkssk..', '..kssssssssssk..', '..kpsssssssspk..', '...kssmmmmssk...', '....kssssssk....', '.....kSSSSk.....', '...kkAAAAAAkk...', '..kAAaAAAAaAAk..', '.kAAAAAwwAAAAAk.', 'kkkkkkkkkkkkkkkk'];
var FACE=['...kkkkkk...','..kHHHHHHk..','.kHHHHHHHHk.','.kHssssssHk.','.kHskssksHk.','.kHssssssHk.','..kssssssk..','...kssssk...','..kAAAAAAk..','.kAAAwwAAAk.','.kAAAwwAAAk.','.kkkkkkkkkk.'];
/* portraits are stylized placeholders, not likenesses: each clinician gets their own hair color, hair style and scarf color */
var FSTY={scott:'short',amber:'long',shanna:'curly',amanda:'bun',aspen:'long',abby:'short'};
function faceRows(id){var st=FSTY[id]||'short',k='F'+st;if(faceRows[k])return faceRows[k];var r=FACE16.slice();
 if(st==='long'||st==='curly')for(var j=4;j<13;j++){var a=r[j].split('');a[1]='k';a[2]=st==='curly'&&j%2?'h':'H';a[13]=st==='curly'&&j%2?'h':'H';a[14]='k';if(j===12){a[3]='H';a[12]='H'}r[j]=a.join('')}
 if(st==='curly'){r[1]='...kHhHHhHHhk...';r[2]='..kHhHHhHHhHHk..'}
 if(st==='bun'){r[0]='......kHHk......';r[1]='...kkkHHHHkkk...'}
 return faceRows[k]=r}
var FACEPAL={scott:{H:'#6b4a2e',A:'#1f6f73'},amber:{H:'#c9863a',A:'#8a2f3c'},shanna:{H:'#2a1c14',A:'#c0782a'},amanda:{H:'#8a5a33',A:'#3f6fb0'},aspen:{H:'#d9b46a',A:'#3d8a4f'},abby:{H:'#4a2e1e',A:'#7a4fa0'}};
/* 16-bit pass: sprites are pre-rendered once into small cached canvases with automatic shading (light top-left, shade bottom-right) */
var SPC=new Map(),SPID=0;
function hx2(h){if(h.charAt(0)!=='#')return null;if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return [parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]}
function mixc(h,f){var r=hx2(h);if(!r)return h;return 'rgb('+r.map(function(v){return Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)))}).join(',')+')'}
function palKey(p){var o='';for(var k in p)o+=k+p[k]+';';return o}
function sprite(rows,pal,flash){var id=rows._id||(rows._id=++SPID),key=id+'|'+(flash?'F':palKey(pal)),cv=SPC.get(key);if(cv)return cv;
 var w=rows[0].length,h=rows.length;cv=document.createElement('canvas');cv.width=w;cv.height=h;var c=cv.getContext('2d');
 function em(i,j){var r=rows[j];if(!r)return true;var ch=r[i];return !ch||ch==='.'||ch==='k'}
 for(var j=0;j<h;j++)for(var i=0;i<w;i++){var ch=rows[j][i];if(ch==='.'||!ch)continue;var col=flash?'#ffffff':(pal[ch]||PAL[ch]);if(!col||col==='transparent')continue;
  if(!flash&&'kwWoy'.indexOf(ch)<0){if(em(i+1,j)||em(i,j+1))col=mixc(col,.78);else if(em(i-1,j)||em(i,j-1))col=mixc(col,1.14)}
  c.fillStyle=col;c.fillRect(i,j,1,1)}
 if(SPC.size>600)SPC.clear();SPC.set(key,cv);return cv}
function px(c,rows,pal,x,y,o){o=o||{};var s=o.s||1,w=rows[0].length,cv=sprite(rows,pal,o.flash),X=Math.round(x),Y=Math.round(y);
 if(o.flip){c.save();c.translate(X+w*s,Y);c.scale(-1,1);c.drawImage(cv,0,0,w*s,rows.length*s);c.restore()}else c.drawImage(cv,X,Y,w*s,rows.length*s)}
/* 4-frame walk cycle: stand, left stride, stand, right stride */
var WF=new Map(),LEG1=['...kbk.bk...','...kb..kk...','...kk.......'],LEG3=['...kb.kbk...','...kk..bk...','.......kk...'];
function walkF(rows,f){if(f!==1&&f!==3)return rows;var id=rows._id||(rows._id=++SPID),key=id+'/'+f,r=WF.get(key);if(r)return r;r=rows.slice();var L=f===1?LEG1:LEG3;r[11]=L[0];r[12]=L[1];r[13]=L[2];WF.set(key,r);return r}
/* soft dithered halo around clouds: two checker phases alternate so the edge seems to drift */
var HALO=new Map();
function halo(rows,pal,par){var key=(rows._id||(rows._id=++SPID))+palKey(pal)+par,cv=HALO.get(key);if(cv)return cv;var w=rows[0].length,h=rows.length;cv=document.createElement('canvas');cv.width=w+4;cv.height=h+4;var c=cv.getContext('2d');
 function on(i,j){return rows[j]&&rows[j][i]&&rows[j][i]!=='.'}
 for(var j=-2;j<h+2;j++)for(var i=-2;i<w+2;i++){if(on(i,j))continue;var d=9;for(var b=-2;b<=2;b++)for(var a=-2;a<=2;a++)if(on(i+a,j+b))d=Math.min(d,Math.abs(a)+Math.abs(b));if(d>2||((i+j+par)%2))continue;c.fillStyle=pal.l;c.globalAlpha=d===1?.55:.28;c.fillRect(i+2,j+2,1,1)}
 c.globalAlpha=1;c.drawImage(sprite(rows,pal),2,2);HALO.set(key,cv);return cv}
function cloudAt(c,rows,pal,x,y,s,t,flash){if(flash)return px(c,rows,pal,x,y,{s:s,flash:1});var par=RM?0:Math.floor(t/420)%2,cv=halo(rows,pal,par);c.drawImage(cv,Math.round(x-2*s),Math.round(y-2*s),cv.width*s,cv.height*s)}
var FPC={};function facePal(id){if(FPC[id])return FPC[id];var f=FACEPAL[id]||{H:'#555555',A:'#888888'};return FPC[id]={k:'#1a1a2b',s:'#e8b48c',S:'#c98f6a',W:'#ffffff',p:'#ec9b8c',m:'#a8564a',w:'#fff6dd',H:f.H,h:mixc(f.H,1.35),A:f.A,a:mixc(f.A,1.3)}}
function bodyPal(h,c,d,y){return {h:h,c:c,d:d,y:y||'transparent'}}
var CPC={};function clinPal(id){if(CPC[id])return CPC[id];var f=FACEPAL[id]||{H:'#555',A:'#888'};return CPC[id]=bodyPal(f.H,f.A,'#2b2b3b','transparent')}
/* the Golden Fidget Toy: an original little fidget cube with a dial, a switch and click buttons */
var FIDGET=['..kkkkkkkk..','.kYYYYYYYYk.','kYyyyyyyyYYk','kYykkyyoyyYk','kYykokyyyyYk','kYyykyyyyyYk','kYyyyyyrryYk','kYyooyyrryYk','kYyooyyyyyYk','kYyyyyyyyyYk','.kYYYYYYYYk.','..kkkkkkkk..'];
var FIDPAL={k:'#5a3d0c',Y:'#b9800f',y:'#f6cf5e',o:'#fffbe0',r:'#e3a526'};
function drawFidget(c,x,y,s,t){px(c,FIDGET,FIDPAL,x,y,{s:s});if(RM)return;var w=12*s,ph=((t||0)/1400)%1.6;if(ph>1)return;var sx=x-w*0.4+ph*w*1.6;c.save();c.beginPath();c.rect(x+s,y+s,w-2*s,w-2*s);c.clip();c.fillStyle='rgba(255,255,240,.6)';for(var j=0;j<w;j+=s)c.fillRect(Math.round(sx+j*0.5),Math.round(y+j),s,s);c.restore()}

/* ---------- regions (connected in sequence) ---------- */
var REG={
 town:{name:'Lanternfall Town',lift:'done',rows:['TTTTTTTTTTTTTTTTTTTT','TGGGGGGGGGGGGGGGGGGT','TGHGGHGGGGGGGHGGHGGT','TG.GG.GGGGGGGG.GG.GT','TG................GT','TGG.GGGGGGGGGGGG.GGT','TGG.GGGWWWWGGGGG.GGT','TGG.GGGWWWWGGGGG...E','TGG.GGGGGGGGGGGG.GGT','TGG......L.......GGT','TGGGGGGGG.GGGGGGGGGT','TGGGGGGGG.GGGGGGGGGT','TTTTTTTTTTTTTTTTTTTT'],
  start:{x:9,y:10},lantern:{x:9,y:9},exits:{'19,7':{to:'marsh',x:1,y:6}},clouds:[],
  npcs:[{id:'keeper',x:11,y:9,spr:'girl',pal:bodyPal('#7a3b22','#5b4a8a','#3b2f5c','#f3c95a'),name:'Makayla, the lantern-keeper',lines:['Head east, traveler. The Gray Fog Marsh is first, then the Storm Wind Cliffs.','Rest at any lantern like this one when your Resolve runs low. Resting is part of the journey.']},
   {id:'baker',x:6,y:3,pal:bodyPal('#8a5a33','#c96a4a','#8a3f2a'),name:'Pell, the baker',lines:['The fog rolled in so slowly that nobody noticed at first. That happens with symptoms too.','Someone told me naming it out loud is the first step. So: it is foggy. There. I said it.']},
   {id:'kid',x:15,y:5,pal:bodyPal('#2a1c14','#3d8a4f','#24572f'),name:'Mira',lines:['Are you going to the Open Book office? I heard it is warm in there, with a big comfy couch.']}],
  signs:[{x:18,y:6,text:'East: Gray Fog Marsh. Then the Storm Wind Cliffs. Then the old threshold, and the Open Book office beyond it.'}]},
 marsh:{name:'Gray Fog Marsh',weather:'fog',lift:'marsh',rows:['TTTTTTTTTTTTTTTTTTTT','TFFFFFFWWFFFFFFFFFFT','TFFFFFFWWFFFFFFFFFFT','TFFF.......FFFFFFFFT','TFFF.FFFFF.FFFWWFFFT','TFFF.FFFFF.FFFWWFFFT','E...FFFLFF.........E','TFFFFFFFFFFFFFFF.FFT','TFWWFFFFFFFFFFFF.FFT','TFWWFFFFFF......FFFT','TFFFFFFFFFFFFFFFFFFT','TFFFFFFFFFFFFFFFFFFT','TTTTTTTTTTTTTTTTTTTT'],
  start:{x:1,y:6},lantern:{x:7,y:6},exits:{'0,6':{to:'town',x:18,y:7},'19,6':{to:'cliffs',x:1,y:6,need:'marsh'}},
  clouds:[['m1','fog',3,2],['m2','fog',13,2],['m3','fog',5,10],['m4','fog',14,10]],
  npcs:[{id:'tam',x:9,y:4,pal:bodyPal('#6b4a2e','#4f6b8a','#33465c'),name:'Tam, who fishes the marsh',lines:['Some mornings I can\'t get out of bed either. Then I do one small thing, like boots on. One small step still counts.']},
   {id:'ivy',x:12,y:7,pal:bodyPal('#bfbfbf','#8a6a3a','#5c4626'),name:'Old Ivy',lines:['When the fog is thick, I call a friend. Asking for help isn\'t weakness. It\'s how people get through.','You\'ll feel lighter once these clouds clear. Not perfect. Lighter.']}],
  signs:[{x:2,y:5,text:'Gray Fog Marsh. Heavy, low-mood clouds drift here. Clear all 4 and the fog lifts. The lantern restores Resolve.'}],
  clear:'The fog lifts from Gray Fog Marsh. Color seeps back into the reeds, and the water turns blue again. The path east is open.'},
 cliffs:{name:'Storm Wind Cliffs',weather:'storm',lift:'cliffs',rows:['TTTTTTTTTTTTTTTTTTTT','TSSSSSRRSSSSSSSSSSST','TSSSSSSSSSSSRRSSSSST','TSS..........SSSSSST','TSS.SSSRSSSS.SSSRSST','TSS.SSSSSSSS.SSSSSST','E...SSSSLSSS.......E','TSSSSSRSSSSSSSSSSSST','TSSSSSSSSSSRRSSSSSST','TSRRSSSSSSSSSSSRSSST','TSSSSSSSSSSSSSSSSSST','TSSSSSSSSSSSSSSSSSST','TTTTTTTTTTTTTTTTTTTT'],
  start:{x:1,y:6},lantern:{x:8,y:6},exits:{'0,6':{to:'marsh',x:18,y:6},'19,6':{to:'castle',x:1,y:6,need:'cliffs'}},
  clouds:[['c1','storm',4,1],['c2','storm',16,2],['c3','storm',5,10],['c4','storm',15,10]],
  npcs:[{id:'jo',x:10,y:5,pal:bodyPal('#c9863a','#8a2f3c','#5c1f28'),name:'Jo, a climber',lines:['My heart races up here too. I breathe out longer than I breathe in. It tells my body the cliff isn\'t chasing me.']},
   {id:'kit',x:14,y:7,pal:bodyPal('#2a1c14','#c0782a','#7a4a1a'),name:'Kit, the kite-maker',lines:['The wind keeps whispering "what if, what if." I answer it: "Then I\'ll handle it." It gets quieter.']}],
  signs:[{x:2,y:5,text:'Storm Wind Cliffs. Racing, worried clouds blow here. Clear all 4 to calm the wind. The lantern restores Resolve.'}],
  clear:'The wind settles over the Storm Wind Cliffs. The sky turns soft blue and the stones warm in the sun. The old threshold lies east.'},
 castle:{name:'The Old Threshold',lift:'done',rows:['TTTTTTTTCCCCTTTTTTTT','TGGGGGGTCCCCTGGGGGGT','TGGGGGGTCCDCTGGGGGGT','TGGGGGG.......GGGGGT','TGGGGGG.GGGGG.GGGGGT','TGGGGGG.GGGGG.GGGGGT','E.......GGLGG.GGGGGT','TGGGGGG.GGGGG.GGGGGT','TGGGGGG.......GGGGGT','TGGGGGGGGGGGGGGGGGGT','TGGGGGGGGGGGGGGGGGGT','TGGGGGGGGGGGGGGGGGGT','TTTTTTTTTTTTTTTTTTTT'],
  start:{x:1,y:6},lantern:{x:10,y:6},exits:{'0,6':{to:'cliffs',x:18,y:6}},clouds:[],
  npcs:[{id:'rowan',x:12,y:3,pal:bodyPal('#4a2e1e','#3f6fb0','#26446e'),name:'Rowan, keeper of the gate',lines:['The Fogstorm sits on the threshold: all the weather at once. You\'ve practiced for this.','Your guides are close. And whatever happens, you can rest and try again.']}],
  signs:[{x:6,y:5,text:'Through this door: the Fogstorm. Beyond it, the Open Book office.'}]}};
var ORDER=['town','marsh','cliffs','castle'];
var TS=16,MW=20,MH=13;
function R(){return REG[(P&&P.region)||prog().region||'town']}
function allClouds(){var a=[];ORDER.forEach(function(k){a=a.concat(REG[k].clouds)});return a}
function lifted(key,p){p=p||prog();return key==='done'?!!p.done:(p.rcleared||[]).indexOf(key)>=0}
function regionClear(k,p){var cl=(p||prog()).cleared||[];return REG[k].clouds.every(function(e){return cl.indexOf(e[0])>=0})}
function tile(x,y){return (R().rows[y]||'')[x]||'T'}
function thing(x,y){var r=R();return (r.chests||[]).find(function(n){return n.x===x&&n.y===y})||r.npcs.find(function(n){return n.x===x&&n.y===y})||r.signs.find(function(n){return n.x===x&&n.y===y})||null}
function walk(x,y){return 'GFS.LDE'.indexOf(tile(x,y))>=0&&!thing(x,y)}
function zone(x,y){var t=tile(x,y);return t==='F'?'fog':t==='S'?'storm':null}
function hash(x,y){return ((x*73856093)^(y*19349663))>>>0}
function drawTile(c,t,x,y,rows){var X=x*TS,Y=y*TS,h=hash(x,y);
 function r(col,a,b,w,hh){c.fillStyle=col;c.fillRect(X+a,Y+b,w,hh)}
 function nb(dx,dy){var rr=rows&&rows[y+dy];return rr?(rr[x+dx]||'T'):'T'}
 function dith(c1,c2,seed){r(c1,0,0,16,16);c.fillStyle=c2;for(var j=0;j<16;j++)for(var i=(j+seed)%2;i<16;i+=2)if(hash(X+i+31,Y+j+17)%6===0)c.fillRect(X+i,Y+j,1,1)}
 function grass(){dith('#5f9e52','#6fae5e',0);for(var q=0;q<3;q++){var tx=(h>>(q*5))%13+1,ty=(h>>(q*5+3))%12+2;r('#4a8241',tx,ty,1,2);r('#4a8241',tx+2,ty,1,2);r('#86c070',tx+1,ty-1,1,2)}
  if(h%9===0){r('#f2e6a0',5,6,2,2);r('#c9a12a',5,7,1,1)}if(h%11===1){r('#f1a8b8',10,11,2,2);r('#c56a80',11,12,1,1)}}
 if(t==='T'){grass();r('rgba(20,40,20,.35)',2,12,12,3);r('#5a3a22',6,10,4,5);r('#3b2a1a',8,10,2,5);
  r('#1e4228',2,2,12,9);r('#1e4228',4,1,8,11);r('#1e4228',1,4,14,5);r('#2f7d40',3,3,10,7);r('#2f7d40',5,2,6,9);r('#2a6f39',3,7,10,3);r('#4fa35a',4,3,5,3);r('#4fa35a',6,2,3,1);r('#7cc47a',5,3,2,1);r('#245f32',9,7,3,2);return}
 if(t==='W'){r('#2f6f9c',0,0,16,16);c.fillStyle='#285f88';for(var j=8;j<16;j++)for(var i=j%2;i<16;i+=2)c.fillRect(X+i,Y+j,1,1);
  if(nb(0,-1)!=='W'){r('#9fd3e6',0,0,16,1);r('#5d9bc8',0,1,16,1)}if(nb(-1,0)!=='W')r('#5d9bc8',0,0,1,16);if(nb(1,0)!=='W')r('#5d9bc8',15,0,1,16);if(nb(0,1)!=='W')r('#1f4c6e',0,15,16,1);return}
 if(t==='C'){r('#4a4c56',0,0,16,16);for(var row=0;row<4;row++){var off=row%2?0:4;for(var bx=-1;bx<3;bx++){var x0=off+bx*8;var xs=Math.max(0,x0),xe=Math.min(16,x0+7);if(xe<=xs)continue;r('#6c6f7a',xs,row*4,xe-xs,3);r('#8a8e99',xs,row*4,xe-xs,1);r('#565962',xs,row*4+2,xe-xs,1)}}
  if((h%7)===2){r('#5d7a4c',2,13,3,2);r('#6f9a5a',3,12,1,1)}if(y===0){r('#14141c',0,0,4,3);r('#14141c',8,0,4,3)}return}
 if(t==='D'){r('#6c6f7a',0,0,16,16);r('#4a4c56',2,2,12,14);r('#3b2a1a',3,3,10,13);r('#3b2a1a',4,2,8,1);r('#6b4528',4,4,8,12);r('#7d5332',4,4,3,12);r('#53361f',8,4,1,12);r('#2b2b33',4,7,8,1);r('#2b2b33',4,12,8,1);r('#f3c95a',10,9,2,2);r('#fff0b0',10,9,1,1);return}
 if(t==='H'){grass();r('rgba(20,40,20,.3)',1,14,15,2);r('#e9dcc0',2,7,12,8);r('#d1c19f',2,13,12,2);r('#a8946e',13,7,1,8);
  r('#6e1f24',0,1,16,7);for(var sh=0;sh<3;sh++){r(sh%2?'#8a2f3c':'#9c3a46',0,1+sh*2,16,2);c.fillStyle='#6e1f24';for(var q=(sh%2)*3;q<16;q+=6)c.fillRect(X+q,Y+1+sh*2,1,2)}r('#c25a64',1,1,14,1);r('#4a1418',0,7,16,1);r('#5c5f6a',11,0,3,3);
  r('#3b2a1a',6,10,4,5);r('#5a3a22',7,11,2,4);r('#f3c95a',8,12,1,1);r('#3b2a1a',2,8,4,4);r('#ffd98a',3,9,2,2);r('#3b2a1a',10,8,4,4);r('#ffd98a',11,9,2,2);r('#fff3c4',3,9,1,1);r('#fff3c4',11,9,1,1);return}
 if(t==='R'){r(nb(0,0)&&'#7d8d99',0,0,16,16);r('rgba(0,0,0,.25)',2,12,13,3);r('#3e474e',2,4,12,10);r('#3e474e',3,3,10,12);r('#5b6870',3,4,10,9);r('#76848e',4,4,6,4);r('#a3b1bb',5,4,3,1);r('#4a555d',9,9,4,3);return}
 if(t==='F'){dith('#6f8a6e','#627d62',1);if(h%4===0){r('#4f6f78',3,9,8,3);r('#6f93a0',4,9,4,1)}
  if(h%3!==2){var rx=(h%9)+2;r('#4f7a3a',rx,4,1,9);r('#4f7a3a',rx+3,6,1,7);r('#6e9a52',rx+1,7,1,6);r('#6b4a2e',rx,3,1,3);r('#6b4a2e',rx+3,5,1,2);r('#8a6a44',rx,3,1,1)}return}
 if(t==='S'){dith('#7d8d99','#8a9aa6',0);r('#66747f',(h%10)+2,(h>>4)%10+2,3,1);r('#66747f',(h>>3)%10+3,(h>>7)%10+4,1,2);
  if(h%5===0){r('#56636d',4,8,6,4);r('#93a1ab',5,8,3,1)}
  var bl=nb(0,1);if(bl!=='S'&&bl!=='R'&&bl!=='T'){r('#56636d',0,11,16,5);r('#4a555d',0,15,16,1);c.fillStyle='#66747f';for(var q=1;q<16;q+=3)c.fillRect(X+q,Y+12,1,3);r('#a3b1bb',0,10,16,1)}
  if(nb(0,-1)!=='S'&&nb(0,-1)!=='R')r('#a3b1bb',0,0,16,1);return}
 var path=(t==='.'||t==='L'||t==='E');
 if(path){dith('#c9b38a','#d6c29c',0);r('#b39d76',(h%12)+1,((h>>4)%12)+1,2,1);r('#b39d76',((h>>8)%12)+2,((h>>12)%12)+2,1,1);r('#e3d3b0',((h>>6)%12)+2,((h>>10)%12)+2,1,1);
  c.fillStyle='#a8925f';var e=function(dx,dy){var n=nb(dx,dy);return 'G'.indexOf(n)>=0||n==='T'||n==='H'};
  if(e(0,-1))for(var i=0;i<16;i+=2)c.fillRect(X+i+(h%2),Y,1,1);if(e(0,1))for(var i2=0;i2<16;i2+=2)c.fillRect(X+i2,Y+15,1,1);if(e(-1,0))for(var j2=0;j2<16;j2+=2)c.fillRect(X,Y+j2,1,1);if(e(1,0))for(var j3=1;j3<16;j3+=2)c.fillRect(X+15,Y+j3,1,1)}
 else grass();
 if(t==='L'){r('rgba(0,0,0,.25)',5,14,7,2);r('#3b2a1a',7,5,2,11);r('#5a3a22',7,5,1,11);r('#1a1a2b',4,0,8,7);r('#2b2b3b',5,0,6,1);r('#f3c95a',5,2,6,4);r('#fff0b0',6,2,2,2);r('#1a1a2b',7,1,2,6)}
 if(t==='E'){r('#b39d76',6,7,4,2);r('#b39d76',x>10?10:4,6,2,4)}}
function mapCanvas(k){if(MAPS[k])return MAPS[k];var save=P,cv=document.createElement('canvas');cv.width=MW*TS;cv.height=MH*TS;var c=cv.getContext('2d'),rows=REG[k].rows;for(var y=0;y<MH;y++)for(var x=0;x<MW;x++)drawTile(c,rows[y][x],x,y,rows);
 REG[k].signs.forEach(function(s){var X=s.x*TS,Y=s.y*TS;function q(col,a,b,w,h){c.fillStyle=col;c.fillRect(X+a,Y+b,w,h)}q('rgba(0,0,0,.25)',4,14,9,2);q('#3b2a1a',7,8,3,8);q('#5a3a22',7,8,1,8);q('#1a1a2b',1,1,14,9);q('#c9a46a',2,2,12,7);q('#e0c48e',2,2,12,1);q('#a8844e',2,8,12,1);q('#5a3a22',4,4,8,1);q('#5a3a22',4,6,6,1)});
 MAPS[k]=cv;return cv}
function spawn(){var cl=prog().cleared||[];ENEMIES=R().clouds.filter(function(e){return cl.indexOf(e[0])<0}).map(function(e){return {id:e[0],weather:e[1],x:e[2],y:e[3],fx:e[2],fy:e[3],t:Math.random()*3000}})}
function newPlayer(){var p=prog(),rg=p.region&&REG[p.region]?p.region:'town',r=REG[rg];P={region:rg,x:p.x!=null?p.x:r.start.x,y:p.y!=null?p.y:r.start.y,dir:'down',moving:null,frame:0,resolve:p.resolve!=null?Math.min(p.resolve,maxRes(p)):maxRes(p)};P.fx=P.x;P.fy=P.y}
function savePos(){var p=prog();p.region=P.region;p.x=P.x;p.y=P.y;p.resolve=P.resolve;saveProg(p)}
var DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function step(dir){if(SCENE!=='map'||!P||P.moving||TALK)return false;P.dir=dir;var d=DIRS[dir],nx=P.x+d[0],ny=P.y+d[1],th=thing(nx,ny);if(th){held=null;interact(th);return false}if(!walk(nx,ny)){status();return false}
 P.moving={sx:P.x,sy:P.y,t:0};P.x=nx;P.y=ny;P.frame^=1;if(RM){P.moving=null;P.fx=nx;P.fy=ny;arrive()}return true}
function goRegion(k,x,y){P.region=k;P.x=x;P.y=y;P.fx=x;P.fy=y;P.moving=null;held=null;savePos();map();toast(REG[k].name)}
function arrive(){savePos();var t=tile(P.x,P.y);
 if(t==='E'){var ex=R().exits[P.x+','+P.y];if(ex){if(ex.need&&!regionClear(ex.need)){var n=REG[ex.need].clouds.length-REG[ex.need].clouds.filter(function(e){return (prog().cleared||[]).indexOf(e[0])>=0}).length;P.x-=Math.sign(P.x-10)||0;P.fx=P.x;savePos();held=null;return talk([{who:'',text:'The '+(ex.need==='marsh'?'fog':'wind')+' is too thick to pass yet. Clear the '+n+' cloud'+(n>1?'s':'')+' left in '+REG[ex.need].name+' first.'}])}return goRegion(ex.to,ex.x,ex.y)}}
 if(t==='D'){P.y+=1;P.fy=P.y;savePos();return prog().done?office():bossIntro()}
 if(t==='L'){var m=maxRes();if(P.resolve<m){P.resolve=m;savePos();say('You rest by the lantern. Resolve restored to '+m+'.');toast('Rested by the lantern: Resolve full');var h=dlg.querySelector('.qg-hud');h&&(h.outerHTML=hudHtml())}}
 var e=touching();if(e)return encounter(e);status()}
function touching(){return ENEMIES.find(function(e){return Math.abs(e.fx-P.fx)<.6&&Math.abs(e.fy-P.fy)<.6})}
function nearest(){var best=null,bd=1e9;ENEMIES.forEach(function(e){var d=Math.abs(e.x-P.x)+Math.abs(e.y-P.y);if(d<bd){bd=d;best=e}});return best}
function wander(e,dt){if(RM)return;e.t-=dt;if(e.moving){e.moving.t+=dt/400;var k=Math.min(1,e.moving.t);e.fx=e.moving.sx+(e.x-e.moving.sx)*k;e.fy=e.moving.sy+(e.y-e.moving.sy)*k;if(k>=1)e.moving=null;return}
 if(e.t>0||TALK)return;e.t=1400+Math.random()*1800;var ks=Object.keys(DIRS),d=DIRS[ks[Math.floor(Math.random()*4)]],nx=e.x+d[0],ny=e.y+d[1];
 if(zone(nx,ny)===e.weather&&!thing(nx,ny)&&!ENEMIES.some(function(o){return o!==e&&o.x===nx&&o.y===ny})&&!(nx===P.x&&ny===P.y)){e.moving={sx:e.x,sy:e.y,t:0};e.x=nx;e.y=ny}}
function drawMap(c,t,dt){var r=R(),lf=lifted(r.lift);c.drawImage(mapCanvas(P.region),0,0);
 if(!RM){r.rows.forEach(function(row,y){for(var x=0;x<MW;x++)if(row[x]==='W'){var ph=(t/600+x*.7+y*1.3)%4;c.fillStyle='rgba(190,230,245,'+(.55-.12*ph)+')';c.fillRect(x*TS+2+Math.floor(ph*2),y*TS+5,5,1);c.fillStyle='rgba(159,211,230,.45)';c.fillRect(x*TS+9-Math.floor(ph),y*TS+11,4,1)}})}
 r.rows.forEach(function(row,y){for(var x=0;x<MW;x++)if(row[x]==='L'){var g=RM?.22:.16+.08*Math.sin(t/500+x);var gr=c.createRadialGradient(x*TS+8,y*TS+4,1,x*TS+8,y*TS+4,20);gr.addColorStop(0,'rgba(255,220,130,'+(g*2)+')');gr.addColorStop(1,'rgba(255,220,130,0)');c.fillStyle=gr;c.fillRect(x*TS-12,y*TS-16,40,40)}});
 drawChests(c,t);
 r.npcs.forEach(function(n){var S=n.spr==='girl'?GIRL:HERO,dx=P.x-n.x,dy=P.y-n.y,near=Math.abs(dx)+Math.abs(dy)<=3,dir=!near?'down':Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
  var f=RM?0:[0,0,2,0][Math.floor(t/350+n.x)%4],ib=f===2?1:0,rs=dir==='up'?S.up:dir==='down'?S.down:S.side;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(n.x*TS+4,n.y*TS+14,9,2);
  px(c,rs,n.pal,n.x*TS+2,n.y*TS+1+ib,{flip:dir==='left'});if(n.spr==='girl'){var lx=n.x*TS+(dir==='left'?1:13),ly=n.y*TS+9+ib,lg=RM?.35:.28+.1*Math.sin(t/300);c.fillStyle='rgba(255,214,120,'+lg+')';c.fillRect(lx-3,ly-3,8,8);c.fillStyle='#1a1a2b';c.fillRect(lx,ly,3,4);c.fillStyle='#f3c95a';c.fillRect(lx+1,ly+1,1,2)}});
 ENEMIES.forEach(function(e){wander(e,dt);var bob=RM?0:Math.round(Math.sin(t/300+e.x)*1);c.fillStyle='rgba(0,0,0,.16)';c.fillRect(e.fx*TS+3,e.fy*TS+14,11,2);cloudAt(c,CLOUD,e.weather==='fog'?FOGPAL:STORMPAL,e.fx*TS+1,e.fy*TS+1+bob,1,t)});
 if(P.moving){P.moving.t+=dt/150;var k=Math.min(1,P.moving.t);P.fx=P.moving.sx+(P.x-P.moving.sx)*k;P.fy=P.moving.sy+(P.y-P.moving.sy)*k;if(k>=1){P.moving=null;P.fx=P.x;P.fy=P.y;arrive();if(SCENE==='map'&&held&&!TALK)step(held)}}
 else if(touching()&&SCENE==='map'&&!TALK)encounter(touching());
 var rows=P.dir==='up'?HERO.up:P.dir==='down'?HERO.down:HERO.side,wf=P.moving&&!RM?(P.moving.t<.5?(P.frame?3:1):0):0;rows=walkF(rows,wf);var ib=(!RM&&!P.moving&&Math.floor(t/500)%2)?1:0;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(P.fx*TS+4,P.fy*TS+14,9,2);
 px(c,rows,PAL,P.fx*TS+2,P.fy*TS+1+ib,{flip:P.dir==='left'});
 /* fog layer: gray wash until the region is cleared, then it fades away and color returns */
 var a=lf?0:.42;if(LIFT>0){LIFT-=dt;var u=Math.max(0,LIFT/1600);a=.42*u*u*(3-2*u);if(RM)LIFT=0}
 if(a>0){var k2=a/.42;c.save();c.globalCompositeOperation='saturation';c.fillStyle='rgba(128,128,128,'+(.5*k2)+')';c.fillRect(0,0,MW*TS,MH*TS);c.restore();
  c.fillStyle='rgba(150,156,162,'+(a*.6)+')';c.fillRect(0,0,MW*TS,MH*TS);
  var fb=fogBand();c.globalAlpha=Math.min(1,k2*.8);var o=RM?0:(t/90)%96;for(var i=-1;i<5;i++){c.drawImage(fb,Math.round(i*96+o),24+((i*37+80)%60));c.drawImage(fb,Math.round(i*96-o+40),110+((i*23+60)%60))}c.globalAlpha=1;
  if(!RM&&r.weather==='storm'){c.fillStyle='rgba(143,176,201,'+(.5*k2)+')';for(var j=0;j<18;j++)c.fillRect((j*29+t/8)%320,((j*47+t/3)%208),1,3)}}}
/* a soft fog band with dithered edges, drawn once */
function fogBand(){if(fogBand.c)return fogBand.c;var cv=document.createElement('canvas');cv.width=72;cv.height=16;var c=cv.getContext('2d');
 for(var j=0;j<16;j++)for(var i=0;i<72;i++){var dx=(i-36)/36,dy=(j-8)/8,d=dx*dx+dy*dy;if(d>1)continue;var th=d<.35?1:d<.65?((i+j)%2?1:0):((i%2===0&&j%2===0)?1:0);if(!th)continue;c.fillStyle=d<.35?'rgba(232,236,238,.42)':'rgba(232,236,238,.3)';c.fillRect(i,j,1,1)}
 return fogBand.c=cv}

/* ---------- battle rules (pure) ---------- */
function newBattle(kind,weather,phase){var p=prog(),G=Q.guide,st={kind:kind,mode:kind==='boss'?'boss':weather,phase:phase||0,resolve:P?P.resolve:maxRes(p),maxRes:maxRes(p),meter:8,max:8,lastSpell:null,current:null,prev:null,round:0,cooldown:0,gateOpen:false,freeRest:false,freeRestUsed:false,helped:{},over:null,bonus:bonus(p)};
 if(kind==='boss'){var Ph=Q.boss[st.phase];st.meter=st.max=Ph.meter+2*st.bonus;if(Ph.guide==='cooldown-start')st.cooldown=G.cooldownTurns}
 st.current=draw(st);return st}
function phaseOf(st){return st.mode==='boss'?Q.boss[st.phase]:null}
function roster(st){if(st.mode!=='boss')return Q.symptoms.filter(function(s){return s.weather===st.mode}).map(function(s){return s.id});
 var Ph=Q.boss[st.phase];if(Ph.roster)return Ph.roster.slice();var w=Ph.id==='stair'?(st.round%2?'fog':'storm'):null;
 return Q.symptoms.filter(function(s){return (!w||s.weather===w)&&!s.guideOnly}).map(function(s){return s.id})}
function draw(st,rnd){rnd=rnd||Math.random;var Ph=phaseOf(st);
 if(st.mode!=='boss'&&st.current)return st.current;
 if(Ph&&Ph.id==='gate'&&!st.gateOpen&&(st.round%3===2||st.meter<=1))return 'gate';
 if(Ph&&Ph.id==='stair'&&st.prev==='whatif')return 'worthless';
 if(Ph&&Ph.id==='lantern'&&st.meter<=1)return 'lanterns';
 var r=roster(st).filter(function(id){return id!==st.prev&&!(Ph&&Ph.id==='gate'&&st.gateOpen&&id==='gate')});return r[Math.floor(rnd()*r.length)]}
function guideReady(st){var Ph=phaseOf(st);return (Ph&&Ph.guide==='auto')||st.cooldown<=0}
/* the spell a guide casts: the counter that fits the current symptom (guided spells included) */
function rightSpell(st){var s=sym(st.current),Ph=phaseOf(st);if(s.weakTo.indexOf('gratitude')>=0&&(s.id==='lanterns'))return 'gratitude';if(Ph&&Ph.id==='gate'&&s.id==='gate')return 'guidedstep';return s.weakTo[0]}
function turn(st,action,opt){opt=opt||{};var G=Q.guide,s=sym(st.current),Ph=phaseOf(st),out={action:action,symptom:s.id,cleared:0,drain:0,matched:false,hint:null};
 if(action==='guide'){if(!guideReady(st))return {error:'cooldown'};var k=clin(opt.clinician);if(!k)return {error:'noclin'};
  var x=rightSpell(st);out.spell=x;out.clinician=k.id;out.cleared=3;out.drain=0;out.matched=true;out.tip=s.tip;
  if(x==='guidedstep'&&s.id==='gate')st.gateOpen=true;if(x==='gratitude')out.gratitude=true;
  st.helped[x]=(st.helped[x]||0)+1;st.meter-=3;st.cooldown=(Ph&&Ph.guide==='auto')?0:G.cooldownTurns+1}
 else if(action==='rest'){out.wise=st.resolve<=st.maxRes/2;if(st.freeRest&&!st.freeRestUsed){st.freeRestUsed=true;out.drain=0;out.free=true}else out.drain=Math.ceil(s.drain/2);st.resolve=Math.min(st.maxRes,st.resolve+3);out.rested=3}
 else{var S1=sp(action);if(!S1)return {error:'nospell'};if(S1.kind==='guided')return {error:'needsguide'};if(st.lastSpell===action)return {error:'repeat'};
  var match=fitsSp(s,action),triple=Ph&&Ph.tripleSpell===action;
  if(match){out.matched=true;out.cleared=S1.base*(triple?3:2)+(st.bonus||0);out.drain=0}
  else if(triple){out.cleared=S1.base*3+(st.bonus||0);out.drain=Math.ceil(s.drain/2)}
  else{out.cleared=1;out.drain=Math.ceil(s.drain/2);out.hint=s.guideOnly?'This one is best faced with a guide. Try Call Guide.':(sp(s.weakTo[0]).kind==='guided'?'A guide knows the counter for this one.':'Hint: '+sp(s.weakTo[0]).name+' fits '+s.name+' best.')}
  st.lastSpell=action;st.meter-=out.cleared;if(match)st.helped[action]=(st.helped[action]||0)+1}
 if(Ph&&Ph.id==='gate'&&!st.gateOpen&&st.meter<1){st.meter=1;out.lock='The Closed Gate holds. Only Guided Step Through the Gate opens it, and that takes a guide.'}
 if(Ph&&Ph.id==='lantern'&&st.meter<1&&out.spell!=='gratitude'){st.meter=1;out.lock='The great lantern lights only with the Shared Gratitude Rune, cast with a guide.'}
 st.meter=Math.max(0,st.meter);st.resolve=Math.max(0,st.resolve-out.drain);
 if(Ph&&Ph.freeRestAt&&st.meter<=Ph.freeRestAt&&!st.freeRest){st.freeRest=true;out.rain=true}
 if(action!=='guide'||st.cooldown>0){if(st.cooldown>0)st.cooldown--}
 st.round++;st.prev=st.current;
 if(st.meter<=0)st.over='clear';else if(st.resolve<=0)st.over='rest';
 else if(st.mode==='boss')st.current=draw(st);
 return out}

/* ---------- shell + UI ---------- */
var FOOT='<footer class="qg-foot" role="contentinfo" aria-label="Disclaimer and crisis resources"><p>Educational game, not therapy, diagnosis, or a substitute for care. In crisis or thinking about suicide, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline). In Utah, use the <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT app or safeut.org</a> for 24/7 chat with a licensed counselor. In an emergency, call <a href="tel:911">911</a>.</p><a class="qg-find" href="#match" data-quiz>Find a guide for the real journey</a></footer>';
function shell(){dlg=document.createElement('dialog');dlg.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-snd],[data-bag]');if(!t)return;if(t.hasAttribute('data-snd'))toggleSnd();else bag()});dlg.className='qg';dlg.setAttribute('aria-labelledby','qg-title');
 dlg.innerHTML='<button class="qg-x" type="button" aria-label="Close the game">✕</button><button class="qg-help-btn" type="button" data-help aria-haspopup="true">How to play</button><div class="qg-body"></div><section class="qg-panel" hidden aria-labelledby="qg-ph"></section><p class="qg-live sr" aria-live="polite"></p>'+FOOT;
 document.body.appendChild(dlg);
 dlg.querySelector('.qg-x').onclick=close;dlg.querySelector('[data-help]').onclick=function(){panel('<h2 id="qg-ph">How to play</h2>'+HOWTO())};
 dlg.addEventListener('cancel',function(e){e.preventDefault();if(!dlg.querySelector('.qg-panel').hidden)return unpanel();close()});
 dlg.addEventListener('close',stopLoop);
 dlg.addEventListener('keydown',key);dlg.addEventListener('keyup',function(e){var d=KEYS[e.key];if(d&&held===d)held=null});
 dlg.addEventListener('click',function(e){var a=e.target.closest('[data-quiz]');if(a){e.preventDefault();close();var i=[].slice.call(document.querySelectorAll('.chapter')).findIndex(function(c){return c.id==='match'});if(window.obcTurnTo&&i>=0)obcTurnTo(i);else location.hash='#match'}})}
var KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'};
function key(e){if(SCENE!=='map'||!dlg.querySelector('.qg-panel').hidden)return;var t=e.target;if(t&&/INPUT|TEXTAREA/.test(t.tagName))return;
 if(TALK){if(KEYS[e.key])e.preventDefault();return}
 if((e.key==='e'||e.key==='E'||e.key===' '||e.key==='Enter')&&t&&t.classList&&t.classList.contains('qg-map')){e.preventDefault();return look()}
 var d=KEYS[e.key];if(!d)return;e.preventDefault();held=d;step(d)}
function HOWTO(){return '<ul class="qg-how">'+
 '<li><b>The story:</b> fog has covered Lanternfall Town. Travel east through the Gray Fog Marsh (low-mood symptoms) and the Storm Wind Cliffs (anxious ones), face the Fogstorm at the old threshold, and reach the Open Book office.</li>'+
 '<li><b>Walk</b> with the arrow keys or WASD, or the on-screen pad. Walk into people and signs to talk, or use Talk / look (E key).</li>'+
 '<li><b>Touch a cloud</b> to start a battle. Symptoms are the weather, never you. Clear every cloud in a region to lift its fog and open the path east.</li>'+
 '<li><b>Resolve</b> is your HP. Symptoms drain it a little each turn. If it runs out, you go to Rest and Regroup with no penalty. Lanterns restore it.</li>'+
 '<li><b>Spells</b> are real coping skills. The right spell for the symptom deals double and blocks the drain. Any other spell still does 1, plus a hint. You can\'t cast the same spell twice in a row.</li>'+
 '<li><b>Call Guide</b> lets you pick any Open Book clinician. They cast the right spell for you, free: it costs no Resolve and deals 3 HP, with a short tip about the real skill. Then they rest for '+Q.guide.cooldownTurns+' turns (not in the final Fogstorm phase). Gratitude and Guided Step are only cast with a guide.</li>'+
 '<li><b>Rest</b> restores 3 Resolve; the symptom still drains a little.</li></ul><p class="qg-small">Right choices help you grow: a matching spell or calling a guide gives +2 growth, resting when your Resolve is low gives +1, and each cleared cloud +1. A spell that does not fit just gives no growth, never a penalty. Each level adds +1 damage to your spells (guides stay 3 HP), adds max Resolve, and some levels teach a new spell. Open chests and help the townsfolk to collect coping-skill cards for your Bag. Sound is off until you turn it on. Progress stays in this browser only.</p>'}
function panel(h){var pn=dlg.querySelector('.qg-panel'),b=dlg.querySelector('.qg-body');pn._ret=document.activeElement;pn.innerHTML=h+'<div class="qg-row"><button type="button" class="qg-btn" data-unpanel>Back to the game</button></div>';b.hidden=true;pn.hidden=false;pn.querySelector('[data-unpanel]').onclick=unpanel;var f=pn.querySelector('h2');f.setAttribute('tabindex','-1');f.focus()}
function unpanel(){var pn=dlg.querySelector('.qg-panel');if(pn.hidden)return;pn.hidden=true;dlg.querySelector('.qg-body').hidden=false;var r=pn._ret;if(r&&r.isConnected&&dlg.contains(r))r.focus();else{var h=dlg.querySelector('.qg-body h2');h&&h.focus()}}
function body(h,focusSel){endTalk();var b=dlg.querySelector('.qg-body');b.innerHTML=h;b.scrollTop=0;var f=focusSel===false?null:b.querySelector(focusSel||'h2');if(f){if(!/BUTTON|A/.test(f.tagName))f.setAttribute('tabindex','-1');f.focus()}}
function say(t){var l=dlg&&dlg.querySelector('.qg-live');if(!l)return;l.textContent='';setTimeout(function(){l.textContent=t},30)}
function toast(t){var b=dlg.querySelector('.qg-toast');if(!b)return;b.textContent=t;b.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){b.classList.remove('on')},1800)}
function close(){MUS(null);if(dlg&&dlg.open)dlg.close();stopLoop();endTalk();var b=$('#qg-open');b&&b.focus()}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;held=null}
function loop(draw1){stopLoop();var cv=dlg.querySelector('canvas.qg-cv');if(!cv)return;var c=cv.getContext('2d');c.imageSmoothingEnabled=false;var last=performance.now();
 (function f(t){var dt=Math.min(64,t-last);last=t;if(!dlg.open||!cv.isConnected){raf=0;return}draw1(c,t,dt);drawParts(c,dt);raf=requestAnimationFrame(f)})(last)}
function burst(x,y,col,n){if(RM)return;for(var i=0;i<n;i++){var a=Math.random()*6.283,v=.04+Math.random()*.08;PARTS.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:600,c:col})}}
function drawParts(c,dt){PARTS=PARTS.filter(function(p){p.l-=dt;if(p.l<=0)return false;if(p.ring){var rr=Math.round((300-p.l)/12)+3;c.fillStyle=p.c;for(var q=0;q<16;q++){var aa=q/16*6.283;c.fillRect(Math.round(p.x+Math.cos(aa)*rr),Math.round(p.y+Math.sin(aa)*rr),2,2)}return true}p.x+=p.vx*dt;p.y+=p.vy*dt;c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);return true});
 FLO=FLO.filter(function(f){f.l-=dt;if(f.l<=0)return false;c.font='bold 12px ui-monospace,Menlo,Consolas,monospace';c.fillStyle='#1a1a2b';c.fillText(f.t,f.x+1,f.y+1-(RM?0:(900-f.l)/40));c.fillStyle=f.c;c.fillText(f.t,f.x,f.y-(RM?0:(900-f.l)/40));return true})}

/* ---------- classic text box with typewriter text ---------- */
function talk(lines,done){endTalk();TALK={lines:lines,i:-1,done:done};held=null;nextLine()}
function endTalk(){if(!TALK)return;clearInterval(TALK.timer);TALK=null;var bx=dlg&&dlg.querySelector('.qg-box');bx&&bx.remove()}
function nextLine(){var T=TALK;if(!T)return;if(T.typing)return finishType();T.i++;
 if(T.i>=T.lines.length){var d=T.done;TALK=null;var bx=dlg.querySelector('.qg-box');bx&&bx.remove();var cv=dlg.querySelector('.qg-map');cv&&cv.focus();d&&d();if(!d)status();return}
 var L=T.lines[T.i],st=dlg.querySelector('.qg-stage'),bx=dlg.querySelector('.qg-box');if(!st)return;if(!bx){bx=document.createElement('div');bx.className='qg-box';bx.setAttribute('role','group');bx.setAttribute('aria-label','Dialogue');st.appendChild(bx)}
 bx.innerHTML=(L.who?'<p class="qg-who">'+esc(L.who)+'</p>':'')+'<p class="qg-say"></p><button type="button" class="qg-next">'+(T.i<T.lines.length-1?'Next ▾':'OK')+'</button>';
 var el=bx.querySelector('.qg-say'),nb=bx.querySelector('.qg-next');nb.onclick=nextLine;nb.focus({preventScroll:true});say((L.who?L.who+': ':'')+L.text);
 T.el=el;T.full=L.text;if(RM){el.textContent=L.text;return}
 T.typing=true;var n=0;T.timer=setInterval(function(){n+=2;el.textContent=L.text.slice(0,n);if(n>=L.text.length)finishType()},26)}
function finishType(){var T=TALK;if(!T)return;clearInterval(T.timer);T.typing=false;T.el.textContent=T.full}
function interact(th){if(th.card)return openChest(th);if(th.text)return talk([{who:'Sign',text:th.text}]);var who=th.name,ls=th.lines;if(QUESTS[th.id]||QHOOK[th.id]){var ql=questTalk(th);if(ql)return talk(ql.map(function(t){return {who:who,text:t}}))}
 if(th.id==='keeper'&&prog().done)ls=['You did it. Look at the color in this town again. The fog may drift back some days, and that\'s alright. You know the way now.'];
 talk(ls.map(function(t){return {who:who,text:t}}))}
function look(){if(TALK)return nextLine();var d=DIRS[P.dir],th=thing(P.x+d[0],P.y+d[1]);if(!th)['up','down','left','right'].some(function(k){var q=DIRS[k];th=thing(P.x+q[0],P.y+q[1]);return !!th});if(th)interact(th);else say('Nobody close enough to talk to. Walk up to a person or sign.')}

/* ---------- scenes ---------- */
function title(){MUS('title');SCENE='title';stopLoop();endTalk();var p=prog(),has=p.x!=null||p.intro;dlg.dataset.scene='title';dlg.dataset.menu='';
 body('<div class="qg-title-card"><canvas class="qg-cv qg-title-cv" width="160" height="56" aria-hidden="true"></canvas><h2 id="qg-title">The Fogstorm</h2><p class="qg-sub">A tiny retro story RPG about coping skills</p></div>'+
 '<p class="qg-lede">Wake in a fog-covered town, cross the Gray Fog Marsh and the Storm Wind Cliffs, and clear symptom clouds with real coping skills. When you need help, call one of the Open Book clinicians as your guide. At the end of the road: a warm, quiet office.</p>'+
 '<div class="qg-menu"><button type="button" class="qg-btn" data-go="play">'+(has?'Continue':'New game')+(has?' <small>Lv '+level(p)+' · '+esc(REG[p.region||'town'].name)+' · '+((p.cleared||[]).length)+' of '+allClouds().length+' clouds cleared'+(p.phase?' · Fogstorm phase '+(p.phase+1):'')+((p.inv||[]).length?' · bag: Golden Fidget Toy':'')+'</small>':'')+'</button><button type="button" class="qg-btn" data-go="how">How to play</button><button type="button" class="qg-btn" data-go="practice">Practice a spell <small>read the real steps</small></button></div>'+
 '<p class="qg-small">'+sndBtn()+'</p><p class="qg-small">Progress is saved only in this browser. Nothing is sent to the practice. <button type="button" class="qg-link" data-go="reset">Reset my game</button></p>',has?'[data-go=play]':'h2');
 var cv=dlg.querySelector('.qg-title-cv'),c=cv.getContext('2d');(function d(t){if(!cv.isConnected||SCENE!=='title')return;c.clearRect(0,0,160,56);c.fillStyle='#24344a';c.fillRect(0,40,160,16);px(c,CLOUD,FOGPAL,92,8+(RM?0:Math.round(Math.sin(t/400))),{s:2});px(c,HERO.side,PAL,40,14,{s:2});if(!RM)raf=requestAnimationFrame(d)})(0);
 dlg.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){var g=b.dataset.go;if(g==='reset'){stopLoop();localStorage.removeItem(KEY);P=null;title();say('Your game was reset.');toast('Game reset')}else if(g==='how')panel('<h2 id="qg-ph">How to play</h2>'+HOWTO());else if(g==='practice')practice();else if(!prog().intro)intro();else map()}})}

/* opening: wake in the fog, meet the lantern-keeper */
var IN={t0:0,up:false};
function intro(){SCENE='intro';dlg.dataset.scene='intro';IN={t0:performance.now(),up:false};
 body('<h2 id="qg-title" class="sr">Opening: Lanternfall Town</h2><div class="qg-stage"><canvas class="qg-cv qg-icv" width="320" height="150" role="img" aria-label="Pixel art: a fog-covered town at dusk. Your traveler wakes on the street as Makayla, the lantern-keeper, walks over with her lantern."></canvas></div><div class="qg-row"><button type="button" class="qg-link" data-skip>Skip the opening</button></div>',false);
 dlg.querySelector('[data-skip]').onclick=endIntro;loop(drawIntro);
 var W='Makayla, the lantern-keeper';
 talk([{who:'',text:'You wake on a cold cobblestone street. A thick gray fog has rolled over Lanternfall Town.'},
  {who:W,text:'Easy now, traveler. I\'m Makayla. I keep the lanterns lit. You\'ve been sleeping in the fog a while.'},
  {who:W,text:'This fog isn\'t ordinary weather. It\'s symptoms: the heavy, tired kind, and the racing, worried kind. They roll in. They are not you.'},
  {who:W,text:'East, past the Gray Fog Marsh and the Storm Wind Cliffs, the Fogstorm sits on the old threshold. Beyond it is the Open Book office. It\'s warm in there. Safe.'},
  {who:W,text:'You won\'t walk alone. Call a guide when you need one, and rest at any lantern. Go on. East is that way.'}],endIntro);
}
function endIntro(){var p=prog();p.intro=1;if(p.x==null){p.region='town';p.x=REG.town.start.x;p.y=REG.town.start.y}saveProg(p);P=null;map()}
function drawIntro(c,t){IN.up=!TALK||TALK.i>=1;var k=Math.min(1,RM?1:(t-IN.t0)/2600);c.fillStyle='#4e5a66';c.fillRect(0,0,320,150);
 for(var i=0;i<5;i++){var hx=10+i*64;c.fillStyle='#3a434d';c.fillRect(hx,44,44,46);c.fillStyle='#5c2730';c.fillRect(hx-4,34,52,12);c.fillStyle='#e9c46a';c.fillRect(hx+8,58,8,8);c.fillRect(hx+28,58,8,8)}
 c.fillStyle='#8c8577';c.fillRect(0,90,320,60);c.fillStyle='#7a7366';for(var j=0;j<320;j+=16)c.fillRect(j+((j/16)%2)*8,98+((j/16)%3)*12,10,3);
 c.fillStyle='#3b2a1a';c.fillRect(250,54,4,44);c.fillStyle='#1a1a2b';c.fillRect(244,44,16,14);c.fillStyle='#f3c95a';c.fillRect(247,47,10,8);c.fillStyle='rgba(243,201,90,'+(RM?.18:.14+.06*Math.sin(t/400))+')';c.fillRect(226,28,52,52);
 if(!IN.up){c.save();c.translate(120,118);c.rotate(-Math.PI/2);px(c,HERO.side,PAL,0,0,{s:2});c.restore()}else px(c,HERO.side,PAL,110,84+(RM?0:Math.floor(t/500)%2),{s:2});
 var kx=RM?170:330-160*k;px(c,GIRL.side,REG.town.npcs[0].pal,kx,84,{s:2,flip:true});c.fillStyle='#f3c95a';c.fillRect(kx-2,104,4,5);
 c.fillStyle='rgba(200,205,210,.35)';c.fillRect(0,0,320,150);if(!RM){c.fillStyle='rgba(230,233,236,.18)';var o=(t/70)%80;for(var q=-1;q<5;q++){c.fillRect(q*80+o,24+q*9,60,7);c.fillRect(q*80-o+30,70+q*11,48,6)}}}

function hudHtml(){var p=prog(),n=(p.inv||[]).length;return '<div class="qg-hud" role="status"><span title="Growth '+gxp(p)+'">Lv '+level(p)+'</span><span class="qg-hp" aria-label="Resolve '+P.resolve+' of '+maxRes(p)+'">Resolve <b>'+P.resolve+'</b>/'+maxRes(p)+'<i><em style="width:'+(100*P.resolve/maxRes(p))+'%"></em></i></span><span>'+esc(R().name)+'</span><span>Clouds '+((p.cleared||[]).length)+'/'+allClouds().length+'</span><button type="button" class="qg-link qg-bagbtn" data-bag>Bag ('+(n+(p.cards||[]).length)+')</button>'+sndBtn()+'</div>'}
function map(){MUS(R().weather&&!lifted(R().lift)?R().weather:'town');SCENE='map';dlg.dataset.scene='map';dlg.dataset.menu='';if(!P)newPlayer();spawn();var r=R();
 body('<h2 id="qg-title" class="sr">'+esc(r.name)+' map</h2>'+hudHtml()+'<div class="qg-stage"><canvas class="qg-cv qg-map" width="'+MW*TS+'" height="'+MH*TS+'" role="img" aria-label="Top-down pixel map of '+esc(r.name)+(lifted(r.lift)?'':', covered in fog')+'. Your traveler, people to talk to, signs'+(r.clouds.length?', symptom clouds':'')+' and a lantern."></canvas><div class="qg-toast" aria-hidden="true"></div></div>'+
 '<p class="qg-status" id="qg-status"></p><div class="qg-controls"><div class="qg-pad" role="group" aria-label="Move">'+['up','left','right','down'].map(function(d){return '<button type="button" class="qg-d '+d+'" data-dir="'+d+'" aria-label="Walk '+d+'"><span aria-hidden="true">'+{up:'▲',down:'▼',left:'◀',right:'▶'}[d]+'</span></button>'}).join('')+'</div>'+
 '<div class="qg-side"><button type="button" class="qg-btn" data-look>Talk / look <small>E key</small></button><button type="button" class="qg-btn" data-near>Face the nearest cloud</button><button type="button" class="qg-link" data-menu>Title screen</button></div></div>',false);
 var pad=dlg.querySelectorAll('[data-dir]');pad.forEach(function(b){var d=b.dataset.dir;function go(e){e.preventDefault();if(TALK)return;held=d;step(d)}function stop(){if(held===d)held=null}
  b.addEventListener('pointerdown',go);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);b.addEventListener('click',function(e){if(e.detail===0)step(d)})});
 dlg.querySelector('[data-near]').onclick=function(){if(TALK)return;var e=nearest();if(e)encounter(e);else say(r.clouds.length?'No clouds left here. Head east.':'No symptom clouds here.')};
 dlg.querySelector('[data-look]').onclick=look;dlg.querySelector('[data-menu]').onclick=function(){savePos();title()};
 status();var cvf=dlg.querySelector('.qg-map');cvf.setAttribute('tabindex','0');cvf.focus();loop(drawMap)}
function status(){var el=dlg&&dlg.querySelector('#qg-status');if(!el||!P)return;var r=R(),t=tile(P.x,P.y),e=nearest();
 el.textContent=(t==='L'?'By the lantern. ':'')+r.name+(lifted(r.lift)?'':' (foggy)')+'. '+(r.clouds.length?(e?'Nearest cloud: '+(Math.abs(e.x-P.x)+Math.abs(e.y-P.y))+' steps away.':'All clouds here are cleared. The way east is open.'):P.region==='castle'?'The Fogstorm waits behind the door to the north.':'Head east to begin.')}
function encounter(e){if(SCENE!=='map'||TALK)return;held=null;savePos();var st=newBattle('enemy',e.weather);st.enemy=e.id;startBattle(st)}
function bossIntro(){if(SCENE==='map')savePos();held=null;var p=prog(),ph=p.phase||0;SCENE='bossintro';stopLoop();var Ph=Q.boss[ph];
 body('<h2 id="qg-title">The Fogstorm on the Threshold</h2><p class="qg-lede">All the weather at once. The storm has four phases. '+(ph?'You are on phase '+(ph+1)+' of 4.':'')+'</p><div class="qg-msg"><b>'+esc(Ph.name)+'</b><br>'+esc(Ph.intro)+'</div><div class="qg-menu"><button type="button" class="qg-btn" data-b>Enter '+esc(Ph.name)+'</button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-b]');
 dlg.querySelector('[data-b]').onclick=function(){startBattle(newBattle('boss',null,ph))};dlg.querySelector('[data-m]').onclick=map}
var BA={eFlash:0,pFlash:0,guide:null,gT:0,shake:0};
function startBattle(st){MUS(st.mode==='boss'?'boss':'battle');if(!P)newPlayer();B=st;SCENE='battle';dlg.dataset.scene='battle';BA={eFlash:0,pFlash:0,guide:null,gT:0};var s=sym(B.current);
 battleUI(null,s.name+' rolls in! '+s.flavor);say(s.name+' appears. '+s.flavor+' Choose Spells, Call Guide or Rest.')}
function hpBar(lbl,v,m,cls){return '<div class="qg-bar '+cls+'" role="meter" aria-label="'+esc(lbl)+'" aria-valuemin="0" aria-valuemax="'+m+'" aria-valuenow="'+v+'" aria-valuetext="'+esc(lbl)+' '+v+' of '+m+'"><span>'+esc(lbl)+' <b>'+v+'</b>/'+m+'</span><i><em style="width:'+(100*v/m)+'%"></em></i></div>'}
function guideList(note,top){var tg=top||null,list=clins().slice();if(tg)list.sort(function(a,b){return (b.id===tg)-(a.id===tg)});
 return '<p class="qg-small">'+note+' Portraits are stylized pixel art, not likenesses.</p><div class="qg-list guides" role="group" aria-label="Open Book clinicians">'+list.map(function(k){return '<button type="button" class="qg-btn gd" data-clin="'+k.id+'"><canvas width="16" height="16" data-face="'+k.id+'" aria-hidden="true"></canvas><span>'+esc(k.name)+'<small>'+esc(k.cred)+((k.settings||[]).join()==='telehealth'?' · telehealth only':'')+(k.id===tg?' · called most on your journey':'')+'</small></span></button>'}).join('')+'</div>'}
function faces(){dlg.querySelectorAll('[data-face]').forEach(function(cv){var c=cv.getContext('2d');c.clearRect(0,0,16,16);px(c,faceRows(cv.dataset.face),facePal(cv.dataset.face),0,0)})}
function battleUI(menu,msg,fsel){var s=sym(B.current),Ph=phaseOf(B),g=guideReady(B);dlg.dataset.menu=menu||'';
 var top=Ph?'<p class="qg-phase">'+esc(Ph.name)+' · Fogstorm phase '+(B.phase+1)+' of 4'+(B.freeRest&&!B.freeRestUsed?' · next Rest is free':'')+'</p>':'';
 var m='';
 if(menu==='spells'){var LV=level();m='<div class="qg-list" role="group" aria-label="Spells">'+Q.spells.concat(EXTRA).map(function(x){var g1=x.kind==='guided',lk=x.lv&&LV<x.lv,rep=B.lastSpell===x.id;return '<button type="button" class="qg-btn sp'+(g1||lk?' locked':'')+(x.lv&&!lk?' new':'')+'" data-spell="'+x.id+'"'+((g1||rep||lk)?' aria-disabled="true"':'')+'>'+esc(x.name.replace(' (solo)',''))+'<small>'+(g1?'Only with a guide':lk?'Unlocks at Lv '+x.lv:rep?'Just cast':x.lv?'Learned at Lv '+x.lv:'Solo')+'</small></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>'}
 else if(menu==='guides')m=guideList('Choose who helps. They cast the right spell for '+esc(s.name)+': no Resolve cost, 3 HP.')+'<div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';
 else m='<div class="qg-cmd" role="group" aria-label="Battle commands"><button type="button" class="qg-btn" data-m="spells">Spells</button><button type="button" class="qg-btn" data-m="guides"'+(g?'':' aria-disabled="true"')+'>Call Guide<small>'+(g?'free · 3 HP':'resting '+B.cooldown+' turn'+(B.cooldown>1?'s':''))+'</small></button><button type="button" class="qg-btn" data-m="rest">Rest<small>+3 Resolve</small></button></div>';
 body('<h2 id="qg-title" class="qg-bt">'+esc(s.name)+' <small>'+(s.weather==='fog'?'Gray Fog':'Storm Wind')+' symptom</small></h2>'+top+
 '<div class="qg-stage battle"><canvas class="qg-cv qg-bcv" width="320" height="150" role="img" aria-label="Battle: your traveler faces '+esc(s.name)+'"></canvas></div>'+
 '<div class="qg-bars">'+hpBar(s.name+(Ph?' (phase HP)':'')+' HP',B.meter,B.max,'e')+hpBar('Your Resolve',B.resolve,B.maxRes,'p')+'</div>'+
 '<div class="qg-msg" id="qg-msg">'+msg+'</div>'+m,fsel||(menu?'.qg-list .qg-btn':'.qg-cmd .qg-btn'));
 faces();
 var bk=dlg.querySelector('[data-back]');bk&&(bk.onclick=function(){battleUI(null,msg)});
 dlg.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var k=b.dataset.m;if(b.getAttribute('aria-disabled')){say('Your guides are resting for '+B.cooldown+' more turn'+(B.cooldown>1?'s':'')+'. Try a spell or Rest.');return}if(k==='rest')return act('rest');battleUI(k,msg)}});
 dlg.querySelectorAll('[data-spell]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled')){var sm=b.querySelector('small').textContent;if(/^Unlocks/.test(sm)){say(sm+'. Make right choices to grow.');return}say(sm==='Just cast'?'You just cast that. Try another spell.':'That spell is only cast with a guide. Use Call Guide.');return}act(b.dataset.spell)}});
 dlg.querySelectorAll('[data-clin]').forEach(function(b){b.onclick=function(){act('guide',{clinician:b.dataset.clin})}});
 loop(drawBattle)}
/* battle scene */
/* battle backdrops: one per region, painted once and cached */
var BDC={};
function backdrop(kind){if(BDC[kind])return BDC[kind];var cv=document.createElement('canvas');cv.width=320;cv.height=150;var c=cv.getContext('2d');
 function r(col,x,y,w,h){c.fillStyle=col;c.fillRect(x,y,w,h)}
 function bands(cols,y0,y1){var n=cols.length,hh=(y1-y0)/n;for(var i=0;i<n;i++){r(cols[i],0,Math.round(y0+i*hh),320,Math.ceil(hh)+1);if(i<n-1){c.fillStyle=cols[i+1];var yy=Math.round(y0+(i+1)*hh)-2;for(var x=0;x<320;x+=2){c.fillRect(x+(i%2),yy,1,1);c.fillRect(x+1-(i%2),yy+1,1,1)}}}}
 function hills(col,base,amp,per,ph){c.fillStyle=col;for(var x=0;x<320;x++){var y=base-Math.round(amp*(.6*Math.sin(x/per+ph)+.4*Math.sin(x/(per*.43)+ph*2)));c.fillRect(x,y,1,150-y)}}
 if(kind==='fog'){bands(['#6c757b','#78828a','#858f96','#929ba1','#a0a8ad'],0,110);hills('#6a7a70',86,8,30,1);hills('#5d6e62',96,6,22,3);
  r('#5f7a5e',0,100,320,50);c.fillStyle='#6f8a6e';for(var j=100;j<150;j++)for(var x=(j%2);x<320;x+=2)if(((x*7+j*13)>>3)%4===0)c.fillRect(x,j,1,1);
  r('#4f6f78',110,112,120,14);r('#5f8592',116,113,108,2);r('#6f93a0',124,118,40,1);r('#6f93a0',176,121,30,1);
  for(var q=0;q<26;q++){var rx=(q*53)%320,hh=14+(q*7)%18,by=104+(q*11)%40;if(rx>104&&rx<236&&by<128||rx>20&&rx<110)continue;r('#3f6630',rx,by-hh,1,hh);r('#56803e',rx+1,by-hh+3,1,hh-3);r('#6b4a2e',rx,by-hh-3,2,4)}}
 else if(kind==='storm'){bands(['#1f2c3d','#26364a','#2e4158','#3a5068','#4a6178'],0,110);hills('#33414f',78,16,26,.5);hills('#3f4e5c',92,10,18,2);
  r('#66747f',0,102,320,48);c.fillStyle='#56636d';for(var j=104;j<150;j+=6)r('#5d6a74',0,j,320,1);for(var x=0;x<320;x+=11)r('#56636d',x,102+(x%5),1,48);
  r('#a3b1bb',0,101,320,1);r('#7d8d99',176,96,108,12);r('#93a1ab',176,96,108,1);r('#56636d',176,107,108,3);r('#7d8d99',20,120,100,12);r('#93a1ab',20,120,100,1)}
 else{bands(['#141420','#1c1c2b','#252536','#2f2f42'],0,100);r('#3a3c47',0,40,320,70);
  for(var y=40;y<110;y+=8){var off=(y/8)%2?0:10;for(var x=-10;x<320;x+=20){r('#454856',x+off,y,19,7);r('#555869',x+off,y,19,1)}}
  r('#2b2c36',216,24,24,86);r('#2b2c36',290,24,24,86);for(var b=0;b<3;b++){r('#2b2c36',216+b*9,18,6,6);r('#2b2c36',290+b*9,18,6,6)}
  r('#14141c',248,62,34,48);r('#14141c',252,56,26,6);r('#1f1f2a',252,62,26,48);r('#8a2f3c',60,46,14,30);r('#6e1f24',60,72,14,4);r('#8a2f3c',146,46,14,30);r('#6e1f24',146,72,14,4);r('#f3c95a',66,56,2,6);r('#f3c95a',152,56,2,6);
  r('#4a4c56',0,108,320,42);for(var x2=0;x2<320;x2+=16){r('#565962',x2,108,15,7);r('#3f414a',x2+8,116,15,7)}}
 /* soft platforms under each fighter */
 c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(232,108,40,6,0,0,6.283);c.fill();c.beginPath();c.ellipse(64,132,32,5,0,0,6.283);c.fill();
 return BDC[kind]=cv}
function spark(x,y,col){if(RM)return;for(var i=0;i<12;i++){var a=i/12*6.283;PARTS.push({x:x,y:y,vx:Math.cos(a)*.09,vy:Math.sin(a)*.09,l:380,c:i%2?'#ffffff':col})}PARTS.push({ring:1,x:x,y:y,l:300,c:col})}
function drawBattle(c,t,dt){var s=sym(B.current),boss=B.mode==='boss';
 c.drawImage(backdrop(boss?'boss':s.weather),0,0);
 if(!RM&&!boss&&s.weather==='fog'){var fb=fogBand();c.globalAlpha=.7;var o=(t/80)%120;for(var i=-1;i<4;i++)c.drawImage(fb,Math.round(i*120+o),70+(i*17%20));c.globalAlpha=1}
 if(!RM&&(boss||s.weather==='storm')&&Math.floor(t/4200)%3===0&&(t%4200)<120){c.fillStyle='rgba(220,230,255,.18)';c.fillRect(0,0,320,150)}
 if(BA.eFlash>0)BA.eFlash-=dt;if(BA.pFlash>0)BA.pFlash-=dt;
 if(BA.eFlash>300&&!BA.sE){BA.sE=1;spark(boss?232:232,boss?60:72,'#f3c95a')}if(BA.eFlash<=0)BA.sE=0;
 if(BA.pFlash>300&&!BA.sP){BA.sP=1;spark(64,100,'#8fb0c9')}if(BA.pFlash<=0)BA.sP=0;
 var bob=RM?0:Math.round(Math.sin(t/350)*2),ef=BA.eFlash>0&&Math.floor(BA.eFlash/80)%2===0,pf=BA.pFlash>0&&Math.floor(BA.pFlash/80)%2===0;
 cloudAt(c,CLOUD,boss?BOSSPAL:s.weather==='fog'?FOGPAL:STORMPAL,boss?190:204,(boss?14:44)+bob,boss?6:4,t,ef);
 if(!RM&&s.weather==='storm'){c.fillStyle='rgba(143,176,201,.6)';for(var j=0;j<14;j++)c.fillRect((j*23+t/6)%320,(j*31+t/2)%108,1,4)}
 var ib=RM?0:(Math.floor(t/450)%2);px(c,walkF(HERO.side,0),PAL,40,72+ib,{s:4,flash:pf});
 if(BA.guide){BA.gT-=dt;if(BA.gT<=0)BA.guide=null;else{var a=RM?1:Math.min(1,(1800-BA.gT)/250,BA.gT/300);c.globalAlpha=Math.max(0,a);c.fillStyle='#f4ecd8';c.fillRect(97,61,54,54);c.fillStyle='#1a1a2b';c.fillRect(98,62,52,52);px(c,faceRows(BA.guide),facePal(BA.guide),100,64,{s:3});c.globalAlpha=1}}}
function act(a,opt){var s=sym(B.current),r=turn(B,a,opt);if(r.error){say({cooldown:'Your guides are resting. Try a spell or Rest.',needsguide:'That spell is only cast with a guide.',repeat:'You just cast that. Try another spell.'}[r.error]||'Not available.');return}
 var p=prog();p.practiced=p.practiced||{};var used=r.spell||a;if(a!=='rest')p.practiced[used]=(p.practiced[used]||0)+1;if(r.clinician){p.guides=p.guides||{};p.guides[r.clinician]=(p.guides[r.clinician]||0)+1}if(r.matched&&!r.clinician&&used==='breath'&&(p.quests||{}).jo==='on'){p.quests.jo='ready'}saveProg(p);
 var gain=r.clinician?2:r.matched?2:(a==='rest'&&r.wise)?1:0;
 var x=sp(r.spell||a),k=r.clinician&&clin(r.clinician),line='';
 if(k)line='<b>'+esc(k.name)+', '+esc(k.cred)+'</b> casts <b>'+esc(x.name.replace(' (solo)',''))+'</b> with you. '+(r.gratitude?'First they name how heavy this is. Then you can name one small good thing, or just say "not today." Both count. ':'')+'<b>3 damage</b>, no Resolve spent.<br><span class="qg-tip">Tip: '+esc(r.tip)+'</span>';
 else if(a==='rest')line='You rest and recover 3 Resolve.'+(r.free?' The storm rains, so nothing drains this turn.':'');
 else line='You cast <b>'+esc(x.name.replace(' (solo)',''))+'</b>. '+(r.matched?'<b>It fits!</b> '+r.cleared+' damage'+(B.bonus?' (+'+B.bonus+' from your level)':'')+'. '+esc(x.fits||''):'Partial fit: '+r.cleared+' damage. '+esc(r.hint||''));
 if(r.drain)line+='<br>'+esc(s.name)+' drains '+r.drain+' Resolve.';else if(a!=='rest'||r.free)line+='<br>'+esc(s.name)+' can\'t drain you this turn.';else line+='<br>'+esc(s.name)+' drains nothing.';
 if(a==='rest'&&r.wise)line+=' Resting when you are low is a wise choice.';if(r.lock)line+='<br><em>'+esc(r.lock)+'</em>';if(gain)line+='<br><span class="qg-xp">+'+gain+' growth</span>';if(r.rain)line+='<br><em>The storm rains: your next Rest is free.</em>';
 if(window.obcSound){try{if(r.matched)obcSound.chime(2)}catch(e){}}
 if(P)P.resolve=B.resolve;var lvUp=gain&&addXP(gain);if(lvUp)line+='<br><b>Level up!</b> Your skills grew stronger.';
 SFX(r.cleared?(r.matched?'hit':'soft'):a==='rest'?'heal':'soft');
 BA.eFlash=r.cleared?400:0;BA.pFlash=r.drain?400:0;if(k){BA.guide=k.id;BA.gT=1800;burst(128,86,'#f3c95a',16)}
 if(r.cleared){burst(232,70,r.matched?'#fff3c4':'#c9cfd2',r.matched?18:6);FLO.push({t:'-'+r.cleared,x:236,y:40,l:900,c:'#fff3c4'})}
 if(r.drain)FLO.push({t:'-'+r.drain,x:56,y:70,l:900,c:'#f08a8a'});if(r.rested)FLO.push({t:'+3',x:76,y:70,l:900,c:'#9fe0a8'});
 if(B.over==='clear')return setTimeout(function(){won(line)},RM?0:650);
 if(B.over==='rest')return setTimeout(regroup,RM?0:650);
 var next=sym(B.current);if(B.mode==='boss'&&next.id!==s.id)line+='<br>The storm shifts: <b>'+esc(next.name)+'</b>. '+esc(next.flavor);
 battleUI(null,line,'#qg-msg');var m=dlg.querySelector('#qg-msg');m&&m.setAttribute('tabindex','-1');say(dlg.querySelector('#qg-msg').textContent)}
function merge(a,b){a=a||{};for(var k in b)a[k]=(a[k]||0)+b[k];return a}
function won(line){var p=prog();p.helped=merge(p.helped,B.helped);
 if(B.kind==='enemy'){var before=level(p);p.gxp=gxp(p)+1;p.cleared=(p.cleared||[]).concat([B.enemy]);p.xp=(p.xp||0)+1;var up=level(p)>before;p.resolve=Math.min(maxRes(p),B.resolve+(up?2:0));if(up)setTimeout(function(){levelUp(level())},50);P.resolve=p.resolve;
  var rk=P.region,r=REG[rk],lift=r.clouds.length&&regionClear(rk,p)&&(p.rcleared||[]).indexOf(rk)<0;if(lift)p.rcleared=(p.rcleared||[]).concat([rk]);
  saveProg(p);ENEMIES=ENEMIES.filter(function(e){return e.id!==B.enemy});var s=sym(B.current);SCENE='won';stopLoop();dlg.dataset.menu='';
  var left=r.clouds.filter(function(e){return p.cleared.indexOf(e[0])<0}).length;
  body('<h2 id="qg-title">'+esc(s.name)+' clears!</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">+1 growth for clearing it.'+(up?' <b>Level up!</b> You are now level '+level(p)+' with '+maxRes(p)+' max Resolve. Your skills grew stronger.':'')+(nextAt(p)!=null?' Next level at '+nextAt(p)+' growth (you have '+gxp(p)+').':'')+(lift?'':' '+left+' cloud'+(left===1?'':'s')+' left in '+esc(r.name)+'.')+'</p>'+
   (lift?'<div class="qg-msg qg-lift"><b>'+esc(r.name)+' is clear!</b><br>The last cloud thins out. Something is changing out there.</div>':'')+
   '<div class="qg-menu"><button type="button" class="qg-btn" data-m>'+(lift?'Watch the fog lift':'Back to the map')+'</button></div>','[data-m]');
  if(window.obcSound){try{obcSound.chime(3)}catch(e){}}
  dlg.querySelector('[data-m]').onclick=function(){if(!lift)return map();LIFT=1600;map();burst(160,104,'#f3c95a',24);burst(80,60,'#9fe0a8',16);burst(240,150,'#9fd3e6',16);talk([{who:'',text:r.clear}])};return}
 var Ph=Q.boss[B.phase];if(!P)newPlayer();P.resolve=B.resolve;
 if(B.phase<3){p.phase=B.phase+1;p.resolve=B.resolve;saveProg(p);SCENE='won';stopLoop();dlg.dataset.menu='';var n=Q.boss[B.phase+1];
  body('<h2 id="qg-title">'+esc(Ph.name)+': cleared</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">'+esc(Ph.outro)+'</p><div class="qg-msg"><b>Next: '+esc(n.name)+'</b><br>'+esc(n.intro)+'</div><div class="qg-menu"><button type="button" class="qg-btn" data-n>Continue</button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-n]');
  dlg.querySelector('[data-n]').onclick=function(){startBattle(newBattle('boss',null,B.phase+1))};dlg.querySelector('[data-m]').onclick=map;return}
 p.wins=(p.wins||0)+1;p.phase=0;p.done=true;p.resolve=maxRes(p);p.region='castle';p.x=10;p.y=3;P=null;saveProg(p);newPlayer();victory(line)}
function victory(line){SCENE='victory';stopLoop();dlg.dataset.menu='';var top=Object.keys(B.helped).sort(function(a,b){return B.helped[b]-B.helped[a]}).slice(0,3),got=BONUS.indexOf('gratitude')>=0;
 body('<h2 id="qg-title">The Fogstorm lifts</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">The storm over the threshold breaks apart, and sunlight spills across the valley, all the way back to Lanternfall Town. The door ahead is open. Warm light glows inside.</p>'+
 '<div class="qg-menu"><button type="button" class="qg-btn qg-primary" data-office>Walk through the door <small>to the Open Book office</small></button></div>'+
 '<section class="qg-skill" aria-label="Your skill card"><h3>Spells that helped most</h3>'+(top.length?'<ul>'+top.map(function(id){var x=sp(id);return '<li><b>'+esc(x.name)+'</b>: '+esc(x.steps.join(' '))+'</li>'}).join('')+'</ul>':'<p>Every spell you tried counts.</p>')+'</section>'+
 '<div class="qg-row"><button type="button" class="qg-btn" data-print>Print my skill card</button></div>'+
 '<p class="qg-small">Have you found all five hidden runes in the book? They reveal a code word for the office.</p>'+
 '<button type="button" class="qg-rune'+(got?' found':'')+'" aria-label="'+(got?'Bonus Gratitude Rune, found':'A faint rune glows on the threshold wall. Touch the Gratitude Rune')+'" aria-pressed="'+got+'">ᚷ</button>','[data-office]');
 dlg.querySelector('[data-print]').onclick=printCard;dlg.querySelector('[data-office]').onclick=office;
 var rn=dlg.querySelector('.qg-rune');rn.onclick=function(){if(BONUS.indexOf('gratitude')<0)BONUS.push('gratitude');rn.classList.add('found');rn.setAttribute('aria-pressed','true');rn.setAttribute('aria-label','Bonus Gratitude Rune, found');hud();say('Bonus rune found: the Gratitude Rune. It is separate from the five hidden runes.');try{obcSound.chime(3)}catch(e){}}}
function printCard(){var c=dlg.querySelector('.qg-skill').innerHTML,w=window.open('','_blank');if(!w)return;w.document.write('<title>My skill card</title><body style="font-family:Georgia,serif;max-width:560px;margin:24px auto">'+c+'<p style="font-size:.85em">Educational game, not therapy. Crisis: call or text 988. Utah: SafeUT (safeut.org). Emergency: 911.</p></body>');w.document.close();w.focus();w.print()}

/* ---------- the final room: a calm counselor's office (no enemies) ---------- */
var OF={who:null,t0:0,enter:0};
function office(){MUS('office');SCENE='officepick';stopLoop();dlg.dataset.scene='office';dlg.dataset.menu='guides';var p=prog(),tg=topGuide(p);
 body('<h2 id="qg-title">The Open Book office</h2><p class="qg-lede">Beyond the threshold is a quiet room with a warm lamp and a soft couch. No clouds can follow you in here. Someone is waiting to welcome you. Who greets you?</p>'+guideList(tg?'Your most-called guide is listed first.':'Pick anyone.',tg),'.qg-list .qg-btn');
 faces();dlg.querySelectorAll('[data-clin]').forEach(function(b){b.onclick=function(){officeScene(b.dataset.clin)}})}
function officeScene(id){var k=clin(id);if(!k)return;SCENE='office';OF={who:id,t0:performance.now()};ITEM=0;dlg.dataset.menu='';
 body('<h2 id="qg-title" class="sr">Inside the Open Book office</h2><div class="qg-stage office"><canvas class="qg-cv qg-ocv" width="320" height="180" role="img" aria-label="A calm, quiet pixel-art counselor\'s office: a warm lamp, a leafy plant, a soft couch, a bookshelf, and an open book on a low table. '+esc(k.name)+' welcomes your traveler."></canvas></div><div id="qg-after"></div>',false);
 loop(drawOffice);var who=k.name+', '+k.cred;
 talk([{who:who,text:'Welcome in. You made it through the fog. Come sit down. The couch is the comfy kind.'},
  {who:who,text:'Coming to counseling takes courage. Walking through a door like this one is one of the bravest steps there is.'},
  {who:who,text:'Healing is a process, not a straight line. Some days the fog drifts back. That doesn\'t erase how far you\'ve come.'},
  {who:who,text:'You know the spells now, and you don\'t have to walk alone. I have something for you.'}],function(){giveItem(id)})}
function giveItem(id){var k=clin(id),p=prog();p.inv=p.inv||[];if(p.inv.indexOf('fidget')<0)p.inv.push('fidget');p.fidgetFrom=id;saveProg(p);ITEM=performance.now();
 burst(120,40,'#f3c95a',20);if(window.obcSound){try{obcSound.chime(3)}catch(e){}}
 talk([{who:'',text:'You got the Golden Fidget Toy! A small golden fidget cube: click the buttons, roll the dial, slide the switch. Something for busy hands while your breathing slows down.'},
  {who:k.name+', '+k.cred,text:'Keep it for the days the weather rolls back in. And if you ever want to talk with a real counselor, our door is open.'}],function(){finale(id)})}
function finale(id){var k=clin(id),a=dlg.querySelector('#qg-after');if(!a)return;SCENE='officedone';
 a.innerHTML='<div class="qg-msg qg-warm" tabindex="-1"><b>You made it.</b> Coming to counseling takes courage, and healing is a process. You carried the Golden Fidget Toy out of the fog, a small reminder that help is real and you can ask for it.</div>'+
 '<p class="qg-lede">If you\'d like to talk with someone at Open Book, we\'d be glad to meet you. No pressure, whenever you\'re ready.</p>'+
 '<div class="qg-menu"><a class="qg-btn qg-menu-a qg-primary" href="'+BOOK+'" target="_blank" rel="noopener">Request an appointment <small>opens Open Book\'s secure client portal in a new tab</small></a><a class="qg-btn qg-menu-a" href="#match" data-quiz>Find a guide who fits you</a><button type="button" class="qg-btn" data-bag>Open my bag</button><button type="button" class="qg-btn" data-m>Walk back out to the valley</button><button type="button" class="qg-link" data-t>Title screen</button></div>';
 a.querySelector('[data-bag]').onclick=bag;a.querySelector('[data-m]').onclick=map;a.querySelector('[data-t]').onclick=title;a.querySelector('.qg-warm').focus();say('You got the Golden Fidget Toy. It is saved in your bag.')}
function drawOffice(c,t,dt){var e=RM?1:Math.min(1,(t-OF.t0)/1400);
 c.fillStyle='#e8cfa6';c.fillRect(0,0,320,110);c.fillStyle='#d9bb8c';for(var i=0;i<320;i+=20)c.fillRect(i,0,2,110);c.fillStyle='#b5835a';c.fillRect(0,104,320,6);
 c.fillStyle='#c9a77c';c.fillRect(0,84,320,20);c.fillStyle='#b8946a';for(var wi=0;wi<320;wi+=20)c.fillRect(wi+8,86,1,16);c.fillStyle='#e9d2ad';c.fillRect(0,84,320,1);c.fillStyle='#9c6b45';c.fillRect(0,110,320,70);c.fillStyle='#a87650';for(var pl=0;pl<320;pl+=32)c.fillRect(pl+1,110,14,70);c.fillStyle='#8a5c3a';for(var j=0;j<320;j+=32)c.fillRect(j,110,1,70);for(var q=118;q<180;q+=14)c.fillRect(0,q,320,1);
 c.fillStyle='#c46e5a';c.fillRect(70,128,180,40);c.fillStyle='#d98d6f';c.fillRect(76,132,168,32);c.fillStyle='#e7b08f';for(var m=84;m<240;m+=16)c.fillRect(m,146,8,4);c.fillStyle='#f0d2b0';for(var fr=72;fr<250;fr+=3){c.fillRect(fr,126,1,2);c.fillRect(fr,168,1,2)}c.fillStyle='#b05a48';c.fillRect(76,132,168,1);c.fillRect(76,163,168,1);
 /* window with soft sky */
 c.fillStyle='#6b4a2e';c.fillRect(130,14,64,48);c.fillStyle='#bfe0f2';c.fillRect(134,18,56,40);c.fillStyle='#f6e6c2';c.fillRect(134,46,56,12);c.fillStyle='#ffffff';c.fillRect(146+(RM?0:Math.floor(t/900)%6),26,14,4);c.fillStyle='#6b4a2e';c.fillRect(160,18,3,40);c.fillRect(134,36,56,3);
 /* bookshelf */
 c.fillStyle='#5a3a22';c.fillRect(12,20,56,90);c.fillStyle='#3b2a1a';c.fillRect(16,24,48,82);var BK=['#8a2f3c','#1f6f73','#c9863a','#3f6fb0','#3d8a4f','#7a4fa0','#e0a92a'];
 for(var sh=0;sh<4;sh++){c.fillStyle='#5a3a22';c.fillRect(16,44+sh*20,48,3);for(var b=0;b<7;b++){c.fillStyle=BK[(b+sh*3)%7];c.fillRect(18+b*6,30+sh*20,5,14-((b+sh)%3)*2+0)}}
 /* couch */
 c.fillStyle='#4f7a63';c.fillRect(210,70,96,44);c.fillStyle='#5f9177';c.fillRect(216,84,84,22);c.fillStyle='#3f6450';c.fillRect(204,80,12,36);c.fillRect(300,80,12,36);c.fillStyle='#e0a92a';c.fillRect(222,78,16,12);c.fillStyle='#c46e5a';c.fillRect(280,78,16,12);
 /* lamp: warm glow that gently breathes */
 var g=RM?.26:.2+.06*Math.sin(t/900);c.fillStyle='rgba(255,214,130,'+g+')';c.beginPath();c.arc(96,46,44,0,6.283);c.fill();c.fillStyle='rgba(255,226,160,'+(g*.8)+')';c.beginPath();c.arc(96,46,24,0,6.283);c.fill();
 c.fillStyle='#3b2a1a';c.fillRect(94,46,4,62);c.fillRect(86,106,20,4);c.fillStyle='#f3c95a';c.fillRect(84,30,24,16);c.fillStyle='#fff0b0';c.fillRect(88,44,16,2);
 /* plant, leaves sway a pixel */
 var sw=RM?0:Math.round(Math.sin(t/1100));c.fillStyle='#b5583f';c.fillRect(110,92,18,18);c.fillStyle='#934632';c.fillRect(108,90,22,4);c.fillStyle='#3d8a4f';c.fillRect(112+sw,70,6,22);c.fillRect(120-sw,66,6,26);c.fillRect(104+sw,78,8,6);c.fillRect(126-sw,74,8,6);c.fillStyle='#5aa86a';c.fillRect(114+sw,72,2,8);c.fillRect(122-sw,68,2,8);
 /* low table with an open book and a mug */
 c.fillStyle='#6b4a2e';c.fillRect(134,124,60,8);c.fillRect(138,132,4,10);c.fillRect(186,132,4,10);c.fillStyle='#fff6dd';c.fillRect(146,116,16,8);c.fillRect(164,116,16,8);c.fillStyle='#8a2f3c';c.fillRect(162,114,2,10);c.fillStyle='#c9b38a';for(var l=0;l<3;l++){c.fillRect(148,118+l*2,12,1);c.fillRect(166,118+l*2,12,1)}
 c.fillStyle='#1f6f73';c.fillRect(184,116,8,8);c.fillRect(192,118,2,4);if(!RM){c.fillStyle='rgba(255,255,255,.5)';var sy=(t/60)%12;c.fillRect(186+Math.round(Math.sin(t/300)),112-sy,1,2);c.fillRect(189-Math.round(Math.sin(t/350)),114-((sy+6)%12),1,2)}
 /* counselor and traveler */
 var k=OF.who,cy=118,hx=RM?120:Math.round(60+60*e);px(c,HERO.side,clinPal(k),200,cy+(RM?0:Math.floor(t/800)%2),{s:2,flip:true});
 var held=ITEM>0;if(held){px(c,HERO.down,PAL,hx,cy,{s:2});var a=RM?1:Math.min(1,(t-ITEM)/600);c.fillStyle='rgba(255,226,140,'+(.25*a)+')';c.beginPath();c.arc(hx+12,cy-12,18,0,6.283);c.fill();var fy=cy-26+(RM?0:Math.round(-4*a));var gg=c.createRadialGradient(hx+12,fy+6,1,hx+12,fy+6,22);gg.addColorStop(0,'rgba(255,240,170,'+(.55*a)+')');gg.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=gg;c.fillRect(hx-12,fy-16,48,44);drawFidget(c,hx+6,fy,1,t);if(!RM){var gl=(t/500)%6;c.fillStyle='rgba(255,255,255,'+(gl<1?1-gl:0)+')';c.fillRect(hx+8,fy+2,1,1);c.fillRect(hx+15,fy+8,1,1)}}
 else px(c,HERO.side,PAL,hx,cy+(RM||e<1?0:Math.floor(t/600)%2),{s:2});
 var lg=RM?.34:.3+.04*Math.sin(t/900),gr=c.createRadialGradient(96,40,6,96,40,230);gr.addColorStop(0,'rgba(255,214,140,'+lg+')');gr.addColorStop(.45,'rgba(255,190,110,.12)');gr.addColorStop(1,'rgba(60,30,20,.28)');c.fillStyle=gr;c.fillRect(0,0,320,180);
 c.fillStyle='rgba(255,244,210,.10)';c.beginPath();c.moveTo(134,58);c.lineTo(190,58);c.lineTo(236,170);c.lineTo(150,170);c.closePath();c.fill();
 if(!RM){c.fillStyle='rgba(255,240,200,.5)';for(var d=0;d<5;d++){var dx=(d*61+t/40)%120,dy=(d*37+t/55)%100;c.fillRect(140+Math.round(dx*.6),60+Math.round(dy),1,1)}}}
function bag(){var p=prog(),has=(p.inv||[]).indexOf('fidget')>=0,k=has&&clin(p.fidgetFrom),cs=p.cards||[],ql=questList();
 panel('<h2 id="qg-ph">Your bag</h2><p class="qg-small">Level '+level(p)+' · growth '+gxp(p)+(nextAt(p)!=null?' (next level at '+nextAt(p)+')':' (max level)')+' · spells deal +'+bonus(p)+' damage</p>'+(has?'<div class="qg-item"><canvas width="24" height="24" class="qg-cv qg-itemcv" aria-hidden="true"></canvas><div><b>Golden Fidget Toy</b><p class="qg-small">A small golden fidget cube: click the buttons, roll the dial, slide the switch. Something for busy hands while your breathing slows down.'+(k?' Given to you by '+esc(k.name)+', '+esc(k.cred)+', at the Open Book office.':'')+'</p></div></div>':'<p class="qg-lede">Something golden waits at the end of the road.</p>')+'<h3 class="qg-h3">Coping-skill cards ('+cs.length+' of '+Object.keys(CARDS).length+')</h3>'+(cs.length?'<ul class="qg-cards">'+cs.map(function(id){var c=CARDS[id];return '<li class="qg-card"><canvas width="48" height="64" class="qg-cv" data-card="'+id+'" aria-hidden="true"></canvas><div><b>'+esc(c.name)+'</b><p class="qg-small">'+esc(c.text)+'</p></div></li>'}).join('')+'</ul>':'<p class="qg-small">None yet. Look for treasure chests out on the road, and help the townsfolk.</p>')+(ql?'<h3 class="qg-h3">Side quests</h3><ul class="qg-small">'+ql+'</ul>':''));
 dlg.querySelectorAll('[data-card]').forEach(function(cv){drawCard(cv.getContext('2d'),cv.dataset.card,0,0,2)});
 var cv=dlg.querySelector('.qg-itemcv');if(cv){var c=cv.getContext('2d');px(c,FIDGET,FIDPAL,0,0,{s:2})}}
function regroup(){var p=prog();p.helped=merge(p.helped,B.helped);p.resolve=maxRes(p);var rk=(P&&P.region)||p.region||'town',L=REG[rk].lantern;p.region=rk;p.x=L.x;p.y=L.y;saveProg(p);P=null;newPlayer();SCENE='regroup';stopLoop();dlg.dataset.menu='';var boss=B.mode==='boss';
 body('<h2 id="qg-title">Rest and Regroup</h2><p class="qg-lede">Even the bravest travelers rest. The weather isn\'t your fault, and resting isn\'t losing. You wake up by the lantern with full Resolve. Nothing is lost'+(boss?'; the Fogstorm waits at the same phase.':'.')+'</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button><button type="button" class="qg-btn" data-p>Practice a spell</button><a class="qg-btn qg-menu-a" href="#match" data-quiz>Talk to a real guide</a></div>','[data-m]');
 dlg.querySelector('[data-m]').onclick=map;dlg.querySelector('[data-p]').onclick=practice}
function practice(){SCENE='practice';stopLoop();dlg.dataset.menu='';body('<h2 id="qg-title">Practice a spell</h2><p>No battles here. Read each spell\'s real steps at your own pace.</p><div class="qg-pracs">'+Q.spells.map(function(x){return '<details class="qg-prac"><summary>'+esc(x.name)+(x.kind==='guided'?' (with a guide)':'')+'</summary><ol>'+x.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p class="qg-small">'+esc(x.source)+'</p></details>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back to the title screen</button></div>');dlg.querySelector('[data-back]').onclick=title}
function hud(){var h=$('#runes-hud');if(!h)return;var b=BONUS.indexOf('gratitude')>=0,el=$('#qg-bonus');if(b&&!el){el=document.createElement('span');el.id='qg-bonus';el.className='qg-bonus';el.textContent=' · Bonus rune: Gratitude ✓';h.appendChild(el)}}
function open(){var b=$('#qg-open');b&&b.setAttribute('aria-busy','true');return load().then(function(){if(!dlg)shell();b&&b.removeAttribute('aria-busy');if(!dlg.open)dlg.showModal();title()})}

/* ---------- coping-skill cards (found in chests and earned from side quests) ---------- */
var CARDS={tinystep:{name:'One Tiny Step',col:'#6fae5e',art:'foot',text:'When everything feels like too much, pick the smallest next action: shoes on, one glass of water, one email. Small steps still count.'},
 senses:{name:'5-4-3-2-1 Senses',col:'#5d9cc2',art:'eye',text:'Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. It brings your attention back to right now.'},
 selfpause:{name:'Self-Kindness Pause',col:'#d0708a',art:'heart',text:'Put a hand on your chest and say: this is hard, I am not alone in this, may I be kind to myself right now.'},
 nameit:{name:'Name It to Tame It',col:'#9a7bd0',art:'bubble',text:'Put the feeling into words: "I notice I am feeling anxious." Naming an emotion often makes it a little less loud.'},
 movement:{name:'Gentle Movement',col:'#e0a04a',art:'wave',text:'Stretch, shake out your hands, or take a slow walk. Moving your body helps stress energy move through and out.'},
 values:{name:'Values Check',col:'#4aa38f',art:'compass',text:'Ask: what matters to me here? Choose one small action that points toward that, even if the feeling stays.'},
 reachout:{name:'Reach Out',col:'#e07a5a',art:'hands',text:'Send one message to someone safe: "Rough day. Can we talk?" Connection is a real coping skill, not a weakness.'},
 boxbreath:{name:'Box Breathing',col:'#5aa0e0',art:'box',text:'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat a few rounds. A steady rhythm tells your body it is safe.'},
 calmplace:{name:'Calm Place',col:'#7cc0a0',art:'house',text:'Close your eyes and picture a place where you feel safe and calm. Notice its colors, sounds and smells for a minute.'}};
var CART={foot:['..oo....','.oooo...','.oooo...','..oo..oo','.....ooo','....oooo','.....oo.','........'],
 eye:['........','..oooo..','.o....o.','o..oo..o','o..oo..o','.o....o.','..oooo..','........'],
 heart:['........','.oo..oo.','oooooooo','oooooooo','.oooooo.','..oooo..','...oo...','........'],
 bubble:['.oooooo.','o......o','o.o..o.o','o......o','.oooooo.','..o.....','.o......','........'],
 wave:['........','..oo....','.o..o..o','o....oo.','........','..oo....','.o..o..o','o....oo.'],
 compass:['..oooo..','.o....o.','o...o..o','o..oo..o','o.oo...o','o.o....o','.o....o.','..oooo..'],
 hands:['........','o......o','oo....oo','ooo..ooo','.oooooo.','..oooo..','..o..o..','........'],
 box:['oooooooo','o......o','o.oooo.o','o.o..o.o','o.o..o.o','o.oooo.o','o......o','oooooooo'],
 house:['...oo...','..oooo..','.oooooo.','oooooooo','.o....o.','.o.oo.o.','.o.oo.o.','.oooooo.']};
function drawCard(c,id,x,y,s){var k=CARDS[id];s=s||1;c.fillStyle='#2a2238';c.fillRect(x,y,24*s,32*s);c.fillStyle='#f4ead2';c.fillRect(x+s,y+s,22*s,30*s);c.fillStyle=k.col;c.fillRect(x+3*s,y+3*s,18*s,18*s);c.fillStyle=mixc(k.col,.75);c.fillRect(x+3*s,y+19*s,18*s,2*s);
 var a=CART[k.art];c.fillStyle='#fffbe8';for(var j=0;j<8;j++)for(var i=0;i<8;i++)if(a[j][i]==='o')c.fillRect(x+(4+2*i)*s,y+(4+2*j)*s,2*s,2*s);
 c.fillStyle=mixc(k.col,.7);for(var q=0;q<3;q++)c.fillRect(x+5*s,y+(24+q*2)*s,(14-q*4)*s,s)}
var CHESTS={town:[{x:17,y:11,card:'tinystep'}],marsh:[{x:1,y:1,card:'senses'},{x:18,y:11,card:'selfpause'}],cliffs:[{x:18,y:1,card:'nameit'},{x:1,y:11,card:'movement'}],castle:[{x:2,y:10,card:'values'}]};
Object.keys(CHESTS).forEach(function(k){REG[k].chests=CHESTS[k].map(function(c){c.id='chest-'+c.card;return c})});
function hasCard(id,p){return ((p||prog()).cards||[]).indexOf(id)>=0}
function giveCard(id){var p=prog();p.cards=p.cards||[];if(p.cards.indexOf(id)<0)p.cards.push(id);saveProg(p);var h=dlg.querySelector('.qg-hud');h&&(h.outerHTML=hudHtml())}
function openChest(th){if(hasCard(th.card))return talk([{who:'',text:'The chest is empty now. You already have the '+CARDS[th.card].name+' card.'}]);
 giveCard(th.card);SFX('chest');if(!RM)burst(th.x*TS+8,th.y*TS+6,'#f3c95a',14);var p=prog();if((p.quests||{}).mira==='on'&&(p.cards||[]).filter(function(c){return CHESTS_ALL().indexOf(c)>=0}).length>=3){p.quests.mira='ready';saveProg(p)}
 talk([{who:'',text:'You open the chest and find a coping-skill card: '+CARDS[th.card].name+'. '+CARDS[th.card].text+' (Saved in your Bag.)'}])}
function CHESTS_ALL(){var a=[];for(var k in CHESTS)CHESTS[k].forEach(function(c){a.push(c.card)});return a}
var CHEST=['.kkkkkkkkkk.','kbbbbbbbbbbk','kbBBBBBBBBbk','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'],CHESTO=['.kkkkkkkkkk.','koooooooooook','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'];
CHESTO=['.kkkkkkkkkk.','kooooooooook','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'];
var CHPAL={k:'#2a1a10',b:'#6b4220',B:'#9a6330',y:'#f3c95a',o:'#3a2414'};
function drawChests(c,t){(R().chests||[]).forEach(function(ch){var op=hasCard(ch.card),rows=op?CHESTO:CHEST;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(ch.x*TS+2,ch.y*TS+13,12,2);px(c,rows,CHPAL,ch.x*TS+2,ch.y*TS+(op?7:6));
 if(!op&&!RM){var g=.25+.2*Math.sin(t/350+ch.x);c.fillStyle='rgba(255,230,150,'+g+')';c.fillRect(ch.x*TS+7,ch.y*TS+3,2,2)}})}
/* ---------- side quests: small, hopeful errands for townsfolk ---------- */
var QUESTS={baker:{name:'Warm bread for Tam',give:['Could you do me a favor? Tam fishes out in the Gray Fog Marsh and hasn\'t been by in a while. Would you tell him the bread is warm and he\'s welcome anytime?'],
  wait:['Have you found Tam yet? He\'s usually near the middle of the marsh.'],
  done:['He said that? Oh, good. Sometimes just being thought of is enough to get someone through a gray week. Here, take this card. It\'s one I use.'],card:'reachout',xp:2},
 jo:{name:'One long breath',give:['Want to try something? Next time a storm cloud rushes you, cast Breath of the Calm on it. Then come tell me how it felt.'],
  wait:['Find a storm cloud that races, like a pounding heart, and cast Breath of the Calm. Then come back.'],
  done:['See? Your body listened. That longer out-breath is a skill you can take anywhere. This card has another way to do it.'],card:'boxbreath',xp:2},
 kid:{name:'Treasure hunt',give:['I heard there are treasure chests hidden out past town, with cards inside that teach you brave things. Can you find three? Then come show me!'],
  wait:['Have you found three chests yet? They\'re tucked into the corners of the map.'],
  done:['Three! You\'re a real explorer. Here, this is my favorite card. I close my eyes and go there when school feels loud.'],card:'calmplace',xp:2}};
var QKEY={baker:'pell',jo:'jo',kid:'mira'};
var QHOOK={tam:1};
function questTalk(th){var p=prog();p.quests=p.quests||{};var q=QUESTS[th.id],k=QKEY[th.id];
 if(th.id==='tam'&&p.quests.pell==='on'){p.quests.pell='ready';saveProg(p);toast('Quest: tell Pell');return ['Pell said the bread is warm? Huh. I didn\'t think anyone noticed I\'d been gone. Tell Pell thank you. Maybe I\'ll walk over this week.']}
 if(!q)return null;var st=p.quests[k];
 if(!st){p.quests[k]='on';if(k==='mira'&&(p.cards||[]).filter(function(c){return CHESTS_ALL().indexOf(c)>=0}).length>=3)p.quests[k]='ready';saveProg(p);toast('New quest: '+q.name);SFX('chest');return q.give.concat(th.lines?[]:[])}
 if(st==='on')return q.wait;
 if(st==='ready'){p.quests[k]='done';saveProg(p);giveCard(q.card);addXP(q.xp);SFX('chest');toast('Quest complete: '+q.name);return q.done.concat(['(You got the '+CARDS[q.card].name+' card and +'+q.xp+' growth.)'])}
 return null}
function questList(){var p=prog(),qs=p.quests||{};return Object.keys(QUESTS).map(function(id){var k=QKEY[id],st=qs[k];if(!st)return '';return '<li>'+esc(QUESTS[id].name)+': '+(st==='done'?'done':st==='ready'?'go back and tell them':'in progress')+'</li>'}).join('')}
/* ---------- gentle original chiptune + soft sound effects (WebAudio, generated live) ----------
   Off by default. Audio starts only after you turn it on with a click, so autoplay rules are respected. */
var SKEY='obc_quest_sound',AC=null,AG=null,MT=null,MCUR=null;
function sndOn(){try{return localStorage.getItem(SKEY)==='1'}catch(e){return false}}
function sndBtn(){var on=sndOn();return '<button type="button" class="qg-link qg-snd" data-snd aria-pressed="'+on+'">Sound: '+(on?'on':'off')+'</button>'}
function actx(){if(AC)return AC;var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;AC=new C();AG=AC.createGain();AG.gain.value=.5;AG.connect(AC.destination);return AC}
function tone(f,t0,d,type,v){var c=AC,o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.value=f;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v||.03,t0+.02);g.gain.exponentialRampToValueAtTime(.0005,t0+d);o.connect(g);g.connect(AG);o.start(t0);o.stop(t0+d+.05)}
function SFX(k){if(!sndOn()||!actx()||AC.state!=='running')return;var t=AC.currentTime;
 if(k==='hit'){tone(660,t,.12,'square',.04);tone(990,t+.06,.16,'square',.03)}
 else if(k==='soft')tone(330,t,.12,'triangle',.05);
 else if(k==='heal'){tone(523,t,.2,'triangle',.05);tone(659,t+.1,.25,'triangle',.05)}
 else if(k==='chest'){[523,659,784,1047].forEach(function(f,i){tone(f,t+i*.07,.2,'square',.025)})}
 else if(k==='level'){[392,523,659,784,659,784,1047].forEach(function(f,i){tone(f,t+i*.09,.28,'square',.03)})}}
/* each mood is a short phrase written for this game: original, no borrowed melodies */
var MOODS={title:{bpm:84,root:57,pat:[0,4,7,4,9,7,4,2]},town:{bpm:90,root:60,pat:[0,2,4,7,4,2,9,7]},fog:{bpm:70,root:55,pat:[0,3,7,3,5,3,0,-2]},storm:{bpm:104,root:57,pat:[0,7,3,7,5,7,3,10]},
 battle:{bpm:116,root:57,pat:[0,3,7,10,7,3,5,7]},boss:{bpm:96,root:52,pat:[0,3,6,3,7,6,3,1]},office:{bpm:76,root:60,pat:[0,4,7,11,9,7,4,2]}};
function MUS(m){if(m!==undefined)MCUR=m;clearInterval(MT);MT=null;if(!MCUR||!sndOn()||!actx()||AC.state!=='running')return;var M=MOODS[MCUR]||MOODS.town,i=0,sp=60/M.bpm/2;
 function f(n){return 440*Math.pow(2,(n-69)/12)}
 function tick(){if(!sndOn()){clearInterval(MT);return}var t=AC.currentTime+.05,n=M.pat[i%M.pat.length];tone(f(M.root+12+n),t,sp*1.6,'square',.012);if(i%4===0)tone(f(M.root-12+M.pat[(i>>2)%4]),t,sp*3.6,'triangle',.03);i++}
 tick();MT=setInterval(tick,sp*1000)}
function toggleSnd(){var on=!sndOn();try{localStorage.setItem(SKEY,on?'1':'0')}catch(e){}if(on){actx();if(AC&&AC.state!=='running')AC.resume().then(function(){MUS();SFX('chest')});else{MUS();SFX('chest')}}else{clearInterval(MT);MT=null}
 dlg.querySelectorAll('[data-snd]').forEach(function(b){b.textContent='Sound: '+(on?'on':'off');b.setAttribute('aria-pressed',String(on))});say('Sound '+(on?'on':'off'))}
function init(){var b=$('#qg-open');if(b)b.addEventListener('click',open);hud()}
window.obcQuest={open:open,map:map,title:title,step:step,turn:turn,newBattle:newBattle,draw:draw,rightSpell:rightSpell,look:look,next:nextLine,office:office,officeScene:officeScene,bag:bag,intro:intro,
 encounter:function(id){var e=ENEMIES.find(function(x){return x.id===id})||ENEMIES[0];e&&encounter(e)},boss:function(ph){var p=prog();p.phase=ph||0;saveProg(p);startBattle(newBattle('boss',null,ph||0))},act:function(a,o){act(a,o)},
 go:function(k,x,y){if(!P)newPlayer();var r=REG[k];goRegion(k,x!=null?x:r.start.x,y!=null?y:r.start.y)},
 level:function(){return level()},growth:function(){return gxp()},extra:EXTRA,cards:CARDS,get battle(){return B},get player(){return P},get scene(){return SCENE},get enemies(){return ENEMIES},get talking(){return TALK&&{i:TALK.i,n:TALK.lines.length,who:TALK.lines[TALK.i].who}},regions:REG,load:load};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
