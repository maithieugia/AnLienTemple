import { Color3, StandardMaterial, type Scene } from '@babylonjs/core';
import { BAcc } from './Buildings';

const GOLD=Color3.FromHexString('#bb9147'), EDGE=Color3.FromHexString('#dfb869'), OLD=Color3.FromHexString('#526451');
/** Original mesh interpretation of a Vietnamese tam sự set; dimensions in metres, tabletop at y=0. */
export function emitBronzeAltar(a: BAcc, low: boolean) {
  const n=low?12:20, uv:[number,number,number,number]=[0,0,1,1];
  const lathe=(x:number,z:number,profile:number[][],sx=1,sz=1,color=GOLD,segments=n)=>{
    for(let j=0;j<profile.length-1;j++) for(let i=0;i<segments;i++) {
      const t=i/segments*Math.PI*2,u=(i+1)/segments*Math.PI*2;
      const [y,r]=profile[j],[yy,rr]=profile[j+1];
      a.quad([x+Math.cos(t)*r*sx,y,z+Math.sin(t)*r*sz],[x+Math.cos(u)*r*sx,y,z+Math.sin(u)*r*sz],[x+Math.cos(u)*rr*sx,yy,z+Math.sin(u)*rr*sz],[x+Math.cos(t)*rr*sx,yy,z+Math.sin(t)*rr*sz],uv,color);
    }
  };
  const ball=(x:number,y:number,z:number,rx:number,ry:number,rz:number,color=GOLD)=>{
    const p:number[][]=[];const rows=low?4:6;for(let i=0;i<=rows;i++){const t=-Math.PI/2+i*Math.PI/rows;p.push([y+Math.sin(t)*ry,Math.cos(t)*rx]);}lathe(x,z,p,1,rz/rx,color,low?6:10);
  };
  const ring=(x:number,y:number,z:number,r:number,w:number,color=EDGE,sx=1,sz=1)=>lathe(x,z,[[y-w, r-w],[y-w,r],[y+w,r],[y+w,r-w]],sx,sz,color);
  // Square stepped pedestal, four claw-like feet and a swelling oval vessel.
  a.box(-.21,.21,0,.045,-.145,.145,0,GOLD);
  a.box(-.195,.195,.045,.075,-.135,.135,0,EDGE);
  for(const x of [-.14,.14])for(const z of [-.085,.085]) {
    ball(x,.095,z,.04,.035,.038);ball(x*.9,.135,z*.9,.025,.05,.026);ball(x*.85,.17,z*.85,.035,.03,.03);
  }
  lathe(0,0,[[.16,0],[.16,.12],[.18,.15],[.21,.18],[.28,.19],[.33,.16],[.36,.15],[.37,0]],1.1,.72);
  for(const y of [.18,.21,.32,.355]) ring(0,y,0,.16,.008,EDGE,1.1,.75);
  // Front relief: central medallion and curled clouds; geometric ornament, no invented lettering.
  ball(0,.265,-.141,.055,.037,.009,EDGE);
  for(const side of [-1,1])for(let i=0;i<5;i++)ball(side*(.07+i*.018),.255+Math.sin(i*1.5)*.015,-.14,.014,.009,.008,i%2?OLD:EDGE);
  // Tall upturned quai with animal-head terminals.
  for(const side of [-1,1]) {
    for(let i=0;i<7;i++) {const t=i/6;ball(side*(.16+.09*Math.sin(t*Math.PI*.65)),.29+t*.19,0,.018,.028,.019);}
    ball(side*.24,.49,-.006,.032,.025,.023,EDGE);ball(side*.26,.495,-.025,.019,.012,.022);
    ball(side*.23,.515,.006,.012,.018,.013);
  }
  // Lid with genuine openings between ribs, rather than a black painted perforation.
  ring(0,.39,0,.15,.015,EDGE,1.1,.75);ring(0,.49,0,.105,.012,EDGE,1.1,.75);
  for(let i=0;i<(low?10:16);i++) {
    const t=i/(low?10:16)*Math.PI*2;
    for(let j=0;j<4;j++) {const q=j/3,r=.148-q*.044;ball(Math.cos(t)*r*1.1,.405+q*.075,Math.sin(t)*r*.75,.012,.024,.012,j===0?OLD:GOLD);}
  }
  lathe(0,0,[[.50,0],[.50,.11],[.515,.12],[.535,.08],[.54,0]],1.1,.75,EDGE);
  // Nghê silhouette: seated body, chest, muzzle, ears, paws, curled tail and mane.
  ball(-.015,.595,0,.055,.063,.036);ball(-.045,.65,-.004,.037,.045,.032);
  ball(-.06,.69,-.008,.038,.034,.031);ball(-.077,.68,-.032,.023,.015,.019,EDGE);
  for(const z of [-.027,.027]) {ball(-.042,.715,z,.013,.022,.012);ball(-.055,.552,z,.016,.037,.015);ball(-.066,.535,z-.008,.023,.012,.018);}
  for(let i=0;i<7;i++){const t=i/6*Math.PI*1.4;ball(.045+Math.sin(t)*.027,.60+i*.01,Math.cos(t)*.014,.013,.014,.012,EDGE);}
  for(let i=0;i<6;i++)ball(-.017+Math.sin(i)*.012,.656+i*.01,.028,.014,.014,.01,EDGE);
  // Matching candlesticks: bell foot, turned stem, broad drip tray, open cup.
  for(const x of [-.46,.46]) {
    lathe(x,0,[[0,0],[0,.125],[.018,.13],[.03,.115],[.06,.10],[.09,.065],[.105,.04],[.14,.034],[.17,.055],[.20,.038],[.26,.028],[.28,.04],[.30,.14],[.312,.145],[.32,.13],[.325,.025],[.37,.025],[.40,.044],[.43,.03],[.47,.043],[.49,.033],[.52,.042],[.54,.057],[.63,.067],[.64,.07],[.647,.07],[.647,.055],[.56,.046],[.55,0]]);
    for(const y of [.025,.085,.18,.31,.40,.48,.63])ring(x,y,0,y===.31?.14:y===.025?.12:y===.63?.065:.038,.005,EDGE);
    for(let i=0;i<(low?6:10);i++){const t=i/(low?6:10)*Math.PI*2;ball(x+Math.cos(t)*.086,.055,Math.sin(t)*.086,.015,.018,.015,OLD);}
  }
}

export function bronzeAltarMesh(scene: Scene, low: boolean, name='bo-lu-tam-su') {
  let material=scene.getMaterialByName('altar-aged-bronze') as StandardMaterial|null;
  if(!material){material=new StandardMaterial('altar-aged-bronze',scene);material.diffuseColor=Color3.White();material.specularColor=new Color3(.65,.53,.31);material.specularPower=72;material.backFaceCulling=false;}
  const a=new BAcc();emitBronzeAltar(a,low);const mesh=a.build(name,scene,material)!;mesh.unfreezeWorldMatrix();mesh.receiveShadows=true;return mesh;
}
