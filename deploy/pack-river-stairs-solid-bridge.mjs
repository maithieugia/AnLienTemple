import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd(),stage=path.join(root,'deploy','overlays','river-stairs-solid-bridge-'+Date.now());fs.mkdirSync(stage,{recursive:true});
const copy=(from,to)=>{const dest=path.join(stage,to);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,from),dest);};
for(const f of fs.readdirSync('dist-public'))if(f.endsWith('.html')||f==='release.json')copy('dist-public/'+f,'dist/'+f);
for(const f of fs.readdirSync('dist-public/assets'))if(/\.(js|css)$/.test(f)&&fs.statSync('dist-public/assets/'+f).isFile())copy('dist-public/assets/'+f,'dist/assets/'+f);
for(const f of ['SanctuaryPlan','StatueGardenPlan','EntranceRiverPlan'])copy('src/game/world/'+f+'.ts','app/src/game/world/'+f+'.ts');
copy('src/online/protocol.ts','app/src/online/protocol.ts');
const target=path.join(root,'deploy','river-stairs-solid-bridge-overlay.tar.gz');execFileSync('tar',['-czf',target,'-C',stage,'dist','app'],{stdio:'inherit'});console.log(JSON.stringify({stage,target,bytes:fs.statSync(target).size}));
