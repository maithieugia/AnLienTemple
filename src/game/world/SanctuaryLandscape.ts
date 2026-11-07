import {CAMPUS_PATHS,CAMPUS_GRAVEL,CAMPUS_ROCKS}from './CampusLayoutPlan';
import {STUPA,STUPA_WEST_GATE_X}from './StupaPlan';
import {ENTRANCE_GATE as GATE}from './EntranceRiverPlan';
import {PRAYER_WHEEL_SITES,PRAYER_WHEEL as PW} from './PrayerWheelPlan';
import {Matrix,Quaternion,Vector3,Mesh,VertexData,DynamicTexture,StandardMaterial,type Scene}from '@babylonjs/core';
import {gardenStoneLantern,SanctuaryBatch,sanctuaryColumn,type SanctuaryMaterials}from './SanctuaryGeometry';
import {statueGardenReserved} from './StatueGardenPlan';
import {SANCTUARY_BODHI,SANCTUARY_PONDS,SANCTUARY,sanctuaryHeight}from './SanctuaryPlan';
import {WindPlugin}from './Vegetation';
import type{Rect}from './Obstacles';
export function campusGround(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials){const p:number[]=[],uv:number[]=[],ind:number[]=[],norm:number[]=[];const nx=160,nz=224;for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=-400+i*5,z=-400+j*5;p.push(at.x+x,at.y+sanctuaryHeight(SANCTUARY.x+x,SANCTUARY.z+z,.4)-.4,at.z+z);uv.push(x/7,z/7);}for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;ind.push(a,a+1,a+nx+1,a+1,a+nx+2,a+nx+1);}VertexData.ComputeNormals(p,ind,norm);const d=new VertexData();d.positions=new Float32Array(p);d.normals=new Float32Array(norm);d.uvs=new Float32Array(uv);d.indices=new Uint32Array(ind);const mesh=new Mesh('An Lien campus with excavated entrance river',scene);d.applyToMesh(mesh);mesh.material=m.grass;mesh.receiveShadows=true;mesh.isPickable=false;return mesh;}
export function campusPublicWorks(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials){const b=new SanctuaryBatch(scene,at,'an-lien-campus-paths'),obstacles:Rect[]=[];
 const block=(x:number,z:number,hx:number,hz:number,h:number)=>obstacles.push({
  cx:x,cz:z,hx,hz,base:0,h,yaw:0,sight:true,climb:false
 });
 for(const x of GATE.columns)block(x,GATE.z,.95*GATE.columnScale,.95*GATE.columnScale,GATE.columnHeight);
 for(const p of CAMPUS_PATHS)b.floor(m.floor,p.x0,p.x1,p.z0,p.z1,.018,.08);
 // Side boundary opens directly onto the relocated tower plaza.
 for(const [x,z0,z1] of [[-395,-395,595],[STUPA_WEST_GATE_X,-395,STUPA.z-12],[STUPA_WEST_GATE_X,STUPA.z+12,595]]){b.box(m.ivory,x,.6,(z0+z1)/2,.45,1.2,z1-z0);obstacles.push({cx:x,cz:(z0+z1)/2,hx:.23,hz:(z1-z0)/2,yaw:0,base:0,h:1.2,sight:true,climb:false});}
 b.box(m.ivory,0,.6,-395,790,1.2,.45);obstacles.push({cx:0,cz:-395,hx:395,hz:.23,yaw:0,base:0,h:1.2,sight:true,climb:false});
 // Front boundary is now the carved river-bank balustrade; leave the inner stair promenade accessible.
 // Raked gravel islands and hand-placed irregular stone groups, outside paths.
 for(const {x,z,w,d}of CAMPUS_GRAVEL){b.floor(m.sand,x-w/2,x+w/2,z-d/2,z+d/2,.035,.06);for(let i=0;i<18;i++){const zz=z-d/2+2+i*(d-4)/18;b.tube(m.stone,[[x-w/2+2,.06,zz],[x-w/4,.06,zz+Math.sin(i)*.25],[x+w/4,.06,zz+.2],[x+w/2-2,.06,zz]],.025,4);}}
 for(const {x,z,radius,height,i}of CAMPUS_ROCKS){b.lathe(m.stone,x,.03,z,[[0,0],[1.4+i*.15,.1],[2.6-i*.2,1],[1.8-i*.12,2.8-i*.25],[.3,height]],7);obstacles.push({cx:x,cz:z,hx:radius,hz:radius,yaw:0,base:0,h:height+.03,sight:true,climb:false});}
 for(const p of SANCTUARY_PONDS){const n=96;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=(i+1)/n*Math.PI*2;b.quad(m.water,[p.x,-.5,p.z],[p.x+p.rx*Math.cos(a),-.5,p.z+p.rz*Math.sin(a)],[p.x+p.rx*Math.cos(c),-.5,p.z+p.rz*Math.sin(c)],[p.x+p.rx*Math.cos(c),-.5,p.z+p.rz*Math.sin(c)]);}for(let i=0;i<64;i++){const a=i/64*Math.PI*2,c=(i+1)/64*Math.PI*2,x=p.x+(p.rx+2)*Math.cos(a),z=p.z+(p.rz+2)*Math.sin(a),xx=p.x+(p.rx+2)*Math.cos(c),zz=p.z+(p.rz+2)*Math.sin(c);b.lathe(m.stone,x,0,z,[[.25,0],[.3,.15],[.20,.7]],8);b.tube(m.wood,[[x,.8,z],[xx,.8,zz]],.055,6);obstacles.push({cx:(x+xx)/2,cz:(z+zz)/2,hx:Math.hypot(xx-x,zz-z)/2+.08,hz:.08,yaw:Math.atan2(-(zz-z),xx-x),base:0,h:.9,sight:true,climb:false});}}
 // Benches, stone lanterns and planters, each with recognizable construction.
 for(let i=0;i<28;i++){const side=i%2?1:-1,x=side*(35+(i%3)*12),z=260+Math.floor(i/2)*17;if(PRAYER_WHEEL_SITES.some(w=>Math.hypot(w.x-x,w.z-z)<PW.plinthRadius+8)||statueGardenReserved(x,z,3)||statueGardenReserved(side*20,z,3))continue;for(const dx of [-.8,.8])b.box(m.stone,x+dx,.38,z,.25,.7,.55);b.box(m.wood,x,.8,z,2.3,.16,.7);b.box(m.wood,x,1.15,z-.34,2.3,.65,.10);gardenStoneLantern(b,m,side*20,z);
  block(x,z,1.15,.39,1.48);
  block(side*20,z,.5,.5,3.1);
 }
 return{batch:b.build(),obstacles};
}
export function campusGate(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials){const b=new SanctuaryBatch(scene,at,'an-lien-tam-quan');const tube=(mat:StandardMaterial,p:number[][],r:number,n:number)=>{const acc=b.acc(mat),start=acc.N.length;b.tube(mat,p,r,n);for(let i=start;i<acc.N.length;i++)acc.N[i]*=-1;};for(const x of GATE.columns)sanctuaryColumn(b,m,x,GATE.z,.1,GATE.columnHeight,GATE.columnScale);b.box(m.wood,0,GATE.beamY,GATE.z,54,.9,1.5);const roof=(w:number,d:number,base:number,rise:number)=>{for(let side=0;side<4;side++){const p=(u:number,t:number)=>[side<2?(side===0?1:-1)*w/2*t:u*w/2*t,base+rise*(1-t)**1.7+GATE.upturn*t**5*Math.abs(u)**7,565+(side<2?u*d/2*t:(side===2?1:-1)*d/2*t)];for(let i=0;i<32;i++)for(let j=0;j<10;j++){const a=p(-1+i/16,j/10),c=p(-1+(i+1)/16,j/10),d=p(-1+(i+1)/16,(j+1)/10),e=p(-1+i/16,(j+1)/10),down=(v:number[])=>[v[0],v[1]-.45,v[2]];b.quad(m.roof,a,c,d,e);{const n=b.acc(m.roof).N,k=n.length-12;if(n[k+1]<0)for(let j=k;j<n.length;j++)n[j]*=-1;}b.quad(m.dark,down(e),down(d),down(c),down(a));if(j===9)b.quad(m.red,e,d,down(d),down(e));}const ribs=Math.ceil((side<2?d:w)/2.4);for(let i=0;i<=ribs;i++)tube(m.roof,Array.from({length:13},(_,j)=>{const v=p(-1+2*i/ribs,.15+j*.85/12);v[1]+=.065;return v;}),.13,8);tube(m.dark,Array.from({length:33},(_,i)=>p(-1+i/16,1)),.16,6);}};for(const r of [GATE.lower,GATE.middle,GATE.upper])roof(r.width,r.depth,r.base,r.rise);b.box(m.red,0,15.5,565.7,18,2.8,.4);return b.build();}
/** Bodhi heart-shaped leaves and tapering branches; no sphere used as a canopy. */
export function campusTrees(scene:Scene,at:{x:number;y:number;z:number},m:SanctuaryMaterials,low:boolean){const wood=new SanctuaryBatch(scene,at,'an-lien-living-bodhi-and-garden-trees'),matrices:number[]=[];let seed=4126;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const tree=(x:number,z:number,height:number,radius:number,hero=false)=>{
  wood.lathe(m.bark,x,0,z,[[radius,0],[radius*.8,.8],[radius*.58,height*.4],[radius*.25,height*.72],[.06,height]],hero?24:12);
  if(hero)for(let k=0;k<10;k++){const a=k/10*Math.PI*2;wood.tube(m.bark,[[x,1,z],[x+Math.cos(a)*radius*1.4,.35,z+Math.sin(a)*radius*1.4],[x+Math.cos(a)*radius*3,-.05,z+Math.sin(a)*radius*3]],.22,8);}
  for(let k=0;k<(hero?28:9);k++){const a=k*2.399+ rnd()*.4,rr=height*(.26+rnd()*.32),yy=height*(.45+rnd()*.40),end=[x+Math.cos(a)*rr,yy+height*.1,z+Math.sin(a)*rr];wood.tube(m.bark,[[x,height*(.30+k%4*.1),z],[x+Math.cos(a)*rr*.5,yy,z+Math.sin(a)*rr*.5],end],hero?.22:.065,8);
   const n=hero?(low?420:900):(low?32:60);for(let i=0;i<n;i++){const u=rnd()*Math.PI*2,r=Math.sqrt(rnd())*height*.15,px=end[0]+Math.cos(u)*r,py=end[1]+(rnd()-.4)*height*.10,pz=end[2]+Math.sin(u)*r;const q=Quaternion.RotationYawPitchRoll(rnd()*6.28,(rnd()-.5)*1.3,(rnd()-.5)*.8),s=hero?.8+rnd()*.9:.65+rnd()*.7;matrices.push(...Matrix.Compose(new Vector3(s,s,s),q,new Vector3(at.x+px,at.y+py,at.z+pz)).asArray());}}
 };
 tree(SANCTUARY_BODHI.x,SANCTUARY_BODHI.z,28,2.3,true);
 const leaf=new Mesh('Bodhi cordate leaves with drip tips',scene),d=new VertexData(),outline=[[-.10,.14],[-.14,.06],[-.12,-.04],[-.055,-.14],[0,-.30],[.055,-.14],[.12,-.04],[.14,.06],[.10,.14],[.04,.15],[0,.10],[-.04,.15]],pos=[0,0,.012,...outline.flatMap(v=>[v[0],v[1],0])],indices:number[]=[];for(let i=0;i<outline.length;i++)indices.push(0,i+1,(i+1)%outline.length+1);const normal:number[]=[];VertexData.ComputeNormals(pos,indices,normal);d.positions=pos;d.normals=normal;d.indices=indices;d.uvs=Array.from({length:pos.length/3},(_,i)=>[pos[i*3]/.3+.5,pos[i*3+1]/.5+.6]).flat();d.applyToMesh(leaf);leaf.material=m.leaf;new WindPlugin(m.leaf,.12,false,0);leaf.thinInstanceSetBuffer('matrix',new Float32Array(matrices),16,true);leaf.isPickable=false;leaf.receiveShadows=true;return{wood:wood.build(),leaf,leafCount:matrices.length/16};}
