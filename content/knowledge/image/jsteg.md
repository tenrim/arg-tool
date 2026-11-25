---
capabilityId: native:forensics-jsteg
title: JSteg 隐写提取
topicGroup: image-stego
summary: 直接读取 JPEG 量化系数中的 JSteg 数据并保存完整二进制输出。
aliases:
  - jsteg
  - AperiSolve
  - Aperi’Solve
sources:
  - id: git
    title: lukechampine/jsteg 固定源码
    publisher: Luke Champine
    url: https://github.com/lukechampine/jsteg/tree/cf206c26c711db215c11cb61bb479113ae8be275
    language: en
    kind: implementation
    locator: README、命令行 reveal 与 JPEG 系数读取
  - id: adapter
    title: AperiSolve 分析器源码：jsteg
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/jsteg.py
    language: en
    kind: implementation
    locator: JPEG 适用范围和 reveal 调用
  - id: jpeg
    title: ITU-T T.81：Digital Compression and Coding of Continuous-tone Still Images
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-T.81
    language: en
    kind: standard
    locator: DCT 变换、量化、熵编码和 JPEG 文件结构
---

## 介绍
<!-- sources: git, jpeg -->

JSteg 旧式隐写方案使用 JPEG 压缩过程中的量化系数，而不是显示后的像素数组。恢复需要原 JPEG。这里采用的上游 reveal 接口直接返回文件里的隐藏字节，没有额外要求口令。

## JPEG 系数与显示像素
<!-- sources: jpeg, git -->

常见 JPEG 图像通过分块余弦变换、量化和熵编码存储。系数的信息在解码到 RGB 时已转换，保存成视觉相同的 PNG 也不会保留原 JPEG 的系数序列。

:::example 识别适用输入
[输入]
把测试 JPEG 解码后另存为 PNG
[结果]
PNG 不再是同一个 JSteg 载体
[说明]
保留原 .jpg 的字节才有机会恢复。
:::

## 从载体解出原文件
<!-- sources: git, adapter -->

读取按 JSteg 定义组织的数据。对可信测试件，核对结束时不仅要检查进程状态，还要确认恢复文件与预期字节一致。

:::example 提取人工 JPEG
[输入]
用于验证的 jsteg.jpg
[结果]
jsteg-extracted.bin，24 字节
[说明]
恢复接口把原始二进制输出写入提取文件。
:::

## 能显示的文本与完整字节
<!-- sources: git, adapter -->

二进制输出可能包含可打印行、控制符和非法 UTF-8 序列。文本预览适合寻找关键词，不能代替下载的实际文件。

:::example 从字节确认末端
[输入]
查看样例 jsteg-extracted.bin 的最后四字节
[结果]
00 FF 80 0A
[说明]
00 为 NUL，FF、80 也不应被替代字符覆盖。
:::

## 专用提取与线索核对
<!-- sources: jpeg, adapter -->

如果另一个工具从同一图像提取到似乎可读的信息，仍应查其具体算法和源材料。不同 JPEG 隐写器可能都改动系数，但包头和选位规则不同。

## 常见误区

- 普通图片像素最低位不是 JSteg 的读取对象。
- 空白或乱码的预览不能否定有完整提取文件。
- JPEG 隐写提取器并不共享同一格式。

