---
capabilityId: op:Parse%20ObjectID%20timestamp
title: 解析 ObjectID 时间戳
topicGroup: coordinates-time
summary: 从 MongoDB ObjectId 前四字节读取无符号 UNIX 秒数，区分标识符与记录业务时间。
aliases:
  - Parse ObjectID timestamp
  - BSON ObjectId 时间
  - MongoDB ObjectId
sources:
  - id: spec
    title: BSON ObjectID Specification
    publisher: MongoDB
    url: https://github.com/mongodb/specifications/blob/master/source/bson-objectid/objectid.md
    language: en
    kind: author-spec
    locator: 12 字节结构与大端无符号时间戳域
  - id: mongo
    title: ObjectId.getTimestamp()
    publisher: MongoDB
    url: https://www.mongodb.com/docs/manual/reference/method/objectid.gettimestamp/
    language: en
    kind: official-doc
    locator: 由前四字节获得 UTC 日期对象
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Serialise.js
    language: en
    kind: implementation
    locator: Parse ObjectID timestamp 构造 BSON ObjectId 并输出 ISO 时间
---

## 介绍
<!-- sources: spec, mongo -->
ObjectId 是 MongoDB 常用的一类 BSON 标识符，共 12 字节。开头四个字节存创建该标识符时对应的 UNIX 秒数，可从常见的 24 位十六进制形式中取出。

## 字段的排列
<!-- sources: spec -->
顺序为四字节时间、五字节进程相关随机值、三字节计数器。时间和值较短的计数器按大端排列。时间使用无符号整数，所以前四字节全为 FF 时仍为正数 4294967295。

## 从十六进制到时刻
<!-- sources: spec, mongo, engine -->
每两个十六进制数字是一字节，前八个数字共四字节。若各字节分别为 b₀ 至 b₃，秒数是 b₀×256³＋b₁×256²＋b₂×256＋b₃，再由 1970 年的 UTC 纪元推得日期。

## 三个同长度样本
<!-- sources: spec, mongo, engine -->
例子都只用 ObjectId 的时间字段，余下字节不参与换算。

:::example 常见的 ObjectId 示例
[输入]
507f1f77bcf86cd799439011
[结果]
2012-10-17T21:13:27.000Z
[说明]
0x507f1f77 对应 1350508407 秒。
:::

:::example 纪元后一秒
[输入]
000000010000000000000000
[结果]
1970-01-01T00:00:01.000Z
[说明]
时间字段为 00 00 00 01，即无符号整数 1。
:::

:::example 无符号计数的上界
[输入]
ffffffff0000000000000000
[结果]
2106-02-07T06:28:15.000Z
[说明]
前四字节作无符号大端读，得到 2³²−1 秒。
:::

## 标识符时间能说明的范围
<!-- sources: spec, mongo -->
标准生成的 ObjectId 时间精度为秒，一秒内可有多个不同 ID。应用也可能自行指定一个合法标识符或事后导入记录。字段中的时间说明该值内所写的秒数，业务事件或文档插入时间仍要用相应日志和字段确认。

## 常见误区
- 日期样式带 .000 不代表已经从 ObjectId 取到毫秒。
- 前四字节按大端读，倒过来读会变成另一个数。
- 它记录标识符生成时写入的时间，不能单独证明数据库写入时刻。
