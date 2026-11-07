import {OWNER_COLLECTION}from './OwnerCollectionPlan.ts';
import {entranceTerrainY}from './EntranceRiverPlan.ts';
/** Full-size fictional An Lien campus. Metres; independent of renderer and save state. */
export const SANCTUARY={id:'an-lien-sanctuary',name:'Chùa An Liên · quần thể hư cấu',x:3200,z:-800,y:.4,yaw:0};
export const SANCTUARY_HALL={x0:-300,x1:300,z0:-200,z1:200,width:600,depth:400,floor:1.2,upper:31.65,ceiling:61.65};
/** Clear heights (anh Thanh, 2026-10-30, raised twice): ground floor 30 m, upper floor 30 m — the main Buddha now sits whole on the ground floor. */
export const SANCTUARY_LEVELS={floor:1.2,lowerHeight:30,upper:31.65,upperHeight:30,eaves:61.65};
/** Five front flights connect courtyard to the 1.2 m veranda, including collision. */
export function sanctuaryFrontSteps(){return [-240,-120,0,120,240].flatMap(x=>Array.from({length:8},(_,i)=>({cx:x,cz:238+(7-i)*.34+.17,hx:18,hz:.17,base:0,h:(i+1)*.15,yaw:0,sight:true,climb:true,surface:true,step:true})));}
/** Five connected roof tiers: lower veranda, main ring, two receding upper rings and crown. */
export const SANCTUARY_ROOF={ridgeHalf:100,eaveX:344,eaveZ:244,eaveY:61.3,rise:38.7,upturn:7,skirtOut:16,skirtTop:31.5,skirtDrop:3,
 colonnade:{x:322,z:222,step:24},terraceX:336,terraceZ:236,platformX:338,platformZ:238};
/** Open nave: the upper floor is retained as two side galleries and a front connecting balcony. */
/** Gaps in the veranda balustrade with steps to the ground: sides at z=sideZ, between the veranda columns at z=18/42 (toward the east gate/stupa), rear at the two rear doors plus a wide central flight. */
export const SANCTUARY_TERRACE_OPENINGS={sideZ:30,rearX:0,half:6,rearCenterHalf:14};
/** anh Thanh 2026-11-01: the nave is open through both storeys from the entrance wall to the Buddha (no front balcony). */
/** anh Thanh 2026-11-01: the roof crown is raised 150 m. The Blender roof (vb-sanctuary-grand-roof) is lifted at load time:
 * each of its three clerestory drums grows 50 m (vertical stretch inside each zone, constant shift above), so the five roofs keep their shape. */
/** Runtime remap of the source roof: 61.3m eaves, 94m central vault drum, 100m highest ornament. */
export const SANCTUARY_ROOF_LIFT={each:0,zones:[] as [number,number][]};
export function roofLiftY(y:number){return y<=101.3?y*61.3/101.3:y<=154.6?61.3+(y-101.3)*32.7/53.3:94+(y-154.6)*6/(191.6999969482422-154.6);}
/** The clerestory floor slab inside the roof model (removed so the vault is open from below). */
export const CLERESTORY_FLOOR={x:246.6,z:146.6,y0:105.4,y1:106.6};
/** Stepped vault (vòm tầng) over the hall: a flat coffered ring at the eaves, then three receding drums, each closed by a coffered ring,
 * just inside the roof's drums (Blender x 238/184/154, y 138/84/54) and 1.2 m under each lifted drum top. Hall-local metres. */
export const SANCTUARY_VAULT=[{x:236.6,z:136.6,top:roofLiftY(119.6)-1.2},{x:183,z:83,top:roofLiftY(137.6)-1.2},{x:153,z:53,top:roofLiftY(154.6)-1.2}];
/** anh Thanh 2026-11-01: the central front bay is open for the whole ground storey so the Buddha is seen from the tam quan gate. */
/** anh Thanh 2026-11-01: ground-storey doors — two at the ends of the rear wall (walk straight through front to back, beside the corner stairs)
 * and one in each side wall at the terrace steps (z=28.8, in the gap between two of the hundred gallery Buddhas) toward the left and right wings. Opening is 2*half wide, h tall. */
export const SANCTUARY_HALL_DOORS=[{wall:'rear' as const,at:-290,half:5},{wall:'rear' as const,at:0,half:12},{wall:'rear' as const,at:290,half:5},{wall:'west' as const,at:28.8},{wall:'east' as const,at:28.8}];
export const HALL_DOOR={half:5,h:12};
/** anh Thanh 2026-11-03: the great stone censer on the axis between the hall's front steps (z≈242) and the Amitabha terrace (z≈350).
 * Model 1.6 m tall; bowl ash bed at y=ash, inner radius bowlR; three big burning sticks (x,z in the bowl, height, lean/tilt in radians). */
