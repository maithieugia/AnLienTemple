export const AVATAR_OPTIONS={
 faces:[{id:'minh',name:'Minh',en:'Minh'},{id:'angular',name:'Góc cạnh',en:'Angular'},{id:'soft',name:'Đầy đặn',en:'Fuller'}],
 outfits:[{id:'indigo',name:'Áo chàm · quần lửng kaki',en:'Indigo tee / khaki shorts'},{id:'moss',name:'Áo rêu · quần dài than',en:'Moss tee / charcoal trousers'},{id:'earth',name:'Dài tay nâu · quần dài xám',en:'Earth long sleeves / grey trousers'}],
 hair:[{id:'short',name:'Tóc ngắn',en:'Short hair'},{id:'long',name:'Tóc dài',en:'Long hair'},{id:'buns',name:'Búi tóc',en:'Hair bun'}],
} as const;
export interface AvatarProfile{version:2;face:'minh'|'angular'|'soft';outfit:'indigo'|'moss'|'earth';hair:'short'|'long'|'buns'}
export const DEFAULT_AVATAR:AvatarProfile={version:2,face:'minh',outfit:'indigo',hair:'short'};
export function sanitizeAvatar(value:unknown):AvatarProfile{const v=value as Partial<AvatarProfile>|null;return{version:2,face:AVATAR_OPTIONS.faces.some(x=>x.id===v?.face)?v!.face!:'minh',outfit:AVATAR_OPTIONS.outfits.some(x=>x.id===v?.outfit)?v!.outfit!:'indigo',hair:AVATAR_OPTIONS.hair.some(x=>x.id===v?.hair)?v!.hair!:'short'};}
let sessionAvatar:AvatarProfile|undefined;
export function readAvatar():AvatarProfile{if(sessionAvatar)return{...sessionAvatar};try{return sanitizeAvatar(JSON.parse(localStorage.getItem('vb_avatar_v2')??'null'));}catch{return{...DEFAULT_AVATAR};}}
export function saveAvatar(profile:AvatarProfile){sessionAvatar=sanitizeAvatar(profile);try{localStorage.setItem('vb_avatar_v2',JSON.stringify(sessionAvatar));return true;}catch{return false;}}
