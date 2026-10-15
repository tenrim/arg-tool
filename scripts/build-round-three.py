"""Maintenance-only. Build pinned cspuz_core checkout with a direct-grid ABI; ordinary site builds remain offline."""
from pathlib import Path
import subprocess,sys,hashlib,json,shutil
root=Path(__file__).resolve().parent.parent
checkout=Path(sys.argv[1])
expected='d88f99c8c7872d400d2f0d2456860f50f3d1f1f6'
actual=subprocess.check_output(['git','-C',str(checkout),'rev-parse','HEAD'],text=True).strip()
if actual!=expected:raise RuntimeError('Unexpected cspuz_core commit')
bridge=(root/'upstream/round3/board_bridge.rs').read_text()
source=checkout/'cspuz_solver_backend/src/lib.rs'
original=subprocess.check_output(['git','-C',str(checkout),'show','HEAD:cspuz_solver_backend/src/lib.rs'],text=True)
source.write_text(original+'\n'+bridge)
# Upstream single_cycle_grid_edges allows an empty edge set. Standard Slitherlink
# requires a nonempty loop, including on all-zero / clue-free boards.
slither='cspuz_rs_puzzles/src/puzzles/slitherlink.rs'
original_slither=subprocess.check_output(['git','-C',str(checkout),'show','HEAD:'+slither],text=True)
needle='    graph::single_cycle_grid_edges(solver, is_line);'
assert original_slither.count(needle)==1
(checkout/slither).write_text(original_slither.replace(needle,needle+'\n    solver.add_expr(is_line.horizontal.any() | is_line.vertical.any());'))
wrapper=checkout/'util/emcc_wrapper'
w=subprocess.check_output(['git','-C',str(checkout),'show','HEAD:util/emcc_wrapper'],text=True).replace('_solve_problem,_enumerate_answers_problem,','_arg_solve_board,')
wrapper.write_text(w)
config=checkout/'.cargo/config.toml'
config.write_text('''[target.wasm32-unknown-emscripten]
linker = "./util/emcc_wrapper"
rustflags = ["-C", "panic=abort", "-C", "link-args=-s MODULARIZE=1 -s ALLOW_MEMORY_GROWTH=1 -s MAXIMUM_MEMORY=268435456 -s FILESYSTEM=0 -s ENVIRONMENT=web,worker,node -s EXPORT_ES6=1 -s EXPORTED_RUNTIME_METHODS=HEAPU8 -sDEFAULT_TO_CXX=1"]
''')
subprocess.run(['cargo','+1.85.1','build','--locked','--offline','--target','wasm32-unknown-emscripten','--release','--no-default-features','-p','cspuz_solver_backend','--lib'],cwd=checkout,check=True)
out=root/'public/vendor/round3';out.mkdir(parents=True,exist_ok=True)
for ext in ['js','wasm']:shutil.copyfile(checkout/('target/wasm32-unknown-emscripten/release/deps/cspuz_solver_backend.'+ext),out/('grid-engine.'+ext))
# The generated loader's locateFile callback selects grid-engine.wasm.
for name in ['LICENSE','README.md']:shutil.copyfile(checkout/name,out/name)
notices=[]
for notice in sorted((root/'upstream/round3/licenses').glob('*.txt')):
    notices.append('\n===== '+notice.name+' =====\n'+notice.read_text())
(out/'LICENSES.txt').write_text('Bundled runtime and toolchain copyright notices. See LICENSE for cspuz_core and Glucose / MiniSat.\n'+''.join(notices))
shutil.copyfile(checkout/'Cargo.lock',root/'upstream/round3/Cargo.lock')
shutil.copyfile(config,root/'upstream/round3/emscripten-config.toml')
shutil.copyfile(wrapper,root/'upstream/round3/emcc_wrapper')
submodules=subprocess.check_output(['git','-C',str(checkout),'submodule','status'],text=True)
metadata={'repository':'https://github.com/semiexp/cspuz_core','commit':actual,'submodules':submodules.splitlines(),'scope':['sudoku','slitherlink','nurikabe','akari'],'adaptation':'Direct integer grid ABI. Slitherlink adds one nonempty-loop constraint; other rule solvers unchanged. Generated loader and wasm built with Rust 1.85.1 / Emscripten 3.1.69. No URL input or remote solving.','build_script':'scripts/build-round-three.py','bridge':'upstream/round3/board_bridge.rs','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in out.iterdir() if p.is_file() and p.name!='UPSTREAM.json'}}
(out/'UPSTREAM.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n')
print('Built four local puzzle solvers:',out)
