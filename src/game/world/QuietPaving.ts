import type {StandardMaterial}from '@babylonjs/core';
import type {SanctuaryBatch}from './SanctuaryGeometry';
/** A circular footprint with a continuous square grid; never stretch a texture around radial wedges. */
export function pavedDisc(b:SanctuaryBatch,mat:StandardMaterial,x:number,z:number,r:number){
 for(let i=0;i<96;i++){
  const a=i/96*Math.PI*2,c=(i+1)/96*Math.PI*2,p=[x,.07,z],q=[x+Math.cos(a)*r,.07,z+Math.sin(a)*r],t=[x+Math.cos(c)*r,.07,z+Math.sin(c)*r];
  b.quad(mat,p,q,t,t);const uv=b.acc(mat).UVs,values=[p,q,t,t].flatMap(v=>[v[0]/2.4,v[2]/2.4]);
  for(let k=0;k<8;k++)uv[uv.length-8+k]=values[k];
 }
}
