import {campusPavedAt}from './CampusLayoutPlan.ts';
import {statueGardenReserved} from './StatueGardenPlan.ts';
import {PRAYER_WHEEL_SITES,PRAYER_WHEEL as PW} from './PrayerWheelPlan.ts';
import {SANCTUARY_BODHI,SANCTUARY_PONDS} from './SanctuaryPlan.ts';
/** Garden tree spots: pure, so tests can check them without a renderer. */
export function gardenTreePositions(){let seed=91;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const out:{x:number;z:number;height:number;yaw:number}[]=[];for(let i=0;i<58;i++){const side=i%2?1:-1,x=side*(65+rnd()*275),z=265+rnd()*245;if(campusPavedAt(x,z,3)||PRAYER_WHEEL_SITES.some(w=>Math.hypot(x-w.x,z-w.z)<PW.plinthRadius+10)||(Math.abs(z-388)<5&&Math.abs(x)<175)||SANCTUARY_PONDS.some(p=>((x-p.x)/(p.rx+14))**2+((z-p.z)/(p.rz+14))**2<1)||Math.hypot(x-SANCTUARY_BODHI.x,z-SANCTUARY_BODHI.z)<30||statueGardenReserved(x,z,6))continue;out.push({x,z,height:7+rnd()*7,yaw:rnd()*Math.PI*2});}
 // PBR trees in soil beds along both flanks and behind the hall; retain all three rear exits.
 for(let i=0;i<110;i++){const rear=i<54,x=rear?-375+rnd()*750:(i%2?1:-1)*(355+rnd()*27),z=rear?-380+rnd()*115:-370+rnd()*575;if(campusPavedAt(x,z,3)||statueGardenReserved(x,z,5)||out.some(t=>Math.hypot(t.x-x,t.z-z)<9))continue;out.push({x,z,height:8+rnd()*10,yaw:rnd()*Math.PI*2});}
 return out;}
