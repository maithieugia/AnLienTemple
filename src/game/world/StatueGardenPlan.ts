import {SANCTUARY_LEVELS} from './SanctuaryPlan.ts';
import {OWNER_COLLECTION,NEW_GATE_MAITREYA}from './OwnerCollectionPlan.ts';
/** Outdoor statue garden of An Lien, built from the owner-chosen Sketchfab library (assets-src/buddha-library, 2026-10-31).
 * Metres, local to the campus. Pure data: no renderer, no save. Front of every statue is +Z at yaw 0.
 *
 * Axis (gate → hall): Tam quan → Di Lặc greets → open-air Amitabha between the two prayer wheels → main hall.
 * Flanks before the hall: Quan Âm (west) and Địa Tạng (east). Two roofed galleries along the side walls:
 * west = chư Phật, east = chư Bồ Tát / Di Lặc. Statue 059 (Tian Tan) is a hill-terrain scan, not a free-standing
 * statue, so it is kept out of the campus. */
export type GardenStatue={id:string;name:string;x:number;z:number;yaw:number;height:number;base:number;group:'axis'|'flank'|'west'|'east'|'avenue'|'bodhi'|'upper'|'king'|'owner'|'front-triad'|'owner-hall'|'owner-court'|'owner-special';width?:number;depth?:number;head?:boolean;/** asset folder under assets/sanctuary, default library/<id> */asset?:string};
export const FOUR_KINGS_COURT_CENTER={x:0,z:380};
export const FOUR_KINGS_PLINTH={half:20,height:3};
/** Owner-supplied four statues; do not infer canonical identity from an unnamed mesh. */
export const FOUR_KINGS:GardenStatue[]=[[-300,265],[300,265],[-300,495],[300,495]].map(([x,z],i)=>({id:'king-'+(i+1),name:['Đông Phương Trì Quốc Thiên Vương','Nam Phương Tăng Trưởng Thiên Vương','Tây Phương Quảng Mục Thiên Vương','Bắc Phương Đa Văn Thiên Vương'][i],asset:'four-kings/'+String(i+1).padStart(2,'0'),x,z,yaw:Math.atan2(-x,FOUR_KINGS_COURT_CENTER.z-z),height:50,base:FOUR_KINGS_PLINTH.height,group:'king'}));

export const AMITABHA_PLAZA={x:0,z:388,r:38,tiers:[{r:24,h:1.6},{r:19.5,h:1.6},{r:15.5,h:1.4}],lotus:.7};
export const AMITABHA_TOP=AMITABHA_PLAZA.tiers.reduce((s,t)=>s+t.h,0)+AMITABHA_PLAZA.lotus;
export const MAITREYA_PLAZA={x:0,z:492,r:13,plinth:[{r:5.6,h:1},{r:4.6,h:1}]};
export const FLANK_PLAZA={z:268,x:150,r:12,plinth:[{r:6,h:1.2},{r:5,h:1.2}]};
/** Gallery bays: columns at x=±338 (front) and ±376 (back), statue line ±358. */
export const STATUE_GALLERY={front:338,back:376,line:358,z0:248,z1:512,bays:13,eave:14.5,ridge:18,floor:.12,plinth:1.4,headPlinth:2.6};
export const galleryBayZ=(k:number)=>STATUE_GALLERY.z0+(k+.5)*(STATUE_GALLERY.z1-STATUE_GALLERY.z0)/STATUE_GALLERY.bays;
export const galleryColumnZ=(k:number)=>STATUE_GALLERY.z0+k*(STATUE_GALLERY.z1-STATUE_GALLERY.z0)/STATUE_GALLERY.bays;

