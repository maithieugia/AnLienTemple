import {NodeIO} from '@gltf-transform/core';
import {weld,simplify,dedup,prune} from '@gltf-transform/functions';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;const io=new NodeIO();const d=await io.read('public/assets/sanctuary/statues/shakyamuni/low.glb');await d.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.15,error:.005}),dedup(),prune());await io.write('public/assets/sanctuary/statues/shakyamuni/gallery-far.glb',d);console.log(d.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((s,p)=>s+p.getIndices().getCount()/3,0));
