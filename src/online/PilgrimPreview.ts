import {Vector3,type ArcRotateCamera,type Scene} from '@babylonjs/core';
import {CharacterLibrary} from '../game/chars/CharacterLibrary';
import {INCENSE_SITES,type Act} from './protocol';
import {Pilgrim} from './Pilgrim';

/** Dev check (?pilgrims=1): a row of pilgrims in every pose before the Amitabha altar, no login or server needed. */
export async function pilgrimPreview(scene:Scene,orbit:ArcRotateCamera,low:boolean){
 const lib=new CharacterLibrary(scene,low);await lib.load();
 const site=INCENSE_SITES.find(s=>s.id==='amitabha')!;
 const poses:[Act,string,boolean][]=[['idle','Đứng · Minh Tâm',false],['walk','Đi · Diệu Hạnh',true],['sit','Ngồi thiền · An',false],['kneel','Quỳ · Thu',true],['bow','Lạy Phật · Bảo',false],['incense','Thắp nhang · Lan',true]];
 const list=poses.map(([a,name,female],i)=>{const p=new Pilgrim(lib,scene,9000+i,name,female,i===0);p.rig.root.metadata={h:female?1.6:1.7};p.place(site.x-5+i*2,0,site.z+3.2,Math.PI);p.setAct(a);return p;});
 const wantPose=new URLSearchParams(location.search).get('pose');if(wantPose)list.forEach(p=>p.setAct(wantPose as Act));
 orbit.setTarget(new Vector3(site.x,1,site.z+3.2));orbit.radius=9;orbit.alpha=Math.PI/2+Number(new URLSearchParams(location.search).get('turn')??0);orbit.beta=1.35;
 let last=performance.now();scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;for(const p of list)p.update(dt);});
 (window as unknown as {__pilgrimsReady:boolean}).__pilgrimsReady=true;
}
