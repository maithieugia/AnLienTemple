import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');bpy.ops.wm.open_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/fitted-preview.blend'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.animation_data.action=None;rig.data.pose_position='REST';bpy.context.view_layer.update();dress=bpy.data.objects['defaultMaterial'];body=next(o for o in bpy.data.objects if o.type=='MESH' and o!=dress and len(o.vertex_groups)>0)
# Identify the actual trouser shell as connected components, independent of texture colour.
adj=[set()for _ in dress.data.vertices]
for e in dress.data.edges:
 a,b=e.vertices;adj[a].add(b);adj[b].add(a)
seen=set();pants=set()
for start in range(len(adj)):
 if start in seen:continue
 stack=[start];island=set()
 while stack:
  i=stack.pop()
  if i in seen:continue
  seen.add(i);island.add(i);stack.extend(adj[i]-seen)
 if max((dress.matrix_world@dress.data.vertices[i].co).z for i in island)<1.25:pants.update(island)
coat=dress.data.materials[0].copy();coat.name='collection_coat';trousers=coat.copy();trousers.name='collection_trousers';dress.data.materials.clear();dress.data.materials.append(coat);dress.data.materials.append(trousers)
for p in dress.data.polygons:p.material_index=1 if sum(i in pants for i in p.vertices)>len(p.vertices)/2 else 0
uv=dress.data.uv_layers.new(name='CollectionPattern')
for loop in dress.data.loops:
 p=dress.matrix_world@dress.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=(p.x*1.4+.5,p.z*.9)
dress.data.uv_layers.active_index=0
# Keep the original fitted head and hair untouched.
hairs=[];bun_faces=set();head_cap_faces=0;cut=[]
rig.data.pose_position='POSE';bpy.context.view_layer.update();bpy.ops.object.select_all(action='DESELECT')
for o in [rig,body,dress]+hairs:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=rig
out=r/'public/assets/chars/ready-made/ao-dai-collection';out.mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(out/'Female_AoDai_Collection.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_def_bones=True,export_morph=False)
bpy.ops.wm.save_as_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/collection.blend'))
(out/'inspection.json').write_text(json.dumps({'bones':len(rig.data.bones),'hairMeshes':[o.name for o in hairs],'bunFaces':len(bun_faces),'headCapFaces':head_cap_faces,'cutBoundaryEdges':len(cut),'trouserVertices':len(pants),'source':'fitted-preview.blend / fit-5','sharedBase':True},indent=2))

