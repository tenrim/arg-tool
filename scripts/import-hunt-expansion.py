"""Maintenance-only pinned source import. Normal builds are offline."""
import argparse,hashlib,io,json,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PROJECTS=[('chinese-puzzle','philippica/ChinesePuzzleTool','8b4ebec728138981a94b4ff743026084e9e37ef5'),('cipher-machine','philippica/cipher_machine','29fa4ee1c60873484688c250b37c87d93f54cae4')]
parser=argparse.ArgumentParser();parser.add_argument('--archives',type=Path);args=parser.parse_args()
for name,repo,commit in PROJECTS:
    url='https://codeload.github.com/'+repo+'/zip/'+commit
    cached=args.archives/(name+'.zip') if args.archives else None
    if cached and cached.is_file():archive=cached.read_bytes()
    else:
        with urllib.request.urlopen(url,timeout=90) as r:archive=r.read()
    dest=ROOT/'upstream/expansion/hunt'/name;dest.mkdir(parents=True,exist_ok=True)
    files=[]
    with zipfile.ZipFile(io.BytesIO(archive)) as z:
        prefix=z.namelist()[0].split('/')[0]+'/'
        for n in z.namelist():
            if n.endswith('/'):continue
            rel=n[len(prefix):];target=(dest/rel).resolve()
            if not target.is_relative_to(dest.resolve()):raise ValueError('Unsafe archive path')
            b=z.read(n);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
            files.append({'path':rel,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
    (dest/'UPSTREAM.json').write_text(json.dumps({'repository':'https://github.com/'+repo,'commit':commit,'archive_url':url,'archive_sha256':hashlib.sha256(archive).hexdigest(),'files':files},indent=2)+'\n',encoding='utf-8')
    print(name+': '+str(len(files))+' unmodified source files')
