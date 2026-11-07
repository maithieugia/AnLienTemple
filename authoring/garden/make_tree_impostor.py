"""Distant-tree impostor for the garden tree (Poly Haven tree_small_02, CC0):
renders the low LOD from the side with a transparent background, so trees far away can be drawn as two crossed cards
(4 triangles) instead of ~10,000 triangles each.
Out: public/assets/garden/tree-small-02/impostor.png (+ impostor.json with the card size in tree-height units)
Run: blender.exe -b -P authoring/garden/make_tree_impostor.py"""
import bpy, os, json, math
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'public', 'assets', 'garden', 'tree-small-02', 'low.glb')
OUT = os.path.join(ROOT, 'public', 'assets', 'garden', 'tree-small-02')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
x0, x1 = min(p.x for p in pts), max(p.x for p in pts)
y0, y1 = min(p.y for p in pts), max(p.y for p in pts)
z0, z1 = min(p.z for p in pts), max(p.z for p in pts)
height = z1 - z0
half = max(x1 - x0, y1 - y0, height) / 2
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2

scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.film_transparent = True
scene.render.resolution_x = scene.render.resolution_y = 512
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
cam.data.type = 'ORTHO'
cam.data.ortho_scale = half * 2
scene.collection.objects.link(cam)
cam.location = (cx, cy - 50, z0 + half)
cam.rotation_euler = (math.radians(90), 0, 0)
scene.camera = cam
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN'))
sun.data.energy = 3.2
sun.rotation_euler = (math.radians(50), math.radians(-25), math.radians(20))
scene.collection.objects.link(sun)
world = bpy.data.worlds.new('w'); world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (.55, .6, .62, 1)
world.node_tree.nodes['Background'].inputs[1].default_value = .9
scene.world = world
scene.render.filepath = os.path.join(OUT, 'impostor.png')
bpy.ops.render.render(write_still=True)
# card size in units of the tree's height (the game scales trees by their height)
info = {'width': half * 2 / height, 'height': half * 2 / height, 'bottom': (z0 - (z0 + half - half)) / height, 'source': 'low.glb render, authoring/garden/make_tree_impostor.py'}
info['bottom'] = 0.0  # the camera frame starts at the trunk base (z0)
json.dump(info, open(os.path.join(OUT, 'impostor.json'), 'w'), indent=1)
print('IMPOSTOR', info, flush=True)
