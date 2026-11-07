/**
 * "Tự đi lễ" as a slow drone flight round the whole temple (anh Thanh 2026-11-06): no avatar on screen, only the temple and the
 * pilgrims in it. One continuous route in six chapters — the riverside panorama and a slow turn on the bridge, the tam quan gate
 * and Di Lặc, a full circle round the open-air Amitabha, the Heavenly Kings and the golden triad, the main hall past its rows of
 * statues, and a rising spiral round the stupa — joined by gentle transfer flights, then back to the start.
 * Position, look point and lens follow a time-parameterised Hermite (Catmull-Rom) spline: speed and heading never jump.
 * Pure data and maths (no renderer), shared with the film capture.
 */
export type Vec=[number,number,number];
export type FlyKey={t:number;p:Vec;l:Vec;f:number};
const K=(t:number,p:Vec,l:Vec,f=.85):FlyKey=>({t,p,l,f});
const ring=(cx:number,cz:number,r:number,a:number):[number,number]=>[cx+Math.cos(a)*r,cz+Math.sin(a)*r];
/** A circle round `c`: radius r0→r1, height y0→y1, angle a0→a0+turn, looking at the centre at height ly0→ly1. */
function orbit(t0:number,t1:number,c:[number,number],r0:number,r1:number,y0:number,y1:number,a0:number,turn:number,ly0:number,ly1:number,f=.85,n=10){
 return Array.from({length:n+1},(_,i)=>{const u=i/n,[x,z]=ring(c[0],c[1],r0+(r1-r0)*u,a0+turn*u);return K(t0+(t1-t0)*u,[x,y0+(y1-y0)*u,z],[c[0],ly0+(ly1-ly0)*u,c[1]],f);});
}
/** Standing still at p and turning slowly once round (eased), looking out at distance r. */
function spin(t0:number,t1:number,p:Vec,r:number,y:number,n=16){
 return Array.from({length:n+1},(_,i)=>{const u=i/n,e=u*u*(3-2*u),a=Math.PI*2*e;return K(t0+(t1-t0)*u,p,[p[0]+Math.sin(a)*r,y,p[2]-Math.cos(a)*r],.85);});
}
const shift=(keys:FlyKey[],dt:number,k=1)=>keys.map(q=>({...q,t:dt+q.t*k}));
// ---- the six chapters (local times) ----
const C1=[K(0,[-92,24,702],[-62,24,470],.95),K(9,[0,25,704],[12,26,465],.95),K(18,[92,26,704],[110,32,440],.95),
 K(24,[55,44,722],[20,16,480],.9),K(29.5,[0,52,722],[0,14,520],.88),K(35.5,[0,20,706],[0,9,640],.85),K(40,[0,11.6,690],[0,10.5,620],.82),K(45.5,[0,11.6,649],[0,11,584],.82),K(47.5,[0,11.6,643.3],[0,11,584],.82),
 ...spin(49.5,71,[0,11.6,642],60,11)];
const C2=[K(4,[0,11,600],[0,11.5,540],.82),K(7.5,[0,10.5,556],[0,9.5,495],.82),K(10.5,[-7,5,520],[0,8,492],.8),K(13,[-5,2.4,508],[0,10.5,492],.74),
 ...orbit(14.5,24,[0,492],16.5,21,3,15,Math.atan2(16,-5),-2.4,10,9,.78,8),K(27,[14,22,470],[0,14,400],.85),K(30,[10,27,452],[0,17,388],.88)];
const C3=orbit(0,30,[0,388],46,40,6,30,Math.PI/2,Math.PI*2,9,18,.8,12);
const C4=[K(0,[-268,2.2,292],[-300,6,268],.8),K(4,[-266,18,294],[-300,26,268],.78),K(8,[-262,44,296],[-300,46,268],.75),K(12.5,[-252,60,372],[-240,30,470],.85),
 K(17,[-222,48,505],[-150,30,568],.85),K(21,[-128,24,628],[-140,26,568],.84),K(25.5,[-150,20,630],[-156,25,568],.84),K(30,[-192,19,624],[-168,24,568],.84)];
