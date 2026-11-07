import {Quaternion,Vector3} from '@babylonjs/core';
/** Fix both the finger axis AND wrist roll. A one-axis aim leaves the palms twisted. */
export function palmQuaternion(finger:Vector3,acrossKnuckles:Vector3,targetFinger:Vector3,targetAcross:Vector3){
 const up=targetFinger.normalizeToNew();const first=Quaternion.FromUnitVectorsToRef(finger.normalizeToNew(),up,new Quaternion());
 const from=acrossKnuckles.applyRotationQuaternion(first);from.subtractInPlace(up.scale(Vector3.Dot(from,up))).normalize();
 const to=targetAcross.subtract(up.scale(Vector3.Dot(targetAcross,up))).normalize();
 const angle=Math.atan2(Vector3.Dot(up,Vector3.Cross(from,to)),Vector3.Dot(from,to));
 return Quaternion.RotationAxis(up,angle).multiply(first).normalize();
}
