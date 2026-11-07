import {REFUGE_STATION as REFUGE} from '../../online/RefugePlan';
import {ritualLegPose} from './RitualLegs';
import {drapedSleeveFrame} from './SleeveDrape';
import {LayAssembly} from './LayAssembly';
import {AssetContainer,Bone,Color3,LoadAssetContainerAsync,Matrix,Mesh,MeshBuilder,PBRMaterial,Quaternion,RawTexture,Scene,Skeleton,StandardMaterial,TransformNode,Vector3,VertexBuffer} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {armChain,ConnectedArm,wristRings,type WristRing} from './ConnectedArms';
import {palmQuaternion} from './PalmPose';
import {applyRedGoldKasaya} from './RedGoldKasaya';
import {CEREMONY_MONKS,processionPoint,type CeremonyAct} from './CeremonyPlan';

const V=(x:number,y:number,z:number)=>new Vector3(x,y,z),clamp=(v:number)=>Math.max(0,Math.min(1,v)),smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const REST:Record<string,[number,number,number]>={hips:[0,.92,0],chest:[0,1.24,0],head:[0,1.52,0],skirt:[0,.95,0]};
for(const side of [-1,1]){const s=side<0?'r':'l';REST['arm_'+s]=[side*.20,1.45,0];REST['fore_'+s]=[side*.395,1.43,.035];REST['hand_'+s]=[side*.565,1.435,.105];REST['sleeveArm_'+s]=[side*.20,1.45,0];REST['sleeveFore_'+s]=[side*.395,1.43,0];REST['thigh_'+s]=[side*.12,.88,0];REST['calf_'+s]=[side*.13,.47,0];REST['foot_'+s]=[side*.20,.075,-.02];}
const NAMES=Object.keys(REST),index=(n:string)=>NAMES.indexOf(n),ONE=Vector3.One();
function weights(x:number,y:number,z:number,material:string){
 const side=x<0?'r':'l',ax=Math.abs(x),w=new Map<string,number>(),put=(n:string,a:number)=>{if(a>0)w.set(n,(w.get(n)??0)+a);};
 const cloth=material==='upper'||material==='gasa';
 if(cloth){
  // A free-hanging sleeve follows its cuff, while the long lower kasaya gathers at the hips.
  const arm=smooth(.29,.44,ax)*(material==='gasa'?smooth(.92,1.19,y):smooth(.80,.91,y));
  const fore=smooth(.32,.53,ax),hand=smooth(.56,.63,ax);
  put('sleeveArm_'+side,arm*(1-fore));put('sleeveFore_'+side,arm*fore);
  const top=smooth(1.12,1.38,y);put('chest',(1-arm)*top);put('skirt',(1-arm)*(1-top));
 }else if(ax>.52&&y>1.25){put('hand_'+side,1);}else if(y>1.49){put('head',1);}else if(ax>.235&&y>1.25){const f=smooth(.30,.44,ax),h=smooth(.55,.615,ax);put('arm_'+side,1-f);put('fore_'+side,f*(1-h));put('hand_'+side,f*h);
 }else if(y<.88){const k=smooth(.35,.57,y),foot=1-smooth(.13,material==='pants'?.24:.18,y);put('thigh_'+side,k);put('calf_'+side,(1-k)*(1-foot));put('foot_'+side,(1-k)*foot);
 }else{const c=smooth(.95,1.28,y);put('hips',1-c);put('chest',c);}
 const pairs=[...w].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=pairs.reduce((s,p)=>s+p[1],0)||1;
 return {j:Array.from({length:4},(_,i)=>pairs[i]?index(pairs[i][0]):0),w:Array.from({length:4},(_,i)=>(pairs[i]?.[1]??0)/sum)};
}
function ik(a:Vector3,target:Vector3,pole:Vector3,l1:number,l2:number){const d=target.subtract(a),len=Math.max(.02,Math.min(d.length(),l1+l2-.001));d.normalize();const p=pole.subtract(a);p.subtractInPlace(d.scale(Vector3.Dot(p,d)));if(p.lengthSquared()<.00001)p.copyFrom(Vector3.Right());p.normalize();const k=(l1*l1-l2*l2+len*len)/(2*len);return a.add(d.scale(k)).add(p.scale(Math.sqrt(Math.max(0,l1*l1-k*k))));}

