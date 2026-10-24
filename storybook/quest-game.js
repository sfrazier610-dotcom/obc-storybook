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
function prog(){try{var p=JSON.parse(localStorage.getItem(KEY))||{};if(p.v===5&&p.memDone==null&&(p.done||p.phase))p.memDone=1;if(p.v===5&&p.memDone&&p.petAway){p.pet=p.petAway;delete p.petAway}return p.v===5?p:{v:5}}catch(e){return {v:5}}}
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
/* ---------- difficulty (saved in this browser) ---------- */
var DKEY='obc_quest_diff',DIFFS={easy:{name:'Easy',res:10,meter:6,bossMul:.7,drain:.5,rest:6,wander:2,gcd:1,hints:true,blurb:'More Resolve, weaker clouds, bigger rests, guides return sooner, slow clouds. The right coping tool glows gold.'},
 empowered:{name:'Empowered',res:0,meter:8,bossMul:1,drain:1,rest:3,wander:1,gcd:null,hints:false,blurb:'The original balance, and no help choosing a tool. You know your skills.'}};
function diffId(){try{var d=localStorage.getItem(DKEY);return DIFFS[d]?d:null}catch(e){return null}}
function DF(){return DIFFS[diffId()||'empowered']}
function setDiff(d){try{localStorage.setItem(DKEY,d)}catch(e){}}
function gcd(){var g=DF().gcd;return g==null?Q.guide.cooldownTurns:g}
function maxRes(p){return Math.max(8,20+2*(level(p)-1)+DF().res)}
function bonus(p){return level(p)-1}
function nextAt(p){var l=level(p);return l<LVX.length?LVX[l]:null}
/* spells you unlock by leveling up. Each fits a few clouds (never the guide-only ones). */
var EXTRA=[{id:'boxbreath',lv:2,kind:'solo',base:3,name:'Box Breathing',fits:'Even breaths settle a racing body.',for:['heart','squall','scattered','flee']},
 {id:'nameit',lv:3,kind:'solo',base:3,name:'Name It to Tame It',fits:'Naming the feeling turns its volume down.',for:['critic','whatif','graylens','loop','thunder']},
 {id:'reachout',lv:4,kind:'solo',base:3,name:'Reach Out',fits:'One message to someone safe lets light in.',for:['sleep','cloak','worthless']}];
function exSp(id){return EXTRA.find(function(x){return x.id===id})}
function fitsSp(s,id){var e=exSp(id);return s.weakTo.indexOf(id)>=0||!!(e&&e.for.indexOf(s.id)>=0)}
function addXP(n,why){var p=prog(),b=level(p);p.gxp=gxp(p)+n;saveProg(p);var a=level(p);if(a>b){if(B)B.bonus=bonus(p),B.maxRes=maxRes(p);if(P)P.resolve=Math.min(maxRes(p),(P.resolve||0)+2);if(B)B.resolve=Math.min(B.maxRes,B.resolve+2);levelUp(a)}return a>b}
function levelUp(l,n){if(PETJOB&&(n||0)<60){return setTimeout(function(){levelUp(l,(n||0)+1)},250)}var u=EXTRA.filter(function(x){return x.lv===l})[0];SFX('level');var d=document.createElement('div');d.className='qg-lvl';d.setAttribute('role','status');
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
function px(c,rows,pal,x,y,o){o=o||{};if(!PTD)tagPT();var pn=!o.flash&&!o.pixel&&ptName(rows,pal);if(pn&&paint(c,pn,x,y,rows[0].length*(o.s||1),rows.length*(o.s||1),1.12,o.flip))return;var s=o.s||1,w=rows[0].length,cv=sprite(rows,pal,o.flash),X=Math.round(x),Y=Math.round(y);
 if(o.flip){c.save();c.translate(X+w*s,Y);c.scale(-1,1);c.drawImage(cv,0,0,w*s,rows.length*s);c.restore()}else c.drawImage(cv,X,Y,w*s,rows.length*s)}
/* 4-frame walk cycle: stand, left stride, stand, right stride */
var WF=new Map(),LEG1=['...kbk.bk...','...kb..kk...','...kk.......'],LEG3=['...kb.kbk...','...kk..bk...','.......kk...'];
var PTD=0;function tagPT(){PTD=1;if(typeof CHEST!=='undefined')CHEST._pt='chest';if(typeof CHESTO!=='undefined')CHESTO._pt='chesto';if(typeof PETS!=='undefined')for(var id in PETS)['up','down','side'].forEach(function(d){if(PETS[id][d])PETS[id][d]._pt=id==='kenneth'?'cat':'dog'});['down','up','side','left','right'].forEach(function(d){if(HERO[d])HERO[d]._pt='hum';if(GIRL[d])GIRL[d]._pt='keeper'})}
function walkF(rows,f){if(!PTD)tagPT();if(f!==1&&f!==3)return rows;var id=rows._id||(rows._id=++SPID),key=id+'/'+f,r=WF.get(key);if(r)return r;r=rows.slice();r._pt=rows._pt;var L=f===1?LEG1:LEG3;r[11]=L[0];r[12]=L[1];r[13]=L[2];WF.set(key,r);return r}
/* soft dithered halo around clouds: two checker phases alternate so the edge seems to drift */
var HALO=new Map();
function halo(rows,pal,par){var key=(rows._id||(rows._id=++SPID))+palKey(pal)+par,cv=HALO.get(key);if(cv)return cv;var w=rows[0].length,h=rows.length;cv=document.createElement('canvas');cv.width=w+4;cv.height=h+4;var c=cv.getContext('2d');
 function on(i,j){return rows[j]&&rows[j][i]&&rows[j][i]!=='.'}
 for(var j=-2;j<h+2;j++)for(var i=-2;i<w+2;i++){if(on(i,j))continue;var d=9;for(var b=-2;b<=2;b++)for(var a=-2;a<=2;a++)if(on(i+a,j+b))d=Math.min(d,Math.abs(a)+Math.abs(b));if(d>2||((i+j+par)%2))continue;c.fillStyle=pal.l;c.globalAlpha=d===1?.55:.28;c.fillRect(i+2,j+2,1,1)}
 c.globalAlpha=1;c.drawImage(sprite(rows,pal),2,2);HALO.set(key,cv);return cv}
function cloudAt(c,rows,pal,x,y,s,t,flash){if(flash)return px(c,rows,pal,x,y,{s:s,flash:1});var cn=pal===FOGPAL?'fog':pal===STORMPAL?'storm':pal===BOSSPAL?'boss':null;if(cn){var w0=rows[0].length*s,h0=rows.length*s,bob=RM?0:Math.sin(t/700)*.04;if(paint(c,cn,x-w0*.1,y,w0*1.2,h0*(1+bob),1.25))return}var par=RM?0:Math.floor(t/420)%2,cv=halo(rows,pal,par);c.drawImage(cv,Math.round(x-2*s),Math.round(y-2*s),cv.width*s,cv.height*s)}
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
/* painted backdrops (webp); procedural art is the fallback until they load */
var QIMG={},NOGROUND=0;function qimg(n){var i=QIMG[n];if(i)return i.complete&&i.naturalWidth?i:null;i=new Image();i.onload=function(){MAPS={};BDC={}};i.src='img/q-'+n+'.webp';QIMG[n]=i;return null}
/* painted sprites: draw an image anchored bottom-centre on a sprite box; returns true if drawn */
var KX=3;function paint(c,n,X,Y,w,h,k,flip){var im=qimg('sp-'+n);if(!im)return false;var H=h*k,W=H*im.naturalWidth/im.naturalHeight;if(W>w*k*1.6){W=w*k*1.6;H=W*im.naturalHeight/im.naturalWidth}var cx=X+w/2,by=Y+h;c.save();c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';if(flip){c.translate(cx,0);c.scale(-1,1);c.drawImage(im,-W/2,by-H,W,H)}else c.drawImage(im,cx-W/2,by-H,W,H);c.restore();return true}
function ptName(rows,pal){var t=rows._pt;if(!t)return null;if(t==='hum'){if(pal===PAL)return 'hero';var k=palKey(pal),hh=0;for(var i=0;i<k.length;i++)hh=(hh*31+k.charCodeAt(i))|0;return 'vil'+(1+Math.abs(hh)%3)}return t}
['map-town','map-marsh','map-cliffs','map-castle','battle-meadow','battle-fog','battle-castle'].forEach(qimg);
function R(){return REG[(P&&P.region)||prog().region||'town']}
function allClouds(){var a=[];ORDER.forEach(function(k){a=a.concat(REG[k].clouds)});return a}
function lifted(key,p){p=p||prog();return key==='done'?!!p.done:(p.rcleared||[]).indexOf(key)>=0}
function regionClear(k,p){var cl=(p||prog()).cleared||[];return REG[k].clouds.every(function(e){return cl.indexOf(e[0])>=0})}
function tile(x,y){return (R().rows[y]||'')[x]||'T'}
function thing(x,y){var r=R(),mm=P&&MINI[P.region];if(mm&&!miniDone(P.region)&&mm.x===x&&mm.y===y)return mm;return (r.chests||[]).find(function(n){return n.x===x&&n.y===y})||r.npcs.find(function(n){return n.x===x&&n.y===y})||r.signs.find(function(n){return n.x===x&&n.y===y})||null}
function walk(x,y){return 'GFS.LDE'.indexOf(tile(x,y))>=0&&!thing(x,y)}
function zone(x,y){var t=tile(x,y);return t==='F'?'fog':t==='S'?'storm':null}
function hash(x,y){return ((x*73856093)^(y*19349663))>>>0}
function drawTile(c,t,x,y,rows){var X=x*TS,Y=y*TS,h=hash(x,y);
 if(NOGROUND){var pm={T:['tree',1.45,0],H:['house',1.3,0],R:['rock',1.0,0],D:['door',1,0],L:['lantern',1.15,1]}[t];if(t==='C'){var wi=qimg('sp-wall');if(wi){c.save();c.imageSmoothingEnabled=true;c.drawImage(wi,(x%2)*32,(y%2)*32,32,32,X,Y,16,16);c.restore();if(y===0){c.fillStyle='rgba(20,20,28,.85)';c.fillRect(X,Y,4,3);c.fillRect(X+8,Y,4,3)}return}}if(pm&&qimg('sp-'+pm[0])){if(pm[2]){c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(X+8,Y+15,5,1.6,0,0,6.283);c.fill()}else if(t!=='D'){c.fillStyle='rgba(20,30,15,.28)';c.beginPath();c.ellipse(X+8,Y+14.5,7,2.2,0,0,6.283);c.fill()}paint(c,pm[0],X+(t==='T'?(h%3)-1:0),Y+(t==='D'?0:1),16,16,pm[1],t==='T'&&h%2);return}}
 function r(col,a,b,w,hh){c.fillStyle=col;c.fillRect(X+a,Y+b,w,hh)}
 function nb(dx,dy){var rr=rows&&rows[y+dy];return rr?(rr[x+dx]||'T'):'T'}
 function dith(c1,c2,seed){r(c1,0,0,16,16);c.fillStyle=c2;for(var j=0;j<16;j++)for(var i=(j+seed)%2;i<16;i+=2)if(hash(X+i+31,Y+j+17)%6===0)c.fillRect(X+i,Y+j,1,1)}
 function grass(){if(NOGROUND)return;dith('#7fb04a','#8cbd55',0);for(var q=0;q<3;q++){var tx=(h>>(q*5))%13+1,ty=(h>>(q*5+3))%12+2;r('#5e9136',tx,ty,1,2);r('#5e9136',tx+2,ty,1,2);r('#a6d36a',tx+1,ty-1,1,2)}
  if(h%9===0){r('#f2e6a0',5,6,2,2);r('#c9a12a',5,7,1,1)}if(h%11===1){r('#f1a8b8',10,11,2,2);r('#c56a80',11,12,1,1)}}
 if(t==='T'){grass();r('rgba(20,40,20,.35)',2,12,12,3);r('#5a3a22',6,10,4,5);r('#3b2a1a',8,10,2,5);
  r('#1e4228',2,2,12,9);r('#1e4228',4,1,8,11);r('#1e4228',1,4,14,5);r('#2f7d40',3,3,10,7);r('#2f7d40',5,2,6,9);r('#2a6f39',3,7,10,3);r('#4fa35a',4,3,5,3);r('#4fa35a',6,2,3,1);r('#7cc47a',5,3,2,1);r('#245f32',9,7,3,2);return}
 if(t==='W'){r('#3f9bb5',0,0,16,16);c.fillStyle='#358aa3';for(var j=8;j<16;j++)for(var i=j%2;i<16;i+=2)c.fillRect(X+i,Y+j,1,1);
  if(nb(0,-1)!=='W'){r('#c6eef2',0,0,16,1);r('#6cc1d0',0,1,16,1)}if(nb(-1,0)!=='W')r('#6cc1d0',0,0,1,16);if(nb(1,0)!=='W')r('#6cc1d0',15,0,1,16);if(nb(0,1)!=='W')r('#2a6f80',0,15,16,1);return}
 if(t==='C'){r('#4a4c56',0,0,16,16);for(var row=0;row<4;row++){var off=row%2?0:4;for(var bx=-1;bx<3;bx++){var x0=off+bx*8;var xs=Math.max(0,x0),xe=Math.min(16,x0+7);if(xe<=xs)continue;r('#6c6f7a',xs,row*4,xe-xs,3);r('#8a8e99',xs,row*4,xe-xs,1);r('#565962',xs,row*4+2,xe-xs,1)}}
  if((h%7)===2){r('#5d7a4c',2,13,3,2);r('#6f9a5a',3,12,1,1)}if(y===0){r('#14141c',0,0,4,3);r('#14141c',8,0,4,3)}return}
 if(t==='D'){r('#6c6f7a',0,0,16,16);r('#4a4c56',2,2,12,14);r('#3b2a1a',3,3,10,13);r('#3b2a1a',4,2,8,1);r('#6b4528',4,4,8,12);r('#7d5332',4,4,3,12);r('#53361f',8,4,1,12);r('#2b2b33',4,7,8,1);r('#2b2b33',4,12,8,1);r('#f3c95a',10,9,2,2);r('#fff0b0',10,9,1,1);return}
 if(t==='H'){grass();r('rgba(20,40,20,.3)',1,14,15,2);r('#e9dcc0',2,7,12,8);r('#d1c19f',2,13,12,2);r('#a8946e',13,7,1,8);
  r('#6e1f24',0,1,16,7);for(var sh=0;sh<3;sh++){r(sh%2?'#8a2f3c':'#9c3a46',0,1+sh*2,16,2);c.fillStyle='#6e1f24';for(var q=(sh%2)*3;q<16;q+=6)c.fillRect(X+q,Y+1+sh*2,1,2)}r('#c25a64',1,1,14,1);r('#4a1418',0,7,16,1);r('#5c5f6a',11,0,3,3);
  r('#3b2a1a',6,10,4,5);r('#5a3a22',7,11,2,4);r('#f3c95a',8,12,1,1);r('#3b2a1a',2,8,4,4);r('#ffd98a',3,9,2,2);r('#3b2a1a',10,8,4,4);r('#ffd98a',11,9,2,2);r('#fff3c4',3,9,1,1);r('#fff3c4',11,9,1,1);return}
 if(t==='R'){if(!NOGROUND)r('#7d8d99',0,0,16,16);r('rgba(0,0,0,.25)',2,12,13,3);r('#3e474e',2,4,12,10);r('#3e474e',3,3,10,12);r('#5b6870',3,4,10,9);r('#76848e',4,4,6,4);r('#a3b1bb',5,4,3,1);r('#4a555d',9,9,4,3);return}
 if(t==='F'){dith('#6f8a6e','#627d62',1);if(h%4===0){r('#4f6f78',3,9,8,3);r('#6f93a0',4,9,4,1)}
  if(h%3!==2){var rx=(h%9)+2;r('#4f7a3a',rx,4,1,9);r('#4f7a3a',rx+3,6,1,7);r('#6e9a52',rx+1,7,1,6);r('#6b4a2e',rx,3,1,3);r('#6b4a2e',rx+3,5,1,2);r('#8a6a44',rx,3,1,1)}return}
 if(t==='S'){dith('#7d8d99','#8a9aa6',0);r('#66747f',(h%10)+2,(h>>4)%10+2,3,1);r('#66747f',(h>>3)%10+3,(h>>7)%10+4,1,2);
  if(h%5===0){r('#56636d',4,8,6,4);r('#93a1ab',5,8,3,1)}
  var bl=nb(0,1);if(bl!=='S'&&bl!=='R'&&bl!=='T'){r('#56636d',0,11,16,5);r('#4a555d',0,15,16,1);c.fillStyle='#66747f';for(var q=1;q<16;q+=3)c.fillRect(X+q,Y+12,1,3);r('#a3b1bb',0,10,16,1)}
  if(nb(0,-1)!=='S'&&nb(0,-1)!=='R')r('#a3b1bb',0,0,16,1);return}
 var path=(t==='.'||t==='L'||t==='E');
 if(path){dith('#d9a86a','#e3b87c',0);r('#b9864f',(h%12)+1,((h>>4)%12)+1,2,1);r('#b9864f',((h>>8)%12)+2,((h>>12)%12)+2,1,1);r('#f0cf98',((h>>6)%12)+2,((h>>10)%12)+2,1,1);
  c.fillStyle='#9c6e3c';var e=function(dx,dy){var n=nb(dx,dy);return 'G'.indexOf(n)>=0||n==='T'||n==='H'};
  if(e(0,-1))for(var i=0;i<16;i+=2)c.fillRect(X+i+(h%2),Y,1,1);if(e(0,1))for(var i2=0;i2<16;i2+=2)c.fillRect(X+i2,Y+15,1,1);if(e(-1,0))for(var j2=0;j2<16;j2+=2)c.fillRect(X,Y+j2,1,1);if(e(1,0))for(var j3=1;j3<16;j3+=2)c.fillRect(X+15,Y+j3,1,1)}
 else grass();
 if(t==='L'){r('rgba(0,0,0,.25)',5,14,7,2);r('#3b2a1a',7,5,2,11);r('#5a3a22',7,5,1,11);r('#1a1a2b',4,0,8,7);r('#2b2b3b',5,0,6,1);r('#f3c95a',5,2,6,4);r('#fff0b0',6,2,2,2);r('#1a1a2b',7,1,2,6)}
 if(t==='E'){r('#b9864f',6,7,4,2);r('#b9864f',x>10?10:4,6,2,4)}}
function mapCanvas(k){if(MAPS[k])return MAPS[k];var save=P,cv=document.createElement('canvas');cv.width=MW*TS*KX;cv.height=MH*TS*KX;var c=cv.getContext('2d');c.scale(KX,KX);c.imageSmoothingEnabled=false;var rows=REG[k].rows,bg=qimg('map-'+k);if(bg){c.imageSmoothingEnabled=true;c.drawImage(bg,0,0,MW*TS,MH*TS);c.imageSmoothingEnabled=false;NOGROUND=1}
 for(var y=0;y<MH;y++)for(var x=0;x<MW;x++){var tt=rows[y][x];if(bg&&'GFS'.indexOf(tt)>=0){if(tt!=='G'){c.fillStyle=tt==='F'?'rgba(70,95,80,.12)':'rgba(90,105,120,.12)';c.fillRect(x*TS,y*TS,TS,TS)}continue}c.globalAlpha=bg&&'.LE'.indexOf(tt)>=0?.82:1;drawTile(c,tt,x,y,rows);c.globalAlpha=1}NOGROUND=0;
 REG[k].signs.forEach(function(s){var X=s.x*TS,Y=s.y*TS;if(bg&&qimg('sp-sign')){c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(X+8,Y+15,5,1.5,0,0,6.283);c.fill();paint(c,'sign',X,Y+1,16,16,1.05);return}function q(col,a,b,w,h){c.fillStyle=col;c.fillRect(X+a,Y+b,w,h)}q('rgba(0,0,0,.25)',4,14,9,2);q('#3b2a1a',7,8,3,8);q('#5a3a22',7,8,1,8);q('#1a1a2b',1,1,14,9);q('#c9a46a',2,2,12,7);q('#e0c48e',2,2,12,1);q('#a8844e',2,8,12,1);q('#5a3a22',4,4,8,1);q('#5a3a22',4,6,6,1)});
 MAPS[k]=cv;return cv}
function spawn(){var cl=prog().cleared||[];ENEMIES=R().clouds.filter(function(e){return cl.indexOf(e[0])<0}).map(function(e){return {id:e[0],weather:e[1],x:e[2],y:e[3],fx:e[2],fy:e[3],t:Math.random()*3000}})}
function newPlayer(){var p=prog(),rg=p.region&&REG[p.region]?p.region:'town',r=REG[rg];P={region:rg,x:p.x!=null?p.x:r.start.x,y:p.y!=null?p.y:r.start.y,dir:'down',moving:null,frame:0,resolve:p.resolve!=null?Math.min(p.resolve,maxRes(p)):maxRes(p)};P.fx=P.x;P.fy=P.y}
function savePos(){var p=prog();p.region=P.region;p.x=P.x;p.y=P.y;p.resolve=P.resolve;saveProg(p)}
var DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function step(dir){if(SCENE!=='map'||!P||P.moving||TALK)return false;P.dir=dir;var d=DIRS[dir],nx=P.x+d[0],ny=P.y+d[1],th=thing(nx,ny);if(th){held=null;interact(th);return false}var sc=R().secret;if(sc&&sc.x===nx&&sc.y===ny){held=null;goRegion(sc.to,sc.tx,sc.ty);toast('You slip through a gap in the trees...');return true}if(!walk(nx,ny)){status();return false}
 petFollow(P.x,P.y,dir);P.moving={sx:P.x,sy:P.y,t:0};P.x=nx;P.y=ny;P.frame^=1;if(RM){P.moving=null;P.fx=nx;P.fy=ny;arrive()}return true}
function goRegion(k,x,y){P.region=k;P.x=x;P.y=y;P.fx=x;P.fy=y;P.moving=null;held=null;PETJOB=null;PET=null;savePos();map();toast(REG[k].name)}
function arrive(){savePos();var t=tile(P.x,P.y);
 if(t==='E'){var ex=R().exits[P.x+','+P.y];if(ex){if(ex.need&&!regionClear(ex.need)){var n=REG[ex.need].clouds.length-REG[ex.need].clouds.filter(function(e){return (prog().cleared||[]).indexOf(e[0])>=0}).length;P.x-=Math.sign(P.x-10)||0;P.fx=P.x;savePos();held=null;return talk([{who:'',text:'The '+(ex.need==='marsh'?'fog':'wind')+' is too thick to pass yet. Clear the '+n+' cloud'+(n>1?'s':'')+' left in '+REG[ex.need].name+' first.'}])}if(ex.need&&MINI[ex.need]&&!miniDone(ex.need)){P.x-=1;P.fx=P.x;savePos();held=null;return talk([{who:'',text:MINI[ex.need].name+' still blocks the way east.'}])}return goRegion(ex.to,ex.x,ex.y)}}
 if(t==='D'){P.y+=1;P.fy=P.y;savePos();return prog().done?office():prog().memDone?bossIntro():memIntro()}
 if(t==='L'){var m=maxRes();if(P.resolve<m){P.resolve=m;savePos();say('You rest by the lantern. Resolve restored to '+m+'.');toast('Rested by the lantern: Resolve full');var h=dlg.querySelector('.qg-hud');h&&(h.outerHTML=hudHtml())}}
 var e=touching();if(e)return encounter(e);status()}
function touching(){return ENEMIES.find(function(e){return Math.abs(e.fx-P.fx)<.6&&Math.abs(e.fy-P.fy)<.6})}
function nearest(){var best=null,bd=1e9;ENEMIES.forEach(function(e){var d=Math.abs(e.x-P.x)+Math.abs(e.y-P.y);if(d<bd){bd=d;best=e}});return best}
function wander(e,dt){if(RM)return;e.t-=dt;if(e.moving){e.moving.t+=dt/(400*DF().wander);var k=Math.min(1,e.moving.t);e.fx=e.moving.sx+(e.x-e.moving.sx)*k;e.fy=e.moving.sy+(e.y-e.moving.sy)*k;if(k>=1)e.moving=null;return}
 if(e.t>0||TALK)return;e.t=(1400+Math.random()*1800)*DF().wander;var ks=Object.keys(DIRS),d=DIRS[ks[Math.floor(Math.random()*4)]],nx=e.x+d[0],ny=e.y+d[1];
 if(zone(nx,ny)===e.weather&&!thing(nx,ny)&&!ENEMIES.some(function(o){return o!==e&&o.x===nx&&o.y===ny})&&!(nx===P.x&&ny===P.y)){e.moving={sx:e.x,sy:e.y,t:0};e.x=nx;e.y=ny}}
function drawMap(c,t,dt){var r=R(),lf=lifted(r.lift);c.drawImage(mapCanvas(P.region),0,0,MW*TS,MH*TS);
 if(!RM){r.rows.forEach(function(row,y){for(var x=0;x<MW;x++)if(row[x]==='W'){var ph=(t/600+x*.7+y*1.3)%4;c.fillStyle='rgba(190,230,245,'+(.55-.12*ph)+')';c.fillRect(x*TS+2+Math.floor(ph*2),y*TS+5,5,1);c.fillStyle='rgba(159,211,230,.45)';c.fillRect(x*TS+9-Math.floor(ph),y*TS+11,4,1)}})}
 r.rows.forEach(function(row,y){for(var x=0;x<MW;x++)if(row[x]==='L'){var g=RM?.22:.16+.08*Math.sin(t/500+x);var gr=c.createRadialGradient(x*TS+8,y*TS+4,1,x*TS+8,y*TS+4,20);gr.addColorStop(0,'rgba(255,220,130,'+(g*2)+')');gr.addColorStop(1,'rgba(255,220,130,0)');c.fillStyle=gr;c.fillRect(x*TS-12,y*TS-16,40,40)}});
 drawChests(c,t);
 r.npcs.forEach(function(n){var S=n.spr==='girl'?GIRL:HERO,dx=P.x-n.x,dy=P.y-n.y,near=Math.abs(dx)+Math.abs(dy)<=3,dir=!near?'down':Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');
  var f=RM?0:[0,0,2,0][Math.floor(t/350+n.x)%4],ib=f===2?1:0,rs=dir==='up'?S.up:dir==='down'?S.down:S.side;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(n.x*TS+4,n.y*TS+14,9,2);
  px(c,rs,n.pal,n.x*TS+2,n.y*TS+1+ib,{flip:dir==='left'});if(n.spr==='girl'){var lx=n.x*TS+(dir==='left'?1:13),ly=n.y*TS+9+ib,lg=RM?.35:.28+.1*Math.sin(t/300);c.fillStyle='rgba(255,214,120,'+lg+')';c.fillRect(lx-3,ly-3,8,8);c.fillStyle='#1a1a2b';c.fillRect(lx,ly,3,4);c.fillStyle='#f3c95a';c.fillRect(lx+1,ly+1,1,2)}});
 ENEMIES.forEach(function(e){wander(e,dt);var bob=RM?0:Math.round(Math.sin(t/300+e.x)*1);c.fillStyle='rgba(0,0,0,.16)';c.fillRect(e.fx*TS+3,e.fy*TS+14,11,2);cloudAt(c,CLOUD,e.weather==='fog'?FOGPAL:STORMPAL,e.fx*TS+1,e.fy*TS+1+bob,1,t)});
 if(P.moving){P.moving.t+=dt/150;var k=Math.min(1,P.moving.t);P.fx=P.moving.sx+(P.x-P.moving.sx)*k;P.fy=P.moving.sy+(P.y-P.moving.sy)*k;if(k>=1){P.moving=null;P.fx=P.x;P.fy=P.y;arrive();if(SCENE==='map'&&held&&!TALK)step(held)}}
 else if(touching()&&SCENE==='map'&&!TALK)encounter(touching());
 petDraw(c,t,dt);
 var rows=P.dir==='up'?HERO.up:P.dir==='down'?HERO.down:HERO.side,wf=P.moving&&!RM?(P.moving.t<.5?(P.frame?3:1):0):0;rows=walkF(rows,wf);var ib=(!RM&&!P.moving&&Math.floor(t/500)%2)?1:0;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(P.fx*TS+4,P.fy*TS+14,9,2);
 px(c,rows,PAL,P.fx*TS+2,P.fy*TS+1+ib,{flip:P.dir==='left'});
 /* fog layer: gray wash until the region is cleared, then it fades away and color returns */
 var a=lf?0:.26;if(LIFT>0){LIFT-=dt;var u=Math.max(0,LIFT/1600);a=.26*u*u*(3-2*u);if(RM)LIFT=0}
 if(a>0){var k2=a/.26;c.save();c.globalCompositeOperation='saturation';c.fillStyle='rgba(128,128,128,'+(.3*k2)+')';c.fillRect(0,0,MW*TS,MH*TS);c.restore();
  c.fillStyle='rgba(150,156,162,'+(a*.6)+')';c.fillRect(0,0,MW*TS,MH*TS);
  var fb=fogBand();c.globalAlpha=Math.min(1,k2*.5);var o=RM?0:(t/90)%96;for(var i=-1;i<5;i++){c.drawImage(fb,Math.round(i*96+o),24+((i*37+80)%60));c.drawImage(fb,Math.round(i*96-o+40),110+((i*23+60)%60))}c.globalAlpha=1;
  if(!RM&&r.weather==='storm'){c.fillStyle='rgba(143,176,201,'+(.5*k2)+')';for(var j=0;j<18;j++)c.fillRect((j*29+t/8)%320,((j*47+t/3)%208),1,3)}}}
/* a soft fog band with dithered edges, drawn once */
function fogBand(){if(fogBand.c)return fogBand.c;var cv=document.createElement('canvas');cv.width=72;cv.height=16;var c=cv.getContext('2d');
 for(var j=0;j<16;j++)for(var i=0;i<72;i++){var dx=(i-36)/36,dy=(j-8)/8,d=dx*dx+dy*dy;if(d>1)continue;var th=d<.35?1:d<.65?((i+j)%2?1:0):((i%2===0&&j%2===0)?1:0);if(!th)continue;c.fillStyle=d<.35?'rgba(232,236,238,.42)':'rgba(232,236,238,.3)';c.fillRect(i,j,1,1)}
 return fogBand.c=cv}

/* ---------- battle rules (pure) ---------- */
function newBattle(kind,weather,phase){var p=prog(),G=Q.guide,st={kind:kind,mode:kind==='boss'?'boss':weather,phase:phase||0,resolve:P?Math.min(P.resolve,maxRes(p)):maxRes(p),maxRes:maxRes(p),meter:DF().meter,max:DF().meter,lastSpell:null,current:null,prev:null,round:0,cooldown:0,gateOpen:false,freeRest:false,freeRestUsed:false,helped:{},over:null,bonus:bonus(p)};
 if(kind==='boss'){var Ph=Q.boss[st.phase];st.meter=st.max=Math.round(Ph.meter*DF().bossMul)+2*st.bonus;if(Ph.guide==='cooldown-start')st.cooldown=gcd()}
 var pp0=p.pet&&PETS[p.pet]?p.pet:null,pl0=petLv(p);if(pp0&&pl0>=4)st.petShield=pp0==='kenneth'?'nap':'bark';if(pp0==='kenneth'&&pl0>=2)st.purr=pl0>=5?2:1;st.current=draw(st);return st}
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
  st.helped[x]=(st.helped[x]||0)+1;st.meter-=3;st.cooldown=(Ph&&Ph.guide==='auto')?0:gcd()+1}
 else if(action==='skill'){var sid=opt&&opt.skill;if(!SKILLS[sid])return {error:'noskill'};out.skill=sid;out.cleared=skillDmg(st);out.drain=0;st.meter-=out.cleared}
 else if(action==='rest'){out.wise=st.resolve<=st.maxRes/2;if(st.freeRest&&!st.freeRestUsed){st.freeRestUsed=true;out.drain=0;out.free=true}else out.drain=Math.ceil(s.drain/2);st.resolve=Math.min(st.maxRes,st.resolve+DF().rest);out.rested=DF().rest}
 else{var S1=sp(action);if(!S1)return {error:'nospell'};if(S1.kind==='guided')return {error:'needsguide'};if(S1.guideOnlyFor&&s.weather===S1.guideOnlyFor)return {error:'fearopp'};if(st.lastSpell===action)return {error:'repeat'};
  var match=fitsSp(s,action),triple=Ph&&Ph.tripleSpell===action;
  if(match){out.matched=true;out.cleared=S1.base*(triple?3:2)+(st.bonus||0);out.drain=0}
  else if(triple){out.cleared=S1.base*3+(st.bonus||0);out.drain=Math.ceil(s.drain/2)}
  else{out.cleared=1;out.drain=Math.ceil(s.drain/2);out.hint=!DF().hints?null:s.guideOnly?'This one is best faced with a guide. Try Call Guide.':(sp(s.weakTo[0]).kind==='guided'?'A guide knows the counter for this one.':'Hint: '+sp(s.weakTo[0]).name+' fits '+s.name+' best.')}
  if(match){COMBO++;st.combo=COMBO;out.combo=st.combo;out.comboBonus=Math.min(3,st.combo-1);out.cleared+=out.comboBonus}else{COMBO=0;st.combo=0}
  st.lastSpell=action;st.meter-=out.cleared;if(match)st.helped[action]=(st.helped[action]||0)+1}
 if(Ph&&Ph.id==='gate'&&!st.gateOpen&&st.meter<1){st.meter=1;out.lock='The Closed Gate holds. Only Guided Step Through the Gate opens it, and that takes a guide.'}
 if(Ph&&Ph.id==='lantern'&&st.meter<1&&out.spell!=='gratitude'){st.meter=1;out.lock='The great lantern lights only with the Shared Gratitude Rune, cast with a guide.'}
 if(out.drain>0&&st.petShield&&!st.shieldUsed){st.shieldUsed=true;out.shield=st.petShield;out.drain=0}
 if(out.drain>0)out.drain=Math.max(1,Math.round(out.drain*DF().drain));
 st.meter=Math.max(0,st.meter);st.resolve=Math.max(0,st.resolve-out.drain);
 if(Ph&&Ph.freeRestAt&&st.meter<=Ph.freeRestAt&&!st.freeRest){st.freeRest=true;out.rain=true}
 if(action!=='guide'||st.cooldown>0){if(st.cooldown>0)st.cooldown--}
 st.round++;st.prev=st.current;
 if(st.meter<=0)st.over='clear';else if(st.resolve<=0)st.over='rest';
 else if(st.mode==='boss')st.current=draw(st);
 return out}

