import test from 'node:test';import assert from 'node:assert/strict';
import {Color3}from '@babylonjs/core/Maths/math.color.js';
import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import * as Babylon from '@babylonjs/core';
const context={exports:{},require:(id:string)=>id==='@babylonjs/core'?Babylon:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/game/world/Buildings.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);const BAcc=(context.exports as any).BAcc;
import {pavedDisc}from '../src/game/world/QuietPaving.ts';
import type{SanctuaryBatch}from '../src/game/world/SanctuaryGeometry.ts';
import type{StandardMaterial}from '@babylonjs/core';
test('round plaza keeps square metre-based UVs across radial joins and faces upward',()=>{
 const a=new BAcc(),batch={acc:()=>a,quad:(_m:unknown,p:number[],q:number[],r:number[],s:number[])=>a.quad(p as [number,number,number],q as [number,number,number],r as [number,number,number],s as [number,number,number],[0,0,1,1],Color3.White())};
 pavedDisc(batch as unknown as SanctuaryBatch,null as unknown as StandardMaterial,0,492,13);
 for(let i=0;i<a.P.length/3;i++){assert.ok(Math.abs(a.UVs[i*2]-a.P[i*3]/2.4)<1e-6);assert.ok(Math.abs(a.UVs[i*2+1]-a.P[i*3+2]/2.4)<1e-6);assert.ok(a.N[i*3+1]>.99);assert.ok(Math.hypot(a.P[i*3],a.P[i*3+2]-492)<=13.000001);}
});
