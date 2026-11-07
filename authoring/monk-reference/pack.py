import json,hashlib
from pathlib import Path
p=Path(__file__).resolve().parents[2]/'public/assets/chars/monk-reference/avatar.json'
a=json.loads(p.read_text());report={}
for part in ['skin','eyes']:
 d=a[part];out={k:[] for k in d};seen={};old=len(d['positions'])//3
 for index in d['indices']:
  vals=tuple(round(x,6) for k,width in [('positions',3),('normals',3),('uvs',2),('joints',4),('weights',4)] for x in d[k][index*width:(index+1)*width])
  n=seen.get(vals)
  if n is None:
   n=len(seen);seen[vals]=n
   for k,width in [('positions',3),('normals',3),('uvs',2),('joints',4),('weights',4)]:out[k].extend(round(x,6) if k!='joints' else x for x in d[k][index*width:(index+1)*width])
  out['indices'].append(n)
 a[part]=out;report[part]={'beforeVertices':old,'vertices':len(seen),'triangles':len(out['indices'])//3}
p.write_text(json.dumps(a,separators=(',',':')));report['bytes']=p.stat().st_size;report['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();(p.parent/'asset.json').write_text(json.dumps(report,indent=2));print(report)
