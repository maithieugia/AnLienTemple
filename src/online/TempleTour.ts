import {INCENSE_SITES,type Act,type IncenseSite} from './protocol.ts';
import {ALL_GARDEN_STATUES,FOUR_KINGS_PLINTH,type GardenStatue} from '../game/world/StatueGardenPlan.ts';
import {ENTRANCE_RIVER as RIVER,ENTRANCE_BRIDGE as BRIDGE} from '../game/world/EntranceRiverPlan.ts';
import {STUPA as T,STUPA_LIFT_PHASE as PH,octagonRadius,towerRadius} from '../game/world/StupaPlan.ts';

/**
 * Scripted walks for the pilgrim (anh Thanh 2026-11-04):
 *  - the incense ritual: pray holding the sticks, walk up to the censer, bend to plant them (the stick appears and merit is given then),
 *    step back to where you stood and make one full bow;
 *  - "Tự đi lễ": a self-guided round of the temple — visit the nearest altar not yet visited, offer incense there, push the prayer wheels,
 *    and start the round again when every stop has been visited. Any key, joystick or button press hands control back.
 */
export type Point={x:number;z:number};
export type TourStep={walk:Point[];speed?:number}|{act:Act;secs:number;yaw?:number;offer?:string;wheel?:boolean;say?:string;release?:{kind:'lantern'|'fish'|'sky';text:string}}
 /** ride the stupa lift to storey `lift` (0 = ground) */|{lift:number;say?:string}
 /** stand at the railing and take in the view toward `at`: over-the-shoulder camera sweeping ±`sweep` rad, tilting down to `beta` */|{look:{secs:number;at:Point;sweep:number;beta:number};say?:string};
export type TourStop={id:string;x:number;z:number;kind:'incense'|'wheel'|'statue'|'tower';site?:IncenseSite;statue?:GardenStatue;yaw?:number};

/** Where the pilgrim stands to bend over the altar / censer and plant the sticks. */
export function plantPoint(s:IncenseSite,from:Point):Point{
 return s.bowl?{x:s.x,z:s.z+s.bowl.r+.5}:{x:s.x+Math.max(-1.2,Math.min(1.2,from.x-s.x)),z:s.z+1.25};
}
/** Where a tour stops in front of an altar before the ritual. */
export function incenseStand(s:IncenseSite):Point{return{x:s.x,z:s.z+(s.bowl?s.bowl.r+2.4:2.8)};}
/** The incense ritual from where the pilgrim stands now. */
export function incenseSteps(s:IncenseSite,home:Point):TourStep[]{
 return [{act:'incense',secs:2.5,yaw:Math.PI},{walk:[plantPoint(s,home)]},{act:'bow',secs:1.8,yaw:Math.PI,offer:s.id},{walk:[{...home}]},{act:'bow',secs:6,yaw:Math.PI}];
}
export const WHEEL_STANDS=[{id:'wheel-west',x:-195,z:415.5},{id:'wheel-east',x:195,z:415.5}];
/** Statues without an altar that the round also pays respects to (anh Thanh 2026-11-05): the four heavenly kings, the golden triad,
 * the courtyard Buddhas and devas, Thiên Thủ Quán Âm… The guardian avenue is left out (not in the public build). */
