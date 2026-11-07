import {test} from 'node:test';import assert from 'node:assert/strict';import {existsSync} from 'node:fs';
import {talkSpots,talkFor,nearestTalk} from '../src/online/StatueTalks.ts';
import {TALK_TEXTS} from '../src/online/StatueTalkTexts.ts';
test('statues map to the right figure talk',()=>{
 assert.equal(talkFor('Đại Thế Chí Bồ Tát'),'dai-the-chi');assert.equal(talkFor('Thiên Thủ Thiên Nhãn Đại Bi Quán Âm'),'thien-thu-quan-am');assert.equal(talkFor('Quan Âm ngồi tòa sen'),'quan-am');
 assert.equal(talkFor('Địa Tạng Bồ Tát · cầm tích trượng'),'dia-tang');assert.equal(talkFor('Đông Phương Trì Quốc Thiên Vương'),'tu-thien-vuong');assert.equal(talkFor('Đế Thích Thiên Vương','g15w'),'ho-phap-bat-bo');
 assert.equal(talkFor('Phật A Di Đà đứng · tiếp dẫn'),'a-di-da');assert.equal(talkFor('Nam Mô Bổn Sư Thích Ca Mâu Ni Phật'),'thich-ca');
});
test('every talk is used, has text of about 30 s and a recording',()=>{
 const spots=talkSpots(),used=new Set(spots.map(s=>s.talk));assert.ok(spots.length>80,'spots '+spots.length);
 for(const [id,t] of Object.entries(TALK_TEXTS)){assert.ok(used.has(id),'unused talk '+id);const words=t.text.split(/\s+/).length;assert.ok(words>=60&&words<=120,id+' '+words+' words');assert.ok(existsSync(new URL('../public/assets/talks/'+id+'.mp3',import.meta.url)),'missing audio '+id);}
 const main=spots.find(s=>s.statue==='main-buddha')!;assert.equal(nearestTalk(main.x,1.2,main.z+3)?.talk,'thich-ca');assert.equal(nearestTalk(0,0,900),null);
});
