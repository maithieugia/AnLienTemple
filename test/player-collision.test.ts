import test from 'node:test';
import assert from 'node:assert/strict';
import {stopAtPlayer} from '../src/online/PlayerCollision.ts';
test('running cannot cross another player, with room to sidestep or leave a shared spawn',()=>{
 const other={x:0,y:0,z:0};
 const [contactX]=stopAtPlayer({x:-1,y:0,z:0},1,0,other);
 assert.ok(Math.abs(contactX+.64)<1e-9);
 assert.deepEqual(stopAtPlayer({x:contactX,y:0,z:0},contactX,.5,other),[contactX,.5]);
 assert.deepEqual(stopAtPlayer({x:0,y:0,z:0},.2,0,other),[.2,0]);
 assert.deepEqual(stopAtPlayer({x:-1,y:2,z:0},1,0,other),[1,0]);
});
