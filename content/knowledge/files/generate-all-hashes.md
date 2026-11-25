---
capabilityId: op:Generate%20all%20hashes
title: 生成全部哈希
topicGroup: file-compression
summary: 用一批固定摘要分别计算同一原文，核对长度筛选、算法名称和结果字节。
aliases:
  - Generate all hashes
  - 并列摘要
  - 摘要复算
sources:
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Generate all hashes 的长度分组和名称输出
  - id: nist
    title: FIPS 180-4 Secure Hash Standard
    publisher: NIST
    url: https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
    language: en
    kind: standard
    locator: SHA-1 和 SHA-2 的输出位数
  - id: md5
    title: RFC 1321 The MD5 Message-Digest Algorithm
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc1321.txt
    language: en
    kind: standard
    locator: 附录 A.5 标准摘要样例
---

## 介绍
<!-- sources: engine -->

生成全部哈希把同一输入分别交给一组预置摘要函数，返回多行结果。每行独立计算，上一行得到的摘要不会用作下一行的输入。这里的全部指操作维护的固定清单。

## 按位数筛选
<!-- sources: engine, md5 -->

输出长度筛选选择清单内的同位数组，仍可得到多种互不相同的值。例如 128 位组包含 MD2、MD4、MD5、部分 BLAKE2 形式以及密码兼容格式。组名描述输出尺寸，不描述算法安全性。

:::example 128 位组中的 MD5
[输入]
ASCII abc，128 位组，显示算法名。
[结果]
MD5 行为 900150983cd24fb0d6963f7d28e17f72。
[说明]
固定运行共返回 8 个摘要，MD5 这一行可以独立和 RFC 1321 对照。
:::

## 同长度的并列结果
<!-- sources: engine, nist -->

对一段材料生成多个候选值，可以将每条输出与资料中的参考串比较。筛选结果出自各算法独立实现，不能用统一截断一个长摘要来替代。同长度的 SHA2 与 SHA3 直接表明这种差异。

:::example 同为 256 位的两行
[输入]
ASCII abc，256 位组，显示算法名。
[结果]
SHA2 256 为 ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad。
SHA3 256 为 3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532。
[说明]
两行分别各有 64 个十六进制字符，值不同。
:::

## 命名与可追溯性
<!-- sources: engine -->

结果可以只保留值，也可以给每行附上算法名字。省略名字不改变摘要的字节，但脱离完整表后，单凭一个十六进制值通常不能确认它的来源算法。

:::example 去掉名称
[输入]
ASCII abc，128 位组，关闭显示名称。
[结果]
其中一行仍为 900150983cd24fb0d6963f7d28e17f72，全组仍有 8 行摘要。
[说明]
MD5 的计算与结果的标注独立。
:::

## 用可信样本复算
<!-- sources: md5, nist, engine -->

把批量结果用于比对时，记录原文究竟是文件字节、编码后的字符串还是另一段数据的文本表示。候选匹配后，结合规范中的明确算法名复算单项。预置组还可能遗漏特定历史变体、自定义输出长度或协议封装。

## 常见误区

- 批量执行各算法使用原输入，不会把摘要串成处理链。
- 标示 256 位的多行可能来自不同构造。
- 批量匹配只能比较已给出的数据和摘要，不能逆推出唯一原文。
