import bpy
bpy.ops.wm.open_mainfile(filepath=r'C:/Users/Admin/Veilbound/projects/AnLienTemple/authoring/canonical-buddhas/base-inspect.blend')
o=next(o for o in bpy.data.objects if o.type=='MESH')
for a,b in [(.28,.30),(.35,.40),(.45,.50),(.55,.60),(.60,.65),(.65,.67)]:
 v=[v.co for v in o.data.vertices if a<v.co.z<b and abs(v.co.x)<.12];print(a,[(min(p[k] for p in v),max(p[k] for p in v)) for k in [0,1]])