const C5=[K(0,[0,8,330],[0,7,200],.85),K(4.5,[0,7.5,250],[0,8,120],.85),K(8.5,[0,7,190],[0,10,40],.85),K(12.5,[38,6,48],[60,5,12],.8),K(17,[60,5.5,30],[84,5,12],.78),
 K(21,[-20,6,32],[-56,5,12],.78),K(25,[-62,6,34],[-84,6,12],.8),K(28,[-24,14,20],[0,22,-45],.85),K(30,[-6,20,14],[0,28,-45],.85)];
const C6=[...orbit(0,22,[480,240],86,74,8,196,Math.PI*.95,Math.PI*2,10,175,.82,16),K(26,[430,215,330],[200,20,300],.9),K(30,[380,200,380],[40,10,300],.9)];
/** Chapter starts on the authored route (before the calm-pace retiming below). */
const CHAPTERS=[
 {t:0,title:'Đường vào chùa',line:'Bờ sông · cầu đá · toàn cảnh chùa An Liên'},
 {t:71,title:'Tam quan · Phật Di Lặc',line:'Nụ cười hoan hỷ đón khách thập phương'},
 {t:137,title:'Đài Phật A Di Đà',line:'Giữa sân chùa, giữa trời mây'},
 {t:213,title:'Tứ Thiên Vương · Tam Thánh',line:'Uy nghi giữa đất trời'},
 {t:291,title:'Chánh điện',line:'Chư Phật, chư Bồ Tát an tọa'},
 {t:380,title:'Tháp Phù Đồ 18 tầng',line:'Ngắm toàn cảnh chùa từ trên cao'},
];
/** Length of the authored route (s). */
const AUTHORED=470;
export const FLY_KEYS:FlyKey[]=[
 ...C1,
 K(74.5,[0,11.55,638.8],[0,11,580],.82),                     // ease away from the turn on the bridge
 ...shift(C2,71,2),                                              // 71 → 131
 K(134,[6,16,444],[0,10,388],.82),                              // settle down beside the Amitabha plaza
 ...shift(C3,137,2),                                             // 137 → 197: one full circle
 K(203,[-120,44,330],[-300,30,268],.88),K(208,[-230,22,300],[-300,14,268],.84),   // over to the Eastern Heavenly King
 ...shift(C4,213,2),                                             // 213 → 273
 K(280,[-110,34,520],[0,12,330],.88),K(286,[-20,16,380],[0,8,250],.86),            // back across the courtyard to the censer
 ...shift(C5,291,2),                                             // 291 → 351: into the main hall
 K(355,[10,22,70],[50,18,160],.85),K(361,[0,24,190],[90,30,300],.86),K(370,[200,70,320],[480,90,240],.88),  // turn round and out of the portal
 ...shift(C6,380,2),                                             // 380 → 440: spiral up the stupa
 K(452,[160,130,620],[0,20,560],.9),K(462,[-60,40,712],[-40,24,470],.92),           // glide back to the river
 K(AUTHORED,[-92,24,702],[-62,24,470],.95),
];
/** Hermite interpolation with Catmull-Rom tangents scaled to the time gaps (C¹: no jolts at keys). */
function spline(get:(k:FlyKey)=>number[],t:number):number[]{

 const keys=FLY_KEYS,n=keys.length;if(t<=keys[0].t)return get(keys[0]);if(t>=keys[n-1].t)return get(keys[n-1]);
 let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(keys[m].t<=t)lo=m;else hi=m;}
 const k0=keys[lo],k1=keys[lo+1],h=k1.t-k0.t,u=(t-k0.t)/h;
 const tan=(j:number)=>{const a=keys[Math.max(0,j-1)],b=keys[Math.min(n-1,j+1)],pa=get(a),pb=get(b),dt=b.t-a.t;return pa.map((v,q)=>(pb[q]-v)/dt);};
 const p0=get(k0),p1=get(k1),m0=tan(lo),m1=tan(lo+1),u2=u*u,u3=u2*u,h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
 return p0.map((v,q)=>h00*v+h10*h*m0[q]+h01*p1[q]+h11*h*m1[q]);
}
const authoredAt=(t:number)=>({p:spline(q=>q.p,t) as Vec,l:spline(q=>q.l,t) as Vec,fov:spline(q=>[q.f],t)[0]});
/**
 * Calm pace (anh Thanh 2026-11-06: "chậm, thanh tịnh, điềm đạm, cực mượt"): wherever the authored route would move faster than
 * MAX_SPEED or turn the view faster than MAX_TURN, time is stretched; the stretch factor is itself smoothed over a few seconds,
 * so the camera eases into and out of the slower stretches instead of braking.
 */
