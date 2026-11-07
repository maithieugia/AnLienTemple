import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),out=path.resolve(root,'dist-public');
for(const rel of ['assets/sanctuary/guardians','assets/sanctuary/photo-buddha','assets/chars/ready-made/rocketbox/Male_Adult_08-textures','assets/chars/ready-made/rocketbox/Female_Adult_17-textures']){
 const target=path.resolve(out,rel);if(!target.startsWith(out+path.sep))throw Error('Unsafe output path');
 fs.rmSync(target,{recursive:true,force:true});
}
for(const rel of ['live-control.html','live-overlay.html','reference.html'])if(fs.existsSync(path.join(out,rel)))throw Error('Unexpected public entry '+rel);
console.log('Public output checked: no private LIVE controls or restricted statue assets.');
