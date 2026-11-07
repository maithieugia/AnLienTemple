import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const dir=new URL('../public/assets/chars/ready-made/rocketbox/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('SOURCE.json',dir),'utf8'));
for(const file of manifest.files)test('original rig, normalized weights and moving clips: '+file.file,()=>{
 const b=readFileSync(new URL(file.file,dir));assert.equal(createHash('sha256').update(b).digest('hex'),file.sha256);
 assert.equal(b.readUInt32LE(0),0x46546c67);const length=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+length).toString()),base=28+length;
 const components:Record<string,number>={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};
 function values(index:number){const a=j.accessors[index],v=j.bufferViews[a.bufferView],n=components[a.type],bytes=a.componentType===5126?4:a.componentType===5123?2:1,rows:number[][]=[];
  for(let i=0;i<a.count;i++){const row:number[]=[];for(let k=0;k<n;k++){const o=base+(v.byteOffset??0)+(a.byteOffset??0)+i*(v.byteStride??bytes*n)+k*bytes;row.push(a.componentType===5126?b.readFloatLE(o):a.componentType===5123?b.readUInt16LE(o):b.readUInt8(o));}rows.push(row);}return rows;}
 assert.equal(j.skins.length,1);const skin=j.skins[0];assert.equal(skin.joints.length,80);assert.ok(skin.joints.some((n:number)=>j.nodes[n].name.includes('Head')));
 for(const m of j.meshes)for(const p of m.primitives){assert.ok(p.attributes.JOINTS_0!==undefined&&p.attributes.WEIGHTS_0!==undefined);const joints=values(p.attributes.JOINTS_0),weights=values(p.attributes.WEIGHTS_0);
  for(let i=0;i<weights.length;i++){assert.ok(weights[i].every(x=>Number.isFinite(x)&&x>=0&&x<=1.00001));assert.ok(Math.abs(weights[i].reduce((a,x)=>a+x,0)-1)<.001);assert.ok(joints[i].every(x=>x<80));}}
 assert.deepEqual(j.animations.map((a:any)=>a.name).sort(),['Idle','PilgrimRun','PilgrimWalk','Push','Run','Walk']);
 for(const anim of j.animations){const arm=anim.channels.find((c:any)=>j.nodes[c.target.node].name==='Bip01 L UpperArm'&&c.target.path==='rotation');assert.ok(arm);const sampler=anim.samplers[arm.sampler],frames=values(sampler.output),times=values(sampler.input);assert.ok(times.at(-1)![0]>.3);
  assert.ok(frames.every(q=>q.every(Number.isFinite)&&Math.abs(Math.hypot(...q)-1)<.001));
  assert.ok(frames.some(q=>Math.hypot(...q.map((x,i)=>x-frames[0][i]))>.005));
 }
 assert.ok(readFileSync(new URL('LICENSE.md',dir),'utf8').includes('MIT License'));
});
