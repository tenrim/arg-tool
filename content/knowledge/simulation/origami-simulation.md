---
capabilityId: native:origami
title: 折纸模拟
topicGroup: simulation
summary: 从折痕图及面拓扑建立动态模型，观察山谷折和当前模拟坐标。
aliases:
  - Origami Simulator
  - FOLD
  - 折痕图
  - 山折
  - 谷折
sources:
  - id: sim
    title: Origami Simulator
    publisher: Amanda Ghassaei
    url: https://github.com/amandaghassaei/OrigamiSimulator
    language: en
    kind: author-spec
    locator: 三角化、动态求解与导出
  - id: fold
    title: FOLD Format Specification
    publisher: Erik Demaine 等
    url: https://github.com/edemaine/fold
    language: en
    kind: author-spec
    locator: 顶点、边、面、角度及帧
  - id: model
    title: completion/fold-model.js
    publisher: 迷雾工具箱
    url: /completion/fold-model.js
    language: zh-CN
    kind: implementation
    locator: validateFold、selectFoldFrame 和导出快照
  - id: impl
    title: completion/origami.js
    publisher: 迷雾工具箱
    url: /completion/origami.js
    language: zh-CN
    kind: implementation
    locator: 折叠比例、模型装入、暂停与导出
---

## 介绍
<!-- sources: sim, fold -->

折痕图记录纸面分块及可动边界。动态折纸模拟通过三角化面片、约束边和折痕，使节点在目标角与弹性条件下迭代到某一状态。

## 数据是顶点、边和面
<!-- sources: fold, model -->

FOLD 以坐标表保存顶点，以顶点下标写边和面。边可标记山折、谷折、边界、平边、未知或切割。多个帧可继承原始记录中的拓扑。

:::example 三点组成一面
[输入]
顶点下标只有 0、1、2；面声明为 [0,1,99]
[结果]
拒绝该声明
[说明]
下标 99 无对应顶点。
:::

## 山折、谷折与角度
<!-- sources: sim, fold, impl -->

山谷符号可和具体度数一起描述目标。折叠比例缩放目标角；图形运动由当前点位及若干约束计算，实际角度可能仍在变化。

:::example 折叠进度的目标角
[输入]
目标折角 −90°，折叠比例 0.5
[结果]
目标为 −45°
[说明]
指定的是约束目标，还需区分迭代后的真实角度。
:::

## 积分与收敛
<!-- sources: sim, impl -->

模拟可以对边、折痕和面角设弹性与阻尼。Euler 或 Verlet 等积分方法按步长推进。相遇的面片、非刚性变形或未收敛状态会影响画面，不能直接从图形断定纸样可无碰撞实折。

## 帧继承、快照与导出
<!-- sources: fold, model -->

继承帧可复用原记录几何，并带自己的标题等字段。模拟快照存当前三维坐标；FOLD 可携带原始元数据，OBJ 和 STL 主要呈现面几何。

:::example 读取继承帧
[输入]
原帧有三个顶点；子帧继承原帧且指定标题 child
[结果]
读取子帧时包含同一顶点表、标题为 child
[说明]
继承可共享几何，但容许子帧添加字段。
:::

## 常见误区

- 目标角数值不能代替当前顶点或当前实际角度的测量。
- 换观察视角不会改变纸面三维坐标。
- 可导出网格不意味着这张折痕图已被数学证明可无碰撞折叠。

