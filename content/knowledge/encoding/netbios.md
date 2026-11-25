---
capabilityId: pair:Encode%20NetBIOS%20Name
title: NetBIOS 一级编码
topicGroup: encoding
summary: 通过 A 至 P 对应半字节，将名称的原始字节展开成可读标签。
aliases:
  - NetBIOS
  - A-P
  - half ASCII
sources:
  - id: rfc
    title: "RFC 1001: NetBIOS Concepts and Methods"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1001.html
    language: en
    kind: standard
    locator: 第 14 节名称和一级编码
  - id: chef
    title: CyberChef 11.5.0 Encode NetBIOS Name / Decode NetBIOS Name
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Encode NetBIOS Name / Decode NetBIOS Name 输入、输出及参数
---

## 介绍
<!-- sources: rfc, chef -->
NetBIOS over TCP/IP 使用两级名称表示。一级编码将名称的每个字节拆成两个四位数，再以 A 至 P 的字符表示。二级编码才把这段文字安排进网络报文的名称字段。

## 两个半字节的顺序
<!-- sources: rfc, chef -->
标准方案设 A＝0，B＝1，直到 P＝15。先写高四位，再写低四位。还原值为 16×高半字节＋低半字节。字符大小写如需转码，要考虑其不同的原始 ASCII 码。

:::example 单字节分别编码
[输入]
字节 41 与 61（十六进制）
[结果]
EB 与 GB
[说明]
41 的高低值为 4、1，61 的是 6、1。因此字符 A 与 a 产生不同代码。
:::

## 十六字节名称与空白填充
<!-- sources: rfc, chef -->
标准名称字段长度为 16 字节，展开后得到 32 个 A–P 字符。具体应用可能在第十六字节携带服务类型。固定转换中的普通短输入右侧会补空格，空格 20 的一级编码为 CA。

:::example 短名称的实际输出
[输入]
ABC
[结果]
EBECED 后接 13 个 CA，共 32 字符。
[说明]
A、B、C 的字节分别为 41、42、43，高四位相同，低四位分别为 1、2、3。13 个填充字节各变成 CA。
:::

## 从字符对恢复字节
<!-- sources: rfc, chef -->
查名称字段时可按字对读取。纯字对解码的输出是字节，显示是否全为可读文本取决于原名称字段。将报文数据带入下一步前应检查组长与标准字母范围。

:::example 含两个任意字节的还原
[输入]
ACPP
[结果]
02 FF
[说明]
AC 对应 0、2，PP 对应 15、15。若把 FF 作为 UTF-8 单字节读取，不能直接显示成文本。
:::

## 与 DNS 类标签表示的区分
<!-- sources: rfc -->
一级结果描述名称字段中的字节；传输还可用一个长度及后续标签表示作用域等信息。只有把两层分别解读，才不会把标签控制数据或作用域混入名称。

## 常见误区

- A–P 代表四位数据，每字节需要两个符号。
- 完整示例中的 CA 可能来自填充，也可确实表示输入空格。
- 简短的字对可用于讲解，完整名称通常是 16 字节。
- 一级字符串合法不代表完整网络报文合法。
