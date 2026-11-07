import {Matrix,Mesh,Quaternion,Vector3,VertexBuffer,VertexData,type Material,type Scene,type Skeleton} from '@babylonjs/core';

export interface WristRing {side:number;center:Vector3;points:Vector3[];uvs:number[];normal:Vector3;radius:number}
/** Find real open wrist loops after welding UV duplicates. The new arm shares their exact seam. */
export function wristRings(positions:ArrayLike<number>,indices:ArrayLike<number>,uvs:ArrayLike<number>):WristRing[]{
 const ids:number[]=[],points:Vector3[]=[],original:number[]=[],weld=new Map<string,number>();
 for(let i=0;i<positions.length;i+=3){const p=new Vector3(positions[i],positions[i+1],positions[i+2]),key=[p.x,p.y,p.z].map(v=>Math.round(v*100000)).join(',');let id=weld.get(key);if(id===undefined){id=points.length;weld.set(key,id);points.push(p);original.push(i/3);}ids.push(id);}
 const edges=new Map<string,{a:number;b:number;n:number}>();
 for(let i=0;i<indices.length;i+=3){const tri=[ids[indices[i]],ids[indices[i+1]],ids[indices[i+2]]];for(let k=0;k<3;k++){const a=tri[k],b=tri[(k+1)%3],key=a<b?`${a},${b}`:`${b},${a}`,edge=edges.get(key);if(edge)edge.n++;else edges.set(key,{a,b,n:1});}}
 const adj=new Map<number,number[]>();for(const e of edges.values())if(e.n===1){for(const [a,b]of [[e.a,e.b],[e.b,e.a]])adj.set(a,[...(adj.get(a)??[]),b]);}
 const visited=new Set<number>(),result:WristRing[]=[];
 for(const first of adj.keys()){if(visited.has(first))continue;const component:number[]=[],stack=[first];while(stack.length){const n=stack.pop()!;if(visited.has(n))continue;visited.add(n);component.push(n);stack.push(...(adj.get(n)??[]).filter(i=>!visited.has(i)));}
  const center=component.reduce((s,i)=>s.add(points[i]),Vector3.Zero()).scale(1/component.length);
  if(Math.abs(center.x)<.45||center.y<1.25||center.y>1.6||component.length<8||component.some(i=>adj.get(i)?.length!==2))continue;
  const loop:number[]=[],seen=new Set<number>();let current=first,previous=-1;
  do{loop.push(current);seen.add(current);const next=adj.get(current)!.find(i=>i!==previous)!;previous=current;current=next;}while(current!==first&&!seen.has(current));
  if(loop.length!==component.length)throw new Error('Wrist loop is not closed');
  const ring=loop.map(i=>points[i]),normal=Vector3.Zero();for(let i=0;i<ring.length;i++)normal.addInPlace(Vector3.Cross(ring[i].subtract(center),ring[(i+1)%ring.length].subtract(center)));normal.normalize();const side=Math.sign(center.x);if(normal.x*side<0)normal.scaleInPlace(-1);
  result.push({side,center,points:ring,normal,uvs:loop.flatMap(i=>[uvs[original[i]*2],uvs[original[i]*2+1]]),radius:ring.reduce((s,p)=>s+Vector3.Distance(p,center),0)/ring.length});
 }
 if(result.length!==2)throw new Error(`Expected two anatomical wrist loops, found ${result.length}`);
 return result;
}

/** A target outside reach is clamped before solving BOTH elbow and wrist. */
export function armChain(shoulder:Vector3,target:Vector3,pole:Vector3,l1:number,l2:number){
 const axis=target.subtract(shoulder),d=Math.max(Math.abs(l1-l2)+.001,Math.min(axis.length(),l1+l2-.002));if(axis.lengthSquared()<1e-9)axis.set(0,-1,0);axis.normalize();
 const wrist=shoulder.add(axis.scale(d)),perp=pole.subtract(shoulder);perp.subtractInPlace(axis.scale(Vector3.Dot(perp,axis)));if(perp.lengthSquared()<1e-9)perp.copyFrom(Vector3.Cross(axis,Math.abs(axis.y)<.9?Vector3.Up():Vector3.Right()));perp.normalize();
 const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
 return{wrist,elbow:shoulder.add(axis.scale(along)).add(perp.scale(height))};
}

