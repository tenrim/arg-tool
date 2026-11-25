---
capabilityId: op:Parse%20SSH%20Host%20Key
title: 解析 SSH 主机密钥
topicGroup: authentication
summary: 读取 SSH 公钥的长度前缀、算法名称和公钥参数，说明格式与身份验证的区别。
aliases:
  - Parse SSH Host Key
  - OpenSSH 公钥
  - SSH 二进制公钥
sources:
  - id: wire
    title: RFC 4251 The Secure Shell Protocol Architecture
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4251
    language: en
    kind: standard
    locator: 第 5 节 string 与 mpint 长度前缀
  - id: rsa
    title: RFC 4253 The Secure Shell Transport Layer Protocol
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc4253
    language: en
    kind: standard
    locator: 第 6.6 节 ssh-rsa 公钥参数
  - id: ec
    title: RFC 5656 Elliptic Curve Algorithm Integration in SSH
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5656
    language: en
    kind: standard
    locator: 第 3.1 节曲线名及 Q
  - id: ed
    title: RFC 8709 Ed25519 and Ed448 Public Key Algorithms for SSH
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc8709
    language: en
    kind: standard
    locator: 第 4 节 ssh-ed25519 公钥格式
  - id: worker
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Parse SSH Host Key：算法分支及 Base64 / Hex 自动识别
---

## 介绍
<!-- sources: wire, rsa -->
SSH 公钥可显示为一行含算法名、Base64 公钥 blob 和可选备注的文字。blob 内还会重复保存算法名称，再按该算法写入公钥参数。读出参数可以检查所得到的钥匙格式。

## 长度前缀与整数
<!-- sources: wire, rsa -->
SSH 的 string 用四字节大端长度写在字节内容前。RSA 的 mpint 也有长度前缀，整数按有符号补码规则储存。正整数最高位若为 1，需要前置 00 保持非负；它并不为模数添加一个新的数值位。

## 曲线公钥的表示
<!-- sources: wire, ec, ed, worker -->
ECDSA 的 SSH 公钥包含曲线标识与编码点 Q。Ed25519 则保存 32 字节的压缩公钥表示，它不是单独的 x 坐标。当前读码界面把这个字段标为 x，因此还需按算法标准理解其语义。

## 三种公钥样本
<!-- sources: rsa, ec, ed, worker -->
以下使用本地生成的合成公钥。公钥参数每次可不同，但格式和长度应保持。

:::example 带公开指数的 RSA 公钥
[输入]
一行 ssh-rsa 公钥，2048 位模数，公开指数 65537
[结果]
Key type: ssh-rsa；Exponent: 0x010001；另列 Modulus
[说明]
65537 是十六进制 10001，SSH 整数以完整字节表示为 01 00 01。
:::

:::example ECDSA 的曲线与公开点
[输入]
用 Base64 传入 ecdsa-sha2-nistp256 公钥 blob
[结果]
Curve: nistp256，公开点以 04 开头，后随两段各 32 字节坐标
[说明]
此样本使用未压缩点编码，标志字节为 04。
:::

:::example Ed25519 十六进制输入
[输入]
将 ssh-ed25519 的完整公钥 blob 转为 Hex
[结果]
Key type: ssh-ed25519，以及一个 32 字节公钥字段
[说明]
读取的是标准格式中的公钥字符串，不是末尾备注。
:::

## 核对身份需要的条件
<!-- sources: wire, rsa, worker -->
主机提供的公钥是否值得信任，需与已核实的指纹、可信管理渠道或证书比较。公钥能按二进制规则展开，只表示这些字段可读。备注和可见名称也可以由材料提供者自行书写。

## 常见误区
- 一行中的末尾备注不属于公钥 blob。
- RSA 模数的前置 00 可能只是正数符号填充。
- Ed25519 的 32 字节公开值不是直接写出的 x 坐标。
