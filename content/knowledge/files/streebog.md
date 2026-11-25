---
capabilityId: op:Streebog
title: Streebog 哈希
topicGroup: file-compression
summary: 用 RFC 6986 向量说明 Streebog 的 512 位状态、两个起始值与摘要字节顺序。
aliases:
  - Streebog
  - GOST R 34.11-2012
  - RFC 6986
sources:
  - id: rfc
    title: RFC 6986 GOST R 34.11-2012 Hash Function
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6986.txt
    language: en
    kind: author-spec
    locator: 第 6 至 10 节，尤其 10.1 的双实例
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: Streebog-256 和 Streebog-512
---

## 介绍
<!-- sources: rfc -->

Streebog 是 GOST R 34.11-2012 哈希。两种实例计算内部都使用 512 位状态，分别导出 256 位与 512 位摘要。RFC 6986 说明算法及中间值，但文档的性质为信息性译述。

## 压缩和末块
<!-- sources: rfc -->

压缩使用逐字节替换 S、字节置换 P 与线性变换 L，对消息块和状态反复混合。中间记录已处理的原始消息位数 N 与块的模加和。向最后不足一块的消息附加规定补位后，先压缩消息块，再把总位数和模加和分别送入尾部压缩。

:::example 计算 63 字节的计数
[输入]
六遍 0123456789 后接 012。
[结果]
共 63 字节，即 504 位，节点最后记录的 N 为十六进制 01f8。
[说明]
一字节补齐完成 64 字节块，补齐不增加原消息的长度。
:::

## 两种初始化
<!-- sources: rfc, engine -->

512 位实例从全零初始化，256 位实例以 64 个值为 01 的字节初始化。短版本不是从同一个长版本的摘要直接截出。标准给出同一测试消息的两套演算，以便确认初始化是否正确。

:::example 256 位标准向量
[输入]
六遍 0123456789 加 012，按所见顺序取 ASCII 字节。
[结果]
9d151eefd8590b89daa6ba6cb74af9275dd051026bb149a452fd84e5e57b5500
[说明]
这个字节顺序表示与 RFC 6986 第 10.1.2 节的整体数学向量显示方向相反。
:::

## 数学向量与字节串
<!-- sources: rfc, engine -->

RFC 的示例把最末端输入字节放在数学向量表示的开头，显示摘要时也使用向量次序。按文件字节顺序使用该测试向量时，应逐字节转换两边的表示。直接把 RFC 的十六进制字符当作 ASCII 输入不会复现同一结果。

:::example 同一消息的 512 位摘要
[输入]
按 ASCII 读取前例的 63 个数字字符，计算 Streebog-512。
[结果]
1b54d01a4af5b9d5cc3d86d68d285462b19abc2475222f35c085122be4ba1ffa00ad30f8767b3a82384c6574f024c311e2a481332b08ef7f41797891c1646f48
[说明]
在 RFC 的向量顺序中，首四字节为 48 6f 64 c1，恰是本结果尾端的反序。
:::

## 复算时的版本核对
<!-- sources: rfc, engine -->

日志中的 GOST 或长度字段不足以唯一确定规范。对来源明确的 2012 年格式，可先复算官方向量确认版别与输出顺序，再比较原件数据。Streebog 执行没有旧 1994 版替换表的选择。

## 常见误区

- 256 位实例拥有独立起始值，并非简单截取正常 512 位输出。
- RFC 数学向量的显示次序需要先与字节流约定核对。
- Streebog 的名称不适用于 GOST R 34.11-94。
