import {Color3,DynamicTexture,Mesh,MeshBuilder,Quaternion,StandardMaterial,TransformNode,Vector3,type Scene} from '@babylonjs/core';
import type {HumanRig,HumanOptions,OutfitStyle} from '../game/chars/CharacterLibrary';
/** Anything that builds a rigged human with UAL bone names (the pilgrim library or the rigged monk). */
export type RigSource={createHuman(o:HumanOptions):HumanRig};
import type {Act} from './protocol';

/** Áo tràng lam: the grey-blue robe lay Buddhists wear to the pagoda. */
const AO_LAM:OutfitStyle={robe:'#6d87a3',inner:'#7b93ad',trousers:'#5d7591',belt:'#5d7591',trim:'#566d87',boots:'#3b3631',skirt:true,style:'robe',skin:'#f4e3d3'};

// ---- two-bone IK helpers (same analytic solve as Veilbound's RiderPose) ----
function jointPoint(a:Vector3,target:Vector3,pole:Vector3,l1:number,l2:number){
 const axis=target.subtract(a),distance=Math.max(Math.abs(l1-l2)+.001,Math.min(axis.length(),l1+l2-.001));axis.normalize();
 const side=pole.subtract(a);side.subtractInPlace(axis.scale(Vector3.Dot(side,axis)));if(side.lengthSquared()<.0001)side.copyFrom(Vector3.Cross(axis,Vector3.Right()));side.normalize();
 const along=(l1*l1-l2*l2+distance*distance)/(2*distance),out=Math.sqrt(Math.max(0,l1*l1-along*along));return a.add(axis.scale(along)).add(side.scale(out));
}
function refresh(n:TransformNode){n.computeWorldMatrix(true);for(const d of n.getDescendants(false))(d as TransformNode).computeWorldMatrix?.(true);}
function aim(n:TransformNode,child:TransformNode,target:Vector3){
 refresh(n);const parent=n.parent as TransformNode|null;
 const localTarget=parent?Vector3.TransformCoordinates(target,parent.getWorldMatrix().clone().invert()):target;
 const desired=localTarget.subtract(n.position).normalize();const current=n.rotationQuaternion??Quaternion.FromEulerVector(n.rotation);
 const from=child.position.clone().applyRotationQuaternion(current).normalize();
 n.rotationQuaternion=Quaternion.FromUnitVectorsToRef(from,desired,new Quaternion()).multiply(current);refresh(n);
}

