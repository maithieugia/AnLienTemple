"""An Lien main hall, grand version (anh Thanh, 30/10/2026): ONE roof over the 600x400 m hall, a giant order of
columns all round, floors 22 m / 20 m. Metres, Blender Z-up (game: x, z, -y). Original geometry and textures.

part = 'roof'   : the single great hip roof (individually ribbed glazed tiles, layered fascia, exposed rafters,
                  bracket sets on the architrave, hip and main ridges, lưỡng long chầu nguyệt, upturned corner
                  prows with hanging bells) plus the veranda skirt roof between the walls and the giant columns.
part = 'column' : one giant column (carved lotus stone base, entasis lacquer shaft, bronze bands with relief,
                  flared capital with curved corbels and stacked bracket blocks). The game instances it.
Shapes match apps/client/src/game/world/SanctuaryPlan.ts (SANCTUARY_ROOF, SANCTUARY_LEVELS).
"""
import bpy, math, random
from mathutils import Vector
from math import sin, cos, pi

R = dict(ridgeHalf=100, eaveX=344, eaveY=244, eaveZ=101.3, rise=32, upturn=7, inner=.6)  # tier 2: the middle roof ring over the upper floor
CR = dict(ridgeHalf=100, eaveX=172, eaveY=72, eaveZ=154, rise=22, upturn=6)      # tier 3: the crown roof on the clerestory
CL = dict(x=238, y=138, z0=106.4, z1=119.6)                                          # clerestory (timber lattice drum) under the crown
SK = dict(x0=320, y0=220, out=24, top=52, drop=5.5)                              # tier 1: lower eave ring round the giant colonnade (mái chồng diêm)
COL = dict(x=322, y=222, step=24)                                                   # giant colonnade
COLUMN_H = 101.3 - 1.2 - .6                                                          # floor 1.2 → just under the eave