const STATUE_GROUPS=new Set(['king','front-triad','owner','owner-court','owner-special']);
/** How far in front of a statue's centre the pilgrim stands (clear of its plinth, close enough to look up at it). */
/** How far the statue's name plate stands out from its centre (same numbers as StatueGarden.nameplates). */
export function plateOffset(s:GardenStatue){return s.group==='king'?FOUR_KINGS_PLINTH.half+.08:s.group==='owner'?(s.id==='owner-7'?10.3:5.1):s.depth?s.depth/2+.2:0;}
/** Stand in front of the plate with room to bow (anh Thanh 2026-11-06: at the Heavenly Kings the pilgrim stood against the plate). */
export function statueDistance(s:GardenStatue){return Math.max(s.group==='king'?27:s.depth?s.depth/2+5:Math.max(7,s.height*.45),plateOffset(s)+4);}
/** On the river or its banks' rails (anh Thanh 2026-11-06: the round tried to reach the lotus-watering Bồ Tát standing in the river). */
export const onRiver=(p:Point)=>p.z>RIVER.z0-4&&p.z<RIVER.z1+4&&Math.abs(p.x)>BRIDGE.halfWidth-1;
export const STATUE_STOPS:TourStop[]=ALL_GARDEN_STATUES.filter(s=>STATUE_GROUPS.has(s.group)).map(s=>{const d=statueDistance(s);return{id:'statue-'+s.id,x:s.x+Math.sin(s.yaw)*d,z:s.z+Math.cos(s.yaw)*d,kind:'statue' as const,statue:s,yaw:s.yaw+Math.PI};}).filter(s=>!onRiver(s));
/** The stupa lift on the ground floor: where the cabin lets pilgrims out (StupaElevator). */
export const LIFT_DOOR={x:T.x+3.2*Math.cos(PH),z:T.z+3.2*Math.sin(PH)};
export const TOWER_STOP:TourStop={id:'tower',...LIFT_DOOR,kind:'tower'};
/** Altars on the ground and in the hall, the two prayer wheels, the statues and the stupa (ride up, look out, ride down). */
export const TOUR_STOPS:TourStop[]=[
 ...INCENSE_SITES.filter(s=>s.floor<2).map(s=>({id:s.id,...incenseStand(s),kind:'incense' as const,site:s})),
 ...WHEEL_STANDS.map(w=>({...w,kind:'wheel' as const})),
 ...STATUE_STOPS,TOWER_STOP,
];
/** After this many stops in a round the stupa comes next, so the climb isn't always left to the very end. */
export const TOWER_AFTER=6;
/** The nearest stop not yet visited in this round (a new round starts when all are visited). */
export function nextTourStop(from:Point,seen:Set<string>):TourStop{
 if(TOUR_STOPS.every(s=>seen.has(s.id)))seen.clear();
 if(seen.size>=TOWER_AFTER&&!seen.has(TOWER_STOP.id)){seen.add(TOWER_STOP.id);return TOWER_STOP;}
 let best=TOUR_STOPS[0],bd=Infinity;for(const s of TOUR_STOPS){if(seen.has(s.id)||s===TOWER_STOP)continue;const d=Math.hypot(s.x-from.x,s.z-from.z);if(d<bd){bd=d;best=s;}}
 if(!Number.isFinite(bd))best=TOWER_STOP;
 seen.add(best.id);return best;
}
/** Inside the river (the courtyard side, including the lantern steps) or outside it (the gate square). */
export const insideRiver=(p:Point)=>p.z<RIVER.z0+12;
/** Crossing the entrance river goes over the bridge (anh Thanh 2026-11-06: the pilgrim walked sideways into the bank rail and paced
 * back and forth there). Returns the bridge waypoints between the two sides, or [] when no crossing is needed; `inEnd` is where the
 * bridge lands in the courtyard, `outEnd` on the gate square. */
export const BRIDGE_IN={x:BRIDGE.x,z:BRIDGE.z-BRIDGE.halfRun-6},BRIDGE_OUT={x:BRIDGE.x,z:BRIDGE.z+BRIDGE.halfRun+6};
export function bridgeCrossing(from:Point,to:Point):Point[]{
 const a=insideRiver(from),b=insideRiver(to);if(a===b)return [];
 return a?[BRIDGE_IN,BRIDGE_OUT]:[BRIDGE_OUT,BRIDGE_IN];
}
/** A point on the stupa's top storey, `r` metres out from the core at world angle `a`. */
export function towerTopPoint(a:number,inset:number):Point{const r=octagonRadius(a,towerRadius(T.levels-1))-inset;return{x:T.x+Math.cos(a)*r,z:T.z+Math.sin(a)*r};}
/** What the pilgrim looks down on from the top: the courtyard in front of the main hall. */
export const TOWER_VIEW={x:0,z:300};
/** Up the stupa by lift, out the short way to the railing on the side facing the temple (anh Thanh 2026-11-05: walking round the
 * whole gallery was too long), look out all around and then down on the main hall and the courtyard; kneel and bow; ride down. */