export const COURTYARD_CENSER_SCALE=5/1.6;
export const COURTYARD_CENSER={x:0,z:296,yaw:0,height:5,footprint:.82*COURTYARD_CENSER_SCALE,ash:1.22*COURTYARD_CENSER_SCALE,bowlR:.36*COURTYARD_CENSER_SCALE,smallSticks:70,
 bigSticks:[{x:-.15,z:.02,h:1.25,lean:0,tilt:.07},{x:0,z:-.03,h:1.45,lean:-.03,tilt:0},{x:.15,z:.02,h:1.25,lean:0,tilt:-.07}]};
export const SANCTUARY_GRAND_PORTAL={x:0,half:60};
export const SANCTUARY_ATRIUM={x0:-160,x1:160,z0:-200,z1:200};
export const SANCTUARY_COURT={x0:-350,x1:350,z0:230,z1:530,width:700,depth:300};
export const SANCTUARY_BOUNDS={x0:-400,x1:400,z0:-400,z1:720};
export const SANCTUARY_GATE={x:SANCTUARY.x,z:SANCTUARY.z+565};
export const SANCTUARY_BODHI={x:-90,z:280};
export const FORMER_SANCTUARY_PONDS=[{x:175,z:385,rx:70,rz:38},{x:-215,z:390,rx:48,rz:26}];
/** The ponds are replaced by two ground-level prayer wheels. */
export const SANCTUARY_PONDS:{x:number;z:number;rx:number;rz:number}[]=[];
export const SANCTUARY_ROUTE:[number,number][]=[[2300,-177.82],[2500,-180],[2700,-180],[3200,-180],[3200,-235]];
/** Single open hall: no upper slab or stairs remain. */
export const SANCTUARY_STAIRS:{x:number;z:number}[]=[];
/** The hall's ten Bodhisattvas stand in one row across the front of the main Buddha's throne (anh Thanh 2026-11-04: "2 hàng → 1 hàng ngang"),
 * clear of the main altar and the ceremony's prayer pads (|x| ≤ 21). Guanyin slots at ±28, side slots 0–3 at ±42…±84. */
