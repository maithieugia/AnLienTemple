import {test} from 'node:test';import assert from 'node:assert/strict';
import {TOUR_STOPS,nextTourStop,incenseSteps,plantPoint,stopSteps} from '../src/online/TempleTour.ts';
import {INCENSE_SITES,nearIncense} from '../src/online/protocol.ts';
test('incense ritual plants the sticks where the server accepts the offering, then returns and bows',()=>{
 for(const s of INCENSE_SITES){const home={x:s.x+.8,z:s.z+3};const p=plantPoint(s,home);assert.equal(nearIncense({x:p.x,y:s.floor,z:p.z})?.id,s.id,s.id);
  const steps=incenseSteps(s,home);assert.deepEqual(steps.map(t=>'walk' in t?'walk':t.act),['incense','walk','bow','walk','bow']);assert.equal(steps.filter(t=>'offer' in t&&t.offer).length,1);}
});
test('the self-guided round visits every altar and wheel once before starting again',()=>{
 assert.ok(TOUR_STOPS.length>=10);const seen=new Set<string>(),order:string[]=[];let at={x:0,z:680};
 for(let i=0;i<TOUR_STOPS.length;i++){const s=nextTourStop(at,seen);order.push(s.id);at=s;}assert.equal(new Set(order).size,TOUR_STOPS.length);
 const again=nextTourStop(at,seen);assert.ok(TOUR_STOPS.some(s=>s.id===again.id));assert.equal(seen.size,1);
 for(const s of TOUR_STOPS){const steps=stopSteps(s,[{x:s.x,z:s.z}]);assert.ok('walk' in steps[0]);}
});
test('the round also bows to statues, varies the gestures and climbs the stupa by lift',()=>{
 const kinds=new Set(TOUR_STOPS.map(s=>s.kind));for(const k of ['incense','wheel','statue','tower'])assert.ok(kinds.has(k as never),k);
 assert.ok(!TOUR_STOPS.some(s=>s.statue?.group==='avenue'),'no guardian avenue in the public round');
 const tower=TOUR_STOPS.find(s=>s.kind==='tower')!,steps=stopSteps(tower,[{x:tower.x,z:tower.z}]);
 assert.deepEqual(steps.filter(t=>'lift' in t).map(t=>(t as {lift:number}).lift),[17,0]);assert.ok(steps.some(t=>'look' in t));
 const acts=new Set<string>();for(const s of TOUR_STOPS.filter(s=>s.kind==='statue'))for(const t of stopSteps(s,[{x:s.x,z:s.z}]))if('act' in t)acts.add(t.act);
 for(const a of ['kneel','bow','sit'])assert.ok(acts.has(a),a);
 const seen=new Set<string>();let at={x:0,z:680};const order:string[]=[];for(let i=0;i<8;i++){const s=nextTourStop(at,seen);order.push(s.id);at=s;}assert.equal(order[6],'tower');
});
