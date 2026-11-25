---
capabilityId: pair:LZMA%20Compress
title: LZMA 压缩与解压
topicGroup: file-compression
summary: 解释 LZMA 的字典匹配与范围编码，识别 LZMA-Alone 外层。
aliases:
  - LZMA Compress
  - LZMA Decompress
  - LZMA-Alone
  - LZMA 字典
sources:
  - id: sdk
    title: LZMA Specification
    publisher: Igor Pavlov / LZMA SDK
    url: https://github.com/jljusten/LZMA-SDK/blob/master/DOC/lzma-specification.txt
    language: en
    kind: author-spec
    locator: LZMA 数据流模型、范围解码和头部结构
  - id: xz
    title: XZ File Format
    publisher: Lasse Collin / XZ Utils
    url: https://tukaani.org/xz/xz-file-format.txt
    language: en
    kind: author-spec
    locator: XZ 容器标识与独立块结构
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: LZMA Compress / Decompress：模式、压缩输出和字节回读
---

## 介绍
<!-- sources: sdk, xz -->
LZMA 利用先前出现的数据作为字典，以距离和长度表示重复序列，再用范围编码压缩这些符号。LZMA 数据可以被多种文件容器包裹，单一 .lzma 与 .xz 的文件结构并不一样。

## 头部与字典配置
<!-- sources: sdk, engine -->
固定实现产生 LZMA-Alone 形态。在 13 字节头中，第一个字节是模型属性，随后四字节记录字典大小，接着八字节记录原始长度，均按该格式规定解释整数。数据体才是实际的 LZMA 流。

## 模式与兼容性
<!-- sources: sdk, xz, engine -->
压缩模式影响诸如字典大小等编码策略，不改变正确回读的内容。Alone 外层可声明已知长度或未知长度，解码器对已知长度及终止标记一起出现的处理可能不同。不要只靠扩展名将它当成 XZ。

## 小字节样本
<!-- sources: sdk, engine -->
以下是固定引擎实际写出的头部，以及同引擎的回读。外部兼容性需独立检查。

:::example 五字节正文
[输入]
HELLO，模式 1
[结果]
头部 5D 00000100 0500000000000000；总长 28 字节
[说明]
以小端读出字典 65536 字节和原长 5，回读为 HELLO。
:::

:::example 调高模式
[输入]
HELLO 重复五次，模式 9
[结果]
头部 5D 00000002 1900000000000000；总长 30 字节
[说明]
小端字典字段为 0x02000000，原始长度为 25 字节。
:::

:::example 保留不可打印样本
[输入]
00 01 FF 00，模式 1
[结果]
27 字节的输出；固定解码器还原 00 01 FF 00
[说明]
头的原长字段为 04 00 00 00 00 00 00 00，文本外观不影响压缩。
:::

## 使用外部解码器核对
<!-- sources: sdk, xz, engine -->
实测上述固定引擎输出在另一个遵循 liblzma 的示例环境中，以原样 Alone 解码会报损坏；在诊断中将大小字段标为未知后可复原相同正文。跨实现交换应验证完整文件，不能以本站能回读为通用兼容结论。

## 常见误区
- LZMA 是算法，XZ 是专门的封装格式。
- 头部的原始大小是未压缩的字节数。
- 不同压缩模式的流可还原为同一份数据。
