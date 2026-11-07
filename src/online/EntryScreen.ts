import type {Scene} from '@babylonjs/core';
import {currentUser,askLogin,type Me} from './AuthUI';
import {switchQuality,type QualityChoice} from './Quality';

/**
 * The online entry screen (anh Thanh 2026-11-03; background 2026-11-04): no list of buildings on arrival. The golden seated
 * Buddha (anh Thanh's picture) in a slow ray halo, "Chùa Online An Liên" in brush calligraphy (Water Brush, OFL),
 * and three incense sticks in a censer as the loading bar: lit at the tip, they burn DOWN as the temple loads, and the burnt
 * part stays as grey ash that slowly bends and curls round. When loading ends, "Vào chùa" appears (that click also unlocks sound).
 */
const BASE=import.meta.env.BASE_URL;
const FONT=BASE+'assets/fonts/water-brush/';
const CSS=`
@font-face{font-family:'An Lien Brush';font-style:normal;font-weight:400;font-display:swap;src:url(${FONT}vietnamese.woff2) format('woff2');unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}
@font-face{font-family:'An Lien Brush';font-style:normal;font-weight:400;font-display:swap;src:url(${FONT}latin-ext.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'An Lien Brush';font-style:normal;font-weight:400;font-display:swap;src:url(${FONT}latin.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
body.al-entry header,body.al-entry footer,body.al-entry nav{display:none!important}
#al-entry{--gold:#f2cf7a;--gold2:#c99a3e;--bh:min(90vh,calc(100vw / .5628));position:fixed;inset:0;z-index:40;overflow:hidden;color:#f3e6c6;font:15px 'Segoe UI',sans-serif;background:radial-gradient(ellipse 70% 75% at 50% 52%,#6a3c0a 0%,#3a1f05 42%,#1c0d03 72%,#0d0602 100%);transition:opacity 1.2s ease}
#al-entry.out{opacity:0;pointer-events:none}
/* background (anh Thanh 2026-11-04): the golden seated Buddha, a slow ray halo and rising motes of light */
#al-entry .rays{position:absolute;left:50%;top:calc(100% - var(--bh) * .78);width:190vmax;height:190vmax;margin:-95vmax 0 0 -95vmax;background:repeating-conic-gradient(from 0deg,rgba(255,214,120,.10) 0 4deg,rgba(255,214,120,0) 4deg 12deg);-webkit-mask:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 26%,transparent 46%);mask:radial-gradient(circle,#000 8%,rgba(0,0,0,.5) 26%,transparent 46%);animation:alSpin 140s linear infinite}
@keyframes alSpin{to{transform:rotate(360deg)}}
#al-entry .glow{position:absolute;inset:0;background:radial-gradient(ellipse 34% 42% at 50% calc(100% - var(--bh) * .66),rgba(255,206,96,.45),rgba(255,170,60,.12) 55%,transparent 75%);animation:alBreath 7s ease-in-out infinite alternate}
@keyframes alBreath{from{opacity:.75}to{opacity:1}}
#al-entry .bg{position:absolute;left:50%;bottom:0;height:var(--bh);aspect-ratio:941/1672;transform:translateX(-50%);background:url(${BASE}assets/ui/entry-buddha.jpg) center/cover no-repeat;
 -webkit-mask:radial-gradient(ellipse 64% 58% at 50% 46%,#000 62%,transparent 100%),linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);-webkit-mask-composite:source-in;
 mask:radial-gradient(ellipse 64% 58% at 50% 46%,#000 62%,transparent 100%),linear-gradient(90deg,transparent,#000 14%,#000 86%,transparent);mask-composite:intersect;filter:saturate(1.05);animation:alRise 2.4s ease-out both}
@keyframes alRise{from{opacity:0;transform:translateX(-50%) translateY(2%) scale(.98)}to{opacity:1;transform:translateX(-50%)}}
#al-entry .motes{position:absolute;inset:0;pointer-events:none}
#al-entry .motes i{position:absolute;bottom:-10px;width:5px;height:5px;border-radius:50%;background:radial-gradient(circle,#fff2c4,rgba(255,200,90,0) 70%);animation:alMote 14s linear infinite;opacity:0}
@keyframes alMote{0%{transform:translateY(0);opacity:0}12%{opacity:.9}100%{transform:translate(30px,-105vh);opacity:0}}
#al-entry .shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,6,2,.72) 0%,rgba(14,6,2,.15) 24%,rgba(14,6,2,0) 50%,rgba(14,6,2,.35) 72%,rgba(10,4,1,.9) 100%),radial-gradient(ellipse 80% 90% at 50% 50%,transparent 55%,rgba(6,2,0,.6) 100%)}
#al-entry .mist{position:absolute;left:-20%;right:-20%;bottom:0;height:30vh;background:radial-gradient(ellipse 50% 60% at 30% 100%,rgba(255,220,150,.14),transparent 70%),radial-gradient(ellipse 45% 50% at 75% 100%,rgba(255,220,150,.10),transparent 70%);animation:alMist 18s ease-in-out infinite alternate}
@keyframes alMist{from{transform:translateX(-4%)}to{transform:translateX(4%)}}
#al-entry .stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;padding:clamp(12px,4vh,44px) 16px clamp(44px,8vh,80px)}
#al-entry h1{margin:0;font:400 clamp(48px,9vw,118px)/1 'An Lien Brush',cursive;text-align:center;color:var(--gold);text-shadow:0 2px 0 #6b3d10,0 0 26px rgba(0,0,0,.6),0 0 28px rgba(255,190,90,.35);letter-spacing:1px}
#al-entry .sub{margin:.12em 0 0;font:400 clamp(24px,3.6vw,38px)/1.1 'An Lien Brush',cursive;color:#f6e3b4;text-shadow:0 2px 10px #000}
#al-entry .incense{position:relative;flex:0 1 auto;height:min(40vh,420px);min-height:120px;aspect-ratio:200/516;margin-top:auto}
#al-entry .incense svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 6px 10px rgba(0,0,0,.6))}
#al-entry .smoke{position:absolute;width:2px;height:2px}
#al-entry .smoke i{position:absolute;left:-20px;bottom:0;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,rgba(240,240,245,.75),rgba(240,240,245,0) 70%);animation:alSmoke 5.5s linear infinite}
#al-entry .smoke i:nth-child(2){animation-delay:-1.8s}#al-entry .smoke i:nth-child(3){animation-delay:-3.6s}
@keyframes alSmoke{0%{transform:translate(0,0) scale(.25);opacity:0}15%{opacity:.8}60%{transform:translate(16px,-150px) scale(1.6)}100%{transform:translate(-12px,-270px) scale(2.7);opacity:0}}
#al-entry .ember{animation:alGlow 1.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes alGlow{50%{transform:scale(1.3);opacity:.85}}
#al-entry .status{margin:10px 0 4px;font:400 clamp(26px,3.4vw,36px)/1 'An Lien Brush',cursive;color:#f6dfa6;min-height:1.1em;text-align:center;text-shadow:0 2px 8px #000}
#al-entry .stage-label{font-size:13px;letter-spacing:.5px;color:#e2d1a8;min-height:18px;text-align:center;text-shadow:0 1px 4px #000}
#al-entry .enter{margin:12px 0 0;padding:8px 38px 12px;border:1px solid var(--gold2);border-radius:999px;background:linear-gradient(#7a1d12,#4c100a);color:#ffe7a8;font:400 34px/1.1 'An Lien Brush',cursive;cursor:pointer;box-shadow:0 0 0 4px rgba(201,154,62,.15),0 10px 30px rgba(0,0,0,.45);opacity:0;transform:translateY(8px);transition:opacity .8s,transform .8s;pointer-events:none}
#al-entry.done .enter{opacity:1;transform:none;pointer-events:auto}
#al-entry .enter:hover,#al-entry .enter:focus-visible{background:linear-gradient(#8f2416,#5a140c);outline:none;box-shadow:0 0 0 4px rgba(242,207,122,.35),0 10px 30px rgba(0,0,0,.45)}
#al-entry .verse{position:absolute;left:0;right:0;bottom:clamp(10px,2.4vh,22px);text-align:center;font:400 clamp(20px,2.6vw,28px)/1.2 'An Lien Brush',cursive;color:#eadbb8;opacity:.9;transition:opacity 1s;padding:0 16px;text-shadow:0 2px 6px #000}
#al-entry.done .verse{opacity:0!important}
#al-entry .gfx{position:absolute;right:12px;top:12px;z-index:2;display:flex;gap:6px;align-items:center;font-size:12px;color:#e8d9b2;text-shadow:0 1px 3px #000}#al-entry .gfx select{font:12px 'Segoe UI',sans-serif;color:#fff3d6;background:rgba(30,18,12,.85);border:1px solid #9c7a3a;border-radius:6px;padding:4px 6px}#al-entry .gfx small{opacity:.8;max-width:240px}
@media (max-width:860px){#al-entry .gfx{top:8px;right:8px}#al-entry .gfx small{display:none}}
#al-entry .err{color:#ffb4a2;font-size:14px;margin-top:10px;text-align:center;max-width:520px;text-shadow:0 1px 4px #000}
/* the login card sits beside the incense on wide screens, below the title on phones */
body.al-entry #al-auth{background:transparent;z-index:45;justify-items:end;align-items:end;padding:0 max(16px,6vw) max(18px,7vh) 16px}
body.al-entry #al-auth .card{background:linear-gradient(180deg,rgba(40,18,12,.94),rgba(22,12,9,.94));border:1px solid #b88a3a;box-shadow:0 0 0 1px rgba(242,207,122,.18) inset,0 24px 70px rgba(0,0,0,.6);max-height:calc(100dvh - 24px);overflow:auto}
body.al-entry #al-auth h1{font:400 38px/1.05 'An Lien Brush',cursive;white-space:nowrap;letter-spacing:0;color:#f2cf7a;text-shadow:0 2px 0 #5a300c}
body.al-entry #al-auth .sub{font:400 20px/1.2 'An Lien Brush',cursive;color:#efd9a6}
body.al-entry #al-auth .go{background:linear-gradient(#a52a17,#6c160c);font:400 28px/1.1 'An Lien Brush',cursive;padding:8px 12px 10px}
body.al-entry.al-auth-open #al-entry :is(.incense,.status,.stage-label,.enter,.err){transform:translateX(-22vw);transition:transform .8s ease}
@media (max-width:860px){body.al-entry #al-auth{justify-items:center;align-items:end;padding:0 12px 14px}body.al-entry.al-auth-open #al-entry :is(.incense,.status,.stage-label,.enter,.err){transform:none}body.al-entry.al-auth-open #al-entry :is(.incense,.status,.stage-label,.verse){display:none}}
@media (orientation:landscape) and (max-height:560px){
 #al-entry{--bh:100vh}
 #al-entry .stage{padding:8px 16px 10px}
 #al-entry h1{font-size:clamp(28px,12vh,64px)}#al-entry .sub{font-size:clamp(15px,5.5vh,26px)}
 #al-entry .incense{height:38vh;min-height:0}
 #al-entry .status{margin:4px 0 2px;font-size:clamp(17px,6vh,26px)}#al-entry .stage-label{font-size:11px;min-height:14px}
 #al-entry .enter{margin-top:6px;padding:4px 26px 7px;font-size:clamp(20px,7vh,30px)}
 #al-entry .verse{display:none}
 #al-entry .gfx small{display:none}
 body.al-entry #al-auth{justify-items:end;align-items:center;padding:8px max(12px,3vw) 8px 8px}
 body.al-entry #al-auth .card{max-height:calc(100dvh - 16px);width:min(340px,42vw);padding:12px 16px}
 body.al-entry #al-auth h1{font-size:26px}body.al-entry #al-auth .sub{font-size:14px;margin-bottom:8px}
 body.al-entry #al-auth .tabs{margin-bottom:6px}body.al-entry #al-auth .tabs button{padding:5px}
 body.al-entry #al-auth label{margin:5px 0 2px;font-size:12px}
 body.al-entry #al-auth input[type=text],body.al-entry #al-auth input[type=password]{padding:7px 10px}
 body.al-entry #al-auth .go{margin-top:10px;padding:4px 10px 6px;font-size:22px}body.al-entry #al-auth .err{min-height:0;margin-top:4px}
 body.al-entry.al-auth-open #al-entry .bg{margin-left:-22vw}body.al-entry.al-auth-open #al-entry .rays{left:28%}body.al-entry.al-auth-open #al-entry .glow{transform:translateX(-22vw)}
 body.al-entry.al-auth-open #al-entry :is(.incense,.status,.stage-label,.err){display:block;transform:translateX(-22vw)}
 body.al-entry.al-auth-open #al-entry .enter{transform:translateX(-22vw)}
 body.al-entry.al-auth-open #al-entry :is(h1,.sub){transform:translateX(-22vw);transition:transform .8s ease}
}
/* character creator: the card widens and comes to the middle */
body.al-entry #al-auth:has(.card.create){justify-items:center;align-items:center;padding:12px}
body.al-entry #al-auth .card.create{width:min(920px,calc(100vw - 24px))}
@media (prefers-reduced-motion:reduce){#al-entry *{animation:none!important;transition:none!important}}
`;

