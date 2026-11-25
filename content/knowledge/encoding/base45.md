---
capabilityId: pair:To%20Base45
title: Base45
topicGroup: encoding
summary: 说明 QR 字母数字模式下的 Base45 字符表、双字节进位和无填充尾组。
aliases:
  - To Base45
  - From Base45
  - RFC 9285
sources:
  - id: rfc
    title: RFC 9285 — The Base45 Data Encoding
    publisher: IETF
    url: https://www.rfc-editor.org/rfc/rfc9285.html
    language: en
    kind: standard
    locator: 第 3–4 节，字符表与示例
  - id: engine
    title: CyberChef 随站操作目录
    publisher: GCHQ CyberChef
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: To Base45 与 From Base45
---

## 介绍
<!-- sources: rfc, engine -->

Base45 用 QR 字母数字模式所支持的 45 个字符表示字节数据。字符表包含大写字母、十进制数字、普通空格与若干标点。它按两字节处理，产生三符号组，便于把二进制装进使用这张字符表的通道。

## 两字节的换算
<!-- sources: rfc -->

把两个字节分别记作 a 和 b，计算 n = 256a + b。将 n 按 45 的幂分解，先写最低位，再写中位与高位。解码三个符号 x、y、z 时，用 n = x + 45y + 2025z 恢复数值。

:::example 双字节拆分
[输入]
AB，即十进制字节 65、66
[结果]
BB8
[说明]
n = 16,706。三个数位依次为 11、11、8，对应 B、B、8。解码后再除以 256，商和余数就是两个字节。
:::

## 单字节尾组
<!-- sources: rfc, engine -->

最后一组若只剩一个字节，写成两个符号，仍先写低位。结果没有独立的填充标记，字符长度模 3 为 0 或 2。尾组的值必须落在 0 至 255 范围内。

:::example 单字节的两位表示
[输入]
A，即 65
[结果]
K1
[说明]
65 = 20 + 45×1。数位 20 对应 K，数位 1 对应 1。
:::

## 范围与空格
<!-- sources: rfc -->

三符号可表示的值多于 65,536 种，因此并非所有三字符组都能还原为合法的两字节。普通空格在表中的数值是 36，传输通道需要保留它的位置。

:::example 最大双字节值
[输入]
FF FF
[结果]
FGW
[说明]
65,535 = 15 + 45×16 + 2025×32。三个数位依次是 F、G、W。解码连续三个冒号会得到 91,124，已超出两字节范围。
:::

## 线索判读
<!-- sources: rfc, engine -->

数字、大写字母、空格和少量标点是识别线索。进一步验证可以检查每组能否还原为合法字节，并对解出的数据核对协议标头。Base45 负责可传输的表示，后续压缩和数据结构需要按外层协议继续解析。

## 常见误区

- 每组从最低位写起。直接用常规的高位在前进位转换，结果会反序。
- 普通空格可能承载数值。自动去除内部或边界空格会改变内容。
- 单独剩一个符号无法构成完整的尾组。三符号组也需检查其值是否超过两字节上限。
