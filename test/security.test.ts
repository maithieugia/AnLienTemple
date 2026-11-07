// Abuse protection against a real server on a scratch data folder (server/guard.ts wired into server/server.ts).
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {WebSocket} from 'ws';

const ROOT=path.resolve(import.meta.dirname,'..');
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));

test('brute force, sign-up floods, connection floods and the lockdown switch are stopped',async()=>{
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'al-sec-')),port=19600+Math.floor(Math.random()*300),base=`http://127.0.0.1:${port}`;
 const srv=spawn(process.execPath,['server/server.ts'],{cwd:ROOT,env:{...process.env,PORT:String(port),DATA_DIR:data,STATIC_DIR:path.join(ROOT,'dist-public')},stdio:'pipe'});
 try{
  for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}await sleep(150);}
  const post=(p:string,body:object,ip:string,xff?:string)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json','cf-connecting-ip':ip,...(xff?{'x-forwarded-for':xff}:{})},body:JSON.stringify(body)});
  // sign-ups: 5 a minute per address
  const codes:number[]=[];for(let i=0;i<7;i++)codes.push((await post('/api/register',{username:'tn_sec_'+i,password:'secret123',displayName:'Thử '+i},'10.0.0.1')).status);
  assert.deepEqual(codes.slice(0,5),[201,201,201,201,201]);assert.equal(codes[5],429);
  const cookie=(await post('/api/login',{username:'tn_sec_0',password:'secret123'},'10.0.0.2')).headers.get('set-cookie')!.split(';')[0];
  // password guessing on one account from many addresses: locked after 8 failures, even the right password waits
  for(let i=0;i<8;i++)assert.equal((await post('/api/login',{username:'tn_sec_1',password:'wrong'+i},'10.1.0.'+i)).status,401);
  const locked=await post('/api/login',{username:'tn_sec_1',password:'secret123'},'10.1.0.99');assert.equal(locked.status,429);assert.match((await locked.json()).error,/sai quá nhiều lần/);
  // other accounts are not affected
  assert.equal((await post('/api/login',{username:'tn_sec_2',password:'secret123'},'10.1.0.50')).status,200);
  // a spoofed X-Forwarded-For first entry does not dodge the per-address limit (only Caddy's last entry counts)
  const xs:number[]=[];for(let i=0;i<16;i++)xs.push((await fetch(base+'/api/login',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':`9.9.9.${i}, 10.2.0.1`},body:JSON.stringify({username:'nobody',password:'x'})})).status);
  assert.ok(xs.includes(429),'per-address login limit applies: '+xs.join(','));
  // API flood from one address
  let hit=0;for(let i=0;i<80;i++){const r=await fetch(base+'/api/me',{headers:{'cf-connecting-ip':'10.3.0.1'}});if(r.status===429)hit++;}assert.ok(hit>0,'API flood is throttled');
  // websocket floods: at most 8 live connections per address
  const open=(ip:string,ck=cookie)=>new Promise<number>(r=>{const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`,{headers:{cookie:ck,'cf-connecting-ip':ip}});ws.on('open',()=>r(200));ws.on('unexpected-response',(_q,res)=>r(res.statusCode??0));ws.on('error',()=>r(0));socks.push(ws);});
  const cookies:string[]=[];for(let i=0;i<10;i++){const r=await post('/api/register',{username:'tn_secw_'+i,password:'secret123',displayName:'Thử w'+i},'10.7.0.'+i);cookies.push(r.headers.get('set-cookie')!.split(';')[0]);}
  const socks:WebSocket[]=[];const res:number[]=[];for(let i=0;i<10;i++)res.push(await open('10.4.0.1',cookies[i]));
  assert.equal(res.filter(x=>x===200).length,8,'8 connections per address: '+res.join(','));assert.equal(res[9],429);
  socks.forEach(s=>s.close());await sleep(300);
  // lockdown switch: closes sign-ups and the temple door without a restart, then lifts
  fs.writeFileSync(path.join(data,'lockdown.json'),JSON.stringify({register:false,join:false,message:'Chùa tạm khoá cửa'}));await sleep(3500);
  const r1=await post('/api/register',{username:'tn_sec_x',password:'secret123',displayName:'Thử x'},'10.5.0.1');assert.equal(r1.status,503);assert.equal((await r1.json()).error,'Chùa tạm khoá cửa');
  assert.equal(await open('10.5.0.2'),503);
  fs.rmSync(path.join(data,'lockdown.json'));await sleep(3500);
  assert.equal((await post('/api/register',{username:'tn_sec_y',password:'secret123',displayName:'Thử y'},'10.5.0.3')).status,201);
  assert.equal(await open('10.5.0.4'),200);socks.forEach(s=>s.close());
  // the game keeps answering while logins are hashed on the side
  const t0=Date.now();await Promise.all(Array.from({length:12},(_,i)=>post('/api/login',{username:'tn_sec_3',password:'secret123'},'10.6.0.'+i)));
  const h=Date.now();await fetch(base+'/api/health');assert.ok(Date.now()-h<200,'health stays fast during a login burst');void t0;
 }finally{srv.kill();await sleep(300);fs.rmSync(data,{recursive:true,force:true});}
});
