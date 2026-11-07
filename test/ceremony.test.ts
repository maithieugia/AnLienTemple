import {HALL_RITUAL_SHIFT as S} from '../src/game/world/SanctuaryPlan.ts';
import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {CEREMONY_MONKS,processionPoint,PROCESSION_ROUTE as P,PROCESSION_LENGTH,WORSHIP_PITCH} from '../src/game/chars/CeremonyPlan.ts';
test('50 bowing monks in five rows of ten with cushion-matched 2m spacing and central access',()=>{
 const monks=CEREMONY_MONKS.filter(m=>m.act==='bow');assert.equal(monks.length,50);assert.equal(new Set(CEREMONY_MONKS.map(m=>m.id)).size,72);assert.equal(WORSHIP_PITCH,2); const seated=CEREMONY_MONKS.filter(m=>m.act==='meditate'&&m.x>0).sort((a,b)=>a.x-b.x); assert.equal(seated[1].x-seated[0].x,WORSHIP_PITCH);
 const rows=new Map<number,number>();for(const m of monks){rows.set(m.z,(rows.get(m.z)??0)+1);assert.ok(Math.abs(m.x)>=2);}assert.equal(rows.size,5);for(const n of rows.values())assert.equal(n,10);
 for(let i=0;i<monks.length;i++)for(let j=i+1;j<monks.length;j++)assert.ok(Math.hypot(monks[i].x-monks[j].x,monks[i].z-monks[j].z)>=WORSHIP_PITCH-1e-9);
});
test('10 procession monks follow individual continuous loops without stopping or bunching',()=>{
 const walking=CEREMONY_MONKS.filter(m=>m.act==='procession');assert.equal(walking.length,10);
 for(const side of [-1,1])assert.equal(walking.filter(m=>Math.sign(m.x)===side).length,5);
 for(let t=0;t<PROCESSION_LENGTH/P.speed*2;t+=.2)for(const side of [-1,1]){
  const points=Array.from({length:10},(_,rank)=>processionPoint(t,side,rank));
  for(let i=0;i<10;i++){
   const a=points[i],b=processionPoint(t+.01,side,i),speed=Math.hypot(b.x-a.x,b.z-a.z)/.01;
   assert.ok(Math.abs(speed-P.speed)<.00001,`stopped or jumped at ${t}`);
   assert.ok(Math.abs(a.x)>=P.inner-1e-9&&Math.abs(a.x)<=P.inner+P.laneGap+1e-9);
   assert.ok(a.z>=P.front-1-1e-9&&a.z<=P.back+1+1e-9);
   assert.ok(Math.sin(a.yaw)*(b.x-a.x)+Math.cos(a.yaw)*(b.z-a.z)>0);
   for(let j=0;j<i;j++)assert.ok(Math.hypot(a.x-points[j].x,a.z-points[j].z)>1.65);
  }
 }
});
test('turns reach both ends, shift to a parallel return lane and close with matching headings',()=>{
 const run=P.back-P.front,at=(d:number)=>processionPoint(d/P.speed,1,0);
 assert.equal(at(0).x,P.inner);assert.equal(at(0).z,P.front);
 assert.ok(Math.abs(at(run+Math.PI).x-(P.inner+2))<1e-9);
 assert.ok(Math.abs(at(run+Math.PI).z-P.back)<1e-9);
 const a=at(0),b=at(PROCESSION_LENGTH);
 assert.ok(Math.hypot(a.x-b.x,a.z-b.z)<1e-9);
 for(const d of [0,run,run+Math.PI,2*run+Math.PI]){
  const before=at(d-.0001),after=at(d+.0001);
  assert.ok(Math.hypot(before.x-after.x,before.z-after.z)<.00021);
  assert.ok(Math.cos(before.yaw-after.yaw)>.99999);
 }
 assert.notEqual(Math.cos(processionPoint(run/P.speed,1,0).yaw)>0,Math.cos(processionPoint(run/P.speed,1,9).yaw)>0);
});
