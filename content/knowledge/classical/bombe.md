---
capabilityId: op:Bombe
title: 恩尼格玛破译机
topicGroup: classical
summary: 通过猜测明文对齐形成约束菜单，筛选给定转子顺序中的可能起点。
aliases:
  - Bombe
  - 明文片段 Crib
  - 恩尼格玛约束图
  - 停止点
sources:
  - id: menus
    title: Menus and Cribs
    publisher: The National Museum of Computing
    url: https://www.tnmoc.org/bh-16-menus-and-cribs
    language: en
    kind: official-doc
    locator: 明文假设、menu、Bombe 停止点与检查
  - id: history
    title: Enter Turing and Welchman
    publisher: The National Museum of Computing
    url: https://www.tnmoc.org/bh-6-enter-turing-and-welchman
    language: en
    kind: official-doc
    locator: 英国机型设计与接线逻辑
  - id: drawings
    title: Puzzle 12 — Enigma
    publisher: GCHQ
    url: https://www.gchq.gov.uk/information/turing-challenge/enigma
    language: en
    kind: official-doc
    locator: 英国 Bombe 的技术图纸与历史背景
  - id: guide
    title: Enigma, the Bombe, and Typex
    publisher: GCHQ CyberChef contributors
    url: https://github.com/gchq/CyberChef/wiki/Enigma,-the-Bombe,-and-Typex/ed7ab8b92789111139fb98d23a9bf2249311b6a7
    language: en
    kind: official-doc
    locator: Bombe、menu、loops、checking machine
  - id: engine
    title: CyberChef 11.5.0 — Bletchley 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Bletchley.js
    language: en
    kind: implementation
    locator: Bombe、Multiple Bombe 和 Enigma
---

## 介绍
<!-- sources: menus, history, drawings -->

英国 Bombe 是二战期间用来筛选恩尼格玛密码设置的机电装置，Alan Turing 与 Gordon Welchman 的研究推动了设计。操作人员将可能存在于密文中的明文片段与密文对齐，再把关系转换为机器可以检查的菜单。停止点要经过额外检查才会进入后续还原。

## 从 Crib 到关系菜单
<!-- sources: menus, history, guide -->

Crib 是确知或猜测的一段明文。将它与密文某段对齐时，同一位置的一对字母形成一条带位置的联系。标准反射结构使每个位置的明文字母与密文字母不同，有任何一位相同即可排除该对齐。若多个联系首尾相接，就可由一个字母出发，沿环传播约束并检查是否一致。

## 转子候选与插线关系
<!-- sources: menus, guide, engine -->

固定转子顺序和反射器后，候选仍有多个初始窗口。每个候选决定在各位置使用的转子映射。插线板要求交换关系前后一致，例如 A 与 Z 配对后，Z 也与 A 配对。搜索把相互矛盾的转子候选排除，再对停止点应用检查。

## 人工构造的菜单与停止点
<!-- sources: guide, engine -->

下列密文使用三转子 I—II—III、环位和起始窗口均为 AAA、反射器 B、插线板为空的恩尼格玛生成。片段未跨越右转子带动中转子的位置，因此适用于这条固定搜索路径。

:::example 对齐不可能与菜单闭环
[输入]
先将明文 ABC 与密文 ABC 对齐，再将明文 CAB 与密文 ABC 对齐。
[结果]
第一组在第 0 位发生相同字母冲突。第二组有 C–A、A–B、B–C 三条联系，构成一个环。
[说明]
不同字母可以通过最基本的结构检查。可形成关系环本身并不证明第二组就是某条历史消息的真实对应。
:::

:::example 在一套转子顺序内搜索
[输入]
密文 BJZCOMCULKKKBEMSDXVB。
明文片段 ABABACADABACABADABCA，起点偏移 0。
固定 I—II—III、反射器 B，启用停止点复查。
[结果]
菜单报告 6 个环，筛出窗口 AAA，复查显示 ABABACADABACABADABCA。
[说明]
输出只约束菜单涉及的部分插线。AA、BB 这类标记表示该字母在插线板位置保持自身。
:::

:::example 片段从偏移 2 开始
[输入]
保持上一例密文、转子与反射器，将明文片段改为 ABACADABACABADABCA，偏移 2。
[结果]
筛出窗口 AAC，对应复查片段 ABACADABACABADABCA。
[说明]
这组输出位置是第三个字母处理前的窗口，前面两次步进已使右转子由 A 移到 C。
:::

## 跨越步进的边界
<!-- sources: guide, engine -->

固定模拟的菜单检查不模拟明文片段中中转子的步进，也不直接恢复环位。过长片段即使确实出自原文也可能因跨步而无匹配。验证一条候选时，需要区分片段起点与消息起点，补齐或确认插线，再用完整的恩尼格玛设置演算。

## 历史停止点与解谜线索
<!-- sources: menus, history, drawings, guide -->

Bombe 的输出是可继续检查的转子位置及字母关系。谜题若给出易确认的开头或重复语句，可先排列若干可能的对齐，记录每一条的假设和对应范围。候选能否解释片段外的内容，是确定是否找到完整配置的重要依据。

## 常见误区

- 通过无同位字母检查仅代表对齐可行，还不能确认正确。
- 菜单环是字母关系里的环，不能把它当成机器的三个实物转子。
- 搜到的窗口可能对应片段起点，需要和原消息的最初窗口区分。
- 出现空结果也可能由于反射器、步进或环位假设不符。

