import {test} from 'node:test';import assert from 'node:assert/strict';
import {NullEngine,Scene,FreeCamera,Vector3,ShaderMaterial} from '@babylonjs/core';
import {createCloudSea} from '../src/game/world/CloudSea.ts';
test('lightweight clouds avoid volume marching while high quality retains it, both bind camera uniforms',()=>{
 for(const low of [true,false]){const engine=new NullEngine(),scene=new Scene(engine);try{
  new FreeCamera('eye',new Vector3(0,10,598),scene);const clouds=createCloudSea(scene,low);
  const m=scene.materials.find(m=>m.name==='drifting-white-cloud-sea') as ShaderMaterial;
  const path=m.shaderPath as {fragmentSource:string};const main=path.fragmentSource.split('void main()')[1];
  assert.ok(main.includes('gl_FragColor'));assert.ok(path.fragmentSource.includes('exterior'));
  assert.equal(main.includes('for(int i=0;i<56;i++)'),!low);
  if(low){assert.ok(!main.includes('density('));assert.ok(main.includes('noise(q)'));}
  clouds.setNight(true);scene.render();clouds.setNight(false);scene.render();
 }finally{scene.dispose();engine.dispose();}}
});