export function towerSteps(path:Point[]):TourStep[]{
 const view=Math.atan2(TOWER_VIEW.z-T.z,TOWER_VIEW.x-T.x),face=Math.atan2(TOWER_VIEW.x-T.x,TOWER_VIEW.z-T.z);
 let turn=view-PH;turn=((turn%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;   // shortest way round, from the lift door to the view side
 const out=towerTopPoint(PH,6),mid=towerTopPoint(PH+turn/2,4),rail=towerTopPoint(view,2.2);
 return [{walk:path},{lift:T.levels-1,say:'🛕 Lên đỉnh tháp Phù Đồ bằng thang máy'},{walk:[out,mid,rail]},
  {look:{secs:14,at:TOWER_VIEW,sweep:1.1,beta:1.2},say:'Từ đỉnh tháp ngắm cảnh, nhìn xuống chánh điện và sân chùa'},
  {act:'kneel',secs:5,yaw:face},{act:'bow',secs:6,yaw:face},{walk:[mid,out]},{lift:0},{walk:[{x:LIFT_DOOR.x-6,z:LIFT_DOOR.z-6}]}];
}
/** What to do in front of a statue: one of several ways of paying respects, chosen per statue so a round varies. */
export function statueSteps(stop:TourStop,path:Point[]):TourStep[]{
 const s=stop.statue!,yaw=stop.yaw!,say='🙏 Đảnh lễ '+s.name,v=[...s.id].reduce((a,c)=>a+c.charCodeAt(0),0)%4;
 if(v===0)return [{walk:path},{act:'kneel',secs:5,yaw,say},{act:'bow',secs:6,yaw}];
 if(v===1)return [{walk:path},{act:'bow',secs:6,yaw,say},{act:'bow',secs:6,yaw},{act:'bow',secs:6,yaw}];
 if(v===2)return [{walk:path},{act:'bow',secs:6,yaw,say},{act:'sit',secs:10,yaw},{act:'bow',secs:6,yaw}];
 // tam bộ nhất bái for the last few metres: stop short, then three steps and one bow, twice, and kneel at the statue
 const back={x:stop.x-Math.sin(yaw)*4.2,z:stop.z-Math.cos(yaw)*4.2},approach=path.length?path.slice(0,-1).concat(back):[back];
 return [{walk:approach},{act:'kneel',secs:2,yaw,say:say+' · tam bộ nhất bái'},...tamBoSteps(back,yaw),...tamBoSteps({x:back.x+Math.sin(yaw)*2.1,z:back.z+Math.cos(yaw)*2.1},yaw),{act:'kneel',secs:5,yaw}];
}
/** What to do at a stop, after walking there along `path`. */
export function stopSteps(stop:TourStop,path:Point[]):TourStep[]{
 if(stop.kind==='tower')return towerSteps(path);
 if(stop.kind==='statue')return statueSteps(stop,path);
 if(stop.kind==='wheel')return [{walk:path},{act:'wheel',secs:6,yaw:Math.PI,wheel:true},{act:'wheel',secs:6,yaw:Math.PI,wheel:true},{act:'bow',secs:6,yaw:Math.PI}];
 const steps=incenseSteps(stop.site!,{x:stop.x,z:stop.z}),first=steps[0];if('act' in first)first.say='🪔 Thắp nhang · '+stop.site!.label;
 // every other altar ends kneeling in prayer after the bow
 if([...stop.id].reduce((a,c)=>a+c.charCodeAt(0),0)%2)steps.push({act:'kneel',secs:5,yaw:Math.PI});
 return [{walk:path},...steps];
}

/** Letting a lotus lantern or a golden carp go from the last river step: hold it in prayer, bend down to the water and let it go. */
export function riverReleaseSteps(kind:'lantern'|'fish',text:string):TourStep[]{
 return [{act:kind,secs:4,yaw:0},{act:'bow',secs:1.8,yaw:0,release:{kind,text}},{act:'idle',secs:.6}];
}
/** A sky lantern: pray holding it for 5 s (anh Thanh 2026-11-05: 15 s was too long), raise both hands and let the wind take it. */
export function skyReleaseSteps(text:string):TourStep[]{return [{act:'sky',secs:5},{act:'raise',secs:2.8,release:{kind:'sky',text}},{act:'idle',secs:.5}];}
/** Tam bộ nhất bái: three slow steps ahead, then one full bow (repeated while the mode is on). */
export function tamBoSteps(from:Point,yaw:number):TourStep[]{const d=2.1;return [{walk:[{x:from.x+Math.sin(yaw)*d,z:from.z+Math.cos(yaw)*d}],speed:1.05},{act:'bow',secs:6,yaw}];}
