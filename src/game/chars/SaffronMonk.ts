import {Scene,Mesh,MeshBuilder,VertexBuffer,VertexData,StandardMaterial,DynamicTexture,Color3,Vector3,Quaternion} from '@babylonjs/core';
import {CharacterLibrary,type HumanRig} from './CharacterLibrary';
import type {AvatarAsset,AvatarSurface} from './AvatarV2';
import {palmQuaternion} from './PalmPose';
import {DevotionPose} from '../../online/Pilgrim';
/** Reference-driven single-character prototype. The rejected ten-character set is kept separate. */
export async function createSaffronMonk(scene:Scene,low=false){
 const lib=new CharacterLibrary(scene,low);await lib.load();const asset=await lib.loadAvatarV2('monk-reference/avatar.json');
 const rig=lib.createHuman({id:'saffron-reference',appearance:'minh-v2',avatar:{version:2,face:'minh',outfit:'earth',hair:'short'},hair:'none',height:1.78,outfit:{robe:'#b67625',inner:'#bc812d',trousers:'#59402d',belt:'#76512d',trim:'#c99651',boots:'#423225',style:'robe',skirt:true}});
 rig.nodes.get('Head')?.scaling.multiplyInPlace(new Vector3(.9,.9,.9));
 const skin=rig.meshes.find(m=>m.name==='minh-v2-skin') as Mesh;
 for(const m of rig.meshes){if(/hair|shirt|collar/.test(m.name))m.setEnabled(false);if(m.name==='minh-v2-pants'&&m.material instanceof StandardMaterial)m.material.diffuseColor=Color3.FromHexString('#59402d');}
 const make=(name:string,color:string)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor.set(.075,.055,.025);m.specularPower=24;m.backFaceCulling=false;m.twoSidedLighting=true;return m;};
 const saffron=make('woven saffron ochre','#b56f28'),dark=make('shadowed inner ochre','#956026'),cream=make('ivory inner collar','#d8bd86'),wood=make('dark polished sandalwood','#322216');wood.specularColor.set(.28,.18,.09);wood.specularPower=80;
 const weave=new DynamicTexture('saffron warp and weft',{width:512,height:512},scene,true),c=weave.getContext() as CanvasRenderingContext2D;c.fillStyle='#ddd1b4';c.fillRect(0,0,512,512);for(let i=0;i<512;i+=2){c.fillStyle=i%4?'#c7b99c':'#e6dcc5';c.fillRect(i,0,1,512);c.fillStyle='rgba(70,48,20,.06)';c.fillRect(0,i,512,1);}weave.update();saffron.diffuseTexture=weave;dark.diffuseTexture=weave;
 const bones=skin.skeleton!.bones.map(b=>b.name.split(':').pop()!),remap=asset.boneNames.map(n=>bones.indexOf(n)),bone=(n:string)=>bones.indexOf(n);
 function attach(name:string,d:AvatarSurface,mat:StandardMaterial,mapped=false){const m=new Mesh(name,scene),v=new VertexData();v.positions=d.positions;v.uvs=d.uvs;v.indices=d.indices;v.matricesIndices=mapped?d.joints:d.joints.map(i=>remap[i]);v.matricesWeights=d.weights;const n:number[]=[];VertexData.ComputeNormals(d.positions,d.indices,n,{useRightHandedSystem:true});v.normals=n;v.applyToMesh(m);m.parent=skin.parent;m.position.copyFrom(skin.position);m.scaling.copyFrom(skin.scaling);m.rotationQuaternion=skin.rotationQuaternion?.clone()??null;m.skeleton=skin.skeleton;m.material=mat;m.isPickable=false;m.useVertexColors=false;m.overrideMaterialSideOrientation=skin.overrideMaterialSideOrientation;rig.meshes.push(m);return m;}
 const weight=(x:number,y:number)=>{const upper=Math.max(0,Math.min(1,(y-1.02)/.4)),leg=Math.min(.20,Math.max(0,(.95-y)*.65));return{j:[bone('spine_02'),bone('pelvis'),bone(x>0?'thigh_l':'thigh_r'),0],w:[upper,(1-upper)*(1-leg),(1-upper)*leg,0]};};
 function surface(name:string,nu:number,nv:number,fn:(u:number,t:number)=>number[],mat:StandardMaterial){const d:AvatarSurface={positions:[],uvs:[],indices:[],joints:[],weights:[]};for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,t=j/nv,p=fn(u,t);d.positions.push(...p);d.uvs.push(u*4,t*4);const w=weight(p[0],p[1]);d.joints.push(...w.j);d.weights.push(...w.w);if(i<nu&&j<nv){const k=j*(nu+1)+i;d.indices.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);}}return attach(name,d,mat,true);}
 // Wide hanging sleeves retain the original anatomical bind weights, with sculpted radial folds.
 const shirt=structuredClone(asset.shirtLong);for(let i=0;i<shirt.positions.length;i+=3){const x=shirt.positions[i],y=shirt.positions[i+1],z=shirt.positions[i+2],f=Math.min(1,Math.max(0,(Math.abs(x)-.22)/.35));shirt.positions[i+1]-=Math.max(0,1.49-y)*f*.18;shirt.positions[i+2]*=1+.08*f;shirt.positions[i+2]+=.0015*Math.sin(x*68+y*31)*f;shirt.positions[i+1]+=.0015*Math.sin(x*54+z*28)*f;}attach('saffron wide folded sleeves',shirt,saffron);
 const n=low?96:160,rows=low?56:88;
 surface('inner pleated ankle length robe',n,rows,(u,t)=>{const a=u*Math.PI*2,fold=(.004*Math.sin(a*22+t*2)+.002*Math.sin(a*37-t*3))*Math.pow(t,.4),r=.210+t*.008+fold;return[Math.sin(a)*r,1.035-t*.88+.004*Math.sin(a*22),Math.cos(a)*(r*.8)-.014];},dark);
 surface('asymmetric draped saffron kashaya',n,rows,(u,t)=>{const a=u*Math.PI*2,top=1.27+.20*Math.sin(a),hem=.17+.025*(.5+.5*Math.sin(a+.8)),y=top*(1-t)+hem*t;const folds=(.006*Math.sin(a*9-t*4+Math.sin(a)*2)+.003*Math.sin(a*23+t*3))*Math.sin(Math.PI*t*.94),r=.235+t*.008+folds;const sag=.004*Math.sin(a*3-t*9)*Math.sin(Math.PI*t);return[Math.sin(a)*r,y+sag,Math.cos(a)*(.19+t*.008+folds)-.012];},saffron);
 // Soft overlapping V collar, instead of a rigid ring at the neck.
 for(const side of [-1,1])for(const [mat,w,dy] of [[cream,.035,.003],[saffron,.023,.008]] as const)surface('folded V lapel',32,4,(u,t)=>{const x=side*(.093*(1-u)+.015*u)+(t-.5)*w+(mat===saffron?side*.018:0),y=1.49-u*.27+dy,z=.10+u*.115+.004*Math.sin(u*10);return[x,y,z];},mat);
 // A full necklace of individually rounded beads, weighted to the upper torso.
 const sphere=MeshBuilder.CreateSphere('bead source',{diameter:1,segments:low?10:16},scene),sp=Array.from(sphere.getVerticesData(VertexBuffer.PositionKind)!),si=Array.from(sphere.getIndices()!),su=Array.from(sphere.getVerticesData(VertexBuffer.UVKind)!);sphere.dispose();const beads:AvatarSurface={positions:[],uvs:[],indices:[],joints:[],weights:[]};
 for(let k=0;k<48;k++){const a=k/48*Math.PI*2,x=Math.sin(a)*.155,y=1.31+.20*Math.cos(a),z=.08+.16*Math.sin(a/2)**2,r=.0115+(k%5)*.00035,offset=beads.positions.length/3;for(let v=0;v<sp.length;v+=3){beads.positions.push(x+sp[v]*r*2,y+sp[v+1]*r*2,z+sp[v+2]*r*2);beads.joints.push(bone('spine_02'),0,0,0);beads.weights.push(1,0,0,0);}beads.uvs.push(...su);beads.indices.push(...si.map(i=>i+offset));}attach('48 polished wooden prayer beads',beads,wood,true);

 const brow=make('natural dark eyebrows','#30251e');
 for(const side of [-1,1]){
  const d:AvatarSurface={positions:[],uvs:[],indices:[],joints:[],weights:[]};
  for(let i=0;i<=40;i++)for(let edge=0;edge<2;edge++){const t=i/40,x=side*(.013+t*.052),y=1.723+.007*Math.sin(t*Math.PI)-.005*t+(edge-.5)*.006*Math.sin(Math.PI*(.08+.84*t)),z=.098-.022*(x/.07)**2;d.positions.push(x,y,z);d.uvs.push(t,edge);d.joints.push(bone('Head'),0,0,0);d.weights.push(1,0,0,0);if(i<40&&edge===0){const k=i*2;d.indices.push(k,k+1,k+2,k+1,k+3,k+2);}}
  attach('sculpted fitted eyebrow',d,brow,true);
 }
 if(skin.material instanceof StandardMaterial){skin.material.diffuseColor.set(.92,.85,.78);skin.material.emissiveColor.set(.012,.008,.006);}
 const openFingers=[...rig.nodes].filter(([name])=>/^(index|middle|ring|pinky|thumb)_0[123]_[lr]$/.test(name)).map(([,n])=>({node:n,q:n.rotationQuaternion?.clone()}));

 function alignPalms(){
  rig.root.computeWorldMatrix(true);for(const n of rig.root.getDescendants(false))n.computeWorldMatrix(true);
  const W=rig.root.getWorldMatrix(),up=Vector3.TransformNormal(Vector3.Up(),W).normalize(),back=Vector3.TransformNormal(new Vector3(0,0,-1),W).normalize();
  for(const side of ['l','r']){const hand=rig.nodes.get('hand_'+side),middle=rig.nodes.get('middle_01_'+side),index=rig.nodes.get('index_01_'+side),pinky=rig.nodes.get('pinky_01_'+side);if(!hand||!middle||!index||!pinky||!hand.parent)continue;
   const inv=hand.parent.getWorldMatrix().clone().invert(),frame=prayerFrames.get(side)!;const sign=Math.sign(Vector3.TransformCoordinates(hand.getAbsolutePosition(),W.clone().invert()).x)||1,joinedUp=Vector3.TransformNormal(new Vector3(-sign*.075,1,0).normalize(),W).normalize();hand.rotationQuaternion=palmQuaternion(frame.finger,frame.across,Vector3.TransformNormal(joinedUp,inv),Vector3.TransformNormal(back,inv));
   hand.computeWorldMatrix(true);for(const n of hand.getDescendants(false))n.computeWorldMatrix(true);

  }
 }

 // Preserve the anatomical hand surface for the static devotional pose. Retargeted
 // finger chains differ in length from this body; repeatedly aiming them stretched the skin.
 rig.root.computeWorldMatrix(true);for(const child of rig.root.getDescendants(false))child.computeWorldMatrix(true);
 const originalSkinIndices=Array.from(skin.getIndices()!),handWeight=(vertex:number,side:string)=>{let value=0;for(let k=0;k<4;k++){const name=asset.boneNames[asset.skin.joints[vertex*4+k]];if(name&&name.endsWith('_'+side)&&/^(hand|index|middle|ring|pinky|thumb)_/.test(name))value+=asset.skin.weights[vertex*4+k];}return value;};
 const handIndices={l:[] as number[],r:[] as number[]},bodyIndices:number[]=[];
 for(let i=0;i<originalSkinIndices.length;i+=3){const tri=originalSkinIndices.slice(i,i+3);const side=['l','r'].find(side=>tri.reduce((v,index)=>v+handWeight(index,side),0)/3>.5);(side?handIndices[side as 'l'|'r']:bodyIndices).push(...tri);}
 const prayerHands:Mesh[]=[],prayerFrames=new Map<string,{finger:Vector3;across:Vector3}>();
 for(const side of ['l','r'] as const){
  const hand=rig.nodes.get('hand_'+side)!,handWorld=hand.getWorldMatrix().clone(),handInv=handWorld.clone().invert(),skinWorld=skin.getWorldMatrix().clone(),skinInv=skinWorld.clone().invert();
  prayerFrames.set(side,{finger:Vector3.TransformNormal(Vector3.TransformNormal(new Vector3(side==='l'?1:-1,0,0),skinWorld),handInv).normalize(),across:Vector3.TransformNormal(Vector3.TransformNormal(new Vector3(0,0,1),skinWorld),handInv).normalize()});
  const middle=Vector3.TransformCoordinates(rig.nodes.get('middle_01_'+side)!.getAbsolutePosition(),handInv),middleTip=Vector3.TransformCoordinates(rig.nodes.get('middle_04_leaf_'+side)!.getAbsolutePosition(),handInv),axis=middleTip.subtract(middle).normalize();
  const width=Vector3.TransformCoordinates(rig.nodes.get('index_01_'+side)!.getAbsolutePosition(),handInv).subtract(Vector3.TransformCoordinates(rig.nodes.get('pinky_01_'+side)!.getAbsolutePosition(),handInv)).normalize();
  const fingers=['index','middle','ring','pinky','thumb'].map(name=>{const root=Vector3.TransformCoordinates(rig.nodes.get(name+'_01_'+side)!.getAbsolutePosition(),handInv),tip=Vector3.TransformCoordinates(rig.nodes.get(name+'_04_leaf_'+side)!.getAbsolutePosition(),handInv);return{name,root,q:Quaternion.FromUnitVectorsToRef(tip.subtract(root).normalize(),axis,new Quaternion())};});
  const d:AvatarSurface={positions:[],uvs:[],indices:[],joints:[],weights:[]},mapping=new Map<number,number>();
  for(const vi of handIndices[side]){let index=mapping.get(vi);if(index===undefined){index=mapping.size;mapping.set(vi,index);let v=Vector3.FromArray(asset.skin.positions,vi*3);v=Vector3.TransformCoordinates(Vector3.TransformCoordinates(v,skinWorld),handInv);
    let best:typeof fingers[number]|undefined,bestWeight=0;for(const f of fingers){let w=0;for(let k=0;k<4;k++)if(asset.boneNames[asset.skin.joints[vi*4+k]].startsWith(f.name+'_'))w+=asset.skin.weights[vi*4+k];if(w>bestWeight){bestWeight=w;best=f;}}
    if(best&&bestWeight>.01){const q=Quaternion.Slerp(Quaternion.Identity(),best.q,Math.min(1,bestWeight));v=v.subtract(best.root).applyRotationQuaternion(q).add(best.root);const close=Vector3.Dot(best.root.subtract(middle),width)*.18*Math.min(1,bestWeight);v.subtractInPlace(width.scale(close));}
    v=Vector3.TransformCoordinates(Vector3.TransformCoordinates(v,handWorld),skinInv);d.positions.push(v.x,v.y,v.z);d.uvs.push(asset.skin.uvs[vi*2],asset.skin.uvs[vi*2+1]);d.joints.push(bone('hand_'+side),0,0,0);d.weights.push(1,0,0,0);
   }d.indices.push(index);}
  const prayerHand=attach('anatomical prayer hand '+side,d,skin.material as StandardMaterial,true);prayerHand.alwaysSelectAsActiveMesh=true;prayerHands.push(prayerHand);
  // Rounded cloth cuff covers the wrist blend boundary in the held prayer pose.
  const cuff:AvatarSurface={positions:[],uvs:[],indices:[],joints:[],weights:[]},sign=side==='l'?1:-1;
  for(let r=0;r<=8;r++)for(let c=0;c<=40;c++){const t=r/8,a=c/40*Math.PI*2,bulge=1+.04*Math.sin(t*Math.PI);cuff.positions.push(sign*(.678+t*.054),1.445+Math.cos(a)*.037*bulge,-.055+Math.sin(a)*.052*bulge);cuff.uvs.push(c/40,t);cuff.joints.push(bone('hand_'+side),0,0,0);cuff.weights.push(1,0,0,0);if(r<8&&c<40){const k=r*41+c;cuff.indices.push(k,k+1,k+41,k+1,k+42,k+41);}}
  const cm=attach('soft prayer cuff '+side,cuff,saffron,true);cm.alwaysSelectAsActiveMesh=true;prayerHands.push(cm);

 }
 function handMode(prayer:boolean){skin.setIndices(prayer?bodyIndices:originalSkinIndices);for(const hand of prayerHands)hand.setEnabled(prayer);}
 handMode(true);
 rig.anim.play('Idle_Loop');const pose=new DevotionPose(rig);let state:'idle'|'walk'|'prayer'='prayer',time=0;const originalDispose=rig.dispose.bind(rig);
 return{rig,setState(next:typeof state){pose.release();handMode(next==='prayer');state=next;time=0;if(next!=='prayer')rig.anim.play(next==='walk'?'Walk_Loop':'Idle_Loop',{fade:.25,speed:.75});},update(dt:number){time+=dt;if(state==='prayer'){pose.apply('prayer',time);for(const f of openFingers)if(f.q)f.node.rotationQuaternion=f.q.clone();alignPalms();}else rig.anim.update(dt);},dispose(){originalDispose();for(const m of [saffron,dark,cream,wood])m.dispose();weave.dispose();},triangles:rig.meshes.filter(m=>m.isEnabled()).reduce((s,m)=>s+(m as Mesh).getTotalIndices()/3,0)};
}
