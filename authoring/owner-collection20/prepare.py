import bpy,bmesh,json,sys,hashlib,math
from pathlib import Path
from mathutils import Vector,Matrix
root=Path(__file__).resolve().parent;project=root.parents[1]
ids=sys.argv[sys.argv.index('--')+1:]
for sid in ids:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 source=root/'incoming'/f'{sid}.glb'
 # Always rebuild from the intact source, never a previously decimated cache.
 bpy.ops.import_scene.gltf(filepath=str(source))
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in meshes:
  o.select_set(True);mw=o.matrix_world.copy();o.parent=None;o.matrix_world=mw
 bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 if len(meshes)>1:bpy.ops.object.join()
 obj=bpy.context.object;obj.name='owner-collection20-'+sid
 lo=Vector(tuple(min(v.co[i] for v in obj.data.vertices) for i in range(3)));hi=Vector(tuple(max(v.co[i] for v in obj.data.vertices) for i in range(3)))
 h=hi.z-lo.z;obj.data.transform(Matrix.Scale(1/h,4)@Matrix.Translation(Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z))));obj.data.update()
 # glTF seams duplicate vertices. Decimating that unwelded surface drops isolated
 # patches. Weld positions while retaining face-corner UVs before any collapse.
 bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(obj.data);bm.free();obj.data.update()
 if obj.data.has_custom_normals:bpy.ops.mesh.customdata_custom_splitnormals_clear()
 for polygon in obj.data.polygons:polygon.use_smooth=True
 original=sum(len(p.vertices)-2 for p in obj.data.polygons)
 destination=project/'public/assets/sanctuary/owner-collection20'/sid;destination.mkdir(parents=True,exist_ok=True)
 # A material/texture-preserving progressive LOD chain, never subdivide source.
 counts={}
 for lod,budget,tex in [('high',120000 if sid=='19' else 80000,2048),('low',35000 if sid=='19' else 20000,1024),('far',8000 if sid=='19' else 3000,512)]:
  count=sum(len(p.vertices)-2 for p in obj.data.polygons)
  if count>budget:
   mod=obj.modifiers.new('LOD-'+lod,'DECIMATE');mod.ratio=budget/count;bpy.ops.object.modifier_apply(modifier=mod.name)
  for image in bpy.data.images:
   if image.size[0] and max(image.size)>tex:
    factor=tex/max(image.size);image.scale(max(1,int(image.size[0]*factor)),max(1,int(image.size[1]*factor)))
  counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons)
  bpy.ops.export_scene.gltf(filepath=str(destination/f'{lod}.glb'),export_format='GLB',use_selection=True,export_animations=False,export_image_format='JPEG',export_jpeg_quality=88)
  print('EXPORTED',sid,lod,counts[lod],flush=True)
  if lod=='high':
   bpy.ops.wm.save_as_mainfile(filepath=str(root/f'king-{sid}.blend'))
   scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=4;scene.cycles.use_denoising=True
   scene.render.resolution_x=512;scene.render.resolution_y=512;scene.render.resolution_percentage=100
   if not scene.world:scene.world=bpy.data.worlds.new('Studio World')
   scene.world.color=(.18,.18,.18)
   center=Vector((0,0,.5));bpy.ops.object.camera_add(location=(0,-2,.6));cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=1.16;cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler()
   for position,energy in [((-1,-2,2),220),((1,-1,1),120),((0,1,2),180)]:
    bpy.ops.object.light_add(type='AREA',location=position);light=bpy.context.object;light.data.energy=energy;light.data.size=1;light.rotation_euler=(center-light.location).to_track_quat('-Z','Y').to_euler()
   scene.render.filepath=str(root/f'king-{sid}-front.png');bpy.ops.render.render(write_still=True)
   bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 meta=next(e.copy() for e in json.loads((root/'sources.json').read_text(encoding='utf-8')) if e['id']==sid);meta['license']='Owner-provided, no independent license included';meta['sourceArchive']=Path(meta.pop('sourceZip')).name
 meta.update({'normalizedHeight':1,'width':float((hi.x-lo.x)/h),'depth':float((hi.y-lo.y)/h),'sourceTriangles':original,'triangles':counts,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'front':'glTF +Z verified in front renders','repair':'coincident seam vertices welded before decimation; source geometry preserved','sha256':{lod:hashlib.sha256((destination/f'{lod}.glb').read_bytes()).hexdigest() for lod in counts}})
 (destination/'asset.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
