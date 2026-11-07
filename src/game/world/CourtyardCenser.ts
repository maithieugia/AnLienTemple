import {Color3,Color4,DynamicTexture,LoadAssetContainerAsync,Material,Matrix,PBRMaterial,MeshBuilder,ParticleSystem,Quaternion,RegisterSceneLoaderPlugin,SceneLoader,StandardMaterial,TransformNode,Vector3,type AssetContainer,type Mesh,type Scene}from '@babylonjs/core';
import {GLTFFileLoader}from '@babylonjs/loaders/glTF';
import {COURTYARD_CENSER as C,COURTYARD_CENSER_SCALE as SCALE}from './SanctuaryPlan';
import {addObstacle,removeObstacle,type Rect}from './Obstacles';

/**
 * The great stone incense burner in the courtyard, between the hall's main door and the Amitabha terrace (anh Thanh 2026-11-03):
 * his model (authoring/censer/prepare_censer.py, 1.6 m), three big burning sticks with thick rising smoke,
 * and a bed of small sticks left by pilgrims. Online offerings at this site are drawn by OnlineGame on the same ash bed.
 */
const BASE=import.meta.env.BASE_URL+'assets/sanctuary/censer/';
export class CourtyardCenser{
 private containers=new Map<'high'|'low',AssetContainer>();private shown?:{level:'high'|'low';root:TransformNode;dispose:()=>void};
 private parts:{dispose:()=>void}[]=[];private smoke:ParticleSystem[]=[];private rect?:Rect;private dead=false;readonly origin:Vector3;
 constructor(private scene:Scene,private low:boolean,at:{x:number;y:number;z:number}){
  this.origin=new Vector3(at.x+C.x,at.y,at.z+C.z);
  this.rect={cx:this.origin.x,cz:this.origin.z,hx:C.footprint,hz:C.footprint,yaw:0,base:at.y,h:C.height,sight:true,climb:false};addObstacle(this.rect);
  this.sticks();void this.load();
 }
 private async load(){try{if(!SceneLoader.IsPluginForExtensionAvailable('.glb'))RegisterSceneLoaderPlugin(new GLTFFileLoader());
  for(const level of ['low','high']as const){const c=await LoadAssetContainerAsync(BASE+level+'-welded.glb',this.scene);if(this.dead){c.dispose();return;}for(const mat of c.materials){if(!(mat instanceof PBRMaterial))continue;
    mat.alpha=1;mat.transparencyMode=Material.MATERIAL_OPAQUE;mat.useAlphaFromAlbedoTexture=false;
    mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.disableDepthWrite=false;
   }this.containers.set(level,c);}
 }catch(e){console.warn('Courtyard censer model unavailable',e);}}
 private sticks(){const s=this.scene,o=this.origin,ash=o.y+C.ash;
  const mat=(name:string,hex:string,emissive?:Color3)=>{const m=new StandardMaterial('al-censer-'+name,s);m.diffuseColor=Color3.FromHexString(hex);m.specularColor.setAll(.04);if(emissive){m.emissiveColor=emissive;m.disableLighting=true;}return m;};
  // a bed of grey ash filling the bowl
  const bed=MeshBuilder.CreateCylinder('al-censer-ash',{diameter:C.bowlR*2,height:.06,tessellation:28},s);bed.material=mat('ash','#8d8780');bed.position.set(o.x,ash-.03,o.z);bed.isPickable=false;this.parts.push(bed);
  // three great sticks (nhang trụ): red body with a gold band, glowing tip
  const red=mat('big-stick','#8e2a1c'),gold=mat('big-band','#c9a24a'),coal=mat('big-coal','#ff6a2a',new Color3(1,.45,.15));
  C.bigSticks.forEach((b,i)=>{const root=new TransformNode('al-censer-big-'+i,s);root.position.set(o.x+b.x*SCALE,ash,o.z+b.z*SCALE);root.scaling.setAll(SCALE);root.rotationQuaternion=Quaternion.RotationYawPitchRoll(0,b.lean,b.tilt);this.parts.push(root);
   const body=MeshBuilder.CreateCylinder('al-censer-big-body-'+i,{height:b.h,diameterTop:.055,diameterBottom:.07,tessellation:12},s);body.material=red;body.parent=root;body.position.y=b.h/2;body.isPickable=false;
   const band=MeshBuilder.CreateCylinder('al-censer-big-band-'+i,{height:.12,diameter:.078,tessellation:12},s);band.material=gold;band.parent=root;band.position.y=.18;band.isPickable=false;
   const tip=MeshBuilder.CreateSphere('al-censer-big-tip-'+i,{diameter:.075,segments:6},s);tip.material=coal;tip.parent=root;tip.position.y=b.h;tip.scaling.y=1.4;tip.isPickable=false;
   root.computeWorldMatrix(true);this.smoke.push(this.plume(tip.getAbsolutePosition().clone(),1));});
  // small sticks pilgrims left in the ash: thin-instanced bodies and embers (some burnt down)
  const thin=MeshBuilder.CreateCylinder('al-censer-small',{height:1,diameter:.012,tessellation:5},s);thin.material=mat('small','#a2452b');thin.isPickable=false;
  const ember=MeshBuilder.CreateSphere('al-censer-small-ember',{diameter:.022,segments:3},s);ember.material=mat('small-coal','#ff7a33',new Color3(1,.5,.18));ember.isPickable=false;
  const m1:number[]=[],m2:number[]=[];for(let k=0;k<C.smallSticks;k++){const a=k*2.39996,r=C.bowlR*.9*Math.sqrt((k+.5)/C.smallSticks),x=o.x+Math.cos(a)*r,z=o.z+Math.sin(a)*r;if(C.bigSticks.some(b=>Math.hypot(o.x+b.x*SCALE-x,o.z+b.z*SCALE-z)<.06*SCALE))continue;
   const h=.12+.3*((k*37)%11)/11,q=Quaternion.RotationYawPitchRoll(a,.05+.1*((k*13)%7)/7,0),top=Vector3.TransformCoordinates(new Vector3(0,h,0),Matrix.Compose(Vector3.One(),q,Vector3.Zero()));
   m1.push(...Matrix.Compose(new Vector3(1,h,1),q,new Vector3(x+top.x/2,ash+top.y/2,z+top.z/2)).asArray());if(k%3)m2.push(...Matrix.Compose(Vector3.One(),Quaternion.Identity(),new Vector3(x+top.x,ash+top.y,z+top.z)).asArray());}
  thin.thinInstanceSetBuffer('matrix',new Float32Array(m1),16,true);ember.thinInstanceSetBuffer('matrix',new Float32Array(m2),16,true);this.parts.push(thin,ember);
  // a softer haze from the small sticks, rising off the whole bowl
  this.smoke.push(this.plume(new Vector3(o.x,ash+.15,o.z),.55,C.bowlR*.7));
 }
 /** Thick rising incense smoke: grows wide, drifts, thins out over ~8 s. */
 private plume(at:Vector3,strength:number,spread=.01){const s=this.scene;let tex=s.getTextureByName('al-censer-smoke') as DynamicTexture|null;
  if(!tex){tex=new DynamicTexture('al-censer-smoke',{width:128,height:128},s,false);const c=tex.getContext() as CanvasRenderingContext2D,g=c.createRadialGradient(64,64,0,64,64,62);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.45,'rgba(255,255,255,.32)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128);tex.hasAlpha=true;tex.update();}
  const p=new ParticleSystem('al-censer-plume',this.low?120:260,s);p.particleTexture=tex;p.emitter=at;p.minEmitBox=new Vector3(-spread,0,-spread);p.maxEmitBox=new Vector3(spread,0,spread);
  p.color1=new Color4(.88,.9,.94,.42*strength);p.color2=new Color4(.72,.76,.84,.32*strength);p.colorDead=new Color4(.7,.74,.8,0);
  p.minLifeTime=5;p.maxLifeTime=8.5;p.emitRate=(this.low?22:45)*strength;p.blendMode=ParticleSystem.BLENDMODE_STANDARD;
  p.direction1=new Vector3(-.05,.5,-.04);p.direction2=new Vector3(.07,.75,.05);p.minEmitPower=.45;p.maxEmitPower=.75;p.gravity=new Vector3(.03,.06,.01);
  p.addSizeGradient(0,.05);p.addSizeGradient(.35,.45*strength+.15);p.addSizeGradient(1,1.4*strength+.4);p.minAngularSpeed=-.3;p.maxAngularSpeed=.3;p.start();return p;}
 update(p:{x:number;z:number}){if(this.dead)return;const d=Math.hypot(p.x-this.origin.x,p.z-this.origin.z),level:'high'|'low'=!this.low&&d<45?'high':'low';
  for(const ps of this.smoke){const on=d<260;if(on&&!ps.isStarted())ps.start();if(!on&&ps.isStarted())ps.stop();}
  if(this.shown?.level===level)return;const c=this.containers.get(level)??this.containers.get('low');if(!c)return;const real=this.containers.has(level)?level:'low';if(this.shown?.level===real)return;
  this.shown?.dispose();const root=new TransformNode('al-courtyard-censer',this.scene),inst=c.instantiateModelsToScene(n=>'al-censer-'+real+'-'+n,false);for(const r of inst.rootNodes)r.parent=root;root.position.copyFrom(this.origin);root.rotation.y=C.yaw;root.scaling.setAll(SCALE);
  for(const m of root.getChildMeshes()){m.isPickable=false;(m as Mesh).receiveShadows=true;}this.shown={level:real,root,dispose:()=>{inst.dispose();root.dispose();}};}
 dispose(){this.dead=true;this.shown?.dispose();for(const p of this.parts)p.dispose();for(const p of this.smoke)p.dispose();for(const c of this.containers.values())c.dispose();if(this.rect)removeObstacle(this.rect);}
}
