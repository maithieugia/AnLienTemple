import bpy
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'public/assets/garden/tree-small-02'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(p/'low.glb'))
for o in bpy.context.scene.objects:
    if o.type=='MESH':m=o.modifiers.new('far-distance','DECIMATE');m.ratio=.2
for im in bpy.data.images:
    if im.size[0]>512:im.scale(512,512)
bpy.ops.export_scene.gltf(filepath=str(p/'far.glb'),export_format='GLB',export_apply=True,export_yup=True,export_cameras=False,export_lights=False)
