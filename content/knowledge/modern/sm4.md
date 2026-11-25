---
capabilityId: pair:SM4%20Encrypt
title: SM4
topicGroup: modern
summary: 使用 128 位密钥和 128 位分组，以 32 轮字更新和末尾反序产生密文。
aliases:
  - SM4 Encrypt
  - SM4 Decrypt
  - 32 轮非线性与线性变换
sources:
  - id: oscca
    title: 《SM4 分组密码算法》公开标准公告
    publisher: 国家密码管理局
    url: https://www.oscca.gov.cn/sca/xxgk/201705/1012583.shtml
    language: zh-CN
    kind: official-doc
    locator: SM4 算法规范入口
  - id: draft
    title: The SM4 Block Cipher Algorithm and Its Modes of Operations
    publisher: Ribose／IETF Datatracker
    url: https://datatracker.ietf.org/doc/html/draft-ribose-cfrg-sm4-10
    language: en
    kind: author-spec
    locator: 第 6–8 节，内部变换、密钥展开、计算例
  - id: modes
    title: NIST SP 800-38A 分组密码工作模式
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 第 5、6 节及附录 A
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 相应操作的模式、字节表示与功能描述
---

## 介绍
<!-- sources: oscca, draft -->

SM4 是固定 128 位密钥、固定 128 位分组的对称密码。它把明文分成四个 32 位字，然后逐轮计算新的状态字。

## 非线性变换与循环移位
<!-- sources: draft -->

新字取当前第一个字，与其余三个字及轮密钥的非线性变换结果异或。变换内部按字节经过 S 盒，再把多个不同位数的循环左移与原值异或。最后把四个字倒序组成输出块。

:::example 标准单块向量
[输入]
密钥与明文均为 0123456789ABCDEFFEDCBA9876543210，ECB，无填充
[结果]
681EDF34D206965E86B3E94F536E4246
[说明]
规范示例核对最后四个状态字与输出反序。
:::

## 轮密钥与解密
<!-- sources: draft, oscca -->

密钥展开将主密钥与固定系统参数合并，然后生成 32 个轮密钥。展开使用同一 S 盒和一套不同的线性旋转。用相同的轮结构将轮密钥倒序即可解密。

:::example 全零额外向量
[输入]
16 字节全零密钥与 16 字节全零明文，ECB，无填充
[结果]
9F1F7BFF6F5511384D9430531E538FD3
[说明]
密钥展开含常量，输入全零不会产生全零密文。
:::

## 工作模式的边界
<!-- sources: modes, draft, chef -->

分组算法只规定怎样变换一个块。ECB 独立变换每块，CBC 将反馈带入后续块。术语中的“SM4 加密”未说明串接方式时，还不足以复原多块密文。

:::example 相同块和相同结果
[输入]
沿用标准单块向量的密钥，将其明文重复两次，ECB，无填充
[结果]
681EDF34D206965E86B3E94F536E4246
681EDF34D206965E86B3E94F536E4246
[说明]
两块互不依赖，因此输出重复。
:::

## 资料中的表示法
<!-- sources: draft, chef -->

标准示例通常用十六进制打印密钥、状态字和块。设备或文本文件可能保存原始字节、带空格的十六进制或协议容器。比较前先归一成字节再判断轮或模式差异。

## 常见误区

- SM4 密钥和分组都是 16 字节，不接受与 AES 相同的三档密钥概念。
- 测试向量的无填充语境不代表任意长度都能使用 ECB/NoPadding。
- SM4 单块变换不附带消息认证。

