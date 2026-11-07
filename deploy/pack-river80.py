from pathlib import Path
import shutil, tarfile, json

root=Path(__file__).resolve().parent.parent
log=(root/'docs/river80-build.log').read_text(encoding='utf-8-sig')
assert 'built in' in log, 'Public build has not completed'
assert not (root/'docs/river80-typecheck.log').read_text(encoding='utf-8-sig').strip(), 'TypeScript errors'
assert (root/'dist-public/index.html').stat().st_mtime >= max(p.stat().st_mtime for p in (root/'src').rglob('*.ts')), 'Build predates source changes'
stage=root/'deploy/overlays/river80-20261105'
stage.mkdir(parents=True,exist_ok=True)
d=stage/'dist';(d/'assets').mkdir(parents=True,exist_ok=True)
for n in ['index','front-triad','owner-collection','entrance-river','stupa','monks','monk-reference','monk-library','ceremony','lay-assembly','wall-relief']:
    shutil.copy2(root/f'dist-public/{n}.html',d/f'{n}.html')
for p in (root/'dist-public/assets').iterdir():
    if p.is_file() and p.suffix in ['.js','.css']:shutil.copy2(p,d/'assets'/p.name)
shutil.copy2(root/'public/release.json',d/'release.json')
assert json.loads((d/'release.json').read_text(encoding='utf-8'))['revision']=='2026-11-05-river-tower-camera-2'
a=stage/'app';shutil.copytree(root/'src',a/'src',dirs_exist_ok=True)
(a/'deploy').mkdir(exist_ok=True);shutil.copy2(root/'deploy/asset-manifest.mjs',a/'deploy/asset-manifest.mjs')
s=(root/'deploy/update-river-tower-camera.sh').read_text().replace('2026-11-04-open-hall-statues-1','2026-11-05-river-tower-camera-1')
(root/'deploy/update-river80.sh').write_text(s,newline='\n')
with tarfile.open(root/'deploy/river80-overlay.tar.gz','w:gz') as tar:
    tar.add(d,arcname='dist');tar.add(a,arcname='app')
print('BUILD_OK',log.split('built in')[-1].splitlines()[0])
print('PACKED', (root/'deploy/river80-overlay.tar.gz').stat().st_size)
