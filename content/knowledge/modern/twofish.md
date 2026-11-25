---
capabilityId: pair:Twofish%20Encrypt
title: Twofish
topicGroup: modern
summary: 以密钥相关替换、MDS 扩散和 16 轮 Feistel 结构变换 128 位分组。
aliases:
  - Twofish Encrypt
  - Twofish Decrypt
  - 密钥相关 S 盒与 MDS 扩散
sources:
  - id: paper
    title: The Twofish Encryption Algorithm
    publisher: Schneier 等
    url: https://www.schneier.com/academic/archives/1998/12/the_twofish_encrypti.html
    language: en
    kind: author-spec
    locator: cipher design、测试向量和设计论文
  - id: vectors
    title: Twofish test vectors
    publisher: Twofish 设计团队
    url: https://www.schneier.com/academic/twofish/
    language: en
    kind: author-spec
    locator: AES 提交材料的向量
  - id: modes
    title: NIST SP 800-38A：Block Cipher Modes
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
    language: en
    kind: standard
    locator: 6.1、6.2，ECB 和 CBC
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作和输入输出定义
---

## 介绍
<!-- sources: paper -->

Twofish 是参与 AES 竞争的对称密码。从常用实例看，分组长 128 位，密钥长 128、192 或 256 位。它在首尾加入密钥白化，中间执行十六轮。

## 替换与 MDS 扩散
<!-- sources: paper -->

轮函数用密钥相关的 S 盒处理一个 32 位字的四个字节，再经 MDS 矩阵进行线性混合。两个这样的结果通过伪哈达玛变换混合并加入轮密钥，结果作用到另一半。

## 白化与逆向变换
<!-- sources: paper, vectors -->

输入和输出白化将若干预计算子密钥与数据字异或，包在主体轮之外。解密逆转密钥及相关轮操作。下列都是单个全零 16 字节明文，ECB、无填充。

:::example 128 位全零钥匙
[输入]
16 字节全零密钥
[结果]
9F589F5CF6122C32B6BFEC2F2AE8C35A
[说明]
时序只处理一个 128 位分组。
:::

:::example 192 位全零钥匙
[输入]
24 字节全零密钥
[结果]
EFA71F788965BD4453F860178FC19101
[说明]
改变密钥档位后密钥相关替换发生变化。
:::

:::example 256 位全零钥匙
[输入]
32 字节全零密钥
[结果]
57FF739D4DC92C1BD7FC01700CC8216F
[说明]
输入块大小保持 16 字节。
:::

## 不同密码的分组相似性
<!-- sources: paper, modes -->

AES 和 Twofish 的单块长度可以相同，长密文的分块规律也可能相似。仅能整齐分块不足以区分密码，需要算法标识、实现参考或已知输入输出。

## 从单块扩展到文件
<!-- sources: chef, modes -->

CBC、CTR 等模式负责把原语用于多块。独立比对公开向量可先排除分组算法差异，再核对 IV、计数器、填充与文件边界。

## 常见误区

- 以 128 位分组为例也可使用 192 或 256 位密钥。
- 白化是异或密钥子项的步骤，不是加密前后补齐长度。
- 名称中的 fish 不代表使用 Blowfish 的 64 位分组。

