---
capabilityId: native:forensics-steghide
title: Steghide 隐写提取
topicGroup: files
summary: 从支持的载体还原 Steghide 隐藏文件并保留数据字节与诊断。
aliases:
  - steghide
  - AperiSolve
  - Aperi’Solve
sources:
  - id: manual
    title: Steghide 官方手册
    publisher: Stefan Hetzl
    url: https://steghide.sourceforge.net/documentation/manual.pdf
    language: en
    kind: author-spec
    locator: Description、Extracting、Getting Information and Examples
  - id: adapter
    title: AperiSolve 分析器源码：steghide
    publisher: Zeecka / AperiSolve
    url: https://github.com/Zeecka/AperiSolve/blob/feec31092f0e548513d76545293caa41eb4f1ad8/aperisolve/analyzers/steghide.py
    language: en
    kind: implementation
    locator: 图片和音频的载体支持、口令和提取目录
  - id: doc
    title: Steghide File Format and Program Description
    publisher: Steghide 项目
    url: https://steghide.sourceforge.net/
    language: en
    kind: author-spec
    locator: 支持格式、嵌入名称及错误校验
---

## 介绍
<!-- sources: manual, doc -->

Steghide 把文件内容写入 JPEG、BMP、WAV 或 AU 的载体数据。读取方需要原本承载数据的文件和对应的口令。载体扩展名只能提供初步线索，具体内容还看文件格式。

## 密码驱动的定位
<!-- sources: manual, doc -->

Steghide 会从口令形成有固定顺序的选位，再从选定位置组装数据。它还支持压缩、加密和校验；正常读取按实际文件的设置还原。顺次读取可见像素的最低位不等同于重建 Steghide 记录。

## 文件头、记录名和还原
<!-- sources: manual, adapter -->

还原内容可以包含原文件名称。用于验收的数据应查看提取出的具体文件和完整字节，不能只按 ZIP 整包大小或文本预览判定。

:::example 用已知口令复核人工 JPEG
[输入]
steghide.jpg；公开样例口令 test
[结果]
payload.bin，24 字节
[说明]
还原文件包含不可见及非 UTF-8 字节，需使用字节读取验证。
:::

## 提取结果按二进制保存
<!-- sources: manual, adapter -->

文本状态只报告恢复进度。不同的系统可能给输出文件改名，完整文件应保持原始字节。内容末尾的 NUL、换行及高位字节也属于有效载荷。

:::example 检查样例的尾端
[输入]
对恢复的 payload.bin 查看最后四字节
[结果]
00 FF 80 0A
[说明]
这四字节不能无损替换为可读 UTF-8 字符。
:::

## 格式与并行证据
<!-- sources: manual, doc, adapter -->

可对照支持列表，复核文件是否能用上游载体解析。兼容格式只说明可以尝试读取；没有结果时还须分别考虑口令、原文件是否改写、以及是否使用了其他方案。

:::example 更换成单独的 PNG
[输入]
普通 PNG，即使后缀改写成 .jpg
[结果]
PNG 不属于原工具列出的支持载体
[说明]
后缀不会把 PNG 解码成 JPEG。
:::

## 常见误区

- 载体能打开不说明它含 Steghide 数据。
- 人工样例的口令只确定这份样例，不能用于其他文件。
- 文本误显示不会自动改变原始提取字节。

