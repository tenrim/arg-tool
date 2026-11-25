---
capabilityId: native:hex-editor
title: 十六进制编辑器
topicGroup: files
summary: 按字节偏移检查、覆盖、插入或删除数据，比较有符号和不同字节序的整数。
aliases:
  - hex
  - 十六进制
  - offset
sources:
  - id: view
    title: ECMAScript DataView Objects
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/structured-data.html#sec-dataview-objects
    language: en
    kind: standard
    locator: 整型视图、字节序与读取边界
  - id: file
    title: File API
    publisher: W3C
    url: https://www.w3.org/TR/FileAPI/
    language: en
    kind: standard
    locator: Blob 和 File 的字节边界
  - id: core
    title: 十六进制文档模型
    publisher: 迷雾工具箱
    url: /hex/model.js
    language: zh-CN
    kind: implementation
    locator: HexDocument、inspectBytes
---

## 介绍
<!-- sources: view, core -->

十六进制编辑器把文件显示成一串字节值，并以偏移标记每个字节的位置。它对字节修改直接生效，用于观察格式字段或按已知边界编辑。

## 字节值与偏移
<!-- sources: file, core -->

每个字节用两个十六进制数码表示。从文件开头的偏移 0 起数。选择一段数据显示成文本时，不可打印的字节通常用点代替，其数值仍不变。

:::example 在首段查看字节
[输入]
字节 01 02 41 FF，从偏移 0 查看四字节
[结果]
十六进制 01 02 41 FF；ASCII 显示 ..A.
[说明]
41 可打印为 A；点只属于预览。
:::

## 多字节整数与字节序
<!-- sources: view, core -->

大小端决定多个字节组合成整数时的数位权重。读取无符号整数、有符号整数或浮点数都是在同一字节串上选择一种解释。

:::example 两个字节的两个数
[输入]
01 02，从偏移 0 看 16 位无符号数
[结果]
小端 513；大端 258
[说明]
小端为 1+2×256，大端为 1×256+2。
:::

## 覆盖与结构性编辑
<!-- sources: file, core -->

覆盖写入同量的字节，后方偏移不变。插入或删除会改变长度，后续字节全部移位。依存偏移、长度字段和校验值的格式通常需要额外处理。

:::example 同一位置的不同操作
[输入]
原字节 41 42 43，在偏移 1 放入 5A
[结果]
覆盖：41 5A 43；插入：41 5A 42 43
[说明]
两个操作的区别是旧 42 被替换或右移。
:::

## 撤销与原始文件
<!-- sources: file, core -->

编辑器保留原始输入和当前副本。撤销可以回到历史可保留的状态，保存应导出当前字节再确认。有文件校验或解析失败时，应检查修改边界、长度及字节序。

## 常见误区

- 偏移从 0 计，和行号不是同一个概念。
- 切换数字显示方式不会重排或修改原始字节。
- 插入可能改变文件后面字段的绝对位置。

