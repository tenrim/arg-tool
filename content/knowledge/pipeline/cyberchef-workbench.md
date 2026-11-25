---
capabilityId: native:cyberchef
title: 完整 CyberChef 配方工作区
topicGroup: pipeline
summary: 按顺序组合字节和文本处理，再用分支及控制步骤复核复杂配方。
aliases:
  - 配方
  - Recipe
  - 处理链
  - Fork
  - 分支处理
  - Merge
  - 合并分支
  - Subsection
  - 截取片段
  - Register
  - 寄存器
  - Conditional Jump
  - 条件跳转
  - Label
  - 标签
  - Jump
  - 跳转
  - Sleep
  - 等待
  - Return
  - 返回
  - Comment
  - 注释
sources:
  - id: chef
    title: 固定 CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Magic 或配方的操作定义和能力
  - id: gchq
    title: CyberChef README
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef
    language: en
    kind: official-doc
    locator: How it works 与配方用途
  - id: app
    title: 配方执行、输入与前端状态
    publisher: 迷雾工具箱
    url: /cyberchef.js
    language: zh-CN
    kind: implementation
    locator: 配方校验、原始输入、执行与结果
  - id: magic
    title: Automatic detection of encoded data using CyberChef Magic
    publisher: GCHQ
    url: https://github.com/gchq/CyberChef/wiki/Automatic-detection-of-encoded-data-using-CyberChef-Magic
    language: en
    kind: author-spec
    locator: 识别模式、候选递归、语言统计与熵
---

## 介绍
<!-- sources: gchq, app -->

CyberChef 配方保存转换步骤以及每一步的实参。执行时以选中的原始文本或文件为起点，前一步输出形成下一步输入，因此改变顺序会改变最终结果。

## 字节和文本相接
<!-- sources: chef, app -->

有的操作返回文字，有的返回二进制或复合结果。上一项所处的类型决定下一项怎样解释当前数据。记录配方时同时保留原始输入、各步适用范围和预期字节表示。

:::example 顺序测试
[输入]
Hello，To Base64 → From Base64
[结果]
SGVsbG8=，随后还原 Hello 的 5 字节
[说明]
两步用同一 Base64 字母表和填充约定。
:::

## 分支处理、合并和局部转换
<!-- sources: chef, gchq -->

Fork 按分隔符切成独立段落，后续操作分别处理各段；Merge 恢复在一个结果上的操作。Subsection 可根据正则只处理匹配范围或其捕获组。

:::example 分别解码两行
[输入]
QQ==
Qg==；Fork 按换行切分、用换行合并；From Base64；Merge
[结果]
A
B
[说明]
每一行独立解码，合并后仍保留换行边界。
:::

:::example 只转换括号中的部分
[输入]
x[abc]y，用正则 \\[([a-z]+)\\] 选捕获组，To Upper case 选 All 再 Merge
[结果]
x[ABC]y
[说明]
括号与两侧 x、y 保持原样。
:::

## 条件跳转、标签和寄存器
<!-- sources: chef, app -->

Register 可从当前数据捕获内容，供后续参数使用 $R0 等引用。Label 标记位置，Jump 可跳到标记处；Conditional Jump 仅在匹配或指定反转条件成立时转移。向后跳转要监控重复执行上限。

:::example 用捕获的值作为后续参数
[输入]
输入 key=13，Register 提取 key=(\\d+)，Find / Replace 将整段替换为 $R0
[结果]
13
[说明]
R0 引用捕获文字而不是代码表达式。
:::

:::example 比较真假路径
[输入]
Conditional Jump 条件 ^[0-8]$，跳至 done；接 To Base64，再 Label(done)
[结果]
输入 8 得 8；输入 9 得 OQ==
[说明]
8 跳过编码，9 正常运行编码。
:::

## 返回、注释和调试
<!-- sources: chef, app -->

Return 提前结束当前执行路径，Comment 可保存注记，Sleep 增加等待时间。逐步核对时，断点关注下一步是否已执行，输出对应高亮只在引擎能提供实际映射时有意义。

:::example 提前结束
[输入]
ARG；Return → To Base64
[结果]
ARG
[说明]
编码步骤未执行。
:::

## 候选配方与再次演算
<!-- sources: magic, app -->

从 Magic 的候选载入一条配方，可保留原始输入再实际验证。没有选择步骤或输出恰好为空，都需要结合执行状态判断。多个标签页各自保有选中的数据，不应拿其他页的结果当作当前输入。

## 常见误区

- 相同操作以不同顺序组成，结果可以不同。
- Fork 的结果逐段处理，Merge 后操作才面向整段。
- 加载候选配方不等于已经用原文重算。