// The censer at the foot of the sticks (viewBox units: the whole picture is 200 x 516).
const CENSER=`<g transform="translate(25 420)"><defs><linearGradient id="alBronze" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4a1c"/><stop offset=".45" stop-color="#e3b862"/><stop offset=".6" stop-color="#b78838"/><stop offset="1" stop-color="#4f3412"/></linearGradient></defs>
<path d="M30 18 Q14 18 14 30 Q14 40 26 40" fill="none" stroke="url(#alBronze)" stroke-width="5"/><path d="M120 18 Q136 18 136 30 Q136 40 124 40" fill="none" stroke="url(#alBronze)" stroke-width="5"/>
<path d="M24 16 H126 Q128 22 124 26 Q122 58 98 70 H52 Q28 58 26 26 Q22 22 24 16Z" fill="url(#alBronze)"/>
<path d="M44 40 Q60 48 75 40 Q90 48 106 40" fill="none" stroke="#6b4a1c" stroke-width="2"/>
<path d="M50 68 L44 90 H54 L60 70Z M100 68 L106 90 H96 L90 70Z M70 70 H80 L79 92 H71Z" fill="url(#alBronze)"/></g>`;
const ASH_RIM=`<ellipse cx="100" cy="436" rx="51" ry="6" fill="#3a2614"/><ellipse cx="100" cy="436" rx="44" ry="4" fill="#857c70"/>`;

