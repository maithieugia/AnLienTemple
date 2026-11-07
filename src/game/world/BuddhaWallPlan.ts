import {SANCTUARY_LEVELS as L,SANCTUARY_VAULT as V,SANCTUARY_GRAND_PORTAL as GP,SANCTUARY_HALL_DOORS,HALL_DOOR} from './SanctuaryPlan.ts';
export const BUDDHA_TILE_SIZE=5;
export interface BuddhaTile{id:string;wall:'rear'|'west'|'east'|'front'|'vault';x:number;y:number;z:number;yaw:number;level:number}
export const BUDDHA_WALL_TILES:BuddhaTile[]=[];
for(const [level,floor]of [L.floor,L.upper].entries())for(let row=0;row<Math.floor(L.lowerHeight/5);row++){
 const y=floor+2.5+row*5;
 for(let col=0;col<120;col++)BUDDHA_WALL_TILES.push({id:`rear-${level}-${row}-${col}`,wall:'rear',level,x:-297.5+col*5,y,z:-198.45,yaw:0});
 for(const wall of ['west','east'] as const)for(let col=0;col<80;col++)BUDDHA_WALL_TILES.push({id:`${wall}-${level}-${row}-${col}`,wall,level,x:wall==='west'?-298.45:298.45,y,z:-197.5+col*5,yaw:wall==='west'?Math.PI/2:-Math.PI/2});
}
// anh Thanh 2026-11-01: every wall is tiled — the inside of the front wall (between the doors; above the grand portal on the upper storey)
for(const [level,floor]of [L.floor,L.upper].entries())for(let row=0;row<Math.floor(L.lowerHeight/5);row++){const y=floor+2.5+row*5;
 for(let col=0;col<120;col++){const x=-297.5+col*5,door=[-240,-120,120,240].some(cx=>Math.abs(x-cx)<14.5)||(level===0&&Math.abs(x-GP.x)<GP.half+2.5);if(!door)BUDDHA_WALL_TILES.push({id:`front-${level}-${row}-${col}`,wall:'front',level,x,y,z:198.45,yaw:Math.PI});}}
// ...and the three drums of the stepped vault, inside faces, between the red cornices
V.forEach((p,i)=>{const y0=i?V[i-1].top:L.eaves,rows=Math.floor((p.top-y0-3.6)/5),yb=y0+1.8+((p.top-y0-3.6)-rows*5)/2+2.5,nx=Math.floor(2*p.x/5),nz=Math.floor(2*p.z/5);
 for(let row=0;row<rows;row++){const y=yb+row*5;
  for(let c=0;c<nz;c++){const z=-(nz-1)*2.5+c*5;BUDDHA_WALL_TILES.push({id:`vault-${i}-${row}-w${c}`,wall:'vault',level:2+i,x:-(p.x-.2),y,z,yaw:Math.PI/2},{id:`vault-${i}-${row}-e${c}`,wall:'vault',level:2+i,x:p.x-.2,y,z,yaw:-Math.PI/2});}
  for(let c=0;c<nx;c++){const x=-(nx-1)*2.5+c*5;BUDDHA_WALL_TILES.push({id:`vault-${i}-${row}-s${c}`,wall:'vault',level:2+i,x,y,z:-(p.z-.2),yaw:0},{id:`vault-${i}-${row}-n${c}`,wall:'vault',level:2+i,x,y,z:p.z-.2,yaw:Math.PI});}}});
// doors cut through the relief (anh Thanh 2026-11-01)
{const inDoor=(t:BuddhaTile)=>t.level===0&&t.y-2.5<L.floor+HALL_DOOR.h&&SANCTUARY_HALL_DOORS.some(d=>d.wall===t.wall&&Math.abs((t.wall==='rear'?t.x:t.z)-d.at)<(d.half??HALL_DOOR.half)+2.5);for(let i=BUDDHA_WALL_TILES.length-1;i>=0;i--)if(inDoor(BUDDHA_WALL_TILES[i]))BUDDHA_WALL_TILES.splice(i,1);}
export function reliefLod(eye:{x:number;y:number;z:number},low:boolean,tiles=BUDDHA_WALL_TILES){
 const limit=low?6:12,range=low?22:32;return tiles.map(t=>({tile:t,d:Math.hypot(t.x-eye.x,t.y-eye.y,t.z-eye.z)})).filter(t=>t.d<range).sort((a,b)=>a.d-b.d).slice(0,limit).map(t=>t.tile);
}

/** Collision of the relief layer on the rear and side walls, split round the walk-through doors (hall-local; base is height above y=0). */
export function reliefWallRects(){const out:{cx:number;cz:number;hx:number;hz:number;base:number;h:number}[]=[],H=L.eaves-L.floor,F=L.floor;
 for(const [wall,len] of [['rear',300],['west',200],['east',200]] as const){const doors=SANCTUARY_HALL_DOORS.filter(d=>d.wall===wall).sort((a,b)=>a.at-b.at),put=(a:number,b:number,base:number,h:number)=>{if(b-a<.05)return;const c=(a+b)/2,half=(b-a)/2;out.push(wall==='rear'?{cx:c,cz:-199.3,hx:half,hz:1.3,base,h}:{cx:wall==='west'?-299.3:299.3,cz:c,hx:1.3,hz:half,base,h});};
  let a=-len;for(const d of doors){const half=d.half??HALL_DOOR.half;put(a,d.at-half,F,H);put(d.at-half,d.at+half,F+HALL_DOOR.h,H-HALL_DOOR.h);a=d.at+half;}put(a,len,F,H);}
 return out;}
