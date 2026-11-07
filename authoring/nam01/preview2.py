import bpy, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets-src','nhan-vat-nam-src','base_basic_pbr.glb'))
arm=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'][0]
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE_NEXT';s.render.resolution_x=360;s.render.resolution_y=640
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c'));s.collection.objects.link(cam);cam.location=(3.2,-3.6,1.1);cam.rotation_euler=(math.radians(88),0,math.radians(41));s.camera=cam
for loc,e in (((2,-3,4),800),((-3,-1,2),300)):
    l=bpy.data.objects.new('l',bpy.data.lights.new('l','POINT'));l.data.energy=e;l.location=loc;s.collection.objects.link(l)
w=bpy.data.worlds.new('w');w.color=(.6,.6,.62);s.world=w
arm.data.pose_position='REST';s.render.filepath=os.path.join(ROOT,'authoring','nam01','rest.png');bpy.ops.render.render(write_still=True)
arm.data.pose_position='POSE'
for f in (20,50,80):
    s.frame_set(f);s.render.filepath=os.path.join(ROOT,'authoring','nam01',f'f{f}.png');bpy.ops.render.render(write_still=True)
print('ARMROT',tuple(arm.rotation_euler),tuple(arm.scale),s.render.fps)