/** Lotus seat with joined palms, upright kneeling, and the full bow (lạy) — posed on top of a frozen idle frame. */
export class DevotionPose{
 /** k = body height / 1.7 m: every IK target below is authored for a 1.7 m person and scaled to this one. */
 k=1;
 /** pelvis→neck distance of this body at rest, in 1.7 m reference units: chest height follows the body's own torso. */
 private torso=.65;
 private active=false;private rest=new Map<TransformNode,{p:Vector3;q:Quaternion}>();private rootRest=Vector3.Zero();
 constructor(private rig:HumanRig){}
 release(){if(!this.active)return;for(const [n,t]of this.rest){n.position.copyFrom(t.p);n.rotationQuaternion=t.q.clone();}refresh(this.rig.root);this.active=false;}
 apply(mode:'sit'|'kneel'|'bow'|'prayer',t:number){
  const rig=this.rig;
  if(!this.active){rig.anim.stop();const idle=rig.anim.groups.get('Idle_Loop');if(idle){idle.start(false,1,idle.from,idle.to);idle.goToFrame(idle.from);idle.pause();idle.weight=1;}
   refresh(rig.root);this.rest.clear();const nodes=[...rig.nodes.values(),...rig.root.getChildren(c=>c instanceof TransformNode,true) as TransformNode[]];for(const n of nodes)if(!this.rest.has(n))this.rest.set(n,{p:n.position.clone(),q:n.rotationQuaternion?.clone()??Quaternion.FromEulerVector(n.rotation)});
   {const pv=rig.nodes.get('pelvis'),hd=rig.nodes.get('Head');if(pv&&hd){const inv=rig.root.getWorldMatrix().clone().invert();this.torso=(Vector3.TransformCoordinates(hd.getAbsolutePosition(),inv).y-Vector3.TransformCoordinates(pv.getAbsolutePosition(),inv).y)/this.k;}}
   this.active=true;}
  for(const [n,r]of this.rest){n.position.copyFrom(r.p);n.rotationQuaternion=r.q.clone();}
  refresh(rig.root);const W=rig.root.getWorldMatrix(),k=this.k,at=(x:number,y:number,z:number)=>Vector3.TransformCoordinates(new Vector3(x*k,y*k,z*k),W),dir=(x:number,y:number,z:number)=>Vector3.TransformNormal(new Vector3(x,y,z),W);
  // bow: down and up every 4 s (s = 0 upright kneel, 1 forehead to the floor)
  const s=mode==='bow'?.5-.5*Math.cos(t*Math.PI/2):0;
  const pelvisY=mode==='prayer'?.99:mode==='sit'?.2:.62-.2*s,pelvisZ=mode==='prayer'||mode==='sit'?0:-.04-.14*s;
  const pelvis=rig.nodes.get('pelvis');
  // Move the whole skeleton (its top node under the pilgrim root) so the pelvis lands on the cushion / heels.
  if(pelvis){let top:TransformNode=pelvis;while(top.parent&&top.parent!==rig.root)top=top.parent as TransformNode;
   const delta=at(0,pelvisY,pelvisZ).subtract(pelvis.getAbsolutePosition());top.position.addInPlace(Vector3.TransformNormal(delta,W.clone().invert()));refresh(rig.root);}
  const spine=rig.nodes.get('spine_01'),spine2=rig.nodes.get('spine_02');
  if(spine&&spine2)aim(spine,spine2,spine.getAbsolutePosition().add(mode==='prayer'?dir(0,1,0):dir(0,Math.cos(s*1.25)+.02,Math.sin(s*1.25)+.06)));
  const neck=rig.nodes.get('neck_01'),head=rig.nodes.get('Head');if(neck&&head)aim(neck,head,neck.getAbsolutePosition().add(mode==='prayer'?dir(0,1,0):dir(0,Math.cos(s*1.45)+.05,Math.sin(s*1.45)+.1)));
  for(const sfx of ['l','r']){
   const thigh=rig.nodes.get(`thigh_${sfx}`);if(!thigh)continue;const lx=Vector3.TransformCoordinates(thigh.getAbsolutePosition(),W.clone().invert()).x,side=lx<0?-1:1;
   const foot=mode==='prayer'?at(side*.09,.035,.015):mode==='sit'?at(-side*.14,.1,.27):at(side*.12,.06,-.42+.06*s),kneePole=mode==='sit'?at(side*.8,.12,.45):at(side*.1,.15,1.4);
   const chestY=pelvisY+this.torso*(mode==='prayer'?.49:.68);
   const hand=mode==='prayer'?at(side*.033,chestY,.255):mode==='bow'&&s>.35?at(side*.17,.05+.25*(1-s),.6-.15*(1-s)):at(side*.025,chestY,.25-.04*(mode==='sit'?0:1));
   const elbowPole=mode==='prayer'?at(side*.28,chestY-.23,.07):mode==='bow'&&s>.35?at(side*.5,.6,.2):at(side*.55,chestY-.35,-.15);
   for(const [a,b,c,target,pole]of [[`thigh_${sfx}`,`calf_${sfx}`,`foot_${sfx}`,foot,kneePole],[`upperarm_${sfx}`,`lowerarm_${sfx}`,`hand_${sfx}`,hand,elbowPole]]as const){
    const n1=rig.nodes.get(a),n2=rig.nodes.get(b),end=rig.nodes.get(c);if(!n1||!n2||!end)continue;refresh(n1);
    const start=n1.getAbsolutePosition().clone(),l1=Vector3.Distance(start,n2.getAbsolutePosition()),l2=Vector3.Distance(n2.getAbsolutePosition(),end.getAbsolutePosition());
    aim(n1,n2,jointPoint(start,target,pole,l1,l2));aim(n2,end,target);
    if(c.startsWith('hand')){const finger=rig.nodes.get(`middle_01_${sfx}`);if(finger)aim(end,finger,end.getAbsolutePosition().add(mode==='bow'&&s>.35?dir(0,-.04,.1):dir(-side*.01,.1,.02)));}
    if(c.startsWith('foot')){const toe=rig.nodes.get(`ball_${sfx}`);if(toe)aim(end,toe,end.getAbsolutePosition().add(mode==='sit'?dir(-side*.1,0,.04):dir(0,-.06,-.1)));}
   }
  }
 }
}

