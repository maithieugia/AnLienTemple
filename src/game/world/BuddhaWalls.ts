import {Color3,Matrix,Mesh,PBRMaterial,Quaternion,Texture,Vector3,VertexData,type Scene} from '@babylonjs/core';
import {BUDDHA_WALL_TILES,reliefLod,reliefWallRects,type BuddhaTile} from './BuddhaWallPlan';
import {addObstacle,removeObstacle,type Rect} from './Obstacles';

const BASE=import.meta.env.BASE_URL+'assets/sanctuary/wall-buddha-relief/';
/** The whole three-wall layout shares two meshes and one licensed scan-derived bake. */
export class BuddhaWalls{
 private far?:Mesh;private near?:Mesh;private materials:PBRMaterial[]=[];private textures:Texture[]=[];private dead=false;private last=new Vector3(1e9,0,0);private rects:Rect[]=[];
 ready=false;failed=false;nearCount=0;get count(){return this.tiles.length;}
 constructor(private scene:Scene,private low:boolean,private at:{x:number;y:number;z:number},private tiles=BUDDHA_WALL_TILES){void this.load();}
 private async load(){try{
  const texture=(name:string)=>new Promise<Texture>((resolve,reject)=>{const t=new Texture(BASE+name,this.scene,false,true,Texture.TRILINEAR_SAMPLINGMODE,()=>resolve(t),(_,e)=>reject(e??new Error(name)));t.anisotropicFilteringLevel=8;this.textures.push(t);});
  const [color,normal,grid]=await Promise.all([texture('albedo.png'),texture('normal.png'),fetch(BASE+`grid-${this.low?64:128}.json`).then(r=>{if(!r.ok)throw Error('Relief mesh unavailable');return r.json() as Promise<{steps:number;size:number;heights:number[]}>;})]);
  if(this.dead)return;normal.gammaSpace=false;
  const material=(name:string,strength:number)=>{const m=new PBRMaterial(name,this.scene);m.albedoTexture=color;m.metallic=.86;m.roughness=.40;m.environmentIntensity=1.25;m.emissiveColor=new Color3(.025,.014,.003);m.backFaceCulling=false;m.twoSidedLighting=true;m.bumpTexture=normal.clone();m.bumpTexture.level=strength;this.textures.push(m.bumpTexture as Texture);this.materials.push(m);return m;};
  const make=(name:string,steps:number,heights?:number[])=>{const p:number[]=[],uv:number[]=[],indices:number[]=[],normals:number[]=[];
   for(let row=0;row<=steps;row++)for(let col=0;col<=steps;col++){p.push((col/steps-.5)*5,(row/steps-.5)*5,heights?.[row*(steps+1)+col]??0);uv.push(col/steps,row/steps);if(row<steps&&col<steps){const a=row*(steps+1)+col;indices.push(a,a+1,a+steps+1,a+1,a+steps+2,a+steps+1);}}
   VertexData.ComputeNormals(p,indices,normals);const data=new VertexData();data.positions=p;data.uvs=uv;data.indices=indices;data.normals=normals;const mesh=new Mesh(name,this.scene);data.applyToMesh(mesh);mesh.isPickable=false;mesh.receiveShadows=true;mesh.material=material(name+'-gold',heights ? .35 : 1);return mesh;
  };
  this.far=make('an-lien-square-buddha-tiles-far',1);this.near=make('an-lien-scan-buddha-relief-close',grid.steps,grid.heights);
  for(const r of reliefWallRects()){const rect:Rect={...r,cx:r.cx+this.at.x,cz:r.cz+this.at.z,yaw:0,base:this.at.y+r.base,sight:true,climb:false};addObstacle(rect);this.rects.push(rect);}
  this.ready=true;this.update({x:this.at.x,y:this.at.y+3,z:this.at.z-180});
 }catch(e){this.failed=true;console.error('Gold Buddha wall relief:',e);}}
 private instances(mesh:Mesh,tiles:BuddhaTile[]){const matrices=new Float32Array(Math.max(1,tiles.length)*16);for(let i=0;i<tiles.length;i++){const t=tiles[i];Matrix.Compose(Vector3.One(),Quaternion.RotationAxis(Vector3.Up(),t.yaw),new Vector3(this.at.x+t.x,this.at.y+t.y,this.at.z+t.z)).copyToArray(matrices,i*16);}mesh.thinInstanceSetBuffer('matrix',matrices,16,false);mesh.thinInstanceCount=tiles.length;mesh.thinInstanceRefreshBoundingInfo(false);mesh.setEnabled(tiles.length>0);}
 /*
  * Performance (Claude 2026-11-03): with ~15,000 tiles, rebuilding every far matrix and scanning every tile each 2 m of walking
  * caused hitches. Now the far layer is built once; only the dozen tiles that swap to/from the close relief are touched,
  * and candidates come from a 16 m grid instead of the whole list.
  */
 private grid?:Map<string,BuddhaTile[]>;private index=new Map<string,number>();private hidden=new Set<string>();
 private cell(x:number,y:number,z:number){return Math.floor(x/16)+','+Math.floor(y/16)+','+Math.floor(z/16);}
 private nearby(eye:Vector3){if(!this.grid){this.grid=new Map();for(const t of this.tiles){const k=this.cell(t.x,t.y,t.z);let c=this.grid.get(k);if(!c)this.grid.set(k,c=[]);c.push(t);}}
  const out:BuddhaTile[]=[],cx=Math.floor(eye.x/16),cy=Math.floor(eye.y/16),cz=Math.floor(eye.z/16);
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let k=-2;k<=2;k++){const c=this.grid.get((cx+i)+','+(cy+j)+','+(cz+k));if(c)for(const t of c)out.push(t);}return out;}
 private matrixOf(t:BuddhaTile,hide=false){return Matrix.Compose(hide?Vector3.Zero():Vector3.One(),Quaternion.RotationAxis(Vector3.Up(),t.yaw),new Vector3(this.at.x+t.x,this.at.y+t.y,this.at.z+t.z));}
 update(p:{x:number;y?:number;z:number}){if(!this.ready||this.dead)return;const eye=new Vector3(p.x-this.at.x,(p.y??3)-this.at.y,p.z-this.at.z);if(Vector3.DistanceSquared(this.last,eye)<4)return;this.last.copyFrom(eye);
  const close=reliefLod(eye,this.low,this.nearby(eye)),ids=new Set(close.map(t=>t.id));this.nearCount=close.length;this.instances(this.near!,close);
  if(!this.index.size){this.instances(this.far!,this.tiles);this.tiles.forEach((t,i)=>this.index.set(t.id,i));}
  let changed=false;const byId=(id:string)=>this.tiles[this.index.get(id)!];
  for(const id of [...this.hidden])if(!ids.has(id)){this.far!.thinInstanceSetMatrixAt(this.index.get(id)!,this.matrixOf(byId(id)),false);this.hidden.delete(id);changed=true;}
  for(const id of ids)if(!this.hidden.has(id)){this.far!.thinInstanceSetMatrixAt(this.index.get(id)!,this.matrixOf(byId(id),true),false);this.hidden.add(id);changed=true;}
  if(changed)this.far!.thinInstanceBufferUpdated('matrix');}
 dispose(){this.dead=true;this.far?.dispose();this.near?.dispose();this.materials.forEach(m=>m.dispose(false,false));this.textures.forEach(t=>t.dispose());this.rects.forEach(removeObstacle);}
}
