---
capabilityId: pair:DES%20Encrypt
title: DES
topicGroup: modern
summary: 历史上的 64 位分组密码，以 56 位有效密钥进行 16 轮 Feistel 变换。
aliases:
  - DES Encrypt
  - DES Decrypt
  - 56 位有效密钥与 64 位分组
sources:
  - id: fips
    title: FIPS 46-3：Data Encryption Standard
    publisher: NIST
    url: https://csrc.nist.gov/pubs/fips/46-3/final
    language: en
    kind: standard
    locator: DES 算法、轮结构、奇偶校验及撤回日期
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
<!-- sources: fips -->

DES 用八字节表示分组和密钥。密钥每字节都有一位奇偶校验位，所以参与加密变换的是 56 位。NIST 的 FIPS 46-3 已在 2005 年撤回，相关知识仍可用于读取旧格式和学习分组结构。

## 初始置换与轮函数
<!-- sources: fips -->

先重新排列 64 个输入位，并分成各 32 位的左右半块。每轮将一半扩展成 48 位并与轮密钥异或，分给八个 S 盒，再经过置换后作用于另一半。

:::example 常用历史示例
[输入]
密钥 133457799BBCDFF1，明文 0123456789ABCDEF，ECB
[结果]
首个块 85E813540F0AB405
[说明]
这一个原始分组足以核对 DES 的轮输出。附加的分组可来自填充。
:::

## 密钥调度与恢复
<!-- sources: fips -->

有效密钥分入两个 28 位半部，按轮循环移位，再选出 48 位子密钥。解密将生成的 16 个子密钥倒序使用。密钥字节的校验位不进入这些子密钥。

:::example 全零教学数据
[输入]
8 字节全零密钥字节串与 8 字节全零明文，ECB
[结果]
首个块 8CA64DE9C1B123A7
[说明]
此例用于测试，不用于传输，也不能据此认为任何应用都会接受原始校验位。
:::

## 模式与填充的影响
<!-- sources: modes, chef -->

分组密码可以放入有链接或计数器的模式中。按单块 ECB 核对算法时比较第一个分组即可。查看文件密文则需同时对齐完整输入长度、块模式和填充。

## 有效密钥位与测试
<!-- sources: fips, chef -->

测试向量常用于检验解码密钥的位序。翻转一个有效密钥位会改变结果。更换校验位时，若实现接受并忽略校验位，底层 DES 的结果应保持一致。

:::example 有效密钥位的改变
[输入]
密钥 8000000000000000，明文 0000000000000000，ECB
[结果]
首个块 95A8D72813DAA94D
[说明]
相较全零例，最高有效位置被翻转，结果因轮密钥改变而不同。
:::

## 常见误区

- 存储八字节密钥不等于有 64 位有效密钥。
- DES 与三重 DES 拥有不同的密钥组合和变换过程。
- 可读取旧资料并不能说明 DES 适合新系统。

