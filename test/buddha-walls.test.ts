import {test} from 'node:test';import {strict as assert} from 'node:assert';import {readFileSync} from 'node:fs';
import {BUDDHA_WALL_TILES,reliefLod} from '../src/game/world/BuddhaWallPlan.ts';
test('Three interior faces, both 30m storeys, square tiles face the hall and leave entry open',()=>{
 const ids=new Set(BUDDHA_WALL_TILES.map(t=>t.id));assert.equal(ids.size,BUDDHA_WALL_TILES.length);
 const three=BUDDHA_WALL_TILES.filter(t=>t.wall==='rear'||t.wall==='west'||t.wall==='east');assert.ok(three.length>3200&&three.length<3360,'three walls tiled, minus the four doorways');
 assert.ok(BUDDHA_WALL_TILES.filter(t=>t.wall==='front').length>600,'front wall tiled');assert.ok(BUDDHA_WALL_TILES.filter(t=>t.wall==='vault').length>500,'vault drums tiled');
 for(const t of BUDDHA_WALL_TILES.filter(t=>t.wall==='vault')){const dot=-t.x*Math.sin(t.yaw)-t.z*Math.cos(t.yaw);assert.ok(dot>50,'faces into the hall');}
 for(const t of [...three,...BUDDHA_WALL_TILES.filter(t=>t.wall==='front')]){assert.ok(t.y>=3.7&&t.y<=61.65);const dot=-t.x*Math.sin(t.yaw)-t.z*Math.cos(t.yaw);assert.ok(dot>190);}
 for(const level of [1]){const set=BUDDHA_WALL_TILES.filter(t=>t.level===level);assert.equal(set.filter(t=>t.wall==='rear').length,720);assert.equal(set.filter(t=>t.wall==='west').length,480);assert.equal(set.filter(t=>t.wall==='east').length,480);}
});
test('Relief detail has bounded cost and uses vertical distance, including upper storey',()=>{
 for(const low of [true,false])for(const eye of [{x:0,y:3.7,z:-194},{x:295,y:53,z:0},{x:-295,y:60,z:40}]){const near=reliefLod(eye,low);assert.ok(near.length>0);assert.ok(near.length<=(low?6:12));for(const t of near)assert.ok(Math.hypot(t.x-eye.x,t.y-eye.y,t.z-eye.z)<(low?22:32));}
 assert.equal(reliefLod({x:0,y:200,z:0},true).length,0);
});
test('Baked museum relief includes actual non-flat figure and moulded frame, with license/source',()=>{
 const root=new URL('../public/assets/sanctuary/wall-buddha-relief/',import.meta.url),source=JSON.parse(readFileSync(new URL('SOURCE.json',root),'utf8'));assert.equal(source.license,'CC0');assert.equal(source.creator,'Minneapolis Institute of Art');
 for(const n of [32,64,128]){const g=JSON.parse(readFileSync(new URL(`grid-${n}.json`,root),'utf8'));assert.equal(g.heights.length,(n+1)**2);assert.ok(g.heights.every((v:number)=>Number.isFinite(v)&&v>=0&&v<=.32));assert.ok(Math.max(...g.heights)>.15);}
});
test('rear and side doors are open through the relief collision and tiles',async()=>{const {reliefWallRects}=await import('../src/game/world/BuddhaWallPlan.ts');const {SANCTUARY_HALL_DOORS,HALL_DOOR}=await import('../src/game/world/SanctuaryPlan.ts');
 const rects=reliefWallRects();for(const d of SANCTUARY_HALL_DOORS){const p=d.wall==='rear'?{x:d.at,z:-199.3}:{x:d.wall==='west'?-299.3:299.3,z:d.at};const block=rects.find(r=>Math.abs(p.x-r.cx)<r.hx&&Math.abs(p.z-r.cz)<r.hz&&r.base<1.2+2);assert.equal(block,undefined,'door '+d.wall+' '+d.at+' open at head height');
  assert.ok(!BUDDHA_WALL_TILES.some(t=>t.wall===d.wall&&t.level===0&&t.y<1.2+HALL_DOOR.h&&Math.abs((d.wall==='rear'?t.x:t.z)-d.at)<HALL_DOOR.half),'no relief tile in the doorway');}});
