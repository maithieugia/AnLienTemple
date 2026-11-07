import {AO_DAI_COLLECTION} from '../game/chars/AoDaiCollectionPlan.ts';
/** Men (Nam 01 only): his áo lam and five plain colours */
const NAM:[string,string,string,string][]=[['nam-01-nau','Áo nâu sồng','#8a6a4c','#5e4733'],['nam-01-xam','Áo xám tro','#8f9194','#5d6064'],['nam-01-trang','Áo trắng ngà','#e4dccb','#b4ab96'],['nam-01-reu','Áo xanh rêu','#6c7b58','#4a5640'],['nam-01-dam','Áo lam đậm','#4a5c80','#313d57']];
const BASE=import.meta.env?.BASE_URL??'/';
export type OutfitChoice={id:string;name:string;bg:string};
/** Clothes a pilgrim can wear (shared by the in-game picker and the character creator). */
export function outfitChoices(female:boolean):OutfitChoice[]{
 return [...(female?AO_DAI_COLLECTION.map(l=>({id:'aodai-'+l.id,name:'Áo dài '+l.name,bg:`${l.coat} url(${BASE}assets/chars/ready-made/ao-dai-collection/pattern-${l.id}.svg)`})):
  [{id:'nam-01',name:'Áo tràng lam',bg:`#8a97a8 url(${BASE}assets/chars/ready-made/nam-01/thumb.jpg)`},...NAM.map(([id,name,a,b])=>({id,name,bg:`linear-gradient(160deg,${a},${b})`}))]),
  ...(female?[{id:'thuong',name:'Thường phục',bg:'#6b7280'}]:[])];
}
/** The outfit a new account starts in. */
export const defaultOutfit=(female:boolean)=>female?'aodai-01':'nam-01';
