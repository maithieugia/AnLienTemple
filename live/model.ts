export type LiveKind='join'|'like'|'share'|'chat';
export type LiveEvent={id:string;kind:LiveKind;user:string;viewerId?:string;name:string;text:string;count:number;at:number;demo:boolean;announce:boolean;spoken:string};
export type LiveSettings={volume:number;rate:number;chime:boolean;readChat:boolean;joins:boolean;likes:boolean;shares:boolean;blocked:string[]};
export const DEFAULT_SETTINGS:LiveSettings={volume:.8,rate:1,chime:true,readChat:true,joins:true,likes:true,shares:true,blocked:[]};
export function clean(value:unknown,max=240){return String(value??'').normalize('NFC').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
export function username(value:unknown){const name=clean(value,80).replace(/^@/,'');if(!/^[\w.]{2,32}$/.test(name))throw new Error('Tên TikTok chưa đúng. Nhập dạng @mai.hoaithanh.');return name;}
export function settingsFrom(value:Partial<LiveSettings>,old:LiveSettings=DEFAULT_SETTINGS):LiveSettings{
 const n=(key:'volume'|'rate',min:number,max:number)=>typeof value[key]==='number'&&Number.isFinite(value[key])?Math.min(max,Math.max(min,value[key]!)):old[key];
 const b=(key:'chime'|'readChat'|'joins'|'likes'|'shares')=>typeof value[key]==='boolean'?value[key]!:old[key];
 return {volume:n('volume',0,1),rate:n('rate',.7,1.5),chime:b('chime'),readChat:b('readChat'),joins:b('joins'),likes:b('likes'),shares:b('shares'),blocked:Array.isArray(value.blocked)?value.blocked.slice(0,100).map(x=>clean(x,64).replace(/^@/,'').toLowerCase()).filter(Boolean):[...old.blocked]};
}
export function spokenLine(e:Pick<LiveEvent,'kind'|'name'|'text'>){switch(e.kind){case'join':return `${e.name} đã vào chùa. Hoan hỷ đón chào.`;case'like':return `${e.name} đã thả tim. Công đức vô lượng.`;case'share':return `${e.name} đã chia sẻ. Công đức vô lượng.`;case'chat':return `${e.name} nhắn: ${e.text.slice(0,160)}`;}}
/** Raw events are bounded, deduplicated and converted before going to either browser. */
export class LiveBus{
 settings:LiveSettings={...DEFAULT_SETTINGS,blocked:[]};history:LiveEvent[]=[];totals={join:0,like:0,share:0,chat:0};private ids=new Map<string,number>();private cooldown=new Map<string,number>();private serial=0;
 private now:()=>number;
 constructor(now=()=>Date.now()){this.now=now;}
 ingest(kind:LiveKind,raw:any,demo=false):LiveEvent|null{
  if(!['join','like','share','chat'].includes(kind))return null;
  const user=clean(raw.user?.uniqueId||raw.uniqueId||raw.user?.userId||raw.userId||raw.name,64),name=clean(raw.user?.nickname||raw.nickname||raw.name||user,48)||'Một thiện hữu';
  if(this.settings.blocked.includes(user.replace(/^@/,'').toLowerCase()))return null;
  const text=kind==='chat'?clean(raw.comment??raw.chatMessage?.comment??raw.text,280):'';if(kind==='chat'&&!text)return null;
  const at=this.now(),messageId=clean(raw.event?.msgId||raw.common?.msgId||raw.msgId||raw.messageId,120),key=messageId?`${demo}:${kind}:${messageId}`:'';
  if(key&&this.ids.has(key))return null;if(key)this.ids.set(key,at);
  for(const [id,t]of this.ids)if(at-t>120000)this.ids.delete(id);while(this.ids.size>2000)this.ids.delete(this.ids.keys().next().value!);
  const cooldownKey=`${demo}:${kind}:${user||name}`,last=this.cooldown.get(cooldownKey)??-Infinity,delay=kind==='join'?60000:kind==='like'?15000:kind==='share'?10000:0;
  const announce=at-last>=delay;if(announce)this.cooldown.set(cooldownKey,at);
  for(const [id,t]of this.cooldown)if(at-t>120000)this.cooldown.delete(id);while(this.cooldown.size>2000)this.cooldown.delete(this.cooldown.keys().next().value!);
  const count=kind==='like'?Math.max(1,Math.min(100000,Math.floor(Number(raw.likeCount??raw.count)||1))):1;
  const e:LiveEvent={id:`${at}-${++this.serial}`,kind,user,viewerId:clean(raw.user?.userId||raw.userId||user,80),name,text,count,at,demo,announce,spoken:''};e.spoken=spokenLine(e);
  // Trial interactions never inflate real LIVE counters.
  if(!demo)this.totals[kind]+=count;this.history.unshift(e);this.history.length=Math.min(this.history.length,100);return e;
 }
 clear(){this.history=[];}
}
