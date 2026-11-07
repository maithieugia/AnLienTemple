"""One reference-guided sculpture, front photograph supplied by owner. Back is artistic reconstruction.
Uses licensed source head and lotus/legs, original sculpted torso, robe, arms and fused hands.
Blender background: --python authoring/canonical-buddhas/sculpt-reference.py
"""
import bpy,bmesh,math,importlib.util,json,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
from math import sin,cos,pi
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OUT=ROOT/'public/assets/sanctuary/reference-buddha';OUT.mkdir(parents=True,exist_ok=True)
spec=importlib.util.spec_from_file_location('sculpt',HERE/'sculpt-hundred.py');sc=importlib.util.module_from_spec(spec);spec.loader.exec_module(sc)
bpy.ops.wm.read_factory_settings(use_empty=True);sc.PARTS=[];sc.GOLD=bpy.data.materials.new('Reference-white-stone');sc.GOLD.use_nodes=True;bs=sc.GOLD.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(.72,.735,.73,1);bs.inputs['Roughness'].default_value=.57
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/sanctuary/statues/shakyamuni/high.glb'))
src=next(o for o in bpy.data.objects if o.type=='MESH');bpy.context.view_layer.objects.active=src;src.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bm=bmesh.new();bm.from_mesh(src.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<.135 or .282<v.co.z<.72 or (.72<=v.co.z<.78 and abs(v.co.x)>.126)],context='VERTS');bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0);bm.to_mesh(src.data);bm.free();src.data.materials.clear();src.data.materials.append(sc.GOLD);sc.PARTS.append(src)
# Anatomical shoulder/chest loft, drapery is carved into the continuous surface.
profile=[(.263,.207,.13),(.30,.198,.135),(.37,.175,.133),(.43,.158,.128),(.49,.158,.12),(.55,.179,.115),(.605,.195,.105),(.645,.192,.098),(.676,.15,.087),(.706,.09,.08),(.738,.078,.079)]
vs=[];fs=[];N=192;J=120
for j in range(J+1):
 t=j/J*(len(profile)-1);k=min(len(profile)-2,int(t));f=t-k;z,rx,ry=[profile[k][a]*(1-f)+profile[k+1][a]*f for a in range(3)]
 for n in range(N):
  a=n*2*pi/N;x=rx*cos(a);y=.15+ry*sin(a);front=max(0,-sin(a))**4;edge=.515+1.06*x;mask=max(0,min(1,(edge-z)/.025+.5));fold=.0048*sin(92*z+13*cos(a))*mask*front
  y-=fold;vs.append((x,y,z))
for j in range(J):
 for n in range(N):a=j*N+n;b=j*N+(n+1)%N;fs.append((a,b,b+N,a+N))
fs.extend([tuple(reversed(range(N))),tuple(J*N+n for n in range(N))]);sc.mesh('continuous-chest-and-carved-robe',vs,fs)
# A rounded diagonal hem lies flush to the carved garment.
sc.curve('diagonal-sanghati-hem',[(-.188,.062,.31),(-.13,.015,.38),(-.025,.021,.49),(.095,.054,.62),(.162,.115,.69)],.007,12,72)
# Right anatomical arm: bare shoulder, rounded elbow, raised hand near sternum.
sc.ell('right-deltoid',(-.178,.148,.615),(.068,.075,.077),40,28)
sc.tube('right-upper-arm',[(-.184,.145,.60),(-.21,.12,.55),(-.225,.085,.49),(-.229,.058,.433)],[.057,.052,.047,.042],40)
sc.ell('right-elbow',(-.229,.058,.433),(.044,.046,.044),32,24)
sc.tube('right-forearm',[(-.229,.058,.433),(-.192,.026,.435),(-.145,.005,.449),(-.096,-.006,.465),(-.073,-.008,.476)],[.04,.038,.031,.023,.017],40)
# Left shoulder and sleeve, soft flared cuff at lap.
sc.ell('left-covered-shoulder',(.179,.148,.613),(.071,.073,.078),40,28)
sc.tube('left-draped-sleeve',[(.185,.145,.607),(.214,.13,.54),(.231,.11,.463),(.228,.078,.395),(.20,.022,.351),(.145,-.017,.346)],[.066,.062,.058,.056,.043,.026],40)
for j in range(4):
 sc.curve('sleeve-pleat',[(.19,.079,.56-j*.039),(.232,.05,.54-j*.039),(.257,.075,.515-j*.035)],.003,10,32)
