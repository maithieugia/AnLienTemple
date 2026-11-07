import {UniversalCamera,Vector3,Ray,type Scene,type AbstractMesh,type Camera} from '@babylonjs/core';

/**
 * "Tự đi lễ" as a film (anh Thanh 2026-11-06): while the pilgrim does the round, a director camera cuts between shots the way a
 * film crew would — tracking alongside, a leading shot walking backwards, crane up, drone orbit and reveal, low hero angle, bird's eye,
 * establishing the next statue, tilt up from the pilgrim's back to the statue's face, profile close-up, reverse shot from the statue,
 * an arc round pilgrim and statue, a dolly-out reveal, the lift climbing the stupa, and drone shots off the top of the tower.
 * Shots are picked from what the pilgrim is doing; a shot that gets blocked by a wall or statue is cut short, and the camera never
 * goes under the ground.
 */
/** The statue or place being visited: base point, height and the radius of its plinth/footprint (the camera stays outside it). */
export type CineFocus={x:number;y:number;z:number;h:number;r?:number};
export type CinePhase='walk'|'ritual'|'lift'|'look';
export type CineState={p:Vector3;yaw:number;phase:CinePhase;focus?:CineFocus;tower?:{x:number;z:number}};
type Frame={pos:Vector3;look:Vector3;fov:number};
type Anchor={p0:Vector3;yaw0:number;side:number;a0:number;fixed?:Vector3};
type Shot={name:string;phase:CinePhase;dur:number;needs?:'focus'|'tower';/** extra condition for the shot to make sense here */ok?:(s:CineState)=>boolean;/** check the pilgrim stays in view */see?:boolean;at:(u:number,s:CineState,a:Anchor,sp:Vector3)=>Frame};

const V=(x:number,y:number,z:number)=>new Vector3(x,y,z);
const fwd=(yaw:number)=>V(Math.sin(yaw),0,Math.cos(yaw)),right=(yaw:number)=>V(Math.cos(yaw),0,-Math.sin(yaw));
const ease=(t:number)=>{const k=Math.max(0,Math.min(1,t));return k*k*(3-2*k);};
/** Quintic ease (zero speed and zero acceleration at both ends) for the blends between shots. */
const ease5=(t:number)=>{const k=Math.max(0,Math.min(1,t));return k*k*k*(k*(k*6-15)+10);};
/** Critically damped spring toward a goal (2nd order: the camera's speed never jumps, like a gimbal-held camera). */
function spring(x:Vector3,v:Vector3,goal:Vector3,w:number,dt:number){
 // semi-implicit, sub-stepped so a long frame cannot overshoot
 const n=Math.max(1,Math.ceil(dt/.016)),h=dt/n;for(let i=0;i<n;i++){const e=x.subtract(goal),acc=e.scale(-w*w).subtractInPlace(v.scale(2*w));v.addInPlaceFromFloats(acc.x*h,acc.y*h,acc.z*h);x.addInPlaceFromFloats(v.x*h,v.y*h,v.z*h);}}
/** Blend two camera frames: position along the eased line, view direction turned through the angle between them. */
function blendFrame(a:Frame,b:Frame,k:number):Frame{
 const pos=Vector3.Lerp(a.pos,b.pos,k),da=a.look.subtract(a.pos),db=b.look.subtract(b.pos),la=da.length()||1,lb=db.length()||1;
 const ua=da.scale(1/la),ub=db.scale(1/lb),dot=Math.max(-1,Math.min(1,Vector3.Dot(ua,ub))),om=Math.acos(dot);
 let dir:Vector3;if(om<1e-3)dir=Vector3.Lerp(ua,ub,k);else{const so=Math.sin(om);dir=ua.scale(Math.sin((1-k)*om)/so).addInPlace(ub.scale(Math.sin(k*om)/so));}
 return{pos,look:pos.add(dir.normalize().scale(la+(lb-la)*k)),fov:a.fov+(b.fov-a.fov)*k};}
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const ring=(c:Vector3,a:number,r:number,y:number)=>V(c.x+Math.cos(a)*r,y,c.z+Math.sin(a)*r);
const focusPoint=(f:CineFocus,k:number)=>V(f.x,f.y+f.h*k,f.z);
/** Facing of the pilgrim at a ritual: straight at the statue when there is one (more reliable than the body's yaw). */
const facing=(s:CineState,a:Anchor)=>{if(s.focus){const dx=s.focus.x-a.p0.x,dz=s.focus.z-a.p0.z;if(Math.hypot(dx,dz)>1)return Math.atan2(dx,dz);}return a.yaw0;};

