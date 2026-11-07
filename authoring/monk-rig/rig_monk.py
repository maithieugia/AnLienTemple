"""
Rig the creator424 "Monk" (CC BY 4.0, T-pose, no skeleton) onto the CC0 Quaternius UAL skeleton, so every UAL clip
(idle, walk, sit, kneel, push…) and the game's devotional IK poses drive it with the same bone names.

  blender -b -P authoring/monk-rig/rig_monk.py -- <monk.glb> <hero.glb> <out.glb>

1. Monk scaled cm → m. UAL armature scaled uniformly to the monk's height, then the arm chains are stretched along X
   and lifted to the monk's own shoulder line — joints move, bone directions stay, so UAL rotations still fit.
2. Body: Blender automatic (bone-heat) weights. Eyes ride the head bone.
3. Clothes: weights copied from the body, then
   - sleeves (anything beyond the shoulder) follow the arm chain by their position along it, so a wide sleeve moves
     with its arm instead of being torn between arm and ribs;
   - the long skirt of robe and kasaya is blended toward the pelvis, so a stride does not split it between the legs;
   - smoothed, max 4 influences, normalized.
"""
import bpy, sys, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
MONK, HERO, OUT = argv[0], argv[1], argv[2]
bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]


def bake(objs):
    """World transforms into the data; no parents left."""
    for o in objs:
        if o.type == 'MESH':
            mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        if o.type == 'MESH': o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


monk_objs = import_glb(MONK)
meshes = [o for o in monk_objs if o.type == 'MESH']
bake(meshes)
for o in [o for o in monk_objs if o.type != 'MESH']: bpy.data.objects.remove(o, do_unlink=True)
for o in meshes:  # cm → m
    o.data.transform(__import__('mathutils').Matrix.Scale(0.01, 4)); o.data.update()
by = {k: next((o for o in meshes if o.name.startswith(k)), None) for k in ('upper', 'gasa', 'pants', 'ChamferBox004', 'man', 'Object002')}
body = next(o for o in meshes if o.name.startswith('man'))

hero_objs = import_glb(HERO)
arm = next(o for o in hero_objs if o.type == 'ARMATURE')
hero_top = max((o.matrix_world @ v.co).z for o in hero_objs if o.type == 'MESH' for v in o.data.vertices)
# keep only the hero's armature (its body meshes and helper empties go)
arm.parent = None
for o in [o for o in hero_objs if o is not arm]: bpy.data.objects.remove(o, do_unlink=True)

