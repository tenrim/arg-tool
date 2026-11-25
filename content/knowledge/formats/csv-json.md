---
capabilityId: pair:CSV%20to%20JSON
title: CSV / JSON
topicGroup: formats
summary: CSV 规定行记录和字段如何写成文本，JSON 可将这些记录转换为数组或对象。分隔符、双引号和字段类型决定转换能保留多少信息。
aliases:
  - CSV to JSON
  - JSON to CSV
  - 逗号分隔值
  - 双引号转义
sources:
  - id: csv
    title: RFC 4180 — Common Format and MIME Type for CSV Files
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4180.html
    language: en
    kind: standard
    locator: 第 2 节，记录、表头与带引号字段
  - id: json
    title: RFC 8259 — The JavaScript Object Notation Data Interchange Format
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8259.html
    language: en
    kind: standard
    locator: 第 3 至 7 节，对象、数组、数值和字符串
  - id: fixed
    title: CyberChef 固定 Worker
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: CSV to JSON 与 JSON to CSV，字典或数组输出及带引号字段读写
---

## 介绍
<!-- sources: csv, json -->
CSV 将数据写成多条记录，每条记录包含若干字段。JSON 可用数组保存各行，也可为每个字段附上键名，形成对象。常见转换把各行写成对象数组或二维数组。

## 表头与记录布局
<!-- sources: csv, json, fixed -->
若把第一行作为表头，后续每行可用表头字段作键。需要保留原始列顺序、不设表头或出现重复列名时，可用数组按位置保存字段。对象采用键查找，重复列名转成重复键会降低互操作性。

:::example 表头映射和含逗号的字段
[输入]
id,name
007,"Ada, North"
[结果]
[{"id":"007","name":"Ada, North"}]
[说明]
首行为表头，第二行只有两列。编号作为字符串保留前导零，逗号在引号内部。
:::

## 引号和内部换行
<!-- sources: csv, fixed -->
字段包含逗号、双引号或换行时，通常用双引号包住。字段内容中原有一个双引号，则在 CSV 中连续写两个。解析器需要跟踪引号状态，即便碰到分隔符也先判断它是否处在字段内部。

:::example 双引号还原至数组单元格
[输入]
"A ""B""",C
D,E
[结果]
[["A \"B\"","C"],["D","E"]]
[说明]
首格内容是 A、空格与被引号包住的 B。在 CSV 中用双写转义，在 JSON 字符串中用反斜杠转义。
:::

## 文本类型与空值
<!-- sources: csv, json, fixed -->
CSV 的字段直接提供文字。没有额外数据约定时，07、7、空字段和单词 null 都可以是普通字符串。JSON 中空字符串、数值、null 与缺少某个成员各有不同语义。自动做数值或空值推断会减少能还原的文字信息。

## 重新导出与引号规则
<!-- sources: csv, json, fixed -->
将 JSON 对象数组导出为 CSV 时，先选定列键与顺序，再将各行平铺。二维数组可以直接按位置写入。遇到复杂嵌套数据须先定义是展开成多列还是将其序列化成字段内容。

:::example 从字典数组写回 CSV
[输入]
[{"id":"007","name":"Ada, North"},{"id":"008","name":"A \"B\""}]
[结果]
id,name
007,"Ada, North"
008,"A ""B"""
[说明]
列头来自字段名。第一条名称因为有逗号而加引号，第二条名称写出双引号并按 CSV 规则重复。
:::

## 常见误区
- 对 CSV 先逐换行再逐逗号拆分，可能切开带引号字段。
- 看到 007 时直接当作数值 7 会丢失原有编号形式。
- 具有重复表头的表格更适合按位置保存，每列仍需要明确的身份。
