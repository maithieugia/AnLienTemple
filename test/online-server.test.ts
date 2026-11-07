import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,type ChildProcess} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';
import {INCENSE_SITES,cleanDisplayName,checkUsername} from '../src/online/protocol.ts';

const PORT=18930+Math.floor(Math.random()*500),BASE=`http://127.0.0.1:${PORT}`;
let proc:ChildProcess,dir:string;
before(async()=>{
 dir=fs.mkdtempSync(path.join(os.tmpdir(),'anlien-'));
 proc=spawn(process.execPath,['server/server.ts'],{env:{...process.env,PORT:String(PORT),DATA_DIR:dir,STATIC_DIR:dir},stdio:['ignore','pipe','pipe']});
 await new Promise<void>((ok,bad)=>{const t=setTimeout(()=>bad(new Error('server did not start')),8000);proc.stdout!.on('data',(d:Buffer)=>{if(String(d).includes('online:')){clearTimeout(t);ok();}});proc.stderr!.on('data',(d:Buffer)=>{if(/Error/.test(String(d)))console.error(String(d));});});
});
after(()=>{proc?.kill();try{fs.rmSync(dir,{recursive:true,force:true});}catch{}});

const post=async(p:string,body:unknown,cookie='')=>{const r=await fetch(BASE+p,{method:'POST',headers:{'content-type':'application/json',cookie},body:JSON.stringify(body)});return{status:r.status,body:await r.json() as any,cookie:(r.headers.get('set-cookie')??'').split(';')[0]};};
const connect=(cookie:string)=>new Promise<{ws:WebSocket;msgs:any[];wait:(f:(m:any)=>boolean,ms?:number)=>Promise<any>}>((ok,bad)=>{
 const ws=new WebSocket(`ws://127.0.0.1:${PORT}/ws`,{headers:{cookie}}),msgs:any[]=[],waiters:{f:(m:any)=>boolean;ok:(m:any)=>void}[]=[];
 ws.on('message',d=>{const m=JSON.parse(String(d));msgs.push(m);for(const w of [...waiters])if(w.f(m)){waiters.splice(waiters.indexOf(w),1);w.ok(m);}});
 ws.on('open',()=>ok({ws,msgs,wait:(f,ms=4000)=>new Promise((res,rej)=>{const hit=msgs.find(f);if(hit)return res(hit);const t=setTimeout(()=>rej(new Error('timeout')),ms);waiters.push({f,ok:m=>{clearTimeout(t);res(m);}});})}));ws.on('error',bad);
});

