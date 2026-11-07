import {AssetContainer,LoadAssetContainerAsync,TransformNode,Texture,Color3,PBRMaterial,type Scene} from '@babylonjs/core';
import {AO_DAI_COLLECTION} from './AoDaiCollectionPlan.ts';
import type {AoDaiCloth as AoDaiClothType} from './AoDaiCloth.ts';
import '@babylonjs/loaders/glTF/index.js';
const FILES=['Male_Adult_08','Female_Adult_17'];
/** Shared native geometry/materials, one independent skeleton and animation set per online player. */
export class RocketboxPlayerLibrary{
 private templates:AssetContainer[]=[];private aoDai?:AssetContainer;private nam01?:AssetContainer;private Cloth?:typeof AoDaiClothType;
 private scene:Scene;
 constructor(scene:Scene,_low=false){this.scene=scene;}
 async load(reader?:(url:string)=>Promise<AssetContainer>){
  const read=reader??((url:string)=>LoadAssetContainerAsync(url,this.scene));
  this.templates=await Promise.all(FILES.map(async file=>{
   const c=await read((import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/rocketbox/'+file+'.glb');
   if(c.skeletons[0]?.bones.length!==80||!['PilgrimWalk','PilgrimRun','Push'].every(name=>c.animationGroups.some(a=>a.name===name)))throw Error('Nhân vật thiếu bộ xương/hoạt cảnh: '+file);
   c.addAllToScene();for(const g of c.animationGroups)g.stop();for(const n of c.rootNodes)n.setEnabled(false);return c;
  }));
  // the designed áo dài (same Rocketbox body, skeleton and clips as Female_Adult_17): worn by women by default
  try{const c=await read((import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/ao-dai-collection/Female_AoDai_Collection.glb');
   if(c.skeletons[0]?.bones.length===80&&['PilgrimWalk','PilgrimRun','Push','Idle'].every(name=>c.animationGroups.some(a=>a.name===name))){c.addAllToScene();for(const g of c.animationGroups)g.stop();for(const n of c.rootNodes)n.setEnabled(false);this.aoDai=c;this.Cloth=(await import('./AoDaiCloth.ts')).AoDaiCloth;}else c.dispose();
  }catch(e){console.warn('Áo dài chưa tải được, dùng thường phục',e);}
  // "Nam 01" (anh Thanh's male model in áo tràng lam, authoring/nam01/build_nam01.py): Rocketbox bone names, Idle/Walk/Run/Push
  try{const c=await read((import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/nam-01/model.glb');
   if(['Idle','Walk','Run','Push'].every(name=>c.animationGroups.some(a=>a.name===name))){c.addAllToScene();for(const g of c.animationGroups)g.stop();for(const n of c.rootNodes)n.setEnabled(false);this.nam01=c;}else c.dispose();
  }catch(e){console.warn('Nam 01 chưa tải được',e);}
 }
 create(female:boolean,id:number,outfit='thuong'){
  const look=female&&this.aoDai?AO_DAI_COLLECTION.find(l=>'aodai-'+l.id===outfit):undefined;
  const nam01=!female&&this.nam01; // men are always Nam 01 when he has loaded
  const template=look?this.aoDai!:nam01?this.nam01!:this.templates[female?1:0];if(!template)throw Error('Chưa tải nhân vật');
  const entries=template.instantiateModelsToScene(undefined,false,{doNotInstantiate:true});
  for(let i=0;i<entries.animationGroups.length;i++){entries.animationGroups[i].name=template.animationGroups[i].name;entries.animationGroups[i].stop();}
  const root=new TransformNode('online-player-'+id,this.scene),visual=new TransformNode('rocketbox-body-'+id,this.scene);visual.parent=root;
  for(const n of entries.rootNodes){n.parent=visual;n.setEnabled(true);}
  const bounds=visual.getHierarchyBoundingVectors(true),height=female?1.6:1.7,scale=height/(bounds.max.y-bounds.min.y);
  visual.scaling.setAll(scale);visual.position.set(-(bounds.min.x+bounds.max.x)*scale/2,-bounds.min.y*scale,-(bounds.min.z+bounds.max.z)*scale/2);
  const meshes=visual.getChildMeshes();for(const m of meshes){m.isPickable=false;m.receiveShadows=true;}
  const owned:{dispose():void}[]=[];
  // áo lam for men: the same body with its shirt and jeans recoloured to temple grey-blue (authoring/aolam/make_aolam.py)
  const aoLam=false;
  // Nam 01's plain colours: the same model with his cloth recoloured
  const namColour=nam01&&/^nam-01-[a-z]+$/.test(outfit)?outfit.slice(7):'';
  if(namColour)for(const mesh of meshes){const src=mesh.material;if(!(src instanceof PBRMaterial))continue;const mat=src.clone('player-'+id+'-nam-'+namColour)!;const tex=new Texture((import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/nam-01/diffuse-'+namColour+'.jpg',this.scene,false,false);mat.albedoTexture=tex;mesh.material=mat;owned.push(mat,tex);}
  if(aoLam)for(const mesh of meshes){const src=mesh.material;if(!(src instanceof PBRMaterial)||!src.name.includes('m014_body'))continue;const mat=src.clone('player-'+id+'-aolam')!;const tex=new Texture((import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/rocketbox/m014_body_'+outfit+'.jpg',this.scene,false,false);mat.albedoTexture=tex;mesh.material=mat;owned.push(mat,tex);}
  if(look){const base=(import.meta.env?.BASE_URL??'/')+'assets/chars/ready-made/ao-dai-collection/';
   for(const mesh of meshes){if(!(mesh.material instanceof PBRMaterial))continue;const src=mesh.material;
    if(src.name.includes('collection_coat')){const mat=src.clone('player-'+id+'-coat')!;const tex=new Texture(base+'pattern-'+look.id+'.svg',this.scene,false,false);tex.coordinatesIndex=2;tex.anisotropicFilteringLevel=8;mat.albedoTexture=tex;mat.albedoColor=Color3.White();mat.metallicTexture=null;mat.metallic=0;mat.roughness=.78;mesh.material=mat;owned.push(mat,tex);if(mesh.skeleton&&this.Cloth)new this.Cloth(mat,visual,mesh.skeleton);}
    else if(src.name.includes('collection_trousers')){const mat=src.clone('player-'+id+'-pants')!;mat.albedoTexture=null;mat.albedoColor=Color3.FromHexString(look.pants);mat.metallicTexture=null;mat.metallic=0;mat.roughness=.8;mesh.material=mat;owned.push(mat);}}}
  root.metadata={h:height,source:'Microsoft Rocketbox',nativeRig:true};
  return{root,visual,entries,meshes,height,outfit:look?outfit:nam01?(namColour?outfit:'nam-01'):aoLam?outfit:'thuong',owned};
 }
 dispose(){for(const c of this.templates)c.dispose();this.templates=[];}
 private static cache=new WeakMap<Scene,{lib:RocketboxPlayerLibrary;ready:Promise<void>}>();
 /** One library per scene, shared by the online players and the simulated men in the grounds (models load once). */
 static shared(scene:Scene){let c=RocketboxPlayerLibrary.cache.get(scene);if(!c){const lib=new RocketboxPlayerLibrary(scene);const ready=lib.load();ready.catch(()=>RocketboxPlayerLibrary.cache.delete(scene));c={lib,ready};RocketboxPlayerLibrary.cache.set(scene,c);}return c;}
}
