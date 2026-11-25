---
capabilityId: op:File%20Tree
title: 文件树
topicGroup: files
summary: 把路径列表按层级分割并重组为可浏览的目录树文本。
aliases:
  - 目录树
  - tree
sources:
  - id: tree
    title: FileTree 操作源码
    publisher: GCHQ
    url: https://raw.githubusercontent.com/gchq/CyberChef/8cd426dd4f40f1423912d5fad91b578a86a65112/src/core/operations/FileTree.mjs
    language: en
    kind: implementation
    locator: run 按输入分隔后生成目录结构
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入输出与模式
  - id: path
    title: POSIX Base Definitions：Pathname
    publisher: The Open Group
    url: https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap03.html
    language: en
    kind: standard
    locator: Pathname 与 File Hierarchy
---

## 介绍
<!-- sources: tree, path -->

文件树用缩进呈现路径层级。操作输入是现成的路径列表，不访问系统目录。它可以把共享前缀收拢，保留同名文件的不同上级目录。

## 两层分隔符
<!-- sources: tree, chef -->

先根据行或其他记录分隔切出路径，再按路径中的分隔符拆出组件。常见 POSIX 路径层用斜杠，换行用于区分每一个输入路径。

## 共享前缀形成树枝
<!-- sources: tree, path -->

若两条路径同以 src 起头，它们会落在同一个 src 节点下，后续分支再按下一项区分。

:::example 合并重复目录名
[输入]
src/index.js
src/lib/math.js
README.md
[结果]
README.md
src
|---index.js
|---lib
|   |---math.js
[说明]
缩进表示文件所在位置，节点 src 只显示一次。
:::

## 同名和重复项
<!-- sources: tree, chef -->

叶子名称相同但完整路径不同，仍可保留两条记录。完全相同的条目在图形结构中通常只需显示一次，因此树本身不记录重复行次数。

:::example 同名的不同路径
[输入]
a/x.txt
b/x.txt
[结果]
a 与 b 下各有一个 x.txt
[说明]
判断文件身份还需保留整条路径。
:::

:::example 同一路径重复
[输入]
b.txt
a.txt
a.txt
[结果]
a.txt
b.txt
[说明]
结果去掉树中的相同节点，并按显示顺序排列。
:::

## 结果边界
<!-- sources: tree, path -->

树状输出只反映输入结构，不包含权限、符号链接目标、文件内容、修改日期或硬链接关系。若需要验证磁盘上的目录，必须另有系统生成的真实记录。

## 常见误区

- 文件树的同名叶子可能来自两个不同的目录。
- 输入路径能画成树不代表这些文件真实存在。
- 树状输出没有保留输入行的精确排序和重复次数。