const RINGS=25;
/** A single continuous swept surface per arm, rounded at the elbow, exact source wrist boundary. */
export class ConnectedArm{
 readonly mesh:Mesh;readonly sleeve:Mesh;private ring:WristRing;private positions:Float32Array;private sleevePositions:Float32Array;private sleeveNormals:number[]=[];private lastPose:number[]=[];private offsets:Float32Array;private clothOffsets:Float32Array;private tangent=new Vector3();private align=new Quaternion();private rotation=new Quaternion();private rotationMatrix=Matrix.Identity();private gpuSkeleton?:Skeleton;private near=true;private restSurfaces:{mesh:Mesh;p:Float32Array;n:Float32Array}[]=[];private indices:number[]=[];private normals:number[]=[];
 constructor(scene:Scene,name:string,ring:WristRing,material:Material,cloth:Material){this.ring=ring;
  const n=ring.points.length;this.offsets=new Float32Array(n*3);this.clothOffsets=new Float32Array(n*3);for(let i=0;i<n;i++){const p=ring.points[i].subtract(ring.center),unit=p.normalizeToNew();p.toArray(this.offsets,i*3);unit.toArray(this.clothOffsets,i*3);}this.positions=new Float32Array(RINGS*n*3);this.sleevePositions=new Float32Array(RINGS*n*3);const uv:number[]=[],clothUV:number[]=[];
  for(let r=0;r<RINGS;r++)for(let i=0;i<n;i++){uv.push(ring.uvs[i*2],ring.uvs[i*2+1]);clothUV.push(i/n,r/(RINGS-1));if(r<RINGS-1){const a=r*n+i,b=r*n+(i+1)%n,c=a+n,d=b+n;this.indices.push(a,c,b,b,c,d);}}
  this.mesh=new Mesh(name,scene);const data=new VertexData();data.positions=this.positions;data.normals=new Float32Array(this.positions.length);data.uvs=uv;data.indices=this.indices;data.applyToMesh(this.mesh,true);this.mesh.material=material;this.mesh.isPickable=false;this.mesh.alwaysSelectAsActiveMesh=true;
  this.sleeve=new Mesh(name+'-continuous-inner-sleeve',scene);const sleeveData=new VertexData();sleeveData.positions=this.sleevePositions;sleeveData.normals=new Float32Array(this.sleevePositions.length);sleeveData.uvs=clothUV;sleeveData.indices=this.indices;sleeveData.applyToMesh(this.sleeve,true);this.sleeve.material=cloth;this.sleeve.isPickable=false;this.sleeve.alwaysSelectAsActiveMesh=true;
 }
 /** Keep the same connected surface on the GPU outside close inspection distance. */
 bind(skeleton:Skeleton,bones:[number,number,number],shoulder:Vector3,elbow:Vector3){
  this.update(shoulder,elbow,this.ring.center,Matrix.Translation(this.ring.center.x,this.ring.center.y,this.ring.center.z));this.gpuSkeleton=skeleton;
  for(const [mesh,cloth]of [[this.mesh,false],[this.sleeve,true]] as const){const ids:number[]=[],weights:number[]=[],n=this.ring.points.length;
   for(let r=0;r<RINGS;r++){const t=r/(RINGS-1)*(cloth?.92:1),f=Math.max(0,Math.min(1,(t-.28)/.44)),h=Math.max(0,Math.min(1,(t-.80)/.18)),fore=f*f*(3-2*f),hand=h*h*(3-2*h);for(let i=0;i<n;i++){ids.push(bones[0],bones[1],bones[2],0);weights.push((1-fore)*(1-hand),fore*(1-hand),hand,0);}}
   mesh.setVerticesData(VertexBuffer.MatricesIndicesKind,ids);mesh.setVerticesData(VertexBuffer.MatricesWeightsKind,weights);mesh.numBoneInfluencers=4;this.restSurfaces.push({mesh,p:Float32Array.from(mesh.getVerticesData(VertexBuffer.PositionKind)!),n:Float32Array.from(mesh.getVerticesData(VertexBuffer.NormalKind)!)});
  }
 }
 setNear(near:boolean){if(!this.gpuSkeleton)return true;if(this.near!==near){this.near=near;this.lastPose=[];for(const s of this.restSurfaces){s.mesh.skeleton=near?null:this.gpuSkeleton;if(!near){s.mesh.updateVerticesData(VertexBuffer.PositionKind,s.p,false,false);s.mesh.updateVerticesData(VertexBuffer.NormalKind,s.n,false,false);}}}return near;}
 update(shoulder:Vector3,elbow:Vector3,wrist:Vector3,handMatrix:Matrix){
  const pose=[shoulder.x,shoulder.y,shoulder.z,elbow.x,elbow.y,elbow.z,wrist.x,wrist.y,wrist.z,...handMatrix.m];if(this.lastPose.length&&pose.every((v,i)=>Math.abs(v-this.lastPose[i])<1e-9))return;this.lastPose=pose;
  const ring=this.ring,n=ring.points.length,handRotation=Quaternion.FromRotationMatrix(handMatrix.getRotationMatrix()),baseAxis=ring.normal,hm=handMatrix.m;
  for(const cloth of [false,true]){
   const output=cloth?this.sleevePositions:this.positions,offsets=cloth?this.clothOffsets:this.offsets;
   for(let r=0;r<RINGS;r++){
    const t=r/(RINGS-1)*(cloth?.92:1),u=1-t,u3=u*u*u,t3=t*t*t,middle=3*u*t;
    const cx=shoulder.x*u3+elbow.x*middle+wrist.x*t3,cy=shoulder.y*u3+elbow.y*middle+wrist.y*t3,cz=shoulder.z*u3+elbow.z*middle+wrist.z*t3;
    this.tangent.set((elbow.x-shoulder.x)*u*u+(wrist.x-elbow.x)*t*t,(elbow.y-shoulder.y)*u*u+(wrist.y-elbow.y)*t*t,(elbow.z-shoulder.z)*u*u+(wrist.z-elbow.z)*t*t).normalize();
    Quaternion.FromUnitVectorsToRef(baseAxis,this.tangent,this.align);const blend=Math.max(0,(t-.7)/.3);Quaternion.SlerpToRef(this.align,handRotation,blend*blend*(3-2*blend),this.rotation);this.rotation.toRotationMatrix(this.rotationMatrix);const m=this.rotationMatrix.m;
    const radius=cloth?.080+(.041-.080)*t:t<.5?.064+(.044-.064)*t*2:.044+(ring.radius-.044)*(t-.5)*2,factor=cloth?radius:radius/ring.radius;
    for(let i=0;i<n;i++){const j=i*3,k=(r*n+i)*3,x=offsets[j],y=offsets[j+1],z=offsets[j+2];
     if(!cloth&&r===RINGS-1){output[k]=x*hm[0]+y*hm[4]+z*hm[8]+hm[12];output[k+1]=x*hm[1]+y*hm[5]+z*hm[9]+hm[13];output[k+2]=x*hm[2]+y*hm[6]+z*hm[10]+hm[14];}
     else{output[k]=(x*m[0]+y*m[4]+z*m[8])*factor+cx;output[k+1]=(x*m[1]+y*m[5]+z*m[9])*factor+cy;output[k+2]=(x*m[2]+y*m[6]+z*m[10])*factor+cz;}
    }
   }
  }
  VertexData.ComputeNormals(this.sleevePositions,this.indices,this.sleeveNormals);this.sleeve.updateVerticesData(VertexBuffer.PositionKind,this.sleevePositions,false,false);this.sleeve.updateVerticesData(VertexBuffer.NormalKind,this.sleeveNormals,false,false);
  VertexData.ComputeNormals(this.positions,this.indices,this.normals);this.mesh.updateVerticesData(VertexBuffer.PositionKind,this.positions,false,false);this.mesh.updateVerticesData(VertexBuffer.NormalKind,this.normals,false,false);
 }
 dispose(){this.mesh.dispose();this.sleeve.dispose();}
}
