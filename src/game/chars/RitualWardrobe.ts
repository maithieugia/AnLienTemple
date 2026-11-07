import type {AvatarAsset,AvatarSurface} from './AvatarV2';

export function shirtCollar(asset:AvatarAsset,ritual=false):AvatarSurface{
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],joints:number[]=[],weights:number[]=[];
 for(let r=0;r<2;r++)for(let c=0;c<=64;c++){
  const a=c/64*Math.PI*2;positions.push(Math.sin(a)*(.099-r*.006),1.493+r*(ritual?.045:.018),Math.cos(a)*(.091-r*.006)-.01);uvs.push(c/64,r);
  joints.push(asset.boneNames.indexOf('neck_01'),0,0,0);weights.push(1,0,0,0);
  if(r===0&&c<64)indices.push(c,c+1,c+65,c+1,c+66,c+65);
 }
 return {positions,uvs,indices,joints,weights};
}

/** Fictional Nam Bộ ritual costume. All pieces use the same bind space as Minh,
 * so sleeves follow the arms and split skirts follow the legs, not the world. */
export function ritualWardrobe(asset:AvatarAsset):Record<string,AvatarSurface>{
 const bone=(name:string)=>asset.boneNames.indexOf(name);
 const make=(positions:number[],uvs:number[],indices:number[],joints:number[],weights:number[]):AvatarSurface=>({positions,uvs,indices,joints,weights});
 const shirt=structuredClone(asset.shirtLong);delete shirt.normals;
 for(let i=0;i<shirt.positions.length;i+=3){
  const x=shirt.positions[i],y=shirt.positions[i+1];
  if(Math.abs(x)>.28){const f=Math.min(1,(Math.abs(x)-.28)/.36);shirt.positions[i+1]-=Math.max(0,1.455-y)*f*1.1+.012*f;}
  shirt.uvs[i/3*2]=.5+x*.62;shirt.uvs[i/3*2+1]=(y-1.02)*1.82;
 }
 const result:Record<string,AvatarSurface>={'ritual-brocade-jacket':shirt};
 // Two open-sided, pleated panels: clearance at the thighs instead of a solid cone.
 for(const front of [true,false]){
  const p:number[]=[],uv:number[]=[],idx:number[]=[],j:number[]=[],w:number[]=[];
  const rows=22,cols=32;
  for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
   const t=r/rows,u=c/cols,a=(u-.5)*Math.PI*.94,x=Math.sin(a)*(.245+t*.065);
   const z=(front?1:-1)*Math.cos(a)*(.19+t*.055)+.006*Math.sin(u*Math.PI*16)*t;
   p.push(x,1.045-t*.84,z-.014);uv.push(u,1-t);
   const left=x>=0,leg=bone(left?'thigh_l':'thigh_r'),pelvis=bone('pelvis'),blend=Math.min(.9,t*1.8)*Math.min(1,Math.abs(x)/.08);
   j.push(pelvis,leg,0,0);w.push(1-blend,blend,0,0);
   if(r<rows&&c<cols){const k=r*(cols+1)+c;idx.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
  result[front?'ritual-front-panel':'ritual-back-panel']=make(p,uv,idx,j,w);
 }
 // Closed cloth headband/crown, rounded at the top; no pointed fantasy hat.
 const p:number[]=[],uv:number[]=[],idx:number[]=[],j:number[]=[],w:number[]=[];
 const rings=10,segments=48;
 for(let r=0;r<=rings;r++)for(let c=0;c<=segments;c++){
  const t=r/rings,a=c/segments*Math.PI*2,radius=t>.78?Math.max(.001,Math.cos((t-.78)/.22*Math.PI/2)):1;
  p.push(Math.sin(a)*.104*radius,1.772+t*.118,Math.cos(a)*.106*radius-.013);uv.push(c/segments,t);
  j.push(bone('Head'),0,0,0);w.push(1,0,0,0);
  if(r<rings&&c<segments){const k=r*(segments+1)+c;idx.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}
 }
 result['ritual-cloth-crown']=make(p,uv,idx,j,w);
 return result;
}
