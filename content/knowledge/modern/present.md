---
capabilityId: pair:PRESENT%20Encrypt
title: PRESENT
topicGroup: modern
summary: 以四位 S 盒和位置换构造的 64 位轻量级分组密码。
aliases:
  - PRESENT Encrypt
  - PRESENT Decrypt
  - 四位 S 盒与位置换
sources:
  - id: paper
    title: "PRESENT: An Ultra-Lightweight Block Cipher"
    publisher: Bogdanov 等
    url: https://crypto.orange-labs.fr/papers/ches2007-450.pdf
    language: en
    kind: author-spec
    locator: 第 3 节及附录 I、II，轮、密钥调度和测试向量
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
<!-- sources: paper -->

PRESENT 为硬件资源有限的场景设计，以较小面积实现 64 位分组密码。原论文给出 80 位和 128 位密钥两种实例。

## 四位替换与位置换
<!-- sources: paper -->

每轮先加轮密钥，再把 64 位分成 16 个小组，各组使用同一个四位 S 盒，随后重新排列 64 个比特。31 轮之后还加一次轮密钥。

:::example 80 位零密钥
[输入]
80 位全零密钥及 64 位全零明文，ECB，无填充
[结果]
5579C1387B228445
[说明]
附录 I 的基础向量。结果是 16 位十六进制数，即 8 字节。
:::

## 轮密钥寄存器
<!-- sources: paper -->

80 位密钥调度取寄存器高 64 位作为本轮密钥，之后将寄存器左旋 61 位、替换高位半字节，再混入轮计数。128 位版使用类似方法，但高位替换和计数位置按其定义。

:::example 更换 80 位密钥
[输入]
80 位全 FF 密钥及 64 位全零明文，ECB，无填充
[结果]
E72C46C0F5945049
[说明]
分组不变而密钥调度改变。
:::

## 逆运算与填充边界
<!-- sources: paper, chef, modes -->

解密按照反向顺序用逆位置换、逆 S 盒和相应轮密钥。原始分组变换与输入的补块方式是不同的层，单块测试可以明确关闭填充。

## 两种实例的识别
<!-- sources: paper, chef -->

记录以十六进制表示密钥时，80 位是 20 个十六进制数字，128 位是 32 个。两种实例都输出 64 位分组，仅凭密文长度无法区分。

:::example 128 位零密钥
[输入]
128 位全零密钥及 64 位全零明文，ECB，无填充
[结果]
96DB702A2E6900AF
[说明]
密钥实例不同，不能沿用前例的结果。
:::

## 常见误区

- 80 和 128 指密钥长度，不是明文块长。
- 31 轮后仍有一次轮密钥异或。
- 轻量实现是硬件成本目标，不能单凭面积判断整个协议的安全性。

