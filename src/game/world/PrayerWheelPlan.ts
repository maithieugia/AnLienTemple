/** Metres, local to the standalone sanctuary. Drum radius excludes its stepped plinth. */
export const PRAYER_WHEEL={height:100,radius:25,bodyBottom:.08,bodyTop:96.4,plinthRadius:26,interactionRadius:30.5,rows:720,phrasesPerRow:200};
export const PRAYER_WHEEL_SITES=[{id:'west',label:'Kinh luân Tây',x:-195,z:388},{id:'east',label:'Kinh luân Đông',x:195,z:388}]as const;
export type WheelId=typeof PRAYER_WHEEL_SITES[number]['id'];
export const MANTRA='ॐ मणि पद्मे हूँ';
export const MERIT_KEY='anlien.prayer-merit.v1';
export type MeritSave={version:1;turns:Record<WheelId,number>};
export function parseMerit(raw:string|null):MeritSave{try{const s=JSON.parse(raw??'null');if(s?.version===1&&['west','east'].every(k=>Number.isSafeInteger(s.turns?.[k])&&s.turns[k]>=0&&s.turns[k]<=1e9))return{version:1,turns:{west:s.turns.west,east:s.turns.east}};}catch{}return{version:1,turns:{west:0,east:0}};}
export function canReachWheel(p:{x:number;y?:number;z:number},site:{x:number;z:number},walking:boolean){const d=Math.hypot(p.x-site.x,p.z-site.z);return walking&&d>=PRAYER_WHEEL.plinthRadius-.35&&d<=PRAYER_WHEEL.interactionRadius&&(p.y??0)>=-.5&&(p.y??0)<3;}
/** Angular travel is integrated exactly under constant bearing friction. No idle/offline awards. */
export class WheelMotion{
 speed=0;angle=0;remainder=0;private cooldown=0;
 push(){if(this.cooldown>0)return false;this.speed=Math.min(1.65,this.speed+1.2);this.cooldown=.7;return true;}
 tick(dt:number){if(!Number.isFinite(dt)||dt<=0)return 0;this.cooldown=Math.max(0,this.cooldown-dt);const t=Math.min(dt,this.speed/.055),end=Math.max(0,this.speed-.055*t),travel=(this.speed+end)*.5*t;this.speed=end;this.angle=(this.angle+travel)%(Math.PI*2);this.remainder+=travel;const turns=Math.floor((this.remainder+1e-10)/(Math.PI*2));this.remainder-=turns*Math.PI*2;return turns;}
}

/** Closed, full-height circular perimeter; no old small invisible collider remains inside. */
export function prayerWheelObstacles(site:{x:number;z:number}){return Array.from({length:64},(_,i)=>{const a=(i+.5)/64*Math.PI*2,r=PRAYER_WHEEL.plinthRadius-.18;return{cx:site.x+Math.cos(a)*r,cz:site.z+Math.sin(a)*r,hx:Math.PI*PRAYER_WHEEL.plinthRadius/64+.05,hz:.2,yaw:-a-Math.PI/2,base:0,h:PRAYER_WHEEL.height,sight:true,climb:false};});}
