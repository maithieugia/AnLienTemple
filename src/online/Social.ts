/**
 * Friends, chat and 1-1 voice/video calls in the online temple (anh Thanh 2026-11-06: "lấy bên Palo gán vào game này").
 * Ported from Palo's model: friend requests, one conversation per pair, WebRTC calls signalled through the game server
 * (server/social.ts). Media goes peer to peer; the server only relays invite/accept/offer/answer/ice between two friends.
 * Lessons kept from Palo's callStore: both sides add their tracks before negotiating (so the callee's video is sendrecv —
 * Palo's "bên nhận không có hình"), ICE candidates wait until the remote description is set, the callee goes straight to
 * "connecting" after pressing Nghe (no second ring), and the remote <video> is played explicitly after it gets its stream.
 */
import type {ChatMsg,ClientMsg,FoundUser,FriendRow,PlayerInfo,ServerMsg} from './protocol';
import {CHAT_MAX} from './protocol';

type Call={id:string;peer:number;name:string;video:boolean;role:'caller'|'callee';status:'ringing-out'|'ringing-in'|'connecting'|'live';
 pc?:RTCPeerConnection;local?:MediaStream;remote:MediaStream;ice:RTCIceCandidateInit[];haveRemote:boolean;t0:number;mic:boolean;cam:boolean;facing:'user'|'environment'};

