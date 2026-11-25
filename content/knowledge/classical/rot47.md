---
capabilityId: op:ROT47
title: 可打印字符移位（ROT47）
topicGroup: classical
summary: 说明 ROT47 在 94 个可见 ASCII 字符中的轮转、符号边界和可逆条件。
aliases:
  - ROT47
  - ASCII 轮转
  - 可见字符移位
sources:
  - id: dencode
    title: ROT47 算法说明
    publisher: DenCode
    url: https://dencode.com/zh-cn/cipher/rot47
    language: zh-CN
    kind: author-spec
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/info/rfc20/
    language: en
    kind: standard
    locator: 第 2 节字码表
  - id: abnf
    title: RFC 5234 — Augmented BNF for Syntax Specifications
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc5234.html#appendix-B.1
    language: en
    kind: standard
    locator: 附录 B.1 的 VCHAR、SP 与 HTAB
  - id: rot13
    title: ROT13 算法说明
    publisher: DenCode
    url: https://dencode.com/zh-cn/cipher/rot13
    language: zh-CN
    kind: author-spec
    locator: 字母替换范围
  - id: engine
    title: CyberChef 操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: ROT47
---

## 介绍
<!-- sources: dencode, abnf -->

ROT47 将感叹号 ! 到波浪号 ~ 之间的 94 个 ASCII 字符视为连续的环。每个字符沿环向前移动 47 格，所以字母可以变成数字或标点，标点也可以变成字母。空格在这个区间之前，保留原位。

RFC 5234 用十六进制区间 0x21–0x7E 表示同一组可见字符。ROT47 把这个区间内的 ASCII 字符换成同一区间内的其他字符。

## 位移与边界
<!-- sources: ascii, dencode -->

若字符的十进制 ASCII 编号为 c，且 33 ≤ c ≤ 126，先减 33 得到环上的序号，再加 47、对 94 取余，最后加回 33。完整表达式为 33 + ((c − 33 + 47) mod 94)。

:::example 区间两端的对应
[输入]
!O P~
[结果]
P~ !O
[说明]
! 的编码为 33，加 47 得 80，即 P。~ 的编码为 126，加 47 后减去 94，得 79，即 O。中间的空格超出置换区间。
:::

## 二次移位与还原
<!-- sources: dencode, engine -->

47 是 94 的一半。移动两次累计 94 格，每个字符均回到原位。若约定改成移动 10 格，逆运算需移回 10 格，也可沿前向补足到 94 格。

:::example 字母与数字的混合替换
[输入]
Hi 42!
[结果]
w: caP
[说明]
H（72）变成 w（119），i（105）变成冒号（58），4 和 2 分别变成 c 和 a。将结果再移 47 格便可复原原文。
:::

## 两种字符环的差异
<!-- sources: ascii, abnf, rot13, dencode -->

制表符、换行以及非 ASCII 字符均不在 ROT47 的字符环内。ROT13 使用独立的英文字母环，标点也留在原位。两种变换都会保留空格，结果仍可能呈现迥异的符号分布。

:::example 相同原文的两种轮转
[输入]
中文 A3?
[结果]
ROT47：中文 pbn
ROT13：中文 N3?
[说明]
ROT47 把 A、3、问号依次移到 p、b、n。ROT13 只改变其中的 A。
:::

## 解谜应用
<!-- sources: dencode, rot13 -->

密文混入字母、数字与标点，而空格分隔出的词长仍接近自然语言时，可考虑 ROT47。它保持字符出现次数的一一对应，重复片段经过相同轮转仍然重复。短密文恰好出现单词并不罕见，前后文和已知前缀也须吻合。

## 常见误区

- 字符环只包含 94 个可见字符。把普通空格算成第 95 项会改变循环结果。
- 计算以感叹号为环的零点。直接对完整 ASCII 编号取模 128 会得到另一种变换。
- 反引号、反斜线和尖括号都可能是结果字符。复制时需要保留它们。