const WEST:[string,string,number?][]=[['011','Phật ngồi thiền định'],['004','Phật đứng · Sukhothai',7],['034','Phật ngồi · Gandhara'],['013','Đầu Phật · Sukhothai'],['029','Phật ngồi · tượng bạc'],['017','Phật A Di Đà đứng',7.5],['012','Phật Sarnath · chuyển pháp luân'],['060','Phật ngồi · tượng sắt Hàn Quốc'],['041','Phật Rosehaugh'],['009','Đầu tượng bốn mặt thếp vàng'],['045','Phật ngồi · đồng cổ'],['022','Phật ngồi · y hồng'],['001','Phật ngồi đội mão báu']];
const EAST:[string,string,number?][]=[['023','Quan Âm ngồi tòa sen'],['027','Bồ Tát · Bảo tàng Philadelphia',7.5],['024','Bồ Tát Di Lặc · gỗ'],['035','Quan Âm đứng',7.5],['031','Tượng bán thân bốn mặt'],['003','Bồ Tát Quán Thế Âm · Khmer thế kỷ 11'],null as never,['014','Bồ Tát Di Lặc · chạm trắng',7],['025','Bồ Tát đứng · hào quang',7.5],['026','Bồ Tát Di Lặc · gỗ đứng'],['038','Quan Âm Awaji',7.5],['037','Tượng Phật màu Chonta'],['039','Tượng Phật màu Moloti']];
const HEADS=new Set(['009','013','031']);
/** East centre bay (index 6) holds the gallery altar instead of a statue. */
export const EAST_ALTAR_BAY=6;

export const GARDEN_STATUES:GardenStatue[]=[
 {id:'019',name:'Phật A Di Đà · đài lộ thiên',x:AMITABHA_PLAZA.x,z:AMITABHA_PLAZA.z,yaw:0,height:20,base:AMITABHA_TOP,group:'axis'},
 {id:'056',...NEW_GATE_MAITREYA,x:MAITREYA_PLAZA.x,z:MAITREYA_PLAZA.z,yaw:0,base:2,group:'axis'},
 {id:'010',name:'Quan Thế Âm Bồ Tát',x:-FLANK_PLAZA.x,z:FLANK_PLAZA.z,yaw:.3,height:16,base:2.4,group:'flank'},
 {id:'020',name:'Địa Tạng Bồ Tát · cầm tích trượng',x:FLANK_PLAZA.x,z:FLANK_PLAZA.z,yaw:-.3,height:10,base:2.4,group:'flank'},
 ...[[WEST,-1],[EAST,1]as const].flatMap(([list,side])=>(list as [string,string,number?][]).flatMap((e,k)=>{if(!e)return[];const [id,name,h]=e,head=HEADS.has(id);
  return[{id,name,x:(side as number)*STATUE_GALLERY.line,z:galleryBayZ(k),yaw:(side as number)<0?Math.PI/2:-Math.PI/2,height:head?3:(h??5.6),base:STATUE_GALLERY.floor+(head?STATUE_GALLERY.headPlinth:STATUE_GALLERY.plinth),group:(side as number)<0?'west' as const:'east' as const,...(head?{head:true}:{})}];})),
];

/** Sanjūsangen-dō 28 guardians by 觀山閱海Gwen&Rein (@apishkaede), CC BY-NC-ND 4.0: non-commercial, no shared
 * adaptations. Fine for anh Thanh's private builds; SET THIS TO false before any public or paid release. */
// Node plan tests have no Vite environment. Keep the layout available for them.
export const INCLUDE_NC_GUARDIANS=import.meta.env?.VITE_PUBLIC_BUILD!=='1';
// The public online build (VITE_PUBLIC_BUILD=1, chuaanlien.palo.io.vn) leaves the avenue plinths empty.
/** Two mirrored rows lining the central path from the gate inward (No.1 nearest the gate), facing the path. */
export const GUARDIAN_AVENUE={x:17,z0:553,z1:433,height:4.4,plinth:1.1,half:1.3};
export const GUARDIANS:[string,string][]=[['01','Mật Tích Kim Cang Sĩ'],['03','Ma Hầu La'],['04','Khẩn Na La'],['06','Càn Thát Bà'],['07','Tỳ Xá Xà'],['12','Đề Đầu Lại Tra Vương'],['13','Bà Tẩu Tiên'],['14','Đại Biện Công Đức Thiên'],['15','Đế Thích Thiên Vương'],['16','Đại Phạm Thiên Vương'],['17','Tỳ Lâu Lặc Xoa'],['18','Tỳ Lâu Bác Xoa'],['19','Tát Già Ma Hoà La'],['20','Ngũ Bộ Tịnh Cư'],['21','Kim Sắc Khổng Tước Vương'],['22','Thần Mẫu Nữ'],['23','Kim Tỳ La'],['24','Tất Bà Già La'],['28','Na La Diên Kiên Cố']];
export const guardianZ=(k:number)=>GUARDIAN_AVENUE.z0-k*(GUARDIAN_AVENUE.z0-GUARDIAN_AVENUE.z1)/(GUARDIANS.length-1);
export const GUARDIAN_STATUES:GardenStatue[]=INCLUDE_NC_GUARDIANS?[-1,1].flatMap(side=>GUARDIANS.map(([no,name],k)=>({id:`g${no}${side<0?'w':'e'}`,name,asset:'guardians/'+no,x:side*GUARDIAN_AVENUE.x,z:guardianZ(k),yaw:side<0?Math.PI/2:-Math.PI/2,height:GUARDIAN_AVENUE.height,base:GUARDIAN_AVENUE.plinth,group:'avenue' as const}))):[];
/** 'Meditating Buddha' by restore50 (Sketchfab, CC BY 4.0), seated before the trunk of the Bodhi tree (SANCTUARY_BODHI −90,280)
 * where its roots spread, facing the entrance like the Buddha's enlightenment under the Bodhi tree. */
