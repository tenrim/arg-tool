---
capabilityId: pair:Blowfish%20Encrypt
title: Blowfish
topicGroup: modern
summary: 以 64 位分组、密钥相关的 S 盒和 16 轮 Feistel 网络处理数据。
aliases:
  - Blowfish Encrypt
  - Blowfish Decrypt
  - 64 位 Feistel 分组
sources:
  - id: paper
    title: Description of a New Variable-Length Key, 64-Bit Block Cipher
    publisher: Bruce Schneier
    url: https://www.schneier.com/academic/archives/1994/09/description_of_a_new.html
    language: en
    kind: author-spec
    locator: 算法描述，密钥扩展、P 数组与 S 盒
  - id: tests
    title: Blowfish Source Code and Test Vectors
    publisher: Bruce Schneier
    url: https://www.schneier.com/academic/blowfish/download/
    language: en
    kind: author-spec
    locator: Blowfish test vectors，原始块输出
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

Blowfish 是 Bruce Schneier 在 1990 年代提出的对称密码，分组长度 64 位，规范允许最长 448 位密钥。算法的大部分初始化工作在处理第一块之前完成。

## P 数组与四张 S 盒
<!-- sources: paper -->

初始化表从圆周率的十六进制数字开始，密钥循环异或入 18 项 P 数组，再以多次块加密更新数组和四张 S 盒。密钥变化后，整个表需要重新生成。

:::example 全零传统向量
[输入]
8 字节全零密钥及 8 字节全零明文，ECB
[结果]
首个块 4EF997456198DD78
[说明]
这里只比较固定向量的首块。工具采用填充时会多出第二个块。
:::

## Feistel 函数
<!-- sources: paper, tests -->

输入块拆成左右两个 32 位字。轮函数以一个字的四个字节为索引读取四张 S 盒，依次作模加与异或，再作用于另一半。解密时 P 数组的使用方向反转。

:::example 全 1 情况
[输入]
密钥 FFFFFFFFFFFFFFFF，明文 FFFFFFFFFFFFFFFF，ECB
[结果]
首个块 51866FD5B85ECB8A
[说明]
全部字节为 FF 形成另一条公开向量。
:::

## 工作模式与块长
<!-- sources: modes, chef -->

Blowfish 的分组长度始终是 8 字节。链接前一密文的模式还需要 IV。比较测试时先逐块核对，再检查调用方是否追加填充。将同长度的另一个密码的输出误作 Blowfish，单靠分组长度很难察觉。

## 与历史材料对照
<!-- sources: tests, paper, chef -->

公开向量能提供一组完整的密钥、明文和固定分组。对归档文件，还应独立确认模式、IV 和填充来源。Blowfish 的块长和密钥长度是两种约束。

:::example 非零密钥和明文
[输入]
密钥 3000000000000000，明文 1000000000000001，ECB
[结果]
首个块 7D856F9A613063F2
[说明]
检查双方按相同字节序解读所给输入。
:::

## 常见误区

- 448 位是密钥上限，分组仍是 64 位。
- 可读密码短语经何种编码或派生才成为密钥，需要另行确认。
- 同一个 Blowfish 块向量可通过，仍可能在 IV 或填充层出现不兼容。

