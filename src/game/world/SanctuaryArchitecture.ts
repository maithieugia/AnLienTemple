import {stoneLanternHead}from './SanctuaryGeometry';
import {type Scene}from '@babylonjs/core';
import {SanctuaryBatch,sanctuaryColumn,sanctuaryDoor,type SanctuaryMaterials}from './SanctuaryGeometry';
import {SANCTUARY_STAIRS,SANCTUARY_STATUES,SANCTUARY_LEVELS as L,SANCTUARY_ROOF as R,SANCTUARY_ATRIUM as AT,cutSanctuarySlab,sanctuaryUpperPieces,interiorColumnPositions,sanctuaryStatueEnabled,sanctuaryPlinthEnabled,statuePlinth,giantColumnPositions,SANCTUARY_TERRACE_OPENINGS,SANCTUARY_VAULT,SANCTUARY_GRAND_PORTAL as GP,SANCTUARY_HALL_DOORS,HALL_DOOR,cutSanctuarySlab as cutRect}from './SanctuaryPlan';
import {stairPlan}from './Staircase';
import {Color3,DynamicTexture,StandardMaterial}from '@babylonjs/core';
import type{Rect}from './Obstacles';
import {sanctuaryFrontSteps} from './SanctuaryPlan';
export const sanctuaryStairs=()=>SANCTUARY_STAIRS.map(p=>stairPlan(p.x,p.z,L.upper-L.floor,L.floor,3,42));
export function sanctuaryStructure(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials){const b=new SanctuaryBatch(scene,at,'an-lien-full-footprint'),rects:Rect[]=[];
 const solid=(x:number,z:number,w:number,d:number,base:number,h:number,walk=false,step=false)=>rects.push({cx:x,cz:z,hx:w/2,hz:d/2,base,h,yaw:0,sight:true,climb:walk,surface:walk,step});
 b.box(m.stone,0,.45,0,R.platformX*2,.9,R.platformZ*2);solid(0,0,R.platformX*2,R.platformZ*2,0,.9,true);
 for(const p of cutSanctuarySlab({x0:-R.platformX,x1:R.platformX,z0:-R.platformZ,z1:R.platformZ},[{x0:-300,x1:300,z0:-200,z1:200}]))b.floor(grandMaterials(scene).marble,p.x0,p.x1,p.z0,p.z1,L.floor,.3);solid(0,0,R.platformX*2,R.platformZ*2,.9,.3,true);
 const stairs=sanctuaryStairs(),holes=stairs.map(s=>s.opening),pieces=sanctuaryUpperPieces(holes);
 // Upper slab, seam and false ceiling removed: the hall is open to the roof.
 b.floor(grandMaterials(scene).bong,-300,300,-200,200,L.floor,.3); // gạch bông inside the hall
 for(const p of pieces){b.floor(grandMaterials(scene).bong,p.x0,p.x1,p.z0,p.z1,L.upper,.45);solid((p.x0+p.x1)/2,(p.z0+p.z1)/2,p.x1-p.x0,p.z1-p.z0,L.upper-.45,.45,true);}
 // A separate white underside leaves upstairs floor tiles and the stair openings intact.
 for(const p of pieces){const y=L.upper-.462;b.quad(grandMaterials(scene).ceiling,[p.x0,y,p.z1],[p.x1,y,p.z1],[p.x1,y,p.z0],[p.x0,y,p.z0],[0,0,(p.x1-p.x0)/10,(p.z1-p.z0)/10]);}
 // Gallery balustrades: visible rails and collision share exactly the void boundary.
 const galleryRail=(x0:number,x1:number,z0:number,z1:number)=>{const dx=x1-x0,dz=z1-z0,n=Math.ceil(Math.hypot(dx,dz)/8),cx=(x0+x1)/2,cz=(z0+z1)/2;
  for(const h of [.22,1.22])b.box(h>1?m.wood:m.gold,cx,L.upper+h,cz,Math.max(.22,Math.abs(dx)),.18,Math.max(.22,Math.abs(dz)));
  for(let i=0;i<=n;i++)b.box(m.wood,x0+dx*i/n,L.upper+.65,z0+dz*i/n,.19,1.3,.19);
  solid(cx,cz,Math.max(.3,Math.abs(dx)),Math.max(.3,Math.abs(dz)),L.upper,1.35);
 };
 // No upper-gallery balustrades in the single open hall.
 // Long gallery beams meet the sparse columns; no disconnected 20m beam ends in the nave.
 // the old flat-ceiling joists (x ±180/±260, cross beams at ±220) are gone: the hall is open to the roof (anh Thanh 2026-11-04 "thanh sắt còn sót")
 for(const p of stairs){for(const q of p.boxes){const base=q.rail?q.y0:q.z0>=p.z+p.run?q.y0:q.x0<p.x+p.width?p.base:p.base+p.rise/2;b.box(q.rail?m.wood:m.stone,(q.x0+q.x1)/2,(base+q.y1)/2,(q.z0+q.z1)/2,q.x1-q.x0,q.y1-base,q.z1-q.z0);rects.push({cx:(q.x0+q.x1)/2,cz:(q.z0+q.z1)/2,hx:(q.x1-q.x0)/2,hz:(q.z1-q.z0)/2,yaw:0,base,h:q.y1-base,sight:true,climb:!q.rail,surface:!q.rail,step:!q.rail});}
  for(const xx of [p.x,p.x+p.width,p.x+p.width+.18,p.x+p.total]){const upper=xx>p.x+p.width,y0=p.base+(upper?p.rise:p.rise/2/p.n)+1,y1=p.base+p.rise/2+1;b.tube(m.wood,[[xx,y0,p.z],[xx,y1,p.z+p.run]],.055,8);rects.push({cx:xx,cz:p.z+p.run/2,hx:.055,hz:p.run/2,yaw:0,base:y0,h:.12,slope:(upper?-1:1)*p.rise/2/p.run,sight:true,climb:false});}
  for(const x of [p.x+.12,p.x+p.total-.12])for(const z of [p.z+p.run+.15,p.z+p.run+p.width-.15]){b.box(m.stone,x,p.base+p.rise/4,z,.25,p.rise/2,.25);solid(x,z,.25,.25,p.base,p.rise/2);}
  solid(p.x+p.width/2,p.z-.03,p.width,.08,p.base+p.rise,1.1);
 }
 for(const x of [-240,-120,0,120,240])for(let i=0;i<8;i++){const top=(i+1)*.15,z=R.platformZ+3.6-i*.45;b.box(m.stone,x,top/2,z,40,top,.45);solid(x,z,40,.45,0,top,true,true);}
 // ---------------------------------------------------------------- the grand exterior (ref.: colossal palace on clouds)
 const g=grandMaterials(scene);
 // GIANT ORDER: columns ~4 m thick rising the full two storeys round all four sides, carrying the main roof
 const colH=R.eaveY-L.floor-.6;
 // the giant columns themselves are the Blender model vb-sanctuary-giant-column, instanced by Sanctuary.ts; collision here
 const giant=(x:number,z:number)=>{
  const scale=61.3/101.3;
  // Closed steps overlap by 2 cm, including the floor and the original lotus.
  for(const [width,bottom,top]of [[6.8,-.04,.48],[6,.46,.94],[5.5,.92,1.38]]){
   const y0=L.floor+bottom*scale,y1=L.floor+top*scale;
   b.box(m.stone,x,(y0+y1)/2,z,width,y1-y0,width);
  }
  // An opaque core closes the open lathed lotus beneath its carved surface.
  b.lathe(m.stone,x,L.floor,z,[[2.6,1.36*scale],[2.69,1.75*scale],[2.61,2.13*scale],[2.19,2.66*scale]],32);
  solid(x,z,6.8,6.8,L.floor,.48*scale);
  solid(x,z,6,6,L.floor+.48*scale,.46*scale);
  solid(x,z,5.5,5.5,L.floor+.94*scale,.44*scale);
  solid(x,z,4.4,4.4,L.floor,colH);
 };
 for(const c of giantColumnPositions())giant(c.x,c.z);
 // roofs, architrave, bracket sets, ridge and đao: the Blender model vb-sanctuary-grand-roof (Sanctuary.ts)
 // a coffered wooden ceiling closes the upper floor under the roof (gold grid every 10 m)
 // anh Thanh 2026-11-01: no flat lid over the nave — a stepped vault (vòm tầng) climbs drum by drum into the raised roof.
 // No suspended coffered ceiling / stepped vault.
 for(const x of [-280,-240,240,280]){b.box(m.wood,x,L.eaves+.9,0,1.8,1.8,400);}
 // polished stone terrace edge: balustrade with lantern posts round the platform
 const T={x:R.terraceX,z:R.terraceZ};
 for(const step of sanctuaryFrontSteps()){b.box(m.stone,step.cx,step.h/2,step.cz,step.hx*2,step.h,step.hz*2);rects.push(step);}
 // Side and rear openings with stone steps down to the ground (anh Thanh: the veranda was fenced in): east/west at
 // z=30 (between veranda columns) on the path to the side gate and the stupa, two rear corner doors plus the wider central rear door; each sits between two lanterns.
 const OPEN=SANCTUARY_TERRACE_OPENINGS,seg=(x0:number,x1:number,z0:number,z1:number)=>{if(x1<x0||z1<z0)return;const cx=(x0+x1)/2,cz=(z0+z1)/2,w=Math.max(.6,x1-x0),d=Math.max(.6,z1-z0);b.box(g.marble,cx,1.2+1.0,cz,w,.35,d);b.box(g.marble,cx,1.2+.12,cz,w+.4,.25,d+.4);solid(cx,cz,w,d,1.2,1.2);};
 const REAR=SANCTUARY_HALL_DOORS.filter(d=>d.wall==='rear').map(d=>d.at).sort((a,b)=>a-b),rearHalf=(x:number)=>x===0?OPEN.rearCenterHalf:OPEN.half;{let a=-T.x;for(const rx of REAR){seg(a,rx-rearHalf(rx),-T.z,-T.z);a=rx+rearHalf(rx);}seg(a,T.x,-T.z,-T.z);}
 for(const sx of [-1,1]){seg(sx*T.x,sx*T.x,-T.z,OPEN.sideZ-OPEN.half);seg(sx*T.x,sx*T.x,OPEN.sideZ+OPEN.half,T.z);}
 {const n=8,rise=1.2/n,tread=.34,P=R.platformX;
  for(let i=0;i<n;i++){const top=rise*(i+1),d0=(n-1-i)*tread;
   for(const sx of [-1,1]){const x=sx*(P+d0+tread/2);b.box(m.stone,x,top/2,OPEN.sideZ,tread,top,OPEN.half*2);solid(x,OPEN.sideZ,tread,OPEN.half*2,0,top,true,true);}
   const z=-(P-R.platformX+R.platformZ+d0+tread/2);for(const rx of REAR){b.box(m.stone,rx,top/2,z,rearHalf(rx)*2,top,tread);solid(rx,z,rearHalf(rx)*2,tread,0,top,true,true);}}}
 {const cuts=[-240,-120,0,120,240];let x0=-T.x;for(const c of [...cuts,T.x+20]){const x1=Math.min(T.x,c-20);if(x1>x0+1){b.box(g.marble,(x0+x1)/2,2.2,T.z,x1-x0,.35,.6);b.box(g.marble,(x0+x1)/2,1.32,T.z,x1-x0+.4,.25,1);solid((x0+x1)/2,T.z,x1-x0,.6,1.2,1.2);}x0=c+20;}}
 const lantern=(x:number,z:number)=>{b.box(g.marble,x,1.2+2.6,z,1.8,5.2,1.8);b.box(g.marble,x,1.2+5.5,z,3,.6,3);stoneLanternHead(b,g.marble,m,x,1.2+6.8,z,1.95,2);b.lathe(g.tile,x,1.2+7.8,z,[[2.3,0],[.2,1.8]],4);b.lathe(m.gold,x,1.2+9.6,z,[[.3,0],[.1,1]],8);solid(x,z,1.8,1.8,1.2,5.2);};
 for(let x=-T.x;x<=T.x;x+=30){if(REAR.every(rx=>Math.abs(x-rx)>rearHalf(rx)+1.5))lantern(x,-T.z);if([-240,-120,0,120,240].every(c=>Math.abs(x-c)>=21))lantern(x,T.z);}for(let z=-T.z+30;z<T.z;z+=30)if(Math.abs(z-SANCTUARY_TERRACE_OPENINGS.sideZ)>SANCTUARY_TERRACE_OPENINGS.half+1.5)for(const sx of [-1,1])lantern(sx*T.x,z);
 // Plinths for authentic scanned statues, preserving a clear central approach.
 for(const s of SANCTUARY_STATUES.filter(sanctuaryPlinthEnabled)){const {rx,rz}=statuePlinth(s),step=s.id==='main-buddha'?1.1:.3;for(let k=0;k<3;k++)b.floor(k===2?m.red:m.stone,s.x-rx+k*step,s.x+rx-k*step,s.z-rz+k*step,s.z+rz-k*step,1.2+(s.base-1.2)*(k+1)/3,(s.base-1.2)/3+.05);solid(s.x,s.z,rx*2,rz*2,1.2,s.base-1.2+(sanctuaryStatueEnabled(s)?s.height:0),false);}
 return{batch:b.build(),rects,stairs};
}
export function sanctuaryHallCell(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials,cx:number,cz:number,exterior=false){const b=new SanctuaryBatch(scene,at,`an-lien-gian-${cx}-${cz}`),rects:Rect[]=[];
 const add=(x:number,z:number,w:number,d:number,base:number,h:number)=>rects.push({cx:x,cz:z,hx:w/2,hz:d/2,base,h,yaw:0,sight:true,climb:false});
 for(const base of [L.floor,L.upper]){const height=base===L.floor?L.lowerHeight:L.upperHeight,k=base===L.floor?1.7:1.5;if(!exterior)for(const {x,z}of interiorColumnPositions()){if(x<cx-60||x>=cx+60||z<cz-50||z>=cz+50)continue;sanctuaryColumn(b,m,x,z,base,height,k);add(x,z,1.4*k,1.4*k,base,height);}
  if(exterior){for(const side of [-1,1])if(Math.abs(cx+side*60)>=299){const x=side*300,door=base===L.floor?SANCTUARY_HALL_DOORS.find(d=>d.wall===(side<0?'west':'east')&&Math.abs(d.at-cz)<50):undefined;b.box(m.ivory,x,base+height-1,cz,.6,2,100);if(!door){b.box(m.ivory,x,base+1.1,cz,.6,2.2,100);add(x,cz,.6,100,base,height);}else{const d0=door.at-HALL_DOOR.half,d1=door.at+HALL_DOOR.half;for(const [z0,z1]of [[cz-50,d0],[d1,cz+50]]){b.box(m.ivory,x,base+1.1,(z0+z1)/2,.6,2.2,z1-z0);add(x,(z0+z1)/2,.6,z1-z0,base,height);}add(x,door.at,.6,2*HALL_DOOR.half,base+HALL_DOOR.h,height-HALL_DOOR.h);}for(let z=cz-50;z<=cz+50;z+=20){b.box(m.ivory,x,base+height/2,z,1.6,height,1.6);if(door&&z<cz+50&&Math.abs(z+10-door.at)<10){hallDoor(b,m,x,door.at,'z',base,height,()=>{});for(const [z0,z1]of [[z+.8,door.at-HALL_DOOR.half],[door.at+HALL_DOOR.half,z+19.2]])b.box(m.ivory,x,base+height/2,(z0+z1)/2,.7,height,z1-z0);continue;}if(z<cz+50){b.box(m.ivory,x,base+height/2,z+10,.7,height,18.4);/* a tall lacquered window in each bay, framed in gold, with a lattice */b.box(m.red,x+side*.4,base+height*.47,z+10,.18,height*.52,9);for(const fz of [-4.6,4.6])b.box(m.gold,x+side*.5,base+height*.47,z+10+fz,.12,height*.54,.35);for(const fy of [.2,.74])b.box(m.gold,x+side*.5,base+height*fy,z+10,.12,.35,9.6);for(let j=-3;j<=3;j++)b.box(m.wood,x+side*.52,base+height*.47,z+10+j*1.2,.1,height*.5,.12);}}}
  if(cz< -100){const doors=base===L.floor?SANCTUARY_HALL_DOORS.filter(d=>d.wall==='rear'&&Math.abs(d.at-cx)<60):[];if(!doors.length){b.box(m.ivory,cx,base+height/2,-200,120,height,.7);add(cx,-200,120,.7,base,height);}else{let a=cx-60;for(const d of doors){hallDoor(b,m,d.at,-200,'x',base,height,add,d.half);wallPiece(b,m,a,d.at-(d.half??HALL_DOOR.half),-200,base,height,add);a=d.at+(d.half??HALL_DOOR.half);}wallPiece(b,m,a,cx+60,-200,base,height,add);}}
  if(cz>100&&cx===GP.x){
   // Grand portal: the whole central bay is open on the ground storey (frame + gilded lintel); the upper storey is a solid wall.
   if(base===L.floor){for(const side of [-1,1]){b.box(m.red,cx+side*(GP.half-1.2),base+height/2,200,2.4,height,1.6);b.box(m.gold,cx+side*(GP.half-2.5),base+height/2,199.1,.3,height-2,.3);add(cx+side*(GP.half-1.2),200,2.4,1.6,base,height);}
    b.box(m.wood,cx,base+height-1.4,200,2*GP.half,2.8,1.6);b.box(m.gold,cx,base+height-3,199.1,2*GP.half-4,.5,.3);add(cx,200,2*GP.half,1.6,base+height-2.8,2.8);}
   else{b.box(m.ivory,cx,base+height/2,200,2*GP.half,height,.6);add(cx,200,2*GP.half,.6,base,height);}
  }else if(cz>100){
   // Each of the five entry bays has an open central portal and carved door leaves.
   for(const side of [-1,1]){b.box(m.ivory,cx+side*36,base+height/2,200,48,height,.6);add(cx+side*36,200,48,.6,base,height);}
   b.box(m.wood,cx,base+height-.8,200,24,1.6,.9);add(cx,200,24,.9,base+height-1.6,1.6);sanctuaryDoor(b,m,cx,200,base);
   // tall portals: a carved transom fills the wall above the door leaves
   const tTop=base+height-1.6,tBot=base+7.6;b.box(m.ivory,cx,(tTop+tBot)/2,200,24,tTop-tBot,.5);add(cx,200,24,.5,tBot,tTop-tBot);for(let i=0;i<=6;i++)b.box(m.red,cx-10.8+i*3.6,(tTop+tBot)/2,200.3,.3,tTop-tBot-.6,.12);for(const h of [tBot+.3,tTop-.3])b.box(m.gold,cx,h,200.32,23,.25,.1);for(const side of [-1,1])add(cx+side*8,200,3.4,.32,base,7.4);
  }
 }
 }
 return{batch:b.build(),rects};
}
export function sanctuaryAltarFurniture(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials,x:number,z:number,large=false){const b=new SanctuaryBatch(scene,at,'an-lien-altar-'+x+'-'+z),w=large?10:4,top=large?2.5:2.1;
 for(const side of [-1,1])for(const back of [-1,1])b.tube(m.wood,[[x+side*(w/2-.2),1.2,z+back*.7],[x+side*(w/2-.45),1.55,z+back*.55],[x+side*(w/2-.5),top-.15,z+back*.6]],large?.20:.13,12);
 b.box(m.wood,x,top,z,w,.28,2);b.box(m.red,x,top-.45,z+.8,w-.3,.5,.15);for(let i=0;i<8;i++){const xx=x-w/2+.5+i*(w-1)/7;b.lathe(m.gold,xx,top-.55,z+.9,[[.08,0],[.12,.09],[.08,.18]],12);}
 // Incense, lamps, vases and flowers are separate silhouettes.
 for(const side of [-1,1]){b.lathe(m.gold,x+side*w*.38,top+.14,z,[[.28,0],[.28,.1],[.14,.18],[.07,.8],[.12,.95],[.28,1.02]],24);b.lathe(m.stone,x+side*w*.25,top+.14,z-.15,[[.19,0],[.23,.3],[.17,.65],[.10,.85],[.17,.93]],20);}

 return{batch:b.build(),top};}
