import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer} from 'ws';
import {LiveBus,username,settingsFrom} from './model.ts';
import {ParticipantRegistry} from './participants.ts';

const dist=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
export function createLiveTool({connectorFactory,now,connectTimeout=25000}={}){
 const bus=new LiveBus(now),participants=new ParticipantRegistry(),clients=new Set();let conn=null,epoch=0,timer,closed=false;
 let status={phase:'idle',username:'mai.hoaithanh',message:'Chưa kết nối. Mở TikTok LIVE, sau đó bấm Kết nối LIVE.',roomId:''};
 const snapshot=()=>({status,settings:bus.settings,totals:bus.totals,history:bus.history,participants:participants.snapshot()});
 const broadcast=(type,data)=>{const json=JSON.stringify({type,data});for(const c of clients)if(c.readyState===1){if(c.bufferedAmount>256000)c.close(1013);else c.send(json);}};
 const state=()=>broadcast('state',snapshot());
 const dispose=c=>{if(c)try{Promise.resolve(c.disconnect()).catch(()=>{});}catch{}};
 function stop(){epoch++;clearTimeout(timer);const old=conn;conn=null;dispose(old);status={...status,phase:'idle',roomId:'',message:'Đã ngắt kết nối LIVE.'};state();}
 function receive(kind,raw,demo=false){const e=bus.ingest(kind,raw,demo);if(e){broadcast('event',e);broadcast('totals',bus.totals);const change=participants.apply(e);if(change.changed)broadcast('participant',change);else if(change.action==='full')broadcast('seats-full',{message:'Đã đủ 1.500 chỗ ngồi.'});}return e;}
 async function begin(handle){
  if(status.phase==='connecting')throw new Error('Đang kết nối. Chờ kết quả hoặc bấm Ngắt kết nối.');
  const name=username(handle);stop();participants.clearDemo();const generation=++epoch;status={phase:'connecting',username:name,message:'Đang tìm phòng LIVE…',roomId:''};state();
  try{
   const make=connectorFactory??(async name=>{const {TikTokLiveConnection,SignConfig}=await import('tiktok-live-connector');
    // Explicitly ignore a machine-level SIGN_API_KEY: this tool has no paid-service authorization.
    SignConfig.apiKey=undefined;SignConfig.basePath='https://api.eulerstream.com';SignConfig.cachedInstance=undefined;
    return new TikTokLiveConnection(name,{processInitialData:false,enableExtendedGiftInfo:false,authenticateWs:false,webClientOptions:{timeout:{request:12000}},wsClientOptions:{handshakeTimeout:12000}});});
   const c=await make(name);if(generation!==epoch||closed){dispose(c);return;}conn=c;
   for(const kind of ['member','like','share','chat'])c.on(kind,raw=>{if(generation===epoch)receive(kind==='member'?'join':kind,raw);});
   c.on('error',()=>{if(generation===epoch){status={...status,message:'Lỗi nhận dữ liệu TikTok. Nếu mất kết nối, bấm Ngắt rồi kết nối lại.'};state();}});
   c.on('disconnected',()=>{if(generation===epoch){clearTimeout(timer);status={...status,phase:'offline',message:'Kết nối đã đóng. Bấm Kết nối LIVE để thử lại.'};state();}});
   c.on('streamEnd',()=>{if(generation===epoch){stop();status={...status,phase:'offline',message:'Phiên LIVE đã kết thúc.'};state();}});
   timer=setTimeout(()=>{if(generation===epoch){stop();status={...status,phase:'error',message:'Hết thời gian kết nối. Kiểm tra tài khoản đang LIVE và mạng, rồi thử lại.'};state();}},connectTimeout);timer.unref();
   const room=await c.connect();if(generation!==epoch||closed){dispose(c);return;}clearTimeout(timer);status={...status,phase:'connected',roomId:String(room?.roomId??''),message:'Đang nhận sự kiện TikTok LIVE.'};state();
  }catch(error){if(generation!==epoch)return;clearTimeout(timer);dispose(conn);conn=null;epoch++;const offline=/offline|not live|not currently live|UserOffline|isn't online/i.test(`${error?.constructor?.name} ${String(error)}`);status={...status,phase:offline?'offline':'error',message:offline?'Tài khoản chưa phát LIVE. Mở LIVE rồi bấm kết nối lại.':'Chưa kết nối được TikTok (mạng, giới hạn hoặc dịch vụ ký kết nối). Không tự dùng gói trả phí; có thể thử lại hoặc chạy Thử sự kiện.'};state();}
 }
 const allowed=req=>{try{const h=new URL(`http://${req.headers.host}`);if(!['127.0.0.1','localhost'].includes(h.hostname))return false;const origin=req.headers.origin;return !origin||origin===h.origin;}catch{return false;}};
 const json=(res,code,value)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 const server=http.createServer(async(req,res)=>{
  if(!allowed(req))return json(res,403,{error:'Chỉ nhận yêu cầu từ công cụ trên máy này.'});
  try{
   const url=new URL(req.url,'http://localhost');
   if(req.method==='GET'&&url.pathname==='/api/status')return json(res,200,snapshot());
   if(req.method==='POST'&&url.pathname.startsWith('/api/')){
    if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'Cần dữ liệu JSON.'});
    let body='';for await(const chunk of req){body+=chunk;if(body.length>8192)return json(res,413,{error:'Dữ liệu quá lớn.'});}const data=JSON.parse(body||'{}');
    switch(url.pathname){
     case'/api/connect':if(status.phase==='connecting')return json(res,409,{error:'Đang kết nối.'});username(data.username);void begin(data.username);return json(res,202,snapshot());
     case'/api/disconnect':stop();return json(res,200,snapshot());
     case'/api/settings':bus.settings=settingsFrom(data,bus.settings);participants.block(bus.settings.blocked);state();return json(res,200,snapshot());
     case'/api/seats/clear-demo':participants.clearDemo();broadcast('participants',participants.snapshot());return json(res,200,snapshot());
     case'/api/seats/reset':participants.clear();broadcast('participants',participants.snapshot());return json(res,200,snapshot());
     case'/api/seats/focus':{const person=participants.snapshot().people.find(p=>p.key===data.key);if(!person)return json(res,404,{error:'Không tìm thấy người đang ngồi.'});broadcast('focus-seat',{seatId:person.seatId});return json(res,200,{ok:true});}
     case'/api/demo':{if(!['join','like','share','chat'].includes(data.kind))throw new Error('Loại sự kiện không hợp lệ.');const e=receive(data.kind,{name:data.name||'Thiện hữu An Lạc',text:data.text||'Nam mô A Di Đà Phật.',count:5},true);return json(res,200,{event:e});}
     case'/api/clear':bus.clear();broadcast('clear',{});state();return json(res,200,snapshot());
     default:return json(res,404,{error:'Không có tác vụ này.'});
    }
   }
   if(req.method!=='GET')return json(res,405,{error:'Không hỗ trợ phương thức.'});
   const path=url.pathname==='/'?'/live-control.html':url.pathname==='/overlay'?'/live-overlay.html':url.pathname==='/live-seats'?'/lay-assembly.html':url.pathname==='/temple'?'/index.html':decodeURIComponent(url.pathname),file=resolve(dist,'.'+path);
   if(!file.startsWith(dist+sep))return json(res,403,{error:'Không hợp lệ.'});
   const bytes=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(bytes);
  }catch(e){json(res,e instanceof SyntaxError?400:400,{error:e?.code==='ENOENT'?'Chưa có bản build. Chạy npm run build.':e?.message||'Yêu cầu không hợp lệ.'});}
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:1024});
 server.on('upgrade',(req,socket,head)=>{if(!allowed(req)||new URL(req.url,'http://localhost').pathname!=='/events'){socket.destroy();return;}wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));});
 wss.on('connection',ws=>{clients.add(ws);ws.send(JSON.stringify({type:'state',data:snapshot()}));ws.on('close',()=>clients.delete(ws));ws.on('error',()=>clients.delete(ws));});
 return {server,bus,snapshot,receive,async close(){closed=true;stop();for(const c of clients)c.terminate();await new Promise(r=>wss.close(r));await new Promise(r=>server.close(r));}};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const app=createLiveTool();const port=Number(process.env.LIVE_PORT)||5197;
 app.server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Cổng ${port} đang được dùng. Nếu tool đã mở, dùng http://127.0.0.1:${port}/`:'Không mở được tool:',e.message);process.exitCode=1;});
 app.server.listen(port,'127.0.0.1',()=>console.log(`An Liên LIVE: http://127.0.0.1:${port}/ | Overlay: http://127.0.0.1:${port}/overlay`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>void app.close());
}
