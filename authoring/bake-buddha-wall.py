"""Bake a real CC0 museum scan into a framed gold bas-relief. No AI image or drawn Buddha."""
import json,struct,hashlib,math
from pathlib import Path
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1]
src=R/'public/assets/sanctuary/statues/buddha/high.glb'
out=R/'public/assets/sanctuary/wall-buddha-relief';out.mkdir(parents=True,exist_ok=True)
b=src.read_bytes();length=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+length]);binary=20+length+8
def accessor(i):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];n={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']];typ={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']];dt=np.dtype(typ);offset=binary+v.get('byteOffset',0)+a.get('byteOffset',0)
 return np.ndarray((a['count'],n),dtype=dt,buffer=b,offset=offset,strides=(v.get('byteStride',dt.itemsize*n),dt.itemsize)).copy()
def transform(node):
 if 'matrix'in node:return np.array(node['matrix']).reshape(4,4).T
 x,y,z,w=node.get('rotation',[0,0,0,1]);m=np.eye(4);m[:3,:3]=np.array([[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w],[2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w],[2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y]])@np.diag(node.get('scale',[1,1,1]));m[:3,3]=node.get('translation',[0,0,0]);return m
parts=[]
def visit(i,parent):
 node=j['nodes'][i];world=parent@transform(node)
 if 'mesh'in node:
  for q in j['meshes'][node['mesh']]['primitives']:
   p=accessor(q['attributes']['POSITION']);p=(world@np.column_stack((p,np.ones(len(p)))).T).T[:,:3];parts.append((p,accessor(q['indices']).reshape(-1,3)))
 for c in node.get('children',[]):visit(c,world)
for i in j['scenes'][j.get('scene',0)]['nodes']:visit(i,np.eye(4))
P=np.concatenate([p for p,_ in parts]);lo=P.min(0);hi=P.max(0);height=hi[1]-lo[1]
N=1024;depth=np.full((N,N),-np.inf,dtype=np.float32)
for p,tri in parts:
 # Front checked against the scan: original +Z has the face; -Z is the back.
 x=((p[:,0]-(lo[0]+hi[0])/2)/height*.78+.5)*(N-1);y=(.88-(p[:,1]-lo[1])/height*.76)*(N-1);z=p[:,2]
 for t in tri:
  xx=x[t];yy=y[t];zz=z[t];x0=max(0,int(np.floor(xx.min())));x1=min(N-1,int(np.ceil(xx.max())));y0=max(0,int(np.floor(yy.min())));y1=min(N-1,int(np.ceil(yy.max())))
  if x1<x0 or y1<y0:continue
  den=(yy[1]-yy[2])*(xx[0]-xx[2])+(xx[2]-xx[1])*(yy[0]-yy[2])
  if abs(den)<1e-8:continue
  X,Y=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
  a=((yy[1]-yy[2])*(X-xx[2])+(xx[2]-xx[1])*(Y-yy[2]))/den;c=((yy[2]-yy[0])*(X-xx[2])+(xx[0]-xx[2])*(Y-yy[2]))/den;d=1-a-c;inside=(a>=0)&(c>=0)&(d>=0);Z=a*zz[0]+c*zz[1]+d*zz[2];view=depth[y0:y1+1,x0:x1+1];np.maximum(view,np.where(inside,Z,-np.inf),out=view)
mask=np.isfinite(depth);near=depth[mask];D=np.zeros_like(depth);D[mask]=.055+.20*(near-near.min())/max(.001,float(near.max()-near.min()))
# Moulded square frame and a recessed metallic field, measured in metres for a 5 m tile.
Y,X=np.mgrid[0:N,0:N]/(N-1);edge=np.minimum.reduce([X,1-X,Y,1-Y]);frame=np.zeros_like(D)
for center,width,rise in [(.018,.012,.12),(.045,.013,.08),(.074,.008,.038)]:frame=np.maximum(frame,rise*np.clip(1-np.abs(edge-center)/width,0,1))
D=np.maximum(D,frame+.008);dx=np.gradient(D,axis=1)/(5/(N-1));dy=np.gradient(D,axis=0)/(5/(N-1));normal=np.stack([-dx,dy,np.ones_like(D)],axis=-1);normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
Image.fromarray(np.uint8(np.clip((normal*.5+.5)*255,0,255))).save(out/'normal.png')
ao=np.clip(1-1.4*np.maximum(0,np.gradient(dx,axis=1)-np.gradient(dy,axis=0)),.6,1);grain=.98+.02*np.sin(X*1900)*np.sin(Y*1770)
color=np.empty((N,N,3));color[:]=[106,70,23];color[mask]=[207,157,62];color[edge<.09]=[198,146,48];color*=ao[:,:,None]*grain[:,:,None]
Image.fromarray(np.uint8(np.clip(color,0,255))).save(out/'albedo.png')
Image.fromarray(np.uint16(np.clip(D/.32,0,1)*65535)).save(out/'height.png')
# Mesh samples come from the same bake as the normal/albedo maps; no mismatched picture on a proxy.
for steps in [32,64,128]:
 grid=[]
 for r in range(steps+1):
  yy=(1-r/steps)*(N-1);y0=int(yy);y1=min(N-1,y0+1);fy=yy-y0
  for c in range(steps+1):
   xx=c/steps*(N-1);x0=int(xx);x1=min(N-1,x0+1);fx=xx-x0;v=D[y0,x0]*(1-fx)*(1-fy)+D[y0,x1]*fx*(1-fy)+D[y1,x0]*(1-fx)*fy+D[y1,x1]*fx*fy;grid.append(round(float(v),6))
 (out/f'grid-{steps}.json').write_text(json.dumps({'steps':steps,'size':5,'heights':grid},separators=(',',':')))
preview=np.clip(color*(.35+.65*np.clip(normal@np.array([-.35,.6,.72]),0,1))[:,:,None],0,255);Image.fromarray(np.uint8(preview)).save(out/'preview.png')
source={'title':'Bronze Seated Buddha, 10th C CE, Thailand','creator':'Minneapolis Institute of Art','license':'CC0','url':'https://sketchfab.com/3d-models/10th-c-ce-thai-seated-buddha-black-background-31857e30bf9249f788aed2dfe5eb6673','museum':'https://collections.artsmia.org/art/1753/seated-buddha-thailand','sourceSha256':hashlib.sha256(b).hexdigest(),'changes':'Orthographic depth bake from original scan; flattened bas-relief, gold finish, square moulding by An Lien. Not a photograph of an original gold tile.','resolution':N,'date':'2026-10-31'}
(out/'SOURCE.json').write_text(json.dumps(source,indent=2));(out/'CREDITS.md').write_text('Buddha scan: Minneapolis Institute of Art, CC0.\n'+source['url']+'\nGold bas-relief adaptation and frame: An Lien. Original scan unchanged.\n')
print('BAKED',len(P),'vertices',int(mask.sum()),'figure pixels',out)
