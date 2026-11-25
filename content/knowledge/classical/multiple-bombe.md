---
capabilityId: op:Multiple%20Bombe
title: 多机恩尼格玛破译
topicGroup: classical
summary: 在多组转子排列和反射器设定内分别应用同一明文约束。
aliases:
  - Multiple Bombe
  - 多机 Bombe
  - 恩尼格玛转子排列
  - 批量搜索
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
<!-- sources: menus, history, drawings, guide -->

当恩尼格玛使用的转子顺序或反射器只知道部分信息时，可以按机型列出多组候选组合。多机 Bombe 对这些组合逐一应用同一明文菜单的筛选，每组独立得到可能的转子窗口和插线信息。这里的“多机”描述多次搜索的设置组合。

## 转子排列的计数
<!-- sources: guide, engine -->

三槽配置中，同一转子不能放入两个槽时，若有 N 个可用主转子，就有 N(N−1)(N−2) 种有序排列。固定一个反射器时只检查这些排列。允许两个反射器时，先得到两组这样的排列候选。四转子模式还需要额外确定左端特殊转子的种类及其位置关系。

## 一个菜单、多组不同初始条件
<!-- sources: menus, guide, engine -->

同一 Crib 落在同一密文偏移，菜单结构可在搜索前建立。改变设置后，转子接线与步进位置在各处产生的字母关系也会不同，因此仍须在每套组合上检验。涉及中转子步进的限制与单机入口相同。

## 转子空间及实际搜索
<!-- sources: guide, engine -->

下面的两次运行共同使用 I—II—III、反射器 B、环位 AAA、起始窗口 AAA、插线板为空生成的密文。选择范围是为了分别观察转子排列和反射器的作用。

:::example 组合规模
[输入]
可用主转子共 5 个，使用其中不同的 3 个。反射器分别限制为 1 个和放宽为 2 个。
[结果]
先有 5 × 4 × 3 = 60 套顺序，放宽反射器后为 120 套顺序及反射器组合。
[说明]
数量只描述外层组合。每组还要检查其初始窗口和菜单约束。
:::

:::example 在 I、II、III 中寻找正确顺序
[输入]
密文 BJZCOMCULKKKBEMSDXVB。
明文片段 ABABACADABACABADABCA，偏移 0。
范围仅含 I、II、III 的所有排列，固定反射器 B。
[结果]
有 6 套外层排列。经停止点复查，返回的窗起点为 AAA，配置对应机器从左至右 I—II—III 与反射器 B。
[说明]
固定引擎数据中的三个转子接线字段按右至左出现。复现完整恩尼格玛时须按机器左至右的顺序还原。
:::

:::example 加入第二个反射器
[输入]
保持上一例的密文与菜单，允许反射器 B 和 C。
[结果]
外层组合增至 12，复查后仍返回反射器 B 与原来的窗口 AAA。
[说明]
增加搜索范围会增加待试机器组合，本例的合格结果数量并未增加。
:::

## 结果范围与复算
<!-- sources: menus, guide, engine -->

没有出现某个组合，可能是它未进入候选范围，也可能是菜单或复查排除了它。一个被报告的停止点只需要符合当前的线索。完成后仍要把猜到的窗口、反射器、转子顺序和插线设置应用到完整消息上，观察未用于筛选的部分能否还原。

## 搜索范围在历史材料中的意义
<!-- sources: history, drawings, menus -->

真实任务常先根据通信类型、日期和已有破译记录缩小可能的转子集合。在现代复现题中，同类信息可能直接给出机型或反射器。整理这些可证实条件，可以减少运行的组合数，并使最终答案明确对应哪一套机型。

## 常见误区

- 使用三个转子的顺序要区分 I—II—III 和 III—II—I，不宜按无序选择计数。
- 给出更多待试转子不保证能解开错误的明文对齐。
- 输出里出现候选窗只说明该范围中找到相容设置，完整明文仍要复算。
- 编辑自定义转子列表时，记录的顺序、接线表的固定含义和程序输出方向应分别核对。

