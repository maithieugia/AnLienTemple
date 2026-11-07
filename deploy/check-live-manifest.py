import json,pathlib,hashlib
root=pathlib.Path('/var/www/anlien');m=json.loads((root/'asset-manifest.json').read_text());bad=[]
for rel,h in m['files'].items():
 p=root/rel.lstrip('/')
 if not p.is_file() or hashlib.sha1(p.read_bytes()).hexdigest()[:12]!=h:bad.append(rel)
print(json.dumps({'version':m['version'],'checked':len(m['files']),'mismatches':bad}))
