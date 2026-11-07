import {ENTRANCE_RIVER as R,ENTRANCE_STAIR_TREADS as TREADS} from '../game/world/EntranceRiverPlan.ts';

/**
 * Offerings released by pilgrims (anh Thanh 2026-11-05): lotus lanterns (hoa đăng) and golden carp (cá chép vàng) let go on the river
 * from its last step, and sky lanterns (đèn trời) raised up anywhere outdoors. The server keeps them so everyone sees the same ones;
 * every client moves them with the same seeded random walk, so a pilgrim who arrives later still sees each one where it really is.
 */
export const RELEASE_KINDS=['lantern','fish','sky'] as const;
export type ReleaseKind=typeof RELEASE_KINDS[number];
export type Release={id:number;kind:ReleaseKind;x:number;y:number;z:number;t:number;text:string};
/** How long each kind stays in the world (seconds) and how many of each are kept at once. */
export const RELEASE_LIFE:Record<ReleaseKind,number>={lantern:15*60,fish:30*60,sky:150};
export const RELEASE_CAP:Record<ReleaseKind,number>={lantern:160,fish:160,sky:40};
export const RELEASE_COOLDOWN=6;
/** Water surface of the entrance river. */
export const WATER_Y=R.water;
const LAST=TREADS[TREADS.length-1],PREV=TREADS[TREADS.length-2];
/** On the last two river steps, beside the bridge (where a lantern or carp can be put on the water). */
export function onRiverStep(p:{x:number;y:number;z:number}){return p.z>=PREV.z0-.2&&p.z<=LAST.z1+.4&&Math.abs(p.x)>9&&Math.abs(p.x)<388&&p.y<-1.4;}
/** Where an offering lands on the water in front of the pilgrim. */
export function waterStart(x:number){return{x:Math.max(-386,Math.min(386,Math.abs(x)<11?Math.sign(x||1)*11:x)),z:LAST.z1+1.1};}

/** Small deterministic generator (mulberry32). */
export function seeded(seed:number){let a=(seed*2654435761)>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** Bounds of open water a floating offering may use (keeps away from the banks and the bridge piers). */
export const WATER_BOX={x0:-388,x1:388,z0:LAST.z1+.6,z1:R.z1-2,clear:11};

/** Seeded random walk on the water: one step per second, positions interpolate between steps. */
export class Drift{
 private rnd:()=>number;private steps:{x:number;z:number}[]=[];private h:number;private v:number;private r:Release;
 constructor(r:Release){this.r=r;this.rnd=seeded(r.id+(r.kind==='fish'?7919:0));const s=waterStart(r.x);this.steps.push(s);this.h=(this.rnd()-.5)*1.2;this.v=r.kind==='fish'?.45+this.rnd()*.3:.16+this.rnd()*.12;}
 private grow(n:number){
  while(this.steps.length<=n){const p=this.steps[this.steps.length-1],B=WATER_BOX;this.h+=(this.rnd()-.5)*(this.r.kind==='fish'?.9:.35);
   let x=p.x+Math.sin(this.h)*this.v,z=p.z+Math.cos(this.h)*this.v;
   if(x<B.x0||x>B.x1){this.h=-this.h;x=Math.max(B.x0,Math.min(B.x1,x));}
   if(z<B.z0||z>B.z1){this.h=Math.PI-this.h;z=Math.max(B.z0,Math.min(B.z1,z));}
   if(Math.abs(x)<B.clear){this.h=-this.h;x=Math.sign(p.x||1)*B.clear;}
   this.steps.push({x,z});}
 }
 /** Position and heading `t` seconds after the release. */
 at(t:number){const k=Math.max(0,t),n=Math.floor(k),f=k-n;this.grow(n+1);const a=this.steps[n],b=this.steps[n+1];return{x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,yaw:Math.atan2(b.x-a.x,b.z-a.z)};}
}
/** A sky lantern's flight `t` seconds after it leaves the hands (anh Thanh 2026-11-05: not straight up, slanting with the wind):
 * a slow steady climb while the wind picks it up and carries it off sideways, so the path leans 30–45° off the ground,
 * and the lantern itself leans downwind (`lean` radians toward the heading `dir`). */
export function skyFlight(r:Release,t:number){const rnd=seeded(r.id+104729),wind=1.3+rnd()*.8,dir=-.9+rnd()*.5,sway=rnd()*6.28,k=Math.max(0,t);
 const up=k<1.5?.35*k*k:.79+1.25*(k-1.5),side=wind*k*k/(k+2.5);
 return{x:r.x+Math.sin(dir)*side+Math.sin(k*.35+sway)*1.2,y:r.y+up,z:r.z+Math.cos(dir)*side+Math.cos(k*.3+sway)*1.2,dir,lean:.24*Math.min(1,k/3)+.04*Math.sin(k*.8+sway),fade:Math.max(0,Math.min(1,(RELEASE_LIFE.sky-k)/40))};}
