import bpy,json,math,bmesh
from mathutils import Vector
from mathutils.kdtree import KDTree
from pathlib import Path
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');bpy.ops.wm.open_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/inspection.blend'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.animation_data.action=None;rig.data.pose_position='REST';bpy.context.view_layer.update()
body=next(o for o in bpy.data.objects if o.type=='MESH' and len(o.vertex_groups)>0);dress=bpy.data.objects['defaultMaterial'];bpy.context.view_layer.objects.active=dress;dress.select_set(True)
# Shorten the visible neck while keeping the existing rig and all animation clips.
# Tuck the source head mesh's broad shoulder/neck skirt inside the standing collar.
head_vertices=set();hair_vertices=set()
for polygon in body.data.polygons:
 material=body.data.materials[polygon.material_index].name
 if material=='f006_head':head_vertices.update(polygon.vertices)
 if material=='f006_opacity':hair_vertices.update(polygon.vertices)
inverse_body=body.matrix_world.inverted()
for v in body.data.vertices:
 if v.index not in head_vertices and v.index not in hair_vertices:continue
 p=body.matrix_world@v.co;z=p.z
 if v.index in head_vertices and z<1.50:
  a=max(0,min(1,(1.50-z)/.045))
  if abs(p.x)>.059:p.x=(1 if p.x>0 else -1)*(.059+(abs(p.x)-.059)*(1-a*.92))
  p.y=.060+(p.y-.060)*(1-a*.5)
 t=max(0,min(1,(z-1.40)/.13));t=t*t*(3-2*t)
 # Blender front is -Y: move neck/head toward the front collar, smoothly at the base.
 p.z-=.030*t;p.y-=.035*t;v.co=inverse_body@p
# Bake the source's conversion nodes into garment coordinates while preserving its UVs/materials.
dress.data.transform(dress.matrix_world);dress.parent=None;dress.matrix_world.identity()
# Sew the source front/back pattern pieces at coincident seams, retaining loop UVs.
seams=bmesh.new();seams.from_mesh(dress.data)
bmesh.ops.remove_doubles(seams,verts=list(seams.verts),dist=.004)
seams.to_mesh(dress.data);seams.free();dress.data.update()
original=[v.co.copy() for v in dress.data.vertices]
# Refine the standing collar before binding; smooth only the rear upper rim.
# Its visible edge stays above the neck/shoulder skin instead of intersecting it.
for v in dress.data.vertices:
 p=v.co
 if abs(p.x)<.12 and p.y>.015 and p.z>1.59:
  a=max(0,min(1,(p.z-1.59)/.045))
  p.z=p.z*(1-a)+1.650*a
  p.y+=.008*a
adj=[set() for _ in original]
for e in dress.data.edges:
 a,b=e.vertices;adj[a].add(b);adj[b].add(a)
seen=set();trousers=set()
for start in range(len(original)):
 if start in seen:continue
 stack=[start];island=set()
 while stack:
  i=stack.pop()
  if i in seen:continue
  seen.add(i);island.add(i);stack.extend(adj[i]-seen)
 if max(original[i].z for i in island)<1.3:trousers.update(island)
