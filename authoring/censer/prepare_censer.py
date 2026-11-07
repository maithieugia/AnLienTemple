"""
Courtyard incense burner (lư hương) supplied by anh Thanh (Downloads/Tượng Phật/Lư hương.zip -> assets-src/lu-huong-src/base_basic_pbr.glb,
500k triangles, 3 PNG maps). Makes the runtime LODs at real size (1.6 m tall, base at y=0):
  public/assets/sanctuary/censer/high-welded.glb  (~80k tris, 1024 JPEG maps)
  public/assets/sanctuary/censer/low-welded.glb   (~24k tris, 512 JPEG maps)
and a preview render authoring/censer/preview.png.

Run: blender.exe -b -P authoring/censer/prepare_censer.py
"""
import bpy, bmesh, os, math
from mathutils import Vector

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'assets-src', 'lu-huong-src', 'base_basic_pbr.glb')
OUT = os.path.join(ROOT, 'public', 'assets', 'sanctuary', 'censer')
HEIGHT = 1.6
os.makedirs(OUT, exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    obj = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    pts = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    zmin, zmax = min(p.z for p in pts), max(p.z for p in pts)
    cx = (min(p.x for p in pts) + max(p.x for p in pts)) / 2
    cy = (min(p.y for p in pts) + max(p.y for p in pts)) / 2
    s = HEIGHT / (zmax - zmin)
    obj.location = (-cx * s, -cy * s, -zmin * s)
    obj.scale = (s, s, s)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return obj


def export(name, ratio, tex):
    obj = reset()
    # The scan splits vertices along UV charts. Weld positions before collapse so
    # the decimator simplifies a connected surface; UVs stay on face corners.
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.000005)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    d = obj.modifiers.new('decimate', 'DECIMATE')
    d.ratio = ratio
    bpy.ops.object.modifier_apply(modifier=d.name)
    for img in bpy.data.images:
        if img.size[0] > tex:
            img.scale(tex, tex)
    for m in obj.data.materials:
        m.use_backface_culling = False
    tris = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    path = os.path.join(OUT, name + '-welded.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=85,
                              use_selection=False, export_apply=True, export_yup=True)
    print('EXPORT', name, tris, 'tris', os.path.getsize(path) // 1024, 'KB', flush=True)
    return obj


export('low', 0.048, 768)
obj = export('high', 0.16, 1536)

# preview render of the high LOD
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
scene.render.resolution_x, scene.render.resolution_y = 900, 900
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam)
cam.location = (2.6, -3.4, 1.9)
cam.rotation_euler = (math.radians(72), 0, math.radians(37))
scene.camera = cam
for loc, e in (((3, -3, 5), 900), ((-4, 2, 3), 400)):
    l = bpy.data.objects.new('l', bpy.data.lights.new('l', 'POINT'))
    l.data.energy = e
    l.location = loc
    scene.collection.objects.link(l)
w = bpy.data.worlds.new('w'); w.color = (.35, .35, .38); scene.world = w
scene.render.filepath = os.path.join(ROOT, 'authoring', 'censer', 'preview.png')
bpy.ops.render.render(write_still=True)
print('PREVIEW done', flush=True)
