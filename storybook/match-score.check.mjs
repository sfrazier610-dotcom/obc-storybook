/* Locks Chapter I scoring: same weights as the pre-upgrade quiz, except telehealth
   does not apply in-person office points. Run: node storybook/match-score.check.mjs */
import fs from 'fs';
import vm from 'vm';
import assert from 'assert';

function el(){
 return {
  innerHTML:'', hidden:false,
  classList:{toggle(){},add(){},remove(){},contains(){return false}},
  addEventListener(){}, before(){}, setAttribute(){}, getAttribute(){return null},
  querySelector(){return null}, querySelectorAll(){return []},
  focus(){}, scrollIntoView(){}, hasAttribute(){return false}
 };
}
const allow=new Set(['#quiz','#q-concerns','#q-mods','#results']);
const store={};
const document={
 querySelector(s){ if(!allow.has(s)) return null; if(!store[s]) store[s]=el(); return store[s]; },
 getElementById(){return null},
 createElement(){return el()},
 documentElement:{classList:{contains(){return false},add(){},remove(){},toggle(){}}},
 addEventListener(){}
};
const context={document, console, matchMedia:()=>({matches:false})};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../shared/data.js', import.meta.url), 'utf8'), context, {filename:'data.js'});
vm.runInContext(fs.readFileSync(new URL('./quiet-shared.js', import.meta.url), 'utf8'), context, {filename:'quiet-shared.js'});

const D=context.OBC;
const C=D.concernLabels, M=D.modLabels;
const AGE={under8:'children under 8',child8:'children 8–12',teen:'teens',adult:'adults'};
function oldScore(c,a){
 let pts=0,max=0,why=[],gaps=[];
 a.concerns.forEach(x=>{max+=3;if(c.concerns.includes(x)){pts+=3;why.push(`Lists ${C[x]} (+3)`);}else gaps.push(`${C[x]} not listed`);});
 max+=2;if(c.ages===null||(c.agesPending&&!c.ages.includes(a.age)&&a.age!=='under8')){pts+=1;why.push('Age range not publicly listed (+1, confirm)');}else if(c.ages.includes(a.age)){pts+=2;why.push(`Works with ${AGE[a.age]}${c.agesLabel?' ('+c.agesLabel+')':''} (+2)`);}else gaps.push(`Doesn't list ${AGE[a.age]}`);
 max+=2;if(c.formats===null){pts+=1;why.push('Formats not publicly listed (+1, confirm)');}else if(c.formats.includes(a.format)){pts+=2;why.push(`Offers ${a.format} therapy (+2)`);}else gaps.push(`${a.format} therapy not listed`);
 if(a.setting&&a.setting!=='either'){max+=2;const sl=a.setting==='inperson'?'in-person sessions':'telehealth';if(!c.settings){pts+=1;why.push(`${sl} not confirmed (+1, confirm)`);}else if(c.settings.includes(a.setting)){pts+=2;why.push(`Offers ${sl} (+2)`);}else gaps.push(c.settings.length===1&&c.settings[0]==='telehealth'?'Telehealth only':`No ${sl}`);}
 if(a.office!=='either'){max+=2;const on=a.office==='bountiful'?'Bountiful':'Draper';const ip=c.settings&&c.settings.includes('inperson');if(c.offices&&c.offices.includes(a.office)&&ip){pts+=2;why.push(`Sees clients in ${on} (+2)`);}else gaps.push(!ip?'Telehealth only':`Not in the ${on} office`);}
 a.mods.forEach(m=>{max+=1;if(c.mods.includes(m)){pts+=1;why.push(`Uses ${M[m]} (+1)`);}else gaps.push(`${M[m]} not listed`);});
 return {pts,max,pct:Math.round(100*pts/max),why,gaps};
}
function same(neu, old){
 assert.deepEqual({pts:neu.pts,max:neu.max,pct:neu.pct,why:neu.why,gaps:neu.gaps}, old);
}
const score=context.obcScore;
assert.equal(D.clinicians.some(c=>c.id==='makayla'), false);
assert.equal(D.clinicians.length, 6);

