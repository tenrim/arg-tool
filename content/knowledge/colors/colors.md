---
capabilityId: native:colors
title: 颜色
topicGroup: characters-reference
summary: 从 sRGB 通道或 HSL 表达读色，并用 Lab 色差查找最接近的库中名称。
aliases:
  - 颜色
  - RGB
  - HEX
  - HSL
  - 色盘
  - ΔE
sources:
  - id: css
    title: CSS Color Module Level 4
    publisher: W3C
    url: https://www.w3.org/TR/css-color-4/
    language: en
    kind: standard
    locator: sRGB colors、HSL、Lab 与 color difference
  - id: core
    title: 颜色资料检索
    publisher: 迷雾工具箱
    url: /reference/core.js
    language: zh-CN
    kind: implementation
    locator: colorLab 与 queryRecords 中的 ΔE76
  - id: names
    title: 固定色名及色值表
    publisher: 迷雾工具箱
    url: /vendor/reference/colors.json
    language: en
    kind: implementation
    locator: 随包色名及 sRGB 值
---

## 介绍
<!-- sources: css, core -->
同一个 sRGB 颜色可以用红绿蓝三个通道、十六进制串或 HSL 描述。色盘帮助选择或调整颜色。名称库则从已有的命名记录中找到相近的值。

## 十六进制与红绿蓝三通道
<!-- sources: css, core -->
六位十六进制色值每两位表示一个 8 位通道，值域为 0 至 255。从左到右依次为红、绿、蓝。三位简写把每个字符重复一次。

:::example 六位通道拆分
[输入]
#FF8000
[结果]
RGB(255,128,0)
[说明]
FF＝255，80＝128，00＝0。
:::

## 色相、饱和度与亮度
<!-- sources: css, core -->
HSL 将同一 sRGB 颜色转成近似直观的三元组。用归一化 RGB 的最大与最小值的平均表示亮度。它们相等时颜色为灰阶，没有有意义的色相；饱和度为零。色相角绕 360° 循环。

:::example 简写的橙色
[输入]
#f80
[结果]
#FF8800，RGB(255,136,0)，显示 HSL(32°,100%,50%)
[说明]
各半字节成对扩为 FF、88、00。归一化最大值 1 和最小值 0 的平均为 0.5。
:::

## 用 Lab 差值排序名称
<!-- sources: css, core, names -->
算法先按 sRGB 曲线线性化通道，再转换到以 D65 为参考白的 XYZ 和 Lab。ΔE76 为两点在 Lab 三坐标上的欧几里得距离 √[(ΔL*)²＋(Δa*)²＋(Δb*)²]。颜色列表按距离由小到大返回固定库中最接近的名称。

:::example 一点绿色通道差异
[输入]
#ff8000，查近似色名
[结果]
固定库匹配 Orange Juice（#ff7f00），ΔE76 约 0.542
[说明]
比较色的绿色通道是 127，原值为 128，转换后用三个 Lab 坐标的差求距离。
:::

## 颜色值和名称的适用范围
<!-- sources: css, names, core -->
库中名称有别名、来源体系和习惯用法，近似结果不替代印刷或工业色号体系。屏幕色彩管理、亮度和光照也会改变实物与显示的对照效果。

## 常见误区

- #f80 展开后是 #ff8800。
- HSL 的亮度和线性光度是不同指标。
- RGB 的三个通道差不能直接当作 Lab ΔE76。
- 库里的最近名称随候选数据改变，可用原始十六进制值复现颜色。