export const SHOTS:Shot[]=[
 // ---- walking ----
 {name:'track-side',phase:'walk',dur:6,see:true,at:(u,s,a,p)=>{const f=fwd(s.yaw),r=right(s.yaw);return{pos:p.add(r.scale(a.side*4.2)).add(f.scale(.8-.6*u)).addInPlaceFromFloats(0,1.35,0),look:p.add(f.scale(1.2)).addInPlaceFromFloats(0,1.15,0),fov:.72};}},
 {name:'lead',phase:'walk',dur:5,see:true,at:(u,s,a,p)=>{const f=fwd(s.yaw);return{pos:p.add(f.scale(5.5-1.2*u)).addInPlaceFromFloats(0,1.55,0),look:p.add(V(0,1.3,0)),fov:.66};}},
 {name:'crane-up',phase:'walk',dur:7,see:true,at:(u,s,a,p)=>{const e=ease(u),f=fwd(a.yaw0),r=right(a.yaw0);return{pos:p.subtract(f.scale(3.5+12*e)).add(r.scale(a.side*1.5)).addInPlaceFromFloats(0,.5+15*e,0),look:p.add(f.scale(1.5+10*e)).addInPlaceFromFloats(0,1-.5*e,0),fov:lerp(.78,.95,e)};}},
 {name:'drone-orbit',phase:'walk',dur:8,at:(u,s,a,p)=>{const ang=a.a0+a.side*.75*u;return{pos:ring(p,ang,34-6*u,p.y+20-4*u),look:p.add(V(0,1.5,0)),fov:.9};}},
 {name:'low-hero',phase:'walk',dur:5,see:true,at:(u,s,a,p)=>{const fixed=a.fixed??(a.fixed=a.p0.add(fwd(a.yaw0).scale(8)).add(right(a.yaw0).scale(a.side*2.4)).addInPlaceFromFloats(0,.3,0));return{pos:fixed,look:p.add(V(0,1.45,0)),fov:.82};}},
 {name:'birds-eye',phase:'walk',dur:5,see:true,at:(u,s,a,p)=>{const off=ring(V(0,0,0),a.a0+.4*u,6.5,0);return{pos:p.add(off).addInPlaceFromFloats(0,12+3*u,0),look:p.add(fwd(s.yaw).scale(2.5)),fov:.72};}},
 {name:'establish',phase:'walk',dur:6,needs:'focus',at:(u,s,a,p)=>{const F=s.focus!,c=V(F.x,F.y,F.z),to=p.subtract(c);to.y=0;const d=to.length()||1;to.scaleInPlace(1/d);
  const back=c.add(to.scale(Math.max(d,F.h*.6)+F.h*.9+14)).add(right(Math.atan2(to.x,to.z)).scale(a.side*F.h*.5));back.y=F.y+F.h*.35+2;
  return{pos:back.add(to.scale(-8*u)),look:focusPoint(F,.45),fov:.85};}},
 {name:'follow',phase:'walk',dur:5,see:true,at:(u,s,a,p)=>{const f=fwd(s.yaw);return{pos:p.subtract(f.scale(5.2)).addInPlaceFromFloats(0,2.3,0),look:p.add(f.scale(3)).addInPlaceFromFloats(0,1.25,0),fov:.8};}},
 // ---- paying respects ----
 {name:'tilt-up',phase:'ritual',dur:7,needs:'focus',see:true,at:(u,s,a,p)=>{const e=ease(u),f=fwd(facing(s,a)),r=right(facing(s,a)),F=s.focus!,big=F.h>25;return{pos:a.p0.subtract(f.scale(1.4+(big?10.6:0))).add(r.scale(a.side*(big?4:2.6))).addInPlaceFromFloats(0,big?1.5:.95,0),look:Vector3.Lerp(a.p0.add(f.scale(2)).addInPlaceFromFloats(0,1.1,0),focusPoint(F,big?.55:.8),e),fov:lerp(.78,big?.8:.66,e)};}},
 {name:'profile',phase:'ritual',dur:6,see:true,at:(u,s,a,p)=>{const f=fwd(facing(s,a)),r=right(facing(s,a)),d=2.7-.8*ease(u);return{pos:a.p0.add(r.scale(a.side*d)).add(f.scale(.5)).addInPlaceFromFloats(0,.95,0),look:a.p0.add(f.scale(.25)).addInPlaceFromFloats(0,.85,0),fov:.55};}},
 {name:'statue-pov',phase:'ritual',dur:6,needs:'focus',see:true,ok:s=>!!s.focus&&Math.hypot(s.p.x-s.focus.x,s.p.z-s.focus.z)-(s.focus.r??0)>6,at:(u,s,a,p)=>{const F=s.focus!,c=V(F.x,F.y,F.z),to=a.p0.subtract(c);to.y=0;const d=to.length()||1;to.scaleInPlace(1/d);
  return{pos:c.add(to.scale(Math.min(d*.5,d-3))).addInPlaceFromFloats(0,F.y+Math.min(F.h*.25,5)+1.5*u-c.y,0),look:a.p0.add(V(0,.7,0)),fov:.5};}},
 {name:'arc',phase:'ritual',dur:8,needs:'focus',see:true,at:(u,s,a,p)=>{const F=s.focus!,c=Vector3.Lerp(a.p0,V(F.x,a.p0.y,F.z),.35),r=Vector3.Distance(a.p0,V(F.x,a.p0.y,F.z))*.55+7;
  const base=Math.atan2(a.p0.z-F.z,a.p0.x-F.x);return{pos:ring(c,base+a.side*(.35+1.1*ease(u)),r,a.p0.y+2.2+2*u),look:Vector3.Lerp(a.p0.add(V(0,1,0)),focusPoint(F,.4),.5),fov:.8};}},
 {name:'reveal-out',phase:'ritual',dur:8,needs:'focus',see:true,at:(u,s,a,p)=>{const e=ease(u),f=fwd(facing(s,a)),F=s.focus!;return{pos:a.p0.subtract(f.scale(1.6+18*e)).add(right(facing(s,a)).scale(a.side*(1.2+12*e))).addInPlaceFromFloats(0,3.4+9*e,0),look:Vector3.Lerp(a.p0.add(f.scale(1.5)).addInPlaceFromFloats(0,1,0),focusPoint(F,.45),e),fov:lerp(.6,.85,e)};}},
 {name:'hands',phase:'ritual',dur:4,see:true,at:(u,s,a,p)=>{const f=fwd(facing(s,a)),r=right(facing(s,a));return{pos:a.p0.add(f.scale(1.7)).add(r.scale(a.side*.5)).addInPlaceFromFloats(0,.85+.15*u,0),look:a.p0.add(V(0,.85,0)),fov:.5};}},
 // ---- the stupa ----
 {name:'tower-rise',phase:'lift',dur:30,needs:'tower',at:(u,s,a,p)=>{const T=s.tower!,ang=a.a0+.25*u;return{pos:ring(V(T.x,0,T.z),ang,105,p.y+8),look:V(T.x,p.y+2,T.z),fov:.85};}},
 {name:'tower-orbit',phase:'look',dur:8,needs:'tower',at:(u,s,a,p)=>{const T=s.tower!,ang=a.a0+a.side*.9*u;return{pos:ring(V(T.x,0,T.z),ang,62,p.y+14-4*u),look:p.add(V(0,1.2,0)),fov:.75};}},
 {name:'pull-out',phase:'look',dur:9,at:(u,s,a,p)=>{const e=ease(u),f=fwd(a.yaw0);return{pos:a.p0.add(f.scale(12+70*e)).addInPlaceFromFloats(0,7+30*e,0),look:Vector3.Lerp(a.p0.add(V(0,1.3,0)),a.p0.add(f.scale(260)).addInPlaceFromFloats(0,-a.p0.y,0),e*.85),fov:lerp(.7,.95,e)};}},
 {name:'temple-aerial',phase:'look',dur:9,needs:'focus',at:(u,s,a,p)=>{const F=s.focus!,c=V(F.x,0,F.z);return{pos:ring(c,a.a0+a.side*.35*u,330-50*u,190-30*u),look:c.add(V(0,4,0)),fov:.8};}},
 {name:'over-shoulder',phase:'look',dur:7,see:true,at:(u,s,a,p)=>{const f=fwd(a.yaw0),r=right(a.yaw0);return{pos:a.p0.subtract(f.scale(2.4)).add(r.scale(a.side*.7)).addInPlaceFromFloats(0,2.2,0),look:a.p0.add(f.scale(40)).addInPlaceFromFloats(0,-12-10*u,0),fov:.75};}},
];