const concernKeys=[].concat(
 ['trauma','anxiety','depression','relationships','grief','burnout'],
 ['abuse','shame','selfharm','addiction'],
 ['eating','bodyimage','ocd','adhd','autism','chronic','dysregulation'],
 ['family','attachment'],
 ['faith','lgbtq','personality'],
 ['highprofile','transitions']
);
assert.deepEqual(concernKeys.slice().sort(), Object.keys(C).slice().sort());
assert.equal(new Set(concernKeys).size, concernKeys.length);
const short=['EMDR','ART','CBT','TF-CBT','DBT','IFS','EFT','ACT','Play','Gottman'];
const more=Object.keys(M).filter(k=>short.indexOf(k)<0);
assert.deepEqual(short.concat(more).slice().sort(), Object.keys(M).slice().sort());
assert.equal(short.length+more.length, Object.keys(M).length);

const packs=[
 {concerns:['trauma','anxiety'],age:'adult',format:'individual',mods:['EMDR','IFS'],setting:'inperson',office:'draper',gender:'any'},
 {concerns:[],age:'adult',format:'individual',mods:[],setting:'either',office:'either',gender:'any'},
 {concerns:['grief'],age:'teen',format:'family',mods:['Play'],setting:'either',office:'bountiful',gender:'woman'},
 {concerns:['trauma'],age:'child8',format:'couples',mods:[],setting:'inperson',office:'either',gender:'any'},
 {concerns:['addiction'],age:'under8',format:'individual',mods:['CBT'],setting:'telehealth',office:'either',gender:'any'}
];
for(const a of packs){
 for(const c of D.clinicians){
  same(score(c,a), oldScore(c,a));
 }
}
for(const office of ['draper','bountiful']){
 const a={concerns:['trauma'],age:'adult',format:'individual',mods:['EMDR'],setting:'telehealth',office,gender:'any'};
 for(const c of D.clinicians){
  const neu=score(c,a), old=oldScore(c,a);
  const gained=old.why.some(w=>w.startsWith('Sees clients in '));
  assert.equal(neu.max, old.max-2, c.id+' max');
  assert.equal(neu.pts, old.pts-(gained?2:0), c.id+' pts');
  assert.equal(neu.why.some(w=>w.startsWith('Sees clients in ')), false);
  assert.equal(neu.gaps.some(g=>g==='Telehealth only'||/Not in the .+ office/.test(g)), false);
 }
}

const empty=context.obcResultsHtml({concerns:[],mods:[],age:'adult',format:'individual',setting:'either',office:'either',gender:'any'});
assert.match(empty.html, /Soft match/);
assert.doesNotMatch(empty.html, /Makayla/);
assert.match(empty.html, /Scott Frazier/);
assert.match(empty.html, /CMHC, CCTP/);
assert.doesNotMatch(empty.html, /psychiatrist/i);
assert.match(empty.html, /City Weekly Best of Utah 2026: Best Experiential Therapist, 1st place/);
assert.match(empty.html, /City Weekly Best of Utah 2026: Best Psychotherapist\/Counselor, 3rd place/);
assert.match(empty.html, /Call \(385\) 524-6665/);
assert.match(empty.html, /Meet in the Hall/);
assert.match(empty.html, /Begin with Scott/);
assert.match(empty.html, /href="#team"/);
assert.match(empty.html, /Retake/);

const tele=context.obcResultsHtml({concerns:['trauma'],mods:[],age:'adult',format:'individual',setting:'telehealth',office:'draper',gender:'any'});
assert.match(tele.html, /office points were not used/);
assert.doesNotMatch(tele.html, /Sees clients in person in Draper/);
assert.doesNotMatch(tele.html, /Makayla/);

const menUnder=context.obcResultsHtml({concerns:[],mods:[],age:'under8',format:'individual',setting:'either',office:'either',gender:'man'});
assert.match(menUnder.html, /Clear gender preference/);
assert.equal(menUnder.magical, false);
assert.doesNotMatch(menUnder.html, /class="portrait"/);

const ritual=fs.readFileSync(new URL('./match-ritual.js', import.meta.url), 'utf8');
const goAt=ritual.indexOf('function go(n, dir)');
const body=ritual.slice(goAt, ritual.indexOf('back.addEventListener'));
assert.ok(body.indexOf('n>qi') < body.lastIndexOf('qi=n'), 'direction is chosen before qi changes');
console.log('match score checks passed');
