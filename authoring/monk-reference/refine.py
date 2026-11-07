import bpy,json,math
from pathlib import Path
R=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');a=json.loads((R/'public/assets/chars/minh-v2.json').read_text())
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for part in ['skin','eyes']:
 d=a[part];P=[d['positions'][i:i+3] for i in range(0,len(d['positions']),3)]
 if part=='skin':
  for p in P:
   x,y,z=p
   if y>1.57:
    jaw=math.exp(-((y-1.63)/.055)**2);p[0]*=1-.035*jaw
    # Subtle lip / brow relaxation and a straighter nose bridge. Preserve eyelid openings.
    if z>.025:p[1]+=.0018*math.exp(-((y-1.723)/.018)**2)*(1-min(1,abs(x)/.08))
 mesh=bpy.data.meshes.new(part);mesh.from_pydata(P,[],[d['indices'][i:i+3] for i in range(0,len(d['indices']),3)]);mesh.update();obj=bpy.data.objects.new(part,mesh);bpy.context.collection.objects.link(obj);bpy.context.view_layer.objects.active=obj;obj.select_set(True)
 uv=mesh.uv_layers.new(name='UVMap')
 for poly in mesh.polygons:
  poly.use_smooth=True
  for li in poly.loop_indices:vi=mesh.loops[li].vertex_index;uv.data[li].uv=d['uvs'][vi*2:vi*2+2]
 for name in a['boneNames']:obj.vertex_groups.new(name=name)
 for i in range(len(P)):
  for j,w in zip(d['joints'][i*4:i*4+4],d['weights'][i*4:i*4+4]):
   if w>0:obj.vertex_groups[j].add([i],w,'REPLACE')
 mod=obj.modifiers.new('Anatomy surface refinement','SUBSURF');mod.levels=1;mod.subdivision_type='CATMULL_CLARK';bpy.ops.object.modifier_apply(modifier=mod.name)
 m=obj.data;out={k:[] for k in ['positions','normals','uvs','joints','weights','indices']}
 m.calc_loop_triangles()
 for tr in m.loop_triangles:
  for li in tr.loops:
   v=m.vertices[m.loops[li].vertex_index];out['positions']+=list(v.co);out['normals']+=list(m.corner_normals[li].vector);out['uvs']+=list(m.uv_layers.active.data[li].uv)
   g=sorted([(g.group,g.weight) for g in v.groups],key=lambda x:-x[1])[:4];total=sum(w for _,w in g) or 1
   out['joints'] += [i for i,w in g]+[0]*(4-len(g));out['weights'] += [w/total for i,w in g]+[0]*(4-len(g));out['indices'].append(len(out['indices']))
 a[part]=out;obj.select_set(False)
(R/'public/assets/chars/monk-reference/avatar.json').write_text(json.dumps(a,separators=(',',':')))
bpy.ops.wm.save_as_mainfile(filepath=str(R/'authoring/monk-reference/refined-anatomy.blend'))
print('MONK_REFINED',len(a['skin']['indices'])//3)
