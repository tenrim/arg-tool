---
capabilityId: native:semaphore
title: 旗语
topicGroup: communication
summary: 介绍正面观察时的双手旗方向组合、镜像读图和连续姿态识读。
aliases:
  - Semaphore
  - 双手旗
  - 旗语图形识读
sources:
  - id: marine
    title: 船舶通信语言（二）——旗语
    publisher: 交通运输部海事局官方发布
    url: https://m.thepaper.cn/newsDetail_forward_7256510
    language: zh-CN
    kind: official-doc
    locator: 手旗旗语与数字、字母对照图
  - id: map
    title: 双手旗字母和数字映射表
    publisher: puzzle-lib（MIT）
    url: /vendor/puzzle-lib/Semaphore/SemaphoreEncoding.js
    language: en
    kind: implementation
    locator: LetterA–LetterZ、Number0–Number9
  - id: reader
    title: 方向组合的入口逻辑
    publisher: 迷雾工具箱
    url: /round1/symbols.js
    language: zh-CN
    kind: implementation
    locator: 旗语方向选择与字母查表
---

## 介绍
<!-- sources: marine, map -->

双手旗用两根旗杆的方向组成一个符号。航海手旗里的字母由双臂姿态决定。旗面的对比色便于在一定距离辨认旗杆方向，悬挂信号旗则依另一套图案和组合规则读取。

## 从正面记录方向
<!-- sources: marine, map, reader -->

正对旗手时，可以把每根旗杆的指向归入上、右上、右、右下、下、左下、左、左上八个位置。先固定观察方向，再把同一姿态的两根旗杆合在一起查表。

:::example 向下与左下
[输入]
正视旗手，两杆分别向下、左下。
[结果]
A
[说明]
该表的 A 由 South 与 SouthWest 组成。
:::

## 识别镜像
<!-- sources: marine, map -->

视角从正面变为背面，或图像被水平翻转时，两侧会对调。一些姿态翻转后也有正常字母，因此能查到一个字母不足以证明左右方向已判定正确。

:::example A 形姿态的镜像
[输入]
两杆向下、左下，将图形水平翻转。
[结果]
原图读 A，翻转后的组合读 G。
[说明]
向下保持不变，左下换成右下。G 对应 South 与 SouthEast。
:::

## 图组的读取次序
<!-- sources: marine, map, reader -->

一次有意定住的姿态对应一个待识读的符号。连续的图片应按标号或发生顺序读取。动作间的过渡帧或遮挡造成的线条，应与有意给出的完整姿态分开记录。

:::example 连续两幅姿态
[输入]
第 1 幅：下、左下
第 2 幅：左、下
[结果]
AB
[说明]
第 2 组查得 B，按姿态出现的顺序接到 A 后。
:::

## 数字与控制信息
<!-- sources: marine, map -->

同一组方向可以随当前的字母或数字状态产生不同含义。有的题目只给单姿态字母表，连续讯息则可能还含状态切换和停顿。遇到歧义，应先核对题面引用的是哪一套约定。

## 常见误区

- 只看两根旗杆之间的夹角通常不足以确定字母。
- 旗手的左手与正对他的观察者所见的左侧需要区别。
- 双手旗按方位查表。悬挂信号旗的单旗颜色和图案不能用于这一步。
