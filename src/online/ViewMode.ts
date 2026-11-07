import type {Act} from './protocol';
/** Eye position follows the devotional pose without placing the camera below the floor. */
export function cameraEyeHeight(act:Act,female=false):number{
 const scale=(female?1.6:1.7)/1.7;
 return (act==='sit'?.85:act==='kneel'?1.12:act==='bow'? .32:1.58)*scale;
}

export type EyeCameraSettings={height:number;fov:number};
export const DEFAULT_EYE_CAMERA:EyeCameraSettings={height:1.8,fov:65};
/** Settings are local camera preferences, never player/network position. FOV is in degrees. */
export function eyeCameraSettings(raw:Partial<EyeCameraSettings>|null|undefined):EyeCameraSettings{
 const finite=(n:unknown,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
 return{height:Math.min(3.2,Math.max(.6,finite(raw?.height,1.8))),fov:Math.min(100,Math.max(35,finite(raw?.fov,65)))};
}
