import bpy, os, math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets-src','nhan-vat-nam-src','base_basic_pbr.glb'))
arm=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
print('ARM rest', arm.data.pose_position, 'actions', [a.name for a in bpy.data.actions], 'frames', [tuple(a.frame_range) for a in bpy.data.actions])
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE_NEXT';s.render.resolution_x=600;s.render.resolution_y=800;s.render.film_transparent=False
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c'));s.collection.objects.link(cam);cam.location=(1.6,-3.2,1.2);cam.rotation_euler=(math.radians(84),0,math.radians(27));s.camera=cam
for loc,e in (((2,-3,4),800),((-3,-1,2),300)):
    l=bpy.data.objects.new('l',bpy.data.lights.new('l','POINT'));l.data.energy=e;l.location=loc;s.collection.objects.link(l)
w=bpy.data.worlds.new('w');w.color=(.6,.6,.62);s.world=w
s.frame_set(1);s.render.filepath=os.path.join(ROOT,'authoring','nam01','preview.png');bpy.ops.render.render(write_still=True)
for b in arm.data.bones[:6]: print('BONE',b.name,tuple(round(v,3) for v in b.head_local),tuple(round(v,3) for v in b.tail_local))
