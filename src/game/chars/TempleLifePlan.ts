import {LAY_SEATS} from './LayAssemblyPlan.ts';
export type LifePoint={x:number;z:number};
export type LifeActivity='listen'|'meditate'|'bow'|'wheel'|'stroll'|'view'|'incense';
export const LIFE_WALK_SPEED=1.35;
export const LIFE_DWELL_MIN=300,LIFE_DWELL_MAX=600;
export const LIFE_STOPS=[
 {...LAY_SEATS[60],id:'hall-west',act:'listen',y:1.345,yaw:Math.PI},
 {...LAY_SEATS[810],id:'hall-east',act:'listen',y:1.345,yaw:Math.PI},
 {...LAY_SEATS[166],id:'hall-meditation',act:'meditate',y:1.345,yaw:Math.PI},
 {id:'courtyard-west',act:'bow',x:-145,z:289,y:0,yaw:Math.PI},
 {id:'courtyard-east',act:'bow',x:145,z:289,y:0,yaw:Math.PI},
 {id:'bodhi-meditation',act:'meditate',x:-112,z:308,y:0,yaw:Math.PI},
 {id:'wheel-west',act:'wheel',x:-195,z:415.5,y:0,yaw:Math.PI},
 {id:'wheel-east',act:'wheel',x:195,z:415.5,y:0,yaw:Math.PI},
 {id:'porch-west',act:'stroll',x:-110,z:214,y:1.2,yaw:Math.PI/2},
 {id:'porch-east',act:'stroll',x:110,z:214,y:1.2,yaw:-Math.PI/2},
 {id:'court-meditation',act:'meditate',x:38,z:432,y:0,yaw:-Math.PI/2},
 {id:'court-prayer',act:'bow',x:-38,z:432,y:0,yaw:Math.PI/2},
 {...LAY_SEATS[286],id:'hall-listen-back',act:'listen',y:1.345,yaw:Math.PI},
] as const;
export type LifeStop={id:string;act:LifeActivity;x:number;z:number;y:number;yaw:number};
export const TEMPLE_RESIDENT_COUNT=500;
/** How many simulated pilgrims actually walk the grounds (anh Thanh 2026-11-04: 200, 100 men and 100 women); they take every
 * 2.5th of the 500 planned starting places so all zones stay visited. Odd index = man, even index = woman. */