# ---- landmarks of the monk body (metres) ----
bv = [v.co.copy() for v in body.data.vertices]
H = max(v.z for v in bv)
tipX = max(abs(v.x) for v in bv)
armZ = sorted(v.z for v in bv if abs(v.x) > tipX * .6)
armZ = armZ[len(armZ) // 2]

# ---- fit the armature: uniform scale to height, then arms lifted + stretched ----
bpy.context.view_layer.objects.active = arm; arm.select_set(True)
s = H / hero_top
arm.scale = (s, s, s); bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
ARMFIT = {}
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.data.edit_bones
for side in ('l', 'r'):
    clav = eb[f'clavicle_{side}']
    chain = [b for b in eb if b == clav or clav in b.parent_recursive]
    ualZ = eb[f'upperarm_{side}'].head.z
    ualTip = max(abs(b.tail.x) for b in chain)
    x0 = abs(clav.head.x); kx = (tipX - x0) / max(1e-6, ualTip - x0); dz = armZ - ualZ
    sg = 1 if side == 'l' else -1
    # the monk's arms are not straight out to the side: fit y(x), z(x) lines through the arm vertices
    pts = [v for v in bv if sg * v.x > tipX * .4 and v.z > armZ - .25]
    n_ = len(pts); mx = sum(abs(v.x) for v in pts) / n_; my = sum(v.y for v in pts) / n_; mz = sum(v.z for v in pts) / n_
    sxx = sum((abs(v.x) - mx) ** 2 for v in pts); by_ = sum((abs(v.x) - mx) * (v.y - my) for v in pts) / sxx; bz_ = sum((abs(v.x) - mx) * (v.z - mz) for v in pts) / sxx
    line = lambda ax: Vector((0, my + by_ * (ax - mx), mz + bz_ * (ax - mx)))
    ref = eb[f'upperarm_{side}'].head.copy()
    ARMFIT[side] = (by_, bz_)
    for b in chain:
        for end in ('head', 'tail'):
            p = getattr(b, end).copy()
            if b == clav and end == 'head': continue
            nx = sg * (x0 + (abs(p.x) - x0) * kx) if abs(p.x) > x0 else p.x
            off = Vector((0, p.y - ref.y, p.z - ref.z)) if abs(p.x) > x0 else Vector((0, p.y - ref.y, p.z + dz - armZ))
            L = line(abs(nx)) if abs(nx) > abs(ref.x) * .9 else Vector((0, ref.y, armZ))
            setattr(b, end, Vector((nx, L.y + off.y, L.z + off.z)))
bpy.ops.object.mode_set(mode='OBJECT')
print('FIT height', round(H, 3), 'arm z', round(armZ, 3), 'tip x', round(tipX, 3), 'scale', round(s, 3))

bones = {b.name: b for b in arm.data.bones}
def bone_pt(name, end='head'): b = bones[name]; return arm.matrix_world @ (b.head_local if end == 'head' else b.tail_local)

# Helper bones (finger-tip leaves, IK targets, root) must never carry skin — bone heat otherwise hands a whole
# forearm to 'thumb_04_leaf', which then drags it about when the wrist bends.
for bb in arm.data.bones:
    if 'leaf' in bb.name or bb.name.startswith('ik_') or bb.name == 'root': bb.use_deform = False
# ---- body: distance-to-bone weights, each region only sees its own bones ----
# (Blender's bone heat silently fails on this scanned, multi-island body: it dumped whole forearms on a thumb joint.)
bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.parent_set(type='ARMATURE_NAME')
segs = {b.name: (arm.matrix_world @ b.head_local, arm.matrix_world @ b.tail_local) for b in arm.data.bones if b.use_deform}
def seg_dist(p, a, b):
    ab = b - a; t = max(0.0, min(1.0, (p - a).dot(ab) / max(1e-9, ab.length_squared))); return (p - (a + ab * t)).length
sh = abs((arm.matrix_world @ arm.data.bones['upperarm_l'].head_local).x)
wr = abs((arm.matrix_world @ arm.data.bones['hand_l'].head_local).x)
hip = (arm.matrix_world @ arm.data.bones['thigh_l'].head_local).z
neck = (arm.matrix_world @ arm.data.bones['neck_01'].head_local).z
def candidates(p):
    side = 'l' if p.x > 0 else 'r'
    if abs(p.x) > wr - .02 and p.z > hip:      # hand and fingers
        return [n for n in segs if n.endswith('_' + side) and (n.startswith(('hand', 'thumb', 'index', 'middle', 'ring', 'pinky')) or n.startswith('lowerarm'))]
    if abs(p.x) > sh * .85 and p.z > hip + .15:  # arm
        return [n for n in segs if n.endswith('_' + side) and n.startswith(('clavicle', 'upperarm', 'lowerarm', 'hand'))] + ['spine_03']
    if p.z > neck - .02: return ['neck_01', 'Head', 'spine_03']
    if p.z < hip - .04:                          # leg
        return [n for n in segs if n.endswith('_' + side) and n.startswith(('thigh', 'calf', 'foot', 'ball'))] + ['pelvis']
    return [n for n in ('pelvis', 'spine_01', 'spine_02', 'spine_03', 'neck_01', 'clavicle_l', 'clavicle_r', 'thigh_l', 'thigh_r') if n in segs]
gs = {}
for n in segs: gs[n] = body.vertex_groups.get(n) or body.vertex_groups.new(name=n)
for v in body.data.vertices:
    p = body.matrix_world @ v.co
    cs = [(seg_dist(p, *segs[n]), n) for n in candidates(p) if n in segs]
    cs.sort(); cs = cs[:3]; d0 = cs[0][0] + 1e-4
    ws = [(n, 1.0 / (d / d0) ** 6) for d, n in cs]; tot = sum(w for _, w in ws)
    for n, w in ws:
        if w / tot > .02: gs[n].add([v.index], w / tot, 'REPLACE')
md = body.modifiers.get('Armature') or body.modifiers.new('Armature', 'ARMATURE'); md.object = arm
bpy.context.view_layer.objects.active = body; bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
bpy.ops.object.vertex_group_smooth(group_select_mode='ALL', factor=.5, repeat=4, expand=0)
bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
bpy.ops.object.mode_set(mode='OBJECT')

DEFORM = [b.name for b in arm.data.bones if b.use_deform]


def groups(o):
    for n in DEFORM:
        if n not in o.vertex_groups: o.vertex_groups.new(name=n)
    return {g.name: g for g in o.vertex_groups}


def weights_of(o):
    names = {g.index: g.name for g in o.vertex_groups}
    return [{names[g.group]: g.weight for g in v.groups if g.weight > 1e-4} for v in o.data.vertices]


def write(o, W):
    gs = groups(o)
    for g in list(o.vertex_groups): o.vertex_groups.remove(g)
    gs = groups(o)
    for i, w in enumerate(W):
        tot = sum(w.values()) or 1
        top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; tt = sum(v for _, v in top) or 1
        for n, v in top: gs[n].add([i], v / tt, 'REPLACE')


def transfer(o):
    """Nearest-face weights from the body, as a starting point."""
    groups(o)
    m = o.modifiers.new('wt', 'DATA_TRANSFER'); m.object = body; m.use_vert_data = True
    m.data_types_verts = {'VGROUP_WEIGHTS'}; m.vert_mapping = 'POLYINTERP_NEAREST'
    m.layers_vgroup_select_src = 'ALL'; m.layers_vgroup_select_dst = 'NAME'
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)


