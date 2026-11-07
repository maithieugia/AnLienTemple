import bpy,sys
from collections import Counter
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index('--')+1])
body=[o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith('man')][0]
names={g.index:g.name for g in body.vertex_groups}
for lo,hi,label in [(.6,.8,'hand'),(.42,.55,'forearm'),(.2,.35,'upperarm')]:
    c=Counter()
    for v in body.data.vertices:
        p=body.matrix_world@v.co
        if lo<p.x<hi and p.z>1.1:
            if v.groups: g=max(v.groups,key=lambda g:g.weight);c[names[g.group]]+=1
    print(label,c.most_common(5))
