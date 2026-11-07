"""Download the CC0 source manifest/files from Poly Haven; no account/payment required."""
from pathlib import Path
import json,urllib.request,hashlib,concurrent.futures
p=Path(__file__).resolve().parent/'tree-small-02';p.mkdir(exist_ok=True)
def request(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'AnLienTemple asset preparation'}),timeout=120)
manifest=json.load(request('https://api.polyhaven.com/files/tree_small_02'))
(p/'files.json').write_text(json.dumps(manifest,indent=2))
entry=manifest['gltf']['2k']['gltf']
def fetch(job):
    name,e=job;f=p/name;f.parent.mkdir(parents=True,exist_ok=True)
    data=request(e['url']).read();assert hashlib.md5(data).hexdigest()==e['md5'],name
    f.write_bytes(data);return name
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for name in pool.map(fetch,[('tree.gltf',entry),*entry['include'].items()]):print(name)
