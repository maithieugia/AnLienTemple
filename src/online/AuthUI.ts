import {checkUsername,checkPassword,cleanDisplayName,type Merit,type Act} from './protocol';
import {outfitChoices,defaultOutfit} from './OutfitChoices';
import type {CharacterPreview} from './CharacterPreview';

export type Me={id:number;username:string;name:string;female:boolean;outfit?:string;merit:Merit};

const CSS=`#al-auth{position:fixed;inset:0;z-index:50;display:grid;place-items:center;background:radial-gradient(circle at 50% 30%,rgba(60,48,20,.55),rgba(8,12,11,.92));font:15px 'Segoe UI',sans-serif;color:#efe4c8;padding:16px}
#al-auth .card{width:min(400px,100%);background:rgba(24,30,27,.96);border:1px solid #9c8448;border-radius:14px;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
#al-auth h1{margin:0 0 4px;font-size:22px;letter-spacing:2px;color:#f3d48b;text-align:center}#al-auth .sub{text-align:center;margin:0 0 18px;color:#cdbf9c;font-size:13px}
#al-auth .tabs{display:flex;gap:6px;margin-bottom:16px}#al-auth .tabs button{flex:1;padding:9px;border-radius:8px;border:1px solid #6e6440;background:transparent;color:inherit;cursor:pointer;font:inherit}#al-auth .tabs button[aria-selected=true]{background:#8c6f2c;border-color:#c9a65a;color:#fff}
#al-auth label{display:block;font-size:13px;margin:10px 0 4px;color:#d9cba7}#al-auth input[type=text],#al-auth input[type=password]{width:100%;padding:11px 12px;border-radius:8px;border:1px solid #5d5a49;background:#101614;color:#fff;font:inherit;box-sizing:border-box}
#al-auth .gender{display:flex;gap:16px;margin-top:6px}#al-auth .gender label{display:flex;gap:6px;align-items:center;margin:0;font-size:14px}
#al-auth .go{width:100%;margin-top:18px;padding:12px;border:0;border-radius:9px;background:linear-gradient(#c79a3c,#9b7426);color:#fff;font:600 16px 'Segoe UI';cursor:pointer}#al-auth .go:disabled{opacity:.6}
#al-auth .err{min-height:20px;margin-top:10px;color:#ffb4a2;font-size:13px}#al-auth .hint{font-size:12px;color:#a9a08a;margin-top:4px}
#al-auth .cc{display:none}
#al-auth .card.create{box-sizing:border-box;width:min(920px,100%);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(270px,360px);gap:18px;align-items:start}
#al-auth .card.create .cc{display:flex;flex-direction:column;gap:9px;min-width:0}
#al-auth .view{position:relative;height:min(54vh,460px);border-radius:14px;overflow:hidden;border:1px solid rgba(201,154,62,.45);background:radial-gradient(ellipse 55% 45% at 50% 78%,rgba(255,196,92,.32),transparent 70%),radial-gradient(ellipse 60% 70% at 50% 40%,rgba(120,70,20,.45),transparent 75%),linear-gradient(#2c170a,#100703)}
#al-auth .view canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}
#al-auth .view .loading{position:absolute;inset:auto 0 46%;text-align:center;color:#f0d9a2;font-size:14px;text-shadow:0 1px 4px #000}
#al-auth .view .drag{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:12px;color:rgba(240,220,170,.75);pointer-events:none}
#al-auth .view .who{position:absolute;left:0;right:0;top:10px;text-align:center;font-size:17px;font-weight:600;color:#ffe7a6;text-shadow:0 1px 4px #000;pointer-events:none}
#al-auth .sexes{display:flex;gap:8px}#al-auth .sexes button,#al-auth .acts button{flex:1;padding:8px;border-radius:9px;border:1px solid #6e6440;background:rgba(40,26,14,.8);color:inherit;font:600 14px 'Segoe UI',sans-serif;cursor:pointer}
#al-auth .sexes button[aria-pressed=true],#al-auth .acts button[aria-pressed=true]{background:#8c6f2c;border-color:#e0bb68;color:#fff}
#al-auth .acts{display:flex;gap:6px}#al-auth .acts button{padding:5px 4px;font-size:12px;font-weight:500}
#al-auth .outfits{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 6px;scrollbar-width:thin}
#al-auth .outfits button{flex:0 0 auto;width:82px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 4px;border-radius:10px;border:1px solid #6f5a33;background:rgba(50,34,20,.85);color:#fff3d6;font:500 11px/1.2 'Segoe UI',sans-serif;cursor:pointer;text-align:center}
#al-auth .outfits button[aria-pressed=true]{border-color:#ffd47a;background:#7a5420;box-shadow:0 0 0 2px rgba(255,212,122,.35)}
#al-auth .outfits .sw{width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,230,170,.6);background-size:cover!important;background-position:center!important}
@media (max-width:700px){#al-auth .card.create{grid-template-columns:1fr;gap:10px}#al-auth .view{height:34vh;min-height:200px}}
@media (orientation:landscape) and (max-height:560px){#al-auth .card.create{grid-template-columns:minmax(0,1fr) minmax(250px,320px);gap:10px}#al-auth .card.create .cc{gap:5px}#al-auth .view{height:calc(100dvh - 200px);min-height:100px}#al-auth .sexes button{padding:4px}#al-auth .acts button{padding:3px}#al-auth .outfits{padding-bottom:3px}#al-auth .outfits button{width:62px;padding:3px;font-size:10px;gap:2px}#al-auth .outfits .sw{width:26px;height:26px}#al-auth .card.create .fields .sub{display:none}#al-auth .view .who{font-size:14px;top:6px}}
`;

