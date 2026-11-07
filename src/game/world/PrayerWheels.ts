import {MeshBuilder,PointerEventTypes,TransformNode,Vector3,type Scene,type Mesh} from '@babylonjs/core';
import {addObstacle,removeObstacle,type Rect} from './Obstacles';
import {prayerDrum,prayerWheelMaterials} from './PrayerWheelArt';
import {PRAYER_WHEEL as P,PRAYER_WHEEL_SITES,WheelMotion,MANTRA,MERIT_KEY,parseMerit,canReachWheel,prayerWheelObstacles,type WheelId} from './PrayerWheelPlan';
type Listener=()=>{position:{x:number;y:number;z:number};walking:boolean};
/** Two independent hand-driven wheels. Completed revolutions, not button presses, award game merit. */
export class PrayerWheels{
 private roots:TransformNode[]=[];private moving=new Map<WheelId,TransformNode>();private motion=new Map<WheelId,WheelMotion>();private rects:Rect[]=[];private pickables:Mesh[]=[];
 private save=parseMerit(null);private card=document.createElement('aside');private total=document.createElement('output');private button=document.createElement('button');private text=document.createElement('p');private progress=document.createElement('progress');private saveWarning='';
 /** Online: pushes go to the server, which owns the wheels and the merit. */private remote?:(id:WheelId)=>void;onPush?:(id:WheelId)=>void;
 private materials?:Awaited<ReturnType<typeof prayerWheelMaterials>>;private message='';private messageTime=0;private disposed=false;
 static async create(scene:Scene,low:boolean,listener:Listener){const w=new PrayerWheels(scene,listener);try{w.materials=await prayerWheelMaterials(scene,low);if(w.disposed){w.materials.dispose();return w;}w.build(low);}catch(e){w.saveWarning='Không tải được font/khắc chữ';console.error('Prayer wheels unavailable',e);}return w;}
 private constructor(private scene:Scene,private listener:Listener){try{this.save=parseMerit(localStorage.getItem(MERIT_KEY));}catch{this.saveWarning='Chưa lưu được trên trình duyệt';}
  this.card.id='prayer-wheel-interaction';this.card.setAttribute('aria-label','Tương tác kinh luân');this.card.hidden=true;const title=document.createElement('strong');title.textContent='KINH LUÂN · OM MANI PADME HUM';this.button.textContent='Xoay kinh luân · E';this.button.onclick=()=>this.pushNearest();this.progress.max=1;this.progress.value=0;this.progress.setAttribute('aria-label','Tiến độ vòng kinh luân');this.text.setAttribute('aria-live','polite');const sanskrit=document.createElement('div');sanskrit.lang='sa-Deva';sanskrit.textContent=MANTRA;sanskrit.style.cssText='font:22px AnLienDevanagari;margin-top:8px;color:#e4bd65';this.card.append(title,sanskrit,this.text,this.progress,this.button);document.body.append(this.card);
  this.total.id='prayer-merit-total';this.total.setAttribute('aria-live','polite');document.querySelector('nav')?.append(this.total);this.refreshTotal();
  const style=document.createElement('style');style.textContent='#prayer-wheel-interaction{position:fixed;right:16px;bottom:84px;z-index:5;width:min(300px,calc(100vw - 32px));padding:15px;background:rgba(20,30,28,.96);color:#eee3ca;border:1px solid #b39152;border-radius:8px;font:13px Segoe UI}#prayer-wheel-interaction[hidden]{display:none}#prayer-wheel-interaction strong{font-size:11px;letter-spacing:.8px}#prayer-wheel-interaction p{line-height:1.5;margin:9px 0}#prayer-wheel-interaction progress{width:100%;height:6px;accent-color:#d7b55b;display:block;margin-bottom:12px}#prayer-wheel-interaction button{width:100%;border-color:#c4a45f}#prayer-merit-total{padding:7px 10px;color:#e9ce85;font-size:12px;white-space:nowrap}';document.head.append(style);
  window.addEventListener('keydown',this.key);
  const obs=scene.onPointerObservable.add(info=>{if(info.type!==PointerEventTypes.POINTERPICK)return;const id=info.pickInfo?.pickedMesh?.metadata?.prayerWheel as WheelId|undefined;if(id)this.push(id);});
  scene.onDisposeObservable.addOnce(()=>{this.disposed=true;window.removeEventListener('keydown',this.key);scene.onPointerObservable.remove(obs);this.card.remove();this.total.remove();style.remove();this.rects.forEach(removeObstacle);this.roots.forEach(r=>r.dispose());this.materials?.dispose();});
 }
 private key=(e:KeyboardEvent)=>{if(e.code!=='KeyE'||e.repeat||e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement||e.target instanceof HTMLButtonElement)return;const near=this.nearest();if(near){e.preventDefault();this.push(near.id);}};
 private refreshTotal(){this.total.textContent=`Công đức: ${this.save.turns.west+this.save.turns.east}`;}
 private build(low:boolean){const m=this.materials!,n=low?128:256;
  for(const site of PRAYER_WHEEL_SITES){const root=new TransformNode('kinh-luan-'+site.id,this.scene);root.position.set(site.x,0,site.z);this.roots.push(root);const spin=new TransformNode('clockwise-drum-'+site.id,this.scene);spin.parent=root;this.moving.set(site.id,spin);this.motion.set(site.id,new WheelMotion());
   const mark=(mesh:Mesh,parent=root,metal=true)=>{mesh.parent=parent;mesh.material=metal?m.gold:m.stone;mesh.metadata={prayerWheel:site.id};mesh.receiveShadows=true;this.pickables.push(mesh);return mesh;};
   const lathe=(name:string,profile:number[][],parent=root,metal=true)=>mark(MeshBuilder.CreateLathe(name,{shape:profile.map(v=>new Vector3(v[0],v[1],0)),tessellation:n,cap:3},this.scene),parent,metal);
   const apron=mark(MeshBuilder.CreateCylinder('dry-paved-former-pond-'+site.id,{diameter:(P.plinthRadius+5)*2,height:.08,tessellation:n},this.scene),root,false);apron.position.y=.015;
   lathe('flush-gold-plinth-'+site.id,[[0,-.04],[P.plinthRadius,-.04],[P.plinthRadius,.08],[P.radius+.6,.18],[P.radius,.18],[0,.18]]);
   lathe('gold-axle-and-lower-bearing-'+site.id,[[0,.6],[2.1,.6],[2.1,.78],[1.7,.9],[.6,1.05],[.6,98.8],[0,98.8]]);
   const drum=prayerDrum(this.scene,low,m.inscription);drum.parent=spin;drum.metadata={prayerWheel:site.id};this.pickables.push(drum);
   for(const y of [P.bodyBottom,P.bodyTop-1.1])lathe('drum-bevelled-rim-'+site.id,[[P.radius-.15,y],[P.radius+.06,y],[P.radius+.25,y+.18],[P.radius+.25,y+.4],[P.radius+.02,y+.55],[P.radius+.02,y+.9],[P.radius-.15,y+1.1]],spin);
   for(let y=14;y<95;y+=12)lathe('scroll-band-'+site.id,[[P.radius,y],[P.radius+.12,y+.05],[P.radius+.12,y+.20],[P.radius,y+.25]],spin);
   lathe('lotus-crown-and-finial-'+site.id,[[0,96.4],[P.radius*.96,96.4],[P.radius*.96,96.7],[P.radius,96.9],[P.radius*.92,97.25],[P.radius*.72,97.6],[P.radius*.52,98.1],[P.radius*.30,98.6],[P.radius*.12,99.15],[P.radius*.06,99.55],[0,P.height]]);
   for(let i=0;i<24;i++){const a=i/24*Math.PI*2;mark(MeshBuilder.CreateTube('lotus-relief-'+site.id,{path:Array.from({length:9},(_,j)=>{const t=j/8,r=P.radius*(.84-.30*t+.044*Math.sin(t*Math.PI));return new Vector3(r*Math.cos(a+.04*Math.sin(t*Math.PI)),97.1+t*.85,r*Math.sin(a+.04*Math.sin(t*Math.PI)));}),radius:.2,tessellation:6},this.scene));}
   const hand=mark(MeshBuilder.CreateTorus('hand-push-ring-'+site.id,{diameter:(P.radius+1.7)*2,thickness:.24,tessellation:n},this.scene),spin);hand.position.y=1.25;
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;mark(MeshBuilder.CreateTube('push-spoke-'+site.id,{path:[new Vector3((P.radius+.05)*Math.cos(a),1.25,(P.radius+.05)*Math.sin(a)),new Vector3((P.radius+1.7)*Math.cos(a),1.25,(P.radius+1.7)*Math.sin(a))],radius:.1,tessellation:8},this.scene),spin);}
   for(const r of prayerWheelObstacles(site)){addObstacle(r);this.rects.push(r);}
  }
 }
 private nearest(){const p=this.listener();return PRAYER_WHEEL_SITES.filter(s=>canReachWheel(p.position,s,p.walking)).sort((a,b)=>Math.hypot(p.position.x-a.x,p.position.z-a.z)-Math.hypot(p.position.x-b.x,p.position.z-b.z))[0];}
 pushNearest(){const s=this.nearest();if(s)this.push(s.id);}
 private push(id:WheelId){const s=PRAYER_WHEEL_SITES.find(s=>s.id===id),p=this.listener();if(!s||!canReachWheel(p.position,s,p.walking))return;this.onPush?.(id);if(this.remote){this.remote(id);this.motion.get(id)?.push();this.message='Đã đẩy · cả chùa cùng thấy trụ quay';this.messageTime=2.5;return;}const motion=this.motion.get(id);if(motion?.push()){this.message='Đã đẩy · đủ một vòng sẽ cộng 1 công đức';this.messageTime=2.5;this.scene.getEngine().getRenderingCanvas()?.focus();}}
 update(dt:number){if(this.disposed)return;let awarded=0;for(const [id,motion]of this.motion){const n=motion.tick(dt);this.ambientAngles.get(id)?.tick(dt);if(n&&!this.remote){this.save.turns[id]+=n;awarded+=n;}this.moving.get(id)!.rotation.y=-motion.angle-(this.ambientAngles.get(id)?.angle??0);}
  if(awarded){try{localStorage.setItem(MERIT_KEY,JSON.stringify(this.save));}catch{this.saveWarning='Chưa lưu được trên trình duyệt';}this.refreshTotal();this.message=`+${awarded} công đức · vòng xoay hoàn chỉnh`;this.messageTime=3;}
  const near=this.nearest();this.card.hidden=!near;if(!near)return;const state=this.motion.get(near.id);this.progress.value=state?state.remainder/(Math.PI*2):0;this.button.disabled=!state;const label=`${near.label}${this.remote?'':` · ${this.save.turns[near.id]} vòng hoàn chỉnh`}. ${this.messageTime>0?this.message:'Đến tay đẩy và nhấn E, click vào trụ hoặc bấm nút.'}${this.saveWarning?' · '+this.saveWarning:''}`;if(this.text.textContent!==label)this.text.textContent=label;this.messageTime=Math.max(0,this.messageTime-dt);
 }
 /** Switch to the shared online wheels. */
 goOnline(send:(id:WheelId)=>void,listener:Listener){this.remote=send;this.listener=listener;this.total.hidden=true;}
 /** Server state is the truth; local integration only fills the 200 ms between updates. */
 applyServer(list:{id:string;angle:number;speed:number}[]){for(const w of list){const m=this.motion.get(w.id as WheelId);if(m){m.angle=w.angle;m.speed=w.speed;}}}
  /** Decorative NPC pushes never enter local saves or the online merit protocol. */
  private ambientAngles=new Map<WheelId,WheelMotion>();
  ambientPush(id:WheelId){let m=this.ambientAngles.get(id);if(!m){m=new WheelMotion();this.ambientAngles.set(id,m);}m.push();}
  get review(){return{ready:this.motion.size===2,mantra:MANTRA,turns:{...this.save.turns},westAngle:this.motion.get('west')?.angle??0,eastAngle:this.motion.get('east')?.angle??0};}
}