# Original five-finger hand sculpt; all unions happen before the final sculpt pass.
sc.hand('raised-right-palm',(-.073,-.008,.476),True,0,-1)
start=len(sc.PARTS);sc.hand('left-open-palm',(0,0,0),False,0,1)
R=Matrix.Rotation(-pi/2,4,'Z');W=Vector((.145,-.017,.346))
for o in sc.PARTS[start:]:
 bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 for v in o.data.vertices:v.co=R@v.co+W
 o.select_set(False)
# The entire figure becomes a continuous sculpture; no floating head, cuffs or palm joints.
bpy.ops.object.select_all(action='DESELECT')
for o in sc.PARTS:o.select_set(True)
bpy.context.view_layer.objects.active=src;bpy.ops.object.convert(target='MESH');bpy.ops.object.join();obj=bpy.context.object;obj.name='reference-buddha-front-guided-original-sculpt'
bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
for v in obj.data.vertices:v.co.z-=.135
mod=obj.modifiers.new('Unified sculpt volume','REMESH');mod.mode='VOXEL';mod.voxel_size=.00135;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name)
sm=obj.modifiers.new('Stone sculpt polish','SMOOTH');sm.factor=.72;sm.iterations=4;bpy.ops.object.modifier_apply(modifier=sm.name)
for p in obj.data.polygons:p.use_smooth=True
obj.data.validate();obj.data.update();obj['artisticReconstruction']=True;obj['frontReference']='Owner supplied tuong-phat-thich-ca-5.jpg';obj['baseAttribution']='rbmarbletemplearts CC BY4.0; modified head, seated legs and lotus source'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'reference-buddha-source.blend'))
original=obj.data.copy();high_mesh=None;counts={}
for lod,target in [('high',150000),('low',40000),('far',7000)]:
 obj.data=original.copy();tris=sum(len(p.vertices)-2 for p in obj.data.polygons)
 if tris>target:
  m=obj.modifiers.new('Sculpture surface LOD','DECIMATE');m.ratio=target/tris;bpy.ops.object.modifier_apply(modifier=m.name)
 obj.data.validate();obj.data.update();
 if lod=='high':high_mesh=obj.data.copy()
 counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons);original=obj.data.copy();bpy.ops.export_scene.gltf(filepath=str(OUT/(lod+'.glb')),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
(OUT/'asset.json').write_text(json.dumps({'id':'reference-buddha','triangles':counts,'reference':'tuong-phat-thich-ca-5.jpg supplied by owner','notExactReconstruction':True,'originalBack':True,'sourceBase':'rbmarbletemplearts / CC BY4.0 / Meshy AI','recipe':'authoring/canonical-buddhas/sculpt-reference.py','sha256':{lod:hashlib.sha256((OUT/(lod+'.glb')).read_bytes()).hexdigest() for lod in counts}},indent=2),encoding='utf-8')
# Offline proof from the actual mesh, in stone matching the reference material.
obj.data=high_mesh
bpy.ops.object.camera_add(location=(.2,-2.8,.95));c=bpy.context.object;c.rotation_euler=(Vector((0,.08,.50))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=1.14;bpy.context.scene.camera=c
for loc,power,size in [((1,-2,3),130,3),((-2,-1,2),60,3),((0,2,3),180,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,.08,.5))-l.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.world=bpy.data.worlds.new('Studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.23,.26,.24,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5;s.render.engine='CYCLES';s.cycles.samples=24;s.render.resolution_x=850;s.render.resolution_y=1000;s.render.resolution_percentage=100;s.render.filepath=str(ROOT/'docs/v6-reference-stone-sculpture.png');bpy.ops.render.render(write_still=True);print('REFERENCE SCULPT DONE',counts,flush=True)
