import {refugeUI} from './RefugeUI';
import {nearRefuge,REFUGE_STATION} from './RefugePlan';
import {createSocial} from './Social';
import {stopAtPlayer} from './PlayerCollision';
import {renderResolution,nextResolution} from './RenderResolution';
import type {StupaElevator}from '../game/world/StupaElevator';
import {entranceWalkY,entranceFeetY}from '../game/world/EntranceRiverPlan';
import {cameraEyeHeight,eyeCameraSettings,DEFAULT_EYE_CAMERA} from './ViewMode';
import {towerSupport,towerResolveMotion,towerProgress} from '../game/world/StupaPlan';
import {Color3,Matrix,Mesh,MeshBuilder,PointerEventTypes,Quaternion,StandardMaterial,UniversalCamera,Vector3,type ArcRotateCamera,type Scene} from '@babylonjs/core';
import type {HallSeats} from '../game/chars/HallSeats';
import {listeningSeat} from '../game/chars/ListeningSeatPlan';
import {RocketboxPlayerLibrary} from '../game/chars/RocketboxPlayer';
import {resolveCircle,supportHeight} from '../game/world/Obstacles';
import {PRAYER_WHEEL_SITES,canReachWheel} from '../game/world/PrayerWheelPlan';
import type {PrayerWheels} from '../game/world/PrayerWheels';
import {NET,SPAWN,clampWorld,INCENSE_SITES,STILL_ACTS,actCode,actName,nearIncense,meritTotal,cleanPrayer,PRAYER_MAX,PRAYER_SUGGESTIONS,type Act,type ClientMsg,type ServerMsg,type Merit,type Stick,type PlayerInfo} from './protocol';
import {RocketboxPlayer as Pilgrim} from '../game/chars/RocketboxPlayer';
import {logout,type Me} from './AuthUI';
import {switchQuality,watchSpeed} from './Quality';
import {outfitChoices as listOutfits} from './OutfitChoices';
import {bridgeCrossing,insideRiver,onRiver,BRIDGE_OUT,TOUR_STOPS,type TourStop,incenseSteps,nextTourStop,stopSteps,riverReleaseSteps,skyReleaseSteps,tamBoSteps,type TourStep} from './TempleTour';
import {RiverOfferings} from '../game/world/RiverOfferings';
import {onRiverStep} from './Releases';
import {lifeRoute} from '../game/chars/TempleLifePlan';
import {flyAt,flyChapter,FLY_PERIOD} from './FlyTour';
import {CinemaDirector,type CineFocus,type CinePhase} from './CinemaDirector';
import {ALL_GARDEN_STATUES} from '../game/world/StatueGardenPlan';
import {STUPA} from '../game/world/StupaPlan';
import {nearestTalk,talkUrl,type TalkSpot} from './StatueTalks';
import {TALK_TEXTS} from './StatueTalkTexts';

const CSS=`body.al-online header,body.al-online footer,body.al-online #prayer-merit-total{display:none!important}body.al-online canvas{height:100dvh!important}
#al-hud{position:fixed;left:12px;top:12px;z-index:6;display:flex;flex-direction:column;gap:4px;font:13px 'Segoe UI',sans-serif;color:#f4e8c8;text-shadow:0 1px 3px #000;pointer-events:none}#al-hud b{font-size:15px;color:#ffe2a0}
#al-top{position:fixed;right:12px;top:12px;z-index:6;display:flex;gap:6px}#al-top button,#al-acts button{font:600 13px 'Segoe UI',sans-serif;color:#fff3d6;background:rgba(32,40,36,.86);border:1px solid #a3884b;border-radius:10px;padding:9px 12px;cursor:pointer}
#al-acts{position:fixed;right:12px;bottom:14px;z-index:6;display:grid;grid-template-columns:repeat(2,auto);gap:7px}#al-top button.hot{background:#a8481c;border-color:#f2b46a}#al-acts button[data-on=true]{background:#8c6f2c}#al-acts button.hot{background:#b3802a;border-color:#ffd47a;animation:al-pulse 1.4s infinite}#al-acts button[hidden]{display:none}
@keyframes al-pulse{50%{box-shadow:0 0 0 6px rgba(255,200,90,.25)}}
#al-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:7;background:rgba(40,30,10,.88);color:#ffe3a3;border:1px solid #b48d3c;border-radius:10px;padding:8px 14px;font:600 14px 'Segoe UI';opacity:0;transition:opacity .3s;pointer-events:none;max-width:calc(100vw - 32px);text-align:center}
#al-ctrl{position:fixed;left:12px;bottom:40px;z-index:6;display:flex;flex-wrap:wrap;max-width:calc(100vw - 220px);gap:7px}#al-ctrl button{font:600 14px 'Segoe UI',sans-serif;color:#fff3d6;background:rgba(32,40,36,.86);border:1px solid #a3884b;border-radius:12px;padding:11px 14px;cursor:pointer}#al-ctrl button[data-on=true]{background:#2f7a52;border-color:#8fe0b0}@media (pointer:coarse){#al-ctrl{bottom:170px}}
#al-joy{position:fixed;left:18px;bottom:22px;z-index:6;width:128px;height:128px;border-radius:50%;background:rgba(255,255,255,.08);border:2px solid rgba(255,230,170,.35);touch-action:none;display:none}#al-joy i{position:absolute;left:39px;top:39px;width:50px;height:50px;border-radius:50%;background:rgba(255,220,140,.5)}
@media(max-width:760px){#al-help{display:none}}@media (pointer:coarse){#al-joy{display:block}#al-help{display:none}}#al-help{position:fixed;left:12px;bottom:12px;z-index:6;font:12px 'Segoe UI';color:#e9dfc5;text-shadow:0 1px 2px #000;pointer-events:none}`;

/** Phone / tablet / app layout (anh Thanh 2026-11-03): only the main controls on screen; everything else in a ☰ menu. */
const OUTFIT_CSS=`#al-outfit{position:fixed;inset:0;z-index:10;display:none;background:rgba(0,0,0,.45);place-items:center;padding:12px}#al-outfit.open{display:grid}
#al-outfit .box{width:min(560px,100%);max-height:calc(100dvh - 24px);overflow:auto;background:linear-gradient(180deg,rgba(40,20,12,.97),rgba(22,12,8,.97));border:1px solid #b88a3a;border-radius:16px;padding:16px;color:#f3e6c6;font:14px 'Segoe UI',sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#al-outfit .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}#al-outfit .head b{font-size:18px;color:#f2cf7a}#al-outfit .close{width:40px;height:40px;border-radius:50%;border:1px solid #8f733f;background:transparent;color:#ffe7a8;font:600 20px 'Segoe UI';cursor:pointer}
#al-outfit .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:10px}#al-outfit .grid button{display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;border-radius:12px;border:1px solid #6f5a33;background:rgba(60,40,24,.85);color:#fff3d6;font:600 13px 'Segoe UI',sans-serif;cursor:pointer}
#al-outfit .grid button[aria-pressed=true]{border-color:#ffd47a;background:#7a5420;box-shadow:0 0 0 2px rgba(255,212,122,.35)}#al-outfit .sw{width:64px;height:64px;border-radius:50%;border:2px solid rgba(255,230,170,.6);background-size:cover;background-position:center}
#al-outfit .note{margin:10px 2px 0;font-size:12px;color:#d9c8a0}
#al-pray{position:fixed;inset:0;z-index:10;display:none;background:rgba(0,0,0,.45);place-items:center;padding:12px}#al-pray.open{display:grid}
#al-pray .box{width:min(480px,100%);max-height:calc(100dvh - 24px);overflow:auto;background:linear-gradient(180deg,rgba(40,20,12,.97),rgba(22,12,8,.97));border:1px solid #b88a3a;border-radius:16px;padding:16px;color:#f3e6c6;font:14px 'Segoe UI',sans-serif;box-shadow:0 20px 60px rgba(0,0,0,.6)}
#al-pray .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}#al-pray .head b{font-size:18px;color:#f2cf7a}#al-pray .close{width:40px;height:40px;border-radius:50%;border:1px solid #8f733f;background:transparent;color:#ffe7a8;font:600 20px 'Segoe UI';cursor:pointer}
#al-pray input{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:10px;border:1px solid #8f733f;background:#120b07;color:#fff3d6;font:16px 'Segoe UI',sans-serif}
#al-pray .count{text-align:right;font-size:12px;color:#cdb98d;margin:4px 2px 8px}#al-pray .count.full{color:#ffb48a}
#al-pray .chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}#al-pray .chips button{padding:6px 10px;border-radius:999px;border:1px solid #6f5a33;background:rgba(60,40,24,.85);color:#fff3d6;font:13px 'Segoe UI',sans-serif;cursor:pointer}
#al-pray .row{display:flex;gap:8px}#al-pray .row button{flex:1;padding:10px;border-radius:10px;border:1px solid #c9a65a;font:600 15px 'Segoe UI',sans-serif;cursor:pointer}#al-pray .send{background:linear-gradient(#a52a17,#6c160c);color:#ffe7a8}#al-pray .clear{background:transparent;color:#efd9a6}
#al-ctx{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 148px);transform:translateX(-50%);z-index:9;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;width:min(640px,calc(100vw - 24px));pointer-events:none}#al-ctx button{pointer-events:auto;padding:9px 16px;border-radius:999px;border:1px solid #d9b25c;background:linear-gradient(#8a2b17,#521408);color:#ffe7a8;font:600 15px 'Segoe UI',sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45)}#al-ctx button[hidden]{display:none}body.al-compact #al-ctx{bottom:calc(env(safe-area-inset-bottom) + 202px)}
#al-talk{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom) + 96px);transform:translateX(-50%);z-index:9;display:none;flex-direction:column;align-items:center;gap:8px;width:min(560px,calc(100vw - 24px));pointer-events:none}
#al-talk.show{display:flex}#al-talk button{pointer-events:auto;padding:9px 18px;border-radius:999px;border:1px solid #d9b25c;background:linear-gradient(#6d3a12,#3f1f09);color:#ffe7a8;font:600 15px 'Segoe UI',sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45)}
#al-talk .cap{pointer-events:auto;display:none;max-height:30vh;overflow:auto;padding:12px 14px;border-radius:12px;background:rgba(28,14,6,.88);border:1px solid #9c7a3a;color:#f6e6c4;font:14px/1.5 'Segoe UI',sans-serif;text-align:left}
#al-talk.playing .cap{display:block}#al-talk .cap b{display:block;color:#f2cf7a;margin-bottom:4px}#al-talk .bar{height:3px;width:100%;background:rgba(255,231,168,.18);border-radius:3px;overflow:hidden;display:none}#al-talk.playing .bar{display:block}#al-talk .bar i{display:block;height:100%;width:0;background:#f2cf7a}
body.al-compact #al-talk{bottom:calc(env(safe-area-inset-bottom) + 150px)}body.al-compact #al-talk .cap{max-height:22vh;font-size:13px}
#al-pray .err{min-height:18px;margin-top:8px;color:#ffb4a2;font-size:13px}#al-pray .note{margin:8px 2px 0;font-size:12px;color:#d9c8a0}`;
const COMPACT_CSS=`body.al-compact #al-top,body.al-compact #al-ctrl,body.al-compact #al-help{display:none!important}
body.al-compact #al-hud{font-size:11px;left:10px;top:max(8px,env(safe-area-inset-top));gap:2px;max-width:46vw}body.al-compact #al-hud b{font-size:13px}
#al-menu-btn{position:fixed;right:max(10px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));z-index:8;width:46px;height:46px;border-radius:50%;border:1px solid #c9a65a;background:rgba(32,22,14,.88);color:#ffe7a8;font:600 22px/1 'Segoe UI',sans-serif;display:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.4)}
body.al-compact #al-menu-btn{display:block}
#al-menu{position:fixed;inset:0;z-index:9;display:none;background:rgba(0,0,0,.35)}#al-menu.open{display:block}
#al-menu .sheet{position:absolute;right:0;top:0;bottom:0;width:min(330px,88vw);overflow:auto;background:linear-gradient(180deg,rgba(40,20,12,.97),rgba(22,12,8,.97));border-left:1px solid #b88a3a;padding:max(14px,env(safe-area-inset-top)) 14px 18px;box-shadow:-10px 0 30px rgba(0,0,0,.5)}
#al-menu h3{margin:14px 0 8px;font:600 12px 'Segoe UI',sans-serif;letter-spacing:1px;text-transform:uppercase;color:#d8b86c}#al-menu .head{display:flex;justify-content:space-between;align-items:center;color:#f2cf7a;font:600 16px 'Segoe UI'}
#al-menu .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}#al-menu .grid button{min-height:48px;font:600 14px 'Segoe UI',sans-serif;color:#fff3d6;background:rgba(60,40,24,.9);border:1px solid #8f733f;border-radius:12px;padding:8px 10px;cursor:pointer;text-align:center}
#al-menu .grid button[data-on=true]{background:#2f7a52;border-color:#8fe0b0}#al-menu .grid button[hidden]{display:none}#al-menu .close{width:40px;height:40px;border-radius:50%;border:1px solid #8f733f;background:transparent;color:#ffe7a8;font:600 20px 'Segoe UI';cursor:pointer}
body.al-compact #al-acts{right:max(14px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));display:flex;flex-direction:column-reverse;align-items:flex-end;gap:10px}
body.al-compact #al-acts button{min-width:64px;min-height:56px;border-radius:30px;padding:10px 16px;font:600 15px 'Segoe UI',sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.45)}
body.al-compact #al-acts button.hot{min-height:64px;font-size:16px;max-width:52vw}
body.al-compact #al-joy{display:block;width:140px;height:140px;left:max(20px,env(safe-area-inset-left));bottom:max(22px,env(safe-area-inset-bottom))}body.al-compact #al-joy i{left:44px;top:44px}
body.al-compact #al-toast{top:max(60px,calc(env(safe-area-inset-top) + 56px));font-size:13px}`;
export const isCompactDevice=()=>matchMedia('(pointer:coarse)').matches||innerWidth<760||/ChuaAnLienApp/.test(navigator.userAgent);

