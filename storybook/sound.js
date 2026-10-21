// Open Book sound engine. Every sound is synthesized live with the Web Audio API.
// There are no audio files or third-party recordings, so there are no licensing concerns.
(function(){
const LS='obc_sound_muted',LA='obc_ambience';let ctx=null,master=null,amb=null;const log=[];
const muted=()=>localStorage.getItem(LS)==='1';
function ensure(){if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();master=ctx.createGain();master.gain.value=muted()?0:.8;master.connect(ctx.destination);return ctx;}
function unlock(){const c=ensure();if(!c)return;if(c.state!=='running')c.resume();// iOS: play 1 silent sample inside the gesture
 const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);
 if(localStorage.getItem(LA)==='1')startAmb();load('page-turn').catch(()=>{});}
['pointerdown','touchend','keydown','click'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
function noise(d){const c=ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
function wrap(name,fn){return (...a)=>{const e={name,t:Date.now(),state:ctx?ctx.state:'none',muted:muted(),played:false};log.push(e);if(!ensure()||muted())return;
 const go=()=>{try{fn(...a);e.played=true;e.state=ctx.state;}catch(err){e.err=String(err);}};ctx.state==='running'?go():ctx.resume().then(go).catch(()=>{});};}
// Page flip: a filtered noise swish sweeping downward, then a soft paper slap
var synthFlip=function(){const t=ctx.currentTime;
 const n=noise(.45),bp=ctx.createBiquadFilter(),g=ctx.createGain();bp.type='bandpass';bp.Q.value=.9;bp.frequency.setValueAtTime(5200,t);bp.frequency.exponentialRampToValueAtTime(900,t+.32);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.55,t+.06);g.gain.setValueAtTime(.4,t+.18);g.gain.exponentialRampToValueAtTime(.001,t+.42);n.connect(bp).connect(g).connect(master);n.start(t);
 // flutter (paper rustle)
 const n2=noise(.3),hp=ctx.createBiquadFilter(),g2=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();hp.type='highpass';hp.frequency.value=2500;lfo.frequency.value=28;lg.gain.value=.12;lfo.connect(lg).connect(g2.gain);
 g2.gain.setValueAtTime(.12,t+.05);g2.gain.exponentialRampToValueAtTime(.001,t+.33);n2.connect(hp).connect(g2).connect(master);n2.start(t+.04);lfo.start(t);lfo.stop(t+.4);
 const n3=noise(.08),lp=ctx.createBiquadFilter(),g3=ctx.createGain();lp.type='lowpass';lp.frequency.value=700;g3.gain.setValueAtTime(.5,t+.36);g3.gain.exponentialRampToValueAtTime(.001,t+.44);n3.connect(lp).connect(g3).connect(master);n3.start(t+.36);}
// Cover creak: a slowly wobbling, resonant sawtooth (an old leather and wood hinge), then a low thud
var creak=function(){const t=ctx.currentTime;const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),w=ctx.createOscillator(),wg=ctx.createGain();
 o.type='sawtooth';o.frequency.setValueAtTime(95,t);o.frequency.linearRampToValueAtTime(140,t+.6);o.frequency.linearRampToValueAtTime(80,t+1.1);w.frequency.value=14;wg.gain.value=18;w.connect(wg).connect(o.frequency);
 f.type='bandpass';f.frequency.value=900;f.Q.value=6;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.18,t+.15);g.gain.linearRampToValueAtTime(.1,t+.8);g.gain.exponentialRampToValueAtTime(.001,t+1.2);
 o.connect(f).connect(g).connect(master);o.start(t);w.start(t);o.stop(t+1.25);w.stop(t+1.25);
 const th=ctx.createOscillator(),tg=ctx.createGain();th.frequency.setValueAtTime(110,t+1.15);th.frequency.exponentialRampToValueAtTime(40,t+1.4);tg.gain.setValueAtTime(.5,t+1.15);tg.gain.exponentialRampToValueAtTime(.001,t+1.5);th.connect(tg).connect(master);th.start(t+1.15);th.stop(t+1.55);setTimeout(flip,1250);}
// Bell chime: inharmonic sine partials with an exponential decay
function bell(freq,at,vol=.25){const t=ctx.currentTime+at;[[1,1],[2.76,.45],[5.4,.25],[8.93,.12]].forEach(([m,a])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*a,t+.005);g.gain.exponentialRampToValueAtTime(.0005,t+1.6/Math.sqrt(m));o.connect(g).connect(master);o.start(t);o.stop(t+1.7);});}
function sparkleNoise(at,d){const t=ctx.currentTime+at,n=noise(d),hp=ctx.createBiquadFilter(),g=ctx.createGain();hp.type='highpass';hp.frequency.value=7000;g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+d);n.connect(hp).connect(g).connect(master);n.start(t);}
const PENT=[659.25,783.99,880,987.77,1174.66];
var chime=function(i){const f=PENT[(i??Math.floor(Math.random()*5))%5];bell(f,0);bell(f*1.5,.09,.12);sparkleNoise(0,.4);}
var flourish=function(){[523.25,659.25,783.99,1046.5,1318.5,1567.98].forEach((f,i)=>bell(f,i*.09,.2));bell(2093,.62,.15);sparkleNoise(.05,1.2);
 const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=261.63;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.3);g.gain.exponentialRampToValueAtTime(.001,t+2.2);o.connect(g).connect(master);o.start(t);o.stop(t+2.3);}
