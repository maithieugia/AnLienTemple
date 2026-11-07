import {Engine,Scene,ArcRotateCamera,Vector3,HemisphericLight,DirectionalLight,Color4,Color3,MeshBuilder,StandardMaterial} from '@babylonjs/core';
import {RocketboxPlayer,RocketboxPlayerLibrary} from '../game/chars/RocketboxPlayer';
import type {Act} from './protocol';

/**
 * Character creator preview (anh Thanh 2026-11-04, "chọn giống PUBG"): the pilgrim on a small golden dais in its own little
 * 3D view, turning slowly; drag to look round. Shows the chosen body, clothes and a motion before the account is made.
 * Uses the same models as the game, so the files it fetches are reused (browser cache) when the temple opens.
 */
export class CharacterPreview{
 private engine:Engine;private scene:Scene;private lib:RocketboxPlayerLibrary;private player?:RocketboxPlayer;private loaded=false;private dead=false;
 private want:{female:boolean;outfit:string;act:Act}={female:false,outfit:'nam-01',act:'idle'};
 readonly ready:Promise<void>;
 constructor(private canvas:HTMLCanvasElement){
  this.engine=new Engine(canvas,true,{stencil:false,premultipliedAlpha:false,alpha:true} as never,true);
  this.engine.setHardwareScalingLevel(1/Math.min(2,window.devicePixelRatio||1));
  const scene=this.scene=new Scene(this.engine);scene.clearColor=new Color4(0,0,0,0);scene.skipPointerMovePicking=true;
  const cam=new ArcRotateCamera('cc-cam',Math.PI/2,1.42,3.3,new Vector3(0,.86,0),scene);cam.fov=.62;cam.minZ=.05;
  cam.lowerBetaLimit=1.05;cam.upperBetaLimit=1.62;cam.lowerRadiusLimit=cam.upperRadiusLimit=3.3;cam.panningSensibility=0;cam.angularSensibilityX=600;cam.attachControl(canvas,true);
  cam.useAutoRotationBehavior=true;const auto=cam.autoRotationBehavior!;auto.idleRotationSpeed=.35;auto.idleRotationWaitTime=2500;auto.idleRotationSpinupTime=1200;
  const hemi=new HemisphericLight('cc-sky',new Vector3(0,1,0),scene);hemi.intensity=1.05;hemi.groundColor=new Color3(.32,.2,.08);
  const key=new DirectionalLight('cc-key',new Vector3(-.5,-.7,-.6),scene);key.intensity=1.6;key.diffuse=new Color3(1,.92,.78);
  const rim=new DirectionalLight('cc-rim',new Vector3(.4,-.3,.9),scene);rim.intensity=.9;rim.diffuse=new Color3(1,.78,.42);
  const dais=MeshBuilder.CreateCylinder('cc-dais',{diameter:1.5,height:.08,tessellation:64},scene);dais.position.y=-.04;
  const dm=new StandardMaterial('cc-dais-m',scene);dm.diffuseColor=new Color3(.15,.09,.035);dm.specularColor=new Color3(.35,.26,.12);dm.emissiveColor=new Color3(.07,.04,.01);dais.material=dm;
  const ring=MeshBuilder.CreateTorus('cc-ring',{diameter:1.5,thickness:.03,tessellation:64},scene);const rm=new StandardMaterial('cc-ring-m',scene);rm.emissiveColor=new Color3(.85,.62,.26);rm.disableLighting=true;ring.material=rm;
  this.lib=new RocketboxPlayerLibrary(scene);
  this.ready=this.lib.load().then(()=>{this.loaded=true;this.rebuild();});
  this.engine.runRenderLoop(()=>{if(this.dead||!canvas.offsetParent)return;const dt=Math.min(.05,this.engine.getDeltaTime()/1000);this.player?.update(dt);scene.render();});
  addEventListener('resize',this.onResize);
 }
 private onResize=()=>this.engine.resize();
 /** Show this body / clothes / motion (rebuilds the pilgrim only when body or clothes change). */
 show(female:boolean,outfit:string,act:Act=this.want.act){
  const rebuild=female!==this.want.female||outfit!==this.want.outfit||!this.player;this.want={female,outfit,act};
  if(!this.loaded)return;if(rebuild)this.rebuild();else this.player!.setAct(act);
 }
 private rebuild(){
  this.player?.dispose();const {female,outfit,act}=this.want;
  this.player=new RocketboxPlayer(this.lib,this.scene,9000,'',female,true,outfit);this.player.place(0,0,0,0);
  this.scene.getMeshByName('player-name-9000')?.setEnabled(false);this.player.setAct(act);this.engine.resize();
 }
 dispose(){this.dead=true;removeEventListener('resize',this.onResize);this.player?.dispose();this.lib.dispose();this.engine.dispose();}
}
