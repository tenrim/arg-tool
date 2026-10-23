import pathlib, subprocess, sys
r=pathlib.Path(__file__).parent
cmd=[sys.executable,str(r/'compiler/emsdk-3.1.67/upstream/emscripten/em++.py'),'-O2','-std=c++11','--bind','-I'+str(r/'libqalculate-5.13.0'),'-I'+str(r/'build-deps/opt/include'),str(r/'bridge.cc')]+list(map(str,(r/'objects').glob('*.o')))+[str(r/'build-deps/opt/lib'/p) for p in ['libmpfr.a','libgmp.a','libxml2.a']]+['-sMODULARIZE=1','-sEXPORT_ES6=1','-sENVIRONMENT=web,worker,node','-sALLOW_MEMORY_GROWTH=1','-sMAXIMUM_MEMORY=1073741824','-sEXPORTED_RUNTIME_METHODS=FS','-sSTACK_SIZE=5242880','-o',str(r/'qalculate.mjs')]
p=subprocess.run(cmd,capture_output=True,text=True);(r/'link.log').write_text(p.stdout+p.stderr,encoding='utf-8');print((p.stdout+p.stderr)[-5000:]);sys.exit(p.returncode)
