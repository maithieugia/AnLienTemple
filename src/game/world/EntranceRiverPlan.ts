/** Campus-local metres. The river sits outside the tam-quan gate (z565). */
export const ENTRANCE_RIVER={x0:-395,x1:395,z0:600,z1:680,water:-2.4,bed:-5,stairStart:597.5,stepRun:1.2,stepRise:.28,steps:8} as const;
export const ENTRANCE_BRIDGE={x:0,z:640,halfRun:55,halfWidth:7,rise:8,thickness:.85} as const;
/** Extend stair masonry 2.5 cm into the side wall, avoiding a visible seam. */
export const ENTRANCE_STAIR_INNER_EDGE=ENTRANCE_BRIDGE.halfWidth-.025;
export const ENTRANCE_STAIR_RANGES:readonly (readonly[number,number])[]=[[-390,-ENTRANCE_STAIR_INNER_EDGE],[ENTRANCE_STAIR_INNER_EDGE,390]];
export const ENTRANCE_GATE={z:565,columnHeight:18,columnScale:1.5,columns:[-24,-9,9,24],beamY:17.7,lower:{width:56,depth:22,base:18.1,rise:5.4},middle:{width:46,depth:17.5,base:23.2,rise:4.2},upper:{width:34,depth:12.5,base:27.5,rise:3.6},upturn:2.6,signY:14.5,signWidth:16} as const;
/** A circular segment: visibly arched, with a practical 26 degree maximum slope. */
export function entranceBridgeY(z:number){const b=ENTRANCE_BRIDGE,t=z-b.z;if(Math.abs(t)>b.halfRun)return null;const r=(b.halfRun*b.halfRun+b.rise*b.rise)/(2*b.rise);return Math.sqrt(Math.max(0,r*r-t*t))-(r-b.rise);}
export function entranceTerrainY(x:number,z:number){const r=ENTRANCE_RIVER;return x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1?r.bed:0;}
/** Nine joined treads, including a level top landing and a broad water-side landing. */
export const ENTRANCE_STAIR_TREADS=Array.from({length:ENTRANCE_RIVER.steps+1},(_,i)=>({z0:ENTRANCE_RIVER.stairStart+i*ENTRANCE_RIVER.stepRun,z1:ENTRANCE_RIVER.stairStart+(i+1)*ENTRANCE_RIVER.stepRun+(i===ENTRANCE_RIVER.steps?1.2:0),y:i===0?0:-i*ENTRANCE_RIVER.stepRise}));
/** Invisible barriers follow the water-facing edges, leaving the landing and bridge open. */
export function entranceWaterBarriers(){
 const river=ENTRANCE_RIVER;
 const stairEnd=ENTRANCE_STAIR_TREADS.at(-1)!.z1;
 const barriers=[];
 for(const side of [-1,1]){
  const box=(x0:number,x1:number,z0:number,z1:number)=>({
   cx:side*(x0+x1)/2,cz:(z0+z1)/2,hx:(x1-x0)/2,hz:(z1-z0)/2,
   base:river.bed,h:1-river.bed,yaw:0,sight:false,climb:false
  });
  barriers.push(
   box(ENTRANCE_BRIDGE.halfWidth,390,stairEnd,stairEnd+.8),
   box(390,river.x1,river.z0,river.z0+.8),
   box(390,390.8,river.z0,stairEnd+.8),
   box(ENTRANCE_BRIDGE.halfWidth,river.x1,river.z1-.8,river.z1),
   box(ENTRANCE_BRIDGE.halfWidth-.8,ENTRANCE_BRIDGE.halfWidth,river.z0,stairEnd+.8),
  );
 }
 return barriers;
}
/** Bank-only rails: no rail across the stair frontage or at the water-side landing. */
export const ENTRANCE_BANK_RAILS:readonly (readonly[number,number,number,number])[]=[[-395,597,-390,597],[390,597,395,597],[-395,681.5,-8,681.5],[8,681.5,395,681.5],[-395,590,-395,714],[395,590,395,714],[-395,714,-15,714],[15,714,395,714]];
export const ENTRANCE_BRIDGE_PIERS=[-1,1].flatMap(side=>[ENTRANCE_BRIDGE.z-ENTRANCE_BRIDGE.halfRun,ENTRANCE_BRIDGE.z+ENTRANCE_BRIDGE.halfRun].map(z=>({x:side*7,z,width:3.3,height:5.4})));
/** Semicircular opening begins exactly at the waterline; the rest is solid masonry. */
export const ENTRANCE_ARCH_RADIUS=9;
export function entranceBridgeSoffitY(z:number){const d=z-ENTRANCE_BRIDGE.z;return Math.abs(d)<=ENTRANCE_ARCH_RADIUS?ENTRANCE_RIVER.water+Math.sqrt(Math.max(0,ENTRANCE_ARCH_RADIUS**2-d*d)):ENTRANCE_RIVER.bed;}
/** The same analytic deck controls both offline and online feet: no floating flat collider. */
export function entranceWalkY(x:number,z:number){const r=ENTRANCE_RIVER,b=ENTRANCE_BRIDGE,deck=entranceBridgeY(z);if(Math.abs(x)<=b.halfWidth&&deck!==null)return deck;if(Math.abs(x)>=ENTRANCE_STAIR_INNER_EDGE&&Math.abs(x)<390){const tread=ENTRANCE_STAIR_TREADS.find(t=>z>=t.z0&&z<t.z1);if(tread)return tread.y;}return entranceTerrainY(x,z);}
export function entranceBridgeRoute():[number,number][]{return [[0,705],[0,695],[0,680],[0,660],[0,640],[0,620],[0,600],[0,585],[0,565],[0,552]];}
/** Follow the arch quickly enough even when running down its steepest section. */
export function entranceFeetY(x:number,z:number,feet:number,support:number,dt:number){const target=Math.max(entranceWalkY(x,z),Number.isFinite(support)?support:-Infinity),onBridge=Math.abs(x)<=ENTRANCE_BRIDGE.halfWidth&&entranceBridgeY(z)!==null;return target>=feet?target:Math.max(target,feet-dt*(onBridge?6:4));}
/** Rail collision segments share the exact sampled profile used by the rendered stone rails. */
export function entranceBridgeBarriers(){const out:{cx:number;cz:number;hx:number;hz:number;base:number;h:number;yaw:number;sight:boolean;climb:boolean}[]=[],b=ENTRANCE_BRIDGE,n=140;for(let i=0;i<n;i++){const z0=b.z-b.halfRun+2*b.halfRun*i/n,z1=b.z-b.halfRun+2*b.halfRun*(i+1)/n,y0=entranceBridgeY(z0)!,y1=entranceBridgeY(z1)!;for(const side of [-1,1])out.push({cx:side*b.halfWidth,cz:(z0+z1)/2,hx:.22,hz:(z1-z0)/2+.015,base:Math.min(y0,y1),h:1.5+Math.abs(y1-y0),yaw:0,sight:true,climb:false});}return out;}
