---
capabilityId: op:Compare%20SSDEEP%20hashes
title: 比较 SSDEEP 哈希
topicGroup: file-compression
summary: 核对两条 SSDEEP 签名的相似度，并说明固定引擎处理尺度的已知差异。
aliases:
  - Compare SSDEEP hashes
  - ssdeep 分数
  - 签名相似度
sources:
  - id: paper
    title: Identifying Almost Identical Files Using Context Triggered Piecewise Hashing
    publisher: Jesse Kornblum · DFRWS
    url: https://dfrws.org/presentation/identifying-almost-identical-files-using-context-triggered-piecewise-hashing/
    language: en
    kind: author-spec
    locator: 滚动哈希触发边界与同源文件比较
  - id: ss
    title: ssdeep 项目源码
    publisher: ssdeep-project
    url: https://github.com/ssdeep-project/ssdeep/blob/master/fuzzy.c
    language: en
    kind: implementation
    locator: digest、fuzzy_compare、块尺度与比较约束
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Compare SSDEEP hashes：Cf().similarity、首字符比较和归一编辑距离
---

## 介绍
<!-- sources: paper, ss -->
SSDEEP 签名表达块尺度与供比对的两串分段摘要。比较结果用于估计两个样本共享的内容特征。签名来自同一算法版本时，对照才有一致的解释。

## 标准工具的比较
<!-- sources: paper, ss -->
ssdeep 项目先检查完整的数值块尺度是否相同或相差一倍。它按块尺度选择对应的两列，还会结合共同子串、编辑距离、签名长度等约束进行评分。

## 当前入口的评分差异
<!-- sources: ss, engine -->
固定模块将尺度字段的第一个字符作为字母表索引，而非解析整个十进制数值。它按所选两串的归一编辑距离给分。导致本应具有相邻块尺度的 3 与 6 得到 0，而以相同首位开头的 12 与 192 可能进入同尺度分支。比对实际文件时需结合整段数值和上游工具复核。

## 三组可核对的签名
<!-- sources: ss, engine -->
前两条使用生成器的实际输出。最后一条为展示块尺度限制构造的文本。

:::example 相同的小文件签名
[输入]
3:iKn:p
3:iKn:p
[结果]
100
[说明]
两份首串均为 iKn，当前实现的编辑距离为 0。
:::

:::example 短文本的一处变化
[输入]
3:iKn:p
3:aE:aE
[结果]
0
[说明]
签名分别来自 hello 与 Hello。iKn 和 aE 的编辑距离为 3，短摘要没有保留共同字符。
:::

:::example 数值尺度 3 与 6
[输入]
3:ABCDEFGHI:ABCDEFGHI
6:ABCDEFGHI:ABCDEFGHI
[结果]
当前实现为 0
[说明]
模块使用首字符的字母表位置作判断，得到的分支并非按 3 倍增到 6 的兼容尺度。
:::

## 相似结果的边界
<!-- sources: paper, ss, engine -->
要保留原文件和完整签名，必要时重新计算兼容工具的分数。评分与参数、签名长度和比较器有关，不能转换为两文件中完全相同字节的比例，也不能据此认定两个文件完全相同。

## 常见误区
- 不能把当前入口的分数当作上游 ssdeep 的同一评分量。
- 0 分可能来自比较条件，不只来自内容差异。
- 分数 100 不证明两份文件逐字节相同。
