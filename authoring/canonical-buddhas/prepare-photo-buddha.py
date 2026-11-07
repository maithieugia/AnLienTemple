import bpy,bmesh,math,json,hashlib,sys
from math import pi
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2];SRC=ROOT/'authoring/photo-reconstruction/photo-mesh.ply';OUT=ROOT/'public/assets/sanctuary/photo-buddha';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.ply_import(filepath=str(SRC));obj=next(o for o in bpy.data.objects if o.type=='MESH');bpy.context.view_layer.objects.active=obj;obj.select_set(True)
bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
# TripoSR spherical cameras use Z up. Normalize that axis, retaining predicted shape.
lo=[min(v.co[k] for v in obj.data.vertices) for k in range(3)];hi=[max(v.co[k] for v in obj.data.vertices) for k in range(3)];h=hi[2]-lo[2]
for v in obj.data.vertices:v.co=Vector(((v.co.x-(lo[0]+hi[0])/2)/h,(v.co.y-(lo[1]+hi[1])/2)/h,(v.co.z-lo[2])/h))
obj.rotation_euler.z=-pi/2;bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
for p in obj.data.polygons:p.use_smooth=True
obj.data.validate();obj.data.update();mat=bpy.data.materials.new('photo-reconstructed-white-stone');mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.68,.70,.68,1);bs.inputs['Roughness'].default_value=.58;obj.data.materials.clear();obj.data.materials.append(mat);obj.name='photo-reconstructed-buddha';obj['reconstruction']='TripoSR MIT local inference, owner supplied photograph';obj['exactReplica']=False
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'authoring/photo-reconstruction/photo-buddha.blend'));original=obj.data.copy();counts={}
for lod,target in [('high',150000),('low',40000),('far',7000)]:
 obj.data=original.copy();tris=sum(len(p.vertices)-2 for p in obj.data.polygons)
 if tris>target:
  m=obj.modifiers.new('Game LOD','DECIMATE');m.ratio=target/tris;bpy.ops.object.modifier_apply(modifier=m.name)
 obj.data.validate();obj.data.update();counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons);bpy.ops.export_scene.gltf(filepath=str(OUT/(lod+'.glb')),export_format='GLB',use_selection=True,export_animations=False,export_extras=True)
 if lod=='high':high=obj.data.copy()
(OUT/'asset.json').write_text(json.dumps({'id':'photo-buddha','method':'TripoSR image-to-3D local, MIT','triangles':counts,'reference':'User supplied tuong-phat-thich-ca-5.jpg','exactReplica':False,'backIsInferred':True,'sourcePhotoRedistributed':False,'recipe':'authoring/canonical-buddhas/prepare-photo-buddha.py','sha256':{lod:hashlib.sha256((OUT/(lod+'.glb')).read_bytes()).hexdigest() for lod in counts}},indent=2),encoding='utf-8')
if '--no-render' in sys.argv:print('PREPARED',counts,flush=True);sys.exit(0)
# Four actual-mesh angles to inspect orientation and anatomy.
obj.data=high
for k in range(4):
 o=obj if k==0 else obj.copy()
 if k:bpy.context.collection.objects.link(o)
 o.location.x=(k-1.5)*1.1;o.rotation_euler.z=k*pi/2
bpy.ops.object.camera_add(location=(0,-4,1.3));c=bpy.context.object;c.rotation_euler=(Vector((0,0,.5))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=4.6;bpy.context.scene.camera=c
for loc,power,size in [((1,-2,3),140,3),((-3,-2,2),100,3),((0,3,3),150,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.size=size;l.rotation_euler=(Vector((0,0,.5))-l.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.world=bpy.data.worlds.new('Studio');s.world.color=(.25,.28,.25);s.render.engine='CYCLES';s.cycles.samples=20;s.render.resolution_x=1600;s.render.resolution_y=700;s.render.resolution_percentage=100;s.render.filepath=str(ROOT/'docs/photo-buddha-four-angles.png');bpy.ops.render.render(write_still=True);print('PREPARED PHOTO MESH',counts,flush=True)

