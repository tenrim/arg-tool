---
capabilityId: native:forensics-pcrt
title: PNG 损坏修复
topicGroup: image-stego
summary: PNG 损坏修复利用已知签名、块边界、CRC 或压缩数据关系寻找可复核的候选。
aliases:
  - PCRT
  - PNG 修复
  - IHDR CRC
  - PNG 尾随数据
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 5、11 节，签名、数据块、校验和标准块类型
  - id: repair
    title: Aperi’Solve 固定版本代码
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/utils/png.py
    language: en
    kind: implementation
    locator: PNG.repair、签名、IHDR、IDAT 与 IEND 修复
  - id: adapter
    title: Aperi’Solve 固定版本代码
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/pcrt.py
    language: en
    kind: implementation
    locator: 保存修复副本、日志和 IEND 后附加字节
---

## 介绍
<!-- sources: png, repair -->
PNG 格式有固定签名、若干必要数据块及每块的 CRC。对部分损坏，已知结构可帮助定位错误并验证修复。若缺失了大量信息，数据块只能提供有限线索，可能无法恢复原始图像。

## 恢复固定结构
<!-- sources: png, repair -->
当文件仍能辨认 IHDR、IDAT 和 IEND 等块时，可以比对开头是否是标准签名。固定签名只有一种正确字节排列。修复后仍须确认后续块能够准确读取。

:::example 恢复签名的第一个字节
[输入]
合成的有效 PNG，只把开头的 89 改为 00。
[结果]
签名恢复为 89 50 4E 47 0D 0A 1A 0A，其他字节与原样本一致。
[说明]
后续 IHDR、IDAT、IEND 块保留原数据。固定签名使本例的修复位置明确。
:::

## 用原 CRC 筛选 IHDR 尺寸
<!-- sources: png, repair -->
若怀疑只有宽或高被改写且 CRC 保留原值，可对候选尺寸计算 CRC。修复器可查已知常见尺寸或在可行范围内继续搜索。CRC 相同约束很强，但仍应结合图像解压和已知资料核对。

:::example 原宽度 1 被改成 2
[输入]
一张 1×1、8 位真彩色 PNG 的宽度字段改为 2，IHDR 原 CRC 907753DE 保留。
[结果]
将宽度恢复为 1 后计算值回到 907753DE，修复结果与原样本一致。
[说明]
此例只改了 IHDR 的宽度。IDAT 解压仍与原来的 1×1 像素数据相符。
:::

## 结束块与附加数据
<!-- sources: png, repair, adapter -->
IEND 的标准数据长度为零，块 CRC 也是固定值。若 IEND 后有额外字节，可记录并单独保存，以便检查是否是其他资料。修复器输出的是副本，原文件还可供比对块顺序和字节。

:::example 独立保存结束块之后的文字
[输入]
有效 PNG 的 IEND 及 CRC 之后追加 4E 4F 54 45。
[结果]
尾随字节可单独读出为 NOTE，标准 PNG 数据流结束位置不变。
[说明]
四个字节由尾随数据检查提取，不能把它当作修复后图像内部的 tEXt 值。
:::

## 修复成功的证据
<!-- sources: png, repair, adapter -->
修复涉及候选搜索时，需要复核实际修正了哪些字节，定位是否正确，以及其他块能否解压。无法恢复的情况应保留失败信息。简单改写 CRC、恢复签名和恢复丢失的像素分别具有不同的证据要求。

## 常见误区
- CRC 可以校验候选，却不能自动提供所有丢失的字节。
- 尾随数据可能是独立资料，分离后仍应保留原字节。
- 能显示一张修复副本，不必然意味着它与遗失的原件逐字节一致。
