// Open Book sound engine. Every sound is synthesized live with the Web Audio API.
// There are no audio files or third-party recordings, so there are no licensing concerns.
(function(){
const LS='obc_sound_muted',LA='obc_ambience';let ctx=null,master=null,amb=null;const log=[];
const muted=()=>localStorage.getItem(LS)==='1';
function ensure(){if(ctx)return ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC();master=ctx.createGain();master.gain.value=muted()?0:.8;master.connect(ctx.destination);return ctx;}
function unlock(){const c=ensure();if(!c)return;if(c.state!=='running')c.resume();// iOS: play 1 silent sample inside the gesture
 const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0);
 if(localStorage.getItem(LA)==='1')startAmb();}
['pointerdown','touchend','keydown','click'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
function noise(d){const c=ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
function wrap(name,fn){return (...a)=>{const e={name,t:Date.now(),state:ctx?ctx.state:'none',muted:muted(),played:false};log.push(e);if(!ensure()||muted())return;
 const go=()=>{try{fn(...a);e.played=true;e.state=ctx.state;}catch(err){e.err=String(err);}};ctx.state==='running'?go():ctx.resume().then(go).catch(()=>{});};}
// Page flip: a filtered noise swish sweeping downward, then a soft paper slap
var flip=function(){const t=ctx.currentTime;
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
// Ambience (off by default): a soft brown-noise library hush plus random candle crackles
function startAmb(){if(amb||!ensure())return;log.push({name:'ambience-on',t:Date.now()});const c=ctx,len=c.sampleRate*4,b=c.createBuffer(1,len,c.sampleRate),a=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;a[i]=last*3;}
 const s=c.createBufferSource();s.buffer=b;s.loop=true;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=500;const g=c.createGain();g.gain.value=.08;s.connect(lp).connect(g).connect(master);s.start();
 const iv=setInterval(()=>{if(muted()||c.state!=='running')return;if(Math.random()<.6){const t=c.currentTime,n=noise(.02),f=c.createBiquadFilter(),cg=c.createGain();f.type='bandpass';f.frequency.value=1500+Math.random()*2500;cg.gain.setValueAtTime(.05+Math.random()*.08,t);cg.gain.exponentialRampToValueAtTime(.001,t+.03);n.connect(f).connect(cg).connect(master);n.start(t);}},180);
 amb={s,iv};}
function stopAmb(){if(!amb)return;amb.s.stop();clearInterval(amb.iv);amb=null;log.push({name:'ambience-off',t:Date.now()});}
// UI
function ui(){const w=document.createElement('div');w.className='sound-ctl';w.innerHTML='<button id="snd-toggle" class="sbtn" aria-pressed="false"></button><button id="amb-toggle" class="sbtn" aria-pressed="false"></button>';document.body.appendChild(w);
 const st=document.getElementById('snd-toggle'),at=document.getElementById('amb-toggle');
 const paint=()=>{const m=muted();st.textContent=m?'🔇 Sound: off':'🔊 Sound: on';st.setAttribute('aria-pressed',String(!m));st.setAttribute('aria-label',m?'Sound effects off. Turn on':'Sound effects on. Turn off');
  const a=localStorage.getItem(LA)==='1';at.textContent=a?'🕯 Ambience: on':'🕯 Ambience: off';at.setAttribute('aria-pressed',String(a));};
 st.onclick=()=>{localStorage.setItem(LS,muted()?'0':'1');if(master)master.gain.value=muted()?0:.8;paint();if(!muted())setTimeout(()=>chime(2),30);};
 at.onclick=()=>{const on=localStorage.getItem(LA)!=='1';localStorage.setItem(LA,on?'1':'0');on?(ensure(),ctx.resume(),startAmb()):stopAmb();paint();};paint();}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',ui):ui();
flip=wrap('flip',flip);creak=wrap('creak',creak);chime=wrap('chime',chime);flourish=wrap('flourish',flourish);
window.obcSound={flip,creak,chime,flourish,startAmb,stopAmb,log,get state(){return ctx?ctx.state:'none'},muted};
})();
