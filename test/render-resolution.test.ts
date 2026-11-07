import test from 'node:test';import assert from 'node:assert/strict';
import {renderResolution,nextResolution}from '../src/online/RenderResolution.ts';
test('native desktop stays legible under sustained slow rendering and recovers',()=>{
 const {best,worst}=renderResolution(1,1920,1080,false);assert.equal(best,1);assert.equal(worst,1);
 let level=best;for(let i=0;i<100;i++)level=nextResolution(level,15,best,worst);assert.equal(level,1);
});
test('retina pixel budget is bounded and resolution changes are small with a stable band',()=>{
 for(const low of [false,true]){const {best,worst}=renderResolution(3,1920,1080,low);assert.ok(1920/best<=(low?1600:2304)+1);assert.ok(worst/best<=1.251);
 let level=best;for(let i=0;i<100;i++)level=nextResolution(level,20,best,worst);assert.equal(level,worst);assert.equal(nextResolution(level,35,best,worst),level);
 for(let i=0;i<100;i++)level=nextResolution(level,60,best,worst);assert.equal(level,best);}
});
