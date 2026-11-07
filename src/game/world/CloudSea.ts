import {Mesh,VertexData,ShaderMaterial,Matrix,Vector3,type Scene} from '@babylonjs/core';

/** Infinite exterior cloud ocean. One background draw, no particles or collision changes. */
export function createCloudSea(scene:Scene,low:boolean){
 const mesh=new Mesh('white-cloud-ocean-and-horizon',scene),data=new VertexData();
 data.positions=[-1,-1,0,1,-1,0,1,1,0,-1,1,0];data.indices=[0,1,2,0,2,3];data.applyToMesh(mesh);
 mesh.alwaysSelectAsActiveMesh=true;mesh.isPickable=false;
 const mat=new ShaderMaterial('drifting-white-cloud-sea',scene,{vertexSource:`
 precision highp float;attribute vec3 position;varying vec2 screen;
 void main(){screen=position.xy;gl_Position=vec4(position.xy,0.999999,1.0);}
 `,fragmentSource:`
 precision highp float;varying vec2 screen;uniform mat4 inverseVP;uniform vec3 eye;uniform float clock;uniform float night;
 float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
 float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float exterior(vec2 p){
 vec2 q=abs(p-vec2(0,160))-vec2(400,560);
 float mainLand=max(q.x,q.y);
 float tower=length(p-vec2(480,20))-69.;
 vec2 c=abs(p-vec2(440,26))-vec2(50,18);
 return smoothstep(-2.,22.,min(mainLand,min(tower,max(c.x,c.y))));}
 float density(vec3 p){vec3 q=(p+vec3(clock*1.6,0,clock*.65))*.008;
 float n=noise(q)*.65+noise(q*2.07)*.25+noise(q*4.13)*.10;
 float top=-35.+n*100.;
 return (1.-smoothstep(top-20.,top,p.y))*smoothstep(-96.,-55.,p.y)*exterior(p.xz);}
 void main(){vec4 farPoint=inverseVP*vec4(screen,1,1);vec3 ray=normalize(farPoint.xyz/farPoint.w-eye);
 vec3 sky=mix(vec3(.88,.94,1.),vec3(.42,.67,.91),smoothstep(0.,.75,ray.y));
 sky=mix(sky,vec3(.055,.085,.15),night*.85);
 float horizon=1.-smoothstep(.0,.17,abs(ray.y));sky=mix(sky,mix(vec3(.97,.98,1.),vec3(.37,.44,.57),night),horizon*.86);
 vec3 sum=vec3(0);float alpha=0.;
 ${low?`
 // Lightweight moving cloud surface: three noise samples, no volume marching.
 float t=(-12.-eye.y)/min(-.0001,ray.y);
 if(ray.y<-.0001&&t>0.){
 vec3 p=eye+ray*min(t,18000.);vec3 q=(p+vec3(clock*1.6,0,clock*.65))*.008;
 float n=noise(q)*.65+noise(q*2.07)*.25+noise(q*4.13)*.10;
 alpha=exterior(p.xz)*(1.-smoothstep(-.08,-.005,ray.y));
 vec3 cloud=mix(vec3(.76,.84,.93),vec3(1.,.995,.98),smoothstep(.15,.8,n));
 cloud=mix(cloud,cloud*vec3(.35,.41,.54),night*.7);sum=cloud*alpha;
 }
 `:`
 float a=(-95.-eye.y)/ray.y,b=(66.-eye.y)/ray.y;
 float start=max(0.,min(a,b)),end=min(18000.,max(a,b));
 if(end>start&&abs(ray.y)>.0001){float t=start;float span=end-start;
 for(int i=0;i<56;i++){
 float fraction=(float(i)+.2+.6*hash(vec3(gl_FragCoord.xy,7.)))/56.;
 float next=start+span*fraction*fraction;
 float stepSize=max(1.,next-t);t=next;
 vec3 p=eye+ray*t;float d=density(p);
 float opacity=1.-exp(-d*stepSize*.075);
 float light=clamp(.45+.55*smoothstep(-12.,45.,p.y)-density(p+vec3(23.,14.,-17.))*.35,.15,1.);
 vec3 white=mix(vec3(.72,.79,.88),vec3(1.,.995,.97),light);
 white=mix(white,white*vec3(.35,.41,.54),night*.7);
 sum+=(1.-alpha)*opacity*white;alpha+=(1.-alpha)*opacity;
 if(alpha>.995)break;
 }}
 `}
 // The distant horizon stays white even beyond the march distance.
 if(ray.y<0.)sky=mix(sky,mix(vec3(.9,.94,.99),vec3(.31,.37,.47),night),(1.-smoothstep(-.12,0.,ray.y)));
 gl_FragColor=vec4(sum+sky*(1.-alpha),1.);
 }
 `},{attributes:['position'],uniforms:['inverseVP','eye','clock','night'],needAlphaBlending:true});
 mat.backFaceCulling=false;mat.disableDepthWrite=true;mesh.material=mat;
 let elapsed=0,night=0;const inverse=Matrix.Identity();
 const observer=scene.onBeforeRenderObservable.add(()=>{const camera=scene.activeCamera;if(!camera)return;elapsed+=Math.min(.1,scene.getEngine().getDeltaTime()/1000);scene.getTransformMatrix().invertToRef(inverse);mat.setMatrix('inverseVP',inverse);mat.setVector3('eye',camera.globalPosition??Vector3.Zero());mat.setFloat('clock',elapsed);mat.setFloat('night',night);});
 scene.onDisposeObservable.addOnce(()=>scene.onBeforeRenderObservable.remove(observer));
 return {setNight(value:boolean){night=value?1:0;}};
}