type Remote={p:Pilgrim;buf:{t:number;x:number;y:number;z:number;yaw:number;a:number}[];seen:number};
const lerpAngle=(a:number,b:number,t:number)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*t;};

/** Online pilgrimage: third-person pilgrim, shared presence, incense, prayer wheels. */
export async function startOnline(o:{elevator:StupaElevator;scene:Scene;canvas:HTMLCanvasElement;orbit:ArcRotateCamera;low:boolean;wheels:PrayerWheels;seats:HallSeats;refugeReady:()=>boolean;seatOccupied:(id:number)=>boolean;toggleSound:()=>void;ensureSound:()=>void;me:Me}){
 const {scene,canvas,orbit}=o;
 document.body.classList.add('al-online');const style=document.createElement('style');style.textContent=CSS+COMPACT_CSS+OUTFIT_CSS;document.head.append(style);
 const hud=document.createElement('div');hud.id='al-hud';const toastEl=document.createElement('div');toastEl.id='al-toast';const help=document.createElement('div');help.id='al-help';help.textContent='WASD đi · G tự đi · R tự chạy · C đổi góc nhìn · V ngước nhìn · kéo chuột xoay góc nhìn · cuộn để gần/xa · E thắp nhang / xoay kinh luân · 1 ngồi thiền · 2 quỳ · 3 lạy Phật';
 const top=document.createElement('div');top.id='al-top';const soundB=document.createElement('button');soundB.textContent='🔔 Âm thanh';soundB.onclick=o.toggleSound;const outB=document.createElement('button');outB.textContent='Rời chùa';outB.onclick=async()=>{await logout();location.reload();};const creditB=document.createElement('button');creditB.textContent='Ghi công';creditB.onclick=()=>window.open('ghi-cong.html','_blank','noopener');const gfxQ=new URLSearchParams(location.search).get('q')==='low'?'low':'high',gfxB=document.createElement('button');gfxB.textContent=gfxQ==='low'?'Đồ họa: Nhẹ':'Đồ họa: Cao';gfxB.title=gfxQ==='low'?'Bấm để chuyển sang đồ họa cao (tải lại trang)':'Bấm để chuyển sang đồ họa nhẹ cho máy yếu (tải lại trang)';gfxB.onclick=()=>switchQuality(gfxQ==='low'?'high':'low');const outfitB=document.createElement('button');outfitB.type='button';outfitB.textContent='👘 Trang phục';outfitB.onclick=()=>openOutfits();const prayB=document.createElement('button');prayB.type='button';prayB.textContent='🙏 Cầu nguyện';prayB.onclick=()=>openPray();top.append(soundB,prayB,outfitB,gfxB,creditB,outB);
 const acts=document.createElement('div');acts.id='al-acts';const joy=document.createElement('div');joy.id='al-joy';joy.innerHTML='<i></i>';
 const ctrl=document.createElement('div');ctrl.id='al-ctrl';const autoB=document.createElement('button'),runB=document.createElement('button'),lookB=document.createElement('button');autoB.type=runB.type=lookB.type='button';lookB.textContent='⬆ Ngước nhìn'+(isCompactDevice()?'':' (V)');const viewB=document.createElement('button');viewB.type='button';viewB.id='al-view-mode';ctrl.append(autoB,runB,lookB,viewB);
 document.body.append(hud,toastEl,help,top,acts,joy,ctrl);
 let toastT=0;const toast=(t:string,s=3)=>{toastEl.textContent=t;toastEl.style.opacity='1';toastT=s;};
 toast('Đang chuẩn bị nhân vật…',30);
 watchSpeed(()=>scene.getEngine().getFps(),gfxQ,()=>{gfxB.classList.add('hot');gfxB.textContent='Chuyển đồ họa nhẹ';toast('Máy đang hơi chậm · bấm “Chuyển đồ họa nhẹ” ở góc trên để đi lại mượt hơn',12);});

 const {lib,ready:libReady}=RocketboxPlayerLibrary.shared(scene);try{await libReady;}catch(e){toast('Không tải được nhân vật. Anh bấm Tải lại để thử lại.',60);const retry=document.createElement('button');retry.textContent='Tải lại';retry.onclick=()=>location.reload();top.append(retry);throw e;}
 const me=new Pilgrim(lib,scene,o.me.id,o.me.name,o.me.female,true,o.me.outfit??'thuong');me.rig.root.metadata={h:o.me.female?1.6:1.7};
 let x=SPAWN.x,y=SPAWN.y,z=SPAWN.z,yaw=SPAWN.yaw,firstWelcome=true,merit:Merit=o.me.merit,online=1;
 me.place(x,y,z,yaw);

 // Third-person camera: the review orbit camera follows the pilgrim's head.
 orbit.lowerRadiusLimit=.02;orbit.upperRadiusLimit=22;orbit.radius=7;orbit.beta=1.25;orbit.upperBetaLimit=2.85;orbit.angularSensibilityX=600;orbit.angularSensibilityY=420;orbit.lowerBetaLimit=.2;orbit.panningSensibility=0;orbit.wheelPrecision=40;orbit.pinchPrecision=60;orbit.minZ=.1;
 orbit.alpha=Math.PI/2;orbit.target.set(x,y+1.4,z);scene.activeCamera=orbit;orbit.attachControl(canvas,true);

 // Explicit eye view keeps the same position and heading; zoom cannot reveal the body in this mode.
 let eyeView=false,savedRadius=7,savedFov=orbit.fov;
 let eyeSettings=eyeCameraSettings(null);try{eyeSettings=eyeCameraSettings(JSON.parse(localStorage.getItem('anlien-eye-camera')??'null'));}catch{}
 const cameraB=document.createElement('button');cameraB.id='al-camera-toggle';cameraB.type='button';cameraB.textContent='⚙ Camera';cameraB.hidden=true;ctrl.append(cameraB);style.textContent+='@media(min-width:900px){#al-camera-toggle{position:fixed;left:16px;bottom:96px;z-index:35}}';
 const eyePanel=document.createElement('section');eyePanel.id='al-eye-settings';eyePanel.hidden=true;
 eyePanel.innerHTML='<strong>Camera cận mắt</strong><label>Góc nhìn <output></output><input type="range" min="35" max="100" step="1" aria-label="Góc rộng camera"></label><label>Độ cao <output></output><input type="range" min="0.6" max="3.2" step="0.05" aria-label="Độ cao camera"></label><small>Cuộn chuột: phóng gần / xa</small><button type="button">Đặt lại</button>';
 eyePanel.style.cssText='position:fixed;left:16px;top:76px;z-index:40;width:230px;padding:14px;color:#fff4d7;background:#25251eea;border:1px solid #b29c66;border-radius:12px;font:14px system-ui';
 for(const l of eyePanel.querySelectorAll('label'))l.style.cssText='display:block;margin:10px 0';for(const input of eyePanel.querySelectorAll('input'))input.style.width='100%';
 document.body.append(eyePanel);const eyeInputs=eyePanel.querySelectorAll('input'),eyeOutputs=eyePanel.querySelectorAll('output');
 const paintEye=()=>{eyeInputs[0].value=String(eyeSettings.fov);eyeInputs[1].value=String(eyeSettings.height);eyeOutputs[0].textContent=eyeSettings.fov.toFixed(0)+'°';eyeOutputs[1].textContent=eyeSettings.height.toFixed(2)+' m';};
 const saveEye=()=>{eyeSettings=eyeCameraSettings(eyeSettings);if(eyeView)orbit.fov=eyeSettings.fov*Math.PI/180;paintEye();try{localStorage.setItem('anlien-eye-camera',JSON.stringify(eyeSettings));}catch{}};
 eyeInputs[0].oninput=()=>{eyeSettings.fov=Number(eyeInputs[0].value);saveEye();};eyeInputs[1].oninput=()=>{eyeSettings.height=Number(eyeInputs[1].value);saveEye();};eyePanel.querySelector('button')!.onclick=()=>{eyeSettings={...DEFAULT_EYE_CAMERA};saveEye();};cameraB.onclick=()=>{eyePanel.hidden=!eyePanel.hidden;};paintEye();
 const eyeWheel=(e:WheelEvent)=>{if(!eyeView)return;e.preventDefault();e.stopImmediatePropagation();eyeSettings.fov+=Math.sign(e.deltaY)*2;saveEye();};canvas.addEventListener('wheel',eyeWheel,{capture:true,passive:false});
 scene.onDisposeObservable.addOnce(()=>{canvas.removeEventListener('wheel',eyeWheel,true);eyePanel.remove();cameraB.remove();});
 const paintView=()=>{viewB.textContent=(eyeView?'Góc nhìn: Mắt nhân vật':'Góc nhìn: Bên ngoài')+(isCompactDevice()?'':' (C)');viewB.setAttribute('aria-pressed',String(eyeView));viewB.dataset.on=String(eyeView);};
 function toggleView(){eyeView=!eyeView;orbit.inertialRadiusOffset=0;orbit.inertialAlphaOffset=0;orbit.inertialBetaOffset=0;
  if(eyeView){savedFov=orbit.fov;orbit.fov=eyeSettings.fov*Math.PI/180;cameraB.hidden=false;eyePanel.hidden=false;savedRadius=Math.max(2,orbit.radius);orbit.lowerRadiusLimit=.02;orbit.upperRadiusLimit=.02;orbit.radius=.02;}
  else{orbit.fov=savedFov;cameraB.hidden=true;eyePanel.hidden=true;orbit.lowerRadiusLimit=.25;orbit.upperRadiusLimit=22;wantR=savedRadius;orbit.radius=savedRadius;}
  me.rig.root.setEnabled(!eyeView);paintView();toast(eyeView?'Camera cận mắt · chỉnh độ cao / góc nhìn trong bảng Camera':'Đã trở lại góc nhìn bên ngoài',2);canvas.focus();
 }
 viewB.onclick=toggleView;paintView();
 // ---- input ----
 const keys=new Set<string>();let joyV={x:0,y:0,on:false};
 window.addEventListener('keydown',e=>{if(refuge.open()||e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLElement&&e.target.isContentEditable)return;keys.add(e.code);if(!e.repeat&&e.code==='KeyC'){e.preventDefault();toggleView();}if(!e.repeat&&e.code==='KeyG')toggleAuto();if(!e.repeat&&e.code==='KeyT')toggleTour();if(!e.repeat&&e.code==='KeyV')toggleLook();if(!e.repeat&&e.code==='KeyR')toggleRun();if(e.code==='Digit1')still('sit');if(e.code==='Digit2')still('kneel');if(e.code==='Digit3')still('bow');if(e.code==='KeyE'&&!e.repeat&&nearIncense({x,y,z}))offer();});
 window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());
 joy.addEventListener('pointerdown',e=>{joy.setPointerCapture(e.pointerId);joyV.on=true;moveJoy(e);});joy.addEventListener('pointermove',e=>{if(joyV.on)moveJoy(e);});
 const endJoy=()=>{joyV={x:0,y:0,on:false};(joy.firstChild as HTMLElement).style.transform='';};joy.addEventListener('pointerup',endJoy);joy.addEventListener('pointercancel',endJoy);
 function moveJoy(e:PointerEvent){const r=joy.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2),l=Math.min(1,Math.hypot(dx,dy))/(Math.hypot(dx,dy)||1);joyV.x=dx*l;joyV.y=dy*l;(joy.firstChild as HTMLElement).style.transform=`translate(${joyV.x*39}px,${joyV.y*39}px)`;}

 // ---- G: walk on by itself in the camera's direction · R: running stays on (no holding Shift) ----
 // auto = the pilgrim moves on by itself; runLock = at running speed (R starts running at once).
 let auto=false,runLock=false;
 const keyHint=(k:string)=>isCompactDevice()?'':' ('+k+')',paintCtrl=()=>{autoB.textContent=(auto&&!runLock?'⏸ Dừng':'🚶 Tự đi')+keyHint('G');autoB.dataset.on=String(auto&&!runLock);runB.textContent=(auto&&runLock?'⏸ Dừng':'🏃 Chạy')+keyHint('R');runB.dataset.on=String(auto&&runLock);};
 function toggleAuto(){if(auto&&!runLock)auto=false;else{auto=true;runLock=false;toast('Tự đi · kéo chuột/vuốt màn hình để rẽ · G hoặc S để dừng',2.5);}paintCtrl();}
 function toggleRun(){if(auto&&runLock){auto=false;runLock=false;}else{auto=true;runLock=true;toast('Tự chạy · kéo chuột/vuốt màn hình để rẽ · R hoặc S để dừng',2.5);}paintCtrl();}
 // V: tilt the view up to tower tops and statue faces (and back down).
 let lookTo:number|null=null;function toggleLook(){lookTo=orbit.beta>1.6?1.25:2.8;lookB.textContent=(lookTo>2?'⬇ Nhìn ngang':'⬆ Ngước nhìn')+keyHint('V');}
 lookB.onclick=()=>{toggleLook();canvas.focus();};
 let script:TourStep[]=[],stepT=0,stepOn=false,stuck=0,bestD=Infinity,touring=false,tamBo=false;const tourSeen=new Set<string>();
 let flying=false,flyT=0,flyChap='';   // "Tự đi lễ" flycam state (declared before the buttons paint)
 const tourB=document.createElement('button');tourB.type='button';tourB.id='al-tour';ctrl.append(tourB);tourB.onclick=()=>{toggleTour();canvas.focus();};
 // 🎬 film camera during "Tự đi lễ" (anh Thanh 2026-11-06), remembered per device
 let cineOn=true;try{cineOn=localStorage.getItem('al-cine')!=='off';}catch{}
 const cineB=document.createElement('button');cineB.type='button';cineB.id='al-cine-toggle';ctrl.append(cineB);
 const paintCine=()=>{cineB.textContent=cineOn?'🎬 Quay điện ảnh: Bật':'🎬 Quay điện ảnh: Tắt';cineB.dataset.on=String(cineOn);};paintCine();
 cineB.onclick=()=>{cineOn=!cineOn;try{localStorage.setItem('al-cine',cineOn?'on':'off');}catch{}paintCine();toast(cineOn?'🎬 Tự đi lễ sẽ được quay như một thước phim':'Máy quay bám theo người chơi',2.5);canvas.focus();};
 const tamB=document.createElement('button');tamB.type='button';tamB.id='al-tambo';ctrl.append(tamB);tamB.onclick=()=>{toggleTamBo();canvas.focus();};
 autoB.onclick=()=>{toggleAuto();canvas.focus();};runB.onclick=()=>{toggleRun();canvas.focus();};paintCtrl();paintTour();paintTamBo();
 // Sound starts on its own (the login click already counted as a user gesture); otherwise on the first touch/key.
 o.ensureSound();const wake=()=>{o.ensureSound();window.removeEventListener('pointerdown',wake);window.removeEventListener('keydown',wake);};window.addEventListener('pointerdown',wake);window.addEventListener('keydown',wake);
 // ---- action buttons ----
 const mk=(label:string,fn:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{fn();canvas.focus();};acts.append(b);return b;};
 const refuge=refugeUI({score:()=>meritTotal(merit),near:()=>nearRefuge({x,y,z}),
  start:()=>{if(!o.refugeReady()||!nearRefuge({x,y,z})||ws?.readyState!==WebSocket.OPEN)return false;
   haltForRitual();stopTour();tamBo=false;paintTamBo();script=[];
   yaw=Math.atan2(REFUGE_STATION.x-x,REFUGE_STATION.monkZ-z);setAct('kneel');return true;
  },stop:()=>{if(act==='kneel')setAct('idle');},send:net});
 top.prepend(refuge.button);scene.onDisposeObservable.addOnce(refuge.dispose);
 const bIncense=mk('🪔 Thắp nhang',()=>offer()),bWheel=mk('☸ Xoay kinh luân',()=>offer()),bSit=mk('🧘 Ngồi thiền',()=>still('sit')),bKneel=mk('🙏 Quỳ',()=>still('kneel')),bBow=mk('🙇 Lạy Phật',()=>still('bow')),bUp=mk('Đứng dậy',()=>setAct('idle'));
 let act:Act='idle',actUntil=0,listenSeat:number|null=null;
 const occupied=(id:number)=>o.seatOccupied(id)||[...remotes.values()].some(r=>{const s=o.seats.seats[id];return s&&r.p.current==='sit'&&Math.hypot(r.p.position.x-s.x,r.p.position.z-s.z)<.8;});
 const bListen=mk('Ngồi nghe pháp',()=>{
  const selected=o.seats.selected===null?o.seats.nearest({x,y,z},occupied):o.seats.seats[o.seats.selected];
  if(!selected){toast('Đến gần một đệm vàng rồi chọn đệm để ngồi.');return;}
  const target=listeningSeat(selected.id,{x,y,z},occupied);
  if(!target.ok){toast(target.reason==='occupied'?'Đệm này đã có người hoặc dành cho phật tử trong chùa.':'Hãy đi đến gần đệm đã chọn (trong 3 m).');return;}
  haltForRitual();listenSeat=selected.id;o.seats.select(selected.id);({x,y,z,yaw}=target.position);me.place(x,y,z,yaw);setAct('sit');toast('Đã ngồi đúng đệm · WASD hoặc Đứng dậy để rời chỗ.');
 });bListen.id='al-listen';
 const seatPick=scene.onPointerObservable.add(info=>{if(info.type!==PointerEventTypes.POINTERTAP)return;const hit=info.pickInfo;if(!hit?.pickedMesh?.metadata?.hallSeats||hit.thinInstanceIndex<0)return;const id=hit.thinInstanceIndex;if(occupied(id)){toast('Đệm này đang có người hoặc được dành sẵn.');return;}o.seats.select(id);bListen.textContent='Ngồi nghe pháp · đệm '+(id+1);toast('Đã chọn đệm '+(id+1)+' · đến gần và bấm Ngồi nghe pháp.');});
 scene.onDisposeObservable.addOnce(()=>scene.onPointerObservable.remove(seatPick));
 // ---- outfits (anh Thanh 2026-11-03): women choose among the ten designed áo dài or everyday clothes; saved on the server, seen by everyone ----
 const outfitBox=document.createElement('div');outfitBox.id='al-outfit';outfitBox.innerHTML='<div class="box" role="dialog" aria-label="Chọn trang phục"><div class="head"><b>Trang phục</b><button class="close" type="button" aria-label="Đóng">✕</button></div><div class="grid"></div><p class="note"></p></div>';document.body.append(outfitBox);
 const outfitChoices=listOutfits(o.me.female);
 const outfitGrid=outfitBox.querySelector('.grid')!;outfitBox.querySelector('.note')!.textContent='Trang phục được lưu theo tài khoản, mọi người trong chùa đều thấy.';
 for(const c of outfitChoices){const b=document.createElement('button');b.type='button';b.dataset.id=c.id;b.innerHTML=`<span class="sw" style="background:${c.bg};background-size:cover"></span>${c.name}`;b.onclick=()=>{me.setOutfit(c.id);paintOutfits();net({t:'outfit',outfit:c.id});};outfitGrid.append(b);}
 function paintOutfits(){for(const b of outfitGrid.querySelectorAll<HTMLButtonElement>('button'))b.setAttribute('aria-pressed',String(b.dataset.id===me.outfit));}
 function openOutfits(){paintOutfits();outfitBox.classList.add('open');}
 // ---- prayers (anh Thanh 2026-11-04): a short prayer typed by the pilgrim floats above their head, everyone sees it ----
 const prayBox=document.createElement('div');prayBox.id='al-pray';prayBox.innerHTML=`<div class="box" role="dialog" aria-label="Cầu nguyện"><div class="head"><b>🙏 Lời cầu nguyện</b><button class="close" type="button" aria-label="Đóng">✕</button></div>
  <input type="text" maxlength="${PRAYER_MAX}" placeholder="Gõ lời cầu nguyện của quý Phật tử…" aria-label="Lời cầu nguyện" enterkeyhint="send"><div class="count"></div>
  <div class="chips"></div><div class="row"><button class="send" type="button">Dâng lời nguyện</button><button class="clear" type="button">Gỡ lời nguyện</button></div><div class="err" role="alert"></div>
  <p class="note">Lời nguyện hiện trên đầu nhân vật, mọi người trong chùa đều thấy. Tối đa ${PRAYER_MAX} ký tự.</p></div>`;document.body.append(prayBox);
 const prayIn=prayBox.querySelector('input')!,prayCount=prayBox.querySelector<HTMLElement>('.count')!,prayErr=prayBox.querySelector<HTMLElement>('.err')!;
 const paintCount=()=>{const n=[...prayIn.value].length;prayCount.textContent=n+' / '+PRAYER_MAX;prayCount.classList.toggle('full',n>=PRAYER_MAX);};prayIn.oninput=()=>{prayErr.textContent='';paintCount();};
 for(const t of PRAYER_SUGGESTIONS){const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{prayIn.value=t;paintCount();prayIn.focus();};prayBox.querySelector('.chips')!.append(b);}
 let offerKind:'lantern'|'fish'|'sky'|null=null;const prayHead=prayBox.querySelector<HTMLElement>('.head b')!,prayGo=prayBox.querySelector<HTMLButtonElement>('.send')!,prayClear=prayBox.querySelector<HTMLButtonElement>('.clear')!;
 const OFFER_LABEL={lantern:['🪷 Thả hoa đăng','Lời nguyện gửi theo hoa đăng'],fish:['🐟 Thả cá chép','Lời nguyện khi phóng sinh'],sky:['🏮 Thả đèn trời','Lời nguyện gửi theo đèn trời']} as const;
 const sendPray=(text:string)=>{const clean=cleanPrayer(text);if(clean===null){prayErr.textContent='Lời nguyện tối đa '+PRAYER_MAX+' ký tự, không dùng ký tự lạ hay từ không phù hợp.';return;}
  if(offerKind){const kind=offerKind;offerKind=null;prayBox.classList.remove('open');haltForRitual();stopTour();tamBo=false;paintTamBo();
   if(kind==='sky'){runScript(skyReleaseSteps(clean));toast('🏮 Thành tâm cầu nguyện · đèn trời sẽ bay lên sau 5 giây',4);}else{runScript(riverReleaseSteps(kind,clean));toast(kind==='lantern'?'🪷 Thả hoa đăng xuống sông':'🐟 Phóng sinh cá chép',3);}return;}
  net({t:'pray',text:clean});prayBox.classList.remove('open');toast(clean?'Đã dâng lời nguyện 🙏':'Đã gỡ lời nguyện',2.5);};
 prayBox.querySelector<HTMLButtonElement>('.send')!.onclick=()=>sendPray(prayIn.value);prayBox.querySelector<HTMLButtonElement>('.clear')!.onclick=()=>{prayIn.value='';sendPray('');};
 prayIn.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')sendPray(prayIn.value);};prayIn.onkeyup=e=>e.stopPropagation();
 // ---- talks about the holy figures (src/online/StatueTalks.ts): near a statue, "🔊 Nghe về …" plays a ~30 s recording with its text ----
 const talkBox=document.createElement('div');talkBox.id='al-talk';talkBox.innerHTML='<div class="cap" aria-live="polite"></div><div class="bar"><i></i></div><button type="button"></button>';document.body.append(talkBox);
 const talkB=talkBox.querySelector('button')!,talkCap=talkBox.querySelector<HTMLElement>('.cap')!,talkBar=talkBox.querySelector<HTMLElement>('.bar i')!;
 let talkNear:TalkSpot|null=null,talkAudio:HTMLAudioElement|null=null,talkPlaying='';
 const paintTalk=()=>{const playing=!!talkAudio&&!talkAudio.paused;talkBox.classList.toggle('playing',playing);talkBox.classList.toggle('show',playing||!!talkNear);
  if(playing){talkB.textContent='⏹ Dừng nghe';}else if(talkNear)talkB.textContent='🔊 Nghe về '+TALK_TEXTS[talkNear.talk].title;};
 const stopTalk=()=>{if(talkAudio){talkAudio.pause();talkAudio=null;}talkPlaying='';paintTalk();};
 talkB.onclick=()=>{if(talkAudio&&!talkAudio.paused){stopTalk();return;}if(!talkNear)return;const t=TALK_TEXTS[talkNear.talk];talkPlaying=talkNear.talk;
  talkCap.innerHTML='<b></b><span></span>';talkCap.querySelector('b')!.textContent=t.title;talkCap.querySelector('span')!.textContent=t.text;
  const a=new Audio(talkUrl(talkNear.talk));talkAudio=a;a.ontimeupdate=()=>{talkBar.style.width=(a.duration?a.currentTime/a.duration*100:0)+'%';};a.onended=()=>{talkAudio=null;talkPlaying='';paintTalk();};a.onerror=()=>{toast('Chưa tải được bài giảng, anh/chị thử lại sau',3);stopTalk();};
  void a.play().catch(()=>stopTalk());paintTalk();canvas.focus();};
 const ctx=document.createElement('div');ctx.id='al-ctx';const mkOffer=(label:string,kind:'lantern'|'fish'|'sky')=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.hidden=true;b.onclick=()=>{openOffer(kind);};ctx.append(b);return b;};
 const lanternB=mkOffer('🪷 Thả hoa đăng','lantern'),fishB=mkOffer('🐟 Thả cá chép','fish'),skyB=mkOffer('🏮 Thả đèn trời','sky');document.body.append(ctx);
 const offerings=new RiverOfferings(scene,o.low);
 if(import.meta.env.DEV)Object.assign(window,{__tp:(nx:number,ny:number,nz:number,nyaw=yaw)=>{x=nx;y=ny;z=nz;yaw=nyaw;sendState(true);},__offerings:offerings,__me:()=>({x,y,z,yaw,act}),__still:(a:Act)=>still(a),__offer:()=>offer(),__tamBo:()=>toggleTamBo(),__release:(kind:'lantern'|'fish'|'sky',text:string)=>{offerKind=kind;sendPray(text);},__pray:(text:string)=>{offerKind=null;sendPray(text);},__run:(steps:TourStep[])=>runScript(steps),__route:(tx:number,tz:number,n=6000)=>lifeRoute({x,z},{x:tx,z:tz},routeClear,n),__clear:(ax:number,az:number,bx:number,bz:number)=>routeClear({x:ax,z:az},{x:bx,z:bz}),__script:()=>script,__orbit:orbit,__mePlayer:me,__cine:()=>director.current,__flySeek:(t:number)=>{flyT=t;},__flying:()=>flying,__tourStop:(id:string)=>{const p0=TOUR_STOPS.find(t=>t.id===id);if(!p0)return false;const at=freeStand(p0),st={...p0,x:at.x,z:at.z};touring=true;paintTour();tourSeen.add(id);tourStop=st;runScript(stopSteps(st,tourPath(at)??[at]));return true;},__cinePlan:(plan:string[])=>{director.plan=[...plan];director.stop();},__stopTour:()=>{stopTour();if(STILL_ACTS.has(act)||act==="walk")setAct("idle");}});scene.onDisposeObservable.addOnce(()=>offerings.dispose());
 setInterval(()=>{const busy=script.length>0||touring||tamBo,river=onRiverStep({x,y,z}),inside=(Math.abs(x)<300&&Math.abs(z)<200)||!!towerProgress(x,z,y)||y>3;
  lanternB.hidden=fishB.hidden=busy||!river;skyB.hidden=busy||inside;},400);
 setInterval(()=>{const n=nearestTalk(x,y,z);if(n?.talk!==talkNear?.talk||n?.statue!==talkNear?.statue){talkNear=n;paintTalk();}},400);
 function openOffer(kind:'lantern'|'fish'|'sky'){offerKind=kind;prayHead.textContent=OFFER_LABEL[kind][1];prayGo.textContent=OFFER_LABEL[kind][0];prayClear.hidden=true;prayIn.value=me.prayer;paintCount();prayErr.textContent='';prayBox.classList.add('open');setTimeout(()=>prayIn.focus(),50);}
 function openPray(){offerKind=null;prayHead.textContent='🙏 Lời cầu nguyện';prayGo.textContent='Dâng lời nguyện';prayClear.hidden=false;prayIn.value=me.prayer;paintCount();prayErr.textContent='';prayBox.classList.add('open');setTimeout(()=>prayIn.focus(),50);}
 prayBox.onclick=e=>{if(e.target===prayBox)prayBox.classList.remove('open');};prayBox.querySelector<HTMLButtonElement>('.close')!.onclick=()=>prayBox.classList.remove('open');
 outfitBox.onclick=e=>{if(e.target===outfitBox)outfitBox.classList.remove('open');};outfitBox.querySelector<HTMLButtonElement>('.close')!.onclick=()=>outfitBox.classList.remove('open');
 // ---- phone layout: main controls stay on screen (joystick, run, bow, the action of the place you stand, stand up); the rest moves into ☰ ----
 if(isCompactDevice()){document.body.classList.add('al-compact');
  const menuB=document.createElement('button');menuB.id='al-menu-btn';menuB.type='button';menuB.setAttribute('aria-label','Mở danh sách chức năng');menuB.textContent='☰';
  const menu=document.createElement('div');menu.id='al-menu';menu.innerHTML='<div class="sheet" role="dialog" aria-label="Chức năng"><div class="head">Chùa Online An Liên<button class="close" type="button" aria-label="Đóng">✕</button></div><h3>Hành lễ</h3><div class="grid g1"></div><h3>Di chuyển · góc nhìn</h3><div class="grid g2"></div><h3>Cài đặt</h3><div class="grid g3"></div></div>';
  const close=()=>menu.classList.remove('open');menuB.onclick=()=>menu.classList.add('open');menu.onclick=e=>{if(e.target===menu)close();};menu.querySelector<HTMLButtonElement>('.close')!.onclick=close;
  const into=(sel:string,bs:HTMLButtonElement[])=>{const g=menu.querySelector(sel)!;for(const b of bs){g.append(b);b.addEventListener('click',close);}};
  into('.g1',[refuge.button,prayB,tamB,bSit,bKneel,bListen]);into('.g2',[tourB,autoB,lookB,viewB]);into('.g3',[outfitB,soundB,gfxB,creditB,outB]);
  // on screen, bottom right (stacked upward): the place's action (shown only when near), bow, run, stand up
  bBow.textContent='🙇 Lạy';acts.append(bIncense,bWheel,bBow,runB,bUp);
  document.body.append(menuB,menu);
 }
 function setAct(a:Act,seconds=0){if(a!=='sit')listenSeat=null;act=a;actUntil=seconds?performance.now()+seconds*1000:0;me.setAct(a);sendState(true);for(const [b,k]of [[bSit,'sit'],[bKneel,'kneel'],[bBow,'bow']]as const)b.dataset.on=String(act===k);bUp.hidden=!STILL_ACTS.has(act);bListen.dataset.on=String(listenSeat!==null);}
 function haltForRitual(){auto=false;runLock=false;paintCtrl();endJoy();keys.clear();}
 // ---- scripted walks: the incense ritual and "Tự đi lễ" (src/online/TempleTour.ts); any manual input hands control back ----
 const routeClear=(a:{x:number;z:number},b:{x:number;z:number})=>{const h=(px:number,pz:number)=>Math.max(0,supportHeight(px,pz,1.25));const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/.5));let yy=h(a.x,a.z);for(let i=1;i<=n;i++){const t=i/n,px=a.x+(b.x-a.x)*t,pz=a.z+(b.z-a.z)*t,ny=h(px,pz);if(Math.abs(ny-yy)>.36)return false;const[r,q]=resolveCircle(px,pz,.32,ny,1.8);if(Math.hypot(r-px,q-pz)>.04)return false;yy=ny;}return true;};
 let lookA0=0;
 function runScript(steps:TourStep[]){me.quietPrayer(false);script=steps;stepOn=false;stepT=0;stuck=0;bestD=Infinity;}
 function paintTamBo(){tamB.textContent=tamBo?'⏸ Dừng tam bộ':'🙇 Tam bộ nhất bái';tamB.dataset.on=String(tamBo);}
 function toggleTamBo(){if(tamBo){tamBo=false;script=[];paintTamBo();setAct('idle');toast('Đã dừng tam bộ nhất bái',2);return;}haltForRitual();stopTour();tamBo=true;paintTamBo();toast('🙇 Tam bộ nhất bái: ba bước một lạy, đi theo hướng đang nhìn · chạm phím/điều khiển để dừng',4);runScript(tamBoSteps({x,z},yaw));}
 function paintTour(){tourB.textContent=(touring||flying?'⏸ Dừng đi lễ':'🛕 Tự đi lễ')+keyHint('T');tourB.dataset.on=String(touring||flying);}
 /** Route for the round: over the bridge when the river is between, A* inside the courtyard (its grid stops at the river).
  * null when there is no way there (the stop is then skipped for this visit). */
 const noWay=new Set<string>();
 function tourPath(to:{x:number;z:number}):{x:number;z:number}[]|null{
  const route=(a:{x:number;z:number},b:{x:number;z:number})=>{try{const r=lifeRoute(a,b,routeClear,20000);return r.length?r:null;}catch{return null;}};
  const cross=bridgeCrossing({x,z},to);if(!cross.length)return route({x,z},to);
  const [first,last]=cross,head=insideRiver({x,z})?route({x,z},first):(Math.abs(x)>4?[{x:0,z:Math.min(708,Math.max(z,BRIDGE_OUT.z))},first]:[first]);
  const tail=insideRiver(to)?route(last,to):[to];return head&&tail?[...head,last,...tail]:null;}
 /** A standing place clear of plinths, tiers and walls near where the stop wants the pilgrim (the Amitabha altar sits on stepped tiers). */
 function freeStand(p:{x:number;z:number}){const ok=(q:{x:number;z:number})=>routeClear(q,{x:q.x+.3,z:q.z})&&routeClear(q,{x:q.x,z:q.z+.3});if(ok(p))return p;
  for(const r of [1,2,3,4.5,6,8])for(let k=0;k<12;k++){const a=k/12*Math.PI*2,q={x:p.x+Math.sin(a)*r,z:p.z+Math.cos(a)*r};if(ok(q))return q;}return p;}
 let tourStop:TourStop|undefined;
 function planTour(){
  for(let tries=0;tries<40;tries++){const pick=nextTourStop({x,z},tourSeen);if(noWay.has(pick.id))continue;const at=freeStand(pick),stop={...pick,x:at.x,z:at.z},path=tourPath(at);
   if(path){tourStop=stop;runScript(stopSteps(stop,path));return;}noWay.add(pick.id);}
  stopTour();toast('Không tìm được đường đi tiếp · anh/chị tự điều khiển nhé',3);}
 function stopTour(){if(!touring)return;touring=false;script=[];me.quietPrayer(false);paintTour();}
 // "Tự đi lễ": the pilgrim walks the round (incense, statues, wheels, the stupa) filmed by the CinemaDirector.
 // (anh Thanh 2026-11-06: the drone-only FlyTour was tried and dropped — back to following the pilgrim; FlyTour stays for films.)
 function toggleTour(){if(flying){stopFly(true);return;}if(touring){stopTour();if(STILL_ACTS.has(act)||act==='walk')setAct('idle');toast('Đã dừng tự đi lễ',2);return;}haltForRitual();touring=true;tourSeen.clear();paintTour();toast('🛕 Tự đi lễ: lần lượt thắp nhang các bàn thờ, lạy Phật, ngắm tượng, lên tháp · chạm phím/điều khiển để dừng',4);planTour();}
 /** One frame of the script: returns the direction to walk (or null while performing an act). */
 function scriptTick(dt:number):{mx:number;mz:number;speed?:number}|null{
  const s=script[0];if(!s)return null;
  if('walk' in s){const p=s.walk[0];if(!p){script.shift();return null;}const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);
   if(d<.4){s.walk.shift();bestD=Infinity;stuck=0;return null;}
   if(d<bestD-.02){bestD=d;stuck=0;}else stuck+=dt;if(stuck>2.5){s.walk.shift();bestD=Infinity;stuck=0;return null;}
   return{mx:dx/d,mz:dz/d,speed:s.speed};}
  if('lift' in s){if(!stepOn){stepOn=true;stepT=0;if(s.say)toast(s.say,3);if(!o.elevator.ride(s.lift)){script=[];stepOn=false;}return null;}
   stepT+=dt;if(!o.elevator.active&&stepT>.4){if(s.lift===0&&!eyeView){lookTo=1.25;wantR=7;}script.shift();stepOn=false;}return null;}
  if('look' in s){const L=s.look,dx=L.at.x-x,dz=L.at.z-z,d=Math.hypot(dx,dz)||1;
   if(!stepOn){stepOn=true;stepT=0;lookA0=orbit.alpha;lookTo=null;if(s.say)toast(s.say,4);setAct('idle');me.quietPrayer(true);}
   stepT+=dt;const u=Math.min(1,stepT/L.secs),ease=(t:number)=>.5-.5*Math.cos(Math.PI*Math.min(1,Math.max(0,t)));yaw=lerpAngle(yaw,Math.atan2(dx,dz),Math.min(1,dt*3));
   if(!eyeView){// over the shoulder (the top gallery is narrow): sweep left and right across the view, tilting down toward the ground below
    const behind=Math.atan2(-dz/d,-dx/d),k=ease(u/.5);let a=behind+L.sweep*Math.sin(Math.PI*2*u)*(1-.5*u),diff=a-lookA0;diff=((diff%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;
    orbit.alpha=lookA0+diff*Math.min(1,ease(u/.15));orbit.beta=1.45+(L.beta-1.45)*k;orbit.radius=wantR=2.4;}
   if(u>=1){script.shift();stepOn=false;if(!script[0]||!('look' in script[0]))me.quietPrayer(false);}return null;}
  if(!stepOn){stepOn=true;stepT=0;if(s.say)toast(s.say,3);if(s.yaw!==undefined)yaw=s.yaw;setAct(s.act);if(s.offer)net({t:'incense',site:s.offer});if(s.wheel)o.wheels.pushNearest();if(s.release)net({t:'release',kind:s.release.kind,text:s.release.text});}
  stepT+=dt;if(stepT>=s.secs){script.shift();stepOn=false;if(!script[0]||'walk' in script[0])setAct('idle');}
  return null;
 }
 function still(a:Act){haltForRitual();if(act===a){setAct('idle');return;}const site=nearIncense({x,y,z},8);if(site)yaw=Math.PI;setAct(a);if(a==='bow')toast('Nam mô A Di Đà Phật 🙏',2.5);}
 function offer(){
  const site=nearIncense({x,y,z});
  if(site){haltForRitual();stopTour();runScript(incenseSteps(site,{x,z}));toast('🙏 Thắp nhang · đi tới lư hương để cắm nhang',3);return;}
  const w=PRAYER_WHEEL_SITES.find(s=>canReachWheel({x,y,z},s,true));if(w){o.wheels.pushNearest();return;}
  toast('Hãy đến trước bàn hương hoặc sát chân kinh luân');
 }
 o.wheels.onPush=id=>{haltForRitual();const s=PRAYER_WHEEL_SITES.find(w=>w.id===id)!;yaw=Math.atan2(s.x-x,s.z-z);setAct('wheel',1.8);};
 o.wheels.goOnline(id=>net({t:'wheel',id}),()=>({position:{x,y,z},walking:true}));

 // ---- incense sticks: one thin-instanced stick + ember for every offering in the temple ----
 const stickMat=new StandardMaterial('al-stick',scene);stickMat.diffuseColor=Color3.FromHexString('#9b3b25');stickMat.emissiveColor=new Color3(.22,.05,.02);
 const emberMat=new StandardMaterial('al-ember',scene);emberMat.emissiveColor=new Color3(1,.42,.1);emberMat.disableLighting=true;
 const stickMesh=MeshBuilder.CreateCylinder('al-incense-stick',{height:.5,diameter:.014,tessellation:5},scene);stickMesh.material=stickMat;stickMesh.isPickable=false;
 const ember=MeshBuilder.CreateSphere('al-incense-ember',{diameter:.035,segments:4},scene);ember.material=emberMat;ember.isPickable=false;
 let sticks:Stick[]=[],clockOffset=0;
 function drawSticks(){const now=Date.now()+clockOffset,live=sticks.filter(s=>now-s.t<NET.incenseLife*1000);sticks=live;const m1:number[]=[],m2:number[]=[];const count=new Map<string,number>();
  for(const s of live){const site=INCENSE_SITES.find(i=>i.id===s.site);if(!site)continue;const k=count.get(s.site)??0;count.set(s.site,k+1);const a=k*2.39996,r=site.bowl?site.bowl.r*.85*Math.sqrt(((k*7)%23+.5)/23):.05*site.censer*(.35+.65*((k%6)/6)),px=site.x+Math.cos(a)*r,pz=site.z+Math.sin(a)*r,base=site.bowl?site.bowl.y:site.top+.14+site.censer*.3;
   const burnt=Math.min(1,(now-s.t)/(NET.incenseLife*1000)),h=.5*(1-.7*burnt),tilt=Quaternion.RotationYawPitchRoll(a,.08,0);
   m1.push(...Matrix.Compose(new Vector3(1,1-.7*burnt,1),tilt,new Vector3(px,base+h/2,pz)).asArray());m2.push(...Matrix.Compose(Vector3.One(),Quaternion.Identity(),new Vector3(px,base+h,pz)).asArray());}
  for(const [mesh,data]of [[stickMesh,m1],[ember,m2]]as const){mesh.thinInstanceSetBuffer('matrix',new Float32Array(data.length?data:Matrix.Compose(Vector3.Zero(),Quaternion.Identity(),new Vector3(0,-50,0)).asArray()),16,true);}}
 setInterval(drawSticks,4000);

 // ---- network ----
 const remotes=new Map<number,Remote>();const infos=new Map<number,PlayerInfo>();let ws:WebSocket|null=null,retry=0,kicked=false,lastSent='',lastSentAt=0;
 function net(m:ClientMsg){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify(m));}
 // 💬 friends, chat and voice/video calls between pilgrims (Social.ts, server/social.ts)
 const social=createSocial({meId:o.me.id,send:net,toast,players:()=>[...infos.values()]});
 function sendState(force=false){const msg={t:'state' as const,x:Math.round(x*100)/100,y:Math.round(y*100)/100,z:Math.round(z*100)/100,yaw:Math.round(yaw*1000)/1000,a:actCode(act)};const key=JSON.stringify(msg);const now=performance.now();if(!force&&key===lastSent&&now-lastSentAt<1000)return;lastSent=key;lastSentAt=now;net(msg);}
 // Up to 1000 pilgrims online (anh Thanh 2026-11-06): only the ones the server is sending (the nearest ~80) get a 3D figure;
 // a figure is built the first time someone appears nearby and freed again after they've been out of sight for a while.
 const addRemote=(p:PlayerInfo)=>{infos.set(p.id,p);};
 const avatar=(id:number)=>{let r=remotes.get(id);if(r)return r;const p=infos.get(id);if(!p||id===o.me.id)return undefined;
  const pil=new Pilgrim(lib,scene,p.id,p.name,p.female,false,p.outfit??'thuong');pil.setPrayer(p.prayer??'');pil.rig.root.metadata={h:p.female?1.6:1.7};pil.rig.root.setEnabled(false);r={p:pil,buf:[],seen:0};remotes.set(id,r);return r;};
 setInterval(()=>{const t=performance.now();for(const [id,r]of remotes)if(t-r.seen>20000){r.p.dispose();remotes.delete(id);}},5000);
 const dropRemote=(id:number)=>{remotes.get(id)?.p.dispose();remotes.delete(id);infos.delete(id);};
 let joinToasts=0,snapGap=100,lastSnapAt=0;setInterval(()=>{joinToasts=0;},20000);
 function connect(){
  ws=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/ws`);
  ws.onopen=()=>{retry=0;};
  ws.onmessage=ev=>{const m=JSON.parse(ev.data) as ServerMsg;
   if(social.handle(m))return;
   if(m.t==='welcome'){clockOffset=m.now-Date.now();offerings.set(m.releases??[]);
    // Only a fresh visit starts outside the gate; a reconnect keeps the pilgrim where they were (sendState below tells the server).
    me.setPrayer(m.you.prayer??'');if(firstWelcome){firstWelcome=false;x=m.spawn.x;y=m.spawn.y;z=m.spawn.z;yaw=m.spawn.yaw;}merit=m.merit;refuge.restore(m.refugeCertificate??null);if(m.meritRank)refuge.rank(m.meritRank);for(const id of [...remotes.keys()])dropRemote(id);infos.clear();m.players.forEach(addRemote);online=m.players.length+1;sticks=m.sticks;drawSticks();sendState(true);toast(`Chào mừng ${m.you.name} đến chùa An Liên 🙏`,4);}
   else if(m.t==='join'){addRemote(m.p);social.playersChanged();online++;if(online<60&&++joinToasts<=3)toast(`${m.p.name} vừa vào chùa`,2.5);}
   else if(m.t==='released'){for(const r of m.r)offerings.add(r);}
   else if(m.t==='pray'){if(m.id===o.me.id)me.setPrayer(m.text);else{const i=infos.get(m.id);if(i)i.prayer=m.text;remotes.get(m.id)?.p.setPrayer(m.text);}}
   else if(m.t==='outfit'){if(m.id===o.me.id){me.setOutfit(m.outfit);paintOutfits();}else{const i=infos.get(m.id);if(i)i.outfit=m.outfit;remotes.get(m.id)?.p.setOutfit(m.outfit);}}
   else if(m.t==='leave'){dropRemote(m.id);social.playersChanged();online=Math.max(1,online-1);}
   else if(m.t==='snap'){const t=performance.now();if(lastSnapAt)snapGap+=(Math.min(1000,t-lastSnapAt)-snapGap)*.15;lastSnapAt=t;for(const r of m.r){const rem=avatar(r[0]);if(!rem)continue;rem.buf.push({t,x:r[1],y:r[2],z:r[3],yaw:r[4],a:r[5]});if(rem.buf.length>6)rem.buf.shift();rem.seen=t;}}
   else if(m.t==='sticks'){if(m.add)sticks.push(...m.add);drawSticks();}
   else if(m.t==='wheels')o.wheels.applyServer(m.w);
   else if(m.t==='merit'){merit=m.m;refuge.refresh();if(m.note)toast(m.note,2.5);}
   else if(m.t==='meritRank')refuge.rank(m.rows);
   else if(m.t==='refuge')refuge.update(m);
   else if(m.t==='notice')toast(m.text,3);
   else if(m.t==='kick'){kicked=true;toast(m.reason,30);}
  };
  ws.onclose=()=>{refuge.disconnect();social.disconnected();if(kicked)return;retry=Math.min(retry+1,6);toast('Mất kết nối, đang kết nối lại…',3);setTimeout(connect,500*2**retry);};
 }
 connect();

 o.elevator.bind({get:()=>({x,y,z,enabled:true}),set:(nx,ny,nz)=>{x=nx;y=ny;z=nz;},onBoard:()=>{auto=false;runLock=false;listenSeat=null;setAct('idle');paintCtrl();}});
 // ---- 🎬 film camera for "Tự đi lễ" (CinemaDirector) ----
 const skipCine=(m:import('@babylonjs/core').AbstractMesh)=>!m.isEnabled()||!m.isVisible||m.visibility<.5||!m.getTotalVertices()||m.isDescendantOf(me.rig.root)||m.infiniteDistance||/cloud|halo|release-|prayer|player-|al-incense|sky|tag|water/i.test(m.name)||((m.material as {alpha?:number}|null)?.alpha??1)<1;
 const director=new CinemaDirector(scene,(cx,cz,cy)=>Math.max(supportHeight(cx,cz,cy),towerSupport(cx,cz,cy),entranceWalkY(cx,cz)),skipCine);
 const footR=(g:typeof ALL_GARDEN_STATUES[number])=>g.group==='king'?23:g.width||g.depth?Math.max(g.width??0,g.depth??0)/2+(g.group==='front-triad'?2:1):Math.max(3,g.height*.32);
 director.blockers=ALL_GARDEN_STATUES.filter(g=>g.group!=='upper').map(g=>({x:g.x,z:g.z,r:footR(g),top:(g.base??0)+g.height*.9}));
 const bars=document.createElement('div');bars.id='al-cine-bars';bars.innerHTML='<i></i><i></i>';document.body.append(bars);
 const barStyle=document.createElement('style');barStyle.textContent='#al-cine-bars{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .8s}#al-cine-bars.on{opacity:1}#al-cine-bars i{position:absolute;left:0;right:0;height:7vh;background:#000}#al-cine-bars i:first-child{top:0}#al-cine-bars i:last-child{bottom:0}';document.head.append(barStyle);
 let cinePause=0;canvas.addEventListener('pointerdown',()=>{if(director.active){cinePause=performance.now()+12000;toast('Máy quay bám theo anh/chị · 12 giây nữa quay phim tiếp',2.5);}});
 /** What the pilgrim is visiting now, for framing: the statue itself (nearest garden statue to an altar), a prayer wheel, or the stupa. */
 function cineFocus(stop?:TourStop):CineFocus|undefined{
  if(!stop)return;if(stop.kind==='tower')return{x:0,y:0,z:330,h:40};
  const s=stop.statue??ALL_GARDEN_STATUES.filter(g=>g.group!=='avenue'&&g.group!=='upper').map(g=>({g,d:Math.hypot(g.x-stop.x,g.z-stop.z)})).sort((a,b)=>a.d-b.d).find(v=>v.d<35)?.g;
  if(s)return{x:s.x,y:s.base??0,z:s.z,h:s.height,r:footR(s)};
  return{x:stop.x,y:stop.site?.floor??0,z:stop.z-(stop.kind==='wheel'?3:4),h:stop.kind==='wheel'?10:6};
 }
 function runCinema(dt:number,now:number){
  const step=script[0],want=touring&&cineOn&&!!step&&now>cinePause;
  if(!want){if(director.active){director.stop();document.body.classList.remove('al-cine');scene.activeCamera=orbit;bars.classList.remove('on');me.quietPrayer(false);hiddenSelf=eyeView||orbit.radius<1.1;me.rig.root.setEnabled(!hiddenSelf);}return;}
  if(!director.active){director.start();bars.classList.add('on');document.body.classList.add('al-cine');}
  // up on the stupa (walking its top gallery included) the tower shots are used: inside the gallery there is no room for a crew
  const onTower=y>20&&Math.hypot(x-STUPA.x,z-STUPA.z)<STUPA.radius+4;
  const phase:CinePhase='lift' in step?'lift':'look' in step||onTower?'look':'act' in step?'ritual':'walk';
  scene.activeCamera=director.update(dt,{p:new Vector3(x,y,z),yaw,phase,focus:cineFocus(tourStop),tower:{x:STUPA.x,z:STUPA.z}});
  me.rig.root.setEnabled(true);me.quietPrayer(true);
 }
 // ---- 🛕 flycam tour ----
 const flyCam=new UniversalCamera('al-flytour',new Vector3(0,30,700),scene);flyCam.inputs.clear();flyCam.minZ=.3;flyCam.maxZ=5000;
 const veil=document.createElement('div');veil.id='al-fly-veil';document.body.append(veil);
 const veilStyle=document.createElement('style');veilStyle.textContent='#al-fly-veil{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:5;transition:opacity .9s}#al-fly-veil.on{opacity:1}#al-fly-cap{position:fixed;left:max(20px,4vw);bottom:calc(7vh + 64px);z-index:6;pointer-events:none;color:#f3dfa6;font:600 clamp(20px,3vw,34px) "Noto Serif",Georgia,serif;text-shadow:0 2px 6px #000a;opacity:0;transition:opacity 1.6s}#al-fly-cap small{display:block;color:#fff;font:400 clamp(13px,1.6vw,18px) "Segoe UI",sans-serif;margin-top:4px}#al-fly-cap.on{opacity:1}body.al-flying #al-hud,body.al-flying #al-acts,body.al-flying #al-ctrl,body.al-flying #al-toast{opacity:.18;transition:opacity 1s}body.al-flying #al-ctx{display:none}body.al-flying #al-ctrl:hover,body.al-flying #al-acts:hover{opacity:1}';document.head.append(veilStyle);
 const cap=document.createElement('div');cap.id='al-fly-cap';document.body.append(cap);let capT=0;
 function startFly(){haltForRitual();stopTour();flying=true;flyT=0;flyWall=0;flyStep=1/60;flyWalkT=1.2;flyChap='';paintTour();veil.classList.add('on');document.body.classList.add('al-flying');
  setTimeout(()=>{if(!flying)return;me.rig.root.setEnabled(false);me.quietPrayer(true);bars.classList.add('on');veil.classList.remove('on');},900);
  toast('🛕 Tự đi lễ: bay tham quan toàn chùa · chạm phím, cần điều khiển hoặc kéo màn hình để dừng',4);}
 function stopFly(say=false){if(!flying)return;flying=false;paintTour();scene.activeCamera=orbit;bars.classList.remove('on');veil.classList.remove('on');cap.classList.remove('on');document.body.classList.remove('al-flying');
  me.quietPrayer(false);hiddenSelf=eyeView||orbit.radius<1.1;me.rig.root.setEnabled(!hiddenSelf);if(say)toast('Đã dừng tham quan',2);}
 canvas.addEventListener('pointerdown',()=>{if(flying)stopFly(true);});
 // Flight clock (anh Thanh 2026-11-06: "giật khung hình từng giây"): the game's frame step is capped at 50 ms, so on a busy
 // device every slow frame held the drone still and the whole flight ran slow. The flycam follows the real clock instead, with
 // the frame step low-passed so uneven frame timing doesn't make the speed flutter, and a gentle pull back to the wall clock.
 let flyWall=0,flyStep=1/60,flyWalkT=0;
 function runFly(_dt:number){
  if(!flying)return;const now=performance.now()/1000;if(!flyWall)flyWall=now;const raw=Math.min(.25,Math.max(0,now-flyWall));flyWall=now;
  flyStep+=(raw-flyStep)*.15;const step=Math.max(0,flyStep+(raw-flyStep)*.25);flyT=(flyT+step)%FLY_PERIOD;const dt=raw;const v=flyAt(flyT);
  // The pilgrim travels with the drone, unseen (anh Thanh 2026-11-06: stopping must leave you where the flight was, not back at
  // the start): a few times a second they step to clear ground under the camera, so the stop hands control over right there
  // (and other pilgrims online see them going round the temple).
  flyWalkT-=dt;if(flyWalkT<=0){flyWalkT=.4;const c={x:v.p[0],z:v.p[2]},clear=(q:{x:number;z:number})=>!onRiver(q)&&routeClear(q,{x:q.x+.3,z:q.z})&&routeClear(q,{x:q.x,z:q.z+.3});
   let at:{x:number;z:number}|null=clear(c)?c:null;if(!at)for(const r of [1.5,3,5])for(let k=0;k<8&&!at;k++){const a=k/8*Math.PI*2,q={x:c.x+Math.sin(a)*r,z:c.z+Math.cos(a)*r};if(clear(q))at=q;}
   if(at){x=at.x;z=at.z;y=Math.max(0,entranceWalkY(x,z),supportHeight(x,z,1.25));yaw=Math.atan2(v.l[0]-v.p[0],v.l[2]-v.p[2]);sendState(true);}}
  flyCam.position.set(v.p[0],v.p[1],v.p[2]);flyCam.setTarget(new Vector3(v.l[0],v.l[1],v.l[2]));flyCam.fov=v.fov;flyCam.minZ=Math.min(1.2,.3+Math.max(0,v.p[1]-8)/150);
  if(!veil.classList.contains('on'))scene.activeCamera=flyCam;
  const c=flyChapter(flyT);if(c.title!==flyChap){flyChap=c.title;cap.innerHTML=`${c.title}<small>${c.line}</small>`;cap.classList.add('on');capT=7;}
  if(capT>0){capT-=dt;if(capT<=0)cap.classList.remove('on');}
 }
 // ---- per frame ----
 let last=performance.now(),sendT=0,hudT=0,wantR=orbit.radius,hiddenSelf=false;
 const camFollow={p:new Vector3(),v:new Vector3(),vel:new Vector3(),last:new Vector3(),ready:false};
 // Even frame rate (anh Thanh 2026-11-03: looking ahead across the whole temple stuttered, looking down was smooth): the render
 // Resolution changes only after sustained load; keep a firm sharpness floor and ignore loading stalls.
 {const engine=scene.getEngine(),low=new URLSearchParams(location.search).get('q')==='low';let limits=renderResolution(devicePixelRatio,innerWidth,innerHeight,low),level=limits.best,acc=0,frames=0;
  engine.setHardwareScalingLevel(level);
  window.addEventListener('resize',()=>{limits=renderResolution(devicePixelRatio,innerWidth,innerHeight,low);level=limits.best;engine.setHardwareScalingLevel(level);});
  scene.onAfterRenderObservable.add(()=>{if(document.hidden){acc=0;frames=0;return;}const ms=engine.getDeltaTime();if(ms>250)return;acc+=ms;frames++;if(acc<3000)return;const fps=frames*1000/acc;acc=0;frames=0;
   if((flying||director.active)&&fps>14)return;   // no resolution jumps mid-flight unless the device really struggles
   const next=nextResolution(level,fps,limits.best,limits.worst);if(Math.abs(next-level)>1e-3){level=next;engine.setHardwareScalingLevel(level);}});}
 scene.onBeforeRenderObservable.add(()=>{
  const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
  // movement relative to the camera
  let f=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),r=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  if(joyV.on){f=-joyV.y;r=joyV.x;}
  if(keys.has('KeyS')||keys.has('ArrowDown')){if(auto){auto=false;runLock=false;paintCtrl();}}else if(auto&&!joyV.on&&f===0)f=1;
  const mag=Math.min(1,Math.hypot(f,r));
  let scripted:{mx:number;mz:number;speed?:number}|null=null;
  if(flying&&(mag>.12||auto))stopFly(true);
  if((script.length||tamBo)&&(mag>.12||auto)){script=[];me.quietPrayer(false);if(touring){touring=false;paintTour();toast('Đã dừng tự đi lễ · anh/chị tự điều khiển',2.5);}if(tamBo){tamBo=false;paintTamBo();toast('Đã dừng tam bộ nhất bái',2);}if(STILL_ACTS.has(act))setAct('idle');}
  else if(script.length&&!o.elevator.active)scripted=scriptTick(dt);
  if(touring&&!script.length)planTour();
  if(tamBo&&!script.length)runScript(tamBoSteps({x,z},yaw));
  if((mag>.12||scripted)&&!o.elevator.active){
   if(STILL_ACTS.has(act))setAct('idle');
   const fx=-Math.cos(orbit.alpha),fz=-Math.sin(orbit.alpha),mx=scripted?scripted.mx:(fx*f+fz*r)/(Math.hypot(f,r)||1),mz=scripted?scripted.mz:(fz*f-fx*r)/(Math.hypot(f,r)||1);
   const running=!scripted&&(runLock||keys.has('ShiftLeft')||keys.has('ShiftRight')||(joyV.on&&mag>.9)),speed=scripted?.speed?scripted.speed:(running?NET.run:NET.walk)*(joyV.on&&!auto?Math.max(.35,mag):1);
   let nx=x+mx*speed*dt,nz=z+mz*speed*dt;[nx,nz]=towerResolveMotion(x,z,nx,nz,y);[nx,nz]=resolveCircle(nx,nz,.3,y,1.7);
   const origin={x,y,z};
   for(const remote of remotes.values()){
    const latest=remote.buf.at(-1);
    if(!latest||now-remote.seen>=1500)continue;
    if(remote.p.rig.root.isEnabled())[nx,nz]=stopAtPlayer(origin,nx,nz,remote.p.position);
    [nx,nz]=stopAtPlayer(origin,nx,nz,latest);
   }
   {const c=clampWorld(nx,y,nz);nx=c.x;nz=c.z;}x=nx;z=nz;yaw=lerpAngle(yaw,Math.atan2(mx,mz),Math.min(1,dt*10));
   const want:Act=running?'run':'walk';if(act!==want)setAct(want);
  }else if(act==='walk'||act==='run')setAct('idle');
  if(actUntil&&now>actUntil)setAct('idle');
  const support=Math.max(supportHeight(x,z,y),towerSupport(x,z,y)),target=listenSeat!==null&&act==='sit'?1.345:Math.max(entranceWalkY(x,z),Number.isFinite(support)?support:-Infinity);if(!o.elevator.active)y=listenSeat!==null&&act==='sit'?target:entranceFeetY(x,z,y,support,dt);
  me.place(x,y,z,yaw);me.update(dt);offerings.update(dt,Date.now()+clockOffset,orbit.target);
  // Smooth follow (anh Thanh 2026-11-03: the camera jerked on every step, stair and frame hitch; also used for live streams):
  // the target eases toward the pilgrim (fast sideways, softer up/down so stairs and steps don't bounce the view); big jumps snap.
  // "Flying" camera (anh Thanh 2026-11-03): a critically damped spring follows the pilgrim, fed with a low-passed velocity so a
  // steady walk/run stays centred (no lag), while frame hitches and the few-centimetre steps of paving are smoothed away.
  {const want=new Vector3(x,y+(eyeView?eyeSettings.height:act==='sit'?.9:1.45),z),t=orbit.target,c=camFollow;
   if(eyeView||Vector3.DistanceSquared(t,want)>36||!c.ready){t.copyFrom(want);c.p.copyFrom(want);c.v.setAll(0);c.vel.setAll(0);c.last.copyFrom(want);c.ready=true;}
   else if(dt>0){const meas=want.subtract(c.last).scaleInPlace(1/dt);c.last.copyFrom(want);c.vel.addInPlace(meas.subtractInPlace(c.vel).scaleInPlace(1-Math.exp(-dt*4)));
    const spring=(axis:'x'|'y'|'z',w:number,goal:number)=>{const e=c.p[axis]-goal,a=-w*w*e-2*w*c.v[axis];c.v[axis]+=a*dt;c.p[axis]+=c.v[axis]*dt;};
    const ahead=2/5;spring('x',5,want.x+c.vel.x*ahead);spring('z',5,want.z+c.vel.z*ahead);spring('y',3.2,want.y);
    // never drift far from the pilgrim, whatever the frame rate
    const off=new Vector3(c.p.x-want.x,0,c.p.z-want.z),m=off.length();if(m>2.5){c.p.x=want.x+off.x/m*2.5;c.p.z=want.z+off.z/m*2.5;}
    t.copyFrom(c.p);}}
  // Looking up: below the horizon the camera slides in toward the head so it never sinks under the floor;
  // close in, the player's own body hides (first-person view of ceilings and statue tops).
  if(lookTo!==null){orbit.beta+=(lookTo-orbit.beta)*Math.min(1,dt*4);if(Math.abs(lookTo-orbit.beta)<.01)lookTo=null;}
  // Depth precision up high (anh Thanh 2026-11-05: from the stupa the stone courtyards were smeared black — paving and ground
  // fighting at 500 m with a 0.2 m near plane): the higher the camera, the further out the near plane, never past the pilgrim.
  {const h=Math.max(0,orbit.position.y-8);orbit.minZ=eyeView?Math.min(.7,.2+h/250):Math.max(.2,Math.min(1.5,orbit.radius*.6,.2+h/100));}
  if(!eyeView&&orbit.beta<1.45)wantR=orbit.radius;const eyeAbove=act==='sit'?.6:1.15,maxR=orbit.beta>Math.PI/2?eyeAbove/Math.max(.05,-Math.cos(orbit.beta)):99;
  {const goal=eyeView?.02:Math.max(.25,Math.min(wantR,maxR));orbit.radius=eyeView||goal<orbit.radius-1.5?goal:orbit.radius+(goal-orbit.radius)*(1-Math.exp(-dt*10));}const firstPerson=eyeView||orbit.radius<1.1;if(firstPerson!==hiddenSelf){hiddenSelf=firstPerson;me.rig.root.setEnabled(!firstPerson);}
  runCinema(dt,now);runFly(dt);
  // remote pilgrims, rendered 120 ms in the past between two snapshots
  // render others a little in the past, between two snapshots: 120 ms at 10/s, more when a big crowd gets 5/s
  const rt=now-Math.max(120,Math.min(400,snapGap*1.7));
  for(const rem of remotes.values()){const b=rem.buf;if(!b.length){continue;}rem.p.rig.root.setEnabled(now-rem.seen<1500);
   let i=b.length-1;while(i>0&&b[i-1].t>rt)i--;const a=b[Math.max(0,i-1)],c=b[i],k=c.t===a.t?1:Math.min(1,Math.max(0,(rt-a.t)/(c.t-a.t)));
   rem.p.place(a.x+(c.x-a.x)*k,a.y+(c.y-a.y)*k,a.z+(c.z-a.z)*k,lerpAngle(a.yaw,c.yaw,k));const an=actName(c.a);if(rem.p.current!==an)rem.p.setAct(an);rem.p.update(dt);}
  sendT+=dt;if(sendT>=(online>250?.2:1/NET.sendHz)){sendT=0;sendState();}   // big crowds: 5 updates a second (server load)
  hudT-=dt;if(hudT<=0){hudT=.25;const site=nearIncense({x,y,z}),wheel=PRAYER_WHEEL_SITES.find(s=>canReachWheel({x,y,z},s,true));
   bIncense.hidden=!site;bIncense.classList.toggle('hot',!!site);if(site)bIncense.textContent='🪔 Thắp nhang · '+site.label;bWheel.hidden=!wheel;bWheel.classList.toggle('hot',!!wheel);
   hud.innerHTML=`<b>Chùa An Liên</b><span>${escapeHtml(o.me.name)} · Công đức ${meritTotal(merit)}</span>${towerProgress(x,z,y)?'<span>Tháp · tầng '+towerProgress(x,z,y)!.floor+'/18 · bậc '+towerProgress(x,z,y)!.step+'/'+towerProgress(x,z,y)!.total+'</span>':''}`;}
  if(toastT>0){toastT-=dt;if(toastT<=0)toastEl.style.opacity='0';}
 });
 setAct('idle');canvas.tabIndex=0;canvas.focus();
}
const escapeHtml=(s:string)=>s.replace(/[&<>"']/g,c=>`&#${c.charCodeAt(0)};`);
