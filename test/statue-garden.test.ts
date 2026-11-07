import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {GARDEN_STATUES,AMITABHA_PLAZA as AP,STATUE_GALLERY as G,FLANK_PLAZA as FP,statueGardenReserved,gardenLod,galleryBayZ,EAST_ALTAR_BAY} from '../src/game/world/StatueGardenPlan.ts';
import {PRAYER_WHEEL as PW,PRAYER_WHEEL_SITES} from '../src/game/world/PrayerWheelPlan.ts';
import {SANCTUARY_COURT,SANCTUARY_BODHI,SANCTUARY_GATE,SANCTUARY} from '../src/game/world/SanctuaryPlan.ts';
import {gardenTreePositions} from '../src/game/world/GardenTreePlan.ts';

const LIB='public/assets/sanctuary/library';
const chosen=JSON.parse(readFileSync('../../assets-src/buddha-library/danh_sach_30_mau.json','utf8')) as {file:string}[];

test('every owner-chosen statue is placed once, except the hill-terrain scan 059',()=>{
 const ids=GARDEN_STATUES.map(s=>s.id),lib=chosen.map(c=>c.file.slice(7,10));
 assert.equal(new Set(ids).size,ids.length);assert.equal(ids.length,29);
 assert.deepEqual([...lib].filter(id=>!ids.includes(id)),['059']);assert.ok(ids.every(id=>lib.includes(id)));
});
test('axis reads gate → Di Lặc → Amitabha → hall, Amitabha centred between the two prayer wheels',()=>{
 const [w,e]=PRAYER_WHEEL_SITES,ami=GARDEN_STATUES.find(s=>s.id==='019')!,mai=GARDEN_STATUES.find(s=>s.id==='056')!;
 assert.equal(ami.x,0);assert.equal(ami.z,w.z);assert.equal(w.x,-e.x);assert.ok(Math.abs(w.x)-PW.plinthRadius>AP.r+50);
 assert.ok(mai.z>ami.z&&mai.z<SANCTUARY_GATE.z-SANCTUARY.z);assert.ok(ami.z>SANCTUARY_COURT.z0&&ami.z<SANCTUARY_COURT.z1);
 assert.ok(GARDEN_STATUES.filter(s=>s.group!=='west'&&s.group!=='east').every(s=>s.yaw===0||Math.abs(s.yaw)<.4),'axis/flank statues face the gate');
});
test('Quan Âm and Địa Tạng mirror each other and stay clear of the Bodhi tree',()=>{
 const f=GARDEN_STATUES.filter(s=>s.group==='flank');assert.equal(f.length,2);assert.equal(f[0].x,-f[1].x);assert.equal(f[0].yaw,-f[1].yaw);
 assert.ok(Math.hypot(-FP.x-SANCTUARY_BODHI.x,FP.z-SANCTUARY_BODHI.z)>45);
});
test('galleries: one statue per bay, facing the courtyard, inside the campus wall',()=>{
 for(const side of ['west','east']as const){const g=GARDEN_STATUES.filter(s=>s.group===side);assert.equal(g.length,side==='west'?13:12);
  for(const s of g){assert.equal(Math.abs(s.x),G.line);assert.ok(Math.abs(s.x)+2.2<395);assert.ok(s.z>G.z0&&s.z<G.z1);assert.equal(Math.sign(Math.sin(s.yaw)),-Math.sign(s.x),'faces the courtyard');assert.ok(s.base+s.height<G.ridge-1.5,'fits under the roof');}
  assert.equal(new Set(g.map(s=>s.z.toFixed(2))).size,g.length);}
 assert.ok(!GARDEN_STATUES.some(s=>s.group==='east'&&Math.abs(s.z-galleryBayZ(EAST_ALTAR_BAY))<1),'altar bay left free');
});
test('statue garden never overlaps prayer wheel plinths and keeps trees off reserved ground',()=>{
 for(const w of PRAYER_WHEEL_SITES)for(let a=0;a<64;a++){const x=w.x+Math.cos(a/64*Math.PI*2)*(PW.plinthRadius+1),z=w.z+Math.sin(a/64*Math.PI*2)*(PW.plinthRadius+1);assert.ok(!statueGardenReserved(x,z),`wheel ${w.id}`);}
 assert.ok(gardenTreePositions().every(t=>!statueGardenReserved(t.x,t.z,5)));assert.ok(gardenTreePositions().length>=30,'garden still planted');
});
test('detail level follows distance measured in statue heights',()=>{
 assert.equal(gardenLod(20,5.6,false),'high');assert.equal(gardenLod(100,5.6,false),'low');assert.equal(gardenLod(300,5.6,false),'far');
 assert.equal(gardenLod(100,20,false),'high');assert.equal(gardenLod(100,20,true),'low');
});
test('each placed statue ships three LOD GLBs within triangle budget, with attribution',()=>{
 for(const s of GARDEN_STATUES){const a=JSON.parse(readFileSync(`${LIB}/${s.id}/asset.json`,'utf8'));
  for(const lod of ['high','low','far'])assert.ok(existsSync(`${LIB}/${s.id}/${lod}.glb`),`${s.id} ${lod}`);
  assert.ok(a.triangles.high<=61000&&a.triangles.low<=15500&&a.triangles.far<=10000,s.id);assert.ok(a.author&&a.license&&a.source,s.id);}
 const credits=readFileSync(`${LIB}/CREDITS.md`,'utf8');for(const s of GARDEN_STATUES)assert.ok(credits.includes(s.id),`credit ${s.id}`);
});
import {GUARDIAN_STATUES,GUARDIAN_AVENUE as GA,GUARDIANS,MAITREYA_PLAZA as MP,INCLUDE_NC_GUARDIANS} from '../src/game/world/StatueGardenPlan.ts';
test('guardian avenue: 19 figures mirrored in two rows facing the central path',()=>{
 if(!INCLUDE_NC_GUARDIANS)return;
 assert.equal(GUARDIANS.length,19);assert.equal(GUARDIAN_STATUES.length,38);
 const w=GUARDIAN_STATUES.filter(s=>s.x<0),e=GUARDIAN_STATUES.filter(s=>s.x>0);
 w.forEach((s,i)=>{const t=e[i];assert.equal(s.asset,t.asset);assert.equal(s.z,t.z);assert.equal(s.x,-t.x);assert.ok(Math.abs(s.yaw+t.yaw)<1e-10);});
 for(const s of GUARDIAN_STATUES){assert.equal(Math.sign(Math.sin(s.yaw)),-Math.sign(s.x),'faces the path');
  assert.ok(Math.abs(s.x)-GA.half>12,'clear of the 24 m central path');
  assert.ok(Math.hypot(s.x-MP.x,s.z-MP.z)-GA.half*1.42>MP.r,'clear of the Maitreya plaza');
  assert.ok(Math.hypot(s.x-AP.x,s.z-AP.z)-GA.half*1.42>AP.r,'clear of the Amitabha plaza');
  assert.ok(s.z<565-8&&s.z>AP.z+AP.r,'between the gate and the Amitabha plaza');assert.ok(statueGardenReserved(s.x,s.z));}
 assert.equal(w[0].asset,'guardians/01','No.1 stands nearest the gate');
});
test('guardian models ship three LODs and keep their NC-ND attribution',()=>{
 if(!INCLUDE_NC_GUARDIANS||!existsSync('public/assets/sanctuary/guardians'))return;
 for(const [no] of GUARDIANS){const d=`public/assets/sanctuary/guardians/${no}`;for(const lod of ['high','low','far'])assert.ok(existsSync(`${d}/${lod}.glb`),`${no} ${lod}`);
  const a=JSON.parse(readFileSync(`${d}/asset.json`,'utf8'));assert.match(a.license,/NonCommercial-NoDerivs/);assert.ok(a.author&&a.source);assert.ok(a.triangles.high<=61000&&a.triangles.low<=15500&&a.triangles.far<=10000,no);}
 assert.match(readFileSync('public/assets/sanctuary/guardians/CREDITS.md','utf8'),/BY-NC-ND/);
});
import {BODHI_STATUE,BODHI_SHRINE} from '../src/game/world/StatueGardenPlan.ts';
test('meditating Buddha sits among the Bodhi roots, facing the entrance, credited',()=>{
 assert.deepEqual(BODHI_SHRINE.tree,{x:SANCTUARY_BODHI.x,z:SANCTUARY_BODHI.z});
 const d=Math.hypot(BODHI_STATUE.x-SANCTUARY_BODHI.x,BODHI_STATUE.z-SANCTUARY_BODHI.z);assert.ok(d>2.3+BODHI_SHRINE.r&&d<12,'just outside the trunk, under the canopy');
 assert.equal(BODHI_STATUE.yaw,0);assert.ok(!gardenTreePositions().some(t=>Math.hypot(t.x-BODHI_STATUE.x,t.z-BODHI_STATUE.z)<8));
 for(const lod of ['high','low','far'])assert.ok(existsSync(`${LIB}/bodhi/${lod}.glb`));
 assert.match(readFileSync(`${LIB}/bodhi/asset.json`,'utf8'),/restore50/);assert.match(readFileSync(`${LIB}/CREDITS.md`,'utf8'),/restore50/);
});
import {UPPER_STATUES,UPPER_PLINTHS,UPPER_FLOOR} from '../src/game/world/StatueGardenPlan.ts';
import {SANCTUARY_LEVELS,SANCTUARY_ATRIUM as AT,giantColumnPositions} from '../src/game/world/SanctuaryPlan.ts';
test('six former upstairs statues stand on the two existing side verandas',()=>{
 assert.equal(UPPER_FLOOR,SANCTUARY_LEVELS.floor);assert.equal(UPPER_STATUES.length,6);
 const c=UPPER_STATUES.find(s=>s.id==='d04')!,f=UPPER_STATUES.find(s=>s.id==='d06')!;
 assert.equal(c.x,-310);assert.equal(f.x,310);assert.equal(f.z,c.z);assert.ok(c.base+c.height>f.base+f.height+8,'main Buddha highest');
 for(const [a,b] of [['d01','d02'],['d09','d05']]){const s=UPPER_STATUES.find(x=>x.id===a)!,t=UPPER_STATUES.find(x=>x.id===b)!;assert.equal(s.x,-t.x);assert.equal(s.z,t.z);assert.ok(Math.abs(s.yaw+t.yaw)<1e-10);}
 for(const s of UPPER_STATUES){const p=UPPER_PLINTHS[s.id];assert.ok(Math.abs(s.x)-p.r>300&&Math.abs(s.x)+p.r<336&&s.z-p.r>-200,'between hall wall and veranda rail');assert.ok(s.base+s.height<SANCTUARY_LEVELS.eaves-2,'under the upper ceiling');
  assert.ok(s.x+p.r<AT.x0||s.x-p.r>AT.x1,'upper statues stand on solid side galleries, not over the void');
  for(const col of giantColumnPositions())assert.ok(Math.hypot(col.x-s.x,col.z-s.z)>p.r+1);
  for(const lod of ['high','low','far'])assert.ok(existsSync(`public/assets/sanctuary/diana/${s.id.slice(1)}/${lod}.glb`),s.id+lod);}
});
