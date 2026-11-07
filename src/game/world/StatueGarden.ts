import {pavedDisc}from './QuietPaving';
import {COURT_WORSHIP_PADS}from '../chars/TempleVisitPlan';
import {OWNER_COLLECTION}from './OwnerCollectionPlan';
import {create24kGold}from './StatueGold';
import {Color3,DynamicTexture,PBRMaterial,Mesh,MeshBuilder,StandardMaterial,TransformNode,Vector3,ShadowGenerator,LoadAssetContainerAsync,type Scene,type AssetContainer,type AbstractMesh} from '@babylonjs/core';
import {gardenStoneLantern,SanctuaryBatch,sanctuaryColumn,type SanctuaryMaterials} from './SanctuaryGeometry';
import {grandMaterials,sanctuaryAltarFurniture} from './SanctuaryArchitecture';
import {campusSign} from './SanctuaryLandscape';
import {bronzeAltarMesh} from './BronzeAltar';
import {startIncenseSmoke,registerIncense} from './IncenseSmoke';
import {addObstacle,removeObstacle,type Rect} from './Obstacles';
import {GARDEN_STATUES,ACTIVE_GARDEN_STATUES,OWNER_STATUES,FRONT_TRIAD,FOUR_KINGS,FOUR_KINGS_PLINTH,BODHI_SHRINE as BS,UPPER_STATUES,UPPER_PLINTHS,UPPER_FLOOR,GUARDIAN_AVENUE as GA,AMITABHA_PLAZA as AP,AMITABHA_TOP,MAITREYA_PLAZA as MP,FLANK_PLAZA as FP,STATUE_GALLERY as G,galleryColumnZ,galleryBayZ,EAST_ALTAR_BAY,gardenLod,type GardenStatue} from './StatueGardenPlan';

type Level='high'|'low'|'far';
type Shown={level:Level;root:TransformNode;dispose:()=>void};
/** Statues that share a model (the mirrored guardian rows) share one loaded container per detail level. */
const assetOf=(s:GardenStatue)=>s.asset??'library/'+s.id;
const url=(asset:string,lod:Level)=>import.meta.env.BASE_URL+`assets/sanctuary/${asset}/${lod}.glb?v=${asset.startsWith('four-kings/')?'closed-2':'1'}`;

