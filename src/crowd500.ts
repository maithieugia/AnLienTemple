import {Engine,Scene,ArcRotateCamera,Vector3,HemisphericLight,DirectionalLight,MeshBuilder,StandardMaterial,Color3,Color4} from '@babylonjs/core';
import {TempleLife500 as TempleLife} from './game/chars/TempleLife500';
import {addObstacle} from './game/world/Obstacles';
const canvas=document.querySelector('canvas')!,engine=new Engine(canvas,true);engine.setHardwareScalingLevel(1);
const scene=new Scene(engine);scene.clearColor=new Color4(.15,.20,.19,1);
const camera=new ArcRotateCamera('view',-Math.PI/2,1.25,28,new Vector3(10,1.4,210),scene);camera.attachControl(canvas,true);camera.minZ=.1;camera.maxZ=3000;camera.wheelPrecision=12;
new HemisphericLight('sky',Vector3.Up(),scene).intensity=.8;new DirectionalLight('sun',new Vector3(.5,-1,.6),scene).intensity=.8;
const floor=MeshBuilder.CreateBox('veranda',{width:676,depth:476,height:1.2},scene);floor.position.y=.6;const mat=new StandardMaterial('stone',scene);mat.diffuseColor=Color3.FromHexString('#b6b9ac');floor.material=mat;
addObstacle({cx:0,cz:0,hx:338,hz:238,base:0,h:1.2,yaw:0,sight:true,climb:true,surface:true});
const ground=MeshBuilder.CreateGround('court',{width:1000,height:1000},scene);const court=new StandardMaterial('court',scene);court.diffuseColor=Color3.FromHexString('#667c68');ground.material=court;
const life=new TempleLife(scene,()=>{});void life.load();
document.querySelector('#porch')!.addEventListener('click',()=>{camera.setTarget(new Vector3(0,2,210));camera.radius=25;camera.alpha=-Math.PI/2;camera.beta=1.25;});
document.querySelector('#hall')!.addEventListener('click',()=>{camera.setTarget(new Vector3(-54,2,90));camera.radius=20;camera.beta=1.2;});
document.querySelector('#overview')!.addEventListener('click',()=>{camera.setTarget(new Vector3(0,0,50));camera.radius=850;camera.beta=.4;});
engine.runRenderLoop(()=>{life.update(Math.min(.5,engine.getDeltaTime()/1000),camera.position);scene.render();const r=life.review;document.querySelector('output')!.textContent=life.failed?'Lỗi tải — xem console':`${r.count}/200 · ${life.ready?'sẵn sàng':'đang chuẩn bị LOD'} · ${r.walking} đang đi · ${r.near}/${r.rigBudget} rig gần · ${Math.round(r.farTriangles/1000)}k tris xa · ${engine.getFps().toFixed(0)} FPS`;canvas.dataset.count=String(r.count);canvas.dataset.ready=String(life.ready);});window.addEventListener('resize',()=>engine.resize());


Object.assign(window as unknown as Record<string,unknown>,{__cam:camera,__life:life});
