---
capabilityId: op:Extract%20ID3
title: 提取 ID3 标签
topicGroup: audio
summary: ID3 在音频外层保存标题、艺术家、专辑等说明。ID3v2 按帧组织可扩展的字段，ID3v1 常位于文件末尾。
aliases:
  - Extract ID3
  - ID3v2
  - ID3v1
  - 音频标签帧
  - MP3 标题
sources:
  - id: v3
    title: ID3 Tag Version 2.3.0
    publisher: ID3.org
    url: https://id3.org/id3v2.3.0
    language: en
    kind: author-spec
    locator: 第 3、4 节，标记头、帧头及描述性字段
  - id: v4
    title: ID3 Tag Version 2.4.0 — Main Structure
    publisher: ID3.org
    url: https://id3.org/id3v2.4.0-structure
    language: en
    kind: author-spec
    locator: 第 3、4、6.2 节，首部、帧与同步安全整数
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
    locator: Extract ID3，识别 ID3v2 首部和解出帧
---

## 介绍
<!-- sources: v1, v3, v4 -->
ID3 是常见的音频标签体系。ID3v2 的数据由标记头及若干帧组成，能够保存标题、艺术家等文字，还能存放封面关联的数据。ID3v1 使用固定长度，通常位于音频文件尾部。

## 从文件头识别版本与长度
<!-- sources: v3, v4, fixed -->
ID3v2 头部常由 ASCII 的 ID3 起始，随后记录主版本、修订、标志及标记大小。标记大小字段使用同步安全表示，每个字节只取低七位，位置权重依次为 128 的幂。版本还会影响帧头本身的解释。

:::example 读出 ID3v2.3 标记头
[输入]
49 44 33 03 00 00 00 00 00 66
[结果]
标记为 ID3v2.3.0，标志为 0，标记大小为 102 字节。
[说明]
49 44 33 对应 ID3。最后四字节中只有低位的 66（十六进制）非零，值是 102。
:::

## 文本帧的含义和编码
<!-- sources: v3, v4, fixed -->
ID3v2 中 TIT2 指标题，TPE1 指主要表演者，TALB 指专辑名称。文本帧自身有编码标记。提取输出可能显示末尾终止字符，复查时还可根据原帧长度和字符编码确认有效文字。

:::example 识别三条独立的描述
[输入]
MP3 的 TIT2 = North Tone，TPE1 = Sample Author，TALB = Test Disc。
[结果]
标题为 North Tone，艺术家为 Sample Author，专辑为 Test Disc。
[说明]
三个值来自不同帧，不能用任意一个值自动补齐其他帧。
:::

## 只有 ID3v1 的文件
<!-- sources: v1, v3, fixed -->
ID3v1 在最后 128 字节使用 TAG 标识以及固定宽度字段。以 ID3v2 首部为入口的读取方式不会因此发现 ID3v2。更全面的标签检查须分别确认文件头和文件尾是否带有可解析的结构。

:::example 去掉 v2 首部后仍有尾标记
[输入]
从合成 MP3 去掉完整 ID3v2 标记，保留音频数据和原有最后 128 字节。
[结果]
只找 ID3v2 首部的提取无有效头部。支持 ID3v1 的标签读取仍可得到标题 North Tone。
[说明]
TAG 在文件末尾仍存在，没有 ID3v2 与没有所有标签是两种情况。
:::

## 声音数据与标签证据
<!-- sources: v1, v3, v4 -->
标签和声音数据按不同结构保存。即使某个音频标签列出作者和作品名，这些字段也只能表明文件如何声明。比较不同副本时，可以分别核对标签结构和实际音频流。

## 常见误区
- ID3v1 与 ID3v2 分属不同布局，读取方式也不同。
- ID3v2 的标记长度不能把最后四字节直接当作普通的 32 位大端整数。
- 标题、表演者和专辑是不同帧，标签文字不会从声音自动推断。
