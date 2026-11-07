"""Prepare the owner-chosen 30-statue Sketchfab library for An Lien (Blender 4.5, background).

  blender -b -P prepare.py -- inspect <id> [<id>...]   -> 4-angle render per statue (front check)
  blender -b -P prepare.py -- export  <id> [<id>...]   -> public/assets/sanctuary/library/<id>/{high,low,far}.glb

Each statue: all meshes joined, upright, centred on its footprint, base at 0, height normalised to 1 m,
front turned to glTF +Z (Blender -Y) using FRONT_YAW below. Source GLBs stay in Veilbound/assets-src.
"""
import bpy, json, sys, math, hashlib, os
from pathlib import Path
from mathutils import Vector, Matrix

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
# LIB=guardians processes the Sanjusangendo 28 guardians (CC BY-NC-ND, private builds only) instead of the main library.
GUARD = os.environ.get('LIB') == 'guardians'
# LIB=bodhi: the single CC BY 'Meditating Buddha' (restore50) placed under the Bodhi tree.
BODHI = os.environ.get('LIB') == 'bodhi'
# LIB=diana: Diana123456 'Buddha' collection (CC BY) for the upper-floor shrine.
DIANA = os.environ.get('LIB') == 'diana'
SRC = ROOT.parents[1] / ('assets-src/sanjusangendo-28' if GUARD else 'assets-src/meditating-buddha' if BODHI else 'assets-src/diana-buddha' if DIANA else 'assets-src/buddha-library')
OUT = ROOT / ('public/assets/sanctuary/guardians' if GUARD else 'public/assets/sanctuary/diana' if DIANA else 'public/assets/sanctuary/library')
INSPECT = HERE / ('inspect-guardians' if GUARD else 'inspect-bodhi' if BODHI else 'inspect-diana' if DIANA else 'inspect')
META = 'danh_sach_28_bo_chung.json' if GUARD else 'meta.json' if BODHI else 'danh_sach.json' if DIANA else 'danh_sach_30_mau.json'
# Degrees about the vertical axis that bring each statue's face to the front, decided from the inspect renders.
_fy = HERE / ('front-yaw-guardians.json' if GUARD else 'front-yaw-bodhi.json' if BODHI else 'front-yaw-diana.json' if DIANA else 'front-yaw.json')
FRONT_YAW = json.loads(_fy.read_text()) if _fy.exists() else {}
# Extra tilt (degrees about X) for scans whose up axis is wrong.
TILT = json.loads((HERE / 'tilt.json').read_text()) if (HERE / 'tilt.json').exists() and not GUARD else {}
WELD = {k: 2e-4 for k in ('045', '001', '003', '004', '011', '013', '019', '027')}
LODS = [('high', 60000, 2048), ('low', 15000, 1024), ('far', 3000, 256)]


def source(sid):
    if BODHI:
        return SRC / 'source/Meditating Buddha.glb'
    if DIANA:
        return SRC / f'diana_{sid}.glb'
    return SRC / f'hophap_{sid}.glb' if GUARD else next(SRC.glob(f'buddha_{sid}_*.glb'))


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def load(sid):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(source(sid)))
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    # Bake parents/armatures/instancing into plain world-space geometry.
    for o in meshes:
        o.data = o.data.copy()
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    for m in list(o.modifiers for o in meshes):
        for mod in list(m):
            m.remove(mod)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    for o in list(bpy.data.objects):
        if o is not obj:
            bpy.data.objects.remove(o, do_unlink=True)
    obj.name = 'statue-' + sid
    t = TILT.get(sid)
    if t:
        obj.data.transform(Matrix.Rotation(math.radians(t[0]), 4, 'X') @ Matrix.Rotation(math.radians(t[1] if len(t) > 1 else 0), 4, 'Y'))
    yaw = FRONT_YAW.get(sid, 0)
    obj.data.transform(Matrix.Rotation(math.radians(yaw), 4, 'Z'))
    vs = [v.co for v in obj.data.vertices]
    lo = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    h = hi.z - lo.z
    obj.data.transform(Matrix.Scale(1 / h, 4) @ Matrix.Translation(Vector((-(lo.x + hi.x) / 2, -(lo.y + hi.y) / 2, -lo.z))))
    obj.data.update()
    if GUARD or BODHI or DIANA or sid in WELD:
        # Scan stored as a loose triangle soup: weld coincident vertices so the decimator can collapse edges.
        import bmesh
        bm = bmesh.new(); bm.from_mesh(obj.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=WELD.get(sid, 2e-4))
        bm.to_mesh(obj.data); bm.free(); obj.data.update()
    return obj, {'width': (hi.x - lo.x) / h, 'depth': (hi.y - lo.y) / h, 'sourceTriangles': tris(obj)}