export function sanctuaryBellDrum(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials,x:number,z:number,drum=false){const b=new SanctuaryBatch(scene,at,'an-lien-'+(drum?'drum':'bell'));
 for(const side of [-1,1])sanctuaryColumn(b,m,x+side*2,z,1.2,5);b.box(m.wood,x,5.9,z,5,.5,.6);
 if(!drum){b.lathe(m.gold,x,1.9,z,[[1.25,0],[1.25,.15],[1.05,.3],[.92,2.2],[.65,2.7],[.2,2.9]],32);b.lathe(m.wood,x,2.0,z,[[.12,0],[.12,1.6]],12);for(const h of [2.1,2.35,3.0,3.8,4.25])b.lathe(m.gold,x,h,z,[[1.1,.0],[1.15,.06],[1.1,.12]],32);b.tube(m.gold,[[x-.3,4.8,z],[x-.3,5.4,z],[x+.3,5.4,z],[x+.3,4.8,z]],.10,10);}
 else{b.lathe(m.red,x,1.8,z,[[.9,0],[1.2,.2],[1.35,1.1],[1.2,2],[.9,2.2]],32);for(const h of [1.8,4.0])b.lathe(m.cloth,x,h,z,[[0,0],[.92,0],[.92,.05],[0,.05]],32);for(let i=0;i<24;i++){const a=i/24*Math.PI*2;b.lathe(m.gold,x+Math.cos(a)*1.2,2.05,z+Math.sin(a)*1.2,[[.04,0],[.04,.07]],8);}}
 return b.build();}

