---
capabilityId: native:forensics-stegoveritas
title: StegoVeritas 图片隐写分析
topicGroup: image-stego
summary: 从增强变体、调色板索引和 RGBA 位组合中观察图片候选及尾随数据。
aliases:
  - stegoveritas
  - AperiSolve
  - Aperi’Solve
  - 图像增强组合（21 张）
  - 调色板索引分析
  - 按 RGBA 位编号交织提取
  - LSB 候选扫描与文件识别
  - 图片尾随数据提取
  - LSB 嵌入（含 Alpha）
sources:
  - id: up
    title: StegoVeritas 1.11
    publisher: Michael Bann
    url: https://pypi.org/project/stegoveritas/1.11/
    language: en
    kind: author-spec
    locator: 原发行和图像变换、colormap 与 LSB 功能
  - id: catalog
    title: StegoVeritas 功能列表
    publisher: 迷雾工具箱
    url: /forensics/stegoveritas-catalog.js
    language: zh-CN
    kind: implementation
    locator: 模式、通道位取样与调色板索引
  - id: png
    title: Portable Network Graphics (PNG) Specification
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: PNG 签名、颜色类型、位深、IHDR 与 IEND
---

## 介绍
<!-- sources: up, catalog -->

StegoVeritas 提供多种图片检查手段。图像增强把视觉差异放大，调色板浏览按照索引拆像素，通道位提取把指定的比特组合为字节。这些手段观察原图的不同层次。

## 增强结果与透明通道
<!-- sources: up, catalog -->

亮度或色彩变换生成可供并排比较的新图，而尾随字节和索引资料仍应使用原格式。RGBA 图片须区分颜色与透明度，透明像素也可能保留实际颜色值。

:::example 对照一组增强图
[输入]
RGBA 人工图，初始全图 Alpha=42，运行增强组合
[结果]
生成 21 张；自动对比、均衡和曝光变体的 Alpha 仍为 42
[说明]
颜色增强与透明通道分别处理。
:::

## 按索引看调色板
<!-- sources: up, png, catalog -->

索引色图像的存储值是调色板编号。转成 RGB 后，两项颜色看起来相同也可能来自两个不同索引。索引分离应保留原调色板数据，选中范围和结果变化才能对应。

## RGBA 位交织
<!-- sources: up, catalog -->

通道样本可以按颜色顺序读取指定的位，再把选中位连成输出字节。在只有少量像素时可手算预期位序，用来检查是否漏读透明通道。

:::example 一像素的八个位
[输入]
RGBA = (1,2,3,1)，各通道依次选位 0 和 1
[结果]
二进制 10110110，即 B6
[说明]
先对 RGBA 四通道取位 0，得到 1011，再对四通道取位 1，得到 0110。两组接为 10110110。
:::

## 候选容器和文件边界
<!-- sources: up, catalog, png -->

RGB 与 RGBA 的候选枚举不同，结果的字节流可供签名识别。附加字节的判断应按各格式的结构终点，不能只在原图中搜索 IEND 字样。

:::example RGB 与 RGBA 的扫描范围
[输入]
同一人工图分别保存 RGB 和 RGBA，再执行候选扫描
[结果]
分别产生 40 与 48 组原始候选字节
[说明]
透明通道扩大可用组合，不会使每条候选都代表真实文件。
:::

## 常见误区

- 增强图显现的轮廓需要回到原像素复核。
- 扫描中匹配到文件头不等于提取出完整可用文件。
- 一般不能拿转换后的 RGB 图复核原先的调色板下标。

