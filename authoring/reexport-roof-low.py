import bpy
from pathlib import Path
root=Path(__file__).resolve().parent.parent
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'public/assets/workshop/vb-sanctuary-grand-roof/high.glb'))
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 names=' '.join(m.name for m in o.data.materials if m)
 if 'Glazed roof tile' in names or 'Roof underside' in names:continue
 mod=o.modifiers.new('runtime LOD','DECIMATE');mod.ratio=.25
bpy.ops.export_scene.gltf(filepath=str(root/'public/assets/workshop/vb-sanctuary-grand-roof/low.glb'),export_format='GLB',export_apply=True,export_yup=True,export_extras=True,export_cameras=False,export_lights=False)
print('ROOF_LOW_SHEETS_PRESERVED')
