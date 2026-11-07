// Friends, chat and call signalling between two pilgrims, against a real server on a scratch data folder.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {WebSocket} from 'ws';

const ROOT=path.resolve(import.meta.dirname,'..');
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));

test('pilgrims befriend, chat and call each other; strangers cannot',async()=>{
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'al-social-')),port=19000+Math.floor(Math.random()*500),base=`http://127.0.0.1:${port}`;
 const srv=spawn(process.execPath,['server/server.ts'],{cwd:ROOT,env:{...process.env,PORT:String(port),DATA_DIR:data,STATIC_DIR:path.join(ROOT,'dist-public')},stdio:'pipe'});
 try{
  for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}await sleep(150);}
  const reg=async(u:string,female:boolean)=>{const r=await fetch(base+'/api/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:u,password:'secret123',displayName:'Thử '+u,female})});assert.equal(r.status,201);return{id:(await r.json()).id as number,cookie:r.headers.get('set-cookie')!.split(';')[0]};};
  const conn=async(c:{cookie:string})=>{const ws=new WebSocket(`ws://127.0.0.1:${port}/ws`,{headers:{cookie:c.cookie}});const inbox:any[]=[];ws.on('message',d=>inbox.push(JSON.parse(String(d))));await new Promise(r=>ws.on('open',r));
   const wait=async(f:(m:any)=>boolean,ms=3000)=>{const t=Date.now();while(Date.now()-t<ms){const i=inbox.findIndex(f);if(i>=0)return inbox.splice(i,1)[0];await sleep(20);}throw new Error('timeout');};
   return{ws,inbox,wait,send:(m:object)=>ws.send(JSON.stringify(m))};};
  const a=await reg('tn_soc_a',false),b=await reg('tn_soc_b',true),c=await reg('tn_soc_c',false);
  const A=await conn(a),B=await conn(b),C=await conn(c);
  await A.wait(m=>m.t==='ice');
  // strangers can't chat or call
  A.send({t:'chat',to:b.id,text:'xin chào'});await A.wait(m=>m.t==='notice'&&/bạn bè/.test(m.text));
  A.send({t:'call',op:'invite',to:b.id,callId:'x1',video:false});await A.wait(m=>m.t==='call'&&m.op==='unavailable');
  // search, request, accept
  A.send({t:'findUser',q:'tn_soc_b'});const f=await A.wait(m=>m.t==='found');assert.equal(f.users[0].id,b.id);assert.equal(f.users[0].state,'none');assert.ok(!('username' in f.users[0]));
  A.send({t:'friend',op:'request',id:b.id});
  const lb=await B.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===a.id));assert.equal(lb.list[0].state,'incoming');
  B.send({t:'friend',op:'accept',id:a.id});await A.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===b.id&&x.state==='friend'&&x.online));
  // chat both ways, masked words, history, unread, read receipt
  A.send({t:'chat',to:b.id,text:'Nam mô A Di Đà Phật 🙏'});const got=await B.wait(m=>m.t==='chat');assert.equal(got.m.text,'Nam mô A Di Đà Phật 🙏');assert.equal(got.m.from,a.id);
  const unread=await B.wait(m=>m.t==='friends'&&m.list.find((x:any)=>x.id===a.id)?.unread===1);assert.ok(unread);
  await sleep(400);B.send({t:'chat',to:a.id,text:'đéo gì vậy'});const masked=await A.wait(m=>m.t==='chat'&&m.m.from===b.id);assert.equal(masked.m.text,'*** gì vậy');
  B.send({t:'read',with:a.id});await A.wait(m=>m.t==='seen'&&m.by===b.id);
  A.send({t:'history',with:b.id});const h=await A.wait(m=>m.t==='history');assert.equal(h.m.length,2);assert.equal(h.m[0].from,a.id);
  C.send({t:'history',with:a.id});await sleep(300);assert.ok(!C.inbox.some(m=>m.t==='history'),'a stranger cannot read the conversation');
  // a call: invite → accept → offer/answer/ice relayed → end, logged into the chat with its length
  A.send({t:'call',op:'invite',to:b.id,callId:'c1',video:true});const inv=await B.wait(m=>m.t==='call'&&m.op==='invite');assert.equal(inv.video,true);assert.equal(inv.from,a.id);
  // a third person calling B while B is ringing gets "busy" (C is not B's friend → unavailable instead)
  C.send({t:'call',op:'invite',to:b.id,callId:'c9',video:false});await C.wait(m=>m.t==='call'&&m.op==='unavailable');
  B.send({t:'call',op:'accept',to:a.id,callId:'c1'});await A.wait(m=>m.t==='call'&&m.op==='accept');
  A.send({t:'call',op:'offer',to:b.id,callId:'c1',sdp:'v=0 fake offer'});assert.equal((await B.wait(m=>m.t==='call'&&m.op==='offer')).sdp,'v=0 fake offer');
  B.send({t:'call',op:'answer',to:a.id,callId:'c1',sdp:'v=0 fake answer'});await A.wait(m=>m.t==='call'&&m.op==='answer');
  A.send({t:'call',op:'ice',to:b.id,callId:'c1',cand:{candidate:'candidate:1 1 udp 1 1.2.3.4 5 typ host',sdpMid:'0'}});await B.wait(m=>m.t==='call'&&m.op==='ice');
  C.send({t:'call',op:'offer',to:b.id,callId:'c1',sdp:'hijack'});await sleep(200);assert.ok(!B.inbox.some(m=>m.op==='offer'),'outsiders cannot inject into a call');
  await sleep(1100);B.send({t:'call',op:'end',to:a.id,callId:'c1'});await A.wait(m=>m.t==='call'&&m.op==='end');
  const log=await A.wait(m=>m.t==='chat'&&m.m.kind==='call');assert.match(log.m.text,/Cuộc gọi video · 00:0[12]/);
  // declined voice call is logged as declined
  A.send({t:'call',op:'invite',to:b.id,callId:'c2',video:false});await B.wait(m=>m.t==='call'&&m.op==='invite');B.send({t:'call',op:'decline',to:a.id,callId:'c2'});
  await A.wait(m=>m.t==='call'&&m.op==='decline');assert.match((await A.wait(m=>m.t==='chat'&&m.m.kind==='call')).m.text,/thoại bị từ chối/);
  // hanging up by leaving: B disconnects mid-ring → A's call ends, logged as missed
  A.send({t:'call',op:'invite',to:b.id,callId:'c3',video:false});await B.wait(m=>m.t==='call'&&m.op==='invite');B.ws.close();
  await A.wait(m=>m.t==='call'&&m.op==='end');assert.match((await A.wait(m=>m.t==='chat'&&m.m.kind==='call')).m.text,/nhỡ/);
  await A.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===b.id&&!x.online));
  // unfriend: chat is refused again
  A.send({t:'friend',op:'remove',id:b.id});await A.wait(m=>m.t==='friends'&&!m.list.some((x:any)=>x.id===b.id));
  await sleep(400);A.send({t:'chat',to:b.id,text:'còn đó không'});await A.wait(m=>m.t==='notice'&&/bạn bè/.test(m.text));
  // blocking: A and C become friends, C blocks A mid-call → call ends, friendship gone, A can't re-request, chat or call
  A.send({t:'friend',op:'request',id:c.id});await C.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===a.id&&x.state==='incoming'));
  C.send({t:'friend',op:'accept',id:a.id});await A.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===c.id&&x.state==='friend'));
  A.send({t:'call',op:'invite',to:c.id,callId:'k1',video:false});await C.wait(m=>m.t==='call'&&m.op==='invite');
  C.send({t:'friend',op:'block',id:a.id});await A.wait(m=>m.t==='call'&&m.op==='end'&&m.callId==='k1');
  const cl=await C.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===a.id&&x.state==='blocked'));assert.ok(cl);
  await A.wait(m=>m.t==='friends'&&!m.list.some((x:any)=>x.id===c.id));
  A.send({t:'friend',op:'request',id:c.id});const nb=await A.wait(m=>m.t==='notice'&&/Không gửi được lời mời/.test(m.text));assert.ok(nb,'the blocked side is not told why');
  await sleep(400);A.send({t:'chat',to:c.id,text:'alo'});await A.wait(m=>m.t==='notice'&&/bạn bè/.test(m.text));
  A.send({t:'call',op:'invite',to:c.id,callId:'k2',video:false});await A.wait(m=>m.t==='call'&&m.op==='unavailable'&&m.callId==='k2');
  C.send({t:'friend',op:'request',id:a.id});await C.wait(m=>m.t==='notice'&&/đang chặn/.test(m.text));
  await sleep(800);C.send({t:'findUser',q:'tn_soc_a'});assert.equal((await C.wait(m=>m.t==='found')).users[0].state,'blocked');
  assert.ok(!C.inbox.some(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===a.id&&x.state==='incoming')),'no request reached C');
  // unblock → requests work again
  C.send({t:'friend',op:'unblock',id:a.id});await C.wait(m=>m.t==='friends'&&!m.list.some((x:any)=>x.id===a.id));
  A.send({t:'friend',op:'request',id:c.id});await C.wait(m=>m.t==='friends'&&m.list.some((x:any)=>x.id===a.id&&x.state==='incoming'));
  C.send({t:'friend',op:'decline',id:a.id});await A.wait(m=>m.t==='friends'&&!m.list.some((x:any)=>x.id===c.id&&x.state==='outgoing'));
  // "don't accept friend requests": nobody's request gets through, and the sender is told
  C.send({t:'socialPrefs',noRequests:true});assert.equal((await C.wait(m=>m.t==='friends'&&m.noRequests===true)).noRequests,true);
  A.send({t:'friend',op:'request',id:c.id});await A.wait(m=>m.t==='notice'&&/không nhận lời mời/.test(m.text));
  C.send({t:'socialPrefs',noRequests:false});await C.wait(m=>m.t==='friends'&&m.noRequests===false);
  A.ws.close();C.ws.close();
 }finally{srv.kill();await sleep(300);fs.rmSync(data,{recursive:true,force:true});}
});