async function api(path:string,body?:unknown){const r=await fetch(path,{method:body?'POST':'GET',credentials:'same-origin',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined});let data:any={};try{data=await r.json();}catch{}if(!r.ok)throw new Error(data.error??`Lỗi ${r.status}`);return data;}
export async function currentUser():Promise<Me|null>{try{return await api('/api/me');}catch{return null;}}
export async function logout(){try{await api('/api/logout',{});}catch{}}

/** Full-screen login / register card; resolves once the pilgrim has a session. */
export function askLogin(notice=''):Promise<Me>{
 return new Promise(resolve=>{
  const style=document.createElement('style');style.textContent=CSS;document.head.append(style);
  const root=document.createElement('div');root.id='al-auth';root.innerHTML=`<form class="card" novalidate>
   <div class="cc" aria-label="Tạo nhân vật"><div class="view"><canvas aria-label="Xem trước nhân vật (kéo để xoay)"></canvas><div class="loading">Đang thỉnh nhân vật…</div><div class="who"></div><div class="drag">Kéo để xoay nhân vật</div></div>
    <div class="sexes"><button type="button" data-f="0" aria-pressed="true">Nam</button><button type="button" data-f="1" aria-pressed="false">Nữ</button></div>
    <div class="outfits" role="group" aria-label="Trang phục"></div>
    <div class="acts" role="group" aria-label="Xem thử động tác"><button type="button" data-a="idle" aria-pressed="true">Đứng</button><button type="button" data-a="walk" aria-pressed="false">Đi</button><button type="button" data-a="bow" aria-pressed="false">Lạy</button><button type="button" data-a="incense" aria-pressed="false">Thắp hương</button></div></div>
   <div class="fields"><h1>Chùa Online An Liên</h1><p class="sub">Cùng nhau lễ Phật, cầu phúc · Nam mô A Di Đà Phật</p>
   <div class="tabs" role="tablist"><button type="button" role="tab" data-tab="login" aria-selected="true">Đăng nhập</button><button type="button" role="tab" data-tab="register" aria-selected="false">Tạo tài khoản</button></div>
   <label for="al-u">Tên đăng nhập</label><input id="al-u" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" required>
   <div class="reg" hidden><label for="al-n">Tên hiển thị (hiện trên đầu nhân vật)</label><input id="al-n" type="text" maxlength="24" autocomplete="nickname"><div class="hint">Ví dụ: Diệu Hạnh, Minh Tâm, Nguyễn An</div></div>
   <label for="al-p">Mật khẩu</label><input id="al-p" type="password" autocomplete="current-password" maxlength="72" required>
   <button class="go" type="submit">Vào chùa</button><div class="err" role="alert"></div></div></form>`;
  document.body.append(root);
  const form=root.querySelector('form')!,err=root.querySelector<HTMLElement>('.err')!,reg=root.querySelector<HTMLElement>('.reg')!,go=root.querySelector<HTMLButtonElement>('.go')!;
  const u=root.querySelector<HTMLInputElement>('#al-u')!,p=root.querySelector<HTMLInputElement>('#al-p')!,n=root.querySelector<HTMLInputElement>('#al-n')!;
  let mode:'login'|'register'='login';err.textContent=notice;
  // character creator (anh Thanh 2026-11-04): see the pilgrim, the body and the clothes in 3D before making the account
  let female=false,outfit=defaultOutfit(false),act:Act='idle',preview:CharacterPreview|undefined,previewing=false;
  const card=root.querySelector<HTMLElement>('.card')!,outfitRow=root.querySelector<HTMLElement>('.outfits')!,who=root.querySelector<HTMLElement>('.who')!,loading=root.querySelector<HTMLElement>('.loading')!;
  const label=()=>(outfitChoices(female).find(c=>c.id===outfit)?.name??'')+(n.value.trim()?' · '+n.value.trim():'');
  const paint=()=>{
   for(const b of root.querySelectorAll<HTMLButtonElement>('.sexes button'))b.setAttribute('aria-pressed',String((b.dataset.f==='1')===female));
   for(const b of root.querySelectorAll<HTMLButtonElement>('.acts button'))b.setAttribute('aria-pressed',String(b.dataset.a===act));
   outfitRow.innerHTML='';for(const c of outfitChoices(female)){const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(c.id===outfit));b.innerHTML=`<span class="sw" style="background:${c.bg}"></span>${c.name}`;b.onclick=()=>{outfit=c.id;paint();};outfitRow.append(b);}
   who.textContent=label();preview?.show(female,outfit,act);};
  for(const b of root.querySelectorAll<HTMLButtonElement>('.sexes button'))b.onclick=()=>{const f=b.dataset.f==='1';if(f!==female){female=f;outfit=defaultOutfit(f);}paint();};
  for(const b of root.querySelectorAll<HTMLButtonElement>('.acts button'))b.onclick=()=>{act=b.dataset.a as Act;paint();};
  n.addEventListener('input',()=>{who.textContent=label();});
  const openCreator=()=>{card.classList.add('create');paint();if(previewing)return;previewing=true;
   import('./CharacterPreview').then(m=>{if(!root.isConnected)return;preview=new m.CharacterPreview(root.querySelector('canvas')!);preview.show(female,outfit,act);return preview.ready.then(()=>{loading.hidden=true;});})
    .catch(e=>{console.warn('Xem trước nhân vật:',e);loading.textContent='Chưa xem trước được · vẫn tạo tài khoản bình thường';});};
  const done=()=>{preview?.dispose();preview=undefined;root.remove();style.remove();};
  for(const b of root.querySelectorAll<HTMLButtonElement>('.tabs button'))b.onclick=()=>{mode=b.dataset.tab as typeof mode;for(const x of root.querySelectorAll('.tabs button'))x.setAttribute('aria-selected',String(x===b));reg.hidden=mode!=='register';if(mode==='register')openCreator();else card.classList.remove('create');p.autocomplete=mode==='register'?'new-password':'current-password';go.textContent=mode==='register'?'Tạo tài khoản và vào chùa':'Vào chùa';err.textContent='';};
  form.onsubmit=async e=>{e.preventDefault();err.textContent='';const username=u.value.trim().toLowerCase();
   const problem=checkUsername(username)??checkPassword(p.value)??(mode==='register'&&!cleanDisplayName(n.value)?'Tên hiển thị 2–24 ký tự, không dùng ký tự lạ':null);if(problem){err.textContent=problem;return;}
   go.disabled=true;try{const me=mode==='login'?await api('/api/login',{username,password:p.value}):await api('/api/register',{username,password:p.value,displayName:n.value,female,outfit});done();resolve(me);}
   catch(x){err.textContent=(x as Error).message;}finally{go.disabled=false;}};
  u.focus();
 });
}
