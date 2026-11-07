import {LAY_SEATS} from './LayAssemblyPlan.ts';
export function listeningSeat(id:number,p:{x:number;y:number;z:number},occupied:(id:number)=>boolean){
 const seat=LAY_SEATS[id];if(!seat)return{ok:false as const,reason:'missing' as const};
 if(occupied(id))return{ok:false as const,reason:'occupied' as const};
 if(Math.hypot(p.x-seat.x,p.z-seat.z)>3||Math.abs(p.y-1.2)>.5)return{ok:false as const,reason:'far' as const};
 return{ok:true as const,seat,position:{x:seat.x,y:1.345,z:seat.z,yaw:Math.PI}};
}