/* ---------- shell + UI ---------- */
var FOOT='<footer class="qg-foot" role="contentinfo" aria-label="Disclaimer and crisis resources"><p>Educational game, not therapy, diagnosis, or a substitute for care. In crisis or thinking about suicide, call or text <a href="tel:988">988</a> (Suicide &amp; Crisis Lifeline). In Utah, use the <a href="https://safeut.org" target="_blank" rel="noopener">SafeUT app or safeut.org</a> for 24/7 chat with a licensed counselor. In an emergency, call <a href="tel:911">911</a>.</p><a class="qg-find" href="#match" data-quiz>Find a guide for the real journey</a></footer>';
function shell(){dlg=document.createElement('dialog');dlg.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-snd],[data-bag]');if(!t)return;if(t.hasAttribute('data-snd'))toggleSnd();else bag()});dlg.className='qg';dlg.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-safehud]')&&!TALK)safePlace()});dlg.setAttribute('aria-labelledby','qg-title');
 dlg.innerHTML='<button class="qg-x" type="button" aria-label="Close the game">✕</button><button class="qg-help-btn" type="button" data-help aria-haspopup="true">How to play</button><div class="qg-body"></div><section class="qg-panel" hidden aria-labelledby="qg-ph"></section><p class="qg-live sr" aria-live="polite"></p>'+FOOT;
 document.body.appendChild(dlg);
 dlg.querySelector('.qg-x').onclick=close;dlg.querySelector('[data-help]').onclick=function(){panel('<h2 id="qg-ph">How to play</h2>'+HOWTO())};
 dlg.addEventListener('cancel',function(e){e.preventDefault();if(!dlg.querySelector('.qg-panel').hidden)return unpanel();close()});
 dlg.addEventListener('close',function(){stopLoop();inertPage(false)});
 dlg.addEventListener('keydown',key);dlg.addEventListener('keyup',function(e){var d=KEYS[e.key];if(d&&held===d)held=null});
 dlg.addEventListener('click',function(e){var l=e.target.closest&&e.target.closest('a[href]');if(l&&!l.hasAttribute('data-quiz')&&l.target!=='_blank'&&!/^tel:/.test(l.getAttribute('href'))){e.preventDefault();return}var a=e.target.closest('[data-quiz]');if(a){e.preventDefault();close();var i=[].slice.call(document.querySelectorAll('.chapter')).findIndex(function(c){return c.id==='match'});if(window.obcTurnTo&&i>=0)obcTurnTo(i);else location.hash='#match'}})}
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
function body(h,focusSel){setTimeout(petSync,0);endTalk();var b=dlg.querySelector('.qg-body');b.innerHTML=h;var sc=dlg.dataset.scene||'';if(sc!==body._sc){var pn0=dlg.querySelector('.qg-panel');if(pn0&&!pn0.hidden){pn0.hidden=true;b.hidden=false}}if(sc!==body._sc&&!RM){b.classList.remove('qg-enter');void b.offsetWidth;b.classList.add('qg-enter')}body._sc=sc;b.scrollTop=0;var f=focusSel===false?null:b.querySelector(focusSel||'h2');if(f){if(!/BUTTON|A/.test(f.tagName))f.setAttribute('tabindex','-1');f.focus()}}
function say(t){var l=dlg&&dlg.querySelector('.qg-live');if(!l)return;l.textContent='';setTimeout(function(){l.textContent=t},30)}
function toast(t){var b=dlg.querySelector('.qg-toast');if(!b)return;b.textContent=t;b.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(function(){b.classList.remove('on')},1800)}
function inertPage(on){[].forEach.call(document.body.children,function(el){if(el===dlg)return;if(on){if(!el.inert){el.inert=true;el.dataset.qgInert='1'}}else if(el.dataset.qgInert){el.inert=false;delete el.dataset.qgInert}})}
function close(){MUS(null);if(dlg&&dlg.open)dlg.close();inertPage(false);stopLoop();endTalk();var b=$('#qg-open');b&&b.focus()}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;held=null}
function loop(draw1){applyLook();stopLoop();var cv=dlg.querySelector('canvas.qg-cv');if(!cv)return;if(!cv._hi){cv._hi=1;cv._lw=cv.width;cv._lh=cv.height;cv.width=cv._lw*KX;cv.height=cv._lh*KX}var LW=cv._lw,LH=cv._lh;var c=cv.getContext('2d');var last=performance.now();
 (function f(t){var dt=Math.min(64,t-last);last=t;if(!dlg.open||!cv.isConnected){raf=0;return}c.setTransform(KX,0,0,KX,0,0);c.imageSmoothingEnabled=false;draw1(c,t,dt);if(SCENE==='map')c.drawImage(lightLayer('map'),0,0,LW,LH);drawParts(c,dt);raf=requestAnimationFrame(f)})(last)}
function burst(x,y,col,n){if(RM)return;for(var i=0;i<n;i++){var a=Math.random()*6.283,v=.04+Math.random()*.08;PARTS.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:600,c:col})}}
function drawParts(c,dt){PARTS=PARTS.filter(function(p){p.l-=dt;if(p.l<=0)return false;if(p.ring){var rr=Math.round((300-p.l)/12)+3;c.fillStyle=p.c;for(var q=0;q<16;q++){var aa=q/16*6.283;c.fillRect(Math.round(p.x+Math.cos(aa)*rr),Math.round(p.y+Math.sin(aa)*rr),2,2)}return true}p.x+=p.vx*dt;p.y+=p.vy*dt;c.fillStyle=p.c;c.fillRect(Math.round(p.x),Math.round(p.y),2,2);return true});
 FLO=FLO.filter(function(f){f.l-=dt;if(f.l<=0)return false;var age=900-f.l,base=f.big?16:12,sz=RM?base:Math.round(base*(age<140?1+.5*(1-age/140):1)),y=f.y-(RM?0:Math.min(18,age/40)),x=f.x+(RM?0:Math.sin(age/120)*2);c.save();c.globalAlpha=RM?1:Math.min(1,f.l/250);c.font='bold '+sz+'px ui-monospace,Menlo,Consolas,monospace';c.lineWidth=3;c.strokeStyle='#1a1a2b';c.lineJoin='round';c.strokeText(f.t,x,y);c.fillStyle=f.c;c.fillText(f.t,x,y);c.restore();return true})}

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
function interact(th){if(th.mini)return miniTalk(th);if(th.skill)return openChest(th);if(th.text)return talk([{who:'Sign',text:th.text}]);var who=th.name,ls=th.lines;if(QUESTS[th.id]||QHOOK[th.id]){var ql=questTalk(th);if(ql)return talk(ql.map(function(t){return {who:who,text:t}}))}
 if(th.id==='keeper'&&prog().done)ls=['You did it. Look at the color in this town again. The fog may drift back some days, and that\'s alright. You know the way now.'];
 talk(ls.map(function(t){return {who:who,text:t}}))}
function look(){if(TALK)return nextLine();var d=DIRS[P.dir],th=thing(P.x+d[0],P.y+d[1]);if(!th)['up','down','left','right'].some(function(k){var q=DIRS[k];th=thing(P.x+q[0],P.y+q[1]);return !!th});if(th)interact(th);else say('Nobody close enough to talk to. Walk up to a person or sign.')}

/* ---------- scenes ---------- */
function title(){MUS('title');SCENE='title';stopLoop();endTalk();var p=prog(),has=p.x!=null||p.intro;dlg.dataset.scene='title';dlg.dataset.menu='';
 body('<div class="qg-title-card"><canvas class="qg-cv qg-title-cv" width="160" height="56" aria-hidden="true"></canvas><h2 id="qg-title">The Fogstorm</h2><p class="qg-sub">A tiny retro story RPG about coping skills</p></div>'+
 '<p class="qg-lede">Wake in a fog-covered town, cross the Gray Fog Marsh and the Storm Wind Cliffs, and clear symptom clouds with real coping skills. When you need help, call one of the Open Book clinicians as your guide. At the end of the road: a warm, quiet office.</p>'+
 diffPick()+'<div class="qg-menu"><button type="button" class="qg-btn" data-go="play">'+(has?'Continue':'New game')+(has?' <small>Lv '+level(p)+' · '+esc(REG[p.region||'town'].name)+' · '+((p.cleared||[]).length)+' of '+allClouds().length+' clouds cleared'+(p.phase?' · Fogstorm phase '+(p.phase+1):'')+((p.inv||[]).length?' · bag: Golden Fidget Toy':'')+'</small>':'')+'</button><button type="button" class="qg-btn" data-go="how">How to play</button><button type="button" class="qg-btn" data-go="practice">Practice a spell <small>read the real steps</small></button><button type="button" class="qg-btn" data-go="guide">Field Guide <small>what each cloud stands for</small></button></div>'+
 '<p class="qg-small">'+sndBtn()+'</p><p class="qg-small">Progress is saved only in this browser. Nothing is sent to the practice. <button type="button" class="qg-link" data-go="reset">Reset my game</button></p>',has?'[data-go=play]':'h2');
 var cv=dlg.querySelector('.qg-title-cv'),c=cv.getContext('2d');(function d(t){if(!cv.isConnected||SCENE!=='title')return;c.clearRect(0,0,160,56);c.fillStyle='#24344a';c.fillRect(0,40,160,16);px(c,CLOUD,FOGPAL,92,8+(RM?0:Math.round(Math.sin(t/400))),{s:2});px(c,HERO.side,PAL,40,14,{s:2});if(!RM)raf=requestAnimationFrame(d)})(0);
 dlg.querySelectorAll('[data-diff]').forEach(function(b){b.onclick=function(){setDiff(b.dataset.diff);if(P)P.resolve=Math.min(P.resolve,maxRes(prog()));title();var f=dlg.querySelector('[data-diff="'+b.dataset.diff+'"]');f&&f.focus();say('Difficulty: '+DIFFS[b.dataset.diff].name)}});
 dlg.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){var g=b.dataset.go;if(g==='guide')return panel(fieldGuide());if(g==='play'&&!diffId())setDiff('empowered');if(g==='reset'){stopLoop();localStorage.removeItem(KEY);P=null;title();say('Your game was reset.');toast('Game reset')}else if(g==='how')panel('<h2 id="qg-ph">How to play</h2>'+HOWTO());else if(g==='practice')practice();else if(!prog().intro)intro();else if(!prog().pet&&!prog().petAway)petPick(map);else map()}})}

/* return visit: continue or start over */
function wbGo(){if(!prog().intro)intro();else if(!prog().pet&&!prog().petAway)petPick(map);else map()}
function welcome(){MUS('title');SCENE='welcome';stopLoop();endTalk();var p=prog(),pa=p.pet&&PETS[p.pet];dlg.dataset.scene='welcome';dlg.dataset.menu='';
 body('<h2 id="qg-title">Welcome back, traveler</h2><p class="qg-lede">Your journey is saved in this browser. Pick up where you left off, or begin again from the start.</p>'+
 '<div class="qg-menu qg-wb"><button type="button" class="qg-btn" data-wb="go">Continue your journey <small>Lv '+level(p)+' · '+esc(REG[p.region||'town'].name)+(pa?' · with '+esc(pa.name)+' the '+esc(pa.kind):'')+'</small></button>'+
 '<button type="button" class="qg-btn" data-wb="safe">Visit your Safe Place <small>'+(p.safe?esc(SAFE[p.safe].name)+' · recharge':'choose a calm place')+'</small></button><button type="button" class="qg-btn" data-wb="new">Start a new game <small>back to the opening with Makayla</small></button></div><p class="qg-small"><button type="button" class="qg-link" data-wb="title">Go to the title screen</button></p>','[data-wb=go]');
 dlg.querySelectorAll('[data-wb]').forEach(function(b){b.onclick=function(){var g=b.dataset.wb;if(g==='go')wbGo();else if(g==='safe'){if(!prog().intro||(!prog().pet&&!prog().petAway))wbGo();else{P=null;newPlayer();safePlace()}}else if(g==='title')title();else wbConfirm()}})}
function wbConfirm(){SCENE='welcome';body('<h2 id="qg-title">Start a new game?</h2><p class="qg-lede">This clears your progress. Your cards and fidget toy will reset too.</p>'+
 '<div class="qg-menu qg-wb"><button type="button" class="qg-btn" data-wb="yes">Yes, start a new game</button><button type="button" class="qg-btn" data-wb="no">Keep my progress</button></div>','[data-wb=no]');
 dlg.querySelectorAll('[data-wb]').forEach(function(b){b.onclick=function(){if(b.dataset.wb==='yes'){stopLoop();localStorage.removeItem(KEY);P=null;PET=null;PETJOB=null;toast('New game started');intro()}else welcome()}})}
