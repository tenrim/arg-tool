---
capabilityId: op:Zip
title: ZIP 压缩
topicGroup: file-compression
summary: 将文件写入 ZIP 归档，区分成员数据、压缩方法和中央目录。
aliases:
  - Zip
  - ZIP archive
  - PKZIP
  - ZIP 中央目录
sources:
  - id: spec
    title: APPNOTE.TXT — ZIP File Format Specification 6.3.10
    publisher: PKWARE
    url: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
    language: en
    kind: standard
    locator: §4.3–4.4，记录与方法字段，§6.1，传统加密
  - id: engine
    title: CyberChef Compression 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Zip，写入单个成员及其目录信息
---

## 介绍
<!-- sources: spec -->

ZIP 归档以成员为单位保存文件名、长度、CRC 和压缩数据，可把多个成员装入同一文件。一份 ZIP 中的各成员可以用不同方法存放，最常见的两个方法是原样存储和 DEFLATE。

## 本地文件头与中央目录
<!-- sources: spec -->

普通 ZIP 在每个成员前写入本地文件头，并在文件尾附近写入中央目录和目录结束记录。中央目录含有成员的多项元数据和指向本地头的偏移，便于列目录而不必逐件展开。成员注释可以记录在中央目录中，整个归档也有自己的独立注释字段。

## 存储、压缩与检验
<!-- sources: spec, engine -->

方法 0 将成员内容原样存储，方法 8 使用 DEFLATE。未压缩长度用于确定输出大小，CRC-32 可用来检查展开后的字节是否意外损坏。比较压缩效果时要分开看成员压缩数据和整个归档大小，短文件的本地头、目录和附加字段可能比内容本身更长。

## 单成员归档实例
<!-- sources: spec, engine -->

下面三个归档在中央目录中各有一条成员记录。对未加密的两个结果，可以用独立读取器对照方法、注释和内容。加密码的样例另外比较标志位和跨软件读取行为。

:::example 原样存储
[输入]
HELLO，文件名 note.txt，成员注释 demo，选择原样存储。
[结果]
成员长度 5 字节，方法 0，注释 demo，读出 HELLO。
[说明]
成员压缩前后均为 5 字节，CRC-32 为 C1446436。
:::

:::example 重复内容使用 DEFLATE
[输入]
HELLO 连写 5 次，文件名 long.txt，选择 DEFLATE 的固定哈夫曼方式。
[结果]
成员方法 8，原长 25 字节，压缩数据 9 字节，还原为 HELLOHELLOHELLOHELLOHELLO。
[说明]
方法字段只标记 DEFLATE，不把其内部块类型另记为 ZIP 方法。
:::

:::example 加密标志与读取结果
[输入]
HELLO，文件名 note.txt，使用 DEFLATE，测试口令 DEMO-PASSWORD。
[结果]
成员通用标志的最低位被置为 1。Python 3.14 的 zipfile 使用同一口令读取时报告口令错误。
[说明]
这一结果证明写入了加密标记，同时说明该生成样例未通过所测读取器的往返校验。
:::

## 目录信息与解谜应用
<!-- sources: spec, engine -->

中央目录通常可独立提供成员名和成员注释等线索。分析未知记录时，可用本地头与中央目录交叉核对名称和方法，并依据方法、通用标志及独立解包结果判断内容是否确实可读。ZIP 的传统加密和较新的加密扩展有不同约定，通用加密位本身不说明采用何种扩展。

## 常见误区

- 存储方式是 ZIP 的合法选项，文件有 ZIP 目录不代表全部成员经过压缩。
- 方法 8 填写的是 DEFLATE 流，不能把 gzip 的头尾直接算入成员负载。
- CRC-32 校验成功能发现某类意外改动，不能用来证明作者身份。

