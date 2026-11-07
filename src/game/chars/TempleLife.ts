import {Vector3,type Scene} from '@babylonjs/core';
import {AoDaiCollection} from './AoDaiCollection';
import {AO_DAI_COLLECTION} from './AoDaiCollectionPlan';
import {lifeStop,lifeDwell,lifeRoute,LIFE_STOPS,LIFE_WALK_SPEED,type LifePoint,type LifeStop} from './TempleLifePlan';
import {resolveCircle,supportHeight} from '../world/Obstacles';
type Person={actor:ReturnType<AoDaiCollection['create']>;index:number;visit:number;stop:LifeStop;until:number;path:LifePoint[];pose:string;blocked:number;nextPush:number;patrolling?:boolean};
/** Ten independently timed residents. They are scenery, never award player merit. */
export class TempleLife{
 private library:AoDaiCollection;private people:Person[]=[];ready=false;failed=false;private dead=false;private clock=0;private routeQueue:Person[]=[];
 constructor(private scene:Scene,private wheelPulse:(id:'west'|'east')=>void){this.library=new AoDaiCollection(scene);}
 async load(){try{await this.library.load();if(this.dead)return;for(const[index,look]of AO_DAI_COLLECTION.entries()){const stop=lifeStop(index,0),actor=this.library.create(look);actor.root.name='temple-resident-'+look.id;actor.root.metadata={templeResident:true,look:look.id};actor.root.position.set(stop.x,stop.y,stop.z);actor.root.rotation.y=stop.yaw;const p:Person={actor,index,visit:0,stop,until:lifeDwell(index,0),path:[],pose:'',blocked:0,nextPush:0};this.people.push(p);this.act(p,this.restPose(stop));}this.ready=true;}catch(e){this.failed=true;console.error('Temple residents:',e);}}
 private height(x:number,z:number){return Math.max(0,supportHeight(x,z,1.25));}
 private clear=(a:LifePoint,b:LifePoint)=>{const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/.3));let y=this.height(a.x,a.z);for(let i=1;i<=n;i++){const t=i/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,ny=this.height(x,z);if(Math.abs(ny-y)>.36)return false;const[r,s]=resolveCircle(x,z,.32,ny,1.8);if(Math.hypot(r-x,s-z)>.04)return false;y=ny;}return true;};
 private act(p:Person,pose:string){if(p.pose===pose)return;p.pose=pose;p.actor.setPose(pose);}
 private restPose(stop:LifeStop){return stop.act==='listen'||stop.act==='meditate'?'sit':stop.act==='bow'?'bow':stop.act==='wheel'?'Push':'Idle';}
 occupiedSeat(id:number){const seat=this.seatPoint(id);return LIFE_STOPS.some(s=>Math.hypot(s.x-seat.x,s.z-seat.z)<.8)||this.people.some(p=>Math.hypot(p.actor.root.position.x-seat.x,p.actor.root.position.z-seat.z)<.8);}
 private seatPoint(id:number){return this.seats[id]??{x:Infinity,z:Infinity};}
 private seats:{x:number;z:number}[]=[];
 setSeats(seats:{x:number;z:number}[]){this.seats=seats;}
 private depart(p:Person){p.visit++;let stop=lifeStop(p.index,p.visit);for(let k=0;k<LIFE_STOPS.length;k++){const candidate=LIFE_STOPS[(LIFE_STOPS.indexOf(stop)+k)%LIFE_STOPS.length];if(candidate.id!==p.stop.id&&!this.people.some(q=>q!==p&&q.stop.id===candidate.id)){stop=candidate;break;}}p.stop=stop;this.routeQueue.push(p);p.until=Infinity;this.act(p,'Idle');}
 update(dt:number,eye:Vector3){if(!this.ready||this.dead)return;this.clock+=dt;
  // At most one search per frame, with strict work bounds. Never teleport on failure.
  const pending=this.routeQueue.shift();if(pending){const a=pending.actor.root.position;pending.path=lifeRoute(a,pending.stop,this.clear);if(!pending.path.length){pending.until=this.clock+20;this.act(pending,'Idle');}else this.act(pending,'Walk');}
  for(const p of this.people){const root=p.actor.root,pos=root.position,near=Vector3.DistanceSquared(pos,eye)<230*230;root.setEnabled(near);
   if(p.path.length){const next=p.path[0],dx=next.x-pos.x,dz=next.z-pos.z,d=Math.hypot(dx,dz),step=Math.min(d,LIFE_WALK_SPEED*dt),tx=pos.x+dx/(d||1)*step,tz=pos.z+dz/(d||1)*step,ny=this.height(tx,tz),[nx,nz]=resolveCircle(tx,tz,.32,ny,1.8);
    const blocked=Math.hypot(nx-tx,nz-tz)>.08||this.people.some(q=>q!==p&&Vector3.DistanceSquared(q.actor.root.position,new Vector3(tx,ny,tz))<.75*.75);
    if(blocked){p.blocked+=dt;this.act(p,'Idle');if(p.blocked>3){p.path=[];this.routeQueue.push(p);p.blocked=0;}}else{p.blocked=0;pos.set(nx,ny,nz);const yaw=Math.atan2(dx,dz);root.rotation.y+=Math.atan2(Math.sin(yaw-root.rotation.y),Math.cos(yaw-root.rotation.y))*Math.min(1,dt*6);this.act(p,'Walk');if(d<.12)p.path.shift();if(!p.path.length){if(p.patrolling){p.patrolling=false;this.act(p,'Idle');}else{pos.set(p.stop.x,p.stop.y,p.stop.z);root.rotation.y=p.stop.yaw;p.until=this.clock+lifeDwell(p.index,p.visit);this.act(p,this.restPose(p.stop));}}}
   }else if(this.clock>=p.until){this.depart(p);}
   else if(p.stop.act==='stroll'&&Number.isFinite(p.until)){const target={x:p.stop.x+(pos.x<=p.stop.x?18:-18),z:p.stop.z};if(this.clear(pos,target)){p.path=[target];p.patrolling=true;this.act(p,'Walk');}}
   else if(p.stop.act==='wheel'&&this.clock>=p.nextPush&&Number.isFinite(p.until)){p.nextPush=this.clock+3;this.wheelPulse(p.stop.id==='wheel-west'?'west':'east');}
   if(near)p.actor.update(dt);
  }
 }
 get review(){return{ready:this.ready,count:this.people.length,walking:this.people.filter(p=>p.path.length).length,stops:this.people.map(p=>({look:p.actor.look.id,activity:p.stop.act,walking:!!p.path.length}))};}
 dispose(){this.dead=true;for(const p of this.people)p.actor.dispose();this.library.dispose();}
}
