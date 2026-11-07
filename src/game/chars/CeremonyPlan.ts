import {HALL_RITUAL_SHIFT as S} from '../world/SanctuaryPlan.ts';
export type CeremonyAct='meditate'|'bow'|'incense'|'woodfish'|'procession';
export const CEREMONY_LABELS:Record<CeremonyAct,string>={meditate:'Ngồi thiền',bow:'Lạy Phật',incense:'Dâng nhang',woodfish:'Gõ mõ',procession:'Đi hành lễ'};
// Match the cushion assembly: 2m between centres in both directions; 4m centre aisle.
export const WORSHIP_PITCH=2;
// halved 2026-11-04 (anh Thanh: "giảm 1 nửa cho nhẹ"): 5 rows of 10 bowing monks, 5 walkers per side
const worship=Array.from({length:50},(_,i)=>{const row=Math.floor(i/10),col=i%10;return{id:`worship-${i+1}`,act:'bow' as CeremonyAct,x:col<5?-2-(4-col)*WORSHIP_PITCH:2+(col-5)*WORSHIP_PITCH,z:-113+S+row*WORSHIP_PITCH,phase:row*.12};});
const walkers=Array.from({length:10},(_,i)=>({id:`aisle-${i+1}`,act:'procession' as CeremonyAct,x:i<5?-14:14,z:-116+S+(i%5)*2,phase:(i%5)*.19,rank:(i%5)*2}));
const auxiliary=Array.from({length:12},(_,i)=>({id:`ritual-${i+1}`,act:(i<8?'meditate':i<10?'incense':'woodfish') as CeremonyAct,x:(i%2?-1:1)*(i<8?3+Math.floor(i/2)*2: i<10?3:9),z:S+(i<8?-88:i<10?-118:-117),phase:i*.57}));
export const CEREMONY_MONKS=[...worship,...walkers,...auxiliary];
/** Each side has an outgoing and a return lane 2m apart, joined by 1m-radius turns.
 * Distance along the closed path advances at constant speed, independently for every monk. */
export const PROCESSION_ROUTE={front:-116+S,back:-85+S,inner:14,laneGap:2,speed:.65,spacing:2};
export const PROCESSION_LENGTH=2*(PROCESSION_ROUTE.back-PROCESSION_ROUTE.front)+2*Math.PI;
export function processionPoint(t:number,side:number,rank=4.5){
 const p=PROCESSION_ROUTE,run=p.back-p.front;
 let d=((t*p.speed+rank*p.spacing)%PROCESSION_LENGTH+PROCESSION_LENGTH)%PROCESSION_LENGTH;
 let x:number,z:number,dx:number,dz:number;
 if(d<run){x=p.inner;z=p.front+d;dx=0;dz=1;}
 else if((d-=run)<Math.PI){x=p.inner+1-Math.cos(d);z=p.back+Math.sin(d);dx=Math.sin(d);dz=Math.cos(d);}
 else if((d-=Math.PI)<run){x=p.inner+p.laneGap;z=p.back-d;dx=0;dz=-1;}
 else{d-=run;x=p.inner+1+Math.cos(d);z=p.front-Math.sin(d);dx=-Math.sin(d);dz=-Math.cos(d);}
 return{x:side*x,z,yaw:Math.atan2(side*dx,dz)};
}
