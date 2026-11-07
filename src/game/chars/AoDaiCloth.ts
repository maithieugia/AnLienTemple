import {MaterialPluginBase,Vector3,type Material,type UniformBuffer,type TransformNode,type Skeleton}from '@babylonjs/core';
/** Preview-only garment clearance after skinning. This is not a full cloth simulation. */
export class AoDaiCloth extends MaterialPluginBase{
 constructor(material:Material,private root:TransformNode,private skeleton:Skeleton){super(material,'AoDaiLegClearance',210,{AODAI_CLOTH:false});this._enable(true);}
 override getClassName(){return 'AoDaiCloth';}
 override prepareDefines(d:Record<string,unknown>){d.AODAI_CLOTH=true;d.UV2=true;}
 override getAttributes(attributes:string[]){if(!attributes.includes('uv2'))attributes.push('uv2');}
 override getUniforms(){const names=['clothForward',...['L','R'].flatMap(s=>[0,1,2,3].map(i=>'cloth'+s+i))];return{ubo:names.map(name=>({name,size:4,type:'vec4'})),vertex:names.map(n=>'uniform vec4 '+n+';').join('\n')};}
 override bindForSubMesh(ubo:UniformBuffer){
  const world=this.root.computeWorldMatrix(true),forward=Vector3.TransformNormal(new Vector3(0,0,1),world).normalize(),size=Vector3.One();world.decompose(size);const scale=Math.abs(size.y);
  ubo.updateFloat4('clothForward',forward.x,forward.y,forward.z,scale);
  for(const side of ['L','R'])for(const [i,name]of ['Thigh','Calf','Foot','Toe0'].entries()){
   const n=this.skeleton.bones.find(b=>b.name==='Bip01 '+side+' '+name)?.getTransformNode();if(!n)continue;n.computeWorldMatrix(true);const p=n.getAbsolutePosition();ubo.updateFloat4('cloth'+side+i,p.x,p.y,p.z,0);
  }
 }
 override getCustomCode(type:string){if(type!=='vertex')return null;return{
 CUSTOM_VERTEX_DEFINITIONS:`
 vec3 aodaiOutside(vec3 p,vec3 a,vec3 b,float radius,vec3 outward){
 vec3 axis=b-a;float t=clamp(dot(p-a,axis)/max(.00001,dot(axis,axis)),0.,1.);vec3 delta=p-(a+axis*t);
 float depth=dot(delta,outward);float tangent2=max(0.,dot(delta,delta)-depth*depth);
 if(tangent2<radius*radius){float surface=sqrt(max(0.,radius*radius-tangent2));p+=outward*max(0.,surface+.009-depth);}
 return p;}
 `,
 CUSTOM_VERTEX_UPDATE_WORLDPOS:`
 #ifdef AODAI_CLOTH
 if(uv2.x>.5){
 vec3 outward=clothForward.xyz*(uv2.x<1.5?1.:-1.);float k=clothForward.w;
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothL0.xyz,clothL1.xyz,.128*k,outward);
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothR0.xyz,clothR1.xyz,.128*k,outward);
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothL1.xyz,clothL2.xyz,.105*k,outward);
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothR1.xyz,clothR2.xyz,.105*k,outward);
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothL2.xyz,clothL3.xyz,.095*k,outward);
 worldPos.xyz=aodaiOutside(worldPos.xyz,clothR2.xyz,clothR3.xyz,.095*k,outward);
 worldPos.y=max(worldPos.y,.012);
 }
 #endif
 `};}
}
