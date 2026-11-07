import {TransformNode,Vector3,Quaternion,type AssetContainer} from '@babylonjs/core';
import {palmQuaternion} from './PalmPose.ts';
/** raise = standing with both hands up over the head (letting a sky lantern go, 2026-11-05). */
export type RocketDevotion='prayer'|'sit'|'kneel'|'bow'|'raise';
type Rest={p:Vector3;q:Quaternion};
const refresh=(n:TransformNode)=>{n.computeWorldMatrix(true);for(const d of n.getDescendants())(d as TransformNode).computeWorldMatrix?.(true);};
function aim(n:TransformNode,child:TransformNode,target:Vector3){
 refresh(n);const parent=n.parent as TransformNode|null,local=parent?Vector3.TransformCoordinates(target,parent.getWorldMatrix().clone().invert()):target;
 const q=n.rotationQuaternion??Quaternion.FromEulerVector(n.rotation),from=child.position.applyRotationQuaternion(q).normalize(),to=local.subtract(n.position).normalize();
 n.rotationQuaternion=Quaternion.FromUnitVectorsToRef(from,to,new Quaternion()).multiply(q);refresh(n);
}
export function jointTarget(a:Vector3,target:Vector3,pole:Vector3,l1:number,l2:number){
 const axis=target.subtract(a),d=Math.max(Math.abs(l1-l2)+.001,Math.min(axis.length(),l1+l2-.001));axis.normalize();
 const side=pole.subtract(a);side.subtractInPlace(axis.scale(Vector3.Dot(side,axis)));if(side.lengthSquared()<1e-8)side.copyFrom(Vector3.Cross(axis,Math.abs(axis.y)<.9?Vector3.Up():Vector3.Right()));side.normalize();
 const along=(l1*l1-l2*l2+d*d)/(2*d);return{joint:a.add(axis.scale(along)).add(side.scale(Math.sqrt(Math.max(0,l1*l1-along*along)))),end:a.add(axis.scale(d))};
}
/** Drives the imported skeleton itself; source skin, joints and body geometry stay together. */
export class RocketboxDevotion{
 private nodes=new Map<string,TransformNode>();private rest=new Map<TransformNode,Rest>();private previous=new Map<TransformNode,Rest>();private mode?:RocketDevotion;private blend=1;private reach=false;private hipY=.9;private k=1;
 private root:TransformNode;private asset:Pick<AssetContainer,'animationGroups'|'skeletons'>;
 constructor(root:TransformNode,asset:Pick<AssetContainer,'animationGroups'|'skeletons'>){this.root=root;this.asset=asset;}
 private capture(){return new Map([...this.rest.keys()].map(n=>[n,{p:n.position.clone(),q:n.rotationQuaternion?.clone()??Quaternion.FromEulerVector(n.rotation)}]));}
 private reset(){for(const[n,r]of this.rest){n.position.copyFrom(r.p);n.rotationQuaternion=r.q.clone();}refresh(this.root);}
 release(){if(!this.rest.size)return;this.reset();this.mode=undefined;this.rest.clear();}
 apply(mode:RocketDevotion,time:number,dt:number,reach=false){
  if(!this.rest.size){
   for(const a of this.asset.animationGroups)a.stop();const idle=this.asset.animationGroups.find(a=>a.name==='Idle');if(idle){idle.start(false,1,idle.from,idle.to);idle.goToFrame(idle.from);idle.pause();}
   for(const skeleton of this.asset.skeletons)for(const b of skeleton.bones){const n=b.getTransformNode();if(n)this.nodes.set(b.name,n);}
   refresh(this.root);for(const n of this.root.getDescendants())if(n instanceof TransformNode)this.rest.set(n,{p:n.position.clone(),q:n.rotationQuaternion?.clone()??Quaternion.FromEulerVector(n.rotation)});
   const inv=this.root.getWorldMatrix().clone().invert(),hip=this.nodes.get('Bip01 Pelvis')!,head=this.nodes.get('Bip01 Head')!;this.hipY=Vector3.TransformCoordinates(hip.getAbsolutePosition(),inv).y;this.k=(Vector3.TransformCoordinates(head.getAbsolutePosition(),inv).y+.14)/1.8;
  }
  if(mode!==this.mode||reach!==this.reach){this.reach=reach;this.previous=this.capture();this.blend=0;this.mode=mode;}
  this.reset();const W=this.root.getWorldMatrix(),inv=W.clone().invert(),k=this.k,at=(x:number,y:number,z:number)=>Vector3.TransformCoordinates(new Vector3(x*k,y*k,z*k),W),dir=(x:number,y:number,z:number)=>Vector3.TransformNormal(new Vector3(x,y,z),W);
  const stand=mode==='prayer'||mode==='raise',s=mode==='bow'?.5-.5*Math.cos(time*Math.PI/3):0,hipY=stand?this.hipY/k:mode==='sit'?.23:.60-.25*s,hipZ=stand||mode==='sit'?0:-.04-.06*s;
  const pelvis=this.nodes.get('Bip01 Pelvis')!;let top=pelvis;while(top.parent&&top.parent!==this.root)top=top.parent as TransformNode;
  // Kneeling and the bow (anh Thanh 2026-11-05: knees, shins and toes sank into the floor): worked out in world metres from the real
  // bone lengths. Knees rest on the floor; upright the thighs stand almost vertical, in the bow the hips sit back toward the heels.
  const kneels=mode==='kneel'||mode==='bow',O=at(0,0,0),F=dir(0,0,1).normalize(),U=Vector3.Up();
  const len=(a:string,b:string)=>Vector3.Distance(this.nodes.get('Bip01 L '+a)!.getAbsolutePosition(),this.nodes.get('Bip01 L '+b)!.getAbsolutePosition());
  const l1=kneels?len('Thigh','Calf'):0,l2=kneels?len('Calf','Foot'):0,dP=kneels?pelvis.getAbsolutePosition().y-this.nodes.get('Bip01 L Thigh')!.getAbsolutePosition().y:0;
  const KNEE_H=.075,KNEE_F=.12,ANKLE_H=.095,sb=s*s*(3-2*s);
  let pelvisAt=at(0,hipY,hipZ);
  if(kneels){const up=.97,hipH=KNEE_H+l1*(up+(.5-up)*sb),hipF=KNEE_F-Math.sqrt(Math.max(0,l1*l1-(hipH-KNEE_H)**2));pelvisAt=O.add(U.scale(hipH+dP)).add(F.scale(hipF));}
  top.position.addInPlace(Vector3.TransformNormal(pelvisAt.subtract(pelvis.getAbsolutePosition()),inv));refresh(this.root);
  let lean=2.2*s;
  // keep the forehead just above the floor at the bottom of the bow, whatever the body proportions
  if(mode==='bow'){const sp=this.nodes.get('Bip01 Spine')!,hd=this.nodes.get('Bip01 Head')!,L=Vector3.Distance(sp.getAbsolutePosition(),hd.getAbsolutePosition()),base=sp.getAbsolutePosition().y-O.y;
   lean=Math.min(lean,Math.PI/2+Math.asin(Math.max(-1,Math.min(1,(base-.17)/L))));}
  const spine=this.nodes.get('Bip01 Spine')!,spine1=this.nodes.get('Bip01 Spine1')!;if(mode==='bow')aim(spine,spine1,spine.getAbsolutePosition().add(dir(0,Math.cos(lean),Math.sin(lean))));
  const neck=this.nodes.get('Bip01 Neck')!,head=this.nodes.get('Bip01 Head')!;if(mode==='bow')aim(neck,head,neck.getAbsolutePosition().add(dir(0,Math.cos(lean+.08*s),Math.sin(lean+.08*s))));
  const headLocal=Vector3.TransformCoordinates(head.getAbsolutePosition(),inv),chestY=stand?Math.min(this.hipY/k+.38,headLocal.y/k-.28):hipY+.34;
  for(const label of ['L','R']){
   const get=(suffix:string)=>this.nodes.get('Bip01 '+label+' '+suffix)!,thigh=get('Thigh'),side=Vector3.TransformCoordinates(thigh.getAbsolutePosition(),inv).x<0?-1:1;
   const solve=(a:TransformNode,b:TransformNode,end:TransformNode,target:Vector3,pole:Vector3)=>{refresh(a);const start=a.getAbsolutePosition().clone(),l1=Vector3.Distance(start,b.getAbsolutePosition()),l2=Vector3.Distance(b.getAbsolutePosition(),end.getAbsolutePosition()),p=jointTarget(start,target,pole,l1,l2);aim(a,b,p.joint);aim(b,end,p.end);};
   if(kneels){
    // knee on the floor l1 from the hip joint, shin flat along the floor behind it, top of the foot resting on the floor
    refresh(thigh);const hip=thigh.getAbsolutePosition().clone(),lat=Vector3.Dot(hip.subtract(O),dir(1,0,0).normalize()),Rr=dir(1,0,0).normalize();
    const drop=hip.y-(O.y+KNEE_H),reachF=Math.sqrt(Math.max(0,l1*l1-drop*drop)),knee=new Vector3(hip.x,hip.y-Math.min(l1,drop),hip.z).add(F.scale(reachF)).add(Rr.scale(side*.025));
    const rise=knee.y-(O.y+ANKLE_H),back=Math.sqrt(Math.max(0,l2*l2-rise*rise)),ankle=knee.subtract(F.scale(back)).subtract(U.scale(Math.min(l2,rise))).add(Rr.scale(side*.02));void lat;
    const calf=get('Calf'),footB=get('Foot');aim(thigh,calf,knee);aim(calf,footB,ankle);
    const toe=get('Toe0');if(toe)aim(footB,toe,footB.getAbsolutePosition().add(F.scale(-1)).add(U.scale(-.18)));
   }else if(!stand){
    const foot=mode==='sit'?at(-side*.16,side>0?.15:.10,side>0?.42:.20):at(side*.12,.08,-.43),pole=mode==='sit'?at(side*.8,.10,.45):at(side*.14,.12,1.2);
    solve(thigh,get('Calf'),get('Foot'),foot,pole);const toe=get('Toe0');if(toe)aim(get('Foot'),toe,get('Foot').getAbsolutePosition().add(mode==='sit'?dir(-side*.1,0,.02):dir(0,-.07,-.1)));
   }
   let hand=mode==='sit'?at(side*.10,hipY+.18+(side>0?.025:0),.25):at(side*.018,chestY,.29);
   if(reach)hand=at(side*.22,chestY-.08,.52);
   if(mode==='raise'){const up=Math.min(1,time/1.2),e=up*up*(3-2*up);hand=Vector3.Lerp(at(side*.2,chestY-.02,.42),at(side*.17,headLocal.y/k+.42,.16),e);}
   if(mode==='bow'){const a=Math.max(0,Math.min(1,(s-.18)/.55));hand=Vector3.Lerp(hand,at(side*.19,.07,.65),a);}
   solve(get('UpperArm'),get('Forearm'),get('Hand'),hand,at(side*.5,Math.max(.14,chestY-.28),.06+.25*s));
   const wrist=get('Hand'),middle=get('Finger2'),index=get('Finger1'),parent=wrist.parent as TransformNode;
   if(middle&&index&&parent){const pi=parent.getWorldMatrix().clone().invert(),f=mode==='raise'?dir(0,1,.05):mode==='sit'?dir(-side*.95,.04,.12):s>.5?dir(0,-.12,1):dir(0,1,.02),across=mode==='raise'?dir(-side,0,0):reach?dir(-side,0,0):mode==='sit'?dir(0,0,-1):s>.5?dir(-side,0,0):dir(0,0,-1);
    wrist.rotationQuaternion=palmQuaternion(middle.position,index.position,Vector3.TransformNormal(f,pi),Vector3.TransformNormal(across,pi));refresh(wrist);
    for(let digit=1;digit<=4;digit++){const a=get('Finger'+digit),b=get('Finger'+digit+'1'),c=get('Finger'+digit+'2');if(a&&b&&c){aim(a,b,a.getAbsolutePosition().add(f));aim(b,c,b.getAbsolutePosition().add(f));}}
   }
  }
  this.blend=Math.min(1,this.blend+dt/.7);const a=this.blend*this.blend*(3-2*this.blend);
  if(a<1)for(const[n,p]of this.previous){n.position.copyFrom(Vector3.Lerp(p.p,n.position,a));n.rotationQuaternion=Quaternion.Slerp(p.q,n.rotationQuaternion??Quaternion.FromEulerVector(n.rotation),a);}refresh(this.root);
 }
}
