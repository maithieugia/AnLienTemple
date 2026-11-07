import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
import http from 'node:http';
const root=path.resolve(import.meta.dirname,'..'),port=5200,base=`http://127.0.0.1:${port}`,url=base+'/?q=low&online=1';
const data=path.join(root,'data-local'),logs=path.join(root,'docs'),web=path.join(root,'dist-public');
fs.mkdirSync(data,{recursive:true});
if(!fs.existsSync(path.join(web,'index.html')))throw Error('Chua co game build trong dist-public.');
function ready(){return new Promise(resolve=>{const req=http.get(base+'/api/health',res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>{try{resolve(res.statusCode===200&&JSON.parse(body).ok===true);}catch{resolve(false);}});});req.setTimeout(5000,()=>req.destroy());req.on('error',()=>resolve(false));});}
if(!await ready()){
 const out=fs.openSync(path.join(logs,'local-game-server.log'),'a'),err=fs.openSync(path.join(logs,'local-game-server-error.log'),'a');
 const child=spawn(process.execPath,['server/server.ts'],{cwd:root,env:{...process.env,PORT:String(port),HOST:'127.0.0.1',DATA_DIR:data,STATIC_DIR:web,COOKIE_SECURE:'0'},detached:true,windowsHide:true,stdio:['ignore',out,err]});
 child.on('error',e=>console.error(e.message));child.unref();fs.closeSync(out);fs.closeSync(err);
 for(let i=0;i<30&&!await ready();i++)await new Promise(r=>setTimeout(r,250));
}
if(!await ready())throw Error('Khong mo duoc game local. Xem docs/local-game-server-error.log. Khong tu dong tat ung dung khac.');
const release=await(await fetch(base+'/release.json')).json();
console.log('Game local:',url,'\nBan:',release.revision,'\nTai khoan local doc lap. Tao tai khoan thu tren man hinh dang nhap.');
