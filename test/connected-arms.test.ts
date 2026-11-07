import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {Bone,Matrix,NullEngine,Quaternion,Scene,Skeleton,StandardMaterial,Vector3,VertexBuffer} from '@babylonjs/core';
import {armChain,ConnectedArm,wristRings} from '../src/game/chars/ConnectedArms.ts';

const file=readFileSync(new URL('../public/assets/chars/ready-made/creator424-monk/model.glb',import.meta.url));
const length=file.readUInt32LE(12),gltf=JSON.parse(file.subarray(20,20+length).toString()),binary=20+length+8,primitive=gltf.meshes[5].primitives[0];
function read(i:number){const a=gltf.accessors[i],v=gltf.bufferViews[a.bufferView],components:{[key:string]:number}={SCALAR:1,VEC2:2,VEC3:3},count=components[a.type],size=a.componentType===5123?2:4,base=binary+(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??size*count,out:number[]=[];for(let n=0;n<a.count;n++)for(let c=0;c<count;c++){const p=base+n*stride+c*size;out.push(a.componentType===5126?file.readFloatLE(p):a.componentType===5123?file.readUInt16LE(p):file.readUInt32LE(p));}return out;}
const raw=read(primitive.attributes.POSITION),scale=1.8/(158.43426513671875+.09496629238128662),positions:number[]=[];
for(let i=0;i<raw.length;i+=3)positions.push(raw[i]*scale,(raw[i+2]+.09496629238128662)*scale,(-raw[i+1]-8.51725578)*scale);
const rings=wristRings(positions,read(primitive.indices),read(primitive.attributes.TEXCOORD_0));

test('Source model has two closed 20-vertex wrist openings, not guessed attachment points',()=>{
 assert.equal(rings.length,2);assert.deepEqual(rings.map(r=>r.side).sort(),[-1,1]);
 for(const r of rings){assert.equal(r.points.length,20);assert.ok(r.radius>.015&&r.radius<.035);assert.ok(Math.abs(r.center.x)>.57&&Math.abs(r.center.x)<.60);assert.ok(r.center.y>1.44&&r.center.y<1.47);}
});
test('Elbow and wrist preserve arm lengths even when gesture target is beyond reach',()=>{
 for(const side of [-1,1])for(let i=0;i<100;i++){const shoulder=new Vector3(side*.2,1.4,0),target=new Vector3(Math.sin(i)*.7,.4+Math.cos(i)*.9,Math.sin(i*.7)*.8),p=armChain(shoulder,target,new Vector3(side*.6,1,.2),.20,.21);assert.ok(Math.abs(Vector3.Distance(shoulder,p.elbow)-.20)<1e-7);assert.ok(Math.abs(Vector3.Distance(p.elbow,p.wrist)-.21)<1e-7);assert.ok(Vector3.Distance(shoulder,p.wrist)<.41);}
});
test('Actual swept surface stays attached to every source wrist vertex through bends and wrist rolls',()=>{
 const engine=new NullEngine(),scene=new Scene(engine),material=new StandardMaterial('test-skin',scene);
 try{for(const ring of rings){const arm=new ConnectedArm(scene,'connected',ring,material,material);
  for(let i=0;i<24;i++){const shoulder=new Vector3(ring.side*.2,.95,0),chain=armChain(shoulder,new Vector3(ring.side*.1,.55+Math.sin(i*.3)*.12,.25),new Vector3(ring.side*.55,.6,.1),.2,.21),matrix=Matrix.Compose(Vector3.One(),Quaternion.FromEulerAngles(i*.08,ring.side*.2,i*.1),chain.wrist);arm.update(shoulder,chain.elbow,chain.wrist,matrix);
   const p=arm.mesh.getVerticesData(VertexBuffer.PositionKind)!,n=ring.points.length,offset=p.length-n*3;
   for(let k=0;k<n;k++){const expected=Vector3.TransformCoordinates(ring.points[k].subtract(ring.center),matrix),actual=Vector3.FromArray(p,offset+k*3);assert.ok(Vector3.Distance(expected,actual)<1e-6);}
   for(const v of p)assert.ok(Number.isFinite(v));for(const v of arm.mesh.getVerticesData(VertexBuffer.NormalKind)!)assert.ok(Number.isFinite(v));
  }arm.dispose();}
 }finally{scene.dispose();engine.dispose();}
});
test('Distant GPU surface retains the same exact wrist seam when switching from close detail',()=>{
 const engine=new NullEngine(),scene=new Scene(engine),material=new StandardMaterial('skin',scene);
 try{for(const ring of rings){const shoulder=new Vector3(ring.side*.2,1.45,0),elbow=new Vector3(ring.side*.395,1.43,.035),skeleton=new Skeleton('arm','arm',scene);
  new Bone('upper',skeleton,null,Matrix.Translation(shoulder.x,shoulder.y,shoulder.z));new Bone('fore',skeleton,null,Matrix.Translation(elbow.x,elbow.y,elbow.z));const hand=new Bone('hand',skeleton,null,Matrix.Translation(ring.center.x,ring.center.y,ring.center.z));
  const arm=new ConnectedArm(scene,'gpu',ring,material,material);arm.bind(skeleton,[0,1,2],shoulder,elbow);assert.equal(arm.setNear(false),false);assert.equal(arm.mesh.skeleton,skeleton);
  const wrist=new Vector3(ring.side*.1,.6,.25),q=Quaternion.FromEulerAngles(.7,-.4,.9);hand.setPosition(wrist);hand.setRotationQuaternion(q);skeleton.prepare();const skin=Matrix.FromArray(skeleton.getTransformMatrices(arm.mesh),32),expectedMatrix=Matrix.Compose(Vector3.One(),q,wrist),p=arm.mesh.getVerticesData(VertexBuffer.PositionKind)!,n=ring.points.length,offset=p.length-n*3;
  for(let i=0;i<n;i++){const gpu=Vector3.TransformCoordinates(Vector3.FromArray(p,offset+i*3),skin),expected=Vector3.TransformCoordinates(ring.points[i].subtract(ring.center),expectedMatrix);assert.ok(Vector3.Distance(gpu,expected)<1e-6);}
  assert.equal(arm.setNear(true),true);assert.equal(arm.mesh.skeleton,null);arm.dispose();skeleton.dispose();}
 }finally{scene.dispose();engine.dispose();}
});
