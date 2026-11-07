import {Mesh,VertexData,StandardMaterial,PBRMaterial,DynamicTexture,Color3,Texture,type Scene} from '@babylonjs/core';
import {CharacterLibrary,type HumanRig} from './CharacterLibrary';
import type {AvatarAsset} from './AvatarV2';
import {MONK_PROFILES,type MonkProfile} from './MonkPlan';
/** Ten fictional temple residents, reusing the existing rig and continuous anatomical surface. */
export class MonkLibrary{
 readonly characters:HumanRig[]=[];private library:CharacterLibrary;private asset!:AvatarAsset;
 constructor(private scene:Scene,private low:boolean){this.library=new CharacterLibrary(scene,low);}
 async load(){await this.library.load();this.asset=await this.library.loadAvatarV2();return this;}
 create(p:MonkProfile){
  const rig=this.library.createHuman({id:p.id,appearance:'minh-v2',ritualMaster:true,avatar:{version:2,face:p.face,outfit:'earth',hair:'short'},hair:'none',height:p.height,outfit:{robe:p.robe,inner:p.robe,trousers:p.robe,belt:p.robe,trim:p.robe,boots:'#483b2e',skirt:true,style:'robe'}});
  const yellow=new StandardMaterial(p.id+'-saffron-cloth',this.scene);yellow.diffuseColor=Color3.FromHexString(p.robe).scale(.72);yellow.specularColor.set(.07,.05,.02);yellow.backFaceCulling=false;
  for(const mesh of rig.meshes){
   if(/hair|crown|ritual-front-panel|ritual-back-panel|finished-collar/.test(mesh.name))mesh.setEnabled(false);
   if(/ritual-|shirt|trousers|pants|collar/.test(mesh.name)&&!/crown/.test(mesh.name))mesh.material=yellow;
   if(mesh.name==='minh-v2-skin'&&mesh.material instanceof StandardMaterial){mesh.material.diffuseColor=Color3.FromHexString(p.skin);}
  }
  const template=rig.meshes.find(m=>m.name==='minh-v2-skin') as Mesh;
  if(!template)throw new Error('Thiếu cơ thể liền cho nhà sư');
  const runtime=template.skeleton!.bones.map(b=>b.name.split(':').pop()!),bone=(name:string)=>{const n=runtime.indexOf(name);if(n<0)throw new Error('Thiếu khớp '+name);return n;};
  const pos:number[]=[],uv:number[]=[],idx:number[]=[],joints:number[]=[],weights:number[]=[];
  const rows=32,cols=this.low?64:96;
  for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
   const t=r/rows,a=c/cols*Math.PI*2,x=Math.sin(a)*(.27+t*.09),z=Math.cos(a)*(.225+t*.09)-.014;
   const top=1.29+.245*Math.sin(a),y=top*(1-t)+.205*t+.008*Math.sin(a*18)*t;
   pos.push(x,y,z);uv.push(c/cols,1-t);
   const lower=Math.min(.65,Math.max(0,(1-y)*1.4)),upper=Math.min(1,Math.max(0,(y-1.05)/.36));
   joints.push(bone('pelvis'),bone(x>=0?'thigh_l':'thigh_r'),bone('spine_02'),0);weights.push((1-lower)*(1-upper),lower,(1-lower)*upper,0);
   if(r<rows&&c<cols){const k=r*(cols+1)+c;idx.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
  }
  const mesh=new Mesh(p.id+'-red-gold-kashaya',this.scene),vd=new VertexData();vd.positions=pos;vd.indices=idx;vd.uvs=uv;vd.matricesIndices=joints;vd.matricesWeights=weights;const n:number[]=[];VertexData.ComputeNormals(pos,idx,n);vd.normals=n;vd.applyToMesh(mesh);
  mesh.parent=template.parent;mesh.position.copyFrom(template.position);mesh.scaling.copyFrom(template.scaling);mesh.rotationQuaternion=template.rotationQuaternion?.clone()??null;mesh.skeleton=template.skeleton;mesh.overrideMaterialSideOrientation=template.overrideMaterialSideOrientation;mesh.isPickable=false;
  const tx=new DynamicTexture(p.id+'-kashaya-weave',{width:1024,height:1024},this.scene,true),ctx=tx.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle=p.sash;ctx.fillRect(0,0,1024,1024);for(let y=0;y<1024;y+=3){ctx.strokeStyle=y%2?'rgba(255,196,110,.07)':'rgba(30,0,0,.08)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1024,y);ctx.stroke();}
  const mask=new DynamicTexture(p.id+'-metalness',{width:1024,height:1024},this.scene,false),mc=mask.getContext() as CanvasRenderingContext2D;mc.fillStyle='rgb(0,220,0)';mc.fillRect(0,0,1024,1024);
  const stripe=(x:number,y:number,w:number,h:number)=>{const g=ctx.createLinearGradient(x,y,x+Math.max(w,1),y+Math.max(h,1));g.addColorStop(0,'#99631a');g.addColorStop(.45,'#fff0a0');g.addColorStop(.7,'#dbab38');g.addColorStop(1,'#a47120');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);mc.fillStyle='rgb(0,95,240)';mc.fillRect(x,y,w,h);};
  for(let row=0;row<=7;row++)stripe(0,row*144,1024,12);
  for(let row=0;row<7;row++)for(let col=0;col<5;col++)stripe((col*256+(row%2)*128)%1024,row*144,10,144);
  stripe(0,0,18,1024);stripe(1006,0,18,1024);tx.update();mask.update();mask.gammaSpace=false;tx.wrapU=Texture.WRAP_ADDRESSMODE;tx.anisotropicFilteringLevel=8;
  const red=new StandardMaterial(p.id+'-red-silk-gold-thread',this.scene);red.diffuseTexture=tx;red.diffuseColor=Color3.White();red.specularColor.set(.65,.46,.17);red.specularPower=96;red.backFaceCulling=false;red.twoSidedLighting=true;red.emissiveColor.set(.08,.035,.02);mesh.useVertexColors=false;mesh.material=red;rig.meshes.push(mesh);
  rig.root.metadata={monkId:p.id,role:p.role,fictional:true};rig.anim.play('Idle_Loop');
  const dispose=rig.dispose.bind(rig);rig.dispose=()=>{dispose();yellow.dispose();red.dispose();tx.dispose();mask.dispose();};
  this.characters.push(rig);return rig;
 }
 spawnCommunity(){return MONK_PROFILES.map(p=>{const rig=this.create(p);rig.root.position.set(p.x,0,p.z);rig.root.rotation.y=Math.PI;return{profile:p,rig};});}
 update(dt:number){for(const r of this.characters)if(r.root.isEnabled())r.anim.update(dt);}
 dispose(){for(const r of this.characters)r.dispose();this.characters.length=0;}
}
