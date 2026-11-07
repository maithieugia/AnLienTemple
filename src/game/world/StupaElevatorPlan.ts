import {STUPA as T,towerFloor}from './StupaPlan.ts';
export function elevatorTrip(from:number,to:number,elapsed:number){const a=towerFloor(Math.max(0,Math.min(T.levels-1,from))),b=towerFloor(Math.max(0,Math.min(T.levels-1,to))),duration=Math.max(2,Math.abs(b-a)/12),t=Math.max(0,Math.min(1,(elapsed-1)/duration)),u=t*t*(3-2*t),done=elapsed>=duration+2;return{y:a+(b-a)*u,duration:duration+2,done,phase:done?'idle':elapsed<1?'closing':elapsed<duration+1?'moving':'opening'};}

/** Call from the interior arrival zone on every storey, including the ground floor. */
export function canCallElevator(p:{x:number;y:number;z:number;enabled:boolean}){const f=Math.max(0,Math.min(T.levels-1,Math.round(p.y/T.storey)));return p.enabled&&Math.hypot(p.x-T.x,p.z-T.z)<=18&&Math.abs(p.y-towerFloor(f))<.8;}