/** Three sticks fanned in the censer: lean (radians), length, burn rate relative to the bar, and which way the ash curls. */
const STICKS=[{lean:-.16,len:330,rate:.93,curl:-1},{lean:0,len:372,rate:1,curl:1},{lean:.16,len:330,rate:.96,curl:1}];
const ROOT={x:100,y:440},BAND=.11,MAX_BURN=.8;
/** Points of a stick's ash: it leaves the ember along the stick and bends more and more the longer it gets, curling round. */
export function ashCurl(ex:number,ey:number,lean:number,length:number,side:number){
 const pts:[number,number][]=[[ex,ey]];if(length<.5)return pts;const n=Math.max(4,Math.ceil(length/3)),ds=length/n;let a=lean,x=ex,y=ey;
 for(let i=1;i<=n;i++){const s=i*ds;a+=side*ds*(.004+s*.00042);x+=Math.sin(a)*ds;y-=Math.cos(a)*ds;pts.push([x,y]);}
 return pts;
}
function sticksSvg(burn:number[]){
 let out='';const embers:[number,number][]=[];
 STICKS.forEach((s,i)=>{const dx=Math.sin(s.lean),dy=-Math.cos(s.lean),b=Math.min(MAX_BURN,Math.max(.015,burn[i])),body=s.len*(1-b),ex=ROOT.x+dx*body,ey=ROOT.y+dy*body;embers.push([ex,ey]);
  const ash=ashCurl(ex,ey,s.lean,s.len*b*.92,s.curl).map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  const bx=ROOT.x+dx*s.len*BAND,by=ROOT.y+dy*s.len*BAND;
  out+=`<path d="M${ash}" fill="none" stroke="#a9a196" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`+
   `<path d="M${ash}" fill="none" stroke="#6f685f" stroke-width="8" stroke-dasharray="1.4 4.2" stroke-linecap="butt"/>`+
   `<path d="M${ash}" fill="none" stroke="#d6d0c6" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`+
   `<line x1="${ROOT.x}" y1="${ROOT.y}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#7c2416" stroke-width="9"/>`+
   `<line x1="${ROOT.x}" y1="${ROOT.y}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#c4432a" stroke-width="3" opacity=".75"/>`+
   `<line x1="${bx.toFixed(1)}" y1="${by.toFixed(1)}" x2="${(bx+dx*12).toFixed(1)}" y2="${(by+dy*12).toFixed(1)}" stroke="#e7c06a" stroke-width="8"/>`+
   `<circle class="ember" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="7" fill="url(#alEmber)"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="3.4" fill="#ffd27a"/>`;});
 return{svg:out,embers};
}

