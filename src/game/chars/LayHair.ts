import {Mesh,MeshBuilder,Vector3,VertexData,type Material,type Scene} from '@babylonjs/core';
export type ScalpSurface={triangles:number[][];center:[number,number,number]};
/** Reference vertices are in the original head bone's local coordinates, before posing. */
export function scalpSurface(positions:ArrayLike<number>,indices:ArrayLike<number>):ScalpSurface{
 const triangles:number[][]=[];for(let i=0;i<indices.length;i+=3){const p=[indices[i],indices[i+1],indices[i+2]].flatMap(n=>[positions[n*3],positions[n*3+1],positions[n*3+2]]);if([0,3,6].every(k=>p[k+1]>.015&&Math.abs(p[k])<.18))triangles.push(p);}return{triangles,center:[0,.17,-.035]};
}
export function scalpDistance(surface:ScalpSurface,direction:[number,number,number]){
 const n=Math.hypot(...direction),[dx,dy,dz]=direction.map(v=>v/n),[ox,oy,oz]=surface.center;let hit=Infinity;
 for(const p of surface.triangles){const ex=p[3]-p[0],ey=p[4]-p[1],ez=p[5]-p[2],fx=p[6]-p[0],fy=p[7]-p[1],fz=p[8]-p[2],px=dy*fz-dz*fy,py=dz*fx-dx*fz,pz=dx*fy-dy*fx,det=ex*px+ey*py+ez*pz;if(Math.abs(det)<1e-9)continue;const tx=ox-p[0],ty=oy-p[1],tz=oz-p[2],u=(tx*px+ty*py+tz*pz)/det;if(u<0||u>1)continue;const qx=ty*ez-tz*ey,qy=tz*ex-tx*ez,qz=tx*ey-ty*ex,v=(dx*qx+dy*qy+dz*qz)/det;if(v<0||u+v>1)continue;const t=(fx*qx+fy*qy+fz*qz)/det;if(t>.005&&t<hit)hit=t;}
 return hit;
}
/** Scalp ray fitting removes the old oversized cap; the rear hairline reaches the nape. */
export function makeLayHair(scene:Scene,female:boolean,low:boolean,material:Material,surface?:ScalpSurface){
 const rows=low?7:16,cols=low?16:36,p:number[]=[],uv:number[]=[],idx:number[]=[];
 for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const a=c/cols*Math.PI*2,back=(1-Math.cos(a))*.5,theta=r/rows*(1.30+back*1.40),direction:[number,number,number]=[Math.sin(a)*.098*Math.sin(theta),.113*Math.cos(theta),Math.cos(a)*.112*Math.sin(theta)],distance=surface?scalpDistance(surface,direction):Infinity,rad=Math.hypot(...direction),center=surface?.center??[0,.17,-.035],radius=(Number.isFinite(distance)?distance:rad)+(female?.0025:.0018);p.push(center[0]+direction[0]/rad*radius,center[1]+direction[1]/rad*radius,center[2]+direction[2]/rad*radius);uv.push(c/cols,r/rows);if(r<rows&&c<cols){const n=r*(cols+1)+c;idx.push(n,n+cols+1,n+1,n+1,n+cols+1,n+cols+2);}}
 const cap=new Mesh(`lay-${female?'bun':'short'}-hair-${low?'far':'near'}`,scene),vd=new VertexData();vd.positions=p;vd.uvs=uv;vd.indices=idx;const normals:number[]=[];VertexData.ComputeNormals(p,idx,normals);vd.normals=normals;vd.applyToMesh(cap);cap.material=material;cap.isPickable=false;
 if(!female)return cap;
 const bun=MeshBuilder.CreateSphere('lay-tied-bun',{diameter:.14,segments:low?8:16},scene);bun.position.set(0,.12,-.176);bun.scaling.set(1,.85,.92);bun.material=material;
 const tie=MeshBuilder.CreateTorus('lay-bun-tie',{diameter:.092,thickness:.010,tessellation:low?12:24},scene);tie.rotation.x=Math.PI/2;tie.position.set(0,.12,-.173);tie.material=material;const merged=Mesh.MergeMeshes([cap,bun,tie],true,true)!;merged.name=cap.name;merged.material=material;merged.isPickable=false;return merged;
}
