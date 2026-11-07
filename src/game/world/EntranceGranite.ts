import {Color3,DynamicTexture,StandardMaterial,Texture,type Scene} from '@babylonjs/core';

/** Four 1.2 m slabs per repeat. Shared world UVs keep joints aligned at the bridge ends. */
export const ENTRANCE_GRANITE_REPEAT=4.8;
export function entranceGranite(scene:Scene){
 const material=new StandardMaterial('entrance-silver-granite-120cm',scene);
 const texture=new DynamicTexture('entrance-granite-slab-joints',1024,scene,true);
 const c=texture.getContext();let seed=6741;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 c.fillStyle='#626969';c.fillRect(0,0,1024,1024);
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const x=col*256,y=row*256,shade=170+Math.floor(random()*16);
  c.fillStyle=`rgb(${shade},${shade+5},${shade+6})`;c.fillRect(x+3,y+3,250,250);
  // A bevel catches daylight beside the recessed charcoal grout, rather than a flat white grid.
  c.strokeStyle='#d4d9d7';c.lineWidth=2;c.strokeRect(x+5,y+5,246,246);
  for(let k=0;k<3200;k++){
   const v=random(),tone=v<.18?70+Math.floor(random()*40):v>.82?210+Math.floor(random()*28):135+Math.floor(random()*60);
   c.fillStyle=`rgba(${tone},${tone+3},${tone+3},${.25+random()*.4})`;
   c.fillRect(x+7+random()*242,y+7+random()*242,.7+random()*2.4,.7+random()*2);
  }
 }
 texture.update();texture.wrapU=texture.wrapV=Texture.WRAP_ADDRESSMODE;texture.anisotropicFilteringLevel=16;
 material.diffuseTexture=texture;material.diffuseColor=Color3.White();material.specularColor.setAll(.18);material.specularPower=70;
 material.backFaceCulling=false;
 return {material,dispose(){material.dispose();texture.dispose();}};
}