const CLIP:Record<Act,string>={idle:'Idle_Loop',walk:'Walk_Loop',run:'Jog_Fwd_Loop',sit:'',kneel:'',bow:'',incense:'Idle_Torch_Loop',wheel:'Push_Loop',lantern:'Idle_Loop',fish:'Idle_Loop',sky:'Idle_Loop',raise:'Idle_Loop'};

/** One pilgrim in the scene: robe, name tag, animation and devotional poses. Shared by the player and remote players. */
export class Pilgrim{
 readonly rig:HumanRig;private pose:DevotionPose;private tag:Mesh;private tagTex:DynamicTexture;private stick?:Mesh;private act:Act='idle';private actTime=0;
 constructor(lib:RigSource,private scene:Scene,readonly id:number,name:string,female:boolean,self=false){
  this.rig=lib.createHuman({id:'pilgrim-'+id,female,outfit:AO_LAM,hair:female?'buns':'short',hairColor:'#17110d',height:female?1.6:1.7});
  this.pose=new DevotionPose(this.rig);this.pose.k=(this.rig.root.metadata?.h??(female?1.6:1.7))/1.7;
  for(const m of this.rig.meshes){m.isPickable=false;m.receiveShadows=true;}
  // Name above the head, always facing the camera.
  this.tagTex=new DynamicTexture('tag-'+id,{width:512,height:96},scene,true);const ctx=this.tagTex.getContext() as CanvasRenderingContext2D;
  ctx.clearRect(0,0,512,96);ctx.font='bold 46px Segoe UI, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const w=Math.min(500,ctx.measureText(name).width+40);
  ctx.fillStyle=self?'rgba(120,80,10,.72)':'rgba(20,28,26,.62)';ctx.beginPath();(ctx as any).roundRect?.((512-w)/2,14,w,68,30);ctx.fill();
  ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(name,256,49,480);ctx.fillStyle=self?'#ffe7a6':'#ffffff';ctx.fillText(name,256,49,480);this.tagTex.update();this.tagTex.hasAlpha=true;
  const mat=new StandardMaterial('tag-mat-'+id,scene);mat.diffuseTexture=this.tagTex;mat.useAlphaFromDiffuseTexture=true;mat.emissiveColor=Color3.White();mat.disableLighting=true;mat.backFaceCulling=false;
  this.tag=MeshBuilder.CreatePlane('tag-'+id,{width:1.6,height:.3},scene);this.tag.material=mat;this.tag.billboardMode=Mesh.BILLBOARDMODE_ALL;this.tag.parent=this.rig.root;this.tag.position.y=(female?1.6:1.7)+.38;this.tag.isPickable=false;
  this.setAct('idle');
 }
 get position(){return this.rig.root.position;}
 place(x:number,y:number,z:number,yaw:number){this.rig.root.position.set(x,y,z);this.rig.root.rotation.y=yaw;}
 get current(){return this.act;}
 setAct(a:Act){
  if(a===this.act&&this.actTime>0)return;const prev=this.act;this.act=a;this.actTime=0;
  if(!['sit','kneel','bow'].includes(a)){if(['sit','kneel','bow'].includes(prev))this.pose.release();this.rig.anim.play(CLIP[a],{loop:true,restart:true,speed:a==='walk'?.9:1});}
  this.tag.position.y=(a==='sit'?.95:a==='kneel'||a==='bow'?1.35:(this.rig.root.metadata?.h??1.7))+.38;
  // Incense: a lit stick held in the right hand while praying.
  if(a==='incense'&&!this.stick){const hand=this.rig.nodes.get('hand_r');if(hand){const s=MeshBuilder.CreateCylinder('held-incense',{height:.42,diameter:.012,tessellation:5},this.scene);const m=new StandardMaterial('held-incense-mat',this.scene);m.diffuseColor=Color3.FromHexString('#a3442c');m.emissiveColor=new Color3(.35,.08,.02);s.material=m;s.parent=hand;s.position.set(0,.08,.03);s.isPickable=false;this.stick=s;}}
  if(a!=='incense'&&this.stick){this.stick.material?.dispose();this.stick.dispose();this.stick=undefined;}
 }
 update(dt:number){const h=this.rig.root.metadata?.h;if(h)this.pose.k=h/1.7;this.actTime+=dt;if(this.act==='sit'||this.act==='kneel'||this.act==='bow')this.pose.apply(this.act,this.actTime);else this.rig.anim.update(dt);}
 dispose(){this.stick?.dispose();this.tag.material?.dispose();this.tagTex.dispose();this.tag.dispose();this.rig.dispose?.();}
}
