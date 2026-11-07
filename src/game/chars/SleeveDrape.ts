import {Matrix,Vector3} from '@babylonjs/core';
/** Keep the garment's downward axis aligned with gravity, even when the forearm folds inward. */
export function drapedSleeveFrame(a:Vector3,b:Vector3,side:number,length:number,drop:number,outward=0){
 drop=Math.min(drop,Math.max(.035,(Math.min(a.y,b.y)-.025)/.65));
 const axis=b.subtract(a).scale(side/length),horizontal=Math.hypot(axis.x,axis.z);
 // A nearly vertical limb must not flatten the cloth basis into a singular plane.
 if(horizontal<.12){axis.x=(axis.x<0?-1:1)*.12;}
 const across=Vector3.Cross(axis,Vector3.Up()).normalize(),origin=a.add(new Vector3(side*outward,0,0));
 return Matrix.FromValues(axis.x,axis.y,axis.z,0,0,drop,0,0,across.x,across.y,across.z,0,origin.x,origin.y,origin.z,1);
}
