"""Poly Haven tree_small_02 (Rico Cilliers, CC0) -> browser LODs; metres, height=1."""
import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
src=root/'authoring/tree-small-02/tree.gltf'
out=root/'public/assets/garden/tree-small-02';out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(src))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
coords=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
lo=Vector(tuple(min(c[i] for c in coords) for i in range(3)));hi=Vector(tuple(max(c[i] for c in coords) for i in range(3)))
height=hi.z-lo.z;center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
for o in meshes:
    mat=o.matrix_world.copy()
    for v in o.data.vertices:v.co=(mat@v.co-center)/height
    o.matrix_world.identity()
    for poly in o.data.polygons:poly.use_smooth=True
for m in bpy.data.materials:
    if m.use_nodes:
        p=m.node_tree.nodes.get('Principled BSDF')
        if p:p.inputs['Roughness'].default_value=.7
        m.use_backface_culling=False
stats={}
for lod,ratio in [('high',.105),('low',.025)]:
    modifiers=[]
    for o in meshes:
        m=o.modifiers.new('garden-distance-LOD','DECIMATE');m.ratio=ratio;modifiers.append((o,m))
    if lod=='low':
        for im in bpy.data.images:
            if im.size[0]>1024:im.scale(1024,1024)
    bpy.ops.export_scene.gltf(filepath=str(out/(lod+'.glb')),export_format='GLB',export_apply=True,export_yup=True,export_cameras=False,export_lights=False)
    triangles=sum(len(o.evaluated_get(bpy.context.evaluated_depsgraph_get()).to_mesh().polygons) for o in meshes)
    data=(out/(lod+'.glb')).read_bytes();stats[lod]={'triangles':triangles,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
    for o,m in modifiers:o.modifiers.remove(m)
(out/'asset.json').write_text(json.dumps({'source':'https://polyhaven.com/a/tree_small_02','author':'Rico Cilliers','license':'CC0','originalHeightMetres':height,'normalizedHeight':1,'lods':stats},indent=2))
print('GARDEN_TREE_OK',stats)