export const BODHI_SHRINE={tree:{x:-90,z:280},x:-90,z:287,r:3,h:.6};
export const BODHI_STATUE:GardenStatue={id:'bodhi',name:'Phật Thích Ca thiền định dưới cội bồ đề',x:BODHI_SHRINE.x,z:BODHI_SHRINE.z,yaw:0,height:3.6,base:BODHI_SHRINE.h,group:'bodhi'};
/** Upper-floor shrine (thượng điện) in the column-free bay above the main Buddha, Diana123456 collection (CC BY 4.0).
 * Tiered like a Vietnamese altar: the great seated Buddha highest at the back, a standing Amitabha lower in front,
 * the two carved mandorla Buddhas either side, and a Quan Âm pair outermost (in the clear bays above the ground-floor Quan Âm). */
/** Legacy export name retained for save/site IDs; these six statues now stand on the side verandas. */
export const UPPER_FLOOR=SANCTUARY_LEVELS.floor;
export const UPPER_PLINTHS:Record<string,{r:number;h:number;tiers:number}>={d04:{r:9,h:4,tiers:3},d06:{r:3,h:1.2,tiers:1},d01:{r:4.5,h:2.4,tiers:2},d02:{r:4.5,h:2.4,tiers:2},d09:{r:4,h:2.4,tiers:2},d05:{r:3,h:2.4,tiers:2}};
const up=(id:string,name:string,x:number,z:number,yaw:number,height:number):GardenStatue=>({id,name,asset:'diana/'+id.slice(1),x,z,yaw,height,base:UPPER_FLOOR+UPPER_PLINTHS[id].h,group:'upper'});
export const UPPER_STATUES:GardenStatue[]=[
 up('d04','Phật Thích Ca · hiên tây',-310,-138,0,16),
 up('d06','Phật A Di Đà đứng · tiếp dẫn',310,-138,0,7),
 up('d01','Phật ngồi · hào quang gỗ chạm',-310,-66,0,10),
 up('d02','Phật ngồi · hào quang gỗ chạm',310,-66,0,10),
 up('d09','Quan Âm ngồi tòa sen',-310,78,0,9),
 up('d05','Quan Âm đứng',310,78,0,11),
];

/** Owner supplied November 3: right means east when entering toward the hall. */
export const OWNER_STATUES:GardenStatue[]=[
 ...[-220,-145,-70,70,145,220].map((x,i)=>({id:'owner-'+(i+1),name:['Phật A Di Đà','Phật Thích Ca Mâu Ni','Phật Dược Sư','Phật Tỳ Lô Giá Na','Phật Đại Nhật Như Lai','Phật A Súc Bệ'][i],asset:'courtyard-seven/'+String(i+1).padStart(2,'0'),x,z:520,yaw:Math.PI,height:10,base:.8,group:'owner' as const})),
 {id:'owner-7',name:'Nam Mô Bổn Sư Thích Ca Mâu Ni Phật',asset:'courtyard-seven/07',x:150,z:568,yaw:Math.PI,height:20,base:.8,group:'owner'},
];

