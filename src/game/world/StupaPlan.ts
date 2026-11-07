export const STUPA={x:480,z:240,radius:50,levels:18,storey:10,base:0,stairInner:4,stairOuter:8,stepsPerTurn:96,stairRise:10/96,roofRadius:59,top:190} as const;
/** Campus wall opening where the tower approach starts. */
export const STUPA_WEST_GATE_X=395;
export const STUPA_PHASE=Math.PI/8,STUPA_STAIR_PHASE=Math.PI/4,STUPA_LANDING_HALF_ANGLE=.34,STUPA_FLOOR_INNER=8.4;
export const STUPA_BASE_RAILS:readonly (readonly[number,number,number,number])[]=[[-60,-60,60,-60],[-60,60,60,60],[60,-60,60,60],[-60,-60,-60,-7],[-60,7,-60,60]];
export const STUPA_TOTAL_STEPS=(STUPA.levels-1)*STUPA.stepsPerTurn;
export const towerFloor=(i:number)=>STUPA.base+i*STUPA.storey;
export function towerRadius(level:number){return STUPA.radius-32*Math.max(0,Math.min(STUPA.levels-1,level))/(STUPA.levels-1);}
export function towerRoofRadius(level:number){return towerRadius(level)+7.5+1.5*(1-level/(STUPA.levels-1));}
export function octagonRadius(angle:number,radius:number=STUPA.radius){const sector=Math.PI/4,a=(((angle-STUPA_PHASE)%sector)+sector)%sector;return radius*Math.cos(Math.PI/8)/Math.cos(a-Math.PI/8);}
export function towerStairAngle(x:number,z:number){return((Math.atan2(z-STUPA.z,x-STUPA.x)-STUPA_STAIR_PHASE)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);}
export const STUPA_LIFT_PHASE=STUPA_STAIR_PHASE+Math.PI;
export function towerLiftAngle(a:number){return Math.abs(a-Math.PI)<=STUPA_LANDING_HALF_ANGLE;}
export function towerLandingAngle(a:number){return Math.min(a,Math.PI*2-a)<=STUPA_LANDING_HALF_ANGLE;}
export function towerSupport(x:number,z:number,foot:number){const dx=x-STUPA.x,dz=z-STUPA.z,r=Math.hypot(dx,dz),a=towerStairAngle(x,z);let best=-Infinity;
 for(let i=0;i<STUPA.levels;i++){const y=towerFloor(i),inner=i===0?0:i===STUPA.levels-1&&a<=Math.PI?2.4:towerLiftAngle(a)?2.4:towerLandingAngle(a)?7.6:STUPA_FLOOR_INNER;if(!(i>0&&!(i===STUPA.levels-1&&a<=Math.PI)&&r>=4&&r<=8&&!towerLiftAngle(a)&&Math.min(a,Math.PI*2-a)>.00001)&&r>=inner&&r<=octagonRadius(Math.atan2(dz,dx),towerRadius(i))&&y<=foot+(r<STUPA_FLOOR_INNER?.18:.3))best=Math.max(best,y);}
 if(r>=STUPA.stairInner-.03&&r<=STUPA.stairOuter+.03){const k=Math.min(STUPA.stepsPerTurn-1,Math.floor(a/(Math.PI*2)*STUPA.stepsPerTurn));for(let i=0;i<STUPA.levels-1;i++){const y=i*STUPA.storey+(k+1)*STUPA.stairRise;if(y<=foot+.3)best=Math.max(best,y);}}return best;
}
/** Analytic rail collision avoids thousands of overlapping vertical-stack rectangles. */
export function towerResolveMotion(x:number,z:number,nx:number,nz:number,feet:number,radius=.3):[number,number]{const r=Math.hypot(x-STUPA.x,z-STUPA.z);if(r>STUPA.radius+2||feet<-.5||feet>towerFloor(STUPA.levels-1)+1)return[nx,nz];let dx=nx-STUPA.x,dz=nz-STUPA.z,nr=Math.hypot(dx,dz),a=towerStairAngle(nx,nz),floor=Math.round(feet/STUPA.storey)*STUPA.storey,liftPortal=towerLiftAngle(a)&&Math.abs(feet-floor)<.55,portal=towerLandingAngle(a)&&Math.abs(feet-floor)<.55;
 // Closed end at floor 36: the positive-angle branch has no next flight.
 if(feet>=towerFloor(STUPA.levels-1)-.4&&r<=STUPA.stairOuter+.15&&nr<=STUPA.stairOuter+.15&&nr>=STUPA.stairInner-.1&&a<Math.PI&&!towerLiftAngle(a)){const cap=STUPA_LANDING_HALF_ANGLE-(radius+.12)/Math.max(nr,4);if(a>cap){a=Math.max(0,cap);const world=a+STUPA_STAIR_PHASE;dx=Math.cos(world)*nr;dz=Math.sin(world)*nr;nx=STUPA.x+dx;nz=STUPA.z+dz;}}
 let limit=nr;const stepY=(Math.floor(a/(Math.PI*2)*STUPA.stepsPerTurn)+1)*STUPA.stairRise,nearFlight=Math.abs(feet-(Math.round((feet-stepY)/STUPA.storey)*STUPA.storey+stepY))<.6;if(liftPortal){limit=Math.max(2.8,nr);}else if(r<=STUPA.stairOuter+.15&&feet>=0&&nearFlight){limit=Math.max(STUPA.stairInner+radius+.1,nr);if(!portal)limit=Math.min(STUPA.stairOuter-radius-.1,limit);}else if(feet>1&&Math.abs(feet-floor)<.6&&!portal)limit=Math.max(STUPA_FLOOR_INNER+radius+.1,nr);
 if(Math.abs(limit-nr)<1e-9)return[nx,nz];const scale=limit/Math.max(nr,1e-9);return[STUPA.x+dx*scale,STUPA.z+dz*scale];}
export function towerProgress(x:number,z:number,feet:number){if(Math.hypot(x-STUPA.x,z-STUPA.z)>62||feet<-.5)return null;return{floor:Math.min(STUPA.levels,Math.max(1,Math.floor((feet+.02)/STUPA.storey)+1)),step:Math.min(STUPA_TOTAL_STEPS,Math.max(0,Math.round(feet/STUPA.stairRise))),total:STUPA_TOTAL_STEPS};}
