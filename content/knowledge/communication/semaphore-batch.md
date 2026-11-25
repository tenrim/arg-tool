---
capabilityId: native:semaphore-batch
title: 旗语编解码与输出
topicGroup: communication
summary: 解释双旗方向的角度与钟面表示、姿态的分界和数字状态。
aliases:
  - 双旗角度
  - 钟面旗语
  - 批量旗语
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
  - id: signals
    title: 旗语方向、序列与图形
    publisher: 迷雾工具箱
    url: /completion/signals.js
    language: zh-CN
    kind: implementation
    locator: tokens、textOf、semaphore
---

## 介绍
<!-- sources: marine, map, signals -->

连续旗语由一个个姿态和控制符组成。双旗图、角度和钟面可以表达同样的方向。编解码时应保留每个姿态内部的两根旗杆，以及所有姿态之间的先后次序。

## 两种方向记法
<!-- sources: map, signals -->

从正上方取 0°，顺时针每 45° 标一个方向。用于钟面时将角度除以 30，圆顶写成 12。两种记法的基准相同，可以逐个值互换。

:::example 同一组字母的两种记录
[输入]
AB
[结果]
角度：180,225; 180,270
钟面：6,7.5; 6,9
[说明]
7.5 表示钟面上的 7 点半，对应 225°。
:::

## 共享姿态与数字状态
<!-- sources: marine, map, signals -->

部分数字与字母共享同一姿态，接收者须依控制姿态判断当前是字母还是数字。转换一段混合文本时，表示状态的姿态会占用独立的位置。

:::example 在两字母间写入数字
[输入]
A1B
[结果]
180,225; 0,45; 180,225; 0,90; 180,270
[说明]
第 2 组切入数字，第 3 组按数字表读 1。第 4 组返回字母状态，第 5 组读 B。
:::

## 保留分组边界
<!-- sources: map, signals -->

书面角度序列可以用逗号区分同一姿态的方向，用分号隔开姿态。把所有数字混成一行，会失去识别符号的边界。图形或动画还应保持同一方向和相同的读取次序。

:::example 从角度还原字母
[输入]
180,225; 90,270; 135,180
[结果]
ARG
[说明]
前三组依次查表，第二组双杆左右水平伸出，第三组向右下和向下。
:::

## 还原结果的检验
<!-- sources: marine, signals -->

可以将记录出的角度再绘成一排符号，和原始图组逐格比较。发现一段符号都被读成数字时，应检查前面的状态切换是否漏记，以及这一段之后是否有恢复字母的姿态。

## 常见误区

- 同样的双旗夹角可朝向不同方向，字母也可能不同。
- 钟面每个步长是 1.5 小时格。将 7.5 四舍五入成 8 会改变方向。
- 判断字母和数字需要看当前状态，不能把控制姿态当作普通字符拼入结果。
