"""Headless authoring/export worker. Called by run.py, never by game runtime."""
import bpy,sys,json,math,importlib
from pathlib import Path
from mathutils import Vector
sys.path.insert(0,str(Path(__file__).parent))
args=sys.argv[sys.argv.index('--')+1:];spec=json.loads(Path(args[0]).read_text(encoding='utf-8-sig'));out=Path(args[1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
root=importlib.import_module('recipes.'+spec['recipe']).build(spec)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'source.blend'))
# Apply the detailed source once, then join only objects sharing material AND motion parent.
for o in list(bpy.context.scene.objects):
    if o.type not in ('MESH','CURVE','FONT'):continue
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH')
    for m in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=m.name)
groups={}
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':groups.setdefault((o.parent.name if o.parent else '',o.active_material.name if o.active_material else ''),[]).append(o)
for (parent,mat),objects in groups.items():
    if not objects:continue
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();objects[0].name=parent+'__'+mat
for level,data in spec['lods'].items():
    # Ratios are measured relative to the joined high model, not compounded across exports.
    mods=[]
    if data['ratio']<1:
        for o in bpy.context.scene.objects:
            if o.type=='MESH':
                # Disconnected roof course quads must not collapse into holes at low LOD.
                if spec['id']=='vb-sanctuary-grand-roof' and o.active_material and ('Glazed roof tile' in o.active_material.name or 'Roof underside' in o.active_material.name):continue
                m=o.modifiers.new('runtime LOD','DECIMATE');m.ratio=data['ratio'];mods.append((o,m))
    bpy.ops.export_scene.gltf(filepath=str(out/(level+'.glb')),export_format='GLB',export_apply=True,export_yup=True,export_extras=True,export_cameras=False,export_lights=False)
    for o,m in mods:o.modifiers.remove(m)
if '--render' in args:
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True;scene.cycles.device='CPU';scene.render.threads_mode='FIXED';scene.render.threads=3;scene.render.resolution_x=1100;scene.render.resolution_y=800;scene.render.resolution_percentage=100
    scene.world=bpy.data.worlds.new('neutral studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.17,.19,.23,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
    scene.view_settings.view_transform='AgX'
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.005));floor=bpy.context.object;floor.name='PREVIEW ONLY floor';m=bpy.data.materials.new('studio floor');m.diffuse_color=(.08,.10,.12,1);floor.data.materials.append(m)
    def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
    for loc,power,size in [((3,-4,6),950,5),((-3,-1,3),700,4),((1,4,4),1100,3)]:
        bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,.7))
    bpy.ops.object.camera_add(location=spec.get('previewCamera',(2.8,-3.8,2.1)));scene.camera=bpy.context.object;scene.camera.data.type='ORTHO';scene.camera.data.ortho_scale=spec.get('previewScale',2.8);aim(scene.camera,(0,0,spec.get('previewHeight',.83)));scene.render.filepath=str(out/'preview-front.png');bpy.ops.render.render(write_still=True)
    scene.camera.location=spec.get('previewRearCamera',(2.8,3.8,1.9));aim(scene.camera,(0,0,spec.get('previewHeight',.83)));scene.render.filepath=str(out/'preview-rear.png');bpy.ops.render.render(write_still=True)
print('WORKSHOP_EXPORT_OK',out)
