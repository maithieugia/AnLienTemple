import bpy,sys
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[sys.argv.index('--')+1])
dg=bpy.context.evaluated_depsgraph_get()
for o in bpy.data.objects:
    if o.type!='MESH':print('NODE',o.name,o.type,tuple(round(v,3) for v in o.matrix_world.translation),tuple(round(v,3) for v in o.matrix_world.to_scale()));continue
    vs=[o.matrix_world@v.co for v in o.data.vertices];lo=[min(v[i] for v in vs) for i in range(3)];hi=[max(v[i] for v in vs) for i in range(3)]
    print('MESH',o.name,len(o.data.vertices),len(o.data.polygons),[m.name for m in o.data.materials],'x',round(lo[0],3),round(hi[0],3),'y',round(lo[1],3),round(hi[1],3),'z',round(lo[2],3),round(hi[2],3))