/* opening: wake in the fog, meet the lantern-keeper */
var IN={t0:0,up:false};
function intro(){SCENE='intro';dlg.dataset.scene='intro';IN={t0:performance.now(),up:false};
 body('<h2 id="qg-title" class="sr">Opening: Lanternfall Town</h2><div class="qg-stage"><canvas class="qg-cv qg-icv" width="320" height="150" role="img" aria-label="Pixel art: a fog-covered town at dusk. Your traveler wakes on the street as Makayla, the lantern-keeper, walks over with her lantern, with Kenneth the orange cat and Ragnar the German Shepherd."></canvas></div><div class="qg-row"><button type="button" class="qg-link" data-skip>Skip the opening</button></div>',false);
 dlg.querySelector('[data-skip]').onclick=endIntro;loop(drawIntro);
 var W='Makayla, the lantern-keeper';
 talk([{who:'',text:'You wake on a cold cobblestone street. A thick gray fog has rolled over Lanternfall Town.'},
  {who:W,text:'Easy now, traveler. I\'m Makayla. I keep the lanterns lit. You\'ve been sleeping in the fog a while.'},
  {who:W,text:'This fog isn\'t ordinary weather. It\'s symptoms: the heavy, tired kind, and the racing, worried kind. They roll in. They are not you.'},
  {who:W,text:'East, past the Gray Fog Marsh and the Storm Wind Cliffs, the Fogstorm sits on the old threshold. Beyond it is the Open Book office. It\'s warm in there. Safe.'},
  {who:W,text:'These two followed me out tonight. Kenneth is an orange cat who loves warm laps. Ragnar is a German Shepherd with tall ears who never leaves a friend behind.'},
  {who:W,text:'They\'re looking for someone to keep company. In a moment, you can choose which one walks with you.'},
  {who:W,text:'You won\'t walk alone. Call a guide when you need one, and rest at any lantern. Go on. East is that way.'}],endIntro);
}
function endIntro(){var p=prog();p.intro=1;if(p.x==null){p.region='town';p.x=REG.town.start.x;p.y=REG.town.start.y}saveProg(p);P=null;PET=null;if(!p.pet&&!p.petAway)return petPick(map);map()}
function drawIntro(c,t){IN.up=!TALK||TALK.i>=1;var k=Math.min(1,RM?1:(t-IN.t0)/2600);c.fillStyle='#4e5a66';c.fillRect(0,0,320,150);
 for(var i=0;i<5;i++){var hx=10+i*64;c.fillStyle='#3a434d';c.fillRect(hx,44,44,46);c.fillStyle='#5c2730';c.fillRect(hx-4,34,52,12);c.fillStyle='#e9c46a';c.fillRect(hx+8,58,8,8);c.fillRect(hx+28,58,8,8)}
 c.fillStyle='#8c8577';c.fillRect(0,90,320,60);c.fillStyle='#7a7366';for(var j=0;j<320;j+=16)c.fillRect(j+((j/16)%2)*8,98+((j/16)%3)*12,10,3);
 c.fillStyle='#3b2a1a';c.fillRect(250,54,4,44);c.fillStyle='#1a1a2b';c.fillRect(244,44,16,14);c.fillStyle='#f3c95a';c.fillRect(247,47,10,8);c.fillStyle='rgba(243,201,90,'+(RM?.18:.14+.06*Math.sin(t/400))+')';c.fillRect(226,28,52,52);
 if(!IN.up){c.save();c.translate(120,118);c.rotate(-Math.PI/2);px(c,HERO.side,PAL,0,0,{s:2});c.restore()}else px(c,HERO.side,PAL,110,84+(RM?0:Math.floor(t/500)%2),{s:2});
 var kx=RM?170:330-160*k;px(c,GIRL.side,REG.town.npcs[0].pal,kx,84,{s:2,flip:true});c.fillStyle='#f3c95a';c.fillRect(kx-2,104,4,5);if(k>=1||RM){var pb=RM?0:Math.floor(t/600)%2;drawPet(c,'kenneth',kx+30,108+pb,'down',0,2);drawPet(c,'ragnar',kx+60,108+(1-pb),'down',0,2)}
 c.fillStyle='rgba(200,205,210,.35)';c.fillRect(0,0,320,150);if(!RM){c.fillStyle='rgba(230,233,236,.18)';var o=(t/70)%80;for(var q=-1;q<5;q++){c.fillRect(q*80+o,24+q*9,60,7);c.fillRect(q*80-o+30,70+q*11,48,6)}}}

function hudHtml(){var p=prog(),n=(p.inv||[]).length;return '<div class="qg-hud" role="status"><span title="Growth '+gxp(p)+'">Lv '+level(p)+'</span><span class="qg-hp" aria-label="Resolve '+P.resolve+' of '+maxRes(p)+'">Resolve <b>'+P.resolve+'</b>/'+maxRes(p)+'<i><em style="width:'+(100*P.resolve/maxRes(p))+'%"></em></i></span><span>'+esc(R().name)+'</span><span>Clouds '+((p.cleared||[]).length)+'/'+allClouds().length+'</span><button type="button" class="qg-link qg-bagbtn" data-bag>Bag ('+(n+(p.cards||[]).length)+')</button>'+sndBtn()+'</div>'+safeHud()}
function map(){MUS(R().weather&&!lifted(R().lift)?R().weather:'town');SCENE='map';dlg.dataset.scene='map';dlg.dataset.menu='';if(!P)newPlayer();spawn();if(!PET||PET.id!==prog().pet||PET.P!==P){petReset();PET&&(PET.P=P)}var r=R();
 body('<h2 id="qg-title" class="sr">'+esc(r.name)+' map</h2>'+hudHtml()+'<div class="qg-stage"><canvas class="qg-cv qg-map" width="'+MW*TS+'" height="'+MH*TS+'" role="img" aria-label="Top-down pixel map of '+esc(r.name)+(lifted(r.lift)?'':', covered in fog')+'. Your traveler, people to talk to, signs'+(r.clouds.length?', symptom clouds':'')+' and a lantern."></canvas><div class="qg-toast" aria-hidden="true"></div></div>'+
 '<p class="qg-status" id="qg-status"></p>'+dailyHtml()+'<div class="qg-controls"><div class="qg-pad" role="group" aria-label="Move">'+['up','left','right','down'].map(function(d){return '<button type="button" class="qg-d '+d+'" data-dir="'+d+'" aria-label="Walk '+d+'"><span aria-hidden="true">'+{up:'▲',down:'▼',left:'◀',right:'▶'}[d]+'</span></button>'}).join('')+'</div>'+
 '<div class="qg-side"><button type="button" class="qg-btn" data-look>Talk / look <small>E key</small></button><button type="button" class="qg-btn" data-near>Face the nearest cloud</button><button type="button" class="qg-btn" data-safeplace>Safe Place <small>recharge</small></button><button type="button" class="qg-link" data-menu>Title screen</button></div></div>',false);
 var pad=dlg.querySelectorAll('[data-dir]');pad.forEach(function(b){var d=b.dataset.dir;function go(e){e.preventDefault();if(TALK)return;held=d;step(d)}function stop(){if(held===d)held=null}
  b.addEventListener('pointerdown',go);b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);b.addEventListener('click',function(e){if(e.detail===0)step(d)})});
 dlg.querySelector('[data-near]').onclick=function(){if(TALK)return;var e=nearest();if(e)encounter(e);else say(r.clouds.length?'No clouds left here. Head east.':'No symptom clouds here.')};
 dlg.querySelector('[data-safeplace]').onclick=function(){if(!TALK)safePlace()};dlg.querySelector('[data-look]').onclick=look;dlg.querySelector('[data-menu]').onclick=function(){savePos();title()};
 status();var cvf=dlg.querySelector('.qg-map');cvf.setAttribute('tabindex','0');cvf.addEventListener('click',function(ev){if(!PET||!prog().memDone)return;var rc=cvf.getBoundingClientRect(),tx=(ev.clientX-rc.left)/rc.width*MW,ty=(ev.clientY-rc.top)/rc.height*MH;if(Math.abs(tx-(PET.fx+.5))<1.2&&Math.abs(ty-(PET.fy+.5))<1.2)petPet()});cvf.focus();loop(drawMap)}
function status(){var el=dlg&&dlg.querySelector('#qg-status');if(!el||!P)return;var r=R(),t=tile(P.x,P.y),e=nearest();
 el.textContent=(t==='L'?'By the lantern. ':'')+r.name+(lifted(r.lift)?'':' (foggy)')+'. '+(r.clouds.length?(e?'Nearest cloud: '+(Math.abs(e.x-P.x)+Math.abs(e.y-P.y))+' steps away ('+grp(e.weather)+').':'All clouds here are cleared. The way east is open.'):P.region==='castle'?'The Fogstorm waits behind the door to the north.':'Head east to begin.')}
function encounter(e){if(SCENE!=='map'||TALK)return;held=null;savePos();var st=newBattle('enemy',e.weather);st.enemy=e.id;if(SUSP&&SUSP.st.kind==='enemy'&&SUSP.st.enemy===e.id){st=SUSP.st;st.resolve=P.resolve;st.busy=false;toast('Back to the fight, with full Resolve')}SUSP=null;startBattle(st)}
function bossIntro(){if(SCENE==='map')savePos();held=null;var p=prog(),ph=p.phase||0;SCENE='bossintro';stopLoop();var Ph=Q.boss[ph];
 body('<h2 id="qg-title">The Fogstorm on the Threshold</h2><p class="qg-lede">All the weather at once. The storm has four phases. '+(ph?'You are on phase '+(ph+1)+' of 4.':'')+'</p><div class="qg-msg"><b>'+esc(Ph.name)+'</b><br>'+esc(Ph.intro)+'</div><div class="qg-menu"><button type="button" class="qg-btn" data-b>Enter '+esc(Ph.name)+'</button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-b]');
 dlg.querySelector('[data-b]').onclick=function(){if(SUSP&&SUSP.st.mode==='boss'&&SUSP.st.phase===ph){var s0=SUSP.st;SUSP=null;s0.resolve=P?P.resolve:s0.resolve;s0.busy=false;return startBattle(s0)}startBattle(newBattle('boss',null,ph))};dlg.querySelector('[data-m]').onclick=map}
var BA={eFlash:0,pFlash:0,guide:null,gT:0,shake:0,lunge:0,skill:null};hpBar.prev={};function hpGrow(){requestAnimationFrame(function(){requestAnimationFrame(function(){dlg.querySelectorAll('.qg-bar em[data-w]').forEach(function(e){e.style.width=e.dataset.w+'%'})})})}
function startBattle(st){try{return startBattle0(st)}catch(err){if(window.console)console.error('quest battle error',err);if(st&&st.mode==='boss'){var p=prog();p.region='castle';p.x=10;p.y=3;saveProg(p);P=null;SUSP=null;map();toast('The storm flickered. You are back at the castle door.')}else map()}}
function startBattle0(st){if(st.purr&&!st.purred){st.purred=1;st.resolve=Math.min(st.maxRes,st.resolve+st.purr)}hpBar.prev={};BA.skill=null;BA.shake=0;st.busy=false;MUS(st.mode==='boss'?'boss':'battle');if(!P)newPlayer();B=st;SCENE='battle';dlg.dataset.scene='battle';BA={eFlash:0,pFlash:0,guide:null,gT:0};var s=sym(B.current);
 if(st.purr){BA.trick={k:'purr',t:0};FLO.push({t:'+'+st.purr,x:40,y:90,l:900,c:'#f0b8c8'})}battleUI(null,(B.kind==='mini'&&B.mphase===0?MINI[B.mini].name+' blocks the road! ':'')+s.name+' rolls in! '+s.flavor+(st.purr?' Kenneth purrs softly beside you: +'+st.purr+' Resolve.':''));say(s.name+' appears. '+s.flavor+' Choose Spells, Call Guide or Rest.')}
function hpBar(lbl,v,m,cls){setTimeout(function(){hpBar.prev[cls]=100*v/m},0);return '<div class="qg-bar '+cls+'" role="meter" aria-label="'+esc(lbl)+'" aria-valuemin="0" aria-valuemax="'+m+'" aria-valuenow="'+v+'" aria-valuetext="'+esc(lbl)+' '+v+' of '+m+'"><span>'+esc(lbl)+' <b>'+v+'</b>/'+m+'</span><i><em data-w="'+(100*v/m)+'" style="width:'+(hpBar.prev[cls]!=null?hpBar.prev[cls]:100*v/m)+'%"></em></i></div>'}
function guideList(note,top){var tg=top||null,list=clins().slice();if(tg)list.sort(function(a,b){return (b.id===tg)-(a.id===tg)});
 return '<p class="qg-small">'+note+' Portraits are stylized pixel art, not likenesses.</p><div class="qg-list guides" role="group" aria-label="Open Book clinicians">'+list.map(function(k){return '<button type="button" class="qg-btn gd" data-clin="'+k.id+'"><canvas width="16" height="16" data-face="'+k.id+'" aria-hidden="true"></canvas><span>'+esc(k.name)+'<small>'+esc(k.cred)+((k.settings||[]).join()==='telehealth'?' · telehealth only':'')+(k.id===tg?' · called most on your journey':'')+'</small></span></button>'}).join('')+'</div>'}
function faces(){dlg.querySelectorAll('[data-face]').forEach(function(cv){var c=cv.getContext('2d');c.clearRect(0,0,16,16);px(c,faceRows(cv.dataset.face),facePal(cv.dataset.face),0,0)})}
function grp(w){return w==='fog'?'Gray Fog cloud: a low-mood symptom':'Storm Wind cloud: an anxious symptom'}
function counters(s){return s.weakTo.map(function(id){var x=sp(id);return x?x.name.replace(' (solo)',''):id})}
function caster(){return B&&B.mode==='boss'?'The Fogstorm':B&&B.kind==='mini'&&typeof MINI!=='undefined'&&MINI[B.mini]?MINI[B.mini].name:(sym(B.current).weather==='fog'?'The Gray Fog cloud':'The Storm Wind cloud')}
function recSpell(s,id){return DF().hints&&fitsSp(s,id)}
function recGuide(s){var w=sp(s.weakTo[0]);return DF().hints&&(s.guideOnly||!!(w&&w.kind==='guided'))}
function symLine(s){var h=DF().hints;return '<p class="qg-casts" role="status"><b>'+esc(caster())+' casts '+esc(s.name)+'!</b></p><p class="qg-sym"><span>Symptom: <b>'+esc(s.name)+'</b> · '+esc(grp(s.weather))+'</span> <button type="button" class="qg-link" data-fguide>Field Guide</button></p>'+(h?'<p class="qg-hint" role="note"><b>Easy mode:</b> the coping tool that fits glows gold'+(recGuide(s)?' (this one is faced with <b>Call Guide</b>)':'')+'.</p>':'')}
function fieldGuide(inBattle){var showT=!inBattle||DF().hints;var by=function(w){return Q.symptoms.filter(function(s){return s.weather===w}).map(function(s){return '<li><b>'+esc(s.name)+'</b>'+(s.guideOnly?' <small>(faced with a guide)</small>':'')+'<br><span>'+esc(s.tip)+'</span>'+(showT?'<br><small>Works against it: '+esc(counters(s).join(', '))+'</small>':'')+'</li>'}).join('')};
 return '<h2 id="qg-ph">Field Guide to the clouds</h2><p class="qg-small"><b>This is a game, not a diagnosis.</b> Each cloud is a common symptom shown as weather, never as you. Only a licensed professional can assess what you are going through.</p>'+
 (showT?'':'<p class="qg-small">Empowered mode: tool matches are hidden during battle.</p>')+'<h3>Gray Fog Marsh: low-mood symptoms</h3><ul class="qg-how qg-fg">'+by('fog')+'</ul><h3>Storm Wind Cliffs: anxious symptoms</h3><ul class="qg-how qg-fg">'+by('storm')+'</ul>'}
function diffPick(){var cur=diffId()||'empowered';return '<fieldset class="qg-diff"><legend>Difficulty'+(diffId()?'':' <small>(choose before you play)</small>')+'</legend><div class="qg-row" role="radiogroup" aria-label="Difficulty">'+Object.keys(DIFFS).map(function(k){var d=DIFFS[k];return '<button type="button" class="qg-btn'+(k===cur?' on':'')+'" role="radio" aria-checked="'+(k===cur)+'" data-diff="'+k+'">'+d.name+'<small>'+esc(d.blurb)+'</small></button>'}).join('')+'</div><p class="qg-small">You can change this any time from this screen.</p></fieldset>'}
function battleUI(menu,msg,fsel){var s=sym(B.current),Ph=phaseOf(B),g=guideReady(B);dlg.dataset.menu=menu||'';
 var top=Ph?'<p class="qg-phase">'+esc(Ph.name)+' · Fogstorm phase '+(B.phase+1)+' of 4'+(B.freeRest&&!B.freeRestUsed?' · next Rest is free':'')+'</p>':B.kind==='mini'?'<p class="qg-phase">'+esc(MINI[B.mini].name)+' · phase '+(B.mphase+1)+' of 2</p>':'';
 var m='';
 if(menu==='spells'){var LV=level();m='<div class="qg-list" role="group" aria-label="Spells">'+Q.spells.concat(EXTRA).map(function(x){var g1=x.kind==='guided'||!!(x.guideOnlyFor&&sym(B.current).weather===x.guideOnlyFor),lk=x.lv&&LV<x.lv,rep=B.lastSpell===x.id;var rc=!g1&&!lk&&!rep&&recSpell(sym(B.current),x.id);return '<button type="button" class="qg-btn sp'+(g1||lk?' locked':'')+(x.lv&&!lk?' new':'')+(rc?' qg-rec':'')+'" data-spell="'+x.id+'"'+((g1||rep||lk)?' aria-disabled="true"':'')+'>'+esc(x.name.replace(' (solo)',''))+(rc?'<span class="sr"> (recommended)</span>':'')+'<small>'+(rc?'Recommended · ':'')+(g1?(x.guideOnlyFor?'With your Guide for fear':'Only with a guide'):lk?'Unlocks at Lv '+x.lv:rep?'Just cast':x.lv?'Learned at Lv '+x.lv:'Solo')+'</small></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>'}
 else if(menu==='skills')m='<p class="qg-small">Each scroll works once, on any cloud, and clears half of its current HP ('+skillDmg(B)+' now).</p><div class="qg-list" role="group" aria-label="Special Skills">'+skillsReady().map(function(id){var k=SKILLS[id];return '<button type="button" class="qg-btn sk" data-skill="'+id+'" style="--c:'+k.col+'">'+esc(k.name)+'<small>'+esc(k.full!==k.name?k.full:'one use')+'</small></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';
 else if(menu==='guides')m=guideList('Choose who helps. They cast the right spell for '+esc(s.name)+': no Resolve cost, 3 HP.')+'<div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';
 else m='<div class="qg-cmd" role="group" aria-label="Battle commands"><button type="button" class="qg-btn'+(DF().hints&&!recGuide(s)?' qg-rec':'')+'" data-m="spells">Spells'+(DF().hints&&!recGuide(s)?'<span class="sr"> (recommended)</span>':'')+'</button><button type="button" class="qg-btn'+(recGuide(s)&&g?' qg-rec':'')+'" data-m="guides"'+(g?'':' aria-disabled="true"')+'>Call Guide'+(recGuide(s)&&g?'<span class="sr"> (recommended)</span>':'')+'<small>'+(g?'free · 3 HP':'resting '+B.cooldown+' turn'+(B.cooldown>1?'s':''))+'</small></button><button type="button" class="qg-btn" data-m="rest">Rest<small>+'+DF().rest+' Resolve</small></button><button type="button" class="qg-btn" data-m="skills"'+(skillsReady().length?'':' aria-disabled="true"')+'>Special Skills<small>'+(skillsReady().length?skillsReady().length+' scroll'+(skillsReady().length>1?'s':'')+' · clears half':'find scrolls in chests')+'</small></button>'+esaBtn()+'</div>';
 body('<h2 id="qg-title" class="qg-bt">'+esc(s.name)+' <small>'+(s.weather==='fog'?'Gray Fog':'Storm Wind')+' symptom</small></h2>'+symLine(s)+safeHud()+top+
 '<div class="qg-stage battle"><canvas class="qg-cv qg-bcv" width="320" height="150" role="img" aria-label="Battle: your traveler faces '+esc(s.name)+'"></canvas></div>'+
 '<div class="qg-bars">'+hpBar(s.name+(Ph?' (phase HP)':'')+' HP',B.meter,B.max,'e')+hpBar('Your Resolve',B.resolve,B.maxRes,'p')+'</div>'+
 '<div class="qg-msg" id="qg-msg">'+msg+'</div>'+m,fsel||(menu?'.qg-list .qg-btn':'.qg-cmd .qg-btn'));
 faces();
 var fgb=dlg.querySelector('[data-fguide]');fgb&&(fgb.onclick=function(){panel(fieldGuide(true))});
 var bk=dlg.querySelector('[data-back]');bk&&(bk.onclick=function(){battleUI(null,msg)});
 hpGrow();dlg.querySelectorAll('[data-skill]').forEach(function(b){b.onclick=function(){if(!B.busy)skillPanel(b.dataset.skill)}});
 var eb=dlg.querySelector('[data-esa]');eb&&(eb.onclick=function(){if(!B.busy)petESA()});
 dlg.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var k=b.dataset.m;if(B.busy)return;if(k==='skills'&&b.getAttribute('aria-disabled')){say('No Special Skill scrolls yet. Look for treasure chests out on the road.');return}if(b.getAttribute('aria-disabled')){say('Your guides are resting for '+B.cooldown+' more turn'+(B.cooldown>1?'s':'')+'. Try a spell or Rest.');return}if(k==='rest')return act('rest');battleUI(k,msg)}});
 dlg.querySelectorAll('[data-spell]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled')){var sm=b.querySelector('small').textContent;if(/^Unlocks/.test(sm)){say(sm+'. Make right choices to grow.');return}if(/for fear/.test(sm)){say('Opposite Action for fear is done with your Guide.');var mm=dlg.querySelector('#qg-msg');mm&&(mm.innerHTML='<em>Opposite Action for fear is done with your Guide.</em> Try Call Guide, or another spell.');return}say(sm==='Just cast'?'You just cast that. Try another spell.':'That spell is only cast with a guide. Use Call Guide.');return}act(b.dataset.spell)}});
 dlg.querySelectorAll('[data-clin]').forEach(function(b){b.onclick=function(){act('guide',{clinician:b.dataset.clin})}});
 loop(drawBattle)}
