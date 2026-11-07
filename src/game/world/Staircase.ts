export type StairBox={x0:number;x1:number;z0:number;z1:number;y0:number;y1:number;rail?:boolean};
export function stairPlan(x:number,z:number,rise:number,base=0,width=1.25,minimumSteps=12){
 const n=Math.max(minimumSteps,Math.ceil(rise/2/.18)),run=n*.28,gap=.18,total=width*2+gap,half=rise/2,boxes:StairBox[]=[];
 for(let i=0;i<n;i++){
  const y=base+(i+1)/n*half;
  boxes.push({x0:x,x1:x+width,z0:z+i*.28,z1:z+(i+1)*.28,y0:y-.10,y1:y});
  const yy=base+half+(n-i)/n*half;
  boxes.push({x0:x+width+gap,x1:x+total,z0:z+i*.28,z1:z+(i+1)*.28,y0:yy-.10,y1:yy});
 }
 boxes.push({x0:x,x1:x+total,z0:z+run,z1:z+run+width,y0:base+half-.16,y1:base+half});
 const opening={x0:x-.04,x1:x+total+.04,z0:z-.02,z1:z+run+width+.04};
 // Inner rails, outer rails and a guarded turn landing. Posts every ~3 treads.
 for(const side of [x+.04,x+width-.04,x+width+gap+.04,x+total-.04])for(let i=0;i<n;i+=3){const upper=side>x+width,h=base+(upper?half+(n-i)/n*half:(i+1)/n*half);boxes.push({x0:side-.025,x1:side+.025,z0:z+i*.28,z1:z+i*.28+.05,y0:h,y1:h+1.05,rail:true});}
 for(const xx of [x,x+total-.06])boxes.push({x0:xx,x1:xx+.06,z0:z+run,z1:z+run+width,y0:base+half,y1:base+half+1.05,rail:true});
 boxes.push({x0:x,x1:x+total,z0:z+run+width-.06,z1:z+run+width,y0:base+half,y1:base+half+1.05,rail:true});
 return {x,z,rise,base,width,n,run,total,opening,boxes};
}
