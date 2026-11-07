import {largeRoofTiles}from './LargeRoofTiles';
import {Color3,DynamicTexture,Material,StandardMaterial,Texture,RawTexture,Vector3,type Scene,type Mesh}from '@babylonjs/core';
import {BAcc}from './Buildings';
import {surfaceTextures,surfacePixels}from '../visual/Surfaces';
export type SanctuaryMaterials=ReturnType<typeof sanctuaryMaterials>;
export function sanctuaryMaterials(scene:Scene,low:boolean){
 const make=(name:string,hex:string,kind?:'wood'|'cement'|'ceramic'|'brass'|'cloth')=>{const m=new StandardMaterial('an-lien-'+name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor.setAll(kind==='brass'?.35:.07);m.backFaceCulling=false;if(kind){const t=surfaceTextures(scene,kind,low,1);m.diffuseTexture=t.diffuse;m.bumpTexture=t.normal;t.normal.level=kind==='wood'?.25:.18;}return m;};
 const floor=make('granite-floor','#b4aa91','cement'),tx=new DynamicTexture('an-lien-60cm-floor',{width:512,height:512},scene,true),c=tx.getContext()as CanvasRenderingContext2D;
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){c.fillStyle=(x+y)%2?'#dcc79c':'#e8d6ad';c.fillRect(x*128,y*128,128,128);c.strokeStyle='#a98b55';c.lineWidth=1.5;c.strokeRect(x*128,y*128,128,128);for(let k=0;k<90;k++){const v=(k*37+x*17+y*23)%126,w=(k*19+x*7)%126;c.fillStyle=k%2?'#cdb685':'#efe0bd';c.fillRect(x*128+v,y*128+w,1,1);}}tx.update();tx.wrapU=tx.wrapV=Texture.WRAP_ADDRESSMODE;tx.anisotropicFilteringLevel=16;floor.diffuseTexture=tx;floor.metadata={ownedTextures:[tx]};floor.diffuseColor.setAll(1);floor.specularColor.setAll(.14);
 const grass=make('garden-grass','#a5b39a');grass.diffuseTexture=new Texture(`${import.meta.env.BASE_URL}assets/pbr/grass_c.jpg`,scene);grass.bumpTexture=new Texture(`${import.meta.env.BASE_URL}assets/pbr/grass_n.jpg`,scene);grass.bumpTexture.level=.2;
 grass.bumpTexture.gammaSpace=false;grass.metadata={ownedTextures:[grass.diffuseTexture,grass.bumpTexture]};
 const bark=make('bodhi-bark','#ffffff');bark.diffuseTexture=new Texture(import.meta.env.BASE_URL+'assets/garden/bark/albedo.jpg',scene);bark.bumpTexture=new Texture(import.meta.env.BASE_URL+'assets/garden/bark/normal.jpg',scene);bark.bumpTexture.gammaSpace=false;bark.bumpTexture.level=.38;bark.metadata={ownedTextures:[bark.diffuseTexture,bark.bumpTexture]};bark.specularColor.setAll(.025);
 const leafMat=make('bodhi-leaf-detail','#ffffff'),leafTx=new DynamicTexture('bodhi-veins',{width:1024,height:1024},scene,true),lc=leafTx.getContext()as CanvasRenderingContext2D;const lg=lc.createLinearGradient(0,0,1024,1024);lg.addColorStop(0,'#759c41');lg.addColorStop(.5,'#356025');lg.addColorStop(1,'#658b37');lc.fillStyle=lg;lc.fillRect(0,0,1024,1024);lc.lineWidth=5;lc.strokeStyle='#a4b75c';lc.beginPath();lc.moveTo(512,80);lc.quadraticCurveTo(500,500,512,1024);lc.stroke();for(let i=0;i<11;i++)for(const side of [-1,1]){const y=200+i*65;lc.lineWidth=2;lc.strokeStyle='#6f9142';lc.beginPath();lc.moveTo(512,y+80);lc.quadraticCurveTo(512+side*130,y,512+side*(420-i*12),y-90);lc.stroke();}leafTx.update();leafTx.anisotropicFilteringLevel=8;leafMat.diffuseTexture=leafTx;leafMat.metadata={ownedTextures:[leafTx]};leafMat.specularColor.setAll(.07);
 const water=make('garden-water','#37645a'),wave=RawTexture.CreateRGBATexture(surfacePixels('cement',128).normal,128,128,scene,true,false);wave.gammaSpace=false;wave.uScale=10;wave.vScale=10;wave.level=.12;water.bumpTexture=wave;water.metadata={ownedTextures:[wave]};water.specularColor.setAll(.5);water.specularPower=100;
 const roof=make('large-yin-yang-roof','#cf7831');largeRoofTiles(roof,scene);
 const lamp=make('stone-lantern-amber','#ffbe62');
 lamp.disableLighting=true;lamp.emissiveColor.set(1,.55,.17);
 const lampHalo=make('stone-lantern-halo','#ffac43'),haloTex=new DynamicTexture('stone-lantern-halo',{width:64,height:64},scene,false);
 const hc=haloTex.getContext() as CanvasRenderingContext2D;
 const halo=hc.createRadialGradient(32,34,0,32,34,29);
 halo.addColorStop(0,'rgba(255,181,69,.48)');halo.addColorStop(.4,'rgba(255,152,37,.23)');halo.addColorStop(1,'rgba(255,115,20,0)');
 hc.fillStyle=halo;hc.fillRect(0,0,64,64);haloTex.hasAlpha=true;haloTex.update();
 haloTex.wrapU=haloTex.wrapV=Texture.CLAMP_ADDRESSMODE;
 lampHalo.diffuseTexture=haloTex;lampHalo.useAlphaFromDiffuseTexture=true;lampHalo.disableLighting=true;
 lampHalo.emissiveColor.set(1,.51,.14);lampHalo.transparencyMode=Material.MATERIAL_ALPHABLEND;
 lampHalo.metadata={ownedTextures:[haloTex]};
 let time=0;
 const flicker=scene.onBeforeRenderObservable.add(()=>{
  time+=Math.min(scene.getEngine().getDeltaTime(),100)/1000;
  const level=.87+.08*Math.sin(time*5.1)+.045*Math.sin(time*9.7+.6);
  lamp.emissiveColor.set(level,level*.56,level*.19);
  lampHalo.alpha=.75+.16*Math.sin(time*4.4)+.065*Math.sin(time*9.1);
  haloTex.uOffset=.034*Math.sin(time*3.7);haloTex.vOffset=.041*Math.sin(time*5.3+.4);
 });
 lamp.onDisposeObservable.addOnce(()=>scene.onBeforeRenderObservable.remove(flicker));
 return{floor,lamp,lampHalo,wood:make('lim-wood','#44251a','wood'),red:make('lacquer','#6c2118','wood'),stone:make('granite-plinth','#aaa99a','cement'),ivory:make('lime-plaster','#d6caab','cement'),gold:make('aged-brass','#b59047','brass'),roof,dark:make('roof-underneath','#3b241a','wood'),cloth:make('meditation-cushion','#8d613c','cloth'),leaf:leafMat,bark,grass,water,sand:make('raked-sand','#c9c5ac','cement')};
}
/** Original architecture/landscape batching. Sacred figures come exclusively from scanned GLBs. */
export class SanctuaryBatch{
 private batches=new Map<StandardMaterial,BAcc>();readonly meshes:Mesh[]=[];
 constructor(private scene:Scene,readonly at:{x:number;y:number;z:number},readonly name:string){}
 acc(mat:StandardMaterial){let a=this.batches.get(mat);if(!a){a=new BAcc();a.at(this.at.x,this.at.y,this.at.z,0);this.batches.set(mat,a);}return a;}
 quad(mat:StandardMaterial,a:number[],b:number[],c:number[],d:number[],uv:[number,number,number,number]=[0,0,1,1]){this.acc(mat).quad(a as[number,number,number],b as[number,number,number],c as[number,number,number],d as[number,number,number],uv,Color3.White());if(mat.metadata?.largeRoofTiles){const ex=b[0]-a[0],ey=b[1]-a[1],ez=b[2]-a[2],fx=d[0]-a[0],fy=d[1]-a[1],fz=d[2]-a[2],alongZ=Math.abs(ey*fz-ez*fy)>Math.abs(ex*fy-ey*fx),values=[a,b,c,d].flatMap(v=>alongZ?[v[2]/2.4,v[0]/1.8]:[v[0]/2.4,v[2]/1.8]),out=this.acc(mat).UVs;for(let i=0;i<8;i++)out[out.length-8+i]=values[i];}}
 box(mat:StandardMaterial,x:number,y:number,z:number,w:number,h:number,d:number){const a=this.acc(mat),x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,y0=y-h/2,y1=y+h/2;a.box(x0,x1,y0,y1,z0,z1,0,Color3.White());a.quad([x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[x0,y0,z0],[0,0,1,1],Color3.White());}
 floor(mat:StandardMaterial,x0:number,x1:number,z0:number,z1:number,y:number,thick=.25){const yy=y-thick;this.quad(mat,[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1],[x0/2.4,z0/2.4,x1/2.4,z1/2.4]);this.quad(mat,[x0,yy,z1],[x1,yy,z1],[x1,yy,z0],[x0,yy,z0]);for(const [a,b]of [[[x0,z0],[x1,z0]],[[x1,z0],[x1,z1]],[[x1,z1],[x0,z1]],[[x0,z1],[x0,z0]]])this.quad(mat,[a[0],yy,a[1]],[b[0],yy,b[1]],[b[0],y,b[1]],[a[0],y,a[1]]);}
 lathe(mat:StandardMaterial,x:number,y:number,z:number,profile:[number,number][],n=20){for(let j=0;j<profile.length-1;j++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,[r,h]=profile[j],[rr,hh]=profile[j+1];this.quad(mat,[x+r*Math.cos(a),y+h,z+r*Math.sin(a)],[x+r*Math.cos(b),y+h,z+r*Math.sin(b)],[x+rr*Math.cos(b),y+hh,z+rr*Math.sin(b)],[x+rr*Math.cos(a),y+hh,z+rr*Math.sin(a)]);}const [rt,ht]=profile.at(-1)!;for(let i=0;i<n;i++)this.quad(mat,[x,y+ht,z],[x+rt*Math.cos(i/n*Math.PI*2),y+ht,z+rt*Math.sin(i/n*Math.PI*2)],[x+rt*Math.cos((i+1)/n*Math.PI*2),y+ht,z+rt*Math.sin((i+1)/n*Math.PI*2)],[x,y+ht,z]);}
 tube(mat:StandardMaterial,points:number[][],r:number,n=8){const rings=points.map((p,i)=>{const t=Vector3.FromArray(points[Math.min(i+1,points.length-1)]).subtract(Vector3.FromArray(points[Math.max(0,i-1)])).normalize(),u=Vector3.Cross(t,Math.abs(t.y)<.9?Vector3.Up():Vector3.Right()).normalize(),v=Vector3.Cross(t,u).normalize();return Array.from({length:n},(_,k)=>Vector3.FromArray(p).add(u.scale(r*Math.cos(k/n*Math.PI*2))).add(v.scale(r*Math.sin(k/n*Math.PI*2))).asArray());});for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++)this.quad(mat,rings[j][i],rings[j][(i+1)%n],rings[j+1][(i+1)%n],rings[j+1][i]);}
 build(){for(const [mat,a]of this.batches){const m=a.build(this.name+'-'+mat.name,this.scene,mat);if(m){m.receiveShadows=true;this.meshes.push(m);}}this.batches.clear();return this;}
 dispose(){for(const m of this.meshes)m.dispose();this.meshes.length=0;}
}
/** Four open faces expose a recessed amber lamp. */
export function stoneLanternHead(b:SanctuaryBatch,stone:StandardMaterial,m:SanctuaryMaterials,x:number,y:number,z:number,width:number,height:number){
 const post=width*.17,corner=(width-post)/2;
 for(const dx of [-corner,corner])for(const dz of [-corner,corner])b.box(stone,x+dx,y,z+dz,post,height,post);
 b.lathe(m.lamp,x,y-height*.36,z,[[width*.08,0],[width*.12,height*.16],[width*.09,height*.38],[width*.045,height*.57],[0,height*.73]],12);
 const w=width*.52,h=height*.66,edge=width*.5+.004;
 for(const side of [-1,1]){
  b.quad(m.lampHalo,[x-w,y-h,z+side*edge],[x+w,y-h,z+side*edge],[x+w,y+h,z+side*edge],[x-w,y+h,z+side*edge]);
  b.quad(m.lampHalo,[x+side*edge,y-h,z-w],[x+side*edge,y-h,z+w],[x+side*edge,y+h,z+w],[x+side*edge,y+h,z-w]);
 }
}
export function gardenStoneLantern(b:SanctuaryBatch,m:SanctuaryMaterials,x:number,z:number,k=1){
 const profile=(points:[number,number][])=>points.map(([r,h]):[number,number]=>[r*k,h*k]);
 b.lathe(m.stone,x,0,z,profile([[.5,0],[.5,.15],[.22,.25],[.17,1.8],[.52,1.88]]),12);
 stoneLanternHead(b,m.stone,m,x,2.165*k,z,.88*k,.57*k);
 b.lathe(m.stone,x,0,z,profile([[.52,2.45],[.68,2.55],[.2,2.95],[0,3.1]]),12);
}
export function sanctuaryColumn(b:SanctuaryBatch,m:SanctuaryMaterials,x:number,z:number,base:number,height:number,k=1){b.lathe(m.stone,x,base,z,[[.95*k,0],[.95*k,.18*k],[.78*k,.35*k],[.64*k,.55*k]],16);b.lathe(m.red,x,base+.5*k,z,[[.65*k,0],[.7*k,height*.3],[.63*k,height-.95*k],[.82*k,height-.5*k]],24);for(const h of [.65*k,height-.55*k])b.lathe(m.gold,x,base+h,z,[[.67*k,0],[.7*k,.08*k],[.67*k,.15*k]],16);for(const side of [-1,1])b.tube(m.wood,[[x+side*.55*k,base+height-2*k,z],[x+side*1.15*k,base+height-1.3*k,z],[x+side*2.4*k,base+height-.5*k,z]],.18*k,8);}
export function sanctuaryDoor(b:SanctuaryBatch,m:SanctuaryMaterials,x:number,z:number,base:number){for(const side of [-1,1]){const xx=x+side*8;b.box(m.wood,xx,base+3.7,z,3.4,7.4,.32);for(const dx of [-1.5,1.5])b.box(m.red,xx+dx,base+3.7,z+.20,.18,7.1,.10);for(const h of [.2,3.1,7.1])b.box(m.gold,xx,base+h,z+.22,3,.09,.08);for(const yy of [1.6,5.2])for(let petal=0;petal<8;petal++){const angle=petal*Math.PI/4,pts=[];for(let i=0;i<=12;i++){const t=i/12*Math.PI*2,r=.4+.28*Math.cos(t);pts.push([xx+r*Math.cos(angle)-.15*Math.sin(t)*Math.sin(angle),base+yy+r*Math.sin(angle)+.15*Math.sin(t)*Math.cos(angle),z+.24]);}b.tube(m.gold,pts,.045,6);}}}
export function sanctuaryRoofProxy(b:SanctuaryBatch,m:SanctuaryMaterials,cx:number,cz:number){for(const [w,d,eave,rise,inner]of [[116,96,23.65,5,.56],[92,76,28.2,4.8,0]])for(let face=0;face<4;face++){const p=(u:number,t:number,dy=0)=>{const x=face<2?(face===0?1:-1)*w/2*t:u*w/2*t,z=face<2?u*d/2*t:(face===2?1:-1)*d/2*t;return[cx+x,eave+rise*(1-t)**1.7+3.8*t**5*Math.abs(u)**7+dy,cz+z];};for(let i=0;i<16;i++)for(let j=0;j<8;j++){const u=-1+i/8,v=u+1/8,t=inner+(1-inner)*j/8,s=inner+(1-inner)*(j+1)/8;b.quad(m.roof,p(u,t),p(v,t),p(v,s),p(u,s),[i/2,j/2,(i+1)/2,(j+1)/2]);}b.tube(m.dark,Array.from({length:17},(_,i)=>p(-1+i/8,1,-.2)),.22,6);}}
