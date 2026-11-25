---
capabilityId: native:visual-crypto
title: 二取二视觉密码
topicGroup: image
summary: 用两个随机透明分片的黑色覆盖率表达二值秘密。
aliases:
  - 视觉秘密分享
  - Naor–Shamir
  - 透明分片
sources:
  - id: paper
    title: Visual Cryptography
    publisher: Moni Naor、Adi Shamir
    url: https://www.wisdom.weizmann.ac.il/~naor/PAPERS/vis.pdf
    language: en
    kind: author-spec
    locator: §3，2-out-of-2 scheme
  - id: engine
    title: fun-tools/image-engine.js
    publisher: 迷雾工具箱
    url: /fun-tools/image-engine.js
    language: zh-CN
    kind: implementation
    locator: visualShares、随机掩码与阈值
  - id: png
    title: PNG 规范
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 像素表示与可逆压缩
---

## 介绍
<!-- sources: paper, engine -->

二取二视觉秘密分享把每个秘密像素投影为两份透明点阵。单份只看到随机黑点；精确堆叠两份后，用局部变暗程度辨认原二值图形。

## 每份分片的子像素
<!-- sources: paper, engine -->

每个像素扩成 2×2。先在恰好两个黑点的六种排列中均匀选一个给 A。白像素给 B 同样的排列，黑像素给 B 互补排列。单张 B 也均匀分布在六种排列中。

:::example 一块白色秘密
[输入]
A=1100，B=1100（1 为黑）
[结果]
叠合 1100，覆盖率 50%
[说明]
黑色覆盖等价于 OR。
:::

:::example 一块黑色秘密
[输入]
A=1100，B=0011
[结果]
叠合 1111，覆盖率 100%
[说明]
此时两份黑点占互补位置。
:::

## 二值化与透明输入
<!-- sources: engine, paper -->

带颜色的秘密先按亮度和阈值分类。透明区域按白底合成后分类，分片保存的是二值结构。恢复的白区域仍含一半黑子像素。

## 层叠对准和尺寸
<!-- sources: paper, png, engine -->

两张分片需要在同一像素网格叠合。每个子像素还可放大成 s×s 小方块，单份输出的宽高分别为 2sW、2sH。

:::example 计算各张图尺寸
[输入]
输入 12×5，子像素放大 s=2
[结果]
每份 48×20
[说明]
每个原像素在输出中占 4×4。
:::

## 材料验证
<!-- sources: paper, png -->

检查两份同宽高的透明 PNG，先看共享的网格和覆盖密度，再区分轮廓与错位条纹。文件应保持独立保存，因为单张叠合图已经暴露覆盖差异。

## 常见误区

- 单张图案没有恢复颜色、灰阶或秘密轮廓所需的信息。
- 横向或纵向的半格错位就可能破坏恢复。
- 二取二用途不等于普通可独立读写的图片加解密。

