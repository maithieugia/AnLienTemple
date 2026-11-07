import bpy,json
from mathutils import Vector
from pathlib import Path
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple')
bpy.ops.wm.read_factory_settings(use_empty=True)
report=[]
for kind,path in [('dress',r/'authoring/vietnamese-wardrobe/source/ghostnoface-ao-dai-2k.glb'),('body',r/'public/assets/chars/ready-made/rocketbox/Female_Adult_17.glb')]:
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));objects=set(bpy.data.objects)-before
 for o in objects:
  if o.type=='MESH':
   p=[o.matrix_world@Vector(v) for v in o.bound_box]
   report.append({'kind':kind,'name':o.name,'vertices':len(o.data.vertices),'min':[min(v[i] for v in p) for i in range(3)],'max':[max(v[i] for v in p) for i in range(3)],'materials':[m.name for m in o.data.materials],'groups':len(o.vertex_groups)})
(r/'authoring/vietnamese-wardrobe/inspection.json').write_text(json.dumps(report,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/inspection.blend'))
