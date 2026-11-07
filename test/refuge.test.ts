import {REFUGE_WORDS,REFUGE_NAMES} from '../server/refuge-names.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {actCode,type ServerMsg} from '../src/online/protocol.ts';
import {createRefuge} from '../server/refuge.ts';
import {REFUGE_STEPS,REFUGE_STATION} from '../src/online/RefugePlan.ts';
import {certificateSvg} from '../src/online/RefugeCertificate.ts';

test('rank updates when a pilgrim overtakes the leader and only returns three',async()=>{
 const db=database(), updates:ServerMsg[]=[];
 const refuge=createRefuge(db,m=>updates.push(m));
 assert.deepEqual(refuge.leaders().map(r=>r.id),[1,2,3]);
 db.exec('UPDATE merit SET steps=1400 WHERE user_id=4');
 refuge.changed();refuge.changed();
 await new Promise(resolve=>setTimeout(resolve,450));
 assert.deepEqual(JSON.parse(JSON.stringify(updates)),[{t:'meritRank',rows:[{id:4,name:'Từ Tâm',score:1400},{id:1,name:'Minh An',score:1000},{id:2,name:'Diệu Hạnh',score:999}]}]);
 db.close();
});

test('refuge checks merit, location, kneeling, timed rounds and durable single issue',()=>{
 const db=database();let clock=100;
 const refuge=createRefuge(db,()=>{},()=>clock);
 const p={info:{id:1,name:'Minh An'},x:0,y:0,z:705,a:actCode('idle'),merit:{wheel:999,incense:0,bows:0,sits:0}};
 const start=(fullName='Nguyễn Minh An',gender:'male'|'female'='female')=>refuge.handle(p,{t:'refuge',op:'start',fullName,gender});
 const read=(round:number)=>refuge.handle(p,{t:'refuge',op:'read',round});
 assert.equal(start().phase,'idle');
 p.merit.wheel=1000;assert.equal(start().phase,'idle');
 Object.assign(p,REFUGE_STATION);assert.equal(start().phase,'idle');
 p.a=actCode('kneel');assert.equal(start('<script>').phase,'name');
 assert.equal(read(0).phase,'idle');
 assert.equal(start().phase,'reading');
 p.a=actCode('idle');assert.equal(refuge.positionChanged(p)?.phase,'idle');
 p.a=actCode('kneel');assert.equal(start().phase,'reading');
 assert.equal(start('Tên Khác','male').phase,'reading');
 const early=read(0);assert.ok(early.phase==='reading'&&early.round===0);
 assert.equal(refuge.certificate(1),null);
 for(const [round,step] of REFUGE_STEPS.entries()){
  clock+=step.seconds*1000;
  const m=read(round);
  if(round===REFUGE_STEPS.length-1)assert.equal(m.phase,'complete');
  else {assert.ok(m.phase==='reading');assert.equal(m.round,round+1);}
 }
 const saved=refuge.certificate(1)!;
 assert.equal(saved.name,'Nguyễn Minh An');
 assert.ok(REFUGE_NAMES.female.includes(saved.dharmaName));
 assert.equal(start('Tên Khác').phase,'complete');
 assert.deepEqual(createRefuge(db,()=>{}).certificate(1),saved);
 assert.match(certificateSvg({...saved,name:'<x>'},'data:image/png;base64,TEST'),/&lt;x&gt;/);
 db.close();
});

test('all 400 curated word slots are usable and gender pools do not overlap',()=>{
 for(const gender of ['male','female'] as const){
  const names=REFUGE_NAMES[gender],words=REFUGE_WORDS[gender];
  assert.equal(new Set(names).size,names.length);
  assert.equal(new Set(words.first).size,100);
  assert.equal(new Set(words.last).size,100);
  assert.ok(names.every(n=>{const [a,b,extra]=n.split(' ');return !extra&&a!==b&&words.first.includes(a)&&words.last.includes(b);}));
  assert.equal(new Set(names.map(n=>n.split(' ')[0])).size,100);
  assert.equal(new Set(names.map(n=>n.split(' ')[1])).size,100);
 }
 assert.ok(REFUGE_NAMES.female.every(n=>!REFUGE_NAMES.male.includes(n)));
});

function database(){
 const db=new DatabaseSync(':memory:');
 db.exec(`CREATE TABLE users(id INTEGER PRIMARY KEY,display TEXT NOT NULL);
 CREATE TABLE merit(user_id INTEGER PRIMARY KEY,wheel INTEGER,incense INTEGER,bows INTEGER,sits INTEGER,steps INTEGER);
 INSERT INTO users VALUES (1,'Minh An'),(2,'Diệu Hạnh'),(3,'Hải Đăng'),(4,'Từ Tâm');
 INSERT INTO merit VALUES (1,1000,0,0,0,0),(2,999,0,0,0,0),(3,999,0,0,0,0),(4,0,0,0,0,0);`);
 return db;
}