/* battle scene */
/* battle backdrops: one per region, painted once and cached */
var BDC={};
function backdrop(kind){if(BDC[kind])return BDC[kind];var cv=document.createElement('canvas');cv.width=320*KX;cv.height=150*KX;var c=cv.getContext('2d');c.scale(KX,KX);c.imageSmoothingEnabled=true;
 var im=qimg(kind==='fog'?'battle-fog':kind==='storm'?'battle-meadow':'battle-castle');if(im){c.drawImage(im,0,0,320,150);if(kind==='storm'){c.fillStyle='rgba(40,60,95,.32)';c.fillRect(0,0,320,150)}c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(232,108,40,6,0,0,6.283);c.fill();c.beginPath();c.ellipse(64,132,32,5,0,0,6.283);c.fill();return BDC[kind]=cv}
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
var LAYC={};function mistLayer(){if(LAYC.m)return LAYC.m;var m=document.createElement('canvas');m.width=320;m.height=60;var g=m.getContext('2d');g.fillStyle='rgba(255,255,255,.07)';[[30,24,34,8],[120,14,44,9],[210,30,30,7],[280,10,38,8]].forEach(function(b){g.fillRect(b[0]-b[2]/2,b[1]-b[3]/2,b[2],b[3]);g.fillRect(b[0]-b[2]/3,b[1]-b[3],b[2]*2/3,b[3]*2)});return LAYC.m=m}
function nearLayer(kind){if(LAYC[kind])return LAYC[kind];var m=document.createElement('canvas');m.width=360;m.height=30;var g=m.getContext('2d');g.fillStyle=kind==='boss'?'rgba(20,10,30,.55)':kind==='fog'?'rgba(30,50,40,.45)':'rgba(20,28,44,.5)';for(var x=0;x<360;x+=6){var h=4+((x*37)%11);g.fillRect(x,30-h,4,h);if(x%18===0)g.fillRect(x+1,30-h-3,2,3)}return LAYC[kind]=m}
function lightLayer(kind){var key='L'+kind;if(LAYC[key])return LAYC[key];var m=document.createElement('canvas');m.width=320;m.height=150;var g=m.getContext('2d');
 var w=g.createRadialGradient(60,96,4,60,96,110);w.addColorStop(0,kind==='map'?'rgba(255,214,150,0)':'rgba(255,214,150,.16)');w.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=w;g.fillRect(0,0,320,150);
 var v=g.createRadialGradient(160,75,60,160,75,200);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(6,8,20,'+(kind==='boss'?.55:.4)+')');g.fillStyle=v;g.fillRect(0,0,320,150);
 if(kind!=='map'){var top=g.createLinearGradient(0,0,0,40);top.addColorStop(0,'rgba(200,220,255,.10)');top.addColorStop(1,'rgba(200,220,255,0)');g.fillStyle=top;g.fillRect(0,0,320,40)}return LAYC[key]=m}
function drawBattle(c,t,dt){var s=sym(B.current),boss=B.mode==='boss',bk=boss?'boss':s.weather;
 var sh=0,sy=0;if(BA.shake>0){BA.shake-=dt;if(!RM){var m2=Math.min(3,BA.shake/80);sh=Math.round((Math.random()*2-1)*m2);sy=Math.round((Math.random()*2-1)*m2)}}c.save();c.translate(sh,sy);
 var ox=RM?0:Math.round(Math.sin(t/3200)*4);c.drawImage(backdrop(bk),ox-5,-3,330,156);
 if(!RM){c.globalAlpha=1;var mo=(t/90)%320;c.drawImage(mistLayer(),Math.round(mo),2);c.drawImage(mistLayer(),Math.round(mo-320),2)}
 if(!RM&&!boss&&s.weather==='fog'){var fb=fogBand();c.globalAlpha=.7;var o=(t/80)%120;for(var i=-1;i<4;i++)c.drawImage(fb,Math.round(i*120+o),70+(i*17%20));c.globalAlpha=1}
 if(!RM&&(boss||s.weather==='storm')&&Math.floor(t/4200)%3===0&&(t%4200)<120){c.fillStyle='rgba(220,230,255,.18)';c.fillRect(0,0,320,150)}
 if(BA.eFlash>0)BA.eFlash-=dt;if(BA.pFlash>0)BA.pFlash-=dt;
 if(BA.eFlash>300&&!BA.sE){BA.sE=1;spark(boss?232:232,boss?60:72,'#f3c95a')}if(BA.eFlash<=0)BA.sE=0;
 if(BA.pFlash>300&&!BA.sP){BA.sP=1;spark(64,100,'#8fb0c9')}if(BA.pFlash<=0)BA.sP=0;
 var bob=RM?0:Math.round(Math.sin(t/350)*2),ef=BA.eFlash>0&&Math.floor(BA.eFlash/80)%2===0,pf=BA.pFlash>0&&Math.floor(BA.pFlash/80)%2===0;
 var rc=RM?0:Math.round(Math.max(0,BA.eFlash)/400*7);cloudAt(c,CLOUD,boss?BOSSPAL:s.weather==='fog'?FOGPAL:STORMPAL,(boss?190:B.kind==='mini'?196:204)+rc,(boss?14:B.kind==='mini'?30:44)+bob,boss?6:B.kind==='mini'?5:4,t,ef);
 if(!RM&&s.weather==='storm'){c.fillStyle='rgba(143,176,201,.6)';for(var j=0;j<14;j++)c.fillRect((j*23+t/6)%320,(j*31+t/2)%108,1,4)}
 var lg=0;if(BA.lunge>0){BA.lunge-=dt;lg=Math.round(Math.sin(Math.max(0,260-BA.lunge)/260*Math.PI)*10)}
 var ib=RM?0:(Math.floor(t/450)%2);px(c,walkF(HERO.side,0),PAL,40+lg,72+ib,{s:4,flash:pf});var pp=prog().pet;if(PETS[pp])drawPet(c,pp,2,100+(1-ib),'side',0,3);
 if(BA.guide){BA.gT-=dt;if(BA.gT<=0)BA.guide=null;else{var a=RM?1:Math.min(1,(1800-BA.gT)/250,BA.gT/300);c.globalAlpha=Math.max(0,a);c.fillStyle='#f4ecd8';c.fillRect(97,61,54,54);c.fillStyle='#1a1a2b';c.fillRect(98,62,52,52);px(c,faceRows(BA.guide),facePal(BA.guide),100,64,{s:3});c.globalAlpha=1}}
 if(!RM){var nl=nearLayer(bk),no=Math.round(-((t/30)%40)+Math.sin(t/3200)*10);c.drawImage(nl,no-20,124)}
 if(BA.trick){BA.trick.t+=dt;var tk=BA.trick,kk=Math.min(1,tk.t/1200);c.save();c.globalAlpha=1-kk;if(tk.k==='purr'){c.fillStyle='#f0b8c8';for(var pw=0;pw<3;pw++){var pr=6+((kk*30+pw*8)%24);for(var pq=0;pq<10;pq++){var pa2=-1.2+pq/9*1.4;c.fillRect(Math.round(20+Math.cos(pa2)*pr),Math.round(104+Math.sin(pa2)*pr),2,2)}}}else if(tk.k==='nap'){c.fillStyle='rgba(159,211,230,.35)';c.beginPath();c.arc(64,104,40,Math.PI,0);c.fill();c.fillStyle='#9fd3e6';for(var na=0;na<24;na++){var aa2=Math.PI+na/23*Math.PI;c.fillRect(Math.round(64+Math.cos(aa2)*40),Math.round(104+Math.sin(aa2)*40),2,2)}}else{c.fillStyle='#f3c95a';for(var bw=0;bw<3;bw++){var brr=8+((kk*60+bw*14)%42);for(var bq=0;bq<8;bq++){var ba=-.6+bq/7*1.2;c.fillRect(Math.round(30+Math.cos(ba)*brr),Math.round(104+Math.sin(ba)*brr),2,2)}}}c.restore();if(tk.t>1200)BA.trick=null}
 c.drawImage(lightLayer(boss?'boss':'b'),0,0);
 if(BA.skill){BA.skill.t+=dt;skillAnim(c,BA.skill.id,BA.skill.t/BA.skill.dur,t);if(BA.skill.t>=BA.skill.dur){var sid=BA.skill.id;BA.skill=null;B.busy=false;act('skill',{skill:sid})}}
 c.restore()}
function act(a,opt){var s=sym(B.current),r=turn(B,a,opt);if(r.error){say({cooldown:'Your guides are resting. Try a spell or Rest.',needsguide:'That spell is only cast with a guide.',repeat:'You just cast that. Try another spell.',fearopp:'Opposite Action for fear is done with your Guide.'}[r.error]||'Not available.');return}
 var p=prog();p.practiced=p.practiced||{};var used=r.spell||a;if(a!=='rest'&&a!=='skill')p.practiced[used]=(p.practiced[used]||0)+1;if(r.clinician){p.guides=p.guides||{};p.guides[r.clinician]=(p.guides[r.clinician]||0)+1}if(r.matched&&!r.clinician&&used==='breath'&&(p.quests||{}).jo==='on'){p.quests.jo='ready'}if(r.skill){p.scrolls=p.scrolls||{};p.scrolls[r.skill]='used';p.usedLog=(p.usedLog||[]).concat([r.skill])}saveProg(p);if(r.clinician)dailyEv('guide');else if(r.matched)dailyEv('match');if(a==='rest'&&r.wise)dailyEv('wiserest');if(r.combo>=2)dailyEv('combo');
 var gain=r.clinician?2:r.matched?2:(a==='rest'&&r.wise)?1:0;
 var x=sp(r.spell||a),k=r.clinician&&clin(r.clinician),line='';
 if(r.skill)line='You use the <b>'+esc(SKILLS[r.skill].name)+'</b> scroll. Half of the cloud clears: <b>'+r.cleared+' damage</b>. The scroll is spent.';else
 if(k)line='<b>'+esc(k.name)+', '+esc(k.cred)+'</b> casts <b>'+esc(x.name.replace(' (solo)',''))+'</b> with you. '+(r.gratitude?'First they name how heavy this is. Then you can name one small good thing, or just say "not today." Both count. ':'')+'<b>3 damage</b>, no Resolve spent.<br><span class="qg-tip">Tip: '+esc(r.tip)+'</span>';
 else if(a==='rest')line='You rest and recover '+r.rested+' Resolve.'+(r.free?' The storm rains, so nothing drains this turn.':'');
 else line='You cast <b>'+esc(x.name.replace(' (solo)',''))+'</b>. '+(r.matched?'<b>It fits!</b> '+r.cleared+' damage'+(B.bonus?' (+'+B.bonus+' from your level)':'')+'. '+esc(x.fits||''):'Partial fit: '+r.cleared+' damage. '+esc(r.hint||''));
 if(r.drain)line+='<br>'+esc(s.name)+' drains '+r.drain+' Resolve.';else if(a!=='rest'||r.free)line+='<br>'+esc(s.name)+' can\'t drain you this turn.';else line+='<br>'+esc(s.name)+' drains nothing.';
 if(a==='rest'&&r.wise)line+=' Resting when you are low is a wise choice.';if(r.combo>=2)line+=' <b>Combo x'+r.combo+'</b>: +'+r.comboBonus+' damage for chaining fitting spells (the chain carries from cloud to cloud; Rest, Guides and Skills keep it going).';if(r.shield)line+=' '+(r.shield==='nap'?'Kenneth curls up in a cozy nap shield':'Ragnar lets out a guard bark')+' and blocks the drain.';if(r.lock)line+='<br><em>'+esc(r.lock)+'</em>';if(gain)line+='<br><span class="qg-xp">+'+gain+' growth</span>';if(r.rain)line+='<br><em>The storm rains: your next Rest is free.</em>';
 if(window.obcSound){try{if(r.matched)obcSound.chime(2)}catch(e){}}
 if(P)P.resolve=B.resolve;var lvUp=gain&&addXP(gain);if(lvUp)line+='<br><b>Level up!</b> Your skills grew stronger.';
 SFX(r.cleared?(r.matched?'hit':'soft'):a==='rest'?'heal':'soft');
 BA.eFlash=r.cleared?400:0;BA.pFlash=r.drain?400:0;if(r.shield)BA.trick={k:r.shield,t:0};if(r.combo>=2)FLO.push({t:'Combo x'+r.combo,x:180,y:24,l:1100,c:'#f3c95a',big:true});if(r.cleared&&!RM){BA.shake=r.skill?320:r.matched?200:90;BA.lunge=260}if(r.drain&&!RM)BA.shake=Math.max(BA.shake||0,160);if(k){BA.guide=k.id;BA.gT=1800;burst(128,86,'#f3c95a',16)}
 if(r.cleared){burst(232,70,r.matched?'#fff3c4':'#c9cfd2',r.matched?18:6);FLO.push({t:'-'+r.cleared,x:236,y:40,l:900,c:r.skill?SKILLS[r.skill].col:'#fff3c4',big:!!(r.skill||r.matched)})}
 if(r.drain)FLO.push({t:'-'+r.drain,x:56,y:70,l:900,c:'#f08a8a'});if(r.rested)FLO.push({t:'+'+r.rested,x:76,y:70,l:900,c:'#9fe0a8'});
 if(B.over==='clear')return setTimeout(function(){won(line)},RM?0:650);
 if(B.over==='rest')return setTimeout(regroup,RM?0:650);
 var next=sym(B.current);if(B.mode==='boss'&&next.id!==s.id)line+='<br>The storm shifts: <b>'+esc(next.name)+'</b>. '+esc(next.flavor);
 battleUI(null,line,'#qg-msg');var m=dlg.querySelector('#qg-msg');m&&m.setAttribute('tabindex','-1');say(dlg.querySelector('#qg-msg').textContent)}
function merge(a,b){a=a||{};for(var k in b)a[k]=(a[k]||0)+b[k];return a}
function won(line){if(B.kind==='mini')return miniWon(line);var p=prog();p.helped=merge(p.helped,B.helped);
 if(B.kind==='enemy'){var before=level(p);p.gxp=gxp(p)+1;p.cleared=(p.cleared||[]).concat([B.enemy]);p.petReady=1;p.xp=(p.xp||0)+1;var pj=null,pa=p.pet&&PETS[p.pet];if(pa){p.petxp=(p.petxp||0)+1;var rem=ENEMIES.filter(function(e){return e.id!==B.enemy&&p.cleared.indexOf(e.id)<0}).sort(function(a,b){return (Math.abs(a.x-P.x)+Math.abs(a.y-P.y))-(Math.abs(b.x-P.x)+Math.abs(b.y-P.y))});if(rem.length){pj=rem[0];p.petxp+=1;p.cleared.push(pj.id);p.gxp+=1;p.xp+=1;PETJOB={id:pj.id,x:pj.x,y:pj.y,weather:pj.weather,t0:null}}}var up=level(p)>before;p.resolve=Math.min(maxRes(p),B.resolve+(up?2:0));if(up)setTimeout(function(){levelUp(level())},50);P.resolve=p.resolve;
  var rk=P.region,r=REG[rk],lift=r.clouds.length&&regionClear(rk,p)&&(p.rcleared||[]).indexOf(rk)<0;if(lift)p.rcleared=(p.rcleared||[]).concat([rk]);
  var fetched=null;if(p.pet==='ragnar'&&petLv(p)>=2){var fl=FETCH.filter(function(id){return (p.cards||[]).indexOf(id)<0});if(fl.length&&(window.obcQuest&&obcQuest.forceFetch||Math.random()<(petLv(p)>=5?.5:.3))){fetched=fl[0];p.cards=(p.cards||[]).concat([fetched])}}
  saveProg(p);dailyEv('clear',pj?2:1);p=prog();ENEMIES=ENEMIES.filter(function(e){return e.id!==B.enemy&&!(pj&&e.id===pj.id)});var s=sym(B.current);SCENE='won';stopLoop();dlg.dataset.menu='';
  var left=r.clouds.filter(function(e){return p.cleared.indexOf(e[0])<0}).length;
  body('<h2 id="qg-title">'+esc(s.name)+' clears!</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">+1 growth for clearing it.'+(up?' <b>Level up!</b> You are now level '+level(p)+' with '+maxRes(p)+' max Resolve. Your skills grew stronger.':'')+(nextAt(p)!=null?' Next level at '+nextAt(p)+' growth (you have '+gxp(p)+').':'')+(lift?'':' '+left+' cloud'+(left===1?'':'s')+' left in '+esc(r.name)+'.')+'</p>'+(fetched?'<div class="qg-msg qg-fetch"><canvas width="24" height="32" class="qg-cv" data-card="'+fetched+'" aria-hidden="true"></canvas> <b>Fetch!</b> Ragnar trots back with a coping-skill card in his mouth: <b>'+esc(CARDS[fetched].name)+'</b>. (Saved in your Bag.)</div>':'')+(pj?'<div class="qg-msg qg-petmsg">'+esc(pa.clear)+' <span class="qg-xp">+1 growth</span> (another cloud cleared)</div>':'')+
   (lift?'<div class="qg-msg qg-lift"><b>'+esc(r.name)+' is clear!</b><br>The last cloud thins out. Something is changing out there.</div>':'')+
   '<div class="qg-menu"><button type="button" class="qg-btn" data-m>'+(lift?'Watch the fog lift':'Back to the map')+'</button></div>','[data-m]');
  dlg.querySelectorAll('[data-card]').forEach(function(cv){drawCard(cv.getContext('2d'),cv.dataset.card,0,0,1)});if(window.obcSound){try{obcSound.chime(3)}catch(e){}}
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

/* support animals: Kenneth (orange tabby cat) and Ragnar (German Shepherd). Original pixel sprites, 12x10. */
var PETS={kenneth:{name:'Kenneth',kind:'orange cat',pal:{k:'#2b1a10',a:'#e08a2e',b:'#b0601a',w:'#fff1dc',p:'#e88a8a'},
 blurb:'An orange cat who loves warm laps and slow blinks.',clear:'Kenneth curled up beside the fog and it faded.',
 side:['.......k..k.','......kakkak','.k....kaaaak','kak...kakaak','kak...kawwpk','.kakkkkaaak.','.kabababaak.','.kaaaaaaaak.','..kak..kak..','..kk...kk...'],
 down:['..k......k..','.kak....kak.','.kaakkkkaak.','.kaaaaaaaak.','.kakaaaakak.','.kaawppwaak.','..kaaaaaak..','.kabaaaabak.','.kaaaaaaaak.','..kk....kk..'],
 up:['..k......k..','.kak....kak.','.kaakkkkaak.','.kaaaaaaaak.','.kabaaaabak.','.kaaaaaaaak.','..kaaaaaak..','.kabababak.k','.kaaaaaaaakk','..kk....kk..']},
 ragnar:{name:'Ragnar',kind:'German Shepherd',pal:{k:'#1a1008',a:'#c98a4a',b:'#a0582a',s:'#2a1c12',m:'#20140c',l:'#e0b070',t:'#e07a8a'},
 blurb:'A loyal German Shepherd who never leaves a friend behind.',clear:'Ragnar gave a happy bark and the cloud puffed away.',
 side:['......k.k...','......kbkbk.','.....kbaaak.','kk...kakaakk','kbbkkkaaammk','kbbkssssaak.','.kkssssssbk.','..kaaaaaabk.','..kak..kak..','..kk...kk...'],
 down:['..k......k..','.kbk....kbk.','.kbak..kabk.','.kaaakkaaak.','.kakaaaakak.','..kammmmak..','...kammak...','.kbsssssbk..','.kaaaaaaaak.','..kk....kk..'],
 up:['..k......k..','.kbk....kbk.','.kbak..kabk.','.kaaaaaaaak.','.kaaaaaaaak.','..kbaaaabk..','.kssssssssk.','.kbsssssbkbk','.kaaaaaaaakb','..kk....kk..']}};
var PETW=new Map();
function petRows(id,dir,f){if(!PTD)tagPT();var a=PETS[id],r=dir==='up'?a.up:dir==='down'?a.down:a.side;if(!f)return r;var key=id+dir+f,o=PETW.get(key);if(o)return o;o=r.slice();o._pt=r._pt;
 if(dir==='side'||dir==='left'||dir==='right'){o[8]=f===1?'.kak....kak.':'...kak.kak..';o[9]=f===1?'.kk......kk.':'...kk..kk...'}else{o[9]=f===1?'..kk.....k..':'...k....kk..'}PETW.set(key,o);return o}
function drawPet(c,id,x,y,dir,f,s){px(c,petRows(id,dir,f),PETS[id].pal,x,y,{s:s||1,flip:dir==='left'})}
var PET=null,PETJOB=null;
function petReset(){var p=prog();PET=p.pet&&PETS[p.pet]&&P?{id:p.pet,x:P.x,y:P.y,fx:P.fx,fy:P.fy,dir:'down',walk:0}:null}
function petFollow(sx,sy,dir){if(!PET)return;PET.x=sx;PET.y=sy;PET.dir=dir}
function petDraw(c,t,dt){if(!PET)return;var tx=PET.x,ty=PET.y,sp=RM?1:Math.min(1,dt/110);
 if(PETJOB){if(PETJOB.t0==null){PETJOB.t0=t;var olv=dlg&&dlg.querySelector('.qg-lvl');if(olv){olv.remove();setTimeout(function(){levelUp(level())},0)}PETJOB.sx=PET.fx;PETJOB.sy=PET.fy;toast(PETS[PET.id].clear);SFX('chest')}var e=RM?2000:t-PETJOB.t0,J=PETJOB;
  var k=Math.min(1,e/800),ex=J.x,ey=J.y-.6;if(e<800){PET.fx=J.sx+(ex-J.sx)*k;PET.fy=J.sy+(ey-J.sy)*k;PET.dir=Math.abs(ex-J.sx)>Math.abs(ey-J.sy)?(ex<J.sx?'left':'right'):(ey<J.sy?'up':'down')}
  var fade=e<800?1:Math.max(0,1-(e-800)/600);if(fade>0){c.globalAlpha=fade;cloudAt(c,CLOUD,J.weather==='fog'?FOGPAL:STORMPAL,J.x*TS+1,J.y*TS+1-(1-fade)*6,1,t);c.globalAlpha=1}
  if(e>=800&&!J.puff){J.puff=1;burst(J.x*TS+8,J.y*TS+8,'#e6eaec',14);burst(J.x*TS+8,J.y*TS+6,'#fff3c4',8)}
  var hop=e>=800&&e<1300?-Math.round(Math.sin((e-800)/500*Math.PI)*4):0;var wf=e<800?(Math.floor(e/110)%2?1:3):0;
  c.fillStyle='rgba(0,0,0,.2)';c.fillRect(PET.fx*TS+4,PET.fy*TS+14,9,2);drawPet(c,PET.id,PET.fx*TS+2,PET.fy*TS+5+hop,PET.dir==='up'||PET.dir==='down'?PET.dir:PET.dir==='left'?'left':'side',wf);
  if(e>1500)PETJOB=null;return}
 var dx=tx-PET.fx,dy=ty-PET.fy,mv=Math.abs(dx)+Math.abs(dy)>.04;PET.fx+=dx*sp;PET.fy+=dy*sp;if(!mv){PET.fx=tx;PET.fy=ty}
 if(mv&&Math.abs(dx)+Math.abs(dy)>.3)PET.face=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'side'):(dy<0?'up':'down');var d=PET.face||'down';
 var wf=mv&&!RM?(Math.floor(t/120)%2?1:3):0,ib=(!RM&&!mv&&Math.floor(t/600)%2)?1:0;
 c.fillStyle='rgba(0,0,0,.2)';c.fillRect(PET.fx*TS+4,PET.fy*TS+14,9,2);drawPet(c,PET.id,PET.fx*TS+2,PET.fy*TS+5+ib,d,wf)}
function petPick(next){SCENE='petpick';stopLoop();dlg.dataset.scene='petpick';dlg.dataset.menu='';
 body('<h2 id="qg-title">Choose your support animal</h2><p class="qg-lede">Support animals can\'t make the fog go away, but they keep you company while you face it. A calm, furry friend at your side can make a hard day feel a little lighter.</p><div class="qg-pets" role="group" aria-label="Support animals">'+
  Object.keys(PETS).map(function(id){var a=PETS[id];return '<button type="button" class="qg-btn qg-petbtn" data-pet="'+id+'"><canvas width="48" height="40" class="qg-cv" data-petcv="'+id+'" aria-hidden="true"></canvas><span><b>'+a.name+'</b>, '+a.kind+'<small>'+esc(a.blurb)+'</small></span></button>'}).join('')+'</div><p class="qg-small">Your friend follows you on the road. Each time you clear a cloud, they gently clear another one nearby.</p>','[data-pet]');
 var cvs=dlg.querySelectorAll('[data-petcv]');(function d(t){if(SCENE!=='petpick')return;cvs.forEach(function(cv){var c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,48,40);drawPet(c,cv.dataset.petcv,0,(RM?0:Math.floor(t/500)%2)*2,'down',0,4)});if(!RM)raf=requestAnimationFrame(d)})(0);
 dlg.querySelectorAll('[data-pet]').forEach(function(b){b.onclick=function(){var p=prog();p.pet=b.dataset.pet;saveProg(p);toast(PETS[p.pet].name+' will walk with you');say(PETS[p.pet].name+' will walk with you.');(next||map)()}})}

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
 var k=OF.who,cy=118,hx=RM?120:Math.round(60+60*e);px(c,HERO.side,clinPal(k),200,cy+(RM?0:Math.floor(t/800)%2),{pixel:1,s:2,flip:true});
 var held=ITEM>0;if(held){px(c,HERO.down,PAL,hx,cy,{s:2});var a=RM?1:Math.min(1,(t-ITEM)/600);c.fillStyle='rgba(255,226,140,'+(.25*a)+')';c.beginPath();c.arc(hx+12,cy-12,18,0,6.283);c.fill();var fy=cy-26+(RM?0:Math.round(-4*a));var gg=c.createRadialGradient(hx+12,fy+6,1,hx+12,fy+6,22);gg.addColorStop(0,'rgba(255,240,170,'+(.55*a)+')');gg.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=gg;c.fillRect(hx-12,fy-16,48,44);drawFidget(c,hx+6,fy,1,t);if(!RM){var gl=(t/500)%6;c.fillStyle='rgba(255,255,255,'+(gl<1?1-gl:0)+')';c.fillRect(hx+8,fy+2,1,1);c.fillRect(hx+15,fy+8,1,1)}}
 else px(c,HERO.side,PAL,hx,cy+(RM||e<1?0:Math.floor(t/600)%2),{s:2});var op=prog().pet;if(PETS[op])drawPet(c,op,hx-28,cy+10+(RM?0:Math.floor(t/700)%2),e<1?'side':'down',e<1&&!RM?(Math.floor(t/120)%2?1:3):0,2);
 var lg=RM?.34:.3+.04*Math.sin(t/900),gr=c.createRadialGradient(96,40,6,96,40,230);gr.addColorStop(0,'rgba(255,214,140,'+lg+')');gr.addColorStop(.45,'rgba(255,190,110,.12)');gr.addColorStop(1,'rgba(60,30,20,.28)');c.fillStyle=gr;c.fillRect(0,0,320,180);
 c.fillStyle='rgba(255,244,210,.10)';c.beginPath();c.moveTo(134,58);c.lineTo(190,58);c.lineTo(236,170);c.lineTo(150,170);c.closePath();c.fill();
 if(!RM){c.fillStyle='rgba(255,240,200,.5)';for(var d=0;d<5;d++){var dx=(d*61+t/40)%120,dy=(d*37+t/55)%100;c.fillRect(140+Math.round(dx*.6),60+Math.round(dy),1,1)}}}