/** Owner-requested giant golden group, mirrored to the west of the reclining Buddha. */
export const FRONT_TRIAD:GardenStatue[]=[
  {
    "id": "triad-guanyin",
    "name": "Quán Thế Âm Bồ Tát",
    "asset": "front-triad/02",
    "x": -181.75978037753129,
    "z": 568,
    "yaw": 0,
    "height": 50,
    "base": 0,
    "group": "front-triad",
    "width": 29.026333375774744,
    "depth": 25.60587203997089
  },
  {
    "id": "triad-shakyamuni",
    "name": "Phật Thích Ca Mâu Ni",
    "asset": "front-triad/01",
    "x": -150,
    "z": 568,
    "yaw": 0,
    "height": 50,
    "base": 0,
    "group": "front-triad",
    "width": 28.493227379287834,
    "depth": 25.29783329385945
  },
  {
    "id": "triad-ksitigarbha",
    "name": "Địa Tạng Vương Bồ Tát",
    "asset": "front-triad/03",
    "x": -118.5175494073195,
    "z": 568,
    "yaw": 0,
    "height": 50,
    "base": 0,
    "group": "front-triad",
    "width": 28.471673806073138,
    "depth": 26.146415805620222
  }
];

/** Everything the garden renders. */
export const ALL_GARDEN_STATUES:GardenStatue[]=[...GARDEN_STATUES,BODHI_STATUE,...UPPER_STATUES,...GUARDIAN_STATUES,...FOUR_KINGS,...OWNER_STATUES,...FRONT_TRIAD,...OWNER_COLLECTION];

/** Preserve the gallery source list/plinths, but hide its old statues pending replacement. */
export const OUTDOOR_GALLERY_STATUES_ENABLED=false;
export function gardenStatueEnabled(s:GardenStatue){return OUTDOOR_GALLERY_STATUES_ENABLED||(s.group!=='west'&&s.group!=='east');}
export const ACTIVE_GARDEN_STATUES=ALL_GARDEN_STATUES.filter(gardenStatueEnabled);

/** Distance-in-statue-heights LOD, so the 20 m Amitabha keeps detail from much further than a 5 m gallery figure. */
export function gardenLod(d:number,height:number,low:boolean):'high'|'low'|'far'{const k=d/Math.max(6,height);return k<(low?4:6.5)?'high':k<(low?16:24)?'low':'far';}

/** Ground kept free of benches, lanterns and garden trees. */
export function statueGardenReserved(x:number,z:number,margin=0){
 if(OWNER_COLLECTION.some(s=>{const c=Math.abs(Math.cos(s.yaw)),sn=Math.abs(Math.sin(s.yaw)),hx=(s.width*c+s.depth*sn)/2,hz=(s.width*sn+s.depth*c)/2;return Math.abs(x-s.x)<hx+3+margin&&Math.abs(z-s.z)<hz+3+margin;}))return true;
 if(FRONT_TRIAD.some(s=>Math.abs(x-s.x)<s.width!/2+2+margin&&Math.abs(z-s.z)<s.depth!/2+2+margin))return true;
 if(OWNER_STATUES.some(s=>Math.abs(x-s.x)<(s.id==='owner-7'?34:7)+margin&&Math.abs(z-s.z)<(s.id==='owner-7'?12:7)+margin))return true;
 if(FOUR_KINGS.some(s=>Math.hypot(x-s.x,z-s.z)<FOUR_KINGS_PLINTH.half*Math.SQRT2+3+margin))return true;
 if(Math.hypot(x-AMITABHA_PLAZA.x,z-AMITABHA_PLAZA.z)<AMITABHA_PLAZA.r+margin)return true;
 if(Math.hypot(x-MAITREYA_PLAZA.x,z-MAITREYA_PLAZA.z)<MAITREYA_PLAZA.r+margin)return true;
 if(Math.hypot(x-BODHI_SHRINE.x,z-BODHI_SHRINE.z)<BODHI_SHRINE.r+3+margin)return true;
 for(const s of [-1,1])if(Math.hypot(x-s*FLANK_PLAZA.x,z-FLANK_PLAZA.z)<FLANK_PLAZA.r+4+margin)return true;
 if(INCLUDE_NC_GUARDIANS&&Math.abs(Math.abs(x)-GUARDIAN_AVENUE.x)<GUARDIAN_AVENUE.half+1.5+margin&&z>GUARDIAN_AVENUE.z1-3-margin&&z<GUARDIAN_AVENUE.z0+3+margin)return true;
 if(Math.abs(x)>STATUE_GALLERY.front-12-margin&&z>STATUE_GALLERY.z0-6-margin&&z<STATUE_GALLERY.z1+6+margin)return true;
 return false;
}
export const gardenStatueById=(id:string)=>ACTIVE_GARDEN_STATUES.find(s=>s.id===id);
