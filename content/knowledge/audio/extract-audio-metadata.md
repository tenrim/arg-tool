---
capabilityId: op:Extract%20Audio%20Metadata
title: 提取音频元数据
topicGroup: audio
summary: 音频容器可以保存标题等标签、广播扩展块和内嵌文本。解析按文件字节定位这些结构并分别列出。
aliases:
  - Extract Audio Metadata
  - 音频标签
  - RIFF INFO
  - BWF bext
  - iXML
sources:
  - id: bwf
    title: EBU Tech 3285 — Broadcast Wave Format
    publisher: European Broadcasting Union
    url: https://tech.ebu.ch/files/live/sites/tech/files/shared/tech/tech3285.pdf
    language: en
    kind: standard
    locator: RIFF/WAVE 结构及 Broadcast Audio Extension
  - id: ebuxml
    title: EBU Tech 3352 — XML Identifiers in the BWF
    publisher: European Broadcasting Union
    url: https://tech.ebu.ch/publications/tech3352
    language: en
    kind: standard
    locator: aXML 的 XML 描述与广播波形元数据
  - id: v3
    title: ID3 Tag Version 2.3.0
    publisher: ID3.org
    url: https://id3.org/id3v2.3.0
    language: en
    kind: author-spec
    locator: 第 3、4 节，标记头、帧头及描述性字段
  - id: v1
    title: ID3v1
    publisher: ID3.org
    url: https://id3.org/ID3v1
    language: en
    kind: author-spec
    locator: 文件尾 128 字节布局与 TAG 标识
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Extract Audio Metadata，容器探测、标签家族、嵌入块与结构化结果
---

## 介绍
<!-- sources: bwf, v3, fixed -->
音频文件除了采样数据，还可保存标题、作者、项目、版权及制作记录。它们往往存在于容器特定的标签或块中。逐类读取这些结构可以发现文件作者明确放进去的信息，包括内嵌的文字。

## 容器结构与字节偏移
<!-- sources: bwf, fixed -->
WAV 以 RIFF 块组织内容。常见 fmt 块描述音频数据格式，data 块保存音频内容，其他块可以存放说明。块的字节大小用于计算位置。奇数字节载荷后面的对齐字节要计入位置计算，但不属于该块声明的载荷长度。

:::example 没有标题标签的 PCM 容器
[输入]
最简合成 WAV，内容含 fmt 和 data，后者有 4000 字节。
[结果]
报告可列出 16 字节的 fmt 块及 4000 字节的 data 块；标题字段为空。
[说明]
没有写入描述块时，程序仍能识别容器和字节范围。音频存在并不表示有标题或作者信息。
:::

## 广播波形与内嵌文字
<!-- sources: bwf, ebuxml, fixed -->
Broadcast Wave Format 可用 bext 记录制作说明、来源和时间参考。RIFF 的 INFO 条目也可保存标题。iXML 或 aXML 可以另外存放 XML 内容，适合用来发现已有的项目文本或结构化说明。

:::example 分开读出标题、来源及项目文字
[输入]
合成 WAV，LIST/INFO 的 INAM 为 North Tone，bext 来源为 Studio，iXML 的 PROJECT 为 North Puzzle。
[结果]
标准化标题为 North Tone，bext 中列出 Studio，可另外读取包含 North Puzzle 的 iXML 文本。
[说明]
这三项信息各来自不同块。XML 内容本身可作为独立资料核对。
:::

## 不同版本的 ID3 标签
<!-- sources: v3, v1, fixed -->
MP3 可能同时含 ID3v2 与 ID3v1。前者以可扩展的帧组织属性，后者通常用固定宽度的文件尾标记。统一的标题字段便于阅读，但复核冲突时仍有必要看原始分组，确认不同版本实际各保存了什么。

:::example 同一首音频中的两类标签
[输入]
合成 MP3，标题 North Tone、艺术家 Sample Author、专辑 Test Disc，同时写入 ID3v2.3 与 ID3v1。
[结果]
报告检出 id3v2 和 id3v1。常用字段列出标题、艺术家和专辑。
[说明]
两种标签都记录了这三项文字。它们是音频文件外层的描述字段。
:::

## 标签读取与声音本体
<!-- sources: bwf, v3, fixed -->
容器内的标签只能说明文件保存了哪些说明。它们没有转写录音里的语言和内容，也可能不覆盖每项采样参数。验证时长、声道和编码等技术属性时，可依据数据块或专门的媒体流探测结果。

## 常见误区
- 有音频数据的文件也可以不写标题。
- XML 块的字节数不同于其中的字符数，奇数长度还可能紧跟填充字节。
- 标题与作者信息可被改写，元数据提取属于对文件声明的读取。
