// Packs the public build + server into deploy/anlien-release.tar.gz (run after `npm run build:public`).
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),stage=path.join(root,'deploy','stage');
const dist=process.argv[2]??'dist';if(!['dist','dist-public'].includes(dist))throw new Error('Expected dist or dist-public');
fs.rmSync(stage,{recursive:true,force:true});
const copy=(from,to)=>{fs.mkdirSync(path.dirname(path.join(stage,to)),{recursive:true});fs.cpSync(path.join(root,from),path.join(stage,to),{recursive:true});};
for(const g of ['guardians','photo-buddha'])if(fs.existsSync(path.join(root,dist,'assets/sanctuary',g)))throw new Error('dist still contains '+g+' (not licensed for public release)');
for(const f of ['live-control.html','live-overlay.html','reference.html'])if(fs.existsSync(path.join(root,dist,f)))throw new Error('Public build must omit '+f);
// the service worker trusts asset-manifest.json: always rewrite it from the files actually shipped (and compress first if forgotten)
execFileSync(process.execPath,[path.join(root,'deploy/compress-assets.mjs'),path.join(root,dist)],{stdio:['ignore','ignore','inherit']});
execFileSync(process.execPath,[path.join(root,'deploy/asset-manifest.mjs'),path.join(root,dist)],{stdio:'inherit'});
copy(dist,'dist');copy('server/server.ts','app/server/server.ts');copy('server/social.ts','app/server/social.ts');copy('server/guard.ts','app/server/guard.ts');copy('server/refuge.ts','app/server/refuge.ts');copy('server/refuge-names.ts','app/server/refuge-names.ts');for(const f of ['protocol','Releases','RefugePlan'])copy(`src/online/${f}.ts`,`app/src/online/${f}.ts`);
for(const f of ['SanctuaryPlan','OwnerCollectionPlan','StatueGardenPlan','PrayerWheelPlan','EntranceRiverPlan','StupaPlan'])copy(`src/game/world/${f}.ts`,`app/src/game/world/${f}.ts`);
copy('node_modules/ws','app/node_modules/ws');
fs.writeFileSync(path.join(stage,'app/package.json'),JSON.stringify({name:'anlien-server',private:true,type:'module'},null,1));
// smoke test (2026-11-05): the packed server must start on its own, so a source file missing from the list above fails here, not on the VM
{const data=fs.mkdtempSync(path.join(root,'deploy','smoke-'));const out=execFileSync(process.execPath,['-e',`const {spawn}=require('node:child_process');const c=spawn(process.execPath,['server/server.ts'],{cwd:${JSON.stringify(path.join(stage,'app'))},env:{...process.env,PORT:'18931',DATA_DIR:${JSON.stringify(data)},STATIC_DIR:${JSON.stringify(path.join(stage,'dist'))}}});let o='';c.stdout.on('data',d=>o+=d);c.stderr.on('data',d=>o+=d);setTimeout(()=>{c.kill();console.log(o.includes('online:')?'SMOKE OK':'SMOKE FAIL '+o.slice(0,600));},12000);c.on('exit',code=>{if(!o.includes('online:'))console.log('SMOKE FAIL exit '+code+' '+o.slice(0,600));});`],{encoding:'utf8'});
 fs.rmSync(data,{recursive:true,force:true});if(!out.includes('SMOKE OK')){fs.rmSync(stage,{recursive:true,force:true});throw new Error('Packed server does not start: '+out);}console.log('packed server starts');}
execFileSync('tar',['-czf','../anlien-release.tar.gz','-C','.','dist','app'],{cwd:stage,stdio:'inherit'});
fs.rmSync(stage,{recursive:true,force:true});
console.log('deploy/anlien-release.tar.gz',(fs.statSync(path.join(root,'deploy/anlien-release.tar.gz')).size/1e6).toFixed(1),'MB');
