import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {spawn} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'../..'),url='http://127.0.0.1:5202/four-kings.html';
const ready=()=>new Promise(resolve=>{const req=http.get(url,res=>{res.resume();resolve(res.statusCode===200);});req.setTimeout(3000,()=>req.destroy());req.on('error',()=>resolve(false));});
if(!await ready()){const out=fs.openSync(path.join(root,'docs/four-kings-preview-server.log'),'a'),err=fs.openSync(path.join(root,'docs/four-kings-preview-server-error.log'),'a');const child=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5202','--strictPort'],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',out,err]});child.unref();fs.closeSync(out);fs.closeSync(err);}
for(let i=0;i<25&&!await ready();i++)await new Promise(resolve=>setTimeout(resolve,250));
if(!await ready())throw Error('Preview did not start; see docs/four-kings-preview-server-error.log');
console.log(url);
