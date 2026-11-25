# 编写迷雾工具箱科普

每个 Markdown 文件对应一个已登记功能。可按主题建子目录，例如 `classical/enigma.md`。用工具的精确 `capabilityId` 匹配原篇目。同一专题里的成员也按各自的功能 ID 编写，构建时会把成员正文和文献合并进专题。新功能须先有工具登记。

添加或修改文章后，在项目根目录运行 `npm run build:knowledge`。这条命令编译正文、校验功能关联并更新目录。在本地科普页可按标题或正文搜索。使用 `npm run audit:knowledge` 可检查两份生成文件是否与稿件一致。`README.md` 和文件名以下划线开头的稿件会被跳过。

## 填写规则

- 文件使用 UTF-8。前置信息使用下方 YAML 子集，字段名和缩进按模板填写。短文本可直接写，也可用双引号（支持 JSON 转义）或单引号（内部单引号写两次）。列表项缩进两个空格，来源的后续属性缩进四个空格。没有别名时可用 `aliases: []`。
- `capabilityId`、`title`、`topicGroup`、`summary`、`aliases`、`sources` 必填。`relatedIds` 是可选字符串列表，默认只关联本功能。`complete` 默认 `true`，完整稿会接管该功能的正文和前言。仍需配合旧前言的过渡稿可写 `complete: false`。
- 每条文献写明语言、机构和资料性质。`kind` 可选 `standard`、`official-doc`、`author-spec`、`implementation`。可选字段有 `locator`（页码或章节）、`upstreamUrl`、`license`、`licenseUrl`。
- 每个正文标题的下一行填写来源注释，多个来源用半角或全角逗号分开。空行分段；正文使用纯文本。例块可重复，每种标记单独占一行，示例内保留换行和空格。末尾的「常见误区」每条一行。
  示例的「输入」和「结果」可用 `\<` 表示源码里的尖括号，例如 `\<p>文字\</p>`。阅读页会按字面文字呈现，可直接复制。
- 章节围绕概念、原理、演算与结果组织。完整稿省去「参数与本站实现约定」，示例所需条件直接写在示例中。每个来源至少要在某节引用一次，体例参见 `classical/` 中的定稿。

## 空白模板

复制以下内容，替换尖括号占位符后保存为 `.md` 文件。

```markdown
---
capabilityId: "<功能 ID>"
title: "<功能名>"
topicGroup: "<工具所属组 ID>"
summary: "<一句话概述>"
aliases:
  - "<别名>"
sources:
  - id: reference
    title: "<文献名>"
    publisher: "<机构或作者>"
    url: "<HTTPS 或站内来源地址>"
    language: zh-CN
    kind: official-doc
    locator: "<对应页码或章节>"
---

## 介绍
<!-- sources: reference -->

<介绍对象与适用范围。>

## 工作原理
<!-- sources: reference -->

<说明规则和计算条件。>

:::example <示例标题>
[输入]
<输入与参数>
[结果]
<实际输出>
[说明]
<可复核的演算过程>
:::

## 常见误区

- <一条具体误区及正确解释。>
```
