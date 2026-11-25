---
capabilityId: native:model
title: 三维模型观察
topicGroup: video
summary: 分别理解表面网格、场景层级、相机投影与 CIF 晶体展开。
aliases:
  - glTF
  - 网格
  - 顶点
  - 三维
  - CIF
  - 晶体
  - 晶胞
  - 分数坐标
sources:
  - id: gltf
    title: glTF 2.0 Specification
    publisher: Khronos Group
    url: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
    language: en
    kind: standard
    locator: Meshes、Nodes、GLB
  - id: fract
    title: CIF Core Dictionary — atom_site_fract
    publisher: IUCr
    url: https://www.iucr.org/__data/iucr/cifdic_html/1/cif_core.dic/Iatom_site_fract_.html
    language: en
    kind: standard
    locator: 晶胞分数轴
  - id: sym
    title: CIF Core Dictionary — space_group_symop_operation_xyz
    publisher: IUCr
    url: https://www.iucr.org/__data/iucr/cifdic_html/1/cif_core.dic/Ispace_group_symop_operation_xyz.html
    language: en
    kind: standard
    locator: 对称操作 X′=WX+w
  - id: cif
    title: round4/cif.js
    publisher: 迷雾工具箱
    url: /round4/cif.js
    language: zh-CN
    kind: implementation
    locator: 解析、对称与晶胞展开
  - id: impl
    title: round4/model.js
    publisher: 迷雾工具箱
    url: /round4/model.js
    language: zh-CN
    kind: implementation
    locator: 网格、模型验证、相机与晶体
---

## 介绍
<!-- sources: gltf, fract, impl -->

三维模型材料可以是一组表面网格，也可以是晶体结构描述。网格给出顶点和面。CIF 的晶胞及原子位置要经过坐标转换才能绘成结构。

## 网格、场景与纹理
<!-- sources: gltf, impl -->

glTF 把几何与场景节点分开。多个节点可以引用同一网格并给予不同变换。表面颜色可由材质和纹理参与计算；纹理上画的文字可以出现在没有刻痕的平面上。

:::example 共用同一网格
[输入]
网格有一个顶点 (1,0,0)；第二个节点对它平移 (3,0,0)
[结果]
两个实例该点分别在 (1,0,0) 与 (4,0,0)
[说明]
节点变换作用在网格局部坐标之上。
:::

## 容器和资源
<!-- sources: gltf, impl -->

GLB 可把 JSON 与二进制数据放进同一容器。普通 glTF 也可使用独立附件。检查本地材料时要区分外部引用缺失、压缩扩展不受支持和几何本身不完整。

## 晶胞和分数坐标
<!-- sources: fract, cif -->

分数坐标 (u,v,w) 对应晶胞基矢的线性组合 u a+v b+w c。非正交晶胞需要使用完整基矢。仅在轴相互直角时，才能把分数坐标各自乘对应边长。

:::example 正交晶胞
[输入]
a=4 Å，b=6 Å，c=8 Å；分数坐标 (0.5,0.5,0.25)
[结果]
笛卡尔坐标 (2,3,2) Å
[说明]
三个轴正交，可分别换算。
:::

## 对称操作和重复
<!-- sources: sym, cif -->

显式对称操作用位置变换 X′=WX+w 生成等价点。显示一个晶胞时可按周期折回，落到同一位置的等价点应避免重复。邻胞由晶格平移生成。

:::example 反演坐标
[输入]
原子在 (0.2,0.3,0.4)；应用 −x,−y,−z 再折回
[结果]
(0.8,0.7,0.6)
[说明]
三个负分量各加 1 进入 [0,1)。
:::

## 相机、遮挡与场景核对
<!-- sources: gltf, impl, cif -->

旋转相机只改变视角。记录线索位置时区分世界坐标、模型局部坐标及晶胞分数坐标。晶体是否相邻或成键仍需结构资料，画面接近只是一种观察。

## 常见误区

- 看见完整外壳不能证明文件含有内部结构。
- CIF 分数坐标不直接等于 Å。
- 没有显式结构信息时，不从外观推断材料的完整晶体学性质。

