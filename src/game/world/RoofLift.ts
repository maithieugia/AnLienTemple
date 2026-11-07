import {largeRoofTiles}from './LargeRoofTiles';
import {Mesh,VertexBuffer,VertexData,PBRMaterial,type AssetContainer}from '@babylonjs/core';
import {roofLiftY,CLERESTORY_FLOOR as F}from './SanctuaryPlan';
function fitNormals(m:Mesh,source:ArrayLike<number>,out:Float32Array,slope:(y:number)=>number){const old=m.getVerticesData(VertexBuffer.NormalKind),n:number[]=[];if(!old){VertexData.ComputeNormals(out,m.getIndices()!,n);return n;}for(let i=0;i<old.length;i+=3){const x=old[i],y=old[i+1]/slope(source[i+1]),z=old[i+2],len=Math.hypot(x,y,z)||1;n.push(x/len,y/len,z/len);}return n;}
/** Fit the source roof to 100m and keep the clerestory slab open; recompute lighting normals. */
export function liftGrandRoof(c:AssetContainer){
 for(const mat of c.materials)if(mat instanceof PBRMaterial&&/Glazed roof tile|Round cover tile|Ridge tile/.test(mat.name)){largeRoofTiles(mat,mat.getScene());mat.bumpTexture=null;mat.roughness=.92;mat.backFaceCulling=false;mat.twoSidedLighting=true;}
 for(const m of c.meshes){if(!(m instanceof Mesh)||!m.getTotalVertices())continue;const pos=m.getVerticesData(VertexBuffer.PositionKind);if(!pos)continue;
  const idx=m.getIndices(),inSlab=(v:number)=>{const y=pos[v*3+1];return y>F.y0&&y<F.y1&&Math.abs(pos[v*3])<=F.x&&Math.abs(pos[v*3+2])<=F.z;};
  // anh Thanh 2026-11-04 "còn mấy thanh sắt của la phong cũ": old roof timbers that hang inside the hall below the eaves are dropped too
  // (with the false ceiling gone, the roof-tier beams, ridge ends and gilt trims show inside as thin black bars); tiles and the underside stay
  const trim=/Lacquer|Lim wood|Ridge tile|Gold leaf|gilded bronze/.test(m.material?.name??''),inHall=(v:number)=>trim&&Math.abs(pos[v*3])<296&&Math.abs(pos[v*3+2])<196;
  if(idx){const keep:number[]=[];for(let i=0;i<idx.length;i+=3)if(!(inSlab(idx[i])&&inSlab(idx[i+1])&&inSlab(idx[i+2]))&&!(inHall(idx[i])&&inHall(idx[i+1])&&inHall(idx[i+2])))keep.push(idx[i],idx[i+1],idx[i+2]);if(keep.length!==idx.length)m.setIndices(keep);}
  const out=Float32Array.from(pos);for(let i=1;i<out.length;i+=3)out[i]=roofLiftY(out[i])-(m.material?.name.includes("Roof underside")?.65:0);m.setVerticesData(VertexBuffer.PositionKind,out,false);const normals=fitNormals(m,pos,out,y=>y<=101.3?61.3/101.3:y<=154.6?32.7/53.3:6/(191.6999969482422-154.6));m.setVerticesData(VertexBuffer.NormalKind,normals,false);if(m.material?.metadata?.largeRoofTiles){const uv:number[]=[];for(let i=0;i<out.length;i+=3){const alongZ=Math.abs(normals[i])>Math.abs(normals[i+2]);uv.push(alongZ?out[i+2]/4.8:out[i]/4.8,alongZ?out[i]/3.6:out[i+2]/3.6);}m.setVerticesData(VertexBuffer.UVKind,uv,false);m.removeVerticesData(VertexBuffer.TangentKind);}m.refreshBoundingInfo();}
}

/** Column source uses the original 101.3m eave datum too. */
export function fitHallColumns(c:AssetContainer){for(const mat of c.materials){
 if(mat instanceof PBRMaterial&&mat.name==='Carved stone - pale'){
  mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.alpha=1;mat.transparencyMode=PBRMaterial.PBRMATERIAL_OPAQUE;mat.useAlphaFromAlbedoTexture=false;
 }
}for(const m of c.meshes){if(!(m instanceof Mesh)||!m.getTotalVertices())continue;const pos=m.getVerticesData(VertexBuffer.PositionKind);if(!pos)continue;const out=Float32Array.from(pos);for(let i=1;i<out.length;i+=3)out[i]*=61.3/101.3;m.setVerticesData(VertexBuffer.PositionKind,out,false);const n=fitNormals(m,pos,out,()=>61.3/101.3);m.setVerticesData(VertexBuffer.NormalKind,n,false);m.refreshBoundingInfo();}}
