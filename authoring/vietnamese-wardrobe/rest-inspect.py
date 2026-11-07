import bpy,json
from mathutils import Vector
from pathlib import Path
r=Path('C:/Users/Admin/Veilbound/projects/AnLienTemple');bpy.ops.wm.open_mainfile(filepath=str(r/'authoring/vietnamese-wardrobe/inspection.blend'))
rig=next(o for o in bpy.data.objects if o.type=='ARMATURE');rig.animation_data_clear();rig.data.pose_position='REST';bpy.context.view_layer.update()
report={n:list(rig.matrix_world@rig.data.bones[n].head_local) for n in ['Bip01 Pelvis','Bip01 Spine','Bip01 Spine1','Bip01 Spine2','Bip01 Neck','Bip01 Head','Bip01 L UpperArm','Bip01 L Forearm','Bip01 L Hand','Bip01 R UpperArm','Bip01 R Forearm','Bip01 R Hand','Bip01 L Foot','Bip01 L Toe0']}
(r/'authoring/vietnamese-wardrobe/rest-bones.json').write_text(json.dumps(report,indent=2))
for o in bpy.data.objects:
 if o.type=='MESH' and o.name=='Icosphere':o.hide_render=True
camd=bpy.data.cameras.new('Fit camera');cam=bpy.data.objects.new('Fit camera',camd);bpy.context.collection.objects.link(cam);cam.location=(0,-3.5,1.1);cam.rotation_euler=(Vector((0,0,.95))-cam.location).to_track_quat('-Z','Y').to_euler();camd.type='ORTHO';camd.ortho_scale=2.1;bpy.context.scene.camera=cam
sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sc.display.shading.light='STUDIO';sc.display.shading.color_type='MATERIAL';sc.render.resolution_x=800;sc.render.resolution_y=900;sc.render.resolution_percentage=100;sc.render.filepath=str(r/'docs/ao-dai-before-fit.png');bpy.ops.render.render(write_still=True)
