import {assignRefugeName} from './refuge-names.ts';
import type {DatabaseSync} from 'node:sqlite';
import {actName,type Merit,meritTotal,type ServerMsg} from '../src/online/protocol.ts';
import {REFUGE_MERIT,REFUGE_STEPS,nearRefuge,type RefugeGender,type MeritRank,type RefugeCertificate,type RefugeCommand,type RefugeUpdate} from '../src/online/RefugePlan.ts';

type Participant={info:{id:number;name:string};x:number;y:number;z:number;a:number;merit:Merit};
export function createRefuge(db:DatabaseSync,broadcast:(m:ServerMsg)=>void,now=Date.now){
 const score='wheel+incense+bows+sits+steps';
 db.exec(`CREATE INDEX IF NOT EXISTS merit_rank ON merit((${score}) DESC,user_id);
 CREATE TABLE IF NOT EXISTS refuge_certificate(
 user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 name TEXT NOT NULL,dharma_name TEXT NOT NULL,issued INTEGER NOT NULL);`);
 const rank=db.prepare(`SELECT m.user_id AS id,u.display AS name,(${score}) AS score
 FROM merit m JOIN users u ON u.id=m.user_id WHERE (${score})>0 ORDER BY score DESC,m.user_id ASC LIMIT 3`);
 const get=db.prepare('SELECT name,dharma_name AS dharmaName,issued FROM refuge_certificate WHERE user_id=?');
 const insert=db.prepare('INSERT OR IGNORE INTO refuge_certificate(user_id,name,dharma_name,issued) VALUES(?,?,?,?)');
 const certificate=(id:number):RefugeCertificate|null=>{
  const row=get.get(id) as Omit<RefugeCertificate,'serial'>|undefined;
  return row?{...row,serial:'AL-'+String(id).padStart(6,'0')}:null;
 };
 const leaders=()=>rank.all() as MeritRank[];
 let signature=JSON.stringify(leaders()),queued=false;
 const changed=()=>{if(queued)return;queued=true;setTimeout(()=>{
  queued=false;const rows=leaders(),next=JSON.stringify(rows);
  if(next!==signature){signature=next;broadcast({t:'meritRank',rows});}
 },350).unref();};
 const active=new WeakMap<Participant,{round:number;ready:number;expires:number;name:string;gender:RefugeGender}>();
 const stop=(p:Participant,error?:string):RefugeUpdate=>{active.delete(p);return{t:'refuge',phase:'idle',error};};
 const valid=(p:Participant)=>nearRefuge(p)&&actName(p.a)==='kneel';
 function positionChanged(p:Participant){if(active.has(p)&&!valid(p))return stop(p,'Buổi lễ đã dừng. Hãy trở lại chỗ quy y và quỳ để bắt đầu lại.');}
 function handle(p:Participant,m:RefugeCommand):RefugeUpdate{
  if(m.op==='cancel')return stop(p);
  const saved=certificate(p.info.id);if(saved)return{t:'refuge',phase:'complete',certificate:saved};
  if(meritTotal(p.merit)<REFUGE_MERIT)return stop(p,'Cần đủ 1.000 điểm công đức để quy y.');
  if(!valid(p))return stop(p,'Hãy đến chỗ quy y trong chánh điện và quỳ trước sư thầy.');
  const time=now();let state=active.get(p);
  if(m.op==='start'&&(!state||time>state.expires)){
   const name=typeof m.fullName==='string'&&m.fullName.length<=128?m.fullName.normalize('NFC').trim().replace(/ +/g,' '):'';
   if(name.length>64||!/^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)+$/u.test(name)){
    return{t:'refuge',phase:'name',error:'Nhập họ và tên bằng chữ cái, tối đa 64 ký tự.'};
   }
   if(m.gender!=='male'&&m.gender!=='female'){
    return{t:'refuge',phase:'name',error:'Chọn Nam hoặc Nữ để cấp pháp danh.'};
   }
   state={round:0,ready:time+REFUGE_STEPS[0].seconds*1000,expires:time+1800000,name,gender:m.gender};
   active.set(p,state);
  }
  if(!state||time>state.expires)return stop(p,'Buổi lễ đã hết thời gian. Anh/chị có thể bắt đầu lại.');
  if(m.op==='read'&&m.round===state.round&&time>=state.ready){
   state.round++;
   const next=REFUGE_STEPS[state.round];
   if(!next){
    insert.run(p.info.id,state.name,assignRefugeName(state.gender),time);
    active.delete(p);
    return{t:'refuge',phase:'complete',certificate:certificate(p.info.id)!};
   }
   state.ready=time+next.seconds*1000;
  }
  return{t:'refuge',phase:'reading',round:state.round,waitMs:Math.max(0,state.ready-time)};
 }
 return{leaders,certificate,changed,handle,positionChanged};
}
