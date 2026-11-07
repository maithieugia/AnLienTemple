import {Color3,Matrix,Mesh,MeshBuilder,StandardMaterial,PBRMaterial,Quaternion,Vector3,VertexBuffer,VertexData,DynamicTexture,type Scene,type AbstractMesh} from '@babylonjs/core';
import {AoDaiCollection} from './AoDaiCollection';
import {AO_DAI_COLLECTION} from './AoDaiCollectionPlan';
import {clusterMesh} from './CrowdMesh';
import {RocketboxPlayer,RocketboxPlayerLibrary} from './RocketboxPlayer';
import {BUBBLE,drawPrayer} from './PrayerBubble';
import {VISITOR_PRAYERS,NAM_OUTFITS} from '../../online/protocol';
import type {Act} from '../../online/protocol';
export type CrowdVisual={index:number;x:number;y:number;z:number;yaw:number;pose:string;offering?:boolean};
type Actor=ReturnType<AoDaiCollection['create']>;
type Batch={mesh:Mesh;look:number;pose:string;detail:'mid'|'far';part:'coat'|'pants'|'body'};
type Slot={key:number;person:number;pose:string;woman?:Actor;man?:RocketboxPlayer};
/** Filming (?film=1, capture only): twice the animated people and twice the reach, so a flying camera sees pilgrims moving. */
const FILM=typeof location!=='undefined'&&new URLSearchParams(location.search).has('film');
/** Men in the grounds are Nam 01 in his áo lam or a plain colour (anh Thanh 2026-11-04: 100 men, 100 women; men = Nam 01 only). */
const MEN=NAM_OUTFITS;
const MAN_KEY=100;
const POSES=['Idle','prayer','sit','kneel','bow','Push','Walk0','Walk1'];
const MAN_ACT:Record<string,Act>={Idle:'idle',prayer:'incense',sit:'sit',kneel:'kneel',bow:'bow',Push:'wheel',Walk:'walk'};
/** Persistent people (odd index = man, even = woman), bounded close rigs, shared baked/instanced far LODs, prayer bubbles near the viewer. */
export class TempleCrowdRenderer{
 private incense?:Mesh;private ember?:Mesh;private batches:Batch[]=[];private pool:Slot[]=[];private assignments=new Map<number,number>();private debt=0;private elapsed=0;private dead=false;private men=false;
 private bubbles:{mesh:Mesh;tex:DynamicTexture;person:number}[]=[];private bubbleOf=new Map<number,number>();
 constructor(private scene:Scene,private library:AoDaiCollection,private low:boolean){}
 /** Which look batch a person uses: 0–9 the ten áo dài, 100+ the men's clothes. */
 private key(index:number){return this.men&&index%2===1?MAN_KEY+Math.floor(index/2)%MEN.length:Math.floor(index/2)%10;}
 private bake(parts:AbstractMesh[],look:number,pose:string,coatName='collection_coat',pantsName='collection_trousers'){
  for(const part of parts){
   if(!(part instanceof Mesh)||!part.getTotalVertices()||!(part.material instanceof PBRMaterial))continue;
   const positions=part.getPositionData(true,true);if(!positions)continue;const world=part.computeWorldMatrix(true),scaled:number[]=[];
   for(let i=0;i<positions.length;i+=3){const v=Vector3.TransformCoordinates(Vector3.FromArray(positions,i),world);scaled.push(v.x,v.y,v.z);}
   const kind=part.material.name.includes(coatName)?'coat':part.material.name.includes(pantsName)?'pants':'body';
   const uv=part.getVerticesData(kind==='coat'?VertexBuffer.UV3Kind:VertexBuffer.UVKind)??new Float32Array(scaled.length/3*2);
   for(const detail of ['mid','far'] as const){
    const data=clusterMesh(scaled,part.getIndices()!,uv,detail==='far'?.18:this.low?.065:.045,detail==='far'?2:8),vd=new VertexData();vd.positions=data.positions;vd.indices=data.indices;vd.uvs=data.uvs;const normals:number[]=[];VertexData.ComputeNormals(data.positions,data.indices,normals);vd.normals=normals;
    const mesh=new Mesh(`resident-lod-${look}-${pose}-${part.name}`,this.scene);vd.applyToMesh(mesh);mesh.isPickable=false;mesh.receiveShadows=false;
    const mat=new PBRMaterial(mesh.name+'-material',this.scene),old=part.material;mat.albedoColor=kind==='pants'?Color3.White():old.albedoColor.clone();mat.metallic=0;mat.roughness=.85;mat.backFaceCulling=false;
    if(kind!=='pants'&&old.albedoTexture){mat.albedoTexture=old.albedoTexture.clone();mat.albedoTexture!.coordinatesIndex=0;}
    mesh.material=mat;mesh.setEnabled(false);this.batches.push({mesh,look,pose,detail,part:kind});
   }
  }
 }
 async load(){
  const red=new StandardMaterial('visitor-incense-red',this.scene);red.diffuseColor=Color3.FromHexString('#aa3927');const coal=new StandardMaterial('visitor-incense-coal',this.scene);coal.emissiveColor=Color3.FromHexString('#ff7b38');coal.disableLighting=true;
  this.incense=MeshBuilder.CreateCylinder('visitor-held-incense',{height:.35,diameter:.012,tessellation:5},this.scene);this.incense.material=red;this.incense.isPickable=false;
  this.ember=MeshBuilder.CreateSphere('visitor-held-incense-ember',{diameter:.025,segments:3},this.scene);this.ember.material=coal;this.ember.isPickable=false;
  // prayer bubbles: a small pool reused by whoever is nearest
  for(let i=0;i<(this.low?6:12);i++){const tex=new DynamicTexture('visitor-prayer-'+i,{width:BUBBLE.w,height:BUBBLE.h},this.scene,true);tex.hasAlpha=true;const mat=new StandardMaterial('visitor-prayer-mat-'+i,this.scene);mat.diffuseTexture=tex;mat.useAlphaFromDiffuseTexture=true;mat.emissiveColor=Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;
   const mesh=MeshBuilder.CreatePlane('visitor-prayer-'+i,{width:BUBBLE.meshW,height:BUBBLE.meshH},this.scene);mesh.material=mat;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.isPickable=false;mesh.setEnabled(false);this.bubbles.push({mesh,tex,person:-1});}

  for(let look=0;look<10;look++){
   if(this.dead)return;
   const source=this.library.create(AO_DAI_COLLECTION[look]);
   for(const pose of POSES){
    source.setPose(pose.startsWith('Walk')?'Walk':pose);source.update(3);
    if(pose.startsWith('Walk')){const g=source.entries.animationGroups.find(g=>g.name==='PilgrimWalk');g?.goToFrame(g.from+(g.to-g.from)*(pose==='Walk0'?.15:.65));g?.pause();}
    source.root.computeWorldMatrix(true);for(const node of source.root.getDescendants())(node as Mesh).computeWorldMatrix?.(true);for(const s of source.entries.skeletons)s.prepare(true);
    this.bake(source.visual.getChildMeshes(),look,pose);
   }
   source.dispose();
   for(let slot=0;slot<(FILM?8:this.low?2:4);slot++){const actor=this.library.create(AO_DAI_COLLECTION[look]);actor.root.setEnabled(false);this.pool.push({key:look,person:-1,pose:'',woman:actor});}
   // Yield between looks rather than blocking the complete scene load.
   await new Promise<void>(resolve=>setTimeout(resolve,0));
  }
  // the men: same Rocketbox rigs, clips and devotion poses as the online players (library shared with them)
  try{
   const men=RocketboxPlayerLibrary.shared(this.scene);await men.ready;if(this.dead)return;
   for(let m=0;m<MEN.length;m++){
    const source=new RocketboxPlayer(men.lib,this.scene,-(9100+m),'',false,false,MEN[m]);source.place(0,0,0,0);
    for(const pose of POSES){
     source.setAct(MAN_ACT[pose.startsWith('Walk')?'Walk':pose]);for(let k=0;k<6;k++)source.update(.5);
     if(pose.startsWith('Walk')){const g=source.rig.entries.animationGroups.find(g=>g.name==='Walk');g?.goToFrame(g.from+(g.to-g.from)*(pose==='Walk0'?.15:.65));g?.pause();}
     source.rig.root.computeWorldMatrix(true);for(const node of source.rig.root.getDescendants())(node as Mesh).computeWorldMatrix?.(true);for(const s of source.rig.entries.skeletons)s.prepare(true);
     this.bake(source.rig.visual.getChildMeshes(),MAN_KEY+m,pose,'\u0000','\u0000');
    }
    source.dispose();
    for(let slot=0;slot<(FILM?4:this.low?1:2);slot++){const man=new RocketboxPlayer(men.lib,this.scene,-(9200+m*4+slot),'',false,false,MEN[m]);man.rig.root.setEnabled(false);this.pool.push({key:MAN_KEY+m,person:-1,pose:'',man});}
    await new Promise<void>(resolve=>setTimeout(resolve,0));
   }
   this.men=true;
  }catch(e){console.warn('Temple residents: men not loaded, everyone wears áo dài',e);}
 }
 private colors(index:number){const variation=Math.floor(index/10),h=(variation*.61803398875)%1;return{coat:Color3.FromHSV(h*360,.12+(variation%5)*.035,.82+(variation%4)*.06),pants:Color3.FromHSV((h*360+35)%360,.10+(variation%7)*.035,.55+(variation%5)*.09)};}
 private hide(slot:Slot){if(slot.woman){slot.woman.setPose('Idle',true);slot.woman.root.setEnabled(false);}else slot.man?.rig.root.setEnabled(false);slot.person=-1;}
 /** About two in three visitors carry a prayer, shown above the head when near. */
 static prayer(index:number){return index%3===2?'':VISITOR_PRAYERS[(index*7+3)%VISITOR_PRAYERS.length];}
 update(dt:number,people:CrowdVisual[],eye:Vector3){if(this.dead)return;this.elapsed+=dt;this.debt+=dt;
  // during the flycam the far crowd redraws ~30×/s so walkers glide instead of hopping 5×/s past the moving camera
  if(this.debt>=(typeof document!=='undefined'&&(document.body?.classList.contains('al-flying')||document.body?.classList.contains('al-cine'))?1/30:.2)){this.debt=0;const nearest=people.map(p=>({p,d:(p.x-eye.x)**2+(p.y-eye.y)**2+(p.z-eye.z)**2})).filter(v=>v.d<(FILM?90:45)**2).sort((a,b)=>a.d-b.d),wanted=new Set<number>();const perKey=new Map<number,number>();
   for(const {p}of nearest){const key=this.key(p.index),n=perKey.get(key)??0,cap=key>=MAN_KEY?(FILM?4:this.low?1:2):(FILM?8:this.low?2:4);if(n<cap){wanted.add(p.index);perKey.set(key,n+1);}}
   for(const [id,slot]of this.assignments)if(!wanted.has(id)){this.hide(this.pool[slot]);this.assignments.delete(id);}
   for(const id of wanted)if(!this.assignments.has(id)){const key=this.key(id),slot=this.pool.findIndex(p=>p.person===-1&&p.key===key);if(slot>=0){const entry=this.pool[slot];entry.person=id;entry.pose='';if(entry.woman){const c=this.colors(id);entry.woman.tint(c.coat,c.pants);}this.assignments.set(id,slot);}}
   const groups=new Map<string,CrowdVisual[]>();for(const p of people){const distance=(p.x-eye.x)**2+(p.y-eye.y)**2+(p.z-eye.z)**2;if(this.assignments.has(p.index)||distance>(this.low?500:1000)**2)continue;const pose=p.pose==='Walk'?'Walk'+(Math.floor(this.elapsed*3+p.index*.37)%2):p.pose,key=`${this.key(p.index)}:${pose}:${distance>85*85?'far':'mid'}`;const group=groups.get(key)??[];group.push(p);groups.set(key,group);}
   for(const batch of this.batches){const group=groups.get(`${batch.look}:${batch.pose}:${batch.detail}`)??[];batch.mesh.setEnabled(!!group.length);if(!group.length)continue;const matrices=new Float32Array(group.length*16),colors=new Float32Array(group.length*4);
    group.forEach((p,i)=>{Matrix.Compose(Vector3.One(),Quaternion.RotationYawPitchRoll(p.yaw,0,0),new Vector3(p.x,p.y,p.z)).copyToArray(matrices,i*16);const c=this.colors(p.index),color=batch.part==='coat'?c.coat:batch.part==='pants'?c.pants:Color3.White();colors.set([color.r,color.g,color.b,1],i*4);});
    batch.mesh.thinInstanceSetBuffer('matrix',matrices,16,false);batch.mesh.thinInstanceSetBuffer('color',colors,4,false);batch.mesh.thinInstanceCount=group.length;batch.mesh.thinInstanceRefreshBoundingInfo(false);
   }
   // prayer bubbles for the nearest praying visitors
   const reach=(this.low?22:30)**2,show=nearest.filter(v=>v.d<reach&&TempleCrowdRenderer.prayer(v.p.index)).slice(0,this.bubbles.length).map(v=>v.p.index),keep=new Set(show);
   for(const [id,b]of this.bubbleOf)if(!keep.has(id)){this.bubbles[b].person=-1;this.bubbles[b].mesh.setEnabled(false);this.bubbleOf.delete(id);}
   for(const id of show)if(!this.bubbleOf.has(id)){const b=this.bubbles.findIndex(x=>x.person===-1);if(b<0)break;const bub=this.bubbles[b];bub.person=id;drawPrayer(bub.tex.getContext() as CanvasRenderingContext2D,TempleCrowdRenderer.prayer(id));bub.tex.update();bub.mesh.setEnabled(true);this.bubbleOf.set(id,b);}
  }
  for(const [id,b]of this.bubbleOf){const p=people[id];if(!p)continue;const man=this.men&&id%2===1,h=p.pose==='sit'?.98:p.pose==='kneel'||p.pose==='bow'?1.35:man?1.7:1.6;this.bubbles[b].mesh.position.set(p.x,p.y+h+.5,p.z);}
  const holders=people.filter(p=>p.offering&&(p.x-eye.x)**2+(p.y-eye.y)**2+(p.z-eye.z)**2<100*100&&!(this.assignments.has(p.index)&&this.pool[this.assignments.get(p.index)!].man)),sticks=new Float32Array(Math.max(1,holders.length)*16),embers=new Float32Array(Math.max(1,holders.length)*16);holders.forEach((p,i)=>{const x=p.x+Math.sin(p.yaw)*.28,z=p.z+Math.cos(p.yaw)*.28;Matrix.Translation(x,p.y+1.2,z).copyToArray(sticks,i*16);Matrix.Translation(x,p.y+1.375,z).copyToArray(embers,i*16);});for(const [mesh,buffer]of [[this.incense,sticks],[this.ember,embers]]as const)if(mesh){mesh.setEnabled(holders.length>0);mesh.thinInstanceSetBuffer('matrix',buffer,16,false);mesh.thinInstanceCount=holders.length;mesh.thinInstanceRefreshBoundingInfo(false);}
  for(const [id,slot]of this.assignments){const p=people[id],entry=this.pool[slot];if(!p)continue;
   if(entry.woman){entry.woman.root.setEnabled(true);entry.woman.root.position.set(p.x,p.y,p.z);entry.woman.root.rotation.y=p.yaw;if(entry.pose!==p.pose){entry.pose=p.pose;entry.woman.setPose(p.pose);}entry.woman.update(dt);}
   else if(entry.man){entry.man.rig.root.setEnabled(true);entry.man.place(p.x,p.y,p.z,p.yaw);if(entry.pose!==p.pose){entry.pose=p.pose;entry.man.setAct(MAN_ACT[p.pose]??'idle');}entry.man.update(dt);}}
 }
 get review(){return{near:this.assignments.size,rigBudget:this.pool.length,men:this.men,bubbles:this.bubbleOf.size,farBatches:this.batches.length,farTriangles:this.batches.reduce((n,b)=>n+b.mesh.getTotalIndices()/3*b.mesh.thinInstanceCount*(b.mesh.isEnabled()?1:0),0)};}
 dispose(){this.dead=true;for(const mesh of [this.incense,this.ember]){mesh?.material?.dispose();mesh?.dispose();}for(const p of this.pool){p.woman?.dispose();p.man?.dispose();}for(const b of this.batches){b.mesh.material?.dispose(false,true);b.mesh.dispose();}for(const b of this.bubbles){b.mesh.material?.dispose();b.tex.dispose();b.mesh.dispose();}this.pool=[];this.batches=[];this.bubbles=[];}
}
