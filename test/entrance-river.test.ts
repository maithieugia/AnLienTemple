import {test}from 'node:test';import assert from 'node:assert/strict';
import {ENTRANCE_RIVER as R,ENTRANCE_BRIDGE as B,entranceBridgeY,entranceTerrainY,entranceWalkY,entranceFeetY,entranceBridgeBarriers}from '../src/game/world/EntranceRiverPlan.ts';
import {SPAWN,inWorld,clampWorld}from '../src/online/protocol.ts';
import {SANCTUARY,SANCTUARY_BOUNDS,sanctuaryHeight}from '../src/game/world/SanctuaryPlan.ts';

import {addObstacle,clearObstacles,resolveCircle}from '../src/game/world/Obstacles.ts';
import {entranceWaterBarriers} from '../src/game/world/EntranceRiverPlan.ts';
test('walking and running stop on the final tread, while the bridge centre remains open',()=>{
 clearObstacles();
 try {
  [...entranceWaterBarriers(),...entranceBridgeBarriers()].forEach(addObstacle);
  const last=ENTRANCE_STAIR_TREADS.at(-1)!;
  for(const x of [-389.6,-100,-8,8,100,389.6])for(const stride of [.16,.45]){
   let z=596,feet=0;
   for(let i=0;i<160;i++){
    [,z]=resolveCircle(x,z+stride,.3,feet);
    feet=entranceFeetY(x,z,feet,-Infinity,.05);
    assert.ok(z<last.z1);
   }
   assert.ok(z>=last.z0);
   assert.equal(feet,last.y);
  }
  assert.deepEqual(resolveCircle(0,last.z1,.3,entranceBridgeY(last.z1)!),[0,last.z1]);
  const [sideX]=resolveCircle(7.1,last.z1-.8,.3,last.y);
  assert.ok(sideX>=7.29);
  const [,outerZ]=resolveCircle(100,R.z1+.1,.3,0);
  assert.ok(outerZ>=R.z1+.29);
 }finally{clearObstacles();}
});
test('river is excavated below banks and the whole bridge/outer arrival is inside world',()=>{assert.ok(R.bed<R.water&&R.water< -2);assert.equal(entranceTerrainY(50,620),-5);assert.equal(sanctuaryHeight(SANCTUARY.x+50,SANCTUARY.z+620,.4),-4.6);assert.ok(SANCTUARY_BOUNDS.z1>=710);assert.ok(SPAWN.z>655);assert.ok(inWorld(SPAWN.x,SPAWN.y,SPAWN.z));assert.equal(clampWorld(100,-2.24,608).y,-2.24);});
test('circular bridge joins both banks at zero and rises eight metres monotonically',()=>{assert.equal(entranceBridgeY(585),0);assert.equal(entranceBridgeY(695),0);assert.equal(entranceBridgeY(640),8);for(let z=585;z<640;z+=.25){assert.ok(entranceBridgeY(z+.25)!>=entranceBridgeY(z)!);assert.ok(Math.abs(entranceBridgeY(z)!-entranceBridgeY(1280-z)!)<1e-9);}assert.equal(entranceBridgeY(705),null);assert.equal(entranceWalkY(100,608),-2.24);});
test('actual rendered bridge rails allow walking and running both ways without blocking the centre',()=>{clearObstacles();entranceBridgeBarriers().forEach(addObstacle);for(const speed of [3.2,9])for(const direction of [-1,1]){let z=direction<0?705:565,feet=0,peak=0;const end=direction<0?565:705,dt=1/60;for(let i=0;i<3000&&Math.abs(z-end)>.001;i++){const step=direction*Math.min(Math.abs(end-z),speed*dt),p=resolveCircle(0,z+step,.3,feet,1.7);assert.ok(Math.abs(p[0])<1e-7);assert.ok(Math.abs(p[1]-z-step)<1e-7,'no invisible wall across the deck');z=p[1];feet=entranceFeetY(0,z,feet,-Infinity,dt);peak=Math.max(peak,feet);if(entranceBridgeY(z)!==null)assert.ok(Math.abs(feet-entranceWalkY(0,z))<.001);}assert.ok(Math.abs(z-end)<.001);assert.ok(peak>7.99);assert.ok(feet<.001);}const blocked=resolveCircle(6.9,620,.3,8,1.7);assert.ok(blocked[0]<6.6);clearObstacles();});
import {ENTRANCE_STAIR_TREADS,ENTRANCE_BANK_RAILS,ENTRANCE_BRIDGE_PIERS,ENTRANCE_ARCH_RADIUS,entranceBridgeSoffitY}from '../src/game/world/EntranceRiverPlan.ts';
test('stairs join the bank without gaps and have no rail across their frontage or waterside foot',()=>{const t=ENTRANCE_STAIR_TREADS;assert.equal(t[0].y,0);assert.ok(t[0].z0<598);for(let i=1;i<t.length;i++){assert.equal(t[i-1].z1,t[i].z0);assert.ok(Math.abs(t[i].y-t[i-1].y+R.stepRise)<1e-8);}assert.equal(t.at(-1)!.y,-2.24);assert.ok(t.at(-1)!.y>R.water);clearObstacles();for(const [x0,z0,x1,z1]of ENTRANCE_BANK_RAILS)addObstacle({cx:(x0+x1)/2,cz:(z0+z1)/2,hx:Math.max(.22,Math.abs(x1-x0)/2),hz:Math.max(.22,Math.abs(z1-z0)/2),base:0,h:1.4,yaw:0,sight:true,climb:false});for(const x of [-300,-100,100,300]){let feet=0;for(let z=594;z<t.at(-1)!.z1-.05;z+=.03){assert.deepEqual(resolveCircle(x,z,.3,feet,1.7),[x,z]);feet=entranceFeetY(x,z,feet,-Infinity,1/60);}assert.ok(Math.abs(feet+2.24)<.01);}clearObstacles();});
test('bridge body is solid outside a semicircular waterline opening and four large pillars leave its centre clear',()=>{assert.equal(ENTRANCE_BRIDGE_PIERS.length,4);assert.equal(new Set(ENTRANCE_BRIDGE_PIERS.map(p=>p.x+','+p.z)).size,4);assert.equal(entranceBridgeSoffitY(640-ENTRANCE_ARCH_RADIUS),R.water);assert.equal(entranceBridgeSoffitY(640+ENTRANCE_ARCH_RADIUS),R.water);assert.equal(entranceBridgeSoffitY(640),R.water+ENTRANCE_ARCH_RADIUS);assert.equal(entranceBridgeSoffitY(600),R.bed);for(let z=585;z<=695;z+=.1)assert.ok(entranceBridgeY(z)!-entranceBridgeSoffitY(z)>1,'substantial masonry above the vault');clearObstacles();for(const p of ENTRANCE_BRIDGE_PIERS){assert.ok(p.width>=3&&p.height>=5);addObstacle({cx:p.x,cz:p.z,hx:p.width/2,hz:p.width/2,base:0,h:p.height,yaw:0,sight:true,climb:false});}for(let z=580;z<700;z+=.2)assert.deepEqual(resolveCircle(0,z,.3,Math.max(0,entranceBridgeY(z)??0),1.7),[0,z]);clearObstacles();});
import {ENTRANCE_STAIR_RANGES,ENTRANCE_STAIR_INNER_EDGE,ENTRANCE_GATE}from '../src/game/world/EntranceRiverPlan.ts';
test('stairs meet bridge walls on both sides and the enlarged gate clears the bridge skyline',()=>{assert.equal(ENTRANCE_STAIR_RANGES[0][1],-ENTRANCE_STAIR_INNER_EDGE);assert.equal(ENTRANCE_STAIR_RANGES[1][0],ENTRANCE_STAIR_INNER_EDGE);assert.ok(ENTRANCE_STAIR_INNER_EDGE<B.halfWidth);for(const side of [-1,1])for(const t of ENTRANCE_STAIR_TREADS)assert.equal(entranceWalkY(side*(B.halfWidth+.05),(t.z0+t.z1)/2),t.y);assert.ok(ENTRANCE_GATE.columnHeight>=B.rise*2);assert.ok(ENTRANCE_GATE.upper.base+ENTRANCE_GATE.upper.rise>=27);assert.ok(ENTRANCE_GATE.signY>B.rise+5);assert.ok(ENTRANCE_GATE.lower.depth/2<585-ENTRANCE_GATE.z,'roof stops before bridge approach');});

test('three gate roofs have separated eaves and decreasing footprints',()=>{const tiers=[ENTRANCE_GATE.lower,ENTRANCE_GATE.middle,ENTRANCE_GATE.upper];assert.equal(tiers.length,3);for(let i=1;i<tiers.length;i++){assert.ok(tiers[i].base>tiers[i-1].base+3);assert.ok(tiers[i].width<tiers[i-1].width&&tiers[i].depth<tiers[i-1].depth);}});

test('river doubles outward while the inner bank remains fixed and arrival stays dry',()=>{assert.equal(R.z0,600);assert.equal(R.z1-R.z0,80);assert.equal(B.z-B.halfRun,585);assert.equal(B.z+B.halfRun,695);assert.ok(SPAWN.z>B.z+B.halfRun);assert.equal(entranceWalkY(SPAWN.x,SPAWN.z),0);assert.equal(entranceTerrainY(150,670),R.bed);});
