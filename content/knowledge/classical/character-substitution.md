---
capabilityId: op:Substitute
title: 字符替换
topicGroup: classical
summary: 按位置把源字节表与目标字节表配对，替换消息中的相应项。
aliases:
  - Substitute
  - 由两张对应字符表进行替换
  - 位置映射
  - 单表替换
sources:
  - id: pku
    title: 密码学课件：置换密码与维吉尼亚密码
    publisher: 北京大学信息科学技术学院
    url: https://www.icst.pku.edu.cn/zlian/docs/20181023161806486415.pdf
    language: zh-CN
    kind: official-doc
    locator: 古典替换规则
  - id: lmu
    title: Ciphers
    publisher: Ray Toal／洛约拉马利蒙特大学
    url: https://cs.lmu.edu/~ray/notes/ciphers/
    language: en
    kind: author-spec
    locator: Monoalphabetic substitution
  - id: ascii
    title: RFC 20 — ASCII format for network interchange
    publisher: RFC Editor
    url: https://www.rfc-editor.org/rfc/rfc20.html
    language: en
    kind: standard
    locator: 字符及控制码的值
  - id: engine
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Substitute
  - id: source
    title: CyberChef 11.5.0 固定源码
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/blob/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/Substitute.mjs
    language: en
    kind: implementation
    locator: 操作的消息通路与轮配置
---

## 介绍
<!-- sources: pku, lmu -->

字符替换把符号映到另一个符号。直接替换的定义是两张同长度的有序表逐位配对，给定源表中的一项，目标取同一下标。

## 逐位配对与保留顺序
<!-- sources: lmu, source -->

令源表为 S，目标表为 T，输入符号 x 位于 S 的第 i 个位置时输出 T[i]。原先的第 n 个位置仍对应结果的第 n 个位置。未列在源表内的字节保持原样。

:::example 保留表外字符
[输入]
源表 ABCD，目标表 WXYZ；输入 ABCDE?；区分大小写
[结果]
WXYZE?
[说明]
A 至 D 分别变成 W 至 Z。
:::

## 大小写和表示方式
<!-- sources: ascii, engine, source -->

ASCII 的 A 和 a 具有不同字节值。区分大小写时可独立配对；采用忽略大小写的分支时，配对统一比较，而输出保留所见字母的大小写形态。范围和转义按语法先展开。

:::example 区分大小写
[输入]
ABCD→WXYZ；AB-CD ab
[结果]
WX-YZ ab
[说明]
小写 ab 不在本例源表内。
:::

:::example 以同一表忽略大小写
[输入]
ABCD→WXYZ；AbCd ab
[结果]
WxYz wx
[说明]
小写输入位置使用对应的小写。
:::

## 逆表与冲突
<!-- sources: pku, lmu, source -->

要反向重建原文，观测到的每个输出须有唯一来源。目标列出现重复会丢失信息；与表外原样通过的字符撞值时也可能产生同一个输出。

:::example 同值冲突
[输入]
ABCD→WXXY；输入 ABCD
[结果]
WXXY
[说明]
两个 X 的来源只能由额外材料区分。
:::

## 频率与位置证据
<!-- sources: lmu, pku -->

对整个符号集的双射固定替换会保留频数结构，只改变频率对应的字符。重复位置、词长及分隔符也可提供线索。样本太短时，频率只能提出候选。

## 核对来自题面的字符表
<!-- sources: lmu, source -->

题面若给两行刻度或符号表，先确认两行的阅读顺序、有效字节和方向。用同时含表内、表外字符的短例子检验映射，再核对实际提示中的重复位置和标点。

## 常见误区

- 字母身份变化和列换位产生的结果有不同结构。
- 调换两张表只有在反查无冲突时才能完整还原。
- 表中的可见反斜线记号可能代表单个控制字节。
- 中文文本转成 UTF‑8 后包含多字节字符，任意单字节表可能破坏字节序列。

