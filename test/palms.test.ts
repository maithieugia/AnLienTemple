import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from '@babylonjs/core';
import {palmQuaternion} from '../src/game/chars/PalmPose.ts';
test('palm solver controls finger direction and wrist roll for mirrored hands',()=>{for(const side of [-1,1]){const finger=new Vector3(side,0,0),width=new Vector3(.12,0,1);const q=palmQuaternion(finger,width,Vector3.Up(),new Vector3(0,0,-1));const f=finger.applyRotationQuaternion(q).normalize(),w=width.applyRotationQuaternion(q);w.subtractInPlace(f.scale(Vector3.Dot(f,w))).normalize();assert.ok(Vector3.Distance(f,Vector3.Up())<1e-6);assert.ok(Vector3.Distance(w,new Vector3(0,0,-1))<1e-6);assert.ok([q.x,q.y,q.z,q.w].every(Number.isFinite));}});
