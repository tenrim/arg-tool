# 趣味工具固定源码与可重复构建

这些文件来自用户所选十个工具及其直接依赖。每个 `SOURCE.json` 记录固定提交或版本及逐文件 SHA-256。原始快照不改写；适配层位于 `public/fun-tools/` 及本目录的 `*-worker-source.js`。生成资源位于 `public/vendor/fun-tools/`，主站部署直接使用固定资源，不在线安装依赖。

## 许可证

Spectrum 原代码、DSP 内核与适配 Worker 按 GPL-3.0-only 提供。AAC 解码器独立运行于 `aac-worker.js`，该适配及 AudioJS AAC 包按 GPL-2.0-only 提供，FAAD2 源码自述 GPL-2.0-or-later。其他项目及各解码库的精确许可原文保留在对应源码和 `DEPENDENCIES-NOTICE.txt`，不将不同许可统一改成 MIT。`moon-core/source/LICENSE` 为 Apache-2.0。

`public/vendor/fun-tools/fun-tools-sources.zip` 随网页分发实际固定源码、完整 FAAD2、AudioJS 包及原构建脚本、DSP 源码与编译时 MoonBit Core、适配源、依赖锁文件和维护构建脚本。修改发生于本站适配层，原始快照保持逐字节不变。Spectrum 音频入口在打包时将解码调用转换为独立 Worker 调用，不更改原格式与解码算法。

## 本轮维护构建

1. Node.js 24+；`npm ci --ignore-scripts --prefix tools/ui-runtime` 安装锁定的 esbuild。本目录 npm 依赖已随源码包提供，也可用 `npm ci --ignore-scripts --prefix upstream/fun-tools` 按锁文件恢复。
2. 本轮使用 MoonBit `moon 0.1.20261102 (ea07287 2026-11-02)` 与 Core `0.10.19+bee578715`。安装对应编译器，将 `moon-core/source` 作为其标准库源码，在仓库根目录运行 `moon -C upstream/fun-tools/spectrum/source/moon build --release --target wasm`。生成 `moon/_build/wasm/release/build/dsp.wasm`，原 `app/lib/dsp.ts` 使用该路径。
3. `node scripts/build-fun-tools.mjs` 校验固定源码，打包本地 JS、WASM，收集许可证和对应源码包，并生成资源 SHA-256 清单。这个维护构建完全不联网。普通 `npm run build` 复制已生成资源，不需要 MoonBit 或本目录依赖。
4. AAC 已提供原始 `audio-decode/source/packages/decode-aac/build.sh`、`src/aac_glue.c` 与固定 FAAD2 源码。如需重建其单文件 WASM，将 `faad2/source` 复制到该包的 `lib/faad2`，在装有 Emscripten 的环境执行 `bash build.sh`。网页当前使用 npm 锁定包的原始 `aac.wasm.js`，没有宣称本机重新编译过 AAC。

## 依赖审查

本轮 npm 审计提示的高风险 `tmp` 属于 StegCloak 命令行的 `inquirer → external-editor` 链。本站不执行 CLI，不把这条文件系统链放入网页或服务器。`elliptic` 提示涉及浏览器通用密码包中的椭圆曲线原语；此工具实际使用 AES-CTR、PBKDF2、HMAC 与随机字节，不开放椭圆曲线调用。保留固定上游字节，不以自动升级破坏格式兼容。
