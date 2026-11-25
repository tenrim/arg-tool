---
capabilityId: op:SM3
title: SM3 哈希
topicGroup: file-compression
summary: 按 GB/T 32905-2016 介绍 SM3 的大端分块、双消息字序列和异或反馈。
aliases:
  - SM3
  - GB/T 32905-2016
  - 密码杂凑
sources:
  - id: gb
    title: GB/T 32905-2016 信息安全技术 SM3 密码杂凑算法
    publisher: 国家市场监督管理总局
    url: https://openstd.samr.gov.cn/bzgk/gb/newGbInfo?hcno=45B1A67F20F3BF339211C391E9278F5E
    language: zh-CN
    kind: standard
    locator: 标准名称、名称范围和实施日期
  - id: text
    title: The SM3 Cryptographic Hash Function
    publisher: Shen 等 / IETF Datatracker
    url: https://datatracker.ietf.org/doc/html/draft-sca-cfrg-sm3-02
    language: en
    kind: author-spec
    locator: 转载算法，第 4 节和附录 A 的国家标准实例
  - id: engine
    title: CyberChef 11.5.0 固定实现
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: SM3
---

## 介绍
<!-- sources: gb, text -->

SM3 是 GB/T 32905-2016 规定的密码杂凑算法，输出 256 位。消息被补齐到 512 位块，再逐块更新八个 32 位状态字。Datatracker 存档中的英文说明给出算法和标准附录的测试数据，其文档状态为 Internet-Draft。

## 填充与大端分组
<!-- sources: text -->

消息后追加一个 1 位和需要的零，末尾用 64 位字段记录原始位长。每组 512 位解释成十六个大端 32 位字。填充进来的字节参与压缩，但长度字段仍表示原消息。

:::example 算法附录的三字节样例
[输入]
ASCII abc，字节 61 62 63。
[结果]
66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0
[说明]
第一个填充字为 0x61626380，最后八字节记录位长 24。
:::

## 两组扩展字
<!-- sources: text -->

SM3 用置换函数 P1、循环移位和异或把初始的 16 个字扩展成 68 个 W 字。第二组 W′ 有 64 项，第 j 项为 Wj 与 Wj+4 的异或。每轮同时取对应的 W 与 W′。

:::example 附录的两块计算
[输入]
ASCII abcd 连续重复 16 次，共 64 字节。
[结果]
debe9ff92275b8a138604889c18e5a4d6fdb70e5387e5765293dcba39c0c5732
[说明]
原消息占满一块，长度和补位占第二块，原位长为 512。
:::

## 状态压缩和异或反馈
<!-- sources: text, engine -->

每块 64 步，每步根据轮号使用相应的布尔函数与常量，通过模加、循环移位和置换 P0 等操作更新八个寄存器。块末做逐字异或，把所得工作状态与压缩前链值合并。摘要按最终链值的大端字顺序输出。

:::example 零字节向量
[输入]
空字节串。
[结果]
1ab21d8355cfa17f8e61194831e81a8f22bec8c728fefb747ed035eb5082aa2b
[说明]
空串的补齐开头为 80，其后全为零。
:::

## 结果核对
<!-- sources: gb, text, engine -->

与其他 256 位算法共享摘要宽度并不能使值可互换。复算可先比对公开向量，再核对实际输入是否含换行、前导标记或其他编码层。标准 SM3 的步数和结果位数由规范确定，变更轮数只能用于实验。

## 常见误区

- SHA-256 与 SM3 都是 256 位，计算规则并不相同。
- SM3 的原始长度字段用位数，不用字节数。
- 块尾反馈用异或，不能沿用某些其他算法的逐字回加。
