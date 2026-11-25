---
capabilityId: op:MurmurHash3
title: MurmurHash3 哈希
topicGroup: file-compression
summary: 介绍 MurmurHash3 的 x86 32 位变体、种子与结果的带符号或无符号读法。
aliases:
  - MurmurHash3 x86_32
  - Murmur3A
  - 非密码哈希
sources:
  - id: original
    title: MurmurHash3 reference source
    publisher: Austin Appleby
    url: https://github.com/aappleby/smhasher/blob/master/src/MurmurHash3.cpp
    language: en
    kind: implementation
    locator: MurmurHash3_x86_32 与 fmix32
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Hashing.js
    language: en
    kind: implementation
    locator: MurmurHash3 的种子与符号转换
---

## 介绍
<!-- sources: original -->

MurmurHash3 是为快速散列设计的非密码哈希族。此处的 32 位版本使用 MurmurHash3_x86_32。另有 128 位变体，字长、输入块尺寸和内部混合各有差异。

## 消息字与尾段
<!-- sources: original -->

每四个输入字节组成一个小端 32 位字，经固定乘法、循环左移和异或混入状态。末尾剩余的一至三个字节先按小端装入一个字再混合，不占完整四字节处理步。

:::example 恰好一个完整消息字
[输入]
ASCII abcd，种子 0。
[结果]
无符号十进制 1139631978。
[说明]
四个输入字节 61 62 63 64 构成小端字 0x64636261。
:::

## 初值和尾部扩散
<!-- sources: original, engine -->

32 位种子设定最开始的状态。处理数据后，先异或消息总字节长度，再执行交替的右移异或和乘法混合。改变种子会改变结果。种子参数不使这一函数成为密码认证算法。

:::example 不同种子的同一输入
[输入]
ASCII abc，分别用种子 0 和 42。
[结果]
3017643002 与 1313807976。
[说明]
消息均为 3 字节，只改变初始状态。
:::

## 同一位型的有符号数
<!-- sources: original, engine -->

输出本质上是 32 位值。最高位为 1 时，可以按无符号整数读取，也可以按二进制补码解释为负整数。将无符号数减去 2³² 即得到其带符号形式。

:::example 十进制符号转换
[输入]
ASCII abc，种子 0，按带符号十进制展示。
[结果]
−1277324294。
[说明]
3017643002−4294967296=−1277324294，两种显示对应同一位型。
:::

## 快速散列的用途
<!-- sources: original, engine -->

这类函数可用于分桶、缓存索引和其他能处理碰撞的场景。复算需写明变体、种子和数据编码。对于认证、签名或检测对手篡改，应使用这些协议指定的密码学构件。

## 常见误区

- MurmurHash3 的各个 128 位变体与 x86 32 位版本不能互换。
- 带符号数与无符号数可能展示为不同十进制值，底层比特可相同。
- 种子不同会得到不同值，但普通种子不能赋予消息认证能力。
