import bpy, os, math
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ROOT,'assets-src','tuong-phat-src','base_basic_pbr.glb'))
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE_NEXT';s.render.resolution_x=600;s.render.resolution_y=800
w=bpy.data.worlds.new('w');w.color=(.35,.3,.25);s.world=w
for loc,e in (((2,-4,4),900),((-3,-2,2),400),((0,3,3),300)):
    l=bpy.data.objects.new('l',bpy.data.lights.new('l','POINT'));l.data.energy=e;l.location=loc;s.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c'));s.collection.objects.link(cam);s.camera=cam
for name,ang in (('front',0),('q',40),('back',180)):
    a=math.radians(ang);cam.location=(4.2*math.sin(a),-4.2*math.cos(a),1.0);cam.rotation_euler=(math.radians(88),0,a)
    s.render.filepath=os.path.join(ROOT,'authoring','main-buddha',f'src-{name}.png');bpy.ops.render.render(write_still=True)
