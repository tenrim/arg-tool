---
capabilityId: native:forensics-binwalk
title: 嵌入文件扫描与递归提取
topicGroup: files
summary: 结合偏移、格式签名和递归解包，识别封装在其他数据中的文件。
aliases:
  - Binwalk
  - 签名扫描
  - 递归提取
  - 嵌套归档
sources:
  - id: binwalk
    title: Binwalk v2.3.4 — Extractor
    publisher: ReFirmLabs
    url: https://github.com/ReFirmLabs/binwalk/blob/v2.3.4/src/binwalk/modules/extractor.py
    language: en
    kind: implementation
    locator: 递归队列、递归深度和提取规则
  - id: adapter
    title: AperiSolve Binwalk Analyzer
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/binwalk.py
    language: en
    kind: implementation
    locator: 单项调用、归档输出和递归限制
  - id: png
    title: PNG Specification, Third Edition
    publisher: W3C
    url: https://www.w3.org/TR/2025/REC-png-3-20250624/
    language: en
    kind: standard
    locator: §11.2.4，IEND
  - id: zip
    title: APPNOTE.TXT — ZIP File Format Specification
    publisher: PKWARE
    url: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
    language: en
    kind: standard
    locator: §4.3，归档成员、中央目录和结束记录
---

## 介绍
<!-- sources: binwalk, adapter -->

Binwalk 把待查文件当作一段原始字节流，寻找其中已知格式的签名和结构特征。分析固件、资源包或解谜附件时，报告可把内部的一段归档或压缩流定位到具体偏移，有匹配的提取规则时还可以展开其内容。

## 从签名到提取
<!-- sources: binwalk, adapter, zip -->

扫描要判断从哪个位置出现可能的格式。提取还需要知道应当从源文件截取多少字节，或者由对应的解包器读出归档成员。以 ZIP 为例，本地文件头提示可能的成员起点，读取完整成员还涉及压缩方法、中央目录、长度或校验字段。

## 递归层次与坐标
<!-- sources: binwalk, adapter -->

递归检查以新提取的文件为下一轮输入。树状结果应当保留父文件、提取层级和坐标原点。同一行里的偏移表示当前被扫描字节流中的位置。子文件来自压缩时，它的内部偏移一般无法通过简单加法换算成外层文件偏移。

## 组合数据的核对
<!-- sources: binwalk, png, zip -->

以下例子以容器规范核算边界。沿用同一组合样本，先观察格式起点，再按 ZIP 目录校验成员。第三例展示先切片再扫描的坐标变换。

:::example PNG 后附一份 ZIP
[输入]
一份 124 字节的完整 PNG，后紧接一份 140 字节的 ZIP。ZIP 仅含 proof.txt。
[结果]
PNG 起点为 0，后附 ZIP 的本地文件头位于 124（0x7C），组合长度 264 字节。
[说明]
PNG 结束边界是 IEND 的 CRC 后。ZIP 本地文件头的签名 50 4B 03 04 紧接在这个边界。用原字节而非重新保存的图片才能保留这一段。
:::

:::example 核验归档内容
[输入]
从上例组合文件的 124 起切出 140 字节。proof.txt 的验证数据是 6D 69 73 74 2D 66 6F 72 65 6E 73 69 63 73 2D 70 72 6F 6F 66 00 FF 80 0A。
[结果]
ZIP 的目录结束签名在组合文件的 242（0xF2），读出 proof.txt 应得到这 24 字节。
[说明]
目录结束记录在切片内位于 242 − 124 = 118。比较成员的原始字节可保留 00、FF 和 80。
:::

:::example 分清两份扫描结果的偏移
[输入]
先检查上例的组合文件，再单独检查从偏移 124 切出的 ZIP。
[结果]
同一个 ZIP 的本地文件头分别位于 124 和 0。
[说明]
这是未解压的连续切片，可用 124 + 0 对回应在原文件。解压后若成员内出现新的签名，则应另记成员坐标。
:::

## 嵌套材料的分析依据
<!-- sources: binwalk, adapter, zip -->

同一个输入可能报告多个重叠候选。已提取的结果应结合容器、成员名、大小和字节校验解释。归档采用新方法、材料被截断或达到提取限制时，格式命中仍可能有效，而成员没有完整展开。

## 常见误区

- 有 ZIP 签名不代表后面具备完整中央目录。
- 递归层数表示从当前材料展开到第几层，找到的文件数是另一个量。
- 子文件报告中的偏移默认以该子文件为原点，不能直接当作原文件偏移。

