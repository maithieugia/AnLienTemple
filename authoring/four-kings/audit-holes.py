import bpy,bmesh,json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent;project=root.parents[1];reports=[]
for sid in ['01','02','03','04']:
 for level in ['source','high','low','far']:
  bpy.ops.wm.read_factory_settings(use_empty=True)
  path=root/'incoming'/f'{sid}.glb' if level=='source' else project/'public/assets/sanctuary/four-kings'/sid/f'{level}.glb'
  bpy.ops.import_scene.gltf(filepath=str(path));obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
  bm=bmesh.new();bm.from_mesh(obj.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
  edges={e for e in bm.edges if e.is_boundary};loops=[]
  while edges:
   first=edges.pop();todo=list(first.verts);group={first}
   while todo:
    vertex=todo.pop()
    for edge in vertex.link_edges:
     if edge in edges:edges.remove(edge);group.add(edge);todo.extend(edge.verts)
   verts={v for e in group for v in e.verts};lo=[min(v.co[i] for v in verts) for i in range(3)];hi=[max(v.co[i] for v in verts) for i in range(3)]
   loops.append({'edges':len(group),'diameter':sum((hi[i]-lo[i])**2 for i in range(3))**.5})
  reports.append({'id':sid,'level':level,'fileSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'boundaryLoops':len(loops),'largest':sorted(loops,key=lambda l:l['diameter'],reverse=True)[:8],'nonmanifold':sum(not e.is_manifold for e in bm.edges)})
  bm.free();print(reports[-1],flush=True)
(root/'hole-audit.json').write_text(json.dumps(reports,indent=2),encoding='utf8')
