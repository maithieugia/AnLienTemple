import {Color3,RawTexture,Texture,PBRMaterial,type Scene,type StandardMaterial}from '@babylonjs/core';
const cache=new WeakMap<Scene,{color:RawTexture;normal:RawTexture}>();
/** One large convex/concave pair, with shallow overlap. No fine speckles or shiny baked glints. */
export function largeRoofTiles(material:StandardMaterial|PBRMaterial,scene:Scene){
 let t=cache.get(scene);if(!t){const size=256,c=new Uint8Array(size*size*4),n=new Uint8Array(c.length);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,a=x/size*Math.PI*2,shade=.94+.055*Math.cos(a)-(y<3?.045:0);
   c[i]=211*shade;c[i+1]=120*shade;c[i+2]=49*shade;c[i+3]=255;
   const dx=.24*Math.sin(a),dy=y<5?.045:0,len=Math.hypot(dx,dy,1);n[i]=(dx/len*.5+.5)*255;n[i+1]=(dy/len*.5+.5)*255;n[i+2]=(1/len*.5+.5)*255;n[i+3]=255;
  }
  const color=RawTexture.CreateRGBATexture(c,size,size,scene,true,false,Texture.TRILINEAR_SAMPLINGMODE),normal=RawTexture.CreateRGBATexture(n,size,size,scene,true,false,Texture.TRILINEAR_SAMPLINGMODE);
  for(const tx of [color,normal]){tx.wrapU=tx.wrapV=Texture.WRAP_ADDRESSMODE;tx.anisotropicFilteringLevel=8;}normal.gammaSpace=false;normal.level=.3;
  t={color,normal};cache.set(scene,t);scene.onDisposeObservable.addOnce(()=>{color.dispose();normal.dispose();cache.delete(scene);});
 }
 material.metadata={...material.metadata,largeRoofTiles:true};material.bumpTexture=t.normal;if(material instanceof PBRMaterial){material.albedoTexture=t.color;material.albedoColor=Color3.White();material.metallic=0;material.roughness=.85;}else{material.diffuseTexture=t.color;material.diffuseColor=Color3.White();material.specularColor.setAll(.07);material.specularPower=28;}
}