/** Materials of the grand exterior, made once per scene: glazed ribbed roof tiles, lacquered fascia,
 * a coffered wooden ceiling, polished marble and warm lantern glass. */
const grandCache=new WeakMap<Scene,ReturnType<typeof makeGrand>>();
export function grandMaterials(scene:Scene){let g=grandCache.get(scene);if(!g){g=makeGrand(scene);grandCache.set(scene,g);scene.onDisposeObservable.addOnce(()=>grandCache.delete(scene));}return g;}
function makeGrand(scene:Scene){
 const tex=(name:string,draw:(c:CanvasRenderingContext2D)=>void,size=256)=>{const t=new DynamicTexture(name,{width:size,height:size},scene,true);draw(t.getContext() as CanvasRenderingContext2D);t.update();t.wrapU=t.wrapV=1;t.anisotropicFilteringLevel=16;return t;};
 const mat=(name:string,hex:string,spec:number,power=32)=>{const m=new StandardMaterial('an-lien-grand-'+name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor.setAll(spec);m.specularPower=power;m.backFaceCulling=false;return m;};
 // glazed tiles: four rounded ribs across, eight courses down, a glossy highlight on each rib
 const tile=mat('glazed-tile','#ffffff',.55,48);tile.diffuseTexture=tex('an-lien-glazed-tiles',c=>{c.fillStyle='#4a2414';c.fillRect(0,0,256,256);for(let r=0;r<4;r++){const x=r*64;const g=c.createLinearGradient(x,0,x+64,0);g.addColorStop(0,'#3a1c10');g.addColorStop(.35,'#8a4a22');g.addColorStop(.5,'#c07a3a');g.addColorStop(.65,'#8a4a22');g.addColorStop(1,'#3a1c10');c.fillStyle=g;c.fillRect(x+6,0,52,256);}for(let k=0;k<8;k++){c.fillStyle='rgba(20,8,4,.55)';c.fillRect(0,k*32+28,256,4);}});
 const fascia=mat('fascia','#5a1a12',.25,24);
 const ceiling=mat('coffered-ceiling','#ffffff',.08);ceiling.emissiveColor.set(.34,.35,.36);ceiling.diffuseTexture=tex('an-lien-coffers',c=>{c.fillStyle='#ecece8';c.fillRect(0,0,256,256);c.fillStyle='#fffef8';c.fillRect(14,14,228,228);c.strokeStyle='#d4d0c3';c.lineWidth=4;c.strokeRect(14,14,228,228);c.strokeStyle='#ddd9cb';c.lineWidth=2;c.beginPath();c.arc(128,128,60,0,Math.PI*2);c.stroke();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.ellipse(128+Math.cos(a)*34,128+Math.sin(a)*34,18,8,a,0,Math.PI*2);c.stroke();}});
 const marble=mat('polished-marble','#ffffff',.9,96);marble.diffuseTexture=tex('an-lien-marble',c=>{c.fillStyle='#d8d2c6';c.fillRect(0,0,512,512);for(let i=0;i<60;i++){c.strokeStyle=`rgba(120,110,95,${.07+(i%5)*.03})`;c.lineWidth=1+(i%3);c.beginPath();let x=(i*53)%512,y=0;c.moveTo(x,y);while(y<512){x+=((i*7+y)%11)-5;y+=12;c.lineTo(x,y);}c.stroke();}for(let k=0;k<4;k++)for(let j=0;j<4;j++){c.fillStyle=`rgba(${(k*3+j)%2?255:120},${(k*3+j)%2?250:110},${(k*3+j)%2?240:95},.06)`;c.fillRect(k*128,j*128,128,128);}c.fillStyle='#8f877a';for(let k=0;k<4;k++){c.fillRect(k*128,0,3,512);c.fillRect(0,k*128,512,3);}},512);marble.diffuseTexture.anisotropicFilteringLevel=8;
 (marble.diffuseTexture as DynamicTexture).uScale=.25;(marble.diffuseTexture as DynamicTexture).vScale=.25;
 const glow=mat('lantern-glow','#ffd8a0',0);glow.emissiveColor=new Color3(1,.72,.38);glow.disableLighting=true;
 // Quiet warm stone, 2.4m square slabs. No rosettes, stars or high-frequency floor patterns.
 // anh Thanh 2026-11-04: brighter, warmer "cõi Phật" floor — golden-ivory marble slabs with soft gold veins, a gold and a vermilion inlay line.
 // Still large 2.4 m slabs with no small rosettes (low-frequency, calm to the eye).
 const bong=mat('hall-golden-ivory-marble','#ffffff',.16,48);bong.emissiveColor.set(.07,.05,.02);
 bong.diffuseTexture=tex('hall-240cm-golden-ivory',c=>{const g=c.createRadialGradient(256,256,40,256,256,380);g.addColorStop(0,'#f6e6bf');g.addColorStop(1,'#ead19a');c.fillStyle=g;c.fillRect(0,0,512,512);
  c.globalAlpha=.22;c.strokeStyle='#c99a45';for(let i=0;i<5;i++){c.lineWidth=2+i%3;c.beginPath();let x=i*110-40,y=0;c.moveTo(x,y);while(y<512){x+=Math.sin(y*.013+i*1.7)*14+9;y+=24;c.lineTo(x,y);}c.stroke();}c.globalAlpha=1;
  c.fillStyle='#b98a3c';c.fillRect(0,0,512,4);c.fillRect(0,0,4,512);c.strokeStyle='#d4a548';c.lineWidth=3;c.strokeRect(14,14,484,484);c.strokeStyle='#a8321f';c.lineWidth=2;c.strokeRect(22,22,468,468);},512);
 bong.diffuseTexture.anisotropicFilteringLevel=8;
 // the stepped vault: warm gilded coffers on the drum walls, and a self-lit gold for its bands and lotus
 const vaultWall=mat('vault-wall','#f3d9a0',.1);vaultWall.diffuseTexture=ceiling.diffuseTexture;vaultWall.emissiveColor.set(.42,.3,.16);
 const vaultGold=mat('vault-gold','#d9a441',.6,64);vaultGold.emissiveColor.set(.55,.38,.12);
 return{tile,fascia,ceiling,marble,glow,bong,vaultWall,vaultGold};
}