def along_arm(p, side):
    """Weights for a point by its position along the (horizontal, T-pose) arm chain."""
    sg = 1 if side == 'l' else -1
    sh, el, wr = abs(bone_pt(f'upperarm_{side}').x), abs(bone_pt(f'lowerarm_{side}').x), abs(bone_pt(f'hand_{side}').x)
    x = abs(p.x)
    if x < sh: t = (x - sh * .55) / (sh * .45); return {f'spine_03': 1 - t, f'clavicle_{side}': t} if t > 0 else {'spine_03': 1}
    if x < el: t = (x - sh) / (el - sh); return {f'upperarm_{side}': 1 - .5 * t * t, f'lowerarm_{side}': .5 * t * t} if t < .7 else {f'upperarm_{side}': 1 - t, f'lowerarm_{side}': t}
    if x < wr: t = (x - el) / (wr - el); return {f'lowerarm_{side}': 1 - .35 * t, f'hand_{side}': .35 * t}
    return {f'lowerarm_{side}': .55, f'hand_{side}': .45}


def mix(a, b, t):
    out = {k: v * (1 - t) for k, v in a.items()}
    for k, v in b.items(): out[k] = out.get(k, 0) + v * t
    return out


hipZ = bone_pt('thigh_l').z; shoulderX = abs(bone_pt('upperarm_l').x)
# The kasaya panel that hangs straight down from the outstretched (T-pose) left forearm cannot follow a lowered arm
# without cloth simulation; it is trimmed, keeping the robe wrapped round the body and over the shoulder.
import bmesh
g = by.get('gasa')
if g:
    bm = bmesh.new(); bm.from_mesh(g.data)
    cut = [f for f in bm.faces if all(v.co.x > shoulderX * 1.35 and v.co.z < armZ - .06 for v in f.verts)]
    bmesh.ops.delete(bm, geom=cut, context='FACES'); bm.to_mesh(g.data); bm.free(); g.data.update()
    print('TRIM kasaya faces', len(cut))
