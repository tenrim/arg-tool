---
capabilityId: op:ELF%20Info
title: ELF 文件信息
topicGroup: files
summary: 读取 ELF 标识、架构、头表和符号，区分可重定位文件、段与节。
aliases:
  - ELF
  - section
  - segment
sources:
  - id: abi
    title: System V ABI：ELF Object File Format
    publisher: The SCO Group／Linux Foundation
    url: https://refspecs.linuxfoundation.org/elf/gabi4+/ch4.eheader.html
    language: en
    kind: standard
    locator: ELF Identification、Ehdr、机器类型和偏移
  - id: at
    title: System V ABI：Program Header
    publisher: The SCO Group／Linux Foundation
    url: https://refspecs.linuxfoundation.org/elf/gabi4+/ch5.pheader.html
    language: en
    kind: standard
    locator: 段表及它与节的关系
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: 对应操作的输入输出与模式
---

## 介绍
<!-- sources: abi, chef -->

ELF 是 Unix 类系统常见的目标文件和可执行文件格式。其头部指明文件类别、字宽、端序、目标架构和表的位置。读取头字段不需要运行程序。

## 类、端序与机器编号
<!-- sources: abi -->

开头有 7F 45 4C 46 四字节。后面 EI_CLASS 用于区分 32 或 64 位，EI_DATA 区分整数存储顺序。e_machine 应按给定的字节序读成一个两字节数。

:::example 核对 64 位文件头
[输入]
e_ident 的类为 02、数据格式为 01；e_machine=62（按小端存储）
[结果]
64-bit，Little，AMD x86-64
[说明]
最前四字节相同不代表机器类型相同。
:::

## 段表和节表
<!-- sources: abi, at, chef -->

程序头主要面向装载，描述映射后的段、访问属性和位置。节头为链接和工具查看内容组织各节。一个段可能含多个节，两者都不一定在文件中存在。

:::example 可重定位的 32 位头
[输入]
EI_CLASS=01，EI_DATA=01；e_machine=3，e_type=1
[结果]
32-bit，Little，x86，Relocatable File
[说明]
该样例只核对头部，不要求存在可装载段。
:::

## 入口、偏移与符号
<!-- sources: abi, at -->

入口地址可能为空，程序头偏移和节头偏移以文件起点为基准。符号表有自己的条目数量和字符串表引用，文件即使缺少公开符号也可能合法。

:::example 改变 ABI 的数据字节序
[输入]
EI_CLASS=01，EI_DATA=02；e_machine 的两个字节是 00 08
[结果]
32-bit，Big，MIPS
[说明]
大端下机器编号是 8，不是小端读取的 2048。
:::

## 读头不替代状态检查
<!-- sources: abi, chef -->

完整报告应同时核对表偏移是否超出文件、条目长度是否合理。只有魔数字段的文件可能通过类型筛选，却无法读取完整 ELF 头。

## 常见误区

- ELF 魔数不能单独指定操作系统、架构或用途。
- 节与段不是等价概念。
- 得到头部报告不能确认程序可运行或可信。

