---
capabilityId: pair:To%20Base92
title: Base92
topicGroup: encoding
summary: 说明 Base92 的 13 位双符号、六位末组和空输入约定。
aliases:
  - To Base92
  - From Base92
  - Base92 位分组
sources:
  - id: author
    title: base92 — 原作者说明
    publisher: thenoviceoof
    url: https://thenoviceoof.com/blog/projects/base92/
    language: en
    kind: author-spec
    locator: 13 位分组、字符选取和空值约定
  - id: original
    title: Base92 原始实现
    publisher: thenoviceoof
    url: https://github.com/thenoviceoof/base92
    language: en
    kind: implementation
    locator: 原始编码与解码
  - id: pinned
    title: CyberChef 固定源码 operations/ToBase92.mjs
    publisher: GCHQ CyberChef
    url: /vendor/knowledge/cyberchef/src/core/operations/ToBase92.mjs
    language: en
    kind: implementation
    locator: 完整组和尾组
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: alphabet
    title: CyberChef 固定源码 lib/Base92.mjs
    publisher: GCHQ CyberChef
    url: /vendor/knowledge/cyberchef/src/core/lib/Base92.mjs
    language: en
    kind: implementation
    locator: 数字 0 至 90 的字符对应
    license: Apache-2.0
    licenseUrl: /vendor/knowledge/LICENSE.txt
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base92 与 From Base92
---

## 介绍
<!-- sources: author, original -->

Base92 试图以可见字符承载二进制数据。常规符号表承载 91 个数位，两个符号有 8,281 种组合，足以记录 13 位的 8,192 种数值。方案名称还来自原始实现为特殊空值保留了一个符号。

## 十三位到两个数位
<!-- sources: author, alphabet, pinned -->

依次取连续 13 位作为一个整数。除以 91 得到商与余数，先输出表示商的字符，再输出表示余数的字符。数据宽度为 13 位，组合中有多出来的数值区间，正常编码不会产生那些值。

:::example 单字节补成双符号
[输入]
A，8 位二进制为 01000001
[结果]
8q
[说明]
当前还剩 8 位，要补零到 13 位。所得 2,080 除以 91，商 22、余 78，对应 8 和 q。
:::

## 六位末组
<!-- sources: original, alphabet, pinned -->

完整双符号都写完后，若末段只有一至六位，则补零到六位，用一个字符表示。末段有七至十二位时补零到十三位，用两个字符表示。末段无剩余位便无需输出尾符号。

:::example 两字节的短尾组
[输入]
AB，即 01000001 01000010
[结果]
8y2
[说明]
前 13 位是 0100000101000，即 2,088，商 22、余 86，对应 8y。余下 010 补为 010000，数位 16 对应 2。
:::

## 解码与空输入
<!-- sources: original, pinned, engine -->

解码时将两个字符还原为 13 位，最后若有一个单独字符则恢复为 6 位。按顺序取回完整八位字节，舍去结尾仅用于对齐的剩余位。原作者实现用波浪号表示空输入，其他实现可直接输出空串，互换时要核对这一约定。

:::example 双符号的往返
[输入]
8y;K
[结果]
ABC
[说明]
前一对恢复 2,088。后一对的数位为 25、41，恢复 2,316。连接两个 13 位组后取前三个字节，余下两位是补零。
:::

## 线索判读
<!-- sources: author, alphabet -->

Base92 结果常混入标点和大小写字母。仅凭可见字符范围很难与其他 Base 方案区分。更可靠的证据是双符号能恢复到预期的 13 位范围、末组有效，且所得字节有可验证的前缀、长度或内容结构。

## 常见误区

- 两个常规符号组成一个 13 位值。它们分别对应的数位并没有固定的 6.5 位编码。
- 波浪号若用作空值标记，含义由具体实现决定，不是任意消息的补尾字符。
- 双符号形式可能有超出 13 位容量的组合。字符在表中只是第一层合法性条件。
