---
capabilityId: op:Whirlpool
title: Whirlpool 哈希
topicGroup: file-compression
summary: 介绍 Whirlpool 的专用分组密码、链式反馈和历史变体，用固定向量辨别版本。
aliases:
  - Whirlpool
  - Whirlpool-T
  - Whirlpool-0
sources:
  - id: paper
    title: The Whirlpool Hashing Function
    publisher: Barreto、Rijmen
    url: https://www.karljapetre.com/whirlpool/whirlpool.pdf
    language: en
    kind: author-spec
    locator: 第 3 节，轮、补齐、Miyaguchi–Preneel 压缩
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Whirlpool、Whirlpool-T、Whirlpool-0
---

## 介绍
<!-- sources: paper -->

Whirlpool 是 Barreto 和 Rijmen 提出的 512 位密码哈希。输入分组和链值都是 512 位。每一块经过专用分组密码，再与上一链值和原分组相互异或，得到新的链值。

## 大长度字段
<!-- sources: paper -->

填充先附一个 1 位再添零，使最后一组可留出 256 位来记录原始位长。输入仍按 512 位组处理。256 位是长度字段的容量，摘要的宽度依然是 512 位。

:::example 字节边界
[输入]
长度为 32 字节的消息。
[结果]
填充后占 128 字节，即两个消息块。
[说明]
原长已占 256 位，再加一个 1 位后，第一块不能同时容纳 256 位长度字段。
:::

## 专用分组密码与反馈
<!-- sources: paper -->

规范使用十轮分组运算，对字节进行替换、置换与扩散。每块把上一链值用作该块的密钥，得到加密结果后，与本块和上一链值分别异或。这里的密钥字来自内部链值，普通哈希调用无需提供秘密密钥。

:::example 最终版空消息
[输入]
零字节，2003 年修订版 Whirlpool。
[结果]
19fa61d75522a4669b44e39c1d2e1726c530232130d407f89afee0964997f7a73e83be698b288febcf88e3e03c4f0757ea8964e59b63d93708b138cc42a66eb3
[说明]
零长度输入仍处理一块含填充位的消息。
:::

## 三种历史名称
<!-- sources: paper, engine -->

Whirlpool-0 指早期版本，Whirlpool-T 是中间修订名，通常单写 Whirlpool 表示最终修订。替换表或线性扩散矩阵改动会改变输出，三种宽度却都相同。核对旧文件时应注明版本。

:::example abc 在最终版的摘要
[输入]
ASCII abc，Whirlpool，十轮。
[结果]
4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5
[说明]
同一输入在 Whirlpool-T 与 Whirlpool-0 分别以 8afc0527 与 54ee18b0 开头。
:::

## 摘要展示
<!-- sources: paper, engine -->

最终链值表示为 64 个字节或 128 个十六进制字符。比对旧格式时，先用已知消息判定版本，再确认摘要是否曾改变文本大小写、加入分隔符或被截短。

## 常见误区

- Whirlpool 中的分组密钥是链值，计算并不需要用户密钥。
- 三个版本不能仅按 512 位长度分辨。
- 末尾记录原消息的位长，不能改用字节长度。
