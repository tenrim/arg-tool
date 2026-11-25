---
capabilityId: op:Detect%20File%20Type
title: 识别文件类型
topicGroup: files
summary: 文件类型可由特定位置的字节签名推断。识别结果提供候选格式、常用扩展名和媒体类型。
aliases:
  - Detect File Type
  - 文件签名
  - 魔数
  - 文件格式识别
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 5 节，PNG 签名、数据块和结构
  - id: zip
    title: APPNOTE.TXT — ZIP File Format Specification
    publisher: PKWARE
    url: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
    language: en
    kind: author-spec
    locator: 第 4.3 节，局部文件头与中央目录末端记录
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Detect File Type，签名匹配、类别范围与候选格式
---

## 介绍
<!-- sources: png, zip, fixed -->
不少文件格式规定了固定字节或在已知偏移出现的记录标记。检查这些特征可以推断文件类型。扩展名只是文件名的一段，改名不会改变签名和里面的结构。

## 从偏移和字节识别
<!-- sources: png, fixed -->
检查签名需要知道字节值和规定的位置。PNG 在开头用固定的八字节签名，后面按标准排列数据块。文件仅出现该签名时，可得到 PNG 候选，完整的图像还要含相应数据块。

:::example 八字节触发 PNG 候选
[输入]
89 50 4E 47 0D 0A 1A 0A
[结果]
识别为 PNG 候选，常见扩展名为 png，媒体类型为 image/png。
[说明]
这八字节命中格式签名。样本没有后续块，因此并非完整图片。
:::

## 容器的不同标记
<!-- sources: zip, fixed -->
ZIP 使用多种记录标记。含文件条目时可由局部文件头开始，空档案也可直接出现中央目录结束记录。某些专门文档格式使用 ZIP 作为外层，还需查看内部条目和清单来确定具体格式。

:::example 空 ZIP 的记录头
[输入]
50 4B 05 06，后接 18 个 00
[结果]
识别为 ZIP，媒体类型为 application/zip。
[说明]
这是一份仅有中央目录结束记录的空档案，签名与常见局部文件头 50 4B 03 04 不同。
:::

## 未命中与分类范围
<!-- sources: fixed -->
签名检测只查已实现的候选格式。检查类别被限制，样本过短，或数据格式没有相应规则时，都可能出现未知类型。简单文字不一定带有文件签名，但仍可以按普通文本阅读。

:::example 没有固定签名的一行文字
[输入]
hello world，末尾有 LF
[结果]
在签名匹配中没有识别到具体文件格式。
[说明]
这段内容由普通 ASCII 字符组成，没有与图片或归档相同的文件头。
:::

## 签名之后的结构复核
<!-- sources: png, zip -->
候选类型用于选择下一步检查方法。例如 PNG 可核对块的长度与校验值，ZIP 可读取中央目录、条目列表和完整性数据。原始字节保留完整时，才能复核签名之外的结构。

## 常见误区
- 改扩展名不会转换文件格式。
- 命中签名不证明文件数据完整。
- 未识别的字节也可能是普通文本、裁切片段或列表未覆盖的格式。
