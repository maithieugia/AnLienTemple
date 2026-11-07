export const REFUGE_MERIT=1000;
export const REFUGE_STATION={x:16,y:1.2,z:6,monkZ:2,radius:2.2};
// Lời dẫn diễn đạt cho game Chùa An Liên, theo bố cục Tam Quy và Ngũ Giới.
const tamQuy=[
 'Con là {name}. Trước Tam Bảo, con xin phát nguyện suốt đời:',
 'Con xin quy y Phật, bậc giác ngộ viên mãn.',
 'Con xin quy y Pháp, con đường giúp con thấy rõ và chuyển hóa khổ đau.',
 'Con xin quy y Tăng, đoàn thể gìn giữ và thực hành Chánh Pháp.',
];
export const REFUGE_STEPS=[
 {title:'Lời thỉnh',seconds:17,lines:[
  'Nam mô Bổn Sư Thích Ca Mâu Ni Phật.',
  'Con là {name}. Hôm nay con thành tâm đến trước Tam Bảo, kính thỉnh sư thầy hướng dẫn con phát nguyện quy y.',
  'Con xin lắng lòng, chắp tay và thành kính đảnh lễ.',
 ]},
 {title:'Sám hối và phát tâm',seconds:16,lines:[
  'Con xin nhận biết những điều bất thiện đã làm qua thân, lời nói và ý nghĩ.',
  'Con thành tâm sám hối, nguyện sửa lỗi, nuôi lớn lòng từ và siêng làm việc lành.',
 ]},
 ...[1,2,3].map(n=>({title:'Tam Quy · Lần '+n+'/3',seconds:23,lines:tamQuy})),
 {title:'Tam Kết',seconds:18,lines:[
  'Con đã phát nguyện nương tựa Phật, Pháp và Tăng.',
  'Con nguyện ghi nhớ lời nguyện này trong đời sống hằng ngày, lấy trí tuệ và từ bi soi đường, kính trọng Tam Bảo và tinh tấn tu học.',
 ]},
 {title:'Năm giới · 1/5',seconds:10,lines:['Con nguyện tôn trọng sự sống, tránh sát sinh và nuôi dưỡng lòng thương đối với mọi loài.']},
 {title:'Năm giới · 2/5',seconds:10,lines:['Con nguyện không lấy của không được cho, biết tôn trọng tài sản của người khác và thực tập bố thí.']},
 {title:'Năm giới · 3/5',seconds:10,lines:['Con nguyện sống có trách nhiệm trong tình cảm, tránh tà hạnh và tôn trọng sự an lành của người khác.']},
 {title:'Năm giới · 4/5',seconds:10,lines:['Con nguyện tránh nói dối, gìn giữ lời nói chân thật, hòa nhã và có ích.']},
 {title:'Năm giới · 5/5',seconds:10,lines:['Con nguyện tránh rượu và các chất gây say nghiện, gìn giữ sự tỉnh thức cho mình và người chung quanh.']},
 {title:'Hồi hướng',seconds:12,lines:[
  'Con xin hướng mọi điều lành đến cha mẹ, người thân và tất cả chúng sinh. Nguyện mọi loài bớt khổ, được bình an và gặp duyên lành để tu học.',
  'Nam mô Bổn Sư Thích Ca Mâu Ni Phật.',
 ]},
];
export const nearRefuge=(p:{x:number;y:number;z:number})=>Math.abs(p.y-REFUGE_STATION.y)<.5&&Math.hypot(p.x-REFUGE_STATION.x,p.z-REFUGE_STATION.z)<=REFUGE_STATION.radius;
export type MeritRank={id:number;name:string;score:number};
export type RefugeGender='male'|'female';
export type RefugeCertificate={serial:string;name:string;dharmaName:string;issued:number};
export type RefugeCommand={t:'refuge';op:'cancel'}|{t:'refuge';op:'read';round:number}|{t:'refuge';op:'start';fullName:string;gender:RefugeGender};
export type RefugeUpdate=
 |{t:'refuge';phase:'reading';round:number;waitMs:number}
 |{t:'refuge';phase:'name';error?:string}
 |{t:'refuge';phase:'idle';error?:string}
 |{t:'refuge';phase:'complete';certificate:RefugeCertificate};
