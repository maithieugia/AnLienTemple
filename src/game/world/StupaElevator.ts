import {MeshBuilder,TransformNode,StandardMaterial,Color3,type Scene}from '@babylonjs/core';
import {STUPA as T,STUPA_LIFT_PHASE as PH,towerFloor,towerStairAngle,towerLiftAngle}from './StupaPlan';
import {elevatorTrip,canCallElevator}from './StupaElevatorPlan';
type Adapter={get:()=>{x:number;y:number;z:number;enabled:boolean};set:(x:number,y:number,z:number)=>void;onBoard?:()=>void};
/** Local cabin animation; player position continues through the existing network snapshots. */
export class StupaElevator{
 active=false;private adapter?:Adapter;private from=0;private to=0;private elapsed=0;private floor=0;
 constructor(scene:Scene){
 const root=new TransformNode('stupa-elevator-car',scene);root.position.set(T.x,0,T.z);root.rotation.y=Math.PI/2-PH;
 const gold=new StandardMaterial('lift-brass',scene);gold.diffuseColor=Color3.FromHexString('#d4ae56');gold.emissiveColor=new Color3(.18,.15,.08);
 const glass=new StandardMaterial('lift-glass',scene);glass.diffuseColor=Color3.FromHexString('#b9e6eb');glass.alpha=.22;glass.backFaceCulling=false;
 const stone=new StandardMaterial('lift-floor',scene);stone.diffuseColor=Color3.FromHexString('#eee7d4');stone.emissiveColor=new Color3(.25,.25,.25);
 const box=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,mat:StandardMaterial)=>{const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=mat;m.isPickable=false;return m;};
 box('cabin-floor',3.2,.16,3.2,0,.02,0,stone);box('cabin-ceiling',3.2,.12,3.2,0,2.9,0,stone);
 for(const x of [-1.55,1.55]){box('cabin-post',.09,2.9,.09,x,1.45,-1.55,gold);box('cabin-post',.09,2.9,.09,x,1.45,1.55,gold);box('cabin-side',.035,2.7,3,x,1.45,0,glass);}box('cabin-back',3,2.7,.035,0,1.45,-1.55,glass);
 const left=box('lift-door-left',1.5,2.65,.045,-.77,1.4,1.55,glass),right=box('lift-door-right',1.5,2.65,.045,.77,1.4,1.55,glass);
 const button=document.createElement('button');button.id='stupa-lift-call';button.textContent='Chọn tầng thang máy';button.hidden=true;
 const panel=document.createElement('dialog');panel.id='stupa-lift-panel';panel.innerHTML=`<h2>Thang máy tháp Phù Đồ</h2><p>Chọn tầng muốn đến · 1–${T.levels}</p><div class="lift-floors"></div><output></output><button class="lift-close">Đóng</button>`;
 const style=document.createElement('style');style.textContent='#stupa-lift-call{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);height:fit-content;z-index:25;padding:14px;background:#47351f;color:#fff4c9;border:1px solid #d4ae56;border-radius:9px}body.al-online #stupa-lift-call{bottom:auto}#stupa-lift-panel{color:#fff4c9;background:#29271f;border:1px solid #d4ae56;border-radius:14px;width:min(430px,85vw);max-height:85vh;overflow:auto;z-index:100}#stupa-lift-panel::backdrop{background:#0009}.lift-floors{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.lift-floors button,.lift-close{padding:12px 5px;color:#fff4c9;background:#494131;border:1px solid #a98b4e;border-radius:6px}.lift-floors button:disabled{opacity:.4}#stupa-lift-panel output{display:block;padding:12px 0}';document.head.append(style);document.body.append(button,panel);
 const output=panel.querySelector('output')!,buttons:HTMLButtonElement[]=[];for(let i=0;i<T.levels;i++){const b=document.createElement('button');b.textContent=String(i+1);b.ariaLabel='Đến tầng '+(i+1);b.onclick=()=>{const p=this.adapter?.get();if(!p||this.active)return;this.from=Math.max(0,Math.min(T.levels-1,Math.round(p.y/T.storey)));this.to=i;if(i===this.from){output.textContent='Anh đang ở tầng '+(i+1);return;}this.elapsed=0;this.active=true;this.adapter?.onBoard?.();buttons.forEach(b=>b.disabled=true);this.adapter?.set(T.x,p.y,T.z);};panel.querySelector('.lift-floors')!.append(b);buttons.push(b);}
 button.onclick=()=>{output.textContent='Hiện tại: tầng '+(this.floor+1);panel.showModal();};panel.querySelector('.lift-close')!.addEventListener('click',()=>panel.close());panel.addEventListener('cancel',()=>{});
 scene.onBeforeRenderObservable.add(()=>{const p=this.adapter?.get();if(!p){button.hidden=true;return;}this.floor=Math.max(0,Math.min(T.levels-1,Math.round(p.y/T.storey)));const near=canCallElevator(p);button.hidden=!near||this.active;
 if(this.active){this.elapsed+=Math.min(.1,scene.getEngine().getDeltaTime()/1000);const trip=elevatorTrip(this.from,this.to,this.elapsed);root.position.y=trip.y;this.adapter?.set(T.x,trip.y,T.z);const open=trip.phase==='closing'?Math.max(0,1-this.elapsed):trip.phase==='opening'?Math.min(1,this.elapsed-(trip.duration-1)):trip.done?1:0;left.position.x=-.77-open*1.35;right.position.x=.77+open*1.35;output.textContent=trip.phase==='closing'?'Đang đóng cửa':trip.phase==='opening'?'Đang mở cửa · tầng '+(this.to+1):'Đang đến tầng '+(this.to+1)+' · '+trip.y.toFixed(1)+' m';if(trip.done){this.active=false;this.floor=this.to;this.adapter?.set(T.x+3.2*Math.cos(PH),towerFloor(this.to),T.z+3.2*Math.sin(PH));buttons.forEach(b=>b.disabled=false);output.textContent='Đã đến tầng '+(this.to+1);panel.close();}}
 else{root.position.y=towerFloor(this.floor);left.position.x=-2.12;right.position.x=2.12;}
 });scene.onDisposeObservable.addOnce(()=>{button.remove();panel.remove();style.remove();root.dispose();gold.dispose();glass.dispose();stone.dispose();});
 }
 bind(adapter:Adapter){this.adapter=adapter;}
 /** Ride to storey `to` without the panel ("Tự đi lễ", anh Thanh 2026-11-05); false when the pilgrim is not at the lift. */
 ride(to:number){const p=this.adapter?.get();if(!p||this.active||!canCallElevator(p))return false;this.from=Math.max(0,Math.min(T.levels-1,Math.round(p.y/T.storey)));this.to=Math.max(0,Math.min(T.levels-1,to));if(this.to===this.from)return true;this.elapsed=0;this.active=true;this.adapter?.onBoard?.();this.adapter?.set(T.x,p.y,T.z);return true;}
}
