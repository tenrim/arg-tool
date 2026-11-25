---
capabilityId: op:XPRESS%20LZ77%2BHuffman%20Decompress
title: XPRESS LZ77+Huffman解压
topicGroup: file-compression
summary: 从码长表重建规范哈夫曼码，再将字面量和匹配还原为字节。
aliases:
  - XPRESS LZ77+Huffman Decompress
  - XPRESS Huffman
  - XPRESS HUFF
sources:
  - id: spec
    title: MS-XCA — LZ77+Huffman Processing
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/26db8e62-bbd8-472c-a09e-623f6de10f0b
    language: en
    kind: standard
    locator: §2.2.4，码长表和规范哈夫曼码
  - id: engine
    title: CyberChef Compression 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: XPRESS LZ77+Huffman Decompress，位流与期望输出长度
---

## 介绍
<!-- sources: spec -->

XPRESS LZ77+Huffman 先把输入表示为字面量和匹配，再用哈夫曼码写入这些符号。解码器先依据码长表还原编码规则，随后解析比特流，将直接值写到输出或从已写区域复制。

## 256 字节码长表
<!-- sources: spec, engine -->

每块的前 256 字节表示 512 个符号的码长。一个表字节的低四位指定偶数编号符号的码长，高四位指定下一个奇数编号符号。码长为零表示该符号在本表中未分配编码。其余符号按码长从短到长、同码长按编号从低到高的次序，分配规范哈夫曼码。

## 解码位流与符号
<!-- sources: spec, engine -->

数据按小端 16 位字装入位缓冲，解码时先取该字的高位。编号 0 至 255 的符号直接表示相应字节，其余符号关联匹配或终止逻辑。下列专门构造的短流只使用字面量和编号 256 的终止符号。

## 可重建的短流
<!-- sources: spec, engine -->

表中的偏移均从 0 开始，其余位置全部填零。数据尾部的零字为位读取保留空间。三份样例把压缩流中的前缀码分开检验，即便不具备压缩端也可以从表和比特流手算出结果。

:::example 一个字面量
[输入]
256 字节的码长表，仅偏移 32 为 10、偏移 128 为 01。表后追加 00 40 00 00 00 00，期望长度 1。
[结果]
41
[说明]
表中 A 的码长为 1，编号 256 的码长也为 1。码分别为 0 与 1，0x4000 的头两位是 01。
:::

:::example 三个相同字面量
[输入]
256 字节的码长表，仅偏移 32 为 10、偏移 128 为 01。表后追加 00 10 00 00 00 00，期望长度 3。
[结果]
41 41 41
[说明]
0x1000 从高位读出 0001。前三个代码 0 各自产生 A，最后的 1 结束。
:::

:::example 混合码长
[输入]
256 字节的码长表，仅偏移 32 为 20、偏移 33 为 02、偏移 128 为 01。表后追加 00 B8 00 00 00 00，期望长度 3。
[结果]
41 42 41
[说明]
编号 256 占用码 0，A 和 B 分配为 10、11。0xB800 从高位读作 10 11 10 0。
:::

## 展开长度与完整记录
<!-- sources: spec, engine -->

展开长度可来自外层容器或已知记录布局。在第二个样例中把期望长度填为 2，解码器会因第 3 个字节超出声明长度而报错。核对长度时应使用原始字节数，例如检查文件记录的解压大小字段，或者比较不同解析器恢复的字节。

## 常见误区

- 码长表的每个半字节记录一项长度，不能把一整个字节当成一个符号。
- 码长为零代表未分配，该符号不会产生一个可以读取的空码。
- Huffman 变体的起始数据是码长表，Plain XPRESS 的起始数据是标志字。

