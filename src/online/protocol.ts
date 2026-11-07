import type {MeritRank,RefugeCertificate,RefugeCommand,RefugeUpdate} from './RefugePlan.ts';
/** Shared by the browser and the Node server (no renderer, no DOM). Metres, campus-local coordinates. */
import {SANCTUARY_STATUES,statuePlinth,SANCTUARY_LEVELS,COURTYARD_CENSER as CC} from '../game/world/SanctuaryPlan.ts';
import {AMITABHA_PLAZA as AP,MAITREYA_PLAZA as MP,FLANK_PLAZA as FP,BODHI_SHRINE as BS,UPPER_STATUES,UPPER_PLINTHS,UPPER_FLOOR,STATUE_GALLERY as G,galleryBayZ,EAST_ALTAR_BAY} from '../game/world/StatueGardenPlan.ts';
import type {Release,ReleaseKind} from './Releases.ts';

/** What a pilgrim is doing; sent as a small integer. */
/** lantern / fish / sky = holding a lotus lantern, a golden carp or a sky lantern in both hands; raise = arms up, letting the sky lantern go (2026-11-05). */
export const ACTS=['idle','walk','run','sit','kneel','bow','incense','wheel','lantern','fish','sky','raise'] as const;
export type Act=typeof ACTS[number];
export const actCode=(a:Act)=>ACTS.indexOf(a);
export const actName=(n:number):Act=>ACTS[n]??'idle';
/** Poses where the body stays put (movement input ends them). */
export const STILL_ACTS:ReadonlySet<Act>=new Set(['sit','kneel','bow','incense','wheel','lantern','fish','sky','raise']);

export const NET={sendHz:10,snapHz:10,viewRadius:700,maxPlayers:1000,snapNear:40,snapFar:40,walk:3.2,run:9,maxSpeed:12,incenseLife:180,incenseCooldown:8,incenseRange:4.5,maxSticksPerSite:24} as const;
/** Where a pilgrim may be: the walled campus plus the side stupa and its plaza east of the gate (x≈480, r≈60). */
export const WORLD_BOUNDS={x0:-420,x1:560,z0:-420,z1:720,yMax:520};
/** Keep a point inside the walkable world (the edge just stops you; nobody is ever pulled back). */
export const clampWorld=(x:number,y:number,z:number)=>({x:Math.min(WORLD_BOUNDS.x1,Math.max(WORLD_BOUNDS.x0,x)),y:Math.min(WORLD_BOUNDS.yMax,Math.max(-6,y)),z:Math.min(WORLD_BOUNDS.z1,Math.max(WORLD_BOUNDS.z0,z))});
export const inWorld=(x:number,y:number,z:number)=>x>=WORLD_BOUNDS.x0&&x<=WORLD_BOUNDS.x1&&z>=WORLD_BOUNDS.z0&&z<=WORLD_BOUNDS.z1&&y>=-6&&y<=WORLD_BOUNDS.yMax;
/** First entry of a visit: outside, before the three-entrance gate (tam quan) in the front wall, facing in. */
export const SPAWN={x:0,y:0,z:705,yaw:Math.PI};

