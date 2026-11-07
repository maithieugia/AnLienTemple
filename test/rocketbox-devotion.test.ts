import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NullEngine,Scene,LoadAssetContainerAsync,TransformNode,Vector3} from '@babylonjs/core';
import '@babylonjs/loaders/glTF/index.js';
import {RocketboxDevotion} from '../src/game/chars/RocketboxDevotion.ts';
for(const name of ['Male_Adult_08','Female_Adult_17'])test('native '+name+' keeps limb lengths and finite joints through devotional poses',async()=>{
 const engine=new NullEngine(),scene=new Scene(engine);
 try{
 const bytes=readFileSync(new URL('../public/assets/chars/ready-made/rocketbox/'+name+'.glb',import.meta.url));
 const asset=await LoadAssetContainerAsync(new Uint8Array(bytes),scene,{pluginExtension:'.glb',pluginOptions:{gltf:{skipMaterials:true}}});asset.addAllToScene();
 const root=new TransformNode('review-holder',scene);for(const n of asset.rootNodes)n.parent=root;
 const pose=new RocketboxDevotion(root,asset),nodes=new Map(asset.skeletons[0].bones.map(b=>[b.name,b.getTransformNode()!]));
 pose.apply('prayer',0,1);
 const position=(key:string)=>{const n=nodes.get(key)!;n.computeWorldMatrix(true);return n.getAbsolutePosition().clone();};
 const pairs=['L','R'].flatMap(side=>[['UpperArm','Forearm'],['Forearm','Hand'],['Thigh','Calf'],['Calf','Foot']].map(([a,b])=>['Bip01 '+side+' '+a,'Bip01 '+side+' '+b]));
 const lengths=pairs.map(([a,b])=>Vector3.Distance(position(a),position(b)));
 for(const mode of ['prayer','sit','kneel','bow'] as const)for(const t of [0,1.5,3,4.5,6]){
  pose.apply(mode,t,1);
  for(const n of nodes.values()){n.computeWorldMatrix(true);assert.ok(n.getAbsolutePosition().asArray().every(Number.isFinite));}
  for(let i=0;i<pairs.length;i++){const[a,b]=pairs[i];assert.ok(Math.abs(Vector3.Distance(position(a),position(b))-lengths[i])<1e-4,mode+' '+a);}

  if(mode==='prayer')for(const side of ['L','R'])assert.ok(position('Bip01 '+side+' Finger2').y>position('Bip01 '+side+' Hand').y+.04,'fingers point upward');
  for(const side of ['L','R']){assert.ok(position('Bip01 '+side+' Foot').y>.025,mode+' ankle above floor');assert.ok(position('Bip01 '+side+' Calf').y>.04,mode+' knee above floor');}
  if(mode==='bow'&&t===3)assert.ok(position('Bip01 Head').y>.07&&position('Bip01 Head').y<.26,'full bow lowers the head without going below the floor');
 }
 pose.release();asset.dispose();
 }finally{scene.dispose();engine.dispose();}
});
