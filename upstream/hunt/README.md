# 浏览器解谜组件维护

普通构建无需安装 Rust、Python、pnpm 或 Emscripten。固定版本和逐文件摘要在根目录清单与 public/vendor/hunt/ 中；禁止未经验证直接更新到主分支。

维护导入流程：

1. 按 upstream-manifest.json 的当前 components 固定提交检出词典、立体图和 SSTV 项目到维护目录（默认 /tmp/arg-hunt-upstreams）。纸笔谜题项目已移除，不重新导入。
2. 在独立维护目录 /tmp/arg-hunt-packages 安装 @ffmpeg/ffmpeg@0.12.15、@ffmpeg/core@0.12.10、zxing-wasm@2.2.4 和 esbuild，再运行 node scripts/install-hunt-projects.mjs /path/to/upstreams。
3. node scripts/finalize-hunt-projects.mjs 生成立体图 Worker、gzip FFmpeg WASM 并记录剩余组件的完整性。保留 ZXing-C++ 和 FFmpeg 依赖许可及 ffmpeg-build/ 对应来源配方。
4. 运行 npm test、npm run check、npm run build、browser-paper-removal、browser-hunt-smoke 与 browser-hunt-media-smoke；检查查词、答案提取、视频、SSTV 和旧纸笔工具确实不再发布。

媒体测试准备：系统 FFmpeg 生成 /tmp/arg-hunt-video.mp4（lavfi color=c=red:s=160x120:d=1 与 sine=frequency=440:duration=1，libx264/yuv420p + AAC）；SSTV 使用固定上游 public/assets/test.mp3。素材与截图不提交。
