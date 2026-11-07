import {LAY_SEATS}from './LayAssemblyPlan.ts';
import {circuitAt,circuitLength,porchCircuit,lifeDwell,type LifeStop}from './TempleLifePlan.ts';
import {ACTIVE_GARDEN_STATUES,FOUR_KINGS_PLINTH}from '../world/StatueGardenPlan.ts';
import {COURTYARD_CENSER}from '../world/SanctuaryPlan.ts';
import {STUPA as T,STUPA_STAIR_PHASE as SP,towerFloor,towerRadius,octagonRadius}from '../world/StupaPlan.ts';
export type VisitStop=LifeStop&{floor?:number;side?:number;shrine?:string};
export type VisitPoint={x:number;y:number;z:number};
/** Stable, uncorrelated choices; no common timer or lockstep column. */
export function visitRandom(person:number,visit:number,salt=0){let h=Math.imul(person+11,374761393)^Math.imul(visit+17,668265263)^Math.imul(salt+5,1274126177);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}
const polar=(rad:number,a:number,y:number,tan=0):VisitPoint=>({x:T.x+Math.cos(a)*rad-Math.sin(a)*tan,z:T.z+Math.sin(a)*rad+Math.cos(a)*tan,y});
export function balconyPoint(floor:number,a:number){return polar(octagonRadius(a,towerRadius(floor)-2.2)-.8,a,towerFloor(floor));}
export const OUTDOOR_SHRINES=ACTIVE_GARDEN_STATUES.filter(s=>!['owner-hall','upper','avenue','west','east'].includes(s.group));
export const SHRINE_VISITS:VisitStop[]=OUTDOOR_SHRINES.flatMap(s=>Array.from({length:6},(_,i)=>{
 if(s.id==='new-18'){const x=s.x+(i-2.5)*2.1,z=594;return{id:'shrine-'+s.id+'-'+i,shrine:s.id,act:'bow' as const,x,z,y:0,yaw:Math.atan2(s.x-x,s.z-z)};}
 const d=s.group==='king'?FOUR_KINGS_PLINTH.half+8:s.id==='019'?32:s.id==='056'?12:s.group==='flank'?12:s.id==='bodhi'?11:s.group==='owner'?10:(s.depth??s.height*.45)/2+6,t=(i-2.5)*2.1;
 const x=s.id==='owner-7'?175+i*2.2:s.x+Math.sin(s.yaw)*d+Math.cos(s.yaw)*t,z=s.id==='owner-7'?550:s.z+Math.cos(s.yaw)*d-Math.sin(s.yaw)*t;
 return{id:'shrine-'+s.id+'-'+i,shrine:s.id,act:'bow' as const,x,z,y:s.group==='owner-court'||s.group==='owner-special'?.12:0,yaw:Math.atan2(s.x-x,s.z-z)};
}));
export const COURT_WORSHIP_PADS=SHRINE_VISITS.filter(s=>s.id.endsWith('-0')||s.id.endsWith('-5'));
const INITIAL_SHRINE_VISITS=[0,5,1,4,2,3].flatMap(slot=>OUTDOOR_SHRINES.map(s=>SHRINE_VISITS.find(v=>v.shrine===s.id&&v.id.endsWith('-'+slot))!));
export const VISIT_STOPS:VisitStop[]=[
 ...LAY_SEATS.filter((_,i)=>i%3===0).map(s=>({...s,id:'listen-'+s.id,act:'listen' as const,y:1.345,yaw:Math.PI})),
 ...Array.from({length:160},(_,i)=>{const lane=i%3,p=circuitAt(i*circuitLength(porchCircuit(lane))/160,lane);return{...p,id:'porch-visit-'+i,act:i%3?'stroll' as const:'view' as const,y:1.2,yaw:p.yaw+(i%2?Math.PI:0)};}),
 ...SHRINE_VISITS,
 ...Array.from({length:24},(_,i)=>({id:'censer-visit-'+i,act:'incense' as const,x:COURTYARD_CENSER.x+(i%6-2.5)*1.6,z:COURTYARD_CENSER.z+3+Math.floor(i/6)*2,y:0,yaw:Math.atan2(-(i%6-2.5)*1.6,-3-Math.floor(i/6)*2)})),
 ...Array.from({length:T.levels*8},(_,i)=>{const floor=Math.floor(i/8),side=i%8,a=(side+1)*Math.PI/4,p=balconyPoint(floor,a+.09);return{...p,id:'tower-visit-'+i,act:'view' as const,yaw:Math.PI/2-a,floor,side};}),
 ...Array.from({length:30},(_,i)=>({id:'rear-garden-'+i,act:'view' as const,x:-315+(i%15)*45,z:-347+Math.floor(i/15)*18,y:0,yaw:i%2?0:Math.PI})),
 {id:'wheel-west',act:'wheel',x:-195,z:415.5,y:0,yaw:Math.PI},
 {id:'wheel-east',act:'wheel',x:195,z:415.5,y:0,yaw:Math.PI},
];
export function initialVisitStop(index:number):VisitStop{const group=index<220?'listen-':index<320?'porch-':index<400?'shrine-':index<460?'tower-':index<480?'rear-':'censer-';const list=VISIT_STOPS.filter(s=>s.id.startsWith(group));const offset=index-(index<220?0:index<320?220:index<400?320:index<460?400:index<480?460:480);return group==='shrine-'?INITIAL_SHRINE_VISITS[offset%INITIAL_SHRINE_VISITS.length]:list[(offset*(group==='tower-'?37:1))%list.length];}
export function visitDwell(index:number,visit:number,act:LifeStop['act']){const r=visitRandom(index,visit,3);return act==='listen'||act==='meditate'?lifeDwell(index,visit):act==='bow'?35+r*100:act==='incense'?25+r*65:act==='view'?5+r*5:act==='wheel'?35+r*100:4+r*28;}
export function visitSpeed(index:number){return 1.12+visitRandom(index,0,7)*.34;}
/** Go to a different part of the campus, sometimes stopping nearby, sometimes crossing zones. */
export function nextVisit(index:number,visit:number,from:VisitStop,occupied:Set<string>){let best:VisitStop|undefined,score=Infinity;for(let k=0;k<32;k++){const p=VISIT_STOPS[Math.floor(visitRandom(index,visit,k+20)*VISIT_STOPS.length)];if(p.id===from.id||occupied.has(p.id))continue;const d=Math.hypot(p.x-from.x,p.z-from.z),local=visitRandom(index,visit,4)<.45,v=(local?d*.005:0)+visitRandom(index,visit,k+200)+(p.act===from.act?.5:0);if(v<score){score=v;best=p;}}return best??from;}
/** Explicit balconies/landings/spiral links: never interpolate vertically through a floor. */
export function towerVisitPath(from:VisitStop,to:VisitStop):VisitPoint[]{
 const out:VisitPoint[]=[];
 const addBalcony=(s:VisitStop,reverse:boolean)=>{const f=s.floor!,y=towerFloor(f),a=(s.side!+1)*Math.PI/4,start=SP+.09;let delta=((a+.09-start+Math.PI*3)%(Math.PI*2))-Math.PI;const n=Math.max(1,Math.ceil(Math.abs(delta)/.06)),points:VisitPoint[]=[];
  // Pass the first door beside the statue, then join the perimeter promenade.
  points.push(polar(8.02,SP,y),polar(8.3,SP,y,-1.2),polar(8.3,SP,y,-2.3),polar(octagonRadius(SP,towerRadius(f)-2.2)-.8,SP,y,-2.3));
  for(let k=0;k<=n;k++)points.push(balconyPoint(f,start+delta*k/n));points.push({x:s.x,y:s.y,z:s.z});out.push(...(reverse?points.reverse():points));};
 if(from.floor!==undefined)addBalcony(from,true);
 const a=from.floor??0,b=to.floor??0;
 if(a!==b){const start=a*T.stepsPerTurn,end=b*T.stepsPerTurn,dir=Math.sign(end-start);for(let k=start;dir>0?k<end:k>end;k+=dir){const step=dir>0?k:k-1,angle=SP+(step+.5)/T.stepsPerTurn*Math.PI*2;out.push(polar(6,angle,(step+1)*T.stairRise));}out.push(polar(8.02,SP,towerFloor(b)));}
 if(to.floor!==undefined)addBalcony(to,false);return out;
}
export const TOWER_ENTRY:VisitStop={id:'tower-entry',act:'stroll',x:T.x-64,z:T.z,y:0,yaw:Math.PI/2};
export const TOWER_STAIR_START:VisitStop={id:'tower-stair-start',act:'stroll',...polar(6,SP,0),yaw:0};

/** West gate and west door side lane, then the inner ring to the stair foot. */
export function towerGroundPath():VisitPoint[]{const points=[{x:T.x-64,z:T.z,y:0},{x:T.x-64,z:T.z-2.3,y:0},polar(9.1,Math.PI,0,2.3),polar(9.1,Math.PI,0)];for(let a=Math.PI;a>SP;a-=.08)points.push(polar(9.1,a,0));points.push(polar(9.1,SP,0),polar(6,SP,0));return points;}
