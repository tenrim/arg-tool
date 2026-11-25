---
capabilityId: op:Unzip
title: 解压 ZIP
topicGroup: file-compression
summary: 根据 ZIP 中央目录选择条目，依其压缩方法读取原始文件字节。
aliases:
  - ZIP
  - 解包
  - 中央目录
sources:
  - id: zip
    title: APPNOTE.TXT — ZIP File Format Specification
    publisher: PKWARE
    url: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
    language: en
    kind: standard
    locator: 第 4 节的本地头、中央目录、结束记录与校验
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入输出与模式
  - id: archive
    title: ZIP 目录和单项解压
    publisher: 迷雾工具箱
    url: /round2/archive-engine.js
    language: zh-CN
    kind: implementation
    locator: listArchive、extractArchive、解压与 CRC32
  - id: guide
    title: 工具页 ZIP 操作说明
    publisher: 迷雾工具箱
    url: /chef-tools/guidance.js
    language: zh-CN
    kind: implementation
    locator: Unzip 引导，目录、选中条目与完整配方
---

## 介绍
<!-- sources: zip, archive -->

ZIP 文件把单独的成员数据、目录和校验组织在一个容器内。解析时可以先查看成员路径和尺寸，再按需要读取一个或多个成员。文件扩展名不能代替容器结构。

## 中央目录与本地头
<!-- sources: zip, archive -->

中央目录为每个成员保留名称、方法、压缩前后长度、CRC32 等信息，并引用本地头。目录的结束记录可用于定位它。只找到一个本地头签名不说明能读取整份归档。

:::example 列出合成容器
[输入]
ZIP 成员 docs/a.txt、raw.bin、empty
[结果]
目录列出 3 项，原始尺寸分别为 1、2、0 字节
[说明]
路径和长度来自成员目录。
:::

## 按成员解压
<!-- sources: zip, archive, guide -->

常见 ZIP 成员可直接存储或使用 Deflate。提取时读取该成员的数据区，按方法恢复字节，再核对长度与校验。此工具页里的选中解压和配方中上游 Unzip 的整体处理属于不同使用入口。

:::example 只读取一个二进制文件
[输入]
在前例中选 raw.bin
[结果]
还原为 00 FF，长度 2 字节
[说明]
其他成员无需一同展开，文本换码不会介入原字节。
:::

## 零长度与校验意义
<!-- sources: zip, archive -->

零长度数据是合法成员，压缩后的流本身仍可有控制字节。CRC 主要用于发现意外传输变化，不是签名或作者认证。

:::example 空成员的校验
[输入]
前例的 empty
[结果]
数据长度 0，CRC32 为 00000000
[说明]
归档保留名称和压缩流，提取文件仍为空。
:::

## 兼容性取决于读取器
<!-- sources: zip, archive, chef -->

ZIP 标准定义了加密、扩展尺寸、分卷和多种压缩方法。读取器支持哪些特性需要查对应入口。归档名正常但无法列目录时，先确认文件是否完整、是否使用了非支持的成员特性。

## 常见误区

- ZIP 的中央目录与每个成员的数据区不是同一段。
- 空文件可有合法名称，也可以占少量压缩数据。
- CRC32 通过不能证明成员安全或来自指定作者。

