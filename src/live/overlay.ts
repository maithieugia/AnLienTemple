import './live.css';
import {subscribe,eventCard,node,type Snapshot} from './common';
import type {LiveEvent} from '../../live/model';
document.body.className='overlay';
const root=document.querySelector<HTMLDivElement>('#app')!,brand=node('div','AN LIÊN · HOAN HỶ ĐÓN CHÀO','brand'),note=node('div','Đang nối công cụ LIVE…','connection-note'),feed=node('div','','chat-feed');root.append(brand,note,feed);
let toast:HTMLElement|undefined,timer:number,settings:Snapshot['settings'];
function blocked(e:LiveEvent){return settings?.blocked.includes(e.user.replace(/^@/,'').toLowerCase());}
function chat(e:LiveEvent){if(blocked(e)||e.kind!=='chat')return;feed.append(eventCard(e));while(feed.childElementCount>5)feed.firstElementChild!.remove();}
subscribe((type,data)=>{if(type==='state'){const s=data as Snapshot;settings=s.settings;feed.replaceChildren();for(const e of s.history.filter(e=>e.kind==='chat').slice(0,5).reverse())chat(e);note.textContent=s.status.phase==='connected'?'':s.status.phase==='connecting'?'Đang kết nối TikTok LIVE…':'CHƯA KẾT NỐI LIVE · Có thể chạy thử từ bảng điều khiển';}
 if(type==='event'){const e=data as LiveEvent;if(blocked(e))return;if(e.kind==='chat'){chat(e);return;}if(!e.announce)return;toast?.remove();clearTimeout(timer);toast=node('section','','toast');if(e.demo)toast.append(node('div','SỰ KIỆN THỬ NGHIỆM','demo-tag'));toast.append(node('strong',e.name),node('p',e.kind==='join'?'Đã vào chùa · Hoan hỷ đón chào':`${e.kind==='like'?'Đã thả tim':'Đã chia sẻ'} · Công đức vô lượng`));root.append(toast);timer=window.setTimeout(()=>toast?.remove(),6500);}
 if(type==='clear'){feed.replaceChildren();toast?.remove();}
},connected=>{if(!connected)note.textContent='MẤT KẾT NỐI TOOL · Đang thử lại…';});
