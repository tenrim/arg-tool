---
capabilityId: op:Swap%20endianness
title: 交换字节序
topicGroup: files
summary: 按固定字宽翻转每组字节，说明大端、小端及尾部补齐。
aliases:
  - Swap endianness
  - 大端小端
  - 端序交换
sources:
  - id: byteorder
    title: Linux byteorder(3)
    publisher: Linux man-pages
    url: https://man7.org/linux/man-pages/man3/byteorder.3.html
    language: en
    kind: official-doc
    locator: 网络和主机字节序、16 与 32 位转换
  - id: slice
    title: ECMA-262 ArrayBuffer.prototype.slice
    publisher: Ecma International
    url: https://tc39.es/ecma262/multipage/structured-data.html#sec-arraybuffer.prototype.slice
    language: en
    kind: standard
    locator: 从起点复制到不含末端的区间及负索引解释
  - id: engine
    title: CyberChef 11.5.0 运行模块
    publisher: GCHQ
    url: /vendor/cyberchef/ChefWorker.js
    language: en
    kind: implementation
    locator: Swap endianness：分组、尾部补零、组内逐字节翻转
---

## 介绍
<!-- sources: byteorder, engine -->
端序说明多字节数值中哪些字节先存。大端把最高有效字节置前，小端把最低有效字节置前。交换同一个固定宽度字段的端序，可以翻转其字节顺序。

## 字宽与组边界
<!-- sources: byteorder, slice, engine -->
按长度 k 字节依次切组，组之间顺序不变，每组内部各字节按倒序写出。一个字节的位顺序不改变。若有不同宽度的相邻字段，应按材料给的字段边界分别处理。

## 最后一组不够长
<!-- sources: slice, engine -->
不补齐时，未满组只翻转现有字节。启用末组补齐时，先在这组右端写零补到所选宽度，再翻转。补的是尾部这组，不是整个输入的开头。

## 分组与补齐的例子
<!-- sources: byteorder, engine -->
以下按十六进制表示源字节，所有组都从偏移 0 开始切分。

:::example 两个四字节整数
[输入]
01 02 03 04 05 06 07 08，组宽 4
[结果]
04 03 02 01 08 07 06 05
[说明]
分别翻转前四字节和后四字节，两组次序保持。
:::

:::example 两字节组的末尾补齐
[输入]
01 02 03，组宽 2，启用补齐
[结果]
02 01 00 03
[说明]
最后一组先补成 03 00，再翻转为 00 03。
:::

:::example 两字节组保留尾部长度
[输入]
01 02 03，组宽 2，关闭补齐
[结果]
02 01 03
[说明]
最后一组仅有 03，翻转后仍只有 03。
:::

## 按数值验证
<!-- sources: byteorder, engine -->
把四字节 01 02 03 04 作大端整数，与把 04 03 02 01 作小端整数读到的数值相同。对完整分组使用相同组宽再翻转一次，会恢复原排列。若操作加入补齐字节，还要参考原数据长度判断可移除哪些字节。

## 常见误区
- 组宽以字节计，四字节对应八个十六进制数字。
- 字节序交换翻转组内字节，保留字节里的比特顺序。
- 多字段数据应按各字段的实际宽度分别处理。