test('name and username rules keep tags clean',()=>{
 assert.equal(cleanDisplayName('  Nguyễn   Văn An '),'Nguyễn Văn An');assert.equal(cleanDisplayName('a'),null);assert.equal(cleanDisplayName('<b>x</b>'),null);assert.equal(cleanDisplayName('đéo biết'),null);
 assert.equal(checkUsername('thanh_01'),null);assert.ok(checkUsername('Thanh 01'));
 assert.ok(INCENSE_SITES.length>=12);assert.equal(new Set(INCENSE_SITES.map(s=>s.id)).size,INCENSE_SITES.length);
});
test('accounts: register, duplicate, login, me, wrong password',async()=>{
 const r=await post('/api/register',{username:'phattu_a',password:'nammo123',displayName:'Phật tử An',female:false});
 assert.equal(r.status,201);assert.equal(r.body.name,'Phật tử An');assert.match(r.cookie,/^al_sid=/);
 assert.equal((await post('/api/register',{username:'phattu_a',password:'nammo123',displayName:'Khác'})).status,409);
 assert.equal((await post('/api/login',{username:'phattu_a',password:'sai-mat-khau'})).status,401);
 const l=await post('/api/login',{username:'PHATTU_A',password:'nammo123'});assert.equal(l.status,200);
 const me=await fetch(BASE+'/api/me',{headers:{cookie:l.cookie}});assert.equal(me.status,200);assert.equal((await me.json() as any).username,'phattu_a');
 assert.equal((await fetch(BASE+'/api/me')).status,401);
});
test('two pilgrims see each other, incense needs the altar, merit is saved',async()=>{
 const a=await post('/api/register',{username:'phattu_b',password:'nammo123',displayName:'Diệu Hạnh',female:true});
 const b=await post('/api/register',{username:'phattu_c',password:'nammo123',displayName:'Minh Tâm'});
 const A=await connect(a.cookie),B=await connect(b.cookie);
 const wa=await A.wait(m=>m.t==='welcome');assert.equal(wa.you.name,'Diệu Hạnh');assert.equal(wa.you.female,true);
 await A.wait(m=>m.t==='join'&&m.p.name==='Minh Tâm');
 B.ws.send(JSON.stringify({t:'state',x:0,y:0,z:546,yaw:0,a:1}));
 const snap=await A.wait(m=>m.t==='snap'&&m.r.some((r:number[])=>r[0]===b.body.id&&r[3]===546));assert.ok(snap);
 // too far from any altar
 A.ws.send(JSON.stringify({t:'incense',site:'amitabha'}));await A.wait(m=>m.t==='notice'&&/gần bàn hương/.test(m.text));
 // walk to the Amitabha altar in legal steps
 const site=INCENSE_SITES.find(s=>s.id==='amitabha')!;let z=548;while(z>site.z+1.6){z=Math.max(site.z+1.6,z-0.6);A.ws.send(JSON.stringify({t:'state',x:0,y:0,z,yaw:Math.PI,a:1}));await new Promise(r=>setTimeout(r,110));}
 A.ws.send(JSON.stringify({t:'incense',site:'amitabha'}));
 const stick=await B.wait(m=>m.t==='sticks'&&m.add?.[0]?.by==='Diệu Hạnh');assert.equal(stick.add[0].site,'amitabha');
 const merit=await A.wait(m=>m.t==='merit');assert.equal(merit.m.incense,1);
 // nobody is pulled back: an off-world position is only clamped to the edge, and others see the clamped spot
 B.ws.send(JSON.stringify({t:'state',x:550,y:0,z:300,yaw:0,a:0}));await new Promise(r=>setTimeout(r,150));
 A.ws.send(JSON.stringify({t:'state',x:5000,y:0,z:300,yaw:0,a:1}));await B.wait(m=>m.t==='snap'&&m.r.some((r:number[])=>r[0]===a.body.id&&r[1]===560));assert.ok(!A.msgs.some(m=>m.t==='pos'));
 A.ws.close();await B.wait(m=>m.t==='leave'&&m.id===a.body.id);B.ws.close();
 const me=await fetch(BASE+'/api/me',{headers:{cookie:a.cookie}});assert.equal((await me.json() as any).merit.incense,1);
});
test('a second login kicks the first connection',async()=>{
 const a=await post('/api/login',{username:'phattu_c',password:'nammo123'});const A1=await connect(a.cookie);await A1.wait(m=>m.t==='welcome');
 const A2=await connect(a.cookie);await A2.wait(m=>m.t==='welcome');await A1.wait(m=>m.t==='kick');A2.ws.close();
});
test('a pilgrim can walk out of the side gate to the stupa and up it without being pulled back',async()=>{
 const a=await post('/api/register',{username:'phattu_thap',password:'nammo123',displayName:'Leo Tháp'});const A=await connect(a.cookie);await A.wait(m=>m.t==='welcome');
 const route:[number,number,number][]=[[0,0,598],[360,0,548],[360,0,30],[480,0,30],[480,0,20],[480,120,20],[480,170,20]];
 let [x,y,z]=route[0];
 for(const [tx,ty,tz] of route.slice(1)){while(Math.hypot(tx-x,tz-z)>.01||Math.abs(ty-y)>.01){const d=Math.hypot(tx-x,tz-z),k=Math.min(1,3/Math.max(d,1e-9));x+=(tx-x)*k;z+=(tz-z)*k;y+=Math.max(-3,Math.min(3,ty-y));A.ws.send(JSON.stringify({t:'state',x,y,z,yaw:0,a:2}));await new Promise(r=>setTimeout(r,110));}}
 await new Promise(r=>setTimeout(r,300));
 const pulled=A.msgs.filter(m=>m.t==='pos');assert.equal(pulled.length,0,'pulled back at '+JSON.stringify(pulled[0]));A.ws.close();
});
test('a reconnect keeps the pilgrim where they were; only a fresh visit starts at the gate',async()=>{
 const a=await post('/api/register',{username:'phattu_mang',password:'nammo123',displayName:'Rớt Mạng'}),b=await post('/api/register',{username:'phattu_xem',password:'nammo123',displayName:'Người Xem'});
 const B=await connect(b.cookie);await B.wait(m=>m.t==='welcome');B.ws.send(JSON.stringify({t:'state',x:10,y:0,z:305,yaw:0,a:0}));
 const A1=await connect(a.cookie);const w=await A1.wait(m=>m.t==='welcome');assert.ok(w.spawn.z>590,'fresh visit: outside the tam quan gate');
 A1.ws.send(JSON.stringify({t:'state',x:12,y:0,z:300,yaw:0,a:0}));await B.wait(m=>m.t==='snap'&&m.r.some((r:number[])=>r[0]===a.body.id&&r[3]===300));A1.ws.close();
 const A2=await connect(a.cookie);await A2.wait(m=>m.t==='welcome');A2.ws.send(JSON.stringify({t:'state',x:12,y:0,z:300.5,yaw:0,a:0}));
 await B.wait(m=>m.t==='snap'&&m.r.some((r:number[])=>r[0]===a.body.id&&r[3]===300.5));assert.ok(!A2.msgs.some(m=>m.t==='pos'));A2.ws.close();B.ws.close();
});
test('the great courtyard censer is an incense site reached from the courtyard in front of it',async()=>{const {nearIncense,INCENSE_SITES}=await import('../src/online/protocol.ts');const {COURTYARD_CENSER:C}=await import('../src/game/world/SanctuaryPlan.ts');
 const site=INCENSE_SITES.find(s=>s.id==='courtyard-censer')!;assert.ok(site.bowl);assert.equal(site.floor,0);assert.equal(nearIncense({x:C.x,y:0,z:C.z+1.6})?.id,'courtyard-censer');assert.equal(nearIncense({x:C.x,y:0,z:C.z+12}),null);});
