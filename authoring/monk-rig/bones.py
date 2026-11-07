import bpy,sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index('--')+1])
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
print('ARM',arm.name,tuple(round(v,3) for v in arm.matrix_world.to_scale()),len(arm.data.bones))
for b in arm.data.bones:
    h=arm.matrix_world@b.head_local;t=arm.matrix_world@b.tail_local
    if any(k in b.name for k in ['pelvis','spine','neck','Head','clavicle','upperarm','lowerarm','hand_','thigh','calf','foot','ball','root']) and '_twist' not in b.name:
        print(f'{b.name:14s} head {h.x:7.3f} {h.y:7.3f} {h.z:7.3f}  tail {t.x:7.3f} {t.y:7.3f} {t.z:7.3f}  parent {b.parent.name if b.parent else "-"}')
