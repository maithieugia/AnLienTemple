import {Color3,DynamicTexture,Mesh,MeshBuilder,StandardMaterial,TransformNode,Vector3,type Scene} from '@babylonjs/core';

/**
 * Small hand-built models for the released offerings (anh Thanh 2026-11-05): a lotus lantern with a burning candle, a golden carp and
 * a paper sky lantern. Each is a few merged meshes, so hundreds of them can be shown as instances. Flames and halos are unlit and flicker.
 */
export type OfferingKind='lantern'|'fish'|'sky';
type Kit={mat:(name:string,hex:string,emissive?:number,alpha?:number)=>StandardMaterial;halo:StandardMaterial;flame:StandardMaterial};
const kits=new WeakMap<Scene,Kit>();
function kit(scene:Scene):Kit{
 let k=kits.get(scene);if(k)return k;
 const mats=new Map<string,StandardMaterial>();
 const mat=(name:string,hex:string,emissive=0,alpha=1)=>{let m=mats.get(name);if(m)return m;m=new StandardMaterial('offering-'+name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor.setAll(.15);m.emissiveColor=Color3.FromHexString(hex).scale(emissive);m.alpha=alpha;m.backFaceCulling=false;mats.set(name,m);return m;};
 const tex=new DynamicTexture('offering-halo',{width:128,height:128},scene,false),c=tex.getContext() as CanvasRenderingContext2D,g=c.createRadialGradient(64,64,0,64,64,64);
 g.addColorStop(0,'rgba(255,226,150,1)');g.addColorStop(.25,'rgba(255,190,90,.55)');g.addColorStop(1,'rgba(255,150,40,0)');c.fillStyle=g;c.fillRect(0,0,128,128);tex.update();tex.hasAlpha=true;
 const halo=new StandardMaterial('offering-halo',scene);halo.diffuseTexture=tex;halo.opacityTexture=tex;halo.emissiveColor=new Color3(1,.82,.5);halo.disableLighting=true;halo.alphaMode=1/*ADD*/;halo.backFaceCulling=false;halo.disableDepthWrite=true;
 const flame=new StandardMaterial('offering-flame',scene);flame.emissiveColor=new Color3(1,.78,.32);flame.diffuseColor=Color3.Black();flame.disableLighting=true;
 k={mat,halo,flame};kits.set(scene,k);return k;
}
/** Sky-lantern paper: warm gradient (brightest near the flame at the mouth), vertical bamboo ribs and two horizontal seams; self-lit. */
const papers=new WeakMap<Scene,StandardMaterial>();
function skyPaper(scene:Scene){
 let m=papers.get(scene);if(m)return m;
 const tex=new DynamicTexture('offering-sky-paper',{width:128,height:128},scene,true),c=tex.getContext() as CanvasRenderingContext2D,g=c.createLinearGradient(0,0,0,128);
 // v runs bottom → top on the cylinder; canvas y=0 is the top of the texture (= top of the lantern)
 g.addColorStop(0,'#c23a14');g.addColorStop(.55,'#f2741f');g.addColorStop(1,'#ffd27a');c.fillStyle=g;c.fillRect(0,0,128,128);
 c.fillStyle='rgba(90,40,10,.75)';for(let i=0;i<8;i++)c.fillRect(i*16,0,2,128);c.fillRect(0,40,128,2);c.fillRect(0,84,128,2);tex.update();
 m=new StandardMaterial('offering-sky-paper',scene);m.diffuseTexture=tex;m.emissiveTexture=tex;m.emissiveColor=new Color3(.75,.75,.75);m.specularColor.setAll(0);m.backFaceCulling=false;
 papers.set(scene,m);return m;
}
const merge=(parts:Mesh[],name:string)=>{const m=Mesh.MergeMeshes(parts,true,true,undefined,false,true)!;m.name=name;m.isPickable=false;return m;};

/** A template: `body` (merged, multi-material), an unlit `flame` and a billboard `halo` under one root. Instantiate with root.instantiateHierarchy(). */
export function offeringModel(scene:Scene,kind:OfferingKind,name:string){
 const K=kit(scene),root=new TransformNode(name,scene),parts:Mesh[]=[];let flame:Mesh|undefined,halo:Mesh|undefined;
 const add=(m:Mesh,mat:StandardMaterial)=>{m.material=mat;parts.push(m);return m;};
 if(kind==='lantern'){
  const leaf=add(MeshBuilder.CreateCylinder(name+'-leaf',{diameter:.56,height:.03,tessellation:24},scene),K.mat('leaf','#3f8a4a',.12));leaf.position.y=.015;
  for(const [n,r,tilt,y,len,col] of [[8,.16,.95,.07,.17,'#f27aa6'],[6,.09,.55,.11,.13,'#ffc4d8']] as const){
   for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(n===6?.3:0),p=add(MeshBuilder.CreateSphere(name+'-petal',{segments:6,diameterX:.09,diameterY:.035,diameterZ:len},scene),K.mat('petal-'+col,col,.22));
    p.position.set(Math.sin(a)*r,y,Math.cos(a)*r);p.rotation.set(-tilt,a,0);}
  }
  const candle=add(MeshBuilder.CreateCylinder(name+'-candle',{diameter:.05,height:.12,tessellation:10},scene),K.mat('candle','#fff4dc',.25));candle.position.y=.12;
  flame=MeshBuilder.CreateSphere(name+'-flame',{segments:6,diameterX:.032,diameterY:.075,diameterZ:.032},scene);flame.material=K.flame;flame.position.y=.215;
  halo=MeshBuilder.CreatePlane(name+'-halo',{size:.9},scene);halo.material=K.halo;halo.position.y=.22;
 }else if(kind==='fish'){
  const gold=K.mat('carp','#f0a21e',.28),fin=K.mat('carp-fin','#ffcf6a',.3,.92);
  const body=add(MeshBuilder.CreateSphere(name+'-body',{segments:10,diameterX:.11,diameterY:.1,diameterZ:.34},scene),gold);
  const head=add(MeshBuilder.CreateSphere(name+'-head',{segments:8,diameterX:.085,diameterY:.08,diameterZ:.12},scene),K.mat('carp-head','#e98f12',.25));head.position.z=.15;
  for(const s of [-1,1]){const t=add(MeshBuilder.CreatePlane(name+'-tail',{width:.14,height:.12},scene),fin);t.position.set(s*.0,0,-.21);t.rotation.set(0,Math.PI/2,s*.5);
   const f=add(MeshBuilder.CreatePlane(name+'-fin',{width:.07,height:.04},scene),fin);f.position.set(s*.055,-.03,.05);f.rotation.set(0,0,s*.6);}
  const dorsal=add(MeshBuilder.CreatePlane(name+'-dorsal',{width:.16,height:.05},scene),fin);dorsal.position.set(0,.055,-.02);dorsal.rotation.y=Math.PI/2;
 }else{
  // Opaque glowing paper with bamboo ribs (anh Thanh 2026-11-05: seen from below only the ring showed, the walls were lost in the glow).
  const paperMat=skyPaper(scene);
  const paper=add(MeshBuilder.CreateCylinder(name+'-paper',{diameterTop:.72,diameterBottom:.52,height:.95,tessellation:16,cap:Mesh.NO_CAP},scene),paperMat);paper.position.y=.6;
  const top=add(MeshBuilder.CreateDisc(name+'-top',{radius:.36,tessellation:16},scene),K.mat('sky-top','#c8401c',.5));top.rotation.x=-Math.PI/2;top.position.y=1.075;
  const ring=add(MeshBuilder.CreateTorus(name+'-ring',{diameter:.52,thickness:.025,tessellation:16},scene),K.mat('sky-ring','#6b4520'));ring.position.y=.125;
  for(let i=0;i<2;i++){const bar=add(MeshBuilder.CreateCylinder(name+'-cross',{diameter:.012,height:.5,tessellation:4},scene),K.mat('sky-ring','#6b4520'));bar.rotation.set(Math.PI/2,i*Math.PI/2,0);bar.position.y=.125;}
  flame=MeshBuilder.CreateSphere(name+'-flame',{segments:6,diameterX:.09,diameterY:.16,diameterZ:.09},scene);flame.material=K.flame;flame.position.y=.16;
  halo=MeshBuilder.CreatePlane(name+'-halo',{size:1.25},scene);halo.material=K.halo;halo.position.y=.2;
 }
 const body=merge(parts,name+'-body');body.parent=root;
 for(const m of [flame,halo])if(m){m.parent=root;m.isPickable=false;}
 if(halo)halo.billboardMode=Mesh.BILLBOARDMODE_ALL;
 return{root,body,flame,halo};
}
/** Flicker for flames and halos (same look everywhere, a little different per offering). */
export function flicker(t:number,seed:number){return .86+.1*Math.sin(t*13.1+seed)+.06*Math.sin(t*23.7+seed*1.7)+.04*Math.sin(t*5.3+seed*.3);}
export const UP=Vector3.Up();
