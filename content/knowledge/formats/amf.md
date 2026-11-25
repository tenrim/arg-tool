---
capabilityId: pair:AMF%20Encode
title: AMF 编码与解码
topicGroup: formats
summary: AMF 将 ActionScript 等环境中的对象和基本值序列化为二进制。AMF0 与 AMF3 的类型标记、长度和引用方式各有定义。
aliases:
  - AMF Encode
  - AMF Decode
  - AMF0
  - AMF3
  - Action Message Format
sources:
  - id: zero
    title: Action Message Format AMF 0 Specification
    publisher: Adobe
    url: https://ossrs.net/lts/en-us/assets/files/amf0_spec_121207-ac97fd4db9408706cd816b681ca3918c.pdf
    language: en
    kind: author-spec
    locator: 第 1.3、2.2 至 2.5、2.9 节，数据类型和引用
  - id: three
    title: Action Message Format AMF 3 Specification
    publisher: Adobe
    url: https://ossrs.net/lts/en-us/assets/files/amf3_spec_121207-5ec039969edc9d9b7cd53607ec3253d9.pdf
    language: en
    kind: author-spec
    locator: 第 1.3、2.2、3.3 至 3.8、3.11 节，U29、字符串和数组
  - id: local
    title: CyberChef 运算适配中的 AMF 校正
    publisher: 迷雾工具箱
    url: /cyberchef-operation-corrections.js
    language: zh-CN
    kind: implementation
    locator: AMF0 和 AMF3 类型构造及 UTF-8 长度
---

## 介绍
<!-- sources: zero, three -->
Action Message Format（AMF）用于存储和传输对象图，源于 Adobe Flash 与 ActionScript。序列化写出数据类型和内容，读取器据此还原值。AMF0 与 AMF3 对同一数值可能生成完全不同的字节。

## 布尔值和类型标记
<!-- sources: zero, three -->
AMF0 布尔值以前缀 01 标明类型，后接一个字节表示真假。AMF3 为真和假分别分配独立的类型标记，直接一个字节就能表示布尔值。相同标记号在不同版本中的含义必须分别查询。

:::example 两种版本中的真和假
[输入]
true 与 false（分别编码）
[结果]
AMF0 为 01 01 和 01 00。AMF3 为 03 和 02。
[说明]
AMF0 用数值字节区分真假。AMF3 的 03、02 本身已经区分这两个值。
:::

## 文本、长度与低位标志
<!-- sources: zero, three, local -->
两版字符串都使用 UTF-8。AMF0 短字符串用两字节长度。AMF3 按 U29 规则编码长度或引用，字符串头的最低位为 1 表示值内联，为 0 表示引用；内联长度写作 2 × 字节数 + 1。

:::example 字符 é 的两种表示
[输入]
"é"
[结果]
AMF0 为 02 00 02 C3 A9。AMF3 为 06 05 C3 A9。
[说明]
é 的 UTF-8 为 C3 A9，共两字节。AMF0 直接写长度 00 02。AMF3 的内联头为 2 × 2 + 1 = 5。
:::

## 数组、属性与引用表
<!-- sources: zero, three, local -->
AMF 可以保存复杂对象。AMF3 数组可同时带具名项和密集元素，具名部分结束后依序记录密集项。重复的字符串或对象还能引用前面已经出现的条目，以避免重复发送完整内容。

:::example 一个没有具名项的数组
[输入]
[true,false]（AMF3）
[结果]
09 05 01 03 02
[说明]
09 是数组标记，05 表明内联数组含两项密集元素。01 是空字符串头，结束具名部分，其后依次是 true、false。
:::

## 数值表示与可读输出
<!-- sources: zero, three, local -->
AMF0 以双精度格式表示数值。AMF3 另有 29 位整数类型，也保留双精度。若需核对原始编码，应读类型标记，单凭显示同一个数值无法判断它使用的是整数还是浮点。解码器也可额外显示标记和引用描述来辅助检查。

## 常见误区
- AMF0 与 AMF3 的同一个类型标记可能表示不同值。
- 计算 AMF 字符串长度时按 UTF-8 字节计数。
- 引用编号指向之前记录的值，单独截取带引用的后半段有时不能独立还原。
