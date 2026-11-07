import {Color3,DynamicTexture,Mesh,MeshBuilder,PointLight,Quaternion,StandardMaterial,TransformNode,Vector3,type Scene,type AbstractMesh} from '@babylonjs/core';
import {offeringModel,flicker,type OfferingKind} from './OfferingModels';
import {Drift,skyFlight,RELEASE_LIFE,WATER_Y,type Release} from '../../online/Releases';
import {BUBBLE,drawPrayer,drawPrayerTag} from '../chars/PrayerBubble';

type Item={r:Release;node?:TransformNode;flame?:AbstractMesh;halo?:AbstractMesh;drift?:Drift;pos:Vector3};
/**
 * Lotus lanterns and golden carp on the entrance river and sky lanterns in the air (anh Thanh 2026-11-05).
 * Shown within view range as instances of three small templates; prayer bubbles over the nearest lanterns and a few warm lights.
 */
export class RiverOfferings{
 private items=new Map<number,Item>();private templates=new Map<OfferingKind,ReturnType<typeof offeringModel>>();
 private bubbles:{mesh:Mesh;tex:DynamicTexture;id:number;str:Mesh}[]=[];private lights:PointLight[]=[];private t=0;private slow=0;
 constructor(private scene:Scene,private low=false){
  const strMat=new StandardMaterial('release-string',scene);strMat.emissiveColor=new Color3(.9,.84,.66);strMat.disableLighting=true;
  for(let i=0;i<(low?5:9);i++){const tex=new DynamicTexture('release-prayer-'+i,{width:BUBBLE.w,height:BUBBLE.h},scene,true);tex.hasAlpha=true;const mat=new StandardMaterial('release-prayer-mat-'+i,scene);mat.diffuseTexture=tex;mat.useAlphaFromDiffuseTexture=true;mat.emissiveColor=Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;
   const mesh=MeshBuilder.CreatePlane('release-prayer-'+i,{width:BUBBLE.meshW*.8,height:BUBBLE.meshH*.8},scene);mesh.material=mat;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.isPickable=false;mesh.setEnabled(false);
   const str=MeshBuilder.CreateCylinder('release-string-'+i,{diameter:.012,height:1,tessellation:4},scene);str.material=strMat;str.isPickable=false;str.setEnabled(false);this.bubbles.push({mesh,tex,id:-1,str});}
  for(let i=0;i<(low?1:3);i++){const l=new PointLight('release-light-'+i,Vector3.Zero(),scene);l.diffuse=new Color3(1,.72,.38);l.specular.setAll(0);l.range=7;l.intensity=0;this.lights.push(l);}
 }
 private template(kind:OfferingKind){let t=this.templates.get(kind);if(!t){t=offeringModel(this.scene,kind,'release-template-'+kind);t.root.position.set(0,-10000,0);this.templates.set(kind,t);}return t;}
 /** Replace / add the offerings the server knows. */
 set(list:Release[]){const keep=new Set(list.map(r=>r.id));for(const [id,it]of this.items)if(!keep.has(id)){it.node?.dispose();this.items.delete(id);}for(const r of list)this.add(r);}
 add(r:Release){if(this.items.has(r.id))return;this.items.set(r.id,{r,drift:r.kind==='sky'?undefined:new Drift(r),pos:new Vector3(r.x,r.y,r.z)});}
 get count(){return this.items.size;}
 update(dt:number,now:number,eye:Vector3){
  this.t+=dt;const near:{it:Item;d:number}[]=[];
  for(const [id,it]of this.items){const age=(now-it.r.t)/1000,life=RELEASE_LIFE[it.r.kind];
   if(age>life){it.node?.dispose();this.items.delete(id);continue;}
   // where it is now
   if(it.r.kind==='sky'){const f=skyFlight(it.r,age);it.pos.set(f.x,f.y,f.z);}
   else{const p=it.drift!.at(age);const bob=Math.sin(this.t*1.3+id)*.015;it.pos.set(p.x,it.r.kind==='fish'?WATER_Y-.035+Math.sin(this.t*1.7+id)*.025:WATER_Y+.01+bob,p.z);}
   const d=Vector3.Distance(eye,it.pos),view=it.r.kind==='sky'?(this.low?600:900):(this.low?220:380);
   if(d>view){if(it.node){it.node.dispose();it.node=undefined;}continue;}
   if(!it.node){const t=this.template(it.r.kind),n=t.root.instantiateHierarchy(null,undefined,(src,clone)=>{clone.name=src.name+'-'+id;}) as TransformNode;n.position.copyFrom(it.pos);it.node=n;
    for(const c of n.getChildMeshes()){if(c.name.includes('-flame'))it.flame=c;if(c.name.includes('-halo')){it.halo=c;c.billboardMode=Mesh.BILLBOARDMODE_ALL;}}}
   const n=it.node;n.position.copyFrom(it.pos);
   if(it.r.kind==='fish'){const p=it.drift!.at(age);n.rotation.y=p.yaw+Math.sin(this.t*7+id)*.22;n.scaling.setAll(1.6*(age>life-20?Math.max(.01,(life-age)/20):1));/* koi swim just under the surface (the water is opaque): back and fins show */}
   else if(it.r.kind==='lantern'){n.rotation.y=age*.05+id;n.rotation.z=Math.sin(this.t*1.1+id)*.04;}
   else{const f=skyFlight(it.r,age);n.scaling.setAll(Math.max(.01,f.fade));
    // lean downwind: tip the top toward the heading (rotation about the horizontal axis across the wind)
    n.rotationQuaternion=Quaternion.RotationAxis(new Vector3(Math.cos(f.dir),0,-Math.sin(f.dir)),f.lean).multiply(Quaternion.RotationYawPitchRoll(age*.15+id,0,0));}
   const k=flicker(this.t,id);if(it.flame)it.flame.scaling.set(1,k,1);if(it.halo)it.halo.scaling.setAll(.85+.25*k);
   if(it.r.kind!=='fish')near.push({it,d});
  }
  near.sort((a,b)=>a.d-b.d);
  // warm lights on the nearest flames
  this.lights.forEach((l,i)=>{const n=near[i];if(n&&n.d<45){l.position.copyFrom(n.it.pos).addInPlaceFromFloats(0,n.it.r.kind==='sky'?.4:.3,0);l.intensity=(n.it.r.kind==='sky'?1.4:.9)*flicker(this.t*1.3,n.it.r.id);l.range=n.it.r.kind==='sky'?12:7;}else l.intensity=0;});
  // prayers over the nearest lanterns
  this.slow-=dt;if(this.slow<=0){this.slow=.3;const want=near.filter(n=>n.d<(n.it.r.kind==='sky'?70:40)&&n.it.r.text).slice(0,this.bubbles.length).map(n=>n.it.r.id),keep=new Set(want);
   for(const b of this.bubbles)if(b.id>=0&&!keep.has(b.id)){b.id=-1;b.mesh.setEnabled(false);b.str.setEnabled(false);}
   for(const id of want)if(!this.bubbles.some(b=>b.id===id)){const b=this.bubbles.find(x=>x.id<0);if(!b)break;const it=this.items.get(id)!;b.id=id;const ctx=b.tex.getContext() as CanvasRenderingContext2D;if(it.r.kind==='sky')drawPrayerTag(ctx,it.r.text);else drawPrayer(ctx,it.r.text);b.tex.update();b.mesh.setEnabled(true);b.str.setEnabled(it.r.kind==='sky');}}
  for(const b of this.bubbles)if(b.id>=0){const it=this.items.get(b.id);if(!it){b.id=-1;b.mesh.setEnabled(false);b.str.setEnabled(false);continue;}
   if(it.r.kind!=='sky'){b.mesh.scaling.setAll(1);b.mesh.position.copyFrom(it.pos).addInPlaceFromFloats(0,.75,0);continue;}
   // Sky lantern (anh Thanh 2026-11-05): the prayer hangs on a string under the lantern's mouth, facing whoever looks up at it;
   // like a real tag it gets smaller as the lantern flies off and is gone with it (no distance scaling).
   const k=Math.max(.01,skyFlight(it.r,(now-it.r.t)/1000).fade),len=.35+.25*k,half=BUBBLE.meshH*.8/2*k,mouth=it.pos.y+.12;
   b.mesh.scaling.setAll(k);b.mesh.position.set(it.pos.x,mouth-len-half,it.pos.z);b.str.position.set(it.pos.x,mouth-len/2,it.pos.z);b.str.scaling.set(Math.min(3,k),len,Math.min(3,k));}
 }
 dispose(){for(const it of this.items.values())it.node?.dispose();for(const t of this.templates.values())t.root.dispose();for(const b of this.bubbles){b.tex.dispose();b.mesh.dispose();b.str.dispose();}for(const l of this.lights)l.dispose();}
}