function bag(){var p=prog(),has=(p.inv||[]).indexOf('fidget')>=0,k=has&&clin(p.fidgetFrom),cs=p.cards||[],ql=questList();
 panel('<h2 id="qg-ph">Your bag</h2><p class="qg-small">Level '+level(p)+' · growth '+gxp(p)+(nextAt(p)!=null?' (next level at '+nextAt(p)+')':' (max level)')+' · spells deal +'+bonus(p)+' damage</p>'+(has?'<div class="qg-item"><canvas width="24" height="24" class="qg-cv qg-itemcv" aria-hidden="true"></canvas><div><b>Golden Fidget Toy</b><p class="qg-small">A small golden fidget cube: click the buttons, roll the dial, slide the switch. Something for busy hands while your breathing slows down.'+(k?' Given to you by '+esc(k.name)+', '+esc(k.cred)+', at the Open Book office.':'')+'</p></div></div>':'<p class="qg-lede">Something golden waits at the end of the road.</p>')+(PETS[p.pet]?'<div class="qg-item"><canvas width="36" height="30" class="qg-cv qg-petbag" aria-hidden="true"></canvas><div><b>Support animal: '+PETS[p.pet].name+'</b><p class="qg-small">'+esc(PETS[p.pet].kind.charAt(0).toUpperCase()+PETS[p.pet].kind.slice(1))+'. '+esc(PETS[p.pet].blurb)+' Walks with you and clears a cloud each time you clear one (but not Wardens or the Fogstorm).</p><p class="qg-small"><b>Pet level '+petLv(p)+' of 5</b>'+(petLv(p)<5?' · next at '+PETLV[petLv(p)]+' pet growth (now '+(p.petxp||0)+')':'')+'</p><ul class="qg-small">'+TRICKS[p.pet].map(function(tr){return '<li>'+(petLv(p)>=tr.lv?'<b>'+esc(tr.name)+'</b>: ':'Pet level '+tr.lv+': <b>'+esc(tr.name)+'</b> (locked). ')+esc(tr.text)+'</li>'}).join('')+'</ul></div></div>':'')+(function(){var sc=scrolls(p),ids=SKORDER.filter(function(id){return sc[id]});return '<h3 class="qg-h3">Special Skill scrolls ('+ids.length+' of '+SKORDER.length+' found)</h3>'+(ids.length?'<ul class="qg-cards qg-scrolls">'+ids.map(function(id){var k=SKILLS[id],u=sc[id]==='used';return '<li class="qg-card'+(u?' used':'')+'"><span class="qg-scroll" style="--c:'+k.col+'" aria-hidden="true"></span><div><b>'+esc(k.name)+(k.full!==k.name?' <small>'+esc(k.full)+'</small>':'')+'</b> <span class="qg-tag">'+(u?'Spent':'Ready')+'</span><p class="qg-small">'+esc(k.text[0])+' In real life this is done with a trained clinician.</p></div></li>'}).join('')+'</ul>':'<p class="qg-small">None yet. Treasure chests out on the road hold one-use scrolls.</p>')})()+'<h3 class="qg-h3">Coping-skill cards ('+cs.length+')</h3>'+(cs.length?'<ul class="qg-cards">'+cs.map(function(id){var c=CARDS[id];return '<li class="qg-card"><canvas width="48" height="64" class="qg-cv" data-card="'+id+'" aria-hidden="true"></canvas><div><b>'+esc(c.name)+'</b><p class="qg-small">'+esc(c.text)+'</p></div></li>'}).join('')+'</ul>':'<p class="qg-small">None yet. Help the townsfolk with their side quests.</p>')+dailyHtml()+'<h3 class="qg-h3">Outfits and colors</h3><div class="qg-look"><canvas width="36" height="42" class="qg-cv qg-herobag" aria-hidden="true"></canvas><div><p class="qg-small">Outfit</p><div class="qg-swatches" role="group" aria-label="Outfit">'+OUTFITS.map(function(o){var op=lookOpen(o,p),on=(p.outfit||'teal')===o.id;return '<button type="button" class="qg-sw" data-outfit="'+o.id+'" style="--c:'+o.c+'" aria-pressed="'+on+'"'+(op?'':' aria-disabled="true"')+' title="'+esc(op?o.name:o.hint)+'">'+esc(o.name)+(op?'':' <small>'+esc(o.hint)+'</small>')+'</button>'}).join('')+'</div><p class="qg-small">Hair</p><div class="qg-swatches" role="group" aria-label="Hair color">'+HAIRS.map(function(o){var op=lookOpen(o,p),on=(p.hair||'brown')===o.id;return '<button type="button" class="qg-sw" data-hair="'+o.id+'" style="--c:'+o.h+'" aria-pressed="'+on+'"'+(op?'':' aria-disabled="true"')+'>'+esc(o.name)+(op?'':' <small>Level '+o.lv+'</small>')+'</button>'}).join('')+'</div></div></div>'+(ql?'<h3 class="qg-h3">Side quests</h3><ul class="qg-small">'+ql+'</ul>':''));
 dlg.querySelectorAll('[data-card]').forEach(function(cv){drawCard(cv.getContext('2d'),cv.dataset.card,0,0,2)});
 applyLook(p);var hb=dlg.querySelector('.qg-herobag');if(hb){var hc=hb.getContext('2d');hc.imageSmoothingEnabled=false;px(hc,HERO.down,PAL,0,0,{s:3})}
 dlg.querySelectorAll('[data-outfit],[data-hair]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled')){say('Locked. '+b.title);return}var q=prog();if(b.dataset.outfit)q.outfit=b.dataset.outfit;else q.hair=b.dataset.hair;saveProg(q);applyLook(q);bag();var nb=dlg.querySelector('[data-'+(b.dataset.outfit?'outfit="'+b.dataset.outfit:'hair="'+b.dataset.hair)+'"]');nb&&nb.focus();say('Look updated.')}});
 var pc=dlg.querySelector('.qg-petbag');if(pc){var c2=pc.getContext('2d');c2.imageSmoothingEnabled=false;drawPet(c2,p.pet,0,0,'down',0,3)}var cv=dlg.querySelector('.qg-itemcv');if(cv){var c=cv.getContext('2d');px(c,FIDGET,FIDPAL,0,0,{s:2})}}
function regroup(){COMBO=0;var p=prog();p.helped=merge(p.helped,B.helped);p.resolve=maxRes(p);var rk=(P&&P.region)||p.region||'town',L=REG[rk].lantern;p.region=rk;p.x=L.x;p.y=L.y;if(B&&B.mode==='boss'){p.region='castle';p.x=10;p.y=3}saveProg(p);P=null;newPlayer();SCENE='regroup';stopLoop();dlg.dataset.menu='';var boss=B.mode==='boss';
 body('<h2 id="qg-title">Rest and Regroup</h2><p class="qg-lede">Even the bravest travelers rest. The weather isn\'t your fault, and resting isn\'t losing. You wake up '+(boss?'at the castle door':'by the lantern')+' with full Resolve. Nothing is lost'+(boss?'; the Fogstorm waits at the same phase.':'.')+'</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button><button type="button" class="qg-btn" data-p>Practice a spell</button><a class="qg-btn qg-menu-a" href="#match" data-quiz>Talk to a real guide</a></div>','[data-m]');
 dlg.querySelector('[data-m]').onclick=map;dlg.querySelector('[data-p]').onclick=practice}
