import {STUPA}from './StupaPlan.ts';
import {PRAYER_WHEEL_SITES,PRAYER_WHEEL as PW}from './PrayerWheelPlan.ts';
import {statueGardenReserved}from './StatueGardenPlan.ts';
export type CampusRect={x0:number;x1:number;z0:number;z1:number};
/** Shared footprints for paving, vegetation exclusion and visit routes. */
export const CAMPUS_PATHS:CampusRect[]=[
 {x0:-12,x1:12,z0:208,z1:580},{x0:-350,x1:350,z0:230,z1:248},{x0:-350,x1:350,z0:512,z1:530},
 ...[-350,-24,24,350].map(x=>({x0:x-2,x1:x+2,z0:248,z1:512})),
 ...[300,470].map(z=>({x0:-350,x1:350,z0:z-2,z1:z+2})),
 ...[-1,1].map(side=>{const x=side*(195-(PW.plinthRadius+5));return{x0:Math.min(side*12,x),x1:Math.max(side*12,x),z0:385.5,z1:390.5};}),
 ...[-330,330].map(x=>({x0:x-3,x1:x+3,z0:-350,z1:530})),
 {x0:-330,x1:330,z0:-350,z1:-344},
 ...[-290,0,290].map(x=>({x0:x-(x===0?14:6),x1:x+(x===0?14:6),z0:-347,z1:-240.5})),
 {x0:338,x1:420,z0:STUPA.z-12,z1:STUPA.z+12},
 {x0:387,x1:391,z0:30,z1:STUPA.z},
 {x0:338,x1:391,z0:27,z1:33},
];
export const CAMPUS_GRAVEL=[{x:-210,z:340,w:150,d:72},{x:-230,z:455,w:140,d:68},{x:205,z:460,w:155,d:55}];
export const CAMPUS_ROCKS=CAMPUS_GRAVEL.flatMap(({x,z})=>Array.from({length:5},(_,i)=>({x:x+(i-2)*8,z:z+Math.sin(i*2)*8,radius:2.6,height:3.2-i*.3,i}))).filter(p=>!PRAYER_WHEEL_SITES.some(w=>Math.hypot(p.x-w.x,p.z-w.z)<PW.plinthRadius+9)&&!statueGardenReserved(p.x,p.z,3));
export function campusPavedAt(x:number,z:number,margin=0){return (Math.abs(x)<338+margin&&Math.abs(z)<238+margin)||CAMPUS_PATHS.some(p=>x>=p.x0-margin&&x<=p.x1+margin&&z>=p.z0-margin&&z<=p.z1+margin)||CAMPUS_GRAVEL.some(p=>Math.abs(x-p.x)<p.w/2+margin&&Math.abs(z-p.z)<p.d/2+margin);}
