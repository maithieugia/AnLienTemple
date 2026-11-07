/**
 * Write <build>/asset-manifest.json: every file under <build>/assets with a short content hash.
 * The service worker (public/sw.js) keeps a copy of each file on the player's device and re-downloads one
 * only when its hash changes here, so a returning player loads the temple from their own disk.
 *   node deploy/asset-manifest.mjs dist-public      (run after compress-assets, before pack)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.argv[2];if(!root||!fs.existsSync(path.join(root,'assets'))){console.error('usage: node deploy/asset-manifest.mjs <build-folder>');process.exit(1);}
const files={};let bytes=0;
(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f),s=fs.statSync(p);if(s.isDirectory())walk(p);else{const rel='/'+path.relative(root,p).replace(/\\/g,'/');files[rel]=crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex').slice(0,12);bytes+=s.size;}}})(path.join(root,'assets'));
const version=crypto.createHash('sha1').update(JSON.stringify(files)).digest('hex').slice(0,12);
fs.writeFileSync(path.join(root,'asset-manifest.json'),JSON.stringify({version,files}));
console.log('asset-manifest',version,Object.keys(files).length,'files',(bytes/1e6).toFixed(1),'MB');
