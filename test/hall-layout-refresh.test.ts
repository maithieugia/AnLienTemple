import test from 'node:test';import assert from 'node:assert/strict';
import {OWNER_STATUES,FOUR_KINGS,UPPER_STATUES,UPPER_PLINTHS}from '../src/game/world/StatueGardenPlan.ts';
import {OWNER_COLLECTION}from '../src/game/world/OwnerCollectionPlan.ts';
import {SANCTUARY_STATUES,sanctuaryPlinthEnabled,SANCTUARY_LEVELS}from '../src/game/world/SanctuaryPlan.ts';
test('owner P1-P6 and four kings display the requested names without replacing their models',()=>{
 assert.deepEqual(OWNER_STATUES.slice(0,6).map(s=>s.name),['Phật A Di Đà','Phật Thích Ca Mâu Ni','Phật Dược Sư','Phật Tỳ Lô Giá Na','Phật Đại Nhật Như Lai','Phật A Súc Bệ']);
 assert.equal(new Set(FOUR_KINGS.map(s=>s.name)).size,4);assert.ok(FOUR_KINGS.every(s=>s.name.endsWith('Thiên Vương')));
 const s=OWNER_COLLECTION.find(s=>s.id==='new-19')!;assert.equal(s.name,'Thiên Thủ Thiên Nhãn Đại Bi Quán Âm');assert.equal(s.height,60);assert.ok(Math.abs(s.width/s.height-6.722781012459809/10)<1e-9);
});
test('four empty hall pedestals disappear while all installed models retain support',()=>{
 const removed=SANCTUARY_STATUES.filter(s=>!sanctuaryPlinthEnabled(s));assert.equal(removed.length,4);
 for(const o of OWNER_COLLECTION.filter(o=>o.slot&&o.slot!=='rear-centre'))assert.ok(sanctuaryPlinthEnabled(SANCTUARY_STATUES.find(s=>s.id===o.slot)!));
});
test('six relocated statues are on the existing veranda floor and clear both wall and railing',()=>{
 assert.equal(UPPER_STATUES.length,6);for(const s of UPPER_STATUES){const p=UPPER_PLINTHS[s.id];assert.equal(s.base,SANCTUARY_LEVELS.floor+p.h);assert.ok(Math.abs(s.x)-p.r>300);assert.ok(Math.abs(s.x)+p.r<336);}
});
