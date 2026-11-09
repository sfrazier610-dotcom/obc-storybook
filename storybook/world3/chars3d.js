/* 3D cast for the default Vista look.
   Quaternius CC0 rigs, rendered with three.js into the existing 2D world.
   If WebGL is missing or a model has not loaded yet, the 2D figures stay. */
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/addons/loaders/GLTFLoader.js";

function webgl(){
  try{var c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl2")||c.getContext("webgl")))}catch(e){return false}
}
function still(){
  if(window.OBC_STILL)return true;
  try{if(localStorage.getItem("obcSbCalm")==="1")return true}catch(e){}
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

var FILES={
  hero:"models/hero.glb",
  amber:"models/amber.glb",
  scott:"models/scott.glb",
  shanna:"models/shanna.glb",
  abby:"models/abby.glb",
  aspen:"models/aspen.glb",
  amanda:"models/amanda.glb",
  makayla:"models/makayla.glb",
  villager_a:"models/villager_a.glb",
  villager_b:"models/villager_b.glb",
  villager_c:"models/villager_c.glb",
  pug:"models/pug.glb",
  alien:"models/alien.glb",
  mushroom:"models/mushroom.glb"
};
/* Amber is listed before Scott, matching the counselor order in the game. */
var CAST={amber:1,scott:1,shanna:1,abby:1,aspen:1,amanda:1,makayla:1};

var MOOD={
  calm:{clip:"Idle",shade:1,warm:0,fx:null},
  worried:{clip:"Idle",shade:.82,warm:0,fx:"scribble",speed:.55,look:.4},
  overwhelmed:{clip:"Walk_Carry",shade:.75,warm:0,fx:"pack",speed:.7,look:.25},
  withdrawn:{clip:"SitDown",shade:.7,warm:0,fx:"cloud",hold:.72,look:.9},
  panicked:{clip:"RecieveHit",shade:.88,warm:0,fx:"scribble",speed:1.35},
  exhausted:{clip:"Defeat",shade:.62,warm:0,fx:"cloud",hold:.78,look:.7},
  help:{clip:"Idle",shade:1,warm:.05,fx:null,wave:1},
  breath:{clip:"Idle",shade:1,warm:0,fx:"breath",speed:.4},
  support:{clip:"Victory",shade:1,warm:.18,fx:"leaves",speed:.8},
  recover:{clip:"Victory",shade:1,warm:.28,fx:"halo",speed:.85}
};
var FOG={
  fog:0xb7c3c8,anx:0xd5e4f4,ptsd:0xc9bdd4,rel:0xf0d0cc,ocd:0xe6d7b4,
  adhd:0xd5ecc4,ed:0xc9e4e0,grief:0xf0d2ae,hub:0xd7e7b8
};

function start(){
  var renderer,scene,cam,clockActs,shared=[],inst={},tex={},ready=false,ground,fx,frameMark=0,spent=0;
  var loader=new GLTFLoader();
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,preserveDrawingBuffer:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(1);
  renderer.setSize(160,210,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=false;
  renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();
  cam=new THREE.OrthographicCamera(-1,1,1,-1,0.05,30);
  cam.position.set(0.85,3.15,2.25);
  cam.lookAt(0,0.72,0);
  scene.add(new THREE.AmbientLight(0xfff6ea,0.62));
  var hemi=new THREE.HemisphereLight(0xfff1d2,0x6d8a48,0.55);scene.add(hemi);
  var dir=new THREE.DirectionalLight(0xfff4dc,1.25);
  dir.position.set(-2.4,6.2,3.2);
  scene.add(dir);
  var fill=new THREE.DirectionalLight(0xd7e6ff,0.35);fill.position.set(3,2,4);scene.add(fill);
  ground=new THREE.Mesh(new THREE.CircleGeometry(0.48,20),new THREE.MeshBasicMaterial({color:0x1c2418,transparent:true,opacity:.28}));
  ground.rotation.x=-Math.PI/2;ground.position.y=0.012;scene.add(ground);
  fx=makeFx();scene.add(fx.group);
  scene.fog=new THREE.Fog(0xd7e7b8,7.5,16);

  function makeFx(){
    var g=new THREE.Group();
    function blob(col,r){var m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshStandardMaterial({color:col,roughness:.7,metalness:0}));m.castShadow=false;return m}
    var cloud=new THREE.Group();
    [[0,0,0,.16],[-.16,.06,.04,.11],[.15,.04,-.02,.1]].forEach(function(p){var b=blob(0xb7bcc4,p[3]);b.position.set(p[0],p[1],p[2]);cloud.add(b)});
    cloud.position.set(0,1.92,0);
    var scribs=new THREE.Group();
    for(var i=0;i<3;i++){var t=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,6,10,.7+i*.2),new THREE.MeshBasicMaterial({color:0x6d7e98}));t.position.set((i-1)*.16,1.95+(i%2)*.08,0);t.rotation.z=i;scribs.add(t)}
    var feet=new THREE.Group();
    for(var f=0;f<3;f++){var e=new THREE.Mesh(new THREE.CircleGeometry(.07,10),new THREE.MeshBasicMaterial({color:0x5a4630,transparent:true,opacity:.45}));e.rotation.x=-Math.PI/2;e.position.set(-.18-f*.16,0.02,.15+f*.05);feet.add(e)}
    var split=new THREE.Group();
    [[.22,.08],[ -.2,.16]].forEach(function(p){var e=new THREE.Mesh(new THREE.CircleGeometry(.16,12),new THREE.MeshBasicMaterial({color:0x243028,transparent:true,opacity:.28}));e.rotation.x=-Math.PI/2;e.position.set(p[0],0.02,p[1]);split.add(e)});
    var pack=new THREE.Group();
    var sack=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),new THREE.MeshStandardMaterial({color:0x6b4428,roughness:.8}));
    sack.scale.set(1.15,1.05,.8);sack.position.set(-.22,1.15,.05);
    var bed=new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.22),new THREE.MeshStandardMaterial({color:0xc4a574,roughness:.75}));
    bed.position.set(-.05,1.48,.02);pack.add(sack,bed);
    var breath=new THREE.Mesh(new THREE.TorusGeometry(.16,.02,8,18),new THREE.MeshBasicMaterial({color:0x8fbf8a,transparent:true,opacity:.8}));
    breath.position.set(0,1.02,.2);
    var leaves=new THREE.Group();
    [[-.32,1.25,.05,.7],[.3,1.15,-.05,-.5],[.05,1.55,.12,.2]].forEach(function(p){var leaf=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshStandardMaterial({color:p[1]>1.4?0xc6e86a:0x4ea044,roughness:.6}));leaf.scale.set(1.8,.55,.3);leaf.position.set(p[0],p[1],p[2]);leaf.rotation.z=p[3];leaves.add(leaf)});
    var halo=new THREE.Group();
    var ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.035,8,28),new THREE.MeshBasicMaterial({color:0xffd078,transparent:true,opacity:.55}));
    ring.rotation.x=-Math.PI/2;ring.position.y=0.03;
    for(var k=0;k<5;k++){var sp=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:0xffe3a0}));var a=k/5*6.283;sp.position.set(Math.cos(a)*.62,0.18+ (k%2)*.25,Math.sin(a)*.62);sp.userData.a=a;halo.add(sp)}
    halo.add(ring);
    [cloud,scribs,feet,split,pack,breath,leaves,halo].forEach(function(o){o.visible=false;g.add(o)});
    return {group:g,cloud:cloud,scribs:scribs,feet:feet,split:split,pack:pack,breath:breath,leaves:leaves,halo:halo};
  }

  function liftMat(mat){
    if(!mat)return;
    mat.metalness=0.02;mat.roughness=Math.min(0.85,Math.max(0.45,mat.roughness||0.7));
    var c=mat.color,max=Math.max(c.r,c.g,c.b),name=(mat.name||"").toLowerCase();
    var skin=name.indexOf("skin")>=0||name==="black"||name==="face"||name==="beige"||name==="brown";
    if(!skin&&max>0.012&&max<0.42)c.multiplyScalar(Math.min(5.5,0.62/max));
    mat.userData.base=c.clone();
  }
  function fitRig(rig){
    rig.updateMatrixWorld(true);
    var box=new THREE.Box3().setFromObject(rig);
    var h=Math.max(0.001,box.max.y-box.min.y);
    rig.scale.multiplyScalar(1.65/h);
    rig.updateMatrixWorld(true);
    box.setFromObject(rig);
    rig.position.y-=box.min.y;
    rig.updateMatrixWorld(true);
    box.setFromObject(rig);
    var c=box.getCenter(new THREE.Vector3());
    rig.position.x-=c.x;rig.position.z-=c.z;
  }
  function addBook(holder,color){
    var g=new THREE.Group();
    var cover=new THREE.Mesh(new THREE.BoxGeometry(.2,.26,.055),new THREE.MeshStandardMaterial({color:color||0x6b3a22,roughness:.72}));
    var page=new THREE.Mesh(new THREE.BoxGeometry(.15,.2,.012),new THREE.MeshStandardMaterial({color:0xf4e6c8,roughness:.85}));
    page.position.z=.03;
    var band=new THREE.Mesh(new THREE.BoxGeometry(.21,.045,.06),new THREE.MeshStandardMaterial({color:0xa33b3b,roughness:.6}));
    band.position.y=.06;
    g.add(cover,page,band);
    g.position.set(.32,.78,.16);g.rotation.z=-.35;g.rotation.y=.4;
    holder.add(g);return g;
  }

  var keys=Object.keys(FILES);
  var left=keys.length;
  keys.forEach(function(kind){
    loader.load(FILES[kind],function(gltf){
      var rig=gltf.scene;
      rig.traverse(function(o){if(o.isMesh){o.frustumCulled=false;var mats=[].concat(o.material);mats.forEach(liftMat);if(kind==="alien"||kind==="mushroom"){if(!tex[kind]){tex[kind]=new THREE.TextureLoader().load("models/"+kind+".png");tex[kind].colorSpace=THREE.SRGBColorSpace;tex[kind].flipY=false}mats.forEach(function(m){m.map=tex[kind];m.color.set(0xffffff);m.userData.base=m.color.clone();m.needsUpdate=true})}}});
      fitRig(rig);
      var holder=new THREE.Group();holder.add(rig);holder.visible=false;
      if(kind==="hero")addBook(holder,0x6b3a22);
      var mixer=new THREE.AnimationMixer(holder);
      var own={};
      (gltf.animations||[]).forEach(function(cl){own[cl.name.split("|").pop()]=cl});
      if(kind==="hero")shared=own;
      inst[kind]={holder:holder,mixer:mixer,own:own,arm:rig.getObjectByName("UpperArm.R"),fore:rig.getObjectByName("LowerArm.R"),head:rig.getObjectByName("Head"),cur:""};
      scene.add(holder);
      if(--left===0){ready=true;hook();paintStates()}
    },undefined,function(){if(--left===0){ready=true;hook();paintStates()}});
  });

  function clipOf(it,name){
    return it.own[name]||shared[name]||it.own.Idle||shared.Idle||null;
  }
  function applyPose(it,pose,time){
    var clip=clipOf(it,pose.clip||"Idle");
    if(clip&&it.cur!==clip.name){it.mixer.stopAllAction();var act=it.mixer.clipAction(clip);act.enabled=true;act.play();it.cur=clip.name;it.clip=clip}
    var dur=it.clip?it.clip.duration:1;
    var q=still()||pose.quiet;
    var tt=pose.hold!=null?dur*pose.hold:(q?dur*0.15:(time* (pose.speed||1))%dur);
    it.mixer.setTime(tt);
    if(pose.look&&it.head)it.head.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), pose.look));
    if(pose.wave&&it.arm){
      it.arm.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2,0.15,-1.7)));
      if(it.fore)it.fore.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35,0,0.15)));
      it.arm.updateMatrixWorld(true);
    }
    it.holder.traverse(function(o){if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.base){var mats=[].concat(o.material);mats.forEach(function(m){if(!m.userData.base)return;m.color.copy(m.userData.base);if(pose.shade&&pose.shade!==1)m.color.multiplyScalar(pose.shade);if(pose.warm)m.color.lerp(new THREE.Color(0xffe0b0),pose.warm);if(pose.tint)m.color.copy(pose.tint)})}});
  }
  function showFx(name,time,q){
    ["cloud","scribs","feet","split","pack","breath","leaves","halo"].forEach(function(k){fx[k].visible=(k===name)});
    if(name==="halo")fx.halo.visible=true;
    if(name==="leaves"){fx.leaves.visible=true}
    if(!q&&name==="scribs")fx.scribs.rotation.y=time;
    if(!q&&name==="breath"){var s=1+Math.sin(time*3)*.18;fx.breath.scale.set(s,s,s)}
    else if(name==="breath")fx.breath.scale.set(1,1,1);
    if(!q&&name==="halo")fx.halo.children.forEach(function(ch,i){if(!ch.userData||ch.userData.a==null)return;var a=ch.userData.a+time*0.8;ch.position.x=Math.cos(a)*.62;ch.position.z=Math.sin(a)*.62});
    if(name==="pack"||name==="cloud"){}
  }
  function frameCam(w,h){
    var aspect=w/Math.max(1,h),halfH=1.22,halfW=halfH*aspect;
    cam.left=-halfW;cam.right=halfW;cam.top=halfH*1.05;cam.bottom=-halfH*0.92;
    cam.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function renderKind(kind,pose,time,w,h,yaw,fogHex,fresh){
    var it=inst[kind];if(!it)return null;
    var now=performance.now();
    if(now-frameMark>14){frameMark=now;spent=0}
    if(!fresh&&it.copy&&it.copy.width===w&&it.copy.height===h&&spent>7&&now-it.lastT<280)return it.copy;
    var t0=performance.now();
    Object.keys(inst).forEach(function(k){inst[k].holder.visible=k===kind});
    it.holder.rotation.y=yaw||0;
    applyPose(it,pose,time);
    showFx(pose.fx,time,pose.quiet);
    if(pose.fx2){fx[pose.fx2].visible=true}
    scene.fog.color.setHex(fogHex==null?0xd7e7b8:fogHex);
    frameCam(w,h);
    renderer.render(scene,cam);
    fx.group.children.forEach(function(ch){ch.visible=false});
    if(!it.copy)it.copy=document.createElement("canvas");
    if(it.copy.width!==w||it.copy.height!==h){it.copy.width=w;it.copy.height=h}
    var bx=it.copy.getContext("2d");bx.imageSmoothingEnabled=false;bx.clearRect(0,0,w,h);bx.drawImage(renderer.domElement,0,0,w,h);
    it.lastT=performance.now();spent+=it.lastT-t0;
    return it.copy;
  }
  function blit(c,el,x,y,dw,dh){
    var sm=c.imageSmoothingEnabled;
    c.imageSmoothingEnabled=false;
    c.drawImage(el,x-dw/2,y-dh,dw,dh);
    c.imageSmoothingEnabled=sm;
  }
  function heroMood(){
    if(window.OBC_MOOD)return window.OBC_MOOD;
    var B=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();
    if(!B||!B.d)return "calm";
    var br=document.getElementById("b-br");
    if(br&&!br.hidden)return "breath";
    if(B.asking||document.querySelector(".w-pc"))return "help";
    var prog=B.max?(B.d.gentle?(B.max-B.hp)/B.max:1-B.hp/B.max):0;
    if(prog>=.62)return "recover";
    if(prog>=.28)return "support";
    var id=B.id;
    if(id==="anx"&&((B.worries|0)>=2||B.hope<=4))return "panicked";
    if(id==="fog")return B.hope<=4?"exhausted":"withdrawn";
    if(id==="ocd")return "overwhelmed";
    if(id==="ptsd")return "withdrawn";
    if(id==="grief"||id==="ed")return "exhausted";
    return "worried";
  }
  function poseFor(state,moving,quiet){
    var m=Object.assign({quiet:quiet},MOOD[state]||MOOD.calm);
    if(moving&&state!=="overwhelmed"&&state!=="withdrawn"&&state!=="exhausted"){m.clip=moving>1.4?"Walk":"Walk";m.speed=(moving>1.4?1.85:1.15);m.hold=null;if(state==="calm"||state==="worried")m.fx=null}
    return m;
  }
  function kindFor(p){
    var w=p&&p.who||"";
    if(w==="hero")return "hero";
    if(CAST[w]&&inst[w])return w;
    var n=0;for(var i=0;i<w.length;i++)n=(n+w.charCodeAt(i))%3;
    return ["villager_a","villager_b","villager_c"][n];
  }
  function yawOf(dir){
    if(dir===1)return Math.PI;
    if(dir===2)return Math.PI/2;
    if(dir===3)return -Math.PI/2;
    return 0;
  }
  function fogHex(){
    var id=window.obcWorld3&&obcWorld3.scr&&obcWorld3.scr()||"";
    var k=id.replace(/\d+$/,"");
    if(k==="hub"||k==="cross"||k==="woods"||k==="town")k="hub";
    return FOG[k]==null?0xd7e7b8:FOG[k];
  }
  function drawFig(c,x,y,h,p,t,flip,E){
    if(!ready||!inst.hero)return false;
    var quiet=!!(E&&E.RM)||still();
    var hero=p.who==="hero";
    var state=hero?heroMood():"calm";
    var moving=!quiet&&(p.walk||0)>0.25&&(MOOD[state].hold==null);
    var pose=poseFor(state,moving&&state!=="exhausted"&&state!=="withdrawn"?1:0,quiet);
    if(moving&&(state==="calm"||state==="worried"||state==="panicked"||state==="support"||state==="recover"||state==="help")){pose.clip="Walk";pose.speed=state==="panicked"?1.7:1.15;pose.hold=null}
    var fit=(window.OBC_PIX&&window.OBC_PIX.fig)||1;
    var dh=Math.max(28,h*fit*0.98),dw=dh*0.72;
    var rw=Math.max(48,Math.min(220,Math.round(dw))),rh=Math.max(64,Math.min(280,Math.round(dh)));
    var el=renderKind(kindFor(p),pose,(t||0)/1000,rw,rh,yawOf(p.dir!=null?p.dir:(flip?3:0)),fogHex(),hero);
    if(!el)return false;
    blit(c,el,x,y,dw,dh);
    if(hero)window.OBC_MOOD_NOW=state;
    return true;
  }
  function drawPet(c,x,y,i,dir,t,E){
    if(!ready||!inst.pug)return false;
    var quiet=!!(E&&E.RM)||still();
    var pose={clip:(!quiet&&dir!=null)?"Walk":"Idle",speed:.9,shade:1,warm:i===0?.35:0,fx:null,quiet:quiet};
    if(i===0)pose.warm=.2;
    var el=renderKind("pug",pose,(t||0)/1000,120,120,yawOf(dir),fogHex());
    if(!el)return false;
    blit(c,el,x,y,34,40);
    return true;
  }
  function drawCloud(c,x,y,r,col,t,boss,hap,E){
    var kind=boss?"alien":"mushroom";
    if(!ready||!inst[kind])return false;
    var quiet=!!(E&&E.RM)||still();
    var hq=hap===true?1:Math.max(0,Math.min(1,+hap||0));
    var B=window.obcWorld3&&obcWorld3.B&&obcWorld3.B();
    if(B&&boss&&B.max)hq=Math.max(hq,1-B.hp/Math.max(1,B.max));
    var pose={clip:hq>.62?"Yes":hq<.28?"HitRecieve":"Idle",speed:quiet?0:.8,shade:1,warm:0,fx:B&&B.id==="fog"?"cloud":null,quiet:quiet,hold:null,tint:new THREE.Color(0xffffff).lerp(new THREE.Color(hq<.5?0xb7c4ce:0xffe6b0), hq<.5?.45:(hq*.7))};
    if(!inst[kind].own[pose.clip])pose.clip="Idle";
    var el=renderKind(kind,pose,(t||0)/1000,boss?240:140,boss?220:130,0,fogHex(),!!boss);
    if(!el)return false;
    var dh=r*(boss?2.2:1.7),dw=dh;
    blit(c,el,x,y+r*.15,dw,dh);
    return true;
  }
  function drawMood(c,x,y,h,state){
    if(!ready||!inst.hero)return false;
    var pose=Object.assign({quiet:true},MOOD[state]||MOOD.calm);
    var dh=h*0.98,dw=dh*0.72;
    var el=renderKind("hero",pose,pose.hold!=null?0:0.4,Math.round(dw*2),Math.round(dh*2),0,0xd7e7b8,true);
    if(!el)return false;
    blit(c,el,x,y,dw,dh);
    return true;
  }
  function paintStates(){
    var cv=document.getElementById("w-sheet-cv");if(!cv||!ready)return;
    var names=["calm","worried","overwhelmed","withdrawn","panicked","exhausted","help","breath","support","recover"];
    var labels=["Calm","Worried","Overwhelmed","Withdrawn","Panicked","Exhausted","Asking for help","Grounding","Receiving support","Recovering"];
    var col=400,row=520,c=cv.getContext("2d");
    c.setTransform(1,0,0,1,0,0);c.fillStyle="#cfe8b0";c.fillRect(0,0,cv.width,cv.height);
    names.forEach(function(n,i){var x=24+col/2+(i%5)*col,y=(i<5?row:row*2)-28;c.fillStyle="#3a2412";c.font="600 22px system-ui,sans-serif";c.textAlign="center";c.fillText(labels[i],x,y+40);drawMood(c,x,y,330,n)});
    c.textAlign="left";
  }
  function hook(){
    var prev=window.OBC_CHARS||{};
    window.OBC_CHARS=Object.assign({},prev,{
      fig:function(c,x,y,h,p,t,flip,E){return drawFig(c,x,y,h,p,t,flip,E)||(prev.fig&&prev.fig(c,x,y,h,p,t,flip,E))},
      pet:function(c,x,y,i,dir,t,E){return drawPet(c,x,y,i,dir,t,E)||(prev.pet&&prev.pet(c,x,y,i,dir,t,E))},
      cloud:function(c,x,y,r,col,t,boss,hap,E){return drawCloud(c,x,y,r,col,t,boss,hap,E)||(prev.cloud&&prev.cloud(c,x,y,r,col,t,boss,hap,E))},
      moodDraw:function(c,x,y,h,state){return drawMood(c,x,y,h,state)||(prev.moodDraw&&prev.moodDraw(c,x,y,h,state))},
      v:"vista3d"
    });
    window.OBC_3D={ready:true};
    paintStates();
  }
  window.OBC_3D={ready:false};
}

if(!/[?&]art=/.test(location.search)&&webgl())start();
