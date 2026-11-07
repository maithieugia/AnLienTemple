// Dev-only preview of the player walk/run (not in the public build): ?plain=1 shows the stock clips for comparison.
import {Engine,Scene,ArcRotateCamera,Vector3,HemisphericLight,DirectionalLight,MeshBuilder,Color4,AnimationGroupMask,AnimationGroupMaskMode} from '@babylonjs/core';
import {RocketboxPlayer,RocketboxPlayerLibrary} from './game/chars/RocketboxPlayer';
const canvas=document.querySelector('canvas')!,engine=new Engine(canvas,true),scene=new Scene(engine);scene.clearColor=new Color4(.85,.83,.79,1);
const cam=new ArcRotateCamera('c',Math.PI/2,1.42,9.5,new Vector3(0,.95,0),scene);cam.attachControl(canvas,true);
new HemisphericLight('h',new Vector3(0,1,0),scene).intensity=.9;const sun=new DirectionalLight('d',new Vector3(-.4,-1,-.3),scene);sun.intensity=1.4;
MeshBuilder.CreateGround('g',{width:40,height:40},scene);
const plain=new URLSearchParams(location.search).has('plain');RocketboxPlayer.clips=new URLSearchParams(location.search).get('clips')==='pilgrim'?'pilgrim':'native';
const lib=new RocketboxPlayerLibrary(scene);await lib.load();
const people:[RocketboxPlayer,'walk'|'run'][]=[];
(new URLSearchParams(location.search).has('nam01')?(new URLSearchParams(location.search).get('acts')??'idle,walk,run,bow').split(',').map((a,i,all)=>[false,new URLSearchParams(location.search).get('outfit')??'nam-01',a,(i-(all.length-1)/2)*1.6]):[[false,'aolam','walk',-3],[false,'aolam','run',-1],[true,'aodai-03','walk',1],[true,'aodai-03','run',3]]).forEach(([female,outfit,act,z],i)=>{
 const p=new RocketboxPlayer(lib,scene,100+i,(act==='walk'?'Đi ':'Chạy ')+(female?'· nữ':'· nam'),female as boolean,false,outfit as string);
 if(plain){(p as unknown as {upright?:unknown}).upright=undefined;for(const g of p.rig.entries.animationGroups)g.mask=null as unknown as AnimationGroupMask;}
 const front=new URLSearchParams(location.search).has('front');p.place(z as number*1.2,0,0,front?0:Math.PI/2+.35);p.setAct(act as 'walk');people.push([p,act as 'walk'|'run']);});
void AnimationGroupMaskMode;
engine.runRenderLoop(()=>{const dt=Math.min(.05,engine.getDeltaTime()/1000);for(const [p]of people)p.update(dt);scene.render();});
(window as unknown as {__ready:boolean}).__ready=true;
