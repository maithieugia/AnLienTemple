// Dev page: pilgrims in every pose on a plain floor (no temple), for fast visual checks of robe, name tag and IK poses.
import {Engine,Scene,ArcRotateCamera,HemisphericLight,DirectionalLight,Vector3,Color3,Color4,MeshBuilder,StandardMaterial} from '@babylonjs/core';
import {CharacterLibrary} from './game/chars/CharacterLibrary';
import {RiggedMonkLibrary} from './game/chars/RiggedMonk';
import {Pilgrim} from './online/Pilgrim';
import type {Act} from './online/protocol';
const canvas=document.querySelector('canvas')!,engine=new Engine(canvas,true,{preserveDrawingBuffer:true}),scene=new Scene(engine);scene.clearColor=new Color4(.62,.7,.74,1);
const q=new URLSearchParams(location.search);
const cam=new ArcRotateCamera('c',Math.PI/2+Number(q.get('turn')??0),Number(q.get('beta')??1.32),Number(q.get('r')??9),new Vector3(0,.9,0),scene);cam.attachControl(canvas,true);
new HemisphericLight('h',new Vector3(0,1,.2),scene).intensity=.85;const sun=new DirectionalLight('s',new Vector3(-.4,-1,-.6),scene);sun.intensity=.9;
const floor=MeshBuilder.CreateGround('g',{width:30,height:30},scene),fm=new StandardMaterial('f',scene);fm.diffuseColor=new Color3(.55,.52,.46);floor.material=fm;
const poses:[Act,string,boolean][]=[['idle','Đứng',false],['walk','Đi',true],['sit','Thiền',false],['kneel','Quỳ',true],['bow','Lạy',false],['wheel','Đẩy kinh luân',true]];
const only=q.get('pose') as Act|null;
(async()=>{const lib=q.has('monk')?new RiggedMonkLibrary(scene):new CharacterLibrary(scene,true);await lib.load();
 const list=poses.map(([a,n,f],i)=>{const p=new Pilgrim(lib,scene,i,n,f,i===0);p.rig.root.metadata={h:q.has('monk')?1.584:f?1.6:1.7};p.place(-5+i*2,0,0,Math.PI*Number(q.get('face')??0));p.setAct(only??a);return p;});
 if(q.has('t'))for(const p of list)p.update(Number(q.get('t')));
 let last=performance.now();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=q.has('freeze')?0:Math.min(.05,(now-last)/1000);last=now;for(const p of list)p.update(dt);});
 (window as any).__pil=list;(window as any).__pilgrimsReady=true;})();
engine.runRenderLoop(()=>scene.render());window.addEventListener('resize',()=>engine.resize());
