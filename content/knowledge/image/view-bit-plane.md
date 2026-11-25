---
capabilityId: op:View%20Bit%20Plane
title: 查看位平面
topicGroup: image-stego
summary: 位平面从每个像素的同一颜色或透明分量取固定二进制位，按原来的位置绘制为二值图。
aliases:
  - View Bit Plane
  - 位平面
  - 最低有效位
  - 最高有效位
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、6、13 节，样本位深、扫描线、Alpha
  - id: bit
    title: ECMAScript — Binary Bitwise Operators
    publisher: Ecma TC39
    url: https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-binary-bitwise-operators
    language: en
    kind: standard
    locator: 二进制按位与运算
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: View Bit Plane，位编号、分量选择与黑白映射
---

## 介绍
<!-- sources: png, bit, engine -->
位平面将某个颜色或透明分量拆到指定的二进制位。对 8 位图像分量，可以分别查看第 0 到第 7 位。输出仍是原宽高的图，每个位置只显示零或一对应的两种颜色。

## 位编号及掩码
<!-- sources: png, bit -->
从最低有效位开始编号时，第 k 位对应权重 2ᵏ。把数值与该权重做按位与，结果为零代表这一位是 0，结果非零代表这一位是 1。同一位在每个像素都按同样的权重读取。

:::example 同时检验最低位和最高位
[输入]
一张 2×2 图，逐行的红色分量为 129、2、242、7。
[结果]
第 0 位逐行是 1 0 / 0 1，第 7 位逐行是 1 0 / 1 0。
[说明]
最低位取奇偶。最高位权重为 128，因此只有 129 和 242 的第 7 位为 1。
:::

## 位值和显示颜色
<!-- sources: bit, engine -->
二值图的黑白只是显示约定。从计算可先得到位值，再按工具设定映射颜色。若两种读法给出反色图，原始像素的二进制位仍可相同，区别只在画法。

:::example 红色最低位的黑白分布
[输入]
红色分量仍为 129、2、242、7，查看第 0 位。
[结果]
前一行是黑白，后一行是白黑。
[说明]
在此显示约定中，位值 1 映射为黑色，0 映射为白色。
:::

## 透明分量的位平面
<!-- sources: png, engine -->
Alpha 样本表示不透明度。取 Alpha 的位时，读取的是透明分量的数值。输出二值图可用不透明黑白重新绘制，以便观察原图透明处的空间位置。

:::example 透明分量最高位
[输入]
逐行 Alpha 值为 255、128、255、0 的 2×2 图，查看第 7 位。
[结果]
逐行位值为 1 1 / 1 0，显示为黑黑 / 黑白。
[说明]
255 与 128 均含权重 128，0 不含。二值输出把四个位置都画成不透明像素。
:::

## 空间关系与结果解释
<!-- sources: png, bit, engine -->
位平面保留图像中的邻接位置，所以可能显示轮廓、区域或周期图案。若要进一步把位解释成字节，仍须另定扫描方向、分量顺序及位组边界。不同来源图像的低位纹理也可能自然产生相似结构。

## 常见误区
- 位 0 表示最低有效位，位 7 的权重是 128。
- 黑白图需要结合此处的显示映射判断 0 和 1。
- 二值轮廓提供空间线索，不会自动给出文字编码与字节排列。
