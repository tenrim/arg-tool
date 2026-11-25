---
capabilityId: pair:Tar
title: Tar
topicGroup: file-compression
summary: 以 512 字节块组织归档成员，按头部记录恢复文件的名称和内容。
aliases:
  - Tar
  - Untar
  - POSIX ustar
  - TAR 归档
sources:
  - id: gnu
    title: GNU tar — Basic Tar Format
    publisher: GNU Project
    url: https://www.gnu.org/software/tar/manual/html_node/Standard.html
    language: en
    kind: official-doc
    locator: Appendix E.1，512 字节块和头部布局
  - id: engine
    title: CyberChef Compression 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Compression.js
    language: en
    kind: implementation
    locator: Tar / Untar，单成员封装与逐成员读取
---

## 介绍
<!-- sources: gnu -->

Tar 将文件内容连同名称、类型、权限等信息组织成顺序归档。一个归档可以有多个成员，成员的实际内容仍以原始字节存储。扩展名 `.tar.gz` 表示外层另有 gzip，解开 gzip 后才得到 Tar 序列。

## 头部字段与数据对齐
<!-- sources: gnu -->

传统 ustar 头部占 512 字节，名称在开头，文件长度从偏移 124 起以 ASCII 八进制字段记录，类型标记位于偏移 156。头部后面存放文件内容，最后一个内容块不足 512 字节时补齐，末尾通常另有两个全零块。512 字节对齐让读取者可从一条成员的长度算出下一条成员头的位置。

## 类型与完整性
<!-- sources: gnu, engine -->

普通文件、目录和链接使用不同的类型标记，一条记录不一定带有文件内容。头部校验用于发现头部字段的破损。核验普通文件内容时，应从头部指示的区域取出恰好声明长度的字节，并另外比较独立获得的内容或摘要。

## 归档及读取示例
<!-- sources: gnu, engine -->

短样例同时验证名称、原始内容与结构长度。最后一个样例展示较长负载需要完整的最后一个数据块，以及源归档器缺少这段填充时出现的差异。

:::example 单成员文本
[输入]
将 HELLO 归档为 note.txt。
[结果]
2048 字节归档，读取 note.txt 得到 HELLO。
[说明]
占用一个 512 字节头块、一个内容块和两个全零结束块。头部声明的文件长度为 5。
:::

:::example 文件中的零字节
[输入]
将 00 01 FF 00 四个字节归档为 raw.bin。
[结果]
2048 字节归档，读取 raw.bin 得到 00 01 FF 00。
[说明]
成员内的零字节保留，读取数据和起始偏移由归档头确定。
:::

:::example 跨块数据与填充
[输入]
将 WORLD 连续重复 130 次得到 650 字节，归档为 long.txt。
[结果]
按基本 ustar 结构应为 2560 字节。当前固定归档器输出 2186 字节，本站解档时报错。
[说明]
正常结构为 512 + 1024 + 1024 字节。输出缺少 374 字节的内容块填充，部分较宽容的解析器仍能读出首成员。
:::

## 容器证据与解谜应用
<!-- sources: gnu, engine -->

连续内容里的文件名、成员类型、修改时间和成员先后顺序都可能是线索。归档允许重复成员名，比较内容时可以同时记下归档中的成员序号和长度。遇到末尾标记缺失或填充不齐的材料，能读取首成员只说明该部分可以恢复。

## 常见误区

- Tar 本身只归档，`.tar.gz` 包含额外的 gzip 压缩层。
- 成员恰好出现一个全零内容块，不能据此断定归档结束。
- 同名的后一个成员不一定与前一个内容相同，名称无法唯一标识归档内的一条记录。