function practice(){SCENE='practice';stopLoop();dlg.dataset.menu='';body('<h2 id="qg-title">Practice a spell</h2><p>No battles here. Read each spell\'s real steps at your own pace.</p><div class="qg-pracs">'+Q.spells.map(function(x){return '<details class="qg-prac"><summary>'+esc(x.name)+(x.kind==='guided'?' (with a guide)':'')+'</summary><ol>'+x.steps.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ol><p class="qg-small">'+esc(x.source)+'</p></details>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back to the title screen</button></div>');dlg.querySelector('[data-back]').onclick=title}
function hud(){var h=$('#runes-hud');if(!h)return;var b=BONUS.indexOf('gratitude')>=0,el=$('#qg-bonus');if(b&&!el){el=document.createElement('span');el.id='qg-bonus';el.className='qg-bonus';el.textContent=' · Bonus rune: Gratitude ✓';h.appendChild(el)}}
function open(){var b=$('#qg-open');b&&b.setAttribute('aria-busy','true');return load().then(function(){if(!dlg)shell();b&&b.removeAttribute('aria-busy');if(!dlg.open){dlg.showModal();inertPage(true)}var p=prog();if(p.x!=null||p.intro)welcome();else title()})}

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
REG.grove={name:'The Quiet Grove',lift:'done',rows:['TTTTTTTTTTTTTTTTTTTT','TGGGGGGGGGGGGGGGGGGT','TGGGGGGGGGGGGGGGGGGT','TGGGWWGGGGGGGGGGGGGT','TGGGWWGGGG..GGGGGGGT','TGGGGGGGGG..GGGGGGGT','TGGGGGGGGG..GGGGGGGT','TGGGGGGGGGL.GGGGGGGT','TGGGGGGGGG..GGGGGGGT','TGGGGGGGGG..GGGGGGGT','TGGGGGGGGG..GGGGGGGT','TGGGGGGGGGG.GGGGGGGT','TTTTTTTTTTTETTTTTTTT'],start:{x:11,y:11},lantern:{x:10,y:7},exits:{'11,12':{to:'marsh',x:12,y:1}},clouds:[],npcs:[],signs:[{x:13,y:2,text:'Carved in the bark, in small letters: Be as kind to yourself as you would be to a friend.'}]};
REG.marsh.secret={x:12,y:0,to:'grove',tx:11,ty:11};
REG.marsh.npcs.forEach(function(n){if(n.id==='tam')n.lines.push('Odd thing. On clear mornings I see a gap in the northern trees, a little east of the pond. Probably nothing.')});
var CHESTS={grove:[{x:11,y:2,skill:'selfcomp'}],town:[{x:17,y:11,skill:'emdr'},{x:2,y:11,skill:'play'}],marsh:[{x:1,y:1,skill:'act'},{x:18,y:11,skill:'ifs'},{x:18,y:1,skill:'mbct'}],cliffs:[{x:18,y:1,skill:'tfcbt'},{x:1,y:11,skill:'cpt'},{x:1,y:1,skill:'dbt'}],castle:[{x:2,y:10,skill:'imago'},{x:18,y:10,skill:'eft'}]};
Object.keys(CHESTS).forEach(function(k){REG[k].chests=CHESTS[k].map(function(c){c.id='chest-'+c.skill;return c})});
function chestOpen(ch,p){return !!scrolls(p)[ch.skill]}
function foundScrolls(p){return Object.keys(scrolls(p)).length}
function hasCard(id,p){return ((p||prog()).cards||[]).indexOf(id)>=0}
function giveCard(id){var p=prog();p.cards=p.cards||[];if(p.cards.indexOf(id)<0)p.cards.push(id);saveProg(p);var h=dlg.querySelector('.qg-hud');h&&(h.outerHTML=hudHtml())}
function openChest(th){var k=SKILLS[th.skill],p=prog();if(chestOpen(th,p))return talk([{who:'',text:'The chest is empty now. You already found the '+k.name+' scroll here.'}]);
 p.scrolls=p.scrolls||{};p.scrolls[th.skill]='ready';if((p.quests||{}).mira==='on'&&foundScrolls(p)>=3)p.quests.mira='ready';saveProg(p);SFX('chest');if(!RM)burst(th.x*TS+8,th.y*TS+6,'#f3c95a',14);
 talk([{who:'',text:'You open the chest and find a Special Skill scroll: '+k.name+(k.full!==k.name?' ('+k.full+')':'')+'. Use it once in battle, from Special Skills, to clear half of any cloud. (Saved in your Bag.)'}])}
function CHESTS_ALL(){var a=[];for(var k in CHESTS)CHESTS[k].forEach(function(c){a.push(c.card)});return a}
var CHEST=['.kkkkkkkkkk.','kbbbbbbbbbbk','kbBBBBBBBBbk','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'],CHESTO=['.kkkkkkkkkk.','koooooooooook','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'];
CHESTO=['.kkkkkkkkkk.','kooooooooook','kkkkkyykkkkk','kbBBByyBBBbk','kbBBBBBBBBbk','kbbbbbbbbbbk','kkkkkkkkkkkk'];
var CHPAL={k:'#2a1a10',b:'#6b4220',B:'#9a6330',y:'#f3c95a',o:'#3a2414'};
function drawChests(c,t){var mm=MINI[P.region];if(mm&&!miniDone(P.region)){var bb=RM?0:Math.round(Math.sin(t/300)*1.5);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(mm.x*TS-2,mm.y*TS+13,20,3);cloudAt(c,CLOUD,BOSSPAL,mm.x*TS-6,mm.y*TS-12+bb,2,t)}
 var sc0=R().secret;if(sc0){c.fillStyle='rgba(160,210,120,.35)';c.fillRect(sc0.x*TS+6,sc0.y*TS+11,4,5);c.fillRect(sc0.x*TS+5,sc0.y*TS+14,6,2)}
(R().chests||[]).forEach(function(ch){var op=chestOpen(ch),rows=op?CHESTO:CHEST;c.fillStyle='rgba(0,0,0,.22)';c.fillRect(ch.x*TS+2,ch.y*TS+13,12,2);px(c,rows,CHPAL,ch.x*TS+2,ch.y*TS+(op?7:6));
 if(!op&&!RM){var g=.25+.2*Math.sin(t/350+ch.x);c.fillStyle='rgba(255,230,150,'+g+')';c.fillRect(ch.x*TS+7,ch.y*TS+3,2,2)}})}
/* ---------- Special Skill scrolls: one-use, found in chests ---------- */
var SKILLS={
 emdr:{name:'EMDR',full:'Eye Movement Desensitization and Reprocessing',col:'#9fd3e6',text:['EMDR is a structured therapy in which a person briefly focuses on a distressing memory while following side-to-side eye movements, taps or tones.','It is best known, and well researched, as a treatment for PTSD and other trauma, and can help painful memories feel less raw over time.']},
 act:{name:'ACT',full:'Acceptance and Commitment Therapy',col:'#4aa38f',text:['ACT helps people make room for hard thoughts and feelings instead of fighting them, and notice them without getting stuck.','Then it helps them take small steps toward what they value. It is used for anxiety, depression, chronic pain and more.']},
 ifs:{name:'IFS',full:'Internal Family Systems',col:'#d9a05a',text:['IFS sees the mind as made of different parts, like a worried part, a critical part or a protective part.','Therapy helps a person get to know these parts with curiosity and compassion instead of fighting them. It is used for trauma, anxiety, depression and more, and research on it is still growing.']},
 imago:{name:'Imago',full:'Imago Relationship Therapy',col:'#c9a46a',text:['Imago is a couples therapy built around a structured conversation called the Imago Dialogue, where partners take turns mirroring, validating and empathizing.','It aims to lower conflict and help each partner feel truly heard.']},
 tfcbt:{name:'TF-CBT',full:'Trauma-Focused Cognitive Behavioral Therapy',col:'#e6d3a0',text:['TF-CBT is a well-researched therapy for children and teens after trauma, usually with a caregiver involved.','It teaches coping skills for feelings and stress, and at a steady pace helps the young person tell the story of what happened so it feels less overwhelming.']},
 eft:{name:'EFT',full:'Emotionally Focused Therapy',col:'#f2a0b0',text:['EFT is a therapy for couples, and sometimes families, grounded in research on attachment and emotional bonds.','It helps partners understand the emotional patterns behind their conflicts and reach for each other in ways that build a safer, closer connection.']},
 dbt:{name:'DBT',full:'Dialectical Behavior Therapy',col:'#a08ad8',text:['DBT teaches four sets of skills: mindfulness, distress tolerance, emotion regulation and interpersonal effectiveness.','It was first developed for people with intense emotions and chronic suicidal feelings, and is now used widely to help when emotions feel overwhelming.']},
 cpt:{name:'CPT',full:'Cognitive Processing Therapy',col:'#e0c070',text:['CPT is a structured, well-researched therapy for PTSD.','It helps people notice and gently question stuck points, beliefs about a trauma such as self-blame or feeling unsafe everywhere, that can keep them from recovering.']},
 play:{name:'Play Therapy',full:'Play Therapy',col:'#e07a5a',text:['Play therapy uses play, a child\'s natural language, to help kids express feelings and work through hard experiences.','Toys, art and stories give children a safe way to show what they may not yet have words for.']},
 mbct:{name:'MBCT',full:'Mindfulness-Based Cognitive Therapy',col:'#9fe0c8',text:['MBCT combines mindfulness practice with ideas from cognitive behavioral therapy, helping people notice thoughts and feelings without getting pulled under by them.','It is well researched for helping prevent depression from coming back.']}};
SKILLS.selfcomp={name:'Self-Compassion',full:'Self-Compassion practice (rare)',col:'#f0b8c8',text:['Self-compassion means treating yourself with the same kindness you would offer a good friend, especially when things go wrong.','Research suggests it can ease harsh self-criticism, anxiety and low mood, and it is part of approaches such as Compassion-Focused Therapy and Mindful Self-Compassion.']};
var SKORDER=['emdr','act','ifs','imago','tfcbt','eft','dbt','cpt','play','mbct','selfcomp'];
function scrolls(p){return (p||prog()).scrolls||{}}
function skillsReady(p){var s=scrolls(p);return SKORDER.filter(function(id){return s[id]==='ready'})}
function skillDmg(st){return Math.max(1,Math.floor(st.meter*.5))}
function skillPanel(id){var k=SKILLS[id];B.busy=true;dlg.dataset.menu='skillinfo';var m=dlg.querySelector('.qg-skillbox');
 var h='<div class="qg-msg qg-skillinfo" role="region" aria-label="About '+esc(k.full)+'"><b>'+esc(k.name)+(k.full!==k.name?' <small>'+esc(k.full)+'</small>':'')+'</b><p>'+esc(k.text[0])+' '+esc(k.text[1])+'</p><p><em>In real life this is done with a trained clinician.</em></p><div class="qg-row"><button type="button" class="qg-btn" data-skgo>Continue</button></div></div>';
 var area=dlg.querySelector('.qg-list')||dlg.querySelector('.qg-cmd');var wrap=document.createElement('div');wrap.className='qg-skillbox';wrap.innerHTML=h;if(area){var bk=dlg.querySelector('[data-back]');bk&&bk.parentElement.remove();area.replaceWith(wrap)}else dlg.querySelector('.qg-body').appendChild(wrap);
 var go=wrap.querySelector('[data-skgo]');go.focus();say(k.name+'. '+k.text.join(' ')+' In real life this is done with a trained clinician.');
 go.onclick=function(){wrap.innerHTML='<p class="qg-small qg-skillcast">'+esc(k.name)+' scroll unrolls...</p>';BA.skill={id:id,t:0,dur:RM?700:1900};SFX('chest')}}
function skillAnim(c,id,e,t){var k=Math.min(1,e),col=SKILLS[id].col,P2=Math.PI;function r(x,y,w,h){c.fillRect(Math.round(x),Math.round(y),w,h)}
 c.save();var fade=k<.1?k/.1:k>.9?(1-k)/.1:1;c.globalAlpha=Math.max(0,fade);c.fillStyle='rgba(10,14,28,.35)';c.fillRect(0,0,320,150);c.fillStyle=col;
 if(id==='emdr'){var sw=RM?.5:.5-.5*Math.cos(k*P2*6);for(var i=6;i>=0;i--){var s2=RM?sw:.5-.5*Math.cos((k-i*.012)*P2*6),x=40+240*s2;c.globalAlpha=fade*(1-i/7);r(x-3,52,6,6)}c.globalAlpha=fade*.25;r(40,54,240,2);c.globalAlpha=fade;c.fillStyle='#ffffff';r(40+240*sw-1,54,2,2)}
 else if(id==='act'){var cx=150,cy=70,R2=24;for(var q=0;q<32;q++){var a=q/32*6.283;r(cx+Math.cos(a)*R2-1,cy+Math.sin(a)*R2-1,2,2)}r(cx-1,cy-R2-5,2,4);var ang=RM?-.35:-.35+Math.sin(k*14)*(1-k)*1.6;c.fillStyle='#fff3c4';for(var d=0;d<R2-4;d++)r(cx+Math.cos(ang)*d-1,cy+Math.sin(ang)*d-1,2,2);c.fillStyle='#e07a5a';for(var d2=0;d2<10;d2++)r(cx-Math.cos(ang)*d2-1,cy-Math.sin(ang)*d2-1,2,2);c.fillStyle='#f4ecd8';r(cx-2,cy-2,4,4)}
 else if(id==='ifs'){var cols=['#d9a05a','#8fb0c9','#e07a8a','#9fe0a8','#c9a0e0'];c.globalAlpha=fade*.18;c.beginPath();c.arc(80,92,40*Math.min(1,k*2),0,6.283);c.fill();for(var f=0;f<5;f++){var ap=Math.min(1,Math.max(0,(k-f*.1)*4));if(ap<=0)continue;var a3=P2+f/4*P2*.9+.15,fx=80+Math.cos(a3)*36,fy=96+Math.sin(a3)*30+(RM?0:Math.sin(t/250+f)*2);c.globalAlpha=fade*ap;c.fillStyle=cols[f];r(fx-2,fy-8,4,4);r(fx-3,fy-4,6,6);r(fx-3,fy+2,2,3);r(fx+1,fy+2,2,3)}}
 else if(id==='imago'){var n=Math.floor(40*k);for(var u=0;u<n;u++){var uu=u/40,bx=88+uu*120,by=112-34*Math.sin(P2*uu);c.fillStyle=col;r(bx,by,4,3);c.fillStyle='#8a6a3a';r(bx,by+3,4,1);c.fillStyle='#f4ecd8';r(bx,by-8,1,1);if(u%5===0){c.fillStyle=col;r(bx,by-8,1,8)}}}
 else if(id==='tfcbt'){var bx2=126,by2=50;c.fillStyle='#6b4220';r(bx2-2,by2-2,72,44);c.fillStyle='#f4ead2';r(bx2,by2,33,40);r(bx2+35,by2,33,40);c.fillStyle='#b0a080';for(var l=0;l<6;l++){r(bx2+4,by2+6+l*5,24-(l%3)*4,1);r(bx2+39,by2+6+l*5,22-(l%2)*5,1)}var ph=RM?.5:(k*3)%1,pw=Math.round(33*Math.abs(Math.cos(ph*P2)));c.fillStyle='#fffbe8';if(ph<.5)r(bx2+35,by2,pw,40);else r(bx2+34-pw,by2,pw,40);c.fillStyle='#2a1a10';r(bx2+33,by2,2,40)}
 else if(id==='eft'){var g=c.createRadialGradient(64,96,2,64,96,70*Math.min(1,k*1.5));g.addColorStop(0,'rgba(255,220,180,.75)');g.addColorStop(.5,'rgba(242,160,176,.35)');g.addColorStop(1,'rgba(242,160,176,0)');c.fillStyle=g;c.fillRect(0,20,200,130);c.fillStyle=col;var close2=RM?1:Math.min(1,k*1.6);for(var s3=0;s3<18;s3++){var a4=-P2/2+s3/17*P2*.8*close2;r(64-Math.cos(a4)*34-1,96+Math.sin(a4)*24-1,3,3);r(64+Math.cos(a4)*34-1,96+Math.sin(a4)*24-1,3,3)}}
 else if(id==='dbt'){var dc=['#9fd3e6','#9fe0a8','#f3c95a','#e07a8a'];for(var b=0;b<4;b++){var ap2=Math.min(1,Math.max(0,(k-b*.12)*3.5));if(!ap2)continue;var a5=b/4*6.283+(RM?0:t/700),rr=28+(1-ap2)*60;c.fillStyle=dc[b];r(240+Math.cos(a5)*rr-5,70+Math.sin(a5)*rr*.7-5,10,10);c.fillStyle='#ffffff';r(240+Math.cos(a5)*rr-3,70+Math.sin(a5)*rr*.7-3,3,3)}}
 else if(id==='cpt'){var amp=RM?2:14*(1-k);c.fillStyle=col;for(var x2=80;x2<210;x2+=2){var y2=80+Math.sin(x2/5)*amp*Math.sin((x2-80)/130*P2)+Math.sin(x2/2.3)*amp*.4;r(x2,y2,2,2)}if(k<.5){c.fillStyle='#8a6a3a';r(140,76+Math.sin(t/80)*2,8,8)}}
 else if(id==='play'){var bc=['#e07a5a','#5aa0e0','#f3c95a'];for(var b2=0;b2<3;b2++){var dp=Math.min(1,Math.max(0,(k-b2*.15)*3));c.fillStyle=bc[b2];r(130+b2*2,124-(b2+1)*12-(1-dp)*80,14,11);c.fillStyle='rgba(255,255,255,.5)';r(132+b2*2,126-(b2+1)*12-(1-dp)*80,4,2)}var bxp=150+k*80,byp=110-Math.abs(Math.sin(k*P2*3))*40;c.fillStyle='#9fe0a8';r(bxp-4,byp-4,8,8);c.fillStyle='#ffffff';r(bxp-2,byp-3,2,2)}
 else if(id==='selfcomp'){var pu=RM?1:1+.25*Math.sin(k*Math.PI*6),HR=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];var g3=c.createRadialGradient(64,90,2,64,90,60*Math.min(1,k*2));g3.addColorStop(0,'rgba(255,200,210,.6)');g3.addColorStop(1,'rgba(255,200,210,0)');c.fillStyle=g3;c.fillRect(0,20,180,130);c.fillStyle=col;var hs=Math.round(3*pu);for(var hy=0;hy<6;hy++)for(var hx=0;hx<7;hx++)if(HR[hy][hx]==='X')r(64-10.5*pu+hx*hs,58+hy*hs,hs,hs)}
 else{for(var w=0;w<4;w++){var rk=((RM?.5:k*1.4)+w*.25)%1,rad=6+rk*70;c.globalAlpha=fade*(1-rk);for(var q2=0;q2<40;q2++){var a6=q2/40*6.283;r(150+Math.cos(a6)*rad-1,80+Math.sin(a6)*rad*.45-1,2,2)}}c.globalAlpha=fade;var br=10+6*Math.sin(k*P2*2);c.beginPath();c.arc(150,80,br,0,6.283);c.fill()}
 c.restore()}
/* ---------- upgrades: pet levels, mini-bosses, outfits, daily calm, Safe Place ---------- */
var COMBO=0;var PETLV=[0,2,5,9,14];function petLv(p){var x=(p||prog()).petxp||0,l=1;for(var i=1;i<PETLV.length;i++)if(x>=PETLV[i])l=i+1;return l}
var TRICKS={kenneth:[{lv:2,name:'Purr',text:'At the start of each battle, a soft purr restores 1 Resolve (2 at pet level 5).'},{lv:4,name:'Nap shield',text:'Once per battle, a cozy nap shield blocks one Resolve drain.'}],
 ragnar:[{lv:2,name:'Fetch',text:'After a win, Ragnar sometimes fetches a coping-skill card (more often at pet level 5).'},{lv:4,name:'Guard bark',text:'Once per battle, a guard bark blocks one Resolve drain.'}]};
var FETCH=['tinystep','senses','selfpause','nameit','movement','values'];
var MINI={marsh:{mini:1,region:'marsh',x:18,y:6,name:'The Fog Warden',weather:'fog',meters:[10,12],intro:'A tall knot of fog gathers itself across the path east. It will not let you pass until you face it.',mid:'The Fog Warden thins, then pulls itself thicker. One more push.'},
 cliffs:{mini:1,region:'cliffs',x:18,y:6,name:'The Gale Warden',weather:'storm',meters:[10,12],intro:'A spinning wall of wind blocks the road to the threshold. It roars, but you have practiced for this.',mid:'The Gale Warden staggers, then whips up one last gust.'}};
function miniDone(k,p){return ((p||prog()).minis||[]).indexOf(k)>=0}
function miniTalk(m){talk([{who:'',text:m.intro},{who:'',text:'This Warden has two phases. Your pet stays close, but you will face this one yourself, with your spells, scrolls and guides.'}],function(){startMini(m.region,0,null)})}
function startMini(k,ph,res){ph=ph|0;if(SUSP&&SUSP.st.kind==='mini'&&SUSP.st.mini===k){var s0=SUSP.st;SUSP=null;s0.resolve=P?P.resolve:s0.resolve;s0.busy=false;return startBattle(s0)}var m=MINI[k],st=newBattle('mini',m.weather);st.mini=k;st.mphase=ph;st.meter=st.max=Math.round(m.meters[ph]*DF().bossMul)+2*st.bonus;if(res!=null)st.resolve=res;startBattle(st)}
function miniWon(line){var p=prog(),m=MINI[B.mini];p.helped=merge(p.helped,B.helped);P.resolve=B.resolve;p.resolve=B.resolve;SCENE='won';stopLoop();dlg.dataset.menu='';
 if(B.mphase===0){saveProg(p);body('<h2 id="qg-title">'+esc(m.name)+': phase 1 cleared</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">'+esc(m.mid)+'</p><div class="qg-menu"><button type="button" class="qg-btn" data-n>Continue to phase 2</button></div>','[data-n]');dlg.querySelector('[data-n]').onclick=function(){startMini(m.region,1,B.resolve)};return}
 p.minis=(p.minis||[]).concat([m.region]);p.gxp=gxp(p)+2;p.petxp=(p.petxp||0)+1;saveProg(p);dailyEv('clear',1);
 var after=function(){body('<h2 id="qg-title">'+esc(m.name)+' clears!</h2><div class="qg-msg">'+line+'</div><p class="qg-lede">+2 growth. The way east is open now.</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-m]');dlg.querySelector('[data-m]').onclick=map};
 if(m.region==='marsh'&&p.pet&&PETS[p.pet]&&!p.startleDone)return startle(after);after()}
/* ---------- After the first boss (Fog Warden): the ESA's startle battle, then a grounding mini-game. Gentle, non-graphic. ---------- */
var ESA_RES=3,ESA_CD=1; /* 'Pet the ESA': Resolve restored, and turns before it can be used again */
function esaOn(){return !!prog().esaPet&&!!PETS[prog().pet]}
function esaLeft(){return Math.max(0,(B.esaAt||0)-B.round)}
function esaBtn(){if(!esaOn())return '';var n=PETS[prog().pet].name,cd=esaLeft(),rc=DF().hints&&!cd&&B.resolve<=B.maxRes*.5;return '<button type="button" class="qg-btn'+(rc?' qg-rec':'')+'" data-esa'+(cd?' aria-disabled="true"':'')+'>Pet '+esc(n)+' (ESA)'+(rc?'<span class="sr"> (recommended)</span>':'')+'<small>'+(cd?'cooldown: '+cd+' turn'+(cd>1?'s':''):(rc?'Recommended · ':'')+'+'+ESA_RES+' Resolve · free')+'</small></button>'}
function petESA(){var n=PETS[prog().pet].name,cd=esaLeft();if(cd){say(n+' is resting. Ready in '+cd+' turn'+(cd>1?'s':'')+'.');return}var g=Math.min(ESA_RES,B.maxRes-B.resolve);B.resolve+=g;P&&(P.resolve=B.resolve);B.esaAt=B.round+ESA_CD;try{SFX('heal')}catch(e){}FLO.push({t:'+'+g,x:76,y:70,l:900,c:'#9fe0a8'});
 battleUI(null,'You pet <b>'+esc(n)+'</b>. Slow strokes, a soft lean. You both settle a little: <b>+'+g+' Resolve</b>. (Free action; '+esc(n)+' needs '+ESA_CD+' turn'+(ESA_CD>1?'s':'')+' before the next one.)','#qg-msg');say('You pet '+n+'. Plus '+g+' Resolve.')}
var SST=null;
var STSYM=[{name:'Startle Echo',flavor:'The loud crack keeps ringing in their ears.'},{name:'Hide-and-Freeze',flavor:'They press flat and go very still.'},{name:'Ears-Back Trembling',flavor:'Their whole body shakes, ready to run.'}];
var SACTS=[{id:'close',name:'Sit down low and stay close',ok:true,res:function(n){return 'You sit down a little way off, low and quiet. You don\'t grab or chase. '+n+' can see you are staying.'}},
 {id:'breathe',name:'Breathe slow and steady',ok:true,res:function(n){return 'You breathe in for 4 and out for 6, slow enough that '+n+' can feel it. A calm body nearby helps a scared body settle.'}},
 {id:'safe',name:'Remind them they are safe',ok:true,res:function(n){return 'You speak softly: "The fight is over. We\'re by the lantern. You\'re safe now." '+n+'\'s ears come forward a little.'}},
 {id:'hurry',name:'Tell them to hurry up and get over it',ok:false,res:function(n){return n+' only presses lower. Rushing a scared body tends to make the alarm louder. Nothing lost; try something gentler.'}}];
var GPOOL=[
 {id:'box',name:'Box breathing',how:'Tap the four sides of the box in order: breathe in 4, hold 4, out 4, hold 4.',seq:['In 4','Hold 4','Out 4','Hold 4']},
 {id:'senses',name:'5-4-3-2-1 senses',how:'Notice around you: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Tap them in order.',seq:['5 see','4 touch','3 hear','2 smell','1 taste'],shuffle:1},
 {id:'feet',name:'Feet on the floor',how:'Press your feet into the ground three slow times. Feel it hold you up.',seq:['Press 1','Press 2','Press 3']},
 {id:'scan',name:'Body scan',how:'Move your attention slowly from top to bottom: head, shoulders, belly, feet.',seq:['Head','Shoulders','Belly','Feet'],shuffle:1},
 {id:'objects',name:'Name safe objects',how:'Pick the three things nearby that feel safe.',pick:['Warm lantern','Soft blanket','Your water flask'],decoy:['The loud crack','A sudden flash']},
 {id:'cold',name:'Cool water',how:'A change in temperature can calm a racing body. Pick the cool, gentle option.',pick:['Splash cool stream water on your hands'],decoy:['Run in circles','Hold your breath']},
 {id:'colors',name:'Counting colors',how:'Count the blue things in the picture, then tap the number.',colors:1}];
function startle(after){var p=prog(),id=p.pet,n=PETS[id].name;SCENE='startle';stopLoop();dlg.dataset.scene='memory';dlg.dataset.menu='';
 var pool=GPOOL.slice();for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=pool[i];pool[i]=pool[j];pool[j]=t}
 SST={id:id,n:n,calm:0,used:[],after:after,t0:performance.now(),phase:'battle',rounds:pool.slice(0,3),r:0,step:0,near:0};
 startleUI('As the Fog Warden fades, its last gust slams into the rocks: <b>CRACK!</b> A loud echo rolls across the marsh. '+esc(n)+', your support animal, flinches, ears flat, and scrambles behind the reeds, trembling. This encounter is not a fight with '+esc(n)+'. It is their alarm you are helping to quiet.');say(n+' got startled by a loud echo and is hiding, trembling.')}
function stStage(lbl){return '<div class="qg-stage battle"><canvas class="qg-cv qg-scv" width="320" height="150" role="img" aria-label="'+esc(lbl)+'"></canvas></div>'}
function startleUI(msg){if(SST.phase!=='battle')return groundUI(msg);var n=SST.n,h=DF().hints,sy=STSYM[Math.min(2,SST.calm)];
 if(SST.calm>=3){SST.phase='ground';SST.near=0;return groundUI(msg+' <b>The alarm quiets.</b> '+esc(n)+' stops shaking but still keeps a little distance. Time to ground together, so trust can come back.')}
 body('<p class="qg-phase">After the Fog Warden · '+esc(n)+'\'s startle response</p><h2 id="qg-title" class="qg-bt">'+esc(sy.name)+' <small>startle response</small></h2>'+
 '<p class="qg-casts" role="status"><b>'+esc(n)+'\'s alarm casts '+esc(sy.name)+'!</b></p><p class="qg-sym"><span>Symptom: <b>'+esc(sy.name)+'</b> · a startle response. '+esc(sy.flavor)+'</span></p>'+(h?'<p class="qg-hint" role="note"><b>Easy mode:</b> the calming actions glow gold.</p>':'')+
 stStage(n+' hides behind the reeds, trembling.')+
 '<div class="qg-bars"><div class="qg-bar" role="meter" aria-label="Alarm" aria-valuemin="0" aria-valuemax="3" aria-valuenow="'+(3-SST.calm)+'"><span>'+esc(n)+'\'s alarm <b>'+(3-SST.calm)+'</b>/3</span><i><em style="width:'+((3-SST.calm)/3*100)+'%"></em></i></div></div>'+
 '<div class="qg-msg" id="qg-msg">'+msg+'</div>'+
 (SST.calm===0?'<p class="qg-small"><b>What is happening?</b> After something scary, a sudden noise or flash can set off the body\'s alarm again, even when the danger is over. This is like a startle or trauma response: shaking, hiding, wanting to run. Pushing doesn\'t help much. A calm, safe, patient presence does. People feel this too. This is a game, not a diagnosis.</p>':'')+
 '<div class="qg-list" role="group" aria-label="Ways to help '+esc(n)+'">'+SACTS.map(function(a){var used=SST.used.indexOf(a.id)>=0,rc=h&&a.ok&&!used;return '<button type="button" class="qg-btn'+(rc?' qg-rec':'')+'" data-sact="'+a.id+'"'+(used?' aria-disabled="true"':'')+'>'+esc(a.name)+(rc?'<span class="sr"> (recommended)</span>':'')+'<small>'+(used?'Done':rc?'Recommended':'&nbsp;')+'</small></button>'}).join('')+'</div>','.qg-list .qg-btn:not([aria-disabled])');
 dlg.querySelectorAll('[data-sact]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled'))return;var a=SACTS.find(function(x){return x.id===b.dataset.sact});var m=a.res(esc(n));if(a.ok){SST.used.push(a.id);SST.calm++;try{SFX('soft')}catch(e){}}startleUI(m);say(b.textContent+'. Alarm '+(3-Math.min(3,SST.calm))+' of 3.')}});loop(drawStartle)}
function groundUI(msg){var n=SST.n,h=DF().hints;
 if(SST.phase==='done'){body('<h2 id="qg-title">'+esc(n)+' trusts you again</h2>'+stStage(n+' leans against you, calm.')+'<div class="qg-msg" id="qg-msg">'+(msg||'')+'</div><p class="qg-lede">'+esc(n)+' pads over, leans into your leg, and lets out a long, slow breath. You both feel steadier. <b>New skill: Pet '+esc(n)+' (ESA)</b>. In battle it soothes you both and restores '+ESA_RES+' Resolve, then rests for '+ESA_CD+' turn'+(ESA_CD>1?'s':'')+'.</p><p class="qg-small">Grounding skills help a body notice "I am here, and I am safe right now." A calm presence helps someone else feel it too. This is a game, not a diagnosis.</p><div class="qg-menu"><button type="button" class="qg-btn" data-sdone>Back to the road together</button></div>','[data-sdone]');
  dlg.querySelector('[data-sdone]').onclick=function(){var f=SST.after;SST=null;f()};return loop(drawStartle)}
 var G=SST.rounds[SST.r];if(!SST.opts){if(G.colors){SST.blue=3+Math.floor(Math.random()*3);SST.opts=[SST.blue-1,SST.blue,SST.blue+1].map(String);SST.cols=[];for(var i=0;i<8;i++)SST.cols.push(i<SST.blue?'#4a7ad0':['#d0a04a','#6aa05a','#c06a8a'][i%3]);SST.cols.sort(function(){return Math.random()-.5})}else{var o=(G.seq||G.pick.concat(G.decoy)).slice();if(G.shuffle||G.pick)o.sort(function(){return Math.random()-.5});SST.opts=o}SST.got=[]}
 var want=G.colors?[String(SST.blue)]:G.seq?[G.seq[SST.got.length]]:G.pick.filter(function(x){return SST.got.indexOf(x)<0});
 var sw=G.colors?'<div class="qg-swatch" aria-label="Picture: '+SST.cols.length+' colored squares">'+SST.cols.map(function(c){return '<i style="background:'+c+'" aria-label="'+(c==='#4a7ad0'?'blue':'not blue')+'" role="img"></i>'}).join('')+'</div>':'';
 body('<p class="qg-phase">Grounding together · round '+(SST.r+1)+' of 3</p><h2 id="qg-title">'+esc(G.name)+'</h2>'+stStage(n+' is '+['still a little way off','a few steps closer','almost beside you'][SST.r]+'.')+
 '<p class="qg-lede">'+esc(G.how)+'</p>'+sw+(h?'<p class="qg-hint" role="note"><b>Easy mode:</b> the next right step glows gold.</p>':'')+'<div class="qg-msg" id="qg-msg">'+(msg||'')+'</div>'+
 '<div class="qg-list" role="group" aria-label="'+esc(G.name)+' steps">'+SST.opts.map(function(o){var done=SST.got.indexOf(o)>=0,rc=h&&!done&&want.indexOf(o)>=0;return '<button type="button" class="qg-btn'+(rc?' qg-rec':'')+'" data-g="'+esc(o)+'"'+(done?' aria-disabled="true"':'')+'>'+esc(o)+(rc?'<span class="sr"> (recommended)</span>':'')+'<small>'+(done?'Done':rc?'Recommended':'&nbsp;')+'</small></button>'}).join('')+'</div>','.qg-list .qg-btn:not([aria-disabled])');
 dlg.querySelectorAll('[data-g]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled'))return;var o=b.dataset.g;
  if(want.indexOf(o)<0){SST.got=[];return groundUI('That\'s okay. Grounding is practice, not a test. Let\'s start this one again, slowly.')}
  SST.got.push(o);var need=G.colors?1:G.seq?G.seq.length:G.pick.length;
  if(SST.got.length>=need){SST.r++;SST.near=SST.r;SST.opts=null;try{SFX('chest')}catch(e){}if(SST.r>=3){SST.phase='done';var p=prog();p.startleDone=1;p.esaPet=1;p.petxp=(p.petxp||0)+1;saveProg(p);return groundUI('Third round done. '+esc(n)+' comes all the way to you.')}return groundUI('<b>'+esc(G.name)+': done.</b> '+esc(n)+' takes a few steps closer.')}
  groundUI('Good. Keep going.')}});say(G.name+'. '+G.how);loop(drawStartle)}
function drawStartle(c,t){if(!SST)return;var e=t-SST.t0,cm=SST.calm,pet=PETS[SST.id],gp=SST.phase!=='battle',done=SST.phase==='done';function r(col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)}
 c.clearRect(0,0,320,150);r(done?'#a9c4c0':gp?'#8fa6ae':'#6a7a86',0,0,320,90);r('#4f6a4a',0,90,320,60);r('#3c5638',0,90,320,4);
 if(!gp&&cm===0&&e<700&&!RM)r('rgba(240,240,255,'+(0.35*(1-e/700))+')',0,0,320,150);
 r('#f3c95a',40,40,6,30);r('rgba(243,201,90,'+(.25+.1*(gp?3+SST.near:cm))+')',30,30,26,26);
 var hide=!gp&&cm<2,sh=!gp&&!RM?Math.round(Math.sin(t/(45+cm*30))*(3-cm)*.7):0,hx=120,ex=done?164:gp?[246,222,196][Math.min(2,SST.near)]:248;
 px(c,walkF(HERO.side,0),PAL,hx,70,{s:3});px(c,pet.side,pet.pal,ex+sh,hide?104:96,{s:3});
 if(hide)for(var i=0;i<7;i++)r(i%2?'#5f8a4a':'#4c7a3c',236+i*8,92-(i%3)*6,5,40);
 if(done){var b=!RM&&Math.sin(t/500)>0;r('#e88aa8',178,84-(b?2:0),4,4);r('#e88aa8',183,84-(b?2:0),4,4);r('#e88aa8',180,88-(b?2:0),5,3)}}
