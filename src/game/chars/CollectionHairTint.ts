import{MaterialPluginBase,type Material,type UniformBuffer,type Color3}from'@babylonjs/core';
/** Recolour hair fibres while leaving the skin pixels of the native scalp atlas intact. */
export class CollectionHairTint extends MaterialPluginBase{
 constructor(material:Material,private color:Color3,private scalp=false){super(material,'CollectionHairTint',205,{});this._enable(true);}
 override getClassName(){return'CollectionHairTint';}
 override getUniforms(){return{ubo:[{name:'collectionHairColor',size:4,type:'vec4'}],fragment:'uniform vec4 collectionHairColor;'};}
 override bindForSubMesh(ubo:UniformBuffer){ubo.updateFloat4('collectionHairColor',this.color.r,this.color.g,this.color.b,this.scalp?1:0);}
 override getCustomCode(type:string){if(type!=='fragment')return null;return{CUSTOM_FRAGMENT_UPDATE_ALBEDO:`
 float fibreLum=dot(surfaceAlbedo,vec3(.2126,.7152,.0722));
 float fibreMask=collectionHairColor.a>.5?1.-smoothstep(.30,.65,fibreLum):1.;
 vec3 fibreColor=collectionHairColor.rgb*(.55+.65*sqrt(clamp(fibreLum*4.,0.,1.)));
 surfaceAlbedo=mix(surfaceAlbedo,fibreColor,fibreMask);
 `};}
}
