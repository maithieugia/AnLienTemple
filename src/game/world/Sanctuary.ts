import {ENTRANCE_GATE}from './EntranceRiverPlan';
import {buildEntranceRiver}from './EntranceRiver';
import {BuddhaWalls} from './BuddhaWalls';
import {HundredBuddhas} from './HundredBuddhas';
import {GardenTrees} from './GardenTrees';
import {StatueGarden} from './StatueGarden';
import {DynamicTexture,MeshBuilder,StandardMaterial,SceneLoader,RegisterSceneLoaderPlugin,LoadAssetContainerAsync,TransformNode,Vector3,ShadowGenerator,PointLight,Color3,Matrix,Quaternion,Mesh,type Scene,type AssetContainer,type AbstractMesh}from '@babylonjs/core';
import {GLTFFileLoader}from '@babylonjs/loaders/glTF';
import {SANCTUARY,SANCTUARY_ROOF_BAYS,SANCTUARY_STATUES,SANCTUARY_LEVELS,sanctuarySeatPositions,SANCTUARY_BODHI,statuePlinth,giantColumnPositions,SANCTUARY_ATRIUM,sanctuaryStatueVisibility,sanctuaryStatueEnabled,SANCTUARY_VAULT}from './SanctuaryPlan';
import {liftGrandRoof,fitHallColumns}from './RoofLift';
import {CourtyardCenser}from './CourtyardCenser';
import {sanctuaryMaterials,SanctuaryBatch,type SanctuaryMaterials}from './SanctuaryGeometry';
import {sanctuaryStructure,sanctuaryHallCell,sanctuaryAltarFurniture,sanctuaryBellDrum}from './SanctuaryArchitecture';
import {campusGround,campusPublicWorks,campusGate,campusTrees,campusSign}from './SanctuaryLandscape';
import {registerInterior}from './Interiors';
import {addObstacle,removeObstacle,type Rect}from './Obstacles';
import {bronzeAltarMesh}from './BronzeAltar';
import {startIncenseSmoke,registerIncense}from './IncenseSmoke';
type Clone={root:TransformNode;dispose:()=>void};
/** Full-size campus in the existing world. It never writes quests, inventory or save files. */
export class Sanctuary{
 private entrance?:ReturnType<typeof buildEntranceRiver>;private buddhaWalls?:BuddhaWalls;private gallery?:HundredBuddhas;private statueGarden?:StatueGarden;private censer?:CourtyardCenser;private garden?:GardenTrees;private mats?:SanctuaryMaterials;private global:SanctuaryBatch[]=[];private loose:Mesh[]=[];private rects:Rect[]=[];private cells=new Map<string,{batch:SanctuaryBatch;rects:Rect[]}>();private proxies=new Map<string,SanctuaryBatch>();private roofs=new Map<string,Clone>();private statues=new Map<string,Clone>();private containers=new Map<string,AssetContainer>();private loading=false;private assetFailure=false;private active=false;private disposed=false;private offSmoke:(()=>void)[]=[];private lights:PointLight[]=[];private treeLeaves=0;
 constructor(private scene:Scene,private low:boolean,readonly at={x:SANCTUARY.x,y:SANCTUARY.y,z:SANCTUARY.z}){
  for(const [id,floor,ceiling]of [['ground',SANCTUARY_LEVELS.floor,SANCTUARY_LEVELS.eaves]]as const)registerInterior(scene,{id:'an-lien-full-'+id,x:at.x,z:at.z,yaw:0,halfWidth:300,halfDepth:200,floor:at.y+floor,ceiling:at.y+ceiling,support:false,priority:3});
  const a=SANCTUARY_ATRIUM;registerInterior(scene,{id:'an-lien-open-nave',x:at.x,z:at.z+(a.z0+a.z1)/2,yaw:0,halfWidth:(a.x1-a.x0)/2,halfDepth:(a.z1-a.z0)/2,floor:at.y+SANCTUARY_LEVELS.floor,ceiling:at.y+SANCTUARY_VAULT.at(-1)!.top,support:false,priority:5});
  scene.onDisposeObservable.addOnce(()=>{this.disposed=true;this.unload();});
 }
 private register(rs:Rect[]){const out=rs.map(r=>({...r,cx:r.cx+this.at.x,cz:r.cz+this.at.z,base:r.base+this.at.y}));out.forEach(addObstacle);return out;}
 private cast(meshes:AbstractMesh[],remove=false){for(const mesh of meshes)for(const light of this.scene.lights){const sh=light.getShadowGenerator();if(sh instanceof ShadowGenerator){if(remove)sh.removeShadowCaster(mesh,false);else sh.addShadowCaster(mesh,false);}}}
 private build(){
  this.active=true;this.buddhaWalls=new BuddhaWalls(this.scene,this.low,this.at);this.gallery=new HundredBuddhas(this.scene,this.low,this.at);this.garden??=new GardenTrees(this.scene,this.low,this.at);this.mats=sanctuaryMaterials(this.scene,this.low);const m=this.mats;this.statueGarden=new StatueGarden(this.scene,this.low,this.at,m);this.censer=new CourtyardCenser(this.scene,this.low,this.at);
  this.loose.push(campusGround(this.scene,this.at,m));this.entrance=buildEntranceRiver(this.scene,this.low,this.at);this.rects.push(...this.register(this.entrance.obstacles));
  const paths=campusPublicWorks(this.scene,this.at,m);this.global.push(paths.batch,campusGate(this.scene,this.at,m));this.rects.push(...this.register(paths.obstacles));
  const structure=sanctuaryStructure(this.scene,this.at,m);this.global.push(structure.batch);this.rects.push(...this.register(structure.rects));
  for(const bay of SANCTUARY_ROOF_BAYS)if(Math.abs(bay.x)===240||Math.abs(bay.z)===150){const shell=sanctuaryHallCell(this.scene,this.at,m,bay.x,bay.z,true);this.global.push(shell.batch);this.rects.push(...this.register(shell.rects));}
  const trees=campusTrees(this.scene,this.at,m,this.low);this.global.push(trees.wood);this.loose.push(trees.leaf);this.treeLeaves=trees.leafCount;
  this.loose.push(campusSign(this.scene,this.at,'CHÙA AN LIÊN',0,ENTRANCE_GATE.signY,565.7,ENTRANCE_GATE.signWidth),campusSign(this.scene,this.at,'CHÁNH ĐIỆN',0,42,201,90));
  for(const s of SANCTUARY_STATUES){const main=s.id==='main-buddha',z=s.z+statuePlinth(s).rz+(main?5:2.5),f=sanctuaryAltarFurniture(this.scene,this.at,m,s.x,z,main);this.global.push(f.batch);const bronze=bronzeAltarMesh(this.scene,this.low,'an-lien-bo-lu-'+s.id);bronze.position.set(this.at.x+s.x,this.at.y+f.top+.14,this.at.z+z);bronze.scaling.setAll(main?5:1.8);this.loose.push(bronze);startIncenseSmoke(this.scene,this.low);this.offSmoke.push(registerIncense(this.scene,new Vector3(this.at.x+s.x,this.at.y+f.top+1.2,this.at.z+z)));}
  // low clouds of mist round the foot of the terrace (soft billboards, no extra light)
  {const t=new DynamicTexture('an-lien-mist',{width:128,height:64},this.scene,false),c=t.getContext() as CanvasRenderingContext2D,g=c.createRadialGradient(64,40,4,64,40,60);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.55,'rgba(240,240,245,.28)');g.addColorStop(1,'rgba(240,240,245,0)');c.fillStyle=g;c.fillRect(0,0,128,64);t.update();t.hasAlpha=true;
   const mm=new StandardMaterial('an-lien-mist-mat',this.scene);mm.diffuseTexture=t;mm.useAlphaFromDiffuseTexture=true;mm.emissiveColor=new Color3(.55,.55,.6);mm.disableLighting=true;mm.backFaceCulling=false;mm.alpha=.55;
   for(let i=0;i<32;i++){const a=i/32*Math.PI*2,rx=360+(i%3)*14,rz=262+(i%4)*10,p=MeshBuilder.CreatePlane('an-lien-mist-'+i,{width:70+(i%5)*12,height:16+(i%3)*5},this.scene);p.material=mm;p.billboardMode=Mesh.BILLBOARDMODE_Y;p.isPickable=false;p.position.set(this.at.x+Math.cos(a)*rx,this.at.y+4+(i%3)*2,this.at.z+Math.sin(a)*rz);this.loose.push(p);}}
  this.global.push(sanctuaryBellDrum(this.scene,this.at,m,-22,180),sanctuaryBellDrum(this.scene,this.at,m,22,180,true));
  const cushions=new SanctuaryBatch(this.scene,this.at,'an-lien-cushions-source');cushions.lathe(m.cloth,0,0,0,[[.48,0],[.55,.07],[.52,.18],[.35,.25],[0,.27]],20);cushions.build();const source=cushions.meshes[0];source.unfreezeWorldMatrix();source.position.set(0,0,0);
  // The source is authored at the campus offset, so use translation deltas only.
  const matrices=sanctuarySeatPositions().flatMap(p=>Matrix.Compose(new Vector3(1,1,1),Quaternion.Identity(),new Vector3(p.x,1.2,p.z)).asArray());source.thinInstanceSetBuffer('matrix',new Float32Array(matrices),16,true);this.global.push(cushions);
  if(!this.lights.length)for(let i=0;i<(this.low?2:4);i++){const l=new PointLight('an-lien-warm-altar-'+i,Vector3.Zero(),this.scene);l.diffuse=new Color3(1,.78,.48);l.specular.setAll(0);l.range=27;l.intensity=0;this.lights.push(l);}
  void this.loadAssets();
 }
 private async loadAssets(){if(this.loading||this.containers.size||this.assetFailure)return;this.loading=true;try{if(!SceneLoader.IsPluginForExtensionAvailable('.glb'))RegisterSceneLoaderPlugin(new GLTFFileLoader());for(const [id,url]of [
  ['buddha-high','assets/sanctuary/statues/buddha/high.glb?v=2-five-roofs'],['buddha-low','assets/sanctuary/statues/buddha/low.glb?v=2-five-roofs'],
  ['guanyin-high','assets/sanctuary/statues/guanyin/high.glb?v=2-five-roofs'],['guanyin-low','assets/sanctuary/statues/guanyin/low.glb?v=2-five-roofs'],
  // the main hall's Buddha (anh Thanh's model, Tượng phật.zip): same files as the 288 stupa Buddhas (TowerBuddhas)
  ['anlien-high','assets/sanctuary/tower-buddha/high.glb?v=288-1'],['anlien-low','assets/sanctuary/tower-buddha/low.glb?v=288-1'],
  // the grand hall made in Blender (tools/art_workshop/recipes/sanctuary_grand.py): one roof, giant columns
  ['grand-roof-high','assets/workshop/vb-sanctuary-grand-roof/high.glb?v=5-large-yin-yang'],['grand-roof-low','assets/workshop/vb-sanctuary-grand-roof/low.glb?v=5-large-yin-yang'],
  ['giant-column-high','assets/workshop/vb-sanctuary-giant-column/high.glb?v=2-five-roofs'],['giant-column-low','assets/workshop/vb-sanctuary-giant-column/low.glb?v=2-five-roofs']]){
   if((id.startsWith('buddha-')||id.startsWith('guanyin-'))&&!SANCTUARY_STATUES.some(s=>sanctuaryStatueEnabled(s)&&id.startsWith(s.kind+'-')))continue;
   if(this.low&&id.endsWith('-high'))continue; // light quality: never download the detailed version (Claude 2026-11-03)
   const c=await LoadAssetContainerAsync(import.meta.env.BASE_URL+url,this.scene);if(this.disposed||!this.active){c.dispose();return;}if(id.startsWith('grand-roof'))liftGrandRoof(c);if(id.startsWith('giant-column'))fitHallColumns(c);this.containers.set(id,c);
  }}catch(e){this.assetFailure=true;console.warn('An Lien scan/roof unavailable; no substitute sacred geometry is generated',e);}finally{this.loading=false;}}
 private clone(id:string,name:string,x:number,y:number,z:number,scale=1,yaw=0){const c=this.containers.get(id);if(!c)return;const root=new TransformNode(name,this.scene),entries=c.instantiateModelsToScene(n=>name+'-'+n,false);for(const r of entries.rootNodes)r.parent=root;root.position.set(this.at.x+x,this.at.y+y,this.at.z+z);root.scaling.setAll(scale);root.rotation.y=yaw;this.cast(root.getChildMeshes());return{root,dispose:()=>{this.cast(root.getChildMeshes(),true);entries.dispose();root.dispose();}};}
 update(p:{x:number;y?:number;z:number},dt=0){
  if(this.disposed)return;const x=p.x-this.at.x,z=p.z-this.at.z,d=Math.hypot(Math.max(-400-x,x-400,0),Math.max(-400-z,z-720,0));if(d<200&&!this.active)this.build();if(d>350&&this.active){this.unload();return;}if(!this.active||!this.mats)return;
  const nearest=SANCTUARY_ROOF_BAYS.map(b=>({...b,d:Math.hypot(x-b.x,z-b.z)})).sort((a,b)=>a.d-b.d),wanted=new Set(nearest.map(b=>b.id)); // all 20 bays stay built (Claude 2026-11-03): building a bay while walking caused a hitch; with no interior columns they are light
  for(const b of SANCTUARY_ROOF_BAYS){if(wanted.has(b.id)){if(!this.cells.has(b.id)){const c=sanctuaryHallCell(this.scene,this.at,this.mats,b.x,b.z);c.rects=this.register(c.rects);this.cells.set(b.id,c);this.cast(c.batch.meshes);}}else{const c=this.cells.get(b.id);if(c){this.cast(c.batch.meshes,true);c.batch.dispose();c.rects.forEach(removeObstacle);this.cells.delete(b.id);}this.roofs.get(b.id)?.dispose();this.roofs.delete(b.id);}}
  {const level=!this.low&&Math.hypot(x,z)<430?'high':'low',key='grand-roof-'+level;for(const old of ['grand-roof-high','grand-roof-low'])if(old!==key&&this.roofs.has(old)){this.roofs.get(old)!.dispose();this.roofs.delete(old);}if(!this.roofs.has(key)){const c=this.clone(key,'an-lien-grand-roof',0,0,0);if(c)this.roofs.set(key,c);}}
  this.buddhaWalls?.update({x:p.x,y:p.y??3,z:p.z});this.gallery?.update(p);this.statueGarden?.update(p);this.censer?.update(p);this.updateColumns(x,z);this.garden?.update(p);
  for(const s of SANCTUARY_STATUES.filter(sanctuaryStatueEnabled)){const dist=Math.hypot(x-s.x,z-s.z),level=sanctuaryStatueVisibility(s,dist,this.low),key=level?s.id+'-'+level:'';for(const old of [s.id+'-high',s.id+'-low'])if(old!==key){this.statues.get(old)?.dispose();this.statues.delete(old);}if(level&&!this.statues.has(key)){const c=this.clone(s.kind+'-'+(this.containers.has(s.kind+'-'+level)?level:'low'),s.id,s.x,s.base,s.z,s.height,s.yaw);if(c)this.statues.set(key,c);}}
  const lamps=SANCTUARY_STATUES.map(s=>({...s,d:Math.hypot(x-s.x,z-s.z)})).sort((a,b)=>a.d-b.d);this.lights.forEach((l,i)=>{const s=lamps[i];const big=s.id==='main-buddha';l.position.set(this.at.x+s.x,this.at.y+(big?65:Math.min(18,s.base+s.height+3)),this.at.z+s.z+(big?40:6));l.range=big?180:27;l.intensity=s.d<(big?480:35)?(big?1.25:.9):0;});
  if(this.mats.water.bumpTexture){const t=this.mats.water.bumpTexture as import('@babylonjs/core').Texture;t.uOffset+=dt*.008;t.vOffset+=dt*.005;}
 }
 private colSets=new Map<string,Mesh[]>();private colAt=new Vector3(1e9,0,1e9);
 /** Giant columns: one Blender model, thin-instanced; near ones use the detailed LOD. Rebuilt when the player moves 25 m. */
 private updateColumns(x:number,z:number){if(Math.hypot(x-this.colAt.x,z-this.colAt.z)<25&&this.colSets.size)return;
  for(const lod of (this.low?['low']:['high','low'])as ('high'|'low')[]){let meshes=this.colSets.get(lod);if(!meshes){const c=this.containers.get('giant-column-'+lod);if(!c)return;const e=c.instantiateModelsToScene(n=>'an-lien-giant-column-'+lod+'-'+n,false);meshes=[];for(const m of e.rootNodes.flatMap(r=>r.getChildMeshes(false))){if(!(m instanceof Mesh)||!m.getTotalVertices())continue;if(m.material?.name==='Granite - warm grey'){m.dispose();continue;}m.setParent(null);m.bakeCurrentTransformIntoVertices();m.isPickable=false;m.receiveShadows=true;meshes.push(m);}for(const r of e.rootNodes)if(!r.getChildMeshes(false).length)r.dispose();this.colSets.set(lod,meshes);this.cast(meshes);}
   const near=lod==='high',list=this.low?giantColumnPositions():giantColumnPositions().filter(p=>(Math.hypot(p.x-x,p.z-z)<140)===near),buf=new Float32Array(Math.max(1,list.length)*16);list.forEach((p,i)=>Matrix.Translation(this.at.x+p.x,this.at.y+SANCTUARY_LEVELS.floor,this.at.z+p.z).copyToArray(buf,i*16));for(const m of meshes){m.thinInstanceSetBuffer('matrix',buf,16,false);m.thinInstanceCount=list.length;m.thinInstanceRefreshBoundingInfo(false);m.setEnabled(list.length>0);}}
  this.colAt.set(x,0,z);}
 private unload(){this.active=false;this.entrance?.dispose();this.entrance=undefined;this.buddhaWalls?.dispose();this.buddhaWalls=undefined;this.gallery?.dispose();this.gallery=undefined;this.statueGarden?.dispose();this.statueGarden=undefined;this.censer?.dispose();this.censer=undefined;for(const ms of this.colSets.values())for(const m of ms){this.cast([m],true);m.dispose();}this.colSets.clear();this.colAt.set(1e9,0,1e9);for(const off of this.offSmoke)off();this.offSmoke=[];for(const c of this.roofs.values())c.dispose();for(const c of this.statues.values())c.dispose();this.roofs.clear();this.statues.clear();for(const c of this.cells.values()){this.cast(c.batch.meshes,true);c.batch.dispose();c.rects.forEach(removeObstacle);}this.cells.clear();for(const b of this.proxies.values())b.dispose();this.proxies.clear();this.cast(this.global.flatMap(b=>b.meshes),true);for(const b of this.global)b.dispose();this.global=[];this.cast(this.loose,true);for(const m of this.loose){const mat=m.material;m.dispose(false,false);if(mat instanceof StandardMaterial&&mat.name.startsWith('an-lien-sign-'))mat.dispose(false,true);}this.loose=[];this.rects.forEach(removeObstacle);this.rects=[];for(const l of this.lights)l.intensity=0; // kept: removing lights forces a scene-wide shader recompile
for(const c of this.containers.values())c.dispose();this.containers.clear();if(this.mats){for(const m of Object.values(this.mats)){const owned=m.metadata?.ownedTextures??[];m.dispose(false,false);for(const t of owned)t.dispose();}this.mats=undefined;}}
 get review(){return{entrance:this.entrance?.review,wallRelief:{ready:this.buddhaWalls?.ready??false,failed:this.buddhaWalls?.failed??false,count:this.buddhaWalls?.count??0,near:this.buddhaWalls?.nearCount??0},galleryReady:this.gallery?.ready??false,galleryFailed:this.gallery?.failed??false,active:this.active,assets:this.containers.size,assetFailure:this.assetFailure,roofDetails:this.roofs.size,cells:this.cells.size,statues:this.statues.size,leaves:this.treeLeaves,area:600*400,floors:2,courtyard:700*300,gardenReady:this.garden?.ready??false,statueGarden:this.statueGarden?.review,gardenFailed:this.garden?.failed??false};}
}
