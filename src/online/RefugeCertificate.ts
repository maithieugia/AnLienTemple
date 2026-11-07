import type {RefugeCertificate} from './RefugePlan.ts';
const xml=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]!));

/** Keep the supplied artwork unchanged. The personal fields and date sit on top of it. */
export function certificateSvg(c:RefugeCertificate,imageData:string){
 const parts=new Intl.DateTimeFormat('vi-VN',{day:'numeric',month:'numeric',year:'numeric',timeZone:'Asia/Ho_Chi_Minh'}).formatToParts(c.issued);
 const part=(key:string)=>parts.find(p=>p.type===key)?.value??'';
 const size=Math.min(30,Math.floor(665/(Math.max(1,[...c.name].length)*.63)));
 return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1536 1024" width="1536" height="1024" role="img" aria-label="Giấy chứng nhận quy y trong game">
 <defs><image id="art" width="1536" height="1024" xlink:href="${xml(imageData)}"/>
 <clipPath id="date"><rect x="1143" y="619" width="305" height="30"/></clipPath></defs>
 <use xlink:href="#art"/>
 <g clip-path="url(#date)"><use xlink:href="#art" transform="translate(0 33)"/></g>
 <g font-family="Georgia, 'Times New Roman', serif" fill="#5e230e">
 <text x="497" y="364" font-size="${size}" font-weight="bold">${xml(c.name)}</text>
 <text x="540" y="405" font-size="30" font-weight="bold">${xml(c.dharmaName)}</text>
 <text x="1155" y="640" font-size="22" font-style="italic">ngày ${part('day')} tháng ${part('month')} năm ${part('year')}</text>
 </g></svg>`;
}
