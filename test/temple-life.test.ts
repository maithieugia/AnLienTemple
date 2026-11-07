import {test} from 'node:test';import assert from 'node:assert/strict';
import {lifeStop,lifeDwell,lifeRoute,LIFE_STOPS,LIFE_WALK_SPEED} from '../src/game/chars/TempleLifePlan.ts';
import {LAY_SEATS} from '../src/game/chars/LayAssemblyPlan.ts';
import {listeningSeat} from '../src/game/chars/ListeningSeatPlan.ts';
import {sanctuaryFrontSteps} from '../src/game/world/SanctuaryPlan.ts';
import {addObstacle,clearObstacles,resolveCircle,supportHeight} from '../src/game/world/Obstacles.ts';
import {TEMPLE_RESIDENT_COUNT,initialCrowdStop,porchCircuit,circuitLength,circuitAt} from '../src/game/chars/TempleLifePlan.ts';
test('500 distinct initial places and full veranda circuits without U-turns',()=>{
 assert.equal(TEMPLE_RESIDENT_COUNT,500);const places=Array.from({length:500},(_,i)=>initialCrowdStop(i));assert.equal(new Set(places.map(p=>p.id)).size,500);assert.equal(places.filter(p=>p.act==='stroll').length,120);
 for(const lane of [0,1]){const route=porchCircuit(lane),length=circuitLength(route);assert.ok(length>2000);assert.deepEqual(circuitAt(0,lane),circuitAt(length,lane));let previous=circuitAt(0,lane);for(let d=1;d<length;d++){const p=circuitAt(d,lane);assert.ok(Math.hypot(p.x-previous.x,p.z-previous.z)<=1.001);assert.ok(Math.abs(p.x)>300||Math.abs(p.z)>200,'route stays outside the hall walls');const turn=Math.abs(Math.atan2(Math.sin(p.yaw-previous.yaw),Math.cos(p.yaw-previous.yaw)));assert.ok(turn<Math.PI/2,'corner never reverses direction');previous=p;}}
});
test('independent residents cover every activity with 5–10 minute stays and walking only',()=>{
 assert.equal(LIFE_WALK_SPEED,1.35);const initial=new Set();
 for(let person=0;person<10;person++){initial.add(lifeStop(person,0).id);const activities=new Set();for(let visit=0;visit<40;visit++){const stop=lifeStop(person,visit);activities.add(stop.act);assert.ok(lifeDwell(person,visit)>=300&&lifeDwell(person,visit)<=600);assert.notEqual(stop.id,lifeStop(person,visit+1).id);}assert.deepEqual([...activities].sort(),['bow','listen','meditate','stroll','wheel']);}
 assert.equal(initial.size,10);assert.equal(new Set(Array.from({length:10},(_,i)=>lifeDwell(i,0))).size,10);
 for(const s of LIFE_STOPS.filter(s=>s.act==='listen'||('row'in s)))assert.ok(LAY_SEATS.some(p=>p.x===s.x&&p.z===s.z),'hall actor aligns with an existing pad');
});
test('routes go around obstacles and never fall back to a straight line through walls',()=>{
 const clear=(a:{x:number;z:number},b:{x:number;z:number})=>{for(let t=0;t<=1;t+=.01){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(x>6&&x<14&&z>90&&z<110)return false;}return true;};
 const start={x:0,z:100},end={x:20,z:100},path=lifeRoute(start,end,clear);assert.ok(path.length>1);assert.deepEqual(path.at(-1),end);let prev=start;for(const p of path){assert.ok(clear(prev,p));prev=p;}assert.deepEqual(lifeRoute(start,end,()=>false),[]);
});
test('all five entrance stairs let a pedestrian climb from court to veranda without a height jump',()=>{
 clearObstacles();for(const s of sanctuaryFrontSteps())addObstacle(s);addObstacle({cx:0,cz:0,hx:338,hz:238,base:0,h:1.2,yaw:0,sight:true,climb:true,surface:true});
 for(const x of [-240,-120,0,120,240]){let y=0;for(let z=242;z>=235;z-=.06){const[r,s]=resolveCircle(x,z,.3,y,1.8);assert.ok(Math.hypot(r-x,s-z)<.001,'steps do not block');const h=Math.max(0,supportHeight(x,z,y));assert.ok(h-y<=.301);y=h;}assert.ok(Math.abs(y-1.2)<.001);}clearObstacles();
});
test('listen action uses the selected cushion centre and refuses occupied or remote cushions',()=>{
 for(const id of [0,80,749,1499]){const s=LAY_SEATS[id],result=listeningSeat(id,{x:s.x+1,y:1.2,z:s.z},()=>false);assert.equal(result.ok,true);if(result.ok)assert.deepEqual(result.position,{x:s.x,y:1.345,z:s.z,yaw:Math.PI});assert.equal(listeningSeat(id,{...s,y:1.2},()=>true).ok,false);assert.equal(listeningSeat(id,{x:s.x+4,y:1.2,z:s.z},()=>false).ok,false);assert.equal(listeningSeat(id,{...s,y:51.65},()=>false).ok,false);}
});
