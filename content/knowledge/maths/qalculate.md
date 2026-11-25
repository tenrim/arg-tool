---
capabilityId: native:qalculate
title: 综合计算器
topicGroup: maths
summary: 从表达式解析到精确求值，涵盖分数、方程、矩阵、单位及图形。
aliases:
  - Qalculate
  - 科学计算器
  - 任意精度
  - 符号计算
  - RPN
sources:
  - id: expr
    title: Expressions
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-expressions.html
    language: en
    kind: official-doc
    locator: Operators、Implicit Multiplication、to
  - id: mode
    title: Calculator Modes
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-mode.html
    language: en
    kind: official-doc
    locator: Rational Number Form、Number Bases 与 RPN
  - id: func
    title: Functions
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-functions.html
    language: en
    kind: official-doc
    locator: Algebra、Calculus、Matrices & Vectors、Plotting
  - id: list
    title: Function List
    publisher: Qalculate!
    url: https://qalculate.github.io/manual/qalculate-definitions-functions.html
    language: en
    kind: official-doc
    locator: integrate、det、plot 和 save
  - id: worker
    title: 工作表计算与文件隔离
    publisher: 迷雾工具箱
    url: /qalculate/worker.js
    language: zh-CN
    kind: implementation
    locator: 依序计算表达式与虚拟文件系统
---

## 介绍
<!-- sources: expr, func -->
Qalculate 把算式解析为数字、单位、变量、运算符和函数，再按数学规则求值。同一表达式可以保留为精确分数，也可以近似成十进制数。选择哪种表示往往取决于数据的用途。

## 运算顺序与输入的含义
<!-- sources: expr, mode -->
括号界定先计算的部分。分数线、隐式乘法和函数参数在复杂表达式中需要明确各自作用范围。逆波兰写法先放操作数再放运算符，其解析方式与普通中缀写法不同。三角函数输入显式的度或弧度，可减少对当前角度模式的依赖。

:::example 先做括号内的运算
[输入]
(7 + 8) * 2
[结果]
30
[说明]
先得括号内的 15，与 2 相乘。
:::

## 精确数、近似数与完整结果
<!-- sources: expr, mode -->
有限整数和有理数可以用分数保持精确，整数与分数运算的显示不必先截成有限小数。无理数的十进制展开只能显示一定精度。有效数字和小数位的计数规则不同，用显示文本重新输入时会将该次舍入带入下一步。

:::example 分数加法再乘二
[输入]
(1/3 + 1/6) * 2
[结果]
1
[说明]
化为同分母后括号内为 3/6，乘二得 1。
:::

## 方程、微积分、矩阵
<!-- sources: func, list -->
求解方程时要核对变量、定义域和全部返回根。定积分的上下限决定有向面积，具体参数的位置由函数签名规定。矩阵函数要按行列顺序读取输入。

:::example 定积分
[输入]
integrate(x^2, 0, 1)
[结果]
1/3
[说明]
原函数 x³/3 在 1 与 0 处的差为 1/3。
:::

:::example 二阶行列式
[输入]
det([1,2;3,4])
[结果]
−2
[说明]
矩阵两条对角线乘积相减，1×4−2×3＝−2。
:::

## 单位、图形与按行计算
<!-- sources: expr, list, worker -->
to 将计算结果转换为同量纲的目标单位。plot 从表达式在给定区间取样产生绘图数据，图像受采样与定义域影响。多行计算按顺序执行，可以前一行用 save 赋值，再在后一行引用精确结果。浏览器中生成的计算文件位于虚拟文件系统。

:::example 换算一个带量纲的值
[输入]
72 km/h to m/s
[结果]
20 m/s
[说明]
换算长度和时间的比例 1000/3600，乘以 72。
:::

:::example 工作表内引用分数
[输入]
save(1/3, "clue")
clue * 3
[结果]
第一行返回精确分数 1/3，第二行返回 1
[说明]
后续表达式引用保存的分数。
:::

## 常见误区

- 百分号一般表示除以 100。若要算涨价后的金额，需显式写明原值乘以 1 加涨幅。
- 有效数字精度不能直接等同为小数点后的位数。
- 复用结果时，从显示文字截取近似数会引入额外误差。
- 函数参数的位置及意义需查签名，定积分上下限并非变量名。
