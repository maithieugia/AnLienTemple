/**
 * Graphics quality for the online temple (anh Thanh 2026-11-03): high quality is the standard; weak devices drop to the
 * light version ("?q=low", which the whole scene already understands) so even a weak phone can enter.
 *
 * Order: an explicit ?q= in the address > the player's saved choice > automatic detection.
 * The choice is applied by rewriting the address BEFORE the scene reads it, so no other code has to change.
 */
export type QualityChoice='auto'|'high'|'low';
const KEY='al-quality';

export function savedQuality():QualityChoice{try{const v=localStorage.getItem(KEY);return v==='high'||v==='low'?v:'auto';}catch{return 'auto';}}
export function saveQuality(q:QualityChoice){try{if(q==='auto')localStorage.removeItem(KEY);else localStorage.setItem(KEY,q);}catch{}}

/** Why a device counts as weak (empty = strong enough for high quality). */
export function weakReasons(env:{memory?:number;cores?:number;touch:boolean;renderer:string;maxTexture:number;screen:number}):string[]{
 const r:string[]=[];const gpu=env.renderer.toLowerCase();
 if(/swiftshader|llvmpipe|software|microsoft basic render/.test(gpu))r.push('không có card đồ họa');
 if(/mali-(4|t[6-8])|mali-g(31|51|52|57)\b|adreno \(tm\) ([2-5]\d\d|6[0-1]\d)\b|adreno ([2-5]\d\d|6[0-1]\d)\b|powervr|videocore|intel\(r\) hd graphics( [2-5]\d\d\d)?\b/.test(gpu))r.push('card đồ họa yếu');
 if(env.memory!==undefined&&env.memory<=4)r.push('RAM '+env.memory+'GB');
 if(env.maxTexture&&env.maxTexture<8192)r.push('giới hạn ảnh '+env.maxTexture);
 // phones and tablets: the full temple needs a lot of graphics memory, so only clearly strong ones get high quality
 if(env.touch&&!(env.memory!==undefined&&env.memory>=8&&(env.cores??0)>=8))r.push('điện thoại/máy tính bảng');
 if(env.cores!==undefined&&env.cores<=2)r.push(env.cores+' nhân CPU');
 return r;
}
function probe(){let renderer='',maxTexture=0;try{const gl=document.createElement('canvas').getContext('webgl2')??document.createElement('canvas').getContext('webgl');if(gl){const d=gl.getExtension('WEBGL_debug_renderer_info');renderer=String(gl.getParameter(d?d.UNMASKED_RENDERER_WEBGL:gl.RENDERER));maxTexture=Number(gl.getParameter(gl.MAX_TEXTURE_SIZE))||0;gl.getExtension('WEBGL_lose_context')?.loseContext();}else renderer='software';}catch{renderer='software';}
 return{memory:(navigator as Navigator&{deviceMemory?:number}).deviceMemory,cores:navigator.hardwareConcurrency,touch:matchMedia('(pointer:coarse)').matches,renderer,maxTexture,screen:Math.min(screen.width,screen.height)};}

/** Decide and apply: returns the quality in force and, when automatic, why it was lowered. */
export function applyQuality():{quality:'high'|'low';choice:QualityChoice;reasons:string[]}{
 const url=new URL(location.href),q=url.searchParams.get('q');
 if(q==='low'||q==='high')return{quality:q==='low'?'low':'high',choice:q,reasons:[]};
 const choice=savedQuality(),reasons=choice==='auto'?weakReasons(probe()):[],quality=choice==='low'||(choice==='auto'&&reasons.length)?'low':'high';
 if(quality==='low'){url.searchParams.set('q','low');history.replaceState(history.state,'',url);}
 return{quality,choice,reasons};
}
/** Switch and reload (the scene is built once for one quality). */
export function switchQuality(q:QualityChoice){saveQuality(q);const url=new URL(location.href);url.searchParams.delete('q');location.href=url.toString();}

/** After entering: if high quality runs too slowly for ~20 s, offer the light version once. */
export function watchSpeed(getFps:()=>number,quality:'high'|'low',offer:()=>void){
 if(quality!=='high')return;let slow=0,checks=0;const h=setInterval(()=>{if(document.hidden)return;checks++;slow=getFps()<20?slow+1:0;if(slow>=10){clearInterval(h);offer();}if(checks>240)clearInterval(h);},2000);
}
