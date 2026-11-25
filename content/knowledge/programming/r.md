---
capabilityId: native:code-r
title: R
topicGroup: programming
summary: 用 R 向量的逐元素运算、位置索引与 NA 处理复核统计结果。
aliases:
  - Rscript
  - 向量化
  - NA
  - R 基础统计
sources:
  - id: manual
    title: An Introduction to R
    publisher: R Core Team
    url: https://cran.r-project.org/doc/manuals/r-release/R-intro.html
    language: en
    kind: official-doc
    locator: 向量、位置索引、循环利用与缺失值
  - id: mean
    title: Arithmetic Mean
    publisher: R Core Team
    url: https://stat.ethz.ch/R-manual/R-devel/library/base/html/mean.html
    language: en
    kind: official-doc
    locator: na.rm 与均值
  - id: local
    title: 代码运行语言目录
    publisher: 迷雾工具箱
    url: /coderunner/server-catalog.js
    language: zh-CN
    kind: implementation
    locator: Rscript 命令行输入
---

## 介绍
<!-- sources: manual, local -->

R 面向统计与数据表达。基础运算经常直接作用在整个向量上，无需显式逐格循环。命令行脚本可以读取标准输入，将结果写成表格或文本。

## 短向量循环利用
<!-- sources: manual -->

向量参与逐元素算术时，较短向量按规则循环到较长长度。即使语法可执行，也应检查循环是否表达了真实数据关系。当长度不是整倍数时，某些运算会警告。

:::example 长度 4 与长度 2
[输入]
c(1,2,3,4) + c(10,20)
[结果]
11、22、13、24。
[说明]
第二个向量按 10、20、10、20 与对应项相加。
:::

## 索引与重排
<!-- sources: manual -->

R 位置索引从 1 开始。正整数索引可写成一个向量，结果按照给出的顺序取得。索引向量可重复位置，因而结果元素数不一定和源向量一致。

:::example 选择第三项和第一项
[输入]
c(10,20,30)[c(3,1)]
[结果]
30、10。
[说明]
索引顺序决定结果顺序。
:::

## 缺失值和均值
<!-- sources: manual, mean -->

NA 表示缺失值。统计函数往往通过参数决定是否剔除缺失记录。将 NA 从均值计算中排除，分母也是有效数据数量，和把缺失值替换成零的做法不同。

:::example 缺失值不计入分母
[输入]
mean(c(1,NA,3), na.rm=TRUE)
[结果]
2。
[说明]
有效项只有 1 和 3，(1+3)÷2=2。
:::

## 输入和统计条件
<!-- sources: manual, local -->

用 readLines 读到的是一列文本，按需解析数值后再计算。保存结果时应说明缺失值策略和参与运算的行数。否则两个均值即便数值接近，也有可能来自不同样本。

## 常见误区

- R 的位置索引从 1 开始。
- NA 表示缺失，不能自动当作 0。
- 向量回收可以完成表达式，计算有意义仍取决于数据是否对应。