const CSS=`
#al-soc-btn{position:fixed;right:12px;top:62px;z-index:8;font:600 13px 'Segoe UI',sans-serif;color:#fff3d6;background:rgba(32,40,36,.88);border:1px solid #a3884b;border-radius:10px;padding:9px 12px;cursor:pointer}
#al-soc-btn i{font-style:normal;display:none;margin-left:6px;background:#c8321e;color:#fff;border-radius:9px;padding:0 6px;font-size:11px;line-height:17px}
#al-soc-btn.has i{display:inline-block}
body.al-compact #al-soc-btn{right:calc(max(10px,env(safe-area-inset-right)) + 54px);top:max(8px,env(safe-area-inset-top));height:46px;border-radius:23px;padding:0 14px;background:rgba(32,22,14,.88);border-color:#c9a65a}
#al-soc{position:fixed;right:12px;top:110px;bottom:90px;width:360px;z-index:9;display:none;flex-direction:column;background:rgba(22,18,12,.96);border:1px solid #a3884b;border-radius:14px;color:#f4e8c8;font:14px 'Segoe UI',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.5);overflow:hidden}
#al-soc.on{display:flex}
body.al-compact #al-soc{inset:0;width:auto;border-radius:0;border:0;padding-top:env(safe-area-inset-top)}
#al-soc header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #4a3d22}
#al-soc header b{flex:1;font-size:15px;color:#ffe2a0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#al-soc button{font:600 13px 'Segoe UI',sans-serif;color:#fff3d6;background:#3a3122;border:1px solid #806a3a;border-radius:8px;padding:6px 10px;cursor:pointer}
#al-soc button.ok{background:#7a5a1c;border-color:#e0b860}#al-soc button.no{background:#4a2420;border-color:#9a4a3a}
#al-soc button.ic{padding:6px 8px;font-size:15px;line-height:1}
#al-soc .tabs{display:flex;gap:4px;padding:8px 10px 0}#al-soc .tabs button{flex:1;background:transparent;border-color:#4a3d22}#al-soc .tabs button.on{background:#5a4520;border-color:#c9a65a}
#al-soc .body{flex:1;overflow:auto;padding:8px 10px}
#al-soc .row{display:flex;align-items:center;gap:8px;padding:8px;border-radius:10px;cursor:default}
#al-soc .row:hover{background:rgba(255,230,160,.06)}
#al-soc .av{width:36px;height:36px;border-radius:50%;background:#5a4520;color:#ffe2a0;display:grid;place-items:center;font-weight:700;flex:none;position:relative}
#al-soc .av.on::after{content:'';position:absolute;right:0;bottom:0;width:10px;height:10px;border-radius:50%;background:#3cc46a;border:2px solid #16120c}
#al-soc .who{flex:1;min-width:0}#al-soc .who div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#al-soc .who small{color:#b9a982;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#al-soc .badge{background:#c8321e;color:#fff;border-radius:9px;padding:0 6px;font-size:11px;line-height:17px}
#al-soc h4{margin:10px 4px 4px;color:#d9b25c;font-size:12px;text-transform:uppercase;letter-spacing:.05em}
#al-soc .empty{color:#a8987a;padding:14px 6px;text-align:center;line-height:1.5}
#al-soc input,#al-soc textarea{width:100%;box-sizing:border-box;background:#120f0a;color:#fff3d6;border:1px solid #806a3a;border-radius:8px;padding:8px 10px;font:14px 'Segoe UI',sans-serif}
#al-soc .msgs{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:4px}
#al-soc .m{max-width:78%;padding:7px 10px;border-radius:12px;line-height:1.35;white-space:pre-wrap;word-break:break-word;background:#3a3122;align-self:flex-start}
#al-soc .m.me{background:#7a5a1c;align-self:flex-end}
#al-soc .m small{display:block;font-size:10px;color:#cdbb92;margin-top:2px;text-align:right}
#al-soc .m.call{align-self:center;background:transparent;border:1px dashed #6a5a3a;color:#d8c8a0;font-size:12px}
#al-soc .send{display:flex;gap:6px;padding:8px 10px;border-top:1px solid #4a3d22;align-items:flex-end}
#al-soc .send textarea{resize:none;height:38px;max-height:110px}
#al-soc .acts{display:flex;gap:6px;justify-content:flex-end;padding:0 8px 8px}
#al-soc label.pref{display:flex;gap:8px;align-items:center;padding:12px 6px 4px;color:#cdbb92;font-size:13px;cursor:pointer}#al-soc label.pref input{width:auto}
#al-ring{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:12;display:none;flex-direction:column;align-items:center;gap:10px;padding:18px 22px;background:rgba(22,18,12,.97);border:1px solid #d9b25c;border-radius:16px;color:#ffe2a0;font:15px 'Segoe UI',sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.6);text-align:center}
#al-ring.on{display:flex}#al-ring b{font-size:18px}
#al-ring div{display:flex;gap:10px}#al-ring button{font:600 14px 'Segoe UI';border-radius:22px;padding:10px 16px;cursor:pointer;color:#fff;border:0}
#al-call{position:fixed;right:12px;bottom:90px;width:340px;height:440px;z-index:11;display:none;background:#0b0907;border:1px solid #a3884b;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.6);color:#fff3d6;font:14px 'Segoe UI',sans-serif}
#al-call.on{display:block}
body.al-compact #al-call{inset:0;width:auto;height:auto;border-radius:0;border:0}
#al-call video.rv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#0b0907}
#al-call video.lv{position:absolute;right:10px;top:10px;width:96px;height:128px;object-fit:cover;border-radius:10px;border:1px solid #a3884b;background:#222;transform:scaleX(-1);z-index:2}
#al-call .face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:1}
#al-call .face .big{width:96px;height:96px;border-radius:50%;background:#5a4520;color:#ffe2a0;display:grid;place-items:center;font-size:40px;font-weight:700}
#al-call .face b{font-size:18px;color:#ffe2a0}#al-call .face span{color:#cdbb92}
#al-call .bar{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:12px;padding:14px 10px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(0,0,0,.75));z-index:3}
#al-call .bar button{width:50px;height:50px;border-radius:50%;border:1px solid #806a3a;background:rgba(40,32,20,.9);color:#fff;font-size:20px;cursor:pointer}
#al-call .bar button.off{background:#5a5a5a}#al-call .bar button.end{background:#c8321e;border-color:#ff7a5a}
#al-call .top{position:absolute;left:10px;top:10px;z-index:3;text-shadow:0 1px 3px #000}
`;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const initial=(n:string)=>(n.trim()[0]??'?').toUpperCase();
const hhmm=(t:number)=>{const d=new Date(t),n=new Date();const s=d.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});return d.toDateString()===n.toDateString()?s:d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})+' '+s;};
const clock=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;