/** Stepped vault (vòm tầng): coffered ceiling rings that step up and inward, joined by tall coffered drum walls with gold bands and timber pilasters. */
function sanctuaryVault(b:SanctuaryBatch,m:SanctuaryMaterials,g:ReturnType<typeof grandMaterials>){
 const V=SANCTUARY_VAULT,ceil=(x0:number,x1:number,z0:number,z1:number,y:number)=>b.quad(g.ceiling,[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0],[x0/10,z0/10,x1/10,z1/10]);
 const ring=(outer:{x:number;z:number},inner:{x:number;z:number},y:number)=>{for(const p of cutRect({x0:-outer.x,x1:outer.x,z0:-outer.z,z1:outer.z},[{x0:-inner.x,x1:inner.x,z0:-inner.z,z1:inner.z}]))ceil(p.x0,p.x1,p.z0,p.z1,y);
  // a gilded cornice round the opening and a timber beam at the outer edge
  for(const sx of [-1,1]){b.box(g.vaultGold,sx*inner.x,y-.6,0,.5,1.2,2*inner.z+.5);b.box(g.vaultGold,0,y-.6,sx*inner.z,2*inner.x+.5,1.2,.5);}};
 const drum=(p:{x:number;z:number},y0:number,y1:number)=>{const h=y1-y0;
  for(const sx of [-1,1]){b.quad(g.vaultWall,[sx*p.x,y0,-p.z],[sx*p.x,y0,p.z],[sx*p.x,y1,p.z],[sx*p.x,y1,-p.z],[0,0,p.z/5,h/10]);b.quad(g.vaultWall,[-p.x,y0,sx*p.z],[p.x,y0,sx*p.z],[p.x,y1,sx*p.z],[-p.x,y1,sx*p.z],[0,0,p.x/5,h/10]);}
  // the drum faces are tiled with the gold Buddha relief (BuddhaWallPlan 'vault'); only corner posts frame them
  for(const sx of [-1,1])for(const sz of [-1,1])b.box(m.wood,sx*(p.x-.6),(y0+y1)/2,sz*(p.z-.6),1.2,h,1.2);
  for(const [y,dep]of [[y0+.9,1.4],[y1-.9,2.2]]as const)for(const sx of [-1,1]){b.box(m.red,sx*(p.x-dep/2),y,0,dep,1.8,2*p.z);b.box(m.red,0,y,sx*(p.z-dep/2),2*p.x,1.8,dep);}};
 ring({x:300,z:200},V[0],L.eaves);
 // anh Thanh 2026-11-01: the 2nd and 3rd ceiling rings are taken out — the drums hang open to the roof timbers between them
 let y=L.eaves;for(let i=0;i<V.length;i++){drum(V[i],y,V[i].top);y=V[i].top;}
 const top=V.at(-1)!;ceil(-top.x,top.x,-top.z,top.z,top.top);
 // a gilded lotus medallion and coffer grid on the crown ceiling
 for(let x=-top.x+top.x/4;x<top.x;x+=top.x/4)b.box(g.vaultGold,x,top.top-.35,0,.6,.7,2*top.z);for(let z=-top.z+top.z/3;z<top.z;z+=top.z/3)b.box(g.vaultGold,0,top.top-.35,z,2*top.x,.7,.6);
 b.lathe(g.vaultGold,0,top.top-3.2,0,[[0,0],[9,1.2],[16,2.6],[18,3.2]],48);for(let k=0;k<16;k++){const a=k/16*Math.PI*2;b.tube(g.vaultGold,[[Math.cos(a)*16,top.top-.6,Math.sin(a)*16],[Math.cos(a)*28,top.top-.6,Math.sin(a)*28]],.8,8);}
}

