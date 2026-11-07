"""New male pilgrim "Nam 01" (anh Thanh's model, Downloads/Tượng Phật/Nhân vật nam.zip → assets-src/nhan-vat-nam-src):
a young man in đồ lam with prayer beads, 52-bone Mixamo-style rig, 500k triangles, one broken walk clip.

This script
 1. decimates the mesh (~35k triangles) and resizes its maps to 2048 px,
 2. renames the bones to the Rocketbox biped names the game already uses (Bip01 Pelvis, Bip01 L Thigh, …) so the existing
    devotion poses (sit, kneel, bow, prayer with incense) work on him unchanged,
 3. retargets the Rocketbox male clips Idle / Walk / Run / Push onto his skeleton (limbs follow the source bone directions,
    so the A-pose vs T-pose difference does not matter; pelvis/spine follow the source rotation; hips travel scaled by height),
 4. exports public/assets/chars/ready-made/nam-01/model.glb (+ preview renders in authoring/nam01/).
Run: blender.exe -b -P authoring/nam01/build_nam01.py
"""
import bpy, os, math
from mathutils import Vector, Matrix, Quaternion

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_MODEL = os.path.join(ROOT, 'assets-src', 'nhan-vat-nam-src', 'base_basic_pbr.glb')
SRC_ANIMS = os.path.join(ROOT, 'public', 'assets', 'chars', 'ready-made', 'rocketbox', 'Male_Adult_08.glb')
OUT_DIR = os.path.join(ROOT, 'public', 'assets', 'chars', 'ready-made', 'nam-01')
CLIPS = ['Idle', 'Walk', 'Run', 'Push']
os.makedirs(OUT_DIR, exist_ok=True)

RENAME = {'Hips': 'Bip01 Pelvis', 'Spine': 'Bip01 Spine', 'Spine1': 'Bip01 Spine1', 'Spine2': 'Bip01 Spine2', 'Neck': 'Bip01 Neck', 'Head': 'Bip01 Head'}
for side, s in (('Left', 'L'), ('Right', 'R')):
    RENAME.update({f'{side}Shoulder': f'Bip01 {s} Clavicle', f'{side}Arm': f'Bip01 {s} UpperArm', f'{side}ForeArm': f'Bip01 {s} Forearm', f'{side}Hand': f'Bip01 {s} Hand',
                   f'{side}UpLeg': f'Bip01 {s} Thigh', f'{side}Leg': f'Bip01 {s} Calf', f'{side}Foot': f'Bip01 {s} Foot', f'{side}ToeBase': f'Bip01 {s} Toe0'})
    for d, finger in enumerate(['Thumb', 'Index', 'Middle', 'Ring', 'Pinky']):
        RENAME[f'{side}Hand{finger}1'] = f'Bip01 {s} Finger{d}'
        RENAME[f'{side}Hand{finger}2'] = f'Bip01 {s} Finger{d}1'
        RENAME[f'{side}Hand{finger}3'] = f'Bip01 {s} Finger{d}2'
DELTA = {'Bip01 Pelvis'}                     # rotation follows the source (keeps yaw/twist of the walk)
AIM = {n for n in RENAME.values() if 'Finger' not in n} - DELTA   # direction follows the source bone

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---- target: the new man
bpy.ops.import_scene.gltf(filepath=SRC_MODEL)
tgt = [o for o in scene.objects if o.type == 'ARMATURE'][0]
body = [o for o in scene.objects if o.type == 'MESH']
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
if tgt.animation_data: tgt.animation_data_clear()
for b in tgt.data.bones:
    if b.name in RENAME: b.name = RENAME[b.name]
for m in body:
    bpy.context.view_layer.objects.active = m
    d = m.modifiers.new('decimate', 'DECIMATE'); d.ratio = 0.07
    bpy.ops.object.modifier_apply(modifier=d.name)
for img in bpy.data.images:
    if img.size[0] > 2048: img.scale(2048, 2048)
tris = sum(len(p.vertices) - 2 for m in body for p in m.data.polygons)
print('DECIMATED', tris, flush=True)

# ---- source: Rocketbox male with the clips
before = set(scene.objects)
bpy.ops.import_scene.gltf(filepath=SRC_ANIMS)
src = [o for o in scene.objects if o not in before and o.type == 'ARMATURE'][0]
for o in scene.objects:
    if o not in before and o.type == 'MESH': o.hide_render = True; o.hide_viewport = True
actions = {a.name: a for a in bpy.data.actions}
print('SOURCE ACTIONS', list(actions), flush=True)

def facing(arm, left, right):
    l = (arm.matrix_world @ arm.data.bones[left].head_local); r = (arm.matrix_world @ arm.data.bones[right].head_local)
    v = l - r; v.z = 0; return v.normalized()
