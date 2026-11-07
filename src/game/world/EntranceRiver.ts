import {Color3,DynamicTexture,Texture,Mesh,VertexData,StandardMaterial,ShaderMaterial,Vector3,type Scene} from '@babylonjs/core';
import {entranceGranite,ENTRANCE_GRANITE_REPEAT as G} from './EntranceGranite';
import {SanctuaryBatch} from './SanctuaryGeometry';import type{Rect}from './Obstacles';
import {ENTRANCE_RIVER as R,ENTRANCE_BRIDGE as B,entranceBridgeY,entranceBridgeBarriers,entranceWaterBarriers,ENTRANCE_STAIR_TREADS,ENTRANCE_STAIR_RANGES,ENTRANCE_BANK_RAILS,ENTRANCE_BRIDGE_PIERS,ENTRANCE_ARCH_RADIUS,entranceBridgeSoffitY}from './EntranceRiverPlan';
/** The legacy batch's tube normals point inward. Correct only these new stone tubes,
 * leaving existing temple geometry unchanged. */
class CarvedStoneBatch extends SanctuaryBatch{
 override tube(mat:StandardMaterial,points:number[][],r:number,n=8){const a=this.acc(mat),start=a.N.length;super.tube(mat,points,r,n);for(let i=start;i<a.N.length;i++)a.N[i]*=-1;}
}
/** Original white stone entrance work, batched geometry; no bought models. */
export function buildEntranceRiver(scene:Scene,low:boolean,at:{x:number;y:number;z:number}){
 const granite=entranceGranite(scene);
 const white=new StandardMaterial('entrance-carved-white-marble',scene);white.diffuseColor=Color3.FromHexString('#f2f1eb');white.specularColor.setAll(.24);white.specularPower=65;white.backFaceCulling=false;
 const inset=new StandardMaterial('entrance-stone-carving-shadows',scene);inset.diffuseColor=Color3.FromHexString('#c4cdcb');inset.specularColor.setAll(.12);inset.backFaceCulling=false;
 const slab=new StandardMaterial('entrance-pale-stone-paving',scene);slab.diffuseColor=Color3.FromHexString('#d5d9d4');slab.specularColor.setAll(.16);slab.backFaceCulling=false;
 const masonry=new StandardMaterial('bridge-solid-cut-stone',scene);masonry.diffuseColor=Color3.FromHexString('#e0ded4');masonry.specularColor.setAll(.07);masonry.backFaceCulling=false;
 const stoneTexture=new DynamicTexture('bridge-stone-block-joints',{width:1024,height:512},scene,true),ctx=stoneTexture.getContext();ctx.fillStyle='#a2a398';ctx.fillRect(0,0,1024,512);let seed=18;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let row=0;row<4;row++)for(let col=-1;col<5;col++){const x=col*256+(row%2?128:0),y=row*128,v=178+Math.floor(rnd()*24);ctx.fillStyle=`rgb(${v+5},${v+4},${v-4})`;ctx.fillRect(x+3,y+3,250,122);ctx.strokeStyle='#e9e8df';ctx.lineWidth=2;ctx.strokeRect(x+5,y+5,246,118);for(let k=0;k<90;k++){ctx.fillStyle=k%2?'#c2c3b8':'#abada2';ctx.fillRect(x+8+rnd()*238,y+8+rnd()*110,1+rnd()*3,1);}}stoneTexture.update();stoneTexture.wrapU=stoneTexture.wrapV=Texture.WRAP_ADDRESSMODE;stoneTexture.anisotropicFilteringLevel=8;masonry.diffuseTexture=stoneTexture;
 const riser=new StandardMaterial('river-stair-occluded-risers',scene);riser.diffuseColor=Color3.FromHexString('#8d9a96');riser.specularColor.setAll(.04);riser.emissiveColor=new Color3(.18,.20,.19);riser.backFaceCulling=false;riser.twoSidedLighting=true;
 const lip=new StandardMaterial('river-stair-white-nosings',scene);lip.diffuseColor=Color3.FromHexString('#f7f6ee');lip.specularColor.setAll(.08);lip.backFaceCulling=false;
 const contact=new StandardMaterial('river-stair-contact-shadow',scene);contact.diffuseColor=Color3.FromHexString('#4b5d56');contact.emissiveColor=new Color3(.03,.035,.03);contact.alpha=.25;contact.backFaceCulling=false;contact.disableLighting=true;
 const b=new CarvedStoneBatch(scene,at,'an-lien-entrance-river-stone'),obstacles:Rect[]=entranceWaterBarriers();
 const solid=(x:number,z:number,hx:number,hz:number,base:number,h:number)=>obstacles.push({cx:x,cz:z,hx,hz,base,h,yaw:0,sight:true,climb:false});
 const pavedFloor=(x0:number,x1:number,z0:number,z1:number,y:number)=>{b.floor(slab,x0,x1,z0,z1,y,.25);b.quad(granite.material,[x0,y+.004,z0],[x1,y+.004,z0],[x1,y+.004,z1],[x0,y+.004,z1],[x0/G,z0/G,x1/G,z1/G]);};
 // Openwork panels: a lotus medallion and mirrored cloud scrolls in real rounded relief.
 const panel=(x:number,z:number,y:number,dx:number,dz:number,length:number)=>{const p=(u:number,v:number)=>[x+dx*u,y+v,z+dz*u];b.tube(white,[p(-length/2,.12),p(length/2,.12)],.11,6);b.tube(white,[p(-length/2,1.12),p(length/2,1.12)],.13,6);
  const circle=Array.from({length:13},(_,i)=>p(Math.cos(i/12*Math.PI*2)*.37,.62+Math.sin(i/12*Math.PI*2)*.37));b.tube(white,circle,.045,5);
  for(const side of [-1,1]){const pts=Array.from({length:9},(_,i)=>{const t=i/8;return p(side*(.28+t*(length/2-.4)),.62+Math.sin(t*Math.PI*2)*.25);});b.tube(white,pts,.05,5);for(const s of [-1,1])b.tube(inset,[p(side*.22,.62),p(side*.13,.62+s*.23),p(0,.62+s*.3),p(-side*.13,.62+s*.23),p(-side*.22,.62)],.025,4);}
 };
 const post=(x:number,z:number,y:number)=>{b.box(white,x,y+.12,z,.7,.24,.7);b.box(white,x,y+.68,z,.34,1.05,.34);b.box(inset,x,y+.7,z+.175,.18,.64,.018);b.lathe(white,x,y+1.18,z,[[.28,0],[.3,.1],[.18,.2],[.25,.32],[.1,.48],[0,.57]],10);};
 const straight=(x0:number,z0:number,x1:number,z1:number,y:number)=>{const length=Math.hypot(x1-x0,z1-z0),n=Math.ceil(length/6),dx=(x1-x0)/length,dz=(z1-z0)/length;for(let i=0;i<=n;i++)post(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,y);for(let i=0;i<n;i++)panel(x0+(x1-x0)*(i+.5)/n,z0+(z1-z0)*(i+.5)/n,y,dx,dz,length/n);solid((x0+x1)/2,(z0+z1)/2,Math.max(.22,Math.abs(x1-x0)/2),Math.max(.22,Math.abs(z1-z0)/2),y,1.4);};
 // Continuous solid-backed stairs begin with a level landing overlapping the bank.
 const last=ENTRANCE_STAIR_TREADS.at(-1)!;b.box(masonry,0,(R.bed+last.y)/2,last.z1+.05,790,last.y-R.bed,.4);b.box(masonry,0,-2.5,R.z1,790,5,.55);b.floor(white,-395,395,R.z1-.65,R.z1+.65,.015,.24);
 pavedFloor(-395,395,R.z1,710,.02);pavedFloor(-10,10,554,585,.025);
 for(const [x0,z0,x1,z1]of ENTRANCE_BANK_RAILS)straight(x0,z0,x1,z1,0);
 // Contrast and local contact shading remain visible with real-time shadows disabled on Low.
 for(const [x0,x1]of ENTRANCE_STAIR_RANGES){pavedFloor(x0,x1,585,R.stairStart+.05,.025);for(const [i,t]of ENTRANCE_STAIR_TREADS.entries()){
  b.floor(i%2?white:slab,x0,x1,t.z0-.015,t.z1+.015,t.y,t.y-R.bed+.05);
  const line=t.z1-.07;b.quad(lip,[x0,t.y+.008,line],[x1,t.y+.008,line],[x1,t.y+.008,t.z1+.008],[x0,t.y+.008,t.z1+.008]);
  if(i>0){const z=t.z0+.022,top=ENTRANCE_STAIR_TREADS[i-1].y;b.quad(riser,[x1,t.y,z],[x0,t.y,z],[x0,top,z],[x1,top,z]);b.quad(contact,[x0,t.y+.009,z],[x1,t.y+.009,z],[x1,t.y+.009,z+.16],[x0,t.y+.009,z+.16]);}
 }}
 // Circular stone vault, inset voussoir joints, paving and balustrades follow the same curve as feet.
 const n=140;
 for(let i=0;i<n;i++){const z0=B.z-B.halfRun+2*B.halfRun*i/n,z1=B.z-B.halfRun+2*B.halfRun*(i+1)/n,y0=entranceBridgeY(z0)!,y1=entranceBridgeY(z1)!;
  for(let j=0;j<4;j++){const x0=-B.halfWidth+j*B.halfWidth/2,x1=x0+B.halfWidth/2;b.quad(granite.material,[x0,y0,z0],[x1,y0,z0],[x1,y1,z1],[x0,y1,z1],[x0/G,z0/G,x1/G,z1/G]);}
  const bottom0=entranceBridgeSoffitY(z0),bottom1=entranceBridgeSoffitY(z1);b.quad(masonry,[-7,bottom0,z0],[-7,bottom1,z1],[7,bottom1,z1],[7,bottom0,z0]);
  for(const side of [-1,1]){const x=side*7;b.quad(masonry,[x,y0,z0],[x,y1,z1],[x,bottom1,z1],[x,bottom0,z0]);if(side>0){const normals=b.acc(masonry).N;for(let k=normals.length-12;k<normals.length;k++)normals[k]*=-1;}const uvs=b.acc(masonry).UVs,start=uvs.length-8;uvs.splice(start,8,z0/8,y0/4,z1/8,y1/4,z1/8,bottom1/4,z0/8,bottom0/4);}
 }
 for(const side of [-1,1]){const x=side*7;for(const h of [.18,.72,1.25])b.tube(white,Array.from({length:141},(_,i)=>{const z=B.z-B.halfRun+i/140*B.halfRun*2;return[x,entranceBridgeY(z)!+h,z];}),.13,6);for(let i=0;i<=Math.ceil(B.halfRun);i++){const count=Math.ceil(B.halfRun),spacing=2*B.halfRun/count,z=B.z-B.halfRun+i*spacing;if(i>0&&i<count)post(x,z,entranceBridgeY(z)!);if(i<count){const zz=z+spacing/2;panel(x,zz,entranceBridgeY(zz)!,0,1,spacing-.1);}}}
 // White voussoirs frame the actual semicircular opening on both sides.
 for(const side of [-1,1])for(let i=0;i<36;i++){const a=i/36*Math.PI,c=(i+1)/36*Math.PI,x=side*7.025,point=(r:number,t:number)=>[x,R.water+Math.sin(t)*r,B.z+Math.cos(t)*r];const mat=i%2?white:slab;b.quad(mat,point(ENTRANCE_ARCH_RADIUS,a),point(ENTRANCE_ARCH_RADIUS,c),point(ENTRANCE_ARCH_RADIUS+.6,c),point(ENTRANCE_ARCH_RADIUS+.6,a));if(side>0){const normals=b.acc(mat).N;for(let k=normals.length-12;k<normals.length;k++)normals[k]*=-1;}}
 for(const z of [B.z-B.halfRun,B.z+B.halfRun])b.quad(masonry,[-7,0,z],[7,0,z],[7,R.bed,z],[-7,R.bed,z]);
 // Four square carved corner pillars, much larger than the ordinary rail posts.
 for(const p of ENTRANCE_BRIDGE_PIERS){b.box(white,p.x,.2,p.z,3.3,.4,3.3);b.box(slab,p.x,.55,p.z,2.9,.3,2.9);b.box(white,p.x,2.45,p.z,2,3.5,2);b.box(slab,p.x,4.3,p.z,2.4,.3,2.4);b.box(white,p.x,4.65,p.z,3,.4,3);b.box(white,p.x,5.05,p.z,2.5,.4,2.5);b.box(slab,p.x,5.35,p.z,2.1,.2,2.1);
  for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const point=(u:number,v:number)=>[p.x+dx*1.02-dz*u,v,p.z+dz*1.02+dx*u];b.tube(slab,[point(-.72,.95),point(-.72,3.95),point(.72,3.95),point(.72,.95),point(-.72,.95)],.045,5);for(const y of [1.5,2.45,3.4])for(let petal=0;petal<6;petal++){const a=petal*Math.PI/3;b.tube(white,Array.from({length:13},(_,k)=>{const t=k/12*Math.PI*2,r=.2+.13*Math.cos(t);return point(r*Math.cos(a)-.07*Math.sin(t)*Math.sin(a),y+r*Math.sin(a)+.07*Math.sin(t)*Math.cos(a));}),.035,5);}}
  solid(p.x,p.z,p.width/2,p.width/2,0,p.height);
 }
 obstacles.push(...entranceBridgeBarriers());const stone=b.build();
 // Small ripples and sky/sun glints, without full-screen refraction or extra reflection passes.
 const water=new Mesh('entrance-blue-river-ripples',scene),data=new VertexData(),pos:number[]=[],indices:number[]=[],nx=low?100:200,nz=Math.ceil((R.z1-R.z0)/(low?2.5:1.25));
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)pos.push(R.x0+i*(R.x1-R.x0)/nx,R.water,R.z0+j*(R.z1-R.z0)/nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;indices.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}data.positions=pos;data.indices=indices;data.applyToMesh(water);water.position.set(at.x,at.y,at.z);water.isPickable=false;
 const wm=new ShaderMaterial('entrance-azure-water',scene,{vertexSource:`precision highp float;attribute vec3 position;uniform mat4 worldViewProjection;uniform mat4 world;uniform float clock;varying vec3 p;void main(){vec3 v=position;v.y+=.025*sin(v.x*.7+clock*1.1)+.016*sin(v.z*2.4+v.x*.3-clock*.8);p=(world*vec4(v,1.)).xyz;gl_Position=worldViewProjection*vec4(v,1.);}`,fragmentSource:`precision highp float;varying vec3 p;uniform vec3 eye;uniform float clock;void main(){float a=p.x*.7+clock*1.1,b=p.z*2.4+p.x*.3-clock*.8;vec3 n=normalize(vec3(-.0175*cos(a)-.0048*cos(b),1.,-.0384*cos(b)));vec3 v=normalize(eye-p);float f=pow(1.-max(0.,dot(n,v)),3.);vec3 c=mix(vec3(.025,.27,.55),vec3(.35,.68,.86),f*.75);float spark=pow(max(0.,dot(n,normalize(v+normalize(vec3(-.5,1.,-.7))))),130.);c+=spark*vec3(.75,.81,.83);c+=.018*sin(p.x*1.7+p.z*3.8+clock);gl_FragColor=vec4(c,1.);}`},{attributes:['position'],uniforms:['worldViewProjection','world','clock','eye']});wm.backFaceCulling=false;water.material=wm;let clock=0;const observer=scene.onBeforeRenderObservable.add(()=>{clock+=Math.min(.1,scene.getEngine().getDeltaTime()/1000);wm.setFloat('clock',clock);wm.setVector3('eye',scene.activeCamera?.globalPosition??Vector3.Zero());});
 return{batch:stone,obstacles,water,dispose(){scene.onBeforeRenderObservable.remove(observer);water.dispose();wm.dispose();stone.dispose();white.dispose();inset.dispose();slab.dispose();masonry.dispose();riser.dispose();lip.dispose();contact.dispose();stoneTexture.dispose();granite.dispose();},review:{width:790,riverSpan:R.z1-R.z0,water:R.water,bridgeRise:B.rise,bridgeSpan:B.halfRun*2}};
}
