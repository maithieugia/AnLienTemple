/**
 * Chùa An Liên online server: accounts, sessions, pilgrims' positions, shared prayer wheels and incense.
 * Node ≥ 22.18 (type stripping + node:sqlite), one dependency (ws). Run: node server/server.ts
 * Env: PORT (8930), HOST (127.0.0.1), DATA_DIR (./data), STATIC_DIR (./dist), COOKIE_SECURE (1 behind HTTPS).
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {WebSocketServer,WebSocket} from 'ws';
import {NET,SPAWN,clampWorld,ACTS,INCENSE_SITES,checkUsername,checkPassword,cleanDisplayName,nearIncense,type ClientMsg,type ServerMsg,type PlayerInfo,type SnapRow,type Stick,type Merit,cleanOutfit,cleanPrayer,BOW_SECONDS,WALK_STEP_LIMIT} from '../src/online/protocol.ts';
import {towerProgress} from '../src/game/world/StupaPlan.ts';
import {RELEASE_KINDS,RELEASE_LIFE,RELEASE_CAP,RELEASE_COOLDOWN,onRiverStep,waterStart,WATER_Y,type Release} from '../src/online/Releases.ts';
import {createRefuge} from './refuge.ts';
import {createSocial} from './social.ts';
import {Limiter,LoginGuard,Gate,Conns,lockdown} from './guard.ts';
import {WheelMotion,PRAYER_WHEEL_SITES,canReachWheel,type WheelId} from '../src/game/world/PrayerWheelPlan.ts';

const PORT=Number(process.env.PORT??8930),HOST=process.env.HOST??'127.0.0.1';
const ROOT=path.resolve(import.meta.dirname,'..');
const DATA=path.resolve(process.env.DATA_DIR??path.join(ROOT,'data'));
const STATIC=path.resolve(process.env.STATIC_DIR??path.join(ROOT,'dist'));
const SECURE=process.env.COOKIE_SECURE==='1';
fs.mkdirSync(DATA,{recursive:true});

// ---------- storage ----------
const db=new DatabaseSync(path.join(DATA,'anlien.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,display TEXT NOT NULL,pass TEXT NOT NULL,female INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS merit(user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,wheel INTEGER NOT NULL DEFAULT 0,incense INTEGER NOT NULL DEFAULT 0,bows INTEGER NOT NULL DEFAULT 0,sits INTEGER NOT NULL DEFAULT 0,mo INTEGER NOT NULL DEFAULT 0,chuong INTEGER NOT NULL DEFAULT 0,chuoi INTEGER NOT NULL DEFAULT 0);`);
try{db.exec('ALTER TABLE users ADD COLUMN outfit TEXT');}catch{}
try{db.exec('ALTER TABLE users ADD COLUMN prayer TEXT');}catch{}
try{db.exec('ALTER TABLE merit ADD COLUMN steps INTEGER NOT NULL DEFAULT 0');}catch{} // added 2026-11-04 (tower steps) // added 2026-11-04 (prayers above the head) // added 2026-11-03 (player outfits)
try{db.exec('ALTER TABLE merit ADD COLUMN mo INTEGER NOT NULL DEFAULT 0');}catch{} // added 2026-11-07 (ritual: go mo)
try{db.exec('ALTER TABLE merit ADD COLUMN chuong INTEGER NOT NULL DEFAULT 0');}catch{} // added 2026-11-07 (ritual: go chuong)
try{db.exec('ALTER TABLE merit ADD COLUMN chuoi INTEGER NOT NULL DEFAULT 0');}catch{} // added 2026-11-07 (ritual: lan trang hat)
type User={id:number;username:string;display:string;pass:string;female:number;outfit?:string|null;prayer?:string|null};
const q={
 userByName:db.prepare('SELECT * FROM users WHERE username=?'),
 userById:db.prepare('SELECT * FROM users WHERE id=?'),
 addUser:db.prepare('INSERT INTO users(username,display,pass,female,created) VALUES(?,?,?,?,?)'),
 setFemale:db.prepare('UPDATE users SET female=? WHERE id=?'),
 setOutfit:db.prepare('UPDATE users SET outfit=? WHERE id=?'),
 setPrayer:db.prepare('UPDATE users SET prayer=? WHERE id=?'),
 addSession:db.prepare('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)'),
 session:db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?'),
 dropSession:db.prepare('DELETE FROM sessions WHERE token=?'),
 purge:db.prepare('DELETE FROM sessions WHERE expires<?'),
 merit:db.prepare('SELECT wheel,incense,bows,sits,steps,mo,chuong,chuoi FROM merit WHERE user_id=?'),
 initMerit:db.prepare('INSERT OR IGNORE INTO merit(user_id) VALUES(?)'),
 addMerit:db.prepare('UPDATE merit SET wheel=wheel+?,incense=incense+?,bows=bows+?,sits=sits+?,steps=steps+?,mo=mo+?,chuong=chuong+?,chuoi=chuoi+? WHERE user_id=?'),
};
const SESSION_DAYS=30;
// Password hashing runs on the libuv thread pool (async scrypt), at most 4 at once: a login flood can't freeze the game loop.
const SCRYPT={N:16384,r:8,p:1},scryptAsync=(p:string,salt:Buffer,len:number)=>new Promise<Buffer>((ok,bad)=>crypto.scrypt(p,salt,len,SCRYPT,(e,k)=>e?bad(e):ok(k)));
const hashGate=new Gate(4);
const hashPass=async(p:string)=>{const salt=crypto.randomBytes(16);const h=await scryptAsync(p,salt,32);return`s1$${salt.toString('base64')}$${h.toString('base64')}`;};
const verifyPass=async(p:string,stored:string)=>{const [v,s,h]=stored.split('$');if(v!=='s1')return false;const want=Buffer.from(h,'base64');const got=await scryptAsync(p,Buffer.from(s,'base64'),want.length);return crypto.timingSafeEqual(want,got);};
const getMerit=(id:number):Merit=>{q.initMerit.run(id);return{...(q.merit.get(id) as Merit)};};
setInterval(()=>q.purge.run(Date.now()),3600e3).unref();

// ---------- http helpers ----------
const cookieOf=(req:http.IncomingMessage,name:string)=>{for(const part of(req.headers.cookie??'').split(';')){const [k,...v]=part.trim().split('=');if(k===name)return decodeURIComponent(v.join('='));}return null;};
/** Host the browser actually used (proxies such as Caddy or the Vite dev proxy forward it). */
const publicHost=(req:http.IncomingMessage)=>String(req.headers['x-forwarded-host']??req.headers.host??'').split(',')[0].trim();
const sameOrigin=(req:http.IncomingMessage)=>{const o=req.headers.origin;if(!o)return true;try{return new URL(o).host===publicHost(req);}catch{return false;}};
// The real visitor: Cloudflare's header (the firewall only lets Cloudflare reach the web ports), else the peer Caddy saw
// (it appends it last to X-Forwarded-For; earlier entries are whatever the client claimed), else the socket.
const clientIp=(req:http.IncomingMessage)=>{const cf=req.headers['cf-connecting-ip'];if(typeof cf==='string'&&cf.length<64)return cf.trim();const xff=String(req.headers['x-forwarded-for']??'').split(',').map(x=>x.trim()).filter(Boolean);return(xff.at(-1)??req.socket.remoteAddress??'').slice(0,64);};
const sessionUser=(req:http.IncomingMessage):User|null=>{const t=cookieOf(req,'al_sid');if(!t||t.length>100)return null;const row=q.session.get(t,Date.now()) as {user_id:number}|undefined;return row?(q.userById.get(row.user_id) as User):null;};
const json=(res:http.ServerResponse,code:number,body:unknown,headers:Record<string,string|string[]>={})=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(JSON.stringify(body));};
const readBody=(req:http.IncomingMessage)=>new Promise<any>((ok,bad)=>{let n=0;const chunks:Buffer[]=[];req.on('data',(c:Buffer)=>{n+=c.length;if(n>8192){bad(new Error('too large'));req.destroy();}else chunks.push(c);});req.on('end',()=>{try{ok(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'));}catch{ok({});}});req.on('error',bad);});
const startSession=(userId:number)=>{const token=crypto.randomBytes(32).toString('base64url');q.addSession.run(token,userId,Date.now()+SESSION_DAYS*864e5);return`al_sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS*86400}${SECURE?'; Secure':''}`;};
const publicUser=(u:User)=>({id:u.id,username:u.username,name:u.display,female:!!u.female,outfit:cleanOutfit(u.outfit,!!u.female,u.id),merit:getMerit(u.id)});
/** Simple per-IP token bucket for login/register. */
const buckets=new Map<string,{n:number;t:number}>();
const allow=(key:string,perMin:number)=>{const now=Date.now(),b=buckets.get(key)??{n:perMin,t:now};b.n=Math.min(perMin,b.n+(now-b.t)/60e3*perMin);b.t=now;if(b.n<1){buckets.set(key,b);return false;}b.n-=1;buckets.set(key,b);return true;};
setInterval(()=>{const old=Date.now()-600e3;for(const [k,b]of buckets)if(b.t<old)buckets.delete(k);},600e3).unref();

const TYPES:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.hdr':'application/octet-stream','.env':'application/octet-stream','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
function serveStatic(req:http.IncomingMessage,res:http.ServerResponse){
 const url=new URL(req.url??'/','http://x');let rel=decodeURIComponent(url.pathname);if(rel.endsWith('/'))rel+='index.html';
 let file=path.join(STATIC,path.normalize(rel).replace(/^([/\\])+/,''));if(!file.startsWith(STATIC)){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(STATIC,'index.html');
 if(!fs.existsSync(file)){res.writeHead(404).end('Not found');return;}
 const ext=path.extname(file).toLowerCase(),hashed=/[-.][A-Za-z0-9_-]{8}\.(js|css)$/.test(file);
 const st=fs.statSync(file),etag=`"${st.size.toString(16)}-${st.mtimeMs.toString(16)}"`;
 if(req.headers['if-none-match']===etag){res.writeHead(304).end();return;}
 res.writeHead(200,{'content-type':TYPES[ext]??'application/octet-stream','content-length':st.size,etag,'cache-control':ext==='.html'?'no-cache':hashed?'public, max-age=31536000, immutable':'public, max-age=86400'});
 fs.createReadStream(file).pipe(res);
}

// ---------- abuse limits (server/guard.ts) ----------
const LOCK=lockdown(DATA);
const apiPerIp=new Limiter(120,60),regPerIp=new Limiter(5,5),regPerIpDay=new Limiter(20/1440,20),regGlobal=new Limiter(60,60),loginPerIp=new Limiter(15,10),loginFails=new LoginGuard(8),loginFailsIp=new LoginGuard(30);
const wsPerIp=new Limiter(30,20),wsConns=new Conns(),WS_PER_IP=8;
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url??'/','http://x');
  if(!url.pathname.startsWith('/api/')){if(req.method==='GET'||req.method==='HEAD')return serveStatic(req,res);return void res.writeHead(405).end();}
  const ip=clientIp(req);
  if(!apiPerIp.take(ip))return json(res,429,{error:'Thao tác quá nhanh, thử lại sau ít giây'},{'retry-after':'10'});
  if(url.pathname==='/api/health')return json(res,200,{ok:true,online:pilgrims.size,snapsPerSec:snapRate,tickMs:tickCost,sendMs:sendCost});
  if(url.pathname==='/api/me'&&req.method==='GET'){const u=sessionUser(req);return u?json(res,200,publicUser(u)):json(res,401,{error:'Chưa đăng nhập'});}
  if(req.method!=='POST')return json(res,405,{error:'method'});
  // Same-origin guard for state-changing calls (cookies are SameSite=Lax as well).
  if(!sameOrigin(req))return json(res,403,{error:'Yêu cầu không hợp lệ (sai nguồn trang)'});
  const body=await readBody(req);
  if(url.pathname==='/api/register'){
   if(!LOCK.get().register)return json(res,503,{error:LOCK.get().message||'Chùa tạm ngưng đăng ký tài khoản mới, xin quay lại sau'});
   if(!regPerIp.take(ip)||!regPerIpDay.take(ip))return json(res,429,{error:'Thử lại sau ít phút'});
   if(!regGlobal.take('all'))return json(res,429,{error:'Đang có quá nhiều người đăng ký, thử lại sau ít phút'});
   const username=String(body.username??'').trim().toLowerCase();const e=checkUsername(username)??checkPassword(body.password);if(e)return json(res,400,{error:e});
   const display=cleanDisplayName(body.displayName);if(!display)return json(res,400,{error:'Tên hiển thị 2–24 ký tự, không dùng ký tự lạ hay từ không phù hợp'});
   if(q.userByName.get(username))return json(res,409,{error:'Tên đăng nhập đã có người dùng'});
   const hashed=await hashGate.run(()=>hashPass(body.password));if(!hashed)return json(res,503,{error:'Máy chủ đang bận, thử lại sau giây lát'},{'retry-after':'3'});
   const pass=await hashed;if(q.userByName.get(username))return json(res,409,{error:'Tên đăng nhập đã có người dùng'});
   const r=q.addUser.run(username,display,pass,body.female?1:0,Date.now());const id=Number(r.lastInsertRowid);
   if(body.outfit!==undefined)q.setOutfit.run(cleanOutfit(body.outfit,!!body.female,id),id); // chosen in the character creator
   const u=q.userById.get(id) as User;
   return json(res,201,publicUser(u),{'set-cookie':startSession(u.id)});
  }
  if(url.pathname==='/api/login'){
   // brute force: per IP, and per account across IPs (8 wrong passwords: that account waits 15 minutes)
   const name=String(body.username??'').trim().toLowerCase().slice(0,40);
   if(!loginPerIp.take(ip))return json(res,429,{error:'Thử lại sau ít phút'});
   const wait=Math.max(loginFails.wait('u:'+name),loginFailsIp.wait('ip:'+ip));if(wait)return json(res,429,{error:`Đăng nhập sai quá nhiều lần, thử lại sau ${Math.ceil(wait/60)} phút`},{'retry-after':String(wait)});
   if(typeof body.password!=='string'||body.password.length>72)return json(res,401,{error:'Sai tên đăng nhập hoặc mật khẩu'});
   const u=q.userByName.get(name) as User|undefined;
   const check=await hashGate.run(()=>u?verifyPass(body.password,u.pass):hashPass(body.password).then(()=>false));   // unknown names cost the same time
   if(check===null)return json(res,503,{error:'Máy chủ đang bận, thử lại sau giây lát'},{'retry-after':'3'});
   if(!u||!(await check)){loginFails.fail('u:'+name);loginFailsIp.fail('ip:'+ip);return json(res,401,{error:'Sai tên đăng nhập hoặc mật khẩu'});}
   loginFails.ok('u:'+name);
   return json(res,200,publicUser(u),{'set-cookie':startSession(u.id)});
  }
  if(url.pathname==='/api/logout'){const t=cookieOf(req,'al_sid');if(t)q.dropSession.run(t);return json(res,200,{ok:true},{'set-cookie':`al_sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${SECURE?'; Secure':''}`});}
  if(url.pathname==='/api/profile'){const u=sessionUser(req);if(!u)return json(res,401,{error:'Chưa đăng nhập'});q.setFemale.run(body.female?1:0,u.id);return json(res,200,publicUser(q.userById.get(u.id) as User));}
  return json(res,404,{error:'not found'});
 }catch(err){console.error(err);if(!res.headersSent)json(res,500,{error:'Lỗi máy chủ'});}
});

// ---------- the shared temple ----------
type Pilgrim={info:PlayerInfo;ws:WebSocket;x:number;y:number;z:number;yaw:number;a:number;lastMove:number;sitSince:number;lastBow:number;bowsDone:number;towerStep:number;towerMax:number;lastIncense:number;lastPray:number;lastRelease:number;lastRitual:number;msgs:number;win:number;merit:Merit};
const pilgrims=new Map<number,Pilgrim>();
const send=(ws:WebSocket,m:ServerMsg)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m));};
const all=(m:ServerMsg,except?:number)=>{const s=JSON.stringify(m);for(const p of pilgrims.values())if(p.info.id!==except&&p.ws.readyState===WebSocket.OPEN)p.ws.send(s);};
const refuge=createRefuge(db,all);
const award=(p:Pilgrim,d:Partial<Merit>,note?:string)=>{q.addMerit.run(d.wheel??0,d.incense??0,d.bows??0,d.sits??0,d.steps??0,d.mo??0,d.chuong??0,d.chuoi??0,p.info.id);for(const k of ['wheel','incense','bows','sits','steps','mo','chuong','chuoi']as const)p.merit[k]=(p.merit[k]??0)+(d[k]??0);send(p.ws,{t:'merit',m:p.merit,note});refuge.changed();};

