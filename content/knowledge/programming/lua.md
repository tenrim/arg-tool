---
capabilityId: native:code-lua
title: Lua 5.4
topicGroup: programming
summary: 介绍 Lua 的 table、数值运算和输入输出，以本地解释器核对三个短程序。
aliases:
  - Lua
  - Lua table
  - io.read
sources:
  - id: ref
    title: Lua 5.4 Reference Manual
    publisher: Lua.org / PUC-Rio
    url: https://www.lua.org/manual/5.4/manual.html
    language: en
    kind: official-doc
    locator: 第 2、3、6 节，类型、算术和 I/O
  - id: local
    title: 代码执行 Worker
    publisher: 迷雾工具箱
    url: /coderunner/worker.js
    language: zh-CN
    kind: implementation
    locator: executeLua 对读取和打印的连接方式
---

## 介绍
<!-- sources: ref -->

Lua 是动态类型脚本语言，table 是最常用的数据结构。一个 table 可以保存按整数位置排列的元素，也可以保存由文本等值索引的字段。宿主可以嵌入 Lua，将输入与输出连到自己的接口。

## table 的整数索引
<!-- sources: ref -->

使用花括号按序列构造 table 时，不写键的条目从 1 开始分配整数索引。Lua 允许显式定义其它值作键。查询一个未设置的普通键时得到 nil，表示缺少该字段。

:::example 两项的序列
[输入]
local t = {10,20}; print(t[1], t[2], t[3])
[结果]
依次显示 10、20、nil。
[说明]
初始化只向键 1 和 2 写入值，第三个键未创建。
:::

## 整数与浮点
<!-- sources: ref -->

Lua 5.4 的数字包括整数与浮点形式。常规除法 / 得到浮点结果，// 表示向下的除法，% 以相容的方式计算余数。

:::example 对 7 和 2 运算
[输入]
print(7/2,7//2,7%2)
[结果]
依次显示 3.5、3、1。
[说明]
7 等于 3×2+1。第一个表达式保留商的小数部分。
:::

## 从输入流读取
<!-- sources: ref, local -->

io.read 可以指定读取内容的方式。数值模式按数值读取，允许同一行中依次取多个数。print 通常在一组值后结束一行，io.write 可以只输出约定内容而不另加换行。

:::example 两个输入数字求和
[输入]
代码 print(io.read('*n')+io.read('*n')); io.write('clue')。程序输入 19 23。
[结果]
42
clue
[说明]
第一次和第二次数值读取分别为 19、23。最后的 clue 由 io.write 写出，末尾没有新增换行。
:::

## 逻辑值与外部能力
<!-- sources: ref, local -->

Lua 中只有 false 与 nil 视为假，0 和空字符串也可为真。引擎的语言和部分库由 Lua 定义，宿主提供哪些文件、系统与通信入口需要按实际嵌入方式判断。

## 常见误区

- 字面序列的第一个默认索引是 1。
- nil 表示缺少值，不等于数值 0。
- 斜杠、双斜杠与余数操作不能互换。
