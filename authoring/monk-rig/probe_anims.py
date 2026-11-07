import bpy,sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index('--')+1])
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
print('ARMOBJ',arm.name,'animdata',bool(arm.animation_data),'action',arm.animation_data.action.name if arm.animation_data and arm.animation_data.action else None,'tracks',len(arm.animation_data.nla_tracks) if arm.animation_data else 0)
for a in list(bpy.data.actions)[:3]:
    fc=list(getattr(a,'fcurves',[]))
    slots=[(s.identifier,s.target_id_type) for s in getattr(a,'slots',[])]
    bag=[]
    for L in getattr(a,'layers',[]):
        for st in L.strips:
            for cb in st.channelbags: bag.append((cb.slot.identifier,len(cb.fcurves),cb.fcurves[0].data_path if len(cb.fcurves) else ''))
    print('ACT',a.name,'fcurves',len(fc),'slots',slots,'bags',bag[:2])
