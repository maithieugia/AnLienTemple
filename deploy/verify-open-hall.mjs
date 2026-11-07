import fs from 'node:fs';import crypto from 'node:crypto';
const root='/var/www/anlien',m=JSON.parse(fs.readFileSync(root+'/asset-manifest.json'));
for(const lod of ['high','low']){const p='/assets/workshop/vb-sanctuary-grand-roof/'+lod+'.glb',h=crypto.createHash('sha1').update(fs.readFileSync(root+p)).digest('hex').slice(0,12);if(m.files[p]!==h)throw Error('manifest mismatch');console.log(lod,h);}
console.log(JSON.parse(fs.readFileSync(root+'/release.json')).revision);
