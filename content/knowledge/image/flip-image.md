---
capabilityId: op:Flip%20Image
title: 翻转图片
topicGroup: image
summary: 图片翻转按中线镜像像素，可交换左右列或上下行，并保持尺寸。
aliases:
  - Flip Image
  - 镜像图片
  - 水平翻转
  - 垂直翻转
sources:
  - id: matrix
    title: CSS Transforms Module Level 1
    publisher: W3C
    url: https://www.w3.org/TR/css-transforms-1/#transform-functions
    language: en
    kind: standard
    locator: 平移、缩放、旋转功能与矩阵表示
  - id: pillow
    title: Pillow — Image module
    publisher: Pillow 项目
    url: https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.transpose
    language: en
    kind: official-doc
    locator: 左右、上下翻转和转置
  - id: engine
    title: CyberChef 图像模块（固定实现）
    publisher: GCHQ
    url: /vendor/cyberchef/modules/Image.js
    language: en
    kind: implementation
    locator: Flip Image，左右或上下像素镜像
---

## 介绍
<!-- sources: matrix, pillow -->
翻转把像素映射到图像中线的另一侧。沿左右方向翻转后，图像每行的像素交换顺序。沿上下方向翻转后，整行交换位置。两个操作均可保留原图宽高。

## 左右镜像坐标
<!-- sources: matrix, engine -->
设图像宽为 W，横坐标从零开始。左右翻转将 (x,y) 映射为 (W−1−x,y)。若宽度为奇数，中间列仍处在原位置。原来紧挨中线的像素依次换到另一侧。

:::example 第一行和第二行分别倒序
[输入]
第一行红绿蓝黄，第二行青品红黑白。执行左右翻转。
[结果]
第一行黄蓝绿红，第二行白黑品红青。
[说明]
宽为 4，原始最左列 x=0 映射到 x=3，每行的行号不受影响。
:::

## 上下镜像坐标
<!-- sources: matrix, engine -->
设图像高为 H，上下翻转将 (x,y) 映射为 (x,H−1−y)。这一过程交换行的位置，行内颜色顺序不变。位于中心行的像素可留在原坐标。

:::example 两行交换顺序
[输入]
第一行红绿蓝黄，第二行青品红黑白。执行上下翻转。
[结果]
第一行青品红黑白，第二行红绿蓝黄。
[说明]
原来 y=0 的像素行变成 y=1，列号仍按各行的原先顺序保留。
:::

## 反复或组合翻转
<!-- sources: matrix, pillow -->
同一方向连续翻转两次会让坐标回到原处。分别做一次左右和上下翻转时，两个坐标都从原边的对侧取，结果与绕中心转 180° 的像素对应关系相同。

:::example 两个方向各翻一次
[输入]
第一行红绿蓝黄，第二行青品红黑白。先左右翻，再上下翻。
[结果]
第一行白黑品红青，第二行黄蓝绿红。
[说明]
变换后的左上像素来自原图右下；行号和列号都发生倒序。
:::

## 读图与像素关系
<!-- sources: matrix, pillow, engine -->
镜像可以揭示反写的文字或方向含义，也会改变图片中的左右关系。整像素镜像可以不混合相邻颜色，转出其他编码时仍须另查格式影响。若需要在原图中标注镜像后的目标，可逆用同一坐标式。

## 常见误区
- 左右翻转交换列，这条中线本身是竖直的。
- 上下翻转交换行，画面中物体的左右顺序保持原样。
- 单次镜像改变手性。分别翻两个方向才与 180° 旋转的布局相同。