test('outfits: women default to an áo dài, choices are saved, broadcast to others and checked',async()=>{const {cleanOutfit}=await import('../src/online/protocol.ts');
 assert.match(cleanOutfit(undefined,true,7),/^aodai-\d\d$/);assert.equal(cleanOutfit('aodai-03',false,1),'nam-01');assert.equal(cleanOutfit(undefined,false,5),'nam-01');assert.equal(cleanOutfit('aolam',false,5),'nam-01');assert.equal(cleanOutfit('thuong',false,5),'nam-01');assert.equal(cleanOutfit('nam-01-reu',false,5),'nam-01-reu');assert.equal(cleanOutfit('nam-01-reu',true,0),'aodai-01');assert.equal(cleanOutfit('aolam',true,0),'aodai-01');assert.equal(cleanOutfit('evil',true,0),'aodai-01');assert.equal(cleanOutfit('thuong',true,0),'thuong');
 const a=await post('/api/register',{username:'phattu_aodai',password:'nammo123',displayName:'Áo Dài',female:true}),b=await post('/api/register',{username:'phattu_nhin',password:'nammo123',displayName:'Người Nhìn'});
 assert.match(a.body.outfit,/^aodai-/);const A=await connect(a.cookie),B=await connect(b.cookie);await A.wait(m=>m.t==='welcome');await B.wait(m=>m.t==='welcome');
 A.ws.send(JSON.stringify({t:'outfit',outfit:'aodai-07'}));const seen=await B.wait(m=>m.t==='outfit'&&m.id===a.body.id);assert.equal(seen.outfit,'aodai-07');
 B.ws.send(JSON.stringify({t:'outfit',outfit:'aodai-02'}));const male=await A.wait(m=>m.t==='outfit'&&m.id===b.body.id);assert.equal(male.outfit,'nam-01','men cannot pick an áo dài (they are Nam 01)');
 A.ws.close();B.ws.close();const me=await fetch(BASE+'/api/me',{headers:{cookie:a.cookie}});assert.equal((await me.json() as any).outfit,'aodai-07');
});

test('prayers: short, clean, shown to everyone and kept on the account',async()=>{const {cleanPrayer,PRAYER_MAX}=await import('../src/online/protocol.ts');
 assert.equal(cleanPrayer('  Cầu   cho gia đình bình an '),'Cầu cho gia đình bình an');assert.equal(cleanPrayer(''),'');assert.equal(cleanPrayer('x'.repeat(PRAYER_MAX+1)),null);assert.equal(cleanPrayer('<b>hi</b>'),null);assert.equal(cleanPrayer('đụ má'),null);assert.equal(PRAYER_MAX,40);
});
