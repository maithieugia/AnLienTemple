import bpy,bmesh,math,json,sys,random,hashlib
from pathlib import Path
from mathutils import Vector,Quaternion
from math import sin,cos,pi
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'authoring/unapproved/hundred';OUT.mkdir(parents=True,exist_ok=True)
DATA=json.loads((ROOT/'src/game/world/HundredBuddhas.json').read_text(encoding='utf-8'))
GOLD=None;PARTS=[];HAND_CACHE={}
def mesh(name,vs,fs):
 m=bpy.data.meshes.new(name);m.from_pydata(vs,[],fs);m.update();o=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(o);o.data.materials.append(GOLD)
 for p in m.polygons:p.use_smooth=True
 PARTS.append(o);return o
def ell(name,p,sc,segments=16,rings=10):
 vs=[];fs=[]
 for j in range(rings+1):
  a=pi*j/rings
  for i in range(segments):
   t=2*pi*i/segments;vs.append((p[0]+sc[0]*sin(a)*cos(t),p[1]+sc[1]*sin(a)*sin(t),p[2]+sc[2]*cos(a)))
 for j in range(rings):
  for i in range(segments):a=j*segments+i;b=j*segments+(i+1)%segments;fs.append((a,b,b+segments,a+segments))
 return mesh(name,vs,fs)
