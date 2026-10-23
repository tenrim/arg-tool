"""Pinned maintenance import/build. Ordinary website builds use the committed WASM.

python scripts/import-ggmorse.py --sdk <Emscripten 4.0.10 SDK root> [--download]
The SDK root contains bin/, emscripten/, and lib/. No runtime CDN is used.
"""
import argparse
import hashlib
import io
import json
import os
import pathlib
import re
import shutil
import subprocess
import urllib.request
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / 'upstream/expansion/ggmorse'
PUBLIC = ROOT / 'public/vendor/expansion/ggmorse'
COMMIT = '7b4822a8cfdbb1addfe497f3ae8186f142a4ee79'
REPOSITORY = 'https://github.com/ggerganov/ggmorse'


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'mist-toolbox-maintainer'}), timeout=90).read()


def build(sdk, download=False):
    PUBLIC.mkdir(parents=True, exist_ok=True)
    if download:
        archive = get(f'https://codeload.github.com/ggerganov/ggmorse/zip/{COMMIT}')
        source = zipfile.ZipFile(io.BytesIO(archive))
        prefix = source.namelist()[0]
        for member in source.infolist():
            rel = member.filename[len(prefix):]
            if not rel or member.is_dir():
                continue
            path = UPSTREAM / 'source' / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(source.read(member))
    original = UPSTREAM / 'source/src/ggmorse.cpp'
    content = original.read_text(encoding='utf-8')
    # Correct the upstream setter's previous-value cutoff bug at the engine
    # boundary; preserve the original source and publish the exact patch.
    patches = [
        ('m_impl->filterHighPass.init(Filter::FirstOrderHighPass, m_impl->parametersDecode.frequencyRangeMin_hz, kBaseSampleRate);',
         'm_impl->filterHighPass.init(Filter::FirstOrderHighPass, parameters.frequencyRangeMin_hz, kBaseSampleRate);'),
        ('m_impl->filterLowPass.init(Filter::FirstOrderLowPass, m_impl->parametersDecode.frequencyRangeMax_hz, m_impl->sampleRateInp);',
         'm_impl->filterLowPass.init(Filter::FirstOrderLowPass, parameters.frequencyRangeMax_hz, m_impl->sampleRateInp);'),
    ]
    constructor, setter = content.split('bool GGMorse::setParametersDecode(', 1)
    for before, after in patches:
        if setter.count(before) != 1:
            raise RuntimeError('Pinned GGMorse cutoff patch no longer matches')
        setter = setter.replace(before, after)
    derived = UPSTREAM / 'ggmorse-patched.cpp'
    derived.write_text(constructor + 'bool GGMorse::setParametersDecode(' + setter, encoding='utf-8')
    sdk = pathlib.Path(sdk).resolve()
    python = pathlib.Path(os.environ.get('GGMORSE_PYTHON', __import__('sys').executable))
    node_value = os.environ.get('GGMORSE_NODE') or shutil.which('node')
    if not node_value:
        raise RuntimeError('Set GGMORSE_NODE to a Node.js 24+ executable')
    node = pathlib.Path(node_value)
    config = UPSTREAM / '.emscripten-build-config'
    config.write_text(f'LLVM_ROOT = {str(sdk / "bin")!r}\nBINARYEN_ROOT = {str(sdk)!r}\nNODE_JS = [{str(node)!r}]\n', encoding='utf-8')
    build_temp = pathlib.Path(os.environ.get('GGMORSE_BUILD_TEMP', str(sdk.parent / 'mist-build-temp')))
    build_temp.mkdir(parents=True, exist_ok=True)
    env = {**os.environ, 'EM_CONFIG': str(config), 'EMSDK_PYTHON': str(python),
           'TEMP': str(build_temp), 'TMP': str(build_temp), 'EMCC_TEMP_DIR': str(build_temp)}
    command = [str(python), str(sdk / 'emscripten/emcc.py'),
               str(derived), str(UPSTREAM / 'source/src/resampler.cpp'), str(UPSTREAM / 'mist-bridge.cpp'),
               '-I' + str(UPSTREAM / 'source/include'), '-I' + str(UPSTREAM / 'source/src'),
               '-std=c++17', '-O3', '-sMODULARIZE=1', '-sEXPORT_ES6=1', '-sENVIRONMENT=web,worker,node',
               '-sALLOW_MEMORY_GROWTH=1', '-sINITIAL_MEMORY=67108864', '-sMAXIMUM_MEMORY=268435456',
               '-sFILESYSTEM=0', '-sEXPORTED_RUNTIME_METHODS=HEAPF32,HEAPU8',
               '-sEXPORTED_FUNCTIONS=_malloc,_free', '-o', str(PUBLIC / 'ggmorse.mjs')]
    subprocess.run(command, env=env, check=True)
    config.unlink()
    shutil.copyfile(UPSTREAM / 'source/LICENSE', PUBLIC / 'LICENSE-MIT.txt')
    notices = {
        'EMSCRIPTEN-LICENSE.txt': sdk / 'emscripten/LICENSE',
        'MUSL-COPYRIGHT.txt': sdk / 'emscripten/system/lib/libc/musl/COPYRIGHT',
        'LIBCXX-LICENSE.txt': sdk / 'emscripten/system/lib/libcxx/LICENSE.TXT',
        'LIBCXXABI-LICENSE.txt': sdk / 'emscripten/system/lib/libcxxabi/LICENSE.TXT',
        'COMPILER-RT-LICENSE.txt': sdk / 'emscripten/system/lib/compiler-rt/LICENSE.TXT',
    }
    for name, source in notices.items():
        if not source.is_file():
            raise RuntimeError(f'Missing toolchain notice {source}')
        shutil.copyfile(source, PUBLIC / name)
    alphabet = content.split('const TAlphabet kMorseCode = {', 1)[1].split('};', 1)[0]
    entries = {}
    for bits, char in re.findall(r'\{ "([01]+)",\s+\'((?:\\.|[^\'])+)\'', alphabet):
        entries[bits] = bytes(char, 'utf-8').decode('unicode_escape')
    (ROOT / 'public/expansion/morse-alphabet.js').write_text(
        '// Pinned official GGMorse alphabet; generated from the recorded C++ source.\n'
        'export const MORSE_ALPHABET = Object.freeze(' + json.dumps(entries, ensure_ascii=False, indent=2) + ');\n', encoding='utf-8')
    digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    metadata = {
        'repository': REPOSITORY, 'commit': COMMIT, 'license': 'MIT; FFT attribution CC-BY-SA-3.0/4.0; Emscripten runtime notices',
        'toolchain': 'Emscripten 4.0.10 (8103ffedfb0c42d231c6af6859a5a1a832260b43)',
        'sourceFiles': [{'path': p.relative_to(ROOT).as_posix(), 'sha256': digest(p)} for p in sorted((UPSTREAM / 'source').rglob('*')) if p.is_file()],
        'adaptations': [
            'First-party C ABI owns bounded chunk input, snapshots, official text/audio generation and instance cleanup.',
            'setParametersDecode cutoff initialization uses the incoming parameter, not the previous value (two-line patch).',
            'No SDL, ImGui, microphone capture, GUI, pretrained model, CDN or server is included: these are host IO/UI, not decoding data.',
        ],
        'runtimeFiles': [{'path': p.relative_to(ROOT / 'public').as_posix(), 'sha256': digest(p)} for p in sorted(PUBLIC.iterdir()) if p.is_file() and p.name != 'UPSTREAM.json'],
    }
    (PUBLIC / 'UPSTREAM.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'runtimeFiles': len(metadata['runtimeFiles']), 'commit': COMMIT}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sdk', required=True)
    parser.add_argument('--download', action='store_true')
    args = parser.parse_args()
    build(args.sdk, args.download)