/** Separate readable faces: text is never shown through a reversed back face. */
export function campusSign(scene:Scene,at:{x:number;y:number;z:number},text:string,x:number,y:number,z:number,width=14){
 const tx=new DynamicTexture('an-lien-lettering-'+text,{width:2048,height:256},scene,true),ctx=tx.getContext()as CanvasRenderingContext2D;ctx.fillStyle='#321b10';ctx.fillRect(0,0,2048,256);ctx.strokeStyle='#caa35c';ctx.lineWidth=12;ctx.strokeRect(14,14,2020,228);ctx.fillStyle='#f8dc91';ctx.font='bold 112px Segoe UI';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,1024,132,1940);tx.update();tx.anisotropicFilteringLevel=16;
 const mat=new StandardMaterial('an-lien-sign-'+text,scene);mat.diffuseTexture=tx;mat.emissiveColor.setAll(.16);mat.backFaceCulling=true;mat.specularColor.setAll(.12);
 const face=(side:number)=>{const mesh=new Mesh('readable-'+text+'-'+side,scene),d=new VertexData(),half=width/2;d.positions=[side*half,0,side*.36,-side*half,0,side*.36,-side*half,width/8,side*.36,side*half,width/8,side*.36];d.indices=[0,1,2,0,2,3];d.normals=Array.from({length:4},()=>[0,0,side]).flat();d.uvs=[0,0,1,0,1,1,0,1];d.applyToMesh(mesh);mesh.material=mat;mesh.isPickable=false;return mesh;};
 const front=face(1),back=face(-1);back.parent=front;front.position.set(at.x+x,at.y+y,at.z+z);return front;
}
