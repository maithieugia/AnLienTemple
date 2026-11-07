from pathlib import Path
import re,json
p=Path('src/game/world/OwnerCollectionPlan.ts');s=p.read_text();m=re.search(r'export const OWNER_COLLECTION:OwnerPlacement\[\]=(\[.*?\]);',s,re.S);items=json.loads(m[1])
for v in items:
 r=10/v['height'];v['height']=10;v['width']*=r;v['depth']*=r
 if v['group']=='owner-court':v['x']=358 if v['x']>0 else -358;v['z']=248+({285:1,365:5,450:9}[v['z']]+.5)*264/13;v['base']=.92
s=s[:m.start(1)]+json.dumps(items,ensure_ascii=False,indent=2)+s[m.end(1):];g=s.index('{',s.index('export const NEW_GATE_MAITREYA'));end=s.index('}',g)+1;gate=json.loads(s[g:end]);r=10/gate['height'];gate.update(height=10,width=gate['width']*r,depth=gate['depth']*r);s=s[:g]+json.dumps(gate,ensure_ascii=False,indent=2)+s[end:];p.write_text(s)
Path('authoring/owner-collection20/placements.json').write_text(json.dumps({'placements':items,'gate':gate},ensure_ascii=False,indent=2)+'\n')
p=Path('src/game/world/StatueGardenPlan.ts');s=p.read_text().replace('eave:9.6,ridge:13','eave:14.5,ridge:18');m=re.search(r'export const FRONT_TRIAD:GardenStatue\[\]=(\[.*?\]);',s,re.S);a=json.loads(m[1]);
for v in a:v['height']=50;v['width']/=2;v['depth']/=2
a[0]['x']=-150-(a[0]['width']+a[1]['width'])/2-3;a[2]['x']=-150+(a[2]['width']+a[1]['width'])/2+3;s=s[:m.start(1)]+json.dumps(a,ensure_ascii=False,indent=2)+s[m.end(1):];p.write_text(s)
p=Path('src/game/world/StatueGarden.ts');s=p.read_text().replace("if(s.group==='front-triad'||s.asset?.startsWith('owner-collection20/'))mm.material=this.triadGold;", "if(s.group==='front-triad'){mm.material=this.triadGold;mm.receiveShadows=false;}\n   // All owner-collection materials and textures stay as imported.")
s=s.replace("if(level!=='far')this.cast(meshes);", "if(level!=='far'&&s.group!=='front-triad')this.cast(meshes);")
s=s.replace("for(const s of GARDEN_STATUES.filter(s=>s.group===(side<0?'west':'east')))","for(const s of ACTIVE_GARDEN_STATUES.filter(s=>s.group===(side<0?'west':'east')))")
s=s.replace('   // Rear wall with a red lacquer dado and gold band.',"""   const walk:Rect={cx:this.at.x+xl,cz:this.at.z+(G.z0+G.z1)/2,hx:Math.abs(xb-xf)/2+2,hz:(G.z1-G.z0)/2+2,yaw:0,base:this.at.y,h:G.floor,surface:true,climb:true,sight:false};this.rects.push(walk);addObstacle(walk);
   for(const s of OWNER_COLLECTION.filter(s=>s.group==='owner-court'&&Math.sign(s.x)===side)){const hx=s.depth/2+.8,hz=s.width/2+.8;b.box(m.stone,s.x,G.floor+.4,s.z,hx*2,.8,hz*2);b.box(m.ivory,s.x,s.base-.04,s.z,hx*2+.15,.08,hz*2+.15);this.solid(s.x,s.z,hx,hz,0,s.base);}
   // Rear wall with a red lacquer dado and gold band.""");p.write_text(s)
p=Path('src/owner-collection.ts');s=p.read_text().replace('for(const m of root.getChildMeshes())m.material=gold;','// Use the owner-provided material/texture.\n');p.write_text(s)
p=Path('src/game/world/StatueGold.ts');s=p.read_text().replace('m.metallic=1;m.roughness=.28;m.environmentIntensity=1.5;m.emissiveColor=new Color3(.065,.028,.001)','m.metallic=.82;m.roughness=.34;m.environmentIntensity=1.65;m.directIntensity=1.15;m.emissiveColor=new Color3(.18,.105,.018)');p.write_text(s)
p=Path('src/game/world/StupaPlan.ts');s=p.read_text().replace('roofRadius:56','roofRadius:59').replace('towerRadius(level)+4.5+1.5*','towerRadius(level)+7.5+1.5*');p.write_text(s)
p=Path('src/game/world/Stupa.ts');s=p.read_text().replace("m.dark.diffuseColor=Color3.FromHexString('#e6e6dc');", "m.dark.diffuseColor=Color3.FromHexString('#9c2923');m.roof.diffuseColor=Color3.FromHexString('#ef852b');m.ivory.diffuseColor=Color3.FromHexString('#efd068');m.roof.emissiveColor=new Color3(.12,.045,.008);\n for(const mat of [m.roof,m.ivory,m.dark]){mat.alpha=1;mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.diffuseTexture=null;mat.bumpTexture=null;}")
s=s.replace("for(const mat of [m.floor,m.stone,m.ivory,m.dark])mat.emissiveColor=new Color3(.16,.17,.18)", "for(const mat of [m.floor,m.stone])mat.emissiveColor=new Color3(.16,.17,.18);m.ivory.emissiveColor=new Color3(.22,.17,.07);m.dark.emissiveColor=new Color3(.12,.025,.018)");p.write_text(s)
print('Statue and architecture revisions saved.')
