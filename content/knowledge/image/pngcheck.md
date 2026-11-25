---
capabilityId: native:forensics-pngcheck
title: PNG 完整性检查
topicGroup: image-stego
summary: PNG 的完整性检查核对文件签名、数据块顺序、CRC 以及可解压的图像数据。
aliases:
  - pngcheck
  - PNG CRC
  - PNG 完整性
  - PNG 块顺序
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 5、11 节，签名、数据块、校验和标准块类型
  - id: tool
    title: pngcheck Home Page
    publisher: pngcheck 维护者
    url: https://www.libpng.org/pub/png/apps/pngcheck.html
    language: en
    kind: official-doc
    locator: 检查块的 CRC 与解压图像数据
  - id: adapter
    title: Aperi’Solve 固定版本代码
    publisher: Aperi’Solve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/pngcheck.py
    language: en
    kind: implementation
    locator: 对原有 PNG 运行 pngcheck -v 并返回诊断
---

## 介绍
<!-- sources: png, tool, adapter -->
PNG 完整性检查从签名和数据块开始。检查器可读图像结构、核对校验值和块顺序，并确认 IDAT 中的压缩数据可解开。报告可用于区别类型已识别但内容不完整的情况。

## 块的 CRC 计算范围
<!-- sources: png, tool -->
PNG 的每个数据块带有 CRC-32，计算对象是四字节块名和整个载荷，不含前面的长度字段。检查时把重算值与记录值比较。两者不同说明某处数据、类型或校验值已不一致。

:::example 复算固定的 IEND 校验值
[输入]
00 00 00 00 49 45 4E 44 AE 42 60 82
[结果]
IEND 的 CRC 为 AE426082，与所附校验值相同。
[说明]
长度为零，参与 CRC 计算的只有 IEND 对应的四个 ASCII 字节。
:::

## 查找不一致的区段
<!-- sources: png, tool, adapter -->
若只有一块校验不正确，可先定位该块在文件中的位置。重算 CRC 后还需检查块数据是否符合既有像素和格式约束。存储 CRC 与计算 CRC 的差异本身不能指出哪个字段原来正确。

:::example 一字节改变导致校验失败
[输入]
IEND 的类型与长度保持有效，末尾 CRC 由 AE426082 改为 AE426083。
[结果]
记录值 AE426083，计算值 AE426082，IEND CRC 不匹配。
[说明]
IEND 的内容为空，计算仍只读类型。差异位于本例中改写的末尾 CRC。
:::

## 顺序与压缩流
<!-- sources: png, tool -->
IHDR 应最先出现，IEND 应最后出现。一个图像的多个 IDAT 连续承载同一个 zlib 数据流。即使分别核对块的 CRC 都通过，拼接后仍需要能够解压并符合图像扫描线的要求。

:::example 宽度变化留下旧校验
[输入]
有效的 1×1、8 位真彩色 PNG，把 IHDR 宽度改成 2，保留原来的 CRC 907753DE。
[结果]
按改写后的 IHDR 计算得 7B40E8DD，由此定位 IHDR 的 CRC 异常。
[说明]
这两项都不能单独证明原始宽度。还可结合解压的扫描线与文件来源核实。
:::

## 诊断结果的解释
<!-- sources: png, tool, adapter -->
损坏可能在文件开始、块边界、校验或解压阶段被发现。报告若有一项不符合，应保留具体位置和错误内容。CRC 用于检出多类意外数据变化，来源验证还需要独立证据。

## 常见误区
- 图片可以被某个查看器勉强打开，仍可能存在完整性错误。
- CRC 匹配与内容来源可信是两项不同结论。
- 修改存储 CRC 有时可让校验通过，但无法证明这种修改恢复了原始数据。
