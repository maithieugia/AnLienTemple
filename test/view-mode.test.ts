import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cameraEyeHeight} from '../src/online/ViewMode.ts';
test('eye camera follows standing, lotus, kneeling and bowing heights above the floor',()=>{
 assert.equal(cameraEyeHeight('idle'),1.58);
 assert.equal(cameraEyeHeight('run'),cameraEyeHeight('idle'));
 assert.ok(cameraEyeHeight('sit')<cameraEyeHeight('kneel'));
 assert.ok(cameraEyeHeight('kneel')<cameraEyeHeight('idle'));
 assert.ok(cameraEyeHeight('bow')>.2);
 assert.ok(cameraEyeHeight('idle',true)<cameraEyeHeight('idle'));
});

import {eyeCameraSettings}from '../src/online/ViewMode.ts';
test('eye camera rejects invalid stored settings and bounds height and field of view',()=>{
 assert.deepEqual(eyeCameraSettings(null),{height:1.8,fov:65});
 assert.deepEqual(eyeCameraSettings({height:NaN,fov:Infinity}),{height:1.8,fov:65});
 assert.deepEqual(eyeCameraSettings({height:99,fov:-1}),{height:3.2,fov:35});
 assert.deepEqual(eyeCameraSettings({height:-2,fov:200}),{height:.6,fov:100});
 assert.deepEqual(eyeCameraSettings({height:2.35,fov:50}),{height:2.35,fov:50});
});
