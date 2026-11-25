---
capabilityId: op:LM%20Hash
title: LM 哈希
topicGroup: file-compression
summary: 说明兼容旧系统的 LAN Manager 字节处理、分段和固定长度结果。
aliases:
  - LAN Manager
  - LMOWFv1
  - LM Hash
sources:
  - id: spec
    title: MS-NLMP NTLM v1 Authentication
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/464551a8-9fc4-428e-b3d3-bc5bfb2e73a5
    language: en
    kind: author-spec
    locator: 第 3.3.1 节 LMOWFv1 和 NTOWFv1
  - id: docs
    title: Passwords technical overview
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/windows-server/security/kerberos/passwords-technical-overview
    language: en
    kind: official-doc
    locator: LM 与 NT 摘要的定义、旧服务兼容和无盐性质
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: LM Hash
---

## 介绍
<!-- sources: spec, docs -->

LM 哈希是 LAN Manager 兼容格式，最终结果 16 字节。旧协议的单向函数先规范化输入，再把定长材料分成两个半段独立计算。因此大小写、长度以及两个半段的处理都影响应该如何解释旧格式样例。

## 大写与零补齐
<!-- sources: spec, docs -->

依据 Microsoft 的说明，旧计算将文本转换成大写，短于目标宽度的输入在末尾补零。协议按指定的兼容字符表示取字节。对 ASCII 演算，可以通过直接列出字节核对规范化的效果。

:::example 大小写合并
[输入]
仅用来演示的 ABC 与 abc。
[结果]
两者均为 8C6F5D02DEB21501AAD3B435B51404EE。
[说明]
规范化后的首三个 ASCII 字节都是 41 42 43。
:::

## 两个半段的结果
<!-- sources: spec, docs -->

14 字节材料拆成两个 7 字节块。每一块构成一个 DES 密钥，分别处理相同的固定块，输出各为 8 字节。拼接之后呈现为 32 个十六进制字符。短样例的后一段数据全零，因此后一半的结果为一项固定值。

:::example 两段均为零
[输入]
空样例。
[结果]
AAD3B435B51404EEAAD3B435B51404EE
[说明]
两个半段接收相同的全零材料，得到完全相同的八字节结果。
:::

## 输入上界与兼容实现
<!-- sources: spec, engine -->

MS-NLMP 说明大于 14 字符时无法按协议得到 LMOWFv1。旧哈希兼容实现若仅计算前 14 个 ASCII 字节，超长字符串可与其截短形式返回相同值。这种边界需要按规范和实现分别判断。

:::example 同前缀的超长样例
[输入]
12345678901234 与 12345678901234!
[结果]
固定演示实现对两者都给出 0182BD0BD4444BF8C03D5BBA34975D50。
[说明]
这说明该实现按前 14 个字节处理此 ASCII 样例。协议本身对超长输入有上述约束。
:::

## 历史认证资料中的角色
<!-- sources: spec, docs -->

LM 哈希与 NT 哈希是不同的旧格式。认证协议的后续步骤还结合质询产生响应，响应字段需要按协议本身解释。无盐、大小写合并和独立半段都是这一旧格式的局限。

## 常见误区

- LM 哈希与 NT 哈希虽然均为 16 字节，原理和结果都不同。
- 后半段全零仍会生成固定的八字节计算值。
- 兼容工具接受超长演示输入不表示认证协议允许同样的输入条件。
