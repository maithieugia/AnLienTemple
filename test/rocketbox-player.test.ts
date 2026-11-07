import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NullEngine,Scene,LoadAssetContainerAsync,Vector3,Mesh} from '@babylonjs/core';
import {RocketboxPlayerLibrary} from '../src/game/chars/RocketboxPlayerLibrary.ts';
import {RocketboxDevotion} from '../src/game/chars/RocketboxDevotion.ts';
test('online native players share geometry but have independent skeletons, motion and poses',async()=>{
 const engine=new NullEngine(),scene=new Scene(engine),lib=new RocketboxPlayerLibrary(scene,true);
 try{
 await lib.load(url=>LoadAssetContainerAsync(new Uint8Array(readFileSync(new URL('../public/assets/chars/ready-made/rocketbox/'+url.split('/').at(-1),import.meta.url))),scene,{pluginExtension:'.glb',pluginOptions:{gltf:{skipMaterials:true}}}));
 const a=lib.create(false,1),b=lib.create(false,2),female=lib.create(true,3);
 for(const actor of [a,b,female]){assert.ok(actor.root.isEnabled());assert.ok(actor.meshes.every(m=>m.isEnabled()));assert.equal(actor.entries.skeletons[0].bones.length,80);assert.deepEqual(actor.entries.animationGroups.map(g=>g.name).sort(),['Idle','PilgrimRun','PilgrimWalk','Push','Run','Walk']);}
 assert.notEqual(a.entries.skeletons[0],b.entries.skeletons[0]);assert.notEqual(a.entries.animationGroups[0],b.entries.animationGroups[0]);const ma=a.meshes.find(m=>m.getTotalVertices()>0) as Mesh,mb=b.meshes.find(m=>m.getTotalVertices()>0) as Mesh;assert.ok(ma.geometry);assert.equal(ma.geometry,mb.geometry);
 for(const actor of [a,female]){const bounds=actor.root.getHierarchyBoundingVectors(true);assert.ok(Math.abs(bounds.max.y-bounds.min.y-actor.height)<1e-4);assert.ok(Math.abs(bounds.min.y)<1e-4,'feet start on floor');}
 const hip=(actor:typeof a)=>actor.entries.skeletons[0].bones.find(n=>n.name==='Bip01 Pelvis')!.getTransformNode()!;
 const before=hip(b).position.clone();const otherHead=b.entries.skeletons[0].bones.find(n=>n.name==='Bip01 Head')!.getTransformNode()!;otherHead.computeWorldMatrix(true);const headBefore=otherHead.getAbsolutePosition().clone();
 a.root.position.set(12,51.2,-20);a.root.rotation.y=1.2;new RocketboxDevotion(a.visual,a.entries).apply('bow',3,1);assert.ok(Vector3.Distance(before,hip(b).position)<1e-8);otherHead.computeWorldMatrix(true);assert.ok(Vector3.Distance(headBefore,otherHead.getAbsolutePosition())<1e-8);const localHead=a.entries.skeletons[0].bones.find(n=>n.name==='Bip01 Head')!.getTransformNode()!;assert.ok(localHead.getAbsolutePosition().y>51.2&&localHead.getAbsolutePosition().y<51.5,'pose respects the player floor and rotation');
 const pose=new RocketboxDevotion(female.visual,female.entries);pose.apply('prayer',0,1,true);
 const hands=female.entries.skeletons[0].bones.filter(b=>b.name==='Bip01 L Hand'||b.name==='Bip01 R Hand').map(b=>b.getTransformNode()!.getAbsolutePosition());assert.ok(Vector3.Distance(hands[0],hands[1])>.3,'wheel pose separates hands');
 for(const actor of [a,b,female]){actor.entries.dispose();actor.root.dispose();}
 }finally{lib.dispose();scene.dispose();engine.dispose();}
});