/** One shared source geometry/texture set, independent skeletons; no replacement with primitive people. */
export class CeremonyLibrary{
 private container!:AssetContainer;private templates:Mesh[]=[];private wrists:WristRing[]=[];private armMaterial!:PBRMaterial;private innerMaterial!:PBRMaterial;private footMaterial?:PBRMaterial;readonly actors:CeremonyMonk[]=[];
 constructor(private scene:Scene){}
 async load(){
  const c=this.container=await LoadAssetContainerAsync(import.meta.env.BASE_URL+'assets/chars/ready-made/creator424-monk/model.glb',this.scene);
  applyRedGoldKasaya(c.materials);this.innerMaterial=c.materials.find(m=>m.name==='upper') as PBRMaterial;c.addAllToScene();for(const n of c.rootNodes){n.computeWorldMatrix(true);for(const d of n.getDescendants())(d as TransformNode).computeWorldMatrix?.(true);}
  const all=c.meshes.filter(m=>m instanceof Mesh&&m.getTotalVertices()>0) as Mesh[];
  let lo=V(Infinity,Infinity,Infinity),hi=V(-Infinity,-Infinity,-Infinity);for(const m of all){const b=m.getBoundingInfo().boundingBox;lo=Vector3.Minimize(lo,b.minimumWorld);hi=Vector3.Maximize(hi,b.maximumWorld);}
  const anatomy=all.find(m=>m.material?.name==='material_5')!.getBoundingInfo().boundingBox,centerX=(anatomy.minimumWorld.x+anatomy.maximumWorld.x)/2;
  const scale=1.8/(hi.y-lo.y),normalize=Matrix.Translation(-centerX,-lo.y,-(lo.z+hi.z)/2).multiply(Matrix.Scaling(scale,scale,scale));
  for(const m of all){const bake=m.getWorldMatrix().multiply(normalize);m.makeGeometryUnique();m.bakeTransformIntoVertices(bake);m.parent=null;m.position.setAll(0);m.rotation.setAll(0);m.rotationQuaternion=null;m.scaling.setAll(1);m.computeWorldMatrix(true);
   const p=m.getVerticesData(VertexBuffer.PositionKind)!,j:number[]=[],w:number[]=[];
   if(m.material?.name==='upper'||m.material?.name==='gasa')for(let i=0;i<p.length;i+=3){const ax=Math.abs(p[i]),a=smooth(.30,.41,ax)*smooth(.83,1.05,p[i+1]);p[i]=Math.sign(p[i])*(ax*(1-a)+(.395+(ax-.395)*.55)*a);}
   if(m.material?.name==='gasa')for(let i=0;i<p.length;i+=3)p[i]=p[i]*smooth(1.1,1.28,p[i+1])+.31*Math.tanh(p[i]/.31)*(1-smooth(1.1,1.28,p[i+1]));
   if(m.material?.name==='pants')for(let i=0;i<p.length;i+=3)if(p[i+1]<.13)p[i+1]=.13+(p[i+1]-.13)*.08;
   m.setVerticesData(VertexBuffer.PositionKind,p);
   if(m.material?.name==='material_5'){this.wrists=wristRings(p,m.getIndices()!,m.getVerticesData(VertexBuffer.UVKind)!);for(const r of this.wrists)REST['hand_'+(r.side<0?'r':'l')]=[r.center.x,r.center.y,r.center.z];this.armMaterial=(m.material as PBRMaterial).clone('continuous-anatomical-arms')!;this.armMaterial.bumpTexture=null;this.armMaterial.backFaceCulling=false;}
   for(let i=0;i<p.length;i+=3){const a=weights(p[i],p[i+1],p[i+2],m.material?.name??'');j.push(...a.j);w.push(...a.w);}
   m.setVerticesData(VertexBuffer.MatricesIndicesKind,j);m.setVerticesData(VertexBuffer.MatricesWeightsKind,w);m.numBoneInfluencers=4;m.isPickable=false;m.receiveShadows=true;m.alwaysSelectAsActiveMesh=true;m.setEnabled(false);this.templates.push(m);
   if(m.material?.name==='material_5'){const all=Array.from(m.getIndices()!),feet:number[]=[],body:number[]=[];for(let k=0;k<all.length;k+=3){const tri=all.slice(k,k+3);(tri.every(v=>p[v*3+1]<.15)?feet:body).push(...tri);}const foot=m.clone('source-bare-feet',null,false)!;foot.makeGeometryUnique();foot.setIndices(feet);const skin=this.footMaterial=(m.material as PBRMaterial).clone('ritual-bare-feet')!;skin.albedoTexture=null;skin.bumpTexture=null;skin.albedoColor=Color3.FromHexString('#bd9b83');skin.roughness=.86;skin.backFaceCulling=false;foot.material=skin;foot.setEnabled(false);this.templates.push(foot);m.setIndices(body);}

  }
 }
 create(id:string,act:CeremonyAct){const a=new CeremonyMonk(this.scene,id,act,this.templates,this.wrists,this.armMaterial,this.innerMaterial);this.actors.push(a);return a;}
 update(dt:number,limit=this.actors.length){for(let i=0;i<limit;i++){const a=this.actors[i];if(a.root.isEnabled())a.update(dt);}}
 dispose(){for(const a of this.actors)a.dispose();this.armMaterial?.dispose(false,false);this.footMaterial?.dispose(false,false);this.container?.dispose();}
}

