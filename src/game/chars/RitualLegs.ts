import {Quaternion,Vector3} from '@babylonjs/core';
import {armChain} from './ConnectedArms.ts';
export const THIGH_LENGTH=Math.hypot(.01,.41),CALF_LENGTH=Math.hypot(.07,.395,.02);
/** Leg joint targets preserve source segment lengths rather than disconnecting hidden feet. */
export function ritualLegPose(hip:Vector3,side:number,seated:boolean,kneel:boolean,walk:boolean,time:number){
 const thigh=hip.add(new Vector3(side*.12,-.04,0));let ankle:Vector3,knee:Vector3,rotation=Quaternion.Identity();
 if(seated){const target=new Vector3(-side*.06,side>0?.19:.135,side>0?.40:.44),chain=armChain(thigh,target,new Vector3(side*.65,.22,.25),THIGH_LENGTH,CALF_LENGTH);knee=chain.elbow;ankle=chain.wrist;rotation=Quaternion.RotationYawPitchRoll(Math.PI-side*.8,0,side*.2);}
 else if(kneel){const dx=.02,ky=.10,kz=hip.z+Math.sqrt(Math.max(.001,THIGH_LENGTH**2-(thigh.y-ky)**2-dx*dx));knee=new Vector3(side*.14,ky,kz);ankle=new Vector3(side*.13,.075,kz-Math.sqrt(CALF_LENGTH**2-(ky-.075)**2-.01**2));rotation=Quaternion.RotationYawPitchRoll(0,0,0);}
 else{const step=walk?Math.sin(time*4.7+side*Math.PI/2):0,target=new Vector3(side*.13,.075+Math.max(0,step)*.045,step*.18),chain=armChain(thigh,target,new Vector3(side*.13,.5,.8),THIGH_LENGTH,CALF_LENGTH);knee=chain.elbow;ankle=chain.wrist;}
 return{thigh,knee,ankle,rotation};
}


