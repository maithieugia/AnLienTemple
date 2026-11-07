import {AssetContainer,LoadAssetContainerAsync,TransformNode,Vector3,Mesh,MeshBuilder,DynamicTexture,StandardMaterial,Color3,AnimationGroupMask,AnimationGroupMaskMode,type Scene,type AnimationGroup} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {AnimController} from './AnimController';
import {RocketboxDevotion} from './RocketboxDevotion';
import type {Act} from '../../online/protocol';
import {RocketboxPlayerLibrary} from './RocketboxPlayerLibrary';
import {BUBBLE,drawPrayer} from './PrayerBubble';
import {offeringModel,flicker,type OfferingKind} from '../world/OfferingModels';
export {RocketboxPlayerLibrary} from './RocketboxPlayerLibrary';
const poseAct=(act:Act)=>act==='sit'||act==='kneel'||act==='bow'||act==='incense'||act==='lantern'||act==='fish'||act==='sky'||act==='raise';
/** What a pilgrim holds in both hands for an act (2026-11-05: lotus lantern, golden carp, sky lantern). */
const heldKind=(act:Act):OfferingKind|null=>act==='lantern'?'lantern':act==='fish'?'fish':act==='sky'||act==='raise'?'sky':null;
/** Same online interface as the previous pilgrim; no account/protocol/storage changes. */
export class RocketboxPlayer{
 rig:ReturnType<RocketboxPlayerLibrary['create']>;private pose:RocketboxDevotion;private anim:AnimController;private act:Act='idle';private time=0;private tag:Mesh;private tagTex:DynamicTexture;private stick?:TransformNode;private stickMat?:StandardMaterial;private emberMat?:StandardMaterial;
 constructor(private lib:RocketboxPlayerLibrary,private scene:Scene,readonly id:number,name:string,private female:boolean,self=false,outfit='thuong'){
  this.rig=lib.create(female,id,outfit);this.pose=new RocketboxDevotion(this.rig.visual,this.rig.entries);
  this.anim=this.clips();this.walkStyle();
  // above the head: the pilgrim's prayer, not the name (anh Thanh 2026-11-04 "tắt hiện tên")
  this.tagTex=new DynamicTexture('player-tag-'+id,{width:BUBBLE.w,height:BUBBLE.h},scene,true);this.tagTex.hasAlpha=true;this.self=self;void name;
  const mat=new StandardMaterial('player-tag-material-'+id,scene);mat.diffuseTexture=this.tagTex;mat.useAlphaFromDiffuseTexture=true;mat.emissiveColor=Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;
  this.tag=MeshBuilder.CreatePlane('player-name-'+id,{width:BUBBLE.meshW,height:BUBBLE.meshH},scene);this.tag.material=mat;this.tag.setEnabled(false);this.tag.parent=this.rig.root;this.tag.billboardMode=Mesh.BILLBOARDMODE_ALL;this.tag.isPickable=false;this.setAct('idle');
 }
 private clips(){const groups=this.rig.entries.animationGroups,find=(name:string)=>groups.find(g=>g.name===name)!;
  const native=RocketboxPlayer.clips==='native';
  return new AnimController(new Map([['Idle_Loop',find('Idle')],['Walk_Loop',find(native?'Walk':'PilgrimWalk')],['Jog_Fwd_Loop',find(native?'Run':'PilgrimRun')],['Push_Loop',find('Push')]]));}
 /** Which walk/run clips the players use. anh Thanh 2026-11-03 chose the calm upright Rocketbox 'Walk'/'Run' over the bent retargeted 'PilgrimWalk'/'PilgrimRun' (compare in walk-preview.html). */
 static clips:'native'|'pilgrim'='native';
 /**
  * Temple walk (anh Thanh 2026-11-03): the stock walk/run clips bend the back forward and swing the arms wide.
  * While walking or running the spine, neck and head follow the upright standing pose (Idle) and the arms swing less,
  * so pilgrims walk calmly and straight; the legs keep the original clip (no foot sliding).
  */
 private upright?:{spine:AnimationGroup;arms:AnimationGroup};
 private walkStyle(){
  const groups=this.rig.entries.animationGroups,idle=groups.find(g=>g.name==='Idle');if(!idle)return;
  const names=(re:RegExp)=>[...new Set(idle.targetedAnimations.map(t=>(t.target as {name?:string})?.name??'').filter(n=>re.test(n)))];
  const spine=names(/Bip01 (Spine\d?|Neck|Head)$/),arms=names(/Bip01 [LR] (Clavicle|UpperArm|Forearm)$/);if(!spine.length)return;
  // The spine stays with the walk clip: the native Rocketbox walk is already upright, while the Idle spine carries a
  // weight-shift lean that made walkers tilt to one side (anh Thanh 2026-11-03). Only the arm swing is calmed.
  const make=(label:string,list:string[])=>{const g=idle.clone('upright-'+label+'-'+this.id,t=>t);g.mask=new AnimationGroupMask(list,AnimationGroupMaskMode.Include);g.stop();return g;};
  this.upright={spine:make('spine',spine),arms:make('arms',arms)};
 }
 private paintWalkStyle(act:Act){const u=this.upright;if(!u)return;const moving=act==='walk'||act==='run';
  const nam01=this.rig.outfit==='nam-01';/* Nam 01: arms swing a little more (anh Thanh 2026-11-04: "tay cứ cố định") */
  for(const [g,w]of [[u.arms,act==='run'?(nam01?.2:.45):(nam01?.3:.6)]]as const){if(moving){if(!g.isStarted)g.start(true,1,g.from,g.to);g.weight=w;}else if(g.isStarted)g.stop();}}
 get outfit(){return this.rig.outfit;}
 /** Change clothes in place (same name tag, position, pose and held incense). */
 setOutfit(outfit:string){if(outfit===this.rig.outfit)return;const old=this.rig,next=this.lib.create(this.female,this.id,outfit);
  next.root.position.copyFrom(old.root.position);next.root.rotation.copyFrom(old.root.rotation);next.root.metadata={...old.root.metadata,...next.root.metadata};next.root.setEnabled(old.root.isEnabled());
  this.tag.parent=next.root;if(this.stick)this.stick.parent=next.root;if(this.held)this.held.model.root.parent=next.root;
  this.anim.stop();this.upright?.spine.dispose();this.upright?.arms.dispose();this.upright=undefined;this.rig=next;this.pose=new RocketboxDevotion(next.visual,next.entries);this.anim=this.clips();this.walkStyle();const act=this.act;this.act='idle';this.time=0;this.setAct(act);
  for(const o of old.owned)o.dispose();old.entries.dispose();old.root.dispose(false,false);}
 get current(){return this.act;}
 get position(){return this.rig.root.position;}
 private self=false;prayer='';
 /** Show (or with '' hide) a prayer above the head. */
 /** Hide the own prayer bubble for a while (it sits in the middle of an over-the-shoulder view, "Tự đi lễ" on the stupa). */
 quietPrayer(quiet:boolean){this.tag.setEnabled(!quiet&&!!this.prayer);}
 setPrayer(text:string){if(text===this.prayer)return;this.prayer=text;drawPrayer(this.tagTex.getContext() as CanvasRenderingContext2D,text,this.self);this.tagTex.update();this.tag.setEnabled(!!text);}
 place(x:number,y:number,z:number,yaw:number){this.rig.root.position.set(x,y,z);this.rig.root.rotation.y=yaw;}
 setAct(act:Act){
  if(act===this.act&&this.time>0)return;
  const oldPose=poseAct(this.act),newPose=poseAct(act);if(!newPose)this.pose.release();if(oldPose||newPose)this.anim.stop();this.act=act;this.time=0;
  if(!poseAct(act))this.anim.play(act==='run'?'Jog_Fwd_Loop':act==='walk'?'Walk_Loop':act==='wheel'?'Push_Loop':'Idle_Loop',{loop:act!=='wheel',speed:act==='wheel'?1.5:1,fade:.18});
  this.paintWalkStyle(act);
  this.tag.position.y=(act==='sit'?.98:act==='kneel'||act==='bow'?1.35:this.rig.height)+.48;
  if(act==='incense'&&!this.stick){
   this.stick=new TransformNode('player-held-incense-'+this.id,this.scene);this.stick.parent=this.rig.root;
   const mat=this.stickMat=new StandardMaterial('held-incense-'+this.id,this.scene);mat.diffuseColor=Color3.FromHexString('#a3442c');mat.emissiveColor.set(.32,.05,.01);
   const stick=MeshBuilder.CreateCylinder('lit-incense',{height:.42,diameter:.008,tessellation:6},this.scene);stick.material=mat;stick.parent=this.stick;stick.isPickable=false;const ember=MeshBuilder.CreateSphere('held-incense-ember',{diameter:.014,segments:6},this.scene);ember.parent=this.stick;ember.position.y=.21;ember.isPickable=false;const glow=this.emberMat=new StandardMaterial('ember-'+this.id,this.scene);glow.emissiveColor.set(1,.32,.05);glow.disableLighting=true;ember.material=glow;
  }
  if(this.stick)this.stick.setEnabled(act==='incense');
  const kind=heldKind(act);if(kind&&this.held?.kind!==kind){this.held?.model.root.dispose();const model=offeringModel(this.scene,kind,'held-'+kind+'-'+this.id);model.root.parent=this.rig.root;this.held={kind,model};}
  this.held?.model.root.setEnabled(!!kind);
 }
 private held?:{kind:OfferingKind;model:ReturnType<typeof offeringModel>};
 update(dt:number){
  this.time+=dt;
  const holding=this.act==='lantern'||this.act==='fish'||this.act==='sky';
  if(poseAct(this.act))this.pose.apply(this.act==='incense'||holding?'prayer':this.act as 'sit'|'kneel'|'bow'|'raise',this.time,dt,holding);else{for(const g of this.rig.entries.animationGroups)if(g.isStarted)g.speedRatio=g.name==='Push'?1.5:1;this.anim.update(dt);}
  const head=!this.tag.isEnabled(false)?undefined:this.rig.entries.skeletons[0].bones.find(b=>b.name==='Bip01 Head')?.getTransformNode();if(head){head.computeWorldMatrix(true);this.tag.position.y=Vector3.TransformCoordinates(head.getAbsolutePosition(),this.rig.root.computeWorldMatrix(true).clone().invert()).y+.5;}
  if(this.held&&heldKind(this.act)){
   const b=this.rig.entries.skeletons[0].bones,hand=(name:string)=>b.find(n=>n.name===name)?.getTransformNode()?.getAbsolutePosition();const l=hand('Bip01 L Hand'),r=hand('Bip01 R Hand'),root=this.held.model.root;
   if(l&&r){const p=l.add(r).scale(.5),local=Vector3.TransformCoordinates(p,this.rig.root.computeWorldMatrix(true).clone().invert());const k=this.held.kind;
    // the sky lantern is held out in front of the chest (its paper rises in front of the face, not over it) and lifted over the head on 'raise'
    root.position.copyFrom(local.add(new Vector3(0,k==='sky'?(this.act==='raise'?.05:-.12):.02,k==='sky'?(this.act==='raise'?.05:.42):.08)));root.rotation.y=k==='fish'?Math.PI/2:0;root.scaling.setAll(k==='sky'?.72:1);
    root.setEnabled(!(this.act==='raise'&&this.time>1.05));const f=flicker(this.time,this.id);if(this.held.model.flame)this.held.model.flame.scaling.set(1,f,1);if(this.held.model.halo)this.held.model.halo.scaling.setAll(.85+.25*f);}
  }
  if(this.stick&&this.act==='incense'){
   const b=this.rig.entries.skeletons[0].bones,hand=(name:string)=>b.find(n=>n.name===name)?.getTransformNode()?.getAbsolutePosition();const l=hand('Bip01 L Hand'),r=hand('Bip01 R Hand');
   if(l&&r){const p=l.add(r).scale(.5),local=Vector3.TransformCoordinates(p,this.rig.root.computeWorldMatrix(true).clone().invert());this.stick.position.copyFrom(local.add(new Vector3(0,.28,.06)));}
  }
 }
 dispose(){this.held?.model.root.dispose();this.anim.stop();this.upright?.spine.dispose();this.upright?.arms.dispose();this.tag.material?.dispose();this.tagTex.dispose();this.stickMat?.dispose();this.emberMat?.dispose();for(const o of this.rig.owned)o.dispose();this.rig.entries.dispose();this.rig.root.dispose(false,false);}
}
