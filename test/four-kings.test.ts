import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {FOUR_KINGS,FOUR_KINGS_COURT_CENTER as center,FOUR_KINGS_PLINTH as plinth,ALL_GARDEN_STATUES,statueGardenReserved} from '../src/game/world/StatueGardenPlan.ts';
import {createHash} from 'node:crypto';
test('exported statue LODs retain closed manifold surfaces after seam welding',()=>{
 const audit=JSON.parse(readFileSync('authoring/four-kings/hole-audit.json','utf8'));assert.equal(audit.length,16);
 for(const entry of audit){assert.equal(entry.boundaryLoops,0,`${entry.id} ${entry.level}`);assert.equal(entry.nonmanifold,0);const file=entry.level==='source'?`authoring/four-kings/incoming/${entry.id}.glb`:`public/assets/sanctuary/four-kings/${entry.id}/${entry.level}.glb`;assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'),entry.fileSha256,'audit matches actual shipped geometry');}
});
test('four different 50m statues occupy the four court corners and face the exact centre',()=>{
 assert.equal(FOUR_KINGS.length,4);assert.equal(new Set(FOUR_KINGS.map(s=>s.asset)).size,4);const corners=new Set();
 for(const s of FOUR_KINGS){assert.equal(s.height,50);assert.equal(s.base,3);assert.ok(ALL_GARDEN_STATUES.includes(s));const dx=center.x-s.x,dz=center.z-s.z,d=Math.hypot(dx,dz);assert.ok(Math.abs(Math.sin(s.yaw)-dx/d)<1e-10);assert.ok(Math.abs(Math.cos(s.yaw)-dz/d)<1e-10);assert.ok(Math.abs(s.x)+plinth.half<338);assert.ok(s.z-plinth.half>238&&s.z+plinth.half<530);assert.ok(statueGardenReserved(s.x,s.z));corners.add(`${Math.sign(s.x)},${Math.sign(s.z-center.z)}`);}
 assert.equal(corners.size,4);
});
test('all four user supplied statues retain source hashes and three bounded LODs',()=>{
 for(const s of FOUR_KINGS){const folder=`public/assets/sanctuary/${s.asset}`,meta=JSON.parse(readFileSync(folder+'/asset.json','utf8'));assert.equal(meta.normalizedHeight,1);assert.match(meta.sourceSha256,/^[a-f0-9]{64}$/);assert.equal(meta.sourceTriangles,500000);for(const level of ['high','low','far'])assert.ok(existsSync(`${folder}/${level}.glb`));assert.ok(meta.triangles.high<=120100&&meta.triangles.low<=35100&&meta.triangles.far<=8100);}
});
