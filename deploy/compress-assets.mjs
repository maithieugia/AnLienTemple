/**
 * Compress every .glb in a PUBLIC BUILD folder (never the sources in public/, which Codex and the tests use as-is).
 *   node deploy/compress-assets.mjs dist-public [--only <substring>]
 *
 * Per model: dedup + prune, normals/UVs/tangents quantized (POSITION, JOINTS, WEIGHTS stay float/unchanged because
 * game code reads vertex positions: RoofLift, crowd and character fitting), vertex/index buffers EXT_meshopt_compression,
 * textures resized (high ≤2048 px, low/far ≤1024 px) and re-encoded as WebP (EXT_texture_webp).
 * Already-compressed files are skipped, so running twice is harmless. Writes deploy/compress-report.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import {NodeIO,PropertyType} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {dedup,prune,quantize,reorder,textureCompress,resample} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import sharp from 'sharp';

const root=process.argv[2];if(!root||!fs.existsSync(root)){console.error('usage: node deploy/compress-assets.mjs <build-folder> [--only text]');process.exit(1);}
const only=process.argv.includes('--only')?process.argv[process.argv.indexOf('--only')+1]:'';
await MeshoptEncoder.ready;await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f),s=fs.statSync(p);if(s.isDirectory())walk(p);else if(f.toLowerCase().endsWith('.glb')&&(!only||p.includes(only)))files.push(p);}})(root);
const report=[];let before=0,after=0;const t0=Date.now();
for(const [i,file] of files.entries()){
 const size=fs.statSync(file).size;before+=size;
 try{
  const doc=await io.read(file),used=doc.getRoot().listExtensionsUsed().map(e=>e.extensionName);
  if(used.includes('EXT_meshopt_compression')){after+=size;report.push({file,size,out:size,skipped:'already compressed'});continue;}
  const small=/(^|[\\/_-])(low|far)[^\\/]*\.glb$/i.test(file);
  await doc.transform(
   // keep materials, nodes and attributes the game looks up by name or reads directly
   dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.MESH,PropertyType.TEXTURE]}),prune({keepLeaves:true,keepAttributes:true,keepIndices:true}),resample(),
   quantize({pattern:/^(NORMAL|TANGENT|TEXCOORD_\d+)$/,quantizeNormal:10,quantizeTexcoord:14}),
   textureCompress({encoder:sharp,targetFormat:'webp',resize:small?[1024,1024]:[2048,2048],quality:82}),
   reorder({encoder:MeshoptEncoder,target:'size'}),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  const tmp=file+'.tmp.glb';await io.write(tmp,doc);
  const out=fs.statSync(tmp).size;
  if(out<size*.97){fs.renameSync(tmp,file);after+=out;report.push({file,size,out});}else{fs.rmSync(tmp);after+=size;report.push({file,size,out:size,skipped:'no gain'});}
 }catch(e){after+=size;report.push({file,size,out:size,error:String(e).slice(0,200)});}
 if(i%20===19)console.log(`${i+1}/${files.length} · ${(before/1e6).toFixed(0)} → ${(after/1e6).toFixed(0)} MB · ${Math.round((Date.now()-t0)/1000)}s`);
}
fs.writeFileSync('deploy/compress-report.json',JSON.stringify({before,after,files:report.map(r=>({...r,file:path.relative(root,r.file).replace(/\\/g,'/')}))},null,1));
const errs=report.filter(r=>r.error);
console.log(`DONE ${files.length} models · ${(before/1e6).toFixed(1)} MB → ${(after/1e6).toFixed(1)} MB · errors ${errs.length}`);
for(const e of errs.slice(0,8))console.log('ERR',path.relative(root,e.file),e.error);