sleeves={};cuff_report={}
for sign,label in [(1,'L'),(-1,'R')]:
 cuff_points=[p for p in original if p.x*sign>.49]
 cuff=sum(cuff_points,Vector())/len(cuff_points)
 shoulder=Vector((sign*.17,.025,1.52));elbow=Vector((sign*.34,.025,1.34))
 target=[rig.matrix_world@rig.data.bones['Bip01 '+label+' '+name].head_local for name in ['UpperArm','Forearm','Hand']]
 # End the sleeve just over the wrist. Its last ring follows the hand joint exactly.
 target[2]+=(target[2]-target[1]).normalized()*.014
 src=[shoulder,elbow,cuff]
 for i,p in enumerate(original):
  if p.x*sign<.20 or p.z<.95:continue
  best=None
  for seg in [0,1]:
   axis=src[seg+1]-src[seg];t=max(0,min(1,(p-src[seg]).dot(axis)/axis.length_squared));center=src[seg]+axis*t;distance=(p-center).length
   if best is None or distance<best[0]:best=(distance,seg,t,center,axis)
  distance,seg,t,center,axis=best
  if distance>.115:continue
  dest=target[seg].lerp(target[seg+1],t);new_axis=target[seg+1]-target[seg]
  offset=axis.rotation_difference(new_axis)@(p-center)
  axial=new_axis.normalized()*offset.dot(new_axis.normalized());radial=offset-axial
  radius=(.078*(1-t)+.072*t) if seg==0 else (.072*(1-t)+.042*t)
  if radial.length>.0001:radial*=max(1.,radius/radial.length)
  fitted=dest+axial+radial
  sleeves[i]=(label,(seg+t)/2,fitted)
 cuff_report[label]={'sourceCenter':list(cuff),'targetCenter':list(target[2])}
for v in dress.data.vertices:
 p=v.co.copy();side=abs(p.x);arm=max(0,min(1,(side-.19)/.32));p.x*=1.04;p.y=p.y*1.10+.025;p.z=p.z*.89+.015+arm*.10;v.co=p
 if v.index in sleeves:v.co=sleeves[v.index][2]
 # Extra clearance between the two long outer panels and the trouser/foot layer.
 elif p.z<.98:p.y+=(-1 if p.y<.025 else 1)*(.075 if v.index not in trousers else .012)*min(1,(.98-p.z)/.35);v.co=p
 if v.index in trousers and v.co.z<.4:v.co.z-=.10*max(0,min(1,(.4-v.co.z)/.23))
# The underlying mesh is the original body in its bind pose, not separately attached limbs.
world=[body.matrix_world@v.co for v in body.data.vertices];tree=KDTree(len(world))
for i,p in enumerate(world):tree.insert(p,i)
tree.balance();names={g.index:g.name for g in body.vertex_groups};weights=[{names[g.group]:g.weight for g in v.groups if g.weight>1e-5}for v in body.data.vertices]
for name in names.values():dress.vertex_groups.new(name=name)
for v in dress.data.vertices:
 if abs(original[v.index].x)<.12 and original[v.index].y>.015 and original[v.index].z>1.59:
  dress.vertex_groups['Bip01 Spine2'].add([v.index],1.,'REPLACE')
  continue
 if v.index in sleeves:
  label,t,_=sleeves[v.index]
  if t<.4:d={'Bip01 '+label+' UpperArm':1.}
  elif t<.62:
   a=(t-.4)/.22;d={'Bip01 '+label+' UpperArm':1-a,'Bip01 '+label+' Forearm':a}
  elif t<.84:d={'Bip01 '+label+' Forearm':1.}
  else:
   a=min(1,(t-.84)/.10);d={'Bip01 '+label+' Forearm':1-a,'Bip01 '+label+' Hand':a}
  for name,w in d.items():
   if w>0:dress.vertex_groups[name].add([v.index],w,'REPLACE')
  continue
 if v.index not in trousers and v.co.z<1.02:
  # One continuous front/back flap must not be pulled apart by separate feet/calves.
  t=max(0,min(1,(1.02-v.co.z)/.65))*.58
  for name,w in [('Bip01 Pelvis',1-t),('Bip01 L Thigh',t*.5),('Bip01 R Thigh',t*.5)]:
   if w>0:dress.vertex_groups[name].add([v.index],w,'REPLACE')
  continue
 nearest=tree.find_n(v.co,4);d={};total=0
 for _,i,dist in nearest:
  k=1/max(.008,dist)**3
  for name,w in weights[i].items():d[name]=d.get(name,0)+w*k
 top=sorted(d.items(),key=lambda p:-p[1])[:4];total=sum(w for _,w in top)
 for name,w in top:dress.vertex_groups[name].add([v.index],w/total,'REPLACE')
