---
capabilityId: op:Parity%20Bit
title: 奇偶校验位
topicGroup: file-compression
summary: 统计一组比特中的 1，补一位让总数符合偶校验或奇校验。
aliases:
  - Parity Bit
  - 偶校验
  - 奇校验
sources:
  - id: uart
    title: UART Parity
    publisher: Microchip Technology
    url: https://onlinedocs.microchip.com/oxy/GUID-4B32B28F-63FC-4320-842D-ECC5E5164A23-en-US-3/GUID-0E513134-A72C-4F19-A8EA-7558C1FE7357.html
    language: en
    kind: official-doc
    locator: 奇偶生成条件和校验失败
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Parity Bit：计数、前置/后置和 Decode 的移位
---

## 介绍
<!-- sources: uart, engine -->
奇偶校验为一组数据位附加一个比特。发送者让整组中 1 的数量达到约定的奇数或偶数，接收方可通过重新计数检测某些传输错误。

## 计算补位
<!-- sources: uart, engine -->
先数数据中 1 的个数 n。若要求偶校验，附加 n mod 2；若要求奇校验，附加 1−(n mod 2)。把校验位放在开头或结尾都可保持数量，读取时两端要对位置有相同约定。

## 逐组和移除
<!-- sources: uart, engine -->
指定分隔符可以按组重复计数。当前 Decode 只是按所选位置移除最前或最后一位，并未复算正确性。要检查是否出错，应在移除之前统计整组中 1 的数量。

## 补位与去位实例
<!-- sources: uart, engine -->
以下只用 0 和 1 记比特，竖线作为示例中的组分隔符。

:::example 偶校验位写在末尾
[输入]
1011，偶校验，末尾编码
[结果]
10111
[说明]
原有三个 1，再加一个使总数为 4。
:::

:::example 奇校验位写在开头
[输入]
1010，奇校验，开头编码
[结果]
11010
[说明]
原有两个 1，在前面加一个使总数为 3。
:::

:::example 两组独立计算
[输入]
1011|00，偶校验，末尾编码，按 | 分组
[结果]
10111|000
[说明]
首组补 1，后一组已有偶数个 1，所以补 0。
:::

## 能发现哪些改变
<!-- sources: uart, engine -->
单个比特反转会改变奇偶性。若同组中恰有两个比特反转，总计的奇偶性仍可与原规则一致。奇偶检查可以说明某组计数不符，不能告诉接收端是哪一位出了错。

## 常见误区
- 校验位本身也在最终计数中。
- 仅移除校验位不会自动报告校验错误。
- 两个比特同时翻转时可能通过。
