import {makeLayHair,scalpSurface} from './LayHair';
import {Color3,DynamicTexture,Matrix,Mesh,MeshBuilder,TransformNode,PBRMaterial,Quaternion,Vector3,VertexBuffer,VertexData,type Scene} from '@babylonjs/core';
import type {CeremonyLibrary,CeremonyMonk} from './CeremonyMonks';
import {LAY_SEATS,LAY_PRAYER_PADS,LAY_BOW_PERIOD,layWave,layPerson,layTimeline} from './LayAssemblyPlan';
import {clusterMesh} from './CrowdMesh';
import {LiveSeatTags,liveSeatsEnabled} from './LiveSeatTags';
import type {Participant} from '../../../live/participants';

export class LayAssembly{
 ready=false;failed=false;elapsed=0;waveIndex=0;private wave=layWave(0);private waveTime=0;private hairSets:{mesh:Mesh;female:boolean;near:boolean}[]=[];private actorHair:{root:TransformNode;male:Mesh;female:Mesh}[]=[];private headPose=Matrix.Identity();private moving:CeremonyMonk[]=[];private near:Mesh[]=[];private far:Mesh[]=[];private mats:PBRMaterial[]=[];private pads:Mesh[]=[];private lastCull=-1;private homeSignature='';private dead=false;
 get review(){return{count:1500,slots:15,wave:this.waveIndex+1,phase:this.waveTime<this.wave.outward?'đang lên lễ':this.waveTime<this.wave.outward+this.wave.bowing?'lạy 3 lạy':'tốp kế tiếp lên lễ'};}
 constructor(private scene:Scene,private library:CeremonyLibrary){}
 private guests=new Map<number,Participant>();private liveTags?:LiveSeatTags;
 async load(){try{
  const robe=new PBRMaterial('lay-grey-ao-trang',this.scene);robe.albedoColor=Color3.FromHexString('#a5a39b');robe.roughness=.94;robe.metallic=0;robe.backFaceCulling=false;robe.twoSidedLighting=true;this.mats.push(robe);
  const surfaces=new Map<PBRMaterial,PBRMaterial>(); const dress=(a:CeremonyMonk)=>{for(const m of a.root.getChildMeshes()){if(!(m instanceof Mesh))continue;if(m.material?.name==='upper'||m.material?.name==='gasa'||m.name.includes('sleeve'))m.material=robe;else if(m.material instanceof PBRMaterial){let two=surfaces.get(m.material);if(!two){two=m.material.clone('lay-'+m.material.name)!;two.name=m.material.name;two.backFaceCulling=false;two.twoSidedLighting=true;surfaces.set(m.material,two);this.mats.push(two);}m.material=two;}}};
  const source=this.library.create('lay-seated-source','meditate');dress(source);source.poseAt('meditate',0);source.root.computeWorldMatrix(true);source.skeleton.prepare(true);
  const parts=source.root.getChildMeshes().filter(m=>m instanceof Mesh&&m.isEnabled()&&!m.name.includes('cushion')) as Mesh[];
  for(const part of parts){if(!part.getTotalVertices())continue;const baked=part.clone('lay-bake',null,false)!;baked.makeGeometryUnique();baked.parent=null;baked.computeWorldMatrix(true);if(baked.skeleton){baked.applySkeleton(baked.skeleton);baked.skeleton=null;}const positions=baked.getVerticesData(VertexBuffer.PositionKind)!,uv=baked.getVerticesData(VertexBuffer.UVKind)??new Float32Array(positions.length/3*2),indices=baked.getIndices()!;
   for(const [set,cell]of [[this.near,0],[this.far,.115]] as const){const data=cell?clusterMesh(positions,indices,uv,cell):{positions:Array.from(positions),indices:Array.from(indices),uvs:Array.from(uv)},vd=new VertexData(),mesh=new Mesh(`lay-${cell}-${part.name}`,this.scene);vd.positions=data.positions;vd.indices=data.indices;vd.uvs=data.uvs;const normals:number[]=[];if(cell)VertexData.ComputeNormals(data.positions,data.indices,normals,{useRightHandedSystem:part.overrideMaterialSideOrientation===1});else normals.push(...baked.getVerticesData(VertexBuffer.NormalKind)!);vd.normals=normals;vd.applyToMesh(mesh);if(!cell){VertexData.ExtractFromMesh(part).applyToMesh(mesh);mesh.skeleton=part.skeleton;mesh.numBoneInfluencers=part.numBoneInfluencers;}mesh.material=part.material;mesh.overrideMaterialSideOrientation=part.overrideMaterialSideOrientation;mesh.isPickable=false;mesh.receiveShadows=true;mesh.setEnabled(false);set.push(mesh);}baked.dispose();
  }
  source.root.setEnabled(false);
  const hairMaterial=new PBRMaterial('lay-natural-black-hair',this.scene);hairMaterial.albedoColor=Color3.FromHexString('#030303');hairMaterial.roughness=.96;hairMaterial.metallic=0;hairMaterial.metallicF0Factor=.12;hairMaterial.environmentIntensity=.35;hairMaterial.backFaceCulling=false;hairMaterial.twoSidedLighting=true;this.mats.push(hairMaterial);
  const head=source.skeleton.bones.find(b=>b.name==='head')!;this.headPose=head.getLocalMatrix().clone();const skin=source.meshes.find(m=>m.material?.name==='material_5')!,rest=Matrix.Invert(head.getRestMatrix()),raw=skin.getVerticesData(VertexBuffer.PositionKind)!,local:number[]=[];for(let i=0;i<raw.length;i+=3){const p=Vector3.TransformCoordinates(Vector3.FromArray(raw,i),rest);local.push(p.x,p.y,p.z);}const fittedScalp=scalpSurface(local,skin.getIndices()!);
  for(const near of [false,true])for(const female of [false,true]){const mesh=makeLayHair(this.scene,female,!near,hairMaterial,fittedScalp);mesh.setEnabled(false);this.hairSets.push({mesh,female,near});}
  for(let i=0;i<45;i++){const a=this.library.create('lay-active-'+i,'meditate');dress(a);a.root.setEnabled(false);this.moving.push(a);const root=new TransformNode('lay-hair-root-'+i,this.scene);root.parent=a.root;root.rotationQuaternion=Quaternion.Identity();const male=this.hairSets.find(h=>h.near&&!h.female)!.mesh.clone('lay-male-hair-'+i,root,false)!,female=this.hairSets.find(h=>h.near&&h.female)!.mesh.clone('lay-female-bun-'+i,root,false)!;male.setEnabled(true);female.setEnabled(false);this.actorHair.push({root,male,female});}
  const tx=new DynamicTexture('yellow-meditation-brocade',{width:256,height:256},this.scene,true),ctx=tx.getContext() as CanvasRenderingContext2D;ctx.fillStyle='#c99b1f';ctx.fillRect(0,0,256,256);for(let y=0;y<256;y+=4){ctx.strokeStyle=y%8?'#deb63f':'#b58316';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}ctx.strokeStyle='#f5d871';ctx.lineWidth=8;ctx.strokeRect(12,12,232,232);tx.update();
  const yellow=new PBRMaterial('lay-yellow-cushions',this.scene);yellow.albedoTexture=tx;yellow.roughness=.88;this.mats.push(yellow);
  for(const [name,points]of [['lay-home-pads',LAY_SEATS],['lay-fifteen-ritual-pads',LAY_PRAYER_PADS]] as const){const pad=MeshBuilder.CreateCylinder(name,{diameter:1.12,height:.14,tessellation:24},this.scene);pad.material=yellow;pad.isPickable=false;this.instances(pad,points.map(p=>({x:p.x,y:1.275,z:p.z,yaw:0})));this.pads.push(pad);}
  if(liveSeatsEnabled())this.liveTags=new LiveSeatTags(this.scene,people=>{this.guests=new Map(people.map(p=>[p.seatId,p]));this.lastCull=-1;});
  this.ready=true;this.update(0,new Vector3(0,3,-45));
 }catch(e){this.failed=true;console.error('Lay assembly:',e);throw e;}}
 private instances(mesh:Mesh,points:{x:number;y:number;z:number;yaw:number}[],head?:Matrix){if(!points.length){mesh.setEnabled(false);return;}const data=new Float32Array(points.length*16);for(let i=0;i<points.length;i++){const p=points[i];const world=Matrix.Compose(Vector3.One(),Quaternion.RotationAxis(Vector3.Up(),p.yaw),new Vector3(p.x,p.y,p.z));(head?head.multiply(world):world).copyToArray(data,i*16);}mesh.thinInstanceSetBuffer('matrix',data,16,false);mesh.thinInstanceCount=points.length;mesh.thinInstanceRefreshBoundingInfo(false);mesh.setEnabled(true);}
 /** Review viewer only: expose phases without waiting several minutes; never called by the game. */
 preview(phase:'seated'|'outward'|'bow'|'return'){const w=layWave(0);this.elapsed=phase==='seated'?0:phase==='outward'?w.outward*.5:phase==='bow'?w.outward+4:w.outward+w.bowing+w.homeward*.5;this.lastCull=-1;}
 update(dt:number,eye:Vector3){if(!this.ready||this.dead)return;this.elapsed+=dt;const cohorts=layTimeline(this.elapsed),latest=cohorts[cohorts.length-1];if(latest){this.waveIndex=latest.index;this.wave=latest.wave;this.waveTime=latest.time;}
  const absent=new Set<number>();let signature='';for(const a of this.moving)a.root.setEnabled(false);
  for(const cohort of cohorts)for(let i=0;i<15;i++){const state=layPerson(cohort.wave,i,cohort.time),id=(cohort.index%3)*15+i,a=this.moving[id],hair=this.actorHair[id],person=cohort.wave.people[i].seat;signature+=state.atHome?'1':'0';if(state.atHome||this.guests.has(person.id)||(this.liveTags&&person.id>=300))continue;absent.add(person.id);a.root.setEnabled(true);a.root.position.set(state.x,state.act==='procession'?1.205:1.345,state.z);a.root.rotation.y=state.yaw;a.poseAt(state.act,state.act==='procession'?this.elapsed*2:state.poseTime,dt);hair.male.setEnabled(!person.female);hair.female.setEnabled(person.female);a.skeleton.bones.find(b=>b.name==='head')!.getLocalMatrix().decompose(undefined,hair.root.rotationQuaternion!,hair.root.position);}
  signature=cohorts.map(c=>c.index).join(',')+':'+signature;if(signature!==this.homeSignature){this.homeSignature=signature;this.lastCull=-1;}
  if(this.elapsed-this.lastCull<.5&&this.lastCull>=0)return;this.lastCull=this.elapsed;
  type P={x:number;y:number;z:number;yaw:number;female:boolean};const near:P[]=[],far:P[]=[];
  const ordered=LAY_SEATS.filter(p=>!absent.has(p.id)&&(!this.liveTags||p.id<300||this.guests.has(p.id))).map(p=>({p,d:(p.x-eye.x)**2+(p.z-eye.z)**2+(1.8-eye.y)**2})).sort((a,b)=>a.d-b.d);for(const {p,d}of ordered){if(d>450*450)continue;const target=d<22*22&&near.length<(this.liveTags?24:60)?near:far;target.push({x:p.x,y:1.345,z:p.z,yaw:Math.PI,female:this.guests.get(p.id)?.female??p.female});}for(const m of this.near)this.instances(m,near);for(const m of this.far)this.instances(m,far);for(const h of this.hairSets)this.instances(h.mesh,(h.near?near:far).filter(p=>p.female===h.female),this.headPose);
 } dispose(){this.dead=true;this.liveTags?.dispose();for(const a of this.moving)a.root.setEnabled(false);for(const m of [...this.near,...this.far,...this.pads,...this.hairSets.map(h=>h.mesh)])m.dispose();for(const m of this.mats)m.dispose(false,true);}
}










