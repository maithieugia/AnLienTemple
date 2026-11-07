import bpy,json,bmesh
from pathlib import Path
from mathutils import Vector
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');bpy.ops.wm.open_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/inspection.blend'));o=bpy.data.objects['defaultMaterial'];bm=bmesh.new();bm.from_mesh(o.data);seen=set();loops=[]
for edge in bm.edges:
 if not edge.is_boundary or edge in seen:continue
 stack=[edge];vs=set()
 while stack:
  e=stack.pop()
  if e in seen:continue
  seen.add(e);vs.update(e.verts)
  stack.extend(q for v in e.verts for q in v.link_edges if q.is_boundary and q not in seen)
 p=[o.matrix_world@v.co for v in vs];loops.append({'count':len(p),'center':list(sum(p,Vector())/len(p)),'min':[min(v[i] for v in p)for i in range(3)],'max':[max(v[i] for v in p)for i in range(3)],'vertices':[v.index for v in vs]})
(r/'authoring/vietnamese-wardrobe/boundaries.json').write_text(json.dumps(loops,indent=2))
