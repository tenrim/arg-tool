---
capabilityId: op:Drop%20bytes
title: 丢弃字节
topicGroup: files
summary: 定位连续字节后移除该区间，把前后两段按原顺序拼接。
aliases:
  - Drop bytes
  - 删除字节区间
  - 字节裁剪
sources:
  - id: slice
    title: ECMA-262 ArrayBuffer.prototype.slice
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.slice
    language: en
    kind: standard
    locator: 从起点复制到不含末端的区间及负索引解释
  - id: utf8
    title: RFC 3629 UTF-8
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc3629.txt
    language: en
    kind: standard
    locator: 第 3 节，一到四字节及各字节的排列
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Drop bytes 的起始与长度换算、LF 分行及两段拼接
---

## 介绍
<!-- sources: engine, slice -->
丢弃字节用于从一个序列挖去一段连续范围，然后重新拼接剩余部分。可以用来剥离已知长度的头、尾或记录里的固定字段。位置按字节计数。

## 起点、长度与闭开区间
<!-- sources: engine, slice -->
从左起第一字节偏移为 0。起点 s、正长度 n 表示删除从 s 到 s＋n 之前的字节。负起点从末尾倒数；例如六字节中起点 −3 对应位置 3。当前运算的负长度表示从起点向前挑选，在输入范围内相当于删掉 [s＋n,s)。

## 按行处理与编码边界
<!-- sources: engine, utf8 -->
逐行模式以字节 0A 分隔并重新插入分隔，再按每行的长度换算位置。文件有 CRLF 时，0D 仍在该行内参与计数。UTF-8 的一个字符可跨多个字节，删去部分编码可能得到不能直接读成文字的结果。

## 区间删除的例子
<!-- sources: engine, slice -->
以下 A～Z 均为单字节，编号从 0 开始。

:::example 中间删除三个字节
[输入]
ABCDEF，起点 2，长度 3
[结果]
ABF
[说明]
删除偏移 2、3、4 的 CDE，保留两侧。
:::

:::example 从末尾倒数起点
[输入]
ABCDEF，起点 −3，长度 2
[结果]
ABCF
[说明]
起点为偏移 3，移除 D、E。
:::

:::example 用负长度向前取区间
[输入]
ABCDEF，起点 4，长度 −2
[结果]
ABEF
[说明]
从位置 4 向前二字节，删去偏移 2 和 3；位置 4 本身继续保留。
:::

## 拼接后的偏移
<!-- sources: engine, slice -->
删除后右段的字节位置全部左移。头部若含长度、校验值或记录指针，值本身不会因删除而自动更新。处理结构化材料前可先查字段布局，并保留原始副本以便定位原偏移。

## 常见误区
- 起点为 2 时从第三个字节开始。
- 删除一段字节会移动后续数据的偏移。
- 可见字符数与 UTF-8 字节数可不同。
