import {randomInt} from 'node:crypto';
import type {RefugeGender} from '../src/online/RefugePlan.ts';

// Each row holds ten distinct Hán–Việt syllables. The rows group related qualities
// so a first word only combines with endings that fit its meaning and register.
const words=(s:string)=>s.trim().split(/\n/).map(row=>row.trim().split(/\s+/));
const maleFirst=words(`
Minh Trí Giác Ngộ Tri Kiến Liễu Đạt Quán Bác
Chân Chánh Chơn Định Tịnh Thanh Thiện Thuần Thiệt Chí
Pháp Đạo Kinh Giới Luật Thiền Tâm Đức Công Hạnh
Quang Nhật Dương Chiếu Huy Hoằng Quảng Đại Tế Hồng
Kiên Cương Nghị Dũng Lực Tấn Tiến Mạnh Hùng Uy
Tín Thành Trung Nghĩa Liêm Trực Kính Cẩn Đoan Hành
Nhân Từ Bi Ân Hiếu Hòa Nhẫn Khiêm Nhơn Dung
An Bình Thái Khang Hưng Vĩnh Trường Thường Hằng Hữu
Viên Toàn Mãn Bảo Phước Hải Sơn Phong Long Tùng
Thiên Đăng Khai Thông Năng Thắng Thạch Lâm Chấn Tông
`);
const maleLast=words(`
Trí Giác Ngộ Tri Kiến Minh Liễu Quán Chứng Đạt
Chân Chánh Chơn Định Tịnh Thanh Thiện Thuần Thiệt Chí
Đức Công Hạnh Tâm Pháp Đạo Kinh Giới Luật Thiền
Quang Nhật Dương Chiếu Huy Hoằng Quảng Đại Đăng Tế
Kiên Cương Nghị Dũng Lực Tấn Tiến Mạnh Hùng Uy
Tín Thành Trung Nghĩa Liêm Trực Kính Cẩn Hành Đoan
Nhân Từ Bi Ân Hiếu Hòa Nhẫn Khiêm Nhơn Dung
An Bình Thái Khang Hưng Vĩnh Trường Thường Hằng Hữu
Viên Toàn Mãn Bảo Phước Hải Sơn Phong Long Tùng
Khai Thông Năng Thắng Thạch Lâm Chấn Tông Thuận Thâm
`);
const femaleFirst=words(`
Diệu Từ Liên Tâm Như Thanh Tịnh An Thiện Hạnh
Tuệ Huệ Minh Giác Huân Trí Chân Chánh Quán Thường
Hương Chi Lan Mai Trúc Quỳnh Cúc Sen Đào Đan
Ngọc Châu Bảo Kim Ngân Lưu Ly Bích San Trân
Nguyệt Vũ Sương Lam Tuyền Tuyết Băng Khiết Hà Khánh
Nhã Uyển Nhu Hòa Dung Khiêm Hiền Thục Đoan Ý
Ái Ân Hiếu Nhân Bi Đức Mỹ Kính Nghi Hoan
Viên Mãn Bình Ninh Khang Thái Vĩnh Hằng Lạc Hy
Pháp Thiền Đạo Giới Hoa Tín Phước Cát Lành Phúc
Tú Nhuận Quang Ánh Chiếu Huyền Vi Vân Trinh Uyên
`);
const femaleLast=words(`
Tâm Hạnh Từ Thiện Liên Như Tịnh Thanh An Diệu
Tuệ Huệ Minh Giác Huân Trí Chân Chánh Quán Thường
Hương Chi Lan Mai Trúc Quỳnh Cúc Sen Đào Đan
Ngọc Châu Bảo Kim Ngân Lưu Ly Bích San Trân
Nguyệt Vân Sương Lam Vũ Tuyết Băng Khiết Hà Khánh
Nhã Uyển Nhu Hòa Dung Khiêm Hiền Thục Đoan Ý
Ái Ân Hiếu Nhân Bi Đức Mỹ Kính Nghi Hoan
Viên Mãn Bình Ninh Khang Thái Vĩnh Hằng Lạc Hy
Pháp Thiền Đạo Giới Hoa Tín Phước Cát Lành Phúc
Tú Nhuận Quang Ánh Chiếu Huyền Vi Trinh Uyên Tường
`);
const blocked=new Set(['Hữu Hạn','Thường Thức','Thiên Tai','Vĩnh Hằng','Tâm Thần','Nhân Công','Nhân Lực','Hùng Mạnh','Đại Nghĩa','Pháp Luật','Tín Dụng','Kinh Công','Cương Thi','Chí Tử','Tâm Tư','Cát Tường','Ly Tán','Thanh Lý','Đan Tâm','Thiện Mỹ','Túy Tâm','Hồng Hải','Thiên Ân','Liên Sen','Sen Liên','Liên Ly','Lành Đan','Chân Nhã','Nghị Huệ','Tín Kiên','Chí Giới','Quang Toàn','Thiên Chứng','Tâm Kinh','Đạo Luật','Giới Luật','Thiệt Hại','Minh Chứng','Đại Công','Thiên Tông','Chấn Tâm','Hữu Chứng','Pháp Kinh','Hành Luật','Pháp Công','Kinh Pháp','Đức Luật']);
const masculineCore=new Set('Liễu Chơn Thiệt Tế Hành Nhơn Chấn Tông Chứng Thuận Minh Trí Giác Chánh Pháp Đạo Thiền Đức Quang Huy Hoằng Quảng Kiên Cương Nghị Dũng Tấn Tín Trung Nghĩa Liêm Trực Khiêm Sơn Hải Phong Long Thạch Tùng Đạt Chí'.split(' '));
const feminineCore=new Set('Diệu Liên Như Hương Chi Lan Mai Quỳnh Cúc Sen Đào Đan Ngọc Châu Bích Trân Nguyệt Vân Sương Lam Tuyết Hà Nhã Uyển Dung Hiền Thục Ý Mỹ Nghi Hoan Hy Hoa Tú Ánh Huyền Vi Trinh Uyên'.split(' '));
const spiritual=new Set('Minh Trí Tuệ Huệ Giác Ngộ Chân Chánh Chính Định Tịnh Thanh Khiết Thiện Pháp Đạo Giới Thiền Tâm Đức Hạnh Quang Kiên Dũng Tấn Tín Nhân Từ Bi Ân Hiếu Hòa Nhẫn Dung Khiêm An Viên Mãn Bảo Liên Diệu Như Quán Phước Lành Phúc Lạc'.split(' '));
const compatible=[[1,2,3,8,9],[0,2,3,5,6],[0,1,3,4,5,6],[0,2,7,8],[0,2,3,5],[0,2,4,6],[0,1,2,7],[0,2,6,8],[0,1,2,7],[0,1,2,3]];
const femaleCompatible=[[1,2,3,4,5,6,7,9],[0,2,3,5],[0,1,5,8],[0,1,5,8],[0,1,5,7],[0,1,2,8],[0,1,2,5],[0,1,2,5],[0,1,2,5],[0,1,5,8]];
export const REFUGE_WORDS={
 male:{first:maleFirst.flat(),last:maleLast.flat()},
 female:{first:femaleFirst.flat(),last:femaleLast.flat()},
};
function pool(first:string[][],last:string[][],groups:number[][],style:Set<string>){
 return first.flatMap((row,i)=>row.flatMap(a=>groups[i].flatMap(j=>last[j].flatMap(b=>{
  const name=a+' '+b;
  return a!==b&&(style.has(a)||style.has(b))&&(spiritual.has(a)||spiritual.has(b))&&!blocked.has(name)?[name]:[];
 }))));
}
const malePool=pool(maleFirst,maleLast,compatible,masculineCore);
const maleNames=new Set(malePool);
export const REFUGE_NAMES={
 male:malePool,
 female:pool(femaleFirst,femaleLast,femaleCompatible,feminineCore).filter(n=>!maleNames.has(n)),
};
const choices=(gender:RefugeGender)=>REFUGE_WORDS[gender].first.map(first=>REFUGE_NAMES[gender].filter(name=>name.startsWith(first+' ')));
const byFirst={male:choices('male'),female:choices('female')};
export function assignRefugeName(gender:RefugeGender){
 const first=byFirst[gender],matches=first[randomInt(first.length)];
 return matches[randomInt(matches.length)];
}

