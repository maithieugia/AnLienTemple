/** Keep text, faces and paving readable; do not chase 60 FPS by halving both image axes. */
export function renderResolution(dpr:number,width:number,height:number,low:boolean){
 const ratio=Math.min(Math.max(1,dpr||1),low?1.25:1.5),budget=low?1600:2304;
 const best=Math.max(1/ratio,Math.max(width,height)/budget);
 return {best,worst:Math.min(Math.max(best,low?1.25:1),best*(low?1.25:1.12))};
}
export function nextResolution(level:number,fps:number,best:number,worst:number){
 return fps<28?Math.min(worst,level*1.04):fps>43?Math.max(best,level/1.04):level;
}
