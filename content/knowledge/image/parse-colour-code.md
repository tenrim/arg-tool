---
capabilityId: op:Parse%20colour%20code
title: 解析颜色代码
topicGroup: image
summary: 把颜色字符串解释为通道，再以 HEX、RGB、HSL 等形式显示。
aliases:
  - 颜色转换
  - HEX
  - HSL
  - Parse colour code
sources:
  - id: css
    title: CSS Color Module Level 4
    publisher: W3C
    url: https://www.w3.org/TR/css-color-4/
    language: en
    kind: standard
    locator: sRGB、十六进制、RGB 与 HSL
  - id: chroma
    title: chroma.js
    publisher: Gregor Aisch 等
    url: https://gka.github.io/chroma.js/
    language: en
    kind: official-doc
    locator: hex、HSL、HSV、Lab、CMYK
  - id: chef
    title: CyberChef 11.5.0 操作目录
    publisher: GCHQ
    url: /vendor/cyberchef/catalogue.json
    language: en
    kind: implementation
    locator: Parse colour code
  - id: comp
    title: Compositing and Blending Level 1
    publisher: W3C
    url: https://www.w3.org/TR/compositing-1/
    language: en
    kind: standard
    locator: source-over、difference
---

## 介绍
<!-- sources: css, chef -->

颜色代码用文本描述颜色值。HEX、RGB 和 HSL 使用不同坐标，但在约定颜色空间和精度后可以表达同一颜色。解析文本时还要辨认透明度。

## 十六进制按分量拆开
<!-- sources: css -->

六位 RGB HEX 依次代表两位红、两位绿、两位蓝。CSS 的三位简写将每一个十六进制数字重复。

:::example 短写还原
[输入]
CSS #f80
[结果]
#ff8800；RGB (255,136,0)
[说明]
8 扩写为 88，十进制为 136。
:::

## RGB 与 HSL
<!-- sources: css, chef -->

将 RGB 除以 255，取最大值 M、最小值 m。L=(M+m)/2；若 M≠m，S=(M−m)/(1−|2L−1|)，色相按主通道和相对差决定。

:::example 对照颜色
[输入]
输入 #336699
[结果]
RGB (51,102,153)；HSL (210°,50%,40%)
[说明]
0.6−0.2=0.4，公式给出 S=0.5。
:::

## 透明度的独立列
<!-- sources: css, chef, comp -->

RGBA 的透明度可另外表示。有些结果只给三分量 HEX，并在 RGBA 行保留透明度。粘贴某一行时应选择有需要的分量。

:::example 半透明红
[输入]
输入 rgba(255,0,0,0.5)
[结果]
RGB HEX #ff0000；RGBA 保留 0.5
[说明]
HEX 这一行未包含 alpha 字节。
:::

## 归一化和转换模型
<!-- sources: css, chroma, chef -->

CMYK 的结果会依转换使用的简化模型或配置而异。颜色验证宜先统一颜色空间、透明度和小数舍入；同一个色值字符串没有携带原图的坐标。

:::example 分量模型的演示
[输入]
输入 cmyk(0.12,0.04,0,0.03)
[结果]
此解析结果为 #daedf7
[说明]
数值并不包含印刷设备的 ICC 配置。
:::

## 常见误区

- HSL 的百分比不代表 RGB 的八位通道值。
- 没有 Alpha 的输出不能单独还原半透明输入。
- 解析支持的写法应以具体语法为准，不能用它推断整套 CSS 语法都受支持。

