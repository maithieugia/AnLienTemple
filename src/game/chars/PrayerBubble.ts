/** Prayer bubble above a pilgrim's head (anh Thanh 2026-11-04): at most two short lines, readable from a few metres away. */
export const BUBBLE={w:512,h:160,meshW:1.9,meshH:.594};
/** Split a prayer into at most two balanced lines. */
export function prayerLines(text:string,measure:(s:string)=>number,max:number):string[]{
 if(measure(text)<=max)return [text];const words=text.split(' ');let best=[text],score=Infinity;
 for(let i=1;i<words.length;i++){const a=words.slice(0,i).join(' '),b=words.slice(i).join(' '),wa=measure(a),wb=measure(b),s=Math.max(wa,wb);if(s<score){score=s;best=[a,b];}}
 return best;
}
/** Draw the bubble (lotus-gold rim, dark warm fill, small tail) into a 512×160 canvas context. */
export function drawPrayer(ctx:CanvasRenderingContext2D,text:string,self=false){
 const {w,h}=BUBBLE;ctx.clearRect(0,0,w,h);if(!text)return;
 let size=40;ctx.textAlign='center';ctx.textBaseline='middle';
 const font=()=>{ctx.font=`600 ${size}px "Segoe UI",sans-serif`;};font();
 let lines=prayerLines(text,s=>ctx.measureText(s).width,452);
 while(size>26&&lines.some(l=>ctx.measureText(l).width>452)){size-=2;font();lines=prayerLines(text,s=>ctx.measureText(s).width,452);}
 const lineH=size*1.18,boxW=Math.min(w-8,Math.max(...lines.map(l=>ctx.measureText(l).width))+48),boxH=lines.length*lineH+26,x=(w-boxW)/2,y=(h-18-boxH)/2+2;
 ctx.fillStyle=self?'rgba(92,52,10,.86)':'rgba(40,22,10,.78)';ctx.strokeStyle=self?'rgba(255,214,120,.95)':'rgba(230,186,96,.85)';ctx.lineWidth=4;
 ctx.beginPath();ctx.roundRect(x,y,boxW,boxH,26);ctx.moveTo(w/2-14,y+boxH);ctx.lineTo(w/2,y+boxH+16);ctx.lineTo(w/2+14,y+boxH);ctx.fill();ctx.stroke();
 ctx.fillStyle=self?'#ffe9b0':'#fff4d8';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=4;
 lines.forEach((l,i)=>ctx.fillText(l,w/2,y+13+lineH*(i+.5),w-30));ctx.shadowBlur=0;
}
/** The prayer tag hanging under a sky lantern (anh Thanh 2026-11-05): red paper with a gold border and the string hole on top,
 * so it reads as a written wish tied to the lantern; same 512×160 canvas as the bubble. */
export function drawPrayerTag(ctx:CanvasRenderingContext2D,text:string){
 const {w,h}=BUBBLE;ctx.clearRect(0,0,w,h);if(!text)return;
 let size=42;ctx.textAlign='center';ctx.textBaseline='middle';
 const font=()=>{ctx.font=`700 ${size}px "Segoe UI",sans-serif`;};font();
 let lines=prayerLines(text,s=>ctx.measureText(s).width,440);
 while(size>26&&lines.some(l=>ctx.measureText(l).width>440)){size-=2;font();lines=prayerLines(text,s=>ctx.measureText(s).width,440);}
 const lineH=size*1.16,boxW=Math.min(w-8,Math.max(...lines.map(l=>ctx.measureText(l).width))+56),boxH=Math.min(h-22,lines.length*lineH+28),x=(w-boxW)/2,y=h-4-boxH;
 ctx.fillStyle='#b3201a';ctx.strokeStyle='#f3c75a';ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(x,y,boxW,boxH,10);ctx.fill();ctx.stroke();
 ctx.strokeStyle='rgba(243,199,90,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+8,y+8,boxW-16,boxH-16,6);ctx.stroke();
 // string from the top edge of the canvas down to the tag
 ctx.strokeStyle='#e8d6a8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,y+4);ctx.stroke();ctx.fillStyle='#f3c75a';ctx.beginPath();ctx.arc(w/2,y+6,5,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#fff3c4';ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=3;
 lines.forEach((l,i)=>ctx.fillText(l,w/2,y+14+lineH*(i+.5),w-40));ctx.shadowBlur=0;
}
