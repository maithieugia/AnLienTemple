/** Vertex clustering for distant crowd geometry only; the close ritual actors retain their full mesh. */
export function clusterMesh(p:ArrayLike<number>,indices:ArrayLike<number>,uv:ArrayLike<number>,cell:number,uvBuckets=8){
 const map=new Map<string,number>(),groups:{x:number;y:number;z:number;u:number;v:number;n:number}[]=[],remap:number[]=[];
 for(let i=0;i<p.length/3;i++){const key=[Math.round(p[i*3]/cell),Math.round(p[i*3+1]/cell),Math.round(p[i*3+2]/cell),Math.floor((uv[i*2]??0)*uvBuckets),Math.floor((uv[i*2+1]??0)*uvBuckets)].join(',');let k=map.get(key);if(k===undefined){k=groups.length;map.set(key,k);groups.push({x:0,y:0,z:0,u:0,v:0,n:0});}const g=groups[k];g.x+=p[i*3];g.y+=p[i*3+1];g.z+=p[i*3+2];g.u+=uv[i*2]??0;g.v+=uv[i*2+1]??0;g.n++;remap.push(k);}
 const positions=groups.flatMap(g=>[g.x/g.n,g.y/g.n,g.z/g.n]),uvs=groups.flatMap(g=>[g.u/g.n,g.v/g.n]),out:number[]=[],seen=new Set<string>();for(let i=0;i<indices.length;i+=3){const a=remap[indices[i]],b=remap[indices[i+1]],c=remap[indices[i+2]];if(a===b||b===c||a===c)continue;const key=[a,b,c].sort((a,b)=>a-b).join(',');if(seen.has(key))continue;seen.add(key);out.push(a,b,c);}return{positions,uvs,indices:out};
}
