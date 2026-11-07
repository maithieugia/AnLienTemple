import pathlib,hashlib,json
root=pathlib.Path('/var/www/anlien')
out={}
for p in (root/'assets').rglob('*'):
 if p.is_file() and (p.suffix not in ('.js','.css') or p.parent!=root/'assets'):
  h=hashlib.sha256()
  with p.open('rb') as f:
   for block in iter(lambda:f.read(1048576),b''):h.update(block)
  out[p.relative_to(root).as_posix()]={'sha256':h.hexdigest(),'bytes':p.stat().st_size}
print(json.dumps(out))