export class CinemaDirector{
 readonly camera:UniversalCamera;
 private shot?:Shot;private anchor!:Anchor;private t=0;private recent:string[]=[];private phase?:CinePhase;private blocked=0;private probe=0;private sp?:Vector3;private rnd=1;
 /** what the camera shows now (smoothed), and the glide from the previous shot into the new one */
 private cur?:Frame;private from?:Frame;private glide=0;private glideDur=1.6;
 /** the previous shot keeps moving while the new one fades in (no freeze at the cut), and the camera's own velocity */
 private prev?:{shot:Shot;anchor:Anchor;t:number};private vPos=V(0,0,0);private vLook=V(0,0,0);private vFov=0;
/** Statue footprints the camera keeps out of. */
 blockers:{x:number;z:number;r:number;top:number}[]=[];
 private scene:Scene;private ground:(x:number,z:number,y:number)=>number;private skip:(m:AbstractMesh)=>boolean;
 constructor(scene:Scene,ground:(x:number,z:number,y:number)=>number,skip:(m:AbstractMesh)=>boolean){
  this.scene=scene;this.ground=ground;this.skip=skip;
  this.camera=new UniversalCamera('cine-director',V(0,10,0),scene);this.camera.minZ=.3;this.camera.maxZ=5000;this.camera.inputs.clear();
 }
 active=false;
 /** A planned shot list ("name" or "name:seconds"), used before random picks — for filming set pieces. */
 plan:string[]=[];
 start(){this.active=true;this.shot=undefined;this.phase=undefined;this.sp=undefined;this.cur=undefined;this.from=undefined;this.prev=undefined;this.vPos.setAll(0);this.vLook.setAll(0);this.vFov=0;}
 stop(){this.active=false;this.shot=undefined;}
 /** Name of the running shot (for tests and the HUD). */
 get current(){return this.shot?.name??'';}
 private random(){this.rnd=(this.rnd*16807)%2147483647;return(this.rnd-1)/2147483646;}
 private pick(s:CineState,avoid?:string){
  const fits=(sh:Shot)=>sh.phase===s.phase&&(!sh.needs||(sh.needs==='focus'?!!s.focus:!!s.tower))&&(!sh.ok||sh.ok(s));
  const ok=SHOTS.filter(sh=>fits(sh)&&sh.name!==avoid);
  const all=SHOTS.filter(fits);
  while(this.plan.length){const [nm,sec]=this.plan[0].split(':'),want=SHOTS.find(x=>x.name===nm);if(want&&fits(want)){this.plan.shift();this.useShot(sec?{...want,dur:Number(sec)}:want,s);return;}
   if(want&&want.phase!==s.phase&&SHOTS.some(x=>x.phase===s.phase&&fits(x)))break;this.plan.shift();}
  const fresh=ok.filter(sh=>!this.recent.includes(sh.name)),list=fresh.length?fresh:ok.length?ok:all;
  const shot=list[Math.floor(this.random()*list.length)]??SHOTS.find(x=>x.name==='follow')!;
  this.useShot(shot,s);
 }
 private useShot(shot:Shot,s:CineState){
  this.recent.push(shot.name);if(this.recent.length>3)this.recent.shift();
  // glide from wherever the camera is into the new shot instead of a hard cut (anh Thanh 2026-11-06: cuts felt jerky)
  if(this.cur){this.from={pos:this.cur.pos.clone(),look:this.cur.look.clone(),fov:this.cur.fov};this.glide=0;this.prev=this.shot?{shot:this.shot,anchor:this.anchor,t:this.t}:undefined;}
  this.shot=shot;this.t=0;this.blocked=0;this.anchor={p0:s.p.clone(),yaw0:s.yaw,side:this.random()<.5?-1:1,a0:this.random()*Math.PI*2};
  if(shot.name==='drone-orbit'||shot.name==='birds-eye')this.anchor.a0=Math.atan2(-Math.cos(s.yaw),-Math.sin(s.yaw))+(this.random()-.5);
  if(shot.name==='tower-rise'||shot.name==='tower-orbit'){const T=s.tower!;this.anchor.a0=Math.atan2(300-T.z,0-T.x)+(this.random()-.5)*.8;}
  if(shot.name==='temple-aerial'&&s.tower&&s.focus)this.anchor.a0=Math.atan2(s.tower.z-s.focus.z,s.tower.x-s.focus.x)+(this.random()-.5)*.9;
 }
 /** Push a camera position out of every statue footprint (except one the pilgrim stands inside). */
 private keepOut(q:Vector3,s:CineState){
  for(const b of this.blockers){if(q.y>b.top)continue;const dx=q.x-b.x,dz=q.z-b.z,d=Math.hypot(dx,dz),min=b.r+1.2;if(d>=min)continue;
   if(Math.hypot(s.p.x-b.x,s.p.z-b.z)<b.r+.5)continue;const k=d>.01?min/d:1;q.x=b.x+(d>.01?dx:min)*(d>.01?k:1);q.z=b.z+(d>.01?dz*k:0);}
 }
 /** Advance one frame; returns the camera to render with. */
 update(dt:number,s:CineState):Camera{
  this.sp=this.sp?Vector3.Lerp(this.sp,s.p,1-Math.exp(-dt*5)):s.p.clone();if(Vector3.Distance(this.sp,s.p)>8)this.sp.copyFrom(s.p);
  if(s.phase!==this.phase||!this.shot){this.phase=s.phase;this.pick(s);}
  this.t+=dt;if(this.t>=this.shot!.dur)this.pick(s,this.shot!.name);
  let f=this.shot!.at(Math.min(1,this.t/this.shot!.dur),s,this.anchor,this.sp);
  if(![f.pos.x,f.pos.y,f.pos.z,f.look.x,f.look.y,f.look.z].every(Number.isFinite)){this.pick(s,this.shot!.name);f=this.shot!.at(0,s,this.anchor,this.sp);}
  // never inside a statue or its plinth (they are not reliably pickable): push out of every statue footprint near the camera,
  // except the one the pilgrim stands inside (Thiên Thủ Quán Âm's open pavilion)
  this.keepOut(f.pos,s);
  // never under the ground or a floor
  const g=this.ground(f.pos.x,f.pos.z,f.pos.y);if(Number.isFinite(g)&&f.pos.y<g+.35)f.pos.y=g+.35;
  // blocked view: a wall, roof or statue between the camera and the subject for a moment → cut to another shot
  this.probe-=dt;if(this.probe<=0&&this.t>.3){this.probe=.25;const from=this.shot!.see?s.p.add(V(0,1.1,0)):f.look,dir=f.pos.subtract(from),len=dir.length();
   if(len>.5){dir.scaleInPlace(1/len);const hit=this.scene.pickWithRay(new Ray(from,dir,len-.3),m=>!this.skip(m),true);if(hit?.hit)this.blocked+=.25;else this.blocked=0;
    if(!hit?.hit&&this.shot!.needs==='focus'&&s.focus){const tgt=f.look,d2=tgt.subtract(f.pos),l2=d2.length();if(l2>1){d2.scaleInPlace(1/l2);const h2=this.scene.pickWithRay(new Ray(f.pos,d2,l2*.55),m=>!this.skip(m),true);if(h2?.hit)this.blocked+=.25;}}
    if(this.blocked>=.5)this.pick(s,this.shot!.name);}}
  // glide: eased blend from the last frame of the previous shot, longer when the two are far apart
  // (anh Thanh 2026-11-06 "nâng cấp độ mượt và độ chuyển cảnh"): the outgoing shot keeps playing under the blend, the view turns
  // through the angle between the two shots, and the blend is quintic and long enough to read as one continuous camera move.
  if(this.from){if(this.glide===0)this.glideDur=Math.max(2.2,Math.min(4.5,1.8+Vector3.Distance(this.from.pos,f.pos)/18));this.glide+=dt;const k=ease5(this.glide/this.glideDur);
   let a=this.from;if(this.prev){const P=this.prev;P.t+=dt;const g=P.shot.at(Math.min(1,P.t/P.shot.dur),s,P.anchor,this.sp!);if([g.pos.x,g.pos.y,g.pos.z,g.look.x,g.look.y,g.look.z].every(Number.isFinite)){this.keepOut(g.pos,s);
    // start from where the camera really was, the offset fading out over the first half of the blend
    const off=ease5(Math.min(1,this.glide/(this.glideDur*.5)));a={pos:Vector3.Lerp(this.from.pos,g.pos,off),look:Vector3.Lerp(this.from.look,g.look,off),fov:lerp(this.from.fov,g.fov,off)};}}
   f=blendFrame(a,f,k);if(this.glide>=this.glideDur){this.from=undefined;this.prev=undefined;}
   this.keepOut(f.pos,s);const g2=this.ground(f.pos.x,f.pos.z,f.pos.y);if(Number.isFinite(g2)&&f.pos.y<g2+.35)f.pos.y=g2+.35;}
  // soft camera: a light critically-damped follow takes out frame-to-frame jitter
  // gimbal: critically damped springs on position, look point and lens (2nd order — speed changes smoothly, no frame jitter)
  if(!this.cur){this.cur={pos:f.pos.clone(),look:f.look.clone(),fov:f.fov};this.vPos.setAll(0);this.vLook.setAll(0);this.vFov=0;}
  else if(Vector3.Distance(this.cur.pos,f.pos)>60){this.cur={pos:f.pos.clone(),look:f.look.clone(),fov:f.fov};this.vPos.setAll(0);this.vLook.setAll(0);this.vFov=0;}
  else if(dt>0){spring(this.cur.pos,this.vPos,f.pos,5,dt);spring(this.cur.look,this.vLook,f.look,6,dt);
   const n=Math.max(1,Math.ceil(dt/.016)),h=dt/n;for(let i=0;i<n;i++){this.vFov+=(-25*(this.cur.fov-f.fov)-10*this.vFov)*h;this.cur.fov+=this.vFov*h;}
   const g3=this.ground(this.cur.pos.x,this.cur.pos.z,this.cur.pos.y);if(Number.isFinite(g3)&&this.cur.pos.y<g3+.3){this.cur.pos.y=g3+.3;if(this.vPos.y<0)this.vPos.y=0;}}
  const c=this.camera;c.position.copyFrom(this.cur.pos);c.setTarget(this.cur.look);c.fov=this.cur.fov;
  const h=Math.max(0,f.pos.y-(Number.isFinite(g)?g:0));c.minZ=Math.min(2,.25+h/120);
  return c;
 }
 dispose(){this.camera.dispose();}
}