export const TEMPLE_VISITOR_COUNT=200;
export const visitorSlot=(index:number)=>Math.floor(index*TEMPLE_RESIDENT_COUNT/TEMPLE_VISITOR_COUNT);
export const visitorIsMan=(index:number)=>index%2===1;
/** Two offset, rounded circuits between the hall walls and the veranda columns. */
export function porchCircuit(lane=0):LifePoint[]{
 const x=309+lane*3,z=209+lane*3,r=8;
 return [{x:-x+r,z},{x:x-r,z},{x,z:z-r},{x,z:-z+r},{x:x-r,z:-z},{x:-x+r,z:-z},{x:-x,z:-z+r},{x:-x,z:z-r}];
}
export function circuitLength(path:LifePoint[]){return path.reduce((sum,p,i)=>sum+Math.hypot(path[(i+1)%path.length].x-p.x,path[(i+1)%path.length].z-p.z),0);}
export function circuitAt(distance:number,lane=0){const path=porchCircuit(lane),total=circuitLength(path);let left=((distance%total)+total)%total;for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length],d=Math.hypot(b.x-a.x,b.z-a.z);if(left<=d)return{x:a.x+(b.x-a.x)*left/d,z:a.z+(b.z-a.z)*left/d,yaw:Math.atan2(b.x-a.x,b.z-a.z)};left-=d;}return{...path[0],yaw:0};}
export const CROWD_STOPS:LifeStop[]=[
 ...LAY_SEATS.filter((_,i)=>i%2===0).map(p=>({...p,id:'seat-'+p.id,act:'listen' as const,y:1.345,yaw:Math.PI})),
 ...Array.from({length:120},(_,i)=>{const p=circuitAt(Math.floor(i/2)*circuitLength(porchCircuit(i%2))/60,i%2);return{...p,id:'circuit-'+i,act:'stroll' as const,y:1.2};}),
 ...Array.from({length:100},(_,i)=>({id:'court-'+i,act:i%3?'meditate' as const:'bow' as const,x:-65+(i%10)*14,z:305+Math.floor(i/10)*12,y:0,yaw:Math.PI})),
 ...LIFE_STOPS.filter(s=>s.act==='wheel'),
];
export function initialCrowdStop(index:number):LifeStop{if(index<350)return CROWD_STOPS[(index*37)%750];if(index<470)return CROWD_STOPS[750+index-350];if(index<498)return CROWD_STOPS[870+index-470];return CROWD_STOPS[970+index-498];}
/** Each resident visits every zone in a different order, with its own dwell clock. */
export function lifeStop(person:number,visit:number){return LIFE_STOPS[(person+visit*3)%LIFE_STOPS.length];}
export function lifeDwell(person:number,visit:number){return LIFE_DWELL_MIN+((person*97+visit*131)%301);}
/** A bounded grid search: collision/step probes are supplied by the live world. */
export function lifeRoute(start:LifePoint,end:LifePoint,clear:(a:LifePoint,b:LifePoint)=>boolean,maxNodes=18000):LifePoint[]{
 if(clear(start,end))return[end];
 const step=4,key=(p:LifePoint)=>`${Math.round(p.x/step)},${Math.round(p.z/step)}`;
 const snap=(p:LifePoint)=>({x:Math.round(p.x/step)*step,z:Math.round(p.z/step)*step});
 let s=snap(start);if(!clear(start,s)){
  const options:LifePoint[]=[];for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)options.push({x:s.x+dx*step,z:s.z+dz*step});
  const valid=options.sort((a,b)=>Math.hypot(a.x-start.x,a.z-start.z)-Math.hypot(b.x-start.x,b.z-start.z)).find(p=>clear(start,p));if(!valid)return[];s=valid;
 }
 type Entry={p:LifePoint;g:number;f:number};
 const goal=snap(end),open:Entry[]=[],cost=new Map([[key(s),0]]),prev=new Map<string,LifePoint>();
 const push=(v:Entry)=>{open.push(v);let i=open.length-1;while(i>0){const parent=(i-1)>>1;if(open[parent].f<=v.f)break;open[i]=open[parent];i=parent;}open[i]=v;};
 const pop=()=>{const first=open[0],last=open.pop()!;if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(last.f<=open[c].f)break;open[i]=open[c];i=c;}open[i]=last;}return first;};
 push({p:s,g:0,f:0});
 let count=0;
 while(open.length&&count++<maxNodes){
  const cur=pop(),k=key(cur.p);if(cur.g!==cost.get(k))continue;
  if(Math.hypot(cur.p.x-goal.x,cur.p.z-goal.z)<step*1.5&&clear(cur.p,end)){
   const path=[end,cur.p];let p=cur.p;
   while(prev.has(key(p))){p=prev.get(key(p))!;path.push(p);}path.reverse();path.unshift(start);
   const simple:LifePoint[]=[];let i=0;while(i<path.length-1){let j=path.length-1;while(j>i+1&&!clear(path[i],path[j]))j--;simple.push(path[j]);i=j;}return simple;
  }
  for(const[dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const p={x:cur.p.x+dx*step,z:cur.p.z+dz*step};if(p.x< -390||p.x>550||p.z< -385||p.z>590)continue;
   const nk=key(p),g=cur.g+Math.hypot(dx,dz)*step;if(g>=(cost.get(nk)??Infinity)||!clear(cur.p,p))continue;
   cost.set(nk,g);prev.set(nk,cur.p);push({p,g,f:g+Math.hypot(p.x-end.x,p.z-end.z)});
  }
 }return[];
}
