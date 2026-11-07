import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weakReasons} from '../src/online/Quality.ts';
const desk={memory:8,cores:8,touch:false,renderer:'ANGLE (NVIDIA GeForce RTX 3060 Direct3D11)',maxTexture:16384,screen:1080};
test('strong desktop and strong phone get high quality; weak or software devices get the light version',()=>{
 assert.deepEqual(weakReasons(desk),[]);
 assert.deepEqual(weakReasons({...desk,renderer:'ANGLE (Intel, Intel(R) UHD Graphics (0x00009A68) Direct3D11)'}),[]);
 assert.deepEqual(weakReasons({memory:8,cores:8,touch:true,renderer:'Adreno (TM) 740',maxTexture:16384,screen:1080}),[]);
 assert.ok(weakReasons({memory:4,cores:8,touch:true,renderer:'Mali-G52 MC2',maxTexture:8192,screen:720}).length>0);
 assert.ok(weakReasons({memory:3,cores:4,touch:true,renderer:'Adreno (TM) 506',maxTexture:8192,screen:720}).length>0);
 assert.ok(weakReasons({...desk,renderer:'Google SwiftShader'}).length>0);
 assert.ok(weakReasons({...desk,touch:true,memory:undefined,cores:6,renderer:'Apple GPU'}).length>0,'unknown-memory phone stays light');
});
