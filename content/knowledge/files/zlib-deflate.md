---
capabilityId: pair:Zlib%20Deflate
title: Zlib 编码与解码
topicGroup: file-compression
summary: 识别 zlib 头部和尾部，把中间的 DEFLATE 流与未压缩数据校验联系起来。
aliases:
  - Zlib Deflate
  - Zlib Inflate
  - zlib 封装
sources:
  - id: def
    title: RFC 1951 DEFLATE Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1951
    language: en
    kind: standard
    locator: 第 3.2 节，紧密位流、三类数据块、长度和距离
  - id: zlib
    title: RFC 1950 ZLIB Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1950
    language: en
    kind: standard
    locator: 第 2.2～2.3 节，头部、可选词典和 Adler-32
  - id: engine
    title: CyberChef 11.5.0 压缩模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Zlib Deflate / Zlib Inflate：块模式、起始位置及 Verify result
---

## 介绍
<!-- sources: zlib, def -->
zlib 把一个 DEFLATE 流包在较短的结构中。它的头部说明压缩方法和状态位，末尾记录未压缩数据的 Adler-32。解码时要分清这是 zlib 外壳还是直接从 DEFLATE 块开始。

## 两字节头
<!-- sources: zlib -->
CMF 包含压缩方法及窗口大小的信息，FLG 记所用旗标和头部检查低位。前两字节合在一起时必须能被 31 整除。已有预设字典的流还能在头后携带相应标识。

## Adler-32 的位置
<!-- sources: zlib, engine -->
末尾四字节按大端存原始数据的 Adler-32。解码可在读回内容后复算。当前 Verify result 项决定是否检查它，能得出可读文本并不表示已执行核验。

## 两个头部和一个坏校验
<!-- sources: def, zlib, engine -->
下面的十六进制为固定模块的实际样本。

:::example Store 外壳
[输入]
HELLO，Zlib Deflate 选择 Store
[结果]
78 01 01 05 00 FA FF 48 45 4C 4C 4F 04 4C 01 75
[说明]
78 01 是头，中段为裸流，04 4C 01 75 是 HELLO 的 Adler-32。
:::

:::example 重复样本用固定码
[输入]
HELLOHELLOHELLOHELLOHELLO，固定 Huffman
[结果]
78 5E F3 70 F5 F1 F1 C7 46 00 00 5E 24 07 45
[说明]
去掉 zlib 两字节头和四字节尾后，可独立读取中间的 DEFLATE 流。
:::

:::example 改坏尾部一字节
[输入]
第一组示例的最后一字节 75 改成 74，以 Verify result 开启解码
[结果]
报告 Adler-32 校验无效
[说明]
修改校验字段不会改变中间块，关闭检查时仍可得到 HELLO。
:::

## 格式和字节的核对
<!-- sources: zlib, def, engine -->
若来源是协议字段，先确认是否有前缀或字典；同一个 Zlib 解码设置未必适合裸流。固定实现对极短或空压缩流也有边界，需用另一实现检查输出是否满足规范，而非仅凭同站回读。

## 常见误区
- Adler-32 对原始数据计算。
- 头的校验条件与尾部校验值用途不同。
- 可解压和已核验尾部校验不是同一个状态。
