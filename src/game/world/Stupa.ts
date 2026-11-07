import {largeRoofTiles}from './LargeRoofTiles';
import {type Scene,Vector3,Color3} from '@babylonjs/core';
import {SanctuaryBatch,sanctuaryMaterials,sanctuaryColumn} from './SanctuaryGeometry';
import {STUPA as T,towerFloor,towerRadius,towerRoofRadius,STUPA_PHASE,STUPA_STAIR_PHASE,STUPA_TOTAL_STEPS,STUPA_FLOOR_INNER,STUPA_LANDING_HALF_ANGLE,STUPA_BASE_RAILS,STUPA_WEST_GATE_X} from './StupaPlan';
import {TowerBuddhas}from './TowerBuddhas';
import {StupaElevator}from './StupaElevator';
import {stupaQuadNormal}from './StupaSurfacePlan';
import {stupaLabels}from './StupaLabels';
import {addObstacle,type Rect} from './Obstacles';
/** Correct only this tower's inward legacy tube normals. */
class TowerBatch extends SanctuaryBatch{override quad(mat:ReturnType<typeof sanctuaryMaterials>['stone'],a:number[],b:number[],c:number[],d:number[],uv:[number,number,number,number]=[0,0,1,1]){const acc=this.acc(mat),start=acc.N.length;super.quad(mat,a,b,c,d,uv);const n=stupaQuadNormal(a,b,c,d);for(let i=start;i<acc.N.length;i++)acc.N[i]=n[(i-start)%3];}override tube(mat:ReturnType<typeof sanctuaryMaterials>['stone'],points:number[][],r:number,n=8){const a=this.acc(mat),start=a.N.length;super.tube(mat,points,r,n);for(let k=start;k<a.N.length;k++)a.N[k]*=-1;}}
/** Original eight-sided tower. Geometry is batched by material; no sacred figures fabricated from primitives. */
export function buildStupa(scene:Scene,low:boolean){
 const m=sanctuaryMaterials(scene,low),b=new TowerBatch(scene,{x:T.x,y:0,z:T.z},`an-lien-${T.levels}-storey-${T.top}m-stupa`);
 m.dark.diffuseColor=Color3.FromHexString('#9c2923');m.roof.diffuseColor=Color3.FromHexString('#ef852b');m.ivory.diffuseColor=Color3.FromHexString('#efd068');m.roof.emissiveColor=new Color3(.12,.045,.008);
 for(const mat of [m.roof,m.ivory,m.dark]){mat.alpha=1;mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.diffuseTexture=null;mat.bumpTexture=null;}for(const mat of [m.floor,m.stone])mat.emissiveColor=new Color3(.16,.17,.18);m.ivory.emissiveColor=new Color3(.22,.17,.07);m.dark.emissiveColor=new Color3(.12,.025,.018);m.stone.diffuseColor=Color3.FromHexString('#c8cec8');
 largeRoofTiles(m.roof,scene);
 const riser=m.stone.clone('tower-clear-step-risers')!;riser.diffuseColor=Color3.FromHexString('#96968c');riser.emissiveColor=new Color3(.12,.12,.12);riser.bumpTexture=null;for(const mat of [m.floor,m.stone,m.ivory,m.dark]){mat.bumpTexture=null;mat.twoSidedLighting=true;}
 const point=(a:number,r:number,y:number)=>[Math.cos(a+STUPA_PHASE)*r,y,Math.sin(a+STUPA_PHASE)*r];
 const stairPoint=(a:number,r:number,y:number)=>[Math.cos(a+STUPA_STAIR_PHASE)*r,y,Math.sin(a+STUPA_STAIR_PHASE)*r];
 function ring(mat:typeof m.floor,inner:number,outer:number,y:number,thick=.35){const n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=(i+1)/n*Math.PI*2,p=[Math.cos(a)*inner,y,Math.sin(a)*inner],q=[Math.cos(c)*inner,y,Math.sin(c)*inner],r=[Math.cos(c)*octagonal(c,outer),y,Math.sin(c)*octagonal(c,outer)],t=[Math.cos(a)*octagonal(a,outer),y,Math.sin(a)*octagonal(a,outer)];b.quad(mat,p,t,r,q,[0,0,8,8]);const acc=b.acc(mat),uv=[p,t,r,q].flatMap(v=>[v[0]/2.4,v[2]/2.4]);for(let j=0;j<8;j++)acc.UVs[acc.UVs.length-8+j]=uv[j];b.quad(m.dark,t.map((v,k)=>k===1?v-thick:v),r.map((v,k)=>k===1?v-thick:v),q.map((v,k)=>k===1?v-thick:v),p.map((v,k)=>k===1?v-thick:v));b.quad(m.stone,p.map((v,k)=>k===1?v-thick:v),q.map((v,k)=>k===1?v-thick:v),q,p);}}
 const octagonal=(a:number,r:number)=>{const sector=Math.PI/4,t=((a-STUPA_PHASE)%sector+sector)%sector;return r*Math.cos(Math.PI/8)/Math.cos(t-Math.PI/8);};
 const obstacle=(a:number,p:number[],q:number[],base:number,h:number)=>{const r:Rect={cx:T.x+(p[0]+q[0])/2,cz:T.z+(p[2]+q[2])/2,hx:Math.hypot(q[0]-p[0],q[2]-p[2])/2,hz:.16,yaw:-a,base,h,sight:false,climb:false};addObstacle(r);};
 function roof(y:number,outer:number,inner:number,rise:number,upturn=1.8){const steps=low?6:14,across=low?8:24;
 const p=(side:number,u:number,t:number,drop=0)=>{const a=side*Math.PI/4+STUPA_PHASE,c=(side+1)*Math.PI/4+STUPA_PHASE,r=inner+(outer-inner)*t;return[(Math.cos(a)*(1-u)+Math.cos(c)*u)*r,y+rise*(1-t)**1.6+upturn*t**5*(Math.abs(u-.5)*2)**6+drop,(Math.sin(a)*(1-u)+Math.sin(c)*u)*r];};
 for(let s=0;s<8;s++){
  for(let i=0;i<across;i++)for(let j=0;j<steps;j++){const u=i/across,v=(i+1)/across,t=j/steps,w=(j+1)/steps;b.quad(m.roof,p(s,u,t),p(s,v,t),p(s,v,w),p(s,u,w),[i,j,i+1,j+1]);b.quad(m.dark,p(s,u,w,-.42),p(s,v,w,-.42),p(s,v,t,-.42),p(s,u,t,-.42));}
  const edge=Array.from({length:across+1},(_,i)=>p(s,i/across,1));b.tube(m.gold,edge,.19,6);b.tube(m.dark,edge.map(v=>[v[0],v[1]-.4,v[2]]),.3,6);
  for(let i=0;i<=across;i+=low?4:1)b.tube(m.roof,Array.from({length:steps+1},(_,j)=>p(s,i/across,j/steps,.06)),.075,5);
  const ridge=Array.from({length:steps+1},(_,j)=>p(s,0,j/steps,.16));const end=ridge.at(-1)!;ridge.push([end[0]*1.025,end[1]+upturn*.2,end[2]*1.025],[end[0]*1.04,end[1]+upturn*.4,end[2]*1.04]);b.tube(m.gold,ridge,.22,8);
 }
 }
 // Ground plaza links the rear garden path; base floor meets terrain without a giant hollow pedestal.
 b.floor(m.floor,-60,60,-60,60,.04,.16);
 addObstacle({cx:T.x,cz:T.z,hx:60,hz:60,yaw:0,base:-.12,h:.16,sight:false,climb:true,surface:true,step:true});
 // Continuous entrance promenade: both stone rails meet the open west plaza entrance.
 const approach=[[STUPA_WEST_GATE_X-T.x,12],[-60,6],[-50,6]];
 for(let i=0;i<approach.length-1;i++){const [x0,w0]=approach[i],[x1,w1]=approach[i+1];
  b.quad(m.floor,[x0,.04,-w0],[x1,.04,-w1],[x1,.04,w1],[x0,.04,w0]);
  for(const side of [-1,1]){const z0=side*w0,z1=side*w1,n=Math.ceil(Math.hypot(x1-x0,z1-z0)/3);
   for(const h of [.3,1.2])b.tube(m.stone,[[x0,h,z0],[x1,h,z1]],.14,8);
   for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,z=z0+(z1-z0)*k/n;b.box(m.stone,x,.65,z,.35,1.3,.35);b.box(m.ivory,x,1.35,z,.55,.15,.55);}
   obstacle(Math.atan2(z1-z0,x1-x0),[x0,0,z0],[x1,0,z1],0,1.45);
  }
 }
 for(let level=0;level<T.levels;level++){
  const y=towerFloor(level),r=towerRadius(level),scale=r/50,columnRadius=r-1.2,wallRadius=r*.68,columnH=level===T.levels-1?6.35:T.storey-2.85;ring(m.floor,level===0?0:STUPA_FLOOR_INNER,r,level===0?.08:y);
  for(let side=0;side<8;side++){
   const a=side*Math.PI/4,c=(side+1)*Math.PI/4,p=point(a,columnRadius,y),q=point(c,columnRadius,y);
   sanctuaryColumn(b,m,p[0],p[2],y,columnH,.5+.4*scale);addObstacle({cx:T.x+p[0],cz:T.z+p[2],hx:.7,hz:.7,yaw:0,base:y,h:columnH,sight:true,climb:false});
   // Deep timber lintel and layered bracket arms beneath every eave.
   for(const h of [columnH-.85,columnH-.4,columnH])b.tube(h===8.25?m.gold:m.red,[[p[0],y+h,p[2]],[q[0],y+h,q[2]]],h===8.25?.13:.35,8);
   if(level>0){const pa=point(a,r-.65,y),pb=point(c,r-.65,y),dir=Math.atan2(pb[2]-pa[2],pb[0]-pa[0]);
    for(const h of [.3,1.2])b.tube(m.stone,[[pa[0],y+h,pa[2]],[pb[0],y+h,pb[2]]],.11,6);
    for(let j=0;j<=Math.max(low?3:5,Math.round((low?6:12)*scale));j++){const u=j/Math.max(low?3:5,Math.round((low?6:12)*scale)),x=pa[0]*(1-u)+pb[0]*u,z=pa[2]*(1-u)+pb[2]*u;b.lathe(m.stone,x,y,z,[[.17,0],[.12,.3],[.19,.55],[.12,.85],[.18,1.22]],6);}
    obstacle(dir,pa,pb,y,1.3);
   }
   // Eight lime-plaster bays, each with a wide open portal and carved timber frame.
   const w0=point(a,wallRadius,y),w1=point(c,wallRadius,y),len=Math.hypot(w1[0]-w0[0],w1[2]-w0[2]);
   const wp=(u:number,h:number)=>[w0[0]*(1-u)+w1[0]*u,y+h,w0[2]*(1-u)+w1[2]*u];
   const gap=Math.min(3.5,len*.28)/len,wl=.5-gap,wr=.5+gap,wallTop=level===T.levels-1?6.7:T.storey-2.3,doorTop=level===T.levels-1?5.8:6.4;
   for(const [u,v] of [[0,wl],[wr,1]]){b.quad(m.ivory,wp(u,.9),wp(v,.9),wp(v,wallTop),wp(u,wallTop));b.quad(m.red,wp(u,.1),wp(v,.1),wp(v,.9),wp(u,.9));obstacle(Math.atan2(w1[2]-w0[2],w1[0]-w0[0]),wp(u,0),wp(v,0),y,wallTop);}
   b.quad(m.ivory,wp(wl,doorTop),wp(wr,doorTop),wp(wr,wallTop),wp(wl,wallTop));
   for(const u of [wl,wr])b.tube(m.red,[wp(u,0),wp(u,doorTop+.1)],.24,8);
   b.tube(m.gold,Array.from({length:17},(_,i)=>wp(wl+(wr-wl)*i/16,doorTop-.1+.45*Math.sin(i/16*Math.PI))),.12,6);
   // Inner open pavilion, columns leave unobstructed views across the campus.
   const inner=point(a,10.5,y);sanctuaryColumn(b,m,inner[0],inner[2],y,T.storey-3.65,.6);
  }
  if(level<T.levels-1)roof(y+T.storey-2.38,towerRoofRadius(level),r*.72,2.0);
  if(level>0){
   // Separate exits: stair landing NE; lift landing SW, above the half-turn below.
   // Both balustrades terminate at the floor-hole edge, never extend to the room door.
   for(const [angle,start]of [[STUPA_STAIR_PHASE,7.6],[STUPA_STAIR_PHASE+Math.PI,2.4]]){const ca=Math.cos(angle),sa=Math.sin(angle),p=(r:number,v:number,h:number)=>[ca*r-sa*v,h,sa*r+ca*v],half=(r:number)=>Math.min(2.8,r*Math.tan(STUPA_LANDING_HALF_ANGLE)+.4);const ends=start===2.4?[2.4,4,8.4]:[7.6,8.4];for(let j=0;j<ends.length-1;j++){const r0=ends[j],r1=ends[j+1];b.quad(m.floor,p(r0,-half(r0),y),p(r1,-half(r1),y),p(r1,half(r1),y),p(r0,half(r0),y));if(start===2.4)for(const side of [-1,1])for(const h of [.35,1.1])b.tube(m.stone,[p(r0,side*(half(r0)+.1),y+h),p(r1,side*(half(r1)+.1),y+h)],.08,5);}}
   for(let k=0;k<96;k+=low?2:1){const a=k/96*Math.PI*2,c=(k+(low?2:1))/96*Math.PI*2,mid=(a+c)/2;if(Math.min(Math.abs(mid-STUPA_STAIR_PHASE),Math.abs(mid-STUPA_STAIR_PHASE+Math.PI*2),Math.abs(mid-STUPA_STAIR_PHASE-Math.PI*2),Math.abs(mid-STUPA_STAIR_PHASE-Math.PI))<STUPA_LANDING_HALF_ANGLE+(low?2:1)*Math.PI/96)continue;for(const h of [.35,1.1])b.tube(m.stone,[[Math.cos(a)*STUPA_FLOOR_INNER,y+h,Math.sin(a)*STUPA_FLOOR_INNER],[Math.cos(c)*STUPA_FLOOR_INNER,y+h,Math.sin(c)*STUPA_FLOOR_INNER]],.08,5);if(k%4===0)b.tube(m.stone,[[Math.cos(a)*STUPA_FLOOR_INNER,y,Math.sin(a)*STUPA_FLOOR_INNER],[Math.cos(a)*STUPA_FLOOR_INNER,y+1.15,Math.sin(a)*STUPA_FLOOR_INNER]],.08,5);}

  }
 }
 // Connected, numbered spiral: 96 steps / 13 m, one turn per floor.
 for(let i=0;i<STUPA_TOTAL_STEPS;i++){const a=i/T.stepsPerTurn*Math.PI*2,c=(i+1)/T.stepsPerTurn*Math.PI*2,y=(i+1)*T.stairRise,p=stairPoint(a,4,y),q=stairPoint(c,4,y),r=stairPoint(c,8,y),t=stairPoint(a,8,y);b.quad(m.stone,p,t,r,q);b.quad(riser,stairPoint(a,4,y-T.stairRise),stairPoint(a,8,y-T.stairRise),t,p);b.quad(m.ivory,stairPoint(a,4.05,y+.008),stairPoint(a,7.95,y+.008),stairPoint(a+.012,7.95,y+.008),stairPoint(a+.012,4.05,y+.008));b.quad(m.dark,stairPoint(a,4,y-.2),stairPoint(c,4,y-.2),stairPoint(c,8,y-.2),stairPoint(a,8,y-.2));}
 for(const r of [4,8])for(let i=0;i<STUPA_TOTAL_STEPS;i+=low?3:1){const stride=low?3:1,k=i%T.stepsPerTurn,mid=(k+stride/2)/T.stepsPerTurn*Math.PI*2;if(r===8&&Math.min(mid,Math.PI*2-mid)<STUPA_LANDING_HALF_ANGLE+stride*Math.PI/96)continue;const a=i/T.stepsPerTurn*Math.PI*2,c=(i+stride)/T.stepsPerTurn*Math.PI*2;b.tube(m.stone,[stairPoint(a,r,i*T.stairRise+1.15),stairPoint(c,r,(i+stride)*T.stairRise+1.15)],.09,5);if(i%(low?6:4)===0)b.tube(m.ivory,[stairPoint(a,r,i*T.stairRise),stairPoint(a,r,i*T.stairRise+1.15)],.07,5);}
 // Floor 36 closes the unused half of the spiral void, retaining the descending half-flight and lift.
 {const y=towerFloor(T.levels-1);for(let k=0;k<48;k++){const a=k/48*Math.PI,c=(k+1)/48*Math.PI,p=stairPoint(a,2.4,y),q=stairPoint(c,2.4,y),r=stairPoint(c,8.4,y),t=stairPoint(a,8.4,y);b.quad(m.floor,p,t,r,q);b.quad(m.stone,p.map((v,i)=>i===1?v-.35:v),q.map((v,i)=>i===1?v-.35:v),q,p);}}
 // Solid end stop across the unfinished positive branch at the highest landing.
 const capA=STUPA_LANDING_HALF_ANGLE,capY=towerFloor(T.levels-1);for(const h of [.3,.75,1.2])b.tube(m.stone,[stairPoint(capA,3.9,capY+h),stairPoint(capA,8.3,capY+h)],.14,8);for(const r of [3.9,5,6,7,8.3])b.tube(m.ivory,[stairPoint(capA,r,capY),stairPoint(capA,r,capY+1.3)],.13,8);
 // A physical end barrier complements the analytic stair rail, including edge approaches.
 {const a=STUPA_STAIR_PHASE+STUPA_LANDING_HALF_ANGLE,r0=3.85,r1=8.5,y=towerFloor(T.levels-1);obstacle(a,[Math.cos(a)*r0,y,Math.sin(a)*r0],[Math.cos(a)*r1,y,Math.sin(a)*r1],y,2.2);}
 // Open front shaft, gold guide rails and floor thresholds replace the old central pillar.
 for(const a of [Math.PI*.75,Math.PI*1.25,Math.PI*1.75])b.tube(m.gold,[[Math.cos(a)*2.3,0,Math.sin(a)*2.3],[Math.cos(a)*2.3,towerFloor(T.levels-1)+1,Math.sin(a)*2.3]],.12,8);
 for(let i=0;i<T.levels;i++){const y=towerFloor(i);b.lathe(m.gold,0,y,0,[[2.35,0],[2.35,.12]],24);}
 const elevator=new StupaElevator(scene);
 // The final storey's wall stops BELOW the first crown eave; all three roofs remain visible.
 const topFloor=towerFloor(T.levels-1);
 const upperEave=topFloor+10.3,upperRise=6,spireBase=upperEave+upperRise;
 b.lathe(m.ivory,0,topFloor+6.7,0,[[12,0],[12,1.6],[7,1.6],[7,3.9],[3.8,3.9],[3.8,6.1]],8);
 roof(topFloor+6.8,towerRoofRadius(T.levels-1),12,1.55,.9);
 roof(topFloor+8.5,18,7,2.2,1);
 roof(upperEave,11.5,1.15,upperRise,1.2);
 b.lathe(m.gold,0,spireBase-.2,0,[[1.15,0],[1.15,.38],[.78,.62],[.95,.95],[.72,1.4],[.46,1.65],[.29,2.35],[0,T.top-spireBase+.2]],24);
 // Stone guardrails surround the complete base plaza, with only the west entry open.
 for(const [x0,z0,x1,z1]of STUPA_BASE_RAILS){const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/3);for(const h of [.25,1.2])b.tube(m.stone,[[x0,h,z0],[x1,h,z1]],.14,6);for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,z=z0+(z1-z0)*k/n;b.box(m.stone,x,.65,z,.35,1.3,.35);b.box(m.ivory,x,1.35,z,.55,.15,.55);}obstacle(Math.atan2(z1-z0,x1-x0),[x0,0,z0],[x1,0,z1],0,1.45);}
 b.build();for(const mesh of b.meshes){mesh.isPickable=false;if([m.floor,m.stone,m.ivory,m.dark,m.red,riser].includes(mesh.material as typeof m.floor))mesh.receiveShadows=false;mesh.freezeWorldMatrix();}const labels=stupaLabels(scene),buddhas=new TowerBuddhas(scene,low);
 scene.onDisposeObservable.addOnce(()=>{b.dispose();labels.dispose();});return {meshes:[...b.meshes,...labels.meshes],triangles:[...b.meshes,...labels.meshes].reduce((s,m)=>s+m.getTotalIndices()/3,0),buddhas,elevator,target:new Vector3(T.x,T.top/2,T.z)};
}