for key in ('upper', 'gasa', 'pants', 'ChamferBox004'):
    o = by.get(key)
    if not o: continue
    transfer(o)
    W = weights_of(o)
    for i, v in enumerate(o.data.vertices):
        p = v.co; w = W[i]
        if key in ('upper', 'gasa'):
            # sleeves and the kasaya over the arm: follow the arm chain
            if abs(p.x) > shoulderX * .8 and p.z > hipZ * 1.05:
                a = along_arm(p, 'l' if p.x > 0 else 'r'); t = min(1, (abs(p.x) - shoulderX * .8) / (shoulderX * .5))
                w = mix(w, a, t)
            # long skirt: toward the pelvis the lower it hangs and the nearer the middle
            if p.z < hipZ:
                t = min(1, (hipZ - p.z) / (hipZ * .5)) * .6 * (1 - min(1, abs(p.x) / .32) * .45)
                w = mix(w, {'pelvis': 1}, t)
        W[i] = w
    write(o, W)
    o.parent = arm; md = o.modifiers.new('Armature', 'ARMATURE'); md.object = arm
    # smooth the result a few times
    bpy.context.view_layer.objects.active = o; bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
    bpy.ops.object.vertex_group_smooth(group_select_mode='ALL', factor=.5, repeat=6, expand=0)
    bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
    bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
    bpy.ops.object.mode_set(mode='OBJECT')

for key in ('Object002',):
    for o in [m for m in meshes if m.name.startswith(key)]:
        g = o.vertex_groups.new(name='Head'); g.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
        o.parent = arm; md = o.modifiers.new('Armature', 'ARMATURE'); md.object = arm

# ---- straighten the arms back to the UAL T-pose direction: bake the meshes in that pose, then make it the rest ----
from mathutils import Quaternion
ad0 = arm.animation_data; was_nla = ad0.use_nla if ad0 else None
if ad0: ad0.use_nla = False; ad0.action = None
bpy.ops.object.select_all(action='DESELECT'); arm.select_set(True); bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='POSE')
for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
for side, sg in (('l', 1), ('r', -1)):
    bone = arm.data.bones[f'upperarm_{side}']
    cur = (bone.tail_local - bone.head_local).normalized(); want = Vector((sg, 0, 0)) * 1.0
    want = Vector((sg, cur.y * 0, 0)).normalized()
    q_arm = cur.rotation_difference(want)
    mq = bone.matrix_local.to_quaternion()
    arm.pose.bones[f'upperarm_{side}'].rotation_quaternion = mq.inverted() @ q_arm @ mq
bpy.ops.object.mode_set(mode='OBJECT'); bpy.context.view_layer.update()
for o in [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == arm]:
    m = o.modifiers.get('Armature')
    if m: bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name)
bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
for o in [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == arm]:
    m = o.modifiers.new('Armature', 'ARMATURE'); m.object = arm
if ad0: ad0.use_nla = True if was_nla is None else was_nla
print('STRAIGHT', ARMFIT)

# ---- animations: UAL clips already live on this armature (imported NLA tracks); keep the ones the game uses,
# scale bone translations (pelvis bob, root motion) by the same factor as the skeleton ----
KEEP = {'Idle_Loop', 'Walk_Loop', 'Walk_Formal_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Sitting_Enter', 'Sitting_Exit', 'Sitting_Idle_Loop',
        'Sitting_Talking_Loop', 'Fixing_Kneeling', 'Push_Loop', 'Idle_Torch_Loop', 'Interact', 'Idle_Talking_Loop', 'A_TPose'}
ANIMS = True
ad = arm.animation_data
if ad:
    ad.action = None
    for tr in list(ad.nla_tracks):
        names = {st.action.name for st in tr.strips if st.action}
        if not names & KEEP: ad.nla_tracks.remove(tr); continue
        tr.mute = False
        for st in tr.strips:
            for L in st.action.layers:
                for ls in L.strips:
                    for cb in ls.channelbags:
                        for fc in cb.fcurves:
                            if fc.data_path.endswith('.location'):
                                for k in fc.keyframe_points: k.co.y *= s; k.handle_left.y *= s; k.handle_right.y *= s
    print('ANIMS', sorted(t.name for t in ad.nla_tracks))

for o in list(bpy.data.objects):
    if o.type not in ('MESH', 'ARMATURE'): bpy.data.objects.remove(o, do_unlink=True)
arm.name = 'MonkRig'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_animations=bool(ANIMS), export_animation_mode='NLA_TRACKS', export_skins=True,
                          export_image_format='JPEG', export_jpeg_quality=88, export_yup=True)
print('RIGGED', OUT, {o.name: len(o.vertex_groups) for o in bpy.data.objects if o.type == 'MESH'})