export class CeremonyMonk{
 readonly root:TransformNode;readonly skeleton:Skeleton;readonly meshes:Mesh[]=[];private bones=new Map<string,Bone>();private arms=new Map<string,ConnectedArm>();private time=0;private lastAct?:CeremonyAct;private transition=0;private previous=new Map<string,Matrix>();private seat:Mesh;private lastBeat=-1;onStrike?:(p:Vector3)=>void;
 private props:TransformNode;private urn:TransformNode;private incense:TransformNode;private mallet:TransformNode;private smoke:Mesh[]=[];private materials:StandardMaterial[]=[];private smokeTexture:RawTexture;private emberMaterial:StandardMaterial;private candleFlame:Mesh;
 constructor(private scene:Scene,id:string,public act:CeremonyAct,templates:Mesh[],wrists:WristRing[],armMaterial:PBRMaterial,innerMaterial:PBRMaterial){
  this.root=new TransformNode(id,scene);this.skeleton=new Skeleton(id+'-ceremony-rig',id,scene);
  for(const n of NAMES){const p=Vector3.FromArray(REST[n]);this.bones.set(n,new Bone(n,this.skeleton,null,Matrix.Translation(p.x,p.y,p.z)));}
  for(const t of templates){const m=t.clone(id+'-'+t.name,this.root,false)!;m.skeleton=this.skeleton;m.setEnabled(true);m.alwaysSelectAsActiveMesh=true;this.meshes.push(m);}
  for(const ring of wrists){const side=ring.side<0?'r':'l',arm=new ConnectedArm(scene,id+'-continuous-arm-'+side,ring,armMaterial,innerMaterial);arm.mesh.parent=this.root;arm.sleeve.parent=this.root;arm.bind(this.skeleton,[index('arm_'+side),index('fore_'+side),index('hand_'+side)],Vector3.FromArray(REST['arm_'+side]),Vector3.FromArray(REST['fore_'+side]));this.arms.set(side,arm);}
  this.props=new TransformNode(id+'-ritual-props',scene);this.props.parent=this.root;
  const mat=(name:string,color:string)=>{const m=new StandardMaterial(id+'-'+name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor.setAll(.15);this.materials.push(m);return m;};
  const wood=mat('wood','#79401d'),gold=mat('brass','#bc8a32'),red=mat('incense','#922e20'),ember=mat('ember','#c84b1a');ember.emissiveColor.set(1,.23,.035);this.emberMaterial=ember;
  this.seat=MeshBuilder.CreateCylinder(id+'-meditation-cushion',{height:.12,diameter:1.05,tessellation:40},scene);this.seat.parent=this.root;this.seat.position.y=.06;this.seat.material=mat('meditation-cushion','#5d3924');
  this.incense=new TransformNode(id+'-held-incense',scene);this.incense.parent=this.root;
  for(let i=-1;i<=1;i++){const stick=MeshBuilder.CreateCylinder(id+'-incense',{height:.36,diameter:.004,tessellation:6},scene);stick.parent=this.incense;stick.position.set(i*.012,.16,0);stick.material=red;const tip=MeshBuilder.CreateSphere(id+'-glowing-tip',{diameter:.007,segments:6},scene);tip.parent=this.incense;tip.position.set(i*.012,.34,0);tip.material=ember;}
  const smokeMat=mat('smoke','#bfc6c6');smokeMat.alpha=.15;smokeMat.disableLighting=true;smokeMat.emissiveColor.set(.4,.43,.43);smokeMat.backFaceCulling=false;
  const pixels=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5),a=Math.max(0,1-d);pixels.set([210,218,218,Math.round(a*a*220)],(y*32+x)*4);}this.smokeTexture=RawTexture.CreateRGBATexture(pixels,32,32,scene,false,false);this.smokeTexture.hasAlpha=true;smokeMat.diffuseTexture=this.smokeTexture;smokeMat.useAlphaFromDiffuseTexture=true;smokeMat.disableDepthWrite=true;
  for(let i=0;i<5;i++){const s=MeshBuilder.CreatePlane(id+'-smoke',{width:.07,height:.15},scene);s.billboardMode=Mesh.BILLBOARDMODE_ALL;s.material=smokeMat;s.parent=this.incense;s.isPickable=false;this.smoke.push(s);}
  const fish=MeshBuilder.CreateSphere(id+'-wooden-fish',{diameter:1,segments:20},scene);fish.parent=this.props;fish.position.set(0,.23,.63);fish.scaling.set(.34,.26,.28);fish.material=wood;
  const slit=MeshBuilder.CreateBox(id+'-fish-slit',{width:.22,height:.008,depth:.015},scene);slit.parent=this.props;slit.position.set(0,.29,.758);slit.material=mat('dark-slit','#26130b');
  const cushion=MeshBuilder.CreateCylinder(id+'-fish-ring',{height:.06,diameter:.4,tessellation:32},scene);cushion.parent=this.props;cushion.position.set(0,.07,.63);cushion.material=mat('cushion','#773326');
  this.urn=new TransformNode(id+'-incense-stand',scene);this.urn.parent=this.root;
  const stand=MeshBuilder.CreateCylinder(id+'-urn-stand',{height:.76,diameterTop:.06,diameterBottom:.10,tessellation:16},scene);stand.parent=this.urn;stand.position.set(0,.38,.78);stand.material=wood;
  const base=MeshBuilder.CreateCylinder(id+'-urn-base',{height:.06,diameter:.36,tessellation:28},scene);base.parent=this.urn;base.position.set(0,.03,.78);base.material=wood;
  const bowl=MeshBuilder.CreateLathe(id+'-incense-bowl',{shape:[V(.07,0,0),V(.14,.03,0),V(.17,.14,0),V(.16,.19,0),V(.14,.19,0),V(.14,.05,0)],tessellation:32,sideOrientation:Mesh.DOUBLESIDE},scene);bowl.parent=this.urn;bowl.position.set(0,.76,.78);bowl.material=gold;
  const ash=MeshBuilder.CreateCylinder(id+'-incense-ash',{height:.015,diameter:.28,tessellation:24},scene);ash.parent=this.urn;ash.position.set(0,.92,.78);ash.material=mat('ash','#68615a');
  const candle=MeshBuilder.CreateCylinder(id+'-lighting-candle',{height:.29,diameter:.035,tessellation:12},scene);candle.parent=this.urn;candle.position.set(.011,1.435,.566);candle.material=mat('wax','#d6b875');const holder=MeshBuilder.CreateCylinder(id+'-candle-holder',{height:1.28,diameter:.022,tessellation:12},scene);holder.parent=this.urn;holder.position.set(.011,.64,.566);holder.material=gold;const flameMat=mat('candle-flame','#ffb135');flameMat.emissiveColor.set(1,.55,.08);this.candleFlame=MeshBuilder.CreateSphere(id+'-candle-flame',{diameter:.026,segments:10},scene);this.candleFlame.scaling.y=2;this.candleFlame.parent=this.urn;this.candleFlame.position.set(.011,1.602,.566);this.candleFlame.material=flameMat;
  this.mallet=new TransformNode(id+'-mallet',scene);this.mallet.parent=this.root;const handle=MeshBuilder.CreateCylinder(id+'-mallet-handle',{height:.28,diameter:.014,tessellation:8},scene);handle.parent=this.mallet;handle.rotation.x=Math.PI/2;handle.position.z=.12;handle.material=wood;const ball=MeshBuilder.CreateSphere(id+'-mallet-ball',{diameter:.052,segments:12},scene);ball.parent=this.mallet;ball.position.z=.26;ball.material=gold;
  this.update(0);
 }
 setAct(act:CeremonyAct){this.act=act;this.time=0;}
 poseAt(act:CeremonyAct,time:number,dt=0){if(this.act!==act)this.setAct(act);this.time=Math.max(0,time-dt);this.update(dt);}
 private write(n:string,m:Matrix){const b=this.bones.get(n)!,old=this.previous.get(n);if(old&&this.transition>0)Matrix.DecomposeLerpToRef(old,m,1-smooth(0,.75,this.transition),b.getLocalMatrix());else b.getLocalMatrix().copyFrom(m);b.markAsDirty();}
 private bone(n:string,pos:Vector3,q=Quaternion.Identity(),scale=ONE){this.write(n,Matrix.Compose(scale,q,pos));}
 private sleeve(n:string,a:Vector3,b:Vector3,side:number,length:number,drop:number){this.write(n,drapedSleeveFrame(a,b,side,length,drop,n.startsWith('sleeveFore')?.022:.006));}
 private segment(n:string,a:Vector3,b:Vector3,restDir:Vector3){this.bone(n,a,Quaternion.FromUnitVectorsToRef(restDir.normalize(),b.subtract(a).normalize(),new Quaternion()));}
 update(dt:number){this.time+=dt;const t=this.time,act=this.act;
  if(act!==this.lastAct){if(this.lastAct){this.previous.clear();for(const [n,b]of this.bones)this.previous.set(n,b.getLocalMatrix().clone());this.transition=.75;}this.seat.setEnabled(act==='meditate'||act==='woodfish');for(const m of this.meshes){if(m.material?.name==='pants')m.setEnabled(true);if(m.material?.name==='shoes')m.setEnabled(act==='incense'||act==='procession');}this.urn.setEnabled(act==='incense');this.props.setEnabled(act==='woodfish');this.props.position.y=.12;this.mallet.setEnabled(act==='woodfish');this.incense.setEnabled(act==='incense');this.lastAct=act;}
  const seated=act==='meditate'||act==='woodfish',kneel=act==='bow',walk=act==='procession';
  // Slow complete prostration, including a pause upright and on the ground.
  const cycle=(t%14)/14,bow=kneel?(cycle<.2?0:cycle<.46?smooth(.2,.46,cycle):cycle<.62?1:1-smooth(.62,.9,cycle)):0;
  this.transition=Math.max(0,this.transition-dt);const beatId=Math.floor(t/1.6);if(act==='woodfish'&&beatId!==this.lastBeat){this.lastBeat=beatId;this.onStrike?.(Vector3.TransformCoordinates(V(0,.36,.63),this.root.computeWorldMatrix(true)));}
  const hipsY=seated?.34:kneel?.49-.08*bow:.92+(walk?.006*Math.cos(t*5):0),hipsZ=kneel?-.12*bow:0;
  const hip=V(0,hipsY,hipsZ),lean=bow*2.05+(act==='incense'?.06*(.5-.5*Math.cos(t*Math.PI/9)):act==='woodfish'?.25:0),spineQ=Quaternion.RotationAxis(Vector3.Right(),lean);
  const chest=hip.add(V(0,.32*Math.cos(lean),.32*Math.sin(lean))),head=hip.add(V(0,.60*Math.cos(lean),.60*Math.sin(lean)));
  this.bone('hips',hip);this.bone('chest',chest,spineQ);this.bone('head',head,Quaternion.RotationAxis(Vector3.Right(),lean*.92));
  this.bone('skirt',V(0,kneel?Math.max(.47,hipsY+.03):hipsY+.03,hipsZ),Quaternion.Identity(),V(seated?1.12:1,seated?.42:kneel?.42:1,seated?1.12:kneel?.75:1));
  for(const side of [-1,1]){const s=side<0?'r':'l';const shoulder=hip.add(V(side*.20,.53*Math.cos(lean),.53*Math.sin(lean)));
   const beat=.5-.5*Math.cos(t*Math.PI*2/1.6),swing=Math.sin(t*4.7);
   let hand=hip.add(V(side*.036,.39,.28));
   if(seated)hand=hip.add(V(side*.12,.24+(side>0?.015:0),.20));
   if(act==='incense'){const phase=(t%24)/24,lift=smooth(.12,.34,phase)*(1-smooth(.8,.94,phase));hand.y=hipsY+.39+.13*lift;hand.z=.34-.06*lift;this.incense.rotation.x=.65*(1-lift);}
   if(act==='woodfish'&&side<0)hand=V(-.15,.57+beat*.1,.36);
   if(kneel&&bow>.18){const k=smooth(.18,.85,bow);hand=Vector3.Lerp(hand,V(side*.17,.07,.68),k);}
   if(walk)hand=hip.add(V(side*.12,.31,.27));
   const pole=Vector3.Lerp(hip.add(V(side*.56,.12,.07)),V(side*.45,.12,.45),smooth(.30,.75,bow)),restShoulder=Vector3.FromArray(REST['arm_'+s]),restElbow=Vector3.FromArray(REST['fore_'+s]),restWrist=Vector3.FromArray(REST['hand_'+s]);
   const chain=armChain(shoulder,hand,pole,Vector3.Distance(restShoulder,restElbow),Vector3.Distance(restElbow,restWrist));hand=chain.wrist;const elbow=chain.elbow;
   this.segment('arm_'+s,shoulder,elbow,restElbow.subtract(restShoulder));this.segment('fore_'+s,elbow,hand,restWrist.subtract(restElbow));this.sleeve('sleeveArm_'+s,shoulder,elbow,side,.195,.92+.012*Math.sin(t*.9+side));this.sleeve('sleeveFore_'+s,elbow,hand,side,.205,1.02+.024*Math.sin(t*1.2+side*.7));
   let handDir=V(-side*.04,1,.02);if(seated)handDir=V(-side*.98,.03,.08);if(act==='woodfish'&&side<0)handDir=V(.1,-.1,1);
   // Source hand is extended along X with palm downward; two-axis frame keeps palms opposed.
   let across=seated?V(0,0,1):V(0,0,-1);if(act==='woodfish'&&side<0)across=V(-side,0,0);const from=V(side*.97,0,.24);let q=palmQuaternion(from,V(0,0,1),handDir.normalize(),across);if(kneel)q=Quaternion.Slerp(q,palmQuaternion(from,V(0,0,1),V(0,-.15,1),V(-side,0,0)),smooth(.30,.75,bow));
   this.bone('hand_'+s,hand,q);
   const actualHand=this.bones.get('hand_'+s)!.getLocalMatrix(),actualWrist=actualHand.getTranslation();const surface=this.arms.get(s)!,camera=this.scene.activeCamera;const near=!camera||Vector3.DistanceSquared(camera.globalPosition,this.root.getAbsolutePosition())<36;if(surface.setNear(near))surface.update(this.bones.get('arm_'+s)!.getLocalMatrix().getTranslation(),this.bones.get('fore_'+s)!.getLocalMatrix().getTranslation(),actualWrist,actualHand);
   if(act==='incense'&&side>0)this.incense.position.copyFrom(actualWrist.add(V(-.025,.02,.02)));
   if(act==='woodfish'&&side<0){this.mallet.position.copyFrom(actualWrist);this.mallet.rotation.x=.25-beat*.7;}
   const leg=ritualLegPose(hip,side,seated,kneel,walk,t);this.segment('thigh_'+s,leg.thigh,leg.knee,Vector3.FromArray(REST['calf_'+s]).subtract(Vector3.FromArray(REST['thigh_'+s])));this.segment('calf_'+s,leg.knee,leg.ankle,Vector3.FromArray(REST['foot_'+s]).subtract(Vector3.FromArray(REST['calf_'+s])));this.bone('foot_'+s,leg.ankle,leg.rotation);
  }
  const incensePhase=(t%24)/24,lit=incensePhase>=.10;this.emberMaterial.emissiveColor.set(lit?1:0,lit?.23:0,lit?.035:0);this.emberMaterial.diffuseColor.set(lit?.78:.08,lit?.16:.07,lit?.04:.06);this.candleFlame.scaling.y=1.8+Math.sin(t*15)*.15;
  for(let i=0;i<this.smoke.length;i++){const p=(t*.25+i/5)%1;this.smoke[i].position.set(Math.sin(p*8+i)*.018,.35+p*.25,Math.cos(p*6+i)*.01);this.smoke[i].scaling.setAll(.5+p*1.3);this.smoke[i].visibility=lit?1-p:0;}
 }
 dispose(){for(const a of this.arms.values())a.dispose();this.root.dispose(false,false);this.skeleton.dispose();this.smokeTexture.dispose();for(const m of this.materials)m.dispose();}
}