export const USERNAME_RE=/^[a-z0-9_]{3,20}$/;
export function checkUsername(u:unknown):string|null{return typeof u==='string'&&USERNAME_RE.test(u)?null:'Tên đăng nhập 3–20 ký tự: chữ thường không dấu, số, dấu gạch dưới';}
export function checkPassword(p:unknown):string|null{return typeof p==='string'&&p.length>=6&&p.length<=72?null:'Mật khẩu từ 6 đến 72 ký tự';}
/** Display names may use Vietnamese letters and spaces, nothing that could break a name tag. */
export function cleanDisplayName(n:unknown):string|null{
 if(typeof n!=='string')return null;const s=n.normalize('NFC').replace(/\s+/g,' ').trim();
 if(s.length<2||s.length>24)return null;if(!/^[\p{L}\p{M}0-9 ._'-]+$/u.test(s))return null;
 const low=s.toLowerCase();if(BLOCKED_WORDS.some(w=>low.includes(w)))return null;return s;
}
/** Prayers shown above a pilgrim's head (anh Thanh 2026-11-04): short so they stay readable and tidy for everyone. */
export const PRAYER_MAX=40;
/** A prayer as typed → what is shown ('' clears it), or null when it cannot be shown. */
export function cleanPrayer(t:unknown):string|null{
 if(typeof t!=='string')return null;const s=t.normalize('NFC').replace(/\s+/g,' ').trim();
 if(!s)return '';if([...s].length>PRAYER_MAX)return null;if(!/^[\p{L}\p{M}0-9 .,!?'"()…:;\-–]+$/u.test(s))return null;
 const low=s.toLowerCase();if(BLOCKED_WORDS.some(w=>low.includes(w)))return null;return s;
}
export const PRAYER_SUGGESTIONS=['Cầu cho gia đình bình an','Cầu khách chốt đơn liền tay','Cầu trúng Vietlott giải đặc biệt','Cầu mai được nghỉ học','Nguyện bán được miếng đất cuối năm','Cầu sếp duyệt tăng lương','Nguyện cha mẹ mạnh khỏe sống lâu','Cầu năm nay có người yêu'];
/** Prayers of the simulated pilgrims in the temple grounds. */
/** Prayers of the simulated pilgrims: real-life and funny (Gen Z / 9x / 10x visiting the online temple, anh Thanh 2026-11-04) mixed with classic ones. */
export const VISITOR_PRAYERS=['Cầu trúng Vietlott giải đặc biệt', 'Cầu cho gia đình bình an', 'Cầu khách chốt đơn liền tay', 'Cầu bán đắt như tôm tươi', 'Cầu mong con cái ngoan hiền', 'Nguyện bán được miếng đất cuối năm', 'Cầu mai được nghỉ học', 'Nguyện tâm an, trí sáng', 'Cầu sếp duyệt tăng lương', 'Cầu crush rep tin nhắn', 'Cầu siêu cho ông bà tổ tiên', 'Cầu deadline lùi thêm 1 tuần', 'Cầu qua môn không phải học lại', 'Cầu cho vợ chồng hòa thuận', 'Cầu điểm thi trên 8 phẩy', 'Cầu đơn hàng nổ ting ting', 'Nam mô A Di Đà Phật', 'Cầu live stream lên xu hướng', 'Cầu video lên 1 triệu view', 'Cầu chứng khoán xanh cả bảng', 'Cầu năm nay có người yêu', 'Cầu ra trường có việc ngay', 'Cầu lô đất lên giá gấp đôi', 'Cầu khách không bom hàng', 'Cầu ví tiền dày như sổ đỏ', 'Cầu mẹ không hỏi bao giờ cưới', 'Cầu cuối tháng vẫn còn tiền', 'Cầu phỏng vấn đậu luôn', 'Cầu đi làm không kẹt xe', 'Cầu tóc mọc lại, bớt rụng', 'Cầu ăn hoài không mập', 'Cầu shop được đánh giá 5 sao', 'Cầu hết nợ thẻ tín dụng', 'Cầu được thưởng Tết to', 'Nguyện cha mẹ mạnh khỏe sống lâu', 'Nguyện quốc thái dân an', 'Cầu cho người thân mau khỏi bệnh', 'Nguyện buông bỏ phiền não', 'Nguyện chúng sinh an lạc', 'Cầu cho thế giới hòa bình'];
/** Small denylist for name tags in a sacred space; the server is the authority. */
const BLOCKED_WORDS=['địt','đụ','lồn','buồi','cặc','đéo','fuck','shit','admin','quản trị','sư trụ trì'];

/** An altar where incense can be offered. y = table top; censer = scale of the bronze censer standing on it. */
export type IncenseSite={id:string;label:string;x:number;z:number;floor:number;top:number;censer:number;bowl?:{y:number;r:number}};
export const INCENSE_SITES:IncenseSite[]=(()=>{
 const out:IncenseSite[]=[];
 // Main hall (ground floor): altars stand in front of each plinth on the 1.2 m floor (SanctuaryArchitecture.sanctuaryAltarFurniture).
 for(const s of SANCTUARY_STATUES){if(s.id.startsWith('side-'))continue;const main=s.id==='main-buddha';out.push({id:'hall-'+s.id,label:main?'Chánh điện · Phật Thích Ca':'Chánh điện · Quan Âm',x:s.x,z:s.z+statuePlinth(s).rz+(main?5:2.5),floor:SANCTUARY_LEVELS.floor,top:main?2.5:2.1,censer:main?5:1.8});}
 // Courtyard altars are the same furniture lowered 1.2 m to the ground (StatueGarden).
 const g=(id:string,label:string,x:number,z:number,large:boolean,censer:number)=>out.push({id,label,x,z,floor:0,top:(large?2.5:2.1)-1.2,censer});
 // The great courtyard censer: sticks go straight into its ash bed (no altar table, no bronze censer).
 out.push({id:'courtyard-censer',label:'Lư hương lớn trước chánh điện',x:CC.x,z:CC.z,floor:0,top:CC.ash,censer:0,bowl:{y:CC.ash,r:CC.bowlR}});
 g('amitabha','Đài Phật A Di Đà',AP.x,AP.z+AP.tiers[0].r+5,true,3.5);
 g('maitreya','Phật Di Lặc',MP.x,MP.z+MP.plinth[0].r+2.6,false,1.6);
 g('guanyin-garden','Quan Thế Âm Bồ Tát',-FP.x,FP.z+FP.plinth[0].r+2.6,false,1.6);
 g('ksitigarbha','Địa Tạng Bồ Tát',FP.x,FP.z+FP.plinth[0].r+2.6,false,1.6);
 g('gallery-east','Hành lang chư Bồ Tát',G.line-6,galleryBayZ(EAST_ALTAR_BAY),false,1.6);
 g('bodhi','Phật dưới cội bồ đề',BS.x,BS.z+BS.r+2.2,false,1.4);
 // Upper shrine: altars lifted to the second floor.
 for(const s of UPPER_STATUES){const big=s.id==='d06',p=UPPER_PLINTHS[s.id];out.push({id:'upper-'+s.id,label:'Hiên chánh điện · '+s.name,x:s.x,z:s.z+p.r+(big?3:2.2),floor:UPPER_FLOOR,top:UPPER_FLOOR-1.2+(big?2.5:2.1),censer:big?3:1.5});}
 return out;
})();
/** Pilgrims stand in front of the altar (altars face +Z, toward the visitor). */
export function nearIncense(p:{x:number;y:number;z:number},range:number=NET.incenseRange){
 let best:IncenseSite|null=null,bd=Infinity;
 for(const s of INCENSE_SITES){if(Math.abs(p.y-s.floor)>2.5)continue;const d=Math.hypot(p.x-s.x,p.z-(s.z+1.6));if(d<range&&d<bd){bd=d;best=s;}}
 return best;
}

// ---- wire messages (JSON) ----
/** Outfits (anh Thanh 2026-11-03): women wear one of the ten designed áo dài by default (AoDaiCollectionPlan); anyone may pick everyday clothes. */
export const AO_DAI_OUTFITS=Array.from({length:10},(_,i)=>'aodai-'+String(i+1).padStart(2,'0'));
/** Men: áo lam (đồ lam đi chùa) by default, or everyday clothes. */
/** Men wear Nam 01 only (anh Thanh 2026-11-04), in his áo lam or one of five plain colours (nam-01/diffuse-<c>.jpg, authoring/nam01/make_colours.py).
 * Older men's choices (Rocketbox 'aolam' / 'thuong') become Nam 01. */
export const NAM_OUTFITS=['nam-01','nam-01-nau','nam-01-xam','nam-01-trang','nam-01-reu','nam-01-dam'];
export function cleanOutfit(o:unknown,female:boolean,id=0):string{if(!female)return typeof o==='string'&&NAM_OUTFITS.includes(o)?o:'nam-01';if(o==='thuong')return o;if(female&&typeof o==='string'&&AO_DAI_OUTFITS.includes(o))return o;return female?AO_DAI_OUTFITS[Math.abs(id)%AO_DAI_OUTFITS.length]:'aolam';}
export type PlayerInfo={id:number;name:string;female:boolean;outfit:string;prayer?:string};
/** Snapshot row: id, x, y, z, yaw, act. Coordinates rounded to centimetres. */
export type SnapRow=[number,number,number,number,number,number];
export type Stick={site:string;by:string;t:number};
export type ClientMsg=RefugeCommand
 |{t:'state';x:number;y:number;z:number;yaw:number;a:number}
 |{t:'incense';site:string}
 |{t:'wheel';id:'west'|'east'}
 |{t:'act';a:number}
 |{t:'outfit';outfit:string}
 |{t:'pray';text:string}
 |{t:'release';kind:ReleaseKind;text:string}
 // friends, chat and calls (server/social.ts)
 |{t:'friends'}
 |{t:'findUser';q:string}
 |{t:'friend';op:'request'|'accept'|'decline'|'remove'|'block'|'unblock';id:number}
 |{t:'socialPrefs';noRequests:boolean}
 |{t:'chat';to:number;text:string}
 |{t:'history';with:number;before?:number}
 |{t:'read';with:number}
 |{t:'call';op:CallOp;to:number;callId:string;video?:boolean;sdp?:string;cand?:unknown;mic?:boolean;cam?:boolean};
export type ServerMsg=RefugeUpdate
 |{t:'meritRank';rows:MeritRank[]}
 |{t:'welcome';you:PlayerInfo;players:PlayerInfo[];sticks:Stick[];merit:Merit;now:number;spawn:{x:number;y:number;z:number;yaw:number};releases?:Release[];meritRank?:MeritRank[];refugeCertificate?:RefugeCertificate|null}
 |{t:'released';r:Release[]}
 |{t:'join';p:PlayerInfo}
 |{t:'outfit';id:number;outfit:string}
 |{t:'pray';id:number;text:string}
 |{t:'leave';id:number}
 |{t:'snap';r:SnapRow[]}
 |{t:'sticks';add?:Stick[];site?:string}
 |{t:'wheels';w:{id:string;angle:number;speed:number}[]}
 |{t:'merit';m:Merit;note?:string}
 |{t:'notice';text:string}
 |{t:'pos';x:number;y:number;z:number}
 |{t:'kick';reason:string}
 |{t:'friends';list:FriendRow[];noRequests?:boolean}
 |{t:'found';users:FoundUser[]}
 |{t:'chat';m:ChatMsg}
 |{t:'history';with:number;m:ChatMsg[];more:boolean}
 |{t:'seen';by:number}
 |{t:'ice';servers:{urls:string;username?:string;credential?:string}[]}
 |{t:'call';op:CallOp|'busy'|'unavailable';from:number;callId:string;video?:boolean;name?:string;sdp?:string;cand?:unknown;reason?:string;mic?:boolean;cam?:boolean};
/** Call signalling between two friends (relayed by the server, peer-to-peer WebRTC media). */
export type CallOp='invite'|'accept'|'decline'|'end'|'offer'|'answer'|'ice'|'media';
export type ChatMsg={id:number;from:number;to:number;text:string;t:number;kind?:'call';seen?:boolean};
export type FriendRow={id:number;name:string;female:boolean;online:boolean;state:'friend'|'incoming'|'outgoing'|'blocked';unread:number;last?:ChatMsg};
export type FoundUser={id:number;name:string;female:boolean;online:boolean;state:'friend'|'incoming'|'outgoing'|'none'|'blocked'};
/** Chat between friends: up to CHAT_MAX characters, no control characters, rude words masked. */
export const CHAT_MAX=500;
export function cleanChat(t:unknown):string|null{
 if(typeof t!=='string')return null;const s=t.normalize('NFC').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,'').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
 if([...s].length>CHAT_MAX)return null;let out=s;for(const w of BLOCKED_WORDS.slice(0,7))out=out.replace(new RegExp(w,'giu'),'***');return out;
}
/** steps = stair steps climbed on foot in the stupa (anh Thanh 2026-11-04: +1 per incense, per bow, per tower step). */
export type Merit={wheel:number;incense:number;bows:number;sits:number;steps?:number};
export const meritTotal=(m:Merit)=>m.wheel+m.incense+m.bows+m.sits+(m.steps??0);
/** One full bow of the devotion pose takes this long (RocketboxDevotion: s = ½ − ½·cos(t·π/3)). */
export const BOW_SECONDS=6;
/** A state update may climb at most this many steps to count as walking (the lift moves ~11 steps per update). */
export const WALK_STEP_LIMIT=4;