const wheels=new Map<WheelId,{m:WheelMotion;pushers:Set<number>}>(PRAYER_WHEEL_SITES.map(s=>[s.id,{m:new WheelMotion(),pushers:new Set<number>()}]));
let releases:Release[]=[],releaseSeq=Math.floor(Date.now()/1000)%1000000*10;
const liveReleases=()=>{const now=Date.now();releases=releases.filter(r=>now-r.t<RELEASE_LIFE[r.kind]*1000);return releases;};
let sticks:Stick[]=[];
// friends, chat and calls (anh Thanh 2026-11-06)
const social=createSocial(db,()=>pilgrims,(id,m)=>{const p=pilgrims.get(id);if(p)send(p.ws,m);});

// call offers/answers (SDP) need more room than the 4 KB game messages; those stay capped below
const wss=new WebSocketServer({noServer:true,maxPayload:24576});
server.on('upgrade',(req,socket,head)=>{
 const url=new URL(req.url??'/','http://x');
 if(url.pathname!=='/ws'||!sameOrigin(req)){socket.destroy();return;}
 const ip=clientIp(req);
 if(!wsPerIp.take(ip)||wsConns.count(ip)>=WS_PER_IP){socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');socket.destroy();return;}
 if(!LOCK.get().join){socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');socket.destroy();return;}
 const u=sessionUser(req);if(!u){socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');socket.destroy();return;}
 if(pilgrims.size>=NET.maxPlayers&&!pilgrims.has(u.id)){socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n');socket.destroy();return;}
 wss.handleUpgrade(req,socket,head,ws=>{wsConns.add(ip);ws.once('close',()=>wsConns.drop(ip));join(ws,u);});
});
function join(ws:WebSocket,u:User){
 const old=pilgrims.get(u.id);if(old){send(old.ws,{t:'kick',reason:'Tài khoản vừa vào chùa từ nơi khác'});old.ws.close();pilgrims.delete(u.id);all({t:'leave',id:u.id});social.leave(u.id);}
 const info:PlayerInfo={id:u.id,name:u.display,female:!!u.female,outfit:cleanOutfit(u.outfit,!!u.female,u.id),prayer:cleanPrayer(u.prayer??'')||''};
 const p:Pilgrim={info,ws,...SPAWN,lastPray:0,lastRelease:0,lastRitual:0,bowsDone:0,towerStep:-1,towerMax:-1,a:0,lastMove:Date.now(),sitSince:0,lastBow:0,lastIncense:0,msgs:0,win:Date.now(),merit:getMerit(u.id)};(ws as any).alive=true;ws.on('pong',()=>{(ws as any).alive=true;});
 pilgrims.set(u.id,p);
 send(ws,{t:'welcome',you:info,players:[...pilgrims.values()].filter(o=>o!==p).map(o=>o.info),sticks,merit:p.merit,now:Date.now(),spawn:SPAWN,releases:liveReleases(),meritRank:refuge.leaders(),refugeCertificate:refuge.certificate(u.id)});
 all({t:'join',p:info},u.id);
 social.join(u.id);
 ws.on('message',raw=>{
  {const now=Date.now();if(now-p.win>1000){p.win=now;p.msgs=0;}if(++p.msgs>40){ws.close(1008,'flood');return;}}
  const str=String(raw);let m:ClientMsg;try{m=JSON.parse(str);}catch{return;}
  if(!m||typeof m!=='object'||pilgrims.get(u.id)!==p)return;
  if(str.length>4096&&m.t!=='call')return;
  if(social.handle(u.id,m))return;
  if(m.t==='refuge'){send(ws,refuge.handle(p,m));return;}
  if(m.t==='state'){
   const now=Date.now();
   if(![m.x,m.y,m.z,m.yaw,m.a].every(Number.isFinite))return;
   // Nobody is pulled back (anh Thanh): the position is only kept inside the walkable world. After a reconnect the
   // client's first state carries where the pilgrim really is, so they continue from there.
   const c=clampWorld(m.x,m.y,m.z);p.x=c.x;p.y=c.y;p.z=c.z;p.yaw=m.yaw;p.lastMove=now;
   const a=Math.max(0,Math.min(ACTS.length-1,Math.round(m.a)));
   if(ACTS[a]==='sit'&&ACTS[p.a]!=='sit')p.sitSince=now;
   // every full bow counts (+1 each, BOW_SECONDS per bow while the pilgrim keeps bowing)
   if(ACTS[a]==='bow'&&ACTS[p.a]!=='bow'){p.lastBow=now;p.bowsDone=0;}
   if(ACTS[a]==='bow'){const done=Math.floor((now-p.lastBow)/(BOW_SECONDS*1000));if(done>p.bowsDone){award(p,{bows:done-p.bowsDone},'+'+(done-p.bowsDone)+' công đức · một lạy');p.bowsDone=done;}}
   // stupa stairs: +1 per new step climbed on foot in this visit (lift rides move too many steps per update to count)
   const tp=towerProgress(p.x,p.z,p.y);if(!tp){p.towerStep=-1;p.towerMax=-1;}else{const s=tp.step;if(p.towerStep<0){p.towerStep=s;p.towerMax=s;}else{if(s>p.towerMax&&s-p.towerStep<=WALK_STEP_LIMIT&&s>p.towerStep)award(p,{steps:s-p.towerMax});if(s>p.towerMax)p.towerMax=s;p.towerStep=s;}}
   p.a=a;const interrupted=refuge.positionChanged(p);if(interrupted)send(ws,interrupted);
  }else if(m.t==='incense'){
   const now=Date.now(),site=INCENSE_SITES.find(s=>s.id===m.site);
   if(!site||nearIncense(p)?.id!==site.id){send(ws,{t:'notice',text:'Hãy đến gần bàn hương để thắp nhang'});return;}
   if(now-p.lastIncense<NET.incenseCooldown*1000){send(ws,{t:'notice',text:'Xin chờ giây lát rồi thắp tiếp'});return;}
   p.lastIncense=now;const st:Stick={site:site.id,by:p.info.name,t:now};
   sticks.push(st);const onSite=sticks.filter(s=>s.site===site.id);if(onSite.length>NET.maxSticksPerSite)sticks.splice(sticks.indexOf(onSite[0]),1);
   all({t:'sticks',add:[st]});award(p,{incense:1},'+1 công đức · dâng hương '+site.label);
  }else if(m.t==='ritual'){
const now=Date.now(),kind=m.kind;
if(kind!=='mo'&&kind!=='chuong'&&kind!=='chuoi')return;
const site=nearIncense(p);
if(!site||!site.id.startsWith('hall-')){send(ws,{t:'notice',text:'Hãy vào chánh điện để gõ mõ, gõ chuông, lần tràng hạt'});return;}
if(now-p.lastRitual<NET.ritualCooldown*1000){send(ws,{t:'notice',text:'Xin chờ giây lát rồi gõ tiếp'});return;}
p.lastRitual=now;
const note=kind==='mo'?'+1 công đức · gõ mõ':kind==='chuong'?'+1 công đức · gõ chuông':'+1 công đức · lần tràng hạt';
award(p,{[kind]:1} as Partial<Merit>,note);
}else if(m.t==='outfit'){
   const outfit=cleanOutfit(m.outfit,p.info.female,p.info.id);q.setOutfit.run(outfit,p.info.id);p.info.outfit=outfit;all({t:'outfit',id:p.info.id,outfit});
  }else if(m.t==='release'){
   // lotus lanterns / carp from the last river step, sky lanterns anywhere outdoors; the server's own position of the pilgrim is used
   const now=Date.now(),kind=RELEASE_KINDS.find(k=>k===m.kind),text=cleanPrayer(m.text??'');
   if(!kind||text===null){send(ws,{t:'notice',text:'Lời cầu nguyện tối đa 40 ký tự, không dùng ký tự lạ hay từ không phù hợp'});return;}
   if(now-p.lastRelease<RELEASE_COOLDOWN*1000){send(ws,{t:'notice',text:'Xin chờ giây lát rồi thả tiếp'});return;}
   if(kind!=='sky'&&!onRiverStep(p)){send(ws,{t:'notice',text:'Hãy xuống bậc thang cuối sát mặt sông để thả'});return;}
   p.lastRelease=now;const w=waterStart(p.x),r:Release=kind==='sky'?{id:++releaseSeq,kind,x:p.x,y:p.y+2.3,z:p.z,t:now,text}:{id:++releaseSeq,kind,x:w.x,y:WATER_Y,z:w.z,t:now,text};
   releases.push(r);const same=releases.filter(o=>o.kind===kind);if(same.length>RELEASE_CAP[kind])releases.splice(releases.indexOf(same[0]),1);
   all({t:'released',r:[r]});
  }else if(m.t==='pray'){
   const now=Date.now(),text=cleanPrayer(m.text);
   if(text===null){send(ws,{t:'notice',text:'Lời cầu nguyện tối đa 40 ký tự, không dùng ký tự lạ hay từ không phù hợp'});return;}
   if(now-p.lastPray<3000){send(ws,{t:'notice',text:'Xin chờ giây lát rồi đổi lời cầu nguyện'});return;}
   p.lastPray=now;q.setPrayer.run(text||null,p.info.id);p.info.prayer=text;all({t:'pray',id:p.info.id,text});
  }else if(m.t==='wheel'){
   const site=PRAYER_WHEEL_SITES.find(s=>s.id===m.id),w=site&&wheels.get(site.id);
   if(!site||!w||!canReachWheel(p,site,true)){send(ws,{t:'notice',text:'Hãy đến sát chân kinh luân'});return;}
   if(w.m.push())w.pushers.add(p.info.id);
  }
 });
 ws.on('close',()=>{if(pilgrims.get(u.id)===p){pilgrims.delete(u.id);all({t:'leave',id:u.id});social.leave(u.id);}});
 ws.on('error',()=>ws.close());
}

// Snapshots, nearest first (anh Thanh 2026-11-06: room for 500–1000 pilgrims): each pilgrim gets the NET.snapNear closest
// others every tick and the next NET.snapFar every 5th tick (far ones move little on screen), all on roughly the same floor
// within view range. Sending everyone to everyone grew with the square of the crowd (1000 → ~450 MB/s); this stays ~25 KB/s each.
// Positions are bucketed into a 50 m grid so each pilgrim only looks at nearby cells.
let snapTick=0,snapRate=0,tickCost=0,sendCost=0,sendAcc=0,snapCount=0,snapCountAt=Date.now();
const fx=(v:number,k:number)=>String(Math.round(v*k)/k);
setInterval(()=>{
 // big crowds get 5 snapshots a second instead of 10 (clients widen their interpolation delay to match)
 const every=pilgrims.size>250?2:1;if(++snapTick%every)return;
 const tickStart=performance.now();if(Date.now()-snapCountAt>=5000){snapRate=Math.round(snapCount/((Date.now()-snapCountAt)/1000)*10)/10;snapCount=0;snapCountAt=Date.now();}snapCount++;
 const list=[...pilgrims.values()],n=list.length,far=snapTick%(5*every)===0,CELL=12,want=NET.snapNear+(far?NET.snapFar:0),R2=NET.viewRadius*NET.viewRadius;
 // per tick: positions in flat arrays, each pilgrim's row written once, a 12 m grid of indices (no per-candidate objects)
 const X=new Float64Array(n),Y=new Float64Array(n),Z=new Float64Array(n),row:string[]=new Array(n),grid=new Map<number,number[]>(),cellKey=(ix:number,iz:number)=>(ix+2000)*8192+(iz+2000);
 for(let i=0;i<n;i++){const o=list[i];X[i]=o.x;Y[i]=o.y;Z[i]=o.z;row[i]=`[${o.info.id},${fx(o.x,100)},${fx(o.y,100)},${fx(o.z,100)},${fx(o.yaw,1000)},${o.a}]`;
  const k=cellKey(Math.floor(o.x/CELL),Math.floor(o.z/CELL));let g=grid.get(k);if(!g)grid.set(k,g=[]);g.push(i);}
 // candidate keys = squared distance × 4096 + index, sorted natively (numeric typed-array sort, no comparator)
 let keys=new Float64Array(256);const maxRing=Math.ceil(NET.viewRadius/CELL)+1;
 for(let i=0;i<n;i++){
  const p=list[i];if(p.ws.readyState!==WebSocket.OPEN||p.ws.bufferedAmount>262144)continue;   // a stalled client skips ticks instead of piling up memory
  let m=0;const px=X[i],py=Y[i],pz=Z[i];
  const take=(j:number)=>{if(j===i)return;const dy=Y[j]-py;if(dy>30||dy<-30)return;const dx=X[j]-px,dz=Z[j]-pz,d2=dx*dx+dz*dz;if(d2>R2)return;if(m===keys.length){const k2=new Float64Array(m*2);k2.set(keys);keys=k2;}keys[m++]=Math.floor(d2)*4096+j;};
  // small crowd: everyone; big crowd: grow square rings of cells until enough are found, plus one ring for accuracy
  if(n<=want*2){for(let j=0;j<n;j++)take(j);}
  else{const cx=Math.floor(px/CELL),cz=Math.floor(pz/CELL);
   for(let r=0,stop=-1;r<=maxRing;r++){
    for(let ix=cx-r;ix<=cx+r;ix++){const edge=ix===cx-r||ix===cx+r,step=edge?1:2*r||1;for(let iz=cz-r;iz<=cz+r;iz+=step){const g=grid.get(cellKey(ix,iz));if(g)for(let q=0;q<g.length;q++)take(g[q]);}}
    if(stop<0&&m>=want&&r>=1)stop=r+1;if(stop>=0&&r>=stop)break;}}
  const sel=keys.subarray(0,m).sort(),cnt=Math.min(m,far?want:NET.snapNear);let out='';
  for(let k=0;k<cnt;k++)out+=(k?',':'')+row[sel[k]%4096];
  const s0=performance.now();p.ws.send(`{"t":"snap","r":[${out}]}`);sendAcc+=performance.now()-s0;}
 sendCost=Math.round((sendCost*.9+sendAcc*.1)*10)/10;sendAcc=0;tickCost=Math.round((tickCost*.9+(performance.now()-tickStart)*.1)*10)/10;
},1000/NET.snapHz);
// Seated meditation: one merit per full minute on the cushion.
setInterval(()=>{const now=Date.now();for(const p of pilgrims.values())if(ACTS[p.a]==='sit'&&p.sitSince&&now-p.sitSince>=60e3){p.sitSince=now;award(p,{sits:1},'+1 công đức · một phút thiền định');}},500);
// Wheels: exact integration, awards each completed turn to everyone who pushed during it.
let lastWheel=Date.now(),wheelBroadcast=0;
setInterval(()=>{
 const now=Date.now(),dt=(now-lastWheel)/1000;lastWheel=now;let moving=false;
 for(const [id,w]of wheels){const turns=w.m.tick(dt);if(w.m.speed>0)moving=true;
  if(turns){for(const uid of w.pushers){const p=pilgrims.get(uid);if(p)award(p,{wheel:turns},`+${turns} công đức · kinh luân ${id==='west'?'Tây':'Đông'}`);}w.pushers.clear();}}
 if(moving||now-wheelBroadcast>2000){wheelBroadcast=now;all({t:'wheels',w:[...wheels].map(([id,w])=>({id,angle:Math.round(w.m.angle*1000)/1000,speed:Math.round(w.m.speed*1000)/1000}))});}
 const cut=now-NET.incenseLife*1000;if(sticks.length&&sticks[0].t<cut)sticks=sticks.filter(s=>s.t>=cut);
},200);
// Keep idle sockets honest.
setInterval(()=>{for(const p of pilgrims.values()){if((p.ws as any).alive===false){p.ws.terminate();continue;}(p.ws as any).alive=false;p.ws.ping();}},30e3).unref();

// slow or stuck requests are cut off (Caddy and Cloudflare sit in front; these are the last line)
server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;
server.listen(PORT,HOST,()=>console.log(`Chùa An Liên online: http://${HOST}:${PORT} · static ${STATIC} · data ${DATA}`));
const stop=()=>{for(const p of pilgrims.values())send(p.ws,{t:'notice',text:'Máy chủ đang khởi động lại, vui lòng chờ…'});server.close();db.close();process.exit(0);};
process.on('SIGINT',stop);process.on('SIGTERM',stop);