/** The hall ritual monks stay (anh Thanh 2026-11-03: only the still resident monks outside the door were removed). */
/** Hall ceremony monks are off for now (anh Thanh 2026-11-04 "tắt cho nhẹ, khi nào làm lễ thì đưa vào sau"): set true to bring them back. */
export const SHOW_HALL_MONKS=false;
/** Hall ritual monks stay visible up to this distance (metres): the gate is ~600 m from the altar. */
export const HALL_MONK_VIEW=750;
/**
 * Far monks (Claude 2026-11-03): each monk is ~25 meshes, so 130 of them cost ~1,500 draw calls — most of the stutter when
 * looking across the campus. Beyond NEAR_MONK metres a monk is drawn from a baked snapshot of its pose (kneeling bow,
 * seated ritual, walking procession) merged into one mesh and thin-instanced: a few draws for the whole assembly.
 * Close by, the full animated monk takes over again, so near is sharp and far is a calm, still silhouette.
 */
type FarKind='bow'|'sit'|'walk';
const farKind=(act:CeremonyAct):FarKind=>act==='bow'?'bow':act==='procession'?'walk':'sit';
function bakeMonk(monk:CeremonyMonk,name:string):Mesh|null{
 const root=monk.root;root.computeWorldMatrix(true);monk.skeleton.computeAbsoluteMatrices(true);monk.skeleton.prepare(true);/* bone matrices must exist before the first frame */const inv=root.getWorldMatrix().clone().invert(),parts:Mesh[]=[];
 for(const m of root.getChildMeshes(false)){if(!(m instanceof Mesh)||!m.isEnabled()||!m.isVisible||!m.getTotalVertices()||(m.material?.alpha??1)<1||m.billboardMode)continue;
  try{const c=m.clone(m.name+'-far',null,true,false)!;c.makeGeometryUnique();if(m.skeleton){c.skeleton=m.skeleton;c.applySkeleton(m.skeleton);c.skeleton=null;c.removeVerticesData(VertexBuffer.MatricesIndicesKind);c.removeVerticesData(VertexBuffer.MatricesWeightsKind);}
   c.position.setAll(0);c.rotationQuaternion=null;c.rotation.setAll(0);c.scaling.setAll(1);c.bakeTransformIntoVertices(m.computeWorldMatrix(true).multiply(inv));c.alwaysSelectAsActiveMesh=false;
   // MergeMeshes needs one shared attribute set: keep position, normal and one UV channel only
   for(const k of c.getVerticesDataKinds())if(k!==VertexBuffer.PositionKind&&k!==VertexBuffer.NormalKind&&k!==VertexBuffer.UVKind)c.removeVerticesData(k);
   const nv=c.getTotalVertices();if(!c.isVerticesDataPresent(VertexBuffer.UVKind))c.setVerticesData(VertexBuffer.UVKind,new Float32Array(nv*2),false);if(!c.isVerticesDataPresent(VertexBuffer.NormalKind))c.createNormals(false);
   parts.push(c);}catch(e){console.warn('far monk bake part',m.name,String(e).slice(0,160));}}
 if(!parts.length)return null;{const side=(parts[0] as unknown as {sideOrientation:number}).sideOrientation;for(const p of parts)(p as unknown as {sideOrientation:number}).sideOrientation=side;}let merged:Mesh|null=null;try{merged=Mesh.MergeMeshes(parts,true,true,undefined,false,true);}catch(e){console.warn('far monk bake',e);for(const p of parts)p.dispose();return null;}if(!merged)return null;merged.name=name;merged.isPickable=false;merged.alwaysSelectAsActiveMesh=false;return merged;
}
export class HallCeremony{
 private library: CeremonyLibrary;private lay?:LayAssembly;get layReview(){return this.lay?.review;}ready=false;failed=false;elapsed=0;onStrike?:(p:Vector3)=>void;
 private refugeMonk?:CeremonyMonk;
 get refugeReady(){return !!this.refugeMonk;}
 private poseDebt:number[]=[];private far=new Map<FarKind,Mesh>();private farClock=1;private farSig='';
 constructor(private libraryScene:Scene,private includeLay=true,private low=false){this.library=new CeremonyLibrary(libraryScene);}
 async load(){try{await this.library.load();if(SHOW_HALL_MONKS)for(const p of CEREMONY_MONKS){const a=this.library.create(p.id,p.act);a.root.position.set(p.x,1.205,p.z);a.root.rotation.y=Math.PI;a.onStrike=p=>this.onStrike?.(p);a.update(p.phase);}
  if(SHOW_HALL_MONKS)try{for(const kind of ['bow','sit','walk']as FarKind[]){const i=CEREMONY_MONKS.findIndex(p=>farKind(p.act)===kind);if(i<0)continue;const m=bakeMonk(this.library.actors[i],'hall-monk-far-'+kind);if(m){m.thinInstanceSetBuffer('matrix',new Float32Array(16),16,false);m.thinInstanceCount=0;m.setEnabled(false);this.far.set(kind,m);}}}catch(e){console.warn('far monks unavailable, full monks kept',e);}if(this.includeLay){this.lay=new LayAssembly(this.libraryScene,this.library);await this.lay.load();}if(!this.includeLay){
   const monk=this.refugeMonk=this.library.create('refuge-guide','meditate');
   monk.root.position.set(REFUGE.x,REFUGE.y,REFUGE.monkZ);monk.root.setEnabled(false);monk.update(0);
  }this.ready=true;}catch(e){this.failed=true;throw e;}}
 /** anh Thanh 2026-11-03: the ritual must be seen from afar (from the tam quan gate), not only up close. Distant monks stay visible
 * and keep moving, at a lower pose rate; full-rate animation only near the viewer. */
 update(dt:number,viewer:Vector3){if(!this.ready)return;this.elapsed+=dt;
  if(this.refugeMonk){const visible=Vector3.DistanceSquared(viewer,this.refugeMonk.root.position)<55**2;this.refugeMonk.root.setEnabled(visible);if(visible)this.refugeMonk.update(dt);}
  const n=SHOW_HALL_MONKS?CEREMONY_MONKS.length:0,near=(this.low?12:40)**2,rig=(this.far.size?(this.low?35:55):HALL_MONK_VIEW)**2;
  const farList=new Map<FarKind,Matrix[]>();let sig='';
  for(let i=0;i<n;i++){const p=CEREMONY_MONKS[i],a=this.library.actors[i];
   if(p.act==='procession'){const v=processionPoint(this.elapsed,p.x<0?-1:1,'rank' in p ? p.rank as number : 2);a.root.position.x=v.x;a.root.position.z=v.z;a.root.rotation.y=v.yaw;}
   const d2=Vector3.DistanceSquared(viewer,a.root.position);a.root.setEnabled(d2<rig);
   if(!a.root.isEnabled()){if(d2<HALL_MONK_VIEW*HALL_MONK_VIEW&&this.far.size){const k=farKind(p.act),l=farList.get(k)??[];l.push(Matrix.Compose(Vector3.One(),Quaternion.RotationYawPitchRoll(a.root.rotation.y,0,0),a.root.position));farList.set(k,l);sig+=i+',';}continue;}
   const step=d2<near?0:d2<150*150?(this.low?1/12:1/20):1/5;this.poseDebt[i]=(this.poseDebt[i]??0)+dt;if(this.poseDebt[i]>=step){a.update(this.poseDebt[i]);this.poseDebt[i]=0;}}
  this.farClock+=dt;const walkers=farList.get('walk')?.length??0;
  if(this.far.size&&(sig!==this.farSig||walkers||this.farClock>1)){this.farSig=sig;this.farClock=0;for(const [kind,mesh]of this.far){const l=farList.get(kind)??[];mesh.setEnabled(l.length>0);if(!l.length)continue;const buf=new Float32Array(l.length*16);l.forEach((m,j)=>m.copyToArray(buf,j*16));mesh.thinInstanceSetBuffer('matrix',buf,16,false);mesh.thinInstanceCount=l.length;mesh.thinInstanceRefreshBoundingInfo(false);}}
  this.lay?.update(Math.min(.25,this.libraryScene.getEngine().getDeltaTime()/1000),this.libraryScene.activeCamera?.globalPosition??viewer);}
 dispose(){this.lay?.dispose();for(const m of this.far.values())m.dispose();this.library.dispose();}
}








