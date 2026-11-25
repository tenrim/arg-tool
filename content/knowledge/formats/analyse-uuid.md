---
capabilityId: op:Analyse%20UUID
title: 分析 UUID
topicGroup: formats
summary: 从 128 位 UUID 的版本与变体确定字段解释，核对不同版本的时间含义。
aliases:
  - Analyse UUID
  - 通用唯一标识符
  - UUID v1
  - UUID v7
sources:
  - id: rfc
    title: RFC 9562 Universally Unique IDentifiers (UUIDs)
    publisher: IETF
    url: https://datatracker.ietf.org/doc/html/rfc9562
    language: en
    kind: standard
    locator: 第 4、5 节及附录 A 的 v1、v4、v6、v7 例子
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Analyse UUID 的版本判断、时间输出和大整数换算
---

## 介绍
<!-- sources: rfc, engine -->
UUID 是一种 128 位标识符。常见文本表示为 32 个十六进制字符，连字符把它们分成 8-4-4-4-12 五组。不同版本规定这些位如何生成及怎样解释。

## 版本与变体的字段
<!-- sources: rfc -->
在 RFC 9562 约定的布局里，第三组第一个十六进制字符给出版本。第四组第一个字符的最高位用于判定变体，例如 8、9、A、B 都以二进制 10 开头，表示这个布局。确认变体后才能据版本解释具体字段。

## 时间型与随机型的区别
<!-- sources: rfc, engine -->
v1 和 v6 存放从 1582 年公历纪元计起的 100 纳秒时间量，v6 将时间重新排列便于排序。v7 开头 48 位是 UNIX 毫秒，v4 内容主要为随机数据，没有标准时间字段。分析器可按所选元数据输出项展示 v1、v6 和 v7 的已实现字段。

## RFC 样本的解读
<!-- sources: rfc, engine -->
以下取附录 A 的固定样例，比对结构、时间和元数据。

:::example 版本 1 的时间与节点字段
[输入]
c232ab00-9414-11ec-b3c8-9f6bdeced846
[结果]
v1；2022-02-22T19:22:22.000Z；节点字段 9F:6B:DE:CE:D8:46
[说明]
第三组以 1 开头。时间由分散在三个字段中的 60 位时值重组得到。
:::

:::example 版本 4
[输入]
919108f7-52d1-4320-9bac-f847db4148a8
[结果]
v4，未提供生成时间
[说明]
第三组以 4 开头，这个版本的固定布局没有时间字段。
:::

:::example 版本 7 的 UNIX 毫秒
[输入]
017f22e2-79b0-7cc3-98c4-dc0c0c07398f
[结果]
v7；1645557742000 毫秒；2022-02-22T19:22:22.000Z
[说明]
去掉连字符后最前 12 位十六进制数 017F22E279B0 就是 UNIX 毫秒。
:::

:::example 版本 6 的时间重排
[输入]
1ec9414c-232a-6b00-b3c8-9f6bdeced846
[结果]
v6；2022-02-22T19:22:22.000Z
[说明]
同一个 100 纳秒时间值改用 v6 位序，文本表现不同，解出的时刻一致。
:::

## 对业务记录的解释
<!-- sources: rfc, engine -->
UUID 版本决定最多可提取哪些属性，节点字段也可按规则以非硬件地址生成。分析器读到的是标识符本身的值。事件或设备归属需要应用记录，不能仅凭这些位认定谁创建了哪个对象。

## 常见误区
- 版本和变体是不同字段，不能只读一个十六进制数字就确认布局。
- 版本 4 没有标准生成时间字段。
- 版本 7 时间用毫秒，版本 1 和 6 的时间刻度与纪元不同。