type AddRect=(x:number,z:number,w:number,d:number,base:number,h:number)=>void;
/** A plain stretch of the rear wall between a and c, with its collision. */
function wallPiece(b:SanctuaryBatch,m:SanctuaryMaterials,a:number,c:number,z:number,base:number,height:number,add:AddRect){if(c-a<.05)return;b.box(m.ivory,(a+c)/2,base+height/2,z,c-a,height,.7);add((a+c)/2,z,c-a,.7,base,height);}
/** A walk-through doorway (HALL_DOOR): lacquered jambs, gilded lintel and the wall above it. axis = the wall's direction. */
function hallDoor(b:SanctuaryBatch,m:SanctuaryMaterials,x:number,z:number,axis:'x'|'z',base:number,height:number,add:AddRect,half=HALL_DOOR.half){const H=HALL_DOOR.h,h=half,top=height-H;
 const at=(u:number,y:number,w:number,hh:number,d:number,mat:StandardMaterial)=>axis==='x'?b.box(mat,x+u,y,z,w,hh,d):b.box(mat,x,y,z+u,d,hh,w);
 at(0,base+H+top/2,2*h,top,.7,m.ivory);if(axis==='x')add(x,z,2*h,.7,base+H,top);
 for(const s of [-1,1])at(s*(h+.4),base+H/2,.8,H,1.4,m.red);at(0,base+H+.5,2*h+1.6,1,1.5,m.wood);at(0,base+H-.2,2*h,.3,1.6,m.gold);}
