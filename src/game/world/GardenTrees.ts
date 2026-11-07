import {gardenTreePositions} from './GardenTreePlan';

import {GLTFFileLoader} from '@babylonjs/loaders/glTF';
import {SceneLoader,RegisterSceneLoaderPlugin,LoadAssetContainerAsync,Mesh,MeshBuilder,StandardMaterial,Texture,Matrix,Quaternion,Vector3,type Scene,type AbstractMesh,type AssetContainer} from '@babylonjs/core';

import {WindPlugin} from './Vegetation';
/** PBR garden tree by Rico Cilliers / Poly Haven CC0. It is not labelled as a Bodhi. */
export {gardenTreePositions};
export class GardenTrees{
 private sets=new Map<string,Mesh[]>();private containers:AssetContainer[]=[];private last=new Vector3(1e9,0,1e9);private disposed=false;ready=false;failed=false;
 constructor(private scene:Scene,private low:boolean,private at:{x:number;y:number;z:number}){scene.onDisposeObservable.addOnce(()=>{this.disposed=true;for(const meshes of this.sets.values())for(const m of meshes)m.dispose();for(const c of this.containers)c.dispose();});void this.load();}
 private async load(){try{this.sets.set('impostor',[this.impostor()]); /* ready at once: distant trees need no download wait */
  if(!SceneLoader.IsPluginForExtensionAvailable('.glb'))RegisterSceneLoaderPlugin(new GLTFFileLoader());for(const lod of ['far','low','high']){if(this.low&&lod==='high')continue;const c=await LoadAssetContainerAsync(import.meta.env.BASE_URL+'assets/garden/tree-small-02/'+lod+'.glb?v=2',this.scene);if(this.disposed){c.dispose();return;}this.containers.push(c);const e=c.instantiateModelsToScene(n=>'garden-'+lod+'-'+n,false),meshes:Mesh[]=[];for(const m of e.rootNodes.flatMap(r=>r.getChildMeshes(false))){if(!(m instanceof Mesh)||!m.getTotalVertices())continue;m.setParent(null);m.bakeCurrentTransformIntoVertices();m.isPickable=false;m.receiveShadows=true;if(m.material){m.material.backFaceCulling=false;if(/lea/i.test(m.material.name))new WindPlugin(m.material,.003,false,0);}meshes.push(m);}for(const r of e.rootNodes)if(!r.getChildMeshes().length)r.dispose();this.sets.set(lod,meshes);this.ready=true;this.last.set(1e9,0,1e9);}this.ready=true;}catch(e){this.failed=true;console.warn('Garden PBR trees unavailable',e);}}
 update(p:{x:number;z:number}){if(!this.ready||this.disposed)return;const x=p.x-this.at.x,z=p.z-this.at.z;if(Math.hypot(x-this.last.x,z-this.last.z)<25)return;for(const [lod,meshes]of this.sets){const list=gardenTreePositions().filter(t=>(()=>{const d=Math.hypot(x-t.x,z-t.z),want=!this.low&&d<55&&this.sets.has('high')?'high':d<(this.low?100:130)&&this.sets.has('low')?'low':d>(this.low?170:220)&&this.sets.has('impostor')?'impostor':'far';return lod===want;})()),matrices=new Float32Array(Math.max(1,list.length)*16);list.forEach((t,i)=>Matrix.Compose(new Vector3(t.height,t.height,t.height),Quaternion.RotationYawPitchRoll(t.yaw,0,0),new Vector3(this.at.x+t.x,this.at.y,this.at.z+t.z)).copyToArray(matrices,i*16));for(const m of meshes){m.thinInstanceSetBuffer('matrix',matrices,16,false);m.thinInstanceCount=list.length;m.thinInstanceRefreshBoundingInfo(false);m.setEnabled(list.length>0);}}this.last.set(x,0,z);}
 /**
  * Distant trees (Claude 2026-11-04): beyond ~220 m (light quality 170 m) a tree is two crossed cards with a render of the real
  * tree (authoring/garden/make_tree_impostor.py) — 4 triangles instead of ~10,000; near trees keep the 3D models.
  */
 private impostor(){const tex=new Texture(import.meta.env.BASE_URL+'assets/garden/tree-small-02/impostor.png',this.scene);tex.hasAlpha=true;
  const mat=new StandardMaterial('garden-tree-impostor',this.scene);mat.diffuseTexture=tex;mat.opacityTexture=tex;tex.getAlphaFromRGB=false;mat.useAlphaFromDiffuseTexture=true;mat.transparencyMode=1;mat.alphaCutOff=.45;mat.backFaceCulling=false;mat.specularColor.setAll(0);mat.emissiveColor.set(.28,.3,.28);
  const a=MeshBuilder.CreatePlane('garden-impostor-a',{width:1,height:1,sideOrientation:Mesh.DOUBLESIDE},this.scene),b=a.clone('garden-impostor-b');b.rotation.y=Math.PI/2;
  for(const p of [a,b]){p.position.y=.5;p.bakeCurrentTransformIntoVertices();}const m=Mesh.MergeMeshes([a,b],true)!;m.name='garden-impostor';m.material=mat;m.isPickable=false;m.setEnabled(false);return m;}
 get meshes():AbstractMesh[]{return [...this.sets.values()].flat();}
}
