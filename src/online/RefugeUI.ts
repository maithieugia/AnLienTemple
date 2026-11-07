import {REFUGE_MERIT,REFUGE_STEPS,type MeritRank,type RefugeCertificate,type RefugeCommand,type RefugeGender,type RefugeUpdate} from './RefugePlan';
import {certificateSvg} from './RefugeCertificate';

export function refugeUI(o:{score:()=>number;near:()=>boolean;start:()=>boolean;stop:()=>void;send:(m:RefugeCommand)=>void}){
 const button=document.createElement('button');button.type='button';button.textContent='Công đức · Quy y';
 const board=document.createElement('aside');board.id='al-merit-rank';board.setAttribute('aria-label','Ba người có công đức cao nhất');board.hidden=true;
 const dialog=document.createElement('dialog');dialog.id='al-refuge';dialog.setAttribute('aria-labelledby','al-refuge-title');
 dialog.innerHTML='<button class="close" aria-label="Đóng" type="button">×</button><h2 id="al-refuge-title"></h2><div class="body"></div>';
 const body=dialog.querySelector('.body')!,title=dialog.querySelector('h2')!;
 const css=document.createElement('style');css.textContent=`
 #al-merit-rank{position:fixed;right:12px;top:60px;z-index:6;width:min(210px,36vw);border:1px solid #8f733f;border-radius:10px;background:#211910e8;color:#ffe8b7;padding:9px 12px;font:12px system-ui;pointer-events:none;box-sizing:border-box}
 #al-merit-rank b{color:#f7cb76}#al-merit-rank ol{margin:5px 0 0;padding-left:19px}#al-merit-rank li{padding:2px 0}#al-merit-rank li span{display:inline-block;max-width:65%;vertical-align:bottom;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}#al-merit-rank strong{float:right}
 body.al-compact #al-merit-rank{top:max(60px,calc(env(safe-area-inset-top) + 46px));right:8px;padding:6px 8px}
 #al-refuge{width:min(620px,92vw);max-height:85dvh;box-sizing:border-box;overflow:auto;color:#ffedcb;background:#251b13;border:1px solid #bd9450;border-radius:18px;padding:24px;font:15px/1.55 system-ui;z-index:20}
 #al-refuge::backdrop{background:#0c090875}#al-refuge h2{margin:0 34px 14px 0;color:#ffd783;font:700 25px Georgia,serif}
 #al-refuge .close{float:right}#al-refuge button,#al-refuge input,#al-refuge a{font:inherit;padding:8px 12px;border-radius:8px;border:1px solid #a9844b;color:inherit;background:#533922}
 #al-refuge select{font:inherit;color:inherit;background:#533922;border:1px solid #a9844b;border-radius:8px;display:block;padding:8px 12px;margin:8px 0 12px}#al-refuge button:disabled{opacity:.55}#al-refuge input{box-sizing:border-box;display:block;width:100%;margin:8px 0 12px}#al-refuge blockquote{margin:10px 0 16px;border-left:2px solid #be9a59;padding-left:14px;color:#ffe3a5}
 #al-refuge.certificate{width:min(1200px,96vw);max-height:94dvh;text-align:center;padding:14px}#al-refuge svg{display:block;width:100%;height:min(72dvh,63vw);margin:8px 0 14px}`;
 document.head.append(css);document.body.append(board,dialog);
 let artwork:Promise<string>|undefined;
 const image=()=>artwork??=fetch(import.meta.env.BASE_URL+'assets/sanctuary/refuge/certificate.png').then(async response=>{
  if(!response.ok)throw new Error('certificate artwork');
  const blob=await response.blob();
  return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(blob);});
 }).catch(e=>{artwork=undefined;throw e;});
 let fullName='',gender:''|RefugeGender='',voice:SpeechSynthesisUtterance|undefined;
 let voicePending:(()=>void)|undefined;
 const synth=window.speechSynthesis;
 function stopVoice(){
  if(voicePending){synth?.removeEventListener('voiceschanged',voicePending);voicePending=undefined;}
  if(voice){voice=undefined;synth?.cancel();}
 }
 let rows:MeritRank[]=[],saved:RefugeCertificate|null=null,inRitual=false,timer=0,url='';
 const number=(n:number)=>n.toLocaleString('vi-VN');
 function text(s:string,tag='p'){const el=document.createElement(tag);el.textContent=s;body.append(el);return el;}
 function action(s:string,click:()=>void){const el=document.createElement('button');el.type='button';el.textContent=s;el.onclick=click;body.append(el);return el;}
 function paint(heading:string){window.clearTimeout(timer);stopVoice();dialog.classList.toggle('certificate',heading==='Giấy chứng nhận quy y');if(url){URL.revokeObjectURL(url);url='';}title.textContent=heading;body.replaceChildren();}
 function list(target:Element){
  const ol=document.createElement('ol');
  for(const r of rows){const li=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=r.name;score.textContent=number(r.score);li.append(name,' · ',score);ol.append(li);}
  if(rows.length)target.append(ol);else{const empty=document.createElement('p');empty.textContent='Chưa có điểm được ghi nhận.';target.append(empty);}
 }
 function rank(next:MeritRank[]){rows=next;const h=document.createElement('b');h.textContent='Top 3 công đức';board.replaceChildren(h);list(board);board.hidden=false;if(dialog.open&&!inRitual&&title.textContent==='Công đức và quy y')overview();}
 function overview(error?:string){
  paint('Công đức và quy y');list(body);text(`Công đức của anh/chị · ${number(o.score())} / 1.000`);
  if(error)text(error);
  if(saved){action('Giấy chứng nhận đã lưu',()=>showCertificate(saved!));return;}
  if(o.score()<REFUGE_MERIT){text('Đủ 1.000 điểm để mở nghi thức quy y trong game.');return;}
  if(!o.near()){text('Vào chánh điện, đi đến gần sư thầy gần lối giữa, trước tượng Phật chính. Tới nơi hãy mở lại mục này.');return;}
  action('Nhập thông tin quy y',()=>identity());
 }
 async function showCertificate(c:RefugeCertificate){
  paint('Giấy chứng nhận quy y');const loading=text('Đang tải mẫu giấy…');
  try{
   const svg=certificateSvg(c,await image());if(!loading.isConnected)return;loading.remove();body.insertAdjacentHTML('beforeend',svg);
   url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
   const a=document.createElement('a');a.href=url;a.download=c.serial+'-An-Lien.svg';a.textContent='Tải giấy chứng nhận';body.append(a);
  }catch{if(loading.isConnected){loading.textContent='Chưa tải được mẫu giấy.';action('Thử lại',()=>showCertificate(c));}}
 }
 function update(m:RefugeUpdate){
  if(m.phase==='complete'){saved=m.certificate;if(inRitual)o.stop();inRitual=false;if(dialog.open)showCertificate(saved);return;}
  if(m.phase==='idle'){if(inRitual)o.stop();inRitual=false;if(dialog.open)overview(m.error);return;}
  if(!inRitual||!dialog.open)return;
  if(m.phase==='reading'){
   const step=REFUGE_STEPS[m.round];if(!step)return;
   paint(step.title);text(`Phần ${m.round+1}/${REFUGE_STEPS.length} · Sư thầy mời anh/chị đọc chậm từng câu.`);
   const lines=step.lines.map(line=>line.replace('{name}',()=>fullName));
   const quote=text('','blockquote');for(const vow of lines){const line=document.createElement('div');line.textContent=vow;quote.append(line);}
   if(synth){
    const play=()=>{
     const vietnameseVoice=synth.getVoices().find(v=>v.lang.toLowerCase().startsWith('vi'));
     if(!vietnameseVoice)return false;
     stopVoice();
     const speech=voice=new SpeechSynthesisUtterance(lines.join(' '));
     speech.voice=vietnameseVoice;speech.lang=vietnameseVoice.lang;speech.rate=.8;
     speech.onerror=()=>{if(voice===speech)audioStatus.textContent='Chưa phát được giọng đọc. Anh/chị có thể bấm Nghe lại hoặc đọc theo chữ.';};
     audioStatus.textContent='';
     synth.speak(speech);return true;
    };
    action('Nghe lại',()=>{if(!play())audioStatus.textContent='Thiết bị chưa có giọng Việt. Anh/chị có thể đọc theo chữ.';});
    const audioStatus=text('');
    if(!play()){
     audioStatus.textContent='Chưa có giọng Việt. Anh/chị có thể đọc theo chữ.';
     voicePending=()=>{if(play())audioStatus.textContent='';};
     synth.addEventListener('voiceschanged',voicePending);
    }
   }
   const next=action('Đã đọc xong',()=>{next.disabled=true;o.send({t:'refuge',op:'read',round:m.round});});
   next.disabled=m.waitMs>0;timer=window.setTimeout(()=>{next.disabled=false;},m.waitMs);return;
  }
  if(inRitual)o.stop();inRitual=false;identity(m.error);
 }
 function identity(error?:string){
  paint('Thông tin trước lễ quy y');text('Nhập họ tên và chọn giới tính trước khi quỳ làm lễ. Họ tên sẽ xuất hiện trong lời thỉnh và trên giấy chứng nhận.');
  if(error)text(error);
  const form=document.createElement('form'),label=document.createElement('label'),input=document.createElement('input'),submit=document.createElement('button');
  label.textContent='Họ và tên';input.required=true;input.maxLength=64;input.autocomplete='name';input.value=fullName;label.append(input);
  const genderLabel=document.createElement('label'),select=document.createElement('select');
  genderLabel.textContent='Giới tính';select.required=true;select.add(new Option('Chọn giới tính',''));select.add(new Option('Nam','male'));select.add(new Option('Nữ','female'));select.value=gender;genderLabel.append(select);
  submit.textContent='Quỳ và bắt đầu lễ quy y';form.append(label,genderLabel,submit);body.append(form);
  form.onsubmit=e=>{e.preventDefault();fullName=input.value;if(select.value!=='male'&&select.value!=='female')return;
   gender=select.value;
   if(!o.start()){identity('Hãy đến sát vị trí hành lễ và chờ sư thầy sẵn sàng.');return;}
   inRitual=true;paint('Chuẩn bị hành lễ');text('Đang kết nối với chánh điện…');
   o.send({t:'refuge',op:'start',fullName,gender});};
 }
 button.onclick=()=>{overview();dialog.showModal();};
 dialog.querySelector<HTMLButtonElement>('.close')!.onclick=()=>dialog.close();
 dialog.onclose=()=>{if(inRitual){inRitual=false;o.send({t:'refuge',op:'cancel'});o.stop();}paint('');};
 return{button,rank,update,open:()=>dialog.open,ritual:()=>inRitual,refresh:()=>{if(dialog.open&&!inRitual&&title.textContent==='Công đức và quy y')overview();},
  restore:(c:RefugeCertificate|null)=>{saved=c;},disconnect:()=>update({t:'refuge',phase:'idle',error:'Đã mất kết nối. Hãy kết nối lại để tiếp tục.'}),
  dispose:()=>{window.clearTimeout(timer);stopVoice();if(url)URL.revokeObjectURL(url);board.remove();dialog.remove();css.remove();}};
}