const VERSES=['Một nén tâm hương dâng lên chư Phật','Tâm an thì cảnh an','Bước chậm · thở sâu · lòng nhẹ nhàng','Nam Mô A Di Đà Phật','Hoa sen nở giữa bùn mà chẳng nhiễm bùn'];
// Loading milestones: the sticks burn toward each cap while that stage runs, so they never sit still.
const CAPS={boot:52,scene:62,online:88,ready:100} as const;
type Stage=keyof typeof CAPS;
const LABELS:Record<Stage|'login',string>={boot:'Đang dựng chánh điện và thỉnh tượng Phật…',scene:'Đang mở cổng tam quan…',login:'Mời quý Phật tử đăng nhập',online:'Đang chuẩn bị y áo cho Phật tử…',ready:'Hương đã dâng · mời vào chùa'};

export type Entry={me:Promise<Me>;stage:(s:Stage)=>void;started:(scene:Scene)=>Promise<void>;fail:(msg:string)=>void};

export function showEntry(gfx?:{quality:'high'|'low';choice:QualityChoice;reasons:string[]}):Entry{
 document.body.classList.add('al-entry');document.title='Chùa Online An Liên';
 const style=document.createElement('style');style.textContent=CSS;document.head.append(style);
 const root=document.createElement('div');root.id='al-entry';root.setAttribute('role','dialog');root.setAttribute('aria-label','Vào Chùa Online An Liên');
 root.innerHTML=`<div class="rays"></div><div class="glow"></div><div class="bg"></div><div class="motes">${Array.from({length:18},(_,i)=>`<i style="left:${(i*53%100)}%;animation-delay:${-(i*1.7%14).toFixed(1)}s;animation-duration:${11+i%5*2}s"></i>`).join("")}</div><div class="shade"></div><div class="mist"></div>
 <div class="stage"><h1>Chùa Online An Liên</h1><p class="sub">Nam Mô A Di Đà Phật</p>
  <div class="incense" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Đang tải chùa">
   <svg viewBox="0 0 200 516" aria-hidden="true"><defs><radialGradient id="alEmber"><stop offset="0" stop-color="#fff3b8"/><stop offset=".45" stop-color="#ff8a34"/><stop offset="1" stop-color="#ff5a1e" stop-opacity="0"/></radialGradient></defs>${ASH_RIM}<g class="sticks"></g>${CENSER}</svg>
   ${STICKS.map(()=>'<div class="smoke"><i></i><i></i><i></i></div>').join('')}</div>
  <div class="status">Đang dâng hương · 0%</div><div class="stage-label"></div><button class="enter" type="button">Vào chùa</button><div class="err" role="alert"></div></div>
 <div class="verse">${VERSES[0]}</div>${gfx?`<label class="gfx">Đồ họa <select aria-label="Chất lượng đồ họa"><option value="auto">Tự động (${gfx.choice==='auto'?(gfx.quality==='high'?'đang Cao':'đang Nhẹ'):'theo máy'})</option><option value="high">Cao</option><option value="low">Nhẹ · máy yếu</option></select>${gfx.reasons.length?`<small>Đã chọn bản nhẹ: ${gfx.reasons.join(', ')}</small>`:''}</label>`:''}`;
 document.body.append(root);
 if(gfx){const sel=root.querySelector<HTMLSelectElement>('.gfx select')!;sel.value=gfx.choice;sel.onchange=()=>switchQuality(sel.value as QualityChoice);}
 const group=root.querySelector<SVGGElement>('.sticks')!,smokes=[...root.querySelectorAll<HTMLElement>('.smoke')],bar=root.querySelector<HTMLElement>('.incense')!,status=root.querySelector<HTMLElement>('.status')!,label=root.querySelector<HTMLElement>('.stage-label')!,enter=root.querySelector<HTMLButtonElement>('.enter')!,err=root.querySelector<HTMLElement>('.err')!,verse=root.querySelector<HTMLElement>('.verse')!;
 let stage:Stage='boot',shown=0,floor=0,last=performance.now(),dead=false,login=false,drawn=-1;label.textContent=LABELS.boot;
 const draw=(p:number)=>{const d=sticksSvg(STICKS.map(s=>p/100*MAX_BURN*s.rate));group.innerHTML=d.svg;d.embers.forEach(([x,y],i)=>{smokes[i].style.left=(x/200*100)+'%';smokes[i].style.top=(y/516*100)+'%';});};
 draw(0);
 if(import.meta.env.DEV)(window as unknown as {__entryDraw:(p:number)=>void}).__entryDraw=p=>{dead=true;draw(p);};
 // every finished download nudges the sticks a little (within the current stage's cap)
 try{new PerformanceObserver(list=>{floor+=list.getEntries().length*.35;}).observe({type:'resource',buffered:true});}catch{}
 const tick=(now:number)=>{if(dead)return;const dt=Math.min(.25,(now-last)/1000);last=now;const cap=CAPS[stage];
  floor=Math.min(cap,floor+(cap-floor)*dt*.035); // a slow creep toward the stage cap, plus the download nudges
  shown=stage==='ready'?Math.min(100,shown+dt*40):shown+(Math.min(cap,floor)-shown)*Math.min(1,dt*3);
  const p=Math.round(shown);if(Math.abs(shown-drawn)>.15){draw(shown);drawn=shown;}bar.setAttribute('aria-valuenow',String(p));
  if(stage!=='ready'||p<100)status.textContent='Đang dâng hương · '+p+'%';
  else if(!root.classList.contains('done')){root.classList.add('done');status.textContent='Nam Mô A Di Đà Phật';label.textContent=LABELS.ready;enter.focus({preventScroll:true});}
  requestAnimationFrame(tick);};
 requestAnimationFrame(tick);
 let v=0;const verses=setInterval(()=>{verse.style.opacity='0';setTimeout(()=>{v=(v+1)%VERSES.length;verse.textContent=VERSES[v];verse.style.opacity='.9';},1000);},7000);
 const set=(s:Stage)=>{if(CAPS[s]<CAPS[stage])return;stage=s;if(!login)label.textContent=LABELS[s];};
 // log in at once, while the temple is still loading behind the screen
 const me=(async()=>{const u=await currentUser();if(u)return u;login=true;label.textContent=LABELS.login;document.body.classList.add('al-auth-open');try{return await askLogin();}finally{login=false;document.body.classList.remove('al-auth-open');label.textContent=LABELS[stage];}})();
 let entered!:()=>void;const clicked=new Promise<void>(r=>entered=r);
 enter.onclick=()=>{entered();root.classList.add('out');document.body.classList.remove('al-entry');setTimeout(()=>{dead=true;clearInterval(verses);root.remove();style.remove();},1300);};
 root.addEventListener('keydown',e=>{if(e.key==='Enter'&&root.classList.contains('done'))enter.click();});
 return{me,stage:set,
  async started(scene){set('online');const t0=performance.now();
   // wait until the scene has nothing left to fetch (or 25 s at most), then finish the offering
   await new Promise<void>(res=>{let calm=0;const h=setInterval(()=>{calm=scene.getWaitingItemsCount()===0?calm+1:0;if(calm>=6||performance.now()-t0>25000){clearInterval(h);res();}},250);});
   set('ready');return clicked;},
  fail(msg){err.textContent='Không mở được chùa: '+msg+' · hãy tải lại trang';status.textContent='Hương chưa bén';}};
}
