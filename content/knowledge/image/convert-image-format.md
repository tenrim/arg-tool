---
capabilityId: op:Convert%20Image%20Format
title: 转换图片格式
topicGroup: image
summary: 格式转换通常先解码图像，再按目标格式编码。像素、透明度、压缩效果和元数据可分别比较。
aliases:
  - Convert Image Format
  - 图片转格式
  - PNG 转 JPEG
  - 图像重编码
sources:
  - id: png
    title: Portable Network Graphics (PNG) Specification (Third Edition)
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 第 4、5、6 节，像素样本、数据流与颜色类型
  - id: jpeg
    title: Recommendation ITU-T T.81 — Digital compression and coding of continuous-tone still images
    publisher: ITU-T
    url: https://www.itu.int/rec/T-REC-T.81/en
    language: en
    kind: standard
    locator: JPEG 编码规范
  - id: bmp
    title: Bitmap Storage
    publisher: Microsoft Learn
    url: https://learn.microsoft.com/en-us/windows/win32/gdi/bitmap-storage
    language: en
    kind: official-doc
    locator: BMP 文件头、信息头与图像数据
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Convert Image Format，目标编码、JPEG 质量与 PNG 过滤
---

## 介绍
<!-- sources: png, jpeg, bmp, engine -->
图片格式定义如何存储像素、压缩及附带信息。格式转换一般先读出图像内容，再把它编码为目标格式。扩展名也应与新文件内容对应，但区分格式仍以实际字节和结构为准。

## PNG 保留的颜色与透明度
<!-- sources: png, engine -->
PNG 可无损地保存所编码的像素样本，并支持 Alpha。再次写成 PNG 时，压缩级别和行过滤可改变所用字节，不必改变解码时能看到的样本及透明度。仍需要留意颜色解释和容器元数据是否保留。

:::example 保留一处半透明像素
[输入]
一幅 2×2、包含 Alpha 值 128 和 0 的 PNG，转出 PNG。
[结果]
输出仍是 2×2 图，原有半透明和全透明位置继续可读。
[说明]
PNG 允许保存这些 Alpha 值，解码后的图像不需把它们变成不透明背景。
:::

## JPEG 的有损影响
<!-- sources: jpeg, engine -->
普通 JPEG 编码适合彩色照片，可通过量化减小文件。重新解码后，具体颜色值可能变化，而普通 JPEG 输出也不带 PNG 那样的 Alpha 通道。相同质量设置对不同软件不是一个统一误差上限。

:::example 把带透明度的图转换为 JPEG
[输入]
2×2 RGBA 样本转为 JPEG，质量设为 80。
[结果]
可得到 2×2 的 JPEG 图。透明位置不再透明，像素颜色样本可发生变化。
[说明]
此次转换输出 JPEG 数据，以 FF D8 开头。复查应读取目标像素，而不只检查扩展名。
:::

## BMP 输出的边界
<!-- sources: bmp, engine -->
BMP 由文件头、信息头及像素数据等组成。具体能保存的颜色和透明信息取决于所写的位图结构。用某种编码器生成 BMP 后，可查看头部、解码样本和透明度是否仍和输入一致。

:::example 验证所写 BMP 的结构
[输入]
同一张 2×2 RGBA 样本转为 BMP。
[结果]
输出以 42 4D 开头，尺寸仍为 2×2，解码出的四个像素均不透明。
[说明]
42 4D 对应 BM。输出形式在保持像素位置的同时，把原样本的透明度舍去。
:::

## 元数据与用途
<!-- sources: png, bmp, engine -->
重新编码也可能改变图像方向表示、内嵌资料或颜色配置。图片用于文件分析时，应保留原件。需要分享所见图像时，可按透明度、目标软件支持和文件体积选择编码，再检查输出内容。

## 常见误区
- 改后缀不会触发解码或重新编码。
- 无损像素的格式也可能生成与原文件字节不同的输出。
- 格式与尺寸正确并不表示透明度和其他元数据已经保留。