export const BODHISATTVA_ROW_Z=12.5;
export const BODHISATTVA_ROW_X=[42,56,70,84];
export const SANCTUARY_STATUES=[
 // 04/11: owner source statue (including halo/lotus), 80m, below the central 92.8m vault.
 {id:'main-buddha',kind:'anlien' as const,x:0,z:-45,height:80,base:5.8,yaw:0,label:'Phật Thích Ca ngồi kiết già · hào quang lá bồ đề · đài sen (mẫu anh Thanh)'},
 {id:'guanyin-west',kind:'guanyin' as const,x:-28,z:BODHISATTVA_ROW_Z,height:12,base:2.8,yaw:0,label:'Quan Âm · mẫu quét tượng cổ Mia'},
 {id:'guanyin-east',kind:'guanyin' as const,x:28,z:BODHISATTVA_ROW_Z,height:12,base:2.8,yaw:0,label:'Quan Âm · mẫu quét tượng cổ Mia'},
 ...[-1,1].flatMap(side=>Array.from({length:6},(_,i)=>({id:`side-${side}-${i}`,kind:i%2?'guanyin' as const:'buddha' as const,x:i<4?side*BODHISATTVA_ROW_X[i]:side*100,z:i<4?BODHISATTVA_ROW_Z:-96+i*44,height:7,base:2.3,yaw:i<4?0:side>0?-.35:.35,label:i%2?'Quan Âm · tượng quét':'Phật ngồi · tượng quét'}))),
];
/** Owner disabled the old stone scans; keep their layout/plinths for replacements. */
export const HALL_STONE_STATUES_ENABLED=false;
export function sanctuaryStatueEnabled(s:{kind:string}){return HALL_STONE_STATUES_ENABLED||(s.kind!=='buddha'&&s.kind!=='guanyin');}
export const SANCTUARY_ROOF_BAYS=Array.from({length:20},(_,i)=>({id:'roof-'+i,x:-240+(i%5)*120,z:-150+Math.floor(i/5)*100}));
export function inSanctuaryCampus(p:{x:number;z:number},margin=0){const x=p.x-SANCTUARY.x,z=p.z-SANCTUARY.z;return x>SANCTUARY_BOUNDS.x0-margin&&x<SANCTUARY_BOUNDS.x1+margin&&z>SANCTUARY_BOUNDS.z0-margin&&z<SANCTUARY_BOUNDS.z1+margin;}
export function sanctuaryPondAt(x:number,z:number){x-=SANCTUARY.x;z-=SANCTUARY.z;return SANCTUARY_PONDS.find(p=>((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2<1);}
export function sanctuaryHeight(x:number,z:number,base:number){const lx=x-SANCTUARY.x,lz=z-SANCTUARY.z,d=Math.max(SANCTUARY_BOUNDS.x0-lx,lx-SANCTUARY_BOUNDS.x1,SANCTUARY_BOUNDS.z0-lz,lz-SANCTUARY_BOUNDS.z1);if(d>=16)return base;if(d>0)return .4+(base-.4)*d/16;const river=entranceTerrainY(lx,lz);if(river<0)return .4+river;const pond=sanctuaryPondAt(x,z);if(pond){const r=Math.sqrt(((lx-pond.x)/pond.rx)**2+((lz-pond.z)/pond.rz)**2);return .4-2*Math.min(1,(1-r)*5);}return .4;}
/** Plinth half-size of a statue (the main Buddha's is square and huge). */
export function statuePlinth(s:{id:string;height:number}){const r=s.id==='main-buddha'?27:s.id.startsWith('guanyin-')?6:4;const replacement=OWNER_COLLECTION.find(p=>p.slot===s.id),rz=s.id==='main-buddha'?r:r*.7;if(!replacement)return{rx:r,rz};const c=Math.abs(Math.cos(replacement.yaw)),sn=Math.abs(Math.sin(replacement.yaw));return{rx:Math.max(r,(replacement.width*c+replacement.depth*sn)/2+.8),rz:Math.max(rz,(replacement.width*sn+replacement.depth*c)/2+.8)};}
/** anh Thanh 2026-11-01: no columns inside the hall at all — a clear floor; the galleries hang from the walls and roof. */
export function interiorColumnPositions():{x:number;z:number}[]{return [];}
export function sanctuaryUpperPieces(holes:PlanRect[]=[]){return [] as PlanRect[];}
/** The main sacred figure stays present across the entire playable approach. */
export function sanctuaryStatueVisibility(s:{id:string},distance:number,low:boolean):'high'|'low'{
 const main=s.id==='main-buddha';/* anh Thanh 2026-11-01: statues are always visible from afar (low detail), never only up close */return distance<(main?(low?110:180):(low?30:55))?'high':'low';
}
/** The hall ritual (monks, pads, lay assembly) was laid out for an altar at z=-132; it moves with the main Buddha's altar. */
/** How far the hall ceremony (monks, lay seats) sits in front of its original layout. Fixed at 145 m: the lay seats already reach the
 * front doors, so the ceremony stays where it is when the Buddha moves forward. */
export const HALL_RITUAL_SHIFT=145;
export function statueClearance(s:{id:string;height:number}){const p=statuePlinth(s);return Math.hypot(p.rx,p.rz)+3;}
/** Where the giant columns stand: all round the hall, open in front of the five stair flights. */
export function giantColumnPositions(){const G=SANCTUARY_ROOF.colonnade,out:{x:number;z:number}[]=[];for(const x of [-G.x,G.x])for(let z=-G.z;z<=G.z+.01;z+=G.step)out.push({x,z});for(const z of [-G.z,G.z])for(let x=-G.x+G.step;x<G.x-.01;x+=G.step){if(z<0&&[-290,0,290].some(px=>Math.abs(x-px)<(px===0?17:9)))continue;if(z>0&&[-240,-120,0,120,240].some(px=>Math.abs(x-px)<14))continue;out.push({x,z});}return out;}
export type PlanRect={x0:number;x1:number;z0:number;z1:number};
/** Exact rectangle subtraction so every staircase is an actual hole in the upper slab. */
export function cutSanctuarySlab(rect:PlanRect,holes:PlanRect[]){let pieces=[rect];for(const h of holes){const next:PlanRect[]=[];for(const p of pieces){const x0=Math.max(p.x0,h.x0),x1=Math.min(p.x1,h.x1),z0=Math.max(p.z0,h.z0),z1=Math.min(p.z1,h.z1);if(x1<=x0||z1<=z0){next.push(p);continue;}next.push({x0:p.x0,x1:x0,z0:p.z0,z1:p.z1},{x0:x1,x1:p.x1,z0:p.z0,z1:p.z1},{x0,x1,z0:p.z0,z1:z0},{x0,x1,z0:z1,z1:p.z1});}pieces=next.filter(p=>p.x1-p.x0>.001&&p.z1-p.z0>.001);}return pieces;}
export function sanctuarySeatPositions(){const out:{x:number;z:number}[]=[];for(const bx of [-220,-140,-60,60,140,220])for(let i=0;i<8;i++)for(let j=0;j<9;j++){const x=bx+(i-3.5)*1.6,z=-72+j*2.1;if(SANCTUARY_STATUES.some(s=>Math.hypot(s.x-x,s.z-z)<statueClearance(s)))continue;out.push({x,z});}return out;}
export function sanctuaryPOIs(){return[{...SANCTUARY,x:SANCTUARY_GATE.x,z:SANCTUARY_GATE.z}, {id:'an-lien-hall',name:'Chánh điện ·600×400m·2tầng',x:SANCTUARY.x,z:SANCTUARY.z+185,yaw:0},{id:'an-lien-buddha',name:'Chánh đàn ·Phật ngồi',x:SANCTUARY.x,z:SANCTUARY.z+20,yaw:0},{id:'an-lien-bodhi',name:'Vườn chùa ·cây bồ đề',x:SANCTUARY.x+SANCTUARY_BODHI.x,z:SANCTUARY.z+SANCTUARY_BODHI.z,yaw:0}];}

/** Build a plinth only for a visible statue or an installed owner replacement. */
export function sanctuaryPlinthEnabled(s:{id:string;kind:string}){return sanctuaryStatueEnabled(s)||OWNER_COLLECTION.some(p=>p.slot===s.id);}
