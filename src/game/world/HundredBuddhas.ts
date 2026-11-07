import {Color3,DynamicTexture,Mesh,MeshBuilder,PBRMaterial,StandardMaterial,Matrix,Quaternion,Vector3,LoadAssetContainerAsync,type Scene,type AssetContainer} from '@babylonjs/core';
import {HUNDRED_BUDDHAS,galleryLod} from './HundredBuddhaPlan';
import {SanctuaryBatch} from './SanctuaryGeometry';
import {addObstacle,removeObstacle,type Rect} from './Obstacles';
/** Named devotional gallery. Shared generic seated artwork, not 100 verified individual iconographies. */
export class HundredBuddhas {
 private dead=false;private containers:AssetContainer[]=[];private groups=new Map<string,Mesh[]>();private rects:Rect[]=[];private labels:Mesh[]=[];private batch:SanctuaryBatch;private mats:(StandardMaterial|PBRMaterial)[]=[];private atlas:DynamicTexture;private last=new Vector3(1e9,0,1e9);ready=false;failed=false;
 constructor(private scene:Scene,private low:boolean,private at:{x:number;y:number;z:number}){
  const gold=new StandardMaterial('hundred-ornament-source',scene),dark=new StandardMaterial('hundred-black-granite',scene);dark.diffuseColor=Color3.FromHexString('#292922');dark.specularColor.setAll(.3);
  const pbr=new PBRMaterial('hundred-gold-FFD700',scene);pbr.albedoColor=Color3.FromHexString('#FFD700');pbr.metallic=.78;pbr.roughness=.28;pbr.emissiveColor=new Color3(.07,.035,.002);pbr.environmentIntensity=1.15;
  // plinth caps, lotus rims and halos: gilt but satin, so their large flat faces no longer mirror the dark hall as black patches while moving (anh Thanh 2026-11-05)
  const trim=new PBRMaterial('hundred-gilt-satin',scene);trim.albedoColor=Color3.FromHexString('#E2B54A');trim.metallic=.25;trim.roughness=.6;trim.emissiveColor=new Color3(.16,.1,.02);trim.environmentIntensity=.6;this.mats.push(gold,dark,pbr,trim);
  const b=this.batch=new SanctuaryBatch(scene,at,'hundred-buddha-gallery');
  this.atlas=new DynamicTexture('hundred-canonical-names',{width:2048,height:4096},scene,true);const ctx=this.atlas.getContext() as CanvasRenderingContext2D;ctx.fillStyle='#17201b';ctx.fillRect(0,0,2048,4096);
  const labelMat=new StandardMaterial('hundred-nameplates',scene);labelMat.diffuseTexture=this.atlas;labelMat.emissiveColor=Color3.White();labelMat.disableLighting=true;labelMat.backFaceCulling=true;this.mats.push(labelMat);
  for(const s of HUNDRED_BUDDHAS){
   // no plinths any more (anh Thanh 2026-11-05 "xóa mấy cái bệ, cho tượng nằm dưới đất"): the statues sit on the hall floor, halos lowered to match
   const point=(u:number,y:number,depth:number)=>[s.x+u*Math.cos(s.yaw)+depth*Math.sin(s.yaw),y,s.z-u*Math.sin(s.yaw)+depth*Math.cos(s.yaw)];
   for(let ring=0;ring<s.rings;ring++){const r=s.haloR+ring*.11;b.tube(gold,Array.from({length:65},(_,i)=>point(Math.cos(i/64*Math.PI*2)*r,4.35+Math.sin(i/64*Math.PI*2)*r,-1.6)),.035,5);}
   for(let ray=0;ray<s.rays;ray++){const a=ray/s.rays*Math.PI*2,r=s.haloR+.11*s.rings;b.tube(gold,[point(Math.cos(a)*r,4.35+Math.sin(a)*r,-1.6),point(Math.cos(a+.025)*(r+.24+(s.id%7)*.015),4.35+Math.sin(a+.025)*(r+.24+(s.id%7)*.015),-1.6)],.035,5);}
   const rect:Rect={cx:at.x+s.x,cz:at.z+s.z,hx:2.1,hz:2.6,yaw:0,base:at.y+1.2,h:6.6,sight:true,climb:false};this.rects.push(rect);addObstacle(rect);
   const col=(s.id-1)%5,row=Math.floor((s.id-1)/5),cw=2048/5,ch=4096/20,x=col*cw,y=row*ch;ctx.strokeStyle='#ad8b3e';ctx.lineWidth=4;ctx.strokeRect(x+7,y+7,cw-14,ch-14);ctx.fillStyle='#d5b769';ctx.font='22px Segoe UI';ctx.textAlign='center';ctx.fillText(String(s.id).padStart(3,'0')+' · NAM MÔ',x+cw/2,y+43);
   const words=s.name.split(' '),lines=[''];for(const word of words){let l=lines.length-1;ctx.font='bold 27px Segoe UI';if(ctx.measureText(lines[l]+' '+word).width>cw-34&&lines[l]){lines.push(word);}else lines[l]+=(lines[l]?' ':'')+word;}ctx.fillStyle='#fff0ba';lines.forEach((line,i)=>ctx.fillText(line,x+cw/2,y+86+i*34));
   const plate=MeshBuilder.CreatePlane('canonical-name-'+s.id,{width:5.2,height:1.2},scene);const uv=plate.getVerticesData('uv')!;for(let i=0;i<uv.length;i+=2){uv[i]=(col+uv[i])/5;uv[i+1]=1-(row+1-uv[i+1])/20;}plate.setVerticesData('uv',uv);plate.rotation.y=s.yaw+Math.PI;const q=point(0,1.82,2.48),back=point(0,1.81,2.42);b.box(dark,back[0],back[1],back[2],Math.abs(Math.sin(s.yaw))>.5?.08:5.3,1.22,Math.abs(Math.sin(s.yaw))>.5?5.3:.08);plate.position.set(at.x+q[0],at.y+q[1],at.z+q[2]);plate.material=labelMat;plate.isPickable=false;this.labels.push(plate);
  }
  this.atlas.update();this.atlas.anisotropicFilteringLevel=8;b.build();for(const m of b.meshes)if(m.material===gold)m.material=trim;
  void this.load(pbr);
 }
 private async load(gold:PBRMaterial){try{for(const lod of ['far','low','high']){const c=await LoadAssetContainerAsync(import.meta.env.BASE_URL+'assets/sanctuary/statues/shakyamuni/'+(lod==='far'?'gallery-far':lod)+'.glb',this.scene);if(this.dead){c.dispose();return;}this.containers.push(c);const e=c.instantiateModelsToScene(n=>'hundred-'+lod+'-'+n,false),meshes:Mesh[]=[];for(const m of e.rootNodes.flatMap(r=>r.getChildMeshes(false))){if(!(m instanceof Mesh)||!m.getTotalVertices())continue;m.setParent(null);m.bakeCurrentTransformIntoVertices();m.material=gold;m.isPickable=false;m.receiveShadows=true;m.setEnabled(false);meshes.push(m);}for(const r of e.rootNodes)if(!r.getChildMeshes().length)r.dispose();this.groups.set(lod,meshes);this.last.x=1e9;}this.ready=true;}catch(e){this.failed=true;console.error('100 named Buddha gallery failed',e);}}
 update(p:{x:number;z:number}){const x=p.x-this.at.x,z=p.z-this.at.z;if(Math.hypot(x-this.last.x,z-this.last.z)<3)return;this.last.set(x,0,z);for(const [lod,meshes]of this.groups){const list=HUNDRED_BUDDHAS.filter(s=>galleryLod(Math.hypot(x-s.x,z-s.z),this.low)===lod);const buf=new Float32Array(Math.max(1,list.length)*16);list.forEach((s,i)=>Matrix.Compose(new Vector3(s.height,s.height,s.height),Quaternion.RotationYawPitchRoll(s.yaw,0,0),new Vector3(this.at.x+s.x,this.at.y+s.base,this.at.z+s.z)).copyToArray(buf,i*16));for(const m of meshes){m.thinInstanceSetBuffer('matrix',buf,16,false);m.thinInstanceCount=list.length;m.thinInstanceRefreshBoundingInfo(false);m.setEnabled(list.length>0);}}}
 dispose(){this.dead=true;for(const ms of this.groups.values())for(const m of ms)m.dispose();for(const c of this.containers)c.dispose();this.batch.dispose();this.labels.forEach(m=>m.dispose());this.rects.forEach(removeObstacle);this.mats.forEach(m=>m.dispose());this.atlas.dispose();}
}
