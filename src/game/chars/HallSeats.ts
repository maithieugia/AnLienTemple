import {Color3,DynamicTexture,Matrix,Mesh,MeshBuilder,PBRMaterial,Quaternion,Vector3,type Scene} from '@babylonjs/core';
import {LAY_SEATS,LAY_PRAYER_PADS} from './LayAssemblyPlan';
/** Pads remain even though the old 1,500 simulated people are disabled. */
export class HallSeats{
 readonly seats=LAY_SEATS;private pads:Mesh[]=[];private marker:Mesh;selected:number|null=null;
 constructor(scene:Scene){
  const tx=new DynamicTexture('empty-yellow-cushion-weave',256,scene,true),c=tx.getContext();c.fillStyle='#c99b1f';c.fillRect(0,0,256,256);c.strokeStyle='#f5d871';c.lineWidth=8;c.strokeRect(12,12,232,232);for(let y=0;y<256;y+=5){c.fillStyle=y%10?'#d3aa35':'#be9224';c.fillRect(24,y,208,1);}tx.update();
  const m=new PBRMaterial('empty-gold-seat-material',scene);m.albedoTexture=tx;m.roughness=.88;
  for(const[name,points]of [['hall-listening-pads',LAY_SEATS],['hall-prayer-pads',LAY_PRAYER_PADS]]as const){const pad=MeshBuilder.CreateCylinder(name,{diameter:1.12,height:.14,tessellation:20},scene);pad.material=m;pad.isPickable=name==='hall-listening-pads';pad.thinInstanceEnablePicking=true;pad.metadata={hallSeats:pad.isPickable};const matrices=new Float32Array(points.length*16);points.forEach((p,i)=>Matrix.Compose(Vector3.One(),Quaternion.Identity(),new Vector3(p.x,1.275,p.z)).copyToArray(matrices,i*16));pad.thinInstanceSetBuffer('matrix',matrices,16,true);pad.thinInstanceRefreshBoundingInfo(false);this.pads.push(pad);}
  const mark=new PBRMaterial('selected-listening-pad',scene);mark.albedoColor=Color3.FromHexString('#fff1a2');mark.emissiveColor=Color3.FromHexString('#83672a');
  this.marker=MeshBuilder.CreateTorus('listening-seat-selection',{diameter:1.24,thickness:.045,tessellation:32},scene);this.marker.material=mark;this.marker.isPickable=false;this.marker.setEnabled(false);
  scene.onDisposeObservable.addOnce(()=>{m.dispose(false,true);mark.dispose();});
 }
 select(id:number|null){this.selected=id!==null&&this.seats[id]?id:null;this.marker.setEnabled(this.selected!==null);if(this.selected!==null){const p=this.seats[this.selected];this.marker.position.set(p.x,1.365,p.z);}return this.selected;}
 nearest(p:{x:number;y:number;z:number},occupied:(id:number)=>boolean){if(Math.abs(p.y-1.2)>.5)return null;return this.seats.filter(s=>!occupied(s.id)&&Math.hypot(s.x-p.x,s.z-p.z)<3).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0]??null;}
}
