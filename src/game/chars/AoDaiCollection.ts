import {AssetContainer,LoadAssetContainerAsync,TransformNode,Texture,Color3,PBRMaterial,type Scene}from '@babylonjs/core';
import '@babylonjs/loaders/glTF/index.js';
import {RocketboxDevotion}from './RocketboxDevotion';
import {AoDaiCloth}from './AoDaiCloth';
import {AnimController}from './AnimController';

import type{AoDaiLook}from './AoDaiCollectionPlan';
const base=(import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/ao-dai-collection/';
export class AoDaiCollection{
 private template!:AssetContainer;
 constructor(private scene:Scene){}
 async load(){this.template=await LoadAssetContainerAsync(base+'Female_AoDai_Collection.glb',this.scene);this.template.addAllToScene();for(const g of this.template.animationGroups)g.stop();for(const r of this.template.rootNodes)r.setEnabled(false);}
 create(look:AoDaiLook){
  const scene=this.scene,entries=this.template.instantiateModelsToScene(undefined,false,{doNotInstantiate:true});
  for(let i=0;i<entries.animationGroups.length;i++){entries.animationGroups[i].name=this.template.animationGroups[i].name;entries.animationGroups[i].stop();}
  const root=new TransformNode('look-'+look.id,scene),visual=new TransformNode('look-body-'+look.id,scene);visual.parent=root;for(const r of entries.rootNodes){r.parent=visual;r.setEnabled(true);}
  const bounds=visual.getHierarchyBoundingVectors(true),scale=1.8/(bounds.max.y-bounds.min.y);visual.scaling.setAll(scale);visual.position.set(-(bounds.max.x+bounds.min.x)*scale/2,-bounds.min.y*scale,-(bounds.max.z+bounds.min.z)*scale/2);
  const textures:Texture[]=[],materials:PBRMaterial[]=[];
  for(const mesh of visual.getChildMeshes()){
   mesh.isPickable=false;mesh.receiveShadows=true;
   if(!(mesh.material instanceof PBRMaterial))continue;const source=mesh.material,mat=source.clone('look-'+look.id+'-'+source.name)!;mesh.material=mat;materials.push(mat);
   if(source.name.includes('collection_coat')){
    const texture=new Texture(base+'pattern-'+look.id+'.svg',scene,false,false);texture.coordinatesIndex=2;texture.anisotropicFilteringLevel=8;textures.push(texture);mat.albedoTexture=texture;mat.albedoColor=Color3.White();mat.metallicTexture=null;mat.metallic=0;mat.roughness=.78;
    if(mesh.skeleton)new AoDaiCloth(mat,visual,mesh.skeleton);
   }else if(source.name.includes('collection_trousers')){mat.albedoTexture=null;mat.albedoColor=Color3.FromHexString(look.pants);mat.metallicTexture=null;mat.metallic=0;mat.roughness=.8;}
  }
  const pose=new RocketboxDevotion(visual,entries);let active='Idle',time=0;const clips:Record<string,string>={Idle:'Idle',Walk:'PilgrimWalk',Run:'PilgrimRun',Push:'Push'};
  const anim=new AnimController(new Map(entries.animationGroups.map(g=>[g.name,g])));
  function setPose(name:string,freeze=false){pose.release();active=name;time=0;if(clips[name]){anim.play(clips[name],{loop:true,fade:.2});const g=entries.animationGroups.find(g=>g.name===clips[name]);if(freeze&&g){g.goToFrame(g.from);g.pause();}else if(g?.isStarted){g.restart();}}else{anim.stop();for(const g of entries.animationGroups)g.stop();}}
  setPose('Idle',true);
  return{root,visual,entries,look,setPose,tint(coat:Color3,pants:Color3){for(const m of materials){if(m.name.includes('collection_coat'))m.albedoColor=coat;if(m.name.includes('collection_trousers'))m.albedoColor=pants;}},update(dt:number){time+=dt;if(['prayer','sit','kneel','bow'].includes(active))pose.apply(active as 'prayer'|'sit'|'kneel'|'bow',time,dt);else anim.update(dt);},joint(name:string){const node=entries.skeletons[0]?.bones.find(b=>b.name===name)?.getTransformNode();node?.computeWorldMatrix(true);return node?.getAbsolutePosition();},dispose(){anim.stop();for(const mat of materials)mat.dispose();for(const texture of textures)texture.dispose();entries.dispose();root.dispose();}};
 }
 dispose(){this.template?.dispose();}
}
