# StegoVeritas 接入与覆盖说明

独立部署可按 [V2.3 更新日志](releases/V2.3-更新日志.md) 查看功能。固定发行包从 [PyPI](https://pypi.org/project/stegoveritas/1.11/) 获取，原始文件随独立依赖包提供。

## 功能去向

| 上游能力 | 工具箱中的实现与入口 |
| --- | --- |
| `imageTransform` 的 10 种滤镜、8 档正负锐度、autocontrast、equalize、solarize | 新增 StegoVeritas → 图像增强组合，完整生成 21 张图片 |
| `imageTransform` 的 RGB／Alpha 通道、所有位平面、反色、灰度 | 复用本地图片隐写／图片处理，不再新增同用途入口 |
| `colorMap` | 新增调色板索引分析，支持指定索引或全部 256 个索引，无抽样 |
| `colorMapRange` | 同一入口设置共同保留的半开区间；也可列出不连续的共同保留索引 |
| `extractLSB`、`red/green/blue/alpha` | 新增原 StegoVeritas 位序提取。按像素→位编号→RGBA 交织，与 StegOnline 按像素→颜色→位编号不同，不能误作重复 |
| `bruteLSB` | 原枚举算法的全部 RGB 40／RGBA 48 组，原 libmagic／Binwalk 识别；额外保留所有候选字节和提取原件 |
| `extract_frames` | 复用 GIF／APNG 逐帧分析：全部原始帧、合成帧、时间／处置／混合信息、GIF 索引和原文件导出，比上游仅拆帧范围更大 |
| `trailing` | 新增 PNG／JPEG／GIF／BMP／经典 TIFF 尾随提取；改正上游 PNG 字符串分割和 TIFF 未计入像素段的问题 |
| `steghide`、`password` | 复用 Steghide 原页面和现有密码提取 |
| `wordlist` | 扩展同一个 Steghide 页面：可上传 UTF-8 密码列表，完整尝试、去除重复密码、不在空行提前退出、不回显密码 |
| `exif` | 扩展原完整文件元数据入口，新增包含二进制标签 Base64 的 JSON，原文本／JSON 输出保留 |
| `xmp` | 同一元数据入口新增原始 XMP 数据包下载；原 ExifTool 分组信息也覆盖 XMP 字段 |
| `meta` | 上游 1.11 的该函数直接返回，属于退役空入口；对应需求由已有 ExifTool／PNG 检查覆盖，不添加无效按钮 |
| `carve`、`test_output` | 文件雕刻复用原 Binwalk；LSB 候选内部仍调用上游 `test_output` 的 libmagic 与 Binwalk，不另造识别算法 |
| 附带的 `stegoveritas_hide_lsb` | 已有 StegOnline 嵌入覆盖 RGB，但不支持 Alpha；新增原嵌入原语，支持 UTF-8 文字／原始文件、任意所选 RGBA 顺序、PNG 或 RGB BMP。写入前检查全部载荷容量 |
| 无参数自动运行、`out`、`debug`、安装依赖命令 | 自动扫描仍按用户此前范围不启用；输出目录、调试和安装由服务管理，不允许网页指定服务器路径或命令。上述所有有效分项均有入口 |

“全部候选”只指上游实际枚举的组合，不代表穷举所有隐写方案。原始 `brute_lsb.py` 在第 77 行附近 `return` 之后的三重循环不可达，本轮不把那段死代码冒称为实际检测能力。

## 所有者与边界

- 页面、文件、附加文件、参数、取消和笔记结果仍由 `public/forensics/page.js` 管理；只显示当前操作的参数，隐藏的载荷文件不上传。
- `public/forensics/stegoveritas-catalog.js` 只声明参数、说明和复用入口。原能力目录、搜索、来源和科普继续由原模块投影，无第二份独立菜单。
- 六种操作登记到原生模式路由；搜索具体操作和带 `dir` 的链接直接选中对应模式，不回退默认图像增强。
- `services/forensics/index.mjs` 校验白名单；`runner.py` 负责文件和完整结果；`stegoveritas_adapter.py` 调用固定上游；`trailing_data.py` 处理容器边界；`steghide_wordlist.py` 扩展原 Steghide。
- 每项任务仍为独立、无网络、只读根目录、非 root 的临时容器。单次上传文件合计最多 20 MB，全部结果 64 MB，240 秒，一次一个任务。超限失败，不交付截断结果。取消沿用真正删除任务容器的原机制。
- 上游线程池改为逐项执行，保留完整候选枚举但将子任务错误向上传播，避免静默漏跑。每个候选附带颜色位参数清单，标准输出与警告日志均保留。滤镜的 RGBA ImageOps 转为 RGB 计算后恢复原透明度，不修改上游文件。
- 经典 TIFF 依据目录、条带／瓦片和已知子目录引用推算结束位置；私有标签仍可能另有引用，界面明确标示候选性质。BigTIFF 不冒称支持。位交织只接受原始 RGB／RGBA；索引图要求 P 模式，不先转换颜色来伪造分析。

## 固定来源与许可

实际运行来源是 [StegoVeritas 1.11](https://pypi.org/project/stegoveritas/1.11/) 完整源代码发行包。归档 SHA-256：`a5836a0350b116342bef13edec020806c1c9ea33c95cad2ac52db6c7b59c9ac5`。`upstream/stegoveritas/SOURCE.json` 保存不可变下载地址和全部 40 个原文件摘要。未更新既有 AperiSolve 或其他固定引擎。

上游 GitHub 当前参考提交为 `4d4929be54f0c40a30f02a31a0ad24356a4fdc41`，不将它冒称为 PyPI 归档的对应提交；本轮复核以实际发行包字节为准。XERJ 本机不可用，已直接查阅项目所有者与下列固定发行包代码：

| 原文件 | 行号及采用方式 |
| --- | --- |
| `stegoveritas/stegoveritas.py` | 56–153：候选识别和完整提取；173–221：完整命令行参数核对 |
| `stegoveritas/modules/image/__init__.py` | 30–95：原 RGBA 位交织实现，原样调用 |
| `stegoveritas/modules/image/analysis/filters.py` | 12–40、97 起：原滤镜／增强函数和完整操作列表；去重后调用 |
| `stegoveritas/modules/image/analysis/colormap.py` | 30 起：原索引调色板导出；原样调用，入口增加边界校验 |
| `stegoveritas/modules/image/analysis/brute_lsb.py` | 10–77：全部实际候选枚举和输出检查；串行调用，不吞掉异常 |
| `stegoveritas/hide_lsb.py` | 62–128：原像素写入和字节位流；入口先检查完整容量 |

尾随解析依据 [PNG 数据块规范](https://www.w3.org/TR/png-3/#5Chunk-layout)、[GIF89a](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)、[JPEG T.81 附录 B](https://www.w3.org/Graphics/JPEG/itu-t81.pdf)、[BMP 文件头](https://learn.microsoft.com/en-us/windows/win32/api/wingdi/ns-wingdi-bitmapfileheader)；TIFF 目录／类型／条带结构同时对照现有 Pillow TIFF 读取实现。PNG 中的 `IEND` 必须是按长度读取到的结束块，不能搜索同名字节；JPEG 要跳过段内容及扫描数据中的填充和重启标记。

发行包的 `setup.py` 声明 MIT，但实际 `LICENSE.md` 为 GPL-2.0，已保留并展示这一差异，随站交付完整 GPL 原文与原始源码，不以 MIT 单独宣称。适配层及新增运行依赖的完整许可随交付保留。没有安装未执行的 APNG、pfp、exifread 或 XMP Python 包：这些能力由现有本地动画、ExifTool 和本站边界解析覆盖。Binwalk 复用当前隔离镜像已有版本，未安装会覆盖它的 Python fork。

## 验证和本地预览

- `node --test tests/stegoveritas.test.mjs tests/forensics.test.mjs`：固定原字节、参数／附件白名单、20 MB 合计上限、原服务取消／并发／失败恢复。
- `tests/stegoveritas_engine.py`：在独立镜像内使用合成图片检查 21 张增强、RGBA 透明度、256 个索引、位交织精确字节、RGBA 二进制嵌入往返、BGR BMP、容量错误、五种格式尾随、全部 40／48 候选、Steghide 密码列表。
- `node scripts/test-stegoveritas-http.mjs`：通过本地 HTTP 和实际隔离容器验证非法参数、失败恢复、上传载荷、嵌入→提取原字节、二进制标签和原始 XMP。
- `node scripts/browser-stegoveritas.mjs`：实际页面六种操作、条件参数、附件序列化、改参清除结果、隐藏附件不上传、复用链接、许可加载和 320px 布局。页面测试使用合成响应；真实引擎结果由前两项另行验证。

本地预览另已完成真实页面上传、提取结果和原字节下载入口检查；停止 LSB 任务后已观测到对应容器消失。密集测试时 SSH 开发连接曾被服务器关闭，稍后 HTTP 与网页请求恢复正常；此记录不作为引擎算法失败，也不宣称 SSH 连通性永不波动。正式服务直接调用本机 Docker，不使用该开发 SSH 跳转。

实测证据在忽略提交的 `outputs/stegoveritas-20261117/`。11 月 17 日构建并验证的镜像相对恢复镜像增加 3,353,580 字节（约 3.2 MiB），包含 Python 支持包、源码和适配层。V2.3 复验后按同一镜像摘要上线。实际镜像 ID 与支持包版本在 `services/forensics/STEGOVERITAS_RUNTIME.json`，后续重新构建使用 `services/forensics/Dockerfile` 并记录新摘要和包清单。

独立部署请先执行 npm run setup:forensics，再按[开源部署说明](SOURCE_DEPLOYMENT.md)启用本机 Docker 服务。