var OUTFITS=[{id:'teal',name:'Traveler Teal',c:'#1f6f73',d:'#134a4d'},{id:'ember',name:'Lantern Ember',c:'#b5523a',d:'#7a3424',need:'marsh',hint:'Clear the Gray Fog Marsh'},{id:'sky',name:'Storm Sky',c:'#3f6fb5',d:'#28487a',need:'cliffs',hint:'Clear the Storm Wind Cliffs'},{id:'moss',name:'Grove Moss',c:'#4f8a3a',d:'#335c26',need:'grove',hint:'Find the hidden scroll'},{id:'plum',name:'Warden Plum',c:'#6a4a9a',d:'#463066',need:'minis',hint:'Beat both Wardens'},{id:'sun',name:'Sunrise Gold',c:'#c9902a',d:'#8a5f1a',need:'done',hint:'Lift the Fogstorm'}];
var HAIRS=[{id:'brown',name:'Chestnut',h:'#5a3a22'},{id:'black',name:'Ink',h:'#231c1c',lv:2},{id:'auburn',name:'Auburn',h:'#8a3a1a',lv:3},{id:'blond',name:'Wheat',h:'#c9a050',lv:4},{id:'silver',name:'Silver',h:'#b8bcc4',lv:5}];
function lookOpen(o,p){if(o.lv)return level(p)>=o.lv;var n=o.need;if(!n)return true;if(n==='marsh'||n==='cliffs')return (p.rcleared||[]).indexOf(n)>=0;if(n==='grove')return !!scrolls(p).selfcomp;if(n==='minis')return miniDone('marsh',p)&&miniDone('cliffs',p);if(n==='done')return !!p.done||(p.wins||0)>0;return false}
function applyLook(p){p=p||prog();var o=OUTFITS.find(function(x){return x.id===p.outfit})||OUTFITS[0],h=HAIRS.find(function(x){return x.id===p.hair})||HAIRS[0];if(!lookOpen(o,p))o=OUTFITS[0];if(!lookOpen(h,p))h=HAIRS[0];PAL.c=o.c;PAL.d=o.d;PAL.h=h.h}
var DAILY=[{id:'match3',text:'Cast 3 spells that fit their cloud',ev:'match',n:3},{id:'wiserest',text:'Take one wise Rest (when Resolve is half or lower)',ev:'wiserest',n:1},{id:'guide1',text:'Call a guide once',ev:'guide',n:1},{id:'clear2',text:'Clear 2 clouds (pet clears count)',ev:'clear',n:2},{id:'combo',text:'Reach Combo x2 by chaining fitting spells',ev:'combo',n:1},{id:'safe',text:'Visit your Safe Place and breathe',ev:'safe',n:1}];
function dayStr(o){var d=new Date();d.setDate(d.getDate()+(o||0));return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function dailyGet(p){var t=dayStr();if(!p.daily||p.daily.day!==t){var h=0;for(var i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;p.daily={day:t,id:DAILY[h%DAILY.length].id,n:0,done:false}}return p.daily}
function streak(p){return p.lastDaily===dayStr()||p.lastDaily===dayStr(-1)?(p.streak||0):0}
function dailyEv(ev,k){var p=prog();if(!p.v)return;var d=dailyGet(p),D=DAILY.find(function(x){return x.id===d.id});if(d.done||D.ev!==ev){saveProg(p);return}d.n=Math.min(D.n,d.n+(k||1));if(d.n>=D.n){d.done=true;p.streak=p.lastDaily===dayStr(-1)?(p.streak||0)+1:p.lastDaily===dayStr()?(p.streak||1):1;p.lastDaily=dayStr();p.gxp=gxp(p)+1;saveProg(p);toast('Daily calm challenge done! Streak: '+p.streak+' day'+(p.streak>1?'s':''));SFX('chest')}else saveProg(p);var e=dlg&&dlg.querySelector('.qg-daily');e&&(e.outerHTML=dailyHtml())}
function dailyHtml(){var p=prog(),d=dailyGet(p),D=DAILY.find(function(x){return x.id===d.id}),s=streak(p);return '<p class="qg-daily qg-small"><b>Daily calm challenge:</b> '+esc(D.text)+' ('+(d.done?'done':d.n+'/'+D.n)+') · streak '+s+' day'+(s===1?'':'s')+'</p>'}
/* Safe Place (EMDR-inspired calm place) */
var SAFE={cabin:{name:'Forest cabin'},beach:{name:'Beach house'}};
function safePlace(){if(SCENE==='battle'){if(B&&B.busy)return;SUSP={st:B};say('You step away from the fight. It will wait for you.')}else if(SCENE==='memory'){SUSP=null}else if(SCENE!=='map'&&SCENE!=='welcome'&&!/^safe/.test(SCENE))SUSP=null;if(P&&SCENE==='map')savePos();var p=prog();if(!p.safe)return safePick();safeScene()}
function safePick(){SCENE='safepick';stopLoop();endTalk();dlg.dataset.scene='safepick';dlg.dataset.menu='';
 body('<h2 id="qg-title">Choose your Safe Place</h2><p class="qg-lede">Pick a calm place to return to whenever you need to recharge. You can change it later.</p><div class="qg-menu qg-safepick">'+Object.keys(SAFE).map(function(k){return '<button type="button" class="qg-btn" data-safe="'+k+'"><canvas class="qg-safeprev" width="160" height="75" data-prev="'+k+'" aria-hidden="true"></canvas>'+SAFE[k].name+'</button>'}).join('')+'</div>','[data-safe]');
 dlg.querySelectorAll('[data-prev]').forEach(function(cv){var c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.scale(.5,.5);drawSafe(c,1000,16,cv.dataset.prev,true)});
 dlg.querySelectorAll('[data-safe]').forEach(function(b){b.onclick=function(){var p=prog();p.safe=b.dataset.safe;saveProg(p);safeScene()}})}
function safeScene(){var p=prog();if(!P)newPlayer();P.resolve=maxRes(p);p.resolve=maxRes(p);saveProg(p);SCENE='safe';stopLoop();endTalk();dlg.dataset.scene='safe';dlg.dataset.menu='';MUS('calm');var k=p.safe,o=k==='cabin'?'beach':'cabin';
 body('<h2 id="qg-title">Your Safe Place: '+SAFE[k].name+'</h2><div class="qg-stage"><canvas class="qg-cv qg-safe" width="320" height="150" role="img" aria-label="'+(k==='cabin'?'A cozy forest cabin among pine trees, with a crackling campfire':'A little beach house by gentle waves, with a beach bonfire')+(PETS[p.pet]?', where '+PETS[p.pet].name+' plays and then rests by the fire':'')+'."></canvas></div>'+
 '<div class="qg-msg"><p>In EMDR, a Safe/Calm Place is an imagined place you build with your therapist to feel calm and grounded. Here, notice what you see, hear and feel: the warm fire, the '+(k==='cabin'?'pines moving in the breeze':'waves rolling in')+', your companion nearby. You can return to a place like this in your mind when things feel like too much.</p><p><b>Your Resolve is fully restored ('+maxRes(p)+'/'+maxRes(p)+').</b></p><p class="qg-small"><em>In real life this is done with a trained clinician.</em></p></div>'+
 '<div class="qg-breathe-wrap"><button type="button" class="qg-btn" data-breathe aria-pressed="false">Breathe along <small>optional</small></button><div class="qg-breathe" hidden aria-live="polite"><span class="qg-bcirc" aria-hidden="true"></span><b class="qg-btxt">Breathe in...</b></div></div>'+
 '<div class="qg-menu"><button type="button" class="qg-btn qg-primary" data-ret>Return to your journey</button><button type="button" class="qg-link" data-swap>Switch to the '+SAFE[o].name.toLowerCase()+'</button></div>','h2');
 dlg.querySelector('[data-ret]').onclick=function(){MUS(null);map()};dlg.querySelector('[data-swap]').onclick=function(){var q=prog();q.safe=o;saveProg(q);safeScene()};
 var bb=dlg.querySelector('[data-breathe]'),bw=dlg.querySelector('.qg-breathe'),bt=dlg.querySelector('.qg-btxt');bb.onclick=function(){var on=bw.hidden;bw.hidden=!on;bb.setAttribute('aria-pressed',String(on));clearInterval(safeScene._i);if(on){var i=0;bt.textContent='Breathe in... 4';safeScene._i=setInterval(function(){if(!bt.isConnected)return clearInterval(safeScene._i);i++;var ph=Math.floor(i/4)%2,n=4-i%4;bt.textContent=(ph?'Breathe out... ':'Breathe in... ')+n},1000);dailyEv('safe',1)}};
 SAFET0=performance.now();loop(function(c,t,dt){drawSafe(c,t,dt,k,false)})}
var SAFET0=0,SAFEBG={};
function safeBg(k){if(SAFEBG[k])return SAFEBG[k];var cv=document.createElement('canvas');cv.width=320;cv.height=150;var c=cv.getContext('2d');function r(col,x,y,w,h){c.fillStyle=col;c.fillRect(x,y,w,h)}
 var bands=k==='cabin'?['#1b2340','#222c4e','#2b3a5c','#34476a','#3d5470']:['#2a2a55','#4a3a6a','#7a4a6a','#c06a5a','#e0945a'];bands.forEach(function(col,i){r(col,0,i*14,320,14)});
 if(k==='cabin'){r('#3d5470',0,70,320,26);r('#e8e2c8',258,14,10,10);r('#1b2340',255,13,6,6);
  for(var i=0;i<12;i++){var x=(i*29)%320,h=30+(i*13)%20;c.fillStyle='#1f3a2c';for(var y=0;y<h;y+=3){var w=Math.round((y/h)*14)+2;c.fillRect(x-w/2,70-h+y,w,3)}}
  r('#2f4a30',0,96,320,54);r('#3a5a36',0,96,320,3);for(var g=0;g<60;g++)r('#47683f',(g*53)%320,100+(g*17)%48,2,1);
  r('#5a3a22',36,62,80,40);r('#4a2e1a',36,62,80,3);for(var l=0;l<5;l++)r('#6b4628',36,66+l*7,80,1);c.fillStyle='#3b2a1a';for(var q=0;q<12;q++)c.fillRect(30+q*0,0,0,0);
  for(var s=0;s<14;s++)r('#3b2418',30+s*3,62-s*1.6,92-s*6,2);r('#3b2a1a',66,80,16,22);r('#f3c95a',90,72,16,12);r('#ffe9a8',92,74,5,4);r('#3b2a1a',97,72,2,12);r('#3b2a1a',90,77,16,2);r('#6a5040',100,40,8,16)}
 else{r('#f2c070',236,52,26,10);r('#f7d890',240,48,18,4);r('#3a5a8a',0,70,320,26);r('#4a6a9a',0,70,320,2);r('#e6cf9a',0,96,320,54);r('#d8bd86',0,96,320,3);for(var g2=0;g2<50;g2++)r('#c9ab72',(g2*47)%320,100+(g2*19)%48,2,1);
  for(var st=0;st<4;st++)r('#6b4628',40+st*22,84,3,20);r('#d9d2bf',34,58,76,28);r('#c0b8a2',34,82,76,4);for(var s2=0;s2<12;s2++)r('#8a4a3a',28+s2*3,58-s2*1.5,88-s2*6,2);r('#4a6a8a',48,66,14,10);r('#f3c95a',82,66,14,10);r('#ffe9a8',84,68,4,3);r('#6b4628',30,86,84,3)}
 return SAFEBG[k]=cv}
function drawSafe(c,t,dt,k,still){var rm=RM||still,e=t-SAFET0;c.clearRect(0,0,320,150);c.drawImage(safeBg(k),0,0);function r(col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)}
 if(k==='cabin'){for(var i=0;i<4;i++){var sw=rm?0:Math.sin(t/900+i)*1.5,x=150+i*44;c.fillStyle='#24452f';for(var y=0;y<34;y+=3){var w=Math.round(y/34*16)+2;c.fillRect(Math.round(x-w/2+sw*(1-y/34)),62+y,w,3)}r('#3b2a1a',x-1,96,3,5)}}
 else{for(var wv=0;wv<4;wv++){var o=rm?0:((t/(60+wv*25))%40);c.fillStyle='rgba(230,240,255,'+(.5-wv*.1)+')';for(var xx=-40;xx<330;xx+=40)c.fillRect(Math.round(xx+o),74+wv*6,18,1)}var sh=rm?0:Math.sin(t/1400)*3;r('rgba(240,248,255,.55)',0,95+sh,320,1)}
 var fx=200,fy=118;r('#5a3a22',fx-10,fy+6,20,3);r('#3b2a1a',fx-8,fy+4,16,2);r('#7a7a7a',fx-12,fy+8,4,2);r('#7a7a7a',fx+8,fy+8,4,2);
 var fl=[['#c9502a',12,14],['#e07a3a',9,11],['#f3c95a',6,8],['#fff1b0',3,4]];fl.forEach(function(f,i){var hh=f[2]+(rm?0:Math.round(Math.sin(t/(90+i*30)+i)*2+Math.random()*1.5));r(f[0],fx-f[1]/2,fy+5-hh,f[1],hh)});
 var gR=k==='cabin'?34:60,gA=k==='cabin'?'.14':'.28',gl=c.createRadialGradient(fx,fy,2,fx,fy,gR);gl.addColorStop(0,'rgba(255,190,110,'+gA+')');gl.addColorStop(1,'rgba(255,190,110,0)');c.fillStyle=gl;c.fillRect(fx-gR,fy-gR,gR*2,gR*2);
 if(!rm)for(var m=0;m<8;m++){var a=((t/1800)+m*.37)%1;r(m%2?'#f3c95a':'#ff9a5a',fx-4+Math.sin(m*7+t/400)*6,fy-8-a*50,1,1)}
 if(k==='cabin')for(var ff=0;ff<7;ff++){var bl=rm?.6:(.5+.5*Math.sin(t/500+ff*2));c.fillStyle='rgba(210,240,140,'+bl.toFixed(2)+')';c.fillRect(Math.round(130+ff*25+(rm?0:Math.sin(t/1300+ff)*8)),Math.round(78+(ff*13)%20+(rm?0:Math.cos(t/1100+ff)*4)),2,2)}
 var pid=prog().pet;if(!PETS[pid])return;var cyc=rm?7000:e%12000,play=cyc<6000;
 if(play){var u=cyc/6000,px2=150+Math.sin(u*Math.PI*4)*60,dir=Math.cos(u*Math.PI*4)>0?'side':'left',ty=k==='cabin'?118:120,hop=Math.round(Math.abs(Math.sin(u*Math.PI*16))*3);
  var tx=px2+(dir==='side'?26:-14);if(k==='cabin'){r('#d9822b',tx,ty-2-Math.abs(Math.sin(u*40))*6,4,3);r('#a3561a',tx+1,ty-1-Math.abs(Math.sin(u*40))*6,2,1)}else{r('#e05a5a',tx,ty+2-hop*2,6,6);r('#ffffff',tx+1,ty+3-hop*2,2,2)}
  c.fillStyle='rgba(0,0,0,.2)';c.fillRect(Math.round(px2+2),ty+16,20,2);drawPet(c,pid,px2,ty-hop,dir,Math.floor(e/120)%2?1:3,2)}
 else{var br=rm?0:Math.round(Math.sin(e/700));c.fillStyle='rgba(0,0,0,.2)';c.fillRect(fx-48,fy+14,26,2);drawPet(c,pid,fx-50,fy-4+br,'side',0,2);if(!rm){var zz=(e/1500)%1;c.globalAlpha=1-zz;r('#e8e2c8',fx-30+zz*6,fy-12-zz*12,4,1);r('#e8e2c8',fx-28+zz*6,fy-11-zz*12,1,1);r('#e8e2c8',fx-29+zz*6,fy-10-zz*12,1,1);r('#e8e2c8',fx-30+zz*6,fy-9-zz*12,4,1);c.globalAlpha=1}}}
/* ---------- side quests: small, hopeful errands for townsfolk ---------- */
var QUESTS={baker:{name:'Warm bread for Tam',give:['Could you do me a favor? Tam fishes out in the Gray Fog Marsh and hasn\'t been by in a while. Would you tell him the bread is warm and he\'s welcome anytime?'],
  wait:['Have you found Tam yet? He\'s usually near the middle of the marsh.'],
  done:['He said that? Oh, good. Sometimes just being thought of is enough to get someone through a gray week. Here, take this card. It\'s one I use.'],card:'reachout',xp:2},
 jo:{name:'One long breath',give:['Want to try something? Next time a storm cloud rushes you, cast Breath of the Calm on it. Then come tell me how it felt.'],
  wait:['Find a storm cloud that races, like a pounding heart, and cast Breath of the Calm. Then come back.'],
  done:['See? Your body listened. That longer out-breath is a skill you can take anywhere. This card has another way to do it.'],card:'boxbreath',xp:2},
 kid:{name:'Treasure hunt',give:['I heard there are treasure chests hidden out past town, with scrolls inside that teach you brave things. Can you find three? Then come show me!'],
  wait:['Have you found three chests yet? They\'re tucked into the corners of the map.'],
  done:['Three! You\'re a real explorer. Here, this is my favorite card. I close my eyes and go there when school feels loud.'],card:'calmplace',xp:2}};
var QKEY={baker:'pell',jo:'jo',kid:'mira'};
var QHOOK={tam:1};
function questTalk(th){var p=prog();p.quests=p.quests||{};var q=QUESTS[th.id],k=QKEY[th.id];
 if(th.id==='tam'&&p.quests.pell==='on'){p.quests.pell='ready';saveProg(p);toast('Quest: tell Pell');return ['Pell said the bread is warm? Huh. I didn\'t think anyone noticed I\'d been gone. Tell Pell thank you. Maybe I\'ll walk over this week.']}
 if(!q)return null;var st=p.quests[k];
 if(!st){p.quests[k]='on';if(k==='mira'&&foundScrolls(p)>=3)p.quests[k]='ready';saveProg(p);toast('New quest: '+q.name);SFX('chest');return q.give.concat(th.lines?[]:[])}
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
var MOODS={calm:{bpm:50,root:53,pat:[0,4,7,12,7,4,2,4]},title:{bpm:84,root:57,pat:[0,4,7,4,9,7,4,2]},town:{bpm:90,root:60,pat:[0,2,4,7,4,2,9,7]},fog:{bpm:70,root:55,pat:[0,3,7,3,5,3,0,-2]},storm:{bpm:104,root:57,pat:[0,7,3,7,5,7,3,10]},
 battle:{bpm:116,root:57,pat:[0,3,7,10,7,3,5,7]},boss:{bpm:96,root:52,pat:[0,3,6,3,7,6,3,1]},office:{bpm:76,root:60,pat:[0,4,7,11,9,7,4,2]}};
function MUS(m){if(m!==undefined)MCUR=m;clearInterval(MT);MT=null;if(!MCUR||!sndOn()||!actx()||AC.state!=='running')return;var M=MOODS[MCUR]||MOODS.town,i=0,sp=60/M.bpm/2;
 function f(n){return 440*Math.pow(2,(n-69)/12)}
 function tick(){if(!sndOn()){clearInterval(MT);return}var t=AC.currentTime+.05,n=M.pat[i%M.pat.length];tone(f(M.root+12+n),t,sp*1.6,'square',.012);if(i%4===0)tone(f(M.root-12+M.pat[(i>>2)%4]),t,sp*3.6,'triangle',.03);i++}
 tick();MT=setInterval(tick,sp*1000)}
function toggleSnd(){var on=!sndOn();try{localStorage.setItem(SKEY,on?'1':'0')}catch(e){}if(on){actx();if(AC&&AC.state!=='running')AC.resume().then(function(){MUS();SFX('chest')});else{MUS();SFX('chest')}}else{clearInterval(MT);MT=null}
 dlg.querySelectorAll('[data-snd]').forEach(function(b){b.textContent='Sound: '+(on?'on':'off');b.setAttribute('aria-pressed',String(on))});say('Sound '+(on?'on':'off'))}
function init(){var b=$('#qg-open');if(b)b.addEventListener('click',open);hud()}
/* ---------- The Replay: a memory boss (memory reconsolidation), pet flees + reunion, petting recharge, Safe Place HUD ---------- */
var MEMHP=6,MEMSUDS=[1,2,3,4,6,7,9],SUSP=null,MEMA={t0:0,last:null,flash:0};
function petName(id){var p=prog();id=id||p.pet||p.petAway;return PETS[id]?PETS[id].name:'your pet'}
var MEMD=[
 {id:'adult',name:'Stand beside your younger self',cost:2,does:'Grown-up Makayla now stands next to young Makayla in the replay. The pet still runs; she is not alone with it anymore.',why:'Bringing your adult, present-day self into an old memory adds something true that was not there before: you know more now, and you can be with the younger you.'},
 {id:'ended',name:'Notice what came next: the bang ended',cost:2,does:'The replay now carries its ending: the noise stopped, the sky cleared, and you are safe right now.',why:'Memories often get stuck at the scariest moment. Noticing that it ended, and that you are here now, is accurate new information the memory can take in.'},
 {id:'calm',name:function(){return 'Call '+petName()+'\'s name calmly'},cost:2,does:function(){return 'In the replay you now call "'+petName()+'..." softly, the way you would today, instead of freezing.'},why:'Trying a different response inside the memory, while it is active, is one way new learning gets in. It does not change what happened; it changes what you can do with it.'},
 {id:'breath',name:'Slow breath, feel your feet',cost:2,does:'Young Makayla\'s shoulders drop a little. Her breathing slows while the scene plays.',why:'Changing the body\'s response while the memory is active (slow breathing, feeling your feet on the ground) is part of how the felt sense of a memory can soften.'},
 {id:'meaning',name:function(){return 'Shift the meaning: "'+petName()+' ran because it was scared, not because of me"'},cost:2,does:'The old line "it left because of me" fades from the scene. The accurate one stays: it was scared of the noise.',why:'Self-blame is a common stuck point. Swapping it for an accurate meaning, not a rosier one, is what lets a memory update.'},
 {id:'words',name:'Say what you needed to hear',cost:2,does:'A voice in the replay says the words that were missing: "You\'re not alone. Scared feelings pass. We\'ll look together."',why:'Saying the words that were not said gives the memory something it was missing, a kind of comfort the younger you needed.'},
 {id:'soften',name:'Let the bang get quieter, the light warmer',cost:2,does:'The colors warm and the bang sounds farther away, like a memory instead of right now.',why:'When a memory feels less "right now", its sounds and colors often soften. That is a change in felt sense, not in the facts.'}];
var MEMX=[
 {id:'never',name:function(){return 'Make it never happen: '+petName()+' never ran'},note:'The scene snaps back, exactly the same. What happened, happened. Trying to erase a memory doesn\'t let it update; what can change is what you know and feel about it now.'},
 {id:'away',name:'Push it away and don\'t look',note:'The replay just starts over, a little louder. Avoiding a memory keeps it frozen. Taking a step away to rest is fine (that\'s the Safe Place button); pretending it isn\'t there is different.'},
 {id:'happy',name:'Rewrite it into a happy day',note:'It doesn\'t stick; the bang still comes. Replacing the facts with a made-up story isn\'t how memories heal. The facts stay; the meaning and feeling around them can change.'}];
function mdName(d){return typeof d.name==='function'?d.name():d.name}
function mem(p){p=p||prog();if(!p.mem)p.mem={used:[],hp:MEMHP,cd:0,loop:1};return p.mem}
function memSuds(m){return MEMSUDS[Math.max(0,Math.min(MEMHP,m.hp))]}
function memIntro(){if(SCENE==='map')savePos();held=null;stopLoop();var p=prog();if(p.mem&&p.mem.used&&p.mem.used.length)return memFight('The Replay is still looping where you left it. Every detail you changed is still changed.');
 if(p.pet&&!p.mem){p.petAway=p.pet;delete p.pet;saveProg(p);PET=null}
 SCENE='memintro';dlg.dataset.scene='memory';dlg.dataset.menu='';MUS('boss');MEMA={t0:performance.now(),flee:1,last:null,flash:0};var nm=petName();
 body('<h2 id="qg-title">The Replay</h2><div class="qg-stage battle"><canvas class="qg-cv qg-mcv" width="320" height="150" role="img" aria-label="A sudden loud bang. '+esc(nm)+' gets scared and runs off out of sight. Makayla stands alone on the path."></canvas></div>'+
 '<div class="qg-msg"><p>Just before the threshold door: <b>BANG.</b> A loud crack echoes off the stones. '+esc(nm)+' startles and bolts down the hill, out of sight.</p><p>Then the moment starts again. And again. The fog has caught it: a memory that keeps replaying the same scene. This is <b>The Replay</b>.</p><p class="qg-small">You can\'t erase what happened. What you can change is what you know and feel about it now: one different detail each time it replays. '+esc(nm)+' isn\'t lost; break the Replay and you\'ll find each other.</p></div>'+
 '<div class="qg-menu"><button type="button" class="qg-btn qg-primary" data-mgo>Face the memory</button><button type="button" class="qg-btn" data-about>How this fight works</button><button type="button" class="qg-btn" data-m>Not yet: back to the map</button></div>','[data-mgo]');
 dlg.querySelector('[data-mgo]').onclick=function(){memFight()};dlg.querySelector('[data-m]').onclick=map;dlg.querySelector('[data-about]').onclick=memAbout;
 say(nm+' got scared by a loud bang and ran away. The Replay begins.');loop(drawMem)}
function memAbout(){panel('<h2 id="qg-ph">About The Replay</h2><p>Some hard memories feel like they are happening again whenever they come up. Researchers call one way memories can change <b>memory reconsolidation</b>: when a memory is brought up (reactivated), it can briefly become open to updating. If something new and true is present at that moment, like safety, comfort, a more accurate meaning, or a calmer body, the memory can be stored again with that new learning.</p><p>The facts of what happened are not erased. What changes is how the memory feels and what it means. Therapies such as EMDR are thought to draw on this process, though researchers are still studying exactly how they work.</p><p><b>In this fight:</b> each loop the scene replays and you see its distress level (0 to 10, like the SUDS scale therapists use). Change one <em>different</em> detail each loop. Each change costs 2 Resolve (staying with a hard memory takes effort) and weakens the Replay. Trying to erase or avoid it won\'t work. Call Guide is free once every two loops. Rest gives +4 Resolve. You can step away to your Safe Place at any time; your progress stays.</p><p class="qg-small"><em>This is a game, not therapy. Working with real painful memories is best done with a trained clinician.</em></p>')}
function memFight(msg){var p=prog(),m=mem(p);if(!P)newPlayer();saveProg(p);SCENE='memory';dlg.dataset.scene='memory';dlg.dataset.menu='';MUS('boss');MEMA.flee=0;if(!MEMA.t0)MEMA.t0=performance.now();
 var s=memSuds(m),gr=m.cd<=0,sk=skillsReady();
 var opts=MEMD.map(function(d){return {d:d,x:0}}).concat(MEMX.map(function(d){return {d:d,x:1}}));opts.sort(function(a,b){return (a.d.id<b.d.id?-1:1)});
 body('<h2 id="qg-title" class="qg-bt">The Replay <small>a memory that keeps replaying</small></h2>'+safeHud()+'<p class="qg-phase">Loop '+m.loop+' · details changed '+m.used.length+'</p>'+
 '<div class="qg-stage battle"><canvas class="qg-cv qg-mcv" width="320" height="150" role="img" aria-label="Replay, loop '+m.loop+': a loud bang, and '+esc(petName())+' runs away. Distress '+s+' of 10.'+(m.used.length?' Changed: '+m.used.map(function(id){return MEMD.find(function(d){return d.id===id}).id}).join(', ')+'.':'')+'"></canvas></div>'+
 '<div class="qg-bars">'+hpBar('The Replay HP',m.hp,MEMHP,'e')+hpBar('Your Resolve',P.resolve,maxRes(p),'p')+'<div class="qg-bar qg-suds" role="meter" aria-label="Distress (SUDS)" aria-valuemin="0" aria-valuemax="10" aria-valuenow="'+s+'" aria-valuetext="Distress '+s+' of 10"><span>Distress <b>'+s+'</b>/10</span><i><em style="width:'+(s*10)+'%"></em></i></div></div>'+
 '<div class="qg-msg" id="qg-msg">'+(msg||'The scene replays: the bang, '+esc(petName())+' running, young Makayla frozen on the path. Notice it. Distress '+s+'/10. Now change one detail you haven\'t changed yet.')+'</div>'+
 '<div class="qg-list qg-mlist" role="group" aria-label="Change one detail">'+opts.map(function(o){var u=m.used.indexOf(o.d.id)>=0;return '<button type="button" class="qg-btn md" data-md="'+o.d.id+'"'+(u?' aria-disabled="true"':'')+'>'+esc(mdName(o.d))+'<small>'+(u?'already changed':o.x?'try it':'2 Resolve')+'</small></button>'}).join('')+'</div>'+
 '<div class="qg-cmd" role="group" aria-label="Other commands"><button type="button" class="qg-btn" data-mg'+(gr?'':' aria-disabled="true"')+'>Call Guide<small>'+(gr?'free · helps one loop':'resting '+m.cd+' loop'+(m.cd>1?'s':''))+'</small></button><button type="button" class="qg-btn" data-mr>Rest<small>+4 Resolve</small></button><button type="button" class="qg-btn" data-ms'+(sk.length?'':' aria-disabled="true"')+'>Special Skills<small>'+(sk.length?sk.length+' scroll'+(sk.length>1?'s':'')+' · clears half':'none ready')+'</small></button><button type="button" class="qg-btn" data-about>How this works</button></div>','.qg-mlist .qg-btn:not([aria-disabled])');
 safeHudWire();hpGrow();dlg.querySelector('[data-about]').onclick=memAbout;
 dlg.querySelectorAll('[data-md]').forEach(function(b){b.onclick=function(){if(b.getAttribute('aria-disabled')){say('You already changed that detail. Pick a different one this loop.');return}memAct(b.dataset.md)}});
 dlg.querySelector('[data-mr]').onclick=function(){P.resolve=Math.min(maxRes(),P.resolve+4);savePos();memFight('You rest and let the replay play in the background without engaging it. +4 Resolve.')};
 dlg.querySelector('[data-mg]').onclick=function(){if(mem().cd>0){say('Your guides are resting for '+mem().cd+' more loop'+(mem().cd>1?'s':'')+'.');return}memGuides()};
 dlg.querySelector('[data-ms]').onclick=function(){if(!skillsReady().length){say('No Special Skill scrolls ready.');return}memSkills()};
 loop(drawMem)}
function memUnused(m){return MEMD.filter(function(d){return m.used.indexOf(d.id)<0})}
function memApply(p,d,cost,extra){var m=mem(p);m.used.push(d.id);m.hp=Math.max(0,m.hp-1);m.loop++;if(m.cd>0)m.cd--;P.resolve=Math.max(0,P.resolve-cost);p.resolve=P.resolve;saveProg(p);MEMA.last=d.id;MEMA.t0=performance.now();MEMA.flash=500;SFX&&SFX('hit');
 if(m.hp<=0)return memBreak();var line=(extra||'')+'<b>Detail changed:</b> '+esc(typeof d.does==='function'?d.does():d.does)+'<br><em>'+esc(d.why)+'</em><br>The Replay weakens. It loops again; distress is now '+memSuds(m)+'/10.';
 if(P.resolve<=0)return memRegroup();memFight(line);say('Detail changed. '+(typeof d.does==='function'?d.does():d.does)+' Distress now '+memSuds(m)+' of 10.')}
function memAct(id){var p=prog(),m=mem(p),d=MEMD.find(function(x){return x.id===id});
 if(!d){var x=MEMX.find(function(y){return y.id===id});P.resolve=Math.max(0,P.resolve-2);p.resolve=P.resolve;m.loop++;if(m.cd>0)m.cd--;saveProg(p);MEMA.last=null;MEMA.t0=performance.now();if(P.resolve<=0)return memRegroup();memFight('<b>That doesn\'t work.</b> '+esc(x.note)+' (-2 Resolve.) The Replay is unchanged: distress still '+memSuds(m)+'/10.');say('That does not work. '+x.note);return}
 if(m.used.indexOf(id)>=0)return;memApply(p,d,d.cost)}
function memGuides(){dlg.dataset.menu='guides';var l=dlg.querySelector('.qg-mlist'),c=dlg.querySelector('.qg-cmd');c&&c.remove();var w=document.createElement('div');w.innerHTML=guideList('Choose who helps. They help you change one detail this loop: no Resolve cost.')+'<div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';l.replaceWith(w);faces();
 w.querySelector('[data-back]').onclick=function(){memFight()};w.querySelectorAll('[data-clin]').forEach(function(b){b.onclick=function(){var p=prog(),m=mem(p),k=clin(b.dataset.clin),d=memUnused(m)[0];if(!d)return;m.cd=3;BA.guide=k.id;BA.gT=1800;dailyEv&&dailyEv('guide',1);
  memApply(p,d,0,'<b>'+esc(k.name)+'</b> sits with you while the scene plays: "Let\'s stay with it together for a moment. You don\'t have to change what happened. Let\'s add what you know now."<br>')}});w.querySelector('.qg-btn').focus()}
function memSkills(){var l=dlg.querySelector('.qg-mlist'),c=dlg.querySelector('.qg-cmd');c&&c.remove();var w=document.createElement('div');var m=mem();
 w.innerHTML='<p class="qg-small">Each scroll works once and clears half of the Replay\'s current HP ('+Math.max(1,Math.floor(m.hp/2))+' now).</p><div class="qg-list" role="group" aria-label="Special Skills">'+skillsReady().map(function(id){var k=SKILLS[id];return '<button type="button" class="qg-btn sk" data-skill="'+id+'" style="--c:'+k.col+'">'+esc(k.name)+'<small>'+esc(k.full!==k.name?k.full:'one use')+'</small></button>'}).join('')+'</div><div class="qg-row"><button type="button" class="qg-btn" data-back>Back</button></div>';l.replaceWith(w);
 w.querySelector('[data-back]').onclick=function(){memFight()};w.querySelectorAll('[data-skill]').forEach(function(b){b.onclick=function(){var k=SKILLS[b.dataset.skill];w.innerHTML='<div class="qg-msg qg-skillinfo" role="region" aria-label="About '+esc(k.full)+'"><b>'+esc(k.name)+(k.full!==k.name?' <small>'+esc(k.full)+'</small>':'')+'</b><p>'+esc(k.text[0])+' '+esc(k.text[1])+'</p><p><em>In real life this is done with a trained clinician.</em></p><div class="qg-row"><button type="button" class="qg-btn" data-skgo>Continue</button></div></div>';var g=w.querySelector('[data-skgo]');g.focus();say(k.name+'. '+k.text.join(' '));
  g.onclick=function(){var p=prog(),m=mem(p),n=Math.max(1,Math.floor(m.hp/2)),ds=memUnused(m).slice(0,n);p.scrolls=p.scrolls||{};p.scrolls[b.dataset.skill]='used';p.usedLog=(p.usedLog||[]).concat([b.dataset.skill]);saveProg(p);
   ds.forEach(function(d,i){if(i<ds.length-1){m.used.push(d.id);m.hp--}});saveProg(p);memApply(prog(),ds[ds.length-1],0,'<b>'+esc(k.name)+'</b> helps you change '+n+' detail'+(n>1?'s':'')+' at once ('+ds.map(function(d){return esc(mdName(d))}).join('; ')+').<br>')}}});w.querySelector('.qg-btn').focus()}
function memRegroup(){var p=prog();p.resolve=maxRes(p);var L=REG.castle.lantern;p.region='castle';p.x=L.x;p.y=L.y;saveProg(p);P=null;newPlayer();SCENE='regroup';stopLoop();dlg.dataset.menu='';
 body('<h2 id="qg-title">Rest and Regroup</h2><p class="qg-lede">Staying with a hard memory takes a lot. Resting isn\'t losing. You wake by the lantern with full Resolve. Every detail you changed is still changed; the Replay waits where you left it.</p><div class="qg-menu"><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-m]');dlg.querySelector('[data-m]').onclick=map}
function memBreak(){var p=prog();p.memDone=1;if(p.petAway){p.pet=p.petAway;delete p.petAway}p.petReady=1;p.helped=p.helped||{};p.gxp=gxp(p)+2;saveProg(p);PET=null;SCENE='membreak';stopLoop();dlg.dataset.scene='memory';dlg.dataset.menu='';MUS('calm');MEMA={t0:performance.now(),reunion:1};var nm=petName();
 body('<h2 id="qg-title">The Replay breaks</h2><div class="qg-stage battle"><canvas class="qg-cv qg-mcv" width="320" height="150" role="img" aria-label="'+esc(nm)+' comes running back up the path and leaps into Makayla\'s arms. Warm light."></canvas></div>'+
 '<div class="qg-msg"><p>The loop stops. The memory is still there: there was a bang, and '+esc(nm)+' ran. It just doesn\'t grab you the same way. It feels like something that happened, not something happening now. Distress 1/10.</p><p>Then, from down the hill: paws on stone. <b>'+esc(nm)+' comes running back</b> and presses in close. You found each other.</p><p class="qg-small">From now on you can pet '+esc(nm)+' (the pet button, or click your pet) to recharge one used Special Skill. It\'s ready again after each cloud you clear.</p></div>'+
 '<div class="qg-menu"><button type="button" class="qg-btn qg-primary" data-on>Go on to the threshold door <small>the Fogstorm waits</small></button><button type="button" class="qg-btn" data-m>Back to the map</button></div>','[data-on]');
 dlg.querySelector('[data-on]').onclick=bossIntro;dlg.querySelector('[data-m]').onclick=map;say('The Replay breaks. '+nm+' comes back.');petSync();loop(drawMem)}
function drawMem(c,t,dt){var p=prog(),m=p.mem||{used:[],hp:MEMHP},U=function(id){return m.used.indexOf(id)>=0},e=t-(MEMA.t0||t),soft=U('soften'),rm=RM;function r(col,x,y,w,h){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h)}
 c.clearRect(0,0,320,150);var sky=MEMA.reunion?'#e9c98a':soft?'#7d6a8a':'#3b3550';r(sky,0,0,320,90);r(MEMA.reunion||soft?'#d99a6a':'#2d2a40',0,60,320,30);
 r('#5a5a6a',0,90,320,60);r('#6e6e7e',0,96,320,4);for(var i=0;i<16;i++)r('#4c4c5c',i*22+(i%2)*8,110+(i%3)*10,12,4);r('#3c6a3c',0,86,320,6);
 if(U('ended')||MEMA.reunion){r('rgba(255,235,170,.55)',250,14,22,22);r('rgba(255,235,170,.3)',246,10,30,30)}
 var cyc=MEMA.flee||MEMA.reunion?e:(e%5200),bang=!MEMA.reunion&&cyc>600&&cyc<900;
 if(bang){var a=soft?.12:.4;r('rgba(240,240,255,'+a+')',0,0,320,150);if(!rm||cyc<700){c.fillStyle=soft?'#c8b8d8':'#f4ecd8';c.font='bold '+(soft?10:16)+'px ui-monospace,monospace';c.fillText('BANG',soft?230:220,40)}}
 var kx=110,ky=74,sh=!MEMA.reunion&&!U('breath')&&cyc>800&&cyc<3000&&!rm?Math.round(Math.sin(t/40)):0;
 px(c,walkF(HERO.down||HERO.side,0),PAL,kx+sh,ky+(U('breath')&&!rm?Math.round(Math.sin(t/900)):0),{s:3});
 if(U('adult'))px(c,walkF(HERO.side,0),PAL,kx-52,ky-22,{s:4});
 if(U('breath')){c.fillStyle='rgba(159,211,230,.5)';var br=14+(rm?4:Math.sin(t/900)*5);for(var q=0;q<20;q++){var aa=q/20*6.283;c.fillRect(Math.round(kx+18+Math.cos(aa)*br),Math.round(ky+20+Math.sin(aa)*br),2,2)}}
 var id=p.pet||p.petAway;if(PETS[id]){var px0;if(MEMA.reunion){var k=Math.min(1,e/1800);px0=330-k*190;drawPet(c,id,px0,ky+22-(rm?0:Math.abs(Math.sin(k*12))*6*(1-k)),'left',Math.floor(t/120)%2,3);if(k>=1){c.fillStyle='#f08aa0';var hb=rm?0:Math.round(Math.sin(t/300)*2);[[0,1],[1,0],[2,1],[3,0],[4,1]].forEach(function(z){});r('#f08aa0',150,60+hb,3,3);r('#f08aa0',155,60+hb,3,3);r('#f08aa0',149,63+hb,10,3);r('#f08aa0',151,66+hb,6,2);r('#f08aa0',153,68+hb,2,2)}}
  else{var fl=cyc<800?0:Math.min(1,(cyc-800)/(rm?1:1400));px0=150+fl*200;if(px0<320)drawPet(c,id,px0,ky+22,'right',Math.floor(t/90)%2,3)}}
 c.font='9px ui-monospace,monospace';c.fillStyle='#f4ecd8';
 if(U('calm')&&!MEMA.reunion&&cyc>1600){r('#f4ecd8',kx+30,ky-16,74,14);c.fillStyle='#1a1a2b';c.fillText(petName()+'...',kx+34,ky-6)}
 if(U('words')&&!MEMA.reunion&&cyc>2600){r('#1a1a2b',8,8,200,24);c.fillStyle='#f4ecd8';c.fillText('"You\'re not alone. This will pass."',12,23)}
 if(U('meaning')&&!MEMA.reunion){c.fillStyle='#f3c95a';c.fillText('it was scared of the noise',8,146)}
 if(U('ended')&&!MEMA.reunion&&cyc>3600){c.fillStyle='#fff3c4';c.fillText('it ended. you are here now.',180,146)}
 if(!MEMA.reunion&&!MEMA.flee){var ov=soft?.0:.18*(m.hp/MEMHP);r('rgba(20,10,30,'+ov+')',0,0,320,150)}
 if(BA.guide&&BA.gT>0){BA.gT-=dt;r('#f4ecd8',257,94,54,54);r('#1a1a2b',258,95,52,52);px(c,faceRows(BA.guide),facePal(BA.guide),260,97,{s:3})}}
/* Safe Place HUD shortcut (map, battles, memory) */
function safeHud(){return '<button type="button" class="qg-btn qg-safehud" data-safehud aria-label="Go to your Safe Place now'+(SCENE==='battle'||SCENE==='memory'?' (step away from this fight; it waits for you)':'')+' and fully restore Resolve">Safe Place<small>'+(SCENE==='battle'||SCENE==='memory'?'step away · refill':'refill Resolve')+'</small></button>'}
function safeHudWire(){}
/* petting: recharge one used coping skill, once per cloud cleared */
function petSync(){if(!dlg)return;var p=prog(),b=dlg.querySelector('.qg-petbtn'),show=p.pet&&PETS[p.pet]&&p.memDone&&!/^(title|intro|petpick|welcome)$/.test(SCENE||'');
 if(!show){b&&(b.hidden=true);return}
 if(!b){b=document.createElement('button');b.type='button';b.className='qg-petbtn';b.innerHTML='<canvas width="48" height="40" aria-hidden="true"></canvas><span></span>';var host=dlg.querySelector('.qg-foot');host?host.parentNode.insertBefore(b,host):dlg.appendChild(b);b.onclick=function(){petPet()}}
 b.hidden=false;var nm=PETS[p.pet].name;b.classList.toggle('ready',!!p.petReady);b.querySelector('span').innerHTML='Pet '+esc(nm)+'<small>'+(p.petReady?'ready: recharge 1 skill':'clear a cloud to recharge')+'</small>';b.setAttribute('aria-label','Pet '+nm+(p.petReady?'. Ready: recharges one used Special Skill.':'. Recharge used; clear a cloud to make it ready again. You can still cuddle.'));petDrawBtn(0)}
var PETAN=null;
function petDrawBtn(k){var b=dlg.querySelector('.qg-petbtn canvas');if(!b)return;var c=b.getContext('2d'),p=prog(),id=p.pet;c.imageSmoothingEnabled=false;c.clearRect(0,0,48,40);if(!PETS[id])return;var cat=id==='kenneth',x=8,y=14,f=0;
 if(PETAN){if(cat){x=8+Math.round(Math.sin(k*Math.PI)*10);y=14-Math.round(Math.sin(k*Math.PI)*10);f=Math.floor(k*8)%2;c.fillStyle='#d04a6a';var yx=34-Math.round(k*20);c.fillRect(yx,30,6,6);c.fillStyle='#f08aa0';c.fillRect(yx+1,31,2,2);c.fillRect(yx+3,33,2,1)}
  else{x=8+Math.round(Math.min(1,k*3)*6);y=14;f=Math.floor(k*3)%2}
  c.fillStyle='#f08aa0';var hy=Math.round(10-k*8);c.fillRect(36,hy,3,3);c.fillRect(40,hy,3,3);c.fillRect(35,hy+3,9,2);c.fillRect(37,hy+5,5,2)}
 drawPet(c,id,x,y,'right',f,2)}
function petPet(){var p=prog();if(!p.pet||!p.memDone||PETAN)return;var nm=PETS[p.pet].name,cat=p.pet==='kenneth',rec=null;
 if(p.petReady){var log=(p.usedLog||[]).slice(),sc=p.scrolls||{};for(var i=log.length-1;i>=0;i--){if(sc[log[i]]==='used'){rec=log[i];break}}if(!rec){rec=SKORDER.slice().reverse().find(function(id){return sc[id]==='used'})||null}
  if(rec){sc[rec]='ready';p.scrolls=sc;p.petReady=0;var j=(p.usedLog||[]).lastIndexOf(rec);if(j>=0)p.usedLog.splice(j,1)}}
 saveProg(p);var line=cat?['Kenneth pounces on a yarn ball, rolls over, and purrs like a little engine.','Kenneth flicks his tail, chases it in a circle, then headbutts your hand.','Kenneth bats at your sleeve and purrs. Playtime fixes a lot.'][Math.floor(Math.random()*3)]:['Ragnar leans his whole weight into you and sits, calm and steady. Feel that? You\'re here.','Ragnar rests his head on your knee. Slow tail. Slow breath. In, and out.','Ragnar sits close and steady, solid as the ground under your feet.'][Math.floor(Math.random()*3)];
 var msg=line+(rec?' Recharged: '+SKILLS[rec].name+' scroll is ready again.':p.petReady?' Nothing needs recharging right now, but the cuddle still counts.':' (Recharge used; it is ready again after you clear a cloud. The cuddle still counts.)');
 toast(cat?'Purr...':'Lean in...');say(msg);var mm=dlg.querySelector('#qg-msg')||dlg.querySelector('#qg-status');if(mm)mm.innerHTML?(mm.innerHTML=esc(msg)):(mm.textContent=msg);PET_LAST=msg;
 var bt=dlg.querySelector('.qg-petbtn');bt&&bt.classList.add('cuddle');var t0=performance.now(),D=cat?1400:2200;PETAN=1;(function f(t){var k=Math.min(1,(t-t0)/D);if(RM)k=1;petDrawBtn(k);if(k<1)requestAnimationFrame(f);else{PETAN=null;bt&&bt.classList.remove('cuddle');petSync();var mm2=dlg.querySelector('#qg-msg');if(mm2&&SCENE==='battle'){}}})(t0)}
var PET_LAST='';

window.obcQuest={memIntro:memIntro,memFight:memFight,memAct:memAct,petPet:petPet,get susp(){return SUSP},petPick:petPick,pets:PETS,get pet(){return PET},get petJob(){return PETJOB},open:open,map:map,title:title,step:step,turn:turn,newBattle:newBattle,draw:draw,rightSpell:rightSpell,look:look,next:nextLine,office:office,officeScene:officeScene,bag:bag,intro:intro,
 encounter:function(id){var e=ENEMIES.find(function(x){return x.id===id})||ENEMIES[0];e&&encounter(e)},boss:function(ph){var p=prog();p.phase=ph||0;saveProg(p);startBattle(newBattle('boss',null,ph||0))},act:function(a,o){act(a,o)},
 go:function(k,x,y){if(!P)newPlayer();var r=REG[k];goRegion(k,x!=null?x:r.start.x,y!=null?y:r.start.y)},
 level:function(){return level()},growth:function(){return gxp()},extra:EXTRA,cards:CARDS,get battle(){return B},get player(){return P},get scene(){return SCENE},get enemies(){return ENEMIES},get talking(){return TALK&&{i:TALK.i,n:TALK.lines.length,who:TALK.lines[TALK.i].who}},regions:REG,load:load,safePlace:safePlace,mini:startMini,petLv:petLv,daily:function(){return dailyGet(prog())},dailyEv:dailyEv,outfits:OUTFITS,skills:SKILLS,get ba(){return BA}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
