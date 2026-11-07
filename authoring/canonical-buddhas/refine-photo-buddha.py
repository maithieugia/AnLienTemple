import bpy,bmesh,math,json,hashlib
from pathlib import Path
from mathutils import Vector
R=Path(__file__).resolve().parents[2];OUT=R/'authoring/unapproved/photo-buddha-sculpted';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.wm.ply_import(filepath=str(R/'authoring/photo-reconstruction/photo-mesh.ply'));body=bpy.context.object
lo=[min(v.co[k] for v in body.data.vertices) for k in range(3)];hi=[max(v.co[k] for v in body.data.vertices) for k in range(3)];h=hi[2]-lo[2]
for v in body.data.vertices:v.co=Vector(((v.co.x-(lo[0]+hi[0])/2)/h,(v.co.y-(lo[1]+hi[1])/2)/h,(v.co.z-lo[2])/h))
body.rotation_euler.z=-math.pi/2;bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
neck=[v.co for v in body.data.vertices if .69<v.co.z<.72];neckX=(min(v.x for v in neck)+max(v.x for v in neck))/2;neckY=(min(v.y for v in neck)+max(v.y for v in neck))/2
bm=bmesh.new();bm.from_mesh(body.data);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,.709),plane_no=(0,0,1),clear_outer=True);bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(body.data);bm.free()
bpy.ops.object.select_all(action='DESELECT');bpy.ops.import_scene.gltf(filepath=str(R/'public/assets/sanctuary/statues/shakyamuni/high.glb'));head=next(o for o in bpy.context.selected_objects if o.type=='MESH');bpy.context.view_layer.objects.active=head;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bm=bmesh.new();bm.from_mesh(head.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.000001);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,plane_co=(0,0,.725),plane_no=(0,0,1),clear_inner=True);bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(head.data);bm.free()
base=[v.co for v in head.data.vertices if v.co.z<.74];sx=(min(v.x for v in base)+max(v.x for v in base))/2;sy=(min(v.y for v in base)+max(v.y for v in base))/2
for v in head.data.vertices:v.co=Vector(((v.co.x-sx)*1.05+neckX,(v.co.y-sy)*1.05+neckY,(v.co.z-.725)*1.05+.702))
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
union=body.modifiers.new('Continuous neck surface','BOOLEAN');union.operation='UNION';union.solver='EXACT';union.object=head;bpy.ops.object.modifier_apply(modifier=union.name);bpy.data.objects.remove(head,do_unlink=True);obj=body;obj.name='photo-body-with-refined-licensed-head'
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=28,location=(neckX,neckY,.713));connector=bpy.context.object;connector.scale=(.087,.086,.042);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
bpy.context.view_layer.objects.active=obj;connector.select_set(False);obj.select_set(True);m=obj.modifiers.new('Anatomical neck','BOOLEAN');m.operation='UNION';m.solver='EXACT';m.object=connector;bpy.ops.object.modifier_apply(modifier=m.name);bpy.data.objects.remove(connector,do_unlink=True)
vg=obj.vertex_groups.new(name='neck-polish')
for v in obj.data.vertices:
 weight=max(0,1-abs(v.co.z-.717)/.048)
 if weight>0:vg.add([v.index],weight,'REPLACE')
m=obj.modifiers.new('Blend neck curvature','SMOOTH');m.factor=.8;m.iterations=12;m.vertex_group=vg.name;bpy.ops.object.modifier_apply(modifier=m.name)
sm=obj.modifiers.new('Polish','SMOOTH');sm.factor=.25;sm.iterations=2;bpy.ops.object.modifier_apply(modifier=sm.name)
mat=bpy.data.materials.new('white-carved-stone');mat.use_nodes=True;bs=mat.node_tree.nodes['Principled BSDF'];bs.inputs['Base Color'].default_value=(.72,.73,.71,1);bs.inputs['Roughness'].default_value=.62;obj.data.materials.clear();obj.data.materials.append(mat)
for p in obj.data.polygons:p.use_smooth=True;p.material_index=0
bpy.ops.wm.save_as_mainfile(filepath=str(R/'authoring/photo-reconstruction/photo-buddha-refined.blend'));original=obj.data.copy();counts={}
for lod,target in [('high',150000),('low',40000),('far',7000)]:
 obj.data=original.copy();tri=sum(len(p.vertices)-2 for p in obj.data.polygons)
 if tri>target:
  m=obj.modifiers.new('LOD','DECIMATE');m.ratio=target/tri;bpy.ops.object.modifier_apply(modifier=m.name)
 obj.data.validate();obj.data.update();counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons);original=obj.data.copy();bpy.ops.export_scene.gltf(filepath=str(OUT/(lod+'.glb')),export_format='GLB',use_selection=True,export_animations=False)
(OUT/'asset.json').write_text(json.dumps({'id':'photo-buddha-sculpted','method':'TripoSR local photo body + licensed detailed head, unified sculpt','notExactReplica':True,'sourceHead':'rbmarbletemplearts / CC BY4.0 / Meshy AI','triangles':counts,'knownLimitations':['fingers remain fused in photo reconstruction','back inferred','head is interpreted, not exact photo face'],'sha256':{lod:hashlib.sha256((OUT/(lod+'.glb')).read_bytes()).hexdigest() for lod in counts}},indent=2),encoding='utf-8');print('REFINED',counts,flush=True)
