import {MaterialPluginBase,PBRMaterial} from '@babylonjs/core';

/** Original gold seam pattern over the licensed garment's existing UVs and normals. */
export class RedGoldKasaya extends MaterialPluginBase {
  constructor(material:PBRMaterial){super(material,'AnLienRedGoldKasaya',200,{ANLIEN_RED_GOLD:true},true,true);}
  getCustomCode(shaderType:string){
    if(shaderType!=='fragment')return null;
    return {CUSTOM_FRAGMENT_UPDATE_ALBEDO:`
      #if defined(ALBEDO) && defined(ANLIEN_RED_GOLD)
      vec2 kasayaUV=vAlbedoUV*vec2(7.0,9.0);
      vec2 kasayaCell=fract(kasayaUV);
      vec2 kasayaEdge=min(kasayaCell,1.0-kasayaCell);
      vec2 kasayaAA=max(fwidth(kasayaUV),vec2(0.001));
      float kasayaGold=1.0-min(smoothstep(0.012-kasayaAA.x,0.012+kasayaAA.x,kasayaEdge.x),smoothstep(0.012-kasayaAA.y,0.012+kasayaAA.y,kasayaEdge.y));
      float kasayaFabric=clamp(dot(surfaceAlbedo,vec3(0.2126,0.7152,0.0722))*3.0,0.45,1.2);
      surfaceAlbedo=mix(vec3(0.38,0.013,0.021)*kasayaFabric,vec3(0.78,0.46,0.075)*(0.8+kasayaFabric*0.2),kasayaGold);
      #endif
    `};
  }
}

export function applyRedGoldKasaya(materials:readonly unknown[]){
  const robe=materials.find(m=>m instanceof PBRMaterial&&m.name==='gasa') as PBRMaterial|undefined;
  if(!robe)throw new Error('Không tìm thấy vật liệu áo ngoài gasa của mẫu Monk');
  new RedGoldKasaya(robe);
  const inner=materials.find(m=>m instanceof PBRMaterial&&m.name==='upper') as PBRMaterial|undefined;
  if(!inner)throw new Error('Không tìm thấy vật liệu áo trong upper của mẫu Monk');
  new YellowInnerRobe(inner);
  return robe;
}

/** Recolor only the inner garment, retaining its original fabric shading and normal map. */
class YellowInnerRobe extends MaterialPluginBase {
  constructor(material:PBRMaterial){super(material,'AnLienYellowInnerRobe',200,{ANLIEN_YELLOW_INNER:true},true,true);}
  getCustomCode(shaderType:string){
    if(shaderType!=='fragment')return null;
    return {CUSTOM_FRAGMENT_UPDATE_ALBEDO:`
      #ifdef ANLIEN_YELLOW_INNER
      float innerFabric=clamp(dot(surfaceAlbedo,vec3(0.2126,0.7152,0.0722))*2.2,0.48,1.15);
      surfaceAlbedo=vec3(0.78,0.38,0.025)*innerFabric;
      #endif
    `};
  }
}

