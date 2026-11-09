/* Full KayKit scene for the default Vista look.
   Characters and the land are the same CC0 style, rendered with three.js.
   If WebGL is missing, the original 2D diorama stays. */
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkel } from "./vendor/three/addons/utils/SkeletonUtils.js";

function hasGL(){try{var c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl2")||c.getContext("webgl")))}catch(e){return false}}
function still(){if(window.OBC_STILL)return true;try{if(localStorage.getItem("obcSbCalm")==="1")return true}catch(e){}return matchMedia("(prefers-reduced-motion: reduce)").matches}

if(!/[?&]art=/.test(location.search)&&hasGL())boot();

var U=0.05;
function wp(x,y,h){return new THREE.Vector3((x-320)*U,(h||0),(y-208)*U)}
function hash(s){var n=2166136261;s=String(s||"x");for(var i=0;i<s.length;i++)n=Math.imul(n^s.charCodeAt(i),16777619);return n>>>0}

var ROLE={hero:"mage",amber:"rogue",scott:"knight",shanna:"rogue_hooded",abby:"barbarian",aspen:"rogue",amanda:"mage",makayla:"rogue_hooded"};
var TINT={hero:0xffffff,amber:0xfff4ea,scott:0xe7eef8,shanna:0xf3ecff,abby:0xffe8d4,aspen:0xe5f6ea,amanda:0xffe0ea,makayla:0xfff6d8,villager:0xffffff};
var MOOD={
 calm:{clip:"Idle"},
 worried:{clip:"Idle",fx:"scribble"},
 overwhelmed:{clip:"Walking_A",fx:"pack",speed:.55},
 withdrawn:{clip:"Sit_Floor_Idle",fx:"cloud"},
 panicked:{clip:"Hit_A",fx:"scribble",speed:1.3},
 exhausted:{clip:"Lie_Idle",fx:"cloud"},
 help:{clip:"Interact",hold:.62},
 breath:{clip:"Idle",fx:"breath",speed:.35},
 support:{clip:"Cheer",fx:"leaves",hold:.55},
 recover:{clip:"Cheer",fx:"halo",hold:.72}
};
 var FOG={
 fog:{c:0xd5ded8,n:22,f:46},
 anx:{c:0xd7e7f4,n:26,f:52},
 ptsd:{c:0xddd4e4,n:24,f:48},
 rel:{c:0xf6e4de,n:28,f:56},
 ocd:{c:0xf0e6cc,n:28,f:56},
 adhd:{c:0xe7f3d0,n:28,f:56},
 ed:{c:0xd8eee8,n:26,f:52},
 grief:{c:0xf6e4c8,n:26,f:52},
 hub:{c:0xe7f0c4,n:30,f:60}
};

function boot(){
  var renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"high-performance"});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=false;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  renderer.setClearColor(0xc5e09a,1);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(38,1,0.08,80);
  var sheetCam=new THREE.PerspectiveCamera(32,1,0.08,40);
  scene.add(new THREE.AmbientLight(0xfff4e4,0.55));
  scene.add(new THREE.HemisphereLight(0xfff6dd,0x6a8a45,0.72));
  var dir=new THREE.DirectionalLight(0xfff1d4,1.35);
  scene.add(dir);scene.add(dir.target);
  scene.fog=new THREE.Fog(0xe7f0c4,16,38);
  var world=new THREE.Group();scene.add(world);
  var actors=new THREE.Group();scene.add(actors);
  var loader=new GLTFLoader();
  var geo={},matTex=null,chars={},shared={},pool={},fx=null,pets={},clouds=[];
  var built="",dummy=new THREE.Object3D(),ready=false;
  var ray=new THREE.Raycaster(),groundPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();

  function prepMat(root){
    root.traverse(function(o){
      if(!o.isMesh)return;
      var mats=[].concat(o.material);
      mats.forEach(function(m){
        m.metalness=0;m.roughness=0.84;
        if(m.map)m.map.colorSpace=THREE.SRGBColorSpace;
      });
    });
  }
  function grab(gltf){
    gltf.scene.updateMatrixWorld(true);
    var found=null;
    gltf.scene.traverse(function(o){if(!found&&o.isMesh)found=o});
    if(!found)return null;
    var g=found.geometry.clone();
    g.applyMatrix4(found.matrixWorld);
    g.computeBoundingBox();
    return {geometry:g,material:found.material};
  }
  function fitChar(root){
    root.updateMatrixWorld(true);
    var box=new THREE.Box3().setFromObject(root),h=Math.max(0.001,box.max.y-box.min.y);
    root.scale.setScalar(1.62/h);
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    root.position.y-=box.min.y;
    root.updateMatrixWorld(true);
    box.setFromObject(root);
    var c=box.getCenter(new THREE.Vector3());
    root.position.x-=c.x;root.position.z-=c.z;
  }
  function dress(root,role){
    root.traverse(function(o){
      var n=o.name||"";
      if(/sword|axe|bow|shield|knife|dagger|staff|wand|crossbow|quiver|throw|badge/i.test(n))o.visible=false;
      if(/helmet/i.test(n))o.visible=false;
      if(role==="hero"){if(/spellbook_open/i.test(n))o.visible=false}
      else if(/spellbook/i.test(n))o.visible=false;
      if(role==="amanda"&&/hat/i.test(n))o.visible=false;
      if(o.isMesh){o.castShadow=false;o.receiveShadow=false;o.frustumCulled=false}
    });
    var tint=TINT[role]||TINT.villager;
    if(tint!==0xffffff){
      root.traverse(function(o){
        if(!o.isMesh)return;
        [].concat(o.material).forEach(function(m){if(!m.userData.base)m.userData.base=m.color.clone();m.color.copy(m.userData.base).multiply(new THREE.Color(tint))});
      });
    }
  }
  function makeFx(){
    var g=new THREE.Group();
    function sphere(col,r){return new THREE.Mesh(new THREE.SphereGeometry(r,10,8),new THREE.MeshStandardMaterial({color:col,roughness:.65,metalness:0}))}
    var cloud=new THREE.Group();
    [[0,.1,0,.18],[-.16,.16,.02,.12],[.15,.14,-.02,.11]].forEach(function(p){var b=sphere(0xb7bec6,p[3]);b.position.set(p[0],p[1],p[2]);cloud.add(b)});
    cloud.position.y=1.85;
    var scribs=new THREE.Group();
    for(var i=0;i<3;i++){var t=new THREE.Mesh(new THREE.TorusGeometry(.1,.016,6,12,1.2),new THREE.MeshBasicMaterial({color:0x6d7e98}));t.position.set((i-1)*.18,1.95,0);t.rotation.z=i*.6;scribs.add(t)}
    var feet=new THREE.Group();
    for(var f=0;f<3;f++){var e=new THREE.Mesh(new THREE.CircleGeometry(.07,8),new THREE.MeshBasicMaterial({color:0x5c4632,transparent:true,opacity:.4}));e.rotation.x=-Math.PI/2;e.position.set((f-1)*.18,0.02,.28);feet.add(e)}
    var split=new THREE.Group();
    [[.28,.1],[-.26,.18]].forEach(function(p){var e=new THREE.Mesh(new THREE.CircleGeometry(.16,10),new THREE.MeshBasicMaterial({color:0x243028,transparent:true,opacity:.33}));e.rotation.x=-Math.PI/2;e.position.set(p[0],0.02,p[1]);split.add(e)});
    var pack=new THREE.Group();
    var sack=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshStandardMaterial({color:0x6b4428,roughness:.8}));
    sack.scale.set(1.1,.9,.75);sack.position.set(0,1.05,-.28);
    var roll=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.16),new THREE.MeshStandardMaterial({color:0xc4a574,roughness:.75}));
    roll.position.set(.02,1.32,-.18);pack.add(sack,roll);
    var breath=new THREE.Mesh(new THREE.TorusGeometry(.18,.018,6,16),new THREE.MeshBasicMaterial({color:0x8fbf8a,transparent:true,opacity:.85}));
    breath.position.set(0,1.05,.22);
    var leaves=new THREE.Group();
    [[-.34,1.2,.08,.6],[.32,1.15,-.04,-.5],[0,1.55,.1,.2]].forEach(function(p){var leaf=sphere(p[1]>1.4?0xc6e86a:0x3e9a40,.07);leaf.scale.set(1.7,.5,.35);leaf.position.set(p[0],p[1],p[2]);leaf.rotation.z=p[3];leaves.add(leaf)});
    var halo=new THREE.Group();
    var ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.03,6,24),new THREE.MeshBasicMaterial({color:0xffd078,transparent:true,opacity:.7}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.04;
    for(var k=0;k<5;k++){var sp=sphere(0xffe6a8,.045);var a=k/5*6.283;sp.position.set(Math.cos(a)*.7,.2+(k%2)*.22,Math.sin(a)*.7);sp.userData.a=a;halo.add(sp)}
    halo.add(ring);
    [cloud,scribs,feet,split,pack,breath,leaves,halo].forEach(function(o){o.visible=false;g.add(o)});
    return {group:g,cloud:cloud,scribs:scribs,feet:feet,split:split,pack:pack,breath:breath,leaves:leaves,halo:halo};
  }
  function makePet(cat){
    var g=new THREE.Group();
    var fur=new THREE.MeshStandardMaterial({color:cat?0xe0903a:0x8a6844,roughness:.7});
    var body=new THREE.Mesh(new THREE.SphereGeometry(.28,12,10),fur);body.scale.set(1.3,.75,1);body.position.y=.28;
    var head=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),fur);head.position.set(0,.48,.16);
    var eye=new THREE.MeshStandardMaterial({color:0x2a241c,roughness:.5});
    var e1=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),eye);e1.position.set(-.06,.5,.28);
    var e2=e1.clone();e2.position.x=.06;
    g.add(body,head,e1,e2);
    if(cat){var ear=new THREE.Mesh(new THREE.ConeGeometry(.05,.1,4),fur);ear.position.set(-.08,.64,.12);var ear2=ear.clone();ear2.position.x=.08;g.add(ear,ear2);
      var cape=new THREE.Mesh(new THREE.BoxGeometry(.22,.16,.04),new THREE.MeshStandardMaterial({color:0xb43232,roughness:.6}));cape.position.set(0,.4,-.12);g.add(cape)}
    else{var collar=new THREE.Mesh(new THREE.TorusGeometry(.1,.02,6,10),new THREE.MeshStandardMaterial({color:0x2a4a88,roughness:.5}));collar.rotation.x=Math.PI/2;collar.position.set(0,.4,.05);g.add(collar)}
    g.traverse(function(o){if(o.isMesh)o.castShadow=true});
    g.scale.setScalar(.85);
    return g;
  }
  function makeSign(){
    var g=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x8a5a32,roughness:.8});
    var post=new THREE.Mesh(new THREE.BoxGeometry(.08,.75,.08),wood);post.position.y=.38;
    var board=new THREE.Mesh(new THREE.BoxGeometry(.62,.34,.06),new THREE.MeshStandardMaterial({color:0xf0e2c0,roughness:.7}));board.position.y=.78;
    g.add(post,board);return g;
  }
  function makeLantern(){
    var g=new THREE.Group();
    var post=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,.95,6),new THREE.MeshStandardMaterial({color:0x4a3428,roughness:.75}));post.position.y=.48;
    var lamp=new THREE.Mesh(new THREE.BoxGeometry(.24,.3,.24),new THREE.MeshStandardMaterial({color:0xffe6b0,emissive:0x000000,roughness:.45}));lamp.position.y=1.05;
    g.add(post,lamp);g.userData.lamp=lamp;return g;
  }

  var jobs=[
    ["grass","models/kaykit/med/tiles/base/hex_grass.gltf"],
    ["water","models/kaykit/med/tiles/base/hex_water.gltf"],
    ["slope","models/kaykit/med/tiles/base/hex_grass_sloped_high.gltf"],
    ["road","models/kaykit/med/tiles/roads/hex_road_A.gltf"],
    ["tree","models/kaykit/med/decoration/nature/tree_single_A.gltf"],
    ["tree2","models/kaykit/med/decoration/nature/tree_single_B.gltf"],
    ["rock","models/kaykit/med/decoration/nature/rock_single_A.gltf"],
    ["rock2","models/kaykit/med/decoration/nature/rock_single_B.gltf"],
    ["hill","models/kaykit/med/decoration/nature/hill_single_A.gltf"],
    ["cloud","models/kaykit/med/decoration/nature/cloud_small.gltf"],
    ["cloudbig","models/kaykit/med/decoration/nature/cloud_big.gltf"],
    ["plant","models/kaykit/med/decoration/nature/waterplant_A.gltf"],
    ["fence","models/kaykit/med/buildings/neutral/fence_wood_straight.gltf"],
    ["barrel","models/kaykit/med/decoration/props/barrel.gltf"],
    ["crate","models/kaykit/med/decoration/props/crate_A_small.gltf"],
    ["homeA","models/kaykit/med/buildings/blue/building_home_A_blue.gltf"],
    ["homeB","models/kaykit/med/buildings/yellow/building_home_B_yellow.gltf"]
  ];
  var charFiles={mage:"mage.glb",knight:"knight.glb",rogue:"rogue.glb",rogue_hooded:"rogue_hooded.glb",barbarian:"barbarian.glb"};
  var left=jobs.length+Object.keys(charFiles).length;
  function doneOne(){if(--left===0)finish()}
  jobs.forEach(function(pair){
    loader.load(pair[1],function(g){prepMat(g.scene);geo[pair[0]]=pair[0].indexOf("home")===0?g.scene:grab(g);doneOne()},undefined,doneOne);
  });
  Object.keys(charFiles).forEach(function(k){
    loader.load("models/kaykit/chars/"+charFiles[k],function(g){
      prepMat(g.scene);
      if(k==="mage")g.animations.forEach(function(c){shared[c.name]=c});
      dress(g.scene,k==="mage"?"hero":k);
      fitChar(g.scene);
      chars[k]=g.scene;
      doneOne();
    },undefined,doneOne);
  });

  function instMesh(key,max){
    var src=geo[key];if(!src)return null;
    var m=new THREE.InstancedMesh(src.geometry,src.material,max);
    m.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    m.receiveShadow=false;m.castShadow=false;
    m.count=0;m.frustumCulled=false;
    return m;
  }
  function stamp(mesh,i,x,y,z,ry,s){
    dummy.position.set(x,y,z);
    dummy.rotation.set(0,ry||0,0);
    dummy.scale.set(s||1,s||1,s||1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i,dummy.matrix);
  }
  function grid(mesh,x0,x1,z0,z1,sx,sz,y){
    var i=mesh.count,row=0;
    for(var z=z0;z<=z1;z+=sz,row++){
      var ox=row%2?sx*0.5:0;
      for(var x=x0+ox;x<=x1;x+=sx){
        if(i>=mesh.instanceMatrix.count)return;
        stamp(mesh,i++,x,y,z,0,1);
      }
    }
    mesh.count=i;
  }
  function exitsOf(s){
    var api=window.obcWorld3,SC=api&&api.SC,at=s.at||[9,9],has=function(x,y){if(!SC)return false;for(var k in SC){var a=SC[k]&&SC[k].at;if(a&&a[0]===x&&a[1]===y)return true}return false};
    return {n:has(at[0],at[1]-1),s:has(at[0],at[1]+1),w:has(at[0]-1,at[1]),e:has(at[0]+1,at[1])};
  }
  function pathsOf(s){
    var id=s.id,e=exitsOf(s),c=[320,220],list=[];
    if(id==="hub")return [[[320,40],[320,220]],[[320,400],[320,220]],[[30,214],[320,220]],[[610,214],[320,220]],[[200,160],[260,200]],[[440,160],[380,200]]];
    if(id==="fog1")return [[[320,30],[250,140],[230,280],[300,400]],[[20,220],[140,230],[230,200]]];
    if(e.n)list.push([[320,24],c]);if(e.s)list.push([[320,400],c]);if(e.w)list.push([[24,220],c]);if(e.e)list.push([[616,220],c]);
    if(!list.length)list.push([[180,200],[460,240]]);
    return list;
  }
  function layPath(mesh,pts){
    for(var i=0;i<pts.length-1;i++){
      var a=pts[i],b=pts[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(len/34));
      var ang=Math.atan2(b[0]-a[0],b[1]-a[1]);
      for(var k=0;k<=n;k++){
        if(mesh.count>=mesh.instanceMatrix.count)return;
        var t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,p=wp(x,y,0.05);
        stamp(mesh,mesh.count,p.x,0.06,p.z,ang,1.05);mesh.count++;
      }
    }
  }
  function build(s){
    while(world.children.length)world.remove(world.children[0]);
    if(!geo.grass)return;
    var gs=geo.grass.geometry.boundingBox.getSize(new THREE.Vector3());
    var sx=Math.max(0.4,gs.x),sz=Math.max(0.4,gs.z*0.75);
    var cliff=s.g==="cliffs"||s.reg==="anx";
    var pad=new THREE.Mesh(new THREE.CircleGeometry(48,6),new THREE.MeshStandardMaterial({color:0xb7c84a,roughness:1}));
    pad.rotation.x=-Math.PI/2;pad.position.y=-0.04;world.add(pad);
    var grass=instMesh("grass",700);if(!grass)return;
    grid(grass,-22,22,-16,cliff?-0.2:16,sx,sz,0);
    if(cliff){
      grid(grass,-22,22,-16,-0.4,sx,sz,1);
      var slope=instMesh("slope",90);
      if(slope){
        for(var x=-16;x<=16;x+=sx*0.92){stamp(slope,slope.count,x,0,-0.15,Math.PI,1);slope.count++}
        slope.instanceMatrix.needsUpdate=true;world.add(slope);
      }
    }
    grass.instanceMatrix.needsUpdate=true;world.add(grass);
    var road=instMesh("road",400);
    if(road){pathsOf(s).forEach(function(pts){layPath(road,pts)});road.instanceMatrix.needsUpdate=true;world.add(road)}
    (s.w||[]).forEach(function(q){
      if(!geo.water)return;
      var water=instMesh("water",40),cx=wp(q[0],q[1]).x,cz=wp(q[0],q[1]).z;
      var rx=q[2]*U,rz=q[3]*U,i=0;
      for(var a=0;a<6.3;a+=0.7){stamp(water,i,cx+Math.cos(a)*rx*0.45,0.02,cz+Math.sin(a)*rz*0.45,a,1);i++}
      stamp(water,i++,cx,0.02,cz,0,1.2);
      water.count=i;water.instanceMatrix.needsUpdate=true;world.add(water);
      if(geo.plant){var plants=instMesh("plant",12);for(var k=0;k<8;k++){var aa=k/8*6.28;stamp(plants,k,cx+Math.cos(aa)*rx,0,cz+Math.sin(aa)*rz,aa,1)}plants.count=8;plants.instanceMatrix.needsUpdate=true;world.add(plants)}
    });
    function scatter(key,pts,sc){
      if(!geo[key])return;
      var m=instMesh(key,pts.length+2);
      pts.forEach(function(p,i){var v=wp(p[0],p[1],0);stamp(m,i,v.x,0,v.z,p[2]||0,sc||1)});
      m.count=pts.length;m.instanceMatrix.needsUpdate=true;world.add(m);
    }
    var trees=[],rocks=[],seed=hash(s.id||"v");
    (s.items||[]).forEach(function(o){
      if(o.t==="tree")trees.push([o.x,o.y,hash(o.x+"t")]);
      if(o.t==="rock")rocks.push([o.x,o.y,0]);
    });
    for(var e=0;e<18;e++){
      var edge=e%4,t=(e/18),px=edge<2?(edge===0?18:622):40+ (hash(seed+e)%560),py=edge>=2?(edge===2?70:390):80+(hash(seed+e*3)%280);
      if(edge===0)py=70+(e*37%300);if(edge===1)py=80+(e*41%280);
      trees.push([px,py,e]);
    }
    scatter("tree",trees.filter(function(_,i){return i%2===0}),1);
    scatter("tree2",trees.filter(function(_,i){return i%2}),1);
    if(!rocks.length){for(var r=0;r<5;r++)rocks.push([80+(hash(seed+r)%480),90+(hash(seed+r*5)%250),0])}
    scatter("rock",rocks,1);
    (s.items||[]).forEach(function(o,n){
      var v=wp(o.x,o.y,0);
      if(o.t==="house"||o.t==="door"){
        var src=n%2&&geo.homeB?geo.homeB:geo.homeA;if(!src)return;
        var h=src.clone(true);h.position.set(v.x,0,v.z);h.rotation.y=Math.PI;
        var box=new THREE.Box3().setFromObject(h),hh=Math.max(0.01,box.max.y-box.min.y);
        h.scale.setScalar(2.4/hh);world.add(h);
      }else if(o.t==="wall"){
        if(!geo.fence)return;var f=new THREE.Mesh(geo.fence.geometry,geo.fence.material);f.position.copy(v);f.receiveShadow=true;world.add(f);
      }else if(o.t==="chest"||o.t==="find"){
        if(!geo.crate)return;var c=new THREE.Mesh(geo.crate.geometry,geo.crate.material);c.position.copy(v);c.castShadow=true;world.add(c);
      }else if(o.t==="sign"){
        var sg=makeSign();sg.position.copy(v);world.add(sg);
      }else if(o.t==="lantern"){
        var ln=makeLantern();ln.position.copy(v);ln.userData.lit=o;world.add(ln);
      }
    });
    if(geo.barrel){
      [[150,250],[470,240]].forEach(function(p,i){if(s.id!=="hub"&&i)return;var b=new THREE.Mesh(geo.barrel.geometry,geo.barrel.material);var v=wp(p[0],p[1],0);b.position.set(v.x,0,v.z);b.castShadow=true;world.add(b)});
    }
    built=s.id;
  }

  function acquire(kind,role){
    var key=(role||kind)+"|"+kind;
    pool[key]=pool[key]||[];
    var free=null;for(var i=0;i<pool[key].length;i++)if(!pool[key][i].used){free=pool[key][i];break}
    if(!free){
      var root=cloneSkel(chars[kind]);
      root.traverse(function(o){if(o.isMesh){var list=[].concat(o.material).map(function(m){return m.clone()});o.material=list.length===1?list[0]:list}});
      dress(root,role||kind);
      var mixer=new THREE.AnimationMixer(root);
      actors.add(root);
      var shade=new THREE.Mesh(new THREE.CircleGeometry(.42,14),new THREE.MeshBasicMaterial({color:0x3d4a2c,transparent:true,opacity:.28,depthWrite:false}));
      shade.rotation.x=-Math.PI/2;shade.position.y=.03;root.add(shade);
      free={root:root,mixer:mixer,used:false,cur:"",clip:null,baseY:root.position.y};
      pool[key].push(free);
    }
    free.used=true;free.root.visible=true;return free;
  }
  function release(){Object.keys(pool).forEach(function(k){pool[k].forEach(function(a){a.used=false;a.root.visible=false})})}
  function play(a,name,time,hold,quiet){
    var clip=shared[name]||shared.Idle;if(!clip)return;
    if(a.cur!==clip.name){a.mixer.stopAllAction();var act=a.mixer.clipAction(clip);act.play();a.cur=clip.name;a.clip=clip}
    var dur=a.clip.duration||1;
    var tt=hold!=null?Math.min(dur-0.001,dur*hold):(quiet?dur*0.2:(time%dur));
    a.mixer.setTime(Math.max(0,tt));
  }
  function heroState(){
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
  function showFx(name,time,q){
    ["cloud","scribs","feet","split","pack","breath","leaves","halo"].forEach(function(k){fx[k].visible=k===name||(name==="cloud"&&k==="split")||(name==="pack"&&k==="feet")});
    if(!q&&name==="scribs")fx.scribs.rotation.y=time;
    if(name==="breath"){var s=q?1:1+Math.sin(time*3)*.15;fx.breath.scale.set(s,s,s)}
    if(!q&&name==="halo")fx.halo.children.forEach(function(ch){if(ch.userData.a==null)return;var a=ch.userData.a+time*.8;ch.position.x=Math.cos(a)*.7;ch.position.z=Math.sin(a)*.7});
  }
  function yawOf(dir){
    if(dir===1)return Math.PI;
    if(dir===2)return -Math.PI/2;
    if(dir===3)return Math.PI/2;
    return 0;
  }
  function kindOf(who){
    if(ROLE[who]&&chars[ROLE[who]])return ROLE[who];
    var list=["knight","barbarian","rogue","rogue_hooded"],n=hash(who||"v");
    return list[n%list.length];
  }
  function placeActor(kind,role,x,y,dir,pose,time){
    var a=acquire(kind,role);
    var p=wp(x,y,0);
    a.root.position.set(p.x,a.baseY||0,p.z);
    a.root.rotation.y=yawOf(dir);
    play(a,pose.clip||"Idle",time*(pose.speed||1),pose.hold,pose.quiet);
    return a;
  }
  function ensureClouds(){
    if(clouds.length||!geo.cloudbig)return;
    for(var i=0;i<4;i++){
      var g=new THREE.Group();
      var m=new THREE.Mesh(geo.cloudbig.geometry,geo.cloudbig.material.clone());
      m.castShadow=true;g.add(m);
      var eye=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),new THREE.MeshStandardMaterial({color:0x2a241c,roughness:.4}));
      var e2=eye.clone();eye.position.set(-.12,.12,.2);e2.position.set(.12,.12,.2);
      var smile=new THREE.Mesh(new THREE.TorusGeometry(.1,.02,6,10,2.2),new THREE.MeshStandardMaterial({color:0x5a4038,roughness:.5}));
      smile.position.set(0,-.02,.22);smile.rotation.z=Math.PI;
      g.add(eye,e2,smile);g.userData.mat=m.material;scene.add(g);clouds.push(g);
    }
  }
  function frameCam(target,dist,fov){
    camera.fov=fov;camera.updateProjectionMatrix();
    camera.position.set(target.x+dist*0.28,target.y+dist*0.92,target.z+dist*0.78);
    camera.lookAt(target.x,target.y+0.55,target.z);
    dir.position.set(target.x-6,12,target.z+4);
    dir.target.position.set(target.x,0.4,target.z);
  }
  function resize(r){
    var pr=1,pix=r.width*r.height;
    if(pix>520000)pr=Math.sqrt(520000/pix);
    renderer.setPixelRatio(pr);
    renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/Math.max(1,r.height);
    camera.updateProjectionMatrix();
  }
  function finish(){
    fx=makeFx();
    pets.cat=makePet(true);pets.dog=makePet(false);
    scene.add(pets.cat);scene.add(pets.dog);
    ready=true;
    document.documentElement.classList.add("vista-kay");
    window.OBC_KAY={ready:true,frame:frame,project:project,unproject:unproject,label:drawLabel};
    if(/[?&]states=1/.test(location.search))showStates();
  }
  function regKey(s){return s.reg||(s.id||"").replace(/\d+$/,"")||"hub"}
  function frame(t,r){
    if(!ready)return false;
    var stage=document.getElementById("w-stage");if(!stage)return false;
    if(renderer.domElement.parentNode!==stage){renderer.domElement.id="w-gl";stage.insertBefore(renderer.domElement,stage.firstChild)}
    resize(r);
    var api=window.obcWorld3,s=api&&api.scene&&api.scene();if(!s)return false;
    if(built!==s.id)build(s);
    var fk=FOG[regKey(s)]||FOG.hub;
    scene.fog.color.setHex(fk.c);scene.fog.near=fk.n;scene.fog.far=fk.f;
    renderer.setClearColor(fk.c,1);
    release();
    var q=still(),time=(t||0)/1000,state=heroState(),mood=MOOD[state]||MOOD.calm;
    var moving=!q&&window.obcWorld3&&obcWorld3.P&&obcWorld3.P.ph>0.15;
    var pose=Object.assign({quiet:q},mood);
    if(moving&&state!=="withdrawn"&&state!=="exhausted"&&!pose.hold){pose.clip=state==="panicked"?"Running_A":"Walking_A";pose.speed=state==="panicked"?1:1}
    var P=api.P,dirH=api.B&&api.B()? (api.B().e.x<P.x?3:2):P.dir;
    var hero=placeActor("mage","hero",P.x,P.y,dirH,pose,time);
    if(fx.group.parent!==hero.root)hero.root.add(fx.group);
    showFx(pose.fx,time,q);
    window.OBC_MOOD_NOW=state;
    (s.items||[]).forEach(function(o){
      if(o.t==="npc"||o.t==="mentor"||o.t==="way"){
        var who=o.t==="mentor"?(api.gj&&api.gj.GJ&&api.gj.GJ[o.gj]&&api.gj.GJ[o.gj].g):o.t==="way"?"makayla":(o.name||"v")+ (o.spr||"");
        if(o.t==="mentor")who=(window.obcWorld3.gj.GJ[o.gj]||{}).g||"amber";
        var kind=kindOf(who),role=ROLE[who]?who:"villager";
        placeActor(kind,role,o.x,o.y,P.x<o.x?2:3,{clip:"Idle",quiet:q},time+hash(who)%5);
      }
      if(o.t==="lantern"){
        world.traverse(function(n){if(n.userData&&n.userData.lit===o&&n.userData.lamp){n.userData.lamp.material.emissive.setHex(o.lit?0xffb040:0x000000);n.userData.lamp.material.emissiveIntensity=o.lit?0.8:0}});
      }
    });
    var petI=0;try{petI=(api.state&&api.state().hero.pet)|0}catch(e){}
    var pet=petI?pets.dog:pets.cat;pets.cat.visible=pet===pets.cat;pets.dog.visible=pet===pets.dog;
    var side=dirH===3?-1:1;
    var pp=wp(P.x+side*28,P.y+10,0);pet.position.set(pp.x,0,pp.z);pet.rotation.y=yawOf(dirH);pet.visible=true;
    ensureClouds();
    clouds.forEach(function(c){c.visible=false});
    var B=api.B&&api.B();
    if(B&&B.e){
      var hq=B.max?1-B.hp/Math.max(1,B.max):0;
      var list=[{e:B.e,big:1}];
      for(var w=0;w<(B.worries|0)&&w<3;w++)list.push({e:{x:B.e.x+Math.cos(w*2+time)*(B.e.boss?90:40),y:B.e.y+Math.sin(w*2)*24},big:0});
      list.forEach(function(item,i){
        var c=clouds[i];if(!c)return;
        var p=wp(item.e.x,item.e.y,item.big?1.3:.8);
        c.position.set(p.x,item.big?.55:.35,p.z);
        c.scale.setScalar(item.big?.5:.28);
        c.visible=true;
        var col=new THREE.Color(0xb7c3cc).lerp(new THREE.Color(0xffe3a8),hq);
        c.userData.mat.color.copy(col);
        if(!q)c.position.y+=Math.sin(time*2+i)*.08;
      });
      var mid=wp((P.x+B.e.x)/2,(P.y+B.e.y)/2,0);
      frameCam(mid,B.e.boss?11:9.5,42);
    }else{
      frameCam(wp(P.x,P.y,0),17.5,34);
    }
    renderer.render(scene,camera);
    return true;
  }
  function project(x,y,h){
    var v=wp(x,y,h==null?1.5:h);v.project(camera);
    var st=renderer.domElement.getBoundingClientRect();
    return {x:(v.x*.5+.5)*st.width,y:(-v.y*.5+.5)*st.height};
  }
  function unproject(sx,sy,w,h){
    var ndc=new THREE.Vector2((sx/w)*2-1,-(sy/h)*2+1);
    ray.setFromCamera(ndc,camera);
    if(!ray.ray.intersectPlane(groundPlane,hit))return {x:320,y:220};
    return {x:hit.x/U+320,y:hit.z/U+208};
  }
  function drawLabel(c,o){
    var api=window.obcWorld3;
    var names={mentor:"Talk",way:"Rest",clue:"Read",calm:"Sit",sign:"Read",npc:"Talk",chest:"Open",find:"Take",look:"Look",door:"Enter",page:"Read",path:"Enter",fish:"Fish",lantern:o.lit?"Dim":"Light",house:o.role==="hall"?"Enter":o.role==="office"?"Knock":"Look"};
    var text=(names[o.t]||"Look")+(o.name?" "+String(o.name).split(" ")[0]:"");
    var p=project(o.x,o.y,1.9);
    c.save();c.setTransform(1,0,0,1,0,0);
    c.font="600 14px system-ui,sans-serif";
    var w=c.measureText(text).width+16,st=renderer.domElement.getBoundingClientRect();
    var x=Math.max(w/2+6,Math.min(st.width-w/2-6,p.x)),y=Math.max(22,p.y-6);
    c.fillStyle="#fff6d2";c.strokeStyle="#a87420";c.lineWidth=2;
    c.beginPath();if(c.roundRect)c.roundRect(x-w/2,y-18,w,24,8);else c.rect(x-w/2,y-18,w,24);
    c.fill();c.stroke();c.fillStyle="#3b2a1a";c.textAlign="center";c.fillText(text,x,y);
    c.restore();
    window.OBC_KAY._lbl={o:o,l:o.x-24,r:o.x+24,t:o.y-44,b:o.y-4};
  }
  function showStates(){
    var sheet=document.getElementById("w-sheet"),cv=document.getElementById("w-sheet-cv");
    if(!sheet||!cv||!chars.mage)return;
    var names=["calm","worried","overwhelmed","withdrawn","panicked","exhausted","help","breath","support","recover"];
    var labels=["Calm","Worried","Overwhelmed","Withdrawn","Panicked","Exhausted","Asking for help","Grounding","Receiving support","Recovering"];
    var group=new THREE.Group();
    var cast=[];
    names.forEach(function(st,i){
      var root=cloneSkel(chars.mage);
      dress(root,"hero");
      var col=i%5,row=i<5?0:1;
      root.position.set((col-2)*2.15,0,row*2.7);
      root.rotation.y=0.35;
      group.add(root);
      var mixer=new THREE.AnimationMixer(root);
      var pose=MOOD[st]||MOOD.calm;
      var clip=shared[pose.clip]||shared.Idle;
      if(clip){var act=mixer.clipAction(clip);act.play();mixer.setTime(pose.hold!=null?clip.duration*pose.hold:0.4)}
      cast.push({root:root,mixer:mixer,pose:pose,clip:clip});
      var mark=fxPiece(pose.fx);
      if(mark){root.add(mark)}
    });
    var pad=new THREE.Mesh(new THREE.CircleGeometry(8,4),new THREE.MeshStandardMaterial({color:0xcfe8b0,roughness:1}));
    pad.rotation.x=-Math.PI/2;pad.position.y=-0.02;
    var holder=new THREE.Scene();
    holder.add(new THREE.AmbientLight(0xfff6ea,0.7));
    holder.add(new THREE.HemisphereLight(0xfff8e8,0x7a9a55,0.6));
    var sun=new THREE.DirectionalLight(0xfff3d8,1.2);sun.position.set(-4,8,6);holder.add(sun);
    holder.add(pad);holder.add(group);
    holder.background=new THREE.Color(0xcfe8b0);
    var W=1500,H=920;
    function paint(now){
      if(!document.body.contains(cv))return;
      cast.forEach(function(a){if(!still()&&a.clip&&a.pose.hold==null)a.mixer.setTime(((now||0)/1000*(a.pose.speed||1))%(a.clip.duration||1))});
      sheetCam.aspect=W/H;sheetCam.position.set(0,7.2,13.5);sheetCam.lookAt(0,0.7,1.2);sheetCam.updateProjectionMatrix();
      renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.setClearColor(0xcfe8b0,1);
      var old=scene.fog;scene.fog=null;
      renderer.render(holder,sheetCam);
      scene.fog=old;
      if(renderer.domElement.parentNode!==sheet){renderer.domElement.id="w-sheet-gl";renderer.domElement.style.cssText="width:100%;height:auto;display:block;border-radius:12px";sheet.insertBefore(renderer.domElement,cv)}
      cv.width=W;cv.height=H;cv.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;background:transparent;pointer-events:none";
      var c=cv.getContext("2d");c.clearRect(0,0,W,H);c.font="600 22px system-ui,sans-serif";c.fillStyle="#3a2412";c.textAlign="center";
      cast.forEach(function(a,i){
        var v=new THREE.Vector3();a.root.getWorldPosition(v);v.y=0;v.project(sheetCam);
        var x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*H;
        c.fillText(labels[i],x,Math.min(H-18,y+78));
      });
      if(!still())requestAnimationFrame(paint);
    }
    requestAnimationFrame(paint);
  }
  function fxPiece(name){
    if(!fx||!name)return null;
    var src=fx[name];if(!src)return null;
    var g=src.clone(true);g.visible=true;g.traverse(function(o){if(o.material)o.material=o.material.clone()});
    return g;
  }
}
