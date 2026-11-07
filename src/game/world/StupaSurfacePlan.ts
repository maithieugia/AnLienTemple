/** Normal follows the batch's reversed winding; triangle caps repeat the first vertex. */
export function stupaQuadNormal(a:number[],b:number[],c:number[],d:number[]){const u=b.map((v,i)=>v-a[i]);let v=d.map((v,i)=>v-a[i]);const cross=()=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];let n=cross();if(Math.hypot(...n)<1e-10){v=c.map((v,i)=>v-a[i]);n=cross();}const length=Math.hypot(...n);return length>1e-10?n.map(v=>-v/length):[0,1,0];}
/** Babylon's left-handed view: give each side its own readable UV order, never show a mirrored back face. */
export function stupaSignFaces(x:number,y:number,z:number,nx:number,nz:number,w:number,h:number){
 const p=(u:number,v:number)=>[x-nz*u,y+v,z+nx*u],points=[p(-w/2,-h/2),p(w/2,-h/2),p(w/2,h/2),p(-w/2,h/2)];
 const back=[points[1],points[0],points[3],points[2]].map(p=>[p[0]-nx*.025,p[1],p[2]-nz*.025]);
 return[{points,normal:[nx,0,nz]},{points:back,normal:[-nx,0,-nz]}];
}
