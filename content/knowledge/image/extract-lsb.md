---
capabilityId: op:Extract%20LSB
title: 提取最低有效位
topicGroup: image-stego
summary: 根据像素顺序和通道顺序读取指定分量的一位，并把得到的位序列组合为字节。
aliases:
  - Extract LSB
  - LSB
  - 像素低位
  - 逐行与逐列
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
    locator: Extract LSB，通道顺序、像素遍历、位号和末组输出
---

## 介绍
<!-- sources: png, bit, engine -->
最低有效位是整数中权重 1 的一位。读取图像低位时，可选颜色或透明分量，根据像素遍历顺序依次取出这一位，再把位序列组合成字节。从一张固定图像读取时，给定相同规则就可以复算出相同结果。

## 按行或按列扫描
<!-- sources: png, engine -->
按行遍历先读取同一行由左到右的像素，再转到下一行。按列遍历先读同一列由上到下的像素。即使选取同一个通道，同一组空间位也可能因此排列不同。

:::example 同一 4×2 图的两种读法
[输入]
两行红分量最低位分别为 0100、0001，只读红色位 0。
[结果]
按行为 01000001，即 41（十六进制）。按列为 00100001，即 21（十六进制）。
[说明]
逐列分别取得 00、10、00、01，再按列的先后连接。
:::

## 每像素的通道顺序
<!-- sources: bit, engine -->
一个像素可依次贡献多个分量中的位。选择红后绿时，在移到下一像素前先收集红位和绿位。把绿放在红前会改变每两位的相对位置，即使选择的通道集合相同，合成的值也能不同。

:::example 交换红绿改变六位结果
[输入]
三个像素的红绿低位依次为 (1,0)、(0,1)、(1,1)。
[结果]
R、G 顺序得到 100111，即 27（十六进制）；G、R 顺序得到 011011，即 1B（十六进制）。
[说明]
固定读取方式将不足八位的最后一组按二进制数展开为一个字节，得到 00100111 与 00011011。
:::

## 八位分组与末尾片段
<!-- sources: engine, bit -->
完整一组 8 位是一个输出字节。这种读取把该组首先取得的位放在最高位。一组不足八位时，实际处理方式需要查清。将现有位按整数读出，与在末尾补零会得到不同结果。

:::example 两位尾组按整数保存
[输入]
仅两个像素，选定通道的低位分别为 1 与 0。
[结果]
输出一个字节 02（十六进制）。
[说明]
二进制组 10 作为整数等于 2。还原这种不满八位的材料时，仍应保留它原来只有两位的信息。
:::

## 读取结果的复核
<!-- sources: png, engine -->
合成的字节可以继续按文本编码或文件结构核对。判断材料时还可将每一位映射回原图以复查顺序。文件重压缩或颜色转换可能改动样本值，读出原低位需要与素材创作者使用的同一份数据对应。

## 常见误区
- 改为逐列或交换通道顺序，通常会得到不同的字节。
- 普通位平面按图片展示空间位置，拼接位流才产生这里的字节序列。
- 发现可读字符时仍应验证分组、数据边界及上下文。
