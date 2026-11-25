---
capabilityId: op:XPRESS%20Decompress
title: XPRESS解压
topicGroup: file-compression
summary: 解码 Plain XPRESS 标志字和 LZ77 回引，恢复字面字节序列。
aliases:
  - XPRESS Decompress
  - Plain XPRESS
  - XPRESS LZ77
sources:
  - id: spec
    title: MS-XCA — Plain LZ77 Processing
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/b66751f2-be7b-4d20-a87c-5147c563ff2d
    language: en
    kind: standard
    locator: §2.3.4，标志与长度编码
  - id: engine
    title: CyberChef Compression 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: XPRESS Decompress，标志读取与负载边界
---

## 介绍
<!-- sources: spec -->

Plain XPRESS 是微软 XPRESS 压缩算法中直接编码 LZ77 字面量和匹配的一种格式。它把“逐字节读取”或“复制已经出现的片段”记在标志字里，重复出现的原始数据因此可以使用较短的表示。

## 标志字与字面量
<!-- sources: spec, engine -->

每个 32 位标志字在输入中采用小端排列，解码时从最高位起读取。标志 0 随后读取一个原样数据字节，标志 1 随后读取匹配记录。设有终止标志的流在处理该位时已无匹配记录可读，此时可结束解码。

## 回引记录的距离和长度
<!-- sources: spec -->

匹配记录的前两个字节构成小端值。高 13 位加 1 是回引距离，范围为 1 至 8192。低 3 位小于 7 时，长度等于该值加 3。低 3 位为 7 时要继续解读扩展长度。输出从当前位置减去距离的地方开始逐字节复制，复制过程中刚写出的字节也可以成为下一字节的来源。

## 短数据流的复原
<!-- sources: spec, engine -->

样例中的标志字均以四个字节开头，其余字节按最高位开始的指令次序解释。第三例的匹配长度大于回引距离，能检验解码端是否执行重叠复制。

:::example 三个原样字节
[输入]
00 00 00 10 41 42 43
[结果]
41 42 43
[说明]
标志字 0x10000000 的最高四位是 0001。前三位是字面量，第四位到达输入尾部。
:::

:::example 复制单字节
[输入]
00 00 00 60 41 00 00
[结果]
41 41 41 41
[说明]
标志位以 011 开头。读入一个 41，再用记录 0x0000 从距离 1 处复制 3 字节。
:::

:::example 复制两字节周期
[输入]
00 00 00 30 41 42 09 00
[结果]
41 42 41 42 41 42
[说明]
标志位以 0011 开头。匹配记录 0x0009 的高位字段为 1，距离为 2，低位字段为 1，长度为 4。
:::

## 容器中的算法区分
<!-- sources: spec, engine -->

外部容器的算法号和数据偏移用于确定应该怎样解释负载。XPRESS 的 Huffman 变体先读取码长表，把其中的字节放在这里当标志字会得到不同指令。识别 Plain XPRESS 时，可以寻找容器声明，再核对回引距离和预期的展开长度。

## 常见误区

- 标志字的字节排列是小端，取位次序仍由高位到低位。
- 短匹配的低 3 位存的是长度减 3，零值对应复制 3 字节。
- 已用完标志位后才读取新标志字，不能每读四个负载字节就当作标志字。

