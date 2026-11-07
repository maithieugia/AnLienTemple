export type HairShape='high'|'low'|'twist'|'double'|'ponytail'|'braid';
export const AO_DAI_COLLECTION=[
 {id:'01',name:'Lam sen',coat:'#456b99',pants:'#f3ece0',hair:'#171411',style:'high',motif:'sen',accent:'#d8d5a5'},
 {id:'02',name:'Ngọc lan trắng',coat:'#eee7d8',pants:'#456b75',hair:'#2b1c18',style:'high',motif:'ngoc-lan',accent:'#69867c'},
 {id:'03',name:'Tím Huế',coat:'#6d4b87',pants:'#efe1c5',hair:'#3b241d',style:'high',motif:'lan',accent:'#d9c6da'},
 {id:'04',name:'Đào hồng',coat:'#d8999a',pants:'#fff4e4',hair:'#20191a',style:'high',motif:'dao',accent:'#f9e3b5'},
 {id:'05',name:'Trúc ngọc',coat:'#4c988c',pants:'#e5efdb',hair:'#604031',style:'high',motif:'truc',accent:'#c4d9af'},
 {id:'06',name:'Lụa vàng',coat:'#d7b65b',pants:'#5a6656',hair:'#171716',style:'high',motif:'lua',accent:'#7d7044'},
 {id:'07',name:'Gấm đỏ',coat:'#9b4050',pants:'#f6dcb7',hair:'#41261f',style:'high',motif:'gam',accent:'#e8c480'},
 {id:'08',name:'Sóng đêm',coat:'#283e62',pants:'#a0b5c2',hair:'#2c211b',style:'high',motif:'song',accent:'#9ebfc6'},
 {id:'09',name:'Cúc trà',coat:'#89654d',pants:'#ebdcc2',hair:'#6b4b30',style:'high',motif:'cuc',accent:'#e9d3a0'},
 {id:'10',name:'Thiên thanh',coat:'#a6c3d1',pants:'#f4f1e5',hair:'#211c20',style:'high',motif:'day-hoa',accent:'#527784'},
] as const satisfies readonly {id:string;name:string;coat:string;pants:string;hair:string;style:HairShape;motif:string;accent:string}[];
export type AoDaiLook=typeof AO_DAI_COLLECTION[number];
export const HAIR_LABELS:Record<HairShape,string>={high:'Tóc gốc',low:'Búi thấp',twist:'Búi xoắn',double:'Búi đôi',ponytail:'Đuôi ngựa',braid:'Tóc tết'};
