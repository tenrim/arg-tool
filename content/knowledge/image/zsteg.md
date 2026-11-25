---
capabilityId: native:forensics-zsteg
title: PNG／BMP 隐写检测与提取
topicGroup: image-stego
summary: 枚举位、通道与扫描顺序，按明确候选取出原始字节。
aliases:
  - zsteg
  - AperiSolve
  - Aperi’Solve
sources:
  - id: zsteg
    title: zsteg README 与样例
    publisher: zed-0xff
    url: https://github.com/zed-0xff/zsteg
    language: en
    kind: author-spec
    locator: 候选说明、extract 和输出示例
  - id: adapter
    title: AperiSolve 分析器源码：zsteg
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/zsteg.py
    language: en
    kind: implementation
    locator: 扫描与按参数读取原始字节
  - id: png
    title: Portable Network Graphics (PNG) Specification
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG 签名、颜色类型、位深、IHDR 与 IEND
  - id: view
    title: 检测结果的参数和换行解析
    publisher: 迷雾工具箱
    url: /forensics/zsteg-output.js
    language: zh-CN
    kind: implementation
    locator: 候选文本记录与报告保持
---

## 介绍
<!-- sources: zsteg, adapter -->

zsteg 检查 PNG 或 BMP 像素中可能的位平面和通道组合。检测列举可能的读法，提取则按一条确定的规则输出原始字节。前者可供挑选线索，后者用于复核文件或内容。

## 读位数、通道与方向
<!-- sources: zsteg, png -->

一个像素通道包含若干位。选择低位时，同一个颜色值的末位决定一位输出。报告中的配置同时决定每个样本选几位、颜色顺序、位序与扫描方向。

:::example 读检测参数
[输入]
b1,rgb,lsb,xy
[结果]
每通道取最低一位；依 R、G、B 与 x/y 顺序读取
[说明]
这是一组具体的还原规则，RGB 和 BGR 的字节结果可能不同。
:::

## 从候选转成可核对字节
<!-- sources: adapter, zsteg, view -->

报告中的文本或文件识别只是预览。可用候选参数提取整段，保留控制字节和不可见字节，之后看开头、终点与内部结构。

:::example 复核已知样本的前缀
[输入]
固定 512×512 RGB PNG 样本；按 b1,rgb,lsb,xy 提取
[结果]
开头为 MIST_ZSTEG_PAYLOAD，下一字节是 00
[说明]
零字节也属于实际输出，文字片段没有完整表达它。
:::

## 提取长度与图像颜色层
<!-- sources: adapter, zsteg, png -->

无长度控制时，按位提取得到整块容量。即使有效线索只占最前面，后续无关像素也会组成字节。调色板数据与真实 RGB 色值属于不同表示，抽取对象须与原格式对应。

:::example 计算这个样本的整段长度
[输入]
512×512 RGB，每通道每像素一位
[结果]
98304 字节
[说明]
512×512×3 除以 8，长度大于前面的 19 字节已知前缀。
:::

## 候选命中的复核
<!-- sources: zsteg, adapter -->

偶然可读片段和短文件特征会增加候选。复核时从同一原图重取字节，再检查文件结构是否完整、文本是否与题面线索吻合。没有命中只能说明当前组合未得到可辨候选。

## 常见误区

- 报告中的 text 行不是全部提取流。
- 取出整段字节的长度不是隐写消息长度。
- zsteg 的 PNG／BMP 流程不用于替代 JPEG 专用解码。

