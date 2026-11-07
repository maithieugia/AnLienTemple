"""Private, unreduced Hunyuan quality study. No remesh, no sculpt smoothing, no copied heads.
Output is kept in authoring; not part of the game's public assets or release packages.
"""
import bpy,bmesh,math,json,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
R=Path(__file__).resolve().parents[2];D=R/'authoring/hunyuan-study';O=D/'glb';O.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.ply_import(filepath=str(D/'buddha-hunyuan-clean.ply'));obj=bpy.context.object;obj.name='hunyuan-private-reference-study'
lo=[min(v.co[k] for v in obj.data.vertices) for k in range(3)];hi=[max(v.co[k] for v in obj.data.vertices) for k in range(3)];extent=[hi[k]-lo[k] for k in range(3)];up=max(range(3),key=lambda k:extent[k]);print('RAW BOUNDS',lo,hi,'UP',up,flush=True)
if up==1:rot=Matrix.Rotation(math.pi/2,4,'X')
elif up==0:rot=Matrix.Rotation(-math.pi/2,4,'Y')
else:rot=Matrix.Identity(4)
for v in obj.data.vertices:v.co=rot@v.co
lo=[min(v.co[k] for v in obj.data.vertices) for k in range(3)];hi=[max(v.co[k] for v in obj.data.vertices) for k in range(3)];h=hi[2]-lo[2]
for v in obj.data.vertices:v.co=Vector(((v.co.x-(lo[0]+hi[0])/2)/h,(v.co.y-(lo[1]+hi[1])/2)/h,(v.co.z-lo[2])/h))
bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free()
mat=bpy.data.materials.new('matte-white-stone-no-surface-disguise');mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.65,.67,.64,1);bs.inputs['Roughness'].default_value=.62;obj.data.materials.clear();obj.data.materials.append(mat)
for p in obj.data.polygons:p.use_smooth=True
obj.data.validate();obj.data.update();bpy.ops.wm.save_as_mainfile(filepath=str(D/'buddha-hunyuan-source.blend'));original=obj.data.copy();counts={}
for lod,target in [('high',None),('low',150000),('far',15000)]:
 obj.data=original.copy();tris=sum(len(p.vertices)-2 for p in obj.data.polygons)
 if target and tris>target:
  m=obj.modifiers.new('Optional preview LOD','DECIMATE');m.ratio=target/tris;bpy.ops.object.modifier_apply(modifier=m.name)
 obj.data.validate();counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons);bpy.ops.export_scene.gltf(filepath=str(O/(lod+'.glb')),export_format='GLB',use_selection=True,export_animations=False)
(O/'asset.json').write_text(json.dumps({'method':'Hunyuan3D-2mini private local inference, 50 steps, hierarchical512','unreducedHigh':True,'noVoxelRemesh':True,'notArtApproved':True,'notDeployedInGame':True,'backIsInferred':True,'license':'Tencent Hunyuan3D 2 Community License; territory restrictions, not an unrestricted worldwide game asset','triangles':counts,'sha256':{k:hashlib.sha256((O/(k+'.glb')).read_bytes()).hexdigest() for k in counts}},indent=2),encoding='utf-8')
# Four consistent full-mesh views, with no colour texture hiding shape.
obj.data=original
for data in list(bpy.data.meshes):
 if data.users==0 and data!=original:bpy.data.meshes.remove(data)
for k in range(4):
 o=obj if k==0 else obj.copy()
 if k:bpy.context.collection.objects.link(o)
 o.location.x=(k-1.5)*1.1;o.rotation_euler.z=k*math.pi/2
bpy.ops.object.camera_add(location=(0,-4,1.05));c=bpy.context.object;c.rotation_euler=(Vector((0,0,.5))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=4.6;bpy.context.scene.camera=c
for loc,power,size in [((1,-2,3),170,2),((-3,-1,2),70,3),((0,3,3),150,2)]:
 bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.size=size;l.rotation_euler=(Vector((0,0,.5))-l.location).to_track_quat('-Z','Y').to_euler()
s=bpy.context.scene;s.world=bpy.data.worlds.new('Studio');s.world.color=(.2,.23,.22);s.render.engine='CYCLES';s.cycles.samples=20;s.render.resolution_x=1800;s.render.resolution_y=750;s.render.resolution_percentage=100;s.render.filepath=str(D/'four-angles-unreduced.png');bpy.ops.render.render(write_still=True);print('STUDY PREPARED',counts,flush=True)

# A separate actual-geometry close-up for facial carving review.
for o in list(bpy.data.objects):
 if o.type=='MESH' and o!=obj:bpy.data.objects.remove(o,do_unlink=True)
obj.location.x=0;obj.rotation_euler.z=0;c.location=Vector((0,-2,.84));c.rotation_euler=(Vector((0,0,.84))-c.location).to_track_quat('-Z','Y').to_euler();c.data.ortho_scale=.37;s.render.resolution_x=950;s.render.resolution_y=950;s.render.filepath=str(D/'face-unreduced.png');bpy.ops.render.render(write_still=True)
