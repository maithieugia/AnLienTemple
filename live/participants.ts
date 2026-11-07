import {clean,type LiveEvent} from './model.ts';
export type Participant={key:string;user:string;name:string;seatId:number;female:boolean;demo:boolean;joinedAt:number;lastAt:number};
export type ParticipantSnapshot={people:Participant[];capacity:number;full:boolean};
export type ParticipantChange={changed:boolean;action:'joined'|'updated'|'left'|'full'|'none';person?:Participant};
export function applyParticipantChange(s:ParticipantSnapshot,c:ParticipantChange):ParticipantSnapshot{const people=s.people.filter(p=>p.key!==c.person?.key);if(c.person&&c.action!=='left')people.push(c.person);return{...s,people,full:people.length>=s.capacity};}
function command(text:string){return clean(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().replace(/[.!?,;:]+$/g,'').trim();}
/** One viewer owns one seat for this tool session, independent of chat and audio throttling. */
export class ParticipantRegistry{
 private people=new Map<string,Participant>();private capacity:number;
 constructor(capacity=1500){this.capacity=capacity;}
 get size(){return this.people.size;}
 snapshot():ParticipantSnapshot{return{people:[...this.people.values()].map(p=>({...p})),capacity:this.capacity,full:this.people.size>=this.capacity};}
 apply(e:LiveEvent):ParticipantChange{
  if(e.kind!=='chat')return{changed:false,action:'none'};
  const identity=e.viewerId||e.user;if(!identity)return{changed:false,action:'none'};
  const key=`${e.demo?'demo':'live'}:${identity.toLowerCase()}`,old=this.people.get(key),cmd=command(e.text);
  if(['roi chua','roi','thoat'].includes(cmd)){const removed=this.people.delete(key);return{changed:removed,action:removed?'left':'none',person:old};}
  const female=cmd==='nu'?true:cmd==='nam'?false:old?.female??false;
  if(old){const changed=old.name!==e.name||old.user!==e.user||old.female!==female;old.name=e.name;old.user=e.user;old.female=female;old.lastAt=e.at;return{changed,action:'updated',person:{...old}};}
  if(this.people.size>=this.capacity)return{changed:false,action:'full'};
  const taken=new Set([...this.people.values()].map(p=>p.seatId));
  // Fill from the front, centre outwards. Match the 15 lanes of LayAssemblyPlan.
  const order=[7,6,8,5,9,4,10,3,11,2,12,1,13,0,14];let seatId=-1;
  for(let row=0;seatId<0&&row<100;row++)for(const lane of order){const id=row*15+lane;if(id<this.capacity&&!taken.has(id)){seatId=id;break;}}
  if(seatId<0)return{changed:false,action:'full'};
  const person:Participant={key,user:e.user,name:e.name,seatId,female,demo:e.demo,joinedAt:e.at,lastAt:e.at};this.people.set(key,person);return{changed:true,action:'joined',person:{...person}};
 }
 clearDemo(){for(const [key,p]of this.people)if(p.demo)this.people.delete(key);}
 clear(){this.people.clear();}
 block(users:string[]){const blocked=new Set(users.map(u=>u.replace(/^@/,'').toLowerCase()));for(const [key,p]of this.people)if(blocked.has(p.user.replace(/^@/,'').toLowerCase()))this.people.delete(key);}
}
