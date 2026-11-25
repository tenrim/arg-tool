---
capabilityId: pair:To%20Binary
title: 二进制字节
topicGroup: characters
summary: 说明字节的八位展开、连续位串的分组、补齐宽度及其限制。
aliases:
  - To Binary
  - From Binary
  - 二进制字节展开
sources:
  - id: radix
    title: ECMAScript — Number::toString 与 BigInt::toString
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-numeric-types-number-tostring
    language: en
    kind: standard
    locator: 按进位基数表示数值
  - id: ascii
    title: RFC 20 — ASCII Format for Network Interchange
    publisher: IETF
    url: https://www.rfc-editor.org/info/rfc20/
    language: en
    kind: standard
    locator: 第 2、3 节，字符编码与二进制编号
  - id: engine
    title: CyberChef 固定操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Binary 与 From Binary
---

## 介绍
<!-- sources: radix, engine -->

二进制字节把一个八位字节依次写成 0 和 1。每个位置表示一个二的幂。采用逐字节展示时，原序列中第一个字节仍位于结果开头，字节内部再按高位到低位书写。

## 八个位权
<!-- sources: ascii, radix -->

从最高到最低位的权值是 128、64、32、16、8、4、2、1。二进制写法中的 1 表示取该位置的权值，0 表示不取。把选中的权值相加可恢复字节。

:::example 三个边界字节
[输入]
字节 00、80、FF
[结果]
00000000 10000000 11111111
[说明]
00 没有置位，80 只有最高位置位，FF 的八位全部置位，数值为 255。
:::

## 不带分隔符的位串
<!-- sources: engine, ascii -->

若传输协议已经选定每组八位，显示时可以省略组间空格。解码须从正确的起点按八位切分。如果从中间截取了位串，需要先确认起点是否仍与原来的字节边界对齐。

:::example 连续十六位的切分
[输入]
0100000101000010，按八位分组
[结果]
41 42，即 ASCII 的 AB。
[说明]
前八位算得 64+1，后八位算得 64+2。两字节分别保留其位置。
:::

## 最小展示宽度
<!-- sources: radix, engine -->

为了对齐行列，可以给数值较小的二进制写法左补零。若设定的是最小显示宽度，那么超出宽度的原始值仍要完整输出。固定宽度字段是另一种结构，需要另外定义最大可表示的值。

:::example 最少四位的展示
[输入]
十进制字节 5、250，最少写成四位
[结果]
0101 11111010
[说明]
5 的自然写法是 101，需补一个零。250 原本需要八位，保留全部八位。
:::

## 位序和字节序
<!-- sources: ascii, engine -->

逐字节展开默认先读每个字节的最高位。解释多字节整数时，还要确认哪个字节是高位字节。交换字节顺序和反转某个字节内部的位顺序是两种不同变换。

## 常见误区

- 字面文本 01000001 自己可由八个数字字符组成，只有按二进制语法读取后才得到字节 41。
- 宽度不足不能假定为截断。若组宽可能变化，去掉分隔后就无法可靠拆组。
- 先选择需要恢复的是逐字节序列还是一个整体整数，两种任务保留的边界不同。
