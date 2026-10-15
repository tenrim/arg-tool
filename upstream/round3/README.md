# 第三轮：直接网格求解引擎

固定上游：https://github.com/semiexp/cspuz_core ，提交 `d88f99c8c7872d400d2f0d2456860f50f3d1f1f6`。

`cspuz-core-source.tar.gz` 保存未修改 Git 提交快照及 Glucose / Cadical / glucose_rs 的固定子模块。运行构建只启用 Glucose。`Cargo.lock`、`emscripten-config.toml`、`emcc_wrapper` 保留实际依赖与编译选项。`licenses/` 保存运行库及工具链原始版权说明，运行目录 `LICENSES.txt` 汇总这些原文。

## 维护构建

正常网站构建不需要以下工具；运行文件已经检入 `public/vendor/round3/`。

1. 使用上述固定 Git checkout 并初始化子模块。解压快照可审阅原始代码；构建脚本需要带对应 HEAD 的 Git checkout。
2. 准备 Rust 1.85.1，安装 `wasm32-unknown-emscripten` target；准备 Emscripten 3.1.69、LLVM 19、Binaryen 和 Node.js，并确保其 Acorn 依赖可用。配置 `PATH`、`EM_CONFIG`；如果使用解包的 Debian 工具链，还需设置其共享库目录 `LD_LIBRARY_PATH`。
3. 在维护环境先按 Cargo.lock 获取 Cargo 构建依赖。随后运行 `python scripts/build-round-three.py /path/to/cspuz-core`。脚本验证固定 HEAD，从原始源码生成适配，以 `--locked --offline --no-default-features` 编译。
4. 执行 `npm test`、`node scripts/browser-round-three.mjs` 和正常构建检查。若升级工具链，重新核对并保留对应许可原文。

脚本新增 `board_bridge.rs` 的 `arg_solve_board` ABI：`[题型, 行, 列, ...格子]`，-2 空格，照明 -1 为无数字黑格。输出为长度前缀 UTF-8 JSON，返回完整确定、部分确定、无解或无效输入，不生成题目 URL。数回在上游 `single_cycle_grid_edges` 后补充 `solver.add_expr(is_line.horizontal.any() | is_line.vertical.any())`，因为原通用环约束允许空边集，而标准数回必须有回路；其余规则算法保持原样。

WASM 内存最多 256 MB，界面最多 15×15；浏览器 Worker 在 30 秒后终止，用户可提前停止。求解事实计算是实际引擎结果，不是缓存答案。运行文件逐项摘要与子模块版本记录在 `UPSTREAM.json`。