// ---- Recorded samples (page turn: public domain; fireplace: original synthesized loop) ----
const EXT=(()=>{const a=document.createElement('audio');return a.canPlayType('audio/ogg; codecs="vorbis"')?'ogg':'mp3';})();
const bufs={},loading={};function load(name){if(bufs[name])return Promise.resolve(bufs[name]);if(loading[name])return loading[name];if(!ensure())return Promise.reject();
 loading[name]=fetch(`audio/${name}.${EXT}`).then(r=>r.arrayBuffer()).then(ab=>new Promise((res,rej)=>ctx.decodeAudioData(ab,res,rej))).then(b=>{bufs[name]=b;log.push({name:'loaded:'+name+'.'+EXT,t:Date.now()});return b;});return loading[name];}
// Page flip: the recorded page turn with slight random pitch, level and tone each time, plus a faint airy whoosh
var flip=function(){const b=bufs['page-turn'];if(!b){load('page-turn').catch(()=>{});return synthFlip();}
 const t=ctx.currentTime,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=b;s.playbackRate.value=1.05+Math.random()*.22;
 f.type='highshelf';f.frequency.value=3500;f.gain.value=-4+Math.random()*6;g.gain.value=.75+Math.random()*.3;s.connect(f).connect(g).connect(master);s.start(t,Math.random()*.03);
 const n=noise(.5),bp=ctx.createBiquadFilter(),ng=ctx.createGain();bp.type='bandpass';bp.Q.value=.6;bp.frequency.setValueAtTime(600+Math.random()*300,t);bp.frequency.exponentialRampToValueAtTime(2200,t+.35);
 ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(.07,t+.18);ng.gain.exponentialRampToValueAtTime(.001,t+.5);n.connect(bp).connect(ng).connect(master);n.start(t);};
// Fireplace (off by default): seamless loop made by crossfading two players, with a 2.5 s fade-in and 1.5 s fade-out
const FIRE_VOL=.16;let fire=null;
function startAmb(){if(fire||!ensure())return;fire={bus:ctx.createGain(),srcs:[],timer:0,on:true};fire.bus.gain.value=0;fire.bus.connect(master);
 log.push({name:'fireplace-on',t:Date.now()});
 load('fireplace').then(b=>{if(!fire||!fire.on)return;const t0=ctx.currentTime;fire.bus.gain.setValueAtTime(0,t0);fire.bus.gain.linearRampToValueAtTime(FIRE_VOL,t0+2.5);
  const XF=2,trim=.12,seg=b.duration-2*trim;
  const play=at=>{const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;s.connect(g).connect(fire.bus);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(1,at+XF);
   g.gain.setValueAtTime(1,at+seg-XF);g.gain.linearRampToValueAtTime(0,at+seg);s.start(at,trim,seg);fire.srcs.push(s);if(fire.srcs.length>3)fire.srcs.shift();
   const next=at+seg-XF;fire.timer=setTimeout(()=>{if(fire&&fire.on)play(next);},Math.max(0,(next-ctx.currentTime-1)*1000));};
  play(ctx.currentTime+.05);log.push({name:'fireplace-playing',t:Date.now()});}).catch(e=>log.push({name:'fireplace-error',err:String(e)}));}
function stopAmb(){if(!fire)return;const f=fire;fire=null;f.on=false;clearTimeout(f.timer);const t=ctx.currentTime;f.bus.gain.cancelScheduledValues(t);f.bus.gain.setValueAtTime(f.bus.gain.value,t);f.bus.gain.linearRampToValueAtTime(0,t+1.5);
 setTimeout(()=>{f.srcs.forEach(s=>{try{s.stop()}catch(e){}});f.bus.disconnect();},1700);log.push({name:'fireplace-off',t:Date.now()});}
// UI
function ui(){const w=document.createElement('div');w.className='sound-ctl';w.innerHTML='<button id="snd-toggle" class="sbtn" aria-pressed="false"></button><button id="amb-toggle" class="sbtn" aria-pressed="false"></button>';document.body.appendChild(w);
 const st=document.getElementById('snd-toggle'),at=document.getElementById('amb-toggle');
 const paint=()=>{const m=muted();st.textContent=m?'🔇 Sound: off':'🔊 Sound: on';st.setAttribute('aria-pressed',String(!m));st.setAttribute('aria-label',m?'Sound effects off. Turn on':'Sound effects on. Turn off');
  const a=localStorage.getItem(LA)==='1';at.textContent=a?'🕯 Fireplace: on':'🕯 Fireplace: off';at.setAttribute('aria-pressed',String(a));};
 st.onclick=()=>{localStorage.setItem(LS,muted()?'0':'1');if(master)master.gain.value=muted()?0:.8;paint();if(!muted())setTimeout(()=>chime(2),30);};
 at.onclick=()=>{const on=localStorage.getItem(LA)!=='1';localStorage.setItem(LA,on?'1':'0');on?(ensure(),ctx.resume(),startAmb()):stopAmb();paint();};paint();}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',ui):ui();
flip=wrap('flip',flip);creak=wrap('creak',creak);chime=wrap('chime',chime);flourish=wrap('flourish',flourish);
window.obcSound={bufs,ext:EXT,fireOn:()=>!!(fire&&fire.on),flip,creak,chime,flourish,startAmb,stopAmb,log,get state(){return ctx?ctx.state:'none'},muted};
})();
