---
capabilityId: op:Generate%20all%20checksums
title: 生成全部校验和
topicGroup: file-compression
summary: 对同一组字节运行固定目录内的多种校验，按位宽筛选并保留算法名称。
aliases:
  - Generate all checksums
  - 批量校验值
  - CRC 预设比较
sources:
  - id: rev
    title: Catalogue of parametrised CRC algorithms
    publisher: Greg Cook / CRC RevEng
    url: https://reveng.sourceforge.io/crc-catalogue/all.htm
    language: en
    kind: author-spec
    locator: 参数组、检查值以及不同预设名
  - id: adler
    title: RFC 1950 ZLIB Compressed Data Format Specification
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc1950
    language: en
    kind: standard
    locator: 第 2.2 节，Adler-32
  - id: engine
    title: CyberChef 11.5.0 加密模块
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Crypto.js
    language: en
    kind: implementation
    locator: Generate all checksums：实际校验目录、宽度过滤和名称列
---

## 介绍
<!-- sources: rev, engine -->
这项工具对同一输入计算多项校验值，用于对比协议候选和查看多个变体的差异。它使用固定引擎内的操作表，包括许多 CRC 预设以及若干 Fletcher 与 Adler 校验。

## 位宽筛选
<!-- sources: rev, engine -->
位宽筛选选择算法输出的结构大小，不以输入长度为准。例如果选 16 位，表中的 16 位 CRC 与 Fletcher-16 都可出现。显示的行数受固定目录及其兼容别名影响。

## 为何保留名称
<!-- sources: rev, adler, engine -->
不同配置可能对一组输入碰巧给出相同号码，同一配置也可能有多个登记名。不显示名称时，只剩位置上的数值，仍需依相同版本的固定顺序确认算法。要给结果补充资料时，应该记录准确名称和所用输入。

## 批量计算的对照
<!-- sources: rev, adler, engine -->
均用 ASCII 的 123456789。只列与本次选择有关的行或首几项，完整目录由工具逐行返回。

:::example 只看三位宽
[输入]
123456789，选择 3 位并显示名称
[结果]
CRC-3/GSM: 4
CRC-3/ROHC: 6
[说明]
相同位宽仍有不同参数组。
:::

:::example 隐藏八位宽的名称
[输入]
同一消息，选择 8 位并关闭名称
[结果]
首两项是 f4 和 df，各占一行
[说明]
关闭名称不会改动计算结果，但失去同一行标注的算法名称。
:::

:::example 查看多种校验家族
[输入]
同一消息，选择全部位宽并显示名称
[结果]
Adler-32: 091e01de
CRC-32/ISO-HDLC: cbf43926
Fletcher-16: 1ede
[说明]
这三条属于实际输出中的不同家族。对照时保留每个名称。
:::

## 能从结果确定的内容
<!-- sources: rev, adler, engine -->
看到匹配某个校验值，可以提出待验证的算法候选。若想确定协议实际用了哪一项，还要查其定义的消息范围，或用新样本核对。批量列表覆盖固定目录中的条目，独立工具可能提供另外的配置方式。

## 常见误区
- “全部”指固定目录中的算法与预设，不包含任意自定义参数。
- 一列数字相同不一定代表两种算法相同。
- 关闭名称不影响数值，却会降低结果的可追溯性。
