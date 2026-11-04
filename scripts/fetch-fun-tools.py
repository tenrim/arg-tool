"""Explicit maintenance download; never called by the offline build."""

import concurrent.futures
import hashlib
import io
import json
from pathlib import Path
import time
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "upstream" / "fun-tools"
REPOS = {
    "pic-scramble": "iris10086/pic-scramble",
    "visual-crypto": "itmm/visual-crypto",
    "stegcloak": "KuroLabs/stegcloak",
    "hidden-watermark": "guofei9987/hidden_watermark",
    "buddha": "takuron/talk-with-buddha",
    "spectrotrace": "j-about/SpectroTrace",
    "spectrum": "HK-SHAO/atools",
    "hideinfo": "guofei9987/HideInfo",
    "screendrop": "guofei9987/ScreenDrop",
    "crypttool": "guofei9987/CryptTool",
    "beast": "ntnyq/beast-codec",
    "watermark-app": "guofei9987/app",
}


def get(url):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "mist-toolbox-maintenance"})
            return urllib.request.urlopen(req, timeout=35).read()
        except Exception:
            if attempt == 3:
                raise
            time.sleep(1)


def fetch(item):
    name, repo = item
    folder = DEST / name
    record = folder / "SOURCE.json"
    if record.exists():
        return name + " already pinned"
    commit = json.loads(get(f"https://api.github.com/repos/{repo}/commits/HEAD"))["sha"]
    data = get(f"https://codeload.github.com/{repo}/zip/{commit}")
    files = {}
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        for info in archive.infolist():
            if info.is_dir():
                continue
            relative = Path(*Path(info.filename).parts[1:])
            target = (folder / "source" / relative).resolve()
            if not target.is_relative_to((folder / "source").resolve()):
                raise ValueError("unsafe archive path")
            content = archive.read(info)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
            files[relative.as_posix()] = hashlib.sha256(content).hexdigest()
    record.write_text(
        json.dumps(
            {
                "repository": "https://github.com/" + repo,
                "commit": commit,
                "archiveSha256": hashlib.sha256(data).hexdigest(),
                "files": files,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    return name + " " + commit + " " + str(len(files)) + " files"


if __name__ == "__main__":
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        pending = {pool.submit(fetch, item): item[0] for item in REPOS.items()}
        for future in concurrent.futures.as_completed(pending):
            try:
                print(future.result(), flush=True)
            except Exception as error:
                print(pending[future] + " FAILED " + str(error), flush=True)