ft, fs = facing(tgt, 'Bip01 L Thigh', 'Bip01 R Thigh'), facing(src, 'Bip01 L Thigh', 'Bip01 R Thigh')
ang = math.atan2(ft.y, ft.x) - math.atan2(fs.y, fs.x)
src.matrix_world = Matrix.Rotation(ang, 4, 'Z') @ src.matrix_world
bpy.context.view_layer.update()
print('TW', [round(v,3) for v in tgt.matrix_world.to_euler()], tgt.matrix_world.to_scale(), tgt.parent); print('ALIGN source by', round(math.degrees(ang), 1), 'deg', flush=True)

TW, SW = tgt.matrix_world, src.matrix_world
TWi = TW.inverted()
def rest_rot(arm, name): return (arm.matrix_world @ arm.data.bones[name].matrix_local).to_quaternion()
def rest_head(arm, name): return arm.matrix_world @ arm.data.bones[name].head_local
hip_scale = (rest_head(tgt, 'Bip01 Pelvis').z - TW.translation.z) / max(1e-6, rest_head(src, 'Bip01 Pelvis').z - SW.translation.z)
Y = Vector((0, 1, 0))
order = []
def walk(b):
    order.append(b); [walk(c) for c in b.children]
for b in tgt.data.bones:
    if b.parent is None: walk(b)

# bone directions come from joint positions (Rocketbox bones do not point along their local Y)
CHILD = {}
for s_ in ('L', 'R'):
    CHILD.update({f'Bip01 {s_} Clavicle': f'Bip01 {s_} UpperArm', f'Bip01 {s_} UpperArm': f'Bip01 {s_} Forearm', f'Bip01 {s_} Forearm': f'Bip01 {s_} Hand',
                  f'Bip01 {s_} Thigh': f'Bip01 {s_} Calf', f'Bip01 {s_} Calf': f'Bip01 {s_} Foot', f'Bip01 {s_} Foot': f'Bip01 {s_} Toe0'})
CHILD.update({'Bip01 Spine': 'Bip01 Spine1', 'Bip01 Spine1': 'Bip01 Spine2', 'Bip01 Spine2': 'Bip01 Neck', 'Bip01 Neck': 'Bip01 Head'})
def wpos(arm, name, posed): return arm.matrix_world @ (arm.pose.bones[name].head if posed else arm.data.bones[name].head_local)
def wdir(arm, name, posed): return (wpos(arm, CHILD[name], posed) - wpos(arm, name, posed)).normalized()
# forearm + hand: full orientation from the hand's own joints (aim = wrist→middle finger / elbow→wrist, across = index→pinky),
# so the palm faces where the source palm faces (a direction-only aim leaves the wrist twisted, palms up)
FRAME = {}
for s_ in ('L', 'R'):
    FRAME[f'Bip01 {s_} Forearm'] = (f'Bip01 {s_} Forearm', f'Bip01 {s_} Hand', f'Bip01 {s_} Finger1', f'Bip01 {s_} Finger4')
    FRAME[f'Bip01 {s_} Hand'] = (f'Bip01 {s_} Hand', f'Bip01 {s_} Finger2', f'Bip01 {s_} Finger1', f'Bip01 {s_} Finger4')
def frame_q(arm, spec, posed):
    o, a, i, k = spec
    x = (wpos(arm, a, posed) - wpos(arm, o, posed)).normalized()
    y = wpos(arm, i, posed) - wpos(arm, k, posed); y = (y - x * y.dot(x)).normalized()
    z = x.cross(y)
    m = Matrix((x, y, z)).transposed(); return m.to_quaternion()
def wrot(arm, name): return (arm.matrix_world @ arm.pose.bones[name].matrix).to_quaternion()

