---
capabilityId: op:Caret%2FM-decode
title: 脱字符与 M- 解码
topicGroup: encoding
summary: 将文本转储中的脱字符记法和高位标记还原为字节。
aliases:
  - caret notation
  - M-
  - cat -v
  - ^M
sources:
  - id: gnu
    title: cat invocation
    publisher: GNU Coreutils
    url: https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html
    language: en
    kind: official-doc
    locator: -v、-T、-E 的可视化规则
  - id: ascii
    title: "RFC 20: ASCII format for network interchange"
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc20.html
    language: en
    kind: standard
    locator: 控制字符表和 0x7F
  - id: chef
    title: CyberChef 11.5.0 Caret/M-decode
    publisher: GCHQ / CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Caret/M-decode 输入、输出及参数
---

## 介绍
<!-- sources: gnu, ascii -->
某些终端转储将不可打印字符写成可见符号，如 ^M。M- 前缀可用来表示原字节的第七位（最高位）已置位。反向读取此类文本时，要跟随产生转储的命令及对应约定。

## 脱字符控制码
<!-- sources: gnu, ascii, chef -->
前缀 ^ 与独立的显示字符组成一个控制记号。^A 至 ^Z 对应 01 至 1A，^@ 为 00，^? 为 7F。常见的 ^M 对应回车（0D）。

:::example 三个相邻控制码
[输入]
^A^M^?
[结果]
01 0D 7F
[说明]
依次为控制码 SOH、CR 和 DEL，每组都恢复一个字节。
:::

## M- 的高位含义
<!-- sources: gnu, ascii, chef -->
M- 可对普通可见字符、也可对 ^ 控制记号设置 80 位。先求其 ASCII 可见字符或控制字节，再加 128。若同一段材料使用其他高位转义，不能凭前缀外形代换。

:::example 给大写字母的字节加高位
[输入]
M-A
[结果]
C1
[说明]
A 的 ASCII 为 41，置高位后为 C1。
:::

:::example 给控制码加高位
[输入]
M-^]
[结果]
9D
[说明]
^] 原是 1D，置位后为 1D＋80＝9D。
:::

## 转储中的原字面歧义
<!-- sources: gnu, chef -->
转储格式并不总为原来已经是可见字符的 ^、M 和连字符提供转义。因此不能只凭一串字符唯一反推出原始字节。题面若同时给文件偏移、工具命令或十六进制对照，应一起核验。

## 字节还原后的显示
<!-- sources: gnu, ascii, chef -->
回车、删除和其他控制字节在正文中可能不可见，或改变终端行为。可以把还原内容表示为十六进制再观察。M- 的高位字节不必构成有效 UTF-8。

## 常见误区

- ^ 在普通文本中也可以是字面字符。
- M- 用于记录高位时不能只把字面前缀删掉。
- ^? 表示 DEL，而非以 A 为起点的连续编号。
- 字节可还原不意味着其文本编码已知。
