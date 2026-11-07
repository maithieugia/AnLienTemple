/*
 * Chùa Online An Liên — keeps the temple's files on the player's device (Claude, 2026-11-03).
 * Only files listed in /asset-manifest.json (everything under /assets/) are kept. Each is stored under its content hash,
 * so a file is downloaded again only when it really changed in a new release; everything else (the page, /api, /ws,
 * audio range requests) goes straight to the network as before. If anything here fails, the request falls back to the network.
 */
const CACHE='anlien-assets-v1';
let manifest=null,loading=null;

function loadManifest(){
  loading=loading||fetch('/asset-manifest.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(m=>{if(m&&m.files){manifest=m;prune(m);}return manifest;})
    .catch(()=>manifest)
    .finally(()=>{loading=null;});
  return loading;
}
// Drop stored copies whose file changed or disappeared in the current release.
async function prune(m){try{const c=await caches.open(CACHE);for(const req of await c.keys()){const u=new URL(req.url),h=m.files[u.pathname];if(!h||u.searchParams.get('h')!==h)await c.delete(req);}}catch(e){}}

self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(loadManifest());});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([self.clients.claim(),loadManifest()]));});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate'){loadManifest();return;} // each visit checks for a new release in the background
  if(req.method!=='GET'||req.headers.has('range'))return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith('/assets/'))return;
  e.respondWith((async()=>{
    const m=manifest||await loadManifest(),hash=m&&m.files[url.pathname];
    if(!hash)return fetch(req);
    const key=new Request(url.origin+url.pathname+'?h='+hash);
    try{const c=await caches.open(CACHE),hit=await c.match(key);if(hit)return hit;
      const res=await fetch(req);
      if(res.ok&&res.status===200&&res.type==='basic')c.put(key,res.clone()).catch(()=>{});
      return res;
    }catch(err){return fetch(req);}
  })());
});
