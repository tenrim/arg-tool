---
capabilityId: native:code-befunge
title: Befunge-93
topicGroup: programming
summary: 按二维网格、执行方向和栈顺序解释 Befunge-93 的计算结果。
aliases:
  - Befunge
  - 二维栈语言
  - Playfield
sources:
  - id: ref
    title: Befunge-93 Documentation
    publisher: Chris Pressey / Cat’s Eye Technologies
    url: https://git.catseye.tc/Befunge-93/blob/master/doc/Befunge-93.markdown
    language: en
    kind: author-spec
    locator: 方向、环形网格、栈和指令表
  - id: engine
    title: 固定 esolang 执行器
    publisher: Esolang Park 等
    url: /vendor/coderunner/esoteric.js
    language: en
    kind: implementation
    locator: Befunge 的 80×25 程序格和取栈输出
---

## 介绍
<!-- sources: ref -->

Befunge-93 将源程序组织成二维字符网格。执行指针从左上角出发，初向右移动。程序中的方向指令可改为向左、向上或向下，因而阅读路径不一定按文本行序。

## 网格与指令方向
<!-- sources: ref, engine -->

规范的程序格是 80×25 的环形边界，从一边走出可绕到相对边。每次在当前位置执行字符指令，再按方向移动。原始的换行和空格用于确定字符坐标。

:::example 第二行才开始计算
[输入]
v
>12+.@
[结果]
输出数字 3，之后有一个空格。
[说明]
v 让指针到第二行，方向号转为向右，1 与 2 入栈后相加。
:::

## 后进先出的栈
<!-- sources: ref, engine -->

数字字符将 0 至 9 的值压入栈。算术用后进先出的顺序取操作数。双引号之间的字符按代码值入栈，末尾压入的字符在逐一弹栈时最先取到。

:::example 逆序弹出两个字符
[输入]
"AB",,@
[结果]
BA
[说明]
A 先压入，B 后压入，两次逗号输出依次弹出 B、A。
:::

## 程序输入与结束
<!-- sources: ref, engine -->

& 读取整数，点号弹出并打印十进制值及空格，逗号按字符输出。@ 结束程序。数值栈与执行方向可以独立变化，观察输出时可逐步比较两者。

:::example 输入一个数再加一
[输入]
程序 &1+.@，输入 41。
[结果]
数字 42，随后一个空格。
[说明]
先压入 41，再压入 1，相加弹出打印，然后停机。
:::

## 读写网格
<!-- sources: ref, engine -->

g 和 p 按坐标访问程序格，可读取或替换其中的字符值。因此执行期间的网格也可能变化。解释同一段代码的两次执行时，需要记录当时网格、位置、方向和栈。

## 常见误区

- Befunge-93 的方向会变化，看到下一行不表示自然落到下一行起点。
- 点号打印数值，逗号打印字符。
- 字符串模式压栈与弹出时的顺序相反。
