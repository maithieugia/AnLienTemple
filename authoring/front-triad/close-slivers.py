import bpy,bmesh,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent;project=root.parents[1]
for sid in ['03']:
 folder=project/'public/assets/sanctuary/front-triad'/sid
 meta=json.loads((folder/'asset.json').read_text(encoding='utf8'))
 for lod in ['high','low','far']:
  f=folder/(lod+'.glb');bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=str(f));o=next(o for o in bpy.context.scene.objects if o.type=='MESH');bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7);edges=[e for e in bm.edges if e.is_boundary]
  if edges:
   
   pending=set(edges)
   while pending:
    first=pending.pop();group={first};todo=list(first.verts)
    while todo:
     v=todo.pop()
     for edge in v.link_edges:
      if edge in pending:pending.remove(edge);group.add(edge);todo.extend(edge.verts)
    verts=list({v for edge in group for v in edge.verts})
    if len(group)==3:
     from mathutils import Vector
     center=sum((v.co for v in verts),Vector())/len(verts);bmesh.ops.pointmerge(bm,verts=verts,merge_co=center)
   bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);o.data.update();bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.gltf(filepath=str(f),export_format='GLB',use_selection=True,export_animations=False,export_image_format='JPEG',export_jpeg_quality=88);print('PATCHED triangular export gaps',sid,lod,len(edges),flush=True)
  bm.free();meta['sha256'][lod]=hashlib.sha256(f.read_bytes()).hexdigest();meta['triangles'][lod]=sum(len(p.vertices)-2 for p in o.data.polygons)
 (folder/'asset.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf8')
