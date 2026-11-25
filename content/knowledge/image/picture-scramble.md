---
capabilityId: native:pic-scramble
title: 图片混淆
topicGroup: image
summary: 按 Gilbert 曲线顺序循环移动像素，在保留样本值的前提下可逆。
aliases:
  - Gilbert 曲线
  - 图片置换
  - pic-scramble
sources:
  - id: pic
    title: iris10086/pic-scramble
    publisher: iris10086
    url: https://github.com/iris10086/pic-scramble
    language: en
    kind: author-spec
    locator: 曲线生成及黄金位移
  - id: curve
    title: jakubcerveny/gilbert
    publisher: jakubcerveny
    url: https://github.com/jakubcerveny/gilbert
    language: en
    kind: author-spec
    locator: 任意矩形的 Gilbert 曲线
  - id: engine
    title: fun-tools/image-engine.js
    publisher: 迷雾工具箱
    url: /fun-tools/image-engine.js
    language: zh-CN
    kind: implementation
    locator: scramble
  - id: png
    title: PNG 规范
    publisher: W3C
    url: https://www.w3.org/TR/png-3/
    language: en
    kind: standard
    locator: 像素表示与可逆压缩
---

## 介绍
<!-- sources: pic, curve -->

图片混淆把矩形栅格映射为一维索引，再对索引应用固定置换。所有颜色分量一起搬移。保持完整像素和尺寸时，可以按逆置换恢复。

## 矩形的遍历顺序
<!-- sources: curve, engine -->

Gilbert 曲线把图面递归分成较小区域，生成与宽高有关的访问坐标。单行和单列退化为直线。相同像素数但宽高不同的图片可以有不同坐标序列。

## 黄金比例位移
<!-- sources: pic, engine -->

设曲线长度 N=宽×高，d=round(((√5−1)/2)N)，曲线位置 i 的像素写到 (i+d) mod N。

:::example 四像素单行
[输入]
依次标记 1 2 3 4，N=4，d=2
[结果]
3 4 1 2
[说明]
编号 1 的像素进到第三格。
:::

:::example 五像素单行
[输入]
依次标记 1 2 3 4 5，N=5，d=3
[结果]
3 4 5 1 2
[说明]
从第四格往后写，末尾环回。
:::

## 逆向重排
<!-- sources: pic, engine -->

解混淆时，从正向的目的位置取回像素，等价于沿同一索引环减去 d。

:::example 单格边界
[输入]
1×1，唯一像素记作 1
[结果]
仍为 1
[说明]
任何移动对模 1 都折回第零格。
:::

:::example 恢复五像素
[输入]
3 4 5 1 2，按同尺寸逆排
[结果]
1 2 3 4 5
[说明]
逆排方向由同一曲线和 d 确定。
:::

## 与文件格式的关系
<!-- sources: png, engine -->

PNG 可保留重排后的样本。JPEG 重压缩、裁剪或缩放可能破坏精确逆变换。导出的像素图也不会复制原文件的压缩结构或附加内容。

## 常见误区

- 算法没有用户密钥，任意同尺寸图使用同一置换。
- 改变图像尺寸会改变曲线和位移。
- 图片看上去复原不能证明附带的原始元数据也复原。

