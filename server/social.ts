/**
 * Friends, chat and 1-1 voice/video calls between pilgrims (anh Thanh 2026-11-06: "lấy bên Palo gán vào game").
 * Same model as Palo: friend requests, a 1-1 conversation per pair stored on the server, and WebRTC calls whose
 * signalling (invite / accept / decline / end / offer / answer / ice) the server relays between two friends only.
 * Calls are written into the chat afterwards ("Cuộc gọi nhỡ", "Cuộc gọi video · 03:12"), like Zalo/Palo.
 */
import crypto from 'node:crypto';
import type {DatabaseSync} from 'node:sqlite';
import {Limiter} from './guard.ts';
import {cleanChat,CHAT_MAX,type ClientMsg,type ServerMsg,type FriendRow,type FoundUser,type ChatMsg,type CallOp} from '../src/online/protocol.ts';

type Social={info:{id:number;name:string;female:boolean};lastChat?:number;lastFind?:number};
type Call={id:string;from:number;to:number;video:boolean;t0:number;accepted:number;timer:NodeJS.Timeout};
const RING_MS=45_000;
const TURN_SECRET=process.env.TURN_SECRET,TURN_HOST=process.env.TURN_HOST;

export function createSocial(db:DatabaseSync,online:()=>Map<number,Social&{ws:unknown}>,sendTo:(id:number,m:ServerMsg)=>void){
 db.exec(`CREATE TABLE IF NOT EXISTS friends(a INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,b INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,requester INTEGER NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(a,b));
 CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,a INTEGER NOT NULL,b INTEGER NOT NULL,sender INTEGER NOT NULL,text TEXT NOT NULL,t INTEGER NOT NULL,seen INTEGER NOT NULL DEFAULT 0,kind TEXT);
 CREATE INDEX IF NOT EXISTS messages_pair ON messages(a,b,id);
 CREATE TABLE IF NOT EXISTS blocks(blocker INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,blocked INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,created INTEGER NOT NULL,PRIMARY KEY(blocker,blocked));
 CREATE TABLE IF NOT EXISTS social_prefs(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,no_requests INTEGER NOT NULL DEFAULT 0);`);
 const q={
  pair:db.prepare('SELECT * FROM friends WHERE a=? AND b=?'),
  put:db.prepare('INSERT OR REPLACE INTO friends(a,b,status,requester,created) VALUES(?,?,?,?,?)'),
  drop:db.prepare('DELETE FROM friends WHERE a=? AND b=?'),
  mine:db.prepare(`SELECT f.*,u.id uid,u.display name,u.female female FROM friends f JOIN users u ON u.id=CASE WHEN f.a=? THEN f.b ELSE f.a END WHERE f.a=? OR f.b=?`),
  unread:db.prepare('SELECT sender,count(*) n FROM messages WHERE (a=? OR b=?) AND sender<>? AND seen=0 GROUP BY sender'),
  last:db.prepare('SELECT * FROM messages WHERE a=? AND b=? ORDER BY id DESC LIMIT 1'),
  add:db.prepare('INSERT INTO messages(a,b,sender,text,t,kind) VALUES(?,?,?,?,?,?)'),
  page:db.prepare('SELECT * FROM messages WHERE a=? AND b=? AND id<? ORDER BY id DESC LIMIT 40'),
  seen:db.prepare('UPDATE messages SET seen=1 WHERE a=? AND b=? AND sender<>? AND seen=0'),
  find:db.prepare(`SELECT id,display name,female FROM users WHERE id<>? AND (username=? OR display LIKE ? ESCAPE '\\') ORDER BY username=? DESC,id LIMIT 12`),
  user:db.prepare('SELECT id,display name,female FROM users WHERE id=?'),
  block:db.prepare('INSERT OR IGNORE INTO blocks(blocker,blocked,created) VALUES(?,?,?)'),
  unblock:db.prepare('DELETE FROM blocks WHERE blocker=? AND blocked=?'),
  blockedBy:db.prepare('SELECT b.blocked id,u.display name,u.female female FROM blocks b JOIN users u ON u.id=b.blocked WHERE b.blocker=? ORDER BY b.created DESC'),
  blockedEither:db.prepare('SELECT 1 FROM blocks WHERE (blocker=? AND blocked=?) OR (blocker=? AND blocked=?)'),
  iBlocked:db.prepare('SELECT 1 FROM blocks WHERE blocker=? AND blocked=?'),
  prefs:db.prepare('SELECT no_requests FROM social_prefs WHERE user_id=?'),
  setPrefs:db.prepare('INSERT INTO social_prefs(user_id,no_requests) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET no_requests=excluded.no_requests'),
 };
 const key=(x:number,y:number):[number,number]=>x<y?[x,y]:[y,x];
 const relation=(me:number,other:number)=>q.pair.get(...key(me,other)) as {status:string;requester:number}|undefined;
 const areFriends=(x:number,y:number)=>relation(x,y)?.status==='accepted';
 /** Blocked in either direction (a block hides nothing from the blocker's own view, but stops requests, chat and calls both ways). */
 const blocked=(x:number,y:number)=>!!q.blockedEither.get(x,y,y,x);
 const noRequests=(uid:number)=>!!(q.prefs.get(uid) as {no_requests:number}|undefined)?.no_requests;
 const asMsg=(r:any):ChatMsg=>({id:r.id,from:r.sender,to:r.sender===r.a?r.b:r.a,text:r.text,t:r.t,kind:r.kind??undefined,seen:!!r.seen});
 const calls=new Map<string,Call>();
 // spam limits: ~30 friend requests an hour, 6 call attempts a minute per pilgrim
 const reqLimit=new Limiter(.5,15),callLimit=new Limiter(6,6);
 const callOf=(uid:number)=>[...calls.values()].find(c=>c.from===uid||c.to===uid);

 function friendsOf(uid:number):FriendRow[]{
  const on=online(),unread=new Map((q.unread.all(uid,uid,uid) as {sender:number;n:number}[]).map(r=>[r.sender,r.n]));
  return (q.mine.all(uid,uid,uid) as any[]).map((r):FriendRow=>{const [a,b]=key(uid,r.uid),last=q.last.get(a,b) as any;
   const state:FriendRow['state']=r.status==='accepted'?'friend':r.requester===uid?'outgoing':'incoming';return{id:r.uid,name:r.name,female:!!r.female,online:on.has(r.uid),state,unread:unread.get(r.uid)??0,last:last?asMsg(last):undefined};})
   .sort((x,y)=>(y.last?.t??0)-(x.last?.t??0))
   .concat((q.blockedBy.all(uid) as any[]).map((r):FriendRow=>({id:r.id,name:r.name,female:!!r.female,online:false,state:'blocked' as const,unread:0})));
 }
 const pushFriends=(uid:number)=>{if(online().has(uid))sendTo(uid,{t:'friends',list:friendsOf(uid),noRequests:noRequests(uid)});};
 const endCallBetween=(x:number,y:number)=>{const c=callOf(x);if(c&&(c.from===y||c.to===y)){sendTo(y,{t:'call',op:'end',from:x,callId:c.id});sendTo(x,{t:'call',op:'end',from:y,callId:c.id});finishCall(c,'end');}};
 function post(from:number,to:number,text:string,kind?:'call'){const [a,b]=key(from,to),t=Date.now();const r=q.add.run(a,b,from,text,t,kind??null);
  const m:ChatMsg={id:Number(r.lastInsertRowid),from,to,text,t,kind,seen:false};sendTo(from,{t:'chat',m});sendTo(to,{t:'chat',m});return m;}
 function finishCall(c:Call,why:'end'|'decline'|'timeout'|'busy'|'gone'){
  clearTimeout(c.timer);calls.delete(c.id);
  const kind=c.video?'video':'thoại',secs=c.accepted?Math.round((Date.now()-c.accepted)/1000):0,mm=String(Math.floor(secs/60)).padStart(2,'0'),ss=String(secs%60).padStart(2,'0');
  const text=c.accepted?`📞 Cuộc gọi ${kind} · ${mm}:${ss}`:why==='decline'?`📞 Cuộc gọi ${kind} bị từ chối`:why==='busy'?`📞 Cuộc gọi ${kind} · máy bận`:`📞 Cuộc gọi ${kind} nhỡ`;
  post(c.from,c.to,text,'call');
 }
 function iceServers(uid:number){const s:{urls:string;username?:string;credential?:string}[]=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
  if(TURN_SECRET&&TURN_HOST){const username=`${Math.floor(Date.now()/1000)+3600}:al${uid}`,credential=crypto.createHmac('sha1',TURN_SECRET).update(username).digest('base64');
   s.push({urls:`turn:${TURN_HOST}:3478?transport=udp`,username,credential},{urls:`turn:${TURN_HOST}:3478?transport=tcp`,username,credential});}
  return s;}

 return{
  /** A pilgrim came online: their friends list, ICE servers, and friends see them online. */
  join(uid:number){sendTo(uid,{t:'ice',servers:iceServers(uid)});pushFriends(uid);for(const f of friendsOf(uid))if(f.state==='friend')pushFriends(f.id);},
  /** Went offline: hang up their call, friends see them offline. */
  leave(uid:number){const c=callOf(uid);if(c){sendTo(c.from===uid?c.to:c.from,{t:'call',op:'end',from:uid,callId:c.id});finishCall(c,'gone');}
   for(const f of friendsOf(uid))if(f.state==='friend')pushFriends(f.id);},
  /** Handles social messages; returns false for anything else. */
  handle(uid:number,m:ClientMsg):boolean{
   const me=online().get(uid);if(!me)return false;
   if(m.t==='friends'){pushFriends(uid);return true;}
   if(m.t==='findUser'){const now=Date.now();if(now-(me.lastFind??0)<700)return true;me.lastFind=now;const s=String(m.q??'').normalize('NFC').trim().slice(0,24);if(s.length<2){sendTo(uid,{t:'found',users:[]});return true;}
    const like='%'+s.replace(/[\\%_]/g,c=>'\\'+c)+'%',rows=q.find.all(uid,s.toLowerCase(),like,s.toLowerCase()) as any[];
    sendTo(uid,{t:'found',users:rows.map(r=>{const rel=relation(uid,r.id),state:FoundUser['state']=q.iBlocked.get(uid,r.id)?'blocked':rel?rel.status==='accepted'?'friend':rel.requester===uid?'outgoing':'incoming':'none';return{id:r.id,name:r.name,female:!!r.female,online:online().has(r.id),state};})});return true;}
   if(m.t==='socialPrefs'){q.setPrefs.run(uid,m.noRequests?1:0);pushFriends(uid);return true;}
   if(m.t==='friend'){
    const other=Number(m.id);if(!Number.isInteger(other)||other===uid||!q.user.get(other))return true;const [a,b]=key(uid,other),rel=relation(uid,other);
    if(m.op==='block'){if(rel)q.drop.run(a,b);q.block.run(uid,other,Date.now());endCallBetween(uid,other);}
    else if(m.op==='unblock')q.unblock.run(uid,other);
    else if(m.op==='request'){
     if(!reqLimit.take('u'+uid)){sendTo(uid,{t:'notice',text:'Anh/chị gửi quá nhiều lời mời kết bạn, xin chờ ít phút'});return true;}
     // a block (either way) or "no requests" on the other side: the request is not delivered (the reason isn't revealed for blocks)
     if(blocked(uid,other)){sendTo(uid,{t:'notice',text:q.iBlocked.get(uid,other)?'Anh/chị đang chặn người này · bỏ chặn để kết bạn':'Không gửi được lời mời kết bạn'});pushFriends(uid);return true;}
     if(!rel){if(noRequests(other)){sendTo(uid,{t:'notice',text:'Người này hiện không nhận lời mời kết bạn'});pushFriends(uid);return true;}
      q.put.run(a,b,'pending',uid,Date.now());sendTo(other,{t:'notice',text:`🙏 ${me.info.name} muốn kết bạn với anh/chị`});}
     else if(rel.status==='pending'&&rel.requester!==uid)q.put.run(a,b,'accepted',rel.requester,Date.now());}
    else if(m.op==='accept'){if(rel?.status==='pending'&&rel.requester!==uid){q.put.run(a,b,'accepted',rel.requester,Date.now());sendTo(other,{t:'notice',text:`🤝 ${me.info.name} đã đồng ý kết bạn`});}}
    else if(m.op==='decline'||m.op==='remove'){if(rel)q.drop.run(a,b);endCallBetween(uid,other);}
    pushFriends(uid);pushFriends(other);return true;}
   if(m.t==='chat'){
    const to=Number(m.to),text=cleanChat(m.text);if(!areFriends(uid,to)){sendTo(uid,{t:'notice',text:'Chỉ nhắn tin được cho bạn bè'});return true;}
    if(text===null){sendTo(uid,{t:'notice',text:`Tin nhắn tối đa ${CHAT_MAX} ký tự`});return true;}if(!text)return true;
    const now=Date.now();if(now-(me.lastChat??0)<350){sendTo(uid,{t:'notice',text:'Nhắn chậm lại một chút nhé'});return true;}me.lastChat=now;
    post(uid,to,text);pushFriends(to);return true;}
   if(m.t==='history'){const w=Number(m.with);if(!areFriends(uid,w))return true;const [a,b]=key(uid,w),before=Number.isFinite(m.before)?Number(m.before):Number.MAX_SAFE_INTEGER;
    const rows=(q.page.all(a,b,before) as any[]).map(asMsg).reverse();sendTo(uid,{t:'history',with:w,m:rows,more:rows.length===40});return true;}
   if(m.t==='read'){const w=Number(m.with);if(!Number.isInteger(w))return true;const [a,b]=key(uid,w);q.seen.run(a,b,uid);sendTo(w,{t:'seen',by:uid});pushFriends(uid);return true;}
   if(m.t==='call'){
    const to=Number(m.to),op=m.op as CallOp,callId=String(m.callId??'').slice(0,40);if(!callId||!Number.isInteger(to))return true;
    if(op==='invite'){
     if(!callLimit.take('u'+uid)){sendTo(uid,{t:'call',op:'unavailable',from:to,callId,reason:'Gọi quá nhiều lần, xin chờ ít phút'});return true;}
     if(!areFriends(uid,to)){sendTo(uid,{t:'call',op:'unavailable',from:to,callId,reason:'Chỉ gọi được cho bạn bè'});return true;}
     if(!online().has(to)){sendTo(uid,{t:'call',op:'unavailable',from:to,callId,reason:'Bạn ấy đang không ở trong chùa'});return true;}
     if(callOf(uid)){sendTo(uid,{t:'call',op:'unavailable',from:to,callId,reason:'Anh/chị đang trong một cuộc gọi khác'});return true;}
     const busy=callOf(to);const c:Call={id:callId,from:uid,to,video:!!m.video,t0:Date.now(),accepted:0,timer:setTimeout(()=>{if(calls.get(callId)===c){sendTo(uid,{t:'call',op:'end',from:to,callId});sendTo(to,{t:'call',op:'end',from:uid,callId});finishCall(c,'timeout');}},RING_MS)};
     if(busy){sendTo(uid,{t:'call',op:'busy',from:to,callId});calls.set(callId,c);finishCall(c,'busy');return true;}
     calls.set(callId,c);sendTo(to,{t:'call',op:'invite',from:uid,callId,video:c.video,name:me.info.name});return true;}
    const c=calls.get(callId);if(!c||(c.from!==uid&&c.to!==uid))return true;const peer=c.from===uid?c.to:c.from;if(peer!==to)return true;
    if(op==='accept'){if(c.to!==uid||c.accepted)return true;c.accepted=Date.now();clearTimeout(c.timer);sendTo(peer,{t:'call',op:'accept',from:uid,callId});return true;}
    if(op==='decline'||op==='end'){sendTo(peer,{t:'call',op,from:uid,callId});finishCall(c,op==='decline'&&!c.accepted?'decline':'end');return true;}
    if(op==='offer'||op==='answer'){const sdp=typeof m.sdp==='string'&&m.sdp.length<20000?m.sdp:null;if(sdp&&c.accepted)sendTo(peer,{t:'call',op,from:uid,callId,sdp});return true;}
    if(op==='ice'){const cand=m.cand&&typeof m.cand==='object'&&JSON.stringify(m.cand).length<1200?m.cand:null;if(cand)sendTo(peer,{t:'call',op,from:uid,callId,cand});return true;}
    if(op==='media'){sendTo(peer,{t:'call',op,from:uid,callId,mic:!!m.mic,cam:!!m.cam});return true;}
    return true;}
   return false;
  },
 };
}
