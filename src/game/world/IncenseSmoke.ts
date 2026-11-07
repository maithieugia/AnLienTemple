import { Color3, Color4, DynamicTexture, MeshBuilder, ParticleSystem, StandardMaterial, Vector3, type Scene, type TransformNode } from '@babylonjs/core';

type Source = { point: Vector3; owner?: TransformNode };
const sources = new WeakMap<Scene, Source[]>();
const started = new WeakSet<Scene>();
export function incenseSourcesNear(scene: Scene, eye: Vector3, limit: number) {
  const live=(sources.get(scene)??[]).filter(s=>!s.owner?.isDisposed()); sources.set(scene,live);
  const nearby=live.filter(s=>!s.owner||s.owner.isEnabled()).map(s=>s.owner?Vector3.TransformCoordinates(s.point,s.owner.computeWorldMatrix(true)):s.point).filter(p=>Vector3.DistanceSquared(p,eye)<35*35).sort((a,b)=>Vector3.DistanceSquared(a,eye)-Vector3.DistanceSquared(b,eye));
  const bowls: Vector3[]=[];
  for(const p of nearby) if(!bowls.some(b=>Vector3.DistanceSquared(b,p)<.18*.18)) {bowls.push(p);if(bowls.length>=limit)break;}
  return bowls;
}
export function registerIncense(scene: Scene, point: Vector3, owner?: TransformNode) {
  const source={point:point.clone(),owner};
  const list = sources.get(scene) ?? []; list.push(source); sources.set(scene,list);
  return () => sources.set(scene,(sources.get(scene)??[]).filter(s=>s!==source));
}
/** Small red coal, without a candle flame or a point light per stick. */
export function incenseEmber(scene: Scene, point: Vector3, owner?: TransformNode) {
  let mat=scene.getMaterialByName('incense-coal') as StandardMaterial | null;
  if(!mat) {mat=new StandardMaterial('incense-coal',scene);mat.emissiveColor=Color3.FromHexString('#e45622');mat.disableLighting=true;}
  const tip=MeshBuilder.CreateSphere('incense-coal-tip',{diameter:.018,segments:3},scene);
  tip.material=mat;tip.parent=owner??null;tip.position.copyFrom(point);tip.isPickable=false;
  registerIncense(scene,point,owner);
}
/** One shared texture and a bounded pool of nearby wisps, including streamed room sources. */
export function startIncenseSmoke(scene: Scene, low: boolean) {
  if(started.has(scene)) return; started.add(scene);
  const texture=new DynamicTexture('incense-smoke-soft',{width:64,height:64},scene,false);
  const c=texture.getContext() as CanvasRenderingContext2D, g=c.createRadialGradient(32,32,0,32,32,31);
  g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);texture.hasAlpha=true;texture.update();
  const pool=Array.from({length:low?12:24},(_,i)=>{
    const p=new ParticleSystem('incense-wisp-'+i,low?32:56,scene);p.particleTexture=texture;p.emitter=new Vector3();
    p.minEmitBox=Vector3.Zero();p.maxEmitBox=Vector3.Zero();p.color1=new Color4(.74,.80,.88,.26);p.color2=new Color4(.53,.62,.73,.18);p.colorDead=new Color4(.5,.58,.7,0);
    p.minSize=.018;p.maxSize=.04;p.minLifeTime=2.2;p.maxLifeTime=3.7;p.emitRate=0;p.blendMode=ParticleSystem.BLENDMODE_STANDARD;
    p.direction1=new Vector3(-.025,.15,-.015);p.direction2=new Vector3(.04,.24,.025);p.minEmitPower=.65;p.maxEmitPower=1;p.gravity=new Vector3(.012,.025,0);
    p.addSizeGradient(0,.018);p.addSizeGradient(.5,.10);p.addSizeGradient(1,.22);p.start();return p;
  });
  let elapsed=1;
  scene.onBeforeRenderObservable.add(()=>{
    elapsed+=scene.getEngine().getDeltaTime()/1000;if(elapsed<.25)return;elapsed=0;
    const camera=scene.activeCamera;if(!camera)return;
    // Several sticks in one bowl share a wisp, so a dense burner cannot consume the whole pool.
    const bowls=incenseSourcesNear(scene,camera.globalPosition,pool.length);
    pool.forEach((ps,i)=>{const p=bowls[i];if(p){const emitter=ps.emitter as Vector3;if(Vector3.DistanceSquared(emitter,p)>.1)ps.reset();emitter.copyFrom(p);ps.emitRate=low?5:8;}else ps.emitRate=0;});
  });
}
