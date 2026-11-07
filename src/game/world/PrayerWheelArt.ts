import {Color3,DynamicTexture,Mesh,PBRMaterial,RawTexture,StandardMaterial,Texture,VertexData,type Scene} from '@babylonjs/core';
import {MANTRA,PRAYER_WHEEL as P} from './PrayerWheelPlan';
/** Browser text shaping preserves Devanagari conjuncts; a recessed height/normal map engraves the gold. */
export async function prayerWheelMaterials(scene:Scene,low:boolean){
 const face=new FontFace('AnLienDevanagari',`url(${import.meta.env.BASE_URL}assets/fonts/noto-devanagari/NotoSansDevanagari.ttf)`);await face.load();document.fonts.add(face);
 const width=low?2048:4096,height=width/2,t=new DynamicTexture('mantra-recessed-gold',{width,height},scene,true),ctx=t.getContext()as CanvasRenderingContext2D;
 const mask=document.createElement('canvas');mask.width=width;mask.height=height;const c=mask.getContext('2d',{willReadFrequently:true})!;c.fillStyle='#000';c.fillRect(0,0,width,height);c.fillStyle='#fff';c.font=`500 ${height*.145}px AnLienDevanagari`;c.textAlign='center';c.textBaseline='middle';
 for(let row=0;row<4;row++)for(let col=0;col<2;col++)c.fillText(MANTRA,(col+.5)*width/2,(row+.5)*height/4,width*.455);
 const data=c.getImageData(0,0,width,height).data,img=ctx.createImageData(width,height),normal=new Uint8Array(width*height*4);
 const at=(x:number,y:number)=>data[(((y+height)%height)*width+(x+width)%width)*4]/255;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,v=at(x,y),grain=Math.sin(x*.73+y*1.31)*1.2;
  img.data[i]=255-v*101+grain;img.data[i+1]=215-v*113+grain;img.data[i+2]=30-v*16;img.data[i+3]=255;
  const nx=(at(x+2,y)-at(x-2,y))*2.4,ny=-(at(x,y+2)-at(x,y-2))*2.4,nz=1,ln=Math.hypot(nx,ny,nz);normal[i]=(nx/ln*.5+.5)*255;normal[i+1]=(ny/ln*.5+.5)*255;normal[i+2]=(nz/ln*.5+.5)*255;normal[i+3]=255;
 }
 ctx.putImageData(img,0,0);t.update();t.wrapU=t.wrapV=Texture.WRAP_ADDRESSMODE;t.uScale=P.phrasesPerRow/2;t.uOffset=.25;t.vScale=P.rows/4;t.anisotropicFilteringLevel=16;
 const n=RawTexture.CreateRGBATexture(normal,width,height,scene,true,true);n.gammaSpace=false;n.uScale=t.uScale;n.uOffset=t.uOffset;n.vScale=t.vScale;n.wrapU=n.wrapV=Texture.WRAP_ADDRESSMODE;n.anisotropicFilteringLevel=16;n.level=.85;
 const gold=new PBRMaterial('kinh-luan-gold',scene);gold.albedoColor=Color3.FromHexString('#FFD700');gold.metallic=.78;gold.roughness=.25;gold.environmentIntensity=1.15;gold.emissiveColor=Color3.FromHexString('#ffc000').scale(.10);
 const inscription=new PBRMaterial('gold-with-recessed-sanskrit',scene);inscription.albedoTexture=t;inscription.bumpTexture=n;inscription.metallic=.72;inscription.roughness=.29;inscription.environmentIntensity=1.2;inscription.emissiveColor=Color3.FromHexString('#ffc000').scale(.035);inscription.backFaceCulling=false;
 const stone=new StandardMaterial('kinh-luan-granite',scene);stone.diffuseColor=Color3.FromHexString('#b9b3a5');stone.specularColor.setAll(.12);
 return{gold,inscription,stone,dispose(){gold.dispose();inscription.dispose();stone.dispose();t.dispose();n.dispose();}};
}
/** UV increases left-to-right around the outside; no mirrored back-side label. */
export function prayerDrum(scene:Scene,low:boolean,material:PBRMaterial){const n=low?128:256,positions:number[]=[],normals:number[]=[],uvs:number[]=[],indices:number[]=[];
 for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,x=Math.cos(a),z=Math.sin(a);for(const y of [P.bodyBottom,P.bodyTop]){positions.push(x*P.radius,y,z*P.radius);normals.push(x,0,z);uvs.push(i/n,y===P.bodyBottom?0:1);}}
 for(let i=0;i<n;i++){const k=i*2;indices.push(k,k+1,k+2,k+2,k+1,k+3);}const d=new VertexData();d.positions=positions;d.normals=normals;d.uvs=uvs;d.indices=indices;const m=new Mesh('gold-mantra-drum-diameter50-height100',scene);d.applyToMesh(m);m.material=material;m.receiveShadows=true;return m;}
