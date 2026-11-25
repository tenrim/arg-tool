---
capabilityId: op:Extract%20hashes
title: 提取哈希
topicGroup: text-language
summary: 按十六进制字符及长度提取疑似摘要，保留供后续校验的文本。
aliases:
  - Extract hashes
  - 哈希提取
  - 十六进制摘要
  - digest 文本
sources:
  - id: base16
    title: RFC 4648 — Base-N Encodings
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc4648.html
    language: en
    kind: official-doc
    locator: §8，两位十六进制字符对应一个字节
  - id: md5
    title: RFC 1321 — MD5 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1321.html
    language: en
    kind: official-doc
    locator: 摘要位数与附录 ASCII abc 测试向量
  - id: sha
    title: RFC 6234 — US Secure Hash Algorithms
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc6234.html
    language: en
    kind: official-doc
    locator: SHA 输出长度及测试向量
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract hashes，长度和候选范围
---

## 介绍
<!-- sources: base16, md5, sha, engine -->

日志和说明文档经常用十六进制记录摘要。哈希提取功能从文本里找出特定长度的十六进制候选，便于将长文本中的值复制到校验工具。提取过程不会重新计算这些片段对应的数据。

## 位数与显示长度
<!-- sources: base16, md5, sha -->

每个十六进制字符表示 4 位。128 位需要 32 个字符，160 位需要 40 个，256 位需要 64 个。MD5、SHA-1 与 SHA-256 分别有这些位数，但同长度的其他算法或标识符也可以显示为相同形式。

## 从连续字符中选取
<!-- sources: base16, engine -->

固定提取器在指定长度时查看文字边界，并按小写十六进制字符匹配。Base16 的数值并不区分字母大小写，匹配器却可能漏掉大写形式。开启“所有哈希”扩大的是常用长度的候选范围，不是摘要算法或编码的自动验证。

## 同一输入的三项摘要
<!-- sources: md5, sha, engine -->

以下三段分别是 ASCII `abc` 的 MD5、SHA-1 和 SHA-256。对一个已知原文使用不同算法所得摘要，可直接核对提取器只是按显示长度分拣。

:::example 只提取 32 个字符
[输入]
900150983cd24fb0d6963f7d28e17f72 a9993e364706816aba3e25717850c26c9cd0d89d ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
[结果]
900150983cd24fb0d6963f7d28e17f72
[说明]
32 字符为 16 字节。另两段独立候选分别占 40 与 64 字符，未被切割成更短值。
:::

:::example 开启全部长度
[输入]
保持第一个例子的原始文本，开启“所有哈希”。
[结果]
900150983cd24fb0d6963f7d28e17f72
a9993e364706816aba3e25717850c26c9cd0d89d
ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
[说明]
三种长度均被提取。输出中没有用于说明候选算法的标签。
:::

:::example 大写摘要漏检
[输入]
900150983CD24FB0D6963F7D28E17F72 / 900150983cd24fb0d6963f7d28e17f72，指定长度 32。
[结果]
900150983cd24fb0d6963f7d28e17f72
[说明]
两段本来表示相同的 16 字节。当前规则只匹配小写，因此没有报告大写副本。
:::

## 回到摘要生成的上下文
<!-- sources: base16, md5, sha, engine -->

相同长度可以来自截短摘要、随机标识或其他编码字段。判断实际用途要结合原文中的算法标签、上下文和对应文件。若掌握原数据，使用来源所声明的算法和原始字节重新计算，再比较结果，能提供比长度更多的信息。

## 常见误区

- 一串 32 个十六进制字符可能是摘要，也可能是任意 16 字节值的显示。
- 哈希值提取和识别算法只使用候选信息，验证仍要有原数据和候选算法。
- 不换行的十六进制只是一种摘要表示，Base64 或分组摘要需要相应的提取规则。

