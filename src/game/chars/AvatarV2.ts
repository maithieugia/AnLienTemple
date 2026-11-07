import {Color3,Mesh,MeshBuilder,StandardMaterial,Texture,RawTexture,Vector3,VertexBuffer,VertexData,type Scene,type Skeleton} from '@babylonjs/core';
import type {AvatarProfile} from './AvatarProfile';
import {surfaceTextures} from '../visual/Surfaces';
import {ritualWardrobe,shirtCollar} from './RitualWardrobe';
export interface AvatarSurface{positions:number[];normals?:number[];uvs:number[];joints:number[];weights:number[];colors?:number[];indices:number[]}
export interface AvatarAsset{version:number;boneNames:string[];skin:AvatarSurface;shirt:AvatarSurface;pants:AvatarSurface;shirtLong:AvatarSurface;pantsLong:AvatarSurface;hair:AvatarSurface;eyes:AvatarSurface;headAnchor:number[];eyeCenters:number[][]}
const PALETTES={indigo:['#344c57','#72644d'],moss:['#4b5845','#343d42'],earth:['#755242','#5d6262']};
/** New anatomical surface; the previous superhero surface and patchwork accessories are disabled. */
export function buildAvatar(scene:Scene,body:Mesh,skeleton:Skeleton,asset:AvatarAsset,profile:AvatarProfile,low:boolean,ritual=false){
 const parts:Mesh[]=[];
 const runtime=skeleton.bones.map(b=>b.name.split(':').pop()!);const remap=asset.boneNames.map(n=>runtime.indexOf(n));if(remap.some(i=>i<0))throw new Error('Avatar skeleton does not match animation rig');
 const skin=new StandardMaterial('minh-v2-continuous-skin',scene);skin.diffuseColor=Color3.White();skin.specularColor.set(.17,.12,.095);skin.specularPower=42;skin.emissiveColor.set(.012,.009,.007);skin.backFaceCulling=true;
 skin.diffuseTexture=new Texture(`${import.meta.env.BASE_URL}assets/chars/${ritual?'thay-sau':'minh'}-skin-${low?'low':'high'}.jpg`,scene);
 skin.diffuseColor.set(1,.95,.85);skin.specularColor.set(.075,.065,.06);
 const size=low?128:256,pixels=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,a=Math.sin(x*2.19+y*3.71)*Math.cos(y*1.37-x*4.13);pixels.set([128+a*3,128+Math.sin(x*1.8+y*3.1)*3,255,255],i);}const pore=RawTexture.CreateRGBATexture(pixels,size,size,scene,true,false);pore.gammaSpace=false;pore.uScale=pore.vScale=22;pore.level=.15;skin.bumpTexture=pore;
 const [shirtColor,pantsColor]=PALETTES[profile.outfit];
 const cloth=(name:string,color:string)=>{const m=new StandardMaterial(name,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor.set(.025,.025,.025);m.specularPower=18;const t=surfaceTextures(scene,'cloth',low,16);m.diffuseTexture=t.diffuse;m.bumpTexture=t.normal;m.backFaceCulling=false;return m;};
 const shirt=cloth('minh-v2-cotton-shirt',shirtColor),pants=cloth('minh-v2-khaki-trousers',pantsColor);
 const eye=new StandardMaterial('minh-v2-brown-eyes',scene);eye.diffuseTexture=new Texture(`${import.meta.env.BASE_URL}assets/chars/minh-brown-eye.png`,scene);eye.specularColor.set(.4,.4,.4);eye.specularPower=100;
 eye.backFaceCulling=false;eye.emissiveColor.set(.055,.05,.045);
 const attach=(name:string,data:AvatarSurface,mat:StandardMaterial)=>{
  const mesh=new Mesh(name,scene),vd=new VertexData(),p=data.positions.slice();
  if(name==='minh-v2-eyes')for(let i=2;i<p.length;i+=3)p[i]+=.004;
  if(name.includes('skin'))for(let i=0;i<p.length;i+=3)if(p[i+1]>1.58){const t=Math.max(0,Math.min(1,(1.73-p[i+1])/.15));p[i]*=profile.face==='angular'?1-.055*t:profile.face==='soft'?1+.055*t:1;}
  vd.positions=p;const normals:number[]=[];if(!data.normals?.length||profile.face!=='minh'&&name.includes('skin'))VertexData.ComputeNormals(p,data.indices,normals,{useRightHandedSystem:true});vd.normals=normals.length?normals:data.normals!;
  vd.uvs=data.uvs;vd.indices=data.indices;
  if(name==='minh-v2-skin'){const keep:number[]=[];for(let i=0;i<data.indices.length;i+=3){const t=data.indices.slice(i,i+3),y=t.reduce((n,v)=>n+p[v*3+1],0)/3,x=t.reduce((n,v)=>n+Math.abs(p[v*3]),0)/3;
   const underShirt=y>1.025&&y<1.49&&x<.27,underSleeve=y>1.36&&y<1.515&&x>.27&&x<(profile.outfit==='earth'?.66:.42),underTrousers=profile.outfit!=='indigo'&&y>.14&&y<.63&&x<.3;
   if(underShirt||underSleeve||underTrousers)continue;keep.push(...t);}vd.indices=keep;}
  vd.matricesIndices=data.joints.map(i=>remap[i]);vd.matricesWeights=data.weights;
  vd.applyToMesh(mesh);mesh.parent=body.parent;mesh.position.copyFrom(body.position);mesh.scaling.copyFrom(body.scaling);mesh.rotationQuaternion=body.rotationQuaternion?.clone()??null;mesh.skeleton=skeleton;mesh.overrideMaterialSideOrientation=body.overrideMaterialSideOrientation;mesh.material=mat;mesh.isPickable=false;mesh.metadata={avatarV2:true,part:name};parts.push(mesh);return mesh;
 };
 const hairMat=new StandardMaterial('minh-v2-fitted-hair',scene);hairMat.diffuseColor=Color3.FromHexString('#17120f');hairMat.specularColor.set(.09,.085,.075);hairMat.specularPower=48;hairMat.backFaceCulling=false;hairMat.zOffset=-.5;
 attach('minh-v2-hair-cap',asset.hair,hairMat);
 attach('minh-v2-skin',asset.skin,skin);attach('minh-v2-shirt',profile.outfit==='earth'?asset.shirtLong:asset.shirt,shirt);attach('minh-v2-pants',profile.outfit==='indigo'?asset.pants:asset.pantsLong,pants);attach('minh-v2-eyes',asset.eyes,eye);
 attach('minh-v2-finished-collar',shirtCollar(asset,ritual),shirt);
 if(ritual){
  parts.find(m=>m.name==='minh-v2-shirt')!.setEnabled(false);
  const brocade=cloth('ritual-brocade','#ffffff');brocade.diffuseTexture=new Texture(`${import.meta.env.BASE_URL}assets/chars/ritual-brocade.png`,scene);brocade.specularColor.set(.065,.055,.035);brocade.specularPower=32;
  parts.find(m=>m.name==='minh-v2-finished-collar')!.material=brocade;
  for(const [name,data]of Object.entries(ritualWardrobe(asset)))attach(name,data,brocade);
  hairMat.diffuseColor=Color3.FromHexString('#66615a');
 }
 // Eyebrows come from the UV skin atlas, avoiding opaque mirrored brow strips.
 // Soft, closed soles replace the old box-like foot pieces; each uses its foot's bind weights.
 const rubber=new StandardMaterial('minh-v2-sandal-rubber',scene);rubber.diffuseColor=Color3.FromHexString('#302d28');rubber.specularColor.set(.03,.03,.03);rubber.backFaceCulling=false;
 for(const side of [-1,1]){const sole=MeshBuilder.CreateSphere('minh-v2-rounded-sole',{diameter:1,segments:low?10:16},scene);sole.scaling.set(.108,.025,.245);sole.position.set(side*.114,.008,.01);sole.bakeCurrentTransformIntoVertices();const count=sole.getTotalVertices(),foot=asset.boneNames.indexOf(side>0?'foot_l':'foot_r');sole.setVerticesData(VertexBuffer.MatricesIndicesKind,Array.from({length:count},()=>[remap[foot],0,0,0]).flat());sole.setVerticesData(VertexBuffer.MatricesWeightsKind,Array.from({length:count},()=>[1,0,0,0]).flat());sole.parent=body.parent;sole.position.copyFrom(body.position);sole.scaling.copyFrom(body.scaling);sole.rotationQuaternion=body.rotationQuaternion?.clone()??null;sole.skeleton=skeleton;sole.material=rubber;sole.isPickable=false;sole.metadata={avatarV2:true};parts.push(sole);}
 for(const side of [-1,1]){const x=side*.114,foot=asset.boneNames.indexOf(side>0?'foot_l':'foot_r'),tmp=MeshBuilder.CreateTube('sandal-template',{path:[new Vector3(x-.047,.047,-.005),new Vector3(x,.067,.077),new Vector3(x+.047,.047,-.005)],radius:.008,tessellation:low?5:8},scene),count=tmp.getTotalVertices();attach(`minh-v2-sandal-strap-${side}`,{positions:Array.from(tmp.getVerticesData(VertexBuffer.PositionKind)!),normals:Array.from(tmp.getVerticesData(VertexBuffer.NormalKind)!),uvs:Array.from(tmp.getVerticesData(VertexBuffer.UVKind)!),indices:Array.from(tmp.getIndices()!),joints:Array.from({length:count},()=>[foot,0,0,0]).flat(),weights:Array.from({length:count},()=>[1,0,0,0]).flat()},rubber);tmp.dispose();}
 return parts;
}