/** Soft temple-bell style ring (incoming) or ring-back (outgoing), made with WebAudio — no extra asset. */
class Ringer{private ctx?:AudioContext;private h?:number;
 start(kind:'in'|'out'){this.stop();try{this.ctx??=new AudioContext();}catch{return;}const ctx=this.ctx;void ctx.resume();
  const beep=()=>{const t=ctx.currentTime;for(const [f,d]of (kind==='in'?[[880,0],[660,.28]]:[[440,0]]) as [number,number][]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(kind==='in'?.22:.1,t+d+.02);g.gain.exponentialRampToValueAtTime(.001,t+d+(kind==='in'?.6:1));o.connect(g).connect(ctx.destination);o.start(t+d);o.stop(t+d+1.1);}};
  beep();this.h=window.setInterval(beep,kind==='in'?1600:3000);}
 stop(){if(this.h)clearInterval(this.h);this.h=undefined;}}

export function createSocial(o:{meId:number;send:(m:ClientMsg)=>void;toast:(t:string,s?:number)=>void;players:()=>PlayerInfo[]}){
 const st=document.createElement('style');st.textContent=CSS;document.head.append(st);
 const btn=document.createElement('button');btn.id='al-soc-btn';btn.type='button';btn.innerHTML='💬 Bạn bè<i></i>';
 const panel=document.createElement('div');panel.id='al-soc';
 const ring=document.createElement('div');ring.id='al-ring';
 const callEl=document.createElement('div');callEl.id='al-call';
 document.body.append(btn,panel,ring,callEl);
 let friends:FriendRow[]=[],found:FoundUser[]=[],tab:'friends'|'here'|'find'='friends',chatWith:number|null=null,query='',menuFor:number|null=null,noReq=false;
 const chats=new Map<number,{m:ChatMsg[];more:boolean;loaded:boolean}>();
 let ice:RTCIceServer[]=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
 let call:Call|null=null;const ringer=new Ringer();
 const keep=(e:Event)=>e.stopPropagation();
 for(const el of [panel,ring,callEl])for(const ev of ['keydown','keyup','pointerdown','wheel'])el.addEventListener(ev,keep);

 const friend=(id:number)=>friends.find(f=>f.id===id);
 const nameOf=(id:number)=>friend(id)?.name??o.players().find(p=>p.id===id)?.name??found.find(u=>u.id===id)?.name??'Phật tử';
 function badge(){const n=friends.reduce((a,f)=>a+f.unread+(f.state==='incoming'?1:0),0);btn.classList.toggle('has',n>0);btn.querySelector('i')!.textContent=n>99?'99+':String(n);}
 function open(on:boolean){panel.classList.toggle('on',on);if(on){o.send({t:'friends'});render();}else chatWith=null;}
 btn.onclick=()=>open(!panel.classList.contains('on'));
 panel.addEventListener('change',e=>{const t=e.target as HTMLInputElement;if(t.dataset.noreq!==undefined){noReq=t.checked;o.send({t:'socialPrefs',noRequests:noReq});o.toast(noReq?'Đã tắt nhận lời mời kết bạn':'Đã bật nhận lời mời kết bạn',2);}});

 // ---------- panel ----------
 function stateButtons(id:number,state:FriendRow['state']|FoundUser['state']|'none'){
  if(state==='blocked')return`<button data-unblock="${id}">Bỏ chặn</button>`;
  if(state==='friend')return`<button class="ic" data-chat="${id}" title="Nhắn tin">💬</button><button class="ic" data-call="${id}" title="Gọi thoại">📞</button><button class="ic" data-video="${id}" title="Gọi video">🎥</button><button class="ic" data-menu="${id}" title="Xoá bạn · Chặn">⋯</button>`;
  if(state==='incoming')return`<button class="ok" data-accept="${id}">Đồng ý</button><button class="no" data-decline="${id}">✕</button><button class="ic" data-menu="${id}" title="Chặn">⋯</button>`;
  if(state==='outgoing')return`<button data-cancel="${id}" title="Huỷ lời mời">Đã gửi ✕</button>`;
  return`<button class="ok" data-add="${id}">+ Kết bạn</button><button class="ic" data-menu="${id}" title="Chặn">⋯</button>`;}
 const menu=(id:number,friend:boolean)=>menuFor===id?`<div class="acts">${friend?`<button data-remove="${id}">Xoá bạn</button>`:''}<button class="no" data-block="${id}">🚫 Chặn</button><button data-menu="${id}">Đóng</button></div>`:'';
 const row=(id:number,name:string,on:boolean,sub:string,right:string,unread=0,isFriend=false)=>`<div class="row"><div class="av ${on?'on':''}">${esc(initial(name))}</div><div class="who"><div>${esc(name)}</div><small>${sub}</small></div>${unread?`<span class="badge">${unread}</span>`:''}${right}</div>${menu(id,isFriend)}`;
 function render(){
  if(!panel.classList.contains('on'))return;
  if(chatWith!==null)return renderChat();
  const tabs=`<div class="tabs"><button data-tab="friends" class="${tab==='friends'?'on':''}">Bạn bè</button><button data-tab="here" class="${tab==='here'?'on':''}">Trong chùa</button><button data-tab="find" class="${tab==='find'?'on':''}">Tìm bạn</button></div>`;
  let body='';
  if(tab==='friends'){
   const inc=friends.filter(f=>f.state==='incoming'),out=friends.filter(f=>f.state==='outgoing'),fr=friends.filter(f=>f.state==='friend'),bl=friends.filter(f=>f.state==='blocked');
   if(inc.length)body+=`<h4>Lời mời kết bạn</h4>`+inc.map(f=>row(f.id,f.name,f.online,'muốn kết bạn với anh/chị',stateButtons(f.id,'incoming'))).join('');
   body+=`<h4>Bạn bè (${fr.length})</h4>`+(fr.length?fr.map(f=>row(f.id,f.name,f.online,f.last?esc((f.last.from===o.meId?'Bạn: ':'')+f.last.text.split('\n')[0]):f.online?'đang ở trong chùa':'đang vắng',stateButtons(f.id,'friend'),f.unread,true)).join(''):`<div class="empty">Chưa có bạn bè. Vào thẻ <b>Trong chùa</b> hoặc <b>Tìm bạn</b> để kết bạn với các phật tử khác 🙏</div>`);
   if(out.length)body+=`<h4>Đã gửi lời mời</h4>`+out.map(f=>row(f.id,f.name,f.online,'đang chờ đồng ý',stateButtons(f.id,'outgoing'))).join('');
   if(bl.length)body+=`<h4>Đã chặn (${bl.length})</h4>`+bl.map(f=>row(f.id,f.name,false,'không nhắn tin, gọi hay kết bạn được với anh/chị',stateButtons(f.id,'blocked'))).join('');
   body+=`<label class="pref"><input type="checkbox" data-noreq ${noReq?'checked':''}> Không nhận lời mời kết bạn từ người khác</label>`;
  }else if(tab==='here'){
   const all=o.players().filter(p=>p.id!==o.meId),ps=all.slice(0,100);
   body=(all.length>100?`<div class="empty">${all.length} phật tử đang trong chùa · hiện 100 người, dùng thẻ <b>Tìm bạn</b> để tìm theo tên</div>`:'')+(ps.length?ps.map(p=>row(p.id,p.name,true,p.prayer?esc('🙏 '+p.prayer):'đang ở trong chùa',stateButtons(p.id,friend(p.id)?.state??'none'))).join(''):`<div class="empty">Hiện chưa có phật tử nào khác trong chùa.</div>`);
  }else{
   body=`<input id="al-soc-q" placeholder="Tên đăng nhập hoặc tên hiển thị…" maxlength="24" value="${esc(query)}">`+(found.length?found.map(u=>row(u.id,u.name,u.online,u.online?'đang ở trong chùa':'đang vắng',stateButtons(u.id,u.state))).join(''):query.length>=2?`<div class="empty">Không tìm thấy ai.</div>`:`<div class="empty">Gõ ít nhất 2 ký tự để tìm.</div>`);
  }
  panel.innerHTML=`<header><b>💬 Bạn bè · Chùa An Liên</b><button data-close>✕</button></header>${tabs}<div class="body">${body}</div>`;
  const q=panel.querySelector<HTMLInputElement>('#al-soc-q');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);let h=0;q.oninput=()=>{query=q.value;clearTimeout(h);h=window.setTimeout(()=>{if(query.trim().length>=2)o.send({t:'findUser',q:query.trim()});else{found=[];render();}},350);};}
 }
 function renderChat(){
  const id=chatWith!,f=friend(id),c=chats.get(id),name=nameOf(id);
  const msgs=(c?.m??[]).map(m=>m.kind==='call'?`<div class="m call">${esc(m.text)} · ${hhmm(m.t)}</div>`:`<div class="m ${m.from===o.meId?'me':''}">${esc(m.text)}<small>${hhmm(m.t)}${m.from===o.meId&&m.seen?' · đã xem':''}</small></div>`).join('');
  const prev=panel.querySelector<HTMLTextAreaElement>('.send textarea')?.value??'';
  panel.innerHTML=`<header><button data-back>←</button><b>${esc(name)}${f?.online?' <small style="color:#3cc46a">● trong chùa</small>':''}</b>${f?.state==='friend'?`<button class="ic" data-call="${id}">📞</button><button class="ic" data-video="${id}">🎥</button><button class="ic" data-menu="${id}">⋯</button>`:''}<button data-close>✕</button></header>${f?.state==='friend'?menu(id,true):''}
   <div class="msgs">${c?.more?`<button data-more style="align-self:center">Xem tin cũ hơn</button>`:''}${msgs||(c?.loaded?`<div class="empty">Chưa có tin nhắn. Gửi lời chào đầu tiên nhé 🙏</div>`:`<div class="empty">Đang tải…</div>`)}</div>
   ${f?.state==='friend'?`<div class="send"><textarea maxlength="${CHAT_MAX}" placeholder="Nhắn tin…"></textarea><button class="ok" data-send>Gửi</button></div>`:`<div class="empty">Chỉ nhắn tin được khi đã là bạn bè.</div>`}`;
  const box=panel.querySelector<HTMLDivElement>('.msgs')!;box.scrollTop=box.scrollHeight;
  const ta=panel.querySelector<HTMLTextAreaElement>('.send textarea');if(ta){ta.value=prev;ta.focus();ta.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}};ta.oninput=()=>{ta.style.height='38px';ta.style.height=Math.min(110,ta.scrollHeight)+'px';};}
 }
 function sendChat(){const ta=panel.querySelector<HTMLTextAreaElement>('.send textarea');if(!ta||chatWith===null)return;const text=ta.value.trim();if(!text)return;o.send({t:'chat',to:chatWith,text});ta.value='';ta.style.height='38px';}
 function openChat(id:number){chatWith=id;panel.classList.add('on');const c=chats.get(id);if(!c?.loaded)o.send({t:'history',with:id});o.send({t:'read',with:id});const f=friend(id);if(f){f.unread=0;badge();}render();}
 panel.addEventListener('click',e=>{
  const b=(e.target as HTMLElement).closest('button');if(!b)return;const d=b.dataset,id=Number(d.chat??d.call??d.video??d.accept??d.decline??d.cancel??d.add??d.menu??d.remove??d.block??d.unblock);
  if(d.menu){menuFor=menuFor===id?null:id;render();return;}
  if(d.remove){if(confirm(`Xoá ${nameOf(id)} khỏi danh sách bạn bè?`)){o.send({t:'friend',op:'remove',id});menuFor=null;if(chatWith===id)chatWith=null;o.toast('Đã xoá bạn',2);}return;}
  if(d.block){if(confirm(`Chặn ${nameOf(id)}? Người này sẽ không nhắn tin, gọi hay gửi lời mời kết bạn cho anh/chị được nữa.`)){o.send({t:'friend',op:'block',id});menuFor=null;if(chatWith===id)chatWith=null;const u=found.find(x=>x.id===id);if(u)u.state='blocked';o.toast('Đã chặn',2);}return;}
  if(d.unblock){o.send({t:'friend',op:'unblock',id});const u=found.find(x=>x.id===id);if(u)u.state='none';o.toast('Đã bỏ chặn',2);return;}
  if('close' in d)open(false);else if('back' in d){chatWith=null;render();}else if(d.tab){tab=d.tab as typeof tab;found=tab==='find'?found:[];render();}
  else if(d.chat)openChat(id);else if(d.call)startCall(id,false);else if(d.video)startCall(id,true);
  else if(d.accept)o.send({t:'friend',op:'accept',id});else if(d.decline)o.send({t:'friend',op:'decline',id});else if(d.cancel)o.send({t:'friend',op:'remove',id});
  else if(d.add){o.send({t:'friend',op:'request',id});o.toast('Đã gửi lời mời kết bạn 🙏',2);const u=found.find(x=>x.id===id);if(u)u.state='outgoing';}
  else if('send' in d)sendChat();else if('more' in d){const c=chats.get(chatWith!);o.send({t:'history',with:chatWith!,before:c?.m[0]?.id});}
 });

 // ---------- calls (WebRTC, peer to peer) ----------
 function paintCall(){
  if(!call){callEl.classList.remove('on');callEl.innerHTML='';return;}
  callEl.classList.add('on');const c=call,live=c.status==='live';
  const words={'ringing-out':'Đang gọi…','ringing-in':'Cuộc gọi đến…','connecting':'Đang kết nối…','live':''}[c.status];
  callEl.innerHTML=`<video class="rv" autoplay playsinline></video>${c.video&&c.cam?'<video class="lv" autoplay playsinline muted></video>':''}
   <div class="face" ${live&&c.video?'style="display:none"':''}><div class="big">${esc(initial(c.name))}</div><b>${esc(c.name)}</b><span class="st">${words||'Cuộc gọi '+(c.video?'video':'thoại')}</span></div>
   <div class="top"><span class="tm">${live?'':''}</span></div>
   <div class="bar"><button data-mic class="${c.mic?'':'off'}" title="Micro">${c.mic?'🎙️':'🔇'}</button>${c.video?`<button data-cam class="${c.cam?'':'off'}" title="Camera">${c.cam?'📷':'🚫'}</button><button data-flip title="Đổi camera">🔄</button>`:''}<button data-end class="end" title="Kết thúc">📵</button></div>`;
  const rv=callEl.querySelector<HTMLVideoElement>('video.rv')!;rv.srcObject=c.remote;void rv.play().catch(()=>{});
  const lv=callEl.querySelector<HTMLVideoElement>('video.lv');if(lv&&c.local){lv.srcObject=c.local;void lv.play().catch(()=>{});}
 }
 callEl.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest('button');if(!b||!call)return;const d=b.dataset,c=call;
  if('end' in d)hangUp();
  else if('mic' in d){c.mic=!c.mic;c.local?.getAudioTracks().forEach(t=>t.enabled=c.mic);o.send({t:'call',op:'media',to:c.peer,callId:c.id,mic:c.mic,cam:c.cam});paintCall();}
  else if('cam' in d){c.cam=!c.cam;c.local?.getVideoTracks().forEach(t=>t.enabled=c.cam);o.send({t:'call',op:'media',to:c.peer,callId:c.id,mic:c.mic,cam:c.cam});paintCall();}
  else if('flip' in d)void flip();});
 setInterval(()=>{if(call?.status==='live'){const tm=callEl.querySelector('.tm');if(tm)tm.textContent='⏱ '+clock((Date.now()-call.t0)/1000);}},500);
 async function media(video:boolean,facing:'user'|'environment'='user'):Promise<MediaStream|null>{
  try{return await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:video?{facingMode:facing,width:{ideal:640},height:{ideal:480},frameRate:{ideal:24}}:false});}
  catch{if(video){try{const s=await navigator.mediaDevices.getUserMedia({audio:true});o.toast('Không mở được camera · gọi bằng tiếng',3);return s;}catch{}}
   o.toast('Không mở được micro'+(video?'/camera':'')+' · hãy cho phép trình duyệt dùng micro',4);return null;}}
 function peer(c:Call){
  const pc=new RTCPeerConnection({iceServers:ice});c.pc=pc;
  // both sides send what they have and always receive audio (+ video for a video call), so neither direction is dropped
  for(const t of c.local?.getTracks()??[])pc.addTrack(t,c.local!);
  if(!c.local?.getAudioTracks().length)pc.addTransceiver('audio',{direction:'recvonly'});
  if(c.video&&!c.local?.getVideoTracks().length)pc.addTransceiver('video',{direction:'recvonly'});
  pc.onicecandidate=e=>{if(e.candidate)o.send({t:'call',op:'ice',to:c.peer,callId:c.id,cand:e.candidate.toJSON()});};
  pc.ontrack=e=>{if(!c.remote.getTracks().includes(e.track))c.remote.addTrack(e.track);const rv=callEl.querySelector<HTMLVideoElement>('video.rv');if(rv){rv.srcObject=c.remote;void rv.play().catch(()=>{});}};
  pc.onconnectionstatechange=()=>{if(call!==c)return;const s=pc.connectionState;
   if(s==='connected'&&c.status!=='live'){c.status='live';c.t0=Date.now();ringer.stop();paintCall();}
   if(s==='failed'){o.toast('Không kết nối được cuộc gọi (mạng chặn kết nối trực tiếp)',4);hangUp();}};
  return pc;}
 const flushIce=async(c:Call)=>{for(const cand of c.ice.splice(0))await c.pc?.addIceCandidate(cand).catch(()=>{});};
 async function startCall(id:number,video:boolean){
  if(call){o.toast('Anh/chị đang trong một cuộc gọi',2);return;}
  const f=friend(id);if(f?.state!=='friend'){o.toast('Chỉ gọi được cho bạn bè',2);return;}
  if(!f.online){o.toast(`${f.name} đang không ở trong chùa`,3);return;}
  const c:Call={id:`${o.meId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,peer:id,name:f.name,video,role:'caller',status:'ringing-out',remote:new MediaStream(),ice:[],haveRemote:false,t0:0,mic:true,cam:video,facing:'user'};
  call=c;paintCall();const local=await media(video);if(call!==c){local?.getTracks().forEach(t=>t.stop());return;}if(!local){call=null;paintCall();return;}
  c.local=local;c.cam=video&&local.getVideoTracks().length>0;paintCall();ringer.start('out');
  o.send({t:'call',op:'invite',to:id,callId:c.id,video});}
 async function answer(){
  const c=call;if(!c||c.status!=='ringing-in')return;c.status='connecting';ringer.stop();ring.classList.remove('on');paintCall();
  const local=await media(c.video);if(call!==c){local?.getTracks().forEach(t=>t.stop());return;}if(!local){o.send({t:'call',op:'decline',to:c.peer,callId:c.id});call=null;paintCall();return;}
  c.local=local;c.cam=c.video&&local.getVideoTracks().length>0;peer(c);paintCall();o.send({t:'call',op:'accept',to:c.peer,callId:c.id});}
 function cleanup(note?:string){const c=call;if(!c)return;call=null;ringer.stop();ring.classList.remove('on');c.local?.getTracks().forEach(t=>t.stop());c.pc?.close();paintCall();if(note)o.toast(note,3);}
 function hangUp(){const c=call;if(!c)return;o.send({t:'call',op:c.status==='ringing-in'?'decline':'end',to:c.peer,callId:c.id});cleanup();}
 async function flip(){const c=call;if(!c?.local||!c.video)return;c.facing=c.facing==='user'?'environment':'user';
  try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:c.facing,width:{ideal:640},height:{ideal:480}}});const nt=s.getVideoTracks()[0],old=c.local.getVideoTracks()[0];
   const snd=c.pc?.getSenders().find(x=>x.track?.kind==='video');await snd?.replaceTrack(nt);if(old){c.local.removeTrack(old);old.stop();}c.local.addTrack(nt);nt.enabled=c.cam;paintCall();}catch{o.toast('Máy không có camera thứ hai',2);}}
 function ringIn(c:Call){
  ring.innerHTML=`<div style="font-size:40px">${c.video?'🎥':'📞'}</div><b>${esc(c.name)}</b><span>đang gọi ${c.video?'video':'thoại'} cho anh/chị</span><div><button style="background:#2f9e58" data-yes>Nghe</button><button style="background:#c8321e" data-no>Từ chối</button></div>`;
  ring.classList.add('on');ringer.start('in');
  ring.querySelector<HTMLButtonElement>('[data-yes]')!.onclick=()=>void answer();
  ring.querySelector<HTMLButtonElement>('[data-no]')!.onclick=()=>hangUp();}
 async function onCall(m:Extract<ServerMsg,{t:'call'}>){
  if(m.op==='invite'){
   if(call){o.send({t:'call',op:'decline',to:m.from,callId:m.callId});return;}
   call={id:m.callId,peer:m.from,name:m.name??nameOf(m.from),video:!!m.video,role:'callee',status:'ringing-in',remote:new MediaStream(),ice:[],haveRemote:false,t0:0,mic:true,cam:!!m.video,facing:'user'};ringIn(call);return;}
  const c=call;if(!c||c.id!==m.callId)return;
  if(m.op==='accept'&&c.role==='caller'){c.status='connecting';ringer.stop();const pc=peer(c);paintCall();const offer=await pc.createOffer();await pc.setLocalDescription(offer);o.send({t:'call',op:'offer',to:c.peer,callId:c.id,sdp:offer.sdp});}
  else if(m.op==='offer'&&c.pc&&m.sdp){await c.pc.setRemoteDescription({type:'offer',sdp:m.sdp});c.haveRemote=true;await flushIce(c);const ans=await c.pc.createAnswer();await c.pc.setLocalDescription(ans);o.send({t:'call',op:'answer',to:c.peer,callId:c.id,sdp:ans.sdp});}
  else if(m.op==='answer'&&c.pc&&m.sdp){await c.pc.setRemoteDescription({type:'answer',sdp:m.sdp});c.haveRemote=true;await flushIce(c);}
  else if(m.op==='ice'&&m.cand){const cand=m.cand as RTCIceCandidateInit;if(c.pc&&c.haveRemote)await c.pc.addIceCandidate(cand).catch(()=>{});else c.ice.push(cand);}
  else if(m.op==='media'){const st=callEl.querySelector('.face span');if(st&&!m.mic)o.toast(`${c.name} đã tắt micro`,2);}
  else if(m.op==='decline')cleanup(`${c.name} đã từ chối cuộc gọi`);
  else if(m.op==='busy')cleanup(`${c.name} đang bận`);
  else if(m.op==='unavailable')cleanup(m.reason??'Không gọi được');
  else if(m.op==='end')cleanup(c.status==='ringing-in'?`Cuộc gọi nhỡ từ ${c.name}`:'Cuộc gọi đã kết thúc');
 }

 if(import.meta.env.DEV)Object.assign(window,{__soc:()=>({call:call?{status:call.status,video:call.video,remoteTracks:call.remote.getTracks().length,rv:(callEl.querySelector('video.rv') as HTMLVideoElement|null)?.videoWidth??0}:null,friends,open:panel.classList.contains('on'),chatWith,msgs:chatWith!==null?chats.get(chatWith)?.m.length??0:0})});
 return{
  /** Social server messages; returns false for anything else. */
  handle(m:ServerMsg):boolean{
   if(m.t==='friends'){const prev=new Map(friends.map(f=>[f.id,f]));friends=m.list;noReq=!!m.noRequests;for(const f of friends)if(f.id===chatWith&&f.unread){f.unread=0;o.send({t:'read',with:f.id});}
    for(const f of friends){const p=prev.get(f.id);if(p&&p.state==='outgoing'&&f.state==='friend')o.toast(`🤝 ${f.name} đã đồng ý kết bạn`,3);}badge();render();return true;}
   if(m.t==='found'){found=m.users;render();return true;}
   if(m.t==='ice'){if(m.servers.length)ice=m.servers;return true;}
   if(m.t==='history'){const c=chats.get(m.with)??{m:[],more:false,loaded:false};const have=new Set(c.m.map(x=>x.id));c.m=[...m.m.filter(x=>!have.has(x.id)),...c.m].sort((a,b)=>a.id-b.id);c.more=m.more;c.loaded=true;chats.set(m.with,c);if(chatWith===m.with)render();return true;}
   if(m.t==='chat'){const other=m.m.from===o.meId?m.m.to:m.m.from,c=chats.get(other);if(c&&!c.m.some(x=>x.id===m.m.id))c.m.push(m.m);
    const f=friend(other);if(f)f.last=m.m;
    if(m.m.from!==o.meId){if(chatWith===other&&panel.classList.contains('on'))o.send({t:'read',with:other});else{if(f)f.unread++;if(m.m.kind!=='call')o.toast(`💬 ${nameOf(other)}: ${m.m.text.slice(0,60)}`,4);}}
    badge();render();return true;}
   if(m.t==='seen'){const c=chats.get(m.by);if(c)for(const x of c.m)if(x.from===o.meId)x.seen=true;if(chatWith===m.by)render();return true;}
   if(m.t==='call'){void onCall(m).catch(err=>{console.error(err);cleanup('Cuộc gọi gặp lỗi');});return true;}
   return false;
  },
  /** Players list changed (join/leave): refresh the "Trong chùa" tab. */
  playersChanged(){if(tab==='here'&&chatWith===null)render();},
  /** Connection lost: any call ends. */
  disconnected(){if(call)cleanup('Mất kết nối · cuộc gọi đã kết thúc');},
 };
}