DES = {}
def retarget(clip):
    act = actions.get(clip)
    if not act: print('MISSING', clip); return
    src.animation_data_create(); src.animation_data.action = act
    if hasattr(act, 'slots') and len(act.slots): src.animation_data.action_slot = act.slots[0]
    f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
    tgt.animation_data_create(); tgt.animation_data.action = None
    for pb in tgt.pose.bones: pb.rotation_mode = 'QUATERNION'
    rest_dir_t = {n: (TW @ tgt.data.bones[CHILD[n]].head_local - TW @ tgt.data.bones[n].head_local).normalized() for n in CHILD}
    scene.frame_set(f0)
    hip0 = None
    for f in range(f0, f1 + 1):
        scene.frame_set(f)
        desired = {}; corr = {}
        for b in order:
            pb = tgt.pose.bones[b.name]; Rt = rest_rot(tgt, b.name)
            if b.name in src.pose.bones and (b.name in DELTA or b.name in AIM):
                delta = wrot(src, b.name) @ rest_rot(src, b.name).inverted()      # source world rotation since rest
                q = delta @ Rt
                if b.name not in CHILD and b.parent and b.parent.name in corr:   # hands/head/toes: keep the parent's extra swing
                    q = corr[b.parent.name] @ q
                if b.name in CHILD:                                            # then swing so the limb points where the source limb points
                    have = delta @ rest_dir_t[b.name]; want = wdir(src, b.name, True)
                    q = have.rotation_difference(want) @ q
            elif b.parent:
                q = desired[b.parent.name] @ rest_rot(tgt, b.parent.name).inverted() @ Rt
            else:
                q = Rt
            if b.name in FRAME and all(n in src.pose.bones for n in FRAME[b.name]):
                full = frame_q(src, FRAME[b.name], True) @ frame_q(tgt, FRAME[b.name], False).inverted() @ Rt
                q = q.slerp(full, 0.5) if 'Forearm' in b.name else full   # forearm takes half the wrist twist (no twist bones; keeps the sleeve smooth)
            desired[b.name] = q
            if b.name in src.pose.bones and (b.name in DELTA or b.name in AIM):
                corr[b.name] = q @ (wrot(src, b.name) @ rest_rot(src, b.name).inverted() @ Rt).inverted()
            if b.parent:
                basis = Rt.inverted() @ rest_rot(tgt, b.parent.name) @ desired[b.parent.name].inverted() @ q
            else:
                basis = Rt.inverted() @ q
            pb.rotation_quaternion = basis
            DES[clip, f - f0 + 1, b.name] = q.copy()
            pb.keyframe_insert('rotation_quaternion', frame=f - f0 + 1)
            if b.name == 'Bip01 Pelvis':
                h = wpos(src, b.name, True)
                if hip0 is None: hip0 = h.copy()
                moved = Vector((0, 0, max(-0.25, min(0.25, (h.z - rest_head(src, b.name).z) * hip_scale))))   # only the bob; the game moves the player
                pb.location = Rt.inverted() @ moved; pb.keyframe_insert('location', frame=f - f0 + 1)
    new = tgt.animation_data.action; new.name = clip
    tr = tgt.animation_data.nla_tracks.new(); tr.name = clip; tr.strips.new(clip, 1, new)
    tgt.animation_data.action = None
    for pb in tgt.pose.bones: pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
    print('CLIP', clip, f1 - f0 + 1, 'frames', flush=True)

for c in CLIPS: retarget(c)

DIRS = {}
for clip, frame in (('Idle', 10), ('Walk', 8), ('Walk', 20), ('Run', 8), ('Push', 30)):
    a = actions[clip]; src.animation_data.action = a
    if hasattr(a, 'slots') and len(a.slots): src.animation_data.action_slot = a.slots[0]
    scene.frame_set(int(a.frame_range[0]) + frame - 1); DIRS[clip, frame] = {n: wdir(src, n, True) for n in CHILD}
# ---- previews: idle and walk
for o in list(scene.objects):
    if o not in before and o is not src: bpy.data.objects.remove(o, do_unlink=True)
bpy.data.objects.remove(src, do_unlink=True)
scene.render.engine = 'BLENDER_EEVEE_NEXT'; scene.render.resolution_x = 360; scene.render.resolution_y = 640
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); scene.collection.objects.link(cam); cam.location = (3.2, -3.6, 1.1); cam.rotation_euler = (math.radians(88), 0, math.radians(41)); scene.camera = cam
for loc, e in (((2, -3, 4), 800), ((-3, -1, 2), 300)):
    l = bpy.data.objects.new('l', bpy.data.lights.new('l', 'POINT')); l.data.energy = e; l.location = loc; scene.collection.objects.link(l)
w = bpy.data.worlds.new('w'); w.color = (.6, .6, .62); scene.world = w
for clip, frame in (('Idle', 10), ('Walk', 8), ('Walk', 20), ('Run', 8), ('Push', 30)):
    for t in tgt.animation_data.nla_tracks: t.mute = True
    a = tgt.animation_data.nla_tracks[clip].strips[0].action; tgt.animation_data.action = a
    if hasattr(a, 'slots') and len(a.slots): tgt.animation_data.action_slot = a.slots[0]
    scene.frame_set(frame)
    errs = [(n, round(math.degrees((wpos(tgt, CHILD[n], True) - wpos(tgt, n, True)).angle(DIRS[clip, frame][n])))) for n in CHILD]
    print('QERR', clip, frame, [(n, round(math.degrees(wrot(tgt, n).rotation_difference(DES[clip, frame, n]).angle))) for n in ('Bip01 Pelvis','Bip01 Spine','Bip01 Spine1','Bip01 L Thigh','Bip01 L Calf','Bip01 L UpperArm')], flush=True)
    print('DIRERR', clip, frame, [e for e in errs if e[1] > 8], flush=True)
    scene.render.filepath = os.path.join(ROOT, 'authoring', 'nam01', f'clip-{clip}-{frame}.png'); bpy.ops.render.render(write_still=True)
tgt.animation_data.action = None
for t in tgt.animation_data.nla_tracks: t.mute = False

out = os.path.join(OUT_DIR, 'model.glb')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animation_mode='NLA_TRACKS', export_skins=True, export_image_format='JPEG', export_jpeg_quality=85, export_yup=True, export_apply=False)
print('EXPORT', out, os.path.getsize(out) // 1024, 'KB', flush=True)
