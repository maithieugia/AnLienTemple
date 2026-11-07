import bpy,math
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=r'C:/Users/Admin/Veilbound/projects/AnLienTemple/authoring/canonical-buddhas/base-inspect.blend')
o=next(o for o in bpy.data.objects if o.type=='MESH')
m=bpy.data.materials.new('clay');m.diffuse_color=(.5,.3,.08,1);o.data.materials.clear();o.data.materials.append(m)
bpy.ops.object.camera_add(location=(0,-2,.5));c=bpy.context.object;c.rotation_euler=(Vector((0,0,.5))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=1.1;bpy.context.scene.camera=c
bpy.ops.object.light_add(type='AREA',location=(1,-2,3));bpy.context.object.data.energy=150;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=3
s=bpy.context.scene;s.world=bpy.data.worlds.new('world');s.world.color=(.3,.3,.3);s.render.engine='CYCLES';s.cycles.samples=12;s.render.resolution_x=700;s.render.resolution_y=800;s.render.resolution_percentage=100;s.render.filepath=r'C:/Users/Admin/Veilbound/temple-base-inspection.png';bpy.ops.render.render(write_still=True)

