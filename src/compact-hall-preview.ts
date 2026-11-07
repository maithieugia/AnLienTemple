import {Engine,Scene,ArcRotateCamera,Vector3,HemisphericLight,DirectionalLight,Color4,LoadAssetContainerAsync,RegisterSceneLoaderPlugin,TransformNode,Mesh,VertexBuffer}from '@babylonjs/core';
import {GLTFFileLoader}from '@babylonjs/loaders/glTF';
import {liftGrandRoof}from './game/world/RoofLift';
import {sanctuaryMaterials}from './game/world/SanctuaryGeometry';
import {sanctuaryStructure}from './game/world/SanctuaryArchitecture';
const canvas=document.querySelector('canvas')!,engine=new Engine(canvas,true),scene=new Scene(engine);scene.clearColor=new Color4(.6,.73,.8,1);const cam=new ArcRotateCamera('view',1.2,1.1,650,new Vector3(0,45,0),scene);cam.attachControl(canvas,true);cam.minZ=.3;new HemisphericLight('sky',Vector3.Up(),scene).intensity=.9;new DirectionalLight('sun',new Vector3(-.4,-1,-.6),scene).intensity=1.1;
RegisterSceneLoaderPlugin(new GLTFFileLoader());sanctuaryStructure(scene,{x:0,y:0,z:0},sanctuaryMaterials(scene,true));
document.querySelector('#all')!.addEventListener('click',()=>{cam.setTarget(new Vector3(0,45,0));cam.radius=650;cam.beta=1.1;});document.querySelector('#inside')!.addEventListener('click',()=>{cam.setTarget(new Vector3(0,44,-45));cam.radius=160;cam.alpha=Math.PI/2;cam.beta=1.43;});
void(async()=>{const roof=await LoadAssetContainerAsync('./assets/workshop/vb-sanctuary-grand-roof/low.glb',scene);liftGrandRoof(roof);roof.addAllToScene();const model=await LoadAssetContainerAsync('./assets/sanctuary/tower-buddha/low.glb',scene),root=new TransformNode('main-buddha-80m',scene);for(const r of model.rootNodes)r.parent=root;root.position.set(0,5.8,-45);root.scaling.setAll(80);model.addAllToScene();let max=-Infinity;for(const m of roof.meshes)if(m instanceof Mesh){const p=m.getVerticesData(VertexBuffer.PositionKind);if(p)for(let i=1;i<p.length;i+=3)max=Math.max(max,p[i]);}document.querySelector('output')!.textContent='Mái cao '+max.toFixed(2)+' m · Tượng 80 m · đỉnh tượng 85,8 m · Ngói lớn: '+roof.materials.filter(m=>m.metadata?.largeRoofTiles).length;})();
engine.runRenderLoop(()=>scene.render());window.addEventListener('resize',()=>engine.resize());

document.querySelector('#floor')!.addEventListener('click',()=>{cam.setTarget(new Vector3(12,1.2,70));cam.radius=15;cam.alpha=1;cam.beta=.9;});

const skinButton=document.createElement('button');skinButton.textContent='QA mặt ngói';document.body.append(skinButton);skinButton.style.cssText='position:fixed;bottom:10px;left:10px;z-index:5';skinButton.onclick=()=>{for(const mesh of scene.meshes)if(mesh.material?.name.includes('Roof underside')||mesh.material?.name.includes('Round cover tile'))mesh.setEnabled(false);};
