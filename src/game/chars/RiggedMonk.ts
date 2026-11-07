import {AnimationGroup,LoadAssetContainerAsync,SceneLoader,RegisterSceneLoaderPlugin,TransformNode,type AssetContainer,type Scene,type AbstractMesh} from '@babylonjs/core';
import {GLTFFileLoader} from '@babylonjs/loaders/glTF';
import {AnimController} from './AnimController';
import {applyRedGoldKasaya} from './RedGoldKasaya';
import type {HumanRig,HumanOptions} from './CharacterLibrary';

/**
 * The creator424 "Monk" (Sketchfab, CC BY 4.0) rigged offline onto the CC0 Quaternius UAL skeleton
 * (authoring/monk-rig/rig_monk.py). Same bone names as the pilgrims, so every UAL clip and the devotional IK poses apply.
 * Implements createHuman() so it can stand in for CharacterLibrary wherever a HumanRig is needed.
 */
const BASE=`${import.meta.env.BASE_URL}assets/chars/`;
export class RiggedMonkLibrary{
 private monk!:AssetContainer;private n=0;
 constructor(private scene:Scene){}
 async load(){
  if(!SceneLoader.IsPluginForExtensionAvailable('.glb'))RegisterSceneLoaderPlugin(new GLTFFileLoader());
  // The UAL clips are baked into the rigged file in Blender (same bone rest frames, pelvis travel already scaled).
  this.monk=await LoadAssetContainerAsync(BASE+'ready-made/creator424-monk/rigged.glb?v=6',this.scene);
  for(const g of this.monk.animationGroups)g.stop();
  applyRedGoldKasaya(this.monk.materials);
 }
 createHuman(o:HumanOptions):HumanRig{
  const tag=`${o.id}#monk${this.n++}`;
  const inst=this.monk.instantiateModelsToScene(n=>`${tag}:${n}`,false,{doNotInstantiate:true});
  const root=new TransformNode(`${tag}:char`,this.scene);for(const r of inst.rootNodes)r.parent=root;
  const strip=(n:string)=>n.slice(n.indexOf(':')+1);const nodes=new Map<string,TransformNode>();const meshes:AbstractMesh[]=[];
  for(const r of inst.rootNodes)for(const d of [r,...r.getDescendants(false)]){if((d as AbstractMesh).getTotalVertices)meshes.push(d as AbstractMesh);else if(d instanceof TransformNode)nodes.set(strip(d.name),d);}
  for(const m of meshes){if(m instanceof TransformNode&&!nodes.has(strip(m.name)))nodes.set(strip(m.name),m as unknown as TransformNode);}
  const groups=new Map<string,AnimationGroup>();
  for(const g of inst.animationGroups){g.stop();groups.set(strip(g.name),g);}
  return{root,nodes,meshes,anim:new AnimController(groups),dispose:()=>{for(const g of groups.values())g.dispose();inst.dispose();root.dispose();}};
 }
}