export const MAX_SPEED=8,MAX_TURN=12;
/** The opening (bank, bridge, slow turn) is wide and far from everything: there the flight may run brisker (anh Thanh
 * 2026-11-06: "cảnh quay đầu chậm quá"), easing back to the calm limits as it enters the gate. */
const OPEN_END=71,OPEN_EASE=10,OPEN={speed:14,turn:22,pace:.75};
const limits=(a:number)=>{const k=Math.min(1,Math.max(0,(a-OPEN_END)/OPEN_EASE)),e=k*k*(3-2*k);
 return{speed:OPEN.speed+(MAX_SPEED-OPEN.speed)*e,turn:OPEN.turn+(MAX_TURN-OPEN.turn)*e,pace:OPEN.pace+(1-OPEN.pace)*e};};
const STEP=.05,N=Math.round(AUTHORED/STEP);
const WARP=(()=>{
 const rate=new Float64Array(N);let prev=authoredAt(0);
 for(let i=0;i<N;i++){const c=authoredAt((i+1)*STEP),v=Math.hypot(c.p[0]-prev.p[0],c.p[1]-prev.p[1],c.p[2]-prev.p[2])/STEP;
  const d0=[prev.l[0]-prev.p[0],prev.l[1]-prev.p[1],prev.l[2]-prev.p[2]],d1=[c.l[0]-c.p[0],c.l[1]-c.p[1],c.l[2]-c.p[2]];
  const cos=(d0[0]*d1[0]+d0[1]*d1[1]+d0[2]*d1[2])/((Math.hypot(...d0)*Math.hypot(...d1))||1),w=Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI/STEP;
  const lim=limits((i+.5)*STEP);rate[i]=Math.max(lim.pace,v/lim.speed,w/lim.turn);prev=c;}
 // smooth the stretch: running maximum over ±1.5 s, then two box blurs over ±2 s
 const R=Math.round(1.5/STEP),B=Math.round(2/STEP),mx=new Float64Array(N);for(let i=0;i<N;i++){let m=0;for(let j=Math.max(0,i-R);j<=Math.min(N-1,i+R);j++)m=Math.max(m,rate[j]);mx[i]=m;}
 const blur=(a:Float64Array)=>{const o=new Float64Array(N);let s=0;for(let j=0;j<=Math.min(N-1,B);j++)s+=a[j];for(let i=0;i<N;i++){const lo=i-B-1,hi=i+B;if(hi<N&&i>0)s+=a[hi];if(lo>=0)s-=a[lo];o[i]=s/(Math.min(N-1,hi)-Math.max(0,lo+1)+1);}return o;};
 const sm=blur(blur(mx)),cum=new Float64Array(N+1);for(let i=0;i<N;i++)cum[i+1]=cum[i]+STEP*sm[i];return cum;
})();
/** Time for one full round at the calm pace (s); the flight then starts again. */
export const FLY_PERIOD=WARP[N];
/** Authored time for a calm-pace time. */
function authoredTime(t:number){const k=((t%FLY_PERIOD)+FLY_PERIOD)%FLY_PERIOD;let lo=0,hi=N;while(hi-lo>1){const m=(lo+hi)>>1;if(WARP[m]<=k)lo=m;else hi=m;}const f=(k-WARP[lo])/((WARP[lo+1]-WARP[lo])||1);return(lo+f)*STEP;}
/** Calm-pace time of an authored time. */
const calmTime=(a:number)=>{const i=Math.min(N-1,Math.floor(a/STEP)),f=a/STEP-i;return WARP[i]+(WARP[i+1]-WARP[i])*f;};
/** Chapter starts on the calm-pace route, with the caption shown as each begins. */
export const FLY_CHAPTERS=CHAPTERS.map(c=>({...c,t:calmTime(c.t)}));
/** Camera at calm-pace time t (seconds, wraps every FLY_PERIOD). */
export function flyAt(t:number){return authoredAt(authoredTime(t));}
/** Which chapter is playing at time t. */
export function flyChapter(t:number){const k=((t%FLY_PERIOD)+FLY_PERIOD)%FLY_PERIOD;let c=FLY_CHAPTERS[0];for(const x of FLY_CHAPTERS)if(k>=x.t)c=x;return c;}
