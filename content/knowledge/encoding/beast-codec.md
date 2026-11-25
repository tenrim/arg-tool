---
capabilityId: native:beast-codec
title: 兽音编码
topicGroup: encoding
summary: 把 UTF-16 码元拆成半字节，按位置移位后用四符号字典表示。
aliases:
  - 兽音
  - beast-codec
  - 四进制
  - UTF-16
sources:
  - id: unicode
    title: The Unicode Standard — Conformance
    publisher: Unicode Consortium
    url: https://www.unicode.org/versions/latest/core-spec/chapter-3/
    language: en
    kind: standard
    locator: UTF-8、UTF-16 与代理对
  - id: src
    title: vendor/fun-tools/beast.js
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/beast.js
    language: zh-CN
    kind: implementation
    locator: encode、decode 与帧标记
  - id: pin
    title: vendor/fun-tools/beast-SOURCE.json
    publisher: 迷雾工具箱
    url: /vendor/fun-tools/beast-SOURCE.json
    language: zh-CN
    kind: implementation
    locator: 上游固定提交 e083d22 与 src/core.ts
---

## 介绍
<!-- sources: src, pin -->

兽音是用四种符号来表示文字的编码。解码需要匹配四符号字典及其顺序。算法没有保密密钥。

## 从码元到四个半字节
<!-- sources: unicode, src -->

UTF-16 每个码元有 16 位，按高位到低位分为四个十六进制数字。补充平面字符由两个码元表示，因此会占八个半字节。

## 位移与符号对
<!-- sources: src, pin -->

第 i 个半字节加 i mod 16 后按 16 取模，再拆为两个四进制数字。解码先按字典恢复数字，并减去同一位置偏移。

:::example 裸编码一个码元
[输入]
字典依序 嗷呜啊~；A 是 0041
[结果]
嗷嗷嗷呜呜啊呜嗷
[说明]
0,0,4,1 加 0,1,2,3 得 0,1,6,4，转为 00 01 12 10。
:::

## 首尾标记
<!-- sources: src -->

带标记形式在载荷前附字典第 4、2、1 个符号，在末尾附第 3 个。标记不改变中间负载的数值关系。

:::example 保留封装
[输入]
同一字典，对 A 使用首尾标记
[结果]
~呜嗷嗷嗷嗷呜呜啊呜嗷啊
[说明]
前三符号为 ~呜嗷，末尾为啊。
:::

## 补充平面与字典检查
<!-- sources: unicode, src -->

解码时要按实际符号计数。符号本身也可以是补充平面码点，不能拿 JS 字符串长度当作符号总数。

:::example 一个表情
[输入]
用 嗷呜啊~ 裸编码 😀
[结果]
~呜啊呜呜呜嗷嗷嗷呜嗷~呜啊呜~
[说明]
两个 UTF-16 码元，总共十六个输出符号。
:::

## 常见误区

- 仅凭看似固定的叫声不能判断字典顺序。
- 有首尾标记也不意味着加密或认证。
- 未知符号及无法拼成完整码元的长度必须核对。