mod=dress.modifiers.new('Native Rocketbox skin','ARMATURE');mod.object=rig;dress.parent=rig;dress.matrix_parent_inverse=rig.matrix_world.inverted()
# Keep the covered real forearm inside its fabric clearance during deep elbow bends.
# The visible hands/fingers and their original skin remain unmodified.
body_inv=body.matrix_world.inverted()
for v in body.data.vertices:
 w=weights[v.index];hand=sum(t for n,t in w.items() if 'Hand' in n or 'Finger' in n)
 forearm=sum(t for n,t in w.items() if 'Forearm' in n)
 if forearm<.45 or hand>.5:continue
 p=world[v.index];label='L' if p.x>0 else 'R'
 a=rig.matrix_world@rig.data.bones['Bip01 '+label+' Forearm'].head_local;b=rig.matrix_world@rig.data.bones['Bip01 '+label+' Hand'].head_local
 axis=b-a;t=max(0,min(1,(p-a).dot(axis)/axis.length_squared));center=a+axis*t
 v.co=body_inv@(center+(p-center)*(.76+.24*min(1,hand/.5)))
# Remove the covered old tank top/jeans, retaining original neck/head/hair/hands/feet.
bm=bmesh.new();bm.from_mesh(body.data);bm.verts.ensure_lookup_table();remove=[]
for f in bm.faces:
 covered=body.data.materials[f.material_index].name=='f006_body'
 for v in f.verts:
  p=world[v.index];w=weights[v.index];hand=sum(t for n,t in w.items() if 'Hand' in n or 'Finger' in n)
  arm_skin=sum(t for n,t in w.items() if 'Forearm' in n)
  if p.z>1.51 or p.z<.12 or hand>.18 or (abs(p.x)>.20 and p.z<1.25 and arm_skin>.45):covered=False;break
 if covered:remove.append(f)
bmesh.ops.delete(bm,geom=remove,context='FACES');bm.to_mesh(body.data);bm.free();body.data.update()
# Opaque two-sided cloth retains the actual silk pattern from the licensed garment.
for m in dress.data.materials:
 m.use_backface_culling=False
 if m.use_nodes:
  bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
  if bs:bs.inputs['Roughness'].default_value=.65
# A thin inner fabric shell stops zero-thickness seam/backface pinholes.
shell=dress.modifiers.new('Inner fabric thickness','SOLIDIFY');shell.thickness=.0015;shell.offset=-1; shell.use_even_offset=True
bpy.context.view_layer.objects.active=dress;dress.modifiers.move(len(dress.modifiers)-1,0);bpy.ops.object.modifier_apply(modifier=shell.name)
# A non-texturing UV channel marks the two outer flaps for live leg clearance.
mask=dress.data.uv_layers.new(name='ClothLayer')
for polygon in dress.data.polygons:
 for loop in polygon.loop_indices:
  v=dress.data.vertices[dress.data.loops[loop].vertex_index];i=v.index%len(original)
  outer=i not in trousers and original[i].z<1.13
  mask.data[loop].uv=(1. if original[i].y<.025 else 2.,0.) if outer else (0.,0.)
dress.data.uv_layers.active_index=0
for o in bpy.data.objects:
 if o.type=='MESH' and o not in [body,dress]:o.hide_render=True;o.hide_set(True)
rig.data.pose_position='POSE';bpy.context.view_layer.update()
bpy.ops.object.select_all(action='DESELECT')
for o in [rig,body,dress]:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=rig
out=r/'public/assets/chars/ready-made/ao-dai-preview/Female_AoDai.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_force_sampling=True,export_frame_range=False,export_def_bones=True,export_morph=False)
bpy.ops.wm.save_as_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/fitted-preview.blend'))
report={'source':'ghostnoface / CC BY4.0','garmentVertices':len(dress.data.vertices),'removedCoveredFaces':len(remove),'bones':len(rig.data.bones),'sleeveVertices':len(sleeves),'cuffs':cuff_report,'actions':[a.name for a in bpy.data.actions]};(r/'authoring/vietnamese-wardrobe/fit-report.json').write_text(json.dumps(report,indent=2))
