import bpy
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r'C:/Users/Admin/Veilbound/projects/AnLienTemple/public/assets/sanctuary/statues/shakyamuni/high.glb')
for o in bpy.data.objects:
 if o.type=='MESH':
  bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
  print(o.name,len(o.data.vertices),[tuple(round(v,4) for v in p) for p in [Vector([min(v.co[i] for v in o.data.vertices) for i in range(3)]),Vector([max(v.co[i] for v in o.data.vertices) for i in range(3)])]])
  bpy.ops.wm.save_as_mainfile(filepath=r'C:/Users/Admin/Veilbound/projects/AnLienTemple/authoring/canonical-buddhas/base-inspect.blend')
