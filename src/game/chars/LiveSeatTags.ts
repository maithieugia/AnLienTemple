import {ArcRotateCamera,Matrix,Vector3,type Scene} from '@babylonjs/core';
import {applyParticipantChange,type Participant,type ParticipantSnapshot} from '../../../live/participants';
import {LAY_SEATS} from './LayAssemblyPlan';
/** DOM nameplates projected from real 3D seats; no additional rig or texture per viewer. */
export class LiveSeatTags{
 private root:HTMLDivElement;private hud:HTMLDivElement;private labels:HTMLDivElement[]=[];private socket?:WebSocket;private retry=0;private disposed=false;private connected=false;private liveConnected=false;private snapshot:ParticipantSnapshot={people:[],capacity:1500,full:false};private observer;private nextPaint=0;
 constructor(private scene:Scene,private profiles:(people:Participant[])=>void){
  this.root=document.createElement('div');this.root.id='live-seat-names';Object.assign(this.root.style,{position:'fixed',pointerEvents:'none',overflow:'hidden',zIndex:'500'});document.body.append(this.root);
  this.hud=document.createElement('div');Object.assign(this.hud.style,{position:'absolute',left:'12px',bottom:'12px',background:'#11251eeb',color:'#ead398',padding:'9px 12px',border:'1px solid #c5a660',borderRadius:'7px',font:'12px Segoe UI,sans-serif',maxWidth:'90%'});this.root.append(this.hud);
  for(let i=0;i<48;i++){const label=document.createElement('div');label.className='live-seat-name';Object.assign(label.style,{position:'absolute',left:'0',top:'0',display:'none',color:'#fff1b5',background:'#122a20ee',border:'1px solid #b89a55',borderRadius:'6px',padding:'4px 9px',font:'600 15px Segoe UI,sans-serif',whiteSpace:'nowrap',boxShadow:'0 2px 7px #0009',textShadow:'0 1px 2px #000'});this.labels.push(label);this.root.append(label);}
  this.observer=scene.onAfterRenderObservable.add(()=>this.paint());this.open();scene.onDisposeObservable.addOnce(()=>this.dispose());
 }
 private open(){if(this.disposed)return;this.socket=new WebSocket(`${location.protocol==='https:'?'wss':'ws'}://${location.host}/events`);this.socket.onopen=()=>this.connected=true;
  this.socket.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type==='state'){this.liveConnected=m.data.status?.phase==='connected';this.accept(m.data.participants);}if(m.type==='participants')this.accept(m.data);if(m.type==='participant')this.accept(applyParticipantChange(this.snapshot,m.data));if(m.type==='focus-seat'){const seat=LAY_SEATS[m.data.seatId],camera=this.scene.activeCamera;if(seat&&camera instanceof ArcRotateCamera){camera.setTarget(new Vector3(seat.x,2,seat.z));camera.radius=3.8;camera.alpha=-Math.PI/2;camera.beta=1.2;}}}catch{}};
  this.socket.onerror=()=>this.socket?.close();this.socket.onclose=()=>{this.connected=false;if(!this.disposed)this.retry=window.setTimeout(()=>this.open(),2500);};
 }
 private accept(s:ParticipantSnapshot){if(!s||!Array.isArray(s.people))return;this.snapshot={people:s.people.filter(p=>Number.isInteger(p.seatId)&&p.seatId>=0&&p.seatId<1500&&typeof p.name==='string').slice(0,1500),capacity:1500,full:!!s.full};this.profiles(this.snapshot.people);this.nextPaint=0;}
 private paint(){if(this.disposed||performance.now()<this.nextPaint)return;this.nextPaint=performance.now()+100;
  const canvas=this.scene.getEngine().getRenderingCanvas(),camera=this.scene.activeCamera;if(!canvas||!camera)return;const r=canvas.getBoundingClientRect();Object.assign(this.root.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
  this.hud.textContent=`${this.connected?(this.liveConnected?'TIKTOK LIVE':'THỬ · CHƯA NỐI TIKTOK'):'ĐANG NỐI LẠI TOOL'} · ${this.snapshot.people.length}/1.500 chỗ · Bình luận để ngồi · nam / nữ · rời chùa`;
  const viewport=camera.viewport.toGlobal(r.width,r.height),transform=this.scene.getTransformMatrix(),forward=camera.getForwardRay().direction;
  const visible=this.snapshot.people.map(p=>{const seat=LAY_SEATS[p.seatId],world=new Vector3(seat.x,2.73,seat.z),delta=world.subtract(camera.globalPosition);return{p,world,delta,d:delta.lengthSquared()};}).filter(p=>p.d<180*180&&Vector3.Dot(p.delta,forward)>0).sort((a,b)=>a.d-b.d);
  const boxes:{x:number;y:number;w:number}[]=[];let count=0;
  for(const {p,world}of visible){if(count===this.labels.length)break;const v=Vector3.Project(world,Matrix.Identity(),transform,viewport);if(v.z<0||v.z>1||v.x<10||v.x>r.width-10||v.y<20||v.y>r.height-10)continue;
   const name=Array.from(p.name),text=(p.demo?'THỬ · ':'')+(name.length>20?name.slice(0,19).join('')+'…':p.name),w=Math.min(230,30+Array.from(text).length*8);
   if(boxes.some(b=>Math.abs(b.x-v.x)<(b.w+w)/2+5&&Math.abs(b.y-v.y)<29))continue;
   const label=this.labels[count++];label.textContent=text;label.title=p.name;label.dataset.seat=String(p.seatId);label.style.display='block';label.style.transform=`translate(${v.x}px,${v.y}px) translate(-50%,-100%)`;boxes.push({x:v.x,y:v.y,w});
  }
  for(let i=count;i<this.labels.length;i++)this.labels[i].style.display='none';
 }
 dispose(){if(this.disposed)return;this.disposed=true;clearTimeout(this.retry);this.socket?.close();this.scene.onAfterRenderObservable.remove(this.observer);this.root.remove();}
}
export function liveSeatsEnabled(){return ['127.0.0.1','localhost'].includes(location.hostname)&&(location.pathname==='/live-seats'||new URLSearchParams(location.search).has('liveSeats'));}
