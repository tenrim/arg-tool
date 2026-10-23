import pathlib, re, json, subprocess, concurrent.futures, sys
root=pathlib.Path(__file__).parent
src=root/'libqalculate-5.13.0'
sdk=root/'compiler/emsdk-3.1.67'
emcc=sdk/'upstream/emscripten/em++.py'
config={'COMPILED_DEFINITIONS':'1','HAVE_BYO_GNUPLOT':'1','HAVE_MPFR_H':'1','HAVE_UNORDERED_MAP':'1','HAVE_STDINT_H':'1','HAVE_INTTYPES_H':'1','HAVE_STDIO_H':'1','HAVE_STDLIB_H':'1','HAVE_STRINGS_H':'1','HAVE_STRING_H':'1','HAVE_SYS_STAT_H':'1','HAVE_SYS_TYPES_H':'1','HAVE_UNISTD_H':'1','STDC_HEADERS':'1','PACKAGE':'"libqalculate"','PACKAGE_VERSION':'"5.13.0"','VERSION':'"5.13.0"','PACKAGE_STRING':'"libqalculate 5.13.0"','GETTEXT_PACKAGE':'"libqalculate"','PACKAGE_DATA_DIR':'"/usr/local/share"','PACKAGE_LOCALE_DIR':'"/usr/local/share/locale"'}
(src/'config.h').write_text('\n'.join('#define '+k+' '+v for k,v in config.items()))
defs=[]
for name in ['currencies','datasets','elements','functions','planets','prefixes','units','variables']:
    text=(src/f'data/{name}.xml.in').read_text(encoding='utf-8')
    defs.append(f'const char * {name}_xml = '+json.dumps(text,ensure_ascii=True)+';')
for name in ['eurofxref-daily.xml','rates.json']:
    text=(src/'data'/name).read_text(encoding='utf-8')
    defs.append('const char * '+name.replace('-','_').replace('.','_')+' = '+json.dumps(text,ensure_ascii=True)+';')
(src/'libqalculate/definitions.cc').write_text('\n'.join(defs),encoding='utf-8')
obj=root/'objects';obj.mkdir(exist_ok=True)
common=[sys.executable,str(emcc),'-O2','-std=c++11','-DHAVE_CONFIG_H','-I'+str(src),'-I'+str(src/'libqalculate'),'-I'+str(root/'build-deps/opt/include'),'-I'+str(root/'build-deps/opt/include/libxml2')]
files=list((src/'libqalculate').glob('*.cc'))
def build(file):
    target=obj/(file.stem+'.o')
    if target.exists(): return file.name+' cached'
    p=subprocess.run(common+['-c',str(file),'-o',str(target)],capture_output=True,text=True)
    (obj/(file.stem+'.log')).write_text(p.stdout+p.stderr,encoding='utf-8')
    return file.name+(' OK' if p.returncode==0 else ' FAILED\n'+p.stderr[-2500:])
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for result in pool.map(build,files):print(result,flush=True)
