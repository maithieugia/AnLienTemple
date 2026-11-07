import {ACTIVE_GARDEN_STATUES,FOUR_KINGS,GUARDIAN_STATUES} from '../game/world/StatueGardenPlan.ts';
import {OWNER_COLLECTION} from '../game/world/OwnerCollectionPlan.ts';
import {SANCTUARY_STATUES,statuePlinth} from '../game/world/SanctuaryPlan.ts';
import {TALK_TEXTS} from './StatueTalkTexts.ts';

/**
 * Talks about the holy figures (anh Thanh 2026-11-05): near a statue the pilgrim can play a ~30 s recording on who that Buddha,
 * Bodhisattva or protector is and what their vow is (texts: authoring/talks/talks.json, audio: public/assets/talks/<id>.mp3,
 * read by the audiobook's female voice). Many statues share one figure, so they share one talk.
 */
export type TalkSpot={statue:string;name:string;talk:string;x:number;z:number;floor:number;reach:number};

/** Which talk a statue name belongs to (most specific first). */
export function talkFor(name:string,id=''):string|null{
 const n=name.normalize('NFC');
 if(/^g\d+[we]$/.test(id))return 'ho-phap-bat-bo';
 const rules:[RegExp,string][]=[
  [/Thiên Thủ/,'thien-thu-quan-am'],[/Đại Thế Chí/,'dai-the-chi'],[/Văn Thù/,'van-thu'],[/Phổ Hiền/,'pho-hien'],[/Địa Tạng/,'dia-tang'],
  [/Kim Cang Thủ/,'kim-cang-thu'],[/Hư Không Tạng/,'hu-khong-tang'],[/Trừ Cái Chướng/,'tru-cai-chuong'],[/Vô Tận Ý/,'vo-tan-y'],
  [/Dược Sư/,'duoc-su'],[/Tỳ Lô/,'ty-lo-gia-na'],[/Đại Nhật/,'dai-nhat'],[/A Súc/,'a-suc-be'],
  [/(Trì Quốc|Tăng Trưởng|Quảng Mục|Đa Văn) Thiên Vương/,'tu-thien-vuong'],[/Đại Phạm Thiên/,'dai-pham-thien'],[/Đế Thích/,'de-thich'],
  [/Ma Lợi Chi/,'ma-loi-chi'],[/Khổng Tước/,'khong-tuoc-minh-vuong'],[/Biện Tài/,'bien-tai-thien'],[/Cát Tường/,'cat-tuong-thien-nu'],
  [/khất thực/i,'phat-khat-thuc'],[/tưới sen/i,'bo-tat-tuoi-sen'],
  [/Quán Thế Âm|Quan Thế Âm|Quan Âm|Quán Âm/,'quan-am'],[/Di Lặc/,'di-lac'],[/A Di Đà/,'a-di-da'],[/Thích Ca/,'thich-ca'],
 ];
 for(const [re,t] of rules)if(re.test(n))return t;
 return null;
}

let cache:TalkSpot[]|undefined;
/** Every statue that has a talk, with where to stand to hear it. */
export function talkSpots():TalkSpot[]{
 if(cache)return cache;
 const out:TalkSpot[]=[],seen=new Set<string>();
 const add=(id:string,name:string,x:number,z:number,floor:number,height:number,fallback:string|null)=>{
  if(seen.has(id))return;seen.add(id);const talk=talkFor(name,id)??fallback;if(!talk||!TALK_TEXTS[talk])return;
  out.push({statue:id,name:name.split(' · ')[0],talk,x,z,floor,reach:/^g\d+[we]$/.test(id)?19:Math.max(6,Math.min(45,height*.7+4))});  // the protectors line the avenue 17 m from its centre
 };
 const main=SANCTUARY_STATUES.find(s=>s.id==='main-buddha');
 if(main)add('main-buddha','Đức Phật Thích Ca Mâu Ni',main.x,main.z+statuePlinth(main).rz+6,1.2,40,'thich-ca');
 for(const s of OWNER_COLLECTION)add(s.id,s.name,s.x,s.z,s.group==='owner-hall'?1.2:0,s.height,null);
 for(const s of [...FOUR_KINGS,...GUARDIAN_STATUES,...ACTIVE_GARDEN_STATUES])
  add(s.id,s.name,s.x,s.z,/^d0\d$/.test(s.id)?1.2:0,s.height,/Phật/.test(s.name)?'thich-ca':null);
 return cache=out;
}
/** The talk spot the pilgrim stands closest to (within its reach), if any. */
export function nearestTalk(x:number,y:number,z:number):TalkSpot|null{
 let best:TalkSpot|null=null,bd=Infinity;
 for(const s of talkSpots()){if(Math.abs(y-s.floor)>4)continue;const d=Math.hypot(x-s.x,z-s.z);if(d<s.reach&&d/s.reach<bd){bd=d/s.reach;best=s;}}
 return best;
}
export const talkUrl=(talk:string)=>(import.meta.env?.BASE_URL??'/')+'assets/talks/'+talk+'.mp3?v=1';
