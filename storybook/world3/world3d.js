/* Full KayKit scene for the default Vista look.
   Characters stay the CC0 KayKit adventurers. The land is a continuous
   mesh (vertex colors), with KayKit forest trees and grass, KayKit
   cottages, and simple original bushes, flowers, pots, reeds, and stairs.
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
 fog:{c:0xb7c3bf,n:18,f:34},
 anx:{c:0xd5e2ee,n:26,f:52},
 ptsd:{c:0xddd4e4,n:24,f:48},
 rel:{c:0xf3e4dc,n:28,f:56},
 ocd:{c:0xefe4cc,n:28,f:56},
 adhd:{c:0xe4f0d4,n:28,f:56},
 ed:{c:0xd5ebe6,n:26,f:52},
 grief:{c:0xf4e6cc,n:26,f:52},
 hub:{c:0xd7e4cc,n:30,f:62}
};

function boot(){
  var renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:"high-performance"});
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=false;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.98;
  renderer.setClearColor(0xd7e4cc,1);
  var scene=new THREE.Scene();
  var camera=new THREE.PerspectiveCamera(32,1,0.08,90);
  var sheetCam=new THREE.PerspectiveCamera(28,1,0.08,50);
  scene.add(new THREE.AmbientLight(0xfff1e2,0.62));
  var hemi=new THREE.HemisphereLight(0xfff3e4,0x6a8458,0.46);
  scene.add(hemi);
  var dir=new THREE.DirectionalLight(0xffe4c2,0.98);
  scene.add(dir);scene.add(dir.target);
  scene.fog=new THREE.Fog(0xd7e4cc,30,62);
  var world=new THREE.Group();scene.add(world);
  var actors=new THREE.Group();scene.add(actors);
  var landH=function(){return 0};
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
    [[0,.08,0,.36],[-.28,.16,.04,.24],[.26,.14,-.02,.22],[.02,.28,.06,.2]].forEach(function(p){var b=sphere(0xc5ced6,p[3]);b.position.set(p[0],p[1],p[2]);cloud.add(b)});
    cloud.position.set(0.15,2.48,-0.05);
    var scribs=new THREE.Group();
    for(var i=0;i<4;i++){var t=new THREE.Mesh(new THREE.TorusGeometry(.22,.04,6,16,1.5),new THREE.MeshBasicMaterial({color:0xfff6d4}));t.position.set(0.95+(i%2)*.2,1.72+i*.2,.2);t.rotation.z=-0.4+i*.65;t.rotation.y=.2;scribs.add(t)}
    var feet=new THREE.Group();
    for(var f=0;f<3;f++){var e=new THREE.Mesh(new THREE.CircleGeometry(.18,10),new THREE.MeshBasicMaterial({color:0x3a2918,transparent:true,opacity:.8}));e.rotation.x=-Math.PI/2;e.position.set(-.55,0.04,.42+f*.34);e.scale.set(1.35,.72,1);feet.add(e)}
    var split=new THREE.Group();
    [[.72,.15],[-.78,.28]].forEach(function(p){var e=new THREE.Mesh(new THREE.CircleGeometry(.4,12),new THREE.MeshBasicMaterial({color:0x141c18,transparent:true,opacity:.5}));e.rotation.x=-Math.PI/2;e.position.set(p[0],0.03,p[1]);e.scale.set(1.2,.72,1);split.add(e)});
    var pack=new THREE.Group();
    var sack=new THREE.Mesh(new THREE.SphereGeometry(.46,12,10),new THREE.MeshStandardMaterial({color:0x6b4428,roughness:.8}));
    sack.scale.set(1.05,1.15,.85);sack.position.set(.62,.9,.02);
    var roll=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.5,8),new THREE.MeshStandardMaterial({color:0xc4a574,roughness:.75}));
    roll.rotation.z=Math.PI/2;roll.position.set(.62,1.32,.02);
    var strap=new THREE.Mesh(new THREE.BoxGeometry(.08,.55,.06),new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.8}));
    strap.position.set(.32,1.05,.12);strap.rotation.z=-.5;pack.add(sack,roll,strap);
    var breath=new THREE.Mesh(new THREE.TorusGeometry(.34,.03,8,20),new THREE.MeshBasicMaterial({color:0x7fb87a,transparent:true,opacity:.9}));
    breath.position.set(0,.92,.32);
    var leaves=new THREE.Group();
    [[-.55,1.55,.05,.7],[.52,1.48,-.08,-.6],[-.2,2.05,.12,.3],[.28,2.12,-.02,-.2],[0,1.85,.2,.1]].forEach(function(p){var leaf=sphere(0x3f8f45,.11);leaf.scale.set(2.1,.55,.4);leaf.position.set(p[0],p[1],p[2]);leaf.rotation.z=p[3];leaves.add(leaf)});
    var halo=new THREE.Group();
    var ring=new THREE.Mesh(new THREE.TorusGeometry(.9,.045,8,28),new THREE.MeshBasicMaterial({color:0xffc85a,transparent:true,opacity:.85}));
    ring.rotation.x=-Math.PI/2;ring.position.y=.05;
    for(var k=0;k<6;k++){var sp=sphere(0xffe6a0,.07);var a=k/6*6.283;sp.position.set(Math.cos(a)*1.05,.28+(k%2)*.28,Math.sin(a)*1.05);sp.userData.a=a;sp.userData.r=1.05;halo.add(sp)}
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
    ["ftree","models/kaykit/forest/gltf/Tree_2_C_Color1.gltf"],
    ["ftreeA","models/kaykit/forest/gltf/Tree_4_A_Color1.gltf"],
    ["ftreeB","models/kaykit/forest/gltf/Tree_4_B_Color1.gltf"],
    ["ftreeC","models/kaykit/forest/gltf/Tree_4_C_Color1.gltf"],
    ["fgrass","models/kaykit/forest/gltf/Grass_1_B_Color1.gltf"],
    ["fgrass2","models/kaykit/forest/gltf/Grass_2_C_Color1.gltf"],
    ["fgrass3","models/kaykit/forest/gltf/Grass_2_D_Color1.gltf"],
    ["rock","models/kaykit/med/decoration/nature/rock_single_A.gltf"],
    ["rock2","models/kaykit/med/decoration/nature/rock_single_B.gltf"],
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
    if(src.material&&!src.material.userData.sided){src.material.side=THREE.DoubleSide;src.material.userData.sided=1}
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
  function fitH(key,h){
    var bb=geo[key]&&geo[key].geometry.boundingBox;if(!bb)return 1;
    return h/Math.max(0.001,bb.max.y-bb.min.y);
  }
  function groundY(key,s){
    var bb=geo[key].geometry.boundingBox;
    return -bb.min.y*(s||1);
  }
  var decor=null;
  function ensureDecor(){
    if(decor)return decor;
    function merge(parts){
      var pos=[],nor=[],idx=[],off=0;
      parts.forEach(function(g){
        var p=g.attributes.position,n=g.attributes.normal,ix=g.index;
        for(var i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));if(n)nor.push(n.getX(i),n.getY(i),n.getZ(i))}
        if(ix){for(var k=0;k<ix.count;k++)idx.push(ix.getX(k)+off)}
        off+=p.count;
      });
      var g=new THREE.BufferGeometry();
      g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
      if(nor.length)g.setAttribute("normal",new THREE.Float32BufferAttribute(nor,3));
      g.setIndex(idx);g.computeBoundingBox();return g;
    }
    function puff(x,y,z,r){var g=new THREE.IcosahedronGeometry(r,2);g.translate(x,y,z);return g}
    var bush=merge([puff(0,.48,0,.46),puff(-.34,.36,.1,.32),puff(.32,.34,-.08,.3),puff(.04,.66,.02,.26),puff(-.08,.4,-.22,.24)]);
    var blossom=new THREE.SphereGeometry(.09,8,6);blossom.translate(0,.34,0);
    var stem=new THREE.CylinderGeometry(.015,.02,.28,5);stem.translate(0,.14,0);
    var potPts=[new THREE.Vector2(.01,0),new THREE.Vector2(.16,0),new THREE.Vector2(.18,.06),new THREE.Vector2(.13,.26),new THREE.Vector2(.2,.32),new THREE.Vector2(.15,.34)];
    var pot=new THREE.LatheGeometry(potPts,8);
    var reed=merge([ (function(){var c=new THREE.ConeGeometry(.035,.72,5);c.translate(0,.36,0);return c})(), (function(){var s=new THREE.SphereGeometry(.05,6,5);s.translate(0,.74,0);return s})() ]);
    decor={
      bush:bush,
      blossom:blossom,
      stem:stem,
      pot:new THREE.Mesh(pot,new THREE.MeshStandardMaterial({color:0xc48a62,roughness:.78})),
      reed:reed,
      bushMat:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9}),
      stemMat:new THREE.MeshStandardMaterial({color:0x5d8a48,roughness:.85}),
      bloomMat:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6}),
      reedMat:new THREE.MeshStandardMaterial({color:0x4e6a48,roughness:.8})
    };
    return decor;
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
  function smooth(e0,e1,x){var t=Math.max(0,Math.min(1,(x-e0)/(e1-e0||1)));return t*t*(3-2*t)}
  function segDist(x,z,ax,az,bx,bz){
    var dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;
    var t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2));
    return Math.hypot(x-(ax+dx*t),z-(az+dz*t));
  }
  function build(s){
    while(world.children.length)world.remove(world.children[0]);
    var marsh=regKey(s)==="fog";
    var cliff=s.g==="cliffs"||s.reg==="anx";
    var knoll=!cliff&&!marsh;
    var segs=[];
    pathsOf(s).forEach(function(pts,pi){
      for(var i=0;i<pts.length-1;i++){
        var a=pts[i],b=pts[i+1];
        var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
        var dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
        var mag=((hash((s.id||"")+"p"+pi+"s"+i)%140)-70)*0.95;
        var c=[mx+(-dy/len)*mag, my+(dx/len)*mag];
        var n=Math.max(8,Math.round(len/18)),prev=null;
        for(var k=0;k<=n;k++){
          var t=k/n,u=1-t;
          var gx=u*u*a[0]+2*u*t*c[0]+t*t*b[0];
          var gy=u*u*a[1]+2*u*t*c[1]+t*t*b[1];
          var v=wp(gx,gy,0);
          if(prev)segs.push([prev[0],prev[1],v.x,v.z]);
          prev=[v.x,v.z];
        }
      }
    });
    var waters=(s.w||[]).map(function(q){var v=wp(q[0],q[1],0);return {x:v.x,z:v.z,rx:Math.max(1.1,q[2]*U),rz:Math.max(.7,q[3]*U)}});
    if(marsh){
      waters.push({x:-5.2,z:2.6,rx:2.5,rz:1.55});
      waters.push({x:1.4,z:-4.2,rx:1.8,rz:1.2});
      waters.push({x:6.4,z:0.2,rx:1.45,rz:1.0});
    }
    function pathD(x,z){var best=99;for(var i=0;i<segs.length;i++){var d=segDist(x,z,segs[i][0],segs[i][1],segs[i][2],segs[i][3]);if(d<best)best=d}return best}
    function waterE(x,z){var best=99;for(var i=0;i<waters.length;i++){var w=waters[i];best=Math.min(best,Math.hypot((x-w.x)/w.rx,(z-w.z)/w.rz))}return best}
    function height(x,z){
      var h=Math.sin(x*0.47)*0.035+Math.cos(z*0.36+x*0.18)*0.028;
      if(cliff){
        if(Math.abs(x-0.15)<1.15)h+=(1-smooth(-4.15,-1.45,z))*1.62;
        else {
          var lip=(1-smooth(-2.02,-1.62,z))*1.05+(1-smooth(-3.25,-2.9,z))*0.72;
          h+=lip*(1-smooth(13.2,16.2,Math.abs(x)));
        }
      }else if(knoll){
        var d=Math.hypot((x+5.4)*0.82,z+2.5);
        var m=1-smooth(0.35,3.15,d);
        h+=m*m*0.78;
      }else if(marsh){
        h+=Math.sin(x*0.9)*0.02;
        h-=(1-smooth(1.2,3.4,Math.hypot(x-2.2,z+1.1)))*0.12;
      }
      var pathT=1-smooth(0.16,0.62,pathD(x,z));
      h-=pathT*0.05;
      var we=waterE(x,z);
      if(we<1.25)h=Math.min(h,-0.03-Math.max(0,1.08-we)*0.46);
      return h;
    }
    landH=height;
    var x0=-26,x1=26,z0=-16,z1=34;
    var geoT=new THREE.PlaneGeometry(x1-x0,z1-z0,168,128);
    geoT.rotateX(-Math.PI/2);
    geoT.translate((x0+x1)/2,0,(z0+z1)/2);
    var pos=geoT.attributes.position;
    var cols=new Float32Array(pos.count*3);
    var gA=new THREE.Color(marsh?0x62786c:0x86a878);
    var gB=new THREE.Color(marsh?0x4e645c:0x6e9470);
    var gC=new THREE.Color(marsh?0x74887c:0x93b484);
    var sand=new THREE.Color(marsh?0xc2b59a:0xd8cbb2);
    var shore=new THREE.Color(marsh?0xb3a890:0xd8c8a6);
    var waterC=new THREE.Color(marsh?0x2c4a50:0x4e8494);
    var eHi=new THREE.Color(0xc6a36e),eMid=new THREE.Color(0x8d623c),eLo=new THREE.Color(0x6b442c);
    for(var i=0;i<pos.count;i++)pos.setY(i,height(pos.getX(i),pos.getZ(i)));
    geoT.computeVertexNormals();
    var nor=geoT.attributes.normal;
    for(var i=0;i<pos.count;i++){
      var x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      var n1=Math.sin(x*1.31+z*1.73),n2=Math.sin(x*2.57-z*0.86+1.4),n3=Math.sin(x*0.47+z*0.29);
      var n=(n1*0.22+n2*0.16+n3*0.12)*0.5+0.5;
      var c=gA.clone().lerp(gB,Math.max(0,Math.min(1,n)));
      if(n3>0.55)c.lerp(gC,(n3-0.55)*0.35);
      var pathT=1-smooth(0.18,0.7,pathD(x,z));
      if(pathT>0)c.lerp(sand,Math.min(1,pathT*1.2));
      var we=waterE(x,z);
      if(we<0.96)c.copy(waterC);
      else if(we<1.32)c.lerp(shore,1-smooth(0.96,1.32,we));
      var ny=nor.getY(i);
      if(cliff&&ny<0.94&&y>0.08&&pathT<0.45&&we>1.2){
        var steep=Math.min(1,(0.94-ny)/0.42);
        var band=Math.sin(y*7.2)*0.5+0.5;
        var earth=eHi.clone().lerp(eMid,band>0.45?0.9:0.1).lerp(eLo,steep*0.4);
        c.lerp(earth,Math.min(1,0.72+steep*0.45));
      }else if(knoll&&ny<0.82&&y>0.16&&pathT<0.4&&we>1.2){
        var steepK=Math.min(1,(0.82-ny)/0.5);
        c.lerp(eMid,Math.min(0.85,steepK));
      }
      cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;
    }
    geoT.setAttribute("color",new THREE.BufferAttribute(cols,3));
    var ground=new THREE.Mesh(geoT,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));
    ground.frustumCulled=false;world.add(ground);
    waters.forEach(function(w){
      var wm=new THREE.Mesh(new THREE.CircleGeometry(1,24),new THREE.MeshStandardMaterial({color:marsh?0x243e44:0x4d8796,roughness:.16,metalness:.05,transparent:true,opacity:marsh?.92:.8}));
      wm.rotation.x=-Math.PI/2;wm.scale.set(w.rx*0.94,w.rz*0.94,1);wm.position.set(w.x,-0.045,w.z);world.add(wm);
      for(var p=0;p<3;p++){
        var pad=new THREE.Mesh(new THREE.CircleGeometry(.22+ (hash(w.x*10+p)%5)*.03,8),new THREE.MeshStandardMaterial({color:marsh?0x3e5c46:0x6d9458,roughness:.85}));
        var a=p*2.2+w.x;pad.rotation.x=-Math.PI/2;pad.position.set(w.x+Math.cos(a)*w.rx*.35,-0.03,w.z+Math.sin(a)*w.rz*.35);world.add(pad);
      }
    });
    if(cliff){
      var treadM=new THREE.MeshStandardMaterial({color:0x8fb56e,roughness:.96});
      var riserM=new THREE.MeshStandardMaterial({color:0x8a5a34,roughness:.92});
      for(var si=0;si<8;si++){
        var t=si/7,z=-4.05+t*2.5,y=height(0.15,z);
        var tread=new THREE.Mesh(new THREE.BoxGeometry(1.9,.1,.42),treadM);
        tread.position.set(0.15,y+0.07,z);
        var riser=new THREE.Mesh(new THREE.BoxGeometry(1.9,.22,.1),riserM);
        riser.position.set(0.15,y-0.05,z+0.2);
        world.add(tread,riser);
      }
    }else if(knoll){
      var stone=new THREE.MeshStandardMaterial({color:0xc4a06a,roughness:.9});
      var top=new THREE.MeshStandardMaterial({color:0x8fb56e,roughness:.96});
      for(var si=0;si<4;si++){
        var z=-0.7+si*0.55,x=-5.4,y=height(x,z);
        var box=new THREE.Mesh(new THREE.BoxGeometry(.95,.1,.4),si%2?top:stone);
        box.position.set(x,y+0.06,z);world.add(box);
      }
    }
    var D=ensureDecor();
    var bushCols=marsh?[0x4a6454,0x3c5346,0x5d7564,0x445e50]:[0x6e9a5c,0x5d8754,0x86a86e,0x4f7a48];
    var bloomCols=[0xe7a0b4,0xf0d48a,0xf7f1e4,0xcbb6e6,0xf0b07a];
    var bushes=new THREE.InstancedMesh(D.bush,D.bushMat,70);
    var stems=new THREE.InstancedMesh(D.stem,D.stemMat,36);
    var blooms=new THREE.InstancedMesh(D.blossom,D.bloomMat,36);
    var reeds=new THREE.InstancedMesh(D.reed,D.reedMat,64);
    [bushes,stems,blooms,reeds].forEach(function(m){m.count=0;m.frustumCulled=false;world.add(m)});
    function nearThing(gx,gy){
      var items=s.items||[];
      for(var i=0;i<items.length;i++){
        var o=items[i];
        if(o.t==="house"||o.t==="door"||o.t==="npc"||o.t==="mentor"||o.t==="sign"){
          if(Math.hypot(gx-o.x,gy-o.y)<(o.t==="house"||o.t==="door"?78:40))return true;
        }
      }
      return false;
    }
    function freeAt(gx,gy){
      if(gx<28||gx>612||gy<40||gy>392)return false;
      if(nearThing(gx,gy))return false;
      var v=wp(gx,gy,0);
      if(pathD(v.x,v.z)<0.78)return false;
      if(waterE(v.x,v.z)<1.45)return false;
      if(Math.abs(height(v.x,v.z)-height(v.x+0.45,v.z))>0.32)return false;
      return true;
    }
    function putInst(mesh,x,z,ry,s,col){
      if(mesh.count>=mesh.instanceMatrix.count)return;
      dummy.position.set(x,height(x,z),z);
      dummy.rotation.set(0,ry||0,0);
      dummy.scale.set(s,s,s);
      dummy.updateMatrix();
      mesh.setMatrixAt(mesh.count,dummy.matrix);
      if(col){mesh.setColorAt(mesh.count,new THREE.Color(col))}
      mesh.count++;
    }
    var anchors=[[140,140],[230,150],[390,145],[510,175],[110,240],[210,300],[400,270],[530,250],[170,350],[450,355],[300,115],[330,330],[80,190],[560,200]];
    var seed=hash(s.id||"v");
    var treeKeys=["ftree","ftreeA","ftreeB","ftreeC"];
    var treeH={ftree:2.35,ftreeA:2.55,ftreeB:2.85,ftreeC:3.25};
    var treeMeshes={};
    treeKeys.forEach(function(k){var m=instMesh(k,16);if(m){treeMeshes[k]=m;world.add(m)}});
    var grassKeys=["fgrass","fgrass2","fgrass3"];
    var grassMeshes={};
    grassKeys.forEach(function(k){var m=instMesh(k,40);if(m){grassMeshes[k]=m;world.add(m)}});
    var rockMeshes={};
    ["rock","rock2"].forEach(function(k){var m=instMesh(k,16);if(m){rockMeshes[k]=m;world.add(m)}});
    function putKeyed(map,key,gx,gy,h,ry){
      var m=map[key];if(!m||!geo[key])return;
      var sc=fitH(key,h)*(0.86+ (hash(gx+gy)%20)/100);
      var v=wp(gx,gy,0);
      dummy.position.set(v.x,height(v.x,v.z)+groundY(key,sc),v.z);
      dummy.rotation.set(0,ry||0,0);
      dummy.scale.set(sc,sc,sc);
      dummy.updateMatrix();
      if(m.count>=m.instanceMatrix.count)return;
      m.setMatrixAt(m.count++,dummy.matrix);
    }
    anchors.forEach(function(a,ai){
      for(var k=0;k<3;k++){
        var gx=a[0]+((hash(seed+ai*40+k)%70)-35);
        var gy=a[1]+((hash(seed+ai*70+k*5)%56)-28);
        if(!freeAt(gx,gy))continue;
        var key=treeKeys[(ai+k)%treeKeys.length];
        putKeyed(treeMeshes,key,gx,gy,treeH[key],hash(gx)%7);
      }
      for(var b=0;b<4;b++){
        var gx=a[0]+((hash(seed+ai*13+b)%50)-25);
        var gy=a[1]+((hash(seed+ai*19+b*3)%40)-20);
        if(!freeAt(gx,gy))continue;
        var v=wp(gx,gy,0);
        putInst(bushes,v.x,v.z,hash(gx)%6,1.15+(hash(gy)%5)*0.08,bushCols[(ai+b)%bushCols.length]);
      }
      for(var g=0;g<3;g++){
        var gx=a[0]+((hash(seed+ai*9+g)%64)-32);
        var gy=a[1]+((hash(seed+ai*11+g)%48)-24);
        if(!freeAt(gx,gy))continue;
        var gk=grassKeys[(ai+g)%grassKeys.length];
        putKeyed(grassMeshes,gk,gx,gy,gk==="fgrass"?0.4:0.62,hash(gx+g)%6);
      }
      if(ai%2===0){
        var gx=a[0]+20,gy=a[1]+10;
        if(freeAt(gx,gy))putKeyed(rockMeshes,ai%4===0?"rock2":"rock",gx,gy,ai%4===0?0.55:0.38,0);
      }
      if(!marsh||ai%2){
        for(var f=0;f<2;f++){
          var gx=a[0]+((hash(seed+ai*23+f)%36)-18);
          var gy=a[1]+((hash(seed+ai*27+f)%30)-15);
          if(!freeAt(gx,gy))continue;
          var v=wp(gx,gy,0),sc=0.85+(hash(gx+f)%4)*0.08;
          putInst(stems,v.x,v.z,0,sc);
          putInst(blooms,v.x,v.z,0,sc,bloomCols[(ai+f)%bloomCols.length]);
        }
      }
    });
    for(var ring=0;ring<22;ring++){
      var ang=ring/22*6.283,rad=46+(hash(seed+ring*3)%34);
      var gx=320+Math.cos(ang)*rad,gy=214+Math.sin(ang)*rad*0.72;
      if(!freeAt(gx,gy))continue;
      var v=wp(gx,gy,0);
      if(ring%3===0)putInst(bushes,v.x,v.z,ang,1.05+(hash(ring)%4)*0.08,bushCols[ring%bushCols.length]);
      else putKeyed(grassMeshes,grassKeys[ring%3],gx,gy,ring%3?0.55:0.38,ang);
    }
    (s.items||[]).forEach(function(o){
      if(o.t==="tree")putKeyed(treeMeshes,treeKeys[hash(o.x+"t")%4],o.x,o.y,2.7,hash(o.x)%6);
      if(o.t==="rock")putKeyed(rockMeshes,hash(o.y)%2?"rock2":"rock",o.x,o.y,0.48,0);
    });
    waters.forEach(function(w){
      for(var k=0;k<16;k++){
        var a=k/16*6.283,e=0.98+((hash(k*5+w.x*10)%25)/100);
        var x=w.x+Math.cos(a)*w.rx*e,z=w.z+Math.sin(a)*w.rz*e;
        putInst(reeds,x,z,a,0.75+(hash(k+w.z)%6)*0.1);
      }
      if(geo.plant){
        var plants=instMesh("plant",8);
        if(plants){
          for(var k=0;k<6;k++){
            var a=k/6*6.28;
            var x=w.x+Math.cos(a)*w.rx*1.05,z=w.z+Math.sin(a)*w.rz*1.05;
            dummy.position.set(x,height(x,z)+groundY("plant",1),z);
            dummy.rotation.set(0,a,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
            plants.setMatrixAt(k,dummy.matrix);
          }
          plants.count=6;plants.instanceMatrix.needsUpdate=true;world.add(plants);
        }
      }
    });
    [bushes,stems,blooms,reeds].concat(Object.keys(treeMeshes).map(function(k){return treeMeshes[k]}),Object.keys(grassMeshes).map(function(k){return grassMeshes[k]}),Object.keys(rockMeshes).map(function(k){return rockMeshes[k]})).forEach(function(m){
      m.instanceMatrix.needsUpdate=true;
      if(m.instanceColor)m.instanceColor.needsUpdate=true;
    });
    (s.items||[]).forEach(function(o,n){
      var v=wp(o.x,o.y,0),gy=height(v.x,v.z);
      if(o.t==="house"||o.t==="door"){
        var src=n%2&&geo.homeB?geo.homeB:geo.homeA;if(!src)return;
        var h=src.clone(true);h.position.set(0,0,0);h.rotation.y=Math.PI;h.updateMatrixWorld(true);
        var box=new THREE.Box3().setFromObject(h),hh=Math.max(0.01,box.max.y-box.min.y),sc=2.15/hh;
        h.scale.setScalar(sc);h.position.set(v.x,gy-box.min.y*sc,v.z);world.add(h);
        var pot=D.pot.clone();pot.position.set(v.x+0.7,height(v.x+0.7,v.z+0.35),v.z+0.35);pot.scale.setScalar(.85);world.add(pot);
        var pot2=D.pot.clone();pot2.position.set(v.x-0.85,height(v.x-0.85,v.z+0.2),v.z+0.2);pot2.scale.setScalar(.7);world.add(pot2);
      }else if(o.t==="wall"&&geo.fence){
        var sc=fitH("fence",0.7);
        var f=new THREE.Mesh(geo.fence.geometry,geo.fence.material);
        f.scale.setScalar(sc);f.position.set(v.x,gy+groundY("fence",sc),v.z);world.add(f);
      }else if((o.t==="chest"||o.t==="find")&&geo.crate){
        var sc=fitH("crate",0.38);
        var c=new THREE.Mesh(geo.crate.geometry,geo.crate.material);
        c.scale.setScalar(sc);c.position.set(v.x,gy+groundY("crate",sc),v.z);world.add(c);
      }else if(o.t==="sign"){
        var sg=makeSign();sg.position.set(v.x,gy,v.z);world.add(sg);
      }else if(o.t==="lantern"){
        var ln=makeLantern();ln.position.set(v.x,gy,v.z);ln.userData.lit=o;world.add(ln);
      }
    });
    if(geo.fence&&(s.id==="hub"||s.g==="town")){
      var sc=fitH("fence",0.72),bb=geo.fence.geometry.boundingBox,width=Math.max(.4,(bb.max.x-bb.min.x)*sc);
      var origin=wp(s.id==="hub"?250:200,s.id==="hub"?250:240,0);
      for(var i=0;i<4;i++){
        var x=origin.x+i*width*0.92,z=origin.z+Math.sin(i)*0.05;
        var f=new THREE.Mesh(geo.fence.geometry,geo.fence.material);
        f.scale.setScalar(sc);f.position.set(x,height(x,z)+groundY("fence",sc),z);f.rotation.y=0.15;world.add(f);
      }
    }
    if(geo.barrel){
      [[160,260],[460,250]].forEach(function(p,i){
        if(s.id!=="hub"&&i)return;
        var sc=fitH("barrel",0.55);
        var b=new THREE.Mesh(geo.barrel.geometry,geo.barrel.material);
        var v=wp(p[0],p[1],0);
        b.scale.setScalar(sc);b.position.set(v.x,height(v.x,v.z)+groundY("barrel",sc),v.z);world.add(b);
      });
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
  function fxKey(name){return name==="scribble"?"scribs":name}
  function showFx(name,time,q){
    var key=fxKey(name);
    ["cloud","scribs","feet","split","pack","breath","leaves","halo"].forEach(function(k){fx[k].visible=k===key||(key==="cloud"&&k==="split")||(key==="pack"&&k==="feet")});
    if(!q&&key==="scribs")fx.scribs.rotation.y=time;
    if(name==="breath"){var s=q?1:1+Math.sin(time*3)*.15;fx.breath.scale.set(s,s,s)}
    if(!q&&name==="halo")fx.halo.children.forEach(function(ch){if(ch.userData.a==null)return;var a=ch.userData.a+time*.8,rad=ch.userData.r||1.05;ch.position.x=Math.cos(a)*rad;ch.position.z=Math.sin(a)*rad});
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
    var h=Math.max(-0.02,landH(p.x,p.z));
    a.root.position.set(p.x,(a.baseY||0)+h,p.z);
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
    var lift=target.y||0;
    camera.position.set(target.x+dist*0.5,lift+dist*0.68,target.z+dist*1.0);
    camera.lookAt(target.x,lift+0.78,target.z);
    dir.position.set(target.x-5,lift+9,target.z+3);
    dir.target.position.set(target.x,lift+0.5,target.z);
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
    var marsh=regKey(s)==="fog";
    scene.fog.color.setHex(fk.c);scene.fog.near=fk.n;scene.fog.far=fk.f;
    renderer.setClearColor(fk.c,1);
    hemi.color.setHex(marsh?0xd5ddd8:0xfff3e4);
    hemi.groundColor.setHex(marsh?0x4a5c50:0x6a8458);
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
    var pp=wp(P.x+side*28,P.y+10,0);pet.position.set(pp.x,Math.max(-0.02,landH(pp.x,pp.z)),pp.z);pet.rotation.y=yawOf(dirH);pet.visible=true;
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
      mid.y=Math.max(0,landH(mid.x,mid.z));
      frameCam(mid,B.e.boss?14:12.4,38);
    }else{
      frameCam(hero.root.position,11.6,31);
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
      root.position.set((col-2)*2.72,0,row?5.1:0);
      root.rotation.y=0.4;
      group.add(root);
      var mixer=new THREE.AnimationMixer(root);
      var pose=MOOD[st]||MOOD.calm;
      var clip=shared[pose.clip]||shared.Idle;
      if(clip){var act=mixer.clipAction(clip);act.play();var markT=pose.hold!=null?pose.hold:(st==="panicked"?0.18:st==="exhausted"?0.62:0.35);mixer.setTime(Math.min(clip.duration-0.02,clip.duration*markT))}
      cast.push({root:root,mixer:mixer,pose:pose,clip:clip,row:row});
      var fxName=fxKey(pose.fx);
      if(fxName==="cloud"){root.add(fxPiece("cloud"));root.add(fxPiece("split"))}
      else if(fxName==="pack"){root.add(fxPiece("pack"));root.add(fxPiece("feet"))}
      else {var mark=fxPiece(fxName);if(mark)root.add(mark)}
    });
    var pad=new THREE.Mesh(new THREE.PlaneGeometry(48,36),new THREE.MeshStandardMaterial({color:0xd7e4cc,roughness:1}));
    pad.rotation.x=-Math.PI/2;pad.position.set(0,-0.02,2);
    var holder=new THREE.Scene();
    holder.add(new THREE.AmbientLight(0xfff6ea,0.7));
    holder.add(new THREE.HemisphereLight(0xfff8e8,0x7a9a55,0.55));
    var sun=new THREE.DirectionalLight(0xfff3d8,1.05);sun.position.set(-4,8,6);holder.add(sun);
    holder.add(pad);holder.add(group);
    holder.background=new THREE.Color(0xd7e4cc);
    var W=1700,H=980;
    function paint(now){
      if(!document.body.contains(cv))return;
      cast.forEach(function(a){if(!still()&&a.clip&&a.pose.hold==null)a.mixer.setTime(((now||0)/1000*(a.pose.speed||1))%(a.clip.duration||1))});
      sheetCam.fov=26;sheetCam.aspect=W/H;sheetCam.position.set(0,7.6,21.5);sheetCam.lookAt(0,0.35,2.3);sheetCam.updateProjectionMatrix();
      renderer.setPixelRatio(1);renderer.setSize(W,H,false);renderer.setClearColor(0xd7e4cc,1);
      var old=scene.fog;scene.fog=null;
      renderer.render(holder,sheetCam);
      scene.fog=old;
      var frame=document.getElementById("w-sheet-frame");
      if(!frame){frame=document.createElement("div");frame.id="w-sheet-frame";frame.style.cssText="position:relative;max-width:1600px";cv.parentNode.insertBefore(frame,cv);frame.appendChild(cv)}
      if(renderer.domElement.parentNode!==frame){renderer.domElement.id="w-sheet-gl";renderer.domElement.style.cssText="width:100%;height:auto;display:block;border-radius:12px;image-rendering:auto";frame.insertBefore(renderer.domElement,cv)}
      cv.width=W;cv.height=H;cv.style.cssText="position:absolute;left:0;top:0;width:100%;height:100%;background:transparent;pointer-events:none;image-rendering:auto";
      var c=cv.getContext("2d");c.clearRect(0,0,W,H);c.font="600 22px system-ui,sans-serif";c.fillStyle="#3a2412";c.textAlign="center";
      cast.forEach(function(a,i){
        var foot=new THREE.Vector3(),head=new THREE.Vector3();
        a.root.getWorldPosition(foot);head.copy(foot);foot.y=0.02;head.y=2.2;
        foot.project(sheetCam);head.project(sheetCam);
        var x=(foot.x*.5+.5)*W;
        var fy=(-foot.y*.5+.5)*H,hy=(-head.y*.5+.5)*H;
        var low=Math.max(fy,hy);
        c.fillText(labels[i],x,Math.min(H-14,low+50));
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
