import bpy, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'public','assets','chars','ready-made','nam-01','model.glb'))
arm=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
s=bpy.context.scene
for name in ['Bip01 Spine','Bip01 L Thigh','Bip01 Head']:
    b=arm.data.bones[name];print('REST',name,[round(v,2) for v in (arm.matrix_world.to_3x3()@b.matrix_local.to_3x3()).col[1]])
for a in bpy.data.actions:
    arm.animation_data.action=a
    if hasattr(a,'slots') and len(a.slots): arm.animation_data.action_slot=a.slots[0]
    s.frame_set(5)
    for name in ['Bip01 Spine','Bip01 L Thigh','Bip01 Head']:
        pb=arm.pose.bones[name];m=arm.matrix_world@pb.matrix
        print('CLIP',a.name,name,'Y',[round(v,2) for v in m.to_3x3().col[1]],'head',[round(v,2) for v in m.translation])
