import bpy,json
from pathlib import Path
from mathutils import Vector
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');bpy.ops.wm.open_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/fitted-preview.blend'));rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');o=bpy.data.objects['defaultMaterial'];report={}
for mode in ['REST','POSE']:
 rig.data.pose_position=mode;bpy.context.view_layer.update();e=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh()
 for label in ['L','R']:
  g=o.vertex_groups['Bip01 '+label+' Hand'].index;ids=[v.index for v in o.data.vertices if any(q.group==g and q.weight>.7 for q in v.groups)];p=[o.matrix_world@m.vertices[i].co for i in ids];report[mode+label]={'n':len(ids),'cloth':list(sum(p,Vector())/max(1,len(p))),'hand':list(rig.matrix_world@rig.pose.bones['Bip01 '+label+' Hand'].head),'bind':list(rig.matrix_world@rig.data.bones['Bip01 '+label+' Hand'].head_local)}
 e.to_mesh_clear()
(r/'authoring/vietnamese-wardrobe/cuff-diagnostic.json').write_text(json.dumps(report,indent=2))