def decimate(obj, target):
    t = tris(obj)
    if t > target:
        m = obj.modifiers.new('lod', 'DECIMATE')
        m.ratio = target / t
        m.use_collapse_triangulate = True
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=m.name)
    return tris(obj)


def inspect(sid):
    obj, info = load(sid)
    decimate(obj, 150000)
    for k in range(1, 4):
        o = obj.copy()
        bpy.context.collection.objects.link(o)
        o.location.x = k * 1.25
        o.rotation_mode = 'XYZ'
        o.rotation_euler.z = -k * math.pi / 2  # views: front(-Y), right, back, left
    bpy.ops.object.camera_add(location=(1.875, -6, .5))
    c = bpy.context.object
    c.rotation_euler = (math.pi / 2, 0, 0)
    c.data.type = 'ORTHO'
    c.data.ortho_scale = 5.2
    s = bpy.context.scene
    s.camera = c
    s.render.engine = 'BLENDER_WORKBENCH'
    s.display.shading.light = 'STUDIO'
    s.display.shading.color_type = 'TEXTURE'
    s.render.resolution_x, s.render.resolution_y = 1040, 260
    s.render.filepath = str(INSPECT / f'{sid}.png')
    INSPECT.mkdir(exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print('INSPECTED', sid, info, flush=True)


def export(sid):
    obj, info = load(sid)
    base = obj.data.copy()
    d = OUT / sid
    d.mkdir(parents=True, exist_ok=True)
    counts = {}
    for lod, target, tex in LODS:
        obj.data = base.copy()
        for p in obj.data.polygons:
            p.use_smooth = True
        counts[lod] = decimate(obj, target)
        for img in bpy.data.images:
            if img.size[0] > tex or img.size[1] > tex:
                f = tex / max(img.size)
                img.scale(max(1, int(img.size[0] * f)), max(1, int(img.size[1] * f)))
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(d / f'{lod}.glb'), export_format='GLB', use_selection=True,
                                  export_animations=False, export_image_format='JPEG', export_jpeg_quality=85,
                                  export_texcoords=True, export_normals=True, export_extras=False)
    meta = json.loads((SRC / META).read_text(encoding='utf-8'))
    m = next(x for x in meta if x['file'] == source(sid).name)
    (d / 'asset.json').write_text(json.dumps({
        'id': sid, 'title': m['name'], 'author': m['author'], 'license': m['license'], 'source': m['url'],
        'normalizedHeight': 1, 'width': round(info['width'], 4), 'depth': round(info['depth'], 4),
        'frontYawDeg': FRONT_YAW.get(sid, 0), 'sourceTriangles': info['sourceTriangles'], 'triangles': counts,
        'sourceSha256': hashlib.sha256(source(sid).read_bytes()).hexdigest(),
        'changes': 'joined, upright, centred, normalised to 1 m, front turned to +Z, decimated LODs, textures resized to JPEG',
        'sha256': {lod: hashlib.sha256((d / f'{lod}.glb').read_bytes()).hexdigest() for lod, _, _ in LODS},
    }, indent=1, ensure_ascii=False), encoding='utf-8')
    print('EXPORTED', sid, counts, flush=True)


args = sys.argv[sys.argv.index('--') + 1:]
mode, ids = args[0], args[1:]
for sid in ids:
    try:
        (inspect if mode == 'inspect' else export)(sid)
    except Exception as e:
        print('FAILED', sid, repr(e), flush=True)