def build(spec):
    root = bpy.data.objects.new(spec['id'], None); bpy.context.collection.objects.link(root)
    rnd = random.Random(30102026)

    def mat(name, c, metal=0, rough=.6):
        m = bpy.data.materials.new(name); m.diffuse_color = (*c, 1); m.use_nodes = True
        p = m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value = (*c, 1)
        p.inputs['Metallic'].default_value = metal; p.inputs['Roughness'].default_value = rough
        return m
    wood = mat('Lim wood - deep umber', (.13, .05, .022)); red = mat('Lacquer - imperial oxblood', (.30, .028, .02), 0, .3)
    stone = mat('Granite - warm grey', (.46, .43, .37)); cream = mat('Carved stone - pale', (.66, .61, .48))
    bronze = mat('Antique gilded bronze', (.62, .40, .11), .75, .3); gold = mat('Gold leaf', (.83, .60, .18), .9, .22)
    dark = mat('Roof underside - smoked timber', (.09, .04, .02))
    # golden-orange glazed tiles (ngói men vàng cam), a little variation between batches
    tiles = [mat('Glazed roof tile ' + str(i), (.86 + i * .025, .44 + i * .035, .055 + i * .012), .05, .22) for i in range(4)]
    rib_tile = mat('Round cover tile - orange glaze', (.90, .47, .07), .05, .2)
    ridge_tile = mat('Ridge tile - deep orange glaze', (.74, .30, .05), .05, .24)
    buckets = {}

    def geo(name, v, f, m):
        vs, fs = buckets.setdefault((name, m.name), ([], [])); off = len(vs); vs.extend(v); fs.extend(tuple(i + off for i in q) for q in f)

    def box(name, x, y, z, w, d, h, m):
        a, b = x - w / 2, x + w / 2; c, e = y - d / 2, y + d / 2; f, g = z - h / 2, z + h / 2
        geo(name, [(a, c, f), (b, c, f), (b, e, f), (a, e, f), (a, c, g), (b, c, g), (b, e, g), (a, e, g)], [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)], m)

    def lathe(name, x, y, z, profile, m, n=24):
        v = [(x + r * cos(2 * pi * k / n), y + r * sin(2 * pi * k / n), z + h) for r, h in profile for k in range(n)]
        f = [(j * n + k, j * n + (k + 1) % n, (j + 1) * n + (k + 1) % n, (j + 1) * n + k) for j in range(len(profile) - 1) for k in range(n)]
        f.extend([tuple(reversed(range(n))), tuple((len(profile) - 1) * n + k for k in range(n))]); geo(name, v, f, m)

    def tube(name, pts, r, m, n=8, taper=None):
        v = []
        for i, p in enumerate(pts):
            tg = Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(0, i - 1)]); t = tg.normalized()
            ref = Vector((0, 0, 1)) if abs(t.z) < .9 else Vector((1, 0, 0)); u = t.cross(ref).normalized(); w = t.cross(u).normalized()
            rr = r * (taper(i / max(1, len(pts) - 1)) if taper else 1)
            v.extend(tuple(Vector(p) + rr * (u * cos(k * 2 * pi / n) + w * sin(k * 2 * pi / n))) for k in range(n))
        geo(name, v, [(j * n + k, j * n + (k + 1) % n, (j + 1) * n + (k + 1) % n, (j + 1) * n + k) for j in range(len(pts) - 1) for k in range(n)], m)

    def strip(name, rows, m):
        """A quad grid from rows of points (all rows the same length)."""
        n = len(rows[0]); v = [p for row in rows for p in row]
        geo(name, v, [(j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i) for j in range(len(rows) - 1) for i in range(n - 1)], m)

    part = spec.get('part', 'roof')
    if part == 'column':
        H = COLUMN_H
        # carved stone base: stepped plinth, a ring of lotus petals in relief
        for i, (s, h) in enumerate([(3.4, .5), (3.0, .45), (2.75, .4)]):
            box('column plinth steps', 0, 0, i * .45 + h / 2, s * 2, s * 2, h, stone)
        lathe('column lotus cushion', 0, 0, 1.35, [(2.7, 0), (2.85, .35), (2.75, .8), (2.45, 1.15), (2.25, 1.3)], cream, 48)
        for k in range(24):
            a = 2 * pi * k / 24; pts = []
            for j in range(13):
                t = j / 12; rr = 2.72 + .18 * sin(t * pi); ang = a + .11 * sin(t * 2 * pi)
                pts.append((rr * cos(ang), rr * sin(ang), 1.42 + .85 * t))
            tube('column lotus petals', pts, .11, cream, 6, lambda q: .5 + .8 * sin(q * pi))
        # entasis shaft: swells a third of the way up, lacquered
        prof = [(2.15, 0)] + [(2.15 + .16 * sin(pi * min(1, (h / H) * 1.5)) - .22 * (h / H), h) for h in [H * k / 20 for k in range(1, 20)]] + [(1.95, H - 3.2)]
        lathe('column lacquer shaft', 0, 0, 2.6, [(r, h) for r, h in prof], red, 40)
        # bronze bands with a running scroll relief
        for hb in [3.2, H * .33, H * .66, H - 1.6]:
            lathe('column bronze bands', 0, 0, hb, [(2.32, 0), (2.38, .12), (2.38, .62), (2.32, .74)], bronze, 40)
            for k in range(16):
                a0 = 2 * pi * k / 16; pts = [(2.42 * cos(a0 + .3 * t / 8), 2.42 * sin(a0 + .3 * t / 8), hb + .37 + .2 * sin(t / 8 * 2 * pi)) for t in range(9)]
                tube('column band scrolls', pts, .045, gold, 6)
        # flared capital, curved corbels on four sides and stacked bracket blocks
        lathe('column capital', 0, 0, H - .2, [(2.0, 0), (2.45, .6), (2.9, 1.2), (3.0, 1.5)], wood, 32)
        for a in range(4):
            dx, dy = cos(a * pi / 2), sin(a * pi / 2)
            pts = [(dx * (2.0 + 3.2 * t), dy * (2.0 + 3.2 * t), H - 3.6 + 3.9 * t ** .6 + .2 * sin(t * pi)) for t in [k / 10 for k in range(11)]]
            tube('column curved corbels', pts, .42, wood, 10, lambda q: 1.1 - .45 * q)
            for k in range(3):
                box('column bracket blocks', dx * (1.8 + k * 1.15), dy * (1.8 + k * 1.15), H + 1.45 + k * .55, 1.3 + abs(dy) * (1.2 - k * .2), 1.3 + abs(dx) * (1.2 - k * .2), .5, wood)
                box('column bracket gold caps', dx * (1.8 + k * 1.15), dy * (1.8 + k * 1.15), H + 1.73 + k * .55, 1.0 + abs(dy) * .9, 1.0 + abs(dx) * .9, .08, gold)
        box('column top block', 0, 0, H + 1.25, 3.6, 3.6, .9, wood)
    else:
        def hip(P):
            def f(face, u, t, lift=0):
                X = P['ridgeHalf'] + (P['eaveX'] - P['ridgeHalf']) * t; Y = P['eaveY'] * t
                if face < 2: x = (1 if face == 0 else -1) * X; y = u * Y
                else: x = u * X; y = (1 if face == 2 else -1) * Y
                return (x, y, P['eaveZ'] + P['rise'] * (1 - t) ** 1.7 + P['upturn'] * t ** 6 * abs(u) ** 8 + lift)
            f.ex, f.ey = P['eaveX'], P['eaveY']
            return f
        p = hip(R); crown = hip(CR)

        def skirt(face, u, t, lift=0):
            ox, oy = SK['x0'] + SK['out'] * t, SK['y0'] + SK['out'] * t
            if face < 2: x = (1 if face == 0 else -1) * ox; y = u * oy
            else: x = u * ox; y = (1 if face == 2 else -1) * oy
            return (x, y, SK['top'] - SK['drop'] * t + 3 * t ** 5 * abs(u) ** 7 + lift)
        skirt.ex, skirt.ey = SK['x0'] + SK['out'], SK['y0'] + SK['out']

        def roof_skin(name, fn, faces_n, nt, rib_every, lift_top=.06, rib_r=.42, eave_layers=True, segs=18, t0=0.0):
            T = lambda q: max(.004, t0 + (1 - t0) * q)
            for face in range(4):
                nu = faces_n[0] if face < 2 else faces_n[1]
                rows = [[fn(face, -1 + 2 * i / nu, T(j / nt)) for i in range(nu + 1)] for j in range(nt + 1)]
                strip(name + ' underside', rows, dark)
                # tile courses on top: alternate glaze strips between the ribs
                for j in range(nt):
                    for i in range(nu):
                        q = [fn(face, -1 + 2 * ii / nu, T(jj / nt), lift_top) for jj in (j, j + 1) for ii in (i, i + 1)]
                        geo(name + ' glazed tile courses', [q[0], q[1], q[3], q[2]], [(0, 1, 2, 3)], tiles[(i * 5 + j * 3 + face) % 4])
                # half-round ribs (ống ngói) down the slope
                span = 2 * (fn.ex if face >= 2 else fn.ey)
                ribs = max(8, int(span / rib_every))
                for i in range(ribs + 1):
                    u = -1 + 2 * i / ribs
                    rib = [fn(face, u, max(.02, T(k / segs)), lift_top + rib_r * .5) for k in range(segs + 1)]
                    tube(name + ' tile ribs', rib, rib_r, rib_tile, 8)
                    # round end tile (đầu ngói) with a gold rim where each rib meets the eave
                    ex, ey, ez = rib[-1]; dx, dy = (1 if face == 0 else -1 if face == 1 else 0), (1 if face == 2 else -1 if face == 3 else 0)
                    tube(name + ' tile end discs', [(ex - dx * .05, ey - dy * .05, ez), (ex + dx * .12, ey + dy * .12, ez)], rib_r * 1.35, rib_tile, 12)
                    tube(name + ' tile end gold rims', [(ex + dx * .12, ey + dy * .12, ez), (ex + dx * .16, ey + dy * .16, ez)], rib_r * 1.42, gold, 12)
                if eave_layers:
                    edge = lambda d: [fn(face, -1 + 2 * k / 120, 1, d) for k in range(121)]
                    strip(name + ' deep fascia board', [edge(.1), edge(-2.6)], red)
                    for drop, r, m in [(.0, .55, gold), (-.9, .32, wood), (-2.6, .38, gold)]:
                        tube(name + ' layered eave mouldings', edge(drop), r, m, 8)
                    # exposed rafters under the overhang
                    for i in range(0, 121, 2):
                        u = -1 + 2 * i / 120
                        tube(name + ' exposed rafters', [fn(face, u, t, -.6) for t in [.86, .9, .95, 1]], .32, wood, 8)

        # ---------------- tier 2: the middle roof, a ring over the upper floor (on the giant colonnade)
        roof_skin('middle roof', p, (110, 150), 14, 2.6, t0=R['inner'], segs=10)
        for face in range(4):
            for u in (-1, 1):
                hip_l = [p(face, u, R['inner'] + (1 - R['inner']) * k / 16, 1.2) for k in range(17)]
                tube('middle roof hip ridge', hip_l, 1.15, ridge_tile, 12)
                tube('middle roof hip crest', [(x, y, z + .9) for x, y, z in hip_l], .34, gold, 8)
            # a ridge-tiled curb along the ring's upper edge, at the foot of the clerestory
            edge = [p(face, -1 + 2 * k / 80, R['inner'], .8) for k in range(81)]
            tube('middle roof upper curb', edge, .9, ridge_tile, 10)
            tube('middle roof curb gold', [(x, y, z + .8) for x, y, z in edge], .25, gold, 6)
        # ---------------- the clerestory: a lacquered timber drum with lattice windows carrying the crown roof
        ringX = R['ridgeHalf'] + (R['eaveX'] - R['ridgeHalf']) * R['inner']; ringY = R['eaveY'] * R['inner']
        box('clerestory floor', 0, 0, CL['z0'] - .4, 2 * ringX, 2 * ringY, .8, dark)
        H = CL['z1'] - CL['z0']
        for sx in (-1, 1):
            box('clerestory back wall', sx * (CL['x'] - .6), 0, CL['z0'] + H / 2, .5, 2 * CL['y'], H, red)
            for k in range(int(2 * CL['y'] / 6) + 1):
                y = -CL['y'] + 6 * k
                lathe('clerestory posts', sx * CL['x'], y, CL['z0'], [(.55, 0), (.55, H)], red, 16)
            for zr in (CL['z0'] + 1.0, CL['z0'] + H - 1.0):
                box('clerestory rails', sx * CL['x'], 0, zr, .5, 2 * CL['y'], .6, gold)
            for k in range(int(2 * CL['y'] / 1.5) + 1):
                box('clerestory mullions', sx * (CL['x'] + .15), -CL['y'] + 1.5 * k, CL['z0'] + H / 2, .12, .12, H - 2.4, wood)
        for sy in (-1, 1):
            box('clerestory back wall', 0, sy * (CL['y'] - .6), CL['z0'] + H / 2, 2 * CL['x'], .5, H, red)
            for k in range(int(2 * CL['x'] / 6) + 1):
                x = -CL['x'] + 6 * k
                lathe('clerestory posts', x, sy * CL['y'], CL['z0'], [(.55, 0), (.55, H)], red, 16)
            for zr in (CL['z0'] + 1.0, CL['z0'] + H - 1.0):
                box('clerestory rails', 0, sy * CL['y'], zr, 2 * CL['x'], .5, .6, gold)
            for k in range(int(2 * CL['x'] / 1.5) + 1):
                box('clerestory mullions', -CL['x'] + 1.5 * k, sy * (CL['y'] + .15), CL['z0'] + H / 2, .12, .12, H - 2.4, wood)
        for x in range(-int(CL['x']), int(CL['x']) + 1, 4):  # bracket row under the crown eave
            for sy in (-1, 1): box('crown bracket sets', x, sy * (CL['y'] + 1.2), CL['z1'] - .4, 1.0, 2.4, .7, wood)
        for y in range(-int(CL['y']), int(CL['y']) + 1, 4):
            for sx in (-1, 1): box('crown bracket sets', sx * (CL['x'] + 1.2), y, CL['z1'] - .4, 2.4, 1.0, .7, wood)
        # Two additional true roof rings, with supporting clerestory drums: five roofs total.
        for tier, P, D in [(3,dict(ridgeHalf=100,eaveX=256,eaveY=156,eaveZ=119,rise=26,upturn=6),dict(x=184,y=84,z0=124.5,z1=137.6)),(4,dict(ridgeHalf=100,eaveX=204,eaveY=104,eaveZ=137,rise=23,upturn=5.5),dict(x=154,y=54,z0=141.8,z1=154.6))]:
            fn=hip(P)
            roof_skin('tier '+str(tier)+' ring',fn,(72,100),12,2.8,t0=.60,segs=9)
            for face in range(4):
                edge=[fn(face,-1+2*k/100,.60,.15) for k in range(101)]
                tube('tier ring upper ridge',edge,.75,ridge_tile,8)
            for side in (-1,1):
                for axis in ('x','y'):
                    span=D['x'] if axis=='x' else D['y']
                    n=int(2*span/8)
                    for i in range(n+1):
                        u=-span+i*2*span/n
                        xx,yy=(u,side*D['y']) if axis=='x' else (side*D['x'],u)
                        box('tier drum round posts',xx,yy,(D['z0']+D['z1'])/2,.65,.65,D['z1']-D['z0'],red)
                    for zz in (D['z0'],D['z0']+1,D['z1']-1,D['z1']):
                        box('tier drum beams',0 if axis=='x' else side*D['x'],side*D['y'] if axis=='x' else 0,zz,2*D['x'] if axis=='x' else .75,.75 if axis=='x' else 2*D['y'],.65,wood)
            for sx in (-1,1):
                for sy in (-1,1):
                    start=(sx*P['eaveX'],sy*P['eaveY'],P['eaveZ']+P['upturn'])
                    tube('tier upturned dao',[(start[0]+sx*8*t,start[1]+sy*8*t,start[2]+9*t*t) for t in [k/12 for k in range(13)]],.7,ridge_tile,10,lambda q:1-.7*q)

        # ---------------- tier 3: the crown roof, with the ridge, dragons and pearl
        roof_skin('crown roof', crown, (90, 120), 26, 2.6)
        for face in range(4):
            for u in (-1, 1):
                hip_c = [crown(face, u, k / 30, 1.2) for k in range(31)]
                tube('crown roof hip ridge', hip_c, 1.2, ridge_tile, 12)
                tube('crown roof hip crest', [(x, y, z + .95) for x, y, z in hip_c], .36, gold, 8)
        ridgeZ = CR['eaveZ'] + CR['rise']
        box('main ridge body', 0, 0, ridgeZ + 1.2, 2 * CR['ridgeHalf'] + 4, 3.6, 2.6, ridge_tile)
        for side in (-1, 1): box('main ridge gold band', 0, side * 1.85, ridgeZ + 1.6, 2 * CR['ridgeHalf'] + 4, .12, .6, gold)
        for x in range(-CR['ridgeHalf'], CR['ridgeHalf'] + 1, 4):
            lathe('main ridge finial tiles', x, 0, ridgeZ + 2.5, [(.5, 0), (.6, .4), (.25, 1.2), (0, 1.4)], ridge_tile, 8)
        for sx in (-1, 1):
            pts = [(sx * CR['ridgeHalf'] + sx * 6 * sin(t * pi * .8), 0, ridgeZ + 2.5 + 14 * t - 3 * t * t) for t in [k / 16 for k in range(17)]]
            tube('ridge end curl', pts, 1.7, ridge_tile, 12, lambda q: 1 - .55 * q)
            tube('ridge end curl gold', [(x, y + .3, z + .2) for x, y, z in pts], .35, gold, 6)
        lathe('ridge moon pearl', 0, 0, ridgeZ + 5.5, [(0, 0), (3.2, .4), (4.2, 3.2), (3.2, 6.2), (0, 6.6)], gold, 32)
        for k in range(10):
            a = 2 * pi * k / 10
            tube('pearl flames', [(4 * cos(a) * .2 * w, 0, ridgeZ + 8.7 + 5 * w) for w in [0, .4, .8, 1]], .5, gold, 6, lambda q: 1 - q)
        for sx in (-1, 1):
            body = [(sx * (58 - 52 * t), 2.2 * sin(t * pi * 4), ridgeZ + 3 + 4.5 * sin(t * pi * 3) + 6 * t) for t in [k / 60 for k in range(61)]]
            tube('ridge dragon body', body, 1.6, gold, 12, lambda q: .45 + .8 * sin(q * pi) ** .5)
            for i in range(2, 58, 3):
                x, y, z = body[i]
                tube('ridge dragon fins', [(x, y, z + 1.2), (x - sx * .8, y, z + 3.2)], .3, bronze, 5, lambda q: 1 - q)
            hx, hy, hz = body[-1]
            lathe('ridge dragon head', hx, hy, hz - 1.5, [(1.6, 0), (2.4, 1.2), (2, 2.6), (.6, 3.4)], gold, 16)
            for sg in (-1, 1):
                tube('ridge dragon horns', [(hx, hy + sg * .8, hz + 1.6), (hx + sx * 1.8, hy + sg * 1.4, hz + 4.5)], .32, bronze, 6, lambda q: 1 - .7 * q)
        # corner prows (đao) on the middle and crown roofs
        for P in (R, CR):
            for sx in (-1, 1):
                for sy in (-1, 1):
                    x, y = sx * P['eaveX'], sy * P['eaveY']; z = P['eaveZ'] + P['upturn']
                    prow = [(x - sx * 10 * (1 - t), y - sy * 10 * (1 - t), z - 3 * (1 - t) ** 2 + 8 * t ** 2) for t in [k / 20 for k in range(21)]]
                    prow += [(x + sx * 3 * t, y + sy * 3 * t, z + 8 + 6 * t) for t in [k / 8 for k in range(1, 9)]]
                    tube('corner prow dao', prow, 1.3, ridge_tile, 12, lambda q: 1.1 - .7 * q)
                    tube('corner prow gold spine', [(a1, b1, c1 + 1.1) for a1, b1, c1 in prow], .32, gold, 6)
        def bell(x, y, z):
            tube('eave bell chains', [(x, y, z), (x, y, z - 3.2)], .07, bronze, 4)
            lathe('eave bronze bells', x, y, z - 6.2, [(0, 0), (1.0, 0), (.85, .6), (.6, 2.4), (.22, 3.0), (0, 3.1)], bronze, 16)
            lathe('eave bell clappers', x, y, z - 6.6, [(0, 0), (.25, 0), (.25, .5), (0, .5)], gold, 8)
        for P, fn, n in ((R, p, 12), (CR, crown, 8), (dict(eaveX=SK['x0'] + SK['out'], eaveY=SK['y0'] + SK['out'], eaveZ=SK['top'] - SK['drop'], upturn=3), skirt, 12)):
            for sx in (-1, 1):
                for sy in (-1, 1): bell(sx * (P['eaveX'] - 2), sy * (P['eaveY'] - 2), P['eaveZ'] + P['upturn'] - 3)
            for face in range(4):
                for k in range(1, n):
                    q = fn(face, -1 + 2 * k / n, 1, -2.8); bell(*q)
        # architrave on the giant colonnade and the bracket sets (đấu củng) stepping out under the eaves
        top = 1.2 + COLUMN_H
        for (x0, x1, y0, y1) in [(-COL['x'], COL['x'], -COL['y'], -COL['y']), (-COL['x'], COL['x'], COL['y'], COL['y']), (-COL['x'], -COL['x'], -COL['y'], COL['y']), (COL['x'], COL['x'], -COL['y'], COL['y'])]:
            cx, cy, w, d = (x0 + x1) / 2, (y0 + y1) / 2, max(3.4, x1 - x0 + 3.4), max(3.4, y1 - y0 + 3.4)
            box('architrave lacquer beam', cx, cy, top + .3, w, d, 3.0, red)
            for h in (top - 1.15, top + 1.75): box('architrave gold bands', cx, cy, h, w + .12, d + .12, .3, gold)
        for side in (-1, 1):
            for k in range(-int(COL['y'] / 4), int(COL['y'] / 4) + 1):
                for s in range(3): box('bracket sets', side * (COL['x'] + 1.8 + s * 1.5), k * 4, top + 2.2 + s * .9, 1.6 + s * .6, 1.3, .8, wood); box('bracket gold caps', side * (COL['x'] + 1.8 + s * 1.5), k * 4, top + 2.65 + s * .9, 1.2, 1.0, .1, gold)
            for k in range(-int(COL['x'] / 4), int(COL['x'] / 4) + 1):
                for s in range(3): box('bracket sets', k * 4, side * (COL['y'] + 1.8 + s * 1.5), top + 2.2 + s * .9, 1.3, 1.6 + s * .6, .8, wood); box('bracket gold caps', k * 4, side * (COL['y'] + 1.8 + s * 1.5), top + 2.65 + s * .9, 1.0, 1.2, .1, gold)
        # ---------------- the skirt roof round the veranda, same tiles, lighter eave
        roof_skin('skirt roof', skirt, (90, 130), 6, 2.6, .05, .36, True, 6)
        for sx in (-1, 1):
            for sy in (-1, 1):
                x, y = sx * (SK['x0'] + SK['out']), sy * (SK['y0'] + SK['out']); z = SK['top'] - SK['drop'] + 3
                prow = [(x - sx * 7 * (1 - t), y - sy * 7 * (1 - t), z - 2 * (1 - t) ** 2 + 5 * t ** 2) for t in [k / 16 for k in range(17)]] + [(x + sx * 2 * t, y + sy * 2 * t, z + 5 + 4 * t) for t in [k / 6 for k in range(1, 7)]]
                tube('skirt corner prow dao', prow, 1.0, ridge_tile, 12, lambda q: 1.1 - .7 * q)
                tube('skirt corner prow gold spine', [(a1, b1, c1 + .9) for a1, b1, c1 in prow], .26, gold, 6)

    # ---------------- original raster surfaces (embedded), metre UVs: 512 px colour + normal maps for crisp relief
    import numpy as np
    N = 512
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)

    def add_image(material, rgb, normal=None):
        img = bpy.data.images.new(material.name + ' surface', width=N, height=N)
        img.pixels.foreach_set(np.dstack([np.clip(rgb, 0, 1), np.ones((N, N))]).astype(np.float32).ravel()); img.pack()
        nodes = material.node_tree.nodes; links = material.node_tree.links; bsdf = nodes.get('Principled BSDF')
        tx = nodes.new('ShaderNodeTexImage'); tx.image = img; links.new(tx.outputs['Color'], bsdf.inputs['Base Color'])
        if normal is not None:
            nimg = bpy.data.images.new(material.name + ' normal', width=N, height=N); nimg.colorspace_settings.name = 'Non-Color'
            nimg.pixels.foreach_set(np.dstack([normal, np.ones((N, N))]).astype(np.float32).ravel()); nimg.pack()
            nt = nodes.new('ShaderNodeTexImage'); nt.image = nimg; nm = nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value = 1.0
            links.new(nt.outputs['Color'], nm.inputs['Color']); links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])

    def normal_from(h, k):
        gy, gx = np.gradient(h); n = np.dstack([-gx * k, -gy * k, np.ones_like(h)]); n /= np.linalg.norm(n, axis=2, keepdims=True); return n * .5 + .5

    rng = np.random.default_rng(30102026)
    noise = lambda: rng.random((N, N)).astype(np.float32)
    for material, kind in [(wood, 'wood'), (red, 'lacquer'), (stone, 'stone'), (cream, 'stone')] + [(m, 'clay') for m in tiles] + [(rib_tile, 'rib'), (ridge_tile, 'clay')]:
        base = np.array(material.diffuse_color[:3], dtype=np.float32)
        if kind == 'clay':
            # 2 m texture: four pans across, four courses down; each tile bulges, overlaps the one below with a lip
            P = N / 4; fx = (xx % P) / P; course = (yy // P).astype(int); fy = (yy % P) / P
            fx = ((xx + (course % 2) * P / 2) % P) / P
            tile_id = ((xx + (course % 2) * P / 2) // P).astype(int) * 7 + course * 13
            tint = 1 + .07 * np.sin(tile_id * 1.7) + .04 * np.cos(tile_id * 3.1)
            h = np.sin(np.pi * fx) * .7 + .55 * (1 - fy) ** 6               # pan curve + overlapping lip
            shade = (.78 + .32 * np.sin(np.pi * fx) ** .7) * (.72 + .28 * np.clip(fy * 1.6, 0, 1)) * tint
            seam = (np.minimum(fx, 1 - fx) < .018) | (fy < .02)
            shade = np.where(seam, shade * .45, shade) * (.97 + .06 * noise())
            glaze = 1 + .35 * np.clip(np.sin(np.pi * fx) - .6, 0, 1) * np.clip(fy - .3, 0, 1)   # glossy highlight on each pan
            add_image(material, base[None, None, :] * (shade * glaze)[..., None], normal_from(h, 6))
        elif kind == 'rib':
            stripe = (.82 + .3 * np.sin(np.pi * (xx % N) / N)) * (.9 + .1 * ((yy // 64) % 2)) * (.97 + .06 * noise())
            add_image(material, base[None, None, :] * stripe[..., None], normal_from(((yy % 64) / 64) ** 4 * .8, 5))
        elif kind in ('wood', 'lacquer'):
            g = np.sin(2 * np.pi * xx / 23 + 1.4 * np.sin(yy * 2 * np.pi / N) + .4 * np.sin(xx * 2 * np.pi / 90))
            v = 1 + (.14 if kind == 'wood' else .05) * g + .03 * (noise() - .5)
            add_image(material, base[None, None, :] * v[..., None], normal_from(g * (.4 if kind == 'wood' else .1), 2))
        else:
            v = .9 + .16 * noise() + .04 * np.sin(xx * .07 + yy * .05)
            add_image(material, base[None, None, :] * v[..., None], normal_from(noise() * .3, 1.5))
    smooth_words = ['column', 'rib', 'end disc', 'gold rim', 'ridge', 'dragon', 'pearl', 'prow', 'bell', 'moulding', 'rafter', 'curl', 'flames', 'corbel', 'petal', 'scroll', 'hip', 'chain']
    for (name, mn), (v, f) in buckets.items():
        me = bpy.data.meshes.new(name); me.from_pydata(v, [], f); me.update(); o = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(o); o.parent = root; me.materials.append(bpy.data.materials[mn])
        uv = me.uv_layers.new(name='Physical metre UV'); scale = .5 if 'tile courses' in name else .25
        for poly in me.polygons:
            axis = max(range(3), key=lambda i: abs(poly.normal[i]))
            for li in poly.loop_indices:
                co = me.vertices[me.loops[li].vertex_index].co
                uv.data[li].uv = ((co.y * scale, co.z * scale) if axis == 0 else (co.x * scale, co.z * scale) if axis == 1 else (co.x * scale, co.y * scale))
        if any(s in name for s in smooth_words):
            for poly in me.polygons: poly.use_smooth = True
    return root
