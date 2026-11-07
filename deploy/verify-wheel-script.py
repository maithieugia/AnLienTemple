import pathlib,re,json,hashlib,urllib.request
root=pathlib.Path('/var/www/anlien');release=json.loads((root/'release.json').read_text());mf=json.loads((root/'asset-manifest.json').read_text());html=(root/'index.html').read_text();main=re.search(r'src="([^\"]*assets/main-[^\"]+\.js)"',html)[1];rel=main.removeprefix('./');body=(root/rel).read_bytes();assert hashlib.sha1(body).hexdigest()[:12]==mf['files']['/'+rel]
code=body.decode();m=re.search(r'(?:PrayerWheelPlan|SanctuaryLandscape)-[\w-]+\.js',code);chunk=m[0] if m else None
if chunk:
 b=(root/'assets'/chunk).read_bytes();assert hashlib.sha1(b).hexdigest()[:12]==mf['files']['/assets/'+chunk];code+=b.decode()
assert 'rows:720' in code and 'phrasesPerRow:200' in code
health=json.load(urllib.request.urlopen('http://127.0.0.1:8930/api/health'));assert health['ok']
print(json.dumps(dict(revision=release['revision'],main=main,chunk=chunk,mainSha256=hashlib.sha256(body).hexdigest(),manifestVersion=mf['version'],rows=720,phrasesPerRow=200,health=health,verificationBasis='current server web files and localhost health; manifest hashes match',notVerified=['direct browser visual inspection'])))