/** The owner-chosen statue library laid out in the courtyard. Never writes saves; obstacles are removed on dispose. */
export class StatueGarden{
 private dead=false;private batch:SanctuaryBatch;private loose:Mesh[]=[];private rects:Rect[]=[];private offSmoke:(()=>void)[]=[];
 private containers=new Map<string,AssetContainer>();private failed=new Set<string>();private shown=new Map<string,Shown>();private wanted=new Map<string,Level>();private pumping=false;private last=new Vector3(1e9,0,1e9);private atlas:DynamicTexture;private ownMats:StandardMaterial[]=[];private goldSrc!:StandardMaterial;private pbr!:PBRMaterial;private statueGold!:PBRMaterial;private triadGold!:PBRMaterial;
 constructor(private scene:Scene,private low:boolean,private at:{x:number;y:number;z:number},m:SanctuaryMaterials){
  const b=this.batch=new SanctuaryBatch(scene,at,'an-lien-statue-garden');
  // Petals are batched with a placeholder, then given a bright metallic gold (same idea as the 100-Buddha halos).
  this.goldSrc=new StandardMaterial('an-lien-garden-gold-src',scene);this.ownMats.push(this.goldSrc);
  const gold=new PBRMaterial('an-lien-garden-lotus-gold',scene);gold.albedoColor=Color3.FromHexString('#E9B949');gold.metallic=.75;gold.roughness=.32;gold.emissiveColor=new Color3(.06,.035,.005);gold.environmentIntensity=1.1;this.pbr=gold;
  const sg=new PBRMaterial('an-lien-upper-statue-gold',scene);sg.albedoColor=Color3.FromHexString('#D9A441');sg.metallic=.85;sg.roughness=.3;sg.emissiveColor=new Color3(.08,.05,.01);sg.environmentIntensity=1.2;this.statueGold=sg;
  this.triadGold=create24kGold(scene);
  for(const s of OWNER_COLLECTION)this.solid(s.x,s.z,s.width/2+.15,s.depth/2+.15,s.yaw,s.height,s.base);
  for(const s of FRONT_TRIAD)this.solid(s.x,s.z,s.width!/2+.5,s.depth!/2+.5,0,s.height);
  this.amitabha(b,m);this.maitreya(b,m);this.flanks(b,m);this.galleries(b,m);this.avenue(b,m);this.bodhiShrine(b,m);this.upperShrine(b,m);this.fourKings(b,m);this.ownerStatues(b,m);this.specialPavilions(b,m);this.riverLotus(b,m);
  const cushions=m.cloth.clone('courtyard-yellow-worship-pads')!;cushions.diffuseColor=Color3.FromHexString('#efbd42');cushions.emissiveColor=new Color3(.08,.05,.008);this.ownMats.push(cushions);
  for(const p of COURT_WORSHIP_PADS){b.box(cushions,p.x,p.y+.04,p.z,.9,.08,1);const r:Rect={cx:at.x+p.x,cz:at.z+p.z,hx:.45,hz:.5,yaw:0,base:at.y+p.y,h:.08,climb:true,surface:true,sight:false};this.rects.push(r);addObstacle(r);}

  b.build();for(const mm of b.meshes)if(mm.material===this.goldSrc)mm.material=gold;this.cast(b.meshes);
  this.atlas=this.nameplates();
  // Altars sit on open ground (the shared altar is authored for the 1.2 m hall floor).
  const ground={...at,y:at.y-1.2};
  const altar=(x:number,z:number,large:boolean,scale:number)=>{const f=sanctuaryAltarFurniture(scene,ground,m,x,z,large);f.batch.meshes.forEach(mm=>this.loose.push(mm));const bronze=bronzeAltarMesh(scene,low,'an-lien-garden-lu-'+x+'-'+z);bronze.position.set(at.x+x,ground.y+f.top+.14,at.z+z);bronze.scaling.setAll(scale);this.loose.push(bronze);startIncenseSmoke(scene,low);this.offSmoke.push(registerIncense(scene,new Vector3(at.x+x,ground.y+f.top+1.2,at.z+z)));this.solid(x,z,large?5.4:2.4,1.4,0,2.6);};
  altar(AP.x,AP.z+AP.tiers[0].r+5,true,3.5);altar(MP.x,MP.z+MP.plinth[0].r+2.6,false,1.6);
  for(const s of [-1,1])altar(s*FP.x,FP.z+FP.plinth[0].r+2.6,false,1.6);
  altar(G.line-6,galleryBayZ(EAST_ALTAR_BAY),false,1.6);altar(BS.x,BS.z+BS.r+2.2,false,1.4);
  // Upper-floor altars: the shared altar is authored for the 1.2 m ground floor, so lift it to the upper slab.
  {const upper={...at,y:at.y+UPPER_FLOOR-1.2};for(const s of UPPER_STATUES){const big=s.id==='d06',p=UPPER_PLINTHS[s.id],z=s.z+p.r+(big?3:2.2);const f=sanctuaryAltarFurniture(scene,upper,m,s.x,z,big);f.batch.meshes.forEach(mm=>this.loose.push(mm));const bronze=bronzeAltarMesh(scene,low,'an-lien-upper-lu-'+s.id);bronze.position.set(at.x+s.x,upper.y+f.top+.14,at.z+z);bronze.scaling.setAll(big?3:1.5);this.loose.push(bronze);this.offSmoke.push(registerIncense(scene,new Vector3(at.x+s.x,upper.y+f.top+1.2,at.z+z)));this.solid(s.x,z,big?5.4:2.4,1.4,0,2.6,UPPER_FLOOR);}}
  this.loose.push(campusSign(scene,at,'NAM MÔ A DI ĐÀ PHẬT',AP.x,AP.tiers[0].h+.05,AP.z+AP.tiers[1].r+.05,12));
  for(const [text,side] of [['HÀNH LANG CHƯ PHẬT',-1],['HÀNH LANG CHƯ BỒ TÁT',1]]as const){const sg=campusSign(scene,at,text,side*(G.front-1.2),G.eave-2.1,(G.z0+G.z1)/2,14);sg.rotation.y=side<0?Math.PI/2:-Math.PI/2;sg.position.set(at.x+side*(G.front-1.2),at.y+G.eave-2.1,at.z+(G.z0+G.z1)/2);this.loose.push(sg);}
 }
 private cast(meshes:AbstractMesh[],remove=false){for(const l of this.scene.lights){const sh=l.getShadowGenerator();if(sh instanceof ShadowGenerator)for(const mm of meshes){if(remove)sh.removeShadowCaster(mm,false);else sh.addShadowCaster(mm,false);}}}
 private solid(x:number,z:number,hx:number,hz:number,yaw:number,h:number,floor=0){const r:Rect={cx:this.at.x+x,cz:this.at.z+z,hx,hz,yaw,base:this.at.y+floor,h,sight:true,climb:false};this.rects.push(r);addObstacle(r);}
 /** Octagonal podium as the union of two squares rotated 45°. */
 private octagon(x:number,z:number,r:number,h:number){const a=r*.98;this.solid(x,z,a,a,0,h);this.solid(x,z,a,a,Math.PI/4,h);}
 /** One lotus petal: leaf outline tapering to a tip, cupped across its width, curling outward at the tip. */
 private petal(b:SanctuaryBatch,mat:StandardMaterial,cx:number,cy:number,cz:number,a:number,r:number,len:number,wid:number,tilt:number){
  const ox=Math.cos(a),oz=Math.sin(a),tx=-oz,tz=ox,U=6,V=8,pts:number[][][]=[];
  for(let j=0;j<=V;j++){const v=j/V,w=wid*Math.sin(Math.PI*Math.min(1,v*.92+.08))**.7*(1-v*.35),ang=tilt+(1-tilt)*.0+v*v*.5,along=len*v,rr=r+along*Math.cos(ang)*.55+v*v*.5,yy=along*Math.sin(ang)+.15;const row:number[][]=[];
   for(let i=0;i<=U;i++){const u=i/U*2-1,cup=.35*wid*(1-u*u)*(1-v*.6);row.push([cx+ox*(rr-cup)+tx*u*w,cy+yy+cup*.3,cz+oz*(rr-cup)+tz*u*w]);}pts.push(row);}
  for(let j=0;j<V;j++)for(let i=0;i<U;i++){const p=pts[j][i],q=pts[j][i+1],s=pts[j+1][i+1],t=pts[j+1][i];b.quad(mat,p,q,s,t);b.quad(mat,t,s,q,p);}
 }
 private lantern(b:SanctuaryBatch,m:SanctuaryMaterials,x:number,z:number,k=1){gardenStoneLantern(b,m,x,z,k);this.solid(x,z,.5*k,.5*k,0,3.1*k);}
 /** Square world-space paving, not texture repeated independently inside every radial wedge. */
 private pavedDisc(b:SanctuaryBatch,x:number,z:number,r:number){pavedDisc(b,grandMaterials(this.scene).bong,x,z,r);}
 private amitabha(b:SanctuaryBatch,m:SanctuaryMaterials){
  const {x,z}=AP;this.pavedDisc(b,x,z,AP.r);b.tube(m.stone,Array.from({length:97},(_,i)=>[x+Math.cos(i/96*Math.PI*2)*(AP.r+.2),.06,z+Math.sin(i/96*Math.PI*2)*(AP.r+.2)]),.3,6);
  let y=0;AP.tiers.forEach((t,i)=>{b.lathe(i===1?m.ivory:m.stone,x,y,z,[[t.r,0],[t.r,t.h-.18],[t.r-.25,t.h-.18],[t.r-.25,t.h],[0,t.h]],64);b.lathe(m.gold,x,y+t.h-.2,z,[[t.r+.04,0],[t.r+.04,.08]],64);if(i<2)b.lathe(m.red,x,y+.25,z,[[t.r+.03,0],[t.r+.03,t.h*.45]],64);y+=t.h;});
  // Gilded lotus throne: two rings of upturned petals around the statue base.
  const top=AP.tiers[2].r-.4;b.lathe(m.stone,x,y,z,[[top,0],[top,AP.lotus],[0,AP.lotus]],64);
  // Two staggered rings of cupped, pointed lotus petals; outer ring leans out, inner ring stands up.
  for(const [r,n,len,wid,tilt]of [[top-.2,30,3.4,1.75,.55],[top-2.2,26,3.6,1.6,.95]]as const)for(let i=0;i<n;i++)this.petal(b,this.goldSrc,x,y+AP.lotus-.1,z,(i+(r<top-1?.5:0))/n*Math.PI*2,r,len,wid,tilt);
  for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;this.lantern(b,m,x+Math.cos(a)*(AP.r-5),z+Math.sin(a)*(AP.r-5),1.2);}
  // Low stone balustrade ring, open toward the gate, the hall and the two prayer wheels.
  const R=AP.tiers[0].r+3.2;for(let i=0;i<48;i++){const a=i/48*Math.PI*2,c=(i+1)/48*Math.PI*2,mid=(a+c)/2;if([0,Math.PI/2,Math.PI,Math.PI*1.5,Math.PI*2].some(o=>Math.abs(mid-o)<.16))continue;b.tube(m.stone,[[x+Math.cos(a)*R,.85,z+Math.sin(a)*R],[x+Math.cos(c)*R,.85,z+Math.sin(c)*R]],.09,6);b.lathe(m.stone,x+Math.cos(a)*R,0,z+Math.sin(a)*R,[[.2,0],[.2,1.0],[.12,1.05],[0,1.12]],8);}
  this.octagon(x,z,AP.tiers[0].r,AMITABHA_TOP+20);
 }
 private maitreya(b:SanctuaryBatch,m:SanctuaryMaterials){const {x,z}=MP;this.pavedDisc(b,x,z,MP.r);let y=0;MP.plinth.forEach((t,i)=>{b.lathe(i?m.red:m.stone,x,y,z,[[t.r,0],[t.r,t.h],[0,t.h]],32);b.lathe(m.gold,x,y+t.h-.12,z,[[t.r+.03,0],[t.r+.03,.07]],32);y+=t.h;});for(let i=0;i<18;i++)this.petal(b,this.goldSrc,x,y-.1,z,i/18*Math.PI*2,3.6,1.3,.7,.65);for(const s of [-1,1])this.lantern(b,m,x+s*9.5,z+3);this.solid(x,z,MP.plinth[0].r*.95,MP.plinth[0].r*.95,0,9);}
 private flanks(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of [-1,1]){const x=s*FP.x,z=FP.z;this.pavedDisc(b,x,z,FP.r);b.floor(m.floor,x-2.2,x+2.2,248,z-FP.r+.5,.03,.06);let y=0;FP.plinth.forEach((t,i)=>{b.lathe(i?m.ivory:m.stone,x,y,z,[[t.r,0],[t.r,t.h],[0,t.h]],16);b.lathe(m.gold,x,y+t.h-.12,z,[[t.r+.03,0],[t.r+.03,.07]],16);y+=t.h;});for(let i=0;i<20;i++)this.petal(b,this.goldSrc,x,y-.1,z,i/20*Math.PI*2,3.7,1.5,.7,.7);for(const d of [-1,1])this.lantern(b,m,x+d*8.5,z+6);this.solid(x,z,FP.plinth[0].r*.92,FP.plinth[0].r*.92,0,20);}}
 /** Two roofed galleries (hành lang) against the side walls; statues face the courtyard. */
 private galleries(b:SanctuaryBatch,m:SanctuaryMaterials){
  // The gallery interior sits in the roof's shadow: own copies of plaster/lacquer with a soft bounce-light glow.
  const wall=m.ivory.clone('an-lien-gallery-wall') as StandardMaterial,niche=m.red.clone('an-lien-gallery-niche') as StandardMaterial;wall.emissiveColor=new Color3(.30,.27,.22);niche.emissiveColor=new Color3(.26,.06,.035);this.ownMats.push(wall,niche);
  for(const side of [-1,1]){const xf=side*G.front,xb=side*G.back,xl=side*G.line,x0=xl-25,x1=xl+25;
   b.floor(m.floor,Math.min(xf,xb)-3,Math.max(xf,xb)+2,G.z0-2,G.z1+2,G.floor,G.floor+.05);
   for(let k=0;k<=G.bays;k++){const z=galleryColumnZ(k);for(const xc of [xf,xb]){sanctuaryColumn(b,m,xc,z,G.floor,G.eave-.4-G.floor,.55);this.solid(xc,z,.55,.55,0,G.eave);}}
   const walk:Rect={cx:this.at.x+xl,cz:this.at.z+(G.z0+G.z1)/2,hx:Math.abs(xb-xf)/2+2,hz:(G.z1-G.z0)/2+2,yaw:0,base:this.at.y,h:G.floor,surface:true,climb:true,sight:false};this.rects.push(walk);addObstacle(walk);
   for(const s of OWNER_COLLECTION.filter(s=>s.group==='owner-court'&&Math.sign(s.x)===side)){const hx=s.depth/2+.8,hz=s.width/2+.8;b.box(m.stone,s.x,G.floor+.4,s.z,hx*2,.8,hz*2);b.box(m.ivory,s.x,s.base-.04,s.z,hx*2+.15,.08,hz*2+.15);this.solid(s.x,s.z,hx,hz,0,s.base);}
   // Rear wall with a red lacquer dado and gold band.
   const xw=side*(G.back+1.6);b.box(wall,xw,G.eave/2,(G.z0+G.z1)/2,.6,G.eave,G.z1-G.z0+2);b.box(niche,xw-side*.38,.75,(G.z0+G.z1)/2,.16,1.5,G.z1-G.z0);b.box(m.gold,xw-side*.4,1.55,(G.z0+G.z1)/2,.16,.12,G.z1-G.z0);b.box(m.wood,xw-side*.4,G.eave-1.2,(G.z0+G.z1)/2,.18,.9,G.z1-G.z0);
   // A red lacquer niche (khám) with a gilt frame and arched head behind every bay.
   for(let k=0;k<G.bays;k++){const zc=galleryBayZ(k),xp=xw-side*.42,w=(G.z1-G.z0)/G.bays-4.2,h0=1.7,h1=G.eave-2.2;b.box(niche,xp,(h0+h1)/2,zc,.14,h1-h0,w);const arch=Array.from({length:17},(_,i)=>{const t=i/16*Math.PI;return[xp-side*.08,h1-1.6+Math.sin(t)*1.6,zc-Math.cos(t)*w/2];});b.tube(m.gold,[[xp-side*.08,h0,zc-w/2],[xp-side*.08,h1-1.6,zc-w/2],...arch,[xp-side*.08,h1-1.6,zc+w/2],[xp-side*.08,h0,zc+w/2]],.12,6);b.tube(m.gold,[[xp-side*.08,h0,zc-w/2],[xp-side*.08,h0,zc+w/2]],.12,6);}this.solid(xw,(G.z0+G.z1)/2,.3,(G.z1-G.z0)/2+1,0,G.eave);
   // Beams and a pitched tile roof with upturned ends.
   for(const xc of [xf,xb])b.box(m.wood,xc,G.eave-.25,(G.z0+G.z1)/2,.7,.6,G.z1-G.z0+1);for(let k=0;k<=G.bays;k++)b.box(m.wood,xl,G.eave-.25,galleryColumnZ(k),Math.abs(xb-xf)+.6,.5,.5);
   const roofY=(x:number,z:number)=>{const t=Math.abs(x-xl)/25;const end=Math.max(0,1-Math.min(z-(G.z0-4),(G.z1+4)-z)/10);return G.ridge-(G.ridge-G.eave)*t**1.3+1.4*end**3*t;};
   const N=26;for(let i=0;i<N;i++){const za=G.z0-4+(i/N)*(G.z1-G.z0+8),zb=G.z0-4+((i+1)/N)*(G.z1-G.z0+8);for(const [xa,xc]of [[x0,xl],[xl,x1]]){const S=6;for(let j=0;j<S;j++){const u=xa+(xc-xa)*j/S,v=xa+(xc-xa)*(j+1)/S;const p=[[u,roofY(u,za),za],[v,roofY(v,za),za],[v,roofY(v,zb),zb],[u,roofY(u,zb),zb]];// Tile face up (same winding as SanctuaryBatch.floor), dark timber soffit 18 cm below facing down.
const q=p.map(v=>[v[0],v[1]-.18,v[2]]);b.quad(m.roof,p[0],p[1],p[2],p[3]);b.quad(m.dark,q[3],q[2],q[1],q[0]);}}}
   // Rolled tile ribs (ngói ống) down both slopes, as on the main hall.
   for(let z=G.z0-3.4;z<G.z1+3.5;z+=2.4)for(const xe of [x0,x1])b.tube(m.roof,Array.from({length:7},(_,i)=>{const xx=xl+(xe-xl)*(.02+i/6*.98);return[xx,roofY(xx,z)+.07,z];}),.07,5);
   b.tube(m.dark,[[xl,G.ridge+.25,G.z0-4],[xl,G.ridge+.25,G.z1+4]],.35,8);for(const xe of [x0,x1])b.tube(m.dark,Array.from({length:27},(_,i)=>{const z=G.z0-4+i/26*(G.z1-G.z0+8);return[xe,roofY(xe,z)-.05,z];}),.16,6);
   // Statue plinths: square granite with gold trim for figures, a turned column for heads.
   for(const s of ACTIVE_GARDEN_STATUES.filter(s=>s.group===(side<0?'west':'east'))){if(s.head){b.lathe(m.stone,s.x,G.floor,s.z,[[1.3,0],[1.3,.3],[.85,.45],[.75,G.headPlinth-.4],[1.15,G.headPlinth-.25],[1.15,G.headPlinth],[0,G.headPlinth]],20);this.solid(s.x,s.z,1.3,1.3,0,s.base);}else{b.box(m.stone,s.x,G.floor+G.plinth/2,s.z,4.2,G.plinth,4.2);b.box(m.red,s.x,G.floor+G.plinth-.1,s.z,4.3,.2,4.3);b.box(m.gold,s.x,G.floor+G.plinth,s.z,4.0,.06,4.0);this.solid(s.x,s.z,2.1,2.1,0,s.base);}}
  }
 }
 /** Thượng điện: stepped round plinths (granite, lacquer band, gilt rims) with a gold lotus crown under each figure. */
 private specialPavilions(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of OWNER_COLLECTION.filter(s=>s.group==='owner-special'&&s.id!=='new-18')){const hx=s.id==='new-19'?10:8,hz=s.id==='new-19'?12:8,y=13.5;
 b.floor(m.floor,s.x-hx,s.x+hx,s.z-hz,s.z+hz,.12,.12);const floor:Rect={cx:this.at.x+s.x,cz:this.at.z+s.z,hx,hz,yaw:0,base:this.at.y,h:.12,surface:true,climb:true,sight:false};this.rects.push(floor);addObstacle(floor);
 // Both statues remain open to the sky; no canopy columns, beams or roof.

 }}
 private upperShrine(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of UPPER_STATUES){const p=UPPER_PLINTHS[s.id],th=p.h/p.tiers;let y=UPPER_FLOOR;for(let t=0;t<p.tiers;t++){const r=p.r*(1-t*.12);b.lathe(t%2?m.red:m.stone,s.x,y,s.z,[[r,0],[r,th-.12],[r-.15,th],[0,th]],40);b.lathe(m.gold,s.x,y+th-.16,s.z,[[r+.03,0],[r+.03,.07]],40);y+=th;}const top=p.r*(1-(p.tiers-1)*.12)-.3,n=Math.max(14,Math.round(top*5));for(let i=0;i<n;i++)this.petal(b,this.goldSrc,s.x,y-.12,s.z,i/n*Math.PI*2,top-.4,Math.min(1.8,top*.4),Math.min(.9,top*.2),.65);this.solid(s.x,s.z,p.r*.9,p.r*.9,0,p.h+s.height,UPPER_FLOOR);}}
 /** Low round stone seat among the Bodhi roots, gilt rim, a step toward the visitor. */
 private bodhiShrine(b:SanctuaryBatch,m:SanctuaryMaterials){const {x,z,r,h}=BS;b.lathe(m.stone,x,0,z,[[r+.35,0],[r+.35,.12],[r,.14],[r,h],[0,h]],40);b.tube(m.gold,Array.from({length:41},(_,i)=>[x+Math.cos(i/40*Math.PI*2)*(r+.02),h-.04,z+Math.sin(i/40*Math.PI*2)*(r+.02)]),.05,6);b.box(m.stone,x,.15,z+r+.45,2.4,.3,.7);this.solid(x,z,r*.9,r*.9,0,h+3.6);}
 /** Guardian avenue: granite plinth with lacquer band and gilt edge, rock-cut step toward the path. */
 private avenue(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of ACTIVE_GARDEN_STATUES.filter(s=>s.group==='avenue')){const h=GA.half;b.box(m.stone,s.x,GA.plinth/2,s.z,h*2,GA.plinth,h*2);b.box(m.red,s.x,GA.plinth-.12,s.z,h*2+.08,.2,h*2+.08);b.box(m.gold,s.x,GA.plinth,s.z,h*2-.15,.05,h*2-.15);b.box(m.stone,s.x-Math.sign(s.x)*(h+.25),.12,s.z,.5,.24,h*2-.4);this.solid(s.x,s.z,h,h,0,s.base+s.height);}}
 /** One shared atlas for every plate, read from the viewer's side. Mirrored guardians reuse their name cell. */
 private ownerStatues(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of OWNER_STATUES){const reclining=s.id==='owner-7',hx=reclining?32:5,hz=reclining?10:5; b.box(m.stone,s.x,.3,s.z,hx*2,.6,hz*2);b.box(m.gold,s.x,.64,s.z,hx*2-.2,.08,hz*2-.2);b.box(m.stone,s.x,.74,s.z,hx*2-.4,.12,hz*2-.4);this.solid(s.x,s.z,hx,hz,0,s.base+s.height);}}

 /** Living lotus bed in the entrance river, surrounding the owner's watering-lotus figure. */
 private riverLotus(b:SanctuaryBatch,m:SanctuaryMaterials){const s=OWNER_COLLECTION.find(s=>s.id==='new-18')!;
 const pink=m.cloth.clone('river-lotus-pink')!,pod=m.leaf.clone('river-lotus-seedpod')!,leaf=new StandardMaterial('river-lotus-leaves',this.scene);leaf.diffuseColor=Color3.FromHexString('#397a3d');leaf.emissiveColor=new Color3(.035,.08,.025);leaf.specularColor.setAll(.06);leaf.backFaceCulling=false;leaf.twoSidedLighting=true;pink.diffuseColor=Color3.FromHexString('#ed92af');pink.emissiveColor=new Color3(.09,.025,.04);pod.diffuseColor=Color3.FromHexString('#879c39');pink.backFaceCulling=false;pink.twoSidedLighting=true;this.ownMats.push(pink,pod,leaf);
 for(let i=0;i<64;i++){const a=i*2.399963,r=12+(i%5)*2,x=s.x+Math.cos(a)*r,z=s.z+Math.sin(a)*r*.67,y=-2.32,rad=.8+(i%4)*.22;if(z<611)continue;
  const center=[x,y+.14,z];for(let k=1;k<28;k++){const u=k/28*Math.PI*2,v=(k+1)/28*Math.PI*2,p=(q:number)=>[x+Math.cos(q)*rad,y+.03+.09*Math.cos(q*3+i),z+Math.sin(q)*rad];b.quad(leaf,center,p(u),p(v),p(v));}
  if(i%3===0){const top=y+.7+(i%4)*.1;b.tube(m.leaf,[[x,y-.2,z],[x+.07,top,z]],.035,6);
   for(let layer=0;layer<2;layer++)for(let k=0;k<10;k++){const angle=k*Math.PI/5+layer*.31,rr=.62-layer*.19;for(let j=0;j<6;j++){const p=(t:number,w:number)=>{const reach=rr*t,half=Math.sin(t*Math.PI)*.22;return[x+Math.cos(angle)*reach+Math.sin(angle)*half*w,top+.48*t*t+layer*.12-.08*(1-w*w),z+Math.sin(angle)*reach-Math.cos(angle)*half*w];};b.quad(pink,p(j/6,1),p((j+1)/6,1),p((j+1)/6,-1),p(j/6,-1));}}
   b.lathe(m.gold,x,top+.02,z,[[.12,0],[.16,.12],[0,.15]],12);
  }else if(i%4===0){const top=y+.95;b.tube(m.leaf,[[x,y-.2,z],[x,top,z]],.04,6);b.lathe(pod,x,top,z,[[.1,0],[.28,.23],[.31,.27],[0,.27]],18);for(let k=0;k<7;k++){const a=k*Math.PI*2/7;b.lathe(m.dark,x+Math.cos(a)*.18,top+.273,z+Math.sin(a)*.18,[[0,0],[.035,0],[.025,.015],[0,.02]],8);}}
 }
 }
 private fourKings(b:SanctuaryBatch,m:SanctuaryMaterials){for(const s of FOUR_KINGS){for(let i=0;i<3;i++){const width=FOUR_KINGS_PLINTH.half*2-i*2;b.box(m.stone,s.x,i+.5,s.z,width,1,width);b.box(m.gold,s.x,i+.94,s.z,width+.12,.12,width+.12);b.box(m.red,s.x,i+.82,s.z,width+.06,.12,width+.06);}this.solid(s.x,s.z,FOUR_KINGS_PLINTH.half,FOUR_KINGS_PLINTH.half,0,s.base+s.height);}}
 private nameplates(){const cols=2,rows=Math.max(24,Math.ceil(new Set(ACTIVE_GARDEN_STATUES.map(s=>s.name)).size/2)),cw=1024,ch=128,tx=new DynamicTexture('an-lien-garden-names',{width:cols*cw,height:rows*ch},this.scene,true),ctx=tx.getContext() as CanvasRenderingContext2D;ctx.fillStyle='#2a160d';ctx.fillRect(0,0,cols*cw,rows*ch);
  const mat=new StandardMaterial('an-lien-garden-nameplates',this.scene);mat.diffuseTexture=tx;mat.emissiveColor=new Color3(.55,.5,.4);mat.specularColor.setAll(.1);mat.backFaceCulling=true;this.ownMats.push(mat);
  const cells=new Map<string,number>();for(const s of ACTIVE_GARDEN_STATUES)if(!cells.has(s.name))cells.set(s.name,cells.size);const drawn=new Set<number>();
  ACTIVE_GARDEN_STATUES.forEach(s=>{const i=cells.get(s.name)!,col=i%cols,row=Math.floor(i/cols),x=col*cw,y=row*ch;if(!drawn.has(i)){drawn.add(i);ctx.strokeStyle='#caa35c';ctx.lineWidth=6;ctx.strokeRect(x+8,y+8,cw-16,ch-16);ctx.fillStyle='#f8dc91';ctx.textAlign='center';ctx.textBaseline='middle';let font=54;ctx.font='bold '+font+'px Segoe UI';while(ctx.measureText(s.name).width>cw-80&&font>24){font--;ctx.font='bold '+font+'px Segoe UI';}ctx.fillText(s.name,x+cw/2,y+ch/2+2,cw-60);}
   if((s.group==='axis'&&s.id==='019')||s.id==='new-18')return; // the Amitabha podium carries its own carved sign
   const w=s.group==='owner-hall'?Math.min(3,s.width!):s.group==='owner-court'?6:s.group==='owner-special'?(s.height>=30?16:6):s.group==='front-triad'?16:s.group==='owner'?(s.id==='owner-7'?18:7):s.group==='king'?16:s.group==='upper'?Math.min(5,UPPER_PLINTHS[s.id].r):s.group==='flank'?5:s.group==='avenue'?2.5:s.group==='bodhi'?3.6:3.4,plate=MeshBuilder.CreatePlane('garden-name-'+s.id,{width:w,height:w/8},this.scene),uv=plate.getVerticesData('uv')!;for(let k=0;k<uv.length;k+=2){uv[k]=(col+uv[k])/cols;uv[k+1]=1-(row+1-uv[k+1])/rows;}plate.setVerticesData('uv',uv);
   const off=s.group.startsWith('owner-')?s.depth!/2+.2:s.group==='front-triad'?s.depth!/2+.2:s.group==='owner'?(s.id==='owner-7'?10.3:5.1):s.group==='king'?FOUR_KINGS_PLINTH.half+.08:s.group==='upper'?UPPER_PLINTHS[s.id].r+.06:s.group==='bodhi'?BS.r+.06:s.group==='avenue'?GA.half+.07:s.group==='flank'?FP.plinth[0].r+.03:s.group==='axis'?MP.plinth[0].r+.03:s.head?1.32:2.16,yy=s.group.startsWith('owner-')?s.base+(s.group==='owner-hall'?.55:1.2):s.group==='front-triad'?2:s.group==='owner'?.4:s.group==='king'?1.5:s.group==='upper'?UPPER_FLOOR+UPPER_PLINTHS[s.id].h/UPPER_PLINTHS[s.id].tiers*.5:s.group==='bodhi'?BS.h*.55:s.group==='avenue'?GA.plinth*.5:s.group==='flank'?.65:s.group==='axis'?.5:s.head?.75:G.floor+G.plinth*.45;
   // Heavenly Kings stand on square, axis-aligned plinths: their plate sits flat on the plinth face toward the court (anh Thanh 2026-11-06: it was skewed, following the statue's turn)
   const py=s.group==='king'?Math.round(s.yaw/(Math.PI/2))*(Math.PI/2):s.yaw;
   plate.rotation.y=py+Math.PI;plate.position.set(this.at.x+s.x+Math.sin(py)*off,this.at.y+yy,this.at.z+s.z+Math.cos(py)*off);plate.material=mat;plate.isPickable=false;this.loose.push(plate);});
  tx.update();tx.anisotropicFilteringLevel=8;return tx;}
 update(p:{x:number;y?:number;z:number}){if(this.dead)return;const x=p.x-this.at.x,z=p.z-this.at.z,y=(p.y??this.at.y+2)-this.at.y;if(Math.hypot(x-this.last.x,z-this.last.z)<3)return;this.last.set(x,0,z);
  // Guardians are small and many: they switch to detail at roughly half the usual distance.
  for(const s of ACTIVE_GARDEN_STATUES)this.wanted.set(s.id,gardenLod(Math.hypot(x-s.x,z-s.z,Math.max(0,s.base-2-y,y-s.base-s.height))*(s.group==='avenue'?2:1),s.group==='front-triad'||(s.group==='owner-special'&&s.height===100)?40:s.height,this.low));
  // High detail is heavy: drop a model's container once no statue using it wants or shows it.
  for(const [key,c]of this.containers){if(!key.endsWith('-high'))continue;const asset=key.slice(0,-5),users=ACTIVE_GARDEN_STATUES.filter(s=>assetOf(s)===asset);if(users.every(s=>this.wanted.get(s.id)!=='high'&&this.shown.get(s.id)?.level!=='high')){c.dispose();this.containers.delete(key);}}
  for(const s of ACTIVE_GARDEN_STATUES){const want=this.wanted.get(s.id)!;if(this.containers.has(assetOf(s)+'-'+want))this.show(s,want);}
  void this.pump(x,z);}
 /** Loads one model at a time, nearest first; far shells for every statue come before any detail. */
 private async pump(x:number,z:number){if(this.pumping)return;this.pumping=true;try{while(!this.dead){
   const missing=ACTIVE_GARDEN_STATUES.map(s=>({s,a:assetOf(s),lod:this.wanted.get(s.id)!,d:Math.hypot(x-s.x,z-s.z)})).flatMap(e=>{const need:Level[]=e.lod==='far'?['far']:['far',e.lod];return need.filter(l=>!this.containers.has(e.a+'-'+l)&&!this.failed.has(e.a+'-'+l)).map(l=>({...e,l}));}).sort((a,b)=>(a.l==='far'?0:1)-(b.l==='far'?0:1)||a.d-b.d);
   const next=missing[0];if(!next)break;const key=next.a+'-'+next.l;
   try{const c=await LoadAssetContainerAsync(url(next.a,next.l),this.scene);if(this.dead){c.dispose();return;}this.containers.set(key,c);}catch(e){this.failed.add(key);console.warn('statue garden: missing',key,e);}
   for(const s of ACTIVE_GARDEN_STATUES.filter(s=>assetOf(s)===next.a)){const want=this.wanted.get(s.id)!;const best:Level=this.containers.has(next.a+'-'+want)?want:'far';if(this.containers.has(next.a+'-'+best))this.show(s,best);}
   x=this.last.x;z=this.last.z;}}finally{this.pumping=false;}}
 private show(s:GardenStatue,level:Level){const cur=this.shown.get(s.id);if(cur?.level===level)return;const c=this.containers.get(assetOf(s)+'-'+level);if(!c)return;
  const root=new TransformNode('garden-statue-'+s.id,this.scene),e=c.instantiateModelsToScene(n=>'garden-'+s.id+'-'+level+'-'+n,false);for(const r of e.rootNodes)r.parent=root;root.position.set(this.at.x+s.x,this.at.y+s.base,this.at.z+s.z);root.scaling.setAll(s.height);root.rotation.y=s.yaw;
  const meshes=root.getChildMeshes();for(const mm of meshes){mm.isPickable=false;mm.receiveShadows=false;
   // Untextured upper-shrine scans were gilded only by Sketchfab's viewer: give them the shrine gold.
   if(s.group==='front-triad')mm.material=this.triadGold;
   if(s.group==='front-triad'||s.asset?.startsWith('owner-collection20/'))mm.receiveShadows=false;
   // All owner-collection materials and textures stay as imported.
   if(s.group==='upper'&&mm.material instanceof PBRMaterial&&!mm.material.albedoTexture)mm.material=this.statueGold;}if(level!=='far'&&s.group!=='front-triad')this.cast(meshes);
  this.shown.set(s.id,{level,root,dispose:()=>{this.cast(meshes,true);e.dispose();root.dispose();}});cur?.dispose();}
 get review(){const levels={high:0,low:0,far:0};for(const v of this.shown.values())levels[v.level]++;return{statues:ACTIVE_GARDEN_STATUES.length,shown:this.shown.size,levels,failed:[...this.failed]};}
 dispose(){this.dead=true;for(const v of this.shown.values())v.dispose();this.shown.clear();for(const c of this.containers.values())c.dispose();this.containers.clear();this.cast(this.batch.meshes,true);this.batch.dispose();for(const mm of this.loose){const mat=mm.material;mm.dispose(false,false);if(mat instanceof StandardMaterial&&mat.name.startsWith('an-lien-sign-'))mat.dispose(false,true);}this.loose=[];this.rects.forEach(removeObstacle);this.rects=[];this.offSmoke.forEach(f=>f());this.offSmoke=[];this.ownMats.forEach(mm=>mm.dispose(false,true));this.pbr.dispose();this.statueGold.dispose();this.triadGold.dispose();this.atlas.dispose();}
}


