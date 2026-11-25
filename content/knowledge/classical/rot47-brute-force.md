---
capabilityId: op:ROT47%20Brute%20Force
title: 穷举 ROT47
topicGroup: classical
summary: 在 ASCII 可见字符环上枚举候选，解释位移编号、混合符号与短样本筛选。
aliases:
  - ROT47 Brute Force
  - 枚举可见字符循环位移
sources:
  - id: shift
    title: ROT47 算法说明
    publisher: DenCode
    url: https://dencode.com/zh-cn/cipher/rot47
    language: zh-CN
    kind: author-spec
    locator: 字符环与半圈位移
  - id: abnf
    title: RFC 5234 — Augmented BNF for Syntax Specifications
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5234.html#appendix-B.1
    language: en
    kind: standard
    locator: 附录 B.1 的字符分类
  - id: companion
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/info/rfc20/
    language: en
    kind: standard
    locator: 第 2 节字码表
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: ROT47 Brute Force
  - id: worker
    title: CyberChef 固定版本的 Ciphers 模块
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/modules/Ciphers.js
    language: en
    kind: implementation
    locator: ROT47 Brute Force 候选生成与筛选
---

## 介绍
<!-- sources: shift, abnf -->

穷举 ROT47 将常规 ROT47 的 94 字符环固定下来，尝试这个环上的不同位移。感叹号至波浪号的连续区间涵盖了数字、字母和标点。若题目恰好使用标准 ROT47，向前移动 47 格就能还原。步长未知时需要比较其他候选。

## 环长与候选数量
<!-- sources: abnf, companion, engine, worker -->

一个 94 项的环提供 94 种不同的位移量，其中 0 档保持原文。以省略原文的候选列表为例，其余 93 档覆盖所有非零位移。取单个字符即可看出步长与候选字符之间的对应关系。

:::example 单字符遍历
[输入]
!
[结果]
步长 1 → "
步长 2 → #
步长 93 → ~
[说明]
第一个字符处在环的首位，加 93 就到末位。完整的非零位移列表包含 93 行。
:::

## 混合符号的对应
<!-- sources: shift, companion, worker -->

加同一位移后，不同类型的字符可以互相替换。保留空格的文本仍有词长提示。判断一个候选是否合理时，字母、数字、标点和上下文需要共同吻合。

:::example 同时恢复单词与数字
[输入]
w: caP
已知包含 Hi
[结果]
步长 47 → Hi 42!
[说明]
w 和冒号还原成 H、i。c、a 和 P 分别还原成 4、2 和 !。普通空格在环外。
:::

## 局部样本与全段复原
<!-- sources: engine, worker -->

样本是整条密文的一个连续区间。已知片段可用于缩小候选范围，输出也只对应选取的区间。确定候选步长后，整个密文需要用同一位移重新处理，才会得到前后内容。

:::example 以两位数字校验步长
[输入]
密文 w: caP
从零计数第 3 位起取 2 字符，筛选包含 42 的候选
[结果]
步长 47 → 42
[说明]
所取的两个字符是 ca。这里的数字是小样本上的匹配结果，完整候选还包含两侧的 Hi 和感叹号。
:::

## 解谜应用
<!-- sources: shift, abnf, worker -->

字符环的范围决定了候选能解释哪些变化。若多个不同密文字符都必须还原为同一个明文字符，就违背了单一环形位移的对应关系。若题面给出了两个可对齐的字符对，可以分别计算其码位差对 94 的余数。两个余数相同才与同一位移相容。

## 常见误区

- 加 47 是标准 ROT47 的逆变换。它不能作为其他未知步长的通用逆运算。
- 枚举处理的是连续的可见 ASCII 区间。不会将普通空格或制表符计入第 95 个符号。
- 局部匹配仅验证所取样本。输出长度等于样本长度，可能只覆盖原文的一小段。
