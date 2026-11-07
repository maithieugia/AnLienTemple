import {test} from 'node:test';import assert from 'node:assert/strict';
import {onRiverStep,Drift,skyFlight,WATER_BOX,RELEASE_LIFE,type Release} from '../src/online/Releases.ts';
import {ENTRANCE_STAIR_TREADS as T} from '../src/game/world/EntranceRiverPlan.ts';
test('lanterns and carp are let go from the last river steps only',()=>{const last=T[T.length-1];
 assert.ok(onRiverStep({x:40,y:last.y,z:(last.z0+last.z1)/2}));assert.ok(onRiverStep({x:-200,y:last.y,z:last.z0+.1}));
 assert.ok(!onRiverStep({x:40,y:0,z:590}),'courtyard');assert.ok(!onRiverStep({x:3,y:last.y,z:last.z0+.5}),'under the bridge');assert.ok(!onRiverStep({x:40,y:T[2].y,z:(T[2].z0+T[2].z1)/2}),'upper steps');});
test('floating offerings stay on open water, the same on every client',()=>{
 for(const kind of ['lantern','fish'] as const)for(const id of [1,77,4242]){const r:Release={id,kind,x:id%2?60:-120,y:-2.4,z:608,t:0,text:''},a=new Drift(r),b=new Drift(r);
  for(let t=0;t<RELEASE_LIFE[kind];t+=13.7){const p=a.at(t),q=b.at(t);assert.deepEqual(p,q);assert.ok(p.x>=WATER_BOX.x0-1e-9&&p.x<=WATER_BOX.x1+1e-9&&p.z>=WATER_BOX.z0-1e-9&&p.z<=WATER_BOX.z1+1e-9,kind+' out of the river at '+t);assert.ok(Math.abs(p.x)>=WATER_BOX.clear-1e-9,'hits the bridge piers');}
  const late=new Drift(r);assert.deepEqual(late.at(500),a.at(500),'a pilgrim arriving later sees the same place');}
});
test('a sky lantern rises, drifts away with the wind and fades out',()=>{const r:Release={id:9,kind:'sky',x:0,y:2.3,z:300,t:0,text:'x'};const a=skyFlight(r,0),b=skyFlight(r,60),c=skyFlight(r,RELEASE_LIFE.sky);
 assert.ok(Math.abs(a.y-2.3)<1e-9);assert.ok(b.y>50);const side=Math.hypot(b.x-r.x,b.z-r.z);assert.ok(side>.8*(b.y-r.y),'slants with the wind, not straight up');assert.ok(b.lean>.1);assert.equal(a.fade,1);assert.equal(c.fade,0);});
