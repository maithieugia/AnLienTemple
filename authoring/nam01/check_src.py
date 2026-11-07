import bpy, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'public','assets','chars','ready-made','rocketbox','Male_Adult_08.glb'))
src=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
print('SRCOBJ',src.name,src.parent.name if src.parent else None,[round(v,2) for v in src.matrix_world.to_euler()])
s=bpy.context.scene
for name in ['Bip01 Pelvis','Bip01 Spine','Bip01 L Thigh','Bip01 Head']:
    b=src.data.bones[name];print('REST',name,[round(v,2) for v in (src.matrix_world.to_3x3()@b.matrix_local.to_3x3()).col[1]])
a=bpy.data.actions['Walk'];src.animation_data.action=a
print('slot',getattr(src.animation_data,'action_slot',None), [sl.name_display for sl in a.slots] if hasattr(a,'slots') else None)
if hasattr(a,'slots'): src.animation_data.action_slot=a.slots[0]
s.frame_set(5)
for name in ['Bip01 Pelvis','Bip01 Spine','Bip01 L Thigh','Bip01 Head']:
    pb=src.pose.bones[name];m=src.matrix_world@pb.matrix
    print('POSE',name,'Y',[round(v,2) for v in m.to_3x3().col[1]],'head',[round(v,2) for v in m.translation])
print('ACTS',[(x.name,[sl.name_display for sl in x.slots]) for x in bpy.data.actions][:12])
