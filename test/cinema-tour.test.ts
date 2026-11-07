import {test} from 'node:test';import assert from 'node:assert/strict';
import {Vector3} from '@babylonjs/core';
import {SHOTS} from '../src/online/CinemaDirector.ts';
import {bridgeCrossing,insideRiver,onRiver,STATUE_STOPS,BRIDGE_IN,BRIDGE_OUT} from '../src/online/TempleTour.ts';
import {SPAWN} from '../src/online/protocol.ts';
test('every film shot gives a finite camera for walking, praying, the lift and the tower top',()=>{
 const phases=new Set(SHOTS.map(s=>s.phase));for(const p of ['walk','ritual','lift','look'])assert.ok(phases.has(p as never),p);
 const s={p:new Vector3(10,0,300),yaw:Math.PI,phase:'walk' as const,focus:{x:0,y:0,z:270,h:20},tower:{x:480,z:240}};
 for(const shot of SHOTS)for(const u of [0,.5,1]){const f=shot.at(u,s,{p0:s.p.clone(),yaw0:s.yaw,side:1,a0:.7},s.p.clone());
  assert.ok([f.pos.x,f.pos.y,f.pos.z,f.look.x,f.look.y,f.look.z,f.fov].every(Number.isFinite),shot.name);assert.ok(f.fov>.3&&f.fov<1.3,shot.name);
  assert.ok(Vector3.Distance(f.pos,f.look)>.2,shot.name+' looks somewhere');}
});
test('from the gate the round crosses the river on the bridge, and no stop stands in the river',()=>{
 assert.ok(!insideRiver(SPAWN));assert.deepEqual(bridgeCrossing(SPAWN,{x:-150,z:586}),[BRIDGE_OUT,BRIDGE_IN]);
 assert.deepEqual(bridgeCrossing({x:0,z:300},{x:20,z:400}),[]);
 for(const s of STATUE_STOPS)assert.ok(!onRiver(s),s.id);
});
test('the Tự đi lễ flycam flies the whole temple calmly and smoothly',async()=>{
 const F=await import('../src/online/FlyTour.ts');assert.equal(F.FLY_CHAPTERS.length,6);assert.ok(F.FLY_PERIOD>400);
 let prev=F.flyAt(0),maxV=0,maxW=0,maxDv=0,lastV=0,openV=0,openW=0;const dt=1/30,open=F.FLY_CHAPTERS[1].t+10;
 for(let t=dt;t<F.FLY_PERIOD;t+=dt){const c=F.flyAt(t),v=Math.hypot(c.p[0]-prev.p[0],c.p[1]-prev.p[1],c.p[2]-prev.p[2])/dt;
  const a=[prev.l[0]-prev.p[0],prev.l[1]-prev.p[1],prev.l[2]-prev.p[2]],b=[c.l[0]-c.p[0],c.l[1]-c.p[1],c.l[2]-c.p[2]];
  const w=Math.acos(Math.min(1,(a[0]*b[0]+a[1]*b[1]+a[2]*b[2])/(Math.hypot(...a)*Math.hypot(...b))))*180/Math.PI/dt;
  if(t<open){openV=Math.max(openV,v);openW=Math.max(openW,w);}else{maxV=Math.max(maxV,v);maxW=Math.max(maxW,w);}if(t>open)maxDv=Math.max(maxDv,Math.abs(v-lastV)/dt);lastV=v;prev=c;}
 assert.ok(F.FLY_CHAPTERS[1].t<70,'brisk opening '+F.FLY_CHAPTERS[1].t);assert.ok(openV<15&&openW<25,'opening '+openV+' '+openW);assert.ok(maxV<9,'speed '+maxV);assert.ok(maxW<20,'turn '+maxW);assert.ok(maxDv<6,'no jolts: acceleration '+maxDv);
});