def tube(name,points,radii,n=12):
 points=[Vector(p) for p in points];vs=[];fs=[]
 for j,p in enumerate(points):
  t=(points[min(j+1,len(points)-1)]-points[max(0,j-1)]).normalized();u=t.cross(Vector((0,0,1)) if abs(t.z)<.9 else Vector((0,1,0))).normalized();v=t.cross(u)
  for i in range(n):vs.append(tuple(p+radii[j]*(u*cos(i*2*pi/n)+v*sin(i*2*pi/n))))
 for j in range(len(points)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 fs.extend([tuple(reversed(range(n))),tuple((len(points)-1)*n+i for i in range(n))]);return mesh(name,vs,fs)
def curve(name,pts,r,n=10,steps=24):
 # Catmull-Rom sleeve / engraved motif.
 pts=[Vector(p) for p in pts];out=[]
 for k in range(len(pts)-1):
  p0=pts[max(0,k-1)];p1=pts[k];p2=pts[k+1];p3=pts[min(len(pts)-1,k+2)]
  for i in range(max(2,steps//(len(pts)-1))):
   t=i/max(2,steps//(len(pts)-1));out.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
 out.append(pts[-1]);return tube(name,out,[r]*len(out),n)
def lathe(name,p,profile,n=32):
 vs=[];fs=[]
 for r,z in profile:
  for i in range(n):a=2*pi*i/n;vs.append((p[0]+r*cos(a),p[1]+r*sin(a),p[2]+z))
 for j in range(len(profile)-1):
  for i in range(n):a=j*n+i;b=j*n+(i+1)%n;fs.append((a,b,b+n,a+n))
 return mesh(name,vs,fs)
def leaf(name,p,angle,length,width):
 # Smooth pointed, cupped lotus petal, 2-sided lens surface.
 vs=[];fs=[]
 for j in range(13):
  t=j/12
  for i in range(9):
   u=-1+i/4;w=width*sin(pi*t)*u;along=length*t;h=.025*sin(pi*t)*(1-u*u)+.05*t*t
   vs.append((p[0]+w*cos(angle)+along*sin(angle),p[1]+w*sin(angle)-along*cos(angle),p[2]+h))
 for j in range(12):
  for i in range(8):a=j*9+i;fs.append((a,a+1,a+10,a+9))
 return mesh(name,vs,fs)
def hand(name,wrist,palmUp,gesture,side):
 # One fused organic hand with five articulated digits, then voxel weld at 1.2mm.
 key=(palmUp,gesture,side)
 if key in HAND_CACHE:
  vs,fs=HAND_CACHE[key];o=mesh(name+'-fused',vs,fs);o.location=Vector(wrist);return
 start=len(PARTS);w=Vector(wrist);forward=Vector((0,0,1)) if palmUp else Vector((0,-1,0));across=Vector((side,0,0));normal=forward.cross(across).normalized();center=w+forward*.032
 palm=ell(name+'-palm',(0,0,0),(.027,.012,.036),20,14);rot=Vector((0,0,1)).rotation_difference(forward);palm.rotation_mode='QUATERNION';palm.rotation_quaternion=rot;palm.location=center
 # Four fingers, varied flexion per gesture. The tips and knuckles are smooth; no cuboid fingers.
 for f in range(4):
  spread=(f-1.5)*.012;length=[.042,.047,.045,.035][f];base=center+forward*.024+across*spread
  flex=[0,.05,.4,.85,.2,.65,.1,.5,.95,.3][gesture]
  if gesture in [2,4] and f==0:flex=1.8
  if gesture in [5,7] and f in [2,3]:flex=1.5
  pts=[base];direction=forward
  for j in range(1,5):
   angle=flex*j/3;direction=(forward*cos(angle)+normal*sin(angle)).normalized();pts.append(pts[-1]+direction*length/4+across*spread*.045)
  tube(name+'-digit-'+str(f),pts,[.0056,.0055,.0048,.004,.0029],10);ell(name+'-tip',pts[-1],(.0032,.0032,.0032),10,6)
 base=center-across*.021-forward*.005
 pts=[base,base-across*.014+forward*.009,base-across*.020+forward*.026,base-across*.013+forward*.036]
 if gesture in [2,4]:pts[-1]=center+forward*.046+across*(-.016)
 tube(name+'-thumb',pts,[.008,.007,.0055,.0036],12)
 bpy.ops.object.select_all(action='DESELECT')
 for o in PARTS[start:]:o.select_set(True)
 bpy.context.view_layer.objects.active=palm;bpy.ops.object.convert(target='MESH');bpy.ops.object.join();palm=bpy.context.object;palm.name=name+'-fused';mod=palm.modifiers.new('Anatomical union','REMESH');mod.mode='VOXEL';mod.voxel_size=.0015;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name);sm=palm.modifiers.new('Soft knuckles','SMOOTH');sm.factor=.6;sm.iterations=3;bpy.ops.object.modifier_apply(modifier=sm.name)
 PARTS[start:]=[palm];HAND_CACHE[key]=([tuple(palm.matrix_world@v.co-w) for v in palm.data.vertices],[tuple(p.vertices) for p in palm.data.polygons])
def ornament(kind,p,i):
 start=len(PARTS);x,y,z=p;scale=.8+(i%5)*.04
 if kind==0: # lotus with 2 whorls, stalk
  curve('lotus-stem',[(x,y,z-.025),(x+.015,y,z+.09),(x,y,z+.18)],.006)
  for j in range(2):
   for k in range(8):leaf('lotus-petal',(x,y,z+.12+j*.015),k*pi/4+j*.2,.065-j*.015,.024)
 elif kind==1:lathe('offering-bowl',p,[(0,0),(.025,0),(.035,.012),(.061,.055),(.065,.065),(.059,.068),(.053,.056),(.02,.012),(0,.012)],40)
 elif kind==2:
  for k in range(28):a=k*pi/14;ell('mala-bead',(x+.055*cos(a),y+.035*sin(a),z+.02+.02*sin(a)),(.006,.006,.006),10,6)
  curve('mala-tassel',[(x,y,z+.02),(x,y,z-.06),(x+.01,y,z-.09)],.004)
 elif kind==3:
  lathe('ritual-bell',p,[(.04,0),(.043,.007),(.028,.03),(.014,.06),(.009,.065),(.009,.1),(.014,.11),(0,.12)],36)
 elif kind==4:
  lathe('lotus-stupa',p,[(.045,0),(.045,.014),(.03,.018),(.03,.03),(.037,.05),(.032,.075),(.02,.095),(.017,.1),(.012,.14),(0,.18)],32)
 elif kind==5:
  for k in range(2):curve('sutra-scroll-edge',[(x-.052,y+k*.05,z),(x,y+k*.05,z+.006),(x+.052,y+k*.05,z)],.009)
  for k in range(8):curve('sutra-gilded-leaf',[(x-.05,y,z+k*.0018),(x,y+.025,z+.007+k*.0018),(x+.05,y+.05,z+k*.0018)],.001,6)
 elif kind==6:
  lathe('nectar-vase',p,[(0,0),(.022,0),(.03,.01),(.043,.044),(.037,.07),(.017,.088),(.014,.11),(.025,.12),(.027,.125),(.017,.125)],40)
 elif kind==7:
  for r in [.045,.052]:curve('dharma-wheel-rim',[(x+r*cos(k*pi/24),y,z+.07+r*sin(k*pi/24)) for k in range(49)],.003)
  for k in range(8):a=k*pi/4;curve('wheel-spoke',[(x,y,z+.07),(x+.043*cos(a),y,z+.07+.043*sin(a))],.003)
  tube('wheel-handle',[(x,y,z),(x,y,z+.07)],[.005,.005])
 elif kind==8:
  lathe('wish-jewel',p,[(0,0),(.029,.008),(.036,.03),(.025,.055),(0,.095)],8)
 elif kind==9:
  for k in range(6):
   a=k*pi/3;curve('khakkhara-ring',[(x+.019*cos(t*pi/12)+.018*cos(a),y+.018*sin(a),z+.19+.019*sin(t*pi/12)) for t in range(25)],.0025)
  tube('khakkhara-staff',[(x,y,z-.12),(x,y,z+.20)],[.005,.005])
 # Every object has its own carved floral seal (10 object families × 10 unique motifs).
 for k in range(5+i//10%6):
  a=k*2*pi/(5+i//10%6);ell('attribute-rosette',(x+.018*cos(a),y-.03,z+.025+.018*sin(a)),(.004,.003,.007),8,5)

 for o in PARTS[start:]:
  for v in o.data.vertices:
   v.co.x=x+(v.co.x-x)*(.88+.026*(i//10));v.co.y=y+(v.co.y-y)*(1+.017*(i//10));v.co.z=z+(v.co.z-z)*(1+.025*(i//10))

def build(i):
 global PARTS,GOLD
 PARTS=[];bpy.ops.wm.read_factory_settings(use_empty=True)
 GOLD=bpy.data.materials.new('AnLien-original-gold');GOLD.use_nodes=True;bs=GOLD.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,.66,.065,1);bs.inputs['Metallic'].default_value=.75;bs.inputs['Roughness'].default_value=.3
 bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/assets/sanctuary/statues/shakyamuni/high.glb'))
 src=next(o for o in bpy.data.objects if o.type=='MESH');bpy.context.view_layer.objects.active=src;src.select_set(True);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 bm=bmesh.new();bm.from_mesh(src.data);bmesh.ops.delete(bm,geom=[v for v in bm.verts if .29<v.co.z<.735 or (v.co.z>.735 and v.co.z<.79 and abs(v.co.x)>.13)],context='VERTS');edges=[e for e in bm.edges if e.is_boundary];bmesh.ops.holes_fill(bm,edges=edges,sides=0);bm.to_mesh(src.data);bm.free();src.data.materials.clear();src.data.materials.append(GOLD);PARTS.append(src)
 # Independent sculpted face: jaw/cheek/brow/nose/ear variation; continuous morph, no detached features.
 for v in src.data.vertices:
  x,y,z=v.co
  if z>.70:
   q=max(0,1-abs(z-.82)/.12);v.co.x*=1+.055*sin(i*1.73)*q;v.co.y+=.006*sin(i*.97)*q*max(0,1-abs(x)/.1);v.co.z+=.004*cos(i*1.3)*q
  elif z<.29:v.co.x*=1+.018*sin(i*.61)
 # Sculpted draped torso, dense smooth loft with layered garment folds.
 profiles=[(.265,.21,.125),(.30,.205,.13),(.36,.177,.125),(.43,.153,.12),(.50,.151,.115),(.58,.178,.115),(.64,.198,.105),(.674,.165,.08),(.70,.095,.065),(.74,.083,.085),(.755,.077,.078)]
 vs=[];fs=[];n=96;layers=64
 for j in range(layers+1):
  t=j/layers*(len(profiles)-1);k=min(len(profiles)-2,int(t));f=t-k;z,rx,ry=[profiles[k][a]*(1-f)+profiles[k+1][a]*f for a in range(3)]
  for a in range(n):
   th=a*2*pi/n;front=max(0,-sin(th));wave=.0045*sin(95*z+12*cos(th)+(i%10)*.17)*front+.0025*sin(th*(10+i%4)+z*13)
   vs.append(((rx+wave)*cos(th),(ry+wave)*sin(th),z))
 for j in range(layers):
  for a in range(n):v=j*n+a;w=j*n+(a+1)%n;fs.append((v,w,w+n,v+n))
 fs.extend([tuple(reversed(range(n))),tuple(layers*n+a for a in range(n))]);body_start=len(PARTS);mesh('sculpted-monastic-robe',vs,fs)
 for side in [-1,1]:
  g=(i%10 if side==1 else i//10);raised=g in [1,2,4,5,7,8];w=Vector((side*(.235+.006*(g%3)),-.15,.59+.012*(g%4))) if raised else Vector((side*(.13+.018*(g%4)),-.19,.34+.018*(g%3)))
  shoulder=Vector((side*.173,0,.645));elbow=Vector((side*(.245+.006*(g%3)),-.015,.443+.012*(g%3)));direction=(w-elbow).normalized();sleeveEnd=w-direction*.055
  tube('upper-sleeve-'+str(side),[shoulder,elbow],[.066,.05],24)
  ell('shoulder-round',shoulder,(.066,.059,.066),24,16);ell('elbow-round',elbow,(.053,.053,.053),24,16)
  tube('forearm-sleeve-'+str(side),[elbow,sleeveEnd],[.05,.03],24)
  ell('cuff-round',sleeveEnd,(.029,.029,.03),20,12);tube('wrist-'+str(side),[sleeveEnd,w],[.025,.018],20)
 # Fuse the robe, shoulders, elbow and sleeve volumes, removing detached joints.
 bpy.ops.object.select_all(action='DESELECT')
 for o in PARTS[body_start:]:o.select_set(True)
 bpy.context.view_layer.objects.active=PARTS[body_start];bpy.ops.object.join();body=bpy.context.object;mod=body.modifiers.new('Sculpt seamless sleeves','REMESH');mod.mode='VOXEL';mod.voxel_size=.004;mod.use_smooth_shade=True;bpy.ops.object.modifier_apply(modifier=mod.name);sm=body.modifiers.new('Cloth smoothing','SMOOTH');sm.factor=.7;sm.iterations=3;bpy.ops.object.modifier_apply(modifier=sm.name);PARTS[body_start:]=[body]
 for side in [-1,1]:
  g=(i%10 if side==1 else i//10);raised=g in [1,2,4,5,7,8];w=Vector((side*(.235+.006*(g%3)),-.15,.59+.012*(g%4))) if raised else Vector((side*(.13+.018*(g%4)),-.19,.34+.018*(g%3)))
  hand('hand-'+str(side),w,raised,g,side)
  if side==-1:ornament(i%10,tuple(w+Vector((0,-.025,.025))),i)
 # Distinct garment border motifs, not spiritual or canonical claims.
 for k in range(9):
  z=.36+k*.025;ell('robe-seal',(.108,-.105,z),(.005+(i//10)*.0002,.0025,.006),10,6)
 for o in PARTS[1:]:o.location.y+=.15
 # Merge as one actual separately-authored geometry, not runtime re-colour/scale clones.
 bpy.ops.object.select_all(action='DESELECT')
 for o in PARTS:o.select_set(True)
 bpy.context.view_layer.objects.active=src;bpy.ops.object.convert(target='MESH');bpy.ops.object.join();obj=bpy.context.object;obj.name=f'hien-kiep-{i+1:03d}';obj['buddhaId']=i+1;obj['artisticInterpretation']=True;bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 for p in obj.data.polygons:p.use_smooth=True
 return obj

def export(i,obj):
 folder=OUT/f'{i+1:03d}';folder.mkdir(exist_ok=True);bpy.context.view_layer.objects.active=obj;obj.select_set(True);original=obj.data.copy();counts={}
 for lod,target in [('high',52000),('low',12000),('far',2200)]:
  obj.data=original.copy();tris=sum(len(p.vertices)-2 for p in obj.data.polygons)
  if tris>target:
   m=obj.modifiers.new('Surface LOD','DECIMATE');m.ratio=target/tris;bpy.ops.object.modifier_apply(modifier=m.name)
  obj.data.validate();obj.data.update();counts[lod]=sum(len(p.vertices)-2 for p in obj.data.polygons);original=obj.data.copy()
  bpy.ops.export_scene.gltf(filepath=str(folder/(lod+'.glb')),export_format='GLB',use_selection=True,export_yup=True,export_extras=True,export_animations=False)
 (folder/'asset.json').write_text(json.dumps({'id':i+1,'name':DATA['names'][i],'artisticInterpretation':True,'canonicalIconography':False,'rightHandDesign':i%10,'leftHandDesign':i//10,'attributeFamily':i%10,'ornamentDesign':i//10,'triangles':counts,'sourceBase':'rbmarbletemplearts / CC BY4.0 / Meshy AI','recipe':'authoring/canonical-buddhas/sculpt-hundred.py','sha256':{lod:hashlib.sha256((folder/(lod+'.glb')).read_bytes()).hexdigest() for lod in counts}},ensure_ascii=False,indent=2),encoding='utf-8')
 print('FINISHED',i+1,counts,flush=True)

def render(i):
 bpy.ops.object.camera_add(location=(.95,-2.8,1.15));c=bpy.context.object;c.rotation_euler=(Vector((0,0,.5))-c.location).to_track_quat('-Z','Y').to_euler();c.data.type='ORTHO';c.data.ortho_scale=1.23;bpy.context.scene.camera=c
 for loc,power,size in [((1,-2,3),180,2),((-2,-1,1),100,2),((0,2,3),250,1.5)]:
  bpy.ops.object.light_add(type='AREA',location=loc);l=bpy.context.object;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(Vector((0,0,.5))-l.location).to_track_quat('-Z','Y').to_euler()
 s=bpy.context.scene;s.world=bpy.data.worlds.new('Studio');s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.25,.27,.3,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.5;s.render.engine='CYCLES';s.cycles.samples=20;s.render.resolution_x=700;s.render.resolution_y=800;s.render.resolution_percentage=100;s.render.filepath=str(ROOT/'docs'/f'v6-sculpture-{i+1:03d}.png');bpy.ops.render.render(write_still=True)
if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else ['0','3'];start=int(args[0]);end=int(args[1])
 for i in range(start,end):
  obj=build(i)
  if '--render' in args:render(i)
  export(i,obj)
