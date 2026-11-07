import {HALL_RITUAL_SHIFT as S} from '../world/SanctuaryPlan.ts';
export type Point={x:number;z:number};
export const LAY_ROWS=15,LAY_COLUMNS=100,LAY_SPEED=3.2,LAY_BOW_PERIOD=8;
// Fifteen longitudinal queues per block; two blocks of fifty deep (left: columns 0-49, right: 50-99) either side of a wide centre aisle,
// because the 160 m Buddha (anh Thanh 2026-11-01) leaves less depth between altar and door. Routes are the original ones, moved with the block.
export const LAY_BLOCK_X=54,LAY_DEPTH=50,LAY_PITCH=2.2;
const blockOf=(x:number)=>x<0?-LAY_BLOCK_X:LAY_BLOCK_X;
export const LAY_LANES=[-27,-24,-17,-14,-11,-8,-5,0,5,8,11,14,17,24,27];
export const LAY_SEATS=Array.from({length:1500},(_,id)=>{const row=id%15,col=Math.floor(id/15);return{id,row,col,x:(col<LAY_DEPTH?-LAY_BLOCK_X:LAY_BLOCK_X)+LAY_LANES[row],z:-65+S+(col%LAY_DEPTH)*LAY_PITCH,female:id%2===1};});
export const LAY_PRAYER_PADS=Array.from({length:15},(_,slot)=>({x:(slot-7)*3,z:-125+S}));
export function length(path:Point[]){return path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.z-path[i].z),0);}
export function route(seat:Point,pad:Point){const b=blockOf(seat.x),aisle=b+(seat.x-b<=0?-22:22);return[seat,{x:seat.x+1.2,z:seat.z},{x:seat.x+1.2,z:-74+S},{x:aisle,z:-74+S},{x:aisle,z:-126+S},{x:pad.x,z:-126+S},pad];}
export function returnRoute(seat:Point,pad:Point){const b=blockOf(seat.x),aisle=b+(seat.x-b<=0?-30:30);return[pad,{x:pad.x,z:-129+S},{x:aisle,z:-129+S},{x:aisle,z:-78+S},{x:seat.x-1.2,z:-78+S},{x:seat.x-1.2,z:seat.z},seat];}
export function along(path:Point[],distance:number){let left=Math.max(0,distance);for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],d=Math.hypot(b.x-a.x,b.z-a.z);if(left<=d||i===path.length-1){const t=d?Math.min(1,left/d):1;return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(b.x-a.x,b.z-a.z)};}left-=d;}return{...path[0],yaw:Math.PI};}
export function layWave(index:number){
 const seats=LAY_SEATS.slice((index%100)*15,(index%100+1)*15),people=seats.map((seat,slot)=>{const pad=LAY_PRAYER_PADS[slot],path=route(seat,pad),back=returnRoute(seat,pad);return{seat,pad,path,back,distance:length(path),backDistance:length(back),delay:0,backDelay:0};});
 const entry=Math.max(...people.map(p=>length(p.path.slice(0,4))/LAY_SPEED)),backEntry=Math.max(...people.map(p=>length(p.back.slice(0,3))/LAY_SPEED));
 people.forEach((p,slot)=>{p.delay=entry+slot*.45-length(p.path.slice(0,4))/LAY_SPEED;p.backDelay=backEntry+slot*.45-length(p.back.slice(0,3))/LAY_SPEED;});
 const outward=Math.max(...people.map(p=>p.delay+p.distance/LAY_SPEED))+.5,bowing=3*LAY_BOW_PERIOD,homeward=Math.max(...people.map(p=>p.backDelay+p.backDistance/LAY_SPEED))+.5;
 return{index,seats,people,outward,bowing,homeward,nextAfter:outward+bowing+2,duration:outward+bowing+homeward};
}
export function layPerson(wave:ReturnType<typeof layWave>,slot:number,t:number){const p=wave.people[slot];if(t<p.delay)return{...p.seat,yaw:Math.PI,act:'meditate' as const,poseTime:0,atHome:true};
 if(t<wave.outward){const d=Math.min(p.distance,(t-p.delay)*LAY_SPEED),v=along(p.path,d);return{...v,yaw:d>=p.distance?Math.PI:v.yaw,act:d>=p.distance?'bow' as const:'procession' as const,poseTime:0,atHome:false};}
 if(t<wave.outward+wave.bowing)return{...p.pad,yaw:Math.PI,act:'bow' as const,poseTime:(t-wave.outward)*14/LAY_BOW_PERIOD,atHome:false};
 const rt=t-wave.outward-wave.bowing-p.backDelay;if(rt<0)return{...p.pad,yaw:Math.PI,act:'bow' as const,poseTime:0,atHome:false};const d=Math.min(p.backDistance,rt*LAY_SPEED);if(d>=p.backDistance)return{...p.seat,yaw:Math.PI,act:'meditate' as const,poseTime:0,atHome:true};return{...along(p.back,d),act:'procession' as const,poseTime:0,atHome:false};}
const WAVES=Array.from({length:100},(_,i)=>layWave(i));
let offset=0;const STARTS=WAVES.map(w=>{const start=offset;offset+=w.nextAfter;return start;});
export const LAY_ROUND_TIME=offset;
/** Incoming cohorts start after the preceding bows, while that cohort is still walking home. */
export function layTimeline(time:number){const active:{index:number;wave:ReturnType<typeof layWave>;time:number}[]=[];const cycle=Math.floor(Math.max(0,time)/LAY_ROUND_TIME);for(let c=Math.max(0,cycle-1);c<=cycle;c++)for(let i=0;i<100;i++){const t=time-(c*LAY_ROUND_TIME+STARTS[i]);if(t>=0&&t<WAVES[i].duration)active.push({index:c*100+i,wave:WAVES[i],time:t});}return active;}
