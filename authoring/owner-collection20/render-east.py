import bpy,json,math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent;project=root.parents[1];bpy.ops.wm.read_factory_settings(use_empty=True)
placements=json.loads((root/'placements.json').read_text(encoding='utf-8'))['placements'];gold=bpy.data.materials.new('polished-gold');gold.use_nodes=True;bs=gold.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,.68,.14,1);bs.inputs['Metallic'].default_value=1;bs.inputs['Roughness'].default_value=.28
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=True;scene.render.resolution_x=1280;scene.render.resolution_y=800;scene.render.resolution_percentage=100
world=bpy.data.worlds.new('HDR-sky');world.use_nodes=True;scene.world=world;nodes=world.node_tree.nodes;env=nodes.new('ShaderNodeTexEnvironment');env.image=bpy.data.images.load(str(project/'public/assets/lighting/sky.hdr'));world.node_tree.links.new(env.outputs['Color'],nodes.get('Background').inputs['Color']);nodes.get('Background').inputs['Strength'].default_value=.65
objects=[]
def model(asset,x,z,h,yaw,base=0,gilded=True):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(project/'public/assets/sanctuary'/asset/'high.glb'))
 for o in set(bpy.data.objects)-before:
  if o.type!='MESH':continue
  o.location=(x,-z,base);o.rotation_mode='XYZ';o.rotation_euler=(0,0,yaw);o.scale=(h,h,h)
  if gilded:o.data.materials.clear();o.data.materials.append(gold)
  objects.append(o)
for zz in [265,495]:
 for tier in range(3):
  bpy.ops.mesh.primitive_cube_add(size=1,location=(300,-zz,tier+.5));bpy.context.object.scale=(40-tier*2,40-tier*2,1)
model('four-kings/02',300,265,50,math.atan2(-300,380-265),3,False);model('four-kings/04',300,495,50,math.atan2(-300,380-495),3,False)
for s in placements:
 if s['id']=='new-19' or(s['group']=='owner-court' and s['x']>0):model(s['asset'],s['x'],s['z'],s['height'],s['yaw'],s['base'])
bpy.ops.mesh.primitive_plane_add(size=1,location=(285,-380,-.03));floor=bpy.context.object;floor.scale=(250,320,1);mat=bpy.data.materials.new('courtyard-stone');mat.diffuse_color=(.5,.47,.4,1);floor.data.materials.append(mat)
bpy.ops.object.camera_add(location=(65,-380,75));cam=bpy.context.object;scene.camera=cam;target=Vector((300,-380,43));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=280
bpy.ops.object.light_add(type='SUN',location=(100,-250,180));bpy.context.object.rotation_euler=(.4,-.6,-.6);bpy.context.object.data.energy=2
scene.render.filepath=str(project/'docs/owner20-east-placement-render.png');bpy.ops.render.render(write_still=True)
