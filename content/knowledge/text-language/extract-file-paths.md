---
capabilityId: op:Extract%20file%20paths
title: 提取文件路径
topicGroup: text-language
summary: 定位日志中常见的 Windows 盘符路径和斜线分隔的 Unix 路径。
aliases:
  - Extract file paths
  - 路径提取
  - Windows 路径
  - Unix 路径
sources:
  - id: win
    title: Naming Files, Paths, and Namespaces
    publisher: Microsoft
    url: https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file
    language: en
    kind: official-doc
    locator: 盘符、绝对与相对路径、UNC 约定
  - id: linux
    title: path_resolution(7)
    publisher: Linux man-pages project
    url: https://man7.org/linux/man-pages/man7/path_resolution.7.html
    language: en
    kind: official-doc
    locator: 绝对路径、相对路径和逐分量解析
  - id: engine
    title: CyberChef Regex 模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Regex.js
    language: en
    kind: implementation
    locator: Extract file paths，Windows 与 Unix 两套文字模式
---

## 介绍
<!-- sources: win, linux, engine -->

路径提取从日志、配置或文本清单里找出看起来像文件位置的片段。Windows 常见路径以盘符和反斜线分隔，Unix 常以斜线分隔。返回的字符串可以用于整理线索，再回原记录核对它是否完整。

## 路径的起点与组成
<!-- sources: win, linux -->

Unix 系统以 / 开头的路径从进程所见的根目录开始解析，否则一般相对进程的当前目录。Windows 的 `C:\notes\info.txt` 从 C 盘根目录开始，`C:info.txt` 为盘符相对路径。网络共享还可能用 UNC 形式表示，其含义和本地盘符不同。

## 文字范围和平台约定
<!-- sources: win, linux, engine -->

检索器采用收窄的字符集来减少普通文字中的误命中。Unix 类型的匹配侧重斜线起始和简单名称，它可能在空格或下划线处停止。Windows 的盘符识别支持样例中的内嵌空格，但不能涵盖 Windows 所支持的所有路径形式。

## 原文与候选的比对
<!-- sources: win, linux, engine -->

下面同时启用两类路径。例子保留路径中的斜线种类，使用从文本中提取的结果观察真正的解析差异。

:::example 同一行的两种平台路径
[输入]
source C:\Users\demo\readme.txt then /var/tmp/readme.txt
[结果]
C:\Users\demo\readme.txt
/var/tmp/readme.txt
[说明]
第一项符合盘符起始模式，第二项从 / 开始。文件名相同没有说明两者是同一个文件。
:::

:::example 相对形式匹配成子串
[输入]
./notes/readme.txt ../archive/readme.txt \\server\share\readme.txt
[结果]
/notes/readme.txt
/archive/readme.txt
[说明]
原来的点和双点被留在匹配范围外，UNC 路径在这一组中未被报告。不能据输出将原来的相对路径解释为根路径。
:::

:::example 文件名包含空格和下划线
[输入]
/home/demo/My File.txt /tmp/data_set.csv D:\My Files\file.txt
[结果]
/home/demo/My
/tmp/data
D:\My Files\file.txt
[说明]
前两个候选被固定规则截短，第三个包含目录名中的内嵌空格。
:::

## 文件记录的还原
<!-- sources: win, linux, engine -->

若路径来自程序日志，其解释取决于记录程序的操作系统、进程当前目录、挂载视图和转义形式。例如 JSON 文字可用两条反斜线表示真实的一条反斜线，应先解析外层 JSON 再比较路径。判断文件是否存在需要对应环境的信息。

## 常见误区

- 有盘符不必然代表绝对路径，还需识别盘符后是否从根目录开始。
- 提取文本开头出现 /，原文可能仍然有相对路径前缀。
- 排序和去重比较候选文本，不会解析符号链接或确认两个位置相同。

