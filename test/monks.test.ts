import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MONK_PROFILES} from '../src/game/chars/MonkPlan.ts';
import {STUPA,towerRoofRadius} from '../src/game/world/StupaPlan.ts';
test('ten identifiable fictional monks with bounded proportions and temple roles',()=>{assert.equal(MONK_PROFILES.length,10);assert.equal(new Set(MONK_PROFILES.map(p=>p.id)).size,10);assert.equal(new Set(MONK_PROFILES.map(p=>p.role)).size,10);for(const p of MONK_PROFILES){assert.ok(p.height>=1.5&&p.height<=1.9);assert.match(p.robe,/^#[0-9a-f]{6}$/i);assert.match(p.sash,/^#[0-9a-f]{6}$/i);}});
test('continuous human authoring surface has valid joint weights and packaged facial textures',()=>{const a=JSON.parse(readFileSync(new URL('../public/assets/chars/minh-v2.json',import.meta.url),'utf8'));for(const part of ['skin','shirtLong','pantsLong']){const p=a[part],n=p.positions.length/3;assert.equal(p.joints.length,n*4);assert.equal(p.weights.length,n*4);for(let i=0;i<n;i++){const w=p.weights.slice(i*4,i*4+4);assert.ok(Math.abs(w.reduce((x:number,y:number)=>x+y,0)-1)<.002);}assert.ok(p.joints.every((j:number)=>j>=0&&j<a.boneNames.length));}for(const f of ['thay-sau-skin-high.jpg','thay-sau-skin-low.jpg','minh-brown-eye.png'])assert.ok(readFileSync(new URL('../public/assets/chars/'+f,import.meta.url)).length>100);});
test('tower is beside the front terrace, its largest eave clears the campus boundary',()=>{assert.ok(STUPA.x-towerRoofRadius(0)>395);assert.ok(STUPA.z>=230&&STUPA.z<=248);assert.ok(STUPA.x+60<700);});
