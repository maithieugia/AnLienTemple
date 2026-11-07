import {STUPA as T,towerFloor,towerRadius}from './StupaPlan.ts';
import {TOWER_BUDDHA_NAMES}from './TowerBuddhaNames.ts';
export const TOWER_STATUE={height:5,width:5*.5646002314962109,depth:5*.5895637062745874,base:0}as const;
export const TOWER_BUDDHAS=TOWER_BUDDHA_NAMES.slice(0,T.levels*8).map((n,id)=>{const level=Math.floor(id/8),side=id%8,a=(side+1)*Math.PI/4,r=towerRadius(level),wall=r*.68,apothem=wall*Math.cos(Math.PI/8),doorHalf=Math.min(3.5,wall*2*Math.sin(Math.PI/8)*.28),rad=apothem+TOWER_STATUE.depth/2+.6-3,offset=0;return{id,...n,level,side,a,x:T.x+Math.cos(a)*rad-Math.sin(a)*offset,z:T.z+Math.sin(a)*rad+Math.cos(a)*offset,y:towerFloor(level)+TOWER_STATUE.base,yaw:Math.PI/2-a,rad,offset,doorHalf};});
export function towerStatueLod(distance:number,low:boolean){return distance<(low?10:18)?'high':distance<45?'low':distance<230?'far':null;}
